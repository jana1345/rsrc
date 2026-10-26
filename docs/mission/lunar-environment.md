---
title: Lunar environment
description: Gravity, vacuum, dust, lighting, thermal extremes, and plume-surface interaction — and what each one changes in flight software.
---

# Lunar environment

::: tip Why this matters
Every model in your flight software encodes an assumption about the environment. A lunar lander operates in a place where gravity is lumpy, there is no atmosphere to tell you your altitude, the sun moves slowly but the shadows are absolute, and the last 30 metres are a blizzard of abrasive dust. None of these are background facts. They are requirements, sensor models, and failure modes.
:::

## Learning objectives

By the end of this page you should be able to:

- State the lunar physical constants that appear in GNC code, with units.
- Explain why the lunar gravity field is not a point mass and where that matters.
- Describe how the lack of atmosphere changes navigation, control, and touchdown.
- Explain the lighting, thermal, and dust environment in terms of sensor and software behavior.
- Describe plume–surface interaction and its effect on terminal descent.
- Translate each environmental effect into a model, a test, or a requirement.

## The numbers you will hard-code

| Quantity | Symbol | Value | Where it appears |
| --- | --- | --- | --- |
| Gravitational parameter | $\mu$ | $4{,}902.800\ \text{km}^3/\text{s}^2$ | Orbit propagation, vis-viva |
| Mean radius | $R$ | $1{,}737.4\ \text{km}$ | Altitude, terrain, horizon |
| Surface gravity (mean) | $g$ | $1.624\ \text{m/s}^2$ | Plant model, hover throttle |
| Rotation rate | $\omega$ | $2.6617 \times 10^{-6}\ \text{rad/s}$ | Body-fixed frames, Coriolis |
| Sidereal period | — | $27.3217\ \text{days}$ | Lighting, thermal, frame orientation |
| Synodic period | — | $29.5306\ \text{days}$ | Sun angle at a fixed site |
| Escape velocity at surface | $v_{esc}$ | $2.376\ \text{km/s}$ | Mission design sanity check |
| Solar constant at 1 AU | $S$ | $1361\ \text{W/m}^2$ | Thermal and power |
| One-way light time (mean) | — | $1.28\ \text{s}$ | Teleoperation and commanding |
| Axial tilt to ecliptic | — | $1.54°$ | Illumination geometry |

Use $g_0 = 9.80665\ \text{m/s}^2$ only for specific impulse and rocket-equation bookkeeping. Do not use it as lunar gravity. A depressingly common bug is a plant model that quietly uses Earth gravity because someone copied a template.

::: warning Units
Write the unit in the variable name or the type. `altitude_m`, `rate_mps`, `accel_mps2`, `angle_rad`. A one-line comment is cheaper than a lost mission, and it survives refactoring.
:::

## Gravity is not a point mass

The Moon's gravity field is dominated by the point-mass term, but it has strong anomalies called **mascons** (mass concentrations) beneath the near-side maria. The standard model is a spherical-harmonic expansion:

$$
U(r,\phi,\lambda) = \frac{\mu}{r}\left[1 - \sum_{n=2}^{N}\left(\frac{R}{r}\right)^n J_n P_n(\sin\phi) + \text{tesseral and sectoral terms}\right].
$$

For a lander, three levels of fidelity are useful:

| Fidelity | Model | Use |
| --- | --- | --- |
| **0** | Point mass, constant $g$ | Quick sims, controller tuning, unit tests |
| **1** | Point mass, inverse-square $g(r)$ | Descent from 15 km; cheap and usually adequate |
| **2** | Spherical harmonic to degree/order 20–100 | Orbit propagation, long coast, precise targeting |
| **3** | High-degree gravity plus terrain | Offline analysis, not flight code |

At 15 km altitude the difference between constant $g$ and inverse-square $g$ is small but not zero: $g(r) = \mu/r^2$ changes by about 1.7% between the surface and 15 km. Over a 10-minute descent that is a real altitude error. Use $g(r)$ in the plant even if the controller assumes constant $g$.

A useful practical rule: **propagate with the best model you have; guide and control with the simplest model that meets the error budget.** The gap between them is a modeled disturbance, and the navigation filter should absorb it.

