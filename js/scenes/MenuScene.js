/**
 * MenuScene — título estilizado kpop/metal, escolha de dificuldade e "Jogar".
 */
class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
    this.dificuldade = "facil";
  }

  create() {
    const cx = GAME_WIDTH / 2;
    this.add.image(cx, GAME_HEIGHT / 2, "bg");

    // raios decorativos pulsando
    this.decorRaio(120, 220, -0.3);
    this.decorRaio(GAME_WIDTH - 120, 260, 0.3);

    UI.titulo(this, cx, 230, "IDOL", 120, "#ff3ea5");
    UI.titulo(this, cx, 350, "MATH", 120, "#2ff7e6");
    this.add
      .text(cx, 450, "⚡ Tabuada Kpop • toque de Metal 🤘", {
        fontFamily: UI.FONT,
        fontSize: "30px",
        color: "#ffd23e",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // estrelas girando ao redor do título
    this.estrelas = [];
    for (let i = 0; i < 5; i++) {
      const s = this.add.image(0, 0, "estrela").setScale(0.8);
      this.estrelas.push(s);
    }

    // Seleção de dificuldade
    this.add
      .text(cx, 580, "Escolha a dificuldade", {
        fontFamily: UI.FONT,
        fontSize: "34px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.botoesDif = {};
    const difs = ["facil", "medio", "dificil"];
    difs.forEach((id, i) => {
      const d = DIFICULDADES[id];
      const b = UI.botao(this, cx, 680 + i * 130, `${d.emoji}  ${d.nome}`, {
        cor: d.cor,
        w: 460,
        h: 110,
        onClick: () => this.selecionarDif(id),
      });
      this.botoesDif[id] = b;
    });
    this.selecionarDif("facil");

    // Botão Jogar
    UI.botao(this, cx, 1110, "▶  JOGAR", {
      cor: 0x7b2ff7,
      w: 520,
      h: 130,
      tamFonte: 52,
      onClick: () => {
        AudioFX.unlock();
        this.scene.start("StageScene", { dificuldade: this.dificuldade });
      },
    });

    // Melhor pontuação
    const best = Storage.get().melhorPontuacao;
    this.add
      .text(cx, 1220, `🏆 Recorde: ${best}`, {
        fontFamily: UI.FONT,
        fontSize: "30px",
        color: "#2ff7e6",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
  }

  selecionarDif(id) {
    this.dificuldade = id;
    Object.keys(this.botoesDif).forEach((k) => {
      const sel = k === id;
      this.botoesDif[k].setScale(sel ? 1.08 : 0.92);
      this.botoesDif[k].setAlpha(sel ? 1 : 0.6);
      this.botoesDif[k].label.setColor(sel ? "#0d0d12" : "#ffffff");
    });
  }

  decorRaio(x, y, drift) {
    const r = this.add.image(x, y, "raio").setScale(2.2);
    this.tweens.add({
      targets: r,
      alpha: { from: 0.4, to: 1 },
      angle: drift * 30,
      duration: 600,
      yoyo: true,
      repeat: -1,
    });
  }

  update(time) {
    const cx = GAME_WIDTH / 2;
    const cy = 300;
    this.estrelas.forEach((s, i) => {
      const a = time / 1000 + (i * Math.PI * 2) / this.estrelas.length;
      s.x = cx + Math.cos(a) * 260;
      s.y = cy + Math.sin(a) * 120;
      s.angle += 2;
      s.setAlpha(0.5 + 0.5 * Math.abs(Math.sin(a)));
    });
  }
}
