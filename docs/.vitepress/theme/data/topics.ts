export type GroupId = 'm1' | 'm2' | 'm3' | 'm4' | 'mission'

export interface Topic {
  /** Root-absolute site path, no trailing slash. */
  path: string
  title: string
  group: GroupId
  /** Estimated reading time in minutes. Exercises roughly double this. */
  minutes: number
  /** Deep-dive page, rather than a short orientation page. */
  core?: boolean
  blurb: string
}

export interface Group {
  id: GroupId
  title: string
  short: string
  subtitle: string
}

export const groups: Group[] = [
  {
    id: 'm1',
    title: 'Month 1 · Foundations',
    short: 'Month 1',
    subtitle: 'Space vocabulary, tools, and the engineering habits you need before the GNC math.'
  },
  {
    id: 'm2',
    title: 'Month 2 · GNC core',
    short: 'Month 2',
    subtitle: 'Frames, quaternions, dynamics, control, 6DOF, estimation, guidance, and architecture.'
  },
  {
    id: 'm3',
    title: 'Month 3 · Test & integration',
    short: 'Month 3',
    subtitle: 'Verification evidence, SIL/HIL, automation, and STK scripting.'
  },
  {
    id: 'm4',
    title: 'Month 4 · Flight software',
    short: 'Month 4',
    subtitle: 'The flight-software stack the original plan left out: real-time C++, cFS, RTOS, CCSDS, and NPR 7150.2.'
  },
  {
    id: 'mission',
    title: 'Mission & vehicle',
    short: 'Mission',
    subtitle: 'The lunar context that changes every software decision, plus the bridge to your LLV console.'
  }
]

