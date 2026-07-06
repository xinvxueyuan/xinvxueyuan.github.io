<script lang="ts">
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
		// Read available sources from window.siteConfig
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
		// Reload wallpaper images
		window.dispatchEvent(
			new CustomEvent("wallpaper-refetch", { detail: { source: sourceId } }),
		);
		// Close the panel
		const panel = document.getElementById("wallpaper-source-panel");
		if (panel) panel.classList.add("float-panel-closed");
	}

	async function togglePanel() {
		const panel = document.getElementById("wallpaper-source-panel");
		if (!panel) return;
		panel.classList.toggle("float-panel-closed");
	}
</script>

<div class="relative z-50" role="menu" tabindex="-1">
	<button
		aria-label="Wallpaper Source"
		role="menuitem"
		class="relative btn-plain scale-animation rounded-lg h-11 w-11 active:scale-90 theme-switch-btn"
		id="wallpaper-source-switch"
		onclick={togglePanel}
	>
		<Icon icon={currentIcon} class="text-[1.25rem]"></Icon>
	</button>

	<div
		id="wallpaper-source-panel"
		class="absolute transition float-panel-closed top-11 -right-2 pt-5"
	>
		<div class="card-base float-panel p-2 min-w-[10rem]">
			<!-- Panel title -->
			<div class="px-3 py-2 text-sm font-bold text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-700 mb-1">
				Wallpaper Source
			</div>
			{#each sources as option}
				<button
					class="flex transition whitespace-nowrap items-center !justify-start w-full btn-plain rounded-lg h-11 px-3 font-medium active:scale-95 theme-switch-btn mb-0.5 last:mb-0"
					data-active={currentSourceId === option.id}
					class:scale-animation={currentSourceId !== option.id}
					role="menuitem"
					onclick={() => switchSource(option.id)}
				>
					<Icon icon={option.icon} class="text-[1.25rem] mr-3"></Icon>
					<span>{option.label}</span>
				</button>
			{/each}
		</div>
	</div>
</div>

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

	:global(.theme-switch-btn)::before {
		transition:
			transform 75ms ease-out,
			background-color 0ms !important;
	}
</style>
