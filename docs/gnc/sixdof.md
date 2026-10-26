---
title: 6DOF simulation
description: Build the plant, sensors, and actuators, then learn when the simulation is lying to you.
---

# 6DOF simulation

::: tip Why this matters
A 6DOF simulation is the integration test rig for GNC. It is where guidance, navigation, and control meet physics, sensor noise, actuator limits, and timing. If you can build one and explain its assumptions, you can diagnose closed-loop behavior instead of guessing from plots.
:::

## Learning objectives

- Define a 6DOF state and the equations of motion in a consistent frame.
- Integrate translation and rotation with a fixed-step method.
- Model mass depletion, thrust, RCS, gravity, and a landing surface.
- Separate the plant, sensors, flight software, and logging.
- Verify the sim with known-answer cases before trusting a landing result.
- Recognize the common ways a 6DOF sim lies.

## The state

A minimal 6DOF state in an inertial frame:

```text
position_m[3]           r_I
velocity_mps[3]         v_I
attitude_quaternion     q_BI  (body-to-inertial)
angular_rate_rps[3]     omega_B
mass_kg                 m
inertia_kgm2[3x3]       I_B
time_s                  t
```

Optional states: fuel mass, tank slosh, flexible modes, actuator positions, sensor biases, terrain height.

The choice of inertial frame matters. For a lunar descent, MCI is a good inertial frame; MCMF is convenient for the landing site. Pick one for the equations and transform for output. Do not mix them inside the derivative function.

## Translational dynamics

In an inertial frame:

$$
\dot{\mathbf{r}} = \mathbf{v},
\qquad
\dot{\mathbf{v}} = \frac{\mathbf{F}_B}{m} + \mathbf{g}(\mathbf{r}),
\qquad
\dot m = -\frac{\|\mathbf{F}_{\text{thrust}}\|}{I_{sp}g_0}.
$$

If $\mathbf{F}_B$ is expressed in body axes, rotate it:

$$
\mathbf{F}_I = \mathbf{C}_{I\leftarrow B}\mathbf{F}_B.
$$

The gravity model can be constant for a first pass ($g=1.62$ m/s² toward the Moon center), but a real descent sim should use a lunar gravity model and a terrain height. The Moon’s gravity is lumpy; mascons matter for orbit propagation more than terminal descent, but the difference is worth knowing.

## Rotational dynamics

$$
\dot{\boldsymbol{\omega}}_B = \mathbf{I}^{-1}\left(\boldsymbol{\tau}_B - \boldsymbol{\omega}_B\times\mathbf{I}\boldsymbol{\omega}_B\right),
\qquad
\dot q_{BI} = \frac{1}{2}q_{BI}\otimes\begin{bmatrix}0\\\boldsymbol{\omega}_B\end{bmatrix}.
$$

Normalize the quaternion after each step. Update the inertia tensor if mass properties change.

## Integration

A fixed-step RK4 is a good default:

```text
k1 = f(t, x)
k2 = f(t + dt/2, x + dt/2 * k1)
k3 = f(t + dt/2, x + dt/2 * k2)
k4 = f(t + dt, x + dt * k3)
x_next = x + dt/6 * (k1 + 2*k2 + 2*k3 + k4)
```

For real-time SIL/HIL, a fixed step is mandatory. For analysis, compare RK4 to a smaller step or a higher-order method. If the answer changes with the step, the sim is not converged.

Event handling matters: engine ignition, throttle quantization, touchdown, ground contact, and mode transitions. Do not let the integrator step through the surface and then clamp altitude; that hides energy errors and contact logic.

## Sensors and actuators

A useful 6DOF sim has a **plant**, a **sensor model**, and an **actuator model**:

```
guidance → control → actuator model → plant → sensor model → navigation → guidance
```

Sensor models:

- IMU: bias, scale factor, noise, misalignment, quantization, saturation, sample rate.
- Altimeter: range, beam width, terrain intersection, dropout, noise.
- Star tracker: quaternion, latency, sun exclusion, lost-in-space.
- Camera/TRN: image latency, feature error, map error.
- Radar/lidar: range/velocity, dropouts, dust interference.

