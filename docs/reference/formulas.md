---
title: Formula sheet
description: The equations, constants, and conventions used across the lunar FSW field guide, with units and common traps.
---

# Formula sheet

A working reference, not a derivation. Every entry states its assumptions. If you use a formula outside those assumptions, you own the error.

::: warning Conventions
- **Quaternions** are scalar-last: $q = [x, y, z, w]$, matching three.js.
- **Rotation matrices** are active and map a vector from the body frame to the reference frame: $\mathbf{v}^{R} = R_{R\leftarrow B}\mathbf{v}^{B}$.
- **Angles** are radians unless a degree symbol appears.
- **Time** is seconds unless stated. Mission time has an epoch and a scale.
- **Specific impulse** $I_{sp}$ is in seconds; use $g_0 = 9.80665\ \text{m/s}^2$ only for the rocket equation.
:::

## Physical constants

| Constant | Symbol | Value | Notes |
| --- | --- | --- | --- |
| Standard gravity | $g_0$ | $9.80665\ \text{m/s}^2$ | Definition, not local gravity |
| Speed of light | $c$ | $299{,}792{,}458\ \text{m/s}$ | Exact |
| Gravitational constant | $G$ | $6.67430\times10^{-11}\ \text{m}^3\,\text{kg}^{-1}\,\text{s}^{-2}$ | CODATA |
| Lunar gravitational parameter | $\mu_{\text{Moon}}$ | $4.902800\times10^{12}\ \text{m}^3/\text{s}^2$ | $= 4{,}902.8\ \text{km}^3/\text{s}^2$ |
| Lunar mean radius | $R_{\text{Moon}}$ | $1{,}737.4\ \text{km}$ | Mean; terrain varies by km |
| Lunar surface gravity | $g_{\text{Moon}}$ | $1.624\ \text{m/s}^2$ | Mean; varies with terrain and mascons |
| Lunar rotation rate | $\omega_{\text{Moon}}$ | $2.6617\times10^{-6}\ \text{rad/s}$ | Sidereal |
| Lunar sidereal day | — | $27.3217\ \text{days}$ | $= 2\pi/\omega$ |
| Lunar synodic month | — | $29.5306\ \text{days}$ | Sun angle cycle |
| Earth gravitational parameter | $\mu_\oplus$ | $3.986004\times10^{14}\ \text{m}^3/\text{s}^2$ | For transfer work |
| Earth–Moon mean distance | — | $384{,}400\ \text{km}$ | Light time $1.28$ s |
| Astronomical unit | AU | $149{,}597{,}870.7\ \text{km}$ | Definition |
| Solar constant at 1 AU | $S_0$ | $1361\ \text{W/m}^2$ | At Earth, not the Moon |

### Unit conversions

| From | To | Multiply by |
| --- | --- | --- |
| degrees | radians | $\pi/180$ |
| radians | degrees | $180/\pi$ |
| km | m | $10^3$ |
| km/s | m/s | $10^3$ |
| hPa | Pa | $100$ |
| kgf | N | $9.80665$ |
| °/s | rad/s | $\pi/180$ |
| rpm | rad/s | $2\pi/60$ |
| g (Earth) | m/s² | $9.80665$ |

## Geometry and trigonometry

| Quantity | Formula |
| --- | --- |
| Vector norm | $\lVert\mathbf{v}\rVert = \sqrt{v_x^2+v_y^2+v_z^2}$ |
| Dot product | $\mathbf{a}\cdot\mathbf{b} = \lVert\mathbf{a}\rVert\lVert\mathbf{b}\rVert\cos\theta$ |
| Cross product magnitude | $\lVert\mathbf{a}\times\mathbf{b}\rVert = \lVert\mathbf{a}\rVert\lVert\mathbf{b}\rVert\sin\theta$ |
| Angle between vectors | $\theta = \operatorname{atan2}\left(\lVert\mathbf{a}\times\mathbf{b}\rVert,\ \mathbf{a}\cdot\mathbf{b}\right)$ |
| Rotation about unit axis $\hat{\mathbf{n}}$ | $\mathbf{v}' = \mathbf{v}\cos\theta + (\hat{\mathbf{n}}\times\mathbf{v})\sin\theta + \hat{\mathbf{n}}(\hat{\mathbf{n}}\cdot\mathbf{v})(1-\cos\theta)$ |
| Small-angle approximation | $\sin\theta \approx \theta$, $\cos\theta \approx 1-\theta^2/2$ |

