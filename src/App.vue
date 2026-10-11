<script setup lang="ts">
import SiteFooter from "@/components/layout/SiteFooter.vue";
import SiteHeader from "@/components/layout/SiteHeader.vue";
</script>

<template>
  <a
    class="skip-link"
    href="#main-content"
  >跳到主要内容</a>
  <SiteHeader />
  <RouterView v-slot="{ Component }">
    <Suspense>
      <component :is="Component" />
      <template #fallback>
        <main
          id="main-content"
          class="page-shell"
          tabindex="-1"
          aria-busy="true"
        >
          <p role="status">
            正在加载页面内容…
          </p>
        </main>
      </template>
    </Suspense>
  </RouterView>
  <SiteFooter />
</template>
