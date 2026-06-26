/**
 * TrainScene — Modo Treino: escolhe uma tabuada (ou Mix) e pratica sem timer
 * e sem perder vida. Alimenta a repetição inteligente (fatos fracos).
 */
class TrainScene extends Phaser.Scene {
  constructor() {
    super("TrainScene");
  }

  init(data) {
    // permite iniciar direto numa tabuada (ex.: vindo do painel de progresso)
    this.tabInicial = (data && data.tabuadas) || null;
    this.tituloInicial = (data && data.titulo) || "Treino dirigido";
  }

  create() {
    this.cameras.main.fadeIn(180, 13, 13, 18);
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, "bg");
    AudioFX.sincronizarMusica();

    // tempo de jogo (painel de progresso)
    this._tInicio = this.time.now;
    this.events.once("shutdown", () => {
      try {
        Storage.adicionarTempo(this.time.now - this._tInicio);
      } catch (e) {}
    });

    if (this.tabInicial && this.tabInicial.length) {
      this.iniciarTreino(this.tabInicial, this.tituloInicial);
    } else {
      this.mostrarSelecao();
    }
  }

  // ---- seleção da tabuada ----
  mostrarSelecao() {
    const cx = GAME_WIDTH / 2;
    this.grupoSel = this.add.container(0, 0);
    this.grupoSel.add(UI.titulo(this, cx, 150, "TREINO", 84, "#36d96b"));
    this.grupoSel.add(
      this.add
        .text(cx, 230, "Escolha o que treinar", {
          fontFamily: UI.FONT,
          fontSize: "30px",
          color: "#ffd23e",
          fontStyle: "bold",
        })
        .setOrigin(0.5)
    );

    // grade 1..10 (5 col × 2 lin) + Mix
    const cols = 5;
    const x0 = 120;
    const dx = 120;
    const y0 = 360;
    const dy = 130;
    for (let n = 1; n <= 10; n++) {
      const i = n - 1;
      const x = x0 + (i % cols) * dx;
      const y = y0 + Math.floor(i / cols) * dy;
      this.grupoSel.add(
        UI.botao(this, x, y, `${n}`, {
          cor: 0x7b2ff7,
          w: 100,
          h: 100,
          tamFonte: 46,
          onClick: () => this.iniciarTreino([n], `Tabuada do ${n}`),
        })
      );
    }
    this.grupoSel.add(
      UI.botao(this, cx, 700, "🌀  Mix (1–10)", {
        cor: 0xff3ea5,
        w: 460,
        h: 110,
        onClick: () =>
          this.iniciarTreino([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], "Mix 1–10"),
      })
    );
    this.grupoSel.add(
      UI.botao(this, cx, 1120, "↩  Menu", {
        cor: 0x444455,
        w: 360,
        h: 96,
        tamFonte: 34,
        onClick: () => Util.trocarCena(this, "MenuScene"),
      })
    );
  }

  // ---- prática ----
  iniciarTreino(tabuadas, titulo) {
    this.tab = tabuadas;
    this.acertos = 0;
    this.erros = 0;
    this.respondendo = false;
    if (this.grupoSel) this.grupoSel.destroy();
    this.montarTreino(titulo);
    this.novaPergunta();
  }

  montarTreino(titulo) {
    const cx = GAME_WIDTH / 2;
    UI.titulo(this, cx, 130, "TREINO", 60, "#36d96b");
    this.add
      .text(cx, 210, titulo, {
        fontFamily: UI.FONT,
        fontSize: "34px",
        color: "#ffd23e",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.txtPlacar = this.add
      .text(cx, 290, "", {
        fontFamily: UI.FONT,
        fontSize: "30px",
        color: "#2ff7e6",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.txtPergunta = this.add
      .text(cx, 470, "", {
        fontFamily: UI.FONT,
        fontSize: "96px",
        fontStyle: "bold",
        color: "#ffffff",
      })
      .setOrigin(0.5);
    this.txtPergunta.setShadow(0, 0, "#36d96b", 12, true, true);

    this.txtDica = this.add
      .text(cx, 560, "", {
        fontFamily: UI.FONT,
        fontSize: "40px",
        fontStyle: "bold",
        color: "#36d96b",
      })
      .setOrigin(0.5)
      .setVisible(false);

    // 4 botões reaproveitados
    this.coresBotoes = [0xff3ea5, 0x7b2ff7, 0x2ff7e6, 0xffd23e];
    this.botoes = [];
    const baseY = 760;
    const dx = 240;
    const dy = 170;
    for (let i = 0; i < 4; i++) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = cx + (col === 0 ? -dx / 2 : dx / 2);
      const y = baseY + row * dy;
      const corTexto = this.coresBotoes[i] === 0xffd23e ? "#0d0d12" : "#ffffff";
      this.botoes.push(
        UI.botao(this, x, y, "", {
          cor: this.coresBotoes[i],
          w: 220,
          h: 140,
          tamFonte: 56,
          corTexto,
        })
      );
    }

    UI.botao(this, cx, 1180, "↩  Menu", {
      cor: 0x444455,
      w: 320,
      h: 80,
      tamFonte: 30,
      onClick: () => Util.trocarCena(this, "MenuScene"),
    });
    this.atualizarPlacar();
  }

  atualizarPlacar() {
    const total = this.acertos + this.erros;
    const prec = total ? Math.round((this.acertos / total) * 100) : 100;
    this.txtPlacar.setText(`✅ ${this.acertos}   ❌ ${this.erros}   🎯 ${prec}%`);
  }

  novaPergunta() {
    this.txtDica.setVisible(false);
    if (this.flashcard) {
      this.flashcard.destroy();
      this.flashcard = null;
    }
    this.q = MathEngine.gerarPergunta(this.tab, JOGO.faixaFator, Storage.getFatos());
    this.opcoes = MathEngine.gerarOpcoes(this.q.resposta);
    this.txtPergunta.setText(`${this.q.texto} = ?`);
    Util.falar(`${this.q.a} vezes ${this.q.b}`);
    this.opcoes.forEach((valor, i) => {
      const b = this.botoes[i];
      b.setLabel(`${valor}`);
      b.setCor(this.coresBotoes[i]);
      b.setHandler(() => this.responder(valor, b));
      b.setVisible(true).setInteractive();
    });
    this.respondendo = false;
  }

  responder(valor, botao) {
    if (this.respondendo) return;
    this.respondendo = true;
    const certo = valor === this.q.resposta;
    Storage.registrarResposta(this.q.a, this.q.b, certo);
    if (certo) {
      this.acertos += 1;
      botao.setCor(0x36d96b);
      AudioFX.acerto();
      Util.vibrar(30);
      this.time.delayedCall(320, () => this.novaPergunta());
    } else {
      this.erros += 1;
      botao.setCor(0xff3030);
      this.botoes.forEach((b) => {
        if (b.label.text === `${this.q.resposta}`) b.setCor(0x36d96b);
      });
      this.txtDica.setText(`${this.q.texto} = ${this.q.resposta}`).setVisible(true);
      this.flashcard = Util.flashcardMultiplicacao(this, this.q.a, this.q.b, 0x36d96b);
      AudioFX.erro();
      Util.vibrar([60, 40, 60]);
      this.time.delayedCall(1800, () => this.novaPergunta());
    }
    this.atualizarPlacar();
  }
}
