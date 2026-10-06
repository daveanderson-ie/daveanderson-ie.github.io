# Experiment: Issue-driven agent delivery pipeline

**Owner:** Dave · **Repo:** daveanderson-ie/daveanderson-ie.github.io (gingertechie.com) · **Started:** 2026-10-06 · **Status:** Pilot 2 complete (pending release)

## Hypothesis

If product definition (specs, plans, ready tasks) is decoupled from implementation using GitHub Issues as the board, and agents implement and review ready tasks with me gating only intent and release, then I will ship more features per week at equal or better quality, without my review time growing in proportion.

## Scope

**In:** one real feature (the pilot Epic) taken from idea to production on this site, run **manually** through every stage.
**Out (for now):** unattended/24x7 triggers, multiple concurrent features, opencode vs Claude comparison, automation scripts beyond the bare minimum.

## Board model

- **Hierarchy:** Epic issue → task sub-issues (stories optional). Personal account, so no issue types: use labels `type:epic`, `type:task`.
- **Spec and plan:** live in the repo (`docs/specs/<feature>.md`, `docs/plans/<feature>.md`), merged via PR. The Epic links to both.
- **Stages (one label at a time):**

| Label | Who acts | Exit criterion |
|---|---|---|
| `stage:idea` | Dave | Problem worth solving, one line of outcome |
| `stage:spec` | Dave + Claude (interactive) | Spec PR merged — **gate 1** |
| `stage:plan` | Claude | Tasks created as sub-issues with acceptance criteria and `blocked by` links |
| `stage:ready` | Dave | Meets the Definition of Ready below — **gate 2** |
| `stage:implement` | Implementer agent | PR open, checks green |
| `stage:review` | Reviewer agent (different prompt/model) | Approve, or reject with reasons (max 2 loops) |
| `stage:needs-dave` | Dave | Escalation: loop cap hit, or agent blocked |
| `stage:release` | Dave | Merge to `master` = deploy via GitHub Pages — **gate 3** |

## Definition of Ready (revised after pilot 1)

A task may move to `stage:ready` only if:
- Every acceptance criterion is **verifiable with the agent's own tools** (no "screenshot attached" unless the agent can host images).
- Assumptions about existing behaviour have been checked against the code (e.g. responsive CSS), not inferred.
- Any approach choice is stated with its consequence (e.g. "no-JS fallback shows X").
- Scope names the files expected to change.
- **(Pilot 2)** Anything judged by eye has a criterion: a reference (mock, screenshot, existing page) or explicit layout/spacing rules. Otherwise agents deliver correct but plain, and gate 3 becomes the design review.
- **(Pilot 2)** Risky changes are spiked against CI before `ready` (the spike found an unmasked legacy error that would have failed task 1).

Decisions made after `ready` are recorded as an issue comment **and** an edit to the issue body; agents treat the issue as the only source of truth.

## Agents

Generic, task-agnostic prompts live in [`docs/agents/`](../agents/). Each run gets only: repo, issue/PR number, an isolated worktree, and a unique local port.
- Implementer: [`implementer.md`](../agents/implementer.md)
- Reviewer: [`reviewer.md`](../agents/reviewer.md), run on a different model from the implementer, with a hard rule: mark a criterion met only if verified first-hand.

## Quality harness (prerequisite)

`.github/workflows/pr-checks.yml` (**Site checks**) runs on every PR to `master`, on the pages the PR changes (all public pages if shared CSS/JS/images change):
HTML validation (html-validate), internal link and `#anchor` check, external link check (report only), and a headless Chromium render at 1280px and 390px capturing JS errors and failed requests.
Each is compared with the PR base, so only **new** problems block; the legacy template has hundreds of existing validation errors.
Results: the check status, one PR comment starting `<!-- site-checks -->` (updated per push), and an artifact `site-checks` with `report.json` and head/base screenshots. Agents read these instead of installing a browser.

## Measures

Record per task in the issue (a closing comment):

- Elapsed time `ready` → merged
- Dave's hands-on minutes (gates + escalations)
- Review loops; whether it reached `needs-dave`
- Rework: reopened, reverted, or fixed after merge
- Approximate cost (tokens or plan usage)

**Baseline:** one comparable task done my usual way (Claude Code + superpowers, no board), measured the same way.

## Success and kill criteria

- **Continue to automation** if: ≥ 80% of tasks merge without `needs-dave`, my minutes per task are lower than baseline, and zero post-merge regressions.
- **Kill or rethink** if: I spend more time writing and fixing cards than I would building, or reviewer agents approve work that I then have to fix.

## Steps

1. Add labels and issue forms (Epic, Task); add the PR check workflow.
2. Choose the pilot Epic; write and merge its spec (gate 1).
3. Generate the plan and sub-issues; approve to `ready` (gate 2).
4. Run implementer and reviewer agents manually per task, moving labels by hand.
5. Release (gate 3); record measures.
6. Retro: which stages were stable enough to automate, and what a `ready` card must contain.

## Pilot 1 results: Epic #3, footer tidy

