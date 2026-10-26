---
title: PID & LQR for attitude control
description: Design a controller that works at the flight sample rate, with saturation and delay.
---

# PID & LQR for attitude control

::: tip Why this matters
Most GNC interviews will ask you to explain a control loop you built, why you chose the gains, what happened when the actuator saturated, and how you verified stability. PID and LQR are the two workhorses. You need to implement both, compare them, and know when each is the wrong tool.
:::

## Learning objectives

- Implement a discrete PID with anti-windup and derivative filtering.
- Derive and implement an LQR gain for a simple attitude model.
- Relate natural frequency, damping, bandwidth, and sample rate.
- Analyze saturation, delay, quantization, and rate limits.
- Test a controller with step, disturbance, and Monte Carlo cases.

## PID: the practical version

The textbook PID is

$$
u(t) = K_p e(t) + K_i\int e(\tau)\,d\tau + K_d\frac{de(t)}{dt}.
$$

The flight version has more parts:

$$
u_k = K_p e_k + K_i\sum_{j=0}^{k} e_j\Delta t + K_d\frac{e_k-e_{k-1}}{\Delta t}
$$

with:

- **output saturation** and **integrator anti-windup**,
- **derivative filtering** to avoid noise amplification,
- **setpoint weighting** to reduce derivative kick,
- **bumpless transfer** when modes change,
- **validity checks** on the error and the measurement.

A compact implementation:

```cpp
struct Pid {
    double kp{}, ki{}, kd{};
    double dt{0.01};
    double i{0};
    double prev_e{0};
    double out_min{-1}, out_max{1};
    double tau_d{0.05};      // derivative filter time constant

    double step(double e) {
        const double p = kp * e;
        const double d_raw = (e - prev_e) / dt;
        const double alpha = dt / (tau_d + dt);
        static double d_filt = 0;
        d_filt += alpha * (d_raw - d_filt);

        double u_unsat = p + i + kd * d_filt;
        double u = std::clamp(u_unsat, out_min, out_max);

        // Conditional integration: do not wind up when saturated.
        const bool pushing_further =
            (u_unsat > out_max && e > 0) || (u_unsat < out_min && e < 0);
        if (!pushing_further) {
            i += ki * e * dt;
        }

        prev_e = e;
        return u;
    }
};
```

The static filter state is a bug in a real implementation. Put `d_filt` in the struct. The example is intentionally small; production code needs reset, initialization, and mode-aware state.

### Tuning rules that survive contact with hardware

- Start with $K_i=0$ and $K_d=0$. Raise $K_p$ until the response is fast but not oscillatory.
- Add $K_d$ to damp; filter it. Noise will find the derivative term.
- Add $K_i$ only if there is a steady-state error you cannot fix with feedforward.
- Check the loop at the flight sample rate, not a 1 kHz desktop rate.
- Check the worst-case delay, saturation, and sensor quantization.
- Verify gain and phase margins. A step response is not a stability proof.

## LQR: optimal state feedback

For a linear system

$$
\dot{\mathbf{x}} = \mathbf{A}\mathbf{x} + \mathbf{B}\mathbf{u},
$$

choose $\mathbf{u} = -\mathbf{K}\mathbf{x}$ to minimize

$$
J = \int_0^\infty \left(\mathbf{x}^T\mathbf{Q}\mathbf{x} + \mathbf{u}^T\mathbf{R}\mathbf{u}\right)dt.
$$

The gain is

$$
\mathbf{K} = \mathbf{R}^{-1}\mathbf{B}^T\mathbf{P},
$$

where $\mathbf{P}$ solves the continuous algebraic Riccati equation:

$$
\mathbf{A}^T\mathbf{P} + \mathbf{P}\mathbf{A} - \mathbf{P}\mathbf{B}\mathbf{R}^{-1}\mathbf{B}^T\mathbf{P} + \mathbf{Q} = 0.
$$

For a single-axis attitude model with state $[\theta,\omega]^T$ and input torque:

