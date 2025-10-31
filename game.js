/**
 * game.js
 * Código Principal do Jogo - Minerador de Moedas
 */

// --- Constantes ---
const STORAGE_KEY = "coinClickerSave";
const CUSTOMIZE_STORAGE_KEY = "coinClickerCustomize";

// --- Variáveis do Jogo ---
let gameState = {
  coins: 0,
  coinsPerClick: 1,
  coinsPerSecond: 0,
  upgradeLevels: {},

  // Dinâmica de Crítico
  criticalChance: 0.05,
  criticalMultiplier: 10,

  // Dinâmica de Poder (Power)
  powerActive: false,
  powerMultiplier: 5,
  powerDuration: 30,
  powerCooldown: 60,
  powerStartTime: 0,
  lastPowerUse: 0,
};

// --- Variáveis de Customização ---
let customizationState = {
  theme: "default",
};

// --- Definições de Temas ---
const THEME_DEFINITIONS = {
  default: {
    primary: "#FFC300",
    secondary: "#FF5733",
    darkBg: "#1a1a2e",
    darkCard: "#2c2c54",
    name: "Padrão",
  },
  neon: {
    primary: "#FF0080",
    secondary: "#00FFFF",
    darkBg: "#0a0a1a",
    darkCard: "#1a0a2e",
    name: "Neon",
  },
  green: {
    primary: "#10B981",
    secondary: "#34D399",
    darkBg: "#0a1a0e",
    darkCard: "#1a2e1a",
    name: "Natureza",
  },
  blue: {
    primary: "#3B82F6",
    secondary: "#60A5FA",
    darkBg: "#0a0a1a",
    darkCard: "#1a1a2e",
    name: "Oceano",
  },
  pink: {
    primary: "#EC4899",
    secondary: "#F472B6",
    darkBg: "#1a0a14",
    darkCard: "#2e1a24",
    name: "Rosa",
  },
  purple: {
    primary: "#8B5CF6",
    secondary: "#A78BFA",
    darkBg: "#0f0a1a",
    darkCard: "#1a0a2e",
    name: "Mágico",
  },
  red: {
    primary: "#EF4444",
    secondary: "#F87171",
    darkBg: "#1a0a0a",
    darkCard: "#2e1a1a",
    name: "Fogo",
  },
  dark: {
    primary: "#9CA3AF",
    secondary: "#D1D5DB",
    darkBg: "#000000",
    darkCard: "#111827",
    name: "Escuro",
  },
  cyberpunk: {
    primary: "#00F5FF",
    secondary: "#FF00F5",
    darkBg: "#050014",
    darkCard: "#0a0028",
    name: "Cyberpunk",
  },
};

// Lista de UPGRADES ATIVOS (Inicialmente desbloqueados)
// OBSERVAÇÃO: 'reforco_algoritmo' tem um PRÉ-REQUISITO de nível.
let UPGRADE_DEFINITIONS = [
  // Upgrade de Click inicial
  {
    id: "forca_manual",
    name: "Força Manual",
    description: "Aumenta a força muscular para cliques mais eficazes.",
    icon: "✊",
    baseCost: 10,
    costMultiplier: 1.15,
    baseGain: 0.05,
    type: "click",
  },

  // Upgrade com Pré-Requisito (Não pode ser comprado antes do Nível 5 de Força Manual)
  {
    id: "reforco_algoritmo",
    name: "Reforço de Algoritmo",
    description: "Otimiza a taxa de crítico e eficiência de mineração.",
    icon: "💎",
    baseCost: 500,
    costMultiplier: 1.2,
    baseGain: 0.5,
    type: "click",
    prerequisite: { id: "forca_manual", level: 5 },
  },

  // Upgrade de Click original
  {
    id: "dedo_titanio",
    name: "Dedo de Titânio",
    description: "Melhora o ganho base por clique.",
    icon: "💪",
    baseCost: 15,
    costMultiplier: 1.15,
    baseGain: 0.1,
    type: "click",
  },

  // Upgrades de Auto-Ganhos
  {
    id: "rato_automatico",
    name: "Rato Automático",
    description: "Um assistente que clica por você.",
    icon: "🖱️",
    baseCost: 100,
    costMultiplier: 1.15,
    baseGain: 1,
    type: "auto",
  },
  {
    id: "minerador_junior",
    name: "Minerador Junior",
    description: "Um minerador em treinamento.",
    icon: "⛏️",
    baseCost: 1000,
    costMultiplier: 1.14,
    baseGain: 10,
    type: "auto",
  },
  {
    id: "fazenda_clones",
    name: "Fazenda de Clones",
    description: "Clones minerando 24/7.",
    icon: "🤖",
    baseCost: 12000,
    costMultiplier: 1.13,
    baseGain: 80,
    type: "auto",
  },
  {
    id: "maquina_ouro",
    name: "Máquina de Ouro",
    description: "Criação de moedas em escala industrial.",
    icon: "🏭",
    baseCost: 150000,
    costMultiplier: 1.12,
    baseGain: 500,
    type: "auto",
  },
];