Two tasks (#4, #5), PRs #6 and #7, live 2026-10-06. Too small to test agent quality; used as a shakedown of the mechanics.

| | #4 | #5 |
|---|---|---|
| Ready → release | ~6 min | ~8 min |
| Review rounds | 1 | 2 (1 rejection) |
| Reached `needs-dave` | No | No |
| Dave's hands-on | 1 decision + merge | 1 decision + merge |
| Agent tokens (approx.) | ~165k | ~325k |
| Post-merge defects | none | none |

**Findings**
1. All three defects originated in **planning**: an unverifiable criterion, a wrong assumption about mobile layout, a weak fallback choice. Implementers flagged each instead of guessing. → Definition of Ready above.
2. The **reject loop works from issue state alone**: a recorded decision was enough for the reviewer to reject and a fresh implementer to fix.
3. **Reviewers shortcut** unless forbidden: first-round reviews didn't render the page; one relied on the implementer's claims. With the first-hand verification rule, the re-review rendered and faked the clock to prove the script. → `reviewer.md`.
4. **Parallel agents need isolated resources**: two agents collided on a local port. → unique port per run.
5. **Cost is mostly context rebuild and tool setup** (~80k tokens per run for one-line changes). → move rendering checks into CI.
6. Session tooling could not delete branches. → enable "Automatically delete head branches" in repo settings.

Baseline not yet measured.

## Pilot 2 results: Epic #10, home page repositioning

Four tasks (#12–#15) on `epic/home-repositioning`; spec PR #11 (gate 1), plan PR #16 (gate 2), release PR to `master` (gate 3). #12–#14 by agents (implementer Sonnet, reviewer Opus); #15 was the baseline.

| | #12 hero | #13 problem | #14 services | #15 baseline |
|---|---|---|---|---|
| Ready → merged into Epic branch | ~6.5 min | ~4.5 min | ~5 min | ~14 min (wall clock) |
| Review rounds | 1 | 1 | 1 | none (no review) |
| Reached `needs-dave` | No | No | No | n/a |
| Dave interactions | 0 | 0 | 0 | 6 prompts + 2 messages to me |
| Agent tokens (implement + review) | 97k + 104k | 86k + 94k | 88k + 93k | not measured |
| Site checks fixes by implementer | 1 (void `<meta/>`) | 0 | 0 | 0 |

**Dave's interactions, whole pilot:** 9 messages. 3 were setup (CI choices, Actions, merging the CI PR); 4 were designed (spec answers, gate 1, Epic-branch decision, gate 2); 2 were unplanned, both about the baseline (how to run it; I asked for the missing PR). Zero interactions between gate 2 and the agent tasks being merged. Gate 3 is one merge.

**Against the criteria**
| Criterion | Result |
|---|---|
| Unplanned interactions after gate 2 (agent tasks) | **0**, pass |
| Interactions between gate 2 and release | 0 for agent tasks (the session acted as runner); pass |
| Tasks without `needs-dave` | 3/3, pass |
| Hands-on minutes per task below baseline | Agent tasks ~0 after gate 2; baseline 6 prompts in ~14 min. Pass, but the baseline is weak (below) |
| Reviewer approved work Dave then fixed | Pending gate 3 |
| Post-merge defects | Pending release |
| Planning gaps flagged by implementers | 0 blocking; 2 minor (em dash, `blocked by` semantics) |
| Agent cost below pilot 1 | ~180–200k per task, pilot 1 was 165–325k for smaller tasks. Roughly flat |

**Findings**
1. **The core claim held for this feature:** after gate 2, plan-as-issues was enough for agents to deliver three sequential tasks with no Dave input. Dave's effort moved entirely to the front (spec answers, two gates) and one release merge.
2. **Front-loaded effort is where quality comes from.** Checking the plan against the code (a spike run through CI) caught the only predictable failure: removing the slider unmasked a legacy validation error. No implementer flagged a planning defect, unlike pilot 1 (3 defects).
3. **Agents meet the spec, not taste.** The page is correct but visually plain (large gaps, all left-aligned). The spec had no visual criteria, so neither implementers nor reviewers could hold the work to one; reviewers raised spacing only as non-blocking. → Definition of Ready addition above.
4. **The Epic branch fits sequential tasks.** It cut gate 3 to one merge and let task N+1 start without Dave. But `Closes #N` only fires on the default branch, so tasks stay open and GitHub's `blocked by` never clears; implementers reasoned around it. → Treat "blocker's PR merged into the base branch" as unblocked, in `implementer.md`, or close tasks on merge into the Epic branch.
5. **CI comparing against base has two traps:** removing broken markup can unmask old errors (counted as new); and the theme hides overflow, so `scrollWidth` misses it (element bounds used instead). Static screenshots can't show interaction (go-to-top), so reviewers still rendered locally.
6. **Cost didn't fall.** ~90k tokens per implement and ~95k per review regardless of task size: context rebuild, not browser setup, dominates. Reading CI saved tool setup but not reading.
7. **The baseline is weak.** It ran in a cloud session without superpowers, and Claude implemented at Dave's request after a "spec only" brainstorm. It still shows the main difference: the usual way re-specified a task that was already `ready` (markup, placement, counting rule) before coding, and needed Dave at every step (6 prompts) where the agent path needed none.

## Next

1. Trigger agents from labels (GitHub Actions on `issues.labeled`): removes the runner role this session played, the last non-Dave step.
2. Fix `blocked by` semantics for Epic branches (finding 4) and add the visual-criteria rule to planning.
3. Re-run the baseline properly: Dave, locally, with superpowers, on a comparable task, timing hands-on minutes.
4. Cut per-run cost: try a smaller model for review of copy-only tasks, or a shared task brief so agents don't re-read the whole repo.

~~Done in pilot 2: PR check workflow; real 3–6 task feature with baseline.~~

## Open questions

- Does an agent-written plan need a story layer, or are tasks enough?
- Where does the reviewer's independence come from: a different model, a different prompt, or both? (Pilot 1: the prompt rule mattered more than the model. Pilot 2: Opus reviews went beyond CI unprompted, testing go-to-top and column positions.)
- Should reviewers merge into Epic branches unattended? It worked in pilot 2; nothing yet tests a bad approval.
- Keep `docs/` off the public site? Jekyll currently publishes it.
