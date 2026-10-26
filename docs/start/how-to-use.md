---
title: How to use this guide
description: The study loop, page anatomy, and how to turn reading into flight-software skill.
---

# How to use this guide

You are a developer moving into a domain where a units mistake can crash a lander. Reading alone will not get you there. The site is built around a loop:

**Read → build → explain → test.**

Each topic page is short enough to finish in one sitting and structured so you cannot mistake “I read it” for “I can use it.”

## The 90-minute study loop

| Step | Time | What you actually do |
| --- | --- | --- |
| Read | 20 min | Read the page once, without taking notes. Mark the two or three ideas that feel unstable. |
| Build | 35 min | Do the practice task. Type the code, run the sim, or draw the frames. Do not copy-paste. |
| Explain | 15 min | Close the page and explain the core idea in your own words, on paper or out loud. |
| Test | 20 min | Answer the quiz, then re-do the exercise from scratch or change one assumption. |

If a page takes less than an hour, you probably skimmed it. If it takes more than three, you are trying to learn the references instead of the concept. Move on and come back.

## Page anatomy

Most topic pages use the same shape:

- **Why this matters** — where the topic appears in a lunar lander program.
- **Learning objectives** — what you should be able to do, not just recognize.
- **Core notes** — the minimum model, vocabulary, equations, and failure modes.
- **Flight-software lens** — how the concept becomes code, interfaces, timing, and tests.
- **Practice** — an exercise with a concrete output.
- **Quiz** — a quick check, with an explanation.
- **Resources** — where to go deeper.

Pages marked **Core** in the sidebar and progress dashboard are the deep dives. The rest are orientation pages: enough to read the documentation, ask a useful question, and know what to learn next.

## What “done” means

A topic is done when you can do three things:

1. **Draw it.** Sketch the frames, signal flow, state machine, or control loop from memory.
2. **Implement it.** Write a small version that runs and produces a number or plot you can check.
3. **Defend it.** Explain the assumptions, failure modes, and test evidence to someone who will interrupt you.

Marking a page complete is a bookmark, not proof. The exercises are the proof.

## Use the LLV console as the lab

You already have a lunar-lander UI and a simulation seam in the `Vault` project. Use it:

- Studying frames? Add a frame label to every state in the console.
- Studying quaternions? Replace the single tilt axis with a full attitude state and show the body axes.
- Studying 6DOF? Implement gravity, translation, mass flow, and a fixed-step integrator behind `stepState()`.
- Studying navigation? Add a noisy IMU and altimeter, then estimate altitude and vertical speed.
- Studying guidance? Generate a throttle and attitude command instead of reading them from the keyboard.
- Studying V&V? Write a test that proves the lander does not go below the surface.

The [LLV bridge page](../mission/llv-bridge.md) maps every module to a concrete next step in that project.

## What to skip, and when

You do not need everything in Month 1 to start Month 2.

- If you already use Git daily, skim the Git page and spend the time on CMake and debugging.
- If you have never used MATLAB, do the Simulink orientation but do not become a MATLAB language expert.
- If STK is slow or awkward on your machine, build the scenario once, then move on. The concepts matter more than the UI.
- Do not start with the full three-body problem, propulsion thermodynamics, or sensor hardware design. They are not on the critical path for a flight-software role.

## A note on sources

The pages are original summaries written for this path. Equations and conventions are standard, but missions differ. When you work on a real program, the controlling documents are the interface control document, the software requirements specification, the flight software users' guide, and the mission operations handbook. This site teaches the vocabulary and the engineering habits that let you read those documents.

## The weekly cadence

A sustainable week looks like this:

- **Two study sessions** of 90 minutes for new material.
- **One build session** of 2 hours for the week's exercise.
- **One review session** of 45 minutes for last week's quiz and notes.
- **One short write-up** of what broke, what you fixed, and what you still do not understand.

That is roughly 6–8 hours. The roadmap assumes 12–15 hours, so scale the number of sessions, not the depth of the build.

<Quiz
  question="You finish reading a page and the quiz feels easy. What is the best next step?"
  options="Mark it complete and start the next page|Close the page and rebuild the exercise from scratch, then change one assumption|Read the linked references until you understand every derivation|Watch a video on the same topic"
  answer="1"
  explanation="Recognition is not recall. Rebuilding the exercise and perturbing it is the cheapest test of whether the model is actually yours."
/>

Next: [the 16-week roadmap](./roadmap.md) or [set up your tools](./setup.md).
