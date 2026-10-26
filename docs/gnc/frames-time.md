---
title: Coordinate frames, time & transformations
description: The frame and time conventions that prevent the most expensive class of GNC bug.
---

# Coordinate frames, time & transformations

::: tip Why this matters
A lunar lander has no GPS, no air data, and no external reference at the last hundred meters. Every position, velocity, attitude, and sensor measurement is defined by a frame and a time. When those are wrong, the vehicle can be perfectly stable while flying to the wrong place. Frame and time discipline is the highest-leverage habit in GNC software.
:::

## Learning objectives

- Define MCI, MCMF, ENU, NED, LVLH, body, and sensor frames and when to use each.
- Compose and invert DCMs without guessing.
- Convert between DCMs, Euler angles, axis-angle, and quaternions.
- Keep UTC, TAI, TT, TDB, MET, and SCLK straight.
- Design interfaces that carry frame and time tags.
- Test a transformation chain with known vectors and finite differences.

## The frame stack for a lunar descent

A typical descent software chain looks like this:

```
IMU / star tracker / altimeter / camera
            │  sensor frame
            ▼
          body frame
            │  attitude (q or DCM)
            ▼
      local frame (ENU or LVLH)
            │  site position, lunar rotation
            ▼
      MCMF (Moon-fixed)
            │  lunar orientation
            ▼
      MCI (inertial)
            │  ephemerides
            ▼
      Earth / solar / deep-space frames
```

Every arrow needs a timestamp and a convention. A transform that is correct at one epoch can be wrong a minute later because the Moon rotated or the vehicle moved.

## The frames you will meet

| Frame | Origin | Orientation | Use |
| --- | --- | --- | --- |
| **MCI** | Moon center | Non-rotating, tied to distant stars (often ICRF/J2000 axes) | Orbit propagation, inertial navigation |
| **MCMF** | Moon center | Rotates with the Moon; $z$ near the rotation pole, $x$ near the prime meridian | Maps, landing sites, terrain, surface-relative velocity |
| **ME / PA** | Moon center | Mean Earth/polar axis vs principal-axis variants | High-precision lunar orientation products |
| **ENU** | Site or vehicle | East, North, Up | Local guidance, altitude, approach geometry |
| **NED** | Site or vehicle | North, East, Down | Aircraft-style navigation, some sensors |
| **LVLH** | Vehicle | Local vertical/local horizontal, often $x$ along velocity or zenith | Relative motion, rendezvous, descent |
| **Body** | Vehicle center of mass | Vehicle-specific: forward/up/right, or $x$ out the nose | Attitude, thrust direction, IMU |
| **Sensor** | Sensor | Boresight and detector axes | Camera, star tracker, altimeter, radar |

The lunar **ME** (Mean Earth/polar axis) and **PA** (principal axis) frames differ by small rotations. Mission products and SPICE kernels specify which one they use. Do not assume “Moon-fixed” means the same thing in two documents.

## DCM mechanics

A DCM $\mathbf{C}_{B\leftarrow A}$ maps a vector from $A$ to $B$:

$$
\mathbf{v}_B = \mathbf{C}_{B\leftarrow A}\mathbf{v}_A.
$$

Key properties:

- **Inverse:** $\mathbf{C}_{A\leftarrow B} = \mathbf{C}_{B\leftarrow A}^{T}$.
- **Composition:** $\mathbf{C}_{C\leftarrow A} = \mathbf{C}_{C\leftarrow B}\mathbf{C}_{B\leftarrow A}$.
- **Orthonormal:** $\mathbf{C}^{T}\mathbf{C} = \mathbf{I}$, $\det(\mathbf{C}) = +1$.
- **Active vs passive:** rotating a vector and rotating the axes are inverse operations. Libraries differ. Write a test.

A 3-2-1 yaw–pitch–roll sequence (yaw $\psi$ about $z$, pitch $\theta$ about $y$, roll $\phi$ about $x$) is:

$$
\mathbf{C}_{B\leftarrow N} = \mathbf{R}_z(\psi)\mathbf{R}_y(\theta)\mathbf{R}_x(\phi).
$$

The explicit matrix is in most textbooks; the important part is the order and whether it maps NED to body or body to NED. A common convention is $\mathbf{C}_{B\leftarrow N}$, so $\mathbf{v}_B = \mathbf{C}_{B\leftarrow N}\mathbf{v}_N$.

### ENU from MCMF

At a site with geodetic latitude $\phi$ and longitude $\lambda$, the ENU axes expressed in MCMF are:

$$
\mathbf{e}_E = \begin{bmatrix}-\sin\lambda\\ \cos\lambda\\ 0\end{bmatrix},\quad
\mathbf{e}_N = \begin{bmatrix}-\sin\phi\cos\lambda\\ -\sin\phi\sin\lambda\\ \cos\phi\end{bmatrix},\quad
\mathbf{e}_U = \begin{bmatrix}\cos\phi\cos\lambda\\ \cos\phi\sin\lambda\\ \sin\phi\end{bmatrix}.
$$

Stack them as rows to get $\mathbf{C}_{ENU\leftarrow MCMF}$. This is the transform you will use constantly for landing-site geometry. Test it at the equator and at the poles.

## Euler angles: useful, dangerous

Euler angles are human-readable but have singularities and ambiguous sequences. Use them for displays, operator commands, and documentation. Do not use them as the primary attitude state in flight software.

