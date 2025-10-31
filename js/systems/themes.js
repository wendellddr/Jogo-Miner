/**
 * themes.js
 * Sistema de Mundos (Níveis) com Progresso
 */

// --- Constantes ---
const WORLDS_STORAGE_KEY = "coinClickerWorlds";

// --- Estado dos Mundos ---
let currentWorld = "green"; // Começa no mundo Natureza

// --- Ordem dos Mundos e Requisitos ---
const WORLD_ORDER = [
  { id: "green", name: "Natureza", requiredCoins: 0 }, // Mundo inicial
  { id: "blue", name: "Oceano", requiredCoins: 10000 },
  { id: "purple", name: "Mágico", requiredCoins: 50000 },
  { id: "neon", name: "Neon", requiredCoins: 200000 },
  { id: "pink", name: "Rosa", requiredCoins: 500000 },
  { id: "red", name: "Fogo", requiredCoins: 2000000 },
  { id: "dark", name: "Escuro", requiredCoins: 10000000 },
  { id: "cyberpunk", name: "Cyberpunk", requiredCoins: 50000000 },
  { id: "default", name: "Ouro", requiredCoins: 200000000 }, // Mundo final
];

/**
 * Obtém o índice do mundo atual
 * @returns {number} Índice do mundo atual
 */
function getCurrentWorldIndex() {
  return WORLD_ORDER.findIndex((w) => w.id === currentWorld);
}

/**
 * Obtém o mundo atual
 * @returns {Object} Objeto do mundo atual
 */
function getCurrentWorld() {
  return WORLD_ORDER.find((w) => w.id === currentWorld) || WORLD_ORDER[0];
}

/**
 * Obtém o próximo mundo disponível
 * @returns {Object|null} Próximo mundo ou null se não houver
 */
function getNextWorld() {
  const currentIndex = getCurrentWorldIndex();
  if (currentIndex < WORLD_ORDER.length - 1) {
    return WORLD_ORDER[currentIndex + 1];
  }
  return null;
}

/**
 * Verifica se o progresso é suficiente para avançar ao próximo mundo
 * @param {number} totalCoins - Total de moedas já ganhas
 * @returns {boolean} True se pode avançar
 */
function canAdvanceWorld(totalCoins) {
  const nextWorld = getNextWorld();
  if (!nextWorld) return false;
  return totalCoins >= nextWorld.requiredCoins;
}

/**
 * Calcula o progresso para o próximo mundo
 * @param {number} totalCoins - Total de moedas já ganhas
 * @returns {Object} Objeto com progresso atual e necessário
 */
function getWorldProgress(totalCoins) {
  const nextWorld = getNextWorld();
  if (!nextWorld) {
    return {
      current: 0,
      required: 0,
      percent: 100,
      hasNext: false,
    };
  }

  const currentWorld = getCurrentWorld();
  const currentProgress = Math.max(0, totalCoins - currentWorld.requiredCoins);
  const requiredProgress = nextWorld.requiredCoins - currentWorld.requiredCoins;
  const percent = Math.min(100, (currentProgress / requiredProgress) * 100);

  return {
    current: currentProgress,
    required: requiredProgress,
    percent: percent,
    hasNext: true,
    nextWorld: nextWorld,
  };
}

/**
 * Avança para o próximo mundo
 */
function advanceToNextWorld() {
  const nextWorld = getNextWorld();
  if (!nextWorld) return false;

  if (typeof gameState === "undefined") return false;
  if (gameState.totalCoinsEarned < nextWorld.requiredCoins) return false;

  currentWorld = nextWorld.id;
  saveWorld();
  applyTheme(currentWorld);

  if (typeof showMessage === "function") {
    showMessage(`🌍 Mundo desbloqueado: ${nextWorld.name}!`, false);
  }

  return true;
}

/**
 * Salva o mundo atual
 */
function saveWorld() {
  try {
    localStorage.setItem(
      WORLDS_STORAGE_KEY,
      JSON.stringify({ currentWorld: currentWorld })
    );
  } catch (e) {
    console.error("Erro ao salvar mundo:", e);
  }
}

/**
 * Carrega o mundo salvo
 */
function loadWorld() {
  try {
    const savedData = localStorage.getItem(WORLDS_STORAGE_KEY);
    if (savedData) {
      const loaded = JSON.parse(savedData);
      if (loaded.currentWorld) {
        // Verifica se o mundo salvo existe na ordem
        const worldExists = WORLD_ORDER.some(
          (w) => w.id === loaded.currentWorld
        );
        if (worldExists) {
          currentWorld = loaded.currentWorld;
        }
      }
    }
  } catch (e) {
    console.warn("Erro ao carregar mundo:", e);
  }
}

