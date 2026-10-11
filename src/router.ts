import type { RouteRecordRaw } from "vue-router";

export const routes: RouteRecordRaw[] = [
  { path: "/", name: "home", component: () => import("@/views/HomeView.vue") },
  { path: "/about/", name: "about", component: () => import("@/views/showcase/AboutView.vue") },
  { path: "/albums/", name: "albums", component: () => import("@/views/showcase/AlbumsView.vue") },
  {
    path: "/albums/:slug/",
    name: "album-detail",
    component: () => import("@/views/showcase/AlbumDetailView.vue"),
  },
  { path: "/archive/", name: "archive", component: () => import("@/views/ArchiveView.vue") },
  {
    path: "/categories/:category/",
    name: "category",
    component: () => import("@/views/TaxonomyView.vue"),
  },
  { path: "/devices/", name: "devices", component: () => import("@/views/showcase/DevicesView.vue") },
  { path: "/diary/", name: "diary", component: () => import("@/views/showcase/DiaryView.vue") },
  { path: "/friends/", name: "friends", component: () => import("@/views/showcase/FriendsView.vue") },
  { path: "/posts/:slug/", name: "post", component: () => import("@/views/PostView.vue") },
  { path: "/projects/", name: "projects", component: () => import("@/views/showcase/ProjectsView.vue") },
  { path: "/search/", name: "search", component: () => import("@/views/SearchView.vue") },
  { path: "/skills/", name: "skills", component: () => import("@/views/showcase/SkillsView.vue") },
  { path: "/tags/:tag/", name: "tag", component: () => import("@/views/TaxonomyView.vue") },
  { path: "/timeline/", name: "timeline", component: () => import("@/views/showcase/TimelineView.vue") },
  { path: "/:pathMatch(.*)*", name: "not-found", component: () => import("@/views/NotFoundView.vue") },
];
