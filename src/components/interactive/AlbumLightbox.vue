<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";

type LightboxInstance = { init(): void; destroy(): void };
let cleanups: (() => void)[] = [];

onMounted(() => {
  document.querySelectorAll<HTMLElement>("[data-album-gallery]").forEach((gallery) => {
    let disposed = false;
    let initializing: Promise<void> | undefined;
    let lightbox: LightboxInstance | undefined;

    const open = async (anchor: HTMLAnchorElement): Promise<void> => {
      if (disposed || lightbox || initializing) return;
      anchor.focus();
      initializing = Promise.all([
        import("photoswipe/style.css"),
        import("photoswipe/lightbox"),
        import("photoswipe"),
      ]).then(([, lightboxModule, photoSwipeModule]) => {
        if (disposed) return;
        const Lightbox = lightboxModule.default;
        lightbox = new Lightbox({
          children: "a",
          gallery,
          pswpModule: () => Promise.resolve(photoSwipeModule.default),
        }) as LightboxInstance;
        lightbox.init();
        anchor.click();
      }).catch(() => {
        if (!disposed) window.location.assign(anchor.href);
      }).finally(() => {
        initializing = undefined;
      });
      await initializing;
    };

    const onClick = (event: MouseEvent): void => {
      if (
        lightbox ||
        event.button !== 0 ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.defaultPrevented
      ) return;
      const anchor = event.target instanceof Element
        ? event.target.closest<HTMLAnchorElement>("a")
        : null;
      if (!anchor || !gallery.contains(anchor)) return;
      event.preventDefault();
      void open(anchor);
    };

    gallery.addEventListener("click", onClick);
    cleanups.push(() => {
      disposed = true;
      gallery.removeEventListener("click", onClick);
      lightbox?.destroy();
      lightbox = undefined;
    });
  });
});

onUnmounted(() => {
  cleanups.forEach((cleanup) => cleanup());
  cleanups = [];
});
</script>

<template>
  <span
    class="album-lightbox"
    aria-hidden="true"
  />
</template>
