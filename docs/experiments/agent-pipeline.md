# Experiment: Issue-driven agent delivery pipeline

**Owner:** Dave · **Repo:** daveanderson-ie/daveanderson-ie.github.io (gingertechie.com) · **Started:** 2026-10-06 · **Status:** Draft

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
| `stage:ready` | Dave | Task is unambiguous and testable — **gate 2** |
| `stage:implement` | Implementer agent | PR open, checks green |
| `stage:review` | Reviewer agent (different prompt/model) | Approve, or reject with reasons (max 2 loops) |
| `stage:needs-dave` | Dave | Escalation: loop cap hit, or agent blocked |
| `stage:release` | Dave | Merge to `master` = deploy via GitHub Pages — **gate 3** |

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

## Open questions

- Which pilot feature? (Needs 3–6 tasks to be a fair test.)
- Does an agent-written plan need a story layer, or are tasks enough?
- Where does the reviewer's independence come from: a different model, a different prompt, or both?
