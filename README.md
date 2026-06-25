# Idol Math ⚡ — Tabuada Kpop com toque de Heavy Metal 🤘

Jogo em JavaScript (Phaser 3) para **celular** que ensina a **tabuada** (multiplicação)
de um jeito divertido. Estética **kpop neon** voltada para meninas, com um **toque de metal**:
raios, palco em chamas e **chefões** ao final de cada fase.

Você é uma **idol de palco**: inimigos avançam trazendo contas de multiplicação. Toque na
resposta certa para atacar, encadeie **combos**, não perca suas **vidas** ❤️ e derrote o
**chefão** para passar de fase!

## ✨ Características

- 📱 **Mobile-first**: feito para toque, instalável como app (PWA), orientação retrato.
- 🦸 **3 heróis** para escolher ao iniciar (Lyra 🎤, Ravena 🎸, Nova 🥁) — cosméticos
  (avatar + cor + nome); o herói aparece no HUD e acompanha você pelas fases.
- 🗺️ **12 fases** em progressão por tabuada: 1–2 → 1–3 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10,
  e as **duas últimas misturam todas** (1–10). A dificuldade vem da tabuada da fase.
- 🔓 Cada fase **desbloqueia a próxima** ao ser vencida (progresso salvo).
- 👑 **Chefões** temáticos com barra de HP no fim de cada fase.
- 🔥 Combos, pontuação, vidas e **recorde salvo** no aparelho (localStorage).
- 🎵 Efeitos sonoros gerados em tempo real (Web Audio) — sem arquivos de áudio.
- 🚀 **Sem build, sem npm**: só HTML + JS. Phaser vem por CDN.

## ▶️ Como rodar

Por usar `localStorage` e `fetch` do `manifest.json`, abra via um servidor local
(não pelo `file://`):

```bash
# na raiz do projeto
python3 -m http.server 8000
# depois abra no navegador:
#   http://localhost:8000
```

No celular, abra o mesmo endereço na mesma rede, ou hospede no **GitHub Pages**
(Settings → Pages → branch). Para "instalar", use *Adicionar à tela inicial*.

## 🎮 Como jogar

1. No menu, toque em **JOGAR** (ou **Continuar** para ir à última fase desbloqueada).
2. Escolha o seu **herói** (Lyra, Ravena ou Nova).
3. Selecione uma **fase** na grade (as próximas desbloqueiam ao vencer a anterior).
4. Responda as contas tocando na alternativa certa. Acerto = ataque + combo;
   erro ou tempo esgotado = perde uma vida.
5. Derrote todos os inimigos para enfrentar o **chefão** e vencer a fase!

## 🛠️ Estrutura do projeto

```
index.html            # ponto de entrada (carrega Phaser via CDN + scripts)
manifest.json         # configuração PWA
css/style.css         # fundo/glow e centralização do canvas
js/main.js            # configuração do Phaser (Scale.FIT, retrato)
js/data/fases.js      # ⭐ FASES + config global JOGO + CHEFÕES (data-driven)
js/data/herois.js     # 🦸 HEROIS (avatar + cor + nome) — cosméticos
js/core/MathEngine.js # geração de perguntas e alternativas
js/core/Audio.js      # efeitos sonoros (Web Audio)
js/core/Storage.js    # progresso/recorde/herói (localStorage)
js/core/UI.js         # botões e textos neon reutilizáveis
js/scenes/*.js        # Boot, Menu, Hero, Stage, Game, Result
assets/icon.svg       # ícone do app
```

## ➕ Como adicionar / ajustar fases

Tudo é orientado a dados em **`js/data/fases.js`**. A **dificuldade vem da tabuada**:
cada fase define `tabuadas`. A mecânica (velocidade, intervalo do fator, força do chefão)
é **constante** e fica na config global `JOGO` — só a tabuada muda entre fases.

Para uma nova fase, acrescente um objeto ao array `FASES`:

```js
{
  id: 13,
  nome: "Nome da Fase",
  descricao: "Uma frase de atmosfera.",
  tabuadas: [3, 6, 9],      // foco da fase (quais tabuadas treinar)
  corTema: 0x2ff7e6,        // cor do tema (hex)
  inimigoEmoji: "👾",
  boss: { nome: "Nome do Chefão", emoji: "🐉", frase: "Provocação!" },
}
```

A fase aparece automaticamente na grade e na progressão. Para mexer na mecânica de
todas as fases (timer, intervalo do segundo fator, nº de inimigos, HP do chefão),
edite a config `JOGO` no topo do mesmo arquivo:

```js
const JOGO = { faixaFator: { min: 1, max: 10 }, tempoResposta: 10, numInimigos: 6, bossHp: 8 };
// tempoResposta: null  → sem timer
```

---

Feito com Phaser 3. Divirta-se e mande ver na tabuada! ⚡🎤