/**
 * Inicializa o sistema de mundos
 */
function initializeWorlds() {
  loadWorld();
  const world = getCurrentWorld();
  applyTheme(world.id);
}

// --- Definições Completas de Temas ---
const THEME_DEFINITIONS = {
  default: {
    id: "default",
    name: "Padrão",
    icon: "✨",
    primary: "#FFC300",
    secondary: "#FF5733",
    darkBg: "#1a1a2e",
    darkCard: "#2c2c54",
    emojis: {
      coin: "💰",
      clickButton: "💰",
      power: "⚡",
      upgrade: "⬆️",
      critical: "💥",
      achievement: "🏆",
    },
    texts: {
      gameTitle: "Minerador de Moedas",
      clickButton: "Minerar",
      powerButton: "Ativar Hyper-Mineração",
      customizeButton: "Customizar",
      achievementsButton: "Conquistas",
    },
  },
  neon: {
    id: "neon",
    name: "Neon",
    icon: "🌈",
    primary: "#FF0080",
    secondary: "#00FFFF",
    darkBg: "#0a0a1a",
    darkCard: "#1a0a2e",
    emojis: {
      coin: "💎",
      clickButton: "💎",
      power: "✨",
      upgrade: "🚀",
      critical: "💫",
      achievement: "⭐",
    },
    texts: {
      gameTitle: "Minerador Neon",
      clickButton: "Brilar",
      powerButton: "Ativar Modo Neon",
      customizeButton: "Customizar",
      achievementsButton: "Estrelas",
    },
  },
  green: {
    id: "green",
    name: "Natureza",
    icon: "🌿",
    primary: "#10B981",
    secondary: "#34D399",
    darkBg: "#0a1a0e",
    darkCard: "#1a2e1a",
    emojis: {
      coin: "🍃",
      clickButton: "🍃",
      power: "🌱",
      upgrade: "🌳",
      critical: "✨",
      achievement: "🌿",
    },
    texts: {
      gameTitle: "Minerador Natural",
      clickButton: "Colher",
      powerButton: "Ativar Crescimento",
      customizeButton: "Customizar",
      achievementsButton: "Conquistas",
    },
  },
  blue: {
    id: "blue",
    name: "Oceano",
    icon: "🌊",
    primary: "#3B82F6",
    secondary: "#60A5FA",
    darkBg: "#0a0a1a",
    darkCard: "#1a1a2e",
    emojis: {
      coin: "💧",
      clickButton: "💧",
      power: "🌊",
      upgrade: "🌊",
      critical: "⚡",
      achievement: "🐚",
    },
    texts: {
      gameTitle: "Minerador Aquático",
      clickButton: "Nadar",
      powerButton: "Ativar Maré",
      customizeButton: "Customizar",
      achievementsButton: "Conquistas",
    },
  },
  pink: {
    id: "pink",
    name: "Rosa",
    icon: "💖",
    primary: "#EC4899",
    secondary: "#F472B6",
    darkBg: "#1a0a14",
    darkCard: "#2e1a24",
    emojis: {
      coin: "💗",
      clickButton: "💗",
      power: "💝",
      upgrade: "🌸",
      critical: "✨",
      achievement: "💖",
    },
    texts: {
      gameTitle: "Minerador Rosa",
      clickButton: "Amar",
      powerButton: "Ativar Modo Doce",
      customizeButton: "Customizar",
      achievementsButton: "Conquistas",
    },
  },
  purple: {
    id: "purple",
    name: "Mágico",
    icon: "🔮",
    primary: "#8B5CF6",
    secondary: "#A78BFA",
    darkBg: "#0f0a1a",
    darkCard: "#1a0a2e",
    emojis: {
      coin: "✨",
      clickButton: "✨",
      power: "🔮",
      upgrade: "⭐",
      critical: "💫",
      achievement: "🌟",
    },
    texts: {
      gameTitle: "Minerador Mágico",
      clickButton: "Conjurar",
      powerButton: "Ativar Magia",
      customizeButton: "Customizar",
      achievementsButton: "Conquistas",
    },
  },
  red: {
    id: "red",
    name: "Fogo",
    icon: "🔥",
    primary: "#EF4444",
    secondary: "#F87171",
    darkBg: "#1a0a0a",
    darkCard: "#2e1a1a",
    emojis: {
      coin: "🔥",
      clickButton: "🔥",
      power: "⚡",
      upgrade: "💥",
      critical: "💥",
      achievement: "🔥",
    },
    texts: {
      gameTitle: "Minerador de Fogo",
      clickButton: "Queimar",
      powerButton: "Ativar Chama",
      customizeButton: "Customizar",
      achievementsButton: "Conquistas",
    },
  },
  dark: {
    id: "dark",
    name: "Escuro",
    icon: "🌙",
    primary: "#9CA3AF",
    secondary: "#D1D5DB",
    darkBg: "#000000",
    darkCard: "#111827",
    emojis: {
      coin: "🌑",
      clickButton: "🌑",
      power: "🌙",
      upgrade: "⚫",
      critical: "✨",
      achievement: "🌙",
    },
    texts: {
      gameTitle: "Minerador Noturno",
      clickButton: "Escurecer",
      powerButton: "Ativar Escuridão",
      customizeButton: "Customizar",
      achievementsButton: "Conquistas",
    },
  },
  cyberpunk: {
    id: "cyberpunk",
    name: "Cyberpunk",
    icon: "🤖",
    primary: "#00F5FF",
    secondary: "#FF00F5",
    darkBg: "#050014",
    darkCard: "#0a0028",
    emojis: {
      coin: "💿",
      clickButton: "💿",
      power: "⚡",
      upgrade: "🔌",
      critical: "💥",
      achievement: "🤖",
    },
    texts: {
      gameTitle: "Minerador Cyberpunk",
      clickButton: "Hackear",
      powerButton: "Ativar Sistema",
      customizeButton: "Customizar",
      achievementsButton: "Conquistas",
    },
  },
};

