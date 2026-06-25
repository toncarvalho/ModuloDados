/**
 * AudioFX — efeitos sonoros simples via Web Audio API (sem assets).
 * Estilo kpop/metal: power chords distorcidos para golpes, blips para acertos.
 * Tudo gerado por osciladores, com toggle de mudo persistido.
 */
const AudioFX = (() => {
  let ctx = null;

  function ensureCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ctx = new AC();
    }
    // navegadores exigem retomar o contexto após gesto do usuário
    if (ctx && ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function tom(freq, dur, tipo = "square", vol = 0.18, delay = 0) {
    if (Storage.isMuted()) return;
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
    gain.connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  return {
    /** desbloqueia o contexto de áudio num gesto de toque */
    unlock() {
      ensureCtx();
    },
    acerto() {
      tom(660, 0.08, "square", 0.16);
      tom(990, 0.12, "square", 0.16, 0.06);
    },
    erro() {
      tom(180, 0.22, "sawtooth", 0.2);
      tom(120, 0.28, "sawtooth", 0.18, 0.02);
    },
    golpe() {
      // power chord curto (estilo metal)
      tom(110, 0.18, "sawtooth", 0.22);
      tom(165, 0.18, "sawtooth", 0.18);
      tom(220, 0.18, "square", 0.12);
    },
    combo() {
      tom(880, 0.06, "triangle", 0.14);
      tom(1175, 0.06, "triangle", 0.14, 0.05);
      tom(1568, 0.1, "triangle", 0.14, 0.1);
    },
    vitoria() {
      [523, 659, 784, 1047].forEach((f, i) =>
        tom(f, 0.2, "square", 0.16, i * 0.12)
      );
    },
    derrota() {
      [392, 330, 262, 196].forEach((f, i) =>
        tom(f, 0.25, "sawtooth", 0.18, i * 0.14)
      );
    },
  };
})();
