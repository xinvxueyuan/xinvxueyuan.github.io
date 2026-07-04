/**
 * Image API utility — fetches banner/wallpaper image URLs with multi-source fallback.
 *
 * Auto-detects response format:
 *   - Starts with '{' → JSON (t.alcy.cc / alcy-api), extracts data[].link
 *   - Otherwise → text (one URL per line, PicFlow-compatible)
 */

export interface ImageApiConfig {
	enable: boolean;
	url: string;
	fallbackUrl?: string;
	fallbackCategory?: string;
	builtinProxy?: boolean;
	builtinCategory?: string;
	builtinCount?: number;
}

interface AlcyJsonItem { id: string; link: string; category: string; }
interface AlcyJsonResponse { code: number; category: string; count: number; data: AlcyJsonItem | AlcyJsonItem[]; }

const T_ALCY_CC = "https://t.alcy.cc/json";

// ---- Core fetch helpers ----

async function fetchFromUrl(url: string): Promise<string[]> {
	const res = await fetch(url, { headers: { Accept: "application/json, text/plain" } });
	const text = await res.text();

	if (text.trim().startsWith("{")) {
		const body: AlcyJsonResponse = JSON.parse(text);
		const dataList = Array.isArray(body.data) ? body.data : [body.data];
		return dataList.map((item) => item.link).filter(Boolean);
	}

	return text.split("\n").map((l) => l.trim()).filter(Boolean);
}

// ---- Multi-source fallback ----

type SourceFn = () => Promise<string[]>;

async function trySources(sources: Array<{ label: string; fn: SourceFn }>): Promise<string[]> {
	const errors: string[] = [];
	for (const { label, fn } of sources) {
		try {
			const urls = await fn();
			if (urls.length > 0) {
				console.log(`[image-api] ${label} (${urls.length} images)`);
				return urls;
			}
		} catch (err) {
			errors.push(`${label}: ${(err as Error).message}`);
		}
	}
	if (errors.length > 0) console.warn("[image-api] All sources failed:", errors.join(" | "));
	return [];
}

/**
 * Fetch image URLs from configured sources in priority order:
 *   1. Primary URL → 2. Fallback URL → 3. Built-in t.alcy.cc
 */
export async function fetchImageUrls(config: ImageApiConfig): Promise<string[]> {
	if (!config.enable) return [];

	const sources: Array<{ label: string; fn: SourceFn }> = [];

	if (config.url) {
		sources.push({ label: "Primary", fn: () => fetchFromUrl(config.url) });
	}
	if (config.fallbackUrl) {
		sources.push({ label: "Fallback", fn: () => fetchFromUrl(config.fallbackUrl!) });
	}
	if (config.builtinProxy !== false) {
		const category = config.builtinCategory || config.fallbackCategory || "pc";
		const count = config.builtinCount || 4;
		sources.push({
			label: `Built-in t.alcy.cc (${category})`,
			fn: () => fetchFromUrl(`${T_ALCY_CC}?${category}=${count}`),
		});
	}

	return trySources(sources);
}