// Lista de UPGRADES BLOQUEADOS (Desbloqueio por CPS)
let LOCKED_UPGRADES = [
  {
    id: "satelite_energia",
    name: "Satelite de Energia",
    description: "Otimiza a rede de mineração global.",
    icon: "🛰️",
    baseCost: 1000000,
    costMultiplier: 1.11,
    baseGain: 3000,
    type: "auto",
    unlockCPS: 1000,
  },
  {
    id: "fusao_quantica",
    name: "Fusão Quântica",
    description: "Geração de moedas através de buracos de minhoca.",
    icon: "🌌",
    baseCost: 5000000,
    costMultiplier: 1.1,
    baseGain: 15000,
    type: "auto",
    unlockCPS: 5000,
  },
  {
    id: "portal_temporal",
    name: "Portal Temporal",
    description: "Traz moedas de futuras linhas do tempo.",
    icon: "🌀",
    baseCost: 100000000,
    costMultiplier: 1.09,
    baseGain: 100000,
    type: "auto",
    unlockCPS: 50000,
  },
  {
    id: "universo_paralelo",
    name: "Universo Paralelo",
    description: "Acesso a moedas em dimensões alternativas.",
    icon: "🪐",
    baseCost: 1000000000,
    costMultiplier: 1.08,
    baseGain: 1000000,
    type: "auto",
    unlockCPS: 500000,
  },
];

// Intervalo do jogo (para ganhos automáticos e salvamento)
let gameInterval = null;
let saveInterval = null;
let lastUpdateTime = Date.now();

// --- Funções de Persistência (localStorage) ---

function saveGame() {
  try {
    const now = Date.now();
    // Prepara o objeto para salvar, excluindo propriedades calculadas
    const saveObject = {
      coins: gameState.coins,
      upgradeLevels: gameState.upgradeLevels,
      criticalChance: gameState.criticalChance,
      criticalMultiplier: gameState.criticalMultiplier,
      powerActive: gameState.powerActive,
      powerStartTime: gameState.powerStartTime,
      lastPowerUse: gameState.lastPowerUse,
      // Adiciona o tempo da última salvamento para calcular ganhos offline
      lastSaveTime: now,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveObject));
    console.log("Jogo salvo com sucesso.");
  } catch (e) {
    console.error("Erro ao salvar o jogo:", e);
  }
}

function saveCustomization() {
  try {
    localStorage.setItem(
      CUSTOMIZE_STORAGE_KEY,
      JSON.stringify(customizationState)
    );
    console.log("Customização salva com sucesso.");
  } catch (e) {
    console.error("Erro ao salvar customização:", e);
  }
}

function loadCustomization() {
  try {
    const savedData = localStorage.getItem(CUSTOMIZE_STORAGE_KEY);
    if (savedData) {
      customizationState = JSON.parse(savedData);
      applyTheme(customizationState.theme);
    }
  } catch (e) {
    console.warn("Erro ao carregar customização:", e);
  }
}

function loadGame() {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const saveObject = JSON.parse(savedData);

      // Sobrescreve gameState com os dados salvos
      Object.assign(gameState, saveObject);

      // Re-calcula CPS e CPC com os níveis carregados
      gameState.coinsPerSecond = calculateTotalCPS();
      gameState.coinsPerClick = calculateTotalCPC();

      // Calcula ganhos offline
      if (saveObject.lastSaveTime) {
        const offlineDurationSeconds =
          (Date.now() - saveObject.lastSaveTime) / 1000;
        const offlineGain =
          gameState.coinsPerSecond * offlineDurationSeconds;

        if (offlineGain > 0) {
          gameState.coins += offlineGain;
          showMessage(
            `Bem-vindo de volta! Ganhos offline: ${formatNumber(
              offlineGain
            )} moedas.`,
            false
          );
        }
      }

      console.log("Jogo carregado com sucesso.", gameState);
      return true;
    }
  } catch (e) {
    console.warn("Nenhum dado salvo encontrado ou erro ao carregar:", e);
  }
  return false;
}

// --- Funções Auxiliares de UI ---

function formatNumber(num) {
  // Formata o número para exibição, incluindo abreviações para números grandes.
  const absNum = Math.abs(num);
  if (absNum >= 1000000000) return (num / 1000000000).toFixed(2) + " B";
  if (absNum >= 1000000) return (num / 1000000).toFixed(2) + " M";
  if (absNum >= 1000) return (num / 1000).toFixed(2) + " K";
  return parseFloat(num.toFixed(2)).toLocaleString("pt-BR");
}

