/**
 * MathEngine — geração pura de perguntas de tabuada e alternativas.
 * Sem dependência do Phaser, fácil de testar isoladamente.
 */
const MathEngine = (() => {
  function inteiroAleatorio(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function escolher(arr) {
    return arr[inteiroAleatorio(0, arr.length - 1)];
  }

  function chaveFato(a, b) {
    return `${Math.min(a, b)}x${Math.max(a, b)}`;
  }

  /**
   * Gera uma pergunta de multiplicação.
   * @param {number[]} tabuadas  fatores "tema" da fase (ex.: [2,5,7])
   * @param {{min:number,max:number}} faixa  faixa do segundo fator
   * @param {Object} [fatos]  repetição inteligente: { "min x max": peso } — fatos
   *   com peso maior (mais errados) aparecem com mais frequência.
   * @returns {{a:number,b:number,resposta:number,texto:string}}
   */
  function gerarPergunta(tabuadas, faixa, fatos) {
    let a, b;
    if (fatos && Object.keys(fatos).length) {
      // seleção ponderada: enumera combinações e favorece fatos fracos
      const combos = [];
      let total = 0;
      for (const t of tabuadas) {
        for (let f = faixa.min; f <= faixa.max; f++) {
          const peso = 1 + (fatos[chaveFato(t, f)] || 0) * 1.5;
          combos.push({ a: t, b: f, peso });
          total += peso;
        }
      }
      let r = Math.random() * total;
      let pick = combos[0];
      for (const c of combos) {
        r -= c.peso;
        if (r <= 0) {
          pick = c;
          break;
        }
      }
      a = pick.a;
      b = pick.b;
    } else {
      a = escolher(tabuadas);
      b = inteiroAleatorio(faixa.min, faixa.max);
    }
    // alterna a ordem para a jogadora não decorar posição
    const inverter = Math.random() < 0.5;
    const x = inverter ? b : a;
    const y = inverter ? a : b;
    return { a: x, b: y, resposta: a * b, texto: `${x} × ${y}` };
  }

  /**
   * Gera 4 alternativas embaralhadas, sempre contendo a resposta,
   * com distratores plausíveis (próximos) e sem duplicatas.
   * @param {number} resposta
   * @returns {number[]}
   */
  function gerarOpcoes(resposta) {
    const opcoes = new Set([resposta]);

    // deltas plausíveis: erros comuns de tabuada
    const deltasBase = [-1, 1, -2, 2, resposta > 12 ? -10 : -3, 3, -4, 4, 5, -5];

    let i = 0;
    while (opcoes.size < 4 && i < 50) {
      let candidato;
      if (i < deltasBase.length) {
        candidato = resposta + deltasBase[i];
      } else {
        candidato = resposta + inteiroAleatorio(-6, 6);
      }
      if (candidato > 0 && candidato !== resposta) {
        opcoes.add(candidato);
      }
      i++;
    }

    // fallback caso ainda falte (números muito pequenos)
    let extra = 1;
    while (opcoes.size < 4) {
      if (!opcoes.has(resposta + extra)) opcoes.add(resposta + extra);
      extra++;
    }

    return embaralhar([...opcoes]);
  }

  function embaralhar(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = inteiroAleatorio(0, i);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  return { gerarPergunta, gerarOpcoes, embaralhar, inteiroAleatorio, chaveFato };
})();
