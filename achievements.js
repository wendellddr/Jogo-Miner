/**
 * achievements.js
 * Sistema de Conquistas do Jogo
 */

// --- Constantes ---
const ACHIEVEMENTS_STORAGE_KEY = "coinClickerAchievements";

// --- Estado das Conquistas ---
let achievementsState = {
  totalClicks: 0,
  totalCriticalHits: 0,
  totalUpgradesBought: 0,
  totalCoinsEver: 0,
  powerActivated: false,
  completedAchievements: {},
};

// --- Definições de Conquistas ---
const ACHIEVEMENTS_DEFINITIONS = [
  {
    id: "first_click",
    name: "Primeiro Clique",
    description: "Realize seu primeiro clique",
    icon: "👆",
    difficulty: "easy",
    target: 1,
    type: "clicks",
    bonus: 10,
  },
  {
    id: "hundred_clicks",
    name: "Cem Cliques",
    description: "Realize 100 cliques",
    icon: "✌️",
    difficulty: "easy",
    target: 100,
    type: "clicks",
    bonus: 50,
  },
  {
    id: "thousand_clicks",
    name: "Mil Cliques",
    description: "Realize 1000 cliques",
    icon: "🤘",
    difficulty: "medium",
    target: 1000,
    type: "clicks",
    bonus: 200,
  },
  {
    id: "ten_thousand_clicks",
    name: "Dez Mil Cliques",
    description: "Realize 10000 cliques",
    icon: "💪",
    difficulty: "hard",
    target: 10000,
    type: "clicks",
    bonus: 1000,
  },
  {
    id: "manual_strength_level_10",
    name: "Força Manual Nível 10",
    description: "Atinga nível 10 no upgrade Força Manual",
    icon: "✊",
    difficulty: "medium",
    target: 10,
    type: "upgrade_level",
    upgradeId: "forca_manual",
    bonus: 1000,
  },
  {
    id: "manual_strength_level_25",
    name: "Força Manual Nível 25",
    description: "Atinga nível 25 no upgrade Força Manual",
    icon: "✊",
    difficulty: "hard",
    target: 25,
    type: "upgrade_level",
    upgradeId: "forca_manual",
    bonus: 5000,
  },
  {
    id: "first_critical",
    name: "Crítico!",
    description: "Realize seu primeiro golpe crítico",
    icon: "✨",
    difficulty: "easy",
    target: 1,
    type: "critical_hits",
    bonus: 100,
  },
  {
    id: "master_crits",
    name: "Mestre dos Críticos",
    description: "Realize 100 golpes críticos",
    icon: "⚡",
    difficulty: "medium",
    target: 100,
    type: "critical_hits",
    bonus: 500,
  },
  {
    id: "thousand_coins",
    name: "Mil Moedas",
    description: "Acumule 1000 moedas",
    icon: "💲",
    difficulty: "easy",
    target: 1000,
    type: "coins",
    bonus: 200,
  },
  {
    id: "hundred_thousand_coins",
    name: "Cem Mil Moedas",
    description: "Acumule 100000 moedas",
    icon: "💎",
    difficulty: "medium",
    target: 100000,
    type: "coins",
    bonus: 2000,
  },
  {
    id: "first_upgrade",
    name: "Primeiro Upgrade",
    description: "Compre seu primeiro upgrade",
    icon: "⬆️",
    difficulty: "easy",
    target: 1,
    type: "upgrades_bought",
    bonus: 50,
  },
  {
    id: "collector",
    name: "Colecionador",
    description: "Compre 10 upgrades",
    icon: "📊",
    difficulty: "medium",
    target: 10,
    type: "upgrades_bought",
    bonus: 500,
  },
  {
    id: "specialist",
    name: "Especialista",
    description: "Compre 50 upgrades",
    icon: "🎯",
    difficulty: "hard",
    target: 50,
    type: "upgrades_bought",
    bonus: 5000,
  },
  {
    id: "power_activated",
    name: "Poder Ativado",
    description: "Ative o Hyper-Mineração pela primeira vez",
    icon: "🔥",
    difficulty: "easy",
    target: 1,
    type: "power_activated",
    bonus: 100,
  },
  {
    id: "coin_machine",
    name: "Máquina de Moedas",
    description: "Atinga 1000 moedas por segundo",
    icon: "⚙️",
    difficulty: "hard",
    target: 1000,
    type: "cps",
    bonus: 10000,
  },
];

// --- Funções de Persistência ---

/**
 * Salva o estado das conquistas no localStorage
 */
function saveAchievements() {
  try {
    localStorage.setItem(
      ACHIEVEMENTS_STORAGE_KEY,
      JSON.stringify(achievementsState)
    );
  } catch (e) {
    console.error("Erro ao salvar conquistas:", e);
  }
}

/**
 * Carrega o estado das conquistas do localStorage
 */
function loadAchievements() {
  try {
    const savedData = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
    if (savedData) {
      const loaded = JSON.parse(savedData);
      Object.assign(achievementsState, loaded);
    }
  } catch (e) {
    console.warn("Erro ao carregar conquistas:", e);
  }
}

// --- Funções de Rastreamento ---

