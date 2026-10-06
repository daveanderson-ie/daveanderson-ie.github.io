# Spec: Home page repositioning

**Epic:** #10 · **Owner:** Dave · **Status:** Draft for gate 1 · **Pilot:** 2 of the [agent pipeline experiment](../experiments/agent-pipeline.md)

## Outcome

A visitor to gingertechie.com understands within one screen that **The Ginger Group** is a fractional executive who fixes Founder Bottleneck Syndrome at scale-ups, and can book a call in one click.

## Problem

`index.html` is a Slider Revolution carousel from the Canvas template: one real slide ("Product Challenges? Just add Ginger") and two template demo slides ("Bubble Morph Add-On… BUY A LICENSE"). It says nothing about the offer, has no booking route, and loads ~15 slider scripts and stylesheets from `include/rs-plugin/`.

## Decisions (Dave, 2026-10-06)

| # | Decision |
|---|---|
| D1 | Brand on the page: **The Ginger Group**. |
| D2 | Proposition: a fractional executive who fixes Founder Bottleneck Syndrome at scale-ups: enters, fixes process, technical debt and hiring, then deliberately exits. |
| D3 | Sections, in order: hero, problem/symptoms, services, credentials. No testimonials or client names. |
| D4 | Call to action: "Book a call" linking to the Google booking page `https://calendar.app.google/yndRsp6zeFihmevd6`. |
| D5 | Replace the slider with a static hero. |
| D6 | Nav unchanged (Home, Blog, About → LinkedIn). |

## Page structure and copy

Copy below is a **draft for Dave to edit at gate 1**. Once merged, it is the exact text the page must show.

### 1. Hero
- Heading (`h1`): **Is your company waiting on you?**
- Subheading: **The Ginger Group** — fractional executive leadership for scale-ups.
- Body: I step in, remove the founder bottleneck by fixing process, technical debt and hiring, then step out, leaving a team that runs without me.
- Primary button: **Book a call** → booking URL (D4).

### 2. Problem: Founder Bottleneck Syndrome (heading `h2`)
Intro: Growth stalls when every important decision still runs through the founder. The signs:
- Decisions queue for your approval, and the team waits.
- Delivery slows as the team grows, not faster.
- Technical debt from the early days now dictates the roadmap.
- Hiring is ad hoc, and new people take months to become effective.
- You're the only one who knows how things really work.

### 3. Services (heading `h2`: "What I fix")
Three items, each a short heading and one sentence:
- **Process** — a delivery and product process the team owns, so work flows without you approving every step.
- **Technical debt** — a clear-eyed assessment and a plan that pays down what is slowing you, without stopping delivery.
- **Hiring** — the roles, the bar and the process to build a team that can lead itself.

Closing line: Every engagement is designed to end. Success is the day you don't need me.

### 4. Credentials (heading `h2`: "Why me")
- 30 years in software, from engineering to product leadership.
- Founded a bank.
- Bachelor's in software engineering; postgraduate diploma in product management.
- Based in Ireland.

Followed by a second **Book a call** button → booking URL.

## Requirements

- R1 The slider (`<section id="slider">` and its contents) is removed. All `include/rs-plugin/` stylesheets and scripts, and the inline `.bm-gradient` style, are removed from `index.html`.
- R2 Sections 1–4 appear in that order between the header and the footer, with the headings and copy above.
- R3 Both "Book a call" buttons link to exactly `https://calendar.app.google/yndRsp6zeFihmevd6`, open in a new tab, with `rel="noopener"`.
- R4 Exactly one `h1` on the page (the hero heading); section headings are `h2`.
- R5 `<title>` is "The Ginger Group: fractional executive for scale-ups" and a `<meta name="description">` summarising D2 is added.
- R6 Uses existing styles (Bootstrap 4.1.1 and the Canvas theme already loaded: `style.css`, `css/dark.css`); any new CSS goes in `css/custom.css` (currently an empty template file not loaded by any page; link it from `index.html` after `css/responsive.css` if needed). No new third-party scripts, fonts or CDNs.
- R7 Readable with no horizontal scroll at 390px and 1280px widths.
- R8 Site checks (PR CI) green: no new validation errors, no new JS errors, no broken internal links.
- R9 Header, nav, footer and the go-to-top button keep working as now.

## Out of scope

- Logo image (still reads "Ginger Techie"); legal name in the footer.
- Deleting files under `include/` (other pages may use them; separate clean-up).
- Other pages, nav changes, the blog.
- Contact forms, analytics, testimonials.

## Open questions for gate 1

1. Copy above: edit as needed. Anything here you won't claim publicly?
2. Logo: leave the "Ginger Techie" logo image as is for now (out of scope), or do you have a Ginger Group logo file?
