import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import Layout from './Layout.vue'
import ProgressDashboard from './components/ProgressDashboard.vue'
import Quiz from './components/Quiz.vue'
import StudyChecklist from './components/StudyChecklist.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('Quiz', Quiz)
    app.component('ProgressDashboard', ProgressDashboard)
    app.component('StudyChecklist', StudyChecklist)
  }
} satisfies Theme
