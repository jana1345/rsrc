---
title: Glossary
description: The vocabulary of lunar GNC and flight software, defined in one line each with links to the deeper lessons.
---

# Glossary

Terms are grouped by first letter. Where a term has a full lesson, the link is included. Definitions are deliberately short; the lesson is where the nuance lives.

## A

**Abort** — A commanded termination of the nominal mission, with a defined target state (orbit, divert site, or safe mode). An abort is only real if the vehicle has the delta-v, time, and authority to execute it.

**Accelerometer** — An inertial sensor that measures specific force (acceleration minus gravity). It does not measure gravity directly; a stationary accelerometer reads the reaction to gravity.

**Actuator** — Any device that converts a command into a physical effect: thruster, engine, gimbal, reaction wheel, valve. Actuators have deadbands, latency, saturation, and failure modes.

**ADCS / AOCS** — Attitude Determination and Control System / Attitude and Orbit Control System. The subsystem that estimates and controls orientation, and sometimes orbit.

**Allan variance** — A time-domain method for characterizing sensor noise (bias instability, random walk) as a function of averaging time. Use it to set filter process noise.

**APID** — Application Process Identifier. An 11-bit field in a CCSDS space packet that identifies the source or type of data.

**Apolune** — The farthest point from the Moon in a lunar orbit (the lunar equivalent of apogee).

**Argument of periapsis** — The angle from the ascending node to periapsis, measured in the orbit plane. Denoted $\omega$.

**Attitude** — The orientation of the body frame relative to a reference frame. Represented by a quaternion, rotation matrix, or Euler angles.

**Autonomy** — The vehicle's ability to make and execute decisions without ground intervention. Required for lunar descent because of light time and one-shot timing.

## B

**Ballistic** — Motion under gravity alone, with no thrust or aerodynamic force. A ballistic trajectory is the baseline against which guidance is measured.

**Bias** — A constant or slowly varying offset in a sensor measurement. Estimate it in the navigation filter or it becomes a navigation error.

**Body frame** — A coordinate frame fixed to the vehicle, with axes defined by the vehicle geometry. Body rates and inertia are expressed here.

**Burn** — A propulsive maneuver. Impulsive burns are short relative to the orbit period; finite burns are not.

## C

**cFS** — Core Flight System. NASA's reusable flight-software framework of applications and services. See [NASA cFS](../flight/cfs.md).

**CCSDS** — Consultative Committee for Space Data Systems. The standards body behind space packets, telemetry frames, and SpaceWire-adjacent protocols. See [CCSDS & SpaceWire](../flight/ccsds-spacewire.md).

**CMG** — Control Moment Gyroscope. A momentum-exchange attitude actuator that gimbals a spinning rotor. Rare on small landers, common on large spacecraft.

**CoM** — Center of Mass. The point about which translation and rotation decouple. It moves as propellant is consumed.

**Covariance** — A matrix describing the uncertainty and correlation of state estimates. The diagonal holds variances; the off-diagonals hold correlations.

**CR3BP** — Circular Restricted Three-Body Problem. A model of motion under two massive bodies and a small third. Relevant to transfers and NRHO, not the terminal descent loop.

**Cross-range** — The horizontal distance perpendicular to the nominal ground track. Cross-range error is expensive to correct late.

## D

**DCM** — Direction Cosine Matrix. Another name for a rotation matrix.

**Deadband** — A range around the target in which no control action is taken, used to avoid chattering. Too wide causes drift; too narrow wears actuators.

**DEM** — Digital Elevation Model. A gridded terrain model used for targeting, hazard detection, and terrain-relative navigation.

**Deorbit** — The burn that lowers periapsis into the atmosphere or terrain, committing the vehicle to descent.

**Delta-v ($\Delta v$)** — The integral of thrust acceleration over mass, with units of velocity. The currency of mission design.

**Divergence** — A filter or controller instability in which the error grows without bound. In navigation, often caused by a bad model or unmodeled bias.

