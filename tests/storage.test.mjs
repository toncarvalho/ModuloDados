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
  return new Function("localStorage", code + "\nreturn Storage;")(ls);
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

if (falhas === 0) console.log("✅ Storage: todos os testes passaram.");
else {
  console.error(`❌ Storage: ${falhas} falha(s).`);
  process.exit(1);
}
