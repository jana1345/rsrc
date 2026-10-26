---
title: Frames & time primer
description: Enough frame and time vocabulary to use STK and read GNC interfaces without guessing.
---

# Frames & time primer

::: tip Why this matters
Most “GNC bugs” are frame bugs, sign bugs, or time-tag bugs wearing a disguise. You do not need the full transformation theory to start STK, but you do need to know what “position in MCMF at UTC” means. The deep treatment is in [coordinate frames, time & transformations](../gnc/frames-time.md).
:::

## Learning objectives

- Distinguish inertial, body-fixed, local, and body frames.
- Explain why a position or velocity without a frame is incomplete.
- Read a direction cosine matrix (DCM) and know what its transpose means.
- Keep UTC, TAI, TDB, and monotonic flight time separate.
- Use frame tags in variable names and interface messages.

## A frame is a coordinate system, not a place

A frame gives you:

1. an **origin**,
2. three **axes** (usually right-handed),
3. a **time** at which the axes are defined.

“The lander is at (10, 20, 30)” is meaningless until you say “relative to the landing site, in ENU meters, at the time of the measurement.” Position, velocity, attitude, and sensor measurements all need a frame.

| Frame | Origin | Axes | Typical use |
| --- | --- | --- | --- |
| **MCI** (Moon-Centered Inertial) | Moon center | Non-rotating, referenced to distant stars | Orbit propagation, inertial navigation |
| **MCMF** (Moon-Centered Moon-Fixed) | Moon center | Rotates with the Moon; prime meridian and pole | Landing-site coordinates, maps, terrain |
| **ENU** | Landing site | East, North, Up | Local descent guidance, altimetry |
| **NED** | Vehicle or site | North, East, Down | Aircraft-style navigation, some sensors |
| **LVLH** | Vehicle | Local vertical/local horizontal | Relative motion, rendezvous, descent |
| **Body** | Vehicle center of mass | Forward/up/right or your vehicle convention | Attitude, thrust direction, IMU |
| **Sensor** | Sensor | Sensor boresight and axes | Camera, star tracker, altimeter |

The Earth–Moon distance is about 384,400 km. A 1° attitude error at that range is roughly 6,700 km. Frames are not pedantry.

## Inertial vs rotating

An inertial frame does not rotate with the central body. A rotating frame does. MCI is inertial; MCMF rotates once per lunar day. The transformation between them depends on time:

$$
\mathbf{r}_{MCMF} = \mathbf{C}_{MCMF \leftarrow MCI}(t)\,\mathbf{r}_{MCI}.
$$

If you forget the time argument, your “fixed” landing site will drift. STK, SPICE, and Orekit all provide this transformation; the FSW usually receives the result or a compact model of it.

## DCMs without fear

A direction cosine matrix $\mathbf{C}_{B \leftarrow A}$ maps a vector from frame $A$ to frame $B$:

$$
\mathbf{v}_B = \mathbf{C}_{B \leftarrow A}\,\mathbf{v}_A.
$$

Useful facts:

- $\mathbf{C}_{A \leftarrow B} = \mathbf{C}_{B \leftarrow A}^{T}$ for orthonormal frames.
- Composition is right-to-left: $\mathbf{C}_{C \leftarrow A} = \mathbf{C}_{C \leftarrow B}\mathbf{C}_{B \leftarrow A}$.
- $\det(\mathbf{C}) = +1$. A determinant of $-1$ means you built a reflection, not a rotation.
- Active vs passive: rotating a vector and rotating the axes are inverse operations. Write down which one your library uses.

A common 3-2-1 (yaw–pitch–roll) sequence is

$$
\mathbf{C}_{B \leftarrow N} =
\begin{bmatrix}
c_\psi c_\theta & c_\psi s_\theta s_\phi - s_\psi c_\phi & c_\psi s_\theta c_\phi + s_\psi s_\phi\\
s_\psi c_\theta & s_\psi s_\theta s_\phi + c_\psi c_\phi & s_\psi s_\theta c_\phi - c_\psi s_\phi\\
-s_\theta & c_\theta s_\phi & c_\theta c_\phi
\end{bmatrix}.
$$

You will not memorize this. You will write a test that rotates a known vector and checks the result.

## Time systems

| Time | What it is | Where you see it |
| --- | --- | --- |
| **UTC** | Civil time with leap seconds | STK scenarios, mission operations, logs |
| **TAI** | Atomic time, no leap seconds | Precise time transfer, some ground systems |
| **TT** | Terrestrial time, uniform | Astrodynamics, some ephemerides |
| **TDB** | Barycentric dynamical time | SPICE, planetary ephemerides |
| **MET / SCLK** | Mission elapsed time / spacecraft clock | Flight software, telemetry |
| **Monotonic time** | Never jumps, used for deadlines | RTOS, watchdogs, control loops |

Flight software should not do control math on UTC. Use a monotonic mission clock for scheduling and keep the UTC/SCLK mapping as data. Leap seconds and clock corrections are not allowed to create a negative time step in a control loop.

> **Interface rule:** every state message should carry a timestamp and a time scale. “Time = 1234.5” is a bug waiting to happen. “MET = 1234.5 s, monotonic” is an interface.

## Frame tags in code

A lightweight convention prevents a large class of bugs:

```cpp
struct Vec3Mcmf { double x, y, z; };
struct Vec3Enu  { double x, y, z; };
struct Vec3Body { double x, y, z; };

Vec3Enu toEnu(const Vec3Mcmf& v, const Geodetic& site, Time t);
```

The compiler cannot prove the frame is right, but the type name makes the mistake visible in review. Some teams use a full units/frames library; others use naming conventions and tests. Either way, make the convention explicit.

## Practice

1. Write down the chain of frames for an IMU measurement used by a descent controller.
2. A vector is $(1,0,0)$ in ENU. What is it in NED?
3. A DCM has determinant $-1$. What went wrong?
4. Your control loop uses UTC and a leap second occurs. What could happen to the computed time step?
5. Why is a landing-site latitude/longitude not enough to define a position?

<details>
<summary>Answers</summary>

1. Sensor → body → local (ENU/NED) → MCMF → MCI, with time tags at each transform.
2. ENU $(1,0,0)$ is East; NED is $(0,1,0)$.
3. It includes a reflection or a sign error; it is not a pure rotation.
4. The step can jump or become negative, producing a huge derivative or an integration glitch.
5. You also need the body radius/altitude, the reference ellipsoid or terrain model, and the epoch/frame definition.

</details>

<Quiz
  question="Which pair is the cleanest split for flight software?"
  options="UTC for control scheduling, TDB for telemetry|Monotonic MET for scheduling, UTC/SCLK mapping for operations|TAI for control, local time for logs|Any time scale, as long as all timestamps are floats"
  answer="1"
  explanation="Control loops need a monotonic clock that cannot jump. Operations and telemetry need a mapping to UTC/SCLK. Mixing civil time into scheduling invites leap-second and clock-correction bugs."
/>

Deep dive: [coordinate frames, time & transformations](../gnc/frames-time.md). Next: [STK essentials](./stk.md).
