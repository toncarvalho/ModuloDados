/**
 * HeroScene — trocar o avatar (personagem) do jogador atual. Mostra os
 * personagens em cards; tocar atualiza o perfil ativo e volta ao menu.
 * (A escolha inicial acontece ao criar o perfil na ProfileScene.)
 */
class HeroScene extends Phaser.Scene {
  constructor() {
    super("HeroScene");
  }

  create() {
    const cx = GAME_WIDTH / 2;
    this.cameras.main.fadeIn(180, 13, 13, 18);
    this.add.image(cx, GAME_HEIGHT / 2, "bg");

    UI.titulo(this, cx, 170, "TROCAR", 78, "#ff3ea5");
    UI.titulo(this, cx, 260, "AVATAR", 78, "#2ff7e6");

    const selecionado = Storage.getHeroiId();

    // cards empilhados verticalmente (compactos para caber os 5)
    const y0 = 405;
    const dy = 156;
    HEROIS.forEach((heroi, i) => {
      this.cardHeroi(cx, y0 + i * dy, heroi, heroi.id === selecionado);
    });

    UI.botao(this, cx, 1190, "↩  Menu", {
      cor: 0x444455,
      w: 360,
      h: 90,
      tamFonte: 34,
      onClick: () => Util.trocarCena(this, "MenuScene"),
    });
  }

  cardHeroi(cx, y, heroi, atual) {
    const w = 600;
    const h = 132;
    const cont = this.add.container(cx, y);

    const corHex = "#" + heroi.cor.toString(16).padStart(6, "0");

    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.5);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 20);
    g.lineStyle(atual ? 6 : 3, heroi.cor, 1);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 20);
    cont.add(g);

    // avatar (figura ilustrada, com fallback para emoji)
    let av;
    if (this.textures.exists(heroi.img)) {
      av = this.add.image(-w / 2 + 76, 0, heroi.img).setDisplaySize(98, 98);
    } else {
      av = this.add
        .text(-w / 2 + 76, 0, heroi.emoji, { fontSize: "74px" })
        .setOrigin(0.5);
    }
    cont.add(av);

    // nome
    const nome = this.add.text(-w / 2 + 158, -38, heroi.nome, {
      fontFamily: UI.FONT,
      fontSize: "38px",
      fontStyle: "bold",
      color: corHex,
    });
    cont.add(nome);

    // descrição
    const desc = this.add.text(-w / 2 + 158, 10, heroi.descricao, {
      fontFamily: UI.FONT,
      fontSize: "22px",
      color: "#dddddd",
      wordWrap: { width: w / 2 + 100 },
    });
    cont.add(desc);

    // selo "atual"
    if (atual) {
      const selo = this.add
        .text(w / 2 - 32, -h / 2 + 26, "✓", {
          fontFamily: UI.FONT,
          fontSize: "40px",
          fontStyle: "bold",
          color: "#36d96b",
        })
        .setOrigin(0.5);
      cont.add(selo);
    }

    cont.setSize(w, h);
    cont.setInteractive(
      new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h),
      Phaser.Geom.Rectangle.Contains
    );
    cont.on("pointerover", () => cont.setScale(1.03));
    cont.on("pointerout", () => cont.setScale(1));
    cont.on("pointerdown", () => {
      cont.setScale(0.97);
      AudioFX.unlock();
      AudioFX.acerto();
      Storage.setHeroi(heroi.id);
      Util.trocarCena(this, "MenuScene");
    });
    cont.on("pointerup", () => cont.setScale(1.03));
  }
}
