<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { KunButton } from "@kungal/ui-vue";

import { isDarkTheme, setTheme } from "@/lib/theme";

const router = useRouter();
const searchQuery = ref("");
const menuOpen = ref(false);
const dark = ref(false);

const themeLabel = computed(() =>
  dark.value ? "切换到浅色主题" : "切换到深色主题",
);

onMounted(() => {
  dark.value = isDarkTheme();
});

function submitSearch(): void {
  const q = searchQuery.value.trim();
  menuOpen.value = false;
  void router.push({ path: "/search/", query: q ? { q } : undefined });
}

function toggleTheme(): void {
  dark.value = !dark.value;
  setTheme(dark.value ? "dark" : "light");
}
</script>

<template>
  <header class="site-header">
    <div class="site-header__inner">
      <RouterLink
        class="brand"
        to="/"
        aria-label="xinvStar 首页"
      >
        <span
          class="brand__orbit"
          aria-hidden="true"
        />
        <span class="brand__wordmark">xinvStar</span>
      </RouterLink>

      <nav
        class="primary-nav"
        aria-label="主导航"
      >
        <RouterLink to="/archive/">
          归档
        </RouterLink>
        <RouterLink to="/search/">
          搜索
        </RouterLink>
        <RouterLink to="/about/">
          关于
        </RouterLink>
        <RouterLink to="/projects/">
          项目
        </RouterLink>
      </nav>

      <form
        class="header-search"
        role="search"
        @submit.prevent="submitSearch"
      >
        <label
          class="visually-hidden"
          for="site-search-header"
        >搜索文章</label>
        <input
          id="site-search-header"
          v-model="searchQuery"
          name="q"
          type="search"
          placeholder="搜索文章"
          autocomplete="off"
        >
        <KunButton
          class="header-search__submit"
          type="submit"
          aria-label="提交搜索"
        >
          <span
            aria-hidden="true"
            class="search-glyph"
          />
          <span class="visually-hidden">搜索</span>
        </KunButton>
      </form>

      <KunButton
        class="theme-toggle"
        type="button"
        :aria-label="themeLabel"
        @click="toggleTheme"
      >
        <span
          class="theme-toggle__mark"
          aria-hidden="true"
        />
        <span class="theme-toggle__text">{{ dark ? "浅色" : "深色" }}</span>
      </KunButton>

      <a
        class="header-github"
        href="https://github.com/xinvxueyuan"
        target="_blank"
        rel="noopener noreferrer"
      >GitHub</a>

      <button
        class="menu-toggle"
        type="button"
        :aria-expanded="menuOpen"
        aria-controls="mobile-nav"
        @click="menuOpen = !menuOpen"
      >
        <span
          class="menu-toggle__glyph"
          aria-hidden="true"
        />
        <span class="visually-hidden">{{ menuOpen ? "关闭菜单" : "打开菜单" }}</span>
      </button>
    </div>
    <Transition name="mobile-menu">
      <nav
        v-if="menuOpen"
        id="mobile-nav"
        class="mobile-nav"
        aria-label="移动端主导航"
      >
        <RouterLink
          to="/archive/"
          @click="menuOpen = false"
        >
          归档
        </RouterLink>
        <RouterLink
          to="/search/"
          @click="menuOpen = false"
        >
          搜索
        </RouterLink>
        <RouterLink
          to="/projects/"
          @click="menuOpen = false"
        >
          项目
        </RouterLink>
        <RouterLink
          to="/about/"
          @click="menuOpen = false"
        >
          关于
        </RouterLink>
      </nav>
    </Transition>
  </header>
</template>