// --- Funções de Persistência ---

// Funções de tema antigas removidas (agora usamos sistema de mundos)

// --- Funções de Aplicação de Tema ---

/**
 * Aplica um tema ao jogo
 * @param {string} themeId - ID do tema a aplicar
 */
function applyTheme(themeId) {
  const theme = THEME_DEFINITIONS[themeId] || THEME_DEFINITIONS.green;
  currentWorld = themeId; // Atualiza o mundo atual

  // Aplica cores CSS
  applyThemeColors(theme);

  // Aplica emojis
  applyThemeEmojis(theme);

  // Aplica textos
  applyThemeTexts(theme);

  // Atualiza emojis dos upgrades (agora usa emojis específicos por upgrade e tema)
  if (typeof updateUpgradesEmojis === "function") {
    updateUpgradesEmojis();
  }

  // Atualiza emoji do botão de poder
  if (typeof updatePowerButtonEmoji === "function") {
    updatePowerButtonEmoji();
  }

  // Atualiza inventário se existir
  if (typeof renderInventory === "function") {
    renderInventory();
  }

  // Atualiza mochila se existir
  if (typeof renderBag === "function") {
    renderBag();
  }

  // Salva preferência
  saveWorld();
}

/**
 * Aplica as cores do tema
 * @param {Object} theme - Objeto do tema
 */
function applyThemeColors(theme) {
  // Atualiza variáveis CSS customizadas
  document.documentElement.style.setProperty("--theme-primary", theme.primary);
  document.documentElement.style.setProperty(
    "--theme-secondary",
    theme.secondary
  );
  document.documentElement.style.setProperty("--theme-dark-bg", theme.darkBg);
  document.documentElement.style.setProperty(
    "--theme-dark-card",
    theme.darkCard
  );

  // Atualiza background do body
  document.body.style.backgroundColor = theme.darkBg;

  // Atualiza cores dos elementos principais
  const primaryElements = document.querySelectorAll(".text-primary");
  primaryElements.forEach((el) => {
    el.style.color = theme.primary;
  });

  // Atualiza background dos cards
  const cards = document.querySelectorAll(".bg-dark-card");
  cards.forEach((el) => {
    el.style.backgroundColor = theme.darkCard;
  });

  // Atualiza cores dos botões principais
  const clickButton = document.getElementById("click-button");
  if (clickButton) {
    clickButton.style.backgroundColor = theme.primary;
    clickButton.style.color = theme.darkBg;
  }

  // Atualiza cores secundárias
  const secondaryElements = document.querySelectorAll(".text-secondary");
  secondaryElements.forEach((el) => {
    el.style.color = theme.secondary;
  });

  // Atualiza cores do loading overlay
  const loadingOverlay = document.getElementById("loading-overlay");
  if (loadingOverlay) {
    loadingOverlay.style.backgroundColor = theme.darkBg;
  }

  // Atualiza cores do modal
  const modals = document.querySelectorAll(".bg-dark-card");
  modals.forEach((modal) => {
    modal.style.backgroundColor = theme.darkCard;
  });

  // Atualiza cor do spinner de loading
  const spinner = document.querySelector("#loading-overlay .border-primary");
  if (spinner) {
    spinner.style.borderColor = theme.primary;
  }
}