Use `atan2` for angles. `acos` loses precision near 0 and 180° and cannot tell left from right.

## Frames and rotation matrices

### Elementary rotations

$$
R_x(\phi)=\begin{bmatrix}1&0&0\\0&\cos\phi&-\sin\phi\\0&\sin\phi&\cos\phi\end{bmatrix},
\quad
R_y(\theta)=\begin{bmatrix}\cos\theta&0&\sin\theta\\0&1&0\\-\sin\theta&0&\cos\theta\end{bmatrix},
\quad
R_z(\psi)=\begin{bmatrix}\cos\psi&-\sin\psi&0\\\sin\psi&\cos\psi&0\\0&0&1\end{bmatrix}.
$$

### Composition

For a 3-2-1 (yaw–pitch–roll) sequence:

$$
R = R_z(\psi)R_y(\theta)R_x(\phi).
$$

Matrix multiplication is not commutative. The order is part of the convention and must be documented.

### Inverse and transpose

Rotation matrices are orthonormal:

$$
R^{-1} = R^{T}, \qquad \det R = +1.
$$

To go the other way, transpose. Do not invert numerically unless you are debugging a non-orthonormal matrix.

### Earth-fixed to inertial (approximation)

For a body-fixed vector $\mathbf{r}_{F}$ and rotation rate $\omega$:

$$
\mathbf{r}_{I} = R_z(\theta_{\text{GHA}})\,\mathbf{r}_{F},
\qquad
\dot{\mathbf{r}}_{I} = \dot{\mathbf{r}}_{F} + \boldsymbol{\omega}\times\mathbf{r}_{F}.
$$

For the Moon, replace the rotation angle and rate with lunar values. "GHA" is replaced by the lunar body-fixed rotation angle at the epoch.

### Direction cosine matrix propagation

$$
\dot{R} = R\,[\boldsymbol{\omega}_{B}]_{\times},
\qquad
[\boldsymbol{\omega}]_{\times} =
\begin{bmatrix}0&-\omega_z&\omega_y\\ \omega_z&0&-\omega_x\\ -\omega_y&\omega_x&0\end{bmatrix}.
$$

This is the continuous-time attitude kinematics in matrix form. It is equivalent to the quaternion form below but has more states and needs re-orthonormalization.

## Quaternions

### Definition and normalization

$$
q = [x, y, z, w] = [\mathbf{v}\sin(\theta/2), \cos(\theta/2)],
\qquad
\lVert q\rVert = 1.
$$

The rotation angle is $\theta = 2\arccos(w)$ and the axis is $\hat{\mathbf{n}} = \mathbf{v}/\lVert\mathbf{v}\rVert$.

### Multiplication

With $q_1 = [\mathbf{v}_1, w_1]$ and $q_2 = [\mathbf{v}_2, w_2]$:

$$
q_1 \otimes q_2 =
\begin{bmatrix}
w_1\mathbf{v}_2 + w_2\mathbf{v}_1 + \mathbf{v}_1\times\mathbf{v}_2\\
w_1w_2 - \mathbf{v}_1\cdot\mathbf{v}_2
\end{bmatrix}.
$$

The order matters. $q_1\otimes q_2$ applies $q_2$ first, then $q_1$ when rotating a vector.

### Rotating a vector

$$
\mathbf{v}' = q\,\mathbf{v}\,q^{*},
\qquad
q^{*} = [-\mathbf{v}, w].
$$

### Quaternion to matrix (body to reference)

$$
R(q)=\begin{bmatrix}
1-2(y^2+z^2) & 2(xy-wz) & 2(xz+wy)\\
2(xy+wz) & 1-2(x^2+z^2) & 2(yz-wx)\\
2(xz-wy) & 2(yz+wx) & 1-2(x^2+y^2)
\end{bmatrix}.
$$

