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
		void import("mermaid")
			.then(async ({ default: mermaid }) => {
				if (cancelled) return;
				mermaid.initialize({
					securityLevel: "strict",
					startOnLoad: false,
					theme:
						document.documentElement.dataset.theme === "dark"
							? "dark"
							: "default",
				});
				const blocks = document.querySelectorAll<HTMLElement>(
					`#${CSS.escape(rootId)} pre[data-mermaid-source]:not([data-mermaid-ready])`,
				);
				for (const [index, block] of [...blocks].entries()) {
					try {
						const source =
							block.dataset.mermaidSource ??
							block.textContent ??
							"";
						const { svg } = await mermaid.render(
							`mermaid-${index}-${crypto.randomUUID()}`,
							source,
						);
						if (cancelled) return;
						const figure = document.createElement("figure");
						figure.className = "mermaid-diagram";
						figure.innerHTML = svg;
						block.hidden = true;
						block.after(figure);
						block.dataset.mermaidReady = "true";
					} catch {
						block.dataset.mermaidReady = "error";
						block.setAttribute(
							"aria-label",
							"图表渲染失败，显示 Mermaid 源码",
						);
					}
				}
			})
			.catch(() => undefined);
		return () => {
			cancelled = true;
		};
	}, [enabled, rootId]);
	return null;
}
