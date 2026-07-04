/**
 * Shared Meting API client — used by both musicPlayerStore and usePlaylist.
 *
 * Fetches playlist data from a Meting-compatible API endpoint.
 */

export interface MetingApiParams {
	api: string;
	server: string;
	type: string;
	id: string;
}

export async function fetchMetingApi(
	params: MetingApiParams,
): Promise<any[]> {
	const { api, server, type, id } = params;
	if (!api || !id) throw new Error("Missing api or id");

	const apiUrl = api
		.replace(":server", server)
		.replace(":type", type)
		.replace(":id", id)
		.replace(":auth", "")
		.replace(":r", Date.now().toString());

	const res = await fetch(apiUrl);
	if (!res.ok) {
		throw new Error(`Meting API error: HTTP ${res.status}`);
	}
	return res.json();
}