**DSN** — Deep Space Network. NASA's ground antenna network for deep-space communication.

**Dust** — Lunar regolith fines mobilized by the engine plume. Causes sensor obscuration, abrasion, and false optical returns.

## E

**EDAC** — Error Detection and Correction. Memory or logic that detects and corrects bit errors, often single-bit correction and double-bit detection.

**EDL** — Entry, Descent, and Landing. On the Moon there is no entry, so the relevant part is descent and landing (D&L), though the acronym is often borrowed.

**EKF** — Extended Kalman Filter. A Kalman filter linearized about the current estimate. Standard for lunar navigation. See [navigation](../gnc/navigation.md).

**Ephemeris** — A time-indexed table or model of a body's position and velocity (Sun, Earth, Moon, stars).

**Epoch** — The reference time at which a state or frame orientation is defined.

**Escape velocity** — The speed at which total specific energy is zero: $v_{\text{esc}}=\sqrt{2\mu/r}$. At the lunar surface, about 2.376 km/s.

## F

**FDIR** — Fault Detection, Isolation, and Recovery. The logic that decides something is wrong, identifies what, and reconfigures. See [fault protection](../flight/fault-protection.md).

**Filter** — An estimator that combines a model prediction with noisy measurements. The Kalman filter is the canonical example.

**Frame** — A coordinate system: origin, axes, and conventions. A vector without a frame is not a state. See [frames & time](../gnc/frames-time.md).

**FSW** — Flight Software. The software that runs on the vehicle, as distinct from ground software or test software.

**Fault tree** — A top-down logic diagram linking a top-level failure to contributing causes. Useful for structuring FDIR evidence.

## G

**Gimbal** — A pivoted mount that allows a thrust vector to be steered. A gimbal offset or stuck gimbal is a control fault.

**GMAT** — General Mission Analysis Tool. A free NASA trajectory design and optimization tool.

**GN&C / GNC** — Guidance, Navigation, and Control. Guidance decides where to go, navigation estimates where you are, control makes the vehicle follow.

**Gravity loss** — Delta-v spent fighting gravity because thrust is not perfectly aligned with the desired velocity change. Roughly $g\,t_{\text{burn}}$ in the worst case.

**Gravity turn** — A trajectory in which the thrust vector rotates with the velocity vector, using gravity to help shape the path. On the Moon it is a guidance shape, not an aerodynamic effect.

**Ground track** — The path of the vehicle's sub-point over the surface, usually in a body-fixed frame.

**Gyro** — A rate gyro measures angular rate. It drifts; the drift is estimated by the navigation filter. See [sensors & actuators](../flight/sensors-actuators.md).

## H

**HIL** — Hardware-in-the-Loop. A test where real flight hardware runs against a simulated plant and environment. See [SIL & HIL](../test/sil-hil.md).

**Horizon** — The visible boundary between surface and sky. On the Moon, the horizon is closer and sharper than on Earth because of the smaller radius and lack of atmosphere.

**Hyperbola** — An unbound conic with $e>1$ and positive specific energy. A lunar flyby or escape trajectory.

## I

**IMU** — Inertial Measurement Unit. A package of accelerometers and gyros, often with redundant axes and internal calibration.

**Inclination** — The angle between the orbit plane and the reference plane. Denoted $i$.

**Inertia tensor** — The 3×3 matrix relating angular momentum to angular velocity. Depends on mass distribution and changes with propellant.

**Inertial frame** — A frame that is non-accelerating and non-rotating, or close enough for the problem. For lunar work, a Moon-centred inertial frame is usually treated as inertial.

**Innovation** — The difference between a measurement and the filter's predicted measurement: $\mathbf{y}=\mathbf{z}-H\hat{\mathbf{x}}^-$. Its statistics are the main filter health check.

**Integration** — The numerical solution of differential equations. Fixed-step RK4 is common offline; flight code uses bounded, deterministic methods.

## K