function showMessage(text, isError = false) {
  const container = document.getElementById("message-container");
  const messageElement = document.createElement("div");
  messageElement.className = `p-3 rounded-lg shadow-xl mb-2 ${
    isError ? "bg-secondary" : "bg-green-500"
  } text-white font-bold transition-all duration-300 opacity-0 transform translate-y-[-10px]`;
  messageElement.textContent = text;
  container.appendChild(messageElement);

  // Animação de entrada
  setTimeout(() => {
    messageElement.style.opacity = "1";
    messageElement.style.transform = "translateY(0)";
  }, 10);

  // Animação de saída e remoção
  setTimeout(() => {
    messageElement.style.opacity = "0";
    messageElement.style.transform = "translateY(-10px)";
    messageElement.addEventListener("transitionend", () =>
      messageElement.remove()
    );
  }, 3000);
}

// Função para criar o texto flutuante de moedas
function createFloatingCoin(amount, targetElement, isCritical = false) {
  const coin = document.createElement("div");
  coin.textContent = isCritical
    ? `💥 CRÍTICO! +${formatNumber(amount)}`
    : `+${formatNumber(amount)}`;

  const colorClasses = isCritical
    ? ["text-secondary", "text-5xl"]
    : ["text-primary", "text-2xl"];

  coin.classList.add(
    "floating-coin",
    "font-extrabold",
    "z-20",
    ...colorClasses
  );

  const rect = targetElement.getBoundingClientRect();

  coin.style.left = `${rect.left + rect.width / 2}px`;
  coin.style.top = `${rect.top}px`;

  document.body.appendChild(coin);

  setTimeout(() => {
    coin.remove();
  }, 1000);
}

function updateUI() {
  // Atualiza Moedas
  document.getElementById("coins-display").textContent = formatNumber(
    gameState.coins
  );

  // Calcula o CPS real (com power) para o display
  let displayCPS = gameState.coinsPerSecond;
  if (gameState.powerActive) {
    displayCPS *= gameState.powerMultiplier;
  }
  let cpsText = `${formatNumber(displayCPS)} Moedas/Segundo`;
  if (gameState.powerActive) {
    cpsText = `<span class="text-green-400">${cpsText} (x${gameState.powerMultiplier} POWER)</span>`;
  }
  document.getElementById("cps-display").innerHTML = cpsText;

  // Calcula o CPC real (com power) para o display
  let currentCPC = gameState.coinsPerClick;
  if (gameState.powerActive) {
    currentCPC *= gameState.powerMultiplier;
  }
  document.getElementById(
    "click-rate-display"
  ).textContent = `Moedas/Clique: ${formatNumber(currentCPC)}`;
  document
    .getElementById("click-button")
    .querySelector(
      "span:last-child"
    ).textContent = `Minerar ( +${formatNumber(currentCPC)} )`;

  // Atualiza Status de Crítico (Crit Chance)
  document.getElementById(
    "crit-display"
  ).textContent = `Chance de Crítico: ${
    gameState.criticalChance * 100
  }% (x${gameState.criticalMultiplier})`;

  // Atualiza Status de Power
  const powerButton = document.getElementById("power-button");
  const powerTimer = document.getElementById("power-timer");
  const now = Date.now();

  // Lógica de Ativo, Cooldown ou Disponível
  if (gameState.powerActive) {
    const elapsed = (now - gameState.powerStartTime) / 1000;
    const remaining = Math.ceil(gameState.powerDuration - elapsed);
    powerTimer.textContent = `Poder Ativo: ${remaining}s restantes! (Ganhos x${gameState.powerMultiplier})`;
    powerButton.textContent = "MODO HIPER-MINERAÇÃO ATIVO";
    powerButton.classList.remove(
      "bg-indigo-600",
      "hover:bg-indigo-700",
      "bg-red-600",
      "cursor-not-allowed"
    );
    powerButton.classList.add("bg-green-500", "animate-pulse");
    powerButton.disabled = true;
  } else if (
    now - gameState.lastPowerUse <
    gameState.powerCooldown * 1000
  ) {
    const cooldownRemaining = Math.ceil(
      (gameState.powerCooldown * 1000 - (now - gameState.lastPowerUse)) /
        1000
    );
    powerTimer.textContent = `Cooldown: ${cooldownRemaining}s`;
    powerButton.textContent = "Em Cooldown...";
    powerButton.classList.remove(
      "bg-indigo-600",
      "hover:bg-indigo-700",
      "bg-green-500",
      "animate-pulse"
    );
    powerButton.classList.add("bg-red-600", "cursor-not-allowed");
    powerButton.disabled = true;
  } else {
    powerTimer.textContent = `Cooldown: ${gameState.powerCooldown}s`;
    powerButton.textContent = "Ativar Hyper-Mineração";
    powerButton.classList.remove(
      "bg-red-600",
      "cursor-not-allowed",
      "bg-green-500",
      "animate-pulse"
    );
    powerButton.classList.add("bg-indigo-600", "hover:bg-indigo-700");
    powerButton.disabled = false;
  }

  // Atualiza Upgrades
  UPGRADE_DEFINITIONS.forEach((upgrade) => {
    const level = getUpgradeLevel(upgrade.id);
    const nextCost = calculateCost(upgrade.id);
    const canAfford = gameState.coins >= nextCost;

    // CHECAGEM DE PRÉ-REQUISITO
    let isPrereqMet = true;
    let prereqMessage = "";
    if (upgrade.prerequisite) {
      const requiredLevel = upgrade.prerequisite.level;
      const currentLevel = getUpgradeLevel(upgrade.prerequisite.id);
      if (currentLevel < requiredLevel) {
        isPrereqMet = false;
        const prereqUpgrade = getUpgradeDefinition(
          upgrade.prerequisite.id
        );
        prereqMessage = `Nível ${requiredLevel} de ${prereqUpgrade.name} necessário.`;
      }
    }
    const canBuy = canAfford && isPrereqMet;

    const card = document.getElementById(`upgrade-card-${upgrade.id}`);
    const buyButton = document.getElementById(`buy-btn-${upgrade.id}`);

    if (!card || !buyButton) return;

    // Atualiza Custo e Nível
    document.getElementById(`cost-${upgrade.id}`).textContent =
      formatNumber(nextCost);
    document.getElementById(`count-${upgrade.id}`).textContent = level;

    // Atualiza Estado Visual (CSS classes e disabled state)
    const cardBaseClasses =
      "flex items-center justify-between p-4 rounded-xl transition duration-200";

    // Atualiza o display de pré-requisito
    const prereqDisplay = document.getElementById(
      `prereq-msg-${upgrade.id}`
    );

    if (!canBuy) {
      // Bloqueado por custo OU pré-requisito
      card.className = `${cardBaseClasses} locked-card bg-gray-700/50`;
      buyButton.className =
        "py-2 px-4 rounded-full font-bold text-sm transition duration-150 shadow-md bg-gray-500 cursor-not-allowed text-gray-300";
      buyButton.disabled = true;

      if (!isPrereqMet && prereqDisplay) {
        prereqDisplay.textContent = prereqMessage;
        prereqDisplay.classList.remove("hidden");
      } else if (prereqDisplay) {
        prereqDisplay.classList.add("hidden"); // Esconde se for só falta de dinheiro
      }
    } else {
      // Pode Comprar (tem dinheiro E atendeu pré-requisito)
      card.className = `${cardBaseClasses} afford-glow bg-dark-bg hover:bg-dark-card/70`;
      buyButton.className =
        "py-2 px-4 rounded-full font-bold text-sm transition duration-150 shadow-md bg-green-500 hover:bg-green-600 text-white";
      buyButton.disabled = false;
      if (prereqDisplay) prereqDisplay.classList.add("hidden");
    }
  });
}

