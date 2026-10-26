---
title: Navigation, EKF & sensor fusion
description: Estimate position, velocity, attitude, and biases from noisy, asynchronous sensors.
---

# Navigation, EKF & sensor fusion

::: tip Why this matters
Guidance and control consume a state estimate, not the truth. If navigation is biased, delayed, overconfident, or inconsistent, the best controller in the world will fly the wrong trajectory with great precision. The extended Kalman filter (EKF) is the workhorse. You need to implement one, tune it, test its consistency, and recognize when it is lying.
:::

## Learning objectives

- Define a navigation state and the frames it lives in.
- Mechanize an IMU into position, velocity, and attitude.
- Write the EKF predict and update equations.
- Build measurement models for altimeter, radar, star tracker, and terrain-relative navigation.
- Check filter consistency with innovation and covariance tests.
- Handle asynchronous, delayed, and faulty measurements.

## What navigation has to estimate

A lunar descent navigation state commonly includes:

$$
\mathbf{x} = \begin{bmatrix}
\mathbf{r} & \mathbf{v} & q & \mathbf{b}_g & \mathbf{b}_a
\end{bmatrix},
$$

where:

- $\mathbf{r}$ is position in an inertial frame (MCI),
- $\mathbf{v}$ is inertial velocity,
- $q$ is attitude (body-to-inertial or inertial-to-body),
- $\mathbf{b}_g$ is gyro bias,
- $\mathbf{b}_a$ is accelerometer bias.

The filter may also estimate scale factors, misalignments, altimeter bias, terrain-map offsets, or wind (not on the Moon, but relevant for Earth entry).

## IMU mechanization

A strapdown IMU measures specific force $\mathbf{f}_B$ and angular rate $\boldsymbol{\omega}_B$ in body axes. In an inertial frame:

$$
\dot{\mathbf{r}} = \mathbf{v},
\qquad
\dot{\mathbf{v}} = \mathbf{C}_{I\leftarrow B}\mathbf{f}_B + \mathbf{g}(\mathbf{r}),
\qquad
\dot q_{BI} = \frac{1}{2}q_{BI}\otimes\begin{bmatrix}0\\\boldsymbol{\omega}_B\end{bmatrix}.
$$

If you work in a rotating local frame (MCMF or ENU), add the Coriolis and centrifugal terms:

$$
\dot{\mathbf{v}}_{\text{rot}} = \mathbf{C}_{\text{rot}\leftarrow I}\mathbf{a}_I
- 2\boldsymbol{\omega}_{\text{rot}}\times\mathbf{v}_{\text{rot}}
- \boldsymbol{\omega}_{\text{rot}}\times(\boldsymbol{\omega}_{\text{rot}}\times\mathbf{r}_{\text{rot}})
- \dot{\boldsymbol{\omega}}_{\text{rot}}\times\mathbf{r}_{\text{rot}}.
$$

Most descent filters work in a local frame for numerical convenience and transform to inertial for gravity. Pick one and document it.

### Bias and noise

A simple IMU error model:

$$
\tilde{\mathbf{f}} = (1+s_a)\mathbf{f} + \mathbf{b}_a + \mathbf{n}_a,
\qquad
\tilde{\boldsymbol{\omega}} = (1+s_g)\boldsymbol{\omega} + \mathbf{b}_g + \mathbf{n}_g,
$$

where the biases random-walk:

$$
\dot{\mathbf{b}}_a = \mathbf{n}_{ba},
\qquad
\dot{\mathbf{b}}_g = \mathbf{n}_{bg}.
$$

The noise densities and bias instabilities come from the datasheet or, better, from calibration and Allan variance analysis.

## The EKF cycle

For a nonlinear system

$$
\dot{\mathbf{x}} = f(\mathbf{x},\mathbf{u}) + \mathbf{w},
\qquad
\mathbf{z} = h(\mathbf{x}) + \mathbf{v},
$$

the EKF linearizes about the current estimate.

**Predict:**

