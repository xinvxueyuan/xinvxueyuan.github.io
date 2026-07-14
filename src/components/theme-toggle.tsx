"use client";

import { useEffect, useRef } from "react";

type Theme = "dark" | "light";

const storageKey = "xinvstar-theme";

function currentTheme(): Theme {
	return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function applyTheme(theme: Theme) {
	document.documentElement.dataset.theme = theme;
	document.documentElement.style.colorScheme = theme;
}

function toggleLabel(theme: Theme) {
	return theme === "dark" ? "切换到浅色主题" : "切换到深色主题";
}

function hasStoredTheme(): boolean {
	try {
		return localStorage.getItem(storageKey) !== null;
	} catch {
		return false;
	}
}

function storeTheme(theme: Theme): void {
	try {
		localStorage.setItem(storageKey, theme);
	} catch {
		// The visual state remains usable when storage is unavailable.
	}
}

export function ThemeToggle() {
	const buttonRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		const button = buttonRef.current;
		if (button)
			button.setAttribute("aria-label", toggleLabel(currentTheme()));

		const media = window.matchMedia("(prefers-color-scheme: dark)");
		const syncSystemTheme = (event: MediaQueryListEvent) => {
			if (hasStoredTheme()) return;
			const nextTheme = event.matches ? "dark" : "light";
			applyTheme(nextTheme);
			button?.setAttribute("aria-label", toggleLabel(nextTheme));
		};

		media.addEventListener("change", syncSystemTheme);
		return () => media.removeEventListener("change", syncSystemTheme);
	}, []);

	return (
		<button
			aria-label="切换主题"
			className="theme-toggle"
			onClick={() => {
				const nextTheme = currentTheme() === "dark" ? "light" : "dark";
				applyTheme(nextTheme);
				storeTheme(nextTheme);
				buttonRef.current?.setAttribute(
					"aria-label",
					toggleLabel(nextTheme),
				);
			}}
			ref={buttonRef}
			type="button"
		>
			<svg aria-hidden="true" viewBox="0 0 24 24">
				<path
					className="theme-toggle__sun"
					d="M12 3v2.25m0 13.5V21M3 12h2.25m13.5 0H21M5.64 5.64l1.59 1.59m9.54 9.54 1.59 1.59m0-12.72-1.59 1.59m-9.54 9.54-1.59 1.59M16.25 12A4.25 4.25 0 1 1 7.75 12a4.25 4.25 0 0 1 8.5 0Z"
				/>
				<path
					className="theme-toggle__moon"
					d="M20.1 15.4A8.5 8.5 0 0 1 8.6 3.9 8.5 8.5 0 1 0 20.1 15.4Z"
				/>
			</svg>
		</button>
	);
}
