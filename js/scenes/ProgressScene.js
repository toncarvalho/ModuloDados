/**
 * ProgressScene — painel de progresso (pais/professor). Mostra, do jogador
 * atual: precisão geral, tempo de jogo, estrelas, e um "mapa de calor" das
 * tabuadas (verde = dominada, vermelho = treinar mais) a partir dos fatos
 * fracos que o jogo já registra. Atalho para treinar os pontos fracos.
 * Só leitura — não altera nada (não é "login", é acompanhamento).
 */
class ProgressScene extends Phaser.Scene {
  constructor() {
    super("ProgressScene");
  }

  create() {
    const cx = GAME_WIDTH / 2;
    this.cameras.main.fadeIn(180, 13, 13, 18);
    this.add.image(cx, GAME_HEIGHT / 2, "bg");

    UI.titulo(this, cx, 96, "PROGRESSO", 70, "#2ff7e6");
    const meta = Storage.perfilAtual();
    this.add
      .text(cx, 158, meta ? `👤 ${meta.nome}` : "", {
        fontFamily: UI.FONT,
        fontSize: "30px",
        fontStyle: "bold",
        color: "#ffd23e",
      })
      .setOrigin(0.5);

    const est = Storage.estatisticas();

    if (est.total === 0) {
      this.add
        .text(cx, 560, "Ainda sem dados.\nJogue uma partida ou o Treino! 🎮", {
          fontFamily: UI.FONT,
          fontSize: "34px",
          color: "#ffffff",
          align: "center",
          lineSpacing: 12,
        })
        .setOrigin(0.5);
      this.botaoMenu(1140);
      return;
    }

    this.painelNumeros(cx, est);
    this.mapaDeCalor(cx, est);
    this.pontosFracos(cx, est);
    this.botaoMenu(1206);
  }

  // ---- bloco de números (precisão, tempo, estrelas) ----
  painelNumeros(cx, est) {
    const y = 250;
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.45);
    g.fillRoundedRect(cx - 320, y - 60, 640, 150, 22);
    g.lineStyle(2, 0x2ff7e6, 0.6);
    g.strokeRoundedRect(cx - 320, y - 60, 640, 150, 22);

    const prec = est.precisao === null ? "—" : `${est.precisao}%`;
    this.colunaNum(cx - 213, y, "🎯", prec, `${est.acertos}/${est.total}`);
    this.colunaNum(cx, y, "⏱️", this.formatarTempo(est.tempoMs), "tempo");
    this.colunaNum(
      cx + 213,
      y,
      "⭐",
      `${est.totalEstrelas}/${FASES.length * 3}`,
      `Fase ${est.faseMax}`
    );
  }

  colunaNum(x, y, icone, valor, rotulo) {
    this.add.text(x, y - 36, icone, { fontSize: "34px" }).setOrigin(0.5);
    this.add
      .text(x, y + 6, valor, {
        fontFamily: UI.FONT,
        fontSize: "40px",
        fontStyle: "bold",
        color: "#ffffff",
      })
      .setOrigin(0.5);
    this.add
      .text(x, y + 50, rotulo, {
        fontFamily: UI.FONT,
        fontSize: "22px",
        color: "#aab",
      })
      .setOrigin(0.5);
  }

  // ---- mapa de calor das tabuadas ----
  mapaDeCalor(cx, est) {
    this.add
      .text(cx, 430, "Tabuadas — 🟥 treinar mais · 🟩 dominada", {
        fontFamily: UI.FONT,
        fontSize: "26px",
        fontStyle: "bold",
        color: "#ffd23e",
      })
      .setOrigin(0.5);

    const cols = 5;
    const cw = 124;
    const ch = 92;
    const x0 = cx - 2 * cw;
    const y0 = 520;
    for (let t = 1; t <= 10; t++) {
      const i = t - 1;
      const x = x0 + (i % cols) * cw;
      const y = y0 + Math.floor(i / cols) * (ch + 16);
      this.celulaTabuada(x, y, t, est.fraquezaTabuadas[t], est.maxFraqueza);
    }
  }

  celulaTabuada(x, y, t, peso, max) {
    const w = 108;
    const h = 88;
    const cor = this.corFraqueza(peso, max);
    const g = this.add.graphics();
    g.fillStyle(cor, 0.92);
    g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 16);
    g.lineStyle(2, 0xffffff, 0.35);
    g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 16);

    const escuro = cor === 0xffd23e; // amarelo → texto escuro
    this.add
      .text(x, y, `${t}`, {
        fontFamily: UI.FONT,
        fontSize: "44px",
        fontStyle: "bold",
        color: escuro ? "#0d0d12" : "#ffffff",
      })
      .setOrigin(0.5);
  }

  corFraqueza(peso, max) {
    if (max <= 0 || peso <= 0) return 0x36d96b; // verde
    const frac = peso / max;
    if (frac <= 0.5) return 0xffd23e; // amarelo
    return 0xff3030; // vermelho
  }

  // ---- fatos fracos + atalho de treino ----
  pontosFracos(cx, est) {
    let y = 760;
    if (est.fatosFracos.length) {
      this.add
        .text(cx, y, `📚 Focar: ${est.fatosFracos.join("   ")}`, {
          fontFamily: UI.FONT,
          fontSize: "30px",
          fontStyle: "bold",
          color: "#ffffff",
        })
        .setOrigin(0.5);
      y += 70;
    }

    // top tabuadas fracas → botão de treino dirigido
    const tabs = [];
    for (let t = 1; t <= 10; t++) tabs.push({ t, w: est.fraquezaTabuadas[t] });
    tabs.sort((a, b) => b.w - a.w);
    const fracas = tabs.filter((x) => x.w > 0).slice(0, 3).map((x) => x.t);

    if (fracas.length) {
      UI.botao(this, cx, y + 40, `🎯 Treinar ${fracas.join(", ")}`, {
        cor: 0xff3ea5,
        w: 520,
        h: 104,
        tamFonte: 34,
        onClick: () => {
          AudioFX.unlock();
          Util.trocarCena(this, "TrainScene", {
            tabuadas: fracas,
            titulo: `Pontos fracos: ${fracas.join(", ")}`,
          });
        },
      });
    }
  }

  formatarTempo(ms) {
    const min = Math.floor(ms / 60000);
    if (min >= 60) {
      const h = Math.floor(min / 60);
      return `${h}h${String(min % 60).padStart(2, "0")}`;
    }
    if (min >= 1) return `${min} min`;
    return `${Math.round(ms / 1000)}s`;
  }

  botaoMenu(y) {
    UI.botao(this, GAME_WIDTH / 2, y, "↩  Menu", {
      cor: 0x444455,
      w: 360,
      h: 86,
      tamFonte: 32,
      onClick: () => Util.trocarCena(this, "MenuScene"),
    });
  }
}
