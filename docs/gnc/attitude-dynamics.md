---
title: Rigid-body attitude dynamics
description: Inertia, angular momentum, thrust torque, RCS, and why a lander oscillates.
---

# Rigid-body attitude dynamics

::: tip Why this matters
A lander is not a point mass with a camera. It has an inertia tensor, a thrust vector that may not pass through the center of mass, RCS jets with minimum impulse bits, and flexible appendages. The attitude loop is where “the guidance command was correct” turns into “the vehicle oscillated and missed the target.”
:::

## Learning objectives

- Write the rigid-body rotational equations in body axes.
- Explain the effect of the inertia tensor and product of inertia.
- Compute torque from thrust offset, RCS, and gimbal.
- Distinguish torque-free stability from closed-loop stability.
- Design a basic PD attitude law and recognize saturation and limit cycles.
- Model actuators and disturbances well enough to trust a 6DOF simulation.

## Angular momentum and Euler’s equations

For a rigid body with inertia tensor $\mathbf{I}$ in body axes, angular momentum is

$$
\mathbf{h} = \mathbf{I}\boldsymbol{\omega}.
$$

The rotational equation is

$$
\mathbf{I}\dot{\boldsymbol{\omega}} + \boldsymbol{\omega}\times(\mathbf{I}\boldsymbol{\omega}) = \boldsymbol{\tau},
$$

or, solving for angular acceleration,

$$
\dot{\boldsymbol{\omega}} = \mathbf{I}^{-1}\left(\boldsymbol{\tau} - \boldsymbol{\omega}\times\mathbf{I}\boldsymbol{\omega}\right).
$$

In principal axes, with $I_x, I_y, I_z$:

$$
\begin{aligned}
I_x\dot\omega_x + (I_z-I_y)\omega_y\omega_z &= \tau_x,\\
I_y\dot\omega_y + (I_x-I_z)\omega_z\omega_x &= \tau_y,\\
I_z\dot\omega_z + (I_y-I_x)\omega_x\omega_y &= \tau_z.
\end{aligned}
$$

The cross term is the gyroscopic coupling. It is why a spinning asymmetric body wobbles even with zero external torque.

## Inertia is a tensor, not three numbers

If the body axes are not principal, the inertia tensor has off-diagonal products of inertia:

$$
\mathbf{I} =
\begin{bmatrix}
I_{xx} & I_{xy} & I_{xz}\\
I_{xy} & I_{yy} & I_{yz}\\
I_{xz} & I_{yz} & I_{zz}
\end{bmatrix}.
$$

A mass property update, a deployed solar array, or a sloshing tank changes $\mathbf{I}$. Flight software often carries a nominal inertia and a mass estimate; the controller must be robust to the difference.

## Where torque comes from

| Source | Model | Notes |
| --- | --- | --- |
| **Main engine** | $\boldsymbol{\tau} = \mathbf{r}\times\mathbf{F}$ | Thrust misalignment or offset from the center of mass |
| **Gimbal** | Thrust vector rotates; torque about the gimbal axes | Limited range, rate, and actuator dynamics |
| **RCS** | Pulse of force at a moment arm | Minimum impulse bit, rise/fall time, coupling |
| **Reaction wheels** | Internal momentum exchange | Saturation, bearing friction, wheel speed limits |
| **Aerodynamics** | Not on the Moon | Relevant during Earth launch/entry, not lunar descent |
| **Gravity gradient** | Small but nonzero | Matters for long coast, not terminal descent |
| **Solar pressure** | Small | Long-duration attitude/Orbit effects |
| **Slosh / flexibility** | Coupled modes | Can destabilize a high-bandwidth controller |

For a lander, the main engine and RCS dominate. A thrust vector that misses the center of mass by 1 cm at 10 kN produces 100 N·m of torque. That is not a small number.

## Torque-free motion

With $\boldsymbol{\tau}=0$, angular momentum is conserved in inertial space, and kinetic energy is conserved. The body can still tumble. Stability depends on the moment of inertia about the spin axis:

- Spin about the **major** axis is stable.
- Spin about the **minor** axis is stable.
- Spin about the **intermediate** axis is unstable (the tennis-racket effect).

This matters for deployment, safe modes, and any scenario where the vehicle is coasting before the burn.

## Attitude control: PD and quaternion error

A common quaternion PD law is

$$
\boldsymbol{\tau} = -K_p\,\text{vec}(q_{err}) - K_d\,\boldsymbol{\omega}_B,
$$

where $q_{err}$ is the rotation from the current attitude to the commanded attitude, and $\text{vec}(\cdot)$ takes the vector part (with the scalar-part sign chosen for the short path). The gains are usually diagonal matrices or scalars per axis.

For a single axis with inertia $I$:

$$
I\ddot\theta + K_d\dot\theta + K_p\theta = 0
\quad\Longrightarrow\quad
\omega_n = \sqrt{K_p/I},\qquad
\zeta = \frac{K_d}{2\sqrt{K_p I}}.
$$

Choose $\omega_n$ based on the control bandwidth and the structural/slosh modes; choose $\zeta$ around 0.6–1.0 for a well-damped response. Then check saturation, delay, and sensor noise.

> **Flight-software lens:** the controller is only as good as its worst actuator. A PD law that assumes continuous torque will limit-cycle around a deadband or a minimum impulse bit. Model the actuator before you tune the gain.

## Deadbands, minimum impulse, and limit cycles

RCS thrusters fire in pulses. A minimum impulse bit (MIB) means the controller cannot make arbitrarily small torque corrections. Around a deadband, the vehicle can enter a stable limit cycle:

```
attitude error → fire thruster → overshoot → fire opposite thruster → repeat
```

Design for it:

- choose a deadband larger than the smallest achievable attitude change,
- add rate damping,
- use pulse-width modulation with a minimum on-time,
- avoid integrator windup during saturation,
- test with the real MIB and valve response.

A controller that is stable in a continuous simulation can chatter in hardware. That is not a tuning problem; it is an actuator modeling problem.

## Flexible modes and slosh

A lander with tanks, legs, and appendages is not perfectly rigid. Slosh and structural modes add lightly damped dynamics at frequencies that may be close to the controller bandwidth.

Practical responses:

- keep the control bandwidth well below the first flexible mode,
- add notch filters if the mode is known and stable,
- avoid high gain at the mode frequency,
- model the mode in the 6DOF sim, with uncertainty,
- test with gain margin reduction.

A rigid-body-only sim will happily certify a controller that rings the structure on the real vehicle.

## Practice

1. Simulate a torque-free rigid body with $I_x=100$, $I_y=200$, $I_z=300$ kg·m² and an initial rate. Observe the intermediate-axis instability.
2. Add a PD controller to hold a commanded quaternion. Plot settling time and overshoot.
3. Add a 1 N·m torque deadband and a minimum impulse bit. Observe the limit cycle.
4. Add a 20 ms transport delay. Reduce the gain until the loop is stable. How much margin did you lose?
5. Add a flexible mode at 2 Hz with 1% damping. Find the gain at which it goes unstable.

<Quiz
  question="Why can a controller that is stable in a rigid-body simulation limit-cycle on the real vehicle?"
  options="Because the real vehicle has a different gravitational constant|Because RCS thrusters have a minimum impulse bit and a deadband, so small corrections are quantized|Because quaternions are not associative|Because the Moon has no atmosphere"
  answer="1"
  explanation="Actuator quantization and deadbands create a minimum achievable correction. The controller can overshoot and reverse repeatedly, producing a limit cycle that a continuous-torque model never shows."
/>

## Resources

- Hughes, *Spacecraft Attitude Dynamics* — the standard rigid-body reference.
- Schaub & Junkins, *Analytical Mechanics of Space Systems* — Euler equations, quaternion feedback, and stability.
- Wie, *Space Vehicle Dynamics and Control* — control design with actuator limits.
- [NASA cFS](https://nasa.github.io/cFS/) — how attitude apps are structured in a flight software framework.

Next: [PID & LQR for attitude control](./control.md).