$$
\mathbf{x}^- = \mathbf{x} + f(\mathbf{x},\mathbf{u})\Delta t,
\qquad
\mathbf{P}^- = \mathbf{F}\mathbf{P}\mathbf{F}^T + \mathbf{Q}.
$$

**Update:**

$$
\mathbf{y} = \mathbf{z} - h(\mathbf{x}^-),
\qquad
\mathbf{S} = \mathbf{H}\mathbf{P}^-\mathbf{H}^T + \mathbf{R},
$$

$$
\mathbf{K} = \mathbf{P}^-\mathbf{H}^T\mathbf{S}^{-1},
\qquad
\mathbf{x} = \mathbf{x}^- + \mathbf{K}\mathbf{y},
$$

$$
\mathbf{P} = (\mathbf{I}-\mathbf{K}\mathbf{H})\mathbf{P}^-.
$$

Use the Joseph form for numerical stability:

$$
\mathbf{P} = (\mathbf{I}-\mathbf{K}\mathbf{H})\mathbf{P}^-(\mathbf{I}-\mathbf{K}\mathbf{H})^T
+ \mathbf{K}\mathbf{R}\mathbf{K}^T.
$$

The matrices:

- $\mathbf{F}$ is the state transition Jacobian,
- $\mathbf{H}$ is the measurement Jacobian,
- $\mathbf{Q}$ is the process noise covariance,
- $\mathbf{R}$ is the measurement noise covariance,
- $\mathbf{y}$ is the innovation,
- $\mathbf{S}$ is the innovation covariance.

## Attitude error state

Attitude is not a vector, so a naive EKF on quaternion components has a singular covariance. Use a multiplicative error state:

$$
q = \delta q(\delta\boldsymbol{\theta})\otimes\hat q,
$$

where $\delta\boldsymbol{\theta}$ is a small rotation. The filter estimates $\delta\boldsymbol{\theta}$ and injects it into the nominal quaternion after each update. The covariance block is 3×3, not 4×4.

A common 15-state error-state filter is:

```
δp (3), δv (3), δθ (3), δb_g (3), δb_a (3)
```

The details of the error-state dynamics depend on the frame and the quaternion convention. Derive them once, test them against a finite-difference linearization, and keep the derivation in the repository.

## Measurement models

| Sensor | Measurement | Model | Notes |
| --- | --- | --- | --- |
| **Altimeter** | Range to surface | $\rho = \|\mathbf{r}-\mathbf{r}_{\text{site}}\|$ or terrain intersection | Beam width, terrain height, dropout |
| **Radar velocimeter** | Relative velocity | $\mathbf{v}_{\text{rel}}\cdot\hat{\mathbf{n}}$ | Beam geometry, surface scattering |
| **Star tracker** | Attitude quaternion | $q_{\text{meas}} = q_{\text{true}}\otimes q_{\text{err}}$ | Latency, sun exclusion, lost-in-space |
| **Sun sensor** | Sun vector in body | $\mathbf{s}_B = \mathbf{C}_{BI}\mathbf{s}_I$ | Coarse, robust, eclipse |
| **TRN camera** | Position/attitude relative to map | Image features → map match | Map error, lighting, textureless terrain |
| **Lidar** | Range image / point cloud | Terrain intersection | Dust, power, data rate |
| **Optical flow** | Image velocity | Function of attitude, altitude, terrain | Scale ambiguity without range |

A measurement model must include the **frame**, the **time**, and the **validity**. A star tracker quaternion from 200 ms ago is not the current attitude.

## Consistency

A filter can be stable and wrong. Check consistency:

- **Normalized innovation squared (NIS):**
  $$
  \text{NIS}_k = \mathbf{y}_k^T\mathbf{S}_k^{-1}\mathbf{y}_k.
  $$
  For a consistent filter, NIS should follow a chi-square distribution with the measurement dimension.

- **Normalized estimation error squared (NEES):**
  $$
  \text{NEES}_k = \mathbf{e}_k^T\mathbf{P}_k^{-1}\mathbf{e}_k,
  $$
  where $\mathbf{e}$ is the error against truth. Use it in simulation, where truth is available.

