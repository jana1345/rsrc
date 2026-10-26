---
title: Resources
description: A curated, opinionated list of the documents, tools, books, and datasets worth your time — and what each one is actually for.
---

# Resources

Most reading lists are too long to use. This one is filtered for a specific goal: becoming employable on a lunar lander GNC or flight-software team. Each entry says **what it is for** and **when to use it**. Links change; search the title if a URL rots.

::: tip How to use this page
Do not read the list top to bottom. Pick the section that matches your current week, choose **one** primary source, and use the rest as reference. A book you work through beats five books you bookmark.
:::

## The documents that define the job

These are the sources a real program will point you to. Read them early enough to learn the vocabulary, not so early that they replace the concepts.

| Document | Use it for | Access |
| --- | --- | --- |
| [NPR 7150.2 — NASA Software Engineering Requirements](https://nodis3.gsfc.nasa.gov/displayDir.cfm?t=NPR&c=7150&s=2) | Software classes, lifecycle evidence, assurance requirements | Free |
| [NASA Software Engineering Handbook (SWEHB)](https://swehb.nasa.gov/) | Practical guidance for each NPR requirement | Free |
| [NASA Systems Engineering Handbook](https://www.nasa.gov/connect/ebooks/nasa-systems-engineering-handbook/) | Requirements, interfaces, verification, risk | Free PDF |
| [NASA-STD-8739.8 — Software Assurance](https://standards.nasa.gov/) | Assurance tasks and independence | Free |
| [CCSDS Space Packet Protocol (133.0-B)](https://public.ccsds.org/Pubs/133x0b2.pdf) | APID, sequence, packet structure | Free |
| [CCSDS Telemetry Transfer Frame (132.0-B)](https://public.ccsds.org/Pubs/132x0b3.pdf) | Frames, virtual channels, Reed–Solomon | Free |
| [CCSDS COP-1 (232.0-B)](https://public.ccsds.org/Pubs/232x0b4.pdf) | Reliable command transfer | Free |
| [SpaceWire Standard (ECSS-E-ST-50-12C)](https://ecss.nl/) | Link layer, packets, routing | Free |
| [NASA cFS documentation](https://github.com/nasa/cFS) | Application model, services, build | Free |

**How to read NPR 7150.2 without drowning:** start with the software class definitions and the lifecycle table. Then pick one requirement that applies to your capstone (for example, unit test coverage or requirements traceability) and build the evidence. A crosswalk of ten requirements you actually satisfied is more credible than a claim of full compliance.

## Flight software and real-time systems

| Resource | Use it for |
| --- | --- |
| [NASA cFS](https://github.com/nasa/cFS) | The reference architecture. Build one app, send one command, downlink one telemetry point. |
| [cFS Training](https://github.com/nasa/cFS/blob/main/doc/cFS_Training_Slides.pdf) | A guided tour of the framework. |
| [cFE](https://github.com/nasa/cFE) and [cFS Apps](https://github.com/nasa/cFS_Apps) | Services and example applications. |
| [NASA HS (Health & Safety)](https://github.com/nasa/HS) | Watchdog, CPU monitoring, and recovery patterns. |
| [NASA Sch (Scheduler)](https://github.com/nasa/sch) | Rate-group scheduling in practice. |
| [FreeRTOS](https://www.freertos.org/) | Tasks, queues, semaphores, priority inversion. The cheapest way to learn an RTOS. |
| [RTEMS](https://www.rtems.org/) | Open-source RTOS used in space; POSIX-like and certifiable. |
| [VxWorks](https://www.windriver.com/products/vxworks) | Widely used in flight; documentation is public, the product is not. |
| [Barr Group, *Embedded C Coding Standard*](https://barrgroup.com/embedded-systems/books/embedded-c-coding-standard) | The rules that prevent whole classes of embedded bugs. |
| [MISRA C](https://www.misra.org.uk/) | The automotive/industrial safety subset; useful discipline even if your program does not require it. |
| [JPL Power of Ten](https://en.wikipedia.org/wiki/The_Power_of_Ten_(coding_standards)) | Ten rules for safety-critical code. Short, blunt, worth memorizing. |

**Build order:** cFS app → FreeRTOS task/queue exercise → timing measurement → fault injection. Reading about schedulers without measuring jitter teaches you the vocabulary but not the behavior.

## GNC, dynamics, and control

| Resource | Use it for |
| --- | --- |
| [Vallado, *Fundamentals of Astrodynamics and Applications*](https://www.springer.com/gp/book/9781881883142) | The standard orbital mechanics reference. Buy or borrow; you will use it for years. |
| [Schaub & Junkins, *Analytical Mechanics of Space Systems*](https://arc.aiaa.org/doi/book/10.2514/4.105210) | Rigid-body dynamics, attitude control, and spacecraft mechanics. |
| [Wie, *Space Vehicle Dynamics and Control*](https://arc.aiaa.org/doi/book/10.2514/4.862106) | A control-first treatment; good for quaternions and Lyapunov methods. |
| [Maybeck, *Stochastic Models, Estimation, and Control*](https://www.sciencedirect.com/book/9780124807016/stochastic-models-estimation-and-control) | The rigorous Kalman filter foundation. |
| [Groves, *Principles of GNSS, Inertial, and Multisensor Integrated Navigation Systems*](https://www.artechhouse.com/Principles-of-GNSS-Inertial-and-Multisensor-Integrated-Navigation-Systems-Third-Edition-P2106.aspx) | Inertial navigation and sensor fusion, with engineering detail. |
| [NASA Reference Publication 1311: Quaternion FAQ](https://ntrs.nasa.gov/citations/19950005007) | Conventions, composition, and the traps. |
| [Steve Brunton, *Control Bootcamp*](https://www.youtube.com/playlist?list=PLMrJAkhIeNNR20Mz-VpzgfQs5zrYi085m) | Intuition for state space, LQR, and observability. |
| [Brian Douglas, Control System Lectures](https://www.youtube.com/user/ControlLectures) | PID, frequency response, and practical intuition. |
| [MIT 16.31 / 16.323](https://ocw.mit.edu/) | Full courses on estimation and control, free. |
| [APMonitor / Python Control](https://python-control.readthedocs.io/) | Quick LQR, step response, and pole placement in Python. |

**A caution:** control theory is endless. For this path, stop at: state space, PID, LQR, observability, discretization, saturation, and delay. Then go build. The exotic material can wait until a job asks for it.

## Orbital mechanics and mission design tools

| Tool | Use it for |
| --- | --- |
| [STK](https://www.ansys.com/products/missions/ansys-stk) | High-fidelity scenario analysis: orbits, access, lighting, coverage, sensors. You have access; use it. |
| [GMAT](https://gmat.sourceforge.net/) | Free trajectory design, optimization, and ephemeris generation. |
| [SPICE](https://naif.jpl.nasa.gov/naif/) | Ephemerides, frames, and time kernels. The toolkit behind a lot of mission software. |
| [poliastro](https://docs.poliastro.space/) | Python orbital mechanics for quick calculations and plots. |
| [Skyfield](https://rhodesmill.org/skyfield/) | Python ephemerides and sky geometry. |
| [LRO/LOLA data](https://lunar.gsfc.nasa.gov/) | Topography and gravity products for lunar scenarios. |
| [NASA Horizons](https://ssd.jpl.nasa.gov/horizons/) | Ephemerides for almost anything in the solar system. |

**STK advice:** learn four things well — scenario time and frame, satellite propagation, target/site definition, and one report (access or lighting). Then automate the same study with the Object Model. Do not try to learn every STK module.

## MATLAB, Simulink, and code generation

| Resource | Use it for |
| --- | --- |
| [MATLAB Onramp](https://matlabacademy.mathworks.com/) | If you are new to MATLAB, two hours is enough to start. |
| [Simulink Onramp](https://matlabacademy.mathworks.com/) | Blocks, signals, solvers, and a first model. |
| [Simulink Control Design](https://www.mathworks.com/products/simcontrol.html) | Linearization and PID tuning. |
| [Embedded Coder](https://www.mathworks.com/products/embedded-coder.html) | Generating production C from models. |
| [Simulink Requirements / Test](https://www.mathworks.com/products/requirements.html) | Traceability and model-based test, if your license includes it. |
| [MATLAB Aerospace Blockset](https://www.mathworks.com/products/aerospace-blockset.html) | Reference models for 6DOF and environment. |
| [MathWorks Examples](https://www.mathworks.com/examples/) | Search "lunar lander", "6DOF", "Kalman filter". |

**Cost note:** MATLAB toolboxes are expensive and license-dependent. If a toolbox is missing, implement the concept in Python or C++ instead of skipping it. The concept is the portable part.

## C++, Linux, and tooling

| Resource | Use it for |
| --- | --- |
| [cppreference](https://en.cppreference.com/) | The reference. Not a tutorial. |
| [Learn C++](https://www.learncpp.com/) | A structured tutorial if you need one. |
| [C++ Core Guidelines](https://isocpp.github.io/CppCoreGuidelines/) | Ownership, lifetime, and interface rules. |
| [Compiler Explorer](https://godbolt.org/) | See what the compiler actually emits; check for allocations and unexpected code. |
| [CMake documentation](https://cmake.org/documentation/) | Targets, toolchains, and cross-compilation. |
| [Ninja](https://ninja-build.org/) | Fast builds; the default generator for many embedded projects. |
| [GDB documentation](https://sourceware.org/gdb/documentation/) | Breakpoints, watchpoints, core dumps, remote targets. |
| [Valgrind](https://valgrind.org/) | Memory errors and leaks on the host. |
| [Sanitizers](https://github.com/google/sanitizers) | ASan, UBSan, and TSan for host testing. |
| [perf](https://perf.wiki.kernel.org/) | Timing and cache analysis on Linux. |
| [Wireshark](https://www.wireshark.org/) | Packet capture for network and serial-over-TCP test harnesses. |

## Testing and verification

| Resource | Use it for |
| --- | --- |
| [pytest](https://docs.pytest.org/) | Fixtures, parametrization, and machine-readable reports. |
| [pytest-html](https://pytest-html.readthedocs.io/) | Human-readable test reports. |
| [GoogleTest](https://google.github.io/googletest/) | C++ unit testing, mocks, and death tests. |
| [Catch2](https://github.com/catchorg/Catch2) | A lighter C++ test framework. |
| [gcov / lcov](https://gcc.gnu.org/onlinedocs/gcc/Gcov.html) | Coverage measurement. |
| [Cppcheck](https://cppcheck.sourceforge.io/) | Static analysis for C++. |
| [Clang-Tidy](https://clang.llvm.org/extra/clang-tidy/) | Static analysis and modernization checks. |
| [Jenkins](https://www.jenkins.io/) / [GitHub Actions](https://docs.github.com/en/actions) | CI, nightly regression, and artifact retention. |
| [NASA SWEHB](https://swehb.nasa.gov/) | What evidence a reviewer expects. |

**The one habit that matters:** make the test suite runnable with one command from a fresh checkout. Everything else is detail.

## Space environment and mission context

| Resource | Use it for |
| --- | --- |
| [NASA LRO](https://lunar.gsfc.nasa.gov/) | Mission overview, instruments, and data. |
| [Lunar Sourcebook](https://www.lpi.usra.edu/publications/books/lunar_sourcebook/) | Regolith, thermal, and surface science. |
| [Apollo Lunar Surface Journal](https://www.nasa.gov/history/alsj/) | Crew debriefs, landing timelines, and real anomalies. |
| [NASA Technical Reports Server (NTRS)](https://ntrs.nasa.gov/) | Papers on guidance, navigation, and lander design. |
| [NASA Spaceflight](https://www.nasa.gov/) | Program news and mission updates. |
| [Artemis](https://www.nasa.gov/artemis/) | The current lunar program context. |

## Communities and staying current

| Source | Why |
| --- | --- |
| [NASA cFS GitHub](https://github.com/nasa/cFS) | Releases, issues, and examples. |
| [CCSDS](https://ccsds.org/) | Standards updates. |
| [AIAA](https://www.aiaa.org/) | Conferences and papers; student membership is affordable. |
| [IEEE Aerospace Conference](https://ieee-aero.org/) | Practical flight-software and GNC papers. |
| [Small Satellite Conference](https://digitalcommons.usu.edu/smallsat/) | Free proceedings, strong on real implementations. |
| [r/space](https://www.reddit.com/r/space/) | News, not engineering. Use sparingly. |
| Local university groups | Often the fastest way to find a mentor and a hardware project. |

## A six-book core library

If you buy nothing else:

1. **Vallado** — orbital mechanics and frames.
2. **Schaub & Junkins** — dynamics and control.
3. **Groves** — navigation and sensor fusion.
4. **Barr Group embedded C standard** — coding discipline.
5. **NASA Systems Engineering Handbook** — how programs think.
6. **NPR 7150.2 + SWEHB** — the compliance vocabulary.

Everything else is a supplement.

## What to ignore, for now

- Full three-body trajectory optimization. Learn what an NRHO is; do not spend a month on it.
- Propulsion thermodynamics and engine design. You need a thrust model, not a combustion model.
- Detailed radiation-hardened electronics design. Know the failure modes and the software responses.
- Exotic control methods (MPC, adaptive control, reinforcement learning) before you can tune a PID at a fixed sample rate.
- Certifying anything. You can learn the evidence model without claiming a certification you do not have.
- Benchmark-chasing on LeetCode. It will not help you explain a frame transform.

## A reading protocol

For any paper or document:

1. Read the abstract, figures, and conclusion first.
2. Write down the problem, the assumption, and the result in three sentences.
3. Find the one equation or architecture diagram you would reuse.
4. Decide whether it changes anything you are building. If not, stop.
5. If it does, add a test or a note to your project, not just a bookmark.

The goal is not to have read more. It is to have fewer unknowns between you and a working descent.

Next: [glossary](./glossary.md) or [formula sheet](./formulas.md).
