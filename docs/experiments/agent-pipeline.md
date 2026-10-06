# Experiment: Issue-driven agent delivery pipeline

**Owner:** Dave · **Repo:** daveanderson-ie/daveanderson-ie.github.io (gingertechie.com) · **Started:** 2026-10-06 · **Status:** Pilot 1 complete

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

Decisions made after `ready` are recorded as an issue comment **and** an edit to the issue body; agents treat the issue as the only source of truth.

## Agents

Generic, task-agnostic prompts live in [`docs/agents/`](../agents/). Each run gets only: repo, issue/PR number, an isolated worktree, and a unique local port.
- Implementer: [`implementer.md`](../agents/implementer.md)
- Reviewer: [`reviewer.md`](../agents/reviewer.md), run on a different model from the implementer, with a hard rule: mark a criterion met only if verified first-hand.

## Quality harness (prerequisite)

The site has no tests or CI, so reviewers would only be reading diffs. Before the pilot, add a minimal check workflow on PRs:
HTML validation, broken-link check, and a page screenshot or Lighthouse run on changed pages.

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

## Next

1. PR check workflow (HTML validation, link check, headless render of changed pages) so agents read results instead of building a browser each run.
2. Pilot 2 with a real 3–6 task feature, plus the baseline task.
3. Only then: trigger agents from labels (GitHub Actions on `issues.labeled`).

## Open questions

- Does an agent-written plan need a story layer, or are tasks enough?
- Where does the reviewer's independence come from: a different model, a different prompt, or both? (Pilot 1: the prompt rule mattered more than the model.)
- Keep `docs/` off the public site? Jekyll currently publishes it.