// --- Lógica de Ganhos e Cálculos (Infinitos) ---

function getUpgradeLevel(upgradeId) {
  return gameState.upgradeLevels[upgradeId] || 0;
}

function getUpgradeDefinition(upgradeId) {
  // Busca nas duas listas (ativo e bloqueado)
  return (
    UPGRADE_DEFINITIONS.find((u) => u.id === upgradeId) ||
    LOCKED_UPGRADES.find((u) => u.id === upgradeId)
  );
}

function calculateCost(upgradeId) {
  const upgrade = getUpgradeDefinition(upgradeId);
  const level = getUpgradeLevel(upgradeId);
  if (!upgrade) return Infinity;
  return upgrade.baseCost * Math.pow(upgrade.costMultiplier, level);
}

function calculateTotalCPS() {
  let totalCPS = 0;
  // Itera SOMENTE sobre a lista de upgrades ATIVOS
  UPGRADE_DEFINITIONS.forEach((upgrade) => {
    if (upgrade.type === "auto") {
      const level = getUpgradeLevel(upgrade.id);
      totalCPS += upgrade.baseGain * level;
    }
  });
  return totalCPS;
}

function calculateTotalCPC() {
  let totalCPC = 1; // Base inicial de 1
  // Itera SOMENTE sobre a lista de upgrades ATIVOS
  UPGRADE_DEFINITIONS.forEach((upgrade) => {
    if (upgrade.type === "click") {
      const level = getUpgradeLevel(upgrade.id);
      // O ganho de CPC é aditivo
      totalCPC += upgrade.baseGain * level;
    }
  });
  return totalCPC;
}

// --- Funções de Áudio ---

let audioContext = null;

/**
 * Inicializa o contexto de áudio (necessário para alguns navegadores)
 */
function initAudioContext() {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
    } catch (error) {
      console.warn("Erro ao inicializar contexto de áudio:", error);
    }
  }
  // Resolve o contexto se estiver suspenso (alguns navegadores requerem interação do usuário)
  if (audioContext && audioContext.state === "suspended") {
    audioContext.resume();
  }
}

/**
 * Gera um som de picareta batendo na pedra usando Web Audio API
 */
