export type Theme = "light" | "dark";

function applyTheme(theme: Theme): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("kun-dark-mode", theme === "dark");
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
}

export function isDarkTheme(): boolean {
  return typeof document !== "undefined" &&
    document.documentElement.classList.contains("kun-dark-mode");
}

export function setTheme(theme: Theme): void {
  applyTheme(theme);
  try {
    localStorage.setItem("xinvstar-theme", theme);
  } catch {
    // Theme remains active for this page even when storage is unavailable.
  }
}

export function initializeTheme(): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  try {
    const saved = localStorage.getItem("xinvstar-theme");
    const dark = saved === "dark" ||
      (saved !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    applyTheme(dark ? "dark" : "light");
  } catch {
    applyTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }
}
