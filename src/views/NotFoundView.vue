<script setup lang="ts">
import { useHead } from "@unhead/vue";

useHead({
  title: "页面不存在",
  meta: [{ name: "robots", content: "noindex" }],
});
</script>

<template>
  <main
    id="main-content"
    class="not-found"
    tabindex="-1"
  >
    <p class="not-found__code">
      404
    </p>
    <h1>这里没有这篇文章</h1>
    <p>链接可能已经失效，也可能从未存在。</p>
    <RouterLink
      class="button button--primary"
      to="/"
    >
      返回首页
    </RouterLink>
  </main>
</template>