- **Innovation whiteness:** plot the autocorrelation. Structured residuals mean the model is missing something.
- **Covariance bounds:** check that the true error stays inside the 1σ/2σ/3σ envelopes.

If the filter is overconfident, it will reject good measurements. If it is underconfident, it will follow bad ones. Both are dangerous.

## Asynchronous and delayed measurements

Sensors update at different rates. A practical pattern:

1. **Buffer** measurements with their timestamps.
2. **Propagate** the filter to the measurement time.
3. **Update** with the measurement.
4. **Re-propagate** to the current time if needed.

For delayed measurements, either:

- keep a short history of states and covariances and update at the correct time, then replay the propagation, or
- augment the state with the delay and estimate it, or
- use a fixed-lag smoother.

Do not simply apply an old measurement at the current time and pretend it is fresh. That is a bias injection scheme.

## Fault detection and isolation

Navigation faults are inevitable. Use:

- **innovation gating:** reject measurements with NIS above a threshold,
- **residual monitoring:** persistent bias or noise increase,
- **redundancy:** compare redundant sensors (two IMUs, star tracker + sun sensor),
- **model checks:** altitude versus terrain, velocity versus range rate,
- **timing checks:** stale data, timestamp jumps, sequence gaps,
- **covariance inflation:** if the filter is lost, inflate $\mathbf{P}$ instead of trusting a collapsed estimate.

A gating threshold that is too tight rejects valid measurements; too loose accepts faults. Tune it against Monte Carlo and fault-injection tests.

## A 1D example

State $[h, v, b_a]^T$, input specific force $f$, measurement altimeter range $h$:

```python
# Predict
h = h + v*dt
v = v + (f - b_a - g)*dt
b_a = b_a
F = np.array([[1, dt, -0.5*dt*dt],
              [0,  1, -dt],
              [0,  0,  1]])
P = F @ P @ F.T + Q

# Update with altimeter
y = z - h
S = P[0,0] + R
K = P[:,0] / S
x = x + K*y
P = (np.eye(3) - np.outer(K, [1,0,0])) @ P
```

Then:

- add a bias random walk,
- add a radar velocity measurement,
- check NIS,
- run a Monte Carlo and plot the 3σ envelope,
- inject an altimeter dropout and see whether the filter survives.

## Practice

1. Implement the 1D EKF above and run it against a truth sim with noise.
2. Plot the estimate, the 3σ envelope, and the NIS. Is the filter consistent?
3. Add a 100 ms delayed altimeter. Compare the naive update with a buffered update.
4. Add a bias step in the accelerometer. Does the filter estimate it? How long does it take?
5. Inject a stuck altimeter. Tune a gate that rejects it without rejecting valid data.

<Quiz
  question="Your EKF’s position error stays inside 3σ, but the NIS is consistently far above the chi-square expectation. What is the most likely issue?"
  options="The filter is perfectly consistent|The measurement noise model or innovation covariance is too small, or the model is missing a bias|The quaternion is scalar-last|The sample rate is too high"
  answer="1"
  explanation="NIS tests the innovation against its predicted covariance. A persistent high NIS usually means R is too small, Q is too small, or the model is missing an error source. The estimate can still look acceptable while the filter is overconfident."
/>

## Resources

- Crassidis & Junkins, *Optimal Estimation of Dynamic Systems* — the standard estimation reference.
- Brown & Hwang, *Introduction to Random Signals and Applied Kalman Filtering* — practical and readable.
- [Kalman and Bayesian Filters in Python](https://github.com/rlabbe/Kalman-and-Bayesian-Filters-in-Python) — free, code-first.
- [NASA SPICE](https://naif.jpl.nasa.gov/naif/) — frames, time, and ephemerides for truth models.
- [Allan variance](https://www.nist.gov/publications/handbook-frequency-stability-analysis) — IMU noise characterization.

Next: [powered descent guidance](./powered-descent.md).
