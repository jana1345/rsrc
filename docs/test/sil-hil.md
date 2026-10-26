---
title: SIL & HIL
description: What is real, what is simulated, and how to build a test bed that finds timing bugs.
---

# SIL & HIL

::: tip Why this matters
A model-in-the-loop test can prove the math. A software-in-the-loop test can prove the flight code. A hardware-in-the-loop test can prove the interfaces and timing. Each one catches a different class of bug. For a lunar lander, the expensive failures live at the seams.
:::

## Learning objectives

- Distinguish MIL, SIL, PIL, and HIL.
- Design a SIL harness that runs the flight software binary against a plant model.
- Design a HIL setup with real flight hardware and emulated sensors/actuators.
- Inject timing, sensor, and communication faults.
- Decide which test level answers which question.

## The test ladder

| Level | Flight software | Plant | Hardware | Answers |
| --- | --- | --- | --- | --- |
| **MIL** | Model | Model | None | Does the algorithm work? |
| **SIL** | Compiled flight code | Model | None / host | Does the code implement the algorithm? |
| **PIL** | Compiled for target | Model | Target processor | Does the target build behave? |
| **HIL** | Flight computer | Real-time model | Real I/O, emulated sensors/actuators | Do the interfaces and timing work? |

MIL is fast and flexible. SIL is where you find code-level and interface bugs. PIL is where you find compiler, optimization, and target-library differences. HIL is where you find timing, electrical, and integration bugs. Skipping levels saves time until it does not.

## SIL architecture

A practical SIL harness:

```
┌─────────────────────┐      UDP / shared memory      ┌─────────────────────┐
│  Flight software    │ <───────────────────────────> │  Plant + sensors    │
│  (same binary)      │                               │  (Python/C++/Simulink)│
└─────────────────────┘                               └─────────────────────┘
          │                                                     │
          └────────────────── logs / recorder ──────────────────┘
```

Key properties:

- **Same flight binary.** Do not recompile a “test version” with different logic.
- **Same message formats.** Use the real serialization and units.
- **Deterministic time.** A simulated clock, fixed step, and a defined ordering of sensor/command updates.
- **Recorded inputs.** Save sensor streams and commands so a failure is reproducible.
- **Fault injection.** Drop packets, delay sensors, corrupt checksums, freeze a measurement.
- **Automated assertions.** Not just plots.

A common mistake is to run the flight software as a library inside the plant. That is useful for unit tests, but it does not test the process boundary, the message timing, or the startup sequence. Run the real binary.

## HIL architecture

A HIL test bed might look like:

```
Flight computer ── UART/SpaceWire/Ethernet ── I/O board ── real-time plant
       │                                           │
       └──────── telemetry / command ──────────────┘
```

What is real:

- the flight computer and its operating system,
- the flight software binary,
- the I/O drivers and harness,
- the timing and interrupts.

What is simulated:

- sensors (IMU, star tracker, altimeter, camera),
- actuators (engine, RCS, gimbal),
- the plant dynamics,
- the environment (gravity, terrain, lighting).

HIL is where you discover that the UART driver drops bytes under load, the sensor timestamp is one cycle late, or the watchdog resets during a flash write.

## Time and synchronization

A HIL test is only meaningful if time is consistent:

- The plant runs in real time or faster with a synchronized clock.
- Sensor messages carry timestamps that match the plant’s truth time.
- The flight software’s MET and the test bed’s time have a defined offset.
- Command latency is measured, not assumed.
- Logs share a time base.

If the plant runs at 10× real time but the flight software runs at 1×, you are testing a different system.

## Fault injection

Design faults deliberately:

| Fault | Injection | Expected response |
| --- | --- | --- |
| Stale IMU | Freeze the last sample, keep timestamp old | Nav detects age, control holds or safes |
| Stuck altimeter | Constant range | Innovation gate rejects, altitude estimate degrades |
| Corrupt command | Bad checksum / length | Command rejected, event logged |
| Dropped packet | Skip sequence number | Timeout/recovery, no silent use |
| Delayed sensor | Add latency | Nav handles timestamp, controller stays stable |
| CPU overload | Add a busy task | Deadline monitor, watchdog, graceful degradation |
| Power glitch | Reset the flight computer | Safe mode, state recovery, no unsafe command |
| Actuator stuck | Freeze RCS valve | Fault detection, redundancy, abort/divert |

Each fault needs a pass/fail criterion, not just “the vehicle survived.”

## What HIL does not prove

- It does not prove the plant model is right.
- It does not prove the sensor model matches the real sensor.
- It does not prove the flight software will survive radiation.
- It does not replace flight testing or independent V&V.

HIL reduces integration risk. It does not eliminate it.

## A practical build order

1. **Host unit tests** for math and interfaces.
2. **SIL** with the flight binary and a simple plant.
3. **SIL with faults** and automated assertions.
4. **PIL** on the target processor, if available.
5. **HIL** with the flight computer and real I/O.
6. **Mission scenario** with Monte Carlo and hardware faults.

Do not start with HIL. You will spend weeks debugging the harness instead of the software.

## Practice

1. Build a SIL harness that exchanges UDP packets with your flight binary.
2. Add a simulated clock and a fixed update order. Log both sides with a shared time base.
3. Inject a 200 ms sensor delay and a dropped packet. Does the flight software detect them?
4. Add a watchdog and a fault that blocks the main loop. Verify the reset and safe mode.
5. Write a HIL test plan for one sensor and one actuator. List what is real, what is simulated, and what could invalidate the test.

<Quiz
  question="What class of bug is most likely to be found in HIL but missed in SIL?"
  options="A quaternion sign error|A UART driver dropping bytes under load or a sensor timestamp arriving late|A wrong equation in the guidance law|A unit conversion in a pure function"
  answer="1"
  explanation="HIL exercises real I/O, drivers, interrupts, and timing. Pure math and unit bugs are usually caught earlier in MIL/SIL or unit tests."
/>

## Resources

- [NASA cFS](https://nasa.github.io/cFS/) — a flight framework with test and simulation support.
- [NASA HIL and V&V resources](https://swehb.nasa.gov/) — software engineering handbook.
- [dSPACE / Speedgoat HIL](https://www.dspace.com/) — commercial HIL examples (concepts transfer even if you do not use the product).
- [Python `pytest`](https://docs.pytest.org/) — automate the harness.

Next: [Python test automation](./python-automation.md).
