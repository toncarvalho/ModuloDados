/**
 * StageScene — seleção de fase em grade (3×4) para as 12 fases.
 * Fases bloqueadas/desbloqueadas conforme o progresso salvo (único contador).
 */
class StageScene extends Phaser.Scene {
  constructor() {
    super("StageScene");
  }

  init(data) {
    this.heroId = (data && data.heroId) || Storage.getHeroiId();
  }

  create() {
    const cx = GAME_WIDTH / 2;
    this.add.image(cx, GAME_HEIGHT / 2, "bg");

    UI.titulo(this, cx, 120, "FASES", 84, "#ff3ea5");
    this.add
      .text(cx, 200, "Cada fase treina uma tabuada", {
        fontFamily: UI.FONT,
        fontSize: "30px",
        color: "#ffd23e",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const faseMax = Storage.faseMax();

    // grade 3 colunas × 4 linhas
    const cols = 3;
    const x0 = 160;
    const dx = 200;
    const y0 = 360;
    const dy = 190;

    FASES.forEach((fase, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = x0 + col * dx;
      const y = y0 + row * dy;
      const desbloqueada = fase.id <= faseMax;
      this.tileFase(x, y, fase, desbloqueada);
    });

    UI.botao(this, cx, 1210, "↩  Menu", {
      cor: 0x444455,
      w: 360,
      h: 90,
      tamFonte: 34,
      onClick: () => this.scene.start("MenuScene"),
    });
  }

  /** Rótulo curto do foco da fase: "Tab. 7", "1–3" ou "Mix". */
  rotuloFoco(fase) {
    const t = fase.tabuadas;
    if (t.length >= 10) return "Mix";
    if (t.length === 1) return `Tab. ${t[0]}`;
    return `Tab. ${t[0]}–${t[t.length - 1]}`;
  }

  tileFase(x, y, fase, desbloqueada) {
    const w = 176;
    const h = 168;
    const cont = this.add.container(x, y);

    const g = this.add.graphics();
    g.fillStyle(0x000000, desbloqueada ? 0.5 : 0.35);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 20);
    g.lineStyle(3, desbloqueada ? fase.corTema : 0x555555, 1);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 20);
    cont.add(g);

    // número da fase
    const num = this.add
      .text(0, -54, `${fase.id}`, {
        fontFamily: UI.FONT,
        fontSize: "46px",
        fontStyle: "bold",
        color: desbloqueada ? "#ffffff" : "#777777",
      })
      .setOrigin(0.5);
    cont.add(num);

    // emoji do chefão
    const emo = this.add
      .text(0, 6, fase.boss.emoji, { fontSize: "52px" })
      .setOrigin(0.5)
      .setAlpha(desbloqueada ? 1 : 0.35);
    cont.add(emo);

    // foco (tabuada)
    const foco = this.add
      .text(0, 58, this.rotuloFoco(fase), {
        fontFamily: UI.FONT,
        fontSize: "26px",
        fontStyle: "bold",
        color: desbloqueada ? "#2ff7e6" : "#666666",
      })
      .setOrigin(0.5);
    cont.add(foco);

    if (desbloqueada) {
      cont.setSize(w, h);
      cont.setInteractive(
        new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h),
        Phaser.Geom.Rectangle.Contains
      );
      cont.on("pointerover", () => cont.setScale(1.05));
      cont.on("pointerout", () => cont.setScale(1));
      cont.on("pointerdown", () => {
        cont.setScale(0.96);
        AudioFX.unlock();
        this.scene.start("GameScene", { faseId: fase.id, heroId: this.heroId });
      });
      cont.on("pointerup", () => cont.setScale(1.05));
    } else {
      const lock = this.add
        .text(0, 6, "🔒", { fontSize: "54px" })
        .setOrigin(0.5);
      cont.add(lock);
      emo.setAlpha(0.12);
    }
  }
}
