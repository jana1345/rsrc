---
title: Progress dashboard
description: Track your path through the lunar GNC and flight-software topics.
---

# Progress dashboard

Mark pages complete as you finish the reading **and** the exercise. The dashboard stores everything in this browser's `localStorage`; there is no account and no server.

<ProgressDashboard />

## How to use it

- **Check a topic** when you can draw it, implement a small version, and explain the failure modes.
- **Use “Next up”** on the home page when you do not want to decide what to study.
- **Reset** if you want a clean run. It only clears completion markers in this browser.
- **Do not treat 100% as readiness.** The capstone and the exercises are the real evidence.

## A review cadence that works

| When | What | Time |
| --- | --- | --- |
| End of each week | Re-answer the previous week's quizzes without looking. | 20 min |
| End of each month | Rebuild one earlier exercise from scratch. | 60 min |
| Before an interview | Explain the Month 2 architecture and the capstone out loud. | 30 min |
| Before a project review | Re-read the requirements, interfaces, and test evidence pages. | 45 min |

Spaced repetition beats rereading. If you cannot reconstruct a frame transform or a Kalman update from memory, the page is not done, even if the checkbox is.

## If progress stalls

The usual causes, in order:

1. **You are reading references instead of building.** Close the book and write the smallest working version.
2. **The math is missing a prerequisite.** Go back one page: frames before quaternions, quaternions before attitude dynamics, linear algebra before LQR.
3. **The sim is lying.** Add a known-answer test before debugging the controller.
4. **The scope is too large.** Cut the capstone to a 2D lander and finish it.
5. **You are context-switching.** Pick one month and one project. Finish the exit deliverable.

Next: [the roadmap](../start/roadmap.md) or [Week 1: space basics](../foundations/space-basics.md).
