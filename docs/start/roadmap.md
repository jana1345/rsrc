---
title: The 16-week roadmap
description: A week-by-week lunar GNC and flight-software plan with deliverables and a capstone.
---

# The 16-week roadmap

This schedule keeps the three-month structure from `GNC.md` and adds the Month 4 flight-software track. It assumes **12–15 focused hours per week**. At 8–10 hours, stretch it to 24–30 weeks. Do not compress Month 2 to catch up; the GNC core is the part that compounds.

The weeks are a route, not a contract. If a topic takes two weeks, take two weeks. If you already have the skill, prove it with the deliverable and move on.

## At a glance

| Month | Weeks | Focus | Exit deliverable |
| --- | --- | --- | --- |
| **1 · Foundations** | 1–4 | Space basics, frames primer, STK, MATLAB/Simulink, C++, Linux, Git, CMake, debugging | A small C++ lander sim, a lunar STK scenario, and a 1D MATLAB/Simulink model |
| **2 · GNC core** | 5–10 | Frames/time, quaternions, attitude dynamics, PID/LQR, 6DOF, Monte Carlo, navigation, guidance, architecture | A closed-loop 6DOF descent sim with EKF, controller, guidance, and dispersion results |
| **3 · Test & integration** | 11–12 | V&V, SIL/HIL, Python automation, STK automation | A test plan, automated test suite, and a repeatable STK study |
| **4 · Flight software** | 13–16 | Real-time C++, Simulink pipeline, cFS, RTOS, CCSDS, NPR 7150.2, fault protection, sensors | A small flight-software app with requirements, tests, timing evidence, and a fault/mode design |

## Month 1 · Foundations (weeks 1–4)

| Week | Topics | Build |
| --- | --- | --- |
| **1** | [Space basics](../foundations/space-basics.md), [frames primer](../foundations/frames-primer.md), [lunar environment](../mission/lunar-environment.md) | Write a one-page mission profile: PDI altitude, descent phases, key frames, and the numbers you will use. |
| **2** | [STK](../foundations/stk.md), [MATLAB & Simulink](../foundations/matlab-simulink.md) | Build a lunar orbit/landing-site scenario in STK. Build a 1D vertical lander in Simulink. |
| **3** | [Modern C++](../foundations/cpp.md), [Linux](../foundations/linux.md) | Write a fixed-memory quaternion and state type in C++ and run it on the command line. |
| **4** | [Git](../foundations/git.md), [CMake](../foundations/cmake.md), [debugging](../foundations/debugging.md) | Put the C++ sim in a repo with CMake, tests, a debug build, and a sanitizer run. |

**Month 1 done when:** you can run a 1D lander sim, explain every frame and unit in it, reproduce a bug with a debugger, and show a clean build from a fresh clone.

<StudyChecklist
  id="month1"
  title="Month 1 deliverables"
  items="A one-page lunar descent mission profile with phases, frames, and units|A working STK scenario around the Moon with a landing site and an access or lighting report|A 1D vertical lander in MATLAB/Simulink with gravity, thrust, mass flow, and a plot|A C++ fixed-memory quaternion/state library with at least three unit tests|A CMake project that builds in Debug and Release with warnings enabled|A debugger session that finds and fixes a deliberately injected bug"
/>

## Month 2 · GNC core (weeks 5–10)

This is the heart of the plan. Do not rush it.

| Week | Topics | Build |
| --- | --- | --- |
| **5** | [Frames, time & transformations](../gnc/frames-time.md), [quaternions](../gnc/quaternions.md) | Implement `MCMF → ENU → body` transforms and a quaternion attitude state. Test with known vectors. |
| **6** | [Attitude dynamics](../gnc/attitude-dynamics.md) | Add rigid-body rotational dynamics, inertia, RCS torque, and a thrust vector to the sim. |
| **7** | [PID & LQR](../gnc/control.md) | Close an attitude loop. Compare PID and LQR. Add saturation, rate limits, and a deadband. |
| **8** | [6DOF simulation](../gnc/sixdof.md), [Monte Carlo](../gnc/monte-carlo.md) | Build the full plant. Add sensors, actuators, mass depletion, and a fixed-step integrator. Run dispersions. |
| **9** | [Navigation, EKF & sensor fusion](../gnc/navigation.md) | Add a noisy IMU and altimeter. Estimate altitude, vertical speed, attitude, and gyro bias. Check consistency. |
| **10** | [Powered descent guidance](../gnc/powered-descent.md), [GNC architecture](../gnc/architecture.md) | Generate throttle/attitude commands from the estimated state. Draw the architecture and rate groups. |

**Month 2 done when:** the vehicle can descend from PDI to a target under sensor noise, the controller stays stable at the flight rate, the EKF is consistent, and a 100-run Monte Carlo produces a landing dispersion you can explain.

<StudyChecklist
  id="month2"
  title="Month 2 deliverables"
  items="A frame-conversion module with tests for at least MCMF, ENU, and body frames|A quaternion attitude propagator with normalization and a drift test|A rigid-body model with inertia, RCS torque, thrust torque, and mass depletion|A PID and an LQR attitude controller, both tested with saturation and delay|A 6DOF descent simulation with a fixed-step integrator and logged state|A noisy-sensor EKF with innovation and consistency checks|A powered-descent guidance mode that commands throttle and attitude|A Monte Carlo run of at least 100 cases with percentile results and a written interpretation"
