import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { generatePassword } from "./generator.js";

const helpText = `Uso: npm run cli -- [opcoes]

Opcoes:
  -l, --length NUMERO                 Tamanho da senha (padrao: 16, maximo: 256)
      --lowercase / --no-lowercase    Incluir letras minusculas (padrao: sim)
      --uppercase / --no-uppercase    Incluir letras maiusculas (padrao: sim)
      --digits / --no-digits          Incluir numeros (padrao: sim)
      --special-characters            Incluir caracteres especiais
      --help                           Mostrar esta ajuda
`;

const booleanOptions = new Map([
  ["--lowercase", ["lowercase", true]],
  ["--no-lowercase", ["lowercase", false]],
  ["--uppercase", ["uppercase", true]],
  ["--no-uppercase", ["uppercase", false]],
  ["--digits", ["digits", true]],
  ["--no-digits", ["digits", false]],
  ["--special-characters", ["specialCharacters", true]],
  ["--no-special-characters", ["specialCharacters", false]],
]);

export function parseArguments(argumentsList) {
  const options = {
    length: 16,
    lowercase: true,
    uppercase: true,
    digits: true,
    specialCharacters: false,
  };

  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];
    if (argument === "--help" || argument === "-h") {
      return { help: true };
    }

    if (argument === "--length" || argument === "-l") {
      const value = argumentsList[index + 1];
      if (value === undefined || value.startsWith("-")) {
        throw new Error(`Informe um valor para ${argument}.`);
      }
      options.length = Number(value);
      index += 1;
      continue;
    }

    if (argument.startsWith("--length=")) {
      options.length = Number(argument.slice("--length=".length));
      continue;
    }

    const booleanOption = booleanOptions.get(argument);
    if (booleanOption) {
      const [name, value] = booleanOption;
      options[name] = value;
      continue;
    }

    throw new Error(`Opcao desconhecida: ${argument}`);
  }

  return options;
}

export function main(argumentsList = process.argv.slice(2)) {
  try {
    const options = parseArguments(argumentsList);
    if (options.help) {
      process.stdout.write(helpText);
      return;
    }
    process.stdout.write(`${generatePassword(options)}\n`);
  } catch (error) {
    process.stderr.write(`Erro: ${error.message}\nUse --help para ver as opcoes.\n`);
    process.exitCode = 2;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}