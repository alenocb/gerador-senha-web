import { createServer as createHttpServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { assessPasswordStrength, generatePassword } from "./generator.js";

const staticFiles = new Map([
  ["/", ["index.html", "text/html; charset=utf-8"]],
  ["/index.html", ["index.html", "text/html; charset=utf-8"]],
  ["/styles.css", ["styles.css", "text/css; charset=utf-8"]],
  ["/app.js", ["app.js", "text/javascript; charset=utf-8"]],
]);

const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "Content-Security-Policy": "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",
};

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    ...securityHeaders,
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(payload));
}

async function readJsonBody(request) {
  let body = "";
  for await (const chunk of request) {
    body += chunk;
    if (Buffer.byteLength(body) > 4096) {
      const error = new Error("A requisicao excede o limite permitido.");
      error.statusCode = 413;
      throw error;
    }
  }
  return JSON.parse(body);
}

export function createServer() {
  return createHttpServer(async (request, response) => {
    const requestUrl = new URL(request.url, "http://localhost");

    if (
      request.method === "POST" &&
      ["/api/generate", "/api/strength"].includes(requestUrl.pathname)
    ) {
      if (!request.headers["content-type"]?.startsWith("application/json")) {
        sendJson(response, 415, { error: "Envie as opcoes como JSON." });
        return;
      }

      try {
        const options = await readJsonBody(request);
        if (requestUrl.pathname === "/api/strength") {
          sendJson(response, 200, { strength: assessPasswordStrength(options) });
          return;
        }
        const password = generatePassword(options);
        sendJson(response, 200, { password, strength: assessPasswordStrength(options) });
      } catch (error) {
        sendJson(response, error.statusCode ?? 400, { error: error.message });
      }
      return;
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      sendJson(response, 405, { error: "Metodo nao permitido." });
      return;
    }

    const file = staticFiles.get(requestUrl.pathname);
    if (!file) {
      sendJson(response, 404, { error: "Pagina nao encontrada." });
      return;
    }

    try {
      const fileUrl = new URL(`../../web/${file[0]}`, import.meta.url);
      const content = await readFile(fileURLToPath(fileUrl));
      response.writeHead(200, {
        ...securityHeaders,
        "Content-Type": file[1],
        "Cache-Control": "no-cache",
      });
      response.end(request.method === "HEAD" ? undefined : content);
    } catch {
      sendJson(response, 500, { error: "Nao foi possivel carregar a interface." });
    }
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT ?? 3000);
  const host = process.env.HOST ?? "127.0.0.1";
  const server = createServer();

  server.listen(port, host, () => {
    process.stdout.write(`Gerador de senhas disponivel em http://${host}:${port}\n`);
  });
}