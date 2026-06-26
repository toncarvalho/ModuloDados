/**
 * LojaScene — gasta moedas em roupas (cosméticos "de verdade") do personagem
 * atual. Mostra o saldo, um preview grande do avatar com a roupa equipada e a
 * grade de roupas (comprar / equipar). Tudo por perfil, offline.
 */
class LojaScene extends Phaser.Scene {
  constructor() {
    super("LojaScene");
  }

  create() {
    this.cameras.main.fadeIn(180, 13, 13, 18);
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, "bg");
    this.heroId = Storage.getHeroiId();
    this.desenhar();
  }

  desenhar() {
    const cx = GAME_WIDTH / 2;
    if (this.layer) this.layer.destroy();
    this.layer = this.add.container(0, 0);

    this.layer.add(UI.titulo(this, cx, 92, "LOJA", 72, "#ff3ea5"));

    // saldo
    this.layer.add(
      this.add
        .text(cx, 156, `🪙 ${Storage.getMoedas()} moedas`, {
          fontFamily: UI.FONT,
          fontSize: "34px",
          fontStyle: "bold",
          color: "#ffd23e",
        })
        .setOrigin(0.5)
    );

    // preview grande do avatar com a roupa equipada
    const heroi = getHeroi(this.heroId);
    const equipada = Storage.roupaEquipada(this.heroId);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.4);
    g.fillRoundedRect(cx - 110, 200, 220, 220, 24);
    g.lineStyle(3, heroi.cor, 1);
    g.strokeRoundedRect(cx - 110, 200, 220, 220, 24);
    this.layer.add(g);
    if (this.textures.exists(equipada)) {
      this.layer.add(this.add.image(cx, 310, equipada).setDisplaySize(180, 180));
    }
    this.layer.add(
      this.add
        .text(cx, 446, heroi.nome, {
          fontFamily: UI.FONT,
          fontSize: "32px",
          fontStyle: "bold",
          color: "#" + heroi.cor.toString(16).padStart(6, "0"),
        })
        .setOrigin(0.5)
    );

    // grade de roupas (até 3 por herói)
    const roupas = roupasDoHeroi(this.heroId);
    const x0 = cx - 200;
    const dx = 200;
    roupas.forEach((r, i) => {
      this.cardRoupa(x0 + i * dx, 600, r, equipada);
    });

    // mensagem (ex.: "moedas insuficientes")
    this.txtMsg = this.add
      .text(cx, 800, "", {
        fontFamily: UI.FONT,
        fontSize: "28px",
        fontStyle: "bold",
        color: "#ff8080",
      })
      .setOrigin(0.5);
    this.layer.add(this.txtMsg);

    this.layer.add(
      this.add
        .text(cx, 868, "Troque de personagem em 🔄 / Trocar avatar", {
          fontFamily: UI.FONT,
          fontSize: "22px",
          color: "#9a9aae",
        })
        .setOrigin(0.5)
    );

    this.layer.add(
      UI.botao(this, cx, 1180, "↩  Menu", {
        cor: 0x444455,
        w: 360,
        h: 86,
        tamFonte: 32,
        onClick: () => Util.trocarCena(this, "MenuScene"),
      })
    );
  }

  cardRoupa(x, y, roupa, equipada) {
    const w = 184;
    const h = 250;
    const possui = Storage.possuiRoupa(roupa.id);
    const estaEquipada = roupa.id === equipada;
    const heroi = getHeroi(this.heroId);
    const cont = this.add.container(x, y);
    this.layer.add(cont);

    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.5);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 18);
    g.lineStyle(estaEquipada ? 6 : 3, estaEquipada ? 0x36d96b : heroi.cor, 1);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 18);
    cont.add(g);

    if (this.textures.exists(roupa.id)) {
      cont.add(this.add.image(0, -52, roupa.id).setDisplaySize(118, 118));
    }
    cont.add(
      this.add
        .text(0, 28, roupa.nome, {
          fontFamily: UI.FONT,
          fontSize: "26px",
          fontStyle: "bold",
          color: "#ffffff",
        })
        .setOrigin(0.5)
    );

    // estado / preço
    let rotulo;
    let cor;
    if (estaEquipada) {
      rotulo = "✓ Equipada";
      cor = "#36d96b";
    } else if (possui) {
      rotulo = "Equipar";
      cor = "#2ff7e6";
    } else {
      rotulo = `🪙 ${roupa.preco}`;
      cor = "#ffd23e";
    }
    cont.add(
      this.add
        .text(0, 72, rotulo, {
          fontFamily: UI.FONT,
          fontSize: "28px",
          fontStyle: "bold",
          color: cor,
        })
        .setOrigin(0.5)
    );

    cont.setSize(w, h);
    cont.setInteractive(
      new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h),
      Phaser.Geom.Rectangle.Contains
    );
    cont.on("pointerover", () => cont.setScale(1.04));
    cont.on("pointerout", () => cont.setScale(1));
    cont.on("pointerdown", () => {
      AudioFX.unlock();
      this.escolher(roupa);
    });
  }

  escolher(roupa) {
    if (roupa.id === Storage.roupaEquipada(this.heroId)) return; // já equipada
    if (Storage.possuiRoupa(roupa.id)) {
      Storage.equiparRoupa(this.heroId, roupa.id);
      AudioFX.acerto();
    } else if (Storage.getMoedas() >= roupa.preco) {
      Storage.comprarRoupa(this.heroId, roupa.id, roupa.preco);
      AudioFX.vitoria();
    } else {
      AudioFX.erro();
      this.txtMsg.setText("Moedas insuficientes! Jogue mais pra ganhar. 🎮");
      this.cameras.main.shake(200, 0.006);
      return;
    }
    this.desenhar(); // redesenha com o novo estado
  }
}
