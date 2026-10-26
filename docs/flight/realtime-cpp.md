---
title: Real-time embedded C++
description: Determinism, bounded execution, memory, interrupts, watchdogs, and fault containment.
---

# Real-time embedded C++

::: tip Why this matters
“Real-time” does not mean “fast.” It means the answer is correct **and** it arrives before the deadline, every time. A lunar lander control loop that is late is wrong, even if the math is perfect. This is the deep dive on the constraints that separate flight C++ from application C++.
:::

## Learning objectives

- Define hard, firm, and soft real-time, and explain jitter.
- Measure worst-case execution time (WCET) and response time.
- Design fixed-memory, bounded-execution tasks.
- Handle interrupts, shared data, and priority inversion correctly.
- Use watchdogs, assertions, and fault containment without hiding failures.
- Explain the radiation and single-event-effects context.

## Determinism is the product

A flight control loop has a period $T$ and a deadline $D \le T$. Each iteration must:

1. read inputs,
2. compute,
3. write outputs,
4. finish before the deadline.

The **worst-case execution time** (WCET) plus interference must be less than the deadline. Average performance is irrelevant if one iteration runs long.

| Term | Meaning |
| --- | --- |
| **Jitter** | Variation in start/end time from cycle to cycle |
| **Latency** | Time from input to output |
| **WCET** | Longest possible execution time on the target |
| **Response time** | Time from event to completed response |
| **Utilization** | Fraction of CPU time consumed by tasks |

A 100 Hz loop with 2 ms average execution and a 12 ms worst case is not a 100 Hz loop. It is a loop that misses deadlines under the right conditions.

## Fixed memory

The standard flight pattern:

- allocate all buffers and objects during initialization,
- never allocate in the control loop,
- use fixed-capacity containers,
- bound every queue, buffer, and string,
- check every push for overflow.

```cpp
template <typename T, std::size_t N>
class RingBuffer {
public:
    bool push(const T& value) {
        const std::size_t next = (head_ + 1) % N;
        if (next == tail_) return false;  // full
        data_[head_] = value;
        head_ = next;
        return true;
    }

    bool pop(T& out) {
        if (head_ == tail_) return false; // empty
        out = data_[tail_];
        tail_ = (tail_ + 1) % N;
        return true;
    }

private:
    std::array<T, N> data_{};
    std::size_t head_{0};
    std::size_t tail_{0};
};
```

The overflow policy is a design decision. Dropping the newest sample is different from overwriting the oldest. Document it and test it.

## Bounded execution

Avoid:

- unbounded `while` loops and recursion,
- waiting forever on a lock or a device,
- dynamic dispatch in a hard deadline path,
- large `memcpy` or floating-point operations without a WCET estimate,
- logging that can block,
- flash writes in a control loop.

Prefer:

- fixed iteration counts,
- timeouts on every wait,
- static dispatch or bounded tables,
- preallocated buffers,
- rate-monotonic task design,
- non-blocking logging with a bounded queue.

A loop that is “usually fast” is not bounded. Measure the tail.

## Interrupts and shared data

An interrupt can arrive between any two instructions. Shared data needs a synchronization strategy:

- **Disable interrupts** for a very short critical section, then re-enable.
- **Atomics** for simple flags and counters.
- **Single-writer/single-reader ring buffer** for streaming data.
- **Mutex** when a resource must be held across a longer operation, with a priority-inheritance protocol.

`volatile` tells the compiler the value can change; it does **not** make an operation atomic. A 32-bit read may be atomic on some targets and not others. Check the architecture.

## Priority inversion

A high-priority control task waits on a mutex held by a low-priority task. A medium-priority task preempts the low-priority task. The high-priority task is now blocked by the medium-priority task. This is unbounded priority inversion.

Fixes:

- priority inheritance (the holder inherits the waiter’s priority),
- priority ceiling (the holder runs at a ceiling priority),
- design the system so high-rate tasks do not share locks with low-rate tasks,
- keep critical sections short.

Test it. A priority-inversion bug is easy to miss in a lightly loaded system.

