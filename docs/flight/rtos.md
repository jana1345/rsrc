---
title: FreeRTOS, VxWorks & RTEMS
description: Tasks, priorities, queues, priority inversion, memory, and timing analysis.
---

# FreeRTOS, VxWorks & RTEMS

::: tip Why this matters
A flight computer runs more than one job: control, navigation, telemetry, command handling, fault monitoring, and logging. An RTOS gives you tasks, priorities, queues, and timing. It also gives you new ways to fail: priority inversion, deadlock, stack overflow, and missed deadlines. Learn the primitives and the analysis, not just the API.
:::

## Learning objectives

- Explain preemptive priority scheduling and rate-monotonic analysis.
- Use tasks, queues, semaphores, mutexes, and timers correctly.
- Detect and fix priority inversion and deadlock.
- Budget stack, heap, and CPU time.
- Compare FreeRTOS, VxWorks, and RTEMS at a practical level.
- Measure jitter and deadline overruns on a target.

## Scheduling in one page

A preemptive RTOS runs the highest-priority ready task. A higher-priority task that becomes ready preempts the current task. A task blocks when it waits on a queue, semaphore, or delay.

Rate-monotonic scheduling assigns higher priorities to shorter-period tasks. For $n$ independent periodic tasks with utilization

$$
U = \sum_{i=1}^{n}\frac{C_i}{T_i},
$$

a sufficient (conservative) schedulability bound is

$$
U \le n\left(2^{1/n}-1\right).
$$

For large $n$ this approaches $\ln 2 \approx 0.693$. The bound is sufficient, not necessary; response-time analysis can prove more systems schedulable.

| Symbol | Meaning |
| --- | --- |
| $C_i$ | Worst-case execution time of task $i$ |
| $T_i$ | Period of task $i$ |
| $D_i$ | Deadline (often $D_i \le T_i$) |
| $U$ | CPU utilization |

## The primitives

| Primitive | Use | Trap |
| --- | --- | --- |
| **Task** | A thread of execution with a priority and stack | Stack too small, priority too high |
| **Queue** | Pass data between tasks | Overflow, blocking producer, stale data |
| **Binary semaphore** | Signal an event | Lost wakeups, priority inversion |
| **Counting semaphore** | Count resources/events | Unbounded counts |
| **Mutex** | Mutual exclusion with ownership | Priority inversion, deadlock |
| **Timer** | Periodic or one-shot callback | Long callbacks, reentrancy |
| **Event group** | Wait for multiple flags | Complex wait semantics |

Use a queue for data, a semaphore for an event, and a mutex for a shared resource. Do not use a mutex as a signal.

## Priority inversion, again

Three tasks:

- **H** (high): control loop, period 10 ms.
- **M** (medium): telemetry, period 50 ms.
- **L** (low): logging, period 500 ms.

L holds a mutex. H becomes ready and blocks on the mutex. M becomes ready and preempts L. H is now waiting for L, which cannot run because M is running. H’s deadline is missed even though H never touched M’s data.

Fixes:

- **Priority inheritance:** L inherits H’s priority while holding the mutex.
- **Priority ceiling:** L runs at the ceiling priority of the mutex.
- **Design:** keep shared resources out of the high-rate path.
- **Lock-free queue:** single producer/single consumer ring buffer.

FreeRTOS mutexes support priority inheritance. VxWorks and RTEMS have their own mechanisms. Verify the configuration.

## Memory

Flight RTOS configurations usually prefer static allocation:

- create tasks, queues, and timers at initialization,
- use a static heap or no heap,
- size stacks from measured high-water marks plus margin,
- check for stack overflow with a canary or MPU,
- bound every queue,
- avoid `malloc` in the flight loop.

FreeRTOS has several heap schemes (`heap_1` through `heap_5`). `heap_1` only allocates and never frees; it is a common choice when all objects are created at startup. Read the scheme before choosing it.

