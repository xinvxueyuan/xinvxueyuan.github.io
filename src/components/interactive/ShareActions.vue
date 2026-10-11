<script setup lang="ts">
import { ref } from 'vue'
const props = defineProps<{ title: string; url: string }>()
const input = ref<HTMLInputElement | null>(null)
const status = ref('')
const share = async () => {
  try {
    if ('share' in navigator && typeof navigator.share === 'function') await navigator.share({ title: props.title, url: props.url })
    else if ('clipboard' in navigator && navigator.clipboard) { await navigator.clipboard.writeText(props.url); status.value = '链接已复制' }
    else { input.value?.select(); status.value = '请复制已选中的链接' }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return
    try { await navigator.clipboard.writeText(props.url); status.value = '链接已复制' } catch { input.value?.select(); status.value = '请复制已选中的链接' }
  }
}
</script>
<template>
  <div class="share-actions">
    <button
      type="button"
      @click="void share()"
    >
      分享文章
    </button>
    <label><span class="visually-hidden">文章链接</span><input
      ref="input"
      :value="url"
      readonly
    ></label>
    <span aria-live="polite">{{ status }}</span>
  </div>
</template>
