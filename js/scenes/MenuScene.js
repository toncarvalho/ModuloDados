/**
 * MenuScene — título estilizado kpop/metal e botões de jogar/continuar.
 */
class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    const cx = GAME_WIDTH / 2;
    this.add.image(cx, GAME_HEIGHT / 2, "bg");

    // raios decorativos pulsando
    this.decorRaio(120, 220, -0.3);
    this.decorRaio(GAME_WIDTH - 120, 260, 0.3);

    UI.titulo(this, cx, 250, "IDOL", 120, "#ff3ea5");
    UI.titulo(this, cx, 370, "MATH", 120, "#2ff7e6");
    this.add
      .text(cx, 470, "⚡ Tabuada Kpop • toque de Metal 🤘", {
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

    const faseMax = Storage.faseMax();

    // Botão Jogar — vai para a escolha do herói
    UI.botao(this, cx, 760, "▶  JOGAR", {
      cor: 0x7b2ff7,
      w: 520,
      h: 130,
      tamFonte: 52,
      onClick: () => {
        AudioFX.unlock();
        this.scene.start("HeroScene");
      },
    });

    // Continuar — pula direto para a maior fase desbloqueada (se já avançou)
    if (faseMax > 1) {
      UI.botao(this, cx, 920, `↪  Continuar (Fase ${faseMax})`, {
        cor: 0x36d96b,
        w: 520,
        h: 110,
        tamFonte: 38,
        corTexto: "#0d0d12",
        onClick: () => {
          AudioFX.unlock();
          this.scene.start("GameScene", {
            faseId: faseMax,
            heroId: Storage.getHeroiId(),
          });
        },
      });
    }

    // Total de fases + melhor pontuação
    this.add
      .text(cx, 1080, `🗺️ ${FASES.length} fases de tabuada`, {
        fontFamily: UI.FONT,
        fontSize: "30px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const best = Storage.get().melhorPontuacao;
    this.add
      .text(cx, 1150, `🏆 Recorde: ${best}`, {
        fontFamily: UI.FONT,
        fontSize: "30px",
        color: "#2ff7e6",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
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
