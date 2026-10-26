---
title: MATLAB & Simulink essentials
description: The modeling workflow for plant models, controllers, and generated flight code.
---

# MATLAB & Simulink essentials

::: tip Why this matters
MATLAB and Simulink are common in GNC organizations because they let engineers move from an equation to a running model, then to generated C code, without rewriting everything. You do not need to be a MATLAB language expert. You need to build a small plant, close a loop, change the sample rate, and understand what the code generator will do with your model.
:::

## Learning objectives

- Write MATLAB scripts and functions that operate on vectors and matrices.
- Integrate an ODE with `ode45` and plot the result.
- Build a Simulink model with a plant, sensor, controller, and scopes.
- Choose a solver and sample time deliberately.
- Explain how a model becomes generated C code.

## MATLAB in one sitting

The parts you will actually use:

```matlab
% Vectors and matrices
A = [1 2; 3 4];
b = [5; 6];
x = A \ b;                 % solve, do not invert

% Anonymous function
f = @(t, y) -1.62 + 0.01 * y;

% ODE integration
[t, y] = ode45(f, [0 30], 100);

% Plot with labels and units
plot(t, y, 'LineWidth', 1.5);
xlabel('Time [s]');
ylabel('Altitude [m]');
grid on;
```

Rules that prevent most MATLAB pain:

- Use `%` comments, `;` to suppress output, and meaningful variable names.
- Preallocate arrays before loops: `x = zeros(1, N)`.
- Vectorize where it is clear; do not contort code for a micro-optimization.
- Put reusable logic in functions, not scripts.
- Keep units in variable names (`altitude_m`, `thrust_N`) when the model is small.
- Use `struct` or `table` for test cases; do not build parallel arrays with fragile indexing.

## A 1D lander in MATLAB

State: altitude $h$, vertical speed $v$, mass $m$.

$$
\dot h = v,\qquad
\dot v = \frac{T\cos\theta}{m} - g,\qquad
\dot m = -\frac{T}{I_{sp}g_0}.
$$

For a first model, hold thrust $T$ and attitude $\theta$ constant, or use a simple throttle law. The point is to see the coupling between fuel, thrust, and deceleration.

```matlab
function dydt = lander1d(~, y, p)
    h = y(1); v = y(2); m = y(3);
    T = min(max(p.throttle, 0), 1) * p.thrust_max;
    if h <= 0
        T = 0;                 % engine cutoff at the surface
    end
    a = T / m - p.g;
    mdot = -T / (p.isp * p.g0);
    dydt = [v; a; mdot];
end
```

Call it with `ode45` and an event function that stops at touchdown. Then change `p.throttle` and watch the altitude and fuel plots. That is the beginning of every descent trade study.

## Simulink mental model

A Simulink model is a directed graph of blocks that execute at sample times. The solver advances the states. Your job is to define:

- **states** (integrators),
- **inputs** (commands, disturbances),
- **parameters** (mass, thrust, gains),
- **sample times** (how often each part runs),
- **signal types** (double, single, boolean, bus),
- **test points** (what you log).

A simple 1D model:

```
Throttle command → Saturation → Thrust → Sum → 1/m → Integrator → velocity
                                 ↑                 ↓
                              Gravity           Integrator → altitude
                                 ↑
                         Mass flow → Integrator → mass
```

Close a loop with an altitude/velocity controller. Add a sensor with noise and a sample-and-hold. Add a saturation on the command. Now you have a plant, a sensor, an actuator limit, and a controller — the same structure as the real system.

## Solvers and sample times

| Question | Guidance |
| --- | --- |
| Is the plant continuous? | Use a variable-step solver for analysis, a fixed-step solver for real-time/code generation. |
| Will this become flight code? | Use a fixed-step discrete model. The code generator needs deterministic execution. |
| What step size? | Fast enough for the fastest dynamics; verify with a convergence study (halve the step, compare). |
| Multiple rates? | Use rate groups. Document which rates are harmonic and how data crosses them. |
| Stiff dynamics? | Try `ode15s` for analysis; do not let a solver choice hide a modeling problem. |

A model that only works at one step size is not a validated model. Change the step and see what breaks.

## Model hygiene

- **One source of truth for parameters.** Use a data dictionary or a single initialization script, not magic numbers in blocks.
- **Buses for interfaces.** Define the signal set once; do not wire 30 loose lines across a subsystem boundary.
- **Model referencing** for large projects. Keep the plant, controller, and test harness separable.
- **Version control** the `.slx` files and the initialization scripts. Know which MATLAB release produced them.
- **Test the model**, not just the plot. Use assertions, known-answer cases, and regression tests.
- **Name signals with units and frames** (`vel_enu_mps`, `q_body_from_mcmf`). The model is an interface document.

> **Flight-software lens:** the model is not the flight code. The generated code is a translation with its own assumptions: sample time, data types, saturation, and state initialization. The integration page [Simulink → flight code](../flight/simulink-pipeline.md) covers the handoff.

## Practice

1. Build the 1D lander in MATLAB with `ode45`. Start at 1,000 m with −20 m/s and find a constant throttle that gives a soft touchdown (|v| < 2 m/s).
2. Rebuild it in Simulink with a PI controller on altitude rate. Add a command saturation and a sensor sample time of 10 Hz.
3. Halve the solver step and compare touchdown time, fuel, and peak thrust.
4. Add a 2% mass uncertainty and rerun. Does the controller still land?

<Quiz
  question="You are preparing a Simulink controller for Embedded Coder. Which choice is the biggest red flag?"
  options="A fixed-step discrete solver with documented sample times|A variable-step continuous solver with algebraic loops and no rate specification|A data dictionary for parameters|A model reference for the controller"
  answer="1"
  explanation="Generated flight code needs deterministic execution and explicit rates. A variable-step continuous model with algebraic loops is an analysis model, not a code-generation model."
/>

## Resources

- [MATLAB Onramp](https://matlabacademy.mathworks.com/) — free introductory course.
- [Simulink Onramp](https://matlabacademy.mathworks.com/) — the fastest way to learn the block-diagram workflow.
- [Embedded Coder documentation](https://www.mathworks.com/products/embedded-coder.html) — code generation options and targets.
- [Simulink Test](https://www.mathworks.com/products/simulink-test.html) — test harnesses, baselines, and coverage.

Next: [modern C++ for flight](./cpp.md).
