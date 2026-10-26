---
title: Monte Carlo analysis
description: Turn dispersions into landing probability, fuel margins, and evidence.
---

# Monte Carlo analysis

::: tip Why this matters
A single successful landing proves that one trajectory worked. A Monte Carlo campaign estimates how often the vehicle lands, how much fuel it uses, and which dispersions dominate the risk. For a one-shot landing, that distribution is the evidence.
:::

## Learning objectives

- Define the input dispersions and their distributions.
- Choose a sampling strategy and a seed policy.
- Compute landing miss, touchdown velocity, fuel, and failure probability.
- Estimate convergence and confidence intervals.
- Avoid the common ways a Monte Carlo lies.

## What you are estimating

Typical outputs:

| Output | Why |
| --- | --- |
| **Landing miss distance** | Guidance and navigation performance |
| **Touchdown vertical/horizontal velocity** | Structural and tip-over limits |
| **Fuel remaining** | Reserve and abort capability |
| **Attitude at touchdown** | Tip-over and engine plume risk |
| **Time of flight** | Timeline and thermal/comm constraints |
| **Probability of failure** | Requirement compliance, if the model is credible |
| **Sensitivity ranking** | Which dispersion drives the risk |

A Monte Carlo is not a substitute for a requirements analysis. It quantifies the consequences of assumptions you already made.

## Inputs and distributions

Common dispersions:

- initial state at PDI: position, velocity, attitude, angular rate,
- mass and inertia,
- thrust magnitude, Isp, throttle response, gimbal alignment,
- RCS minimum impulse and torque,
- IMU bias, scale factor, noise, misalignment,
- altimeter/radar bias, noise, dropout, terrain map error,
- star tracker accuracy and latency,
- navigation filter initial covariance,
- guidance parameters and mode-transition thresholds,
- environmental model error (gravity, terrain).

Choose distributions deliberately:

| Distribution | Use |
| --- | --- |
| Gaussian | Random measurement noise, many manufacturing tolerances |
| Uniform | A bound with no preferred value |
| Truncated Gaussian | A physical bound on a noisy parameter |
| Triangular | A rough estimate with a most-likely value |
| Empirical | Test data, flight data, or a histogram |
| Correlated Gaussian | Parameters that vary together |

Do not assume independence just because it is convenient. A gyro bias and scale factor may be correlated; a mass and inertia may be coupled.

## Sampling

For independent uniform inputs, plain random sampling is fine. For expensive simulations, use:

- **Latin hypercube sampling** — better coverage of each input’s range.
- **Sobol / low-discrepancy sequences** — better convergence for smooth outputs.
- **Stratified sampling** — ensure coverage of important regions.
- **Importance sampling** — estimate rare failure probabilities with fewer runs.

Always record the seed. A result you cannot reproduce is an anecdote.

```python
import numpy as np

rng = np.random.default_rng(20261026)
n = 1000
mass = rng.normal(12000, 240, n)          # 2% std dev
thrust = rng.normal(180000, 3600, n)      # 2% std dev
bias = rng.normal(0, 0.002, n)            # rad/s gyro bias
```

## Convergence

The standard error of a sample mean is approximately

$$
\mathrm{SE} = \frac{\sigma}{\sqrt{N}}.
$$

To halve the error, you need four times the runs. For a failure probability $p$, the relative uncertainty is roughly

$$
\frac{\mathrm{SE}(p)}{p} \approx \sqrt{\frac{1-p}{Np}}.
$$

If $p=0.01$ and $N=100$, you may see zero failures and learn almost nothing. Estimating rare events needs many more runs or importance sampling.

Plot convergence:

- running mean and standard deviation of the output,
- confidence interval width versus $N$,
- histogram stability,
- tail behavior.

## A useful workflow

1. **Define the question.** “What is the 99th-percentile touchdown vertical speed?” not “run a Monte Carlo.”
2. **List the dispersions.** Include the model uncertainty, not just sensor noise.
3. **Choose distributions and correlations.** Document the source.
4. **Run a pilot.** 50–100 cases to find bugs and estimate variance.
5. **Scale up.** Until the confidence interval is tight enough for the decision.
6. **Analyze tails.** A mean is not a landing requirement.
7. **Rank sensitivities.** Which inputs explain the variance?
8. **Act.** Change the design, add margin, or add a test.

## The ways a Monte Carlo lies

- **Wrong distributions.** A Gaussian with an unbounded tail for a physically bounded parameter.
- **Ignored correlations.** Independent sampling of coupled parameters.
- **Too few runs.** A “100% success” claim from 20 cases.
- **One seed.** A lucky or unlucky sample set presented as the truth.
- **Unvalidated truth model.** The sim is wrong, so the statistics are precise nonsense.
- **Cherry-picked cases.** Removing “outliers” that are real failures.
- **No sensitivity analysis.** You cannot tell which fix matters.
- **Mismatched requirements.** Reporting mean miss when the requirement is a 99th percentile.
- **Ignoring aborts.** A “failure” that would have aborted earlier is not the same as a crash.

> **Flight-software lens:** a Monte Carlo is a test campaign. It needs a test plan, a configuration record, a seed, a versioned model, and a report. “I ran 1,000 cases” is not evidence unless someone can reproduce them.

## Practice

1. Add ±2% mass, ±2% thrust, and a 0.1° attitude error to your 6DOF sim. Run 100 cases.
2. Plot histograms of landing miss, touchdown vertical speed, and fuel remaining.
3. Compute the mean and 95th percentile. Plot the running mean versus run count.
4. Run the same campaign with a different seed. How much do the 95th percentiles move?
5. Rank the inputs by correlation with landing miss. Which one would you tighten first?

<Quiz
  question="You run 50 Monte Carlo cases and all land successfully. What can you conclude?"
  options="The probability of failure is exactly zero|The result is encouraging, but 50 cases cannot bound a rare failure probability tightly|The simulation is validated|The guidance law is optimal"
  answer="1"
  explanation="Zero failures in 50 runs is consistent with a failure probability of a few percent. It does not prove zero, and it says nothing about model validity or optimality."
/>

## Resources

- [NASA Standard for Models and Simulations](https://standards.nasa.gov/) — credibility and verification language.
- Saltelli et al., *Global Sensitivity Analysis* — the right way to rank inputs.
- [SciPy statistics](https://docs.scipy.org/doc/scipy/reference/stats.html) — distributions and confidence intervals.
- [Latin hypercube sampling](https://en.wikipedia.org/wiki/Latin_hypercube_sampling) — a practical starting point.

Next: [navigation, EKF & sensor fusion](./navigation.md).
