---
title: Quaternions & attitude representations
description: Compose, rotate, integrate, and debug attitude without memorizing a derivation.
---

# Quaternions & attitude representations

::: tip Why this matters
Attitude is the difference between “thrust this way” and “thrust somewhere else.” Quaternions are the standard flight representation because they have no gimbal lock, compose cleanly, and interpolate smoothly. They also have more conventions than almost any other four numbers in engineering. This page gives you the working rules and the tests that catch the traps.
:::

## Learning objectives

- Explain what a quaternion represents and why it is a unit vector in 4D.
- Compose, invert, and apply quaternions to vectors.
- Convert between quaternion, DCM, Euler angles, and axis-angle.
- Integrate attitude from body rates and normalize correctly.
- Recognize Hamilton vs JPL, scalar-first vs scalar-last, and active vs passive conventions.
- Debug the five most common quaternion failures.

## What a quaternion is

A unit quaternion represents a rotation by angle $\theta$ about a unit axis $\hat{\mathbf{n}}$:

$$
q = \begin{bmatrix}\cos(\theta/2)\\ \hat{\mathbf{n}}\sin(\theta/2)\end{bmatrix}
= \begin{bmatrix}w\\ x\\ y\\ z\end{bmatrix},
\qquad \|q\| = 1.
$$

The half-angle is not a typo. A rotation by $2\pi$ gives $q = [-1,0,0,0]$, which is the same physical rotation as $q = [1,0,0,0]$. This is why $q$ and $-q$ represent the same attitude.

We will use **scalar-first Hamilton** convention in this page:

```
q = [w, x, y, z]
```

Many libraries use scalar-last (`x, y, z, w`), and JPL uses a different sign convention for the vector part. The numbers are not interchangeable. Write the convention next to every quaternion in your code and interfaces.

## Composition and rotation

If $q_{BA}$ maps frame $A$ to frame $B$, and $q_{CB}$ maps $B$ to $C$, then

$$
q_{CA} = q_{CB} \otimes q_{BA}.
$$

Composition is **right-to-left**, like matrix multiplication. The Hamilton product is

$$
q \otimes p =
\begin{bmatrix}
w_q w_p - \mathbf{v}_q\cdot\mathbf{v}_p\\
w_q\mathbf{v}_p + w_p\mathbf{v}_q + \mathbf{v}_q\times\mathbf{v}_p
\end{bmatrix}.
$$

The inverse of a unit quaternion is its conjugate:

$$
q^{-1} = q^* = [w, -x, -y, -z].
$$

To rotate a vector, treat it as a pure quaternion $[0,\mathbf{v}]$:

$$
\mathbf{v}' = q \otimes [0,\mathbf{v}] \otimes q^{-1}.
$$

In code, use a library or a tested helper. Do not hand-expand the product in every module.

## DCM conversion

For $q = [w,x,y,z]$ representing a body-to-inertial (active) rotation, the DCM is

$$
\mathbf{C} =
\begin{bmatrix}
1-2(y^2+z^2) & 2(xy-wz) & 2(xz+wy)\\
2(xy+wz) & 1-2(x^2+z^2) & 2(yz-wx)\\
2(xz-wy) & 2(yz+wx) & 1-2(x^2+y^2)
\end{bmatrix}.
$$

Check the convention: this matrix maps a body vector to inertial. If your library maps inertial to body, you need the transpose. The fastest way to settle it is a 90° rotation about a known axis.

## Attitude kinematics

For $q_{BI}$ (body-to-inertial) and body angular rate $\boldsymbol{\omega}_B$:

$$
\dot q_{BI} = \frac{1}{2} q_{BI} \otimes \begin{bmatrix}0\\ \boldsymbol{\omega}_B\end{bmatrix}.
$$

A first-order update is

$$
q_{k+1} = q_k + \frac{\Delta t}{2} q_k \otimes \begin{bmatrix}0\\ \boldsymbol{\omega}_k\end{bmatrix},
\qquad q_{k+1} \leftarrow \frac{q_{k+1}}{\|q_{k+1}\|}.
$$

This is adequate for small $\|\boldsymbol{\omega}\|\Delta t$. For large rotations or high rates, use the exponential map or a higher-order integrator. Always normalize; numerical drift is real.

If your quaternion maps inertial to body, the sign and order of the rate term change. Write the convention in the header comment and test it with a constant-rate rotation.

