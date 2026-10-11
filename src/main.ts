import { KunUI } from "@kungal/ui-vue";
import { ViteSSG } from "vite-ssg";

import App from "./App.vue";
import { routes } from "./router";
import { initializeTheme } from "./lib/theme";
import "@kungal/ui-vue/style.css";
import "./styles.css";

export const createApp = ViteSSG(
  App,
  {
    routes,
    scrollBehavior(to, _from, savedPosition) {
      if (savedPosition) return savedPosition;
      if (to.hash) return { el: to.hash, behavior: "smooth" };
      return { top: 0 };
    },
  },
  ({ app, isClient }) => {
    app.use(KunUI);
    if (isClient) initializeTheme();
  },
);
