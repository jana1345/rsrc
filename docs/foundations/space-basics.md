---
title: Space & lunar mission basics
description: Orbits, delta-v, the rocket equation, and the phases of a lunar landing mission.
---

# Space & lunar mission basics

::: tip Why this matters
You cannot debug a descent guidance command if you do not know what the numbers mean. This page gives you the minimum physics and mission vocabulary for the rest of the guide. It is deliberately shallow on orbital mechanics; the [mission page](../mission/orbital-mechanics.md) goes deeper where a lander FSW engineer actually needs it.
:::

## Learning objectives

By the end of this page you should be able to:

- Explain why a lunar lander must brake propulsively.
- Use the rocket equation to estimate a delta-v budget.
- Compute a circular orbit velocity and period for the Moon.
- Describe the phases from launch to touchdown and name the software that owns each phase.
- Explain TWR, hover throttle, and the suicide-burn intuition.

## The Moon in numbers

| Quantity | Value | Why you care |
| --- | --- | --- |
| Mean radius | 1,737.4 km | Altitude, terrain, and orbit geometry |
| Mass | $7.342 \times 10^{22}$ kg | Gravity and orbit period |
| Standard gravitational parameter $\mu$ | $4{,}902.8\ \text{km}^3/\text{s}^2$ | Every orbit equation |
| Surface gravity | $1.62\ \text{m/s}^2$ | Descent dynamics and TWR |
| Mean Earth–Moon distance | 384,400 km | Communications delay, transfer design |
| One-way light time | ~1.28 s | Teleoperation is not real-time control |
| Sidereal day | 27.32 Earth days | Lighting and thermal cycles |
| Synodic day | 29.53 Earth days | Sun angle over a landing site |
| Surface temperature | roughly −173 °C to +127 °C | Electronics, sensors, thermal design |

The Moon is not a small Earth. There is no atmosphere, no GPS, no magnetic field, and no rescue. The gravity field is lumpy, the lighting is harsh, and the surface is covered in abrasive dust.

## Orbits in one page

For a two-body problem, the gravitational parameter is $\mu = GM$. The circular orbit speed at radius $r$ is

$$
v_c = \sqrt{\frac{\mu}{r}},
$$

and the period is

$$
T = 2\pi\sqrt{\frac{r^3}{\mu}}.
$$

At 100 km altitude above the Moon, $r = 1{,}837.4$ km:

$$
v_c = \sqrt{\frac{4902.8}{1837.4}} \approx 1.63\ \text{km/s},
\qquad
T \approx 118\ \text{min}.
$$

The escape speed at the surface is $\sqrt{2\mu/R} \approx 2.38$ km/s. These are the numbers behind “low lunar orbit” and “lunar escape.” If you remember one thing, remember that orbital velocity is **fast** and changing it is expensive.

The vis-viva equation gives speed anywhere on a conic:

$$
v^2 = \mu\left(\frac{2}{r} - \frac{1}{a}\right).
$$

It is the fastest way to sanity-check a maneuver or an STK report.

## Rocket equation and delta-v

The rocket equation is

$$
\Delta v = I_{sp} g_0 \ln\left(\frac{m_0}{m_f}\right),
$$

where $I_{sp}$ is specific impulse in seconds, $g_0 = 9.80665\ \text{m/s}^2$, and $m_0/m_f$ is the wet-to-dry mass ratio. For a lander with $I_{sp}=311$ s and a mass ratio of 2:

$$
\Delta v = 311 \times 9.80665 \times \ln(2) \approx 2.11\ \text{km/s}.
$$

That is the scale of a lunar descent budget. Real budgets add gravity losses, steering losses, hover time, reserves, and aborts. A “1.7 km/s descent” quickly becomes 2.0 km/s of required capability.

> **Flight-software lens:** delta-v is not just a mission-design number. It becomes a propellant budget, a mass estimate, a throttle schedule, and eventually a fault-protection limit. If the software does not know the remaining budget, it cannot decide when to abort.

## Mission phases

A lunar lander mission is a chain of very different control problems:

