<script lang="ts">
	import NavPanelButton from "../../common/NavPanelButton.svelte";
	import Icon from "@iconify/svelte";
	import { onMount } from "svelte";
	import {
		getStoredWallpaperSource,
		setWallpaperSource,
	} from "@utils/setting-utils";

	interface SourceOption {
		id: string;
		label: string;
		labelEn?: string;
		icon: string;
		type: string;
	}

	let sources = $state<SourceOption[]>([]);
	let currentSourceId = $state("t-alcy-cc");

	onMount(() => {
		const winSources = (window as any).siteConfig?.wallpaperMode?.availableSources;
		if (sources.length === 0 && winSources && winSources.length > 0) {
			sources = winSources;
		}
		currentSourceId = getStoredWallpaperSource();
	});

	const currentIcon = $derived(
		sources.find((s) => s.id === currentSourceId)?.icon ||
			"material-symbols:photo-library",
	);

	function switchSource(sourceId: string) {
		currentSourceId = sourceId;
		setWallpaperSource(sourceId);
		window.dispatchEvent(
			new CustomEvent("wallpaper-refetch", { detail: { source: sourceId } }),
		);
	}

	function closePanel(panel: HTMLElement) {
		panel.classList.add("float-panel-closed");
	}
</script>

<NavPanelButton
	icon={currentIcon}
	panelId="wallpaper-source-panel"
	btnId="wallpaper-source-switch"
	ariaLabel="Wallpaper Source"
	onclose={closePanel}
>
	<!-- Panel title -->
	<div class="px-3 py-2 text-sm font-bold text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-700 mb-1">
		Wallpaper Source
	</div>
	{#each sources as option}
		<button
			class="flex transition whitespace-nowrap items-center !justify-start w-full btn-plain rounded-lg h-11 px-3 font-medium active:scale-95 theme-switch-btn mb-0.5 last:mb-0"
			data-active={currentSourceId === option.id}
			data-close-panel="true"
			class:scale-animation={currentSourceId !== option.id}
			role="menuitem"
			onclick={() => switchSource(option.id)}
		>
			<Icon icon={option.icon} class="text-[1.25rem] mr-3"></Icon>
			<span>{option.label}</span>
		</button>
	{/each}
</NavPanelButton>

<style>
	button[data-active="true"] {
		background-color: var(--primary) !important;
		color: white !important;
	}

	button[data-active="true"]:hover {
		background-color: var(--primary) !important;
		color: white !important;
	}

	:global(button[data-active="true"])::before {
		display: none !important;
	}
</style>