function playMiningSound() {
  try {
    initAudioContext();

    if (!audioContext) {
      return;
    }

    const now = audioContext.currentTime;

    // Cria um buffer de ruído para simular o impacto na pedra
    const bufferSize = audioContext.sampleRate * 0.1;
    const buffer = audioContext.createBuffer(
      1,
      bufferSize,
      audioContext.sampleRate
    );
    const output = buffer.getChannelData(0);

    // Gera ruído branco para o impacto
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    // Cria um oscilador grave para o "thud" do impacto
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(120, now);
    oscillator.frequency.exponentialRampToValueAtTime(60, now + 0.08);

    gainNode.gain.setValueAtTime(0.25, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.08);

    // Adiciona ruído filtrado para simular o impacto na pedra
    const noiseSource = audioContext.createBufferSource();
    const noiseGain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();

    noiseSource.buffer = buffer;
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.exponentialRampToValueAtTime(100, now + 0.1);

    noiseGain.gain.setValueAtTime(0.15, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    noiseSource.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(audioContext.destination);

    noiseSource.start(now);
    noiseSource.stop(now + 0.1);

    // Adiciona um som metálico curto para o impacto da picareta
    const metalOsc = audioContext.createOscillator();
    const metalGain = audioContext.createGain();

    metalOsc.type = "square";
    metalOsc.frequency.setValueAtTime(350, now);
    metalOsc.frequency.exponentialRampToValueAtTime(200, now + 0.05);

    metalGain.gain.setValueAtTime(0.1, now);
    metalGain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    metalOsc.connect(metalGain);
    metalGain.connect(audioContext.destination);

    metalOsc.start(now);
    metalOsc.stop(now + 0.05);
  } catch (error) {
    console.warn("Erro ao reproduzir som:", error);
  }
}

/**
 * Gera um som de moeda para cliques críticos
 */
function playCoinSound() {
  try {
    initAudioContext();

    if (!audioContext) {
      return;
    }

    const now = audioContext.currentTime;

    // Cria múltiplos tons para simular o "ping" de moedas caindo
    const frequencies = [800, 1000, 1200];

    frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(freq, now + index * 0.02);
      oscillator.frequency.exponentialRampToValueAtTime(
        freq * 1.5,
        now + index * 0.02 + 0.15
      );

      gainNode.gain.setValueAtTime(0.2, now + index * 0.02);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        now + index * 0.02 + 0.15
      );

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start(now + index * 0.02);
      oscillator.stop(now + index * 0.02 + 0.15);
    });

    // Adiciona um som de "clink" metálico mais agudo
    const clinkOsc = audioContext.createOscillator();
    const clinkGain = audioContext.createGain();

    clinkOsc.type = "triangle";
    clinkOsc.frequency.setValueAtTime(1500, now);
    clinkOsc.frequency.exponentialRampToValueAtTime(2000, now + 0.1);

    clinkGain.gain.setValueAtTime(0.15, now);
    clinkGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    clinkOsc.connect(clinkGain);
    clinkGain.connect(audioContext.destination);

    clinkOsc.start(now);
    clinkOsc.stop(now + 0.1);
  } catch (error) {
    console.warn("Erro ao reproduzir som de moeda:", error);
  }
}

/**
 * Gera um som de upgrade/level up satisfatório
 */
function playUpgradeSound() {
  try {
    initAudioContext();

    if (!audioContext) {
      return;
    }

    const now = audioContext.currentTime;

    // Cria uma progressão ascendente de notas (arpejo)
    const notes = [523.25, 659.25, 783.99]; // Dó, Mi, Sol (acorde maior)

    notes.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(freq, now + index * 0.08);

      gainNode.gain.setValueAtTime(0.25, now + index * 0.08);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        now + index * 0.08 + 0.3
      );

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start(now + index * 0.08);
      oscillator.stop(now + index * 0.08 + 0.3);
    });

    // Adiciona um "whoosh" suave no final
    const whooshOsc = audioContext.createOscillator();
    const whooshGain = audioContext.createGain();
    const whooshFilter = audioContext.createBiquadFilter();

    whooshOsc.type = "sawtooth";
    whooshOsc.frequency.setValueAtTime(600, now + 0.2);
    whooshOsc.frequency.exponentialRampToValueAtTime(1200, now + 0.4);

    whooshFilter.type = "lowpass";
    whooshFilter.frequency.setValueAtTime(2000, now + 0.2);
    whooshFilter.frequency.exponentialRampToValueAtTime(4000, now + 0.4);

    whooshGain.gain.setValueAtTime(0.15, now + 0.2);
    whooshGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    whooshOsc.connect(whooshFilter);
    whooshFilter.connect(whooshGain);
    whooshGain.connect(audioContext.destination);

    whooshOsc.start(now + 0.2);
    whooshOsc.stop(now + 0.4);
  } catch (error) {
    console.warn("Erro ao reproduzir som de upgrade:", error);
  }
}

// --- Lógica do Jogo ---