### What mascons do to a low orbit

A low lunar orbit is not Keplerian. The argument of periapsis and the node drift, and the eccentricity oscillates. Frozen orbits exist at specific inclinations (roughly 27°, 50°, 76°, and 86°) where the dominant perturbations cancel over a period. This matters if your mission coasts in LLO before PDI: the state at PDI is not the state you would get from a two-body propagator, and the time of arrival at a given ground point shifts.

For flight software, the practical consequences are:

- The navigation filter needs process noise that reflects the real acceleration uncertainty.
- The guidance target should be defined relative to the **surface**, not an inertial point, so gravity-model error does not accumulate into a miss.
- Timeline and propellant budgets need margin for orbit-determination updates.

## No atmosphere

The Moon has a surface-bound exosphere with a pressure around $10^{-10}$ Pa — effectively vacuum. There is no drag, no lift, no aerodynamic heating, and no aerodynamic control. That sounds simple, and it is, until you notice what the atmosphere normally gives you:

| On Earth | On the Moon |
| --- | --- |
| Drag helps decelerate | All deceleration is propulsive |
| Pressure altitude is a backup | No pressure altimeter |
| Terminal velocity limits impact speed | Nothing limits impact speed |
| Wind and gusts disturb attitude | No wind, but thrust and RCS dominate |
| Aerodynamic heating sets entry design | Radiative environment sets thermal design |
| Sound carries | No acoustic cues; everything is telemetry |

The absence of drag means **delta-v is the entire budget**. It also means a failed engine is not partially compensated by drag; the vehicle falls at whatever vertical velocity it had, plus gravity.

For software, the important consequences are:

1. **Altitude must be measured or estimated, never inferred from pressure.** Radar, laser, lidar, or optical terrain-relative navigation are the options, and each has a different failure mode.
2. **Descent is a controlled fall.** The guidance law must explicitly manage vertical velocity versus altitude. There is no natural floor.
3. **Propellant margins are life.** A 2% guidance inefficiency is not a performance note; it is a reserve decision.
4. **Touchdown velocity is a hard constraint.** Typical robotic limits are 1–3 m/s vertical and under 1 m/s horizontal, with attitude limits; crewed vehicles are tighter on attitude and contact dynamics.

## Lighting and the lunar day

The Moon rotates once per 27.32 days relative to the stars. A site spends about 14.75 Earth days in sunlight and 14.75 in darkness. The sun moves across the sky at roughly 0.55° per hour — about 13° per Earth day. Compare that with Earth's 15° per hour.

That slow motion creates two very different operational problems:

- **Long shadows.** Near the terminator, terrain shadows extend for kilometres. A landing site can be lit at one minute and in shadow minutes later as the sun angle changes.
- **Extreme contrast.** Sunlit regolith is bright; shadowed terrain is nearly black. Cameras have to cope with a dynamic range that is hostile to simple thresholding.
- **No atmospheric scattering.** Shadows are sharp, the sky is black, and there is no diffuse fill light. Optical navigation that relies on feature contrast can lose features in shadow.

For the flight software:

- **Lighting is a scheduling input.** If the mission requires visual landing, the PDI time is constrained by sun elevation at the site.
- **Star trackers can be blinded** by the sun or by stray light from the vehicle. Attitude determination needs a sun-avoidance rule and a recovery path.
- **Cameras need exposure and gain logic** that does not saturate on sunlit terrain. Auto-exposure is a control loop with its own dynamics; it can lag a fast descent.
- **Shadow detection is a hazard.** A dark region can be a shadow, a crater, or a hole. Terrain-relative navigation must not treat "no texture" as "flat ground."

## Thermal environment

Without an atmosphere, heat transfer is radiative. The surface temperature swings from roughly $-173\ ^\circ\text{C}$ at night to $+127\ ^\circ\text{C}$ at noon. A spacecraft in sunlight absorbs solar flux, reflects albedo from the surface, and radiates to a cold sky; in shadow it radiates to an even colder sink.

The consequences for GNC and FSW are indirect but real:

- **Sensor bias drifts with temperature.** An IMU bias model that is constant over a 30-minute descent is wrong. Characterize bias versus temperature, or estimate it.
- **Propellant and pressurant temperatures affect performance.** Thrust and mass flow are not perfectly constant.
- **Electronics have survival and operating limits.** The flight computer may need heater control, and heater state changes power margins.
- **Thermal snap** — a sudden change when a component enters or leaves sunlight — can cause transient sensor errors.

Design the filter to estimate at least gyro and accelerometer bias, and test with a time-varying bias, not just a constant one. Log temperatures alongside sensor data so that ground analysis can correlate anomalies.

## Dust and regolith

The lunar surface is covered in **regolith**: fragmented rock and glass, with a median grain size around 70 µm and a broad distribution of finer dust. The fine fraction is abrasive, clingy, and electrostatically charged. It gets everywhere.

During landing, the engine plume mobilizes dust. This is **plume–surface interaction (PSI)**. At low altitude the plume excavates and ejects material at high velocity, which can:

- sandblast the vehicle and optics,
- coat radiators and solar arrays,
- obscure cameras and lidar,
- create a false horizon or false terrain features,
- change the local surface geometry under the vehicle,
- produce a bright dust cloud that saturates optical sensors.

Apollo crews reported dust causing loss of visual references near touchdown. Dust and plume effects have also degraded navigation confidence on robotic landings. This is not a nuisance; it is a terminal-phase design driver.

### Software responses

| Response | What it looks like |
| --- | --- |
| **Sensor gating** | Reject lidar/optical returns with implausible range or intensity during high-dust conditions |
| **Dead-reckoning fallback** | Coast on IMU plus last good terrain fix for a bounded time |
| **Velocity-based touchdown** | Use inertial velocity and a contact sensor, not optical height, for the final metres |
| **Dust model in test** | Inject false returns, dropouts, and intensity spikes in SIL/HIL |
| **Conservative final approach** | Arrive with low horizontal velocity so a short blindness is survivable |
| **Plume-aware guidance** | Limit thrust near the surface or accept a shallower deceleration profile |

The key architectural decision: **do not let a single optical sensor own the terminal phase.** Fuse it, bound its influence, and define the behavior when it disagrees with inertial navigation.

## Terrain and landing-site hazards

A safe landing site is not just "flat." Hazards include:

- slopes above the vehicle's tilt limit,
- boulders and crater rims,
- scarps and pits,
- soft or uncompacted regolith,
- shadowed regions with poor visibility.

Terrain-relative navigation (TRN) compares camera or lidar data to a digital elevation model (DEM). Its accuracy depends on the map, the illumination, and the viewpoint. A DEM error of 10 m is a 10 m navigation error unless the filter models it.

For FSW, terrain introduces:

- **map-frame definitions** (which DEM, which epoch, which datum),
- **hazard detection latency**,
- **go/no-go logic** with a divert option,
- **a clear authority split** between autonomous hazard avoidance and ground command.

## Communications

The Moon is close enough for near-real-time commanding but far enough that teleoperation is not control. One-way light time is about 1.28 s at mean distance, so a command-response loop is at least 2.5 s. During a descent that takes 10–15 minutes, this rules out a human in the inner loop.

Consequences:

- **Autonomy is mandatory** for descent, touchdown, and safing.
- **Ground can monitor and abort**, but the abort must be executable by the vehicle.
- **Telemetry bandwidth is finite.** You cannot log everything at full rate; choose engineering channels deliberately.
- **Store-and-forward** is needed for high-rate data around occultation or link margins.

## Radiation and the space environment

The lunar surface is outside the magnetosphere for most of its orbit. Sources include galactic cosmic rays, solar particle events, and secondary neutrons from the regolith. For electronics, this means single-event effects: bit flips, latch-ups, and potentially destructive failures.

Software responses:

- **EDAC or checksums** on memory and critical tables,
- **periodic scrubbing** of memory,
- **watchdogs and lockstep** where the processor supports it,
- **safe copies** of critical state,
- **telemetry to detect and characterize** events.

