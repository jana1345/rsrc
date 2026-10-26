<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useData, useRoute, withBase } from 'vitepress'
import { normalizePath, topicForPath } from '../data/topics'
import { readDone, writeDone } from '../utils/progress'

const route = useRoute()
const { site } = useData()

const path = computed(() => normalizePath(route.path, site.value.base))
const topic = computed(() => topicForPath(path.value))
const done = ref(false)
const progressHref = withBase('/start/progress.html')

function refresh() {
  if (topic.value) done.value = readDone(topic.value.path)
}

onMounted(refresh)
watch(path, refresh)

function toggle() {
  if (!topic.value) return
  done.value = !done.value
  writeDone(topic.value.path, done.value)
}
</script>

<template>
  <aside v-if="topic" class="topic-complete" :class="{ 'is-done': done }">
    <label class="tc-label">
      <input type="checkbox" :checked="done" @change="toggle" />
      <span class="tc-box" aria-hidden="true">✓</span>
      <span class="tc-copy">
        <strong>{{ done ? 'Marked complete' : 'Mark this page complete' }}</strong>
        <small>{{
          done
            ? 'Saved in this browser. Come back and re-read it before an interview.'
            : 'Finishing the exercises is the real test. Use this as a bookmark.'
        }}</small>
      </span>
    </label>
    <a class="tc-link" :href="progressHref">Progress dashboard →</a>
  </aside>
</template>
