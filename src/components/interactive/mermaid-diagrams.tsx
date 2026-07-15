"use client";

import { useEffect } from "react";

export function MermaidDiagrams({
	enabled,
	rootId,
}: {
	enabled: boolean;
	rootId: string;
}) {
	useEffect(() => {
		if (!enabled) return;
		let cancelled = false;
		let renderRevision = 0;
		let observer: MutationObserver | undefined;
		void import("mermaid")
			.then(async ({ default: mermaid }) => {
				if (cancelled) return;
				const currentTheme = () =>
					document.documentElement.dataset.theme === "dark"
						? "dark"
						: "default";
				const render = async (theme: "dark" | "default") => {
					const revision = ++renderRevision;
					mermaid.initialize({
						securityLevel: "strict",
						startOnLoad: false,
						theme,
					});
					const blocks = document.querySelectorAll<HTMLElement>(
						`#${CSS.escape(rootId)} pre[data-mermaid-source]:not([data-mermaid-ready])`,
					);
					for (const [index, block] of [...blocks].entries()) {
						try {
							const source =
								block.dataset.mermaidSource ?? block.textContent ?? "";
							const { svg } = await mermaid.render(
								`mermaid-${index}-${crypto.randomUUID()}`,
								source,
							);
							if (cancelled || revision !== renderRevision) return;
							const figure = document.createElement("figure");
							figure.className = "mermaid-diagram";
							figure.dataset.mermaidTheme = theme;
							figure.innerHTML = svg;
							block.hidden = true;
							block.after(figure);
							block.dataset.mermaidReady = "true";
						} catch {
							block.hidden = false;
							block.dataset.mermaidReady = "error";
							block.setAttribute(
								"aria-label",
								"图表渲染失败，显示 Mermaid 源码",
							);
						}
					}
				};
				const redraw = () => {
					const root = document.getElementById(rootId);
					if (!root) return;
					for (const figure of root.querySelectorAll(".mermaid-diagram"))
						figure.remove();
					for (const block of root.querySelectorAll<HTMLElement>(
						"pre[data-mermaid-source]",
					)) {
						block.hidden = false;
						delete block.dataset.mermaidReady;
					}
					void render(currentTheme());
				};

				observer = new MutationObserver((records) => {
					if (records.some((record) => record.attributeName === "data-theme"))
						redraw();
				});
				observer.observe(document.documentElement, {
					attributeFilter: ["data-theme"],
					attributes: true,
				});
				await render(currentTheme());
			})
			.catch(() => undefined);
		return () => {
			cancelled = true;
			observer?.disconnect();
		};
	}, [enabled, rootId]);
	return null;
}
