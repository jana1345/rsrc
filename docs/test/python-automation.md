---
title: Python test automation
description: Pytest, serial and network fixtures, Monte Carlo analysis, and CI-friendly test reports.
---

# Python test automation

::: tip Why this matters
Flight-software test campaigns are repetitive: run the sim, inject a fault, check telemetry, repeat 1,000 times. Python is the glue. The goal is not beautiful Python; it is repeatable evidence with a clear pass/fail and a report someone can audit.
:::

## Learning objectives

- Structure a pytest suite with fixtures and parametrization.
- Talk to a target over serial, UDP, or TCP with timeouts and framing.
- Parse a binary packet and assert on fields.
- Run a Monte Carlo campaign and summarize the distribution.
- Produce a machine-readable test report for CI.

## The pytest shape

```python
# tests/test_frames.py
import numpy as np
import pytest
from gnc.frames import enu_from_mcmf

@pytest.mark.parametrize(
    "lat_deg,lon_deg,expected",
    [
        (0.0, 0.0, np.array([0.0, 1.0, 0.0])),
        (0.0, 90.0, np.array([-1.0, 0.0, 0.0])),
        (90.0, 0.0, np.array([0.0, 0.0, 1.0])),
    ],
)
def test_enu_up_axis(lat_deg, lon_deg, expected):
    up = enu_from_mcmf(lat_deg, lon_deg) @ np.array([0.0, 0.0, 1.0])
    np.testing.assert_allclose(up, expected, atol=1e-12)
```

For a full matrix, assert orthonormality and determinant:

```python
def test_rotation_is_orthonormal():
    C = enu_from_mcmf(34.0, -118.0)
    np.testing.assert_allclose(C @ C.T, np.eye(3), atol=1e-12)
    assert np.isclose(np.linalg.det(C), 1.0)
```

Parametrize edge cases. A single “happy path” test is not a test plan.

## Fixtures for a simulation

```python
import subprocess
import time
import pytest

@pytest.fixture
def sim_process():
    proc = subprocess.Popen(["./build/lander", "--scenario", "descent.yaml"])
    time.sleep(0.5)  # replace with a readiness handshake
    yield proc
    proc.terminate()
    proc.wait(timeout=5)

@pytest.fixture
def udp_link():
    import socket
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.settimeout(2.0)
    yield sock
    sock.close()
```

A fixed `sleep` is a flaky test waiting to happen. Use a readiness message or a health endpoint.

## Talking to hardware

Serial:

```python
import serial

def read_packet(port: serial.Serial) -> bytes:
    header = port.read(4)
    if header[:2] != b"\xEB\x90":
        raise ValueError(f"bad sync: {header!r}")
    length = int.from_bytes(header[2:4], "big")
    payload = port.read(length)
    if len(payload) != length:
        raise TimeoutError("short packet")
    return header + payload
```

UDP:

```python
import socket

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.bind(("0.0.0.0", 5000))
sock.settimeout(1.0)
data, addr = sock.recvfrom(4096)
```

Always set timeouts. A test that hangs is worse than a test that fails. Validate length, sync, checksum, and sequence.

## Testing a binary packet

```python
import struct

def parse_telemetry(packet: bytes) -> dict:
    if len(packet) < 16:
        raise ValueError("short packet")
    apid, seq, met, altitude, velocity = struct.unpack(">HHIdd", packet[:24])
    return {
        "apid": apid,
        "seq": seq,
        "met_s": met,
        "altitude_m": altitude,
        "velocity_mps": velocity,
    }

def test_telemetry_altitude_range():
    packet = build_telemetry(apid=0x123, seq=1, met=12.5, altitude=100.0, velocity=-2.0)
    msg = parse_telemetry(packet)
    assert 0 <= msg["altitude_m"] <= 20000
```

Test the parser with good, short, corrupt, and wrong-endian packets. The parser is an interface; it deserves interface tests.

## Monte Carlo automation

```python
import numpy as np
import pandas as pd

rng = np.random.default_rng(20261026)
rows = []
for i in range(1000):
    mass = rng.normal(12000, 240)
    thrust = rng.normal(180000, 3600)
    result = run_case(mass=mass, thrust=thrust, seed=int(rng.integers(2**32)))
    rows.append({"case": i, "mass": mass, "thrust": thrust, **result})

df = pd.DataFrame(rows)
print(df[["miss_m", "vz_mps", "fuel_kg"]].describe(percentiles=[0.5, 0.95, 0.99]))
df.to_csv("monte_carlo.csv", index=False)
```

Record the seed, the model version, and the configuration. A CSV without metadata is not evidence.

## CI and reports

```bash
pytest -q --junitxml=reports/junit.xml --html=reports/report.html --self-contained-html
```

In CI:

- run unit tests on every commit,
- run the SIL suite on a schedule and before release,
- archive reports and logs with the commit hash,
- fail the build on a non-zero exit code,
- publish coverage and static-analysis results.

A test report is only useful if it is tied to a build. Put the commit hash and model version in the report header.

## Flaky tests

Flaky tests destroy trust. Common causes:

- fixed sleeps instead of readiness checks,
- shared global state between tests,
- port collisions,
- unseeded randomness,
- real-time assumptions on a loaded CI machine,
- tests that depend on execution order.

Fix the cause. Do not add retries to hide it. If a retry is unavoidable, record it and investigate.

## Practice

1. Write pytest tests for your frame transforms and quaternion library.
2. Build a UDP fixture that starts the sim, waits for a heartbeat, runs a case, and shuts down.
3. Parse a CCSDS-like telemetry packet and test good, short, and corrupt inputs.
4. Run a 100-case Monte Carlo and produce a CSV plus a percentile table.
5. Add the suite to CI with a JUnit report and a commit hash.

<Quiz
  question="A test uses `time.sleep(2)` to wait for the simulator to start. Why is this a problem?"
  options="It is always too short|It makes the test timing-dependent and flaky; a readiness handshake is more reliable|It uses too much CPU|It prevents code coverage"
  answer="1"
  explanation="A fixed sleep is a guess. On a loaded machine it can be too short; on a fast machine it wastes time. Wait for a readiness signal instead."
/>

## Resources

- [pytest documentation](https://docs.pytest.org/) — fixtures, parametrization, plugins.
- [pytest-html](https://pytest-html.readthedocs.io/) — HTML reports.
- [pyserial](https://pyserial.readthedocs.io/) — serial communication.
- [NumPy](https://numpy.org/) and [pandas](https://pandas.pydata.org/) — analysis and reporting.
- [GitHub Actions](https://docs.github.com/en/actions) — CI for the test suite.

Next: [STK Object Model automation](./stk-automation.md).
