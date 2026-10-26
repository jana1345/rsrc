<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    id: string
    items: string
    title?: string
  }>(),
  { title: 'Checklist' }
)

const list = computed(() =>
  props.items
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean)
)
const checked = ref<boolean[]>([])
const key = computed(() => `lfg:check:${props.id}`)

function load() {
  if (typeof window === 'undefined') return
  try {
    const raw = window.localStorage.getItem(key.value)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    const values = Array.isArray(parsed) ? parsed : []
    checked.value = list.value.map((_, index) => Boolean(values[index]))
  } catch {
    checked.value = list.value.map(() => false)
  }
}

onMounted(load)
watch(list, load)

function save() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key.value, JSON.stringify(checked.value))
  } catch {
    // Ignore storage failures.
  }
}

function toggle(index: number) {
  checked.value[index] = !checked.value[index]
  save()
}

const doneCount = computed(() => checked.value.filter(Boolean).length)
</script>

<template>
  <section class="checklist">
    <header>
      <h3>{{ title }}</h3>
      <span>{{ doneCount }}/{{ list.length }}</span>
    </header>
    <ul>
      <li v-for="(item, index) in list" :key="item" :class="{ done: checked[index] }">
        <label>
          <input type="checkbox" :checked="checked[index]" @change="toggle(index)" />
          <span class="check-ui" aria-hidden="true">✓</span>
          <span>{{ item }}</span>
        </label>
      </li>
    </ul>
  </section>
</template>
