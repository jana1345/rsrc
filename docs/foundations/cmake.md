---
title: CMake & builds
description: Targets, toolchains, cross-compilation, tests, and reproducible embedded builds.
---

# CMake & builds

::: tip Why this matters
A flight-software build must be reproducible, warning-clean, testable, and cross-compiled for a target that may not be the machine you develop on. CMake is the common glue. Learn targets and usage requirements, not a pile of global flags.
:::

## Learning objectives

- Define libraries, executables, and tests as CMake targets.
- Use target-scoped include directories, compile options, and link libraries.
- Cross-compile with a toolchain file and a preset.
- Run tests with CTest and enable sanitizers/coverage.
- Read a linker map and a size report.

## The mental model

A `target` is the unit of build. It has sources, dependencies, properties, and usage requirements. Global commands like `include_directories` and `add_definitions` leak across the project; target commands do not.

```cmake
cmake_minimum_required(VERSION 3.24)
project(lunar_gnc LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

add_library(gnc_math
  src/math/quaternion.cpp
  src/math/frames.cpp
)
target_include_directories(gnc_math PUBLIC include)
target_compile_features(gnc_math PUBLIC cxx_std_17)
target_compile_options(gnc_math PRIVATE -Wall -Wextra -Wpedantic -Werror)

add_executable(lander src/app/main.cpp)
target_link_libraries(lander PRIVATE gnc_math)

enable_testing()
add_executable(test_quaternion tests/test_quaternion.cpp)
target_link_libraries(test_quaternion PRIVATE gnc_math)
add_test(NAME quaternion COMMAND test_quaternion)
```

`PUBLIC` means “this target needs it, and so does anything that links to it.” `PRIVATE` means “only this target.” Getting that distinction right keeps transitive dependencies sane.

## Build types and flags

```bash
cmake -S . -B build/debug -G Ninja -DCMAKE_BUILD_TYPE=Debug
cmake --build build/debug
ctest --test-dir build/debug --output-on-failure
```

Debug builds should have:

- `-g` and no aggressive optimization,
- `-Wall -Wextra -Wpedantic -Werror`,
- AddressSanitizer and UndefinedBehaviorSanitizer when the target allows it,
- assertions enabled.

Release builds should have:

- optimization that you have actually tested,
- the same warnings and static analysis,
- a map file and size report,
- reproducible timestamps and paths if required.

## Cross-compilation

A toolchain file describes the target:

```cmake
# toolchains/arm-none-eabi.cmake
set(CMAKE_SYSTEM_NAME Generic)
set(CMAKE_SYSTEM_PROCESSOR arm)
set(CMAKE_C_COMPILER arm-none-eabi-gcc)
set(CMAKE_CXX_COMPILER arm-none-eabi-g++)
set(CMAKE_TRY_COMPILE_TARGET_TYPE STATIC_LIBRARY)
```

Then configure with:

```bash
cmake -S . -B build/target -G Ninja \
  -DCMAKE_TOOLCHAIN_FILE=toolchains/arm-none-eabi.cmake \
  -DCMAKE_BUILD_TYPE=Release
```

For bare-metal targets you will also need:

- `-mcpu`, `-mfloat-abi`, `-mfpu` (or the equivalent),
- a linker script (`-T linker.ld`),
- `--specs=nano.specs` or your libc choice,
- `-nostdlib` if you provide your own startup code,
- `-Wl,-Map=app.map` to inspect placement,
- `-Wl,--print-memory-usage` for a quick region check.

## Presets

Do not make every developer retype fifteen `-D` flags. Use `CMakePresets.json`:

```json
{
  "version": 6,
  "configurePresets": [
    {
      "name": "host-debug",
      "generator": "Ninja",
      "binaryDir": "${sourceDir}/build/host-debug",
      "cacheVariables": {
        "CMAKE_BUILD_TYPE": "Debug",
        "CMAKE_EXPORT_COMPILE_COMMANDS": "ON"
      }
    },
    {
      "name": "target-release",
      "generator": "Ninja",
      "binaryDir": "${sourceDir}/build/target-release",
      "toolchainFile": "toolchains/arm-none-eabi.cmake",
      "cacheVariables": { "CMAKE_BUILD_TYPE": "Release" }
    }
  ]
}
```

```bash
cmake --preset host-debug
cmake --build --preset host-debug
```

`compile_commands.json` makes clangd, static analyzers, and IDEs work properly. Generate it.

## Tests, sanitizers, coverage

```cmake
option(ENABLE_SANITIZERS "Build with ASan/UBSan" OFF)
if(ENABLE_SANITIZERS)
  target_compile_options(gnc_math PRIVATE -fsanitize=address,undefined -fno-omit-frame-pointer)
  target_link_options(gnc_math PRIVATE -fsanitize=address,undefined)
endif()
```

For coverage with GCC/Clang:

```bash
cmake -S . -B build/cov -DCMAKE_BUILD_TYPE=Debug \
  -DCMAKE_CXX_FLAGS="--coverage" -DCMAKE_EXE_LINKER_FLAGS="--coverage"
cmake --build build/cov
ctest --test-dir build/cov
gcovr -r . build/cov
```

Coverage tells you what was executed, not whether the assertions were meaningful. Pair it with requirements-based tests.

## Reproducibility

- Pin compiler versions and dependency versions.
- Avoid embedding absolute paths and build timestamps unless required.
- Record the exact configure command and toolchain file with the artifact.
- Build from a clean directory in CI.
- Archive the map file and size report with the release.

> **Flight-software lens:** the build system is part of the evidence. If you cannot reproduce the binary, you cannot defend the test results. A tag without a reproducible build is just a label.

## Practice

1. Convert a single-file C++ program into a library plus an executable plus a test.
2. Add `-Wall -Wextra -Wpedantic -Werror` and fix every warning.
3. Add a sanitizer preset and run the tests.
4. Cross-compile a hello-world for an ARM target (or a simulated target) with a toolchain file.
5. Produce a map file and explain where `.text`, `.data`, `.bss`, and the stack live.

<Quiz
  question="What is the main advantage of target-scoped CMake commands such as `target_include_directories`?"
  options="They compile faster than global commands|They keep dependencies and flags local, so they do not leak to unrelated targets|They automatically cross-compile|They remove the need for a toolchain file"
  answer="1"
  explanation="Target-scoped usage requirements make dependencies explicit and prevent global flag pollution. They do not change compilation speed or cross-compilation by themselves."
/>

## Resources

- [CMake documentation](https://cmake.org/documentation/) — the `target_*` commands and presets.
- [An Introduction to Modern CMake](https://cliutils.gitlab.io/modern-cmake/) — free and practical.
- [CMake presets](https://cmake.org/cmake/help/latest/manual/cmake-presets.7.html) — configure/build/test presets.
- [Compiler Explorer](https://godbolt.org/) — inspect the generated code and flags.

Next: [debugging & verification tools](./debugging.md).
