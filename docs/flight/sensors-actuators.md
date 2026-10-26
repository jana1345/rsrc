---
title: Sensors & actuators
description: IMUs, star trackers, altimeters, cameras, thrusters, gimbals, and their failure modes.
---

# Sensors & actuators

::: tip Why this matters
GNC software is only as good as the measurements it receives and the authority it commands. You do not need to design the hardware, but you need to read a datasheet, build a realistic error model, recognize a failure mode, and write an interface that makes invalid data obvious.
:::

## Learning objectives

- Describe the sensors used on lunar landers and what each measures.
- Build a first-order error model for an IMU, star tracker, and altimeter.
- Explain actuator limits, deadbands, and minimum impulse bits.
- Recognize common failure modes and their signatures.
- Design a sensor/actuator interface with validity and timing.
- Choose redundancy and calibration strategies.

## The sensor suite

| Sensor | Measures | Strength | Weakness |
| --- | --- | --- | --- |
| **IMU** | Specific force, angular rate | High rate, self-contained | Bias, drift, scale factor, vibration |
| **Star tracker** | Attitude relative to stars | Accurate, absolute | Slow, sun exclusion, lost-in-space |
| **Sun sensor** | Sun direction | Simple, robust | Coarse, eclipse |
| **Horizon sensor** | Limb direction | Coarse attitude | Terrain/lighting sensitivity |
| **Radar altimeter** | Range to surface | Works in dust/dark | Beam width, terrain slope, interference |
| **Lidar** | Range/point cloud | High resolution | Power, dust, data rate |
| **Camera / TRN** | Image, terrain-relative position | Hazard detection, map match | Lighting, texture, latency, compute |
| **Radar velocimeter** | Relative velocity | Direct velocity | Beam geometry, surface scattering |
| **GPS** | Position, velocity | Earth convenience | **Not available on the Moon** |

A lunar lander does not have GPS. It may have a radio beacon, a relay, or ground tracking for the cruise phase, but terminal descent is self-contained or terrain-relative.

## IMU error model

A practical model:

$$
\tilde{\mathbf{f}} = (1+s_a)\mathbf{f} + \mathbf{b}_a + \mathbf{n}_a + \mathbf{M}_a\mathbf{f},
$$

$$
\tilde{\boldsymbol{\omega}} = (1+s_g)\boldsymbol{\omega} + \mathbf{b}_g + \mathbf{n}_g + \mathbf{M}_g\boldsymbol{\omega},
$$

where:

- $s$ is scale factor error,
- $\mathbf{b}$ is bias (random walk),
- $\mathbf{n}$ is white noise,
- $\mathbf{M}$ is misalignment/cross-axis sensitivity.

Add quantization, saturation, and temperature dependence if the datasheet supports them. For a first sim, bias + noise + scale factor is enough to expose estimator problems.

## Star tracker model

A star tracker outputs an attitude quaternion, often with:

- accuracy (arcseconds),
- update rate (1–10 Hz),
- latency (10–200 ms),
- sun exclusion angle,
- lost-in-space recovery time,
- valid flag.

Model the quaternion error as a small rotation with covariance. A star tracker is not a continuous attitude source; between updates, the gyro propagates.

## Altimeter and terrain

A radar altimeter measures range along the beam. Over a slope or a rock, the “altitude” is not the vertical altitude above the target. Model:

- beam width and footprint,
- terrain height and slope,
- surface reflectivity,
- dropout over steep terrain,
- interference from dust/plume,
- latency and update rate.

A lander that treats range-to-terrain as vertical altitude will have a bias on slopes. That bias can be larger than the touchdown velocity limit.

## Cameras and terrain-relative navigation

TRN compares camera/lidar data to a map or a stored landmark set. Error sources:

- map error (the map is not the terrain),
- image latency,
- lighting and shadow,
- textureless terrain,
- dust and plume,
- feature tracking failure,
- compute time.

TRN is powerful but not free. It adds a perception pipeline with its own timing and failure modes. The flight software needs a clear “valid/invalid/degraded” output and a fallback.

## Actuators

