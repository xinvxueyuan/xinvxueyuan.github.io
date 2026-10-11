<script setup lang="ts">
import { computed, useId } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps<{
  title: string
  description: string
  link?: { href: string; label: string }
}>()
const titleId = useId()
const link = computed(() => props.link)
</script>

<template>
  <section
    :aria-labelledby="titleId"
    class="showcase-empty-state"
  >
    <h2 :id="titleId">
      {{ title }}
    </h2>
    <p>{{ description }}</p>
    <RouterLink
      v-if="link"
      :to="link.href"
    >
      {{ link.label }}
    </RouterLink>
  </section>
</template>