| Representation | Strength | Weakness |
| --- | --- | --- |
| Euler angles | Intuitive | Gimbal lock, sequence ambiguity |
| DCM | Direct vector rotation | 9 numbers, drift, orthonormalization |
| Quaternion | 4 numbers, no singularity, smooth interpolation | Sign ambiguity, convention traps |
| Axis-angle | Physical | Singular at zero rotation, less convenient to compose |

The flight state is usually a quaternion or a DCM, with Euler angles derived only for the display.

## Time systems

| Time | Definition | Use |
| --- | --- | --- |
| **UTC** | Civil time with leap seconds | Scenario times, operations, logs |
| **TAI** | Atomic time, continuous | Precise time transfer |
| **TT** | Terrestrial Time, uniform | Astrodynamics |
| **TDB** | Barycentric Dynamical Time | Planetary ephemerides, SPICE |
| **MET** | Mission Elapsed Time | Flight software scheduling, telemetry |
| **SCLK** | Spacecraft clock | Hardware timestamps, correlation |
| **Monotonic** | Never jumps | Control loops, watchdogs |

UTC is not uniform because of leap seconds. Control loops must use a monotonic clock. Keep the UTC/SCLK mapping as data and handle clock corrections explicitly. A negative or zero time step in a controller is a fault, not a rounding detail.

There is **no single operational lunar time standard** used by all missions today. Missions use UTC, SCLK, and MET with documented mappings; lunar time standardization is an active topic. For flight software, the safe rule is: use mission time for execution, UTC for operations, and document the conversion.

## Interface design: make the tags explicit

A state message should carry:

```text
timestamp_met_s        monotonic mission time
timestamp_utc          for operations/logging
frame_position         e.g. MCMF
frame_velocity         e.g. MCMF
position_m[3]
velocity_mps[3]
attitude_quaternion    q_body_from_mcmf, scalar-first
attitude_frame         body <- MCMF
validity_flags
sequence_counter
```

The exact schema is less important than the rule: **no bare vectors**. A reviewer should be able to tell what a number means without opening the implementation.

## Common frame and time bugs

1. **Transpose confusion.** Applying $\mathbf{C}_{B\leftarrow A}$ where $\mathbf{C}_{A\leftarrow B}$ was intended.
2. **Active/passive mismatch.** The library rotates the vector; the code assumes it rotates the axes.
3. **Euler order.** 3-2-1 vs 3-1-3 vs 2-3-1.
4. **Degrees/radians.** A 57.3× error is easy to spot; a 0.017× error is not.
5. **Frame tag missing.** A velocity in MCMF is treated as inertial; the Coriolis term is lost.
6. **Time scale mismatch.** UTC is used where TDB was intended, or leap seconds enter a control loop.
7. **Stale transform.** The site position is computed at t0 but used at t1.
8. **Quaternion order.** `(w,x,y,z)` vs `(x,y,z,w)`.
9. **Lunar orientation model.** ME vs PA, libration, and epoch differences.
10. **Unit mismatch.** km vs m in a transform, or N vs kN in a force.

## Tests that catch frame bugs

- Rotate a known vector by 90° about each axis and compare to the analytic result.
- Check $\mathbf{C}^{T}\mathbf{C} \approx \mathbf{I}$ and $\det(\mathbf{C}) \approx 1$.
- Compose $A\rightarrow B\rightarrow C$ and compare to the direct transform.
- Differentiate a position transform and compare the velocity to the analytic angular-velocity relation.
- Compare your MCMF→ENU result to STK or SPICE for a known site and epoch.
- Round-trip MCMF→ENU→MCMF and verify the error is at floating-point level.

## Practice

1. Implement `C_ENU_from_MCMF(lat, lon)` and test at $(0°,0°)$, $(90°,0°)$, and $(0°,90°)$.
2. Implement `C_MCMF_from_ENU` as the transpose and verify it inverts the first transform.
3. Write a function that converts a quaternion to a DCM and back. Test with 90° rotations about each axis.
4. Given a body-frame velocity and a body-to-ENU quaternion, compute the ENU velocity. Then compute the MCMF velocity using the site transform.
5. Compare your transform chain with STK at one epoch. Record the difference and explain it.

<Quiz
  question="A position is reported in MCMF but treated as MCI. Which term is most obviously missing from the velocity model?"
  options="The Coriolis and centrifugal terms from the rotating frame|The speed of light|The rocket equation|The quaternion normalization"
  answer="0"
  explanation="MCMF rotates with the Moon. A velocity in a rotating frame needs the rotation terms (Coriolis/centrifugal) to relate to inertial motion. Treating it as inertial silently drops them."
/>

## Resources

- Vallado, *Fundamentals of Astrodynamics and Applications* — frames, time, and transformations.
- [NASA SPICE](https://naif.jpl.nasa.gov/naif/) — frame kernels and time conversions.
- [IAU Working Group on Cartographic Coordinates and Rotational Elements](https://www.iauexoplanets.org/) — planetary orientation conventions.
- [STK help: frames and time](https://help.agi.com/stk/) — a practical implementation to compare against.
- [IERS conventions](https://www.iers.org/IERS/EN/Publications/TechnicalNotes/tn36.html) — Earth orientation and time scales.

Next: [quaternions & attitude representations](./quaternions.md).
