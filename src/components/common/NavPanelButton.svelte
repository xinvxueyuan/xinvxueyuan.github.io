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

	function handleToggleBtnClick() {
		isOpen = !isOpen;
	}

	function handlePanelClick(e: MouseEvent) {
		const target = (e.target as HTMLElement).closest("[data-close-panel]");
		if (!target) return;
		isOpen = false;
	}
</script>

<div class="relative z-50 {className}" role="menu" tabindex="-1">
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
		class="absolute transition {isOpen ? '' : 'float-panel-closed'} top-11 -right-2 pt-5"
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
