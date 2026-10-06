// PR checks for the static site: HTML validation, link check and headless render,
// each compared against the PR's base so legacy problems don't fail every PR.
//
// Usage: node check.mjs --base <dir> --head <dir> --pages <file> --out <dir>
// Writes <out>/report.md, <out>/report.json and <out>/screenshots/*.png.
// Exit code 1 if the PR introduces a blocking problem (see BLOCKING below).
//
// BLOCKING: new HTML validation errors; broken internal links or missing #anchors;
// new JS errors, or new failed same-origin requests, on render.
// REPORT ONLY: external link failures (flaky, outside our control); legacy problems.

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { HtmlValidate, FileSystemConfigLoader } from 'html-validate';
import { chromium } from 'playwright';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((a, v, i, arr) => (v.startsWith('--') ? [...a, [v.slice(2), arr[i + 1]]] : a), [])
);
const BASE = path.resolve(args.base);
const HEAD = path.resolve(args.head);
const OUT = path.resolve(args.out);
const pages = fs.readFileSync(args.pages, 'utf8').split('\n').map((s) => s.trim()).filter(Boolean);
const PORT_HEAD = Number(process.env.PORT_HEAD || 8082);
const PORT_BASE = Number(process.env.PORT_BASE || 8081);
const VIEWPORTS = { desktop: { width: 1280, height: 800 }, mobile: { width: 390, height: 844 } };

fs.mkdirSync(path.join(OUT, 'screenshots'), { recursive: true });

// ---------- helpers ----------
function serve(dir, port) {
  const p = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', dir], { stdio: 'ignore' });
  return p;
}
async function waitFor(url) {
  for (let i = 0; i < 50; i++) {
    try { await fetch(url); return; } catch { await new Promise((r) => setTimeout(r, 200)); }
  }
  throw new Error(`server not up: ${url}`);
}
const multiset = (keys) => keys.reduce((m, k) => m.set(k, (m.get(k) || 0) + 1), new Map());
function newItems(headKeys, baseKeys) {
  const base = multiset(baseKeys);
  const out = [];
  for (const k of headKeys) {
    const n = base.get(k) || 0;
    if (n > 0) base.set(k, n - 1); else out.push(k);
  }
  return out;
}
const slug = (p) => p.replace(/[^a-z0-9]+/gi, '_');
const esc = (s) => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ').slice(0, 200);

// ---------- 1. HTML validation ----------
const validator = new HtmlValidate(new FileSystemConfigLoader({ extends: ['html-validate:recommended'] }));
async function validate(root, page) {
  const file = path.join(root, page);
  if (!fs.existsSync(file)) return { exists: false, errors: [] };
  const report = await validator.validateFile(file);
  const errors = report.results.flatMap((r) => r.messages.filter((m) => m.severity === 2)
    .map((m) => ({ rule: m.ruleId, message: m.message, line: m.line, column: m.column })));
  return { exists: true, errors };
}

// ---------- 2 + 3. Render and links ----------
async function render(browser, origin, page, shotPrefix) {
  const url = `${origin}/${page}`;
  const result = { jsErrors: [], failedRequests: [], links: [], anchors: [] };
  for (const [name, vp] of Object.entries(VIEWPORTS)) {
    const ctx = await browser.newContext({ viewport: vp });
    const tab = await ctx.newPage();
    const jsErrors = [];
    const failed = [];
    tab.on('pageerror', (e) => jsErrors.push(e.message.split('\n')[0]));
    tab.on('console', (m) => { if (m.type() === 'error') jsErrors.push(m.text().split('\n')[0]); });
    tab.on('requestfailed', (r) => { if (r.url().startsWith(origin)) failed.push(`${r.url().slice(origin.length)} (${r.failure()?.errorText})`); });
    tab.on('response', (r) => { if (r.url().startsWith(origin) && r.status() >= 400) failed.push(`${r.url().slice(origin.length)} (HTTP ${r.status()})`); });
    try {
      await tab.goto(url, { waitUntil: 'load', timeout: 30000 });
      await tab.waitForTimeout(1500); // let sliders/animations settle
    } catch (e) {
      jsErrors.push(`navigation failed: ${e.message.split('\n')[0]}`);
    }
    if (shotPrefix) {
      await tab.screenshot({ path: path.join(OUT, 'screenshots', `${shotPrefix}-${name}.png`), fullPage: true }).catch(() => {});
    }
    // Errors are viewport-independent in practice; keep the union, de-duplicated per viewport.
    result.jsErrors.push(...new Set(jsErrors));
    result.failedRequests.push(...new Set(failed));
    if (name === 'desktop') {
      result.links = await tab.$$eval('a[href]', (as) => as.map((a) => ({ href: a.getAttribute('href'), abs: a.href })));
      result.anchors = await tab.$$eval('[id], a[name]', (els) => els.map((e) => e.id || e.getAttribute('name')));
    }
    await ctx.close();
  }
  result.jsErrors = [...new Set(result.jsErrors)];
  result.failedRequests = [...new Set(result.failedRequests)];
  return result;
}

