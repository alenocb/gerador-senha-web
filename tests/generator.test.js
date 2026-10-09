import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { assessPasswordStrength, generatePassword } from "../src/gerador_senha/generator.js";

test("gera o tamanho pedido e inclui cada grupo selecionado", () => {
  const password = generatePassword({
    length: 4,
    lowercase: true,
    uppercase: true,
    digits: true,
    specialCharacters: true,
  });

  assert.equal(password.length, 4);
  assert.match(password, /[a-z]/);
  assert.match(password, /[A-Z]/);
  assert.match(password, /[0-9]/);
  assert.match(password, /[!@#$%^&*()\-_=+\[\]{};:,.?]/);
});

test("usa somente os grupos selecionados", () => {
  const password = generatePassword({
    length: 40,
    lowercase: false,
    uppercase: false,
    digits: true,
    specialCharacters: false,
  });

  assert.match(password, /^\d+$/);
});

test("recusa quando nenhum grupo esta selecionado", () => {
  assert.throws(
    () => generatePassword({
      lowercase: false,
      uppercase: false,
      digits: false,
      specialCharacters: false,
    }),
    /Ative ao menos um grupo/,
  );
});

test("recusa tamanho menor que o numero de grupos selecionados", () => {
  assert.throws(
    () => generatePassword({
      length: 1,
      lowercase: true,
      uppercase: true,
      digits: false,
      specialCharacters: false,
    }),
    /pelo menos 2/,
  );
});

test("recusa opcoes e tamanhos invalidos", () => {
  assert.throws(() => generatePassword({ length: 0 }), /entre 1 e 256/);
  assert.throws(() => generatePassword({ length: 8, digits: "yes" }), /deve ser booleana/);
});

test("CLI imprime a senha solicitada", () => {
  const cliPath = fileURLToPath(new URL("../src/gerador_senha/cli.js", import.meta.url));
  const result = spawnSync(process.execPath, [cliPath, "--length", "20", "--special-characters"], {
    encoding: "utf8",
  });

  assert.equal(result.status, 0);
  assert.equal(result.stdout.trim().length, 20);
});

test("classifica estimativa de forca conforme tamanho e grupos selecionados", () => {
  assert.equal(
    assessPasswordStrength({ length: 8, lowercase: true, uppercase: false, digits: false }).level,
    "weak",
  );
  assert.equal(
    assessPasswordStrength({ length: 9, lowercase: true, uppercase: false, digits: false }).level,
    "medium",
  );
  assert.equal(
    assessPasswordStrength({ length: 12, lowercase: true, uppercase: true, digits: true }).level,
    "strong",
  );
});