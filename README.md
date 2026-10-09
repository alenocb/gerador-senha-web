# Gerador de Senhas

Aplicacao simples com uma CLI em Node.js e uma interface web em HTML, CSS e JavaScript. A geracao usa `node:crypto`, e a senha nao e armazenada.

## Requisitos

Node.js 20 ou superior. O projeto nao usa dependencias externas.

## Aplicacao web

Na raiz do projeto:

```powershell
npm.cmd start
```

Abra `http://127.0.0.1:3000`. O formulario permite escolher comprimento e grupos de caracteres, gerar outra senha e copia-la para a area de transferencia. A avaliacao de forca e aproximada e usa os bits estimados: menos de 40 e fraca, de 40 a 69 e media, e 70 ou mais e forte.

## CLI

```powershell
npm.cmd run cli -- --help
npm.cmd run cli -- --length 24 --special-characters
npm.cmd run cli -- --length 32 --no-uppercase --no-digits
```

O tamanho padrao e 16. Letras minusculas, maiusculas e numeros sao incluidas por padrao; caracteres especiais sao opcionais. Cada grupo habilitado aparece ao menos uma vez. O tamanho deve comportar todos os grupos selecionados.

## Testes

```powershell
npm.cmd test
```

Se `node` ou `npm.cmd` nao forem reconhecidos no terminal que ja estava aberto, reinicie o VS Code para carregar o `PATH` atualizado.
