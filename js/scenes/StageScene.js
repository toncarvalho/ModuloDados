/**
 * StageScene — seleção de fase. Mostra fases bloqueadas/desbloqueadas
 * conforme o progresso salvo para a dificuldade escolhida.
 */
class StageScene extends Phaser.Scene {
  constructor() {
    super("StageScene");
  }

  init(data) {
    this.dificuldade = data.dificuldade || "facil";
  }

  create() {
    const cx = GAME_WIDTH / 2;
    this.add.image(cx, GAME_HEIGHT / 2, "bg");

    const d = DIFICULDADES[this.dificuldade];
    UI.titulo(this, cx, 150, "FASES", 90, "#ff3ea5");
    this.add
      .text(cx, 240, `Dificuldade: ${d.emoji} ${d.nome}`, {
        fontFamily: UI.FONT,
        fontSize: "34px",
        color: "#ffd23e",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const maxDesbloqueada = Storage.faseDesbloqueada(this.dificuldade);

    STAGES.forEach((stage, i) => {
      const y = 380 + i * 220;
      const desbloqueada = stage.id <= maxDesbloqueada;
      this.cardFase(cx, y, stage, desbloqueada);
    });

    UI.botao(this, cx, 1180, "↩  Voltar", {
      cor: 0x444455,
      w: 360,
      h: 100,
      onClick: () => this.scene.start("MenuScene"),
    });
  }

  cardFase(cx, y, stage, desbloqueada) {
    const w = 600;
    const h = 180;
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.4);
    g.fillRoundedRect(cx - w / 2, y - h / 2, w, h, 24);
    g.lineStyle(3, desbloqueada ? stage.corTema : 0x555555, 1);
    g.strokeRoundedRect(cx - w / 2, y - h / 2, w, h, 24);

    this.add
      .text(cx - w / 2 + 30, y - 50, `${stage.boss.emoji}`, { fontSize: "70px" })
      .setOrigin(0, 0.5);

    this.add.text(cx - w / 2 + 130, y - 55, `Fase ${stage.id}: ${stage.nome}`, {
      fontFamily: UI.FONT,
      fontSize: "34px",
      fontStyle: "bold",
      color: desbloqueada ? "#ffffff" : "#888888",
    });

    this.add.text(cx - w / 2 + 130, y - 8, stage.descricao, {
      fontFamily: UI.FONT,
      fontSize: "24px",
      color: desbloqueada ? "#cccccc" : "#666666",
      wordWrap: { width: w - 160 },
    });

    if (desbloqueada) {
      const b = UI.botao(this, cx + w / 2 - 90, y + 50, "Jogar ▶", {
        cor: stage.corTema,
        w: 200,
        h: 70,
        tamFonte: 30,
        onClick: () =>
          this.scene.start("GameScene", {
            stageId: stage.id,
            dificuldade: this.dificuldade,
          }),
      });
      b.setDepth(2);
    } else {
      this.add
        .text(cx + w / 2 - 90, y + 50, "🔒", { fontSize: "44px" })
        .setOrigin(0.5);
    }
  }
}