### Attitude kinematics

For body rates $\boldsymbol{\omega}_{B}$:

$$
\dot{q} = \frac{1}{2}q\otimes\begin{bmatrix}\boldsymbol{\omega}_{B}\\0\end{bmatrix}.
$$

In component form:

$$
\dot{x} = \tfrac{1}{2}(w\omega_x + y\omega_z - z\omega_y),
\quad
\dot{y} = \tfrac{1}{2}(w\omega_y + z\omega_x - x\omega_z),
$$
$$
\dot{z} = \tfrac{1}{2}(w\omega_z + x\omega_y - y\omega_x),
\quad
\dot{w} = -\tfrac{1}{2}(x\omega_x + y\omega_y + z\omega_z).
$$

Renormalize after integration. For a first-order step at rate $\omega$ over $dt$, the exact update is

$$
q_{k+1} = q_k \otimes \begin{bmatrix}\hat{\boldsymbol{\omega}}\sin(\lVert\boldsymbol{\omega}\rVert dt/2)\\ \cos(\lVert\boldsymbol{\omega}\rVert dt/2)\end{bmatrix}.
$$

### Quaternion error and sign

The relative rotation is $q_{\text{err}} = q_{\text{ref}}^{*}\otimes q$. Choose the sign so that $w \ge 0$; otherwise the controller takes the long way around. A common bug: two quaternions representing the same attitude with opposite signs produce a 360° error.

### Euler angles from a 3-2-1 matrix

$$
\phi = \operatorname{atan2}(R_{32}, R_{33}),\quad
\theta = -\arcsin(R_{31}),\quad
\psi = \operatorname{atan2}(R_{21}, R_{11}).
$$

Gimbal lock occurs at $\theta = \pm90°$. Do not use Euler angles as the primary attitude state.

## Rigid-body dynamics

### Newton–Euler

$$
m\dot{\mathbf{v}} = \mathbf{F},
\qquad
I\dot{\boldsymbol{\omega}} + \boldsymbol{\omega}\times(I\boldsymbol{\omega}) = \boldsymbol{\tau}.
$$

Both are written in an inertial frame for translation and in the body frame for rotation. Mixing them is a classic error.

### Mass flow and thrust

$$
\dot{m} = -\frac{T}{I_{sp}g_0},
\qquad
T = \dot{m}\,I_{sp}g_0.
$$

For a throttle fraction $u\in[0,1]$ and maximum thrust $T_{\max}$:

$$
T = uT_{\max}, \qquad \dot{m} = -\frac{uT_{\max}}{I_{sp}g_0}.
$$

### Rocket equation

$$
\Delta v = I_{sp}g_0\ln\left(\frac{m_0}{m_f}\right),
\qquad
\frac{m_0}{m_f} = \exp\left(\frac{\Delta v}{I_{sp}g_0}\right).
$$

### Inertia

For a point mass at distance $r$: $I = mr^2$. For a uniform solid cylinder of mass $m$, radius $r$, length $L$ about its axis: $I = \tfrac{1}{2}mr^2$. About a transverse axis through the centre: $I = \tfrac{1}{12}m(3r^2+L^2)$.

The inertia tensor is symmetric and positive definite. In the principal axes frame it is diagonal. If mass changes, inertia changes; if you ignore that, the controller gain is wrong at the end of the burn.

### Gravity

$$
\mathbf{g}(\mathbf{r}) = -\frac{\mu}{r^3}\mathbf{r},
\qquad
g(r) = \frac{\mu}{r^2}.
$$

At the lunar surface, $g = 1.624\ \text{m/s}^2$. At 15 km altitude, $g = 1.597\ \text{m/s}^2$.

### Hover and thrust-to-weight

$$
T_{\text{hover}} = mg,
\qquad
\text{TWR} = \frac{T_{\max}}{mg}.
$$

Hover throttle is $u_{\text{hover}} = 1/\text{TWR}$. A TWR of 2 means half throttle hovers; a TWR below 1 means the vehicle cannot leave the surface.

