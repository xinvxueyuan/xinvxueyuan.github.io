<script lang="ts">
	import Icon from "@iconify/svelte";

	interface Props {
		icon: string;
		panelId: string;
		btnId?: string;
		ariaLabel?: string;
		class?: string;
	}

	let {
		icon,
		panelId,
		btnId = "",
		ariaLabel = "",
		class: className = "",
	}: Props = $props();

	let isOpen = $state(false);
	let panelEl = $state<HTMLElement | null>(null);

	function handleToggleBtnClick() {
		// 关闭其他面板：向所有 NavPanelButton 发送 close-other-panels 事件
		window.dispatchEvent(new CustomEvent("navpanel:close-others", { detail: { except: panelId } }));
		isOpen = !isOpen;
	}

	function handlePanelClick(e: MouseEvent) {
		const target = (e.target as HTMLElement).closest("[data-close-panel]");
		if (!target) return;
		isOpen = false;
	}

	// 监听其他面板的打开事件，自动关闭本面板
	$effect(() => {
		function handleCloseOthers(e: Event) {
			const detail = (e as CustomEvent).detail;
			if (detail?.except !== panelId) {
				isOpen = false;
			}
		}
		window.addEventListener("navpanel:close-others", handleCloseOthers);
		return () => {
			window.removeEventListener("navpanel:close-others", handleCloseOthers);
		};
	});

	// 点击面板外部时关闭
	$effect(() => {
		if (!isOpen) return;
		const handler = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			// 点击面板内部或切换按钮时不关闭
			const panel = document.getElementById(panelId);
			const btn = btnId ? document.getElementById(btnId) : null;
			if (panel?.contains(target)) return;
			if (btn?.contains(target)) return;
			// 延迟一小段时间，避免点击切换按钮时的事件冲突
			setTimeout(() => { isOpen = false; }, 0);
		};
		// 使用 capture phase 在下一帧注册，避免当前点击事件立即关闭
		requestAnimationFrame(() => {
			document.addEventListener("click", handler, { capture: true });
		});
		return () => {
			document.removeEventListener("click", handler, { capture: true });
		};
	});
</script>

<div class="relative {className}" class:z-50={!isOpen} role="menu" tabindex="-1">
	<button
		aria-label={ariaLabel || btnId || "Toggle panel"}
		role="menuitem"
		class="relative btn-plain scale-animation rounded-lg h-11 w-11 active:scale-90 theme-switch-btn"
		id={btnId || undefined}
		onclick={handleToggleBtnClick}
	>
		<Icon icon={icon} class="text-[1.25rem]"></Icon>
	</button>

	<div
		id={panelId}
		bind:this={panelEl}
		class="absolute transition {isOpen ? '' : 'float-panel-closed'} top-11 -right-2 pt-5"
		class:z-[60]={isOpen}
	>
		<div class="card-base float-panel p-2" onclick={handlePanelClick}>
			<slot />
		</div>
	</div>
</div>

<style>
	:global(.theme-switch-btn)::before {
		transition:
			transform 75ms ease-out,
			background-color 0ms !important;
	}
</style>
