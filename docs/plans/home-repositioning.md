# Plan: Home page repositioning

**Epic:** #10 · **Spec:** [`docs/specs/home-repositioning.md`](../specs/home-repositioning.md) · **Gate 2:** merging this plan's PR moves all four tasks to `stage:ready`.

## Delivery model (Dave, 2026-10-06: Epic branch)

- Integration branch `epic/home-repositioning`, created from `master` after this PR merges, so it carries the updated Site checks and agent prompts.
- Each task PR targets the Epic branch. Site checks run on it; the reviewer agent merges it (squash) on approval when checks are green. Agents never merge into `master`.
- **Gate 3 is one release PR**, `epic/home-repositioning` → `master`, with `Closes #12 #13 #14 #15` (GitHub only auto-closes issues on merges into the default branch).
- Tasks run in sequence (`blocked by` links): all four edit `index.html` in adjacent regions, so parallel PRs would conflict. Each implementer merges the latest Epic branch into its own branch before starting.

## Tasks

| # | Task | Blocked by | Main risk, and how the issue handles it |
|---|---|---|---|
| #12 | Replace slider with static hero; title and meta | none | Removing the slider unmasks an existing validation error in the footer; issue requires `aria-label` on that link (found in a spike) |
| #13 | Problem section (Founder Bottleneck Syndrome) | #12 | None significant |
| #14 | Services section (What I fix), 3 columns → stacked | #13 | Layout; criteria use CI screenshots at 1280px and 390px |
| #15 | Credentials section + second Book a call | #14 | None significant |

Every task carries exact copy from the spec, acceptance criteria verifiable from the diff and the CI report or screenshots, files in scope, and its approach with consequences (Definition of Ready).

## Assumptions checked against the code

- Header nav is Blog and About only; the spec's "Home, Blog, About" was wrong. Nav stays unchanged either way.
- `js/functions.js` tolerates the slider's absence: a spike with the slider replaced by a Canvas `#content` block rendered with no JS errors at both widths.
- In the spike the theme's `transparent-header` sits correctly above plain content.
- No other public page uses `include/rs-plugin/`, so removing its tags from `index.html` affects only the home page. The files stay (out of scope).
- `css/custom.css` exists but no page loads it.

## Changes in this PR besides the plan

- **Site checks** run on PRs to `epic/**` as well as `master`.
- **Site checks** add a horizontal-overflow check: visible elements past the right edge at 1280px or 390px, compared with the base. The theme hides overflow, so `scrollWidth` alone missed it in testing.
- `implementer.md`: PR targets the issue's `Base branch:`; merge the latest base before starting.
- `reviewer.md`: on approval of a PR into `epic/*`, squash-merge it if checks are green; never merge into `master`.
- Spec: status set to approved; nav description corrected.

## Baseline (proposed)

**#15 is the baseline task**, done by Dave locally (Claude Code + superpowers, no board) on a branch from `epic/home-repositioning` once #14 is merged, then merged into the Epic branch. It has the same spec, copy and acceptance criteria, so the comparison is like for like. Agents implement #12–#14 (3 tasks).

Measured: prompts typed, approvals or corrections, hands-on minutes, elapsed time, defects found later.

If you'd rather the agents do all four, comment on the PR and I'll pick a separate baseline task after release.

## Runner procedure (manual this pilot)

Per task, in order:
1. Implementer agent: Sonnet, own worktree on `task/<issue>-<slug>` from the Epic branch, unique port, prompt from `implementer.md` with placeholders only.
2. Reviewer agent: Opus, own detached worktree of the PR head, unique port, prompt from `reviewer.md`. On rejection, the implementer runs again (at most 2 loops), then `stage:needs-dave`.
3. Next task once the reviewer has merged.

After #15: open the release PR and stop for gate 3.
