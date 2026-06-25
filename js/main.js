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
  input: { activePointers: 1 },
  disableContextMenu: true,
  scene: [
    BootScene,
    MenuScene,
    HeroScene,
    StageScene,
    GameScene,
    ResultScene,
    SettingsScene,
    TrainScene,
  ],
};

window.addEventListener("load", () => {
  window.game = new Phaser.Game(config);
});