/**
 * Registra um clique
 */
function trackClick() {
  achievementsState.totalClicks++;
  checkAchievements("clicks");
  saveAchievements();
}

/**
 * Registra um golpe crítico
 */
function trackCriticalHit() {
  achievementsState.totalCriticalHits++;
  checkAchievements("critical_hits");
  saveAchievements();
}

/**
 * Registra a compra de um upgrade
 */
function trackUpgradeBought() {
  achievementsState.totalUpgradesBought++;
  checkAchievements("upgrades_bought");
  checkUpgradeLevelAchievements();
  saveAchievements();
}

/**
 * Registra moedas acumuladas (atualiza o máximo já alcançado)
 */
function trackCoins(currentCoins) {
  if (currentCoins > achievementsState.totalCoinsEver) {
    achievementsState.totalCoinsEver = currentCoins;
    checkAchievements("coins");
    saveAchievements();
  }
}

/**
 * Registra a ativação do poder
 */
function trackPowerActivated() {
  if (!achievementsState.powerActivated) {
    achievementsState.powerActivated = true;
    checkAchievements("power_activated");
    saveAchievements();
  }
}

/**
 * Registra CPS (coins per second)
 */
function trackCPS(currentCPS) {
  checkAchievements("cps", currentCPS);
}

/**
 * Verifica conquistas de nível de upgrade específico
 */
function checkUpgradeLevelAchievements() {
  if (typeof getUpgradeLevel === "function") {
    const manualStrengthLevel = getUpgradeLevel("forca_manual");
    checkAchievements("upgrade_level", manualStrengthLevel);
  }
}

// --- Funções de Verificação ---

/**
 * Verifica se alguma conquista foi completada
 * @param {string} type - Tipo de conquista a verificar
 * @param {number} value - Valor atual (opcional, para tipos específicos)
 */
function checkAchievements(type, value = null) {
  ACHIEVEMENTS_DEFINITIONS.forEach((achievement) => {
    // Ignora se já foi completada
    if (achievementsState.completedAchievements[achievement.id]) {
      return;
    }

    // Verifica se o tipo corresponde
    if (achievement.type !== type) {
      return;
    }

    let currentProgress = 0;
    let target = achievement.target;

    switch (achievement.type) {
      case "clicks":
        currentProgress = achievementsState.totalClicks;
        break;
      case "critical_hits":
        currentProgress = achievementsState.totalCriticalHits;
        break;
      case "upgrades_bought":
        currentProgress = achievementsState.totalUpgradesBought;
        break;
      case "coins":
        currentProgress = achievementsState.totalCoinsEver;
        break;
      case "power_activated":
        currentProgress = achievementsState.powerActivated ? 1 : 0;
        break;
      case "cps":
        currentProgress = value !== null ? value : 0;
        break;
      case "upgrade_level":
        if (achievement.upgradeId && typeof getUpgradeLevel === "function") {
          currentProgress = getUpgradeLevel(achievement.upgradeId);
        } else {
          currentProgress = value !== null ? value : 0;
        }
        break;
    }

    // Verifica se completou
    if (currentProgress >= target) {
      completeAchievement(achievement);
    }
  });
}

/**
 * Completa uma conquista e aplica o bônus
 * @param {Object} achievement - Definição da conquista
 */
function completeAchievement(achievement) {
  if (achievementsState.completedAchievements[achievement.id]) {
    return; // Já foi completada
  }

  achievementsState.completedAchievements[achievement.id] = true;

  // Aplica bônus de moedas se houver gameState
  if (typeof gameState !== "undefined" && achievement.bonus) {
    gameState.coins += achievement.bonus;
    if (typeof showMessage === "function") {
      showMessage(
        `🏆 Conquista Desbloqueada: ${achievement.name}! Bônus: +${achievement.bonus} moedas!`,
        false
      );
    }
  }

  saveAchievements();
  renderAchievements(); // Atualiza a UI
}

// --- Funções de UI ---

/**
 * Retorna o progresso atual de uma conquista
 * @param {Object} achievement - Definição da conquista
 * @returns {number} Progresso atual (0-1)
 */
function getAchievementProgress(achievement) {
  let currentProgress = 0;

  switch (achievement.type) {
    case "clicks":
      currentProgress = achievementsState.totalClicks;
      break;
    case "critical_hits":
      currentProgress = achievementsState.totalCriticalHits;
      break;
    case "upgrades_bought":
      currentProgress = achievementsState.totalUpgradesBought;
      break;
    case "coins":
      currentProgress = achievementsState.totalCoinsEver;
      break;
    case "power_activated":
      currentProgress = achievementsState.powerActivated ? 1 : 0;
      break;
    case "cps":
      if (typeof gameState !== "undefined") {
        currentProgress = gameState.coinsPerSecond || 0;
      }
      break;
    case "upgrade_level":
      if (achievement.upgradeId && typeof getUpgradeLevel === "function") {
        currentProgress = getUpgradeLevel(achievement.upgradeId);
      }
      break;
  }

  return Math.min(currentProgress / achievement.target, 1);
}

/**
 * Retorna o valor atual formatado de uma conquista
 * @param {Object} achievement - Definição da conquista
 * @returns {string} Valor formatado
 */
