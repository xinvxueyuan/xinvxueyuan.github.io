<script lang="ts">
	import {
		WALLPAPER_BANNER,
		WALLPAPER_FULLSCREEN,
		WALLPAPER_NONE,
	} from "@constants/constants";
	import I18nKey from "@i18n/i18nKey";
	import { i18n } from "@i18n/translation";
	import NavPanelButton from "../../common/NavPanelButton.svelte";
	import Icon from "@iconify/svelte";
	import {
		getStoredWallpaperMode,
		setWallpaperMode,
	} from "@utils/setting-utils";
	import { onMount } from "svelte";

	import type { WALLPAPER_MODE } from "@/types/config";

	const wallpaperOptions: {
		mode: WALLPAPER_MODE;
		icon: string;
		label: I18nKey;
	}[] = [
		{
			mode: WALLPAPER_BANNER,
			icon: "material-symbols:image-outline",
			label: I18nKey.wallpaperBanner,
		},
		{
			mode: WALLPAPER_FULLSCREEN,
			icon: "material-symbols:wallpaper",
			label: I18nKey.wallpaperFullscreen,
		},
		{
			mode: WALLPAPER_NONE,
			icon: "material-symbols:hide-image-outline",
			label: I18nKey.wallpaperNone,
		},
	];

	let mode: WALLPAPER_MODE = $state(WALLPAPER_BANNER);

	onMount(() => {
		mode = getStoredWallpaperMode();
	});

	const currentIcon = $derived(
		wallpaperOptions.find((opt) => opt.mode === mode)?.icon ||
			wallpaperOptions[0].icon,
	);

	function switchMode(newMode: WALLPAPER_MODE) {
		mode = newMode;
		setWallpaperMode(newMode);
	}

	function closePanel(panel: HTMLElement) {
		panel.classList.add("float-panel-closed");
	}
</script>

<NavPanelButton
	icon={currentIcon}
	panelId="wallpaper-mode-panel"
	btnId="wallpaper-mode-switch"
	ariaLabel="Wallpaper Mode"
	onclose={closePanel}
>
	{#each wallpaperOptions as option}
		<button
			class="flex transition whitespace-nowrap items-center !justify-start w-full btn-plain rounded-lg h-11 px-3 font-medium active:scale-95 theme-switch-btn mb-0.5 last:mb-0"
			data-active={mode === option.mode}
			data-close-panel="true"
			class:scale-animation={mode !== option.mode}
			role="menuitem"
			onclick={() => switchMode(option.mode)}
		>
			<Icon icon={option.icon} class="text-[1.25rem] mr-3"></Icon>
			{i18n(option.label)}
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
