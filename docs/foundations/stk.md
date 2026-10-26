---
title: STK essentials
description: Build a lunar scenario, propagate an orbit, compute access, and read the reports.
---

# STK essentials

::: tip Why this matters
STK (Systems Tool Kit) is common in lunar and planetary mission studies. Job descriptions mention it because it answers geometry questions quickly: when can the lander see Earth, when is the site lit, what is the access window, and where is the vehicle at a given time. You do not need to become an STK operator. You need to build a scenario, ask a question, and export an answer someone can check.
:::

## Learning objectives

- Create a Moon-centered scenario with a vehicle and a landing site.
- Propagate a low lunar orbit and inspect position/velocity in multiple frames.
- Compute access and lighting windows with constraints.
- Export a report and explain what the numbers mean.
- Know when STK is the wrong tool.

## The mental model

STK is a geometry and time engine. Everything you do is one of these:

1. **Define a scenario** — central body, start/stop time, time step.
2. **Add objects** — satellite, facility, target, sensor, transmitter, receiver, ground station.
3. **Give objects motion or a fixed position** — propagator, ephemeris, latitude/longitude/altitude.
4. **Ask a geometric question** — access, visibility, lighting, coverage, link budget.
5. **Export the answer** — report, graph, data provider, or a script.

If you cannot state the question in that vocabulary, the UI will feel like a maze.

## A minimal lunar scenario

1. **Create a scenario.** Set the central body to the Moon. Use UTC for the scenario time; note the start/stop epoch.
2. **Add a satellite.** Start with a simple circular orbit at 100 km altitude, or use an NRHO if you are studying a gateway-like architecture.
3. **Add a landing site.** Use a facility or target at your chosen selenographic latitude/longitude. Add an altitude relative to the terrain or a reference radius.
4. **Set the propagator.** Two-body is enough for a first pass. Switch to a higher-fidelity lunar gravity model only when the question needs it.
5. **Compute access.** Select the satellite and the site, then compute access. Inspect start time, stop time, duration, and gaps.
6. **Add a constraint.** Add a sun-elevation constraint, a sensor field of view, or a communication link. Compare the access windows.
7. **Export a report.** Save the report with the scenario file and a note describing the question, assumptions, and STK version.

Do not start with a full mission. One satellite, one site, one question.

## Frames, units, and time

STK will happily show you numbers in a frame you did not intend. Before trusting a report:

- Check the **central body** (Moon, not Earth).
- Check the **time scale** (UTC is the default in the UI; internal ephemerides may use other scales).
- Check the **frame** of every position/velocity report (MCI, MCMF, ENU, body).
- Check **units** (km vs m, degrees vs radians, UTCG vs seconds).
- Check the **epoch** of the scenario and any vehicle ephemeris.

A report without a frame and epoch is not evidence.

## Objects you will actually use

| Object | Use |
| --- | --- |
| **Satellite** | Orbiting vehicle, lander during coast, relay |
| **Facility / target** | Landing site, ground station, hazard point |
| **Sensor** | Field of view, terrain masking, star tracker geometry |
| **Transmitter / receiver** | Communication link geometry and budget |
| **Chain** | End-to-end access through multiple objects |
| **Coverage** | Grid or region statistics over time |
| **Astrogator** | Maneuver design and trajectory optimization |

For descent, STK is better at the **approach geometry** than at the last hundred meters. Use it for orbit phasing, lighting, line-of-sight, and communication. Use a 6DOF simulation for terminal descent.

## Reports worth generating

- **Access:** start/stop/duration for a site and a vehicle.
- **Lighting:** sun elevation/azimuth at the site over the descent window.
- **Line of sight:** Earth occultation and relay visibility.
- **Coverage:** how much of a landing ellipse or traverse is visible from an asset.
- **Orbit ephemeris:** position/velocity in MCI and MCMF at a fixed step.
- **Link budget:** received power, margin, and data rate over time.

Save the report, the scenario, and a short README. A screenshot is not a reproducible result.

## STK and flight software

STK is a **ground analysis tool**, not flight code. Its outputs can become:

- reference ephemerides for a simulation,
- access windows for a mission timeline,
- lighting constraints for a descent test case,
- truth data for a navigation study,
- requirements for a sensor field of view.

Do not embed STK in the flight loop. Do not assume its propagator matches your flight dynamics. Use it to generate test cases and to sanity-check your own model.

## Practice

Build this scenario and write a one-page note:

- Moon-centered, 24-hour scenario.
- A 100 km circular orbit.
- A landing site at a latitude/longitude of your choice.
- Access between the satellite and the site.
- Sun elevation at the site during the access windows.
- One report exported to CSV and one graph.

Then answer: **Is the site lit during the access? How long is the longest continuous window? What assumption would change the answer most?**

<Quiz
  question="You need to know whether a landing site is sunlit during a descent window. Which STK construct is the most direct?"
  options="A chain with a transmitter and receiver|A lighting/access constraint on the site over the time window|A 6DOF trajectory optimizer|A coverage grid of the entire Moon"
  answer="1"
  explanation="A lighting constraint on the site (or a sensor/access with a sun-elevation constraint) directly answers the question. A chain is for multi-object access; coverage is for regional statistics."
/>

## Resources

- [STK help and tutorials](https://help.agi.com/stk/) — start with the scenario and access tutorials.
- [STK Object Model](https://help.agi.com/stk/index.htm#automation/objmodel.htm) — for the Month 3 automation page.
- [AGI/Ansys STK community](https://support.agi.com/) — licensing, install, and version-specific questions.
- [NASA SPICE](https://naif.jpl.nasa.gov/naif/) — when you need to check STK geometry against an independent source.

Next: [MATLAB & Simulink essentials](./matlab-simulink.md).
