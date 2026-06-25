/**
 * GameScene — loop principal: perguntas de tabuada, combos, vidas,
 * inimigos comuns e, ao final, o chefão (modo isBoss).
 */
class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  init(data) {
    this.fase = getFase(data.faseId || 1);
    this.heroi = getHeroi((data && data.heroId) || Storage.getHeroiId());

    this.vidas = 3;
    this.pontuacao = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.inimigosRestantes = JOGO.numInimigos;
    this.isBoss = false;
    this.bossHp = 0;
    this.bossHpMax = 0;
    this.acabou = false;
    this.botoesResposta = [];
  }

  create() {
    const cx = GAME_WIDTH / 2;
    this.add.image(cx, GAME_HEIGHT / 2, "bg").setTint(this.fase.corTema);

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
    this.proximoInimigo(true);
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

    const corHeroi = "#" + this.heroi.cor.toString(16).padStart(6, "0");
    this.txtCombo = this.add
      .text(GAME_WIDTH - 30, 40, "", {
        fontFamily: UI.FONT,
        fontSize: "38px",
        fontStyle: "bold",
        color: corHeroi,
      })
      .setOrigin(1, 0);

    // badge do herói escolhido (avatar + nome) no topo-esquerdo
    this.add.text(40, 96, this.heroi.emoji, { fontSize: "48px" }).setOrigin(0.5, 0);
    this.add.text(76, 104, this.heroi.nome, {
      fontFamily: UI.FONT,
      fontSize: "30px",
      fontStyle: "bold",
      color: corHeroi,
    });

    // botão mudo
    this.btnMute = this.add
      .text(GAME_WIDTH - 30, 110, Storage.isMuted() ? "🔇" : "🔊", {
        fontSize: "40px",
      })
      .setOrigin(1, 0)
      .setInteractive({ useHandCursor: true });
    this.btnMute.on("pointerdown", () => {
      Storage.setMuted(!Storage.isMuted());
      this.btnMute.setText(Storage.isMuted() ? "🔇" : "🔊");
    });

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
      .text(cx, 130, `Fase ${this.fase.id}: ${this.fase.nome}`, {
        fontFamily: UI.FONT,
        fontSize: "32px",
        fontStyle: "bold",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // sprite do inimigo (emoji grande)
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

    // barra de HP / contador de inimigos
    this.hpBarBg = this.add.graphics();
    this.hpBar = this.add.graphics();

    // pergunta
    this.txtPergunta = this.add
      .text(cx, 620, "", {
        fontFamily: UI.FONT,
        fontSize: "92px",
        fontStyle: "bold",
        color: "#ffffff",
      })
      .setOrigin(0.5);
    this.txtPergunta.setShadow(0, 0, "#2ff7e6", 10, true, true);

    // barra de tempo: fundo arredondado desenhado UMA vez; o preenchimento é um
    // retângulo escalado por frame (transform-only, sem retesselar caminho a cada tick).
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

    // pool de textos flutuantes ("+pontos"/"-1 ❤️") — reusa em vez de criar/destruir.
    this._floatPool = [];

    // botões de resposta criados uma única vez (reaproveitados a cada pergunta)
    this.criarBotoesResposta();
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
    } else {
      // contador de inimigos restantes em "pontos"
      this.hpBarBg.fillStyle(0x000000, 0.0);
    }
  }

  proximoInimigo(primeiro) {
    if (this.acabou) return;

    if (this.inimigosRestantes <= 0 && !this.isBoss) {
      this.iniciarChefao();
      return;
    }

    if (!this.isBoss) {
      this.txtInimigoNome.setText(
        `Inimigos: ${this.inimigosRestantes}`
      );
      this.inimigoSprite.setText(this.fase.inimigoEmoji).setFontSize(150);
    }

    this.desenharHpBar();
    if (!primeiro) {
      // animação de entrada do novo inimigo
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

    this.inimigoSprite.setText(boss.emoji).setFontSize(190);
    this.txtInimigoNome.setText(`⚠️ ${boss.nome} ⚠️`);

    // banner dramático
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
    this.cameras.main.shake(400, 0.01);
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
    this.q = MathEngine.gerarPergunta(this.fase.tabuadas, JOGO.faixaFator);
    this.opcoes = MathEngine.gerarOpcoes(this.q.resposta);
    this.txtPergunta.setText(`${this.q.texto} = ?`);

    this.atualizarBotoesResposta();
    this.iniciarTimer();
  }

  // Cria os 4 botões UMA vez (posições fixas 2×2). Performance: evita
  // destruir/recriar objetos Text+Graphics a cada pergunta (causa de micro-travadas).
  criarBotoesResposta() {
    const cx = GAME_WIDTH / 2;
    const baseY = 880;
    const dx = 240;
    const dy = 160;
    this.coresBotoes = [0xff3ea5, 0x7b2ff7, 0x2ff7e6, 0xffd23e];

    for (let i = 0; i < 4; i++) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = cx + (col === 0 ? -dx / 2 : dx / 2);
      const y = baseY + row * dy;
      const corTexto = this.coresBotoes[i] === 0xffd23e ? "#0d0d12" : "#ffffff";
      const b = UI.botao(this, x, y, "", {
        cor: this.coresBotoes[i],
        w: 220,
        h: 130,
        tamFonte: 56,
        corTexto,
      });
      b.setVisible(false).disableInteractive();
      this.botoesResposta.push(b);
    }
  }

  // Reaproveita os botões existentes: atualiza rótulo, cor-base e ação.
  atualizarBotoesResposta() {
    this.opcoes.forEach((valor, i) => {
      const b = this.botoesResposta[i];
      b.setLabel(`${valor}`);
      b.setCor(this.coresBotoes[i]);
      b.setScale(1);
      b.setHandler(() => this.responder(valor, b));
      b.setVisible(true).setInteractive();
    });
  }

  // Oculta/desabilita os botões sem destruí-los (banner do chefão, fim de jogo).
  // Também esconde a barra de tempo (só é chamado ao limpar o palco, não no feedback).
  limparBotoes() {
    this.botoesResposta.forEach((b) => b.setVisible(false).disableInteractive());
    this.pararTimer();
    this.timerBarBg.setVisible(false);
    this.timerFill.setVisible(false);
  }

  // ---------- Timer ----------
  iniciarTimer() {
    this.pararTimer();
    const segundos = JOGO.tempoResposta;
    if (!segundos) {
      // fácil = sem timer
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

  // Loop do timer dirigido pelo frame (delta) — suave e barato (só transform).
  update(time, delta) {
    if (!this.timerAtivo || this.acabou || this.respondendo) return;
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
  responder(valor, botao) {
    if (this.acabou || this.respondendo) return;
    this.pararTimer();

    if (valor === this.q.resposta) {
      this.acertar(botao);
    } else {
      if (botao) botao.setCor(0xff3030);
      this.errar(botao);
    }
  }

  acertar(botao) {
    this.respondendo = true;
    if (botao) botao.setCor(0x36d96b);
    this.combo += 1;
    this.maxCombo = Math.max(this.maxCombo, this.combo);

    const base = this.isBoss ? 20 : 10;
    this.pontuacao += base * this.combo;

    AudioFX.acerto();
    if (this.combo >= 3) AudioFX.combo();

    // efeito de golpe no inimigo
    this.particulas.emitParticleAt(this.inimigoSprite.x, this.inimigoSprite.y, 14);
    AudioFX.golpe();
    this.tweens.add({
      targets: this.inimigoSprite,
      scale: 0.8,
      angle: Phaser.Math.Between(-12, 12),
      duration: 90,
      yoyo: true,
      onComplete: () => this.inimigoSprite.setAngle(0),
    });
    this.flutuarTexto(`+${base * this.combo}`, "#ffd23e");
    this.atualizarHUD();

    this.time.delayedCall(220, () => {
      this.respondendo = false;
      if (this.isBoss) {
        this.bossHp -= 1;
        this.desenharHpBar();
        if (this.bossHp <= 0) {
          this.vitoria();
        } else {
          this.novaPergunta();
        }
      } else {
        this.inimigosRestantes -= 1;
        this.proximoInimigo(false);
      }
    });
  }

  errar(botao) {
    this.respondendo = true;
    this.combo = 0;
    this.vidas -= 1;
    AudioFX.erro();
    this.cameras.main.shake(250, 0.012);
    this.cameras.main.flash(150, 120, 0, 0);

    // destaca a resposta correta
    this.botoesResposta.forEach((b) => {
      if (b.label.text === `${this.q.resposta}`) b.setCor(0x36d96b);
    });
    this.flutuarTexto("-1 ❤️", "#ff5050");
    this.atualizarHUD();

    this.time.delayedCall(450, () => {
      this.respondendo = false;
      if (this.vidas <= 0) {
        this.derrota();
      } else {
        this.novaPergunta();
      }
    });
  }

  flutuarTexto(str, cor) {
    // Reusa um texto inativo do pool; cria um novo só se todos estiverem em uso.
    let t = this._floatPool.find((o) => !o.visible);
    if (!t) {
      t = this.add
        .text(0, 0, "", {
          fontFamily: UI.FONT,
          fontSize: "60px",
          fontStyle: "bold",
        })
        .setOrigin(0.5)
        .setDepth(80);
      this._floatPool.push(t);
    }
    t.setText(str)
      .setColor(cor)
      .setPosition(GAME_WIDTH / 2, 700)
      .setAlpha(1)
      .setVisible(true);
    this.tweens.add({
      targets: t,
      y: 580,
      alpha: 0,
      duration: 700,
      onComplete: () => t.setVisible(false),
    });
  }

  // ---------- Fim ----------
  vitoria() {
    if (this.acabou) return;
    this.acabou = true;
    this.pararTimer();
    this.limparBotoes();
    AudioFX.vitoria();

    // bônus por vidas restantes
    this.pontuacao += this.vidas * 50 + this.maxCombo * 5;
    Storage.setMelhorPontuacao(this.pontuacao);

    const proxima = this.fase.id + 1;
    const temProxima = existeFase(proxima);
    if (temProxima) {
      Storage.desbloquearFase(proxima);
    }

    this.time.delayedCall(700, () => {
      this.scene.start("ResultScene", {
        venceu: true,
        pontuacao: this.pontuacao,
        maxCombo: this.maxCombo,
        faseId: this.fase.id,
        heroId: this.heroi.id,
        temProxima,
      });
    });
  }

  derrota() {
    if (this.acabou) return;
    this.acabou = true;
    this.pararTimer();
    this.limparBotoes();
    AudioFX.derrota();
    Storage.setMelhorPontuacao(this.pontuacao);

    this.time.delayedCall(700, () => {
      this.scene.start("ResultScene", {
        venceu: false,
        pontuacao: this.pontuacao,
        maxCombo: this.maxCombo,
        faseId: this.fase.id,
        heroId: this.heroi.id,
        temProxima: false,
      });
    });
  }
}