## Control

### PID

$$
u(t) = K_p e(t) + K_i\int_0^t e(\tau)\,d\tau + K_d\frac{de(t)}{dt}.
$$

Discrete form with sample time $\Delta t$:

$$
u_k = K_p e_k + K_i\Delta t\sum_{j=0}^{k}e_j + \frac{K_d}{\Delta t}(e_k-e_{k-1}).
$$

Use derivative-on-measurement to avoid derivative kick when the setpoint changes. Clamp the integral (anti-windup) and the output.

### Second-order response

For a canonical second-order system

$$
\ddot{y} + 2\zeta\omega_n\dot{y} + \omega_n^2 y = \omega_n^2 r,
$$

| Quantity | Formula |
| --- | --- |
| Natural frequency | $\omega_n$ |
| Damping ratio | $\zeta$ |
| Peak overshoot | $\exp\left(-\pi\zeta/\sqrt{1-\zeta^2}\right)$ |
| Settling time (2%) | $\approx 4/(\zeta\omega_n)$ |
| Rise time (10–90%) | $\approx 1.8/\omega_n$ for $\zeta\approx0.7$ |
| Phase margin | related to $\zeta$; roughly $\zeta \approx \text{PM}/100$ for PM in degrees |

A sampled controller needs $\omega_n \ll \omega_s/10$ as a starting rule, where $\omega_s = 2\pi f_s$. If the mode you are trying to control is near Nyquist, no gain tuning will save it.

### LQR

For $\dot{\mathbf{x}} = A\mathbf{x}+B\mathbf{u}$ and cost

$$
J = \int_0^\infty \left(\mathbf{x}^TQ\mathbf{x} + \mathbf{u}^TR\mathbf{u}\right)dt,
$$

the optimal gain is $K = R^{-1}B^TP$, where $P$ solves the continuous algebraic Riccati equation:

$$
A^TP + PA - PBR^{-1}B^TP + Q = 0.
$$

For discrete time, use the discrete Riccati equation and $u_k = -Kx_k$. Tune $Q$ and $R$ by units and priority, not by random search. Check closed-loop poles and actuator saturation.

### Discretization

| Method | Approximation | Note |
| --- | --- | --- |
| Forward Euler | $s \approx (z-1)/T_s$ | Can be unstable for fast poles |
| Backward Euler | $s \approx (z-1)/(zT_s)$ | Stable mapping, adds damping |
| Tustin (bilinear) | $s \approx \frac{2}{T_s}\frac{z-1}{z+1}$ | Good default; pre-warp if needed |
| ZOH | exact for a zero-order hold | Use when the plant model is available |

## Orbital mechanics

### Two-body motion

$$
\ddot{\mathbf{r}} = -\frac{\mu}{r^3}\mathbf{r},
\qquad
\varepsilon = \frac{v^2}{2}-\frac{\mu}{r},
\qquad
\mathbf{h} = \mathbf{r}\times\mathbf{v}.
$$

### Vis-viva

$$
v^2 = \mu\left(\frac{2}{r}-\frac{1}{a}\right).
$$

### Circular orbit

$$
v_c = \sqrt{\frac{\mu}{r}},
\qquad
T = 2\pi\sqrt{\frac{a^3}{\mu}}.
$$

### Escape

$$
v_{\text{esc}} = \sqrt{\frac{2\mu}{r}}.
$$

### Conic geometry

$$
r = \frac{p}{1+e\cos\nu},
\qquad
p = a(1-e^2),
\qquad
r_p = a(1-e),
\qquad
r_a = a(1+e).
$$

### Delta-v for a plane change

$$
\Delta v = 2v\sin\left(\frac{\Delta i}{2}\right).
$$

### Hohmann transfer (two impulses, coplanar circular orbits)

$$
\Delta v_1 = \sqrt{\frac{\mu}{r_1}}\left(\sqrt{\frac{2r_2}{r_1+r_2}}-1\right),
\qquad
\Delta v_2 = \sqrt{\frac{\mu}{r_2}}\left(1-\sqrt{\frac{2r_1}{r_1+r_2}}\right).
$$

