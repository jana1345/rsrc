---
title: Powered descent guidance
description: From PDI to touchdown — phases, guidance laws, throttle, attitude, and abort logic.
---

# Powered descent guidance

::: tip Why this matters
Powered descent is the mission. With no atmosphere, every meter per second must be removed by the engine, and the last hundred meters are unforgiving. Guidance turns a desired landing site into a thrust and attitude command; the flight software has to make that command safe, observable, and testable.
:::

## Learning objectives

- Describe the phases from PDI to touchdown and the handoff between them.
- Write the 3DOF point-mass equations used for guidance design.
- Compare gravity-turn, polynomial, Apollo-style, and optimal guidance.
- Convert a guidance acceleration command into throttle and attitude.
- Identify the constraints that make a descent feasible.
- Design abort, divert, and hazard-response logic.
- Explain what Monte Carlo and navigation error do to the last hundred meters.

## The descent timeline

| Phase | Typical altitude | Job | Dominant risk |
| --- | --- | --- | --- |
| **PDI / braking** | ~15 km | Remove most horizontal velocity | Engine performance, navigation drift |
| **Approach** | ~1–3 km | Establish a controlled trajectory over the site | Guidance handoff, sensor validity |
| **Terminal descent** | ~100 m | Slow to touchdown, avoid hazards | Altimeter/TRN, dust, slope |
| **Touchdown** | 0 m | Contact, engine cutoff, safing | Contact detection, tip-over, plume |

The boundaries are mission-specific. Apollo’s LM started powered descent around 15 km at roughly 1.7 km/s. Commercial landers use different profiles, but the structure is the same: a long braking phase, a controlled approach, and a slow terminal descent.

## The 3DOF model

For guidance design, a point-mass model is often enough:

$$
\dot{\mathbf{r}} = \mathbf{v},
\qquad
\dot{\mathbf{v}} = \frac{\mathbf{T}}{m} + \mathbf{g},
\qquad
\dot m = -\frac{\|\mathbf{T}\|}{I_{sp}g_0}.
$$

The thrust vector $\mathbf{T}$ has magnitude $T\in[T_{\min},T_{\max}]$ and direction constrained by the attitude and gimbal limits. The gravity vector $\mathbf{g}$ points toward the Moon’s center (or uses a higher-fidelity model).

The thrust-to-weight ratio is

$$
\text{TWR} = \frac{T}{mg}.
$$

At TWR < 1, the vehicle cannot hover; at TWR = 1, it can hover but not decelerate; above 1, it can arrest a descent.

## Guidance laws

### Gravity turn / constant attitude

A simple braking phase points the thrust vector opposite the velocity and burns at high throttle. It is easy to implement and inefficient for precise targeting. It is useful for a first simulation, not for a real landing.

### Polynomial guidance

Choose a position profile $\mathbf{r}(t)$ that satisfies boundary conditions:

$$
\mathbf{r}(0)=\mathbf{r}_0,\quad
\dot{\mathbf{r}}(0)=\mathbf{v}_0,\quad
\ddot{\mathbf{r}}(0)=\mathbf{a}_0,
$$

$$
\mathbf{r}(T)=\mathbf{r}_f,\quad
\dot{\mathbf{r}}(T)=\mathbf{v}_f,\quad
\ddot{\mathbf{r}}(T)=\mathbf{a}_f.
$$

A fifth-order polynomial in each axis satisfies six conditions. Differentiate twice to get the commanded acceleration, then subtract gravity to get the thrust acceleration:

$$
\mathbf{a}_T = \ddot{\mathbf{r}}_{\text{cmd}} - \mathbf{g}.
$$

The thrust magnitude and direction follow:

$$
T = m\|\mathbf{a}_T\|,
\qquad
\hat{\mathbf{t}} = \frac{\mathbf{a}_T}{\|\mathbf{a}_T\|}.
$$

Polynomial guidance is intuitive and easy to test. It can demand infeasible thrust or attitude, so you must check the command against the actuator limits. Recomputing the polynomial every cycle (or every guidance cycle) makes it a closed-loop law, not a one-shot open-loop plan.

### Apollo-style guidance

Apollo’s lunar descent guidance used a polynomial/thrust-acceleration formulation with explicit control of the braking and approach phases. The details are in the Apollo experience reports. The engineering lessons matter more than the exact equations:

- guidance and navigation are tightly coupled,
- the crew could redesignate the landing point,
- manual takeover was part of the design,
- the last phase had explicit altitude/velocity gates,
- fuel margin was a first-class constraint.

### Optimal guidance

Minimum-fuel powered descent is an optimal control problem with a nonconvex thrust constraint. Lossless convexification and successive convexification are modern approaches that turn it into a solvable convex problem. They are powerful, but they add solver timing, feasibility, and verification burdens.

For a flight-software role, you should be able to explain:

- what the cost function is,
- what the constraints are,
- why the problem is hard,
- how the solver is verified,
- what happens when it fails to converge.

You do not need to implement a convex solver for your first lander.

## From acceleration to throttle and attitude

The guidance law outputs a desired thrust vector $\mathbf{T}_{\text{cmd}}$. The flight software must convert it into:

