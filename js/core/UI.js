/**
 * UI — helpers de texto das cenas Phaser (botões/telas de navegação são HTML).
 */
const UI = (() => {
  const FONT = '"Trebuchet MS", "Segoe UI", sans-serif';

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

  return { titulo, FONT };
})();
