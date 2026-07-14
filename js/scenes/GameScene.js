/**
 * GameScene — loop principal: perguntas de tabuada, combos, vidas,
 * inimigos comuns e o chefão. Suporta o modo Boss Rush.
 * Recursos: repetição inteligente, dica no erro, voz, vibração, pausa, estrelas.
 */
class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  init(data) {
    this.bossRush = !!(data && data.bossRush);
    this.diario = !!(data && data.diario);
    this.heroi = getHeroi((data && data.heroId) || Storage.getHeroiId());

    if (this.bossRush) {
      this.brIdx = 0;
      this.fase = FASES[0];
      this.vidas = JOGO.vidasBossRush;
    } else if (this.diario) {
      // fase sintética: mix de todas as tabuadas, sem chefão
      this.fase = {
        id: 0,
        nome: "Desafio do Dia",
        tabuadas: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        corTema: 0xffd23e,
        inimigoEmoji: "🌟",
        boss: { nome: "", emoji: "🌟", frase: "" },
      };
      this.vidas = JOGO.vidas;
    } else {
      this.fase = getFase((data && data.faseId) || 1);
      this.vidas = JOGO.vidas;
    }
    this.vidasIniciais = this.vidas;

    this.pontuacao = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.inimigosRestantes = this.diario ? JOGO.inimigosDesafio : JOGO.numInimigos;
    this.isBoss = false;
    this.bossHp = 0;
    this.bossHpMax = 0;
    this.acabou = false;
    this.pausado = false;
    // O Phaser REUTILIZA a instância da cena: sem este reset, sair pelo menu
    // de pausa durante a janela de feedback deixaria respondendo=true preso,
    // travando respostas e timer na próxima partida.
    this.respondendo = false;

