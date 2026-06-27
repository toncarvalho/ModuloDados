/**
 * UI — helpers de interface reutilizados por todas as cenas.
 * Botões neon "kpop/metal" com alvos de toque grandes (mobile-first).
 */
const UI = (() => {
  const FONT = '"Trebuchet MS", "Segoe UI", sans-serif';

  /**
   * Cria um botão retangular neon com texto.
   * @returns {Phaser.GameObjects.Container}
   */
  function botao(scene, x, y, label, opts = {}) {
    const w = opts.w || 520;
    const h = opts.h || 110; // >= 64px de alvo de toque
    const corFundo = opts.cor ?? 0xff3ea5;
    const corTexto = opts.corTexto || "#ffffff";
    const tamFonte = opts.tamFonte || 40;
    const pad = opts.hitPad || 0; // folga extra de toque além do visual

    const cont = scene.add.container(x, y);

    const g = scene.add.graphics();
    desenharBotao(g, w, h, corFundo, 1);

    const txt = scene.add
      .text(0, 0, label, {
        fontFamily: FONT,
        fontSize: `${tamFonte}px`,
        fontStyle: "bold",
        color: corTexto,
        align: "center",
      })
      .setOrigin(0.5);

    cont.add([g, txt]);
    cont.setSize(w, h);
    // Área de toque CENTRADA (com folga opcional). Mantida explícita para que
    // ligar()/desligar() não a percam (não re-chamamos setInteractive).
    cont.setInteractive(
      new Phaser.Geom.Rectangle(-w / 2 - pad, -h / 2 - pad, w + 2 * pad, h + 2 * pad),
      Phaser.Geom.Rectangle.Contains
    );

    // handler mutável para permitir reuso do botão (trocar a ação sem recriar)
    cont._onClick = opts.onClick || null;

    cont.on("pointerover", () => cont.setScale(1.04));
    cont.on("pointerout", () => cont.setScale(1));
    // Dispara a AÇÃO já no toque (pointerdown) para resposta instantânea no celular.
    cont.on("pointerdown", () => {
      cont.setScale(0.96);
      AudioFX.unlock();
      if (cont._onClick) cont._onClick();
    });
    // pointerup/upoutside apenas restauram a escala visual.
    cont.on("pointerup", () => cont.setScale(1.04));
    cont.on("pointerupoutside", () => cont.setScale(1));

    // permite trocar a cor depois (feedback acerto/erro)
    cont.setCor = (cor, alpha = 1) => {
      g.clear();
      desenharBotao(g, w, h, cor, alpha);
    };
    // reuso: trocar a ação e o rótulo sem destruir/recriar o objeto
    cont.setHandler = (fn) => {
      cont._onClick = fn;
    };
    cont.setLabel = (str) => {
      txt.setText(str);
    };
    // liga/desliga o toque SEM recriar a área interativa (preserva a hit area).
    cont.ligar = () => {
      if (cont.input) cont.input.enabled = true;
      cont.setVisible(true);
      return cont;
    };
    cont.desligar = () => {
      if (cont.input) cont.input.enabled = false;
      cont.setVisible(false);
      return cont;
    };
    cont.label = txt;
    return cont;
  }

  function desenharBotao(g, w, h, cor, alpha) {
    const r = 22;
    // sombra/borda metal
    g.fillStyle(0x000000, 0.35 * alpha);
    g.fillRoundedRect(-w / 2 + 4, -h / 2 + 6, w, h, r);
    // corpo
    g.fillStyle(cor, alpha);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, r);
    // brilho superior
    g.fillStyle(0xffffff, 0.18 * alpha);
    g.fillRoundedRect(-w / 2 + 8, -h / 2 + 8, w - 16, h * 0.32, r * 0.7);
    // borda neon
    g.lineStyle(3, 0xffffff, 0.5 * alpha);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, r);
  }

  /** Texto com brilho neon padrão. */
  function titulo(scene, x, y, str, tam = 84, cor = "#ffffff") {
    const t = scene.add
      .text(x, y, str, {
        fontFamily: FONT,
        fontSize: `${tam}px`,
        fontStyle: "bold",
        color: cor,
        align: "center",
      })
      .setOrigin(0.5);
    t.setShadow(0, 0, "#ff3ea5", 18, true, true);
    return t;
  }

  return { botao, titulo, FONT };
})();
