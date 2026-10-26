---
title: Git for flight software
description: Branches, reviews, tags, baselines, and the traceability a flight program expects.
---

# Git for flight software

::: tip Why this matters
Configuration management is not bureaucracy in a flight program; it is how you answer “what exactly flew?” and “who approved this change?” Git is the tool, but the habit is evidence: every requirement, line of code, test, and release artifact should be traceable.
:::

## Learning objectives

- Use commits, branches, merges, rebases, and tags without fear.
- Create a release baseline that can be rebuilt.
- Review changes for correctness, not just style.
- Find the commit that introduced a defect with `git bisect`.
- Explain how Git supports auditability and reproducibility.

## The mental model

Git stores snapshots, not diffs. A commit points to:

- a tree of files,
- a parent commit (or two, for a merge),
- an author, a timestamp, and a message.

Branches are movable labels. Tags are fixed labels. `HEAD` is where you are. Once that clicks, most Git confusion disappears.

```text
A --- B --- C --- D   main
           \
            E --- F   feature/ekf
```

## The commands that matter

```bash
git status
git diff
git add -p                 # review hunks before staging
git commit -m "nav: add altimeter update"
git switch -c feature/ekf
git switch main
git merge --no-ff feature/ekf
git rebase -i main         # clean up local history
git tag -a v0.3.0 -m "Descent EKF baseline"
git push origin main --tags
```

Other tools worth knowing:

- `git log --oneline --graph --decorate`
- `git show <commit>`
- `git blame -L 40,60 file.cpp`
- `git bisect start` / `good` / `bad` / `reset`
- `git reflog` — recover a lost branch or commit
- `git cherry-pick <commit>` — copy a change to another branch
- `git stash` — temporary work, not a long-term storage system

## Flight-software configuration management

A flight program expects more than “it is in Git.”

| Practice | Why |
| --- | --- |
| Protected `main` and reviewed pull requests | Every change has a second pair of eyes |
| Signed commits and tags (where required) | Provenance and tamper evidence |
| Semantic version tags for releases | Reproducible baselines |
| A changelog tied to requirements and problem reports | Traceability |
| Build artifacts archived with the source commit | You can rebuild what flew |
| Submodules avoided or pinned exactly | A missing submodule is a broken baseline |
| Large binaries in LFS or an artifact store | Git is not a file server |
| A clean-room build from the tag | Proves the baseline is complete |

A useful release note answers: **what changed, why, which requirements/tests are affected, and how to reproduce the build.**

## Branching strategy

There is no universal strategy. For a small team, this is enough:

- `main` — always buildable, protected.
- `feature/<topic>` — one change, one purpose.
- `release/<version>` — stabilization only; no new features.
- `hotfix/<issue>` — urgent fix, merged back to `main` and the release branch.

Keep branches short-lived. A three-week branch is a merge conflict factory.

## Code review for flight software

Review for:

- **Correctness:** units, frames, signs, bounds, error paths.
- **Determinism:** allocation, unbounded loops, blocking calls, timing.
- **Interfaces:** message layout, timestamp, validity flags, endianness.
- **Failure behavior:** what happens when the input is stale, NaN, or out of range?
- **Tests:** is there a test that would fail if the change were wrong?
- **Traceability:** does the commit reference the requirement or problem report?

Style is the last thing you discuss, not the first.

## Practice

1. Create a repo with a deliberate bug in a small function. Use `git bisect` to find the commit that introduced it.
2. Make a feature branch, open a pull request against your own `main`, and review the diff as if someone else wrote it.
3. Tag a release, delete the branch, then rebuild from the tag in a fresh directory.
4. Write a release note that lists the requirement IDs affected by the change.

<Quiz
  question="A reviewer asks which exact source produced the flight binary. What is the strongest answer?"
  options="The main branch, as of last Tuesday|A signed release tag plus the archived build artifact and build log|The developer's local working directory|The latest commit hash in the lab notebook"
  answer="1"
  explanation="A tag identifies the source, the artifact is the built binary, and the log records how it was produced. Together they form a reproducible baseline."
/>

## Resources

- [Pro Git](https://git-scm.com/book/en/v2) — free and complete.
- [GitHub flow](https://docs.github.com/en/get-started/using-github/github-flow) — a simple review-centric workflow.
- [NASA software configuration management](https://nodis3.gsfc.nasa.gov/) — the requirements language, if you need to map practices to NPR 7150.2.

Next: [CMake & builds](./cmake.md).
