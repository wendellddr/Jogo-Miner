# ⛏️ Minerador de Moedas - Clicker Game

Um jogo clicker/incremental de mineração de moedas desenvolvido em HTML, CSS e JavaScript puro, com interface moderna e responsiva usando Tailwind CSS.

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![HTML](https://img.shields.io/badge/HTML-5-orange)
![CSS](https://img.shields.io/badge/CSS-3-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Como Usar](#-como-usar)
- [Sistema de Gameplay](#-sistema-de-gameplay)
- [Temas Personalizáveis](#-temas-personalizáveis)
- [Sistema de Áudio](#-sistema-de-áudio)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Desenvolvimento](#-desenvolvimento)
- [Contribuindo](#-contribuindo)

## 🎮 Sobre o Projeto

**Minerador de Moedas** é um jogo clicker incremental onde o jogador clica para minerar moedas, compra upgrades para aumentar a produção automática e desbloqueia melhorias mais poderosas conforme progride.

### Características Principais

- 🎯 **Clicker Simples**: Clique para minerar moedas manualmente
- ⚡ **Produção Automática**: Upgrades geram moedas automaticamente
- 💎 **Sistema de Críticos**: Chance de ganhos multiplicados
- 🔥 **Hyper-Mineração**: Poder especial que multiplica ganhos
- 🎨 **9 Temas Personalizáveis**: Customize a aparência do jogo
- 💾 **Salvamento Automático**: Progresso salvo a cada 5 segundos
- 📱 **Responsivo**: Funciona em desktop e mobile
- 🎵 **Música de Fundo**: Sistema de música com vibe de mineração

## ✨ Funcionalidades

### 🎯 Mecânicas de Jogo

- **Cliques Manuais**: Clique no botão principal para minerar moedas
- **Upgrades Infinitos**: Níveis infinitos de upgrades para progressão contínua
- **Ganhos Offline**: Ganha moedas automaticamente quando volta ao jogo
- **Sistema de Crítico**: 5% de chance de ganhar 10x mais moedas por clique
- **Hyper-Mineração**: Poder especial com cooldown que multiplica todos os ganhos por 5x por 30 segundos

### 🎨 Personalização

- **9 Temas Disponíveis**:
  - ✨ Padrão (Dourado)
  - 🌈 Neon (Arco-íris)
  - 🌿 Natureza (Verde)
  - 🌊 Oceano (Azul)
  - 💖 Rosa
  - 🔮 Mágico (Roxo)
  - 🔥 Fogo (Vermelho)
  - 🌙 Escuro (Noturno)
  - 🤖 Cyberpunk (Futurista)

### 💾 Sistema de Salvamento

- Salvamento automático a cada 5 segundos
- Persistência em `localStorage`
- Cálculo de ganhos offline baseado no tempo desde o último save

### 🎵 Sistema de Áudio

- Música de fundo com vibe de mineração (configurável)
- Sons de mineração gerados proceduralmente
- Sons de moeda para críticos
- Efeitos sonoros de upgrade/level up

## 📁 Estrutura do Projeto

```
Jogo-Miner/
│
├── index.html          # Estrutura HTML principal
├── styles.css          # Estilos CSS do jogo
├── game.js             # Lógica principal do jogo
├── menu.js             # Código do menu inicial e música
└── README.md           # Este arquivo
```

### Descrição dos Arquivos

#### `index.html`
Estrutura HTML completa do jogo, incluindo:
- Menu inicial com opções "Continuar" e "Start New Game"
- Interface do jogo principal
- Modal de customização de temas
- Elemento de áudio para música de fundo

#### `styles.css`
Todos os estilos CSS, incluindo:
- Estilos base do jogo
- Animações (moedas flutuantes, fade-in do menu)
- Efeitos visuais (glow nos cards, cards bloqueados)
- Variáveis CSS para temas dinâmicos

#### `game.js`
Lógica completa do jogo:
- Estado do jogo (`gameState`)
- Sistema de upgrades e cálculos
- Funções de persistência (save/load)
- Sistema de customização de temas
- Lógica de cliques, críticos e poder
- Funções de áudio (sons de mineração)
- Renderização de upgrades
- Loop principal do jogo

#### `menu.js`
Funcionalidades do menu:
- Inicialização do menu principal
- Sistema de música de fundo
- Controles de música (ligar/desligar)
- Integração com `game.js` para iniciar o jogo

## 🚀 Como Usar

### Instalação

1. Clone ou baixe este repositório:
   ```bash
   git clone https://github.com/wendellddr/Jogo-Miner.git
   cd Jogo-Miner
   ```

2. Abra o arquivo `index.html` em qualquer navegador moderno

3. (Opcional) Adicione sua música de fundo:
   - Baixe uma música lofi/mineração em formato MP3
   - Coloque na mesma pasta do projeto
   - Edite `index.html` linha ~166 e altere:
     ```html
     <source src="sua-musica.mp3" type="audio/mpeg">
     ```

### Como Jogar

1. **Ao abrir o jogo**: O menu inicial aparece automaticamente
2. **Escolha uma opção**:
   - **Continuar**: Retoma seu progresso salvo
   - **Start New Game**: Inicia um novo jogo (apaga progresso anterior)
3. **Minerar**: Clique no botão grande 💰 para ganhar moedas
4. **Comprar Upgrades**: Clique em "Comprar" nos cards de upgrade
5. **Ativar Hyper-Mineração**: Use o botão especial quando disponível
6. **Customizar**: Clique no botão 🎨 para escolher um tema

## 🎮 Sistema de Gameplay

### Upgrades Disponíveis

#### Upgrades de Clique (CPC - Coins Per Click)
- **Força Manual** (Nível 0): +0.05 CPC por nível
- **Reforço de Algoritmo** (Nível 0): +0.5 CPC por nível *(Requer: Força Manual nível 5)*
- **Dedo de Titânio** (Nível 0): +0.1 CPC por nível

#### Upgrades Automáticos (CPS - Coins Per Second)
- **Rato Automático** (Nível 0): +1 MPS por nível
- **Minerador Junior** (Nível 0): +10 MPS por nível
- **Fazenda de Clones** (Nível 0): +80 MPS por nível
- **Máquina de Ouro** (Nível 0): +500 MPS por nível

#### Upgrades Bloqueados (Desbloqueados por CPS)
- **Satélite de Energia**: Desbloqueado em 1.000 MPS
- **Fusão Quântica**: Desbloqueado em 5.000 MPS
- **Portal Temporal**: Desbloqueado em 50.000 MPS
- **Universo Paralelo**: Desbloqueado em 500.000 MPS

### Sistema de Crítico

- **Chance Base**: 5%
- **Multiplicador**: 10x
- Cliques críticos mostram animação especial e som diferente

### Hyper-Mineração

- **Multiplicador**: 5x em todos os ganhos
- **Duração**: 30 segundos
- **Cooldown**: 60 segundos
- Ativa visualmente com animação pulsante

### Progressão

- Upgrades têm custos exponenciais
- Cada upgrade aumenta em nível ilimitado
- Novos upgrades são desbloqueados automaticamente ao alcançar certos CPS

## 🎨 Temas Personalizáveis

O jogo oferece 9 temas diferentes, cada um com:
- Cores primárias e secundárias personalizadas
- Backgrounds customizados
- Cards estilizados
- Botões temáticos

### Como Mudar de Tema

1. Clique no botão **🎨 Customizar** no header do jogo
2. Escolha um tema clicando em um dos cards
3. O tema é aplicado imediatamente e salvo automaticamente

## 🎵 Sistema de Áudio

### Música de Fundo

Para adicionar música de fundo:

1. **Baixe uma música** com vibe de mineração (formato MP3)
   - Sugestões: sons de caverna, ambiente de mina, trilhas de jogos de mineração
   - Sites: Freesound.org, Pixabay.com, FreeMusicArchive.org

2. **Coloque o arquivo** na mesma pasta do projeto

3. **Edite `index.html`** (linha ~166):
   ```html
   <source src="mining-ambient.mp3" type="audio/mpeg">
   ```

4. A música tocará automaticamente no menu e continuará durante o jogo

### Controles de Música

- **No Menu**: Botão no canto inferior para ligar/desligar
- **Preferência**: Salva automaticamente no navegador

### Efeitos Sonoros

O jogo gera sons proceduralmente usando Web Audio API:
- **Som de Mineração**: Reproduzido a cada clique
- **Som de Moeda**: Reproduzido em cliques críticos
- **Som de Upgrade**: Reproduzido ao comprar upgrades

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Estrutura semântica
- **CSS3**: Estilização e animações
  - Tailwind CSS (via CDN): Framework utilitário
- **JavaScript (ES6+)**: Lógica do jogo
  - Web Audio API: Geração procedural de sons
  - localStorage API: Persistência de dados
- **Sem Dependências Externas**: Apenas Tailwind CSS via CDN

## 📊 Sistema de Progressão

### Fórmulas de Custo

Os custos dos upgrades seguem a fórmula:
```
Custo = CustoBase × (Multiplicador ^ Nível)
```

### Fórmulas de Ganho

- **CPC**: `1 + Σ(baseGain × nível)` para todos os upgrades de click
- **CPS**: `Σ(baseGain × nível)` para todos os upgrades automáticos

### Ganhos Offline

Ao voltar ao jogo:
```
Ganhos Offline = CPS × TempoDesdeUltimoSave
```

## 🔧 Desenvolvimento

### Estrutura de Código

O código está organizado em módulos:

#### `game.js` - Lógica Principal
- Constantes e configurações
- Estado do jogo
- Definições de upgrades e temas
- Funções de cálculo
- Sistema de persistência
- Funções de UI
- Loop principal

#### `menu.js` - Menu e Música
- Inicialização do menu
- Controles de música
- Integração com o jogo

### Variáveis Globais Importantes

- `gameState`: Estado completo do jogo
- `UPGRADE_DEFINITIONS`: Lista de upgrades ativos
- `LOCKED_UPGRADES`: Lista de upgrades bloqueados
- `THEME_DEFINITIONS`: Definições de todos os temas
- `STORAGE_KEY`: Chave para salvar o jogo
- `CUSTOMIZE_STORAGE_KEY`: Chave para salvar customizações

### Adicionando Novos Upgrades

Edite o array `UPGRADE_DEFINITIONS` em `game.js`:

```javascript
{
  id: "meu_upgrade",
  name: "Meu Upgrade",
  description: "Descrição do upgrade",
  icon: "🎯",
  baseCost: 1000,
  costMultiplier: 1.15,
  baseGain: 10,
  type: "auto", // ou "click"
  // Opcional: pré-requisito
  prerequisite: { id: "outro_upgrade", level: 5 }
}
```

### Adicionando Novos Temas

Edite o objeto `THEME_DEFINITIONS` em `game.js`:

```javascript
meu_tema: {
  primary: "#COR_PRIMARIA",
  secondary: "#COR_SECUNDARIA",
  darkBg: "#COR_BACKGROUND",
  darkCard: "#COR_CARDS",
  name: "Nome do Tema",
}
```

E adicione o card HTML correspondente em `index.html` dentro do modal de customização.

## 🐛 Possíveis Problemas

### Música não toca automaticamente

Alguns navegadores bloqueiam autoplay. Solução:
1. Clique no botão de música no menu
2. Ou permita autoplay nas configurações do navegador

### Progresso não salva

Verifique se:
- O navegador permite `localStorage`
- Não está em modo anônimo/privado
- Não há bloqueio de cookies

### Botões não funcionam

Certifique-se de que:
- `game.js` e `menu.js` foram carregados
- Abra o console do navegador (F12) para ver erros

## 📝 Changelog

### Versão 2.0 - Reorganização
- ✅ Separação do código em HTML, CSS e JavaScript
- ✅ Menu e Jogo em arquivos separados
- ✅ Melhor organização e manutenibilidade

### Versão 1.0 - Lançamento Inicial
- Sistema de cliques e upgrades
- 9 temas personalizáveis
- Sistema de música de fundo
- Salvamento automático
- Hyper-mineração

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob licença MIT. Sinta-se livre para usar, modificar e distribuir.

## 👥 Autores

**Emerson**
- GitHub: [@EmerHoff](https://github.com/EmerHoff)

**Wendell**
- GitHub: [@wendellddr](https://github.com/wendellddr)


## 🙏 Agradecimentos

- Tailwind CSS pela framework CSS utilitária
- Comunidade de jogos incrementais por inspiração
- Todos que testaram e deram feedback

---

⭐ Se você gostou do projeto, considere dar uma estrela no repositório!

**Divirta-se minerando! ⛏️💰**