You do not need to design the hardware, but you need to know why flight software has memory protection, why a single-bit flip in a mode variable is a real scenario, and why "just reboot" is a design decision with a time cost.

## Putting it together: environment → requirement

| Environment | Software artifact | Test |
| --- | --- | --- |
| Lumpy gravity | $g(r)$ plant, process noise, surface-relative target | Propagate with a high-fidelity model, compare to flight model |
| No atmosphere | Radar/lidar/optical altitude, propulsive guidance | Sensor dropout and false-return injection |
| Long shadows | Lighting constraint on PDI time, camera exposure logic | Image test set at low sun elevation |
| Thermal swings | Time-varying IMU bias, heater logic | Bias drift over a thermal profile |
| Dust/PSI | Sensor gating, dead-reckoning fallback, contact-based touchdown | Dust plume model in SIL |
| Terrain | DEM frame, hazard detection, divert | Map error and hazard false-negative tests |
| Light time | Autonomous mode logic, onboard abort | Command latency injection |
| Radiation | EDAC, scrubbing, watchdogs, safe state | Single-event fault injection |

::: tip Flight-software lens
When you read a requirement like "the lander shall achieve touchdown with vertical velocity below 2 m/s," ask: measured how, at what sample rate, with what latency, and what happens if the measurement is wrong? The environment is what makes those questions hard.
:::

## Practice

1. **Gravity sensitivity.** Write a 1D propagator using constant $g = 1.62$ and one using $g(r) = \mu/r^2$. Start at 15 km with zero vertical velocity and integrate for 600 s without thrust. Plot the altitude difference. Explain why the constant-$g$ model falls short.
2. **Lighting budget.** For a site at 20°S, estimate the sun elevation change over a 12-minute descent. Does the lighting condition at PDI still hold at touchdown?
3. **Dust blindness test.** Add a "dust" mode to your sim that drops the altimeter for the last 20 s and injects ±8 m range noise. Does your guidance still reach a survivable touchdown velocity? What do you need to change?
4. **Thermal bias.** Give the gyro a bias that drifts linearly by 0.05°/s over the descent. Run your EKF with and without bias estimation. Compare attitude error at touchdown.
5. **Requirement writing.** Write three requirements derived from this page, each with a verification method.

<Quiz
  question="Why is a pressure altimeter useless on a lunar lander?"
  options="Because the Moon's gravity is too low for pressure to vary|Because the Moon has effectively no atmosphere, so there is no pressure gradient to measure|Because pressure sensors are too heavy for lunar missions|Because the Moon's magnetic field interferes with pressure sensors"
  answer="1"
  explanation="The lunar exosphere is roughly 10^-10 Pa. There is no atmosphere to produce a pressure-altitude relationship, so altitude must come from radar, laser, lidar, optical terrain-relative navigation, or inertial propagation."
/>

<Quiz
  question="A guidance team proposes using a single downward-looking camera as the sole altitude source below 100 m. What is the strongest objection?"
  options="Cameras are too low-resolution for 100 m|Plume-driven dust and shadows can blind or corrupt the measurement exactly when it matters most|Cameras cannot be used in vacuum|The camera frame is not inertial"
  answer="1"
  explanation="Terminal descent is when plume–surface interaction, dust, and hard shadows are worst. A single optical source with no inertial fallback and no fault detection is a single point of failure in the most unforgiving phase."
/>

## Resources

- [NASA Lunar Reconnaissance Orbiter](https://lunar.gsfc.nasa.gov/) — topography, gravity, and imaging data.
- [NASA GSFC Lunar Gravity Model](https://pgda.gsfc.nasa.gov/products/78) — spherical-harmonic gravity products.
- [Apollo Lunar Surface Journal](https://www.nasa.gov/history/alsj/) — crew observations, including dust and landing issues.
- [NASA Systems Engineering Handbook](https://www.nasa.gov/connect/ebooks/nasa-systems-engineering-handbook/) — turning environment into requirements.
- [Lunar Sourcebook](https://www.lpi.usra.edu/publications/books/lunar_sourcebook/) — regolith, thermal, and surface properties.

Next: [orbital mechanics for landing](./orbital-mechanics.md).