function clickCoin() {
  gameState.coinsPerClick = calculateTotalCPC();

  let earnedAmount = gameState.coinsPerClick;
  let isCritical = false;

  if (gameState.powerActive) {
    earnedAmount *= gameState.powerMultiplier;
  }

  if (Math.random() < gameState.criticalChance) {
    earnedAmount *= gameState.criticalMultiplier;
    isCritical = true;
  }

  gameState.coins += earnedAmount;

  const clickButton = document.getElementById("click-button");

  // Toca o som de picareta
  playMiningSound();

  // Se for crítico, toca o som de moeda também
  if (isCritical) {
    setTimeout(() => {
      playCoinSound();
    }, 50); // Pequeno delay para o som de moeda vir depois do impacto
  }

  createFloatingCoin(earnedAmount, clickButton, isCritical);

  clickButton.classList.add("animate-pulse");
  setTimeout(() => clickButton.classList.remove("animate-pulse"), 100);

  updateUI();
}

function activatePower() {
  const now = Date.now();
  const cooldownTime = gameState.powerCooldown * 1000;

  if (now - gameState.lastPowerUse >= cooldownTime) {
    gameState.powerActive = true;
    gameState.powerStartTime = now;
    gameState.lastPowerUse = now;

    showMessage(
      `MODO HIPER-MINERAÇÃO ATIVADO! Ganhos x${gameState.powerMultiplier}.`,
      false
    );

    setTimeout(() => {
      gameState.powerActive = false;
      showMessage("MODO HIPER-MINERAÇÃO DESATIVADO.", true);
      updateUI();
    }, gameState.powerDuration * 1000);

    updateUI();
    saveGame(); // Salva ao usar o poder
  } else {
    const remainingTime = Math.ceil(
      (cooldownTime - (now - gameState.lastPowerUse)) / 1000
    );
    showMessage(
      `O Poder está em cooldown. Faltam ${remainingTime}s.`,
      true
    );
  }
}

function buyUpgrade(upgradeId) {
  const cost = calculateCost(upgradeId);
  const upgrade = getUpgradeDefinition(upgradeId);

  // CHECAGEM DE PRÉ-REQUISITO
  if (upgrade.prerequisite) {
    const requiredLevel = upgrade.prerequisite.level;
    const currentLevel = getUpgradeLevel(upgrade.prerequisite.id);
    if (currentLevel < requiredLevel) {
      const prereqUpgrade = getUpgradeDefinition(upgrade.prerequisite.id);
      showMessage(
        `Você precisa do upgrade '${prereqUpgrade.name}' no Nível ${requiredLevel} para comprar isso.`,
        true
      );
      return; // Bloqueia a compra
    }
  }

  if (gameState.coins >= cost) {
    gameState.coins -= cost;

    gameState.upgradeLevels[upgradeId] = getUpgradeLevel(upgradeId) + 1;

    // Recalcula todos os stats
    gameState.coinsPerSecond = calculateTotalCPS();
    gameState.coinsPerClick = calculateTotalCPC();

    const nextLevel = getUpgradeLevel(upgradeId) + 1;
    showMessage(
      `Você comprou ${upgrade.name}! Próximo: Nível ${nextLevel}`,
      false
    );

    // Toca o som de upgrade
    playUpgradeSound();

    updateUI();
    saveGame(); // Salva ao comprar
  } else {
    showMessage(
      `Você não tem moedas suficientes para comprar ${
        upgrade.name
      }. Precisa de ${formatNumber(cost)} moedas.`,
      true
    );
  }
}

function handleUpgradeClick(event) {
  const button = event.target.closest("[data-upgrade-id]");

  if (button) {
    if (button.disabled) {
      // Se estiver desabilitado, pode ser por falta de dinheiro ou pré-requisito (o buyUpgrade vai informar)
      const upgradeId = button.dataset.upgradeId;
      if (upgradeId) {
        buyUpgrade(upgradeId); // Tenta comprar para mostrar a mensagem de erro
      }
      return;
    }

    const upgradeId = button.dataset.upgradeId;

    if (upgradeId) {
      buyUpgrade(upgradeId);
    }
  }
}

// Função que verifica se novos upgrades foram desbloqueados
function checkNewUpgrades() {
  const currentCPS = gameState.coinsPerSecond;
  let unlocked = false;

  for (let i = LOCKED_UPGRADES.length - 1; i >= 0; i--) {
    const upgrade = LOCKED_UPGRADES[i];
    if (currentCPS >= upgrade.unlockCPS) {
      // Remove da lista de bloqueados
      LOCKED_UPGRADES.splice(i, 1);
      // Adiciona à lista de ativos
      UPGRADE_DEFINITIONS.push(upgrade);

      showMessage(
        `🚀 NOVO UPGRADE DESBLOQUEADO: ${upgrade.name}!`,
        false
      );
      unlocked = true;
    }
  }

  // Se houve qualquer desbloqueio, precisamos re-renderizar as listas
  if (unlocked) {
    // Re-renderiza APENAS o card do novo upgrade
    renderUpgradesInitial(true);
  }
}

