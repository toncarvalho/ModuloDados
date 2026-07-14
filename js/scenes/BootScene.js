/**
 * BootScene — gera as texturas via canvas/Graphics (sem assets externos):
 * fundo em gradiente e partícula de brilho.
 */
class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    // Figuras dos heróis (SVG ilustrado — DiceBear/Avataaars).
    HEROIS.forEach((h) => {
      this.load.svg(h.img, `assets/herois/${h.file || h.id}.svg`, {
        width: 256,
        height: 256,
      });
    });
    // Roupas extras (loja) — cada uma como uma textura própria.
    if (typeof ROUPAS !== "undefined") {
      Object.values(ROUPAS).forEach((lista) => {
        lista.forEach((r) => {
          if (r.preco > 0) {
            this.load.svg(r.id, `assets/herois/${r.file}.svg`, {
              width: 256,
              height: 256,
            });
          }
        });
      });
    }
  }

  create() {
    this.gerarFundo();
    this.gerarBrilho();
    // Navegação é HTML (overlay): abre o menu (ou a criação de perfil).
    // A BootScene fica como cena "host" ociosa por baixo do overlay; o gameplay
    // (GameScene/TrainScene) é iniciado sob demanda pelo UIScreens.
    UIScreens.irInicio();
  }

  /** Fundo vertical gradiente neon roxo->preto->rosa com estrelas estáticas. */
  gerarFundo() {
    const w = GAME_WIDTH;
    const h = GAME_HEIGHT;
    const tex = this.textures.createCanvas("bg", w, h);
    const ctx = tex.getContext();

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "#1a0b3a");
    grad.addColorStop(0.5, "#0d0d12");
    grad.addColorStop(1, "#2a0a22");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // brilhos radiais kpop (cantos)
    this.radial(ctx, w * 0.15, h * 0.08, 360, "rgba(123,47,247,0.5)");
    this.radial(ctx, w * 0.85, h * 0.95, 380, "rgba(255,62,165,0.45)");

    // estrelinhas
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    for (let i = 0; i < 70; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const r = Math.random() * 1.8 + 0.4;
      ctx.globalAlpha = Math.random() * 0.7 + 0.2;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    tex.refresh();
  }

  radial(ctx, x, y, r, color) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  }

  /** Partícula de brilho (glow radial branco). */
  gerarBrilho() {
    const s = 64;
    const tex = this.textures.createCanvas("brilho", s, s);
    const ctx = tex.getContext();
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.4, "rgba(255,210,62,0.8)");
    g.addColorStop(1, "rgba(255,62,165,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
    tex.refresh();
  }
}