/>

## Month 3 · Test & integration (weeks 11–12)

| Week | Topics | Build |
| --- | --- | --- |
| **11** | [V&V](../test/verification.md), [SIL & HIL](../test/sil-hil.md) | Write requirements and a test plan for the descent sim. Build a SIL harness. Add fault injection. |
| **12** | [Python automation](../test/python-automation.md), [STK Object Model](../test/stk-automation.md) | Automate the regression suite. Script an STK access/lighting study and export a report. |

**Month 3 done when:** a fresh checkout can run the test suite in one command, the test report maps every requirement to a result, and the STK study can be regenerated with a script rather than a click path.

<StudyChecklist
  id="month3"
  title="Month 3 deliverables"
  items="A requirements list with a unique ID and a test for each requirement|A traceability matrix from requirement to test result|A SIL test that runs the flight-software binary against the plant model|At least three fault-injection tests: stale sensor, bad command, and timing overrun|A pytest suite with fixtures for sim start/stop and a machine-readable report|An STK Object Model script that creates a scenario, computes access or lighting, and saves results"
/>

## Month 4 · Flight software (weeks 13–16)

| Week | Topics | Build |
| --- | --- | --- |
| **13** | [Real-time C++](../flight/realtime-cpp.md), [Simulink → flight code](../flight/simulink-pipeline.md) | Convert the controller to fixed-memory C++. Generate code from a Simulink model and integrate it behind a hand-written interface. |
| **14** | [NASA cFS](../flight/cfs.md), [RTOS](../flight/rtos.md) | Build a minimal cFS app. Run a task/queue exercise on FreeRTOS or RTEMS. Measure jitter and deadline overruns. |
| **15** | [CCSDS & SpaceWire](../flight/ccsds-spacewire.md), [NPR 7150.2](../flight/npr-7150.md) | Write a packet parser and a command/telemetry interface. Build an NPR 7150.2 crosswalk for your project. |
| **16** | [Fault protection](../flight/fault-protection.md), [sensors & actuators](../flight/sensors-actuators.md) | Add a mode manager, FDIR, safe mode, and sensor/actuator fault models. Finish the capstone. |

**Month 4 done when:** you can explain the difference between a cyclic executive and an RTOS, show a cFS app exchanging messages, parse a CCSDS-like packet, and defend a fault/mode design for a one-shot landing.

<StudyChecklist
  id="month4"
  title="Month 4 deliverables"
  items="A fixed-memory C++ flight app with no dynamic allocation after initialization|A Simulink controller generated to C and integrated with a handwritten interface|A minimal cFS app with a command, a telemetry point, and an event|A task/queue exercise with measured jitter and a priority-inversion demonstration|A CCSDS-style packet parser with length, APID, sequence, and checksum tests|An NPR 7150.2 crosswalk that maps requirements to evidence without overclaiming compliance|A mode manager with safe mode, abort, and at least three fault-detection paths|A one-page FDIR and timing rationale for the capstone"
/>

## The capstone

Build one artifact you can show: **a lunar powered-descent flight-software demo with evidence.**

Minimum scope:

1. **Plant:** 6DOF lunar descent from PDI, with gravity, thrust, mass flow, RCS, and a landing target.
2. **Navigation:** IMU + altimeter EKF (attitude may be truth or star-tracker-aided) with noisy measurements.
3. **Guidance:** phase logic and a throttle/attitude command that reaches the target.
4. **Control:** PID or LQR attitude loop at a realistic rate, with saturation and deadbands.
5. **Flight software:** fixed-memory C++ app, message interfaces, mode manager, watchdog, and fault handling.
6. **V&V:** requirements, traceability, unit tests, SIL run, fault injection, and a Monte Carlo report.
7. **Story:** a five-minute explanation of the architecture, the three biggest risks, and the evidence that retires them.

If you can defend that, you can hold a conversation with a lunar-lander flight-software team.

## Where this deviates from `GNC.md`

| Original plan | This roadmap | Why |
| --- | --- | --- |
| STK in Month 1 before coordinate frames | Short frames primer before STK; full treatment in Month 2 | STK is an exercise in frames and time. Without them, you learn buttons, not astrodynamics. |
| Month 1 has eight broad topics | Compressed tooling, more time on C++/Linux/debugging and the mini sim | Tool fluency is necessary but not the differentiator. The build is. |
| Month 2 has six topics | Added navigation, guidance, and architecture | These are the must-master items from `GNC.md`; they cannot be left implicit. |
| Month 3 is SIL/HIL, Python, STK automation | Added V&V and made it continuous | Test evidence is a hard constraint for one-shot landing roles. |
| No cFS/RTOS/CCSDS/NPR | Month 4 flight-software track | These appear in the skills table and in job descriptions. |
| “Orbital mechanics lower priority” | Scoped mission page: two-body, frames, time, descent | You do not need the full three-body problem, but you do need the descent-relevant parts. |

## If you only have six weeks

Do this, in order:

1. Frames/time + quaternions.
2. 6DOF sim + attitude control.
3. Navigation/EKF basics.
4. Powered descent guidance.
5. V&V + one automated test suite.
6. Real-time C++ constraints + one cFS or RTOS exercise.

Skip STK automation, NPR 7150.2 depth, and the full Monte Carlo campaign. You will still be able to build and defend a descent demo.

Next: [set up your tools](./setup.md) or [open the dashboard](./progress.md).
