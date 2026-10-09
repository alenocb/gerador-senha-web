const form = document.querySelector("#password-form");
const lengthInput = document.querySelector("#length");
const lengthValue = document.querySelector("#length-value");
const passwordOutput = document.querySelector("#password-output");
const resultLength = document.querySelector("#result-length");
const formMessage = document.querySelector("#form-message");
const copyButton = document.querySelector("#copy-button");
const copyLabel = document.querySelector("#copy-label");
const copyMessage = document.querySelector("#copy-message");
const strengthValue = document.querySelector("#strength-value");
const strengthFill = document.querySelector("#strength-fill");
const strengthTrack = document.querySelector(".strength-track");
const strengthDetails = document.querySelector("#strength-details");

let currentPassword = "";
let strengthUpdateTimer;

function selectedOptions() {
  return {
    length: Number(lengthInput.value),
    lowercase: form.elements.lowercase.checked,
    uppercase: form.elements.uppercase.checked,
    digits: form.elements.digits.checked,
    specialCharacters: form.elements.specialCharacters.checked,
  };
}

function showStrength(strength) {
  strengthValue.textContent = strength.label;
  strengthValue.dataset.level = strength.level;
  strengthFill.dataset.level = strength.level;
  strengthFill.style.width = `${strength.meterValue}%`;
  strengthTrack.setAttribute("aria-valuenow", String(strength.meterValue));
  strengthDetails.textContent = `Estimativa aproximada: ${strength.estimatedBits} bits, baseada no tamanho e nos grupos selecionados.`;
}

async function updateStrength() {
  try {
    const response = await fetch("/api/strength", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(selectedOptions()),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error ?? "Nao foi possivel avaliar a senha.");
    showStrength(result.strength);
  } catch (error) {
    strengthValue.textContent = "Indisponivel";
    strengthValue.dataset.level = "unavailable";
    strengthDetails.textContent = error.message;
  }
}

async function generatePassword() {
  formMessage.hidden = true;
  copyMessage.textContent = "";
  copyButton.disabled = true;

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(selectedOptions()),
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error ?? "Nao foi possivel gerar a senha.");
    }

    currentPassword = result.password;
    passwordOutput.textContent = currentPassword;
    resultLength.textContent = `${currentPassword.length} caracteres`;
    showStrength(result.strength);
    copyButton.disabled = false;
  } catch (error) {
    currentPassword = "";
    formMessage.textContent = error.message;
    formMessage.hidden = false;
  }
}

lengthInput.addEventListener("input", () => {
  lengthValue.value = lengthInput.value;
  resultLength.textContent = `${lengthInput.value} caracteres`;
  window.clearTimeout(strengthUpdateTimer);
  strengthUpdateTimer = window.setTimeout(updateStrength, 120);
});

form.addEventListener("change", (event) => {
  if (event.target.matches('input[type="checkbox"]')) updateStrength();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  generatePassword();
});

copyButton.addEventListener("click", async () => {
  if (!currentPassword) return;

  try {
    await navigator.clipboard.writeText(currentPassword);
    copyLabel.textContent = "Copiada";
    copyMessage.textContent = "Senha copiada para a area de transferencia.";
    window.setTimeout(() => {
      copyLabel.textContent = "Copiar senha";
    }, 1500);
  } catch {
    copyMessage.textContent = "Nao foi possivel acessar a area de transferencia.";
  }
});

generatePassword();