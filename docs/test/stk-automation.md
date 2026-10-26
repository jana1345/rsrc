---
title: STK Object Model automation
description: Drive STK from Python or MATLAB to generate repeatable access, lighting, and coverage studies.
---

# STK Object Model automation

::: tip Why this matters
Clicking through STK is fine for a one-off question. A mission study needs repeatability: the same scenario, the same constraints, the same report, regenerated after a design change. The STK Object Model lets you script that. It is also a differentiator on a GNC/flight-software resume because it shows you can turn analysis into evidence.
:::

## Learning objectives

- Explain the STK Object Model and the COM automation model.
- Create a scenario, add objects, set time, and compute access from Python.
- Export reports and data providers reproducibly.
- Handle units, frames, epochs, and object paths.
- Know when to use STK Engine instead of the desktop application.

## The object model

STK exposes a hierarchy:

```
Application
└── Scenario
    ├── Satellite
    │   ├── Propagator
    │   └── Sensor
    ├── Facility / Target
    ├── Chain
    └── Coverage
```

In Windows COM automation, you connect to a running STK instance or start one:

```python
import win32com.client

app = win32com.client.Dispatch("STK12.Application")
app.Visible = True
root = app.Personality2
scenario = root.CurrentScenario
```

The exact ProgID depends on the STK version (`STK12`, `STK13`, etc.). Check the installed version and the Object Model help.

## A minimal Python study

```python
import win32com.client

app = win32com.client.Dispatch("STK12.Application")
app.Visible = True
root = app.Personality2

# Create a scenario with the Moon as the central body
root.NewScenario("lunar_access")
scenario = root.CurrentScenario
scenario.SetTimePeriod("1 Jan 2027 00:00:00.000", "2 Jan 2027 00:00:00.000")
root.Rewind()

# Add a satellite in a circular lunar orbit
sat = scenario.Children.New(18, "Lander")  # eSatellite
sat.SetPropagatorType(6)                   # ePropagatorJ2Perturbation or two-body
prop = sat.Propagator
prop.InitialState.Representation.AssignClassical(
    "Moon", 1837.4, 0.001, 90.0, 0.0, 0.0, 0.0
)
prop.Propagate()

# Add a landing site
site = scenario.Children.New(8, "Site")    # eFacility
site.Position.AssignGeodetic(0.0, 0.0, 0.0)

# Compute access
access = sat.GetAccessToObject(site)
access.ComputeAccess()
intervals = access.ComputedAccessIntervalTimes
for i in range(intervals.Count):
    start, stop = intervals.Item(i)
    print(start, stop)
```

The numeric enum values and method names vary by STK version. Use the Object Model browser and the recorded macro as the source of truth. Do not copy a script from the internet without checking the version.

## Reports and data providers

Access intervals are only the start. Useful data providers:

- **Access:** start/stop/duration.
- **Lighting:** sun elevation/azimuth, eclipse.
- **AER:** azimuth/elevation/range from a site.
- **Orbit state:** position/velocity in a chosen frame.
- **Coverage:** figures of merit over a grid or region.
- **Link budget:** received power, margin, data rate.

Export to CSV:

```python
access.Report.Create("Access", "Start Stop Duration")
access.Report.SaveAs("access_report.csv")
```

Or query data providers directly and write your own CSV. The direct route is often easier to test and version.

## MATLAB automation

MATLAB can drive STK through the same COM interface on Windows:

```matlab
app = actxserver('STK12.Application');
app.Visible = 1;
root = app.Personality2;
root.NewScenario('lunar_access');
% ... same object model
```

If you are on Linux, COM automation of the Windows desktop app is not available. Options:

- run the automation on a Windows machine or VM,
- use STK Engine if your license and platform support it,
- use STK’s connect commands if your version supports them,
- use an open-source alternative (GMAT, Orekit) for the study and keep STK for cross-checks.

Decide this before you design a test pipeline around it.

## Units, frames, and time

STK defaults can surprise you:

- distances may be km, m, or nmi depending on the report,
- angles may be degrees,
- epochs may be UTC,
- frames may be J2000, MCMF, or a body frame.

Set units explicitly at the scenario or report level. Record the frame and epoch in the output file name or header. A report with numbers but no units is not reproducible.

## Reproducibility

A scripted study should have:

- a versioned script,
- a scenario file saved alongside it,
- a fixed STK version,
- the input parameters in a config file,
- the output directory and file naming convention,
- a README with the question and assumptions,
- a hash or tag for the run.

Run it twice from a clean scenario and compare the outputs. If they differ, find out why before trusting the study.

## Performance

STK automation can be slow. Reduce the problem:

- use the simplest propagator that answers the question,
- limit the time span and step size,
- compute access only for the objects you need,
- cache results,
- avoid launching a new STK instance for every case,
- use STK Engine for batch runs if available.

A 10,000-case Monte Carlo through the desktop UI is not a good plan. Use STK for the geometry study and a faster model for the inner loop.

## Practice

1. Script a lunar scenario with one satellite and one site. Export access intervals to CSV.
2. Add a sun-elevation constraint and compare the access windows.
3. Loop over three landing-site latitudes and produce a small table of access duration.
4. Save the script, scenario, and README. Re-run from a clean scenario and diff the output.
5. Break the script deliberately (wrong frame, wrong unit) and write a check that catches it.

<Quiz
  question="Why is it risky to copy an STK Object Model script from a blog post without checking the version?"
  options="STK scripts are always encrypted|Object model enum values, method names, and defaults change between versions|Python cannot call COM|STK does not support the Moon"
  answer="1"
  explanation="The Object Model is versioned. Enum values, methods, and defaults can change. Use the installed version’s Object Model help or a recorded macro as the source of truth."
/>

## Resources

- [STK Object Model help](https://help.agi.com/stk/index.htm#automation/objmodel.htm) — the authoritative reference.
- [STK integration and automation](https://help.agi.com/stk/) — examples and version notes.
- [pywin32](https://pywin32.readthedocs.io/) — COM automation on Windows.
- [GMAT](https://gmat.sourceforge.net/) and [Orekit](https://www.orekit.org/) — open-source alternatives for cross-checks.

Next: [real-time embedded C++](../flight/realtime-cpp.md).
