---
title: Study & tooling setup
description: The minimum toolchain for the lunar GNC and flight-software path.
---

# Study & tooling setup

You do not need a lab to start. You need a compiler, a terminal, Python, a browser, and a place to keep notes. MATLAB/Simulink and STK are valuable because they are used in the industry, but the concepts come first.

## Minimum setup

| Tool | Why | Check |
| --- | --- | --- |
| **C++17/20 compiler** | Flight-software work is still mostly C/C++. | `g++ --version` or `clang++ --version` |
| **CMake + Ninja** | Real projects do not compile with one long command. | `cmake --version`, `ninja --version` |
| **GDB** | You will debug optimized and embedded code. | `gdb --version` |
| **Python 3.11+** | Test automation, analysis, plotting, STK scripting. | `python3 --version` |
| **Git** | Configuration management and traceability. | `git --version` |
| **Node 20+** | This site, plus web-based tools. | `node --version` |
| **MATLAB/Simulink** | Plant models, control design, Embedded Coder. | `matlab -batch "version"` |
| **STK** | Orbit/access/lighting/coverage studies and automation. | Launch STK and create a scenario |
| **A text editor** | VS Code, Neovim, Zed, whatever you will actually use. | Open a C++ file and build it |

### Linux packages

On Debian/Ubuntu:

```bash
sudo apt update
sudo apt install -y build-essential cmake ninja-build gdb git python3 python3-venv \
  python3-pip clang lldb valgrind linux-tools-common linux-tools-generic \
  minicom picocom tcpdump
```

On Fedora:

```bash
sudo dnf install -y gcc-c++ clang cmake ninja-build gdb git python3 python3-pip \
  valgrind perf minicom picocom tcpdump
```

### Python environment

Keep each study project isolated:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install numpy scipy matplotlib pandas pytest pytest-html pyyaml
```

Add packages only when you need them. A bloated environment is its own debugging problem.

## MATLAB and Simulink

You have access, so use it for what it is good at:

- **MATLAB** for quick linear algebra, ODE integration, plots, and Monte Carlo analysis.
- **Simulink** for block-diagram plant/controller models, sample-rate experiments, and code generation.
- **Embedded Coder** for the Simulink → C pipeline. Do not start there; start with a model that runs.

A useful first model is a 1D vertical lander:

```
thrust command → saturation → thrust force → acceleration → velocity → altitude
                         ↑                                  |
                         └────────── controller ←───────────┘
```

Include gravity, mass flow, and a simple altitude sensor. Then vary the sample time and watch the controller degrade. That single experiment teaches more than a hundred slides.

## STK

STK is Windows-first. If your STK installation is on Windows, run it there and keep this site on Linux; use a shared folder or Git for scripts and results. If you are using STK Engine or a Linux-supported configuration, check the licensing and Object Model support before planning automation.

The first scenario should be small:

1. Create a scenario with the Moon as the central body.
2. Add a satellite in a low lunar orbit or an NRHO.
3. Add a landing site facility at your target latitude/longitude.
4. Compute access between the satellite and the site.
5. Add a sensor or a light constraint and compare the access windows.
6. Export a report.

Do not start with a full mission. Start with one object and one question.

## Repo layout for study projects

Use one repo per major project, not one repo per exercise. A workable layout:

```
lunar-gnc-lab/
├── CMakeLists.txt
├── README.md
├── docs/
│   ├── requirements.md
│   ├── interfaces.md
│   └── test-plan.md
├── src/
│   ├── math/
│   ├── dynamics/
│   ├── navigation/
│   ├── guidance/
│   ├── control/
│   └── app/
├── include/
├── tests/
├── sim/
│   ├── matlab/
│   └── python/
├── tools/
└── scripts/
```

The exact layout matters less than the rule: **flight code, simulation code, and analysis code are separate.** Do not let a plotting script become part of the flight binary.

## Optional hardware

Hardware makes timing, I/O, and fault handling real. None of it is required for the first three months.

- **STM32 or Teensy** for bare-metal C/C++ and interrupts.
- **Raspberry Pi** for Linux, processes, networking, and a target for HIL-lite.
- **A small IMU breakout** for sensor noise, bias, and calibration.
- **USB-to-serial adapter** for packet framing and ground-station tests.
- **Logic analyzer** for timing and protocol debugging. A cheap 8-channel analyzer is enough to start.

If you buy one thing, buy the logic analyzer. It turns “the packet is probably sent” into a waveform.

## A note on using this site offline

The site is a static build. After `npm run build`, the `docs/.vitepress/dist` folder can be served locally or published to GitHub Pages. Your progress markers live in browser `localStorage`, so they are per-browser, not per-account. See [progress](./progress.md) for the details.

## Setup checklist

<StudyChecklist
  id="setup"
  title="Environment ready"
  items="C++ compiler, CMake, Ninja, and GDB all respond on the command line|Python virtual environment created and pytest runs|MATLAB or Simulink opens and runs a trivial script/model|STK creates a scenario with the Moon as the central body|A Git repository exists for the lunar GNC lab|The site runs locally with npm run dev"
/>

Next: [open the progress dashboard](./progress.md) and start Week 1.