## Euler angles and gimbal lock

The 3-2-1 sequence (yaw $\psi$, pitch $\theta$, roll $\phi$) has a singularity at $\theta = \pm 90^\circ$, where yaw and roll become coupled. This is gimbal lock. It is a representation problem, not a physical one.

Use Euler angles for:

- operator displays,
- command entry,
- documentation,
- test-case descriptions.

Use quaternions or DCMs for:

- the flight attitude state,
- control error computation,
- sensor fusion,
- interpolation.

## Interpolation: slerp

To interpolate between two attitudes, use spherical linear interpolation:

$$
q(t) = \frac{\sin((1-t)\Omega)}{\sin\Omega}q_0
+ \frac{\sin(t\Omega)}{\sin\Omega}q_1,
\qquad \cos\Omega = q_0\cdot q_1.
$$

If $q_0\cdot q_1 < 0$, negate one quaternion first to take the short path. Without that check, the vehicle can spin the long way around for a purely cosmetic reason.

## The five convention traps

1. **Scalar order.** `[w,x,y,z]` vs `[x,y,z,w]`. Three.js uses `(x,y,z,w)`; many GNC libraries use scalar-first.
2. **Hamilton vs JPL.** The vector part sign differs. Mixing them produces a rotation in the opposite direction.
3. **Active vs passive.** Rotating the vector vs rotating the frame. They are inverses.
4. **Composition order.** $q_{CB}\otimes q_{BA}$ is not $q_{BA}\otimes q_{CB}$.
5. **Frame direction.** Is $q$ body-to-inertial or inertial-to-body? The kinematics sign depends on it.

A sixth, quieter trap: **normalization**. A quaternion that drifts off the unit sphere slowly changes the effective rotation and can blow up a DCM conversion. Normalize after every integration step and after every interpolation.

## A small C++ value type

```cpp
#include <array>
#include <cmath>

struct Quat {
    double w{1}, x{0}, y{0}, z{0};

    Quat operator*(const Quat& q) const {
        return {
            w*q.w - x*q.x - y*q.y - z*q.z,
            w*q.x + x*q.w + y*q.z - z*q.y,
            w*q.y - x*q.z + y*q.w + z*q.x,
            w*q.z + x*q.y - y*q.x + z*q.w
        };
    }

    double norm() const { return std::sqrt(w*w + x*x + y*y + z*z); }

    Quat normalized() const {
        const double n = norm();
        return {w/n, x/n, y/n, z/n};
    }

    Quat conjugate() const { return {w, -x, -y, -z}; }
};
```

Test it with a 90° rotation about each axis, composition with the inverse, and a constant-rate integration.

## Practice

1. Implement quaternion multiplication, conjugate, normalization, and vector rotation.
2. Rotate $(1,0,0)$ by 90° about $z$. Verify the result is $(0,1,0)$.
3. Compose a 90° yaw with a 90° pitch. Compare the result to applying the rotations in the opposite order. Explain the difference.
4. Integrate a constant body rate of 0.1 rad/s about $x$ for 10 s. Compare the final quaternion to the analytic half-angle result.
5. Convert quaternion → DCM → quaternion and check that you recover $q$ or $-q$.
6. Feed a quaternion from Three.js into your C++ code. Find and fix the scalar-order bug.

<Quiz
  question="Two quaternions represent the same physical attitude. Which statement is correct?"
  options="They must have identical components|They may differ by an overall sign, q and −q|They must be scalar-first|They must have zero scalar part"
  answer="1"
  explanation="A unit quaternion and its negative encode the same rotation because the rotation angle is 2π different. Normalize, but do not treat the sign as a physical difference."
/>

## Resources

- Schaub & Junkins, *Analytical Mechanics of Space Systems* — quaternion kinematics and attitude control.
- Hughes, *Spacecraft Attitude Dynamics* — rigid-body and momentum behavior.
- [Three.js Quaternion](https://threejs.org/docs/#api/en/math/Quaternion) — a useful scalar-last implementation to compare against.
- [Eigen Quaternion](https://eigen.tuxfamily.org/dox/classEigen_1_1Quaternion.html) — scalar-order documentation and conversions.
- [NASA SPICE rotations](https://naif.jpl.nasa.gov/pub/naif/toolkit_docs/C/req/rotation.html) — frame and rotation conventions.

Next: [rigid-body attitude dynamics](./attitude-dynamics.md).