**Kalman filter** — A recursive estimator for linear Gaussian systems. The EKF linearizes; the UKF uses sigma points; the particle filter uses samples.

**Keplerian** — Relating to a two-body conic orbit described by Kepler's laws.

## L

**LEO** — Low Earth Orbit. The starting point for a lunar transfer, typically 200–400 km altitude.

**LLO** — Low Lunar Orbit. Typically 50–200 km altitude; fast ($\sim1.6$ km/s) and short-period ($\sim2$ h). See [orbital mechanics](../mission/orbital-mechanics.md).

**LQR** — Linear Quadratic Regulator. An optimal state-feedback controller minimizing a quadratic cost. See [PID & LQR](../gnc/control.md).

**LOS** — Line of Sight. The direct path between two points, relevant to communications, sensors, and star-tracker occultation.

## M

**Mascon** — Mass concentration. A lunar gravity anomaly, especially under the near-side maria, that perturbs low orbits.

**MCI** — Moon-Centered Inertial. A frame with origin at the Moon's centre and axes fixed in inertial space.

**MCMF** — Moon-Centered, Moon-Fixed. A frame rotating with the Moon, used for surface targets and ground tracks. Also called a body-fixed lunar frame.

**MEKF** — Multiplicative Extended Kalman Filter. An attitude filter that estimates a small rotation error and applies it multiplicatively to a reference quaternion, keeping the covariance 3×3.

**Mission elapsed time (MET)** — Time since a mission-defined epoch, often the start of the simulation or launch. Distinct from UTC and from the onboard clock.

**Monte Carlo** — Repeated simulation with sampled uncertainties, used to estimate probability distributions. See [Monte Carlo analysis](../gnc/monte-carlo.md).

## N

**Nadir** — The direction from the vehicle toward the centre of the body below it. The opposite of zenith.

**NASA** — National Aeronautics and Space Administration. The source of cFS, NPR 7150.2, and most of the public references in this guide.

**NIS** — Normalized Innovation Squared. A scalar test statistic for filter consistency: $\mathbf{y}^TS^{-1}\mathbf{y}$.

**Nominal** — The reference case with no failures and expected dispersions. "Nominal" is not "guaranteed."

**NPR 7150.2** — NASA's software engineering requirements document. Defines software classes and lifecycle evidence. See [NPR 7150.2](../flight/npr-7150.md).

**NRHO** — Near-Rectilinear Halo Orbit. A highly elliptical lunar orbit used by some architectures, especially for the Gateway. Not a descent orbit.

## O

**Observability** — The property that a state can be inferred from measurements. An unobservable bias cannot be estimated no matter how good the filter.

**Orbit determination (OD)** — The process of estimating an orbit from tracking data. Distinct from the onboard navigation filter, though the math is related.

## P

**PDI** — Powered Descent Initiation. The point at which the lander commits to the powered descent. See [powered descent](../gnc/powered-descent.md).

**Periapsis** — The closest point on an orbit to the central body.

**PID** — Proportional–Integral–Derivative control. The workhorse controller. See [PID & LQR](../gnc/control.md).

**Plane change** — A maneuver that changes orbital inclination. Cost is $2v\sin(\Delta i/2)$.

**Plume–surface interaction (PSI)** — The interaction between the engine exhaust and the lunar surface, including dust ejection, cratering, and optical obscuration. See [lunar environment](../mission/lunar-environment.md).

## Q

**Quaternion** — A four-parameter attitude representation $[x,y,z,w]$ with a unit-norm constraint. No singularities, but a double cover: $q$ and $-q$ are the same attitude. See [quaternions](../gnc/quaternions.md).

## R

**RCS** — Reaction Control System. Small thrusters used for attitude control, translation, and ullage. RCS authority is limited; plan for it.

**Regolith** — The layer of fragmented rock, dust, and glass covering the lunar surface. Abrasive, electrostatically charged, and a serious engineering environment.