$$
\mathbf{A} = \begin{bmatrix}0&1\\0&0\end{bmatrix},\qquad
\mathbf{B} = \begin{bmatrix}0\\1/I\end{bmatrix}.
$$

LQR gives a state-feedback gain that balances attitude error and control effort. For this double integrator, the result is structurally a PD controller; LQR chooses the gains from $\mathbf{Q}$ and $\mathbf{R}$.

### Choosing Q and R

Bryson’s rule is a useful starting point:

$$
Q_{ii} = \frac{1}{x_{i,\max}^2},\qquad
R_{jj} = \frac{1}{u_{j,\max}^2}.
$$

Then iterate. LQR is not magic; it is a systematic way to trade error against effort. It assumes a linear model, full state feedback, and no constraints. Saturation and delay can still destroy it.

## Discrete-time implementation

Flight controllers run at a fixed rate. Discretize the plant and solve the discrete Riccati equation, or design continuous and check the discretized closed loop.

```python
import numpy as np
from scipy.linalg import solve_discrete_are

I = 100.0
A = np.array([[1.0, dt], [0.0, 1.0]])
B = np.array([[0.5*dt*dt/I], [dt/I]])
Q = np.diag([1.0/0.01**2, 1.0/0.01**2])
R = np.array([[1.0/1.0**2]])
P = solve_discrete_are(A, B, Q, R)
K = np.linalg.inv(R + B.T @ P @ B) @ B.T @ P @ A
```

Always check the closed-loop eigenvalues and simulate the discrete controller with the same sample time and delays as the flight software.

## Saturation, delay, and rate limits

These are not edge cases. They are the normal operating regime.

| Effect | Symptom | Mitigation |
| --- | --- | --- |
| Actuator saturation | Overshoot, windup, slow recovery | Anti-windup, command limiting, feedforward |
| Transport delay | Reduced phase margin, oscillation | Lower gain, predict/lead, increase rate |
| Rate limit | Lag, tracking error | Rate-aware guidance, feedforward |
| Quantization | Limit cycle, chatter | Deadband, hysteresis, pulse modulation |
| Sensor noise | Derivative amplification | Filtering, observer, lower bandwidth |

A controller that is stable at 100 Hz may be unstable at 20 Hz. The sample rate is part of the design.

## Feedforward and gain scheduling

Feedback reacts to error; feedforward anticipates it. For descent, the guidance law can provide a nominal thrust/attitude command, and the controller tracks it. This reduces the feedback gain needed and improves tracking.

Gain scheduling is useful when the plant changes: mass depletion, inertia change, or a different phase. Schedule on a measured variable (mass estimate, phase, dynamic pressure — not on time alone) and guarantee bumpless transitions.

## Practice

1. Implement a discrete PID for a 1D inertia. Tune for a 2 s settling time and <10% overshoot.
2. Add output saturation at ±1 N·m and a 20 ms delay. Retune. Measure the margin loss.
3. Design an LQR for the same plant. Compare step response and control effort.
4. Add a rate limit and a minimum impulse bit. Observe the limit cycle.
5. Run a 100-case Monte Carlo with ±20% inertia and ±10% thrust. Report the settling-time distribution.

<Quiz
  question="Why is a derivative filter important in a flight PID?"
  options="It makes the controller mathematically optimal|It reduces amplification of sensor noise and quantization in the derivative term|It eliminates the need for anti-windup|It guarantees stability with saturation"
  answer="1"
  explanation="Differentiation amplifies high-frequency noise. A low-pass filter on the derivative term trades phase lag for a quieter, more realistic command. It does not replace anti-windup or stability analysis."
/>

## Resources

- Åström & Murray, *Feedback Systems* — free online, excellent on PID and stability.
- Bryson & Ho, *Applied Optimal Control* — LQR and the Riccati equation.
- [SciPy `solve_discrete_are`](https://docs.scipy.org/doc/scipy/reference/generated/scipy.linalg.solve_discrete_are.html) — discrete LQR.
- [Control Systems Engineering](https://www.mathworks.com/solutions/control-systems.html) — MATLAB/Simulink design and analysis.

Next: [6DOF simulation](./sixdof.md).
