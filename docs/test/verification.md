---
title: V&V for flight software
description: Requirements, traceability, coverage, independent test, and the evidence a reviewer expects.
---

# V&V for flight software

::: tip Why this matters
For a one-shot landing, “it worked in the sim” is not evidence. Verification and validation (V&V) is how you show that the software was built correctly, that it does the right thing, and that you know where the limits are. It is also a core job responsibility in the roles you are targeting.
:::

## Learning objectives

- Distinguish verification from validation and explain IV&V.
- Write a testable requirement and trace it to a test.
- Choose test levels: unit, integration, system, acceptance.
- Select coverage metrics and explain their limits.
- Design nominal, off-nominal, boundary, and fault-injection tests.
- Assemble an evidence package a reviewer can audit.

## Definitions that matter

| Term | Question | Example |
| --- | --- | --- |
| **Verification** | Did we build the product right? | Does the guidance module meet its interface spec? |
| **Validation** | Did we build the right product? | Does the descent guidance land the vehicle within the requirement? |
| **IV&V** | Independent verification and validation | A separate team runs the tests and reviews the evidence |
| **V&V** | The combined process | Requirements, reviews, analysis, tests, and evidence |

Verification is not just testing. It includes analysis, inspection, review, and demonstration. Testing is the part that produces the most visible evidence.

## Requirements you can test

A good requirement is:

- **necessary** — it addresses a real need,
- **unambiguous** — one interpretation,
- **complete** — includes conditions and constraints,
- **consistent** — no conflict with another requirement,
- **verifiable** — a method exists,
- **traceable** — linked to a source and a test.

Bad: “The software shall land the vehicle safely.”

Better: “The descent guidance shall command a touchdown vertical speed magnitude no greater than 1.5 m/s for all Monte Carlo cases in the approved dispersion set, with 99% confidence.”

The second one tells you what to simulate, what to measure, and how to decide pass/fail.

## Traceability

A traceability matrix links:

```
stakeholder need → system requirement → software requirement → design → code → test → result
```

For a small project, a spreadsheet is fine. The important properties:

- every requirement has at least one test,
- every test maps to a requirement (or is explicitly exploratory),
- every result has a configuration/version,
- every change updates the links.

If a requirement has no test, it is a wish. If a test has no requirement, you do not know why it exists.

## Test levels

| Level | What is tested | Example |
| --- | --- | --- |
| **Unit** | One function/class in isolation | Quaternion normalization, frame transform |
| **Integration** | Interfaces between modules | Nav → guidance → control data flow |
| **System** | The flight software plus plant/sensors | Closed-loop descent |
| **Acceptance** | The delivered system against user needs | Mission scenario, Monte Carlo, HIL |
| **Regression** | Previously working behavior after a change | Full suite on every commit |

For flight software, add:

- **timing tests:** worst-case execution, jitter, deadline overrun,
- **memory tests:** stack high-water, heap usage (ideally zero), static allocation,
- **fault-injection tests:** stale sensor, bad checksum, watchdog reset, mode race,
- **interface tests:** packet layout, endianness, sequence, timeout,
- **configuration tests:** build from a clean tag, correct tables, correct constants.

## Coverage

Common metrics:

- **Statement coverage:** was the line executed?
- **Branch/decision coverage:** was each branch taken?
- **MC/DC:** did each condition independently affect the decision?
- **Requirements coverage:** is every requirement tested?
- **Interface coverage:** is every message/command exercised?

Coverage is necessary but not sufficient. A test can execute a line and assert nothing. A requirement can be “covered” by a test that does not check the right behavior. Pair coverage with meaningful assertions and review.

## Flight-software test design

Use a mix:

- **Nominal:** the expected trajectory, sensors, and commands.
- **Off-nominal:** sensor dropout, bias, saturation, bad command, mode transition.
- **Boundary:** minimum/maximum altitude, throttle, rate, time, memory.
- **Fault injection:** stuck sensor, corrupt packet, watchdog, reset, power glitch.
- **Stress:** high rate, queue overflow, CPU load, long duration.
- **Monte Carlo:** dispersions and statistical requirements.
- **Regression:** every fixed bug gets a test.

A useful format:

```text
ID: T-GUID-014
Requirement: REQ-GUID-007
Objective: Verify terminal descent commands a vertical speed <= 1.5 m/s at touchdown
Setup: 6DOF SIL, 100 dispersed cases, sensor noise enabled
Inputs: seed 20261026, mass/thrust/IMU dispersions per MC plan
Pass criteria: 99th percentile |v_z| <= 1.5 m/s; no crashes; fuel reserve >= 2%
Result: PASS, 99th percentile 1.12 m/s
Evidence: report.html, run log, model version, commit hash
```

## NPR 7150.2 in one paragraph

NASA NPR 7150.2 defines software engineering requirements for NASA software, including software classes A–E based on criticality. It covers lifecycle processes, requirements, design, implementation, testing, verification, validation, configuration management, quality assurance, safety, and security. Commercial lunar landers are not automatically bound by it, but the vocabulary and evidence expectations are widely used. Do not claim compliance unless you have tailored and documented it. The [NPR 7150.2 page](../flight/npr-7150.md) goes deeper.

## The evidence package

A reviewer should be able to answer:

- What was the requirement?
- What version of the software/model was tested?
- What test was run, with what inputs and environment?
- What was the pass/fail criterion?
- What was the result?
- Who reviewed it?
- What changed since the last run?

Minimum artifacts:

- requirements and trace matrix,
- test plan and test cases,
- test logs and reports,
- coverage and static-analysis reports,
- configuration/build record,
- problem reports and dispositions,
- review records.

## Pitfalls

- **Testing the model, not the flight build.** The generated code or target build can differ.
- **Coverage theater.** 100% statement coverage with weak assertions.
- **No negative tests.** Only the happy path is tested.
- **Unversioned test data.** The result cannot be reproduced.
- **Flaky tests accepted.** A test that passes sometimes is not evidence.
- **No timing tests.** Functional correctness at the wrong rate is still a failure.
- **No fault injection.** The fault paths are the ones that matter in flight.
- **Overclaiming compliance.** “NPR 7150.2 compliant” without a tailored matrix and audit evidence.

## Practice

1. Write five requirements for your descent sim: one performance, one interface, one fault, one timing, one safety.
2. For each, write a test case with a pass/fail criterion and the evidence it produces.
3. Build a traceability matrix from requirement to test to result.
4. Add a fault-injection test for a stale nav state and one for a corrupt command packet.
5. Run the suite from a clean checkout and archive the report with the commit hash.

<Quiz
  question="A test suite reports 100% statement coverage. What is the strongest conclusion?"
  options="The software is correct|Every statement was executed, but the assertions may still be weak and requirements may be untested|The software is safe for flight|The requirements are complete"
  answer="1"
  explanation="Coverage measures execution, not correctness. You still need meaningful assertions, requirements coverage, boundary cases, and fault injection."
/>

## Resources

- [NPR 7150.2](https://nodis3.gsfc.nasa.gov/displayDir.cfm?t=NPR&c=7150&s=2) — NASA software engineering requirements.
- [NASA-STD-8739.8](https://standards.nasa.gov/) — software assurance.
- [NASA Software Engineering Handbook](https://swehb.nasa.gov/) — practical guidance.
- [DO-178C](https://www.rtca.org/) — the airborne analogue, useful for assurance concepts.

Next: [SIL & HIL](./sil-hil.md).
