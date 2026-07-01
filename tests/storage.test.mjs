/**
 * Testes do Storage (rode com: node tests/storage.test.mjs).
 * Storage.js é um IIFE global que usa `localStorage`. Para testar no Node,
 * injetamos um mock de localStorage e carregamos o módulo via new Function.
 * Como o Storage lê o localStorage na inicialização, cada cenário cria uma
 * instância nova com seu próprio mock (permite testar migração).
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const code = readFileSync(join(__dirname, "../js/core/Storage.js"), "utf8");
// globais usados pelo Storage: dados (roupas/conquistas/herois/JOGO) + MathEngine
const codeRoupas = readFileSync(join(__dirname, "../js/data/roupas.js"), "utf8");
const codeConq = readFileSync(join(__dirname, "../js/data/conquistas.js"), "utf8");
const codeHerois = readFileSync(join(__dirname, "../js/data/herois.js"), "utf8");
const codeFases = readFileSync(join(__dirname, "../js/data/fases.js"), "utf8");
const codeMath = readFileSync(join(__dirname, "../js/core/MathEngine.js"), "utf8");

function makeLS(initial = {}) {
  const m = new Map(Object.entries(initial));
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
    _map: m,
    has: (k) => m.has(k),
  };
}
function loadStorage(ls) {
  // dados + MathEngine definem globais usados pelo Storage
  const bundle =
    codeHerois + "\n" + codeRoupas + "\n" + codeConq + "\n" + codeFases + "\n" +
    codeMath + "\n" + code + "\nreturn Storage;";
  return new Function("localStorage", bundle)(ls);
}

let falhas = 0;
function ok(cond, msg) {
  if (!cond) {
    console.error("  ✗", msg);
    falhas++;
  }
}

// 1) Estado inicial: sem perfis
{
  const ls = makeLS();
  const S = loadStorage(ls);
  ok(S.temPerfilAtual() === false, "fresh: sem perfil atual");
  ok(S.listarPerfis().length === 0, "fresh: lista de perfis vazia");
}

// 2) Criar perfil
{
  const ls = makeLS();
  const S = loadStorage(ls);
  const meta = S.criarPerfil("Ana", 3);
  ok(!!meta && meta.nome === "Ana", "criarPerfil retorna meta com nome");
  // id de perfil é string — a UI (data-perfil) depende disso; não pode ser
  // coagido com + (viraria NaN e a troca de jogador falha).
  ok(typeof meta.id === "string", "id de perfil é string");
  ok(S.perfilAtual().nome === "Ana", "perfil atual é Ana");
  ok(S.getHeroiId() === 3, "heroiId do perfil = 3");
  ok(ls.has(`idolmath.save.${meta.id}`), "save do perfil foi criado");
  ok(ls.has("idolmath.perfis.v1"), "índice de perfis foi gravado");
}

// 3) registrarResposta + estatísticas
{
  const ls = makeLS();
  const S = loadStorage(ls);
  S.criarPerfil("Bia", 1);
  S.registrarResposta(2, 3, true);
  S.registrarResposta(2, 4, true);
  S.registrarResposta(2, 5, true);
  S.registrarResposta(7, 8, false); // erro
  const e = S.estatisticas();
  ok(e.acertos === 3 && e.erros === 1, "estat conta 3 acertos / 1 erro");
  ok(e.precisao === 75, "precisão = 75%");
  ok(e.fraquezaTabuadas[7] > 0 && e.fraquezaTabuadas[8] > 0, "7 e 8 com fraqueza");
  ok(e.fraquezaTabuadas[2] === 0, "tabuada 2 sem fraqueza (só acertos)");
  ok(e.fatosFracos.includes("7×8"), "fatosFracos inclui 7×8");
  ok(e.maxFraqueza > 0, "maxFraqueza > 0");
}

// 4) adicionarTempo
{
  const ls = makeLS();
  const S = loadStorage(ls);
  S.criarPerfil("Cris", 1);
  S.adicionarTempo(5000);
  S.adicionarTempo(3000);
  ok(S.estatisticas().tempoMs === 8000, "tempo acumula (8000ms)");
  S.adicionarTempo(-50);
  ok(S.estatisticas().tempoMs === 8000, "tempo ignora valores negativos");
}

// 5) Isolamento entre perfis + troca
{
  const ls = makeLS();
  const S = loadStorage(ls);
  const ana = S.criarPerfil("Ana", 1);
  S.setEstrelas(1, 3);
  S.registrarResposta(9, 9, false);
  const bia = S.criarPerfil("Bia", 2); // novo perfil vira atual
  ok(S.totalEstrelas() === 0, "Bia começa sem estrelas (isolado)");
  ok(S.estatisticas().total === 0, "Bia começa sem estatísticas");
  S.selecionarPerfil(ana.id);
  ok(S.totalEstrelas() === 3, "Ana mantém 3 estrelas após voltar");
  ok(S.getHeroiId() === 1, "Ana mantém herói 1");
}

// 6) Remover perfil apaga o save
{
  const ls = makeLS();
  const S = loadStorage(ls);
  const ana = S.criarPerfil("Ana", 1);
  const key = `idolmath.save.${ana.id}`;
  ok(ls.has(key), "save existe antes de remover");
  S.removerPerfil(ana.id);
  ok(!ls.has(key), "save removido após removerPerfil");
  ok(S.listarPerfis().length === 0, "lista vazia após remover único perfil");
}

// 7) Config é global (persiste entre instâncias / perfis)
{
  const ls = makeLS();
  const S = loadStorage(ls);
  S.criarPerfil("Ana", 1);
  S.setConfig("voz", true);
  S.setConfig("musica", false);
  // nova instância lendo o MESMO localStorage
  const S2 = loadStorage(ls);
  ok(S2.getConfig().voz === true, "config voz persiste (global)");
  ok(S2.getConfig().musica === false, "config musica persiste (global)");
}

// 8) Migração do save antigo (v2, jogador único)
{
  const ls = makeLS({
    "idolmath.save.v2": JSON.stringify({
      melhorPontuacao: 1234,
      faseDesbloqueada: 6,
      heroiId: 4,
      estrelas: { 1: 3, 2: 2 },
      fatos: { "7x8": 4 },
      config: { musica: false, efeitos: true, timer: true, voz: true },
      bossRush: true,
    }),
  });
  const S = loadStorage(ls);
  ok(S.temPerfilAtual() === true, "migração: existe perfil atual");
  ok(S.listarPerfis().length === 1, "migração: 1 perfil criado");
  ok(S.getHeroiId() === 4, "migração: herói herdado (4)");
  ok(S.faseMax() === 6, "migração: fase herdada (6)");
  ok(S.totalEstrelas() === 5, "migração: estrelas herdadas (5)");
  ok(S.get().melhorPontuacao === 1234, "migração: recorde herdado");
  ok(S.bossRushDesbloqueado() === true, "migração: bossRush herdado");
  ok(S.getConfig().musica === false && S.getConfig().voz === true, "migração: config p/ global");
  ok(!ls.has("idolmath.save.v2"), "migração: save antigo removido");
}

// 9) Moedas
{
  const ls = makeLS();
  const S = loadStorage(ls);
  S.criarPerfil("Ana", 1);
  ok(S.getMoedas() === 0, "moedas começam em 0");
  S.addMoedas(50);
  ok(S.getMoedas() === 50, "addMoedas soma");
  ok(S.gastarMoedas(30) === true && S.getMoedas() === 20, "gastarMoedas debita");
  ok(S.gastarMoedas(999) === false, "gastarMoedas falha sem saldo");
  ok(S.getMoedas() === 20, "saldo intacto após falha");
}

// 10) Roupas: equipar base, comprar e equipar
{
  const ls = makeLS();
  const S = loadStorage(ls);
  S.criarPerfil("Bia", 1); // herói 1 (Rubi)
  ok(S.roupaEquipada(1) === "heroi1", "roupa padrão = base do herói");
  ok(S.possuiRoupa("heroi1") === true, "base sempre possuída");
  ok(S.possuiRoupa("rubi-festa") === false, "roupa paga não possuída no início");
  ok(S.comprarRoupa(1, "rubi-festa", 60) === false, "compra falha sem moedas");
  S.addMoedas(100);
  ok(S.comprarRoupa(1, "rubi-festa", 60) === true, "compra ok com saldo");
  ok(S.getMoedas() === 40, "moedas debitadas na compra");
  ok(S.possuiRoupa("rubi-festa") === true, "passa a possuir a roupa");
  ok(S.roupaEquipada(1) === "rubi-festa", "compra já equipa");
  S.equiparRoupa(1, "heroi1");
  ok(S.roupaEquipada(1) === "heroi1", "pode reequipar a base");
  // comprar de novo (já possui) só equipa, sem cobrar
  ok(S.comprarRoupa(1, "rubi-festa", 60) === true && S.getMoedas() === 40, "reequipar não cobra");
}

// 11) Conquistas: avaliar desbloqueia + credita uma vez
{
  const ls = makeLS();
  const S = loadStorage(ls);
  S.criarPerfil("Cris", 1);
  // condições: faseMax>=2 (estreia,+20) e maxCombo>=10 (combo10,+30)
  S.desbloquearFase(2);
  S.registrarFimDePartida({ maxCombo: 12, semErro: true, venceu: true });
  const novas = S.avaliarConquistas({ venceu: true });
  const ids = novas.map((c) => c.id);
  ok(ids.includes("estreia"), "desbloqueia 'estreia'");
  ok(ids.includes("combo10"), "desbloqueia 'combo10'");
  ok(ids.includes("perfeito"), "desbloqueia 'perfeito' (vitória sem erro)");
  ok(S.getMoedas() >= 20 + 30 + 40, "recompensas creditadas");
  const moedasAntes = S.getMoedas();
  const novas2 = S.avaliarConquistas({ venceu: true });
  ok(novas2.length === 0, "não desbloqueia de novo");
  ok(S.getMoedas() === moedasAntes, "não credita de novo");
  ok(!!S.conquistasDesbloqueadas().estreia, "fica registrada como desbloqueada");
}

// 12) Desafio diário + ofensiva (datas injetadas)
{
  const ls = makeLS();
  const S = loadStorage(ls);
  S.criarPerfil("Ana", 1);
  ok(S.ofensivaAtual("2026-01-10") === 0, "ofensiva inicial = 0");

  const r1 = S.registrarDesafioDiario("2026-01-10");
  ok(r1.ja === false && r1.ofensiva === 1, "1º dia: ofensiva 1");
  ok(r1.recompensa === 35, "1º dia: recompensa 30+5");
  ok(S.getMoedas() === 35, "moedas creditadas no 1º dia");
  ok(S.desafioFeitoHoje("2026-01-10") === true, "feito hoje");

  const r1b = S.registrarDesafioDiario("2026-01-10");
  ok(r1b.ja === true && r1b.recompensa === 0, "mesmo dia: não recompensa");
  ok(S.getMoedas() === 35, "saldo intacto ao repetir no mesmo dia");

  const r2 = S.registrarDesafioDiario("2026-01-11");
  ok(r2.ofensiva === 2, "dia seguinte: ofensiva 2");
  ok(r2.recompensa === 40, "dia 2: recompensa 30+10");

  // pula um dia (13, sem o 12) → reseta para 1
  const r3 = S.registrarDesafioDiario("2026-01-13");
  ok(r3.ofensiva === 1, "pular dia reinicia a ofensiva");
  ok(S.melhorOfensiva() === 2, "melhor ofensiva preservada (2)");

  // ofensiva 'viva' ontem ainda conta hoje; quebrada se mais antiga
  ok(S.ofensivaAtual("2026-01-14") === 1, "ofensiva viva no dia seguinte");
  ok(S.ofensivaAtual("2026-01-20") === 0, "ofensiva quebrada após dias parados");
}

if (falhas === 0) console.log("✅ Storage: todos os testes passaram.");
else {
  console.error(`❌ Storage: ${falhas} falha(s).`);
  process.exit(1);
}
