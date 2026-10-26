---
title: Debugging & verification tools
description: GDB, sanitizers, tracing, timing analysis, and investigating failures you cannot reproduce.
---

# Debugging & verification tools

::: tip Why this matters
Flight-software debugging is often forensic: the failure happened on a target, at speed, with limited telemetry. The engineers who are good at this do not guess. They form a hypothesis, choose the cheapest observation that can falsify it, and keep a timeline.
:::

## Learning objectives

- Use GDB to inspect a crash, a hang, and a wrong value.
- Choose between logging, tracing, sanitizers, and a hardware probe.
- Detect memory, undefined-behavior, and race bugs before they reach the target.
- Measure timing and stack usage instead of estimating.
- Investigate an anomaly from telemetry and a fault tree.

## The debugging ladder

Start cheap, escalate only when needed:

1. **Read the code and the data.** Check units, frames, signs, bounds, and initialization.
2. **Add an assertion or a log** at the boundary where the invariant breaks.
3. **Reproduce on the host** with the same inputs and a sanitizer build.
4. **Use a debugger** for state you cannot print.
5. **Trace** the system to see timing and ordering.
6. **Use hardware** (JTAG/SWD, logic analyzer, oscilloscope) when software cannot see the problem.
7. **Reconstruct from telemetry** when the failure is not reproducible.

## GDB essentials

```bash
gdb ./lander
(gdb) run --scenario descent.yaml
(gdb) bt
(gdb) frame 2
(gdb) info locals
(gdb) print state.altitude_m
(gdb) watch state.mode
(gdb) break controller.cpp:87 if throttle < 0.0
(gdb) continue
```

Useful extras:

```bash
ulimit -c unlimited          # enable core dumps
gdb ./lander core            # inspect a crash after the fact
gdb -p <pid>                 # attach to a running process
(gdb) thread apply all bt    # all threads
(gdb) x/16wx &buffer         # inspect memory
```

For a remote target:

```bash
gdbserver :2345 ./lander
(gdb) target remote target-ip:2345
```

If symbols are missing, check the build type, `-g`, and whether the binary was stripped (`file`, `nm`).

## Sanitizers and dynamic analysis

Use them on the host, every day:

```bash
# Address + undefined behavior
g++ -std=c++17 -g -O1 -fsanitize=address,undefined -fno-omit-frame-pointer \
  src/*.cpp -o lander_asan

# Thread race detection
g++ -std=c++17 -g -O1 -fsanitize=thread src/*.cpp -o lander_tsan

# Memory leaks and invalid reads
valgrind --leak-check=full --track-origins=yes ./lander
```

Sanitizers change timing and memory layout. They are not a substitute for target testing, but they find entire classes of bugs that are miserable to debug on hardware.

## Timing and scheduling bugs

A timing bug can look like a math bug:

- a control loop that occasionally uses a stale sample,
- a queue that overflows under load,
- a priority inversion that only appears when a low-priority task holds a lock,
- a watchdog that resets the vehicle during a long flash write,
- a timestamp that is taken before the data is valid.

Measure:

```bash
perf stat -e cycles,instructions,cache-misses ./lander
perf record -g ./lander && perf report
strace -f -tt -T ./lander
```

On the target, log the loop start/end times, the sensor timestamp, and the age of the data used. “The loop ran at 100 Hz” is not enough; you need the distribution and the worst case.

## Embedded debugging

| Tool | What it sees |
| --- | --- |
| **JTAG/SWD probe** | Halt, registers, memory, breakpoints, flash |
| **Logic analyzer** | Digital lines, protocol timing, chip select, UART/SPI/I2C |
| **Oscilloscope** | Analog integrity, power rails, noise, rise time |
| **Serial console** | Boot logs, asserts, command shell |
| **Watchdog / reset cause** | Whether the software or the hardware reset |
| **Flight telemetry** | What the vehicle believed, at what time |

A common embedded failure is a stack overflow. Check the stack canary, the high-water mark, and the linker map. A common integration failure is a protocol mismatch: the bytes are sent, but the length, endianness, or checksum is wrong. The logic analyzer settles the argument.

## Investigating an anomaly

Use a timeline and a fault tree:

1. **Establish the timeline.** Align telemetry, command logs, and ground-station events on one time base.
2. **State the observation.** “At MET 412.3 s, the attitude rate exceeded 5°/s for 1.2 s.”
3. **List possible causes.** Sensor fault, actuator saturation, guidance command, mode transition, timing overrun, frame error, operator command.
4. **Find the discriminator.** Which observation would be true for one cause and false for the others?
5. **Reproduce or bound.** Run the scenario in SIL/HIL, inject the suspected fault, compare.
6. **Write the finding.** Include evidence, confidence, and the corrective action.

Do not stop at the first plausible cause. A good investigation explains why the other candidates are inconsistent with the data.

## Practice

1. Write a program with an out-of-bounds write. Find it with ASan, then with GDB.
2. Create a deadlock between two threads. Find it with TSan and `thread apply all bt`.
3. Inject a one-sample-delayed sensor into a control loop. Measure the phase margin loss.
4. Cause a stack overflow on a target or a simulated small stack. Find the high-water mark.
5. Take a crash log with no debugger and write a fault tree with three hypotheses and the data that would distinguish them.

<Quiz
  question="A control loop occasionally commands a huge throttle spike. The math looks correct. What is the most likely class of cause?"
  options="A compiler bug|A stale, invalid, or mis-timestamped sensor sample entering the loop|The CPU is too fast|The plot is lying"
  answer="1"
  explanation="Intermittent spikes in a nominally correct loop usually come from data validity, timing, or initialization: a stale sample, a NaN, a wrong timestamp, or a mode transition."
/>

## Resources

- [GDB documentation](https://sourceware.org/gdb/documentation/) — the manual and the CLI reference.
- [AddressSanitizer](https://clang.llvm.org/docs/AddressSanitizer.html) and [UndefinedBehaviorSanitizer](https://clang.llvm.org/docs/UndefinedBehaviorSanitizer.html).
- [ThreadSanitizer](https://clang.llvm.org/docs/ThreadSanitizer.html) — race detection.
- [Brendan Gregg’s performance tools](https://www.brendangregg.com/linuxperf.html).
- [NASA systems engineering handbook](https://www.nasa.gov/connect/ebooks/nasa-systems-engineering-handbook/) — fault trees and anomaly investigation.

Next: [frames, time & transformations](../gnc/frames-time.md) — the start of Month 2 — or review the [roadmap](../start/roadmap.md).