- **throttle:** $T_{\text{cmd}}/\|\mathbf{T}_{\max}\|$, clamped to the engine’s throttle range,
- **attitude:** the body axis that points along $\mathbf{T}_{\text{cmd}}$,
- **gimbal:** if the engine can gimbal, allocate the remaining torque,
- **RCS:** attitude control and any translational augmentation.

The attitude command is a direction, not a full attitude. You need a rule for the remaining roll about the thrust axis. That rule should come from sensor fields of view, thermal constraints, communication, or landing-gear geometry.

## Constraints that decide feasibility

A descent is not feasible just because the polynomial connects the endpoints. Check:

- **thrust bounds:** $T_{\min}\le T\le T_{\max}$; minimum throttle may be high.
- **throttle rate:** the engine cannot slew instantaneously.
- **attitude limits:** tilt relative to vertical, line-of-sight, antenna, plume.
- **gimbal limits:** thrust vector authority.
- **fuel:** reserve for hover, divert, and abort.
- **time:** thermal, power, communications, crew/ground timelines.
- **terrain:** slope, rocks, craters, hazards.
- **navigation uncertainty:** the landing ellipse, not the point.
- **plume:** surface interaction, visibility, ejecta.
- **one-shot:** no refueling, no rescue.

A guidance law that ignores these is a trajectory generator, not a landing system.

## Terminal descent and hazard avoidance

The last hundred meters are dominated by sensing:

- altimeter/radar range and velocity,
- lidar or camera terrain-relative navigation,
- hazard detection (rocks, slopes, craters),
- dust and plume effects,
- contact detection.

A typical terminal sequence:

1. **Brake** to a low vertical speed at a safe altitude.
2. **Hover or slow descent** while scanning the landing zone.
3. **Divert** to a safer point if a hazard is detected.
4. **Descend** at a controlled rate.
5. **Cut off** the engine at contact or at a low altitude, depending on the design.
6. **Safe** the vehicle and report touchdown.

Hazard detection is a perception problem with a hard real-time deadline. The flight software needs a bounded processing time, a clear “no hazard”/“hazard”/“unknown” output, and a behavior for each.

## Abort and one-shot logic

A one-shot landing changes the risk calculus. In terminal descent, an abort may be impossible or may require a divert to a safer site. Design the logic explicitly:

- **Abort to orbit** (if the vehicle has the delta-v and time),
- **Divert** to a secondary landing site,
- **Hover** to buy time (fuel-limited),
- **Safe mode** (if the vehicle can survive),
- **Continue** with a degraded sensor (only if the evidence supports it).

Each option needs a trigger, a time budget, a fuel budget, and a test. “Abort” is not a single action.

## Navigation error and Monte Carlo

Guidance is only as good as the state estimate. The landing dispersions come from:

- initial state error,
- IMU bias and scale factor,
- altimeter/TRN error,
- actuator misalignment and throttle error,
- mass/inertia uncertainty,
- guidance truncation and solver error,
- timing jitter.

Run the closed loop with realistic navigation. A guidance law that lands perfectly with truth state is not evidence. The Monte Carlo report should show the landing ellipse, touchdown velocity distribution, fuel margin, and the sensitivity to each error source.

## A 1D suicide-burn check

For a constant maximum thrust acceleration $a_T$ and gravity $g$, starting at vertical speed $v_0$ (downward) and altitude $h_0$, the minimum altitude to stop is

$$
h_{\text{stop}} = \frac{v_0^2}{2(a_T-g)}.
$$

If $h_0 < h_{\text{stop}}$, the vehicle cannot stop even at maximum thrust. This is the simplest feasibility check you can write, and it is a good unit test for a guidance mode.

## Practice

1. Implement a 1D guidance law that commands throttle to reach zero velocity at zero altitude. Add a fuel limit and a minimum throttle.
2. Implement a fifth-order polynomial for a 2D descent. Check the commanded thrust against limits.
3. Convert the thrust vector to a throttle and a body attitude. Add a tilt limit.
4. Add a 50 m hazard-avoidance divert at 100 m altitude. How much fuel does it cost?
5. Run a 100-case Monte Carlo with navigation error. Plot the landing ellipse and the touchdown velocity distribution.

<Quiz
  question="A polynomial guidance law commands a thrust vector that exceeds the engine’s maximum. What should the flight software do?"
  options="Ignore the limit; the polynomial is mathematically correct|Clamp the command and let the guidance/control logic handle the infeasibility, with a defined mode/fault response|Increase the engine’s maximum thrust in software|Switch to open-loop control"
  answer="1"
  explanation="The command must be checked against actuator limits. Clamping alone is not enough; the system needs a defined response (re-plan, divert, abort, or fault) and evidence that the response is safe."
/>

## Resources

- NASA, *Apollo Experience Report: Lunar Module Guidance and Control* — the classic descent case study.
- Klumpp, “Apollo Lunar Descent Guidance,” *Automatica* (1974) — the polynomial guidance formulation.
- Açıkmeşe & Ploen, “Convex Programming Approach to Powered Descent Guidance for Mars Landing,” *JGCD* (2007) — lossless convexification.
- [NASA Lunar Landing Trajectory Design](https://ntrs.nasa.gov/) — search for powered descent and hazard avoidance.
- [SCiPy](https://scipy.org/) and [CVXPY](https://www.cvxpy.org/) — prototyping tools, not flight code.

Next: [GNC architecture & interfaces](./architecture.md).
