/**
 * ConquistasScene — galeria de medalhas. Desbloqueadas aparecem coloridas
 * (com a recompensa); bloqueadas ficam cinza com 🔒. Conta "X/total".
 */
class ConquistasScene extends Phaser.Scene {
  constructor() {
    super("ConquistasScene");
  }

  create() {
    const cx = GAME_WIDTH / 2;
    this.cameras.main.fadeIn(180, 13, 13, 18);
    this.add.image(cx, GAME_HEIGHT / 2, "bg");

    UI.titulo(this, cx, 96, "CONQUISTAS", 64, "#ffd23e");

    const desbloq = Storage.conquistasDesbloqueadas();
    const total = CONQUISTAS.length;
    const feitas = CONQUISTAS.filter((c) => desbloq[c.id]).length;
    this.add
      .text(cx, 158, `🏅 ${feitas}/${total}`, {
        fontFamily: UI.FONT,
        fontSize: "32px",
        fontStyle: "bold",
        color: "#2ff7e6",
      })
      .setOrigin(0.5);

    // lista (2 colunas)
    const colX = [cx - 170, cx + 170];
    const y0 = 250;
    const dy = 150;
    CONQUISTAS.forEach((c, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      this.cardConquista(colX[col], y0 + row * dy, c, !!desbloq[c.id]);
    });

    UI.botao(this, cx, 1196, "↩  Menu", {
      cor: 0x444455,
      w: 360,
      h: 84,
      tamFonte: 32,
      onClick: () => Util.trocarCena(this, "MenuScene"),
    });
  }

  cardConquista(x, y, c, feito) {
    const w = 320;
    const h = 132;
    const cont = this.add.container(x, y);

    const g = this.add.graphics();
    g.fillStyle(0x000000, feito ? 0.5 : 0.35);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 16);
    g.lineStyle(3, feito ? 0xffd23e : 0x555566, 1);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 16);
    cont.add(g);

    // ícone (ou cadeado)
    cont.add(
      this.add
        .text(-w / 2 + 42, -8, feito ? c.icone : "🔒", { fontSize: "48px" })
        .setOrigin(0.5)
        .setAlpha(feito ? 1 : 0.5)
    );

    cont.add(
      this.add.text(-w / 2 + 80, -h / 2 + 18, c.nome, {
        fontFamily: UI.FONT,
        fontSize: "26px",
        fontStyle: "bold",
        color: feito ? "#ffffff" : "#888899",
      })
    );
    cont.add(
      this.add.text(-w / 2 + 80, -h / 2 + 52, c.desc, {
        fontFamily: UI.FONT,
        fontSize: "20px",
        color: feito ? "#cccccc" : "#777788",
        wordWrap: { width: w - 96 },
      })
    );
    cont.add(
      this.add.text(-w / 2 + 80, h / 2 - 32, `🪙 ${c.recompensa}`, {
        fontFamily: UI.FONT,
        fontSize: "20px",
        fontStyle: "bold",
        color: feito ? "#ffd23e" : "#777788",
      })
    );
  }
}
