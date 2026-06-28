/**
 * Bootstrap do Phaser. Buildless: todas as cenas são classes globais
 * carregadas por <script> antes deste arquivo.
 */

// Dimensões base de projeto (retrato). Scale.FIT cuida do resto.
const GAME_WIDTH = 720;
const GAME_HEIGHT = 1280;

const PALETA = {
  rosa: 0xff3ea5,
  roxo: 0x7b2ff7,
  preto: 0x0d0d12,
  ciano: 0x2ff7e6,
  ouro: 0xffd23e,
  branco: 0xffffff,
};

const config = {
  type: Phaser.AUTO,
  parent: "game-root",
  backgroundColor: "#0d0d12",
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  // Flags de performance (fluidez e resposta de toque, especialmente em celulares).
  render: {
    antialias: true,
    roundPixels: true,
    powerPreference: "high-performance",
  },
  fps: { target: 60, min: 30 },
  // 2 ponteiros: um dedo/palma extra não bloqueia o toque válido (crianças).
  input: { activePointers: 2 },
  disableContextMenu: true,
  // Navegação é HTML (UIScreens); o Phaser roda só o gameplay.
  scene: [BootScene, GameScene, TrainScene],
};

window.addEventListener("load", () => {
  window.game = new Phaser.Game(config);

  // No Android, a barra de endereço dinâmica do Chrome redimensiona a viewport
  // e os limites de input do Phaser podem ficar desatualizados → toque deslocado.
  // Recalcular a escala/limites nessas mudanças mantém o toque alinhado.
  const realinhar = () => {
    if (window.game && window.game.scale) {
      try {
        window.game.scale.refresh();
      } catch (e) {}
    }
  };
  let agendado = null;
  const realinharDebounce = () => {
    if (agendado) clearTimeout(agendado);
    agendado = setTimeout(realinhar, 60);
  };
  window.addEventListener("resize", realinharDebounce);
  window.addEventListener("orientationchange", realinharDebounce);
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", realinharDebounce);
    window.visualViewport.addEventListener("scroll", realinharDebounce);
  }
});