## Watchdogs and fault containment

A watchdog is a timer that resets the system if the software fails to kick it. It is a last line of defense, not a substitute for correctness.

Design rules:

- kick the watchdog only when all critical tasks have met their deadlines,
- use a windowed watchdog if available (too early is also a fault),
- log the reset cause,
- preserve fault context across reset,
- test the reset path,
- make safe mode the default after reset.

Fault containment:

- partition memory and CPU where the hardware supports it,
- validate all external inputs,
- check commands against limits,
- fail to a safe state on invalid data,
- avoid a single fault taking down both redundant channels,
- log events with timestamps.

## Radiation and single-event effects

Flight computers see:

- **SEU** (single-event upset): a bit flips,
- **SEL** (single-event latch-up): a device draws excessive current,
- **SEFI** (single-event functional interrupt): a function hangs or resets,
- **TID** (total ionizing dose): long-term degradation.

Mitigations:

- ECC/EDAC memory,
- watchdogs and periodic scrubbing,
- CRC on memory and messages,
- voting/TMR where the criticality justifies it,
- safe modes and recovery,
- avoiding critical single points of failure.

You do not need to design the hardware, but you need to know why the software must not assume memory is stable.

## A fixed-rate task skeleton

```cpp
#include <chrono>
#include <cstdint>

using clock = std::chrono::steady_clock;

void control_task() {
    const auto period = std::chrono::milliseconds(10);
    auto next = clock::now();

    while (running) {
        next += period;

        read_sensors();
        nav_update();
        guidance_update();
        control_update();
        write_actuators();

        if (all_critical_tasks_healthy()) {
            kick_watchdog();
        }

        const auto now = clock::now();
        if (now > next) {
            record_deadline_miss(now - next);
            // Do not blindly continue; the mode manager decides.
        }

        std::this_thread::sleep_until(next);
    }
}
```

On a bare-metal target, replace `sleep_until` with the RTOS delay-until or a timer interrupt. The important part is the absolute deadline, not a relative sleep.

## Testing real-time code

- **Host unit tests** for logic.
- **Target timing tests** with instrumentation on the worst-case path.
- **Stress tests** with maximum input rate and queue pressure.
- **Fault injection** for watchdog, memory corruption, and stale data.
- **Long-duration tests** for leaks, counters, and drift.
- **Static analysis** for undefined behavior, MISRA, and dangerous patterns.
- **Stack analysis** for high-water marks.

A logic test on a laptop says nothing about WCET.

## Practice

1. Convert a `std::vector`-based buffer to a fixed-capacity ring buffer. Write overflow tests.
2. Measure the WCET of a control function on your target or with a cycle counter.
3. Create a priority-inversion scenario with three threads and a mutex. Observe it with tracing. Fix it with priority inheritance.
4. Add a watchdog and a fault that blocks the main loop. Verify reset and safe mode.
5. Run a static analyzer and fix the undefined-behavior findings.

<Quiz
  question="A task averages 2 ms and has a 10 ms period. Why is that not enough to prove schedulability?"
  options="Because the CPU is always faster than the timer|Because the worst-case execution time and interference can exceed the deadline even if the average does not|Because 10 ms is always too slow|Because C++ cannot run at 100 Hz"
  answer="1"
  explanation="Schedulability depends on the worst case, not the average. Interrupts, cache misses, bus contention, and higher-priority tasks can push a single iteration past the deadline."
/>

## Resources

- [JPL Power of Ten rules](https://yosefk.com/c++fqa/) — a widely cited set of safety-critical coding rules.
- MISRA C/C++ — the automotive/industrial coding standards used across safety-critical software.
- [NASA cFS](https://nasa.github.io/cFS/) — a real flight software framework.
- [FreeRTOS](https://www.freertos.org/) — a small RTOS for practicing tasks, queues, and priorities.
- [Barr Group embedded C coding standard](https://barrgroup.com/embedded-systems/books/embedded-c-coding-standard) — practical rules with rationale.

Next: [Simulink → flight code](./simulink-pipeline.md).
