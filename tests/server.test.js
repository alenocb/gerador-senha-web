import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";
import { createServer } from "../src/gerador_senha/server.js";

test("serve a interface web", async (context) => {
  const server = createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  context.after(() => new Promise((resolve) => server.close(resolve)));

  const response = await fetch(`http://127.0.0.1:${server.address().port}/`);
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /Gerador de Senhas/);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
});

test("gera senha pela API e rejeita opcoes invalidas", async (context) => {
  const server = createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  context.after(() => new Promise((resolve) => server.close(resolve)));
  const url = `http://127.0.0.1:${server.address().port}/api/generate`;

  const validResponse = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ length: 12, lowercase: true, uppercase: true, digits: true }),
  });
  const validResult = await validResponse.json();
  assert.equal(validResponse.status, 200);
  assert.equal(validResult.password.length, 12);
  assert.equal(validResult.strength.level, "strong");
  assert.match(validResult.password, /[a-z]/);
  assert.match(validResult.password, /[A-Z]/);
  assert.match(validResult.password, /\d/);

  const invalidResponse = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ length: 1, lowercase: true, uppercase: true }),
  });
  assert.equal(invalidResponse.status, 400);
});

test("avalia a forca sem gerar uma senha", async (context) => {
  const server = createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  context.after(() => new Promise((resolve) => server.close(resolve)));

  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/strength`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ length: 8, lowercase: true, uppercase: false, digits: false }),
  });
  const result = await response.json();

  assert.equal(response.status, 200);
  assert.equal(result.strength.label, "Fraca");
  assert.equal(result.strength.level, "weak");
});