export const topics: Topic[] = [
  // Month 1
  {
    path: '/foundations/space-basics',
    title: 'Space & lunar mission basics',
    group: 'm1',
    minutes: 90,
    blurb: 'Orbits, delta-v, the rocket equation, and the phases of a lunar landing mission.'
  },
  {
    path: '/foundations/frames-primer',
    title: 'Frames & time primer',
    group: 'm1',
    minutes: 60,
    blurb: 'Enough frame and time vocabulary to use STK without guessing what the numbers mean.'
  },
  {
    path: '/foundations/stk',
    title: 'STK essentials',
    group: 'm1',
    minutes: 120,
    blurb: 'Build a lunar scenario, propagate an orbit, compute access, and read the reports.'
  },
  {
    path: '/foundations/matlab-simulink',
    title: 'MATLAB & Simulink essentials',
    group: 'm1',
    minutes: 120,
    blurb: 'The modeling workflow you will use for plant models, controllers, and code generation.'
  },
  {
    path: '/foundations/cpp',
    title: 'Modern C++ for flight',
    group: 'm1',
    minutes: 150,
    blurb: 'The subset of C++ that survives contact with a flight computer: fixed memory, clear ownership, no surprises.'
  },
  {
    path: '/foundations/linux',
    title: 'Linux for embedded work',
    group: 'm1',
    minutes: 90,
    blurb: 'Shell, processes, real-time scheduling, networking, and the tools you need on a target.'
  },
  {
    path: '/foundations/git',
    title: 'Git for flight software',
    group: 'm1',
    minutes: 60,
    blurb: 'Branches, reviews, tags, baselines, and the traceability a flight program expects.'
  },
  {
    path: '/foundations/cmake',
    title: 'CMake & builds',
    group: 'm1',
    minutes: 90,
    blurb: 'Targets, toolchains, cross-compilation, tests, and reproducible embedded builds.'
  },
  {
    path: '/foundations/debugging',
    title: 'Debugging & verification tools',
    group: 'm1',
    minutes: 120,
    blurb: 'GDB, sanitizers, tracing, timing analysis, and how to investigate a failure you cannot reproduce.'
  },

  // Month 2
  {
    path: '/gnc/frames-time',
    title: 'Coordinate frames, time & transformations',
    group: 'm2',
    minutes: 180,
    core: true,
    blurb: 'The frame and time conventions that prevent the most expensive class of GNC bug.'
  },
  {
    path: '/gnc/quaternions',
    title: 'Quaternions & attitude representations',
    group: 'm2',
    minutes: 180,
    core: true,
    blurb: 'Compose, rotate, integrate, and debug attitude without memorizing a derivation.'
  },
  {
    path: '/gnc/attitude-dynamics',
    title: 'Rigid-body attitude dynamics',
    group: 'm2',
    minutes: 180,
    core: true,
    blurb: 'Inertia, angular momentum, thrust torque, RCS, and why a lander oscillates.'
  },
  {
    path: '/gnc/control',
    title: 'PID & LQR for attitude control',
    group: 'm2',
    minutes: 210,
    core: true,
    blurb: 'Design a controller that works at the flight sample rate, with saturation and delay.'
  },
  {
    path: '/gnc/sixdof',
    title: '6DOF simulation',
    group: 'm2',
    minutes: 210,
    core: true,
    blurb: 'Build the plant, sensors, and actuators, then learn when the simulation is lying to you.'
  },
  {
    path: '/gnc/monte-carlo',
    title: 'Monte Carlo analysis',
    group: 'm2',
    minutes: 120,
    blurb: 'Turn dispersions into landing probability, fuel margins, and evidence.'
  },
  {
    path: '/gnc/navigation',
    title: 'Navigation, EKF & sensor fusion',
    group: 'm2',
    minutes: 240,
    core: true,
    blurb: 'Estimate position, velocity, attitude, and biases from noisy, asynchronous sensors.'
  },
  {
    path: '/gnc/powered-descent',
    title: 'Powered descent guidance',
    group: 'm2',
    minutes: 240,
    core: true,
    blurb: 'From PDI to touchdown: phases, guidance laws, throttle, attitude, and abort logic.'
  },
  {
    path: '/gnc/architecture',
    title: 'GNC software architecture & interfaces',
    group: 'm2',
    minutes: 180,
    core: true,
    blurb: 'Rate groups, data contracts, mode logic, and the integration seams where projects fail.'
  },

  // Month 3
  {
    path: '/test/verification',
    title: 'V&V for flight software',
    group: 'm3',
    minutes: 180,
    core: true,
    blurb: 'Requirements, traceability, coverage, independent test, and the evidence a reviewer expects.'
  },
  {
    path: '/test/sil-hil',
    title: 'SIL & HIL',
    group: 'm3',
    minutes: 150,
    core: true,
    blurb: 'What is real, what is simulated, and how to build a test bed that finds timing bugs.'
  },
  {
    path: '/test/python-automation',
    title: 'Python test automation',
    group: 'm3',
    minutes: 120,
    blurb: 'Pytest, serial and network fixtures, Monte Carlo analysis, and CI-friendly test reports.'
  },
  {
    path: '/test/stk-automation',
    title: 'STK Object Model automation',
    group: 'm3',
    minutes: 120,
    blurb: 'Drive STK from Python or MATLAB to generate repeatable access, lighting, and coverage studies.'
  },

  // Month 4
  {
    path: '/flight/realtime-cpp',
    title: 'Real-time embedded C++',
    group: 'm4',
    minutes: 240,
    core: true,
    blurb: 'Determinism, bounded execution, memory, interrupts, watchdogs, and fault containment.'
  },
  {
    path: '/flight/simulink-pipeline',
    title: 'Simulink → flight code',
    group: 'm4',
    minutes: 210,
    core: true,
    blurb: 'Model referencing, data dictionaries, Embedded Coder, and integrating generated code.'
  },
  {
    path: '/flight/cfs',
    title: 'NASA cFS',
    group: 'm4',
    minutes: 180,
    core: true,
    blurb: 'The core flight system architecture, services, app pattern, and why it is a job keyword.'
  },
  {
    path: '/flight/rtos',
    title: 'FreeRTOS, VxWorks & RTEMS',
    group: 'm4',
    minutes: 180,
    core: true,
    blurb: 'Tasks, priorities, queues, priority inversion, memory, and timing analysis.'
  },
  {
    path: '/flight/ccsds-spacewire',
    title: 'CCSDS & SpaceWire',
    group: 'm4',
    minutes: 150,
    blurb: 'Space packets, telemetry frames, COP-1, virtual channels, and the link layer.'
  },
  {
    path: '/flight/npr-7150',
    title: 'NPR 7150.2 & software assurance',
    group: 'm4',
    minutes: 150,
    core: true,
    blurb: 'Software classes, lifecycle evidence, assurance, and how to talk about compliance honestly.'
  },
  {
    path: '/flight/fault-protection',
    title: 'Fault protection & mode logic',
    group: 'm4',
    minutes: 180,
    core: true,
    blurb: 'FDIR, safe modes, watchdogs, voting, recovery, and one-shot landing constraints.'
  },
  {
    path: '/flight/sensors-actuators',
    title: 'Sensors & actuators',
    group: 'm4',
    minutes: 150,
    blurb: 'IMUs, star trackers, altimeters, cameras, thrusters, gimbals, and their failure modes.'
  },

  // Mission
  {
    path: '/mission/lunar-environment',
    title: 'Lunar environment',
    group: 'mission',
    minutes: 120,
    blurb: 'Gravity, vacuum, dust, lighting, thermal extremes, and plume-surface interaction.'
  },
  {
    path: '/mission/orbital-mechanics',
    title: 'Orbital mechanics for landing',
    group: 'mission',
    minutes: 180,
    blurb: 'Two-body motion, delta-v, transfer, capture, and descent — scoped to what a lander FSW engineer needs.'
  },
  {
    path: '/mission/llv-bridge',
    title: 'Bridge to the LLV PDI console',
    group: 'mission',
    minutes: 90,
    blurb: 'Map every study topic onto the simulator you are already building.'
  }
]

export const groupById = new Map(groups.map((group) => [group.id, group]))

export function normalizePath(path: string, base = '/'): string {
  let value = path.split('?')[0].split('#')[0]
  if (base !== '/' && value.startsWith(base)) {
    value = `/${value.slice(base.length)}`
  }
  value = value.replace(/\/index\.html$/, '/').replace(/\.html$/, '')
  if (value.length > 1) value = value.replace(/\/+$/, '')
  return value || '/'
}

export function topicForPath(path: string, base = '/'): Topic | undefined {
  const normalized = normalizePath(path, base)
  return topics.find((topic) => normalizePath(topic.path) === normalized)
}

/**
 * Public URL for a topic. VitePress is configured without `cleanUrls`, so the
 * generated pages end in `.html`. Components cannot rely on the markdown
 * renderer to add the suffix, so keep it in one place.
 */
export function topicHref(path: string): string {
  return path === '/' ? '/' : `${path}.html`
}
