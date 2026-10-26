<script setup lang="ts">
import { computed, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    question: string
    options: string
    answer: string | number
    explanation?: string
  }>(),
  { explanation: '' }
)

const choices = computed(() =>
  props.options
    .split('|')
    .map((choice) => choice.trim())
    .filter(Boolean)
)

const correct = computed(() => Number(props.answer))
const selected = ref<number | null>(null)
const isCorrect = computed(() => selected.value === correct.value)

function choose(index: number) {
  selected.value = index
}

function reset() {
  selected.value = null
}

function optionClass(index: number) {
  if (selected.value === null) return ''
  if (index === correct.value) return 'is-correct'
  if (index === selected.value) return 'is-wrong'
  return 'is-muted'
}
</script>

<template>
  <section class="quiz" aria-label="Knowledge check">
    <p class="quiz-kicker">Check yourself</p>
    <h3 class="quiz-question">{{ question }}</h3>
    <div class="quiz-options">
      <button
        v-for="(choice, index) in choices"
        :key="choice"
        type="button"
        class="quiz-option"
        :class="optionClass(index)"
        :aria-pressed="selected === index"
        @click="choose(index)"
      >
        <span class="quiz-letter">{{ String.fromCharCode(65 + index) }}</span>
        <span>{{ choice }}</span>
      </button>
    </div>
    <div
      v-if="selected !== null"
      class="quiz-feedback"
      :class="isCorrect ? 'is-ok' : 'is-no'"
      role="status"
    >
      <strong>{{ isCorrect ? 'Correct.' : 'Not quite.' }}</strong>
      <span v-if="explanation">{{ explanation }}</span>
    </div>
    <button v-if="selected !== null" type="button" class="quiz-reset" @click="reset">
      Try another answer
    </button>
  </section>
</template>
