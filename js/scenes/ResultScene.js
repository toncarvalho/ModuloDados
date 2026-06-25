/**
 * ResultScene — vitória/derrota com estrelas, relatório (precisão, acertos/erros,
 * fatos a treinar) e navegação. Mantém o herói entre fases.
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
    this.cameras.main.fadeIn(180, 13, 13, 18);
    this.add.image(cx, GAME_HEIGHT / 2, "bg");
    const venceu = d.venceu;

    UI.titulo(
      this,
      cx,
      150,
      venceu ? "VITÓRIA!" : "FIM DE SHOW",
      88,
      venceu ? "#ffd23e" : "#ff3ea5"
    );

    // estrelas (ou coroa no Boss Rush)
    if (d.bossRush && venceu) {
      this.add.text(cx, 270, "👑🏆👑", { fontSize: "70px" }).setOrigin(0.5);
    } else {
      this.estrelas(cx, 270, d.estrelas || 0);
    }

    const fase = getFase(d.faseId);
    const titulo = d.bossRush
      ? venceu
        ? "Você sobreviveu ao Boss Rush!"
        : "O Boss Rush te derrubou..."
      : venceu
      ? `Você derrotou ${fase.boss.nome}!`
      : "A plateia ficou no escuro...";
    this.add
      .text(cx, 360, titulo, {
        fontFamily: UI.FONT,
        fontSize: "32px",
        color: "#ffffff",
        align: "center",
        wordWrap: { width: 620 },
      })
      .setOrigin(0.5);

    // relatório
    const total = d.acertos + d.erros;
    const precisao = total ? Math.round((d.acertos / total) * 100) : 100;
    this.painel(cx, 470, [
      [`Pontuação`, `${d.pontuacao}`],
      [`Precisão`, `${precisao}%  (${d.acertos}/${total})`],
      [`Combo máximo`, `x${d.maxCombo}`],
      [`Recorde`, `${Storage.get().melhorPontuacao}`],
    ]);

    // fatos a treinar
    this.fatosTreinar(cx, 760, d.errosFatos || []);

    // botões
    let y = 920;
    if (venceu && d.temProxima) {
      this.botao(cx, y, "▶  Próxima Fase", 0x36d96b, () =>
        Util.trocarCena(this, "GameScene", { faseId: d.faseId + 1, heroId: d.heroId })
      );
      y += 140;
    } else {
      this.botao(cx, y, venceu ? "↻  Jogar de novo" : "↻  Tentar de novo", 0x7b2ff7, () =>
        Util.trocarCena(this, "GameScene", {
          faseId: d.faseId,
          heroId: d.heroId,
          bossRush: d.bossRush,
        })
      );
      y += 140;
    }
    this.botao(cx, y, "🗺  Fases", 0xff3ea5, () =>
      Util.trocarCena(this, "StageScene", { heroId: d.heroId })
    );
    y += 130;
    this.botao(cx, y, "🏠  Menu", 0x444455, () => Util.trocarCena(this, "MenuScene"));
  }

  botao(cx, y, label, cor, onClick) {
    UI.botao(this, cx, y, label, { cor, w: 520, h: 110, onClick });
  }

  estrelas(cx, y, ganhas) {
    for (let i = 0; i < 3; i++) {
      const s = this.add
        .image(cx + (i - 1) * 96, y, "estrela")
        .setScale(1.4);
      if (i < ganhas) {
        s.setTint(0xffd23e);
        this.tweens.add({
          targets: s,
          scale: { from: 0.2, to: 1.4 },
          angle: { from: -40, to: 0 },
          ease: "Back.out",
          delay: i * 140,
          duration: 320,
        });
      } else {
        s.setTint(0x444455);
      }
    }
  }

  fatosTreinar(cx, y, fatos) {
    const unicos = [...new Set(fatos)].slice(0, 6);
    const texto = unicos.length
      ? "📚 Treine: " + unicos.join("   ")
      : "🎉 Mandou bem! Nenhum erro.";
    this.add
      .text(cx, y, texto, {
        fontFamily: UI.FONT,
        fontSize: "28px",
        color: unicos.length ? "#ffd23e" : "#36d96b",
        align: "center",
        wordWrap: { width: 640 },
      })
      .setOrigin(0.5);
  }

  painel(cx, y, linhas) {
    const w = 560;
    const h = 50 + linhas.length * 54;
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.45);
    g.fillRoundedRect(cx - w / 2, y - 26, w, h, 20);
    g.lineStyle(3, 0x2ff7e6, 0.7);
    g.strokeRoundedRect(cx - w / 2, y - 26, w, h, 20);
    linhas.forEach((linha, i) => {
      const ly = y + 6 + i * 54;
      this.add.text(cx - w / 2 + 40, ly, linha[0], {
        fontFamily: UI.FONT,
        fontSize: "30px",
        color: "#cccccc",
      });
      this.add
        .text(cx + w / 2 - 40, ly, linha[1], {
          fontFamily: UI.FONT,
          fontSize: "30px",
          fontStyle: "bold",
          color: "#ffd23e",
        })
        .setOrigin(1, 0);
    });
  }
}
