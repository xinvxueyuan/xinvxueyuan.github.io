"use client";

import { useEffect } from "react";

export function CodeTools({ rootId }: { rootId: string }) {
	useEffect(() => {
		const root = document.getElementById(rootId);
		if (!root) return;
		for (const [index, block] of [
			...root.querySelectorAll<HTMLElement>("pre[data-code-block]"),
		].entries()) {
			if (block.dataset.toolsReady) continue;
			block.dataset.toolsReady = "true";
			block.id ||= `${rootId}-code-${index + 1}`;
			const tools = document.createElement("div");
			tools.className = "code-tools";
			const copy = document.createElement("button");
			copy.type = "button";
			copy.dataset.codeAction = "copy";
			copy.textContent = "复制";
			tools.append(copy);
			if ((block.textContent?.split("\n").length ?? 0) > 12) {
				const collapse = document.createElement("button");
				collapse.type = "button";
				collapse.dataset.codeAction = "collapse";
				collapse.setAttribute("aria-controls", block.id);
				collapse.setAttribute("aria-expanded", "true");
				collapse.textContent = "折叠";
				tools.append(collapse);
			}
			block.before(tools);
		}
		const onClick = async (event: MouseEvent) => {
			const button = (event.target as Element).closest<HTMLButtonElement>(
				"button[data-code-action]",
			);
			if (!button || !root.contains(button)) return;
			const block = button.parentElement
				?.nextElementSibling as HTMLElement | null;
			if (!block?.matches("pre[data-code-block]")) return;
			if (button.dataset.codeAction === "collapse") {
				block.classList.toggle("is-collapsed");
				const isCollapsed = block.classList.contains("is-collapsed");
				button.setAttribute("aria-expanded", String(!isCollapsed));
				button.textContent = isCollapsed
					? "展开"
					: "折叠";
				return;
			}
			try {
				await navigator.clipboard.writeText(block.textContent ?? "");
				button.textContent = "已复制";
			} catch {
				button.textContent = "复制失败";
			}
		};
		root.addEventListener("click", onClick);
		return () => root.removeEventListener("click", onClick);
	}, [rootId]);
	return null;
}