| Phase | What happens | Software owner |
| --- | --- | --- |
| **Launch and ascent** | Leave Earth, reach a parking orbit | Launch vehicle GNC |
| **Trans-lunar injection (TLI)** | Raise apogee toward the Moon | Mission design / upper stage |
| **Coast** | Travel to the Moon, small trajectory corrections | Navigation, mission ops |
| **Lunar orbit insertion (LOI)** | Brake into lunar orbit | Orbit control |
| **Orbit phasing** | Adjust altitude and timing over the landing site | Orbit control / guidance |
| **Powered descent initiation (PDI)** | Start the landing burn, typically from ~15 km | Descent GNC |
| **Braking** | Remove most horizontal velocity | Guidance + control |
| **Approach** | Manage position and attitude over the target | Guidance + navigation |
| **Terminal descent** | Slow to touchdown, avoid hazards | Guidance + hazard detection |
| **Touchdown and safing** | Contact, engine cutoff, safe the vehicle | FSW / fault protection |

The exact altitude and timeline depend on the vehicle and the orbit. Apollo’s LM started powered descent around 15 km with a velocity of roughly 1.7 km/s. Commercial landers use different profiles, but the shape is similar: a long braking phase, a controlled approach, and a slow terminal descent.

## Powered descent in one paragraph

With no atmosphere, every meter per second must be removed by the engine. The thrust acceleration is $a_T = F/m$. The lander’s thrust-to-weight ratio is

$$
\text{TWR} = \frac{F}{m g_{\text{moon}}}.
$$

At TWR = 1 the lander can hover but cannot arrest a descent. Above 1 it can decelerate. Below 1 gravity wins. A “suicide burn” is the limiting case: delay the burn until the last possible moment, then use maximum thrust to reach zero velocity exactly at the surface. It is efficient and unforgiving. Real missions use a more conservative profile with margin for navigation error, throttle limits, and aborts.

> **The core control insight:** with a fixed engine, thrust points along the body axis. Rotating the lander redirects thrust. Killing horizontal velocity is therefore an attitude problem as much as a throttle problem.

## Flight-software lens

Every phase above is a mode with:

- a **guard** (when may we enter?),
- a **controller** (what do we command?),
- an **exit condition** (when do we leave?),
- a **fault response** (what if a sensor lies?).

The FSW job is to make those modes deterministic, testable, and safe when the inputs are wrong. That is why this guide spends so much time on frames, state estimation, and mode logic rather than only on physics.

## Practice

1. **TWR.** A lander has mass 12,000 kg and maximum thrust 180 kN. What is its TWR at the Moon? What throttle gives TWR = 1?
2. **Hover throttle.** At mass 9,000 kg and thrust 150 kN maximum, what throttle holds a hover?
3. **Delta-v.** Estimate the delta-v for a 3,000 kg wet lander with a 1,500 kg dry mass and $I_{sp}=320$ s.
4. **Sanity check.** A 100 km circular lunar orbit has a period near 118 minutes. Why does a 200 km orbit take longer?

<details>
<summary>Answers</summary>

1. $F/(mg) = 180{,}000/(12{,}000 \times 1.62) \approx 9.26$. Hover throttle is $1/9.26 \approx 10.8\%$ of max thrust.
2. $mg = 9{,}000 \times 1.62 = 14{,}580$ N, so throttle is $14.58/150 \approx 9.7\%$.
3. $\Delta v = 320 \times 9.80665 \times \ln(2) \approx 2.17$ km/s.
4. Larger radius means longer circumference and lower speed; $T \propto r^{3/2}$.

</details>

<Quiz
  question="A lander arrives at PDI with TWR = 1.0. What is the immediate consequence?"
  options="It can hover and choose when to descend|It cannot arrest its descent and will continue falling|It has more delta-v than needed|It must immediately throttle down"
  answer="1"
  explanation="TWR = 1 cancels gravity but provides no net upward acceleration. With a downward velocity, the lander cannot stop without reducing mass or increasing thrust."
/>

## Resources

- Vallado, *Fundamentals of Astrodynamics and Applications* — the standard reference for orbit geometry and time systems.
- NASA, *Apollo Experience Report: Lunar Module Guidance and Control* — the classic descent narrative.
- [NASA Lunar Reconnaissance Orbiter](https://lro.gsfc.nasa.gov/) — topography, gravity, and lighting data.
- [JPL Horizons](https://ssd.jpl.nasa.gov/horizons/) — ephemerides for sanity checks.
- [NASA SPICE](https://naif.jpl.nasa.gov/naif/) — the toolkit behind most mission geometry.

Next: [frames & time primer](./frames-primer.md) or [lunar environment](../mission/lunar-environment.md).
