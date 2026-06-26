/**
 * MenuScene — título kpop/metal e navegação (Jogar, Continuar, Treino, Ajustes).
 */
class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    const cx = GAME_WIDTH / 2;
    this.cameras.main.fadeIn(180, 13, 13, 18);
    this.add.image(cx, GAME_HEIGHT / 2, "bg");

    this.decorRaio(120, 210, -0.3);
    this.decorRaio(GAME_WIDTH - 120, 250, 0.3);

    UI.titulo(this, cx, 220, "IDOL", 116, "#ff3ea5");
    UI.titulo(this, cx, 330, "MATH", 116, "#2ff7e6");
    this.add
      .text(cx, 425, "⚡ Tabuada Kpop • toque de Metal 🤘", {
        fontFamily: UI.FONT,
        fontSize: "29px",
        color: "#ffd23e",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.estrelas = [];
    for (let i = 0; i < 5; i++) {
      this.estrelas.push(this.add.image(0, 0, "estrela").setScale(0.8));
    }

    AudioFX.sincronizarMusica();
    const faseMax = Storage.faseMax();

    // Cabeçalho do jogador (quem está jogando) + trocar jogador
    this.cabecalhoJogador();

    // Jogar (vai direto à grade de fases; a heroína vem do perfil)
    UI.botao(this, cx, 560, "▶  JOGAR", {
      cor: 0x7b2ff7,
      w: 520,
      h: 120,
      tamFonte: 50,
      onClick: () => {
        AudioFX.unlock();
        AudioFX.sincronizarMusica();
        Util.trocarCena(this, "StageScene", { heroId: Storage.getHeroiId() });
      },
    });

    let y = 700;
    if (faseMax > 1) {
      UI.botao(this, cx, y, `↪  Continuar (Fase ${faseMax})`, {
        cor: 0x36d96b,
        w: 520,
        h: 100,
        tamFonte: 36,
        corTexto: "#0d0d12",
        onClick: () => {
          AudioFX.unlock();
          Util.trocarCena(this, "GameScene", {
            faseId: faseMax,
            heroId: Storage.getHeroiId(),
          });
        },
      });
      y += 130;
    }

    // Treino + Progresso + Ajustes (lado a lado)
    UI.botao(this, cx - 240, y, "📚 Treino", {
      cor: 0xff3ea5,
      w: 224,
      h: 100,
      tamFonte: 30,
      onClick: () => {
        AudioFX.unlock();
        Util.trocarCena(this, "TrainScene");
      },
    });
    UI.botao(this, cx, y, "📊 Progresso", {
      cor: 0x36d96b,
      corTexto: "#0d0d12",
      w: 224,
      h: 100,
      tamFonte: 28,
      onClick: () => Util.trocarCena(this, "ProgressScene"),
    });
    UI.botao(this, cx + 240, y, "⚙️ Ajustes", {
      cor: 0x2a2a3a,
      w: 224,
      h: 100,
      tamFonte: 30,
      onClick: () => Util.trocarCena(this, "SettingsScene"),
    });
    y += 124;

    // Desafio do dia + Conquistas + Loja
    const feito = Storage.desafioFeitoHoje();
    UI.botao(this, cx - 240, y, feito ? "🗓️ Desafio ✓" : "🗓️ Desafio", {
      cor: feito ? 0x2a2a3a : 0xff7a1a,
      corTexto: feito ? "#36d96b" : "#ffffff",
      w: 224,
      h: 96,
      tamFonte: 27,
      onClick: () => {
        AudioFX.unlock();
        Util.trocarCena(this, "GameScene", { diario: true, heroId: Storage.getHeroiId() });
      },
    });
    UI.botao(this, cx, y, "🏅 Conquistas", {
      cor: 0xffd23e,
      corTexto: "#0d0d12",
      w: 224,
      h: 96,
      tamFonte: 25,
      onClick: () => Util.trocarCena(this, "ConquistasScene"),
    });
    UI.botao(this, cx + 240, y, "🛍️ Loja", {
      cor: 0xff3ea5,
      w: 224,
      h: 96,
      tamFonte: 28,
      onClick: () => Util.trocarCena(this, "LojaScene"),
    });
    y += 128;

    // stats
    this.add
      .text(
        cx,
        y,
        `🗺️ ${FASES.length} fases   ·   ⭐ ${Storage.totalEstrelas()}/${FASES.length * 3}`,
        {
          fontFamily: UI.FONT,
          fontSize: "28px",
          color: "#ffffff",
          fontStyle: "bold",
        }
      )
      .setOrigin(0.5);
    this.add
      .text(cx, y + 56, `🏆 Recorde: ${Storage.get().melhorPontuacao}`, {
        fontFamily: UI.FONT,
        fontSize: "28px",
        color: "#2ff7e6",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
  }

  /** Faixa do topo: avatar + nome do jogador atual e botão "trocar jogador". */
  cabecalhoJogador() {
    const meta = Storage.perfilAtual();
    if (!meta) return;
    const heroi = getHeroi(meta.heroiId);

    // avatar (toque → trocar avatar), já com a roupa equipada
    const texHeroi = texturaAvatar(meta.heroiId);
    let av;
    if (this.textures.exists(texHeroi)) {
      av = this.add.image(56, 56, texHeroi).setDisplaySize(72, 72);
    } else {
      av = this.add.text(56, 56, heroi.emoji, { fontSize: "54px" }).setOrigin(0.5);
    }
    av.setInteractive({ useHandCursor: true });
    av.on("pointerdown", () => {
      AudioFX.unlock();
      Util.trocarCena(this, "HeroScene");
    });
    // nome
    this.add
      .text(102, 44, meta.nome, {
        fontFamily: UI.FONT,
        fontSize: "32px",
        fontStyle: "bold",
        color: "#ffffff",
      })
      .setOrigin(0, 0.5);
    // saldo de moedas + ofensiva do desafio diário
    const ofensiva = Storage.ofensivaAtual();
    const saldoTxt = `🪙 ${Storage.getMoedas()}` + (ofensiva > 0 ? `   🔥 ${ofensiva}` : "");
    this.add
      .text(102, 78, saldoTxt, {
        fontFamily: UI.FONT,
        fontSize: "26px",
        fontStyle: "bold",
        color: "#ffd23e",
      })
      .setOrigin(0, 0.5);

    // trocar jogador
    UI.botao(this, GAME_WIDTH - 150, 60, "🔄 Trocar", {
      cor: 0x2a2a3a,
      w: 250,
      h: 80,
      tamFonte: 28,
      onClick: () => Util.trocarCena(this, "ProfileScene"),
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
    const cy = 285;
    this.estrelas.forEach((s, i) => {
      const a = time / 1000 + (i * Math.PI * 2) / this.estrelas.length;
      s.x = cx + Math.cos(a) * 260;
      s.y = cy + Math.sin(a) * 110;
      s.angle += 2;
      s.setAlpha(0.5 + 0.5 * Math.abs(Math.sin(a)));
    });
  }
}