**Residual** — The difference between a model prediction and a measurement, or between commanded and achieved state. A residual is evidence; log it.

**RK4** — Fourth-order Runge–Kutta. A fixed-step integrator with $O(\Delta t^4)$ local error. Common in simulation, less common in flight code.

**RTOS** — Real-Time Operating System. A scheduler and services with bounded timing. Examples: VxWorks, RTEMS, FreeRTOS. See [RTOS](../flight/rtos.md).

## S

**Safe mode** — A defined, tested state with safe attitude, engine off, minimum power, telemetry, and commanding. Not "do nothing."

**Sample rate** — The frequency at which a signal is measured or a loop is executed. It sets the Nyquist limit and the phase margin.

**SCLK** — Spacecraft Clock. The onboard time counter, with a correlation to UTC maintained by the ground.

**SIL** — Software-in-the-Loop. A test where the flight software runs against a simulated plant, usually on a host or target without real hardware. See [SIL & HIL](../test/sil-hil.md).

**Six-DOF** — Six degrees of freedom: three translational and three rotational. A 6DOF simulation models both. See [6DOF simulation](../gnc/sixdof.md).

**Slew** — A commanded rotation from one attitude to another, usually rate- and acceleration-limited.

**SpaceWire** — A high-speed serial link standard for spacecraft data handling, with routers, packets, and deterministic transfer.

**Specific impulse ($I_{sp}$)** — Thrust per unit weight flow: $I_{sp}=T/(\dot{m}g_0)$. Higher is more efficient. Units are seconds.

**State vector** — The set of variables that fully describes the system at a time: position, velocity, attitude, rates, mass, biases, and possibly more.

**Star tracker** — An optical sensor that identifies star patterns to determine attitude. Accurate but sensitive to blinding and occultation.

## T

**TAI** — International Atomic Time. A continuous time scale without leap seconds; often the base for spacecraft time correlation.

**Telemetry** — Data transmitted from the vehicle to the ground. Bandwidth is finite; choose channels deliberately.

**Terrain-relative navigation (TRN)** — Navigation that compares sensor data (camera, lidar) to a terrain map or to relative features to estimate position.

**TLI** — Trans-Lunar Injection. The burn that sends a spacecraft from Earth orbit toward the Moon.

**TNW** — Tangential–Normal–Binormal frame. An orbit-relative frame useful for maneuvers and trajectory analysis.

**TWR** — Thrust-to-Weight Ratio. $T/(mg)$. TWR < 1 cannot lift off; TWR near 1 leaves little control authority.

## U

**UTC** — Coordinated Universal Time. Civil time with leap seconds. Spacecraft time is usually correlated to UTC but runs on its own clock.

## V

**V&V** — Verification and Validation. Verification asks "did we build it right?"; validation asks "did we build the right thing?" See [V&V](../test/verification.md).

**Vacuum** — The near-absence of atmosphere. On the Moon, roughly $10^{-10}$ Pa at the surface.

**Variance** — The square of standard deviation. Add variances for independent error sources; add covariances when errors are correlated.

**Vis-viva** — The equation $v^2=\mu(2/r-1/a)$ relating speed to radius and semi-major axis.

## W

**Watchdog** — A timer that resets or safes the system if software fails to service it within a deadline. A watchdog without a tested recovery path is a reboot loop.

**Waypoint** — An intermediate target in a guidance plan. Waypoints turn a complex trajectory into a sequence of simpler segments.

## Y

**Yaw, pitch, roll** — A 3-2-1 Euler sequence, usually about the body z, y, and x axes respectively. Convenient for humans, hazardous for math near gimbal lock.

## Z

**Zenith** — The direction directly away from the centre of the body, opposite nadir. Local vertical is the line between nadir and zenith.

---

Missing a term? Add it with a one-line definition and a link, and keep the list alphabetical. A glossary that is not maintained becomes a source of disagreement.

Next: [resources](./resources.md) or [formula sheet](./formulas.md).
