/**
 * Util — helpers pequenos: vibração (mobile), voz (Web Speech) e
 * transição com fade entre cenas. Tudo opcional/defensivo.
 */
const Util = (() => {
  return {
    /** Vibra o aparelho (se suportado). */
    vibrar(ms) {
      if (navigator.vibrate) {
        try {
          navigator.vibrate(ms);
        } catch (e) {}
      }
    },

    /** Lê um texto em voz alta (Web Speech), se a configuração "voz" estiver ligada. */
    falar(texto) {
      if (!Storage.getConfig().voz) return;
      if (!("speechSynthesis" in window)) return;
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(texto);
        u.lang = "pt-BR";
        u.rate = 1.0;
        u.pitch = 1.1;
        window.speechSynthesis.speak(u);
      } catch (e) {}
    },

    pararVoz() {
      if ("speechSynthesis" in window) {
        try {
          window.speechSynthesis.cancel();
        } catch (e) {}
      }
    },

    /** Troca de cena com fade out/in suave. */
    trocarCena(scene, key, data) {
      scene.cameras.main.fadeOut(180, 13, 13, 18);
      scene.cameras.main.once("camerafadeoutcomplete", () => {
        scene.scene.start(key, data);
      });
    },

    /**
     * Pede um nome ao usuário via overlay HTML temático sobre o #game-root
     * (Phaser não tem campo de texto nativo). Chama onOk(nome) com o nome
     * aparado (até 12 chars) ou nada se cancelar. Fallback para window.prompt.
     */
    pedirNome(valorInicial, onOk, titulo) {
      const limpar = (s) => (s || "").toString().replace(/\s+/g, " ").trim().slice(0, 12);

      const root = document.getElementById("game-root");
      if (!root || typeof document.createElement !== "function") {
        // Fallback defensivo: diálogo nativo.
        try {
          const r = window.prompt(titulo || "Qual é o seu nome?", valorInicial || "");
          if (r !== null) {
            const nome = limpar(r);
            if (nome) onOk(nome);
          }
        } catch (e) {}
        return;
      }

      // Evita abrir dois overlays.
      if (document.getElementById("idol-nome-overlay")) return;

      const overlay = document.createElement("div");
      overlay.id = "idol-nome-overlay";
      overlay.style.cssText =
        "position:absolute;inset:0;z-index:50;display:flex;align-items:center;" +
        "justify-content:center;background:rgba(8,6,18,0.78);" +
        'font-family:"Trebuchet MS","Segoe UI",sans-serif;';

      const card = document.createElement("div");
      card.style.cssText =
        "width:80%;max-width:340px;background:#15101f;border:3px solid #ff3ea5;" +
        "border-radius:18px;padding:22px 20px;box-shadow:0 0 24px rgba(255,62,165,.5);" +
        "text-align:center;";

      const tituloEl = document.createElement("div");
      tituloEl.textContent = titulo || "Qual é o seu nome?";
      tituloEl.style.cssText =
        "color:#2ff7e6;font-weight:bold;font-size:20px;margin-bottom:14px;";

      const input = document.createElement("input");
      input.type = "text";
      input.maxLength = 12;
      input.value = valorInicial || "";
      input.setAttribute("autocomplete", "off");
      input.setAttribute("autocapitalize", "words");
      input.style.cssText =
        "width:100%;box-sizing:border-box;padding:12px;border-radius:12px;border:2px solid #7b2ff7;" +
        "background:#0d0d12;color:#fff;font-size:22px;text-align:center;outline:none;";

      const linha = document.createElement("div");
      linha.style.cssText = "display:flex;gap:12px;margin-top:16px;";

      const mkBtn = (label, bg, fg) => {
        const b = document.createElement("button");
        b.textContent = label;
        b.style.cssText =
          `flex:1;padding:12px;border:none;border-radius:12px;background:${bg};color:${fg};` +
          "font-size:18px;font-weight:bold;cursor:pointer;";
        return b;
      };
      const btnOk = mkBtn("OK", "#36d96b", "#0d0d12");
      const btnCancel = mkBtn("Cancelar", "#2a2a3a", "#ffffff");

      const fechar = () => {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      };
      const confirmar = () => {
        const nome = limpar(input.value);
        fechar();
        if (nome) onOk(nome);
      };

      btnOk.addEventListener("click", confirmar);
      btnCancel.addEventListener("click", fechar);
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") confirmar();
        else if (e.key === "Escape") fechar();
      });

      linha.appendChild(btnCancel);
      linha.appendChild(btnOk);
      card.appendChild(tituloEl);
      card.appendChild(input);
      card.appendChild(linha);
      overlay.appendChild(card);
      root.appendChild(overlay);

      // Foco/teclado (após anexar ao DOM).
      setTimeout(() => {
        try {
          input.focus();
          input.select();
        } catch (e) {}
      }, 30);
    },
  };
})();
