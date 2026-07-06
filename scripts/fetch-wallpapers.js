/**
 * Pre-build wallpaper fetcher
 *
 * Fetches wallpaper URLs from all configured sources at build time
 * and saves them to a static JSON file for client-side use.
 *
 * Runs before `astro build` via the `prebuild` script in package.json.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---- Inline fetchers (no TS/imports needed for a standalone script) ----

const T_ALCY_CC = "https://t.alcy.cc/json";
const BING_API = "https://www.bing.com/HPImageArchive.aspx";

async function fetchTAlcy(count = 4, category = "pc") {
	const url = `${T_ALCY_CC}?${category}=${count}`;
	const res = await fetch(url);
	const text = await res.text();

	if (text.trim().startsWith("{")) {
		const body = JSON.parse(text);
		const list = Array.isArray(body.data) ? body.data : [body.data];
		return list.map((i) => ({ url: i.link })).filter((i) => i.url);
	}

	return text
		.split("\n")
		.map((l) => l.trim())
		.filter(Boolean)
		.map((url) => ({ url }));
}

async function fetchBing(region = "zh-CN", count = 1, resolution = "hd") {
	const url = `${BING_API}?format=js&idx=0&n=${count}&mkt=${region}`;
	const res = await fetch(url);
	const data = await res.json();

	if (!data?.images?.length) return [];

	const suffix = resolution === "uhd" ? "_UHD.jpg" : "_1920x1080.jpg";
	return data.images.map((item) => ({
		url: "https://www.bing.com" + item.urlbase + suffix,
		title: item.title || "",
		copyright: item.copyright || "",
		date: item.startdate || "",
	}));
}

// ---- Main ----

async function main() {
	const outputDir = path.resolve(__dirname, "../public/data");
	fs.mkdirSync(outputDir, { recursive: true });

	const wallpapers = {};

	// 1. t-alcy-cc
	try {
		console.log("[wallpaper-fetcher] Fetching t-alcy-cc...");
		const items = await fetchTAlcy(8, "pc");
		wallpapers["t-alcy-cc"] = items;
		console.log(`  -> ${items.length} images`);
	} catch (err) {
		console.error("  -> FAILED:", err.message);
		wallpapers["t-alcy-cc"] = [];
	}

	// 2. Bing
	try {
		console.log("[wallpaper-fetcher] Fetching Bing...");
		const items = await fetchBing("zh-CN", 1, "hd");
		wallpapers["bing"] = items;
		console.log(`  -> ${items.length} images`);
	} catch (err) {
		console.error("  -> FAILED:", err.message);
		wallpapers["bing"] = [];
	}

	// 3. Default is empty (uses static images)
	wallpapers["default"] = [];

	// Write combined file
	const outputPath = path.join(outputDir, "wallpapers.json");
	fs.writeFileSync(outputPath, JSON.stringify(wallpapers, null, 2));
	console.log(`\n[wallpaper-fetcher] Written to ${outputPath}`);
}

main().catch((err) => {
	console.error("[wallpaper-fetcher] Fatal:", err);
	process.exit(1);
});
