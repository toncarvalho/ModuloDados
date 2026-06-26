/**
 * ProfileScene — perfis locais de jogador (sem servidor). Dois modos:
 *  - "selecao": grade de jogadores salvos (avatar + nome + estrelas), com
 *    "➕ Novo jogador" e modo remover (🗑️ com confirmação).
 *  - "criacao": nome (overlay HTML via Util.pedirNome) + escolha do avatar
 *    (uma das 3 heroínas) → cria o perfil e segue para o menu.
 * Não é login/senha — é um seletor de "quem vai jogar".
 */
class ProfileScene extends Phaser.Scene {
  constructor() {
    super("ProfileScene");
  }

  create() {
    this.cameras.main.fadeIn(180, 13, 13, 18);
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, "bg");
    AudioFX.sincronizarMusica();

    this.removendo = false;
    this.novoNome = "";
    this.novoHeroiId = 1;

    // Sem nenhum perfil → já abre a criação.
    if (Storage.listarPerfis().length === 0) this.mostrarCriacao();
    else this.mostrarSelecao();
  }

  limparLayer() {
    if (this.layer) this.layer.destroy();
    this.layer = this.add.container(0, 0);
  }

  // ============================ SELEÇÃO ============================
  mostrarSelecao() {
    const cx = GAME_WIDTH / 2;
    this.limparLayer();

    this.layer.add(UI.titulo(this, cx, 130, "QUEM VAI", 76, "#ff3ea5"));
    this.layer.add(UI.titulo(this, cx, 212, "JOGAR?", 76, "#2ff7e6"));

    if (this.removendo) {
      this.layer.add(
        this.add
          .text(cx, 282, "Toque num jogador para remover", {
            fontFamily: UI.FONT,
            fontSize: "26px",
            color: "#ff8080",
            fontStyle: "bold",
          })
          .setOrigin(0.5)
      );
    }

    const perfis = Storage.listarPerfis();
    const atualId = Storage.perfilAtual() && Storage.perfilAtual().id;

    // grade 2 colunas
    const x0 = cx - 155;
    const dx = 310;
    const y0 = 400;
    const dy = 215;
    perfis.forEach((meta, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      this.cardPerfil(x0 + col * dx, y0 + row * dy, meta, meta.id === atualId);
    });

    // posição do bloco de botões abaixo da grade
    const linhas = Math.ceil(perfis.length / 2);
    let y = y0 + linhas * dy + 10;
    if (y < 880) y = 880;

    if (!Storage.perfilCheio() && !this.removendo) {
      this.layer.add(
        UI.botao(this, cx, y, "➕  Novo jogador", {
          cor: 0x36d96b,
          w: 460,
          h: 100,
          tamFonte: 36,
          corTexto: "#0d0d12",
          onClick: () => this.mostrarCriacao(),
        })
      );
      y += 124;
    }

    if (perfis.length > 0) {
      this.layer.add(
        UI.botao(this, cx, y, this.removendo ? "✓  Concluir" : "🗑️  Remover", {
          cor: this.removendo ? 0x2ff7e6 : 0x2a2a3a,
          w: 460,
          h: 92,
          tamFonte: 32,
          corTexto: this.removendo ? "#0d0d12" : "#ffffff",
          onClick: () => {
            this.removendo = !this.removendo;
            this.mostrarSelecao();
          },
        })
      );
      y += 116;
    }

    // Só permite voltar ao menu se já houver um jogador ativo.
    if (Storage.temPerfilAtual() && !this.removendo) {
      this.layer.add(
        UI.botao(this, cx, y, "↩  Menu", {
          cor: 0x444455,
          w: 360,
          h: 84,
          tamFonte: 30,
          onClick: () => Util.trocarCena(this, "MenuScene"),
        })
      );
    }
  }

  cardPerfil(x, y, meta, atual) {
    const w = 290;
    const h = 188;
    const heroi = getHeroi(meta.heroiId);
    const cont = this.add.container(x, y);
    this.layer.add(cont);

    const borda = this.removendo ? 0xff3030 : heroi.cor;
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.5);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 22);
    g.lineStyle(atual ? 6 : 3, borda, 1);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 22);
    cont.add(g);

    // avatar
    let av;
    if (this.textures.exists(heroi.img)) {
      av = this.add.image(0, -34, heroi.img).setDisplaySize(108, 108);
    } else {
      av = this.add.text(0, -34, heroi.emoji, { fontSize: "84px" }).setOrigin(0.5);
    }
    cont.add(av);

    // nome
    cont.add(
      this.add
        .text(0, 44, meta.nome, {
          fontFamily: UI.FONT,
          fontSize: "34px",
          fontStyle: "bold",
          color: "#ffffff",
        })
        .setOrigin(0.5)
    );

    // estrelas (lê o save daquele perfil sem trocar o atual)
    const estr = this.totalEstrelasDe(meta.id);
    cont.add(
      this.add
        .text(0, 80, `⭐ ${estr}`, {
          fontFamily: UI.FONT,
          fontSize: "26px",
          fontStyle: "bold",
          color: "#ffd23e",
        })
        .setOrigin(0.5)
    );

    if (this.removendo) {
      cont.add(
        this.add
          .text(w / 2 - 30, -h / 2 + 26, "🗑️", { fontSize: "34px" })
          .setOrigin(0.5)
      );
    } else if (atual) {
      cont.add(
        this.add
          .text(w / 2 - 30, -h / 2 + 26, "✓", {
            fontFamily: UI.FONT,
            fontSize: "40px",
            fontStyle: "bold",
            color: "#36d96b",
          })
          .setOrigin(0.5)
      );
    }

    cont.setSize(w, h);
    cont.setInteractive(
      new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h),
      Phaser.Geom.Rectangle.Contains
    );
    cont.on("pointerover", () => cont.setScale(1.04));
    cont.on("pointerout", () => cont.setScale(1));
    cont.on("pointerdown", () => {
      cont.setScale(0.96);
      AudioFX.unlock();
      if (this.removendo) this.confirmarRemocao(meta);
      else this.entrar(meta);
    });
    cont.on("pointerup", () => cont.setScale(1.04));
  }

  /** Lê o total de estrelas de um perfil sem alterar o perfil atual. */
  totalEstrelasDe(id) {
    try {
      const raw = localStorage.getItem(`idolmath.save.${id}`);
      if (!raw) return 0;
      const estrelas = (JSON.parse(raw) || {}).estrelas || {};
      return Object.values(estrelas).reduce((s, n) => s + n, 0);
    } catch (e) {
      return 0;
    }
  }

  entrar(meta) {
    AudioFX.acerto();
    Storage.selecionarPerfil(meta.id);
    Util.trocarCena(this, "MenuScene");
  }

  confirmarRemocao(meta) {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    const overlay = this.add.container(0, 0).setDepth(300);

    const bg = this.add.graphics();
    bg.fillStyle(0x05030c, 0.85);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    overlay.add(bg);

    const painel = this.add.graphics();
    painel.fillStyle(0x15101f, 1);
    painel.fillRoundedRect(cx - 300, cy - 220, 600, 440, 26);
    painel.lineStyle(4, 0xff3030, 1);
    painel.strokeRoundedRect(cx - 300, cy - 220, 600, 440, 26);
    overlay.add(painel);

    overlay.add(UI.titulo(this, cx, cy - 140, "REMOVER?", 56, "#ff3030"));
    overlay.add(
      this.add
        .text(cx, cy - 40, `Apagar "${meta.nome}" e todo\no progresso deste jogador?`, {
          fontFamily: UI.FONT,
          fontSize: "30px",
          color: "#ffffff",
          align: "center",
        })
        .setOrigin(0.5)
    );

    overlay.add(
      UI.botao(this, cx, cy + 70, "🗑️  Apagar", {
        cor: 0xff3030,
        w: 440,
        h: 96,
        tamFonte: 36,
        onClick: () => {
          AudioFX.erro();
          Storage.removerPerfil(meta.id);
          overlay.destroy();
          // Se removeu o último/atual, volta a ter que escolher/criar.
          if (Storage.listarPerfis().length === 0) {
            this.removendo = false;
            this.mostrarCriacao();
          } else {
            this.mostrarSelecao();
          }
        },
      })
    );
    overlay.add(
      UI.botao(this, cx, cy + 180, "Cancelar", {
        cor: 0x2a2a3a,
        w: 440,
        h: 92,
        tamFonte: 34,
        onClick: () => overlay.destroy(),
      })
    );
  }

  // ============================ CRIAÇÃO ============================
  mostrarCriacao() {
    const cx = GAME_WIDTH / 2;
    this.removendo = false;
    this.limparLayer();

    this.layer.add(UI.titulo(this, cx, 130, "NOVO", 76, "#ff3ea5"));
    this.layer.add(UI.titulo(this, cx, 212, "JOGADOR", 76, "#2ff7e6"));

    // campo de nome (toque abre o overlay de texto)
    this.layer.add(
      this.add
        .text(cx, 300, "Seu nome:", {
          fontFamily: UI.FONT,
          fontSize: "28px",
          color: "#ffd23e",
          fontStyle: "bold",
        })
        .setOrigin(0.5)
    );

    this.caixaNome = UI.botao(this, cx, 372, this.novoNome || "Toque para digitar", {
      cor: 0x0d0d12,
      w: 520,
      h: 96,
      tamFonte: this.novoNome ? 44 : 30,
      corTexto: this.novoNome ? "#ffffff" : "#9a9aae",
      onClick: () => this.editarNome(),
    });
    this.layer.add(this.caixaNome);

    this.layer.add(
      this.add
        .text(cx, 445, "Escolha seu personagem:", {
          fontFamily: UI.FONT,
          fontSize: "28px",
          color: "#ffd23e",
          fontStyle: "bold",
        })
        .setOrigin(0.5)
    );

    // cards dos personagens em grade 2×3 (comporta 5–6)
    const colX = [cx - 108, cx + 108];
    const rowY = [552, 748, 944];
    HEROIS.forEach((heroi, i) => {
      this.cardHeroi(colX[i % 2], rowY[Math.floor(i / 2)], heroi);
    });

    // Criar
    this.layer.add(
      UI.botao(this, cx, 1100, "✨  Criar jogador", {
        cor: 0x36d96b,
        w: 500,
        h: 96,
        tamFonte: 38,
        corTexto: "#0d0d12",
        onClick: () => this.criar(),
      })
    );

    // Voltar (à seleção, se houver perfis)
    const temPerfis = Storage.listarPerfis().length > 0;
    this.layer.add(
      UI.botao(this, cx, 1206, temPerfis ? "↩  Voltar" : "↩  Menu", {
        cor: 0x444455,
        w: 360,
        h: 86,
        tamFonte: 32,
        onClick: () => {
          if (temPerfis) this.mostrarSelecao();
          else if (Storage.temPerfilAtual()) Util.trocarCena(this, "MenuScene");
          else this.mostrarSelecao();
        },
      })
    );

    // Abre o teclado já de cara se o nome estiver vazio (UX ágil).
    if (!this.novoNome) this.time.delayedCall(220, () => this.editarNome());
  }

  cardHeroi(x, y, heroi) {
    const w = 200;
    const h = 184;
    const selecionado = heroi.id === this.novoHeroiId;
    const cont = this.add.container(x, y);
    this.layer.add(cont);

    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.5);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 20);
    g.lineStyle(selecionado ? 6 : 3, heroi.cor, 1);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 20);
    cont.add(g);

    let av;
    if (this.textures.exists(heroi.img)) {
      av = this.add.image(0, -32, heroi.img).setDisplaySize(96, 96);
    } else {
      av = this.add.text(0, -32, heroi.emoji, { fontSize: "74px" }).setOrigin(0.5);
    }
    cont.add(av);

    cont.add(
      this.add
        .text(0, 42, heroi.nome, {
          fontFamily: UI.FONT,
          fontSize: "30px",
          fontStyle: "bold",
          color: "#" + heroi.cor.toString(16).padStart(6, "0"),
        })
        .setOrigin(0.5)
    );

    if (selecionado) {
      cont.add(
        this.add
          .text(0, 74, "✓", {
            fontFamily: UI.FONT,
            fontSize: "28px",
            fontStyle: "bold",
            color: "#36d96b",
          })
          .setOrigin(0.5)
      );
    }

    cont.setSize(w, h);
    cont.setInteractive(
      new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h),
      Phaser.Geom.Rectangle.Contains
    );
    cont.on("pointerover", () => cont.setScale(1.04));
    cont.on("pointerout", () => cont.setScale(1));
    cont.on("pointerdown", () => {
      AudioFX.unlock();
      AudioFX.acerto();
      this.novoHeroiId = heroi.id;
      this.mostrarCriacao(); // redesenha com a seleção
    });
  }

  editarNome() {
    Util.pedirNome(
      this.novoNome,
      (nome) => {
        this.novoNome = nome;
        if (this.caixaNome) {
          this.caixaNome.setLabel(nome);
          this.caixaNome.label.setColor("#ffffff");
          this.caixaNome.label.setFontSize(44);
        }
      },
      "Qual é o seu nome?"
    );
  }

  criar() {
    const nome = (this.novoNome || "").trim();
    if (!nome) {
      this.editarNome();
      return;
    }
    AudioFX.acerto();
    Storage.criarPerfil(nome, this.novoHeroiId);
    Util.trocarCena(this, "MenuScene");
  }
}