$$
t_{\text{transfer}} = \pi\sqrt{\frac{a_t^3}{\mu}},
\qquad
a_t = \frac{r_1+r_2}{2}.
$$

### Descent rules of thumb

| Quantity | Formula | Note |
| --- | --- | --- |
| Free-fall time (constant $g$) | $t=\sqrt{2h/g}$ | No thrust |
| Impact speed (constant $g$) | $v=\sqrt{2gh}$ | No thrust |
| Stopping distance | $d = v^2/(2a)$ | Constant deceleration |
| Stopping delta-v | $\Delta v = \sqrt{2gh}$ | Minimum to hover at height $h$ |
| Hover delta-v cost | $\Delta v = g\,t$ | Per second of hover |
| Gravity loss (rough) | $\Delta v_g \approx g\,t_{\text{burn}}$ | Depends on thrust direction |

## Navigation and estimation

### Kalman filter

Predict:

$$
\hat{\mathbf{x}}^- = F\hat{\mathbf{x}} + B\mathbf{u},
\qquad
P^- = FPF^T + Q.
$$

Update:

$$
K = P^-H^T\left(HP^-H^T+R\right)^{-1},
$$
$$
\hat{\mathbf{x}} = \hat{\mathbf{x}}^- + K\left(\mathbf{z}-H\hat{\mathbf{x}}^-\right),
\qquad
P = (I-KH)P^-.
$$

### Innovation and consistency

$$
\mathbf{y} = \mathbf{z}-H\hat{\mathbf{x}}^-,
\qquad
S = HP^-H^T+R,
\qquad
\text{NIS} = \mathbf{y}^TS^{-1}\mathbf{y}.
$$

For a correctly tuned filter with $n$ measurements, the normalized innovation squared should have a mean near $n$. If NIS is consistently much larger, the filter is overconfident (too small $Q$ or $R$); if much smaller, it is underconfident. Test this over many runs, not one.

### Continuous propagation

$$
\dot{\mathbf{x}} = f(\mathbf{x},\mathbf{u}), \qquad
\dot{P} = FP+PF^T+Q.
$$

The state transition matrix over $\Delta t$ is approximately $F \approx I + A\Delta t$ for small steps, or use a matrix exponential for a linear system.

### Quaternion error for the filter

Use a small-angle error quaternion $\delta q \approx [\tfrac{1}{2}\delta\boldsymbol{\theta}, 1]$ and estimate the 3-vector $\delta\boldsymbol{\theta}$. This keeps the covariance 3×3 instead of 4×4 with a norm constraint.

### Sensor noise

| Quantity | Formula |
| --- | --- |
| Variance | $\sigma^2$ |
| Standard deviation | $\sigma$ |
| White-noise density | $Q_c$ with units of (unit)²/Hz |
| Discrete process noise | $Q \approx Q_c\,\Delta t$ for a simple random walk | Check the convention: some texts define $Q$ as a density, some as a per-step covariance |
| Averaging $N$ samples | $\sigma_{\text{avg}} = \sigma/\sqrt{N}$ |

Check the convention: some texts define $Q$ as a density, some as a per-step covariance. A factor of $\Delta t$ changes the tuning completely.

### Allan variance (sensor characterization)

For gyro bias instability and random walk, plot Allan deviation versus averaging time. The minimum of the curve gives the bias instability; the slope at long averaging times gives the random walk. Use it to set $Q$, not a guess from a datasheet.

## Statistics and Monte Carlo

| Quantity | Formula |
| --- | --- |
| Mean | $\bar{x} = \frac{1}{N}\sum x_i$ |
| Sample variance | $s^2 = \frac{1}{N-1}\sum (x_i-\bar{x})^2$ |
| Standard error of the mean | $\text{SE} = s/\sqrt{N}$ |
| 95% interval (normal) | $\bar{x}\pm1.96\,\text{SE}$ |
| Percentile | sort, then interpolate at rank $p(N-1)$ |
| $3\sigma$ coverage (normal, 1D) | $99.73\%$ |
| $3\sigma$ coverage (normal, 3D) | about $97.0\%$ for a chi-square with 3 degrees of freedom |

