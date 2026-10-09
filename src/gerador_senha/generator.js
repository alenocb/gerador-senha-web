import { randomInt } from "node:crypto";

const characterGroups = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  specialCharacters: "!@#$%^&*()-_=+[]{};:,.?",
};

function resolveOptions(options) {
  if (options === null || typeof options !== "object" || Array.isArray(options)) {
    throw new TypeError("As opcoes da senha devem ser um objeto.");
  }

  const length = options.length === undefined ? 16 : options.length;

  if (!Number.isInteger(length) || length < 1 || length > 256) {
    throw new RangeError("O tamanho deve ser um numero inteiro entre 1 e 256.");
  }

  for (const name of Object.keys(characterGroups)) {
    const value = options[name];
    if (value !== undefined && typeof value !== "boolean") {
      throw new TypeError(`A opcao ${name} deve ser booleana.`);
    }
  }

  const selectedGroups = Object.entries(characterGroups).filter(([name]) => {
    if (options[name] !== undefined) return options[name];
    return name === "lowercase" || name === "uppercase" || name === "digits";
  });

  if (selectedGroups.length === 0) {
    throw new RangeError("Ative ao menos um grupo de caracteres.");
  }
  if (length < selectedGroups.length) {
    throw new RangeError(
      `O tamanho deve ser de pelo menos ${selectedGroups.length} para incluir todos os grupos selecionados.`,
    );
  }

  return { length, selectedGroups };
}

export function assessPasswordStrength(options = {}) {
  const { length, selectedGroups } = resolveOptions(options);
  const alphabetSize = selectedGroups.reduce(
    (size, [, characters]) => size + characters.length,
    0,
  );
  const estimatedBits = length * Math.log2(alphabetSize);
  const level = estimatedBits < 40 ? "weak" : estimatedBits < 70 ? "medium" : "strong";
  const label = { weak: "Fraca", medium: "Média", strong: "Forte" }[level];

  return {
    level,
    label,
    estimatedBits: Math.round(estimatedBits),
    meterValue: Math.min(100, Math.round(estimatedBits)),
  };
}

export function generatePassword(options = {}) {
  const { length, selectedGroups } = resolveOptions(options);
  const alphabet = selectedGroups.map(([, characters]) => characters).join("");
  const password = selectedGroups.map(([, characters]) => characters[randomInt(characters.length)]);

  while (password.length < length) {
    password.push(alphabet[randomInt(alphabet.length)]);
  }

  for (let index = password.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(index + 1);
    [password[index], password[swapIndex]] = [password[swapIndex], password[index]];
  }

  return password.join("");
}