/**
 * Aplica os emojis do tema
 * @param {Object} theme - Objeto do tema
 */
function applyThemeEmojis(theme) {
  // Emoji do botão de clique
  const clickButton = document.getElementById("click-button");
  if (clickButton) {
    const emojiSpan = clickButton.querySelector("span.text-3xl");
    if (emojiSpan) {
      emojiSpan.textContent = theme.emojis.clickButton;
    }
  }

  // Emoji do título do jogo (se houver)
  const gameTitle = document.querySelector("h1.text-4xl");
  if (gameTitle && theme.emojis.coin) {
    // Pode adicionar emoji antes do título se necessário
  }

  // Emoji do botão de poder (se houver)
  const powerButton = document.getElementById("power-button");
  if (powerButton && theme.emojis.power) {
    // Pode adicionar emoji ao botão se necessário
  }
}

/**
 * Aplica os textos do tema
 * @param {Object} theme - Objeto do tema
 */
function applyThemeTexts(theme) {
  // Título do jogo (logo) - não precisa de texto pois agora é imagem
  // Mas podemos adicionar um título alternativo se necessário

  // Texto do botão de clique
  const clickButton = document.getElementById("click-button");
  if (clickButton && theme.texts.clickButton) {
    const textSpan = clickButton.querySelector("span:last-child");
    if (textSpan) {
      // Mantém o formato "( +X )" mas muda o texto principal
      const currentText = textSpan.textContent;
      const match = currentText.match(/\(.*\)/);
      if (match) {
        textSpan.textContent = `${theme.texts.clickButton} ${match[0]}`;
      } else {
        textSpan.textContent = theme.texts.clickButton;
      }
    }
  }

  // Texto do botão de poder
  const powerButton = document.getElementById("power-button");
  if (powerButton && theme.texts.powerButton) {
    // Só atualiza se não estiver em estado ativo/cooldown
    const isActive = powerButton.classList.contains("bg-green-500");
    const isCooldown = powerButton.classList.contains("bg-red-600");
    if (!isActive && !isCooldown) {
      powerButton.textContent = theme.texts.powerButton;
    }
  }

  // Texto do botão de customização (no menu)
  const customizeButton = document.getElementById("customize-button");
  if (customizeButton && theme.texts.customizeButton) {
    const textSpan = customizeButton.querySelector("span:last-child");
    if (textSpan) {
      textSpan.textContent = theme.texts.customizeButton;
    }
  }

  // Texto do botão de conquistas
  const achievementsButton = document.getElementById("achievements-button");
  if (achievementsButton && theme.texts.achievementsButton) {
    const textSpan = achievementsButton.querySelector("span:last-child");
    if (textSpan) {
      textSpan.textContent = theme.texts.achievementsButton;
    }
  }
}

/**
 * Atualiza a seleção visual do tema no modal
 * @param {string} themeId - ID do tema selecionado
 */
function updateThemeSelection(themeId) {
  document.querySelectorAll(".theme-option").forEach((option) => {
    if (option.dataset.theme === themeId) {
      option.classList.add("border-yellow-400", "ring-4", "ring-yellow-300");
      option.classList.remove("border-transparent");
    } else {
      option.classList.remove("border-yellow-400", "ring-4", "ring-yellow-300");
      option.classList.add("border-transparent");
    }
  });
}

/**
 * Obtém o tema atual
 * @returns {Object} Objeto do tema atual
 */
function getCurrentTheme() {
  return THEME_DEFINITIONS[currentWorld] || THEME_DEFINITIONS.green;
}

/**
 * Obtém todas as definições de temas
 * @returns {Object} Objeto com todas as definições de temas
 */
function getAllThemes() {
  return THEME_DEFINITIONS;
}

/**
 * Inicializa o sistema de mundos
 */
function initializeWorlds() {
  loadWorld();
  const world = getCurrentWorld();
  applyTheme(world.id);
}