The last row is a common interview trap: a 3D position error inside a 3σ **radial** ellipsoid is not the same probability as a 1D 3σ. State which one you mean.

For a Monte Carlo with $N$ runs, the standard error of an estimated probability $p$ is $\sqrt{p(1-p)/N}$. To resolve a 1% failure probability with reasonable confidence, you need hundreds to thousands of runs, not 20.

## Propellant and mass

$$
m(t) = m_0 - \int_0^t \dot{m}(\tau)\,d\tau,
\qquad
\Delta v = \int \frac{T}{m}\,dt.
$$

For a constant thrust and mass flow:

$$
\Delta v = I_{sp}g_0\ln\left(\frac{m_0}{m_0-\dot{m}t}\right).
$$

Reserve fraction:

$$
\text{reserve} = \frac{m_{\text{prop,available}} - m_{\text{prop,required}}}{m_{\text{prop,required}}}.
$$

State whether the reserve is a percentage of the required propellant, the total load, or the landing mass. Teams routinely mean different things.

## Quick numerical checks

| Check | Expected |
| --- | --- |
| Circular speed at 100 km lunar altitude | $1.633\ \text{km/s}$ |
| Period at 100 km lunar altitude | $118\ \text{min}$ |
| Lunar surface circular speed | $1.680\ \text{km/s}$ |
| Lunar escape speed at surface | $2.376\ \text{km/s}$ |
| Free fall from 15 km (no thrust) | $137\ \text{s}$, impact $219\ \text{m/s}$ |
| Hover delta-v for 60 s | $97\ \text{m/s}$ |
| 1° plane change at 100 km | $28.5\ \text{m/s}$ |
| Gravity at 15 km altitude | $1.597\ \text{m/s}^2$ |
| Light time to the Moon (one way) | $1.28\ \text{s}$ |

Use these to catch unit errors before they reach a review.

<Quiz
  question="A teammate computes a 3D position error and says it is '3σ, so 99.73% of cases are inside.' What is wrong?"
  options="Nothing; 3σ is always 99.73%|99.73% is the 1D normal coverage; a 3D chi-square distribution has different coverage|3σ should be 95%|Position errors are never Gaussian"
  answer="1"
  explanation="For a single normally distributed scalar, ±3σ contains about 99.73%. For a 3D radial error with three independent components, the probability inside a 3σ sphere is about 97.0%. Always state the dimension and the distribution."
/>

<Quiz
  question="You change the control loop from 100 Hz to 20 Hz but keep the same continuous gains. What is the most likely result?"
  options="The loop becomes more stable because it updates less often|The phase margin drops and the loop may oscillate or go unstable because the sample rate is now close to the control bandwidth|The actuators produce more thrust|The quaternion norm drifts"
  answer="1"
  explanation="Sampling adds delay and phase lag. A loop designed for 100 Hz may have a crossover frequency too close to the new Nyquist frequency at 20 Hz. Discretize the controller for the actual rate and re-check margins."
/>

## Resources

- [Vallado, *Fundamentals of Astrodynamics and Applications*](https://www.springer.com/gp/book/9781881883142) — the reference for the orbital section.
- [NASA Reference Publication 1311: Quaternion FAQ](https://ntrs.nasa.gov/citations/19950005007) — conventions and pitfalls.
- [Schaub & Junkins, *Analytical Mechanics of Space Systems*](https://arc.aiaa.org/doi/book/10.2514/4.105210) — rigid-body dynamics and control.
- [Maybeck, *Stochastic Models, Estimation, and Control*](https://www.sciencedirect.com/book/9780124807016/stochastic-models-estimation-and-control) — the Kalman filter foundations.
- [NIST Engineering Statistics Handbook](https://www.itl.nist.gov/div898/handbook/) — Monte Carlo and interval interpretation.

Next: [glossary](./glossary.md) or [resources](./resources.md).
