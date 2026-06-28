/**
 * UIScreens — camada de telas em HTML sobreposta ao canvas do Phaser.
 *
 * Migração das telas de menu (antes desenhadas no canvas, com hit-areas
 * frágeis e toque deslocado no Android) para HTML real: botões <button>
 * nativos, acessíveis, sem bugs de área de toque. O Phaser continua rodando
 * por baixo (sem troca de cena), então fechar o overlay volta direto para a
 * MenuScene que ficou viva.
 *
 * Telas: Ajustes, Conquistas, Progresso, Loja. Reaproveita Storage / AudioFX /
 * dados (HEROIS, CONQUISTAS, ROUPAS) — sem alterá-los.
 */
const UIScreens = (() => {
  // ----- helpers de DOM -----
  function root() {
    return document.getElementById("ui-root");
  }
  function corHex(cor) {
    return "#" + cor.toString(16).padStart(6, "0");
  }
  function arquivoAvatar(roupaId, heroId) {
    const r = typeof getRoupa === "function" ? getRoupa(roupaId) : null;
    if (r) return r.file;
    return getHeroi(heroId).file;
  }

  // ===================== AJUSTES =====================
  // Espelha SettingsScene: mesmos itens e mesma lógica de alternância.
  const ITENS_AJUSTES = [
    { chave: "musica", emoji: "🎵", nome: "Música" },
    { chave: "efeitos", emoji: "🔊", nome: "Efeitos" },
    { chave: "timer", emoji: "⏱️", nome: "Cronômetro" },
    { chave: "voz", emoji: "🗣️", nome: "Ler em voz alta" },
  ];

  function pintarAjuste(chave) {
    const btn = document.querySelector(`#screen-ajustes [data-cfg="${chave}"]`);
    if (!btn) return;
    const it = ITENS_AJUSTES.find((x) => x.chave === chave);
    const ligado = !!Storage.getConfig()[chave];
    btn.textContent = `${it.emoji}  ${it.nome}:  ${ligado ? "LIGADO" : "desligado"}`;
    btn.classList.toggle("on", ligado);
    btn.setAttribute("aria-pressed", String(ligado));
  }
  function montarAjustes() {
    ITENS_AJUSTES.forEach((it) => pintarAjuste(it.chave));
  }
  function alternarAjuste(chave) {
    const atual = Storage.getConfig()[chave];
    Storage.setConfig(chave, !atual);
    if (chave === "musica") AudioFX.sincronizarMusica();
    if (chave === "efeitos" && !atual) AudioFX.acerto(); // prévia ao ligar
    pintarAjuste(chave);
  }

  // ===================== CONQUISTAS =====================
  function montarConquistas() {
    const desbloq = Storage.conquistasDesbloqueadas();
    const total = CONQUISTAS.length;
    const feitas = CONQUISTAS.filter((c) => desbloq[c.id]).length;
    const cont = document.getElementById("conq-contagem");
    if (cont) cont.textContent = `🏅 ${feitas}/${total}`;

    const lista = document.getElementById("conq-lista");
    if (!lista) return;
    lista.innerHTML = CONQUISTAS.map((c) => {
      const feito = !!desbloq[c.id];
      return `
        <div class="conq-row ${feito ? "done" : "locked"}">
          <span class="conq-ico">${feito ? c.icone : "🔒"}</span>
          <span class="conq-txt"><b>${c.nome}</b><small>${c.desc}</small></span>
          <span class="conq-pre">🪙 ${c.recompensa}</span>
        </div>`;
    }).join("");
  }

  // ===================== PROGRESSO =====================
  let treinoFracas = [];

  function formatarTempo(ms) {
    const min = Math.floor(ms / 60000);
    if (min >= 60) return `${Math.floor(min / 60)}h${String(min % 60).padStart(2, "0")}`;
    if (min >= 1) return `${min} min`;
    return `${Math.round(ms / 1000)}s`;
  }
  function classeFraqueza(peso, max) {
    if (max <= 0 || peso <= 0) return "verde";
    return peso / max <= 0.5 ? "amarelo" : "vermelho";
  }

  function montarProgresso() {
    const meta = Storage.perfilAtual();
    const nome = document.getElementById("prog-nome");
    if (nome) nome.textContent = meta ? `👤 ${meta.nome}` : "";

    const corpo = document.getElementById("prog-corpo");
    if (!corpo) return;
    const est = Storage.estatisticas();

    if (est.total === 0) {
      corpo.innerHTML =
        `<p class="prog-vazio">Ainda sem dados.<br>Jogue uma partida ou o Treino! 🎮</p>`;
      treinoFracas = [];
      return;
    }

    const prec = est.precisao === null ? "—" : `${est.precisao}%`;
    const nums = `
      <div class="prog-nums">
        <div class="prog-num"><span class="pn-ico">🎯</span><b>${prec}</b><small>${est.acertos}/${est.total}</small></div>
        <div class="prog-num"><span class="pn-ico">⏱️</span><b>${formatarTempo(est.tempoMs)}</b><small>tempo</small></div>
        <div class="prog-num"><span class="pn-ico">⭐</span><b>${est.totalEstrelas}/${FASES.length * 3}</b><small>Fase ${est.faseMax}</small></div>
      </div>`;

    let heat = "";
    for (let t = 1; t <= 10; t++) {
      const cls = classeFraqueza(est.fraquezaTabuadas[t], est.maxFraqueza);
      heat += `<span class="heat-cell ${cls}">${t}</span>`;
    }
    const mapa = `
      <p class="prog-legenda">Tabuadas — 🟥 treinar mais · 🟩 dominada</p>
      <div class="prog-heat">${heat}</div>`;

    let fracosHtml = "";
    if (est.fatosFracos.length) {
      fracosHtml = `<p class="prog-focar">📚 Focar: ${est.fatosFracos.join("   ")}</p>`;
    }

    const tabs = [];
    for (let t = 1; t <= 10; t++) tabs.push({ t, w: est.fraquezaTabuadas[t] });
    tabs.sort((a, b) => b.w - a.w);
    treinoFracas = tabs.filter((x) => x.w > 0).slice(0, 3).map((x) => x.t);
    const treinoBtn = treinoFracas.length
      ? `<button class="ui-btn prog-treino" type="button" data-acao="treino">🎯 Treinar ${treinoFracas.join(", ")}</button>`
      : "";

    corpo.innerHTML = nums + mapa + fracosHtml + treinoBtn;
  }

  // ===================== LOJA =====================
  function mostrarMsgLoja(txt) {
    const m = document.getElementById("loja-msg");
    if (m) m.textContent = txt;
  }

  function montarLoja() {
    const heroId = Storage.getHeroiId();
    const heroi = getHeroi(heroId);
    const equipada = Storage.roupaEquipada(heroId);
    const cor = corHex(heroi.cor);

    const saldo = document.getElementById("loja-saldo");
    if (saldo) saldo.textContent = `🪙 ${Storage.getMoedas()} moedas`;
    mostrarMsgLoja("");

    const corpo = document.getElementById("loja-corpo");
    if (!corpo) return;

    const roupas = roupasDoHeroi(heroId);
    const cards = roupas
      .map((r) => {
        const possui = Storage.possuiRoupa(r.id);
        const eq = r.id === equipada;
        let estado, cls;
        if (eq) {
          estado = "✓ Equipada";
          cls = "equipada";
        } else if (possui) {
          estado = "Equipar";
          cls = "possui";
        } else {
          estado = `🪙 ${r.preco}`;
          cls = "comprar";
        }
        return `
          <button class="roupa-card ${cls}" type="button" data-roupa="${r.id}" style="--cor:${cor}">
            <img class="roupa-img" src="assets/herois/${r.file}.svg" alt="${r.nome}" loading="lazy">
            <span class="roupa-nome">${r.nome}</span>
            <span class="roupa-estado">${estado}</span>
          </button>`;
      })
      .join("");

    corpo.innerHTML = `
      <div class="loja-preview" style="--cor:${cor}">
        <img src="assets/herois/${arquivoAvatar(equipada, heroId)}.svg" alt="${heroi.nome}">
      </div>
      <p class="loja-hero" style="color:${cor}">${heroi.nome}</p>
      <div class="loja-grid">${cards}</div>
      <p class="loja-dica">Troque de personagem no 🔄 Trocar → avatar</p>`;
  }

  function escolherRoupa(roupaId) {
    const heroId = Storage.getHeroiId();
    const roupa = typeof getRoupa === "function" ? getRoupa(roupaId) : null;
    if (!roupa) return;
    if (roupa.id === Storage.roupaEquipada(heroId)) return; // já equipada
    if (Storage.possuiRoupa(roupa.id)) {
      Storage.equiparRoupa(heroId, roupa.id);
      AudioFX.acerto();
    } else if (Storage.getMoedas() >= roupa.preco) {
      Storage.comprarRoupa(heroId, roupa.id, roupa.preco);
      AudioFX.vitoria();
    } else {
      AudioFX.erro();
      mostrarMsgLoja("Moedas insuficientes! Jogue mais pra ganhar. 🎮");
      return;
    }
    montarLoja(); // redesenha com o novo estado
  }

  // ----- ponte com o Phaser: ir para o Treino dos pontos fracos -----
  // Usa scene.start direto (não Util.trocarCena): o fade-out por evento de
  // câmera não dispara de forma confiável quando acionado de fora da cena.
  // A TrainScene faz o próprio fade-in no create(), então a transição segue suave.
  function irParaTreino() {
    const g = window.game;
    const ms = g && g.scene.getScene("MenuScene");
    api.fechar();
    if (ms && ms.scene.isActive()) {
      AudioFX.unlock();
      ms.scene.start("TrainScene", {
        tabuadas: treinoFracas,
        titulo: `Pontos fracos: ${treinoFracas.join(", ")}`,
      });
    }
  }

  // ----- builders por tela -----
  const BUILDERS = {
    ajustes: montarAjustes,
    conquistas: montarConquistas,
    progresso: montarProgresso,
    loja: montarLoja,
  };

  const api = {
    /** mostra o overlay com a tela indicada (esconde as demais) */
    abrir(nome) {
      const r = root();
      if (!r) return;
      r.querySelectorAll(".ui-screen").forEach((sec) => {
        sec.hidden = sec.id !== `screen-${nome}`;
      });
      if (BUILDERS[nome]) BUILDERS[nome]();
      r.hidden = false;
      // garante o topo da tela rolável e foca o 1º botão (acessibilidade)
      const card = r.querySelector(`#screen-${nome} .ui-card`);
      if (card) card.scrollTop = 0;
      const primeiro = r.querySelector(`#screen-${nome} button`);
      if (primeiro) primeiro.focus();
    },

    /** esconde o overlay — volta para a cena do Phaser que está viva por baixo */
    fechar() {
      const r = root();
      if (r) r.hidden = true;
    },

    /** liga o listener delegado de cliques do overlay */
    init() {
      const r = root();
      if (!r) return;
      r.addEventListener("click", (ev) => {
        const alvo = ev.target.closest("[data-cfg], [data-roupa], [data-acao]");
        if (!alvo || !r.contains(alvo)) return;
        if (alvo.dataset.cfg) {
          alternarAjuste(alvo.dataset.cfg);
        } else if (alvo.dataset.roupa) {
          AudioFX.unlock();
          escolherRoupa(alvo.dataset.roupa);
        } else if (alvo.dataset.acao === "treino") {
          irParaTreino();
        } else if (alvo.dataset.acao === "voltar") {
          api.fechar();
        }
      });
    },
  };

  return api;
})();

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => UIScreens.init());
} else {
  UIScreens.init();
}