function gameLoop() {
  const now = Date.now();
  const deltaTime = (now - lastUpdateTime) / 1000;

  // Recalcula CPS e CPC (sempre bom recalcular no loop)
  gameState.coinsPerSecond = calculateTotalCPS();
  gameState.coinsPerClick = calculateTotalCPC();

  let currentCPS = gameState.coinsPerSecond;

  if (gameState.powerActive) {
    currentCPS *= gameState.powerMultiplier;
  }

  if (currentCPS > 0 && deltaTime > 0) {
    gameState.coins += currentCPS * deltaTime;
  }

  lastUpdateTime = now;

  // Checa novos unlocks a cada ciclo
  checkNewUpgrades();

  updateUI();
}

// --- Renderização Inicial dos Upgrades ---

function renderUpgradeCard(upgrade, container, isLocked = false) {
  // Cria o card DOM
  const card = document.createElement("div");
  card.id = `upgrade-card-${upgrade.id}`;
  const level = getUpgradeLevel(upgrade.id);
  const gainTextType = upgrade.type === "click" ? "CPC" : "MPS";

  if (isLocked) {
    // Renderização para item BLOQUEADO (Dica)
    card.className =
      "locked-card p-4 rounded-xl transition duration-200 bg-gray-800/50 flex items-center space-x-4";
    card.innerHTML = `
            <span class="text-4xl text-gray-500">🔒</span>
            <div>
                <p class="text-xl font-semibold text-gray-400">Upgrade Desconhecido</p>
                <p class="text-sm text-gray-500">Alcance ${formatNumber(
                  upgrade.unlockCPS
                )} MPS para desbloquear este item.</p>
            </div>
        `;
  } else {
    // Renderização para item ATIVO (Comprável)
    card.className =
      "flex items-center justify-between p-4 rounded-xl transition duration-200 bg-gray-700/50";
    card.innerHTML = `
            <div class="flex items-center space-x-4">
                <span class="text-4xl">${upgrade.icon}</span>
                <div>
                    <p class="text-xl font-semibold">${
                      upgrade.name
                    } (Nível <span id="count-${upgrade.id}">${level}</span>)</p>
                    <p class="text-sm text-gray-400">${
                      upgrade.description
                    }</p>
                    <p class="text-sm text-green-400">Ganha ${formatNumber(
                      upgrade.baseGain
                    )} ${gainTextType} por nível</p>
                     <!-- Mensagem de Pré-requisito (visível apenas se não atendido) -->
                    <p id="prereq-msg-${
                      upgrade.id
                    }" class="text-xs font-semibold text-secondary mt-1 hidden"></p>
                </div>
            </div>
            <button id="buy-btn-${upgrade.id}" 
                    data-upgrade-id="${upgrade.id}" 
                    class="py-2 px-4 rounded-full font-bold text-sm transition duration-150 shadow-md bg-gray-500 cursor-not-allowed text-gray-300"
                    disabled>
                Comprar (<span id="cost-${upgrade.id}">0.00</span> Moedas)
            </button>
        `;
  }
  container.appendChild(card);
}

// --- Funções de Customização ---

function applyTheme(themeName) {
  const theme = THEME_DEFINITIONS[themeName] || THEME_DEFINITIONS.default;

  // Atualiza variáveis CSS customizadas
  document.documentElement.style.setProperty(
    "--theme-primary",
    theme.primary
  );
  document.documentElement.style.setProperty(
    "--theme-secondary",
    theme.secondary
  );
  document.documentElement.style.setProperty(
    "--theme-dark-bg",
    theme.darkBg
  );
  document.documentElement.style.setProperty(
    "--theme-dark-card",
    theme.darkCard
  );

  // Atualiza background do body
  document.body.style.backgroundColor = theme.darkBg;

  // Atualiza cores dos elementos principais (títulos, textos primários)
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
    clickButton.style.color = "#1a1a2e";
  }

  // Atualiza cores secundárias (botões de crítico, etc)
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
  const modal = document.getElementById("customize-modal");
  if (modal) {
    const modalCard = modal.querySelector(".bg-dark-card");
    if (modalCard) {
      modalCard.style.backgroundColor = theme.darkCard;
    }
  }

  // Atualiza cor do spinner de loading
  const spinner = document.querySelector(
    "#loading-overlay .border-primary"
  );
  if (spinner) {
    spinner.style.borderColor = theme.primary;
  }

  // Atualiza seleção do tema no modal
  document.querySelectorAll(".theme-option").forEach((option) => {
    if (option.dataset.theme === themeName) {
      option.classList.add(
        "border-yellow-400",
        "ring-4",
        "ring-yellow-300"
      );
      option.classList.remove("border-transparent");
    } else {
      option.classList.remove(
        "border-yellow-400",
        "ring-4",
        "ring-yellow-300"
      );
      option.classList.add("border-transparent");
    }
  });

  customizationState.theme = themeName;
  saveCustomization();
}

