<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { withBase } from 'vitepress'
import { groups, topicHref, topics } from '../data/topics'
import { clearAllProgress, PROGRESS_EVENT, readDone, writeDone } from '../utils/progress'

const props = withDefaults(defineProps<{ compact?: boolean }>(), { compact: false })

const done = ref<Record<string, boolean>>({})

function refresh() {
  const next: Record<string, boolean> = {}
  for (const topic of topics) next[topic.path] = readDone(topic.path)
  done.value = next
}

onMounted(() => {
  refresh()
  window.addEventListener('storage', refresh)
  window.addEventListener(PROGRESS_EVENT, refresh)
})

onUnmounted(() => {
  window.removeEventListener('storage', refresh)
  window.removeEventListener(PROGRESS_EVENT, refresh)
})

const total = computed(() => topics.length)
const completed = computed(() => topics.filter((topic) => done.value[topic.path]).length)
const percent = computed(() =>
  total.value === 0 ? 0 : Math.round((completed.value / total.value) * 100)
)
const nextTopic = computed(() => topics.find((topic) => !done.value[topic.path]))

const groupStats = computed(() =>
  groups.map((group) => {
    const list = topics.filter((topic) => topic.group === group.id)
    const count = list.filter((topic) => done.value[topic.path]).length
    return {
      ...group,
      total: list.length,
      done: count,
      percent: list.length === 0 ? 0 : Math.round((count / list.length) * 100),
      topics: list
    }
  })
)

function toggle(topicPath: string) {
  const value = !done.value[topicPath]
  writeDone(topicPath, value)
  done.value = { ...done.value, [topicPath]: value }
}

function reset() {
  if (!window.confirm('Clear all page completion markers in this browser?')) return
  clearAllProgress(topics.map((topic) => topic.path))
  refresh()
}
</script>

<template>
  <section class="pd" :class="{ 'pd--compact': compact }" aria-label="Study progress">
    <header class="pd-head">
      <div>
        <p class="pd-kicker">Flight plan</p>
        <h2 v-if="!compact">Progress dashboard</h2>
        <p class="pd-summary">
          <strong>{{ completed }}</strong> of {{ total }} topics complete · {{ percent }}%
        </p>
      </div>
      <div v-if="!compact" class="pd-actions">
        <button type="button" class="pd-reset" @click="reset">Reset progress</button>
      </div>
    </header>

    <div
      class="pd-bar"
      role="progressbar"
      :aria-valuenow="percent"
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <span class="pd-fill" :style="{ width: percent + '%' }"></span>
    </div>

    <div v-if="compact" class="pd-next">
      <span v-if="nextTopic">
        Next up: <a :href="withBase(topicHref(nextTopic.path))">{{ nextTopic.title }}</a>
      </span>
      <span v-else>All topics marked complete. Go fly something.</span>
      <a class="pd-link" :href="withBase('/start/progress.html')">Open dashboard →</a>
    </div>

    <template v-else>
      <div v-for="group in groupStats" :key="group.id" class="pd-group">
        <div class="pd-group-head">
          <div>
            <h3>{{ group.title }}</h3>
            <p>{{ group.subtitle }}</p>
          </div>
          <span class="pd-count">{{ group.done }}/{{ group.total }}</span>
        </div>
        <div class="pd-group-bar" aria-hidden="true">
          <span :style="{ width: group.percent + '%' }"></span>
        </div>
        <ul class="pd-list">
          <li
            v-for="topic in group.topics"
            :key="topic.path"
            :class="{ done: done[topic.path] }"
          >
            <label class="pd-check">
              <input
                type="checkbox"
                :checked="!!done[topic.path]"
                @change="toggle(topic.path)"
              />
              <span class="pd-check-ui" aria-hidden="true">✓</span>
              <span class="pd-topic">
                <a :href="withBase(topicHref(topic.path))">{{ topic.title }}</a>
                <span class="pd-meta">
                  <span v-if="topic.core" class="pd-core">Core</span>
                  {{ topic.minutes }} min
                </span>
              </span>
            </label>
          </li>
        </ul>
      </div>
      <p class="pd-note">
        Progress is stored in this browser only. It is not telemetry, and it does not leave the
        device.
      </p>
    </template>
  </section>
</template>