function getAchievementCurrentValue(achievement) {
  let currentProgress = 0;

  switch (achievement.type) {
    case "clicks":
      currentProgress = achievementsState.totalClicks;
      break;
    case "critical_hits":
      currentProgress = achievementsState.totalCriticalHits;
      break;
    case "upgrades_bought":
      currentProgress = achievementsState.totalUpgradesBought;
      break;
    case "coins":
      currentProgress = achievementsState.totalCoinsEver;
      break;
    case "power_activated":
      currentProgress = achievementsState.powerActivated ? 1 : 0;
      break;
    case "cps":
      if (typeof gameState !== "undefined") {
        currentProgress = gameState.coinsPerSecond || 0;
      }
      break;
    case "upgrade_level":
      if (achievement.upgradeId && typeof getUpgradeLevel === "function") {
        currentProgress = getUpgradeLevel(achievement.upgradeId);
      }
      break;
  }

  if (typeof formatNumber === "function") {
    return formatNumber(currentProgress);
  }
  return currentProgress.toLocaleString("pt-BR");
}

/**
 * Retorna o valor alvo formatado de uma conquista
 * @param {Object} achievement - Definição da conquista
 * @returns {string} Valor formatado
 */
function getAchievementTargetValue(achievement) {
  if (typeof formatNumber === "function") {
    return formatNumber(achievement.target);
  }
  return achievement.target.toLocaleString("pt-BR");
}

/**
 * Retorna a classe CSS da dificuldade
 * @param {string} difficulty - Nível de dificuldade
 * @returns {string} Classe CSS
 */
function getDifficultyClass(difficulty) {
  switch (difficulty) {
    case "easy":
      return "text-green-400";
    case "medium":
      return "text-orange-400";
    case "hard":
      return "text-red-400";
    default:
      return "text-gray-400";
  }
}

/**
 * Retorna o texto da dificuldade
 * @param {string} difficulty - Nível de dificuldade
 * @returns {string} Texto em português
 */
function getDifficultyText(difficulty) {
  switch (difficulty) {
    case "easy":
      return "Fácil";
    case "medium":
      return "Médio";
    case "hard":
      return "Difícil";
    default:
      return "Desconhecido";
  }
}

/**
 * Renderiza o modal de conquistas
 */
function renderAchievements() {
  const container = document.getElementById("achievements-container");
  if (!container) {
    return;
  }

  container.innerHTML = "";

  ACHIEVEMENTS_DEFINITIONS.forEach((achievement) => {
    const isCompleted =
      achievementsState.completedAchievements[achievement.id] || false;
    const progress = getAchievementProgress(achievement);
    const currentValue = getAchievementCurrentValue(achievement);
    const targetValue = getAchievementTargetValue(achievement);
    const progressPercent = Math.min(progress * 100, 100);

    const card = document.createElement("div");
    card.className = `achievement-card p-3 rounded-lg transition duration-200 ${
      isCompleted
        ? "bg-yellow-500/20 border-2 border-yellow-400"
        : "bg-gray-700/50 border border-gray-600"
    }`;

    card.innerHTML = `
      <div class="flex items-start justify-between mb-1">
        <div class="flex items-center space-x-2 flex-1 min-w-0">
          <span class="text-2xl flex-shrink-0">${achievement.icon}</span>
          <div class="min-w-0 flex-1">
            <h3 class="text-sm font-bold text-white flex items-center space-x-1 truncate">
              <span class="truncate">${achievement.name}</span>
              ${
                isCompleted
                  ? '<span class="text-green-400 text-base flex-shrink-0">✓</span>'
                  : ""
              }
            </h3>
          </div>
        </div>
        <span class="text-xs font-semibold ${getDifficultyClass(
          achievement.difficulty
        )} flex-shrink-0 ml-1">
          ${getDifficultyText(achievement.difficulty)}
        </span>
      </div>
      <p class="text-xs text-gray-300 mb-2 line-clamp-2">${
        achievement.description
      }</p>
      <div class="mb-1">
        <div class="w-full bg-gray-700 rounded-full h-1.5">
          <div
            class="bg-yellow-400 h-1.5 rounded-full transition-all duration-300"
            style="width: ${progressPercent}%"
          ></div>
        </div>
        <p class="text-xs text-gray-400 mt-0.5">
          ${currentValue} / ${targetValue}
        </p>
      </div>
      ${
        isCompleted
          ? `<div class="mt-1 pt-1 border-t border-yellow-400/30">
               <p class="text-xs text-yellow-300 font-semibold">
                 Bônus: +${achievement.bonus} moedas
               </p>
             </div>`
          : ""
      }
    `;

    container.appendChild(card);
  });
}

/**
 * Inicializa o sistema de conquistas
 */
function initializeAchievements() {
  loadAchievements();
  renderAchievements();

  // Verifica todas as conquistas periodicamente
  setInterval(() => {
    if (typeof gameState !== "undefined") {
      trackCoins(gameState.coins);
      trackCPS(gameState.coinsPerSecond);
      checkUpgradeLevelAchievements();
    }
  }, 1000);
}
