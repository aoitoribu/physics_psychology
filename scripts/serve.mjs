import { createServer } from "node:http";
import { createReadStream, statSync } from "node:fs";
import { extname, join, normalize, resolve, sep } from "node:path";

const root = resolve(".");
const host = process.env.HOST || "0.0.0.0";
const port = Number(process.env.PORT || 5173);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon"
};

const server = createServer((request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host}`);
  const pathname = decodeURIComponent(url.pathname);
  const filePath = resolveSafePath(pathname === "/" ? "/index.html" : pathname);

  if(!filePath){
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  serveFile(filePath, response);
});

server.listen(port, host, () => {
  console.log(`Local server: http://${host === "0.0.0.0" ? "localhost" : host}:${port}`);
  console.log("Set PORT=3000 or HOST=127.0.0.1 to override. 0.0.0.0 is ready for local port forwarding.");
});

function resolveSafePath(pathname){
  const normalized = normalize(pathname).replace(/^([/\\])+/, "");
  const filePath = resolve(join(root, normalized));
  if(filePath !== root && !filePath.startsWith(`${root}${sep}`)) return null;
  return filePath;
}

function serveFile(filePath, response){
  try{
    const stats = statSync(filePath);
    const target = stats.isDirectory() ? join(filePath, "index.html") : filePath;
    const contentType = mimeTypes[extname(target).toLowerCase()] || "application/octet-stream";
    response.writeHead(200, { "Content-Type": contentType });
    createReadStream(target).pipe(response);
  }catch{
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not Found");
  }
}
