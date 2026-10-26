import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

const base = (process.env.DOCS_BASE || '/').replace(/\/?$/, '/')

export default withMermaid(
  defineConfig({
    title: 'Lunar FSW Field Guide',
    description:
      'A structured, practical study guide for lunar lander GNC and flight software: frames, quaternions, 6DOF, navigation, guidance, real-time C++, cFS, V&V, and more.',
    base,
    lang: 'en-US',
    lastUpdated: true,
    head: [
      ['link', { rel: 'icon', type: 'image/svg+xml', href: `${base}logo.svg` }],
      ['meta', { name: 'theme-color', content: '#070b12' }],
      ['meta', { property: 'og:type', content: 'website' }],
      ['meta', { property: 'og:title', content: 'Lunar FSW Field Guide' }],
      [
        'meta',
        {
          property: 'og:description',
          content:
            'From software developer to lunar lander GNC and flight software. A 16-week path with deep dives, exercises, and progress tracking.'
        }
      ]
    ],
    markdown: {
      // VitePress registers markdown-it-mathjax3 and, importantly, marks
      // mjx-* tags as custom elements so Vue does not try to resolve them.
      math: true,
      lineNumbers: true,
      image: { lazyLoading: true },
      theme: { light: 'github-light', dark: 'github-dark' }
    },
    themeConfig: {
      logo: '/logo.svg',
      siteTitle: 'Lunar FSW',
      nav: [
        { text: 'Start here', link: '/start/how-to-use' },
        { text: 'Roadmap', link: '/start/roadmap' },
        {
          text: 'Months',
          items: [
            { text: 'Month 1 · Foundations', link: '/foundations/space-basics' },
            { text: 'Month 2 · GNC core', link: '/gnc/frames-time' },
            { text: 'Month 3 · Test & integration', link: '/test/verification' },
            { text: 'Month 4 · Flight software', link: '/flight/realtime-cpp' },
            { text: 'Mission & vehicle', link: '/mission/lunar-environment' }
          ]
        },
        {
          text: 'Reference',
          items: [
            { text: 'Formula sheet', link: '/reference/formulas' },
            { text: 'Glossary', link: '/reference/glossary' },
            { text: 'Resources', link: '/reference/resources' }
          ]
        },
        { text: 'Progress', link: '/start/progress' }
      ],
      sidebar: [
        {
          text: 'Start here',
          items: [
            { text: 'How to use this guide', link: '/start/how-to-use' },
            { text: 'The 16-week roadmap', link: '/start/roadmap' },
            { text: 'Study & tooling setup', link: '/start/setup' },
            { text: 'Progress dashboard', link: '/start/progress' }
          ]
        },
        {
          text: 'Month 1 · Foundations',
          collapsed: false,
          items: [
            { text: 'Space & lunar mission basics', link: '/foundations/space-basics' },
            { text: 'Frames & time primer', link: '/foundations/frames-primer' },
            { text: 'STK essentials', link: '/foundations/stk' },
            { text: 'MATLAB & Simulink essentials', link: '/foundations/matlab-simulink' },
            { text: 'Modern C++ for flight', link: '/foundations/cpp' },
            { text: 'Linux for embedded work', link: '/foundations/linux' },
            { text: 'Git for flight software', link: '/foundations/git' },
            { text: 'CMake & builds', link: '/foundations/cmake' },
            { text: 'Debugging & verification tools', link: '/foundations/debugging' }
          ]
        },
        {
          text: 'Month 2 · GNC core',
          collapsed: false,
          items: [
            { text: 'Frames, time & transformations', link: '/gnc/frames-time' },
            { text: 'Quaternions & attitude', link: '/gnc/quaternions' },
            { text: 'Rigid-body attitude dynamics', link: '/gnc/attitude-dynamics' },
            { text: 'PID & LQR', link: '/gnc/control' },
            { text: '6DOF simulation', link: '/gnc/sixdof' },
            { text: 'Monte Carlo analysis', link: '/gnc/monte-carlo' },
            { text: 'Navigation, EKF & sensor fusion', link: '/gnc/navigation' },
            { text: 'Powered descent guidance', link: '/gnc/powered-descent' },
            { text: 'GNC architecture & interfaces', link: '/gnc/architecture' }
          ]
        },
        {
          text: 'Month 3 · Test & integration',
          collapsed: false,
          items: [
            { text: 'V&V for flight software', link: '/test/verification' },
            { text: 'SIL & HIL', link: '/test/sil-hil' },
            { text: 'Python test automation', link: '/test/python-automation' },
            { text: 'STK Object Model automation', link: '/test/stk-automation' }
          ]
        },
        {
          text: 'Month 4 · Flight software',
          collapsed: false,
          items: [
            { text: 'Real-time embedded C++', link: '/flight/realtime-cpp' },
            { text: 'Simulink → flight code', link: '/flight/simulink-pipeline' },
            { text: 'NASA cFS', link: '/flight/cfs' },
            { text: 'FreeRTOS, VxWorks & RTEMS', link: '/flight/rtos' },
            { text: 'CCSDS & SpaceWire', link: '/flight/ccsds-spacewire' },
            { text: 'NPR 7150.2 & assurance', link: '/flight/npr-7150' },
            { text: 'Fault protection & mode logic', link: '/flight/fault-protection' },
            { text: 'Sensors & actuators', link: '/flight/sensors-actuators' }
          ]
        },
        {
          text: 'Mission & vehicle',
          collapsed: false,
          items: [
            { text: 'Lunar environment', link: '/mission/lunar-environment' },
            { text: 'Orbital mechanics for landing', link: '/mission/orbital-mechanics' },
            { text: 'Bridge to the LLV PDI console', link: '/mission/llv-bridge' }
          ]
        },
        {
          text: 'Reference',
          collapsed: false,
          items: [
            { text: 'Formula sheet', link: '/reference/formulas' },
            { text: 'Glossary', link: '/reference/glossary' },
            { text: 'Resources', link: '/reference/resources' }
          ]
        }
      ],
      search: {
        provider: 'local',
        options: {
          detailedView: true
        }
      },
      outline: {
        level: [2, 3],
        label: 'On this page'
      },
      docFooter: {
        prev: 'Previous',
        next: 'Next'
      },
      socialLinks: [{ icon: 'github', link: 'https://github.com/jana1345/Vault' }],
      footer: {
        message:
          'Original study notes. Always verify against your program’s requirements, interfaces, and approved sources.',
        copyright: 'Built for the lunar FSW learning path.'
      }
    }
  })
)
