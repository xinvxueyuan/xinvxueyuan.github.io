<script setup lang="ts">
import type { ExternalLink as ExternalLinkData } from '@/lib/showcase/types'

defineProps<{
  link: ExternalLinkData
}>()
</script>

<template>
  <a
    :href="link.href"
    rel="noopener noreferrer"
    target="_blank"
  >{{ link.label }}</a>
</template>
