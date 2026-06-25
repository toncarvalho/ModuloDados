/**
 * SettingsScene — configurações: música, efeitos, timer e voz.
 * Cada item é um botão que alterna ligado/desligado e persiste.
 */
class SettingsScene extends Phaser.Scene {
  constructor() {
    super("SettingsScene");
  }

  create() {
    const cx = GAME_WIDTH / 2;
    this.cameras.main.fadeIn(180, 13, 13, 18);
    this.add.image(cx, GAME_HEIGHT / 2, "bg");

    UI.titulo(this, cx, 200, "AJUSTES", 84, "#2ff7e6");

    const itens = [
      { chave: "musica", emoji: "🎵", nome: "Música" },
      { chave: "efeitos", emoji: "🔊", nome: "Efeitos" },
      { chave: "timer", emoji: "⏱️", nome: "Cronômetro" },
      { chave: "voz", emoji: "🗣️", nome: "Ler em voz alta" },
    ];

    this.botoes = {};
    itens.forEach((it, i) => {
      const y = 380 + i * 150;
      const b = UI.botao(this, cx, y, "", {
        cor: 0x2a2a3a,
        w: 560,
        h: 120,
        tamFonte: 38,
        onClick: () => this.alternar(it.chave),
      });
      this.botoes[it.chave] = { b, it };
      this.pintar(it.chave);
    });

    UI.botao(this, cx, 1080, "↩  Voltar", {
      cor: 0x444455,
      w: 400,
      h: 100,
      onClick: () => Util.trocarCena(this, "MenuScene"),
    });
  }

  alternar(chave) {
    const atual = Storage.getConfig()[chave];
    Storage.setConfig(chave, !atual);
    if (chave === "musica") AudioFX.sincronizarMusica();
    if (chave === "efeitos" && !atual) AudioFX.acerto(); // prévia ao ligar
    this.pintar(chave);
  }

  pintar(chave) {
    const { b, it } = this.botoes[chave];
    const ligado = Storage.getConfig()[chave];
    b.setLabel(`${it.emoji}  ${it.nome}:  ${ligado ? "LIGADO" : "desligado"}`);
    b.setCor(ligado ? 0x36d96b : 0x2a2a3a);
    b.label.setColor(ligado ? "#0d0d12" : "#aaaaaa");
  }
}
