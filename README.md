# Idol Math ⚡ — Tabuada Kpop com toque de Heavy Metal 🤘

Jogo em JavaScript (Phaser 3) para **celular** que ensina a **tabuada** (multiplicação)
de um jeito divertido. Estética **kpop neon** voltada para meninas, com um **toque de metal**:
raios, palco em chamas e **chefões** ao final de cada fase.

Você é uma **idol de palco**: inimigos avançam trazendo contas de multiplicação. Toque na
resposta certa para atacar, encadeie **combos**, não perca suas **vidas** ❤️ e derrote o
**chefão** para passar de fase!

## ✨ Características

- 📱 **Mobile-first**: feito para toque, instalável como app (PWA), orientação retrato.
- 🎚️ **3 dificuldades**: Fácil (tabuadas 1–5, sem tempo), Médio (1–10, com timer) e
  Difícil (1–12, timer curto + chefão mais forte).
- 🗺️ **Várias fases** com temas, inimigos e chefões diferentes.
- 👑 **Chefões** com barra de HP no fim de cada fase.
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

1. No menu, escolha a **dificuldade** e toque em **JOGAR**.
2. Selecione uma **fase** (as próximas desbloqueiam ao vencer a anterior).
3. Responda as contas tocando na alternativa certa. Acerto = ataque + combo;
   erro ou tempo esgotado = perde uma vida.
4. Derrote todos os inimigos para enfrentar o **chefão** e vencer a fase!

## 🛠️ Estrutura do projeto

```
index.html            # ponto de entrada (carrega Phaser via CDN + scripts)
manifest.json         # configuração PWA
css/style.css         # fundo/glow e centralização do canvas
js/main.js            # configuração do Phaser (Scale.FIT, retrato)
js/data/stages.js     # ⭐ FASES, DIFICULDADES e CHEFÕES (data-driven)
js/core/MathEngine.js # geração de perguntas e alternativas
js/core/Audio.js      # efeitos sonoros (Web Audio)
js/core/Storage.js    # progresso/recorde (localStorage)
js/core/UI.js         # botões e textos neon reutilizáveis
js/scenes/*.js        # Boot, Menu, Stage, Game, Result
assets/icon.svg       # ícone do app
```

## ➕ Como adicionar uma nova fase

Tudo é orientado a dados. Edite **`js/data/stages.js`** e acrescente um objeto ao array
`STAGES`:

```js
{
  id: 4,
  nome: "Nome da Fase",
  descricao: "Uma frase de atmosfera.",
  tabuadas: [3, 6, 9],      // fatores-tema da fase
  numInimigos: 8,           // inimigos comuns antes do chefão
  corTema: 0x2ff7e6,        // cor do tema (hex)
  inimigoEmoji: "👾",
  boss: {
    nome: "Nome do Chefão",
    emoji: "🐉",
    hp: 9,                  // acertos para derrotar (x multiplicador da dificuldade)
    frase: "Provocação do chefão!",
  },
}
```

A fase aparece automaticamente na seleção e na progressão. Para ajustar as faixas de
dificuldade, edite o objeto `DIFICULDADES` no mesmo arquivo.

---

Feito com Phaser 3. Divirta-se e mande ver na tabuada! ⚡🎤
