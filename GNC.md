---
tags:
  - Space
created: 2026-10-20
coverUrl:
---
### Month 1:

1. Space Basics 
2. STK
3. MATLAB/Simulink
4. C++
5. Llinux
6. Git
7. CMake
8. debugging

### Month 2:

- Coordinate frames 
- Quaternions
- Attitude Dynamics
- PID/LQR
- 6DOF simulation 
- Monte Carlo

### Month 3:

- SIL/HIL  
- Python test automation
- STK Object Model automation 




| Domain          | Lunar Landers                                                                                                               |
| --------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Employers       | Intuitive Machines, Blue Origin, Firefly, Astrobotic, ispace                                                                |
| Roles           | Flight SWE, EDL/GNC SWE, Comm Software Lead, Ground SWE, Software Quality/Test Lead                                         |
| Skills          | C/C++, cFS, FreeRTOS/VxWorks/RTEMs, 6DOF sims, MATLAB/Simulink, Kalman/navigation filters, CCSDS SpaceWire, V&V, NPR 7150.2 |
| Hard constraint | One-shot landing, V&V evidence                                                                                              |

| **Lunar lander**                | Flight + EDL/GNC + ground                 | One-shot landing, V&V evidence         | Flight/GNC SWE                       | C/C++ + cFS + 6DOF sims            | Medium      |
| ------------------------------- | ----------------------------------------- | -------------------------------------- | ------------------------------------ | ---------------------------------- | ----------- |

What to prioritize as FSW
- Orbital mechanics & coordinate frames
- Sensors & actuators used on landers (IMU, star trackers, radar/lidar, thrusters)
- Attitude determination & control basics
- Powered descent & landing phases
- Fault protection and mode logic

**Topics to concentrate on (ranked for your role)**

### Must-master (highest ROI for FSW / integration)
1. **Real-time embedded C/C++ for flight software**  
   Determinism, memory management, timing, interrupts, watchdogs, fault handling.

2. **Simulink → flight code pipeline**  
   Embedded Coder, model referencing, data dictionaries, code generation options, integration of auto-generated code.

3. **GNC software architecture & interfaces**  
   How guidance, navigation, and control modules talk to each other and to sensors/actuators. Timing, rate groups, data flow.

4. **Navigation fundamentals**  
   State estimation (EKF basics), sensor fusion (IMU + altimeter + TRN/vision), coordinate frames, error propagation.

5. **Powered descent guidance concepts**  
   Phases (braking, approach, vertical), Apollo-style / polynomial / optimal guidance, what the commands look like and what can go wrong.

### Strongly recommended
6. **Attitude dynamics & control basics**  
   Rigid body dynamics, thruster allocation, stability margins, actuator limits.

7. **6-DOF simulation understanding**  
   Enough to read Monte-Carlo results, diagnose closed-loop behavior, and know when the sim is lying.

8. **Verification & test**  
   Unit tests, SIL, HIL, configuration management, requirements tracing for flight code.

9. **Lunar environment specifics**  
   Gravity model, lighting/terrain challenges for TRN, plume-surface interaction effects (at high level).

### Lower priority (learn as needed)
- Full orbital mechanics / three-body problem  
- Detailed sensor hardware design  
- Propulsion thermodynamics  
- Ground software / mission operations (unless you get pulled into it)

**Focus order**  
Master 1–5 first. These let you take algorithms from your senior and turn them into reliable flight software. Everything else supports that core job.