/**
 * Testes das Regras (rode com: node tests/regras.test.mjs).
 * Regras.js é um IIFE global que usa a config JOGO (js/data/fases.js);
 * carregamos os dois e avaliamos, como nos demais testes buildless.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const codeFases = readFileSync(join(__dirname, "../js/data/fases.js"), "utf8");
const codeRegras = readFileSync(join(__dirname, "../js/core/Regras.js"), "utf8");
const { Regras, JOGO } = new Function(
  codeFases + "\n" + codeRegras + "\nreturn { Regras, JOGO };"
)();

let falhas = 0;
function ok(cond, msg) {
  if (!cond) {
    console.error("  ✗", msg);
    falhas++;
  }
}

// pontosAcerto: base × combo; chefão usa a base do chefão
ok(Regras.pontosAcerto(false, 1) === JOGO.pontos.base, "acerto simples = base");
ok(Regras.pontosAcerto(false, 4) === JOGO.pontos.base * 4, "combo multiplica a base");
ok(Regras.pontosAcerto(true, 1) === JOGO.pontos.chefao, "chefão usa base maior");
ok(
  Regras.pontosAcerto(true, 3) === JOGO.pontos.chefao * 3,
  "chefão também multiplica pelo combo"
);
ok(
  Regras.pontosAcerto(true, 1) > Regras.pontosAcerto(false, 1),
  "acerto no chefão vale mais que no inimigo comum"
);

// bonusVitoria: vidas e combo máximo
ok(Regras.bonusVitoria(0, 0) === 0, "sem vidas nem combo → sem bônus");
ok(
  Regras.bonusVitoria(3, 10) === 3 * JOGO.pontos.bonusVida + 10 * JOGO.pontos.bonusCombo,
  "bônus soma vidas e combo"
);

// calcularEstrelas: 1..3 conforme vidas; Boss Rush sempre 3
ok(Regras.calcularEstrelas(3, false) === 3, "3 vidas → 3 estrelas");
ok(Regras.calcularEstrelas(2, false) === 2, "2 vidas → 2 estrelas");
ok(Regras.calcularEstrelas(1, false) === 1, "1 vida → 1 estrela");
ok(Regras.calcularEstrelas(0, false) === 1, "vitória vale no mínimo 1 estrela");
ok(Regras.calcularEstrelas(99, false) === 3, "estrelas têm teto de 3");
ok(Regras.calcularEstrelas(0, true) === 3, "Boss Rush vale sempre 3 estrelas");

// moedasVitoria: acertos + bônus fixo + estrelas
ok(
  Regras.moedasVitoria(0, 1) === JOGO.moedas.bonusVitoria + JOGO.moedas.porEstrela,
  "vitória mínima = bônus fixo + 1 estrela"
);
ok(
  Regras.moedasVitoria(12, 3) ===
    12 + JOGO.moedas.bonusVitoria + 3 * JOGO.moedas.porEstrela,
  "moedas somam partida + bônus + estrelas"
);
ok(
  Regras.moedasVitoria(10, 3) > Regras.moedasVitoria(10, 1),
  "mais estrelas → mais moedas"
);

if (falhas) {
  console.error(`\n❌ Regras: ${falhas} verificação(ões) falharam.`);
  process.exit(1);
}
console.log("✅ Regras: todos os testes passaram.");
