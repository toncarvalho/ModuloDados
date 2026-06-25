/**
 * ResultScene — tela de vitória/derrota com pontuação, recorde e navegação.
 */
class ResultScene extends Phaser.Scene {
  constructor() {
    super("ResultScene");
  }

  init(data) {
    this.data = data;
  }

  create() {
    const cx = GAME_WIDTH / 2;
    const d = this.data;
    this.add.image(cx, GAME_HEIGHT / 2, "bg");

    const venceu = d.venceu;
    UI.titulo(
      this,
      cx,
      230,
      venceu ? "VITÓRIA!" : "FIM DE SHOW",
      96,
      venceu ? "#ffd23e" : "#ff3ea5"
    );

    this.add
      .text(cx, 330, venceu ? "🤘🎤✨" : "💔🎸", { fontSize: "90px" })
      .setOrigin(0.5);

    const fase = getFase(d.faseId);
    this.add
      .text(
        cx,
        450,
        venceu
          ? `Você derrotou ${fase.boss.nome}!`
          : "A plateia ficou no escuro...",
        {
          fontFamily: UI.FONT,
          fontSize: "34px",
          color: "#ffffff",
          align: "center",
          wordWrap: { width: 600 },
        }
      )
      .setOrigin(0.5);

    // painel de pontuação
    this.painel(cx, 640, [
      [`Pontuação`, `${d.pontuacao}`],
      [`Combo máximo`, `x${d.maxCombo}`],
      [`Recorde`, `${Storage.get().melhorPontuacao}`],
    ]);

    // botões
    let y = 920;
    if (venceu && d.temProxima) {
      UI.botao(this, cx, y, "▶  Próxima Fase", {
        cor: 0x36d96b,
        w: 520,
        h: 120,
        onClick: () =>
          this.scene.start("GameScene", { faseId: d.faseId + 1 }),
      });
      y += 150;
    } else {
      UI.botao(this, cx, y, venceu ? "↻  Jogar de novo" : "↻  Tentar de novo", {
        cor: 0x7b2ff7,
        w: 520,
        h: 120,
        onClick: () => this.scene.start("GameScene", { faseId: d.faseId }),
      });
      y += 150;
    }

    UI.botao(this, cx, y, "🗺  Fases", {
      cor: 0xff3ea5,
      w: 520,
      h: 110,
      onClick: () => this.scene.start("StageScene"),
    });
    y += 140;

    UI.botao(this, cx, y, "🏠  Menu", {
      cor: 0x444455,
      w: 520,
      h: 110,
      onClick: () => this.scene.start("MenuScene"),
    });
  }

  painel(cx, y, linhas) {
    const w = 560;
    const h = 60 + linhas.length * 56;
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.45);
    g.fillRoundedRect(cx - w / 2, y - 30, w, h, 20);
    g.lineStyle(3, 0x2ff7e6, 0.7);
    g.strokeRoundedRect(cx - w / 2, y - 30, w, h, 20);

    linhas.forEach((linha, i) => {
      const ly = y + 10 + i * 56;
      this.add.text(cx - w / 2 + 40, ly, linha[0], {
        fontFamily: UI.FONT,
        fontSize: "32px",
        color: "#cccccc",
      });
      this.add
        .text(cx + w / 2 - 40, ly, linha[1], {
          fontFamily: UI.FONT,
          fontSize: "34px",
          fontStyle: "bold",
          color: "#ffd23e",
        })
        .setOrigin(1, 0);
    });
  }
}
