/**
 * Testes do MathEngine (rode com: node tests/mathengine.test.mjs).
 * Como o jogo é buildless (IIFE global), carregamos o arquivo e avaliamos.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const code = readFileSync(join(__dirname, "../js/core/MathEngine.js"), "utf8");
const MathEngine = new Function(code + "\nreturn MathEngine;")();

let falhas = 0;
function ok(cond, msg) {
  if (!cond) {
    console.error("  ✗", msg);
    falhas++;
  }
}

// gerarOpcoes: 4 únicas, contém a resposta, todas > 0
for (let i = 0; i < 2000; i++) {
  const resp = MathEngine.inteiroAleatorio(1, 144);
  const ops = MathEngine.gerarOpcoes(resp);
  ok(ops.length === 4, "opções devem ter 4 itens");
  ok(new Set(ops).size === 4, "opções não podem repetir");
  ok(ops.includes(resp), "opções devem conter a resposta");
  ok(
    ops.every((n) => n > 0),
    "opções devem ser positivas"
  );
}

// gerarPergunta: a*b == resposta, foco na tabuada, fator na faixa
const tabuadas = [7];
const faixa = { min: 1, max: 10 };
for (let i = 0; i < 2000; i++) {
  const q = MathEngine.gerarPergunta(tabuadas, faixa);
  ok(q.a * q.b === q.resposta, "a*b deve ser a resposta");
  const foco = tabuadas.includes(q.a) ? q.a : q.b;
  ok(tabuadas.includes(foco), "um dos fatores deve ser a tabuada-foco");
  const outro = tabuadas.includes(q.a) ? q.b : q.a;
  ok(outro >= faixa.min && outro <= faixa.max, "o outro fator deve estar na faixa");
}

// repetição inteligente: um fato com peso alto deve aparecer mais
const fatos = { "7x8": 8 }; // muito errado → deve repetir bastante
let cont78 = 0;
const N = 4000;
for (let i = 0; i < N; i++) {
  const q = MathEngine.gerarPergunta([7], { min: 1, max: 10 }, fatos);
  if ((q.a === 7 && q.b === 8) || (q.a === 8 && q.b === 7)) cont78++;
}
// sem peso, 7x8 sairia ~1/10 (10%); com peso 8 deve ser bem acima de 25%.
const frac = cont78 / N;
ok(frac > 0.25, `7x8 ponderado deve aparecer mais (${(frac * 100).toFixed(1)}%)`);

// chaveFato canônica (ordem não importa)
ok(MathEngine.chaveFato(7, 8) === MathEngine.chaveFato(8, 7), "chaveFato deve ser canônica");

if (falhas) {
  console.error(`\n❌ ${falhas} verificação(ões) falharam.`);
  process.exit(1);
}
console.log("✅ MathEngine: todos os testes passaram.");