VxWorks and RTEMS provide memory pools and partitioning. Use them deliberately; a partition is a fault-containment boundary.

## FreeRTOS, VxWorks, RTEMS

| Aspect | FreeRTOS | VxWorks | RTEMS |
| --- | --- | --- | --- |
| **License** | MIT | Commercial | Open source (RTEMS license) |
| **Typical use** | Microcontrollers, small payloads | Heritage flight, commercial | NASA/spacecraft, open source |
| **Scheduling** | Preemptive priority, optional time slicing | Preemptive priority, optional round-robin | Preemptive priority, rate-monotonic support |
| **API style** | C macros/functions | POSIX-like + Wind River APIs | POSIX + classic RTEMS APIs |
| **Memory** | Heap schemes, static options | Pools, partitions | Regions, partitions, heap |
| **Ecosystem** | Large, easy to start | Mature tools, commercial support | SPARC/ARM/PowerPC, space heritage |
| **Learning curve** | Low | Medium | Medium |

You do not need all three. Learn one deeply (FreeRTOS is easiest to run on a hobby board) and understand the concepts that transfer.

## A FreeRTOS sketch

```c
#include "FreeRTOS.h"
#include "task.h"
#include "queue.h"

static QueueHandle_t sensor_queue;

static void control_task(void *arg) {
    SensorSample sample;
    TickType_t last_wake = xTaskGetTickCount();

    for (;;) {
        if (xQueueReceive(sensor_queue, &sample, pdMS_TO_TICKS(5)) == pdPASS) {
            control_update(&sample);
        } else {
            control_hold();          // timeout: no fresh sample
        }
        vTaskDelayUntil(&last_wake, pdMS_TO_TICKS(10));
    }
}

void app_start(void) {
    sensor_queue = xQueueCreate(8, sizeof(SensorSample));
    configASSERT(sensor_queue != NULL);

    xTaskCreate(control_task, "control", 1024, NULL, 5, NULL);
    vTaskStartScheduler();
}
```

`vTaskDelayUntil` gives a fixed period relative to the previous wake time. A simple `vTaskDelay` drifts by the execution time.

## Timing analysis

For each task, measure:

- release time, start time, end time,
- execution time distribution,
- blocking time (mutexes, queues),
- interrupt interference,
- deadline misses.

Use a GPIO toggle and a logic analyzer, or a cycle counter and a trace buffer. A printf in the loop changes the timing you are trying to measure.

## Practice

1. Run three tasks with periods 10, 50, and 500 ms on FreeRTOS or RTEMS. Toggle a GPIO in each and measure jitter.
2. Create a priority-inversion scenario with a mutex. Observe it. Enable priority inheritance and compare.
3. Overflow a queue deliberately. What does the producer do? What should it do?
4. Measure stack high-water marks for each task. Add 30% margin.
5. Run a CPU-load stress test and find the first deadline miss.

<Quiz
  question="Why is a mutex with priority inheritance safer than a plain binary semaphore for shared data?"
  options="It is faster in all cases|It lets the holder inherit the waiter’s priority, bounding priority inversion|It removes the need for a scheduler|It automatically prevents deadlock"
  answer="1"
  explanation="Priority inheritance bounds the time a high-priority task waits for a low-priority holder. It does not eliminate deadlock or make every design safe."
/>

## Resources

- [FreeRTOS documentation](https://www.freertos.org/Documentation/RTOS_book.html) — the free RTOS book and API reference.
- [VxWorks](https://www.windriver.com/products/vxworks) — commercial RTOS documentation.
- [RTEMS](https://www.rtems.org/) — open-source RTOS with space heritage.
- [Rate-monotonic analysis](https://en.wikipedia.org/wiki/Rate-monotonic_scheduling) — the classic scheduling result.
- [NASA cFS](https://nasa.github.io/cFS/) — a flight framework that runs on RTEMS/VxWorks/Linux.

Next: [CCSDS & SpaceWire](./ccsds-spacewire.md).
