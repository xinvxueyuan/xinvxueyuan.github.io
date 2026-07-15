import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const forbiddenFramework = /(?:astro|svelte)/iu;
const forbiddenSwupImport = /(?:from\s+|import\s*(?:\(\s*)?)["'][^"']*swup/iu;
const eagerPhotoSwipeImport =
	/^\s*import\s+(?!type\b)(?:(?:[^"']+?\s+from\s+)?["'])photoswipe(?:\/lightbox)?["']/mu;
const sourceExtensions = new Set([
	".astro",
	".js",
	".jsx",
	".mjs",
	".mts",
	".svelte",
	".ts",
	".tsx",
]);
const rootConfigurationFiles = [
	".editorconfig",
	".gitattributes",
	".gitignore",
	".prettierignore",
	".prettierrc",
	"package.json",
	"vercel.json",
	"next.config.ts",
	"postcss.config.mjs",
	"eslint.config.mjs",
	"playwright.config.ts",
	"vitest.config.ts",
	"tsconfig.json",
	"Taskfile.yml",
];

async function walk(directory: string): Promise<string[]> {
	const entries = await readdir(directory, { withFileTypes: true }).catch(
		() => [],
	);
	const files: string[] = [];
	for (const entry of entries) {
		const target = path.join(directory, entry.name);
		if (entry.isDirectory()) files.push(...(await walk(target)));
		else if (entry.isFile()) files.push(target);
	}
	return files;
}

export async function findLegacyFrameworkResidue(
	root: string,
): Promise<string[]> {
	const findings: string[] = [];
	const packageJson = JSON.parse(
		await readFile(path.join(root, "package.json"), "utf8"),
	) as { dependencies?: Record<string, string> };

	for (const dependency of Object.keys(packageJson.dependencies ?? {})) {
		if (forbiddenFramework.test(dependency)) {
			findings.push(`production dependency: ${dependency}`);
		}
	}

	for (const file of await walk(path.join(root, "src"))) {
		if (file.includes(`${path.sep}content${path.sep}posts${path.sep}`))
			continue;
		const relative = path.relative(root, file).split(path.sep).join("/");
		if (forbiddenFramework.test(path.basename(file))) {
			findings.push(`source file: ${relative}`);
			continue;
		}
		if (!sourceExtensions.has(path.extname(file))) continue;
		const contents = await readFile(file, "utf8");
		if (
			forbiddenFramework.test(contents) ||
			forbiddenSwupImport.test(contents)
		) {
			findings.push(`source reference: ${relative}`);
		}
	}

	for (const entry of await readdir(root, { withFileTypes: true })) {
		if (entry.isFile() && forbiddenFramework.test(entry.name)) {
			findings.push(`root config: ${entry.name}`);
		}
	}

	const configurationFiles = [
		...rootConfigurationFiles.map((file) => path.join(root, file)),
		...(await walk(path.join(root, ".github", "workflows"))),
	];
	for (const file of configurationFiles) {
		const contents = await readFile(file, "utf8").catch(() => undefined);
		if (contents && forbiddenFramework.test(contents)) {
			findings.push(
				`config reference: ${path.relative(root, file).split(path.sep).join("/")}`,
			);
		}
	}

	for (const legacyDirectory of ["legacy/astro", "legacy/svelte"]) {
		if ((await walk(path.join(root, legacyDirectory))).length > 0) {
			findings.push(`legacy directory: ${legacyDirectory}`);
		}
	}

	return findings.sort();
}

export async function findEagerDiscoveryImports(
	root: string,
): Promise<string[]> {
	const findings: string[] = [];
	for (const file of await walk(path.join(root, "src"))) {
		if (!sourceExtensions.has(path.extname(file))) continue;
		const relative = path.relative(root, file).split(path.sep).join("/");
		const contents = await readFile(file, "utf8");
		if (
			contents.includes('from "mermaid"') ||
			contents.includes("from 'mermaid'")
		)
			findings.push(`eager Mermaid import: ${relative}`);
		if (
			relative !== "src/components/interactive/search.tsx" &&
			contents.includes("/pagefind/pagefind.js")
		)
			findings.push(`eager Pagefind reference: ${relative}`);
		if (
			relative !== "src/components/interactive/album-lightbox.tsx" &&
			eagerPhotoSwipeImport.test(contents)
		)
			findings.push(`eager PhotoSwipe import: ${relative}`);
	}
	return findings.sort();
}

async function main(): Promise<void> {
	const root = process.cwd();
	const findings = [
		...(await findLegacyFrameworkResidue(root)),
		...(await findEagerDiscoveryImports(root)),
	];
	if (findings.length > 0) {
		console.error("MVP framework boundary violations detected:\n");
		console.error(findings.map((finding) => `- ${finding}`).join("\n"));
		process.exitCode = 1;
		return;
	}
	console.log(
		"MVP framework scan passed: no legacy runtime or eager discovery dependency residue.",
	);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
	await main();
}
