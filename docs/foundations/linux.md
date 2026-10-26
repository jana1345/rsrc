---
title: Linux for embedded work
description: Shell, processes, real-time scheduling, networking, and target-side tools.
---

# Linux for embedded work

::: tip Why this matters
Most GNC development happens on Linux, even when the flight computer runs a real-time operating system. You need to build, cross-compile, inspect binaries, capture packets, measure jitter, and debug a target over SSH or serial. This page is the working set, not a Linux administration course.
:::

## Learning objectives

- Navigate a Linux system and inspect processes, memory, and devices.
- Use `chrt`, `taskset`, `nice`, and `ulimit` to control execution.
- Capture and inspect network traffic and serial data.
- Read an ELF binary with `file`, `ldd`, `nm`, `objdump`, and `readelf`.
- Measure scheduling jitter instead of guessing.

## The shell tools you will actually type

```bash
# Find things
grep -R "thrust" src/
find . -name "*.cpp" -newer CMakeLists.txt
rg "apid" include/                # ripgrep, if installed

# Inspect processes
ps -eo pid,pri,rtprio,cmd --sort=-pri
top -H                            # threads
pidstat -t -p <pid> 1             # per-thread CPU

# Files and permissions
ls -lah
stat file
chmod 640 file
chown user:group file

# Logs
journalctl -u myservice -f
dmesg -w
```

Learn `man` and `--help`. The goal is not to memorize flags; it is to answer a question without opening a browser.

## Processes, signals, and scheduling

A process is a running program with its own address space. Threads share that space. Signals are asynchronous notifications (`SIGTERM`, `SIGINT`, `SIGSEGV`, `SIGALRM`).

Scheduling policies you should know:

| Policy | Meaning | Use |
| --- | --- | --- |
| `SCHED_OTHER` | Normal time-sharing | Desktop, build tools |
| `SCHED_FIFO` | Fixed priority, runs until it blocks or yields | Hard real-time tasks |
| `SCHED_RR` | Fixed priority with time slicing | Real-time tasks that need fairness |
| `SCHED_DEADLINE` | Deadline-based | Advanced, budget-aware tasks |

```bash
# Run a task at real-time priority 80 on CPU 2
sudo chrt -f 80 taskset -c 2 ./control_loop
```

Be careful: a high-priority busy loop can starve the machine. Use real-time scheduling on a target, with a watchdog and a way to recover.

## Measuring jitter

Do not say “it runs at 100 Hz” because the loop has a 10 ms sleep. Measure the wake-up-to-wake-up interval and the time spent in the loop.

```bash
sudo apt install rt-tests
sudo cyclictest -p 80 -t 1 -n -i 1000 -l 10000
```

Look at the maximum latency, not just the average. A single 2 ms outlier can miss a deadline. On a general-purpose Linux box, disable power management, isolate a CPU, and avoid debug interfaces when measuring.

## Files, devices, and serial

```bash
ls -l /dev/ttyUSB* /dev/ttyACM*
dmesg | tail -20
sudo usermod -aG dialout "$USER"   # log out and back in
picocom -b 115200 /dev/ttyUSB0
```

For a target board, you will also meet:

- `/proc` and `/sys` for kernel and device state,
- `udev` rules for stable device names,
- `systemd` services for startup and recovery,
- `screen` or `tmux` for a persistent serial console.

## Networking

```bash
ip addr
ip route
ss -lunp                  # listening UDP sockets
tcpdump -i any -w capture.pcap udp port 5000
nc -u 192.168.1.10 5000   # send a UDP datagram
```

For FSW work, you will debug packet loss, timestamp drift, and endianness. Capture the bytes, not just the log message. Wireshark can decode many space protocols if you write a dissector or use a plugin.

## Binaries and libraries

```bash
file build/lander
ldd build/lander            # dynamic dependencies
nm -C build/lander | grep " T "   # symbols
objdump -d build/lander     # disassembly
readelf -h build/lander     # ELF header, architecture
size build/lander           # text/data/bss
```

On an embedded target, `ldd` may not exist. Use `readelf -d` and `objdump` on the host. A statically linked binary is easier to deploy but larger; know which one you built.

## Debugging and tracing

```bash
gdb ./lander
strace -f -e trace=network ./lander
perf top
perf record -g ./lander && perf report
valgrind --tool=memcheck ./lander
```

For a remote target:

```bash
gdbserver :2345 ./lander
gdb ./lander
(gdb) target remote target-ip:2345
```

If the target has no Linux, you will use a hardware probe (JTAG/SWD) instead. The concepts are the same: halt, inspect registers and memory, set breakpoints, step.

## Practice

1. Write a C++ loop that wakes every 10 ms and records the actual interval for 10,000 iterations. Plot a histogram of jitter.
2. Run it normally, then with `chrt -f 80`, then with `taskset` on an isolated CPU. Compare the worst case.
3. Capture a UDP stream with `tcpdump`, open it in Wireshark, and decode the payload as hex.
4. Build a binary twice, once dynamically and once statically. Compare `ldd`, `size`, and startup time.
5. Connect to a serial device and send a framed packet. Verify the bytes on a logic analyzer or with a loopback.

<Quiz
  question="You need to know whether a 100 Hz control loop is actually meeting its deadline. What is the most direct measurement?"
  options="The average CPU usage from top|The distribution of wake-up intervals and loop execution time, including the worst case|The number of lines of code in the loop|The compiler optimization level"
  answer="1"
  explanation="Deadlines are about the tail, not the average. Measure the interval distribution and the loop execution time, then compare the worst case to the period."
/>

## Resources

- [The Linux Command Line](https://linuxcommand.org/tlcl.php) — free book for shell fundamentals.
- [Brendan Gregg’s Linux performance tools](https://www.brendangregg.com/linuxperf.html) — the map of what to use when.
- [rt-tests and cyclictest](https://wiki.linuxfoundation.org/realtime/documentation/howto/tools/cyclictest/start) — real-time latency measurement.
- [FreeRTOS](https://www.freertos.org/) — when Linux is not the target.

Next: [Git for flight software](./git.md).
