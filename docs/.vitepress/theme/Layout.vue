<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { computed } from 'vue'
import { useData, useRoute } from 'vitepress'
import TopicComplete from './components/TopicComplete.vue'
import { topicForPath } from './data/topics'

const { Layout: DefaultLayout } = DefaultTheme
const route = useRoute()
const { site } = useData()
const isTopic = computed(() => Boolean(topicForPath(route.path, site.value.base)))
</script>

<template>
  <DefaultLayout>
    <template #doc-after>
      <TopicComplete v-if="isTopic" />
    </template>
  </DefaultLayout>
</template>