Actuator models:

- main engine: throttle range, minimum throttle, rise/fall time, Isp variation, gimbal.
- RCS: minimum impulse bit, pulse width, rise/fall, coupling, valve delay.
- reaction wheels: torque limit, speed limit, friction.

A sim without actuator limits is an optimism generator.

## Truth model vs flight model

The **truth model** is the high-fidelity plant used for analysis. The **flight model** is the simplified model inside the flight software (if any). They are not the same, and they should not be.

Common differences:

- truth has flexible modes, slosh, and sensor faults;
- flight uses a rigid-body model and nominal inertia;
- truth has a terrain map; flight has an altimeter and a stored hazard map;
- truth knows the wind (none on the Moon) and the exact mass; flight estimates it.

The gap between them is where robustness lives. Test the flight software against a truth model that is *not* identical to its internal model.

## Verification before validation

Check the sim against cases with known answers:

1. **Ballistic fall:** no thrust, constant gravity. Compare altitude and velocity to the analytic solution.
2. **Hover:** thrust equals weight. Altitude and velocity stay constant; mass decreases.
3. **Torque-free rotation:** angular momentum and energy conserved; principal-axis behavior matches theory.
4. **Constant thrust:** acceleration matches $F/m$; mass flow matches the rocket equation.
5. **Step convergence:** halve `dt`; results should converge, not change qualitatively.
6. **Frame round-trip:** transform a state through MCMF/ENU/body and back; error should be at floating-point level.

If these fail, do not debug the controller.

## The ways a 6DOF sim lies

- **Frame mismatch:** thrust is in body, gravity in inertial, and the sum is taken without a transform.
- **Unit mismatch:** inertia in kg·m² but torque in N·mm; altitude in km but velocity in m/s.
- **Sign error:** thrust points down, or a positive RCS torque rolls the wrong way.
- **Quaternion drift:** no normalization, or a non-unit quaternion after interpolation.
- **Mass/inertia inconsistency:** mass decreases but inertia stays fixed.
- **Actuator idealization:** unlimited torque, zero delay, continuous throttle.
- **Sensor idealization:** perfect state feedback, no latency, no dropout.
- **Surface model:** a flat plane at zero altitude, no slope, no rocks, no terrain height.
- **Time step:** too large for the controller or the dynamics; a “stable” result that is numerically lucky.
- **Wrong truth:** the sim’s gravity or atmosphere is not the Moon’s.

## Practice

1. Build a 2D lander first: horizontal and vertical translation, one attitude angle, gravity, thrust, mass flow.
2. Add a quaternion attitude state and a 3-axis inertia. Verify torque-free motion.
3. Add a noisy IMU and altimeter. Feed the flight software only the measurements.
4. Add a landing surface with a slope. Detect touchdown by contact, not by an altitude threshold.
5. Run the known-answer tests. Then run a closed-loop descent and plot altitude, velocity, throttle, attitude, and fuel.

<Quiz
  question="Your 6DOF sim lands successfully with perfect state feedback but fails when you add sensor noise. What is the most useful next step?"
  options="Increase the controller gain until it works|Check the navigation estimate, sensor latency, and control loop timing before retuning|Remove the noise; it is unrealistic|Increase the integration step size"
  answer="1"
  explanation="Perfect-state success does not prove a closed loop works with an estimator in the loop. Check estimation error, latency, and timing first. Retuning a controller against a broken estimate hides the real problem."
/>

## Resources

- Schaub & Junkins, *Analytical Mechanics of Space Systems* — rigid-body and orbital dynamics.
- Vallado, *Fundamentals of Astrodynamics and Applications* — frames, gravity, and integration.
- [NASA cFS](https://nasa.github.io/cFS/) — flight software architecture for the other side of the interface.
- [SPICE](https://naif.jpl.nasa.gov/naif/) — ephemerides and frames for a higher-fidelity truth model.

Next: [Monte Carlo analysis](./monte-carlo.md).
