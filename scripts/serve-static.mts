import { createReadStream } from "node:fs";
import { access, stat } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../dist");
const args = process.argv.slice(2);
function argument(name: string, fallback: string): string {
  const inline = args.find((item) => item.startsWith(`${name}=`));
  if (inline) return inline.slice(name.length + 1);
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] ?? fallback : fallback;
}
const host = argument("--host", process.env.HOST ?? "127.0.0.1");
const port = Number(argument("--port", process.env.PORT ?? "4173"));

const mimeTypes: Record<string, string> = {
  ".avif": "image/avif",
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
};

async function resolveFile(pathname: string): Promise<string | undefined> {
  let decodedPath: string;
  try { decodedPath = decodeURIComponent(pathname); }
  catch { return undefined; }
  const candidate = path.resolve(root, `.${decodedPath}`);
  if (candidate !== root && !candidate.startsWith(`${root}${path.sep}`)) return undefined;
  const candidates = [candidate, path.join(candidate, "index.html")];
  for (const file of candidates) {
    try {
      const details = await stat(file);
      if (details.isFile()) return file;
    } catch {
      // Try the nested index, then the static 404.
    }
  }
  return undefined;
}

const server = http.createServer(async (request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" });
    response.end("Method Not Allowed");
    return;
  }

  let pathname: string;
  try { pathname = new URL(request.url ?? "/", `http://${host}:${port}`).pathname; }
  catch {
    response.writeHead(400);
    response.end("Bad Request");
    return;
  }

  let file = await resolveFile(pathname);
  const missing = !file;
  if (!file) file = path.join(root, "404.html");
  try { await access(file); }
  catch {
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Static build is missing dist/404.html; run pnpm build first.");
    return;
  }

  const extension = path.extname(file).toLowerCase();
  const contentType = pathname.includes("/opengraph-image")
    ? "image/png"
    : mimeTypes[extension] ?? "application/octet-stream";
  response.writeHead(missing ? 404 : 200, {
    "Content-Type": contentType,
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  });
  if (request.method === "HEAD") response.end();
  else createReadStream(file).pipe(response);
});

server.listen(port, host, () => {
  console.info(`Static preview: http://${host}:${port} -> ${root}`);
});