    // estatísticas da partida (relatório + repetição inteligente)
    this.acertos = 0;
    this.erros = 0;
    this.errosFatos = []; // textos "7 × 8" errados nesta partida
    this.moedasPartida = 0; // moedas ganhas (acertos + bônus)
  }

  create() {
    const cx = GAME_WIDTH / 2;
    this.cameras.main.fadeIn(180, 13, 13, 18);
    this.add.image(cx, GAME_HEIGHT / 2, "bg").setTint(this.fase.corTema);

    // tempo de jogo (painel de progresso): acumula ao sair da cena
    this._tInicio = this.time.now;
    this.events.once("shutdown", () => {
      try {
        Storage.adicionarTempo(this.time.now - this._tInicio);
      } catch (e) {}
      GameUI.sair();
    });

    // camada HTML de respostas + pausa sobre o canvas
    GameUI.entrar({ onPause: () => this.pausar() });
    GameUI.setPausaAcoes({
      continuar: () => this.retomar(),
      fases: () => {
        GameUI.sair();
        UIScreens.abrir("grade");
        this.scene.stop();
      },
      menu: () => {
        GameUI.sair();
        UIScreens.abrir("menu");
        this.scene.stop();
      },
    });

    this.particulas = this.add.particles(0, 0, "brilho", {
      speed: { min: 120, max: 360 },
      scale: { start: 0.9, end: 0 },
      lifespan: 600,
      blendMode: "ADD",
      emitting: false,
    });
    this.particulas.setDepth(50);

    this.criarHUD();
    this.criarPalco();
    AudioFX.sincronizarMusica();

    if (this.bossRush) this.iniciarChefao();
    else this.proximoInimigo(true);
  }

  // ---------- HUD ----------
  criarHUD() {
    const cx = GAME_WIDTH / 2;

    this.txtVidas = this.add.text(30, 30, "", {
      fontFamily: UI.FONT,
      fontSize: "40px",
    });
    this.txtPontos = this.add
      .text(cx, 40, "0", {
        fontFamily: UI.FONT,
        fontSize: "44px",
        fontStyle: "bold",
        color: "#ffd23e",
      })
      .setOrigin(0.5, 0);

    const corHeroi = Util.corHex(this.heroi.cor);
    this.txtCombo = this.add
      .text(GAME_WIDTH - 30, 84, "", {
        fontFamily: UI.FONT,
        fontSize: "34px",
        fontStyle: "bold",
        color: corHeroi,
      })
      .setOrigin(1, 0);

    // badge do herói (figura + nome) no topo-esquerdo (com a roupa equipada)
    const texHeroi = texturaAvatar(this.heroi.id);
    if (this.textures.exists(texHeroi)) {
      this.add.image(64, 124, texHeroi).setDisplaySize(64, 64);
    } else {
      this.add.text(64, 96, this.heroi.emoji, { fontSize: "48px" }).setOrigin(0.5, 0);
    }
    this.add.text(104, 104, this.heroi.nome, {
      fontFamily: UI.FONT,
      fontSize: "30px",
      fontStyle: "bold",
      color: corHeroi,
    });

    // (a pausa é um botão HTML da camada de gameplay — GameUI)
    this.atualizarHUD();
  }

  atualizarHUD() {
    this.txtVidas.setText("❤️".repeat(this.vidas) || "💔");
    this.txtPontos.setText(`${this.pontuacao}`);
    this.txtCombo.setText(this.combo > 1 ? `Combo x${this.combo}` : "");
  }

  // ---------- Palco / inimigo ----------
  criarPalco() {
    const cx = GAME_WIDTH / 2;

    this.txtFase = this.add
      .text(cx, 130, this.tituloFase(), {
        fontFamily: UI.FONT,
        fontSize: "32px",
        fontStyle: "bold",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.inimigoSprite = this.add
      .text(cx, 360, this.fase.inimigoEmoji, { fontSize: "150px" })
      .setOrigin(0.5);
    this.tweens.add({
      targets: this.inimigoSprite,
      y: 340,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });

    this.txtInimigoNome = this.add
      .text(cx, 470, "", {
        fontFamily: UI.FONT,
        fontSize: "30px",
        fontStyle: "bold",
        color: "#ff3ea5",
      })
      .setOrigin(0.5);

    this.hpBarBg = this.add.graphics();
    this.hpBar = this.add.graphics();

    this.txtPergunta = this.add
      .text(cx, 620, "", {
        fontFamily: UI.FONT,
        fontSize: "92px",
        fontStyle: "bold",
        color: "#ffffff",
      })
      .setOrigin(0.5);
    this.txtPergunta.setShadow(0, 0, "#2ff7e6", 10, true, true);

    // texto de dica (mostra a conta certa no erro)
    this.txtDica = this.add
      .text(cx, 690, "", {
        fontFamily: UI.FONT,
        fontSize: "40px",
        fontStyle: "bold",
        color: "#36d96b",
      })
      .setOrigin(0.5)
      .setVisible(false);

    // barra de tempo (retângulo escalado por frame)
    this.timerW = 500;
    this.timerX = GAME_WIDTH / 2 - this.timerW / 2;
    this.timerY = 730;
    this.timerBarBg = this.add.graphics();
    this.timerBarBg.fillStyle(0x000000, 0.4);
    this.timerBarBg.fillRoundedRect(this.timerX, this.timerY, this.timerW, 18, 9);
    this.timerBarBg.setVisible(false);
    this.timerFill = this.add
      .rectangle(this.timerX, this.timerY + 9, this.timerW, 18, 0x2ff7e6)
      .setOrigin(0, 0.5)
      .setVisible(false);
    this.timerAtivo = false;

    this._floatPool = [];
  }

  tituloFase() {
    if (this.bossRush) return `Boss Rush — ${this.brIdx + 1}/${FASES.length}`;
    if (this.diario) return "🗓️ Desafio do Dia";
    return `Fase ${this.fase.id}: ${this.fase.nome}`;
  }

  desenharHpBar() {
    const cx = GAME_WIDTH / 2;
    const w = 460;
    const x = cx - w / 2;
    const y = 510;
    this.hpBarBg.clear();
    this.hpBar.clear();
    if (this.isBoss) {
      const frac = Phaser.Math.Clamp(this.bossHp / this.bossHpMax, 0, 1);
      this.hpBarBg.fillStyle(0x000000, 0.5);
      this.hpBarBg.fillRoundedRect(x, y, w, 28, 12);
      this.hpBar.fillStyle(0xff3ea5, 1);
      this.hpBar.fillRoundedRect(x, y, w * frac, 28, 12);
      this.hpBarBg.lineStyle(2, 0xffffff, 0.6);
      this.hpBarBg.strokeRoundedRect(x, y, w, 28, 12);
    }
  }

  proximoInimigo(primeiro) {
    if (this.acabou) return;
    if (this.inimigosRestantes <= 0 && !this.isBoss) {
      if (this.diario) this.vitoria();
      else this.iniciarChefao();
      return;
    }
    if (!this.isBoss) {
      this.txtInimigoNome.setText(`Inimigos: ${this.inimigosRestantes}`);
      this.inimigoSprite.setText(this.fase.inimigoEmoji).setFontSize(150);
    }
    this.desenharHpBar();
    if (!primeiro) {
      this.inimigoSprite.setScale(0);
      this.tweens.add({
        targets: this.inimigoSprite,
        scale: 1,
        duration: 250,
        ease: "Back.out",
      });
    }
    this.novaPergunta();
  }

  iniciarChefao() {
    this.isBoss = true;
    const boss = this.fase.boss;
    this.bossHpMax = JOGO.bossHp;
    this.bossHp = this.bossHpMax;

    this.cameras.main.setBackgroundColor(0x0d0d12);
    this.inimigoSprite.setText(boss.emoji).setFontSize(190);
    this.txtInimigoNome.setText(`⚠️ ${boss.nome} ⚠️`);
    this.txtFase.setText(this.tituloFase());

    const banner = this.add
      .text(GAME_WIDTH / 2, 360, `${boss.emoji}\nCHEFÃO!\n${boss.nome}`, {
        fontFamily: UI.FONT,
        fontSize: "60px",
        fontStyle: "bold",
        color: "#ffd23e",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(100);
    banner.setShadow(0, 0, "#ff3ea5", 20, true, true);
    if (!Util.reduzirMovimento()) this.cameras.main.shake(400, 0.01);
    AudioFX.golpe();

    this.limparBotoes();
    this.txtPergunta.setText("");

    this.time.delayedCall(1400, () => {
      banner.destroy();
      this.desenharHpBar();
      this.novaPergunta();
    });
  }

  // ---------- Perguntas ----------
  novaPergunta() {
    if (this.acabou) return;
    this.txtDica.setVisible(false);
    if (this.flashcard) {
      this.flashcard.destroy();
      this.flashcard = null;
    }
    this.q = MathEngine.gerarPergunta(
      this.fase.tabuadas,
      JOGO.faixaFator,
      Storage.getFatos()
    );
    this.opcoes = MathEngine.gerarOpcoes(this.q.resposta, this.q.a, this.q.b);
    this.txtPergunta.setText(`${this.q.texto} = ?`);
    GameUI.anunciar(`Quanto é ${this.q.a} vezes ${this.q.b}?`);
    Util.falar(`${this.q.a} vezes ${this.q.b}`);

    // botões de resposta em HTML (camada GameUI) — toque nativo confiável
    GameUI.setRespostas(this.opcoes, (valor) => this.responder(valor));
    this.iniciarTimer();
  }

  limparBotoes() {
    GameUI.esconderRespostas();
    this.pararTimer();
    this.timerBarBg.setVisible(false);
    this.timerFill.setVisible(false);
  }

  // ---------- Timer ----------
  iniciarTimer() {
    this.pararTimer();
    const segundos = Storage.getConfig().timer ? JOGO.tempoResposta : null;
    if (!segundos) {
      this.timerBarBg.setVisible(false);
      this.timerFill.setVisible(false);
      return;
    }
    this.tempoTotal = segundos * 1000;
    this.tempoRestante = this.tempoTotal;
    this.timerFill.scaleX = 1;
    this.timerFill.setFillStyle(0x2ff7e6);
    this.timerBarBg.setVisible(true);
    this.timerFill.setVisible(true);
    this.timerAtivo = true;
  }

  pararTimer() {
    this.timerAtivo = false;
  }

  update(time, delta) {
    if (this.pausado || !this.timerAtivo || this.acabou || this.respondendo) return;
    this.tempoRestante -= delta;
    const frac = Phaser.Math.Clamp(this.tempoRestante / this.tempoTotal, 0, 1);
    this.timerFill.scaleX = frac;
    const cor = frac > 0.3 ? 0x2ff7e6 : 0xff3030;
    if (this.timerFill.fillColor !== cor) this.timerFill.setFillStyle(cor);
    if (this.tempoRestante <= 0) {
      this.pararTimer();
      this.tempoEsgotado();
    }
  }

  tempoEsgotado() {
    if (this.acabou) return;
    this.errar(null);
  }

  // ---------- Respostas ----------
  responder(valor) {
    if (this.acabou || this.respondendo || this.pausado) return;
    this.pararTimer();
    const certo = valor === this.q.resposta;
    Storage.registrarResposta(this.q.a, this.q.b, certo);
    if (certo) this.acertar();
    else this.errar(valor);
  }

  acertar() {
    this.respondendo = true;
    GameUI.feedback(this.q.resposta, null);
    this.acertos += 1;
    this.moedasPartida += JOGO.moedas.acerto;
    this.combo += 1;
    this.maxCombo = Math.max(this.maxCombo, this.combo);
    const ganho = Regras.pontosAcerto(this.isBoss, this.combo);
    this.pontuacao += ganho;

    AudioFX.acerto();
    if (this.combo >= 3) AudioFX.combo();
    AudioFX.golpe();
    Util.vibrar(30);

    this.particulas.emitParticleAt(this.inimigoSprite.x, this.inimigoSprite.y, 14);
    this.tweens.add({
      targets: this.inimigoSprite,
      scale: 0.8,
      angle: Phaser.Math.Between(-12, 12),
      duration: 90,
      yoyo: true,
      onComplete: () => this.inimigoSprite.setAngle(0),
    });
    this.flutuarTexto(`+${ganho}`, "#ffd23e");
    this.atualizarHUD();

    this.time.delayedCall(220, () => {
      this.respondendo = false;
      if (this.isBoss) {
        this.bossHp -= 1;
        this.desenharHpBar();
        if (this.bossHp <= 0) this.chefaoDerrotado();
        else this.novaPergunta();
      } else {
        this.inimigosRestantes -= 1;
        this.proximoInimigo(false);
      }
    });
  }

  errar(valorErrado) {
    this.respondendo = true;
    this.erros += 1;
    this.errosFatos.push(this.q.texto);
    this.combo = 0;
    this.vidas -= 1;
    AudioFX.erro();
    Util.vibrar([60, 40, 60]);
    if (!Util.reduzirMovimento()) {
      this.cameras.main.shake(250, 0.012);
      this.cameras.main.flash(150, 120, 0, 0);
    }

    // destaca a resposta correta (verde) e a tocada errada (vermelha) + dica
    GameUI.feedback(this.q.resposta, valorErrado);
    GameUI.anunciar(`Não foi dessa vez. ${this.q.texto} = ${this.q.resposta}.`);
    this.txtDica.setText(`${this.q.texto} = ${this.q.resposta}`).setVisible(true);
    this.flashcard = Util.flashcardMultiplicacao(this, this.q.a, this.q.b, 0x36d96b);
    this.flutuarTexto("-1 ❤️", "#ff5050");
    this.atualizarHUD();

    this.time.delayedCall(1500, () => {
      this.respondendo = false;
      if (this.vidas <= 0) this.derrota();
      else this.novaPergunta();
    });
  }

  // chefão derrotado: Boss Rush avança; normal → vitória
  chefaoDerrotado() {
    if (this.bossRush && this.brIdx < FASES.length - 1) {
      this.brIdx += 1;
      this.fase = FASES[this.brIdx];
      this.isBoss = false;
      this.iniciarChefao();
    } else {
      this.vitoria();
    }
  }

  flutuarTexto(str, cor) {
    let t = this._floatPool.find((o) => !o.visible);
    if (!t) {
      t = this.add
        .text(0, 0, "", { fontFamily: UI.FONT, fontSize: "60px", fontStyle: "bold" })
        .setOrigin(0.5)
        .setDepth(80);
      this._floatPool.push(t);
    }
    t.setText(str)
      .setColor(cor)
      .setPosition(GAME_WIDTH / 2, 760)
      .setAlpha(1)
      .setVisible(true);
    this.tweens.add({
      targets: t,
      y: 640,
      alpha: 0,
      duration: 700,
      onComplete: () => t.setVisible(false),
    });
  }

  // ---------- Pausa ----------
  pausar() {
    if (this.acabou || this.pausado) return;
    this.pausado = true;
    this.time.paused = true;
    this.tweens.pauseAll();
    Util.pararVoz();
    GameUI.abrirModal(); // modal de pausa em HTML (ações já registradas no create)
  }

  retomar() {
    if (!this.pausado) return;
    this.pausado = false;
    this.time.paused = false;
    this.tweens.resumeAll();
    GameUI.fecharModal();
  }

  // ---------- Fim ----------
  /** Abre a tela HTML de resultado com os dados comuns da partida + extras. */
  abrirResultado(extra) {
    this.time.delayedCall(700, () => {
      UIScreens.abrir(
        "resultado",
        Object.assign(
          {
            pontuacao: this.pontuacao,
            maxCombo: this.maxCombo,
            faseId: this.fase.id,
            heroId: this.heroi.id,
            acertos: this.acertos,
            erros: this.erros,
            errosFatos: this.errosFatos,
          },
          extra
        )
      );
      this.scene.stop();
    });
  }

  vitoria() {
    if (this.acabou) return;
    this.acabou = true;
    this.pararTimer();
    this.limparBotoes();
    AudioFX.vitoria();
    Util.vibrar([40, 30, 80]);

    this.pontuacao += Regras.bonusVitoria(this.vidas, this.maxCombo);
    Storage.setMelhorPontuacao(this.pontuacao);

    // ---- Desafio do Dia: registra ofensiva + bônus, sem estrelas/fases ----
    if (this.diario) {
      const res = Storage.registrarDesafioDiario();
      const moedas = this.moedasPartida + res.recompensa;
      Storage.addMoedas(this.moedasPartida); // res.recompensa já foi creditada no Storage
      Storage.registrarFimDePartida({
        maxCombo: this.maxCombo,
        semErro: this.erros === 0,
        venceu: true,
      });
      const novasConquistas = Storage.avaliarConquistas({ venceu: true });
      this.abrirResultado({
        venceu: true,
        diario: true,
        jaFeito: res.ja,
        ofensiva: res.ofensiva,
        melhorOfensiva: res.melhorOfensiva,
        faseId: 1,
        estrelas: 0,
        temProxima: false,
        moedasGanhas: moedas,
        novasConquistas,
      });
      return;
    }

    const estrelas = Regras.calcularEstrelas(this.vidas, this.bossRush);
    let temProxima = false;
    if (this.bossRush) {
      Storage.desbloquearBossRush();
    } else {
      Storage.setEstrelas(this.fase.id, estrelas);
      const proxima = this.fase.id + 1;
      temProxima = existeFase(proxima);
      if (temProxima) Storage.desbloquearFase(proxima);
      else Storage.desbloquearBossRush(); // zerou a última → libera Boss Rush
    }

    // moedas: acertos + bônus de vitória; conquistas
    const moedas = Regras.moedasVitoria(this.moedasPartida, estrelas);
    Storage.addMoedas(moedas);
    Storage.registrarFimDePartida({
      maxCombo: this.maxCombo,
      semErro: this.erros === 0,
      venceu: true,
    });
    const novasConquistas = Storage.avaliarConquistas({ venceu: true, faseId: this.fase.id });

    this.abrirResultado({
      venceu: true,
      bossRush: this.bossRush,
      estrelas,
      temProxima,
      moedasGanhas: moedas,
      novasConquistas,
    });
  }

  derrota() {
    if (this.acabou) return;
    this.acabou = true;
    this.pararTimer();
    this.limparBotoes();
    AudioFX.derrota();
    Storage.setMelhorPontuacao(this.pontuacao);

    // mesmo perdendo, ganha as moedas dos acertos e conquistas cumulativas valem
    Storage.addMoedas(this.moedasPartida);
    Storage.registrarFimDePartida({
      maxCombo: this.maxCombo,
      semErro: false,
      venceu: false,
    });
    const novasConquistas = Storage.avaliarConquistas({ venceu: false, faseId: this.fase.id });

    // Desafio do Dia perdido: tela do desafio (não registra/quebra a ofensiva).
    const extra = this.diario
      ? {
          diario: true,
          ofensiva: Storage.ofensivaAtual(),
          melhorOfensiva: Storage.melhorOfensiva(),
          jaFeito: Storage.desafioFeitoHoje(),
        }
      : {};

    this.abrirResultado({
      venceu: false,
      bossRush: this.bossRush,
      estrelas: 0,
      temProxima: false,
      moedasGanhas: this.moedasPartida,
      novasConquistas,
      ...extra,
    });
  }
}
