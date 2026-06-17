import { createServer } from "node:http";
import { readFile, writeFile, mkdir, stat } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const root = fileURLToPath(new URL(".", import.meta.url));
const distDir = join(root, "dist");
const dataDir = join(root, "data", "runtime");
const port = Number(process.env.PORT || 3000);
const sessionTtlHours = Number(process.env.SESSION_TTL_HOURS || 168);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon"
};

async function readJsonStore(name, fallback) {
  await mkdir(dataDir, { recursive: true });
  const file = join(dataDir, `${name}.json`);
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch {
    await writeFile(file, JSON.stringify(fallback, null, 2));
    return fallback;
  }
}

async function writeJsonStore(name, value) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(join(dataDir, `${name}.json`), JSON.stringify(value, null, 2));
}

function json(res, status, body) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff"
  });
  res.end(JSON.stringify(body));
}

async function parseBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function createToken() {
  return crypto.randomBytes(32).toString("hex");
}

function hashPassword(password) {
  return crypto.createHash("sha256").update(`${process.env.SESSION_SECRET || "dev"}:${password}`).digest("hex");
}

async function currentUser(req) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return null;
  const sessions = await readJsonStore("sessions", []);
  const session = sessions.find((item) => item.token === token && item.expiresAt > Date.now());
  return session?.user || null;
}

async function handleApi(req, res) {
  if (req.url === "/api/health") {
    json(res, 200, {
      ok: true,
      app: "Lakbay AI Philippines",
      node: process.version,
      database: process.env.DATABASE_URL ? "DATABASE_URL configured" : "file-store fallback active",
      aiSecretsOnBackend: true
    });
    return true;
  }

  if (req.url === "/api/auth/signup" && req.method === "POST") {
    const body = await parseBody(req);
    const users = await readJsonStore("users", []);
    if (!body.email || !body.password) return json(res, 400, { error: "Email and password are required." });
    if (users.some((user) => user.email === body.email)) return json(res, 409, { error: "Account already exists." });
    const user = { id: createToken(), name: body.name || "Traveller", email: body.email, role: "user", createdAt: new Date().toISOString() };
    users.push({ ...user, passwordHash: hashPassword(body.password) });
    await writeJsonStore("users", users);
    json(res, 201, { user });
    return true;
  }

  if (req.url === "/api/auth/signin" && req.method === "POST") {
    const body = await parseBody(req);
    const users = await readJsonStore("users", []);
    const found = users.find((user) => user.email === body.email && user.passwordHash === hashPassword(body.password));
    if (!found) return json(res, 401, { error: "Invalid login." });
    const token = createToken();
    const sessions = await readJsonStore("sessions", []);
    const user = { id: found.id, name: found.name, email: found.email, role: found.role };
    sessions.push({ token, user, expiresAt: Date.now() + sessionTtlHours * 60 * 60 * 1000 });
    await writeJsonStore("sessions", sessions);
    json(res, 200, { token, user });
    return true;
  }

  if (req.url === "/api/trips" && req.method === "GET") {
    const user = await currentUser(req);
    if (!user) return json(res, 401, { error: "Authentication required." });
    const trips = await readJsonStore("trips", []);
    json(res, 200, { trips: trips.filter((trip) => trip.userId === user.id) });
    return true;
  }

  if (req.url === "/api/trips" && req.method === "POST") {
    const user = await currentUser(req);
    if (!user) return json(res, 401, { error: "Authentication required." });
    const body = await parseBody(req);
    const trips = await readJsonStore("trips", []);
    const trip = { id: createToken(), userId: user.id, ...body, createdAt: new Date().toISOString() };
    trips.push(trip);
    await writeJsonStore("trips", trips);
    json(res, 201, { trip });
    return true;
  }

  if (req.url === "/api/ai/run" && req.method === "POST") {
    const user = await currentUser(req);
    if (!user) return json(res, 401, { error: "Authentication required." });
    const body = await parseBody(req);
    json(res, 202, {
      status: "queued",
      provider: body.provider || "default",
      warning: "Connect backend provider keys before sending live AI requests.",
      prompt: body.prompt
    });
    return true;
  }

  if (req.url === "/api/webhooks/test" && req.method === "POST") {
    const user = await currentUser(req);
    if (!user || user.role !== "admin") return json(res, 403, { error: "Admin role required." });
    const body = await parseBody(req);
    json(res, 200, {
      delivered: false,
      payload: {
        event: body.event || "trip.created",
        signed: Boolean(process.env.WEBHOOK_SIGNING_SECRET),
        payload: body.payload || {}
      }
    });
    return true;
  }

  return false;
}

async function serveStatic(req, res) {
  const requestPath = decodeURIComponent(req.url?.split("?")[0] || "/");
  const safePath = normalize(requestPath).replace(/^(\.\.[/\\])+/, "");
  let filePath = join(distDir, safePath === "/" ? "index.html" : safePath);

  try {
    const fileStat = await stat(filePath);
    if (fileStat.isDirectory()) filePath = join(filePath, "index.html");
  } catch {
    filePath = join(distDir, "index.html");
  }

  const ext = extname(filePath);
  res.writeHead(200, {
    "content-type": mimeTypes[ext] || "application/octet-stream",
    "x-content-type-options": "nosniff",
    "referrer-policy": "strict-origin-when-cross-origin"
  });
  createReadStream(filePath).pipe(res);
}

createServer(async (req, res) => {
  try {
    if (req.url?.startsWith("/api/")) {
      const handled = await handleApi(req, res);
      if (!handled) json(res, 404, { error: "API route not found." });
      return;
    }
    await serveStatic(req, res);
  } catch (error) {
    json(res, 500, { error: error instanceof Error ? error.message : "Unexpected server error." });
  }
}).listen(port, "0.0.0.0", () => {
  console.log(`Lakbay AI Philippines server listening on http://0.0.0.0:${port}`);
});