| Actuator | Controls | Key limits |
| --- | --- | --- |
| **Main engine** | Thrust magnitude | Min/max throttle, rise/fall time, Isp, mixture ratio |
| **Gimbal** | Thrust vector | Range, rate, actuator bandwidth, backlash |
| **RCS thrusters** | Torque/translation | Minimum impulse bit, pulse width, coupling, valve delay |
| **Reaction wheels** | Torque/momentum | Speed limit, torque limit, friction, saturation |
| **Valves** | Propellant flow | Response time, stuck open/closed, leakage |
| **Landing gear** | Contact | Stroke, crush, contact switch |

For a lander, the main engine and RCS dominate. Model the minimum impulse bit and the throttle curve; they determine whether the controller can hold a deadband.

## Failure modes and signatures

| Failure | Signature | Possible response |
| --- | --- | --- |
| IMU bias jump | Nav drift, growing innovation | Isolate, use redundant IMU, inflate covariance |
| IMU stuck | Constant rate/acceleration | Stale/immobile detector, switch |
| Star tracker lost-in-space | Invalid flag, wild quaternion | Hold attitude with gyro, reacquire |
| Altimeter stuck | Constant range, no rate correlation | Innovation gate, radar/lidar cross-check |
| Altimeter dropout | No data, timeout | Coast, use TRN/terrain, abort/divert |
| Camera blinded by dust | Low contrast, feature loss | Switch to radar/lidar, hover/divert |
| Thruster stuck on | Unexpected torque/translation | Isolate, opposite thruster, safe mode |
| Thruster stuck off | Loss of authority | Redundancy, abort/divert |
| Gimbal stuck | Attitude control degraded | Use RCS, reduce thrust, abort |
| Valve leak | Unexpected acceleration | Detect, isolate, safe mode |

Each failure needs a detector, an isolation rule, and a recovery action.

## Interface design

A sensor message should include:

```text
sensor_id
timestamp_met_s
timestamp_sensor_s
frame
measurement
covariance / accuracy
validity
health
sequence
```

An actuator command should include:

```text
timestamp_met_s
actuator_id
command (throttle, torque, valve state)
enable
mode
checksum
```

Validate ranges, rates, and enable state before writing the command. A command with a valid checksum can still be unsafe.

## Calibration and alignment

- Measure sensor-to-body alignment, not just assume it.
- Calibrate biases at the expected temperature.
- Store calibration constants in a table with a version.
- Verify the sign of every axis with a known motion.
- Check time alignment between sensors; a 50 ms offset can look like a bias.

## Practice

1. Write a Python class for a noisy IMU with bias, scale factor, and random walk. Feed it to your EKF.
2. Add a star tracker with 5 Hz updates and 100 ms latency. Compare attitude error with and without it.
3. Model an altimeter over a 10° slope. How much vertical altitude error does the beam footprint introduce?
4. Add a stuck thruster to the 6DOF sim. Can your FDIR detect it? How long does it take?
5. Write an interface table for one sensor and one actuator, including validity, timing, and fault behavior.

<Quiz
  question="Why is a radar altimeter measurement not automatically the vertical altitude above the landing target?"
  options="Because radar cannot measure range|Because the beam intersects terrain at a range that depends on slope, footprint, and surface geometry|Because the Moon has no radar return|Because altitude is always in feet"
  answer="1"
  explanation="The altimeter measures range along the beam to the surface. Slope, footprint, rocks, and terrain height can make that range different from the vertical altitude above the target."
/>

## Resources

- [NASA cFS](https://nasa.github.io/cFS/) — sensor/actuator app patterns.
- [NASA Lunar Reconnaissance Orbiter](https://lro.gsfc.nasa.gov/) — terrain and lighting data.
- [STK](https://help.agi.com/stk/) — sensor geometry and access studies.
- [Allan variance](https://www.nist.gov/publications/handbook-frequency-stability-analysis) — IMU noise characterization.
- Sensor datasheets: read the noise density, bias instability, scale factor, and bandwidth, not just the headline accuracy.

Next: [lunar environment](../mission/lunar-environment.md).
