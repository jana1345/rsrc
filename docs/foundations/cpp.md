---
title: Modern C++ for flight
description: The subset of C++ that survives contact with a flight computer.
---

# Modern C++ for flight

::: tip Why this matters
Flight software is not web development with a smaller screen. The constraints are different: fixed memory, bounded execution time, no operating system to clean up after you, and a bug that can end a mission. Modern C++ helps, but only if you use it deliberately. This page is the subset you need before the deep dive in [real-time embedded C++](../flight/realtime-cpp.md).
:::

## Learning objectives

- Write C++ with no dynamic allocation after initialization.
- Choose fixed-width types and avoid undefined behavior.
- Use `const`, references, and value types to make ownership obvious.
- Understand why exceptions, RTTI, and unbounded containers are usually banned.
- Build a small fixed-capacity buffer and a quaternion type.

## The flight C++ subset

You can write excellent flight software with a small language subset:

| Use | Avoid (or justify) |
| --- | --- |
| `std::array`, `std::span`, fixed-capacity containers | `std::vector`, `std::string`, `std::map` in the flight loop |
| `const`, `constexpr`, `enum class` | Macros for constants, unscoped enums |
| Value types and composition | Deep inheritance hierarchies and virtual dispatch in hot paths |
| Error codes, `std::optional`, status structs | Exceptions across module boundaries |
| `std::atomic` for simple flags | `volatile` as a synchronization primitive |
| Static allocation at initialization | `new`, `malloc`, and hidden allocations after init |
| Bounded loops | Recursion, unbounded `while` loops, waiting forever |

“Modern” does not mean “use every feature.” It means “make the invariants visible to the compiler and the reviewer.”

## Memory: decide where everything lives

A flight application usually has three memory regions:

1. **Static/global** — allocated at load time, sized at compile time.
2. **Stack** — per task, fixed budget, overflow is fatal.
3. **Heap** — often avoided entirely, or used only during initialization with a bounded allocator.

A common rule: **no dynamic allocation after initialization.** That means no `std::vector::push_back`, no `std::string` concatenation, no `std::make_shared` in the control path. If a container can grow, it can fail at the worst possible moment.

```cpp
#include <array>
#include <cstddef>
#include <cstdint>

template <typename T, std::size_t N>
class FixedQueue {
public:
    bool push(const T& value) {
        if (size_ == N) return false;
        data_[head_] = value;
        head_ = (head_ + 1) % N;
        ++size_;
        return true;
    }

    bool pop(T& out) {
        if (size_ == 0) return false;
        out = data_[tail_];
        tail_ = (tail_ + 1) % N;
        --size_;
        return true;
    }

    std::size_t size() const { return size_; }
    static constexpr std::size_t capacity() { return N; }

private:
    std::array<T, N> data_{};
    std::size_t head_{0};
    std::size_t tail_{0};
    std::size_t size_{0};
};
```

The failure mode is explicit: `push` returns `false` when full. The caller must decide whether to drop the sample, overwrite the oldest, or raise a fault. That is a design decision, not a hidden allocation.

## Types, overflow, and undefined behavior

- Use `<cstdint>` types (`std::uint32_t`, `std::int16_t`) for wire formats and registers.
- Know the width of every field in a packet. `int` is not a specification.
- Check arithmetic before it overflows, especially in counters and timestamps.
- Use `static_cast` for intentional conversions. Avoid C-style casts.
- Do not type-pun through unions or pointer casts; use `std::memcpy` or a serialization function.
- Remember alignment and padding when mapping a struct to a hardware or wire layout. Use explicit serialization, not `reinterpret_cast`.

```cpp
// Portable packet encoding, no struct padding surprises.
std::array<std::uint8_t, 12> encode(const Message& m) {
    std::array<std::uint8_t, 12> out{};
    out[0] = m.apid & 0xFF;
    out[1] = (m.apid >> 8) & 0xFF;
    out[2] = m.seq & 0xFF;
    out[3] = (m.seq >> 8) & 0xFF;
    // ... explicit fields, explicit endianness
    return out;
}
```

## Floating point

Flight software often uses `float` for size and speed, and `double` for navigation. Both have traps:

- `NaN` and `Inf` propagate. Check sensor validity before the math, and add a final sanity check on commands.
- Do not compare floats with `==` unless you mean exact bit equality.
- `-ffast-math` can change NaN behavior and reassociate operations. Do not enable it casually in flight code.
- Float precision at 1,000 m is fine for altitude; at 384,400 km it is not. Choose based on the dynamic range.
- Generated code may use different rounding or fused multiply-add behavior. Test the target build, not just the host.

## Errors without exceptions

A flight application needs a predictable response to failure. A common pattern is a status type or error code:

```cpp
enum class Status : std::uint8_t { ok, invalid_argument, not_ready, fault };

struct Result {
    Status status;
    double value;
};

Result compute_throttle(double altitude_m, double velocity_mps) {
    if (altitude_m < 0.0 || !std::isfinite(velocity_mps)) {
        return {Status::invalid_argument, 0.0};
    }
    // ...
    return {Status::ok, 0.0};
}
```

The caller must handle every status. In C++23 you can use `std::expected`; in C++17, a small project-specific type is fine. The important part is that failure is part of the interface, not an exception that unwinds through an unknown stack.

## Concurrency, in one page

You will meet interrupts, tasks, and shared data. The minimum rules:

- Mark interrupt-shared data `volatile` only for the compiler’s benefit; use atomics or critical sections for synchronization.
- Keep critical sections short and bounded.
- Do not call blocking functions from an interrupt.
- Know the priority of every task and the shared resources it touches.
- Prefer a single-writer/single-reader ring buffer over a lock when the pattern allows it.
- Test with the real scheduling policy, not just on your laptop.

## Practice

1. Implement `FixedQueue` and write tests for full, empty, and wrap-around behavior.
2. Write a `Quat` value type with `norm`, `normalize`, `conjugate`, and `operator*`. Test that $q \otimes q^{-1}$ is identity.
3. Take a function that returns `std::vector<double>` and rewrite it to fill a `std::array` with a maximum size. Make overflow explicit.
4. Compile with `-Wall -Wextra -Werror -fsanitize=address,undefined` and fix everything.

<Quiz
  question="Why is `std::vector::push_back` usually banned in a flight control loop?"
  options="It is slower than a raw array in every case|It can allocate and fail unpredictably, breaking determinism and memory bounds|It cannot store floating-point values|It is not part of standard C++"
  answer="1"
  explanation="The problem is not raw speed; it is unbounded, hidden allocation and failure at runtime. Flight loops need fixed memory and predictable execution."
/>

## Resources

- [C++ Core Guidelines](https://isocpp.github.io/CppCoreGuidelines/) — especially the sections on resource management and bounds.
- [JPL Institutional Coding Standard for C](https://yosefk.com/c++fqa/); the “Power of Ten” rules are widely cited.
- MISRA C++ and AUTOSAR C++ guidelines — commercial standards used in safety-related software.
- [Compiler Explorer](https://godbolt.org/) — see what your abstractions actually generate.

Next: [Linux for embedded work](./linux.md) or the deep dive [real-time embedded C++](../flight/realtime-cpp.md).
