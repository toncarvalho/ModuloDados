/**
 * AudioFX — efeitos sonoros + música de fundo via Web Audio API (sem assets).
 * Estilo kpop/metal: power chords para golpes, blips para acertos, e um loop
 * de baixo + arpejo como trilha. Respeita as configurações (efeitos/música).
 */
const AudioFX = (() => {
  let ctx = null;
  let musicTimer = null;
  let musicStep = 0;
  let musicGain = null;

  function ensureCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ctx = new AC();
    }
    if (ctx && ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function tom(freq, dur, tipo = "square", vol = 0.18, delay = 0, dest = null) {
    const ac = ensureCtx();
    if (!ac) return;
    const t0 = ac.currentTime + delay;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = tipo;
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(dest || ac.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  // som de efeito — só toca se "efeitos" estiver ligado
  function sfx(fn) {
    if (!Storage.getConfig().efeitos) return;
    fn();
  }

  // ---- Música de fundo (sequenciador simples) ----
  const BASS = [110, 0, 165, 0, 131, 0, 196, 0, 110, 0, 165, 0, 147, 0, 196, 220];
  const LEAD = [0, 440, 0, 523, 0, 392, 0, 659, 0, 440, 0, 523, 0, 587, 0, 0];

  function tocarStep() {
    const ac = ensureCtx();
    if (!ac || !musicGain) return;
    const i = musicStep % BASS.length;
    const b = BASS[i];
    if (b) tom(b, 0.22, "sawtooth", 0.5, 0, musicGain);
    const l = LEAD[i];
    if (l) tom(l, 0.16, "triangle", 0.3, 0, musicGain);
    musicStep++;
  }

  return {
    /** desbloqueia o contexto de áudio num gesto de toque */
    unlock() {
      ensureCtx();
    },

    // ----- efeitos -----
    acerto() {
      sfx(() => {
        tom(660, 0.08, "square", 0.16);
        tom(990, 0.12, "square", 0.16, 0.06);
      });
    },
    erro() {
      sfx(() => {
        tom(180, 0.22, "sawtooth", 0.2);
        tom(120, 0.28, "sawtooth", 0.18, 0.02);
      });
    },
    golpe() {
      sfx(() => {
        tom(110, 0.18, "sawtooth", 0.22);
        tom(165, 0.18, "sawtooth", 0.18);
        tom(220, 0.18, "square", 0.12);
      });
    },
    combo() {
      sfx(() => {
        tom(880, 0.06, "triangle", 0.14);
        tom(1175, 0.06, "triangle", 0.14, 0.05);
        tom(1568, 0.1, "triangle", 0.14, 0.1);
      });
    },
    vitoria() {
      sfx(() =>
        [523, 659, 784, 1047].forEach((f, i) => tom(f, 0.2, "square", 0.16, i * 0.12))
      );
    },
    derrota() {
      sfx(() =>
        [392, 330, 262, 196].forEach((f, i) => tom(f, 0.25, "sawtooth", 0.18, i * 0.14))
      );
    },

    // ----- música de fundo -----
    iniciarMusica() {
      if (musicTimer || !Storage.getConfig().musica) return;
      const ac = ensureCtx();
      if (!ac) return;
      musicGain = ac.createGain();
      musicGain.gain.value = 0.05; // baixinho, ambiente
      musicGain.connect(ac.destination);
      musicStep = 0;
      musicTimer = setInterval(tocarStep, 230); // ~130 BPM em colcheias
    },
    pararMusica() {
      if (musicTimer) {
        clearInterval(musicTimer);
        musicTimer = null;
      }
      if (musicGain) {
        try {
          musicGain.disconnect();
        } catch (e) {}
        musicGain = null;
      }
    },
    /** liga/desliga a música conforme a configuração atual */
    sincronizarMusica() {
      if (Storage.getConfig().musica) this.iniciarMusica();
      else this.pararMusica();
    },
    musicaTocando() {
      return !!musicTimer;
    },
  };
})();
