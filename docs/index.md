---
layout: home
title: Lunar FSW Field Guide
description: A 16-week path from software developer to lunar lander GNC and flight software.

hero:
  name: Lunar FSW
  text: Field Guide
  tagline: A 16-week path from software developer to lunar lander GNC and flight software. Deep dives, buildable exercises, and the flight-software topics the original plan left out.
  image:
    src: /hero.svg
    alt: A lunar lander on a powered descent trajectory above the Moon
  actions:
    - theme: brand
      text: Start the roadmap
      link: /start/roadmap
    - theme: alt
      text: How to use this guide
      link: /start/how-to-use

features:
  - icon: "◐"
    title: Frames, quaternions, 6DOF
    details: Build the math spine first. Learn to keep frames, units, signs, and time tags straight before they cost you a week.
  - icon: "⌖"
    title: Navigation & guidance
    details: EKF, sensor fusion, error propagation, powered descent phases, throttle, attitude, and abort logic.
  - icon: "Δ"
    title: Flight software
    details: Real-time C++, Simulink code generation, cFS, RTOS scheduling, CCSDS, and fault protection.
  - icon: "✓"
    title: V&V and test
    details: Requirements traceability, SIL/HIL, Python automation, Monte Carlo, and the evidence a reviewer actually asks for.
  - icon: "◎"
    title: Mission context
    details: Lunar gravity, vacuum, dust, lighting, plume-surface interaction, and one-shot landing constraints.
  - icon: "⌁"
    title: Project bridge
    details: Every module maps back to the LLV PDI console you are already building. Study becomes working code.
---

<div class="home-section">
<p class="home-kicker">The plan, repaired</p>

## What this site is

This is a working field guide, not a link dump. It follows the three-month plan in `GNC.md`, fixes its ordering, and adds the Month 4 flight-software track that the skills table implied but the schedule never covered.

The goal is narrow: **turn you into someone who can take a GNC algorithm, integrate it into a flight-software architecture, test it, and defend the evidence.** That is the job described by the lunar-lander roles you are targeting.

</div>

<div class="home-section">
<p class="home-kicker">Start here</p>

## Three ways in

<div class="home-grid">
  <a class="home-card" href="./start/roadmap.html">
    <span class="card-index">01</span>
    <strong>Follow the 16-week roadmap</strong>
    <span>Week-by-week sequence, deliverables, and the capstone that ties everything together.</span>
  </a>
  <a class="home-card" href="./start/how-to-use.html">
    <span class="card-index">02</span>
    <strong>Learn how to study this</strong>
    <span>The read → build → explain → test loop, plus what to skip when time is short.</span>
  </a>
  <a class="home-card" href="./start/progress.html">
    <span class="card-index">03</span>
    <strong>Open the progress dashboard</strong>
    <span>Mark pages complete, see the next topic, and keep the whole plan in view.</span>
  </a>
</div>

</div>

<div class="home-section">
<p class="home-kicker">The route</p>

## Four months, one trajectory

| Phase | Focus | What you can do at the end |
| --- | --- | --- |
| **Month 1** | Space basics, frames primer, STK, MATLAB/Simulink, C++, Linux, Git, CMake, debugging | Build and debug a small lander simulation. Navigate a lunar scenario in STK. |
| **Month 2** | Frames, quaternions, attitude dynamics, PID/LQR, 6DOF, Monte Carlo, navigation, powered descent, architecture | Close the loop: estimate state, generate a descent command, control attitude, and analyze dispersions. |
| **Month 3** | V&V, SIL/HIL, Python automation, STK Object Model | Produce test evidence, automate a test campaign, and script repeatable mission studies. |
| **Month 4** | Real-time C++, Simulink pipeline, cFS, RTOS, CCSDS/SpaceWire, NPR 7150.2, fault protection, sensors | Speak credibly about the flight-software stack and build a small cFS or RTOS-based lander app. |

</div>

<div class="home-section">
<p class="home-kicker">Keep moving</p>

## Your progress

<ProgressDashboard compact />

</div>

<div class="home-section">
<p class="home-kicker">Read this first</p>

## The honest constraints

- **The original plan is broad, not deep.** One month cannot make you an expert in eight tools. This guide compresses the tooling and spends the saved time on GNC and flight software.
- **STK is much easier after frames and time.** The roadmap inserts a short frames primer before STK instead of pretending the order does not matter.
- **“Orbital mechanics is lower priority” is only half true.** You do not need the full three-body problem, but you do need two-body motion, frames, time, and descent mechanics. The mission pages scope that sharply.
- **V&V is not a Month 3 phase.** It starts when you write the first requirement. The Month 3 pages turn the habit into evidence.
- **cFS, RTOS, CCSDS, and NPR 7150.2 were missing.** They are now Month 4, because they are exactly what lunar-lander flight-software interviews probe.

> If you only have ten hours a week, stretch the calendar. Do not compress Month 2. A weak navigation or guidance foundation shows up immediately in an interview and in the simulator.

</div>