async function checkLinks(origin, page, links, anchors) {
  const internal = [];
  const external = [];
  const seen = new Set();
  for (const { href, abs } of links) {
    if (!href || /^(mailto:|tel:|javascript:)/i.test(href) || seen.has(abs)) continue;
    seen.add(abs);
    const u = new URL(abs);
    if (abs.startsWith(origin)) {
      const pageUrl = new URL(`${origin}/${page}`);
      if (u.pathname === pageUrl.pathname && u.hash) {
        const id = decodeURIComponent(u.hash.slice(1));
        if (id && !anchors.includes(id)) internal.push({ href, problem: 'missing anchor' });
        continue;
      }
      const r = await fetch(u.origin + u.pathname).catch((e) => ({ status: e.message }));
      if (r.status !== 200) internal.push({ href, problem: `HTTP ${r.status}` });
    } else if (/^https?:/.test(u.protocol)) {
      const ctl = AbortSignal.timeout(10000);
      const r = await fetch(abs, { method: 'GET', redirect: 'follow', signal: ctl, headers: { 'user-agent': 'Mozilla/5.0 (site-pr-checks)' } })
        .catch((e) => ({ status: e.name === 'TimeoutError' ? 'timeout' : e.message }));
      if (!(typeof r.status === 'number' && r.status < 400)) external.push({ href, problem: `HTTP ${r.status}` });
    }
  }
  return { internal, external };
}

// ---------- main ----------
const servers = [serve(HEAD, PORT_HEAD), serve(BASE, PORT_BASE)];
const HO = `http://127.0.0.1:${PORT_HEAD}`;
const BO = `http://127.0.0.1:${PORT_BASE}`;
let blocking = 0;
const json = { pages: [] };
const md = [];
try {
  await waitFor(HO); await waitFor(BO);
  const browser = await chromium.launch();
  for (const page of pages) {
    const v = { head: await validate(HEAD, page), base: await validate(BASE, page) };
    const key = (e) => `${e.rule}: ${e.message}`;
    const newErrKeys = newItems(v.head.errors.map(key), v.base.errors.map(key));
    const newErrs = [];
    { const pool = [...newErrKeys]; for (const e of v.head.errors) { const i = pool.indexOf(key(e)); if (i >= 0) { newErrs.push(e); pool.splice(i, 1); } } }

    if (!v.head.exists) { json.pages.push({ page, deleted: true }); md.push(`### \`${page}\`\n\nDeleted in this PR; not checked.\n`); continue; }

    const head = await render(browser, HO, page, slug(page) + '-head');
    const base = v.base.exists ? await render(browser, BO, page, slug(page) + '-base') : { jsErrors: [], failedRequests: [] };
    const newJs = newItems(head.jsErrors, base.jsErrors);
    const newFailed = newItems(head.failedRequests, base.failedRequests);
    const links = await checkLinks(HO, page, head.links, head.anchors);

    const pageBlocking = newErrs.length + newJs.length + newFailed.length + links.internal.length;
    blocking += pageBlocking;
    json.pages.push({
      page, status: pageBlocking ? 'fail' : 'pass', newPage: !v.base.exists,
      validation: { headErrors: v.head.errors.length, baseErrors: v.base.errors.length, newErrors: newErrs },
      render: { newJsErrors: newJs, newFailedRequests: newFailed, legacyJsErrors: base.jsErrors, legacyFailedRequests: base.failedRequests },
      links,
      screenshots: [`${slug(page)}-head-desktop.png`, `${slug(page)}-head-mobile.png`].concat(v.base.exists ? [`${slug(page)}-base-desktop.png`, `${slug(page)}-base-mobile.png`] : []),
    });

    md.push(`### ${pageBlocking ? '❌' : '✅'} \`${page}\`${v.base.exists ? '' : ' (new page)'}\n`);
    md.push(`| Check | Result |\n|---|---|`);
    md.push(`| HTML validation | ${newErrs.length ? `**${newErrs.length} new error(s)**` : 'no new errors'} (head ${v.head.errors.length}, base ${v.base.errors.length}) |`);
    md.push(`| JS errors on render | ${newJs.length ? `**${newJs.length} new**` : 'no new'} (legacy ${base.jsErrors.length}) |`);
    md.push(`| Failed same-origin requests | ${newFailed.length ? `**${newFailed.length} new**` : 'no new'} (legacy ${base.failedRequests.length}) |`);
    md.push(`| Internal links / anchors | ${links.internal.length ? `**${links.internal.length} broken**` : 'all OK'} |`);
    md.push(`| External links (report only) | ${links.external.length ? `${links.external.length} failing` : 'all OK'} |`);
    const details = [
      ...newErrs.map((e) => `- validation L${e.line}:${e.column} \`${e.rule}\` ${esc(e.message)}`),
      ...newJs.map((e) => `- JS error: ${esc(e)}`),
      ...newFailed.map((e) => `- failed request: ${esc(e)}`),
      ...links.internal.map((l) => `- broken internal link \`${esc(l.href)}\`: ${l.problem}`),
      ...links.external.map((l) => `- (report only) external \`${esc(l.href)}\`: ${l.problem}`),
    ];
    if (details.length) md.push('', ...details);
    md.push('');
  }
  await browser.close();
} finally {
  servers.forEach((s) => s.kill());
}

const header = pages.length
  ? `${blocking ? '❌' : '✅'} **Site checks: ${blocking ? `${blocking} blocking problem(s)` : 'pass'}** across ${pages.length} page(s). Compared with the PR base; only new problems block.`
  : '✅ **Site checks: no site pages changed.**';
json.blocking = blocking;
json.pagesChecked = pages;
fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(json, null, 2));
fs.writeFileSync(path.join(OUT, 'report.md'), [header, '', ...md].join('\n'));
console.log(fs.readFileSync(path.join(OUT, 'report.md'), 'utf8'));
process.exit(blocking ? 1 : 0);