function initializeCustomization() {
  // Event listeners do modal
  const customizeButton = document.getElementById("customize-button");
  const customizeModal = document.getElementById("customize-modal");
  const closeModal = document.getElementById("close-customize-modal");
  const resetTheme = document.getElementById("reset-theme");

  if (customizeButton) {
    customizeButton.addEventListener("click", () => {
      customizeModal.classList.remove("hidden");
      // Atualiza seleção visual do tema atual
      applyTheme(customizationState.theme);
    });
  }

  if (closeModal) {
    closeModal.addEventListener("click", () => {
      customizeModal.classList.add("hidden");
    });
  }

  if (resetTheme) {
    resetTheme.addEventListener("click", () => {
      applyTheme("default");
      showMessage("Tema resetado para o padrão!", false);
    });
  }

  // Event listeners dos temas
  document.querySelectorAll(".theme-option").forEach((option) => {
    option.addEventListener("click", () => {
      const themeName = option.dataset.theme;
      applyTheme(themeName);
      showMessage(
        `Tema "${THEME_DEFINITIONS[themeName].name}" aplicado!`,
        false
      );
    });
  });

  // Fechar modal ao clicar fora
  if (customizeModal) {
    customizeModal.addEventListener("click", (e) => {
      if (e.target === customizeModal) {
        customizeModal.classList.add("hidden");
      }
    });
  }
}

function renderUpgradesInitial(appendOnly = false) {
  const activeContainer = document.getElementById("upgrades-container");
  const lockedContainer = document.getElementById(
    "locked-upgrades-container"
  );

  if (!appendOnly) {
    activeContainer.innerHTML = "";
    lockedContainer.innerHTML = "";
  }

  // Renderiza upgrades ativos/compráveis
  UPGRADE_DEFINITIONS.forEach((upgrade) => {
    if (!document.getElementById(`upgrade-card-${upgrade.id}`)) {
      renderUpgradeCard(upgrade, activeContainer, false);
    }
  });

  // Renderiza o item BLOQUEADO de menor custo (DICA)
  if (LOCKED_UPGRADES.length > 0) {
    // Encontra o item de menor unlockCPS para mostrar como próxima meta
    const nextLocked = LOCKED_UPGRADES.reduce((prev, current) =>
      prev.unlockCPS < current.unlockCPS ? prev : current
    );
    if (!document.getElementById(`upgrade-card-${nextLocked.id}`)) {
      renderUpgradeCard(nextLocked, lockedContainer, true);
    }
  }
}

// --- Inicialização do Jogo ---

function startGame(loadSave = true) {
  // Carrega customização primeiro para aplicar o tema antes de renderizar
  loadCustomization();

  // Se for novo jogo, reseta o estado
  if (!loadSave) {
    gameState = {
      coins: 0,
      coinsPerClick: 1,
      coinsPerSecond: 0,
      upgradeLevels: {},
      criticalChance: 0.05,
      criticalMultiplier: 10,
      powerActive: false,
      powerMultiplier: 5,
      powerDuration: 30,
      powerCooldown: 60,
      powerStartTime: 0,
      lastPowerUse: 0,
    };
  } else {
    // Tenta carregar o jogo salvo
    loadGame();
  }

  // Garante que o estado inicial do CPC e CPS está correto após o load
  gameState.coinsPerSecond = calculateTotalCPS();
  gameState.coinsPerClick = calculateTotalCPC();

  // Renderiza a estrutura inicial dos upgrades
  renderUpgradesInitial();

  updateUI();

  // Inicia o loop do jogo
  if (!gameInterval) {
    gameInterval = setInterval(gameLoop, 100); // Roda 10 vezes por segundo para precisão
  }

  // Inicia o loop de salvamento
  if (!saveInterval) {
    saveInterval = setInterval(saveGame, 5000); // Salva a cada 5 segundos
  }

  // Adiciona listener do botão principal
  document
    .getElementById("click-button")
    .addEventListener("click", () => {
      // Inicializa o contexto de áudio na primeira interação
      initAudioContext();
      clickCoin();
    });

  // Adiciona o listener delegado ao container pai dos upgrades.
  document
    .getElementById("upgrades-container")
    .addEventListener("click", handleUpgradeClick);

  // Adiciona listener do botão de poder
  document
    .getElementById("power-button")
    .addEventListener("click", activatePower);

  // Inicializa sistema de customização
  initializeCustomization();

  // Remove a tela de carregamento
  const loadingOverlay = document.getElementById("loading-overlay");
  if (loadingOverlay) {
    loadingOverlay.classList.add("hidden");
  }

  // Inicia a música se estiver habilitada (função do menu.js)
  if (typeof musicEnabled !== "undefined" && musicEnabled) {
    if (typeof startBackgroundMusic === "function") {
      startBackgroundMusic();
    }
  }
}

