/**
 * UIScreens — camada de telas em HTML sobreposta ao canvas do Phaser.
 *
 * Piloto da migração de telas para HTML: os menus eram desenhados no canvas
 * (botões com hit-area frágil, toque deslocado no Android). Aqui usamos botões
 * <button> nativos, acessíveis, sem bugs de área de toque. O Phaser continua
 * rodando por baixo (sem troca de cena), então fechar o overlay volta direto
 * para a MenuScene que ficou viva.
 *
 * Reaproveita Storage (config) e AudioFX — sem alterá-los.
 */
const UIScreens = (() => {
  // Espelha SettingsScene: mesmos itens e mesma lógica de alternância.
  const ITENS_AJUSTES = [
    { chave: "musica", emoji: "🎵", nome: "Música" },
    { chave: "efeitos", emoji: "🔊", nome: "Efeitos" },
    { chave: "timer", emoji: "⏱️", nome: "Cronômetro" },
    { chave: "voz", emoji: "🗣️", nome: "Ler em voz alta" },
  ];

  function root() {
    return document.getElementById("ui-root");
  }

  function pintarAjuste(chave) {
    const btn = document.querySelector(`#screen-ajustes [data-cfg="${chave}"]`);
    if (!btn) return;
    const it = ITENS_AJUSTES.find((x) => x.chave === chave);
    const ligado = !!Storage.getConfig()[chave];
    btn.textContent = `${it.emoji}  ${it.nome}:  ${ligado ? "LIGADO" : "desligado"}`;
    btn.classList.toggle("on", ligado);
    btn.setAttribute("aria-pressed", String(ligado));
  }

  function montarAjustes() {
    ITENS_AJUSTES.forEach((it) => pintarAjuste(it.chave));
  }

  function alternarAjuste(chave) {
    const atual = Storage.getConfig()[chave];
    Storage.setConfig(chave, !atual);
    if (chave === "musica") AudioFX.sincronizarMusica();
    if (chave === "efeitos" && !atual) AudioFX.acerto(); // prévia ao ligar
    pintarAjuste(chave);
  }

  const api = {
    /** mostra o overlay com a tela indicada (esconde as demais) */
    abrir(nome) {
      const r = root();
      if (!r) return;
      r.querySelectorAll(".ui-screen").forEach((sec) => {
        sec.hidden = sec.id !== `screen-${nome}`;
      });
      if (nome === "ajustes") montarAjustes();
      r.hidden = false;
      // foco no 1º botão da tela ativa (acessibilidade/teclado)
      const primeiro = r.querySelector(`#screen-${nome} button`);
      if (primeiro) primeiro.focus();
    },

    /** esconde o overlay — volta para a cena do Phaser que está viva por baixo */
    fechar() {
      const r = root();
      if (r) r.hidden = true;
    },

    /** liga o listener delegado de cliques do overlay */
    init() {
      const r = root();
      if (!r) return;
      r.addEventListener("click", (ev) => {
        const alvo = ev.target.closest("[data-cfg], [data-acao]");
        if (!alvo || !r.contains(alvo)) return;
        if (alvo.dataset.cfg) {
          alternarAjuste(alvo.dataset.cfg);
        } else if (alvo.dataset.acao === "voltar") {
          api.fechar();
        }
      });
    },
  };

  return api;
})();

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => UIScreens.init());
} else {
  UIScreens.init();
}
