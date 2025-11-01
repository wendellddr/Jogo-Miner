/**
 * game.js
 * Código Principal do Jogo - Minerador de Moedas
 */

// --- Constantes ---
const STORAGE_KEY = "coinClickerSave";

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

// Upgrades são definidos em upgrades.js

// Intervalo do jogo (para ganhos automáticos e salvamento)
let gameInterval = null;
let saveInterval = null;
let lastUpdateTime = Date.now();
let lastScoreSubmission = 0;
let lastCloudSave = 0;
const SCORE_SUBMIT_INTERVAL = 60000; // Submete score a cada 1 minuto
const CLOUD_SAVE_INTERVAL = 30000; // Salva na nuvem a cada 30 segundos

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
      totalCoinsEarned: gameState.totalCoinsEarned || 0, // Salva progresso de mundos
      // Adiciona o tempo da última salvamento para calcular ganhos offline
      lastSaveTime: now,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveObject));
    console.log("Jogo salvo com sucesso.");
    
    // NÃO submete score automaticamente - apenas quando abrir o ranking
    // if (typeof submitScore === "function") {
    //   if (now - lastScoreSubmission >= SCORE_SUBMIT_INTERVAL) {
    //     submitScore(gameState.coins, gameState.coins);
    //     lastScoreSubmission = now;
    //   }
    // }
    
    // Salva na nuvem também (apenas se passou o intervalo)
    if (typeof saveGameToCloud === "function") {
      if (now - lastCloudSave >= CLOUD_SAVE_INTERVAL) {
        saveGameToCloud(saveObject);
        lastCloudSave = now;
      }
    }
  } catch (e) {
    console.error("Erro ao salvar o jogo:", e);
  }
}

function loadGame() {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const saveObject = JSON.parse(savedData);

      // Sobrescreve gameState com os dados salvos
      Object.assign(gameState, saveObject);

      // Inicializa inventoryBuffs se não existir
      if (!gameState.inventoryBuffs) {
        gameState.inventoryBuffs = {
          cpc_multiplier: 1,
          cps_multiplier: 1,
          critical_chance: 0,
          critical_multiplier: 1,
          total_multiplier: 1,
        };
      }

      // Inicializa totalCoinsEarned se não existir (para progresso de mundos)
      if (gameState.totalCoinsEarned === undefined) {
        // Usa o total de moedas atuais como aproximação inicial
        gameState.totalCoinsEarned = gameState.coins || 0;
      }

      // Re-calcula CPS e CPC com os níveis carregados
      gameState.coinsPerSecond = calculateTotalCPS();
      gameState.coinsPerClick = calculateTotalCPC();

      // Aplica buffs do inventário se existir
      if (typeof applyInventoryBuffs === "function") {
        applyInventoryBuffs();
      }

      // Calcula ganhos offline
      if (saveObject.lastSaveTime) {
        const offlineDurationSeconds =
          (Date.now() - saveObject.lastSaveTime) / 1000;
        const offlineGain = gameState.coinsPerSecond * offlineDurationSeconds;

        if (offlineGain > 0) {
          gameState.coins += offlineGain;
          // Arredonda moedas para inteiro
          gameState.coins = Math.round(gameState.coins);
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
  // Formata o número para exibição como inteiro, incluindo abreviações para números grandes.
  const absNum = Math.abs(num);
  const roundedNum = Math.round(num);
  
  if (absNum >= 1000000000) return Math.round(roundedNum / 1000000000) + " B";
  if (absNum >= 1000000) return Math.round(roundedNum / 1000000) + " M";
  if (absNum >= 1000) return Math.round(roundedNum / 1000) + " K";
  return roundedNum.toLocaleString("pt-BR");
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

/**
 * Cria partículas visuais ao clicar no botão
 * @param {HTMLElement} button - Elemento do botão
 * @param {boolean} isCritical - Se foi um clique crítico
 */
function createClickParticles(button, isCritical = false) {
  const particlesContainer = button.querySelector("#click-particles");
  if (!particlesContainer) return;

  const emojis = isCritical 
    ? ["💥", "⭐", "✨", "💎", "🔥", "⚡"]
    : ["💰", "✨", "💫", "⭐"];

  const particleCount = isCritical ? 8 : 4;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    particle.className = "click-particle";
    particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    
    // Posição aleatória ao redor do centro do botão
    const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
    const distance = 30 + Math.random() * 20;
    const randomX = Math.cos(angle) * distance;
    const randomY = Math.sin(angle) * distance;
    
    particle.style.setProperty("--random-x", randomX / 50);
    particle.style.setProperty("--random-y", randomY / 50);
    particle.style.left = "50%";
    particle.style.top = "50%";
    particle.style.transform = "translate(-50%, -50%)";

    particlesContainer.appendChild(particle);

    setTimeout(() => {
      particle.remove();
    }, 1000);
  }
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

  const clickButton = document.getElementById("click-button");

  // Atualiza o texto do botão de clique usando tema se disponível
  if (clickButton) {
    const amountDisplay = clickButton.querySelector("#click-amount-display");
    if (amountDisplay) {
      let currentCPC = gameState.coinsPerClick;
      if (gameState.powerActive) {
        currentCPC *= gameState.powerMultiplier;
      }
      // Aplica buffs do inventário
      if (typeof getInventoryCPCMultiplier === "function") {
        currentCPC *= getInventoryCPCMultiplier();
      }
      amountDisplay.textContent = `+${formatNumber(currentCPC)} Moedas`;
    }

    // Adiciona classe de power ativo para efeito visual
    if (gameState.powerActive) {
      clickButton.classList.add("power-active");
    } else {
      clickButton.classList.remove("power-active");
    }
  }

  // Atualiza Status de Crítico (Crit Chance)
  let displayCriticalChance = gameState.criticalChance;
  if (typeof getInventoryCriticalChance === "function") {
    displayCriticalChance += getInventoryCriticalChance();
  }

  let displayCriticalMultiplier = gameState.criticalMultiplier;
  if (typeof getInventoryCriticalMultiplier === "function") {
    displayCriticalMultiplier *= getInventoryCriticalMultiplier();
  }

  document.getElementById("crit-display").textContent = `Chance de Crítico: ${(
    displayCriticalChance * 100
  ).toFixed(1)}% (x${displayCriticalMultiplier.toFixed(1)})`;

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
    // Mantém emoji do tema
    if (typeof getCurrentTheme === "function") {
      const theme = getCurrentTheme();
      if (theme && theme.emojis && theme.emojis.power) {
        powerButton.textContent =
          theme.emojis.power + " MODO HIPER-MINERAÇÃO ATIVO";
      }
    }
    powerButton.classList.remove(
      "bg-indigo-600",
      "hover:bg-indigo-700",
      "bg-red-600",
      "cursor-not-allowed"
    );
    powerButton.classList.add("bg-green-500", "animate-pulse");
    powerButton.disabled = true;
  } else if (now - gameState.lastPowerUse < gameState.powerCooldown * 1000) {
    const cooldownRemaining = Math.ceil(
      (gameState.powerCooldown * 1000 - (now - gameState.lastPowerUse)) / 1000
    );
    powerTimer.textContent = `Cooldown: ${cooldownRemaining}s`;
    powerButton.textContent = "Em Cooldown...";
    // Mantém emoji do tema
    if (typeof getCurrentTheme === "function") {
      const theme = getCurrentTheme();
      if (theme && theme.emojis && theme.emojis.power) {
        powerButton.textContent = theme.emojis.power + " Em Cooldown...";
      }
    }
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
    // Usa texto do tema se disponível
    let powerText = "Ativar Hyper-Mineração";
    if (typeof getCurrentTheme === "function") {
      const theme = getCurrentTheme();
      if (theme && theme.texts && theme.texts.powerButton) {
        powerText = theme.texts.powerButton;
      }
      // Adiciona emoji se disponível
      if (theme && theme.emojis && theme.emojis.power) {
        powerText = theme.emojis.power + " " + powerText;
      }
    }
    powerButton.textContent = powerText;
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
        const prereqUpgrade = getUpgradeDefinition(upgrade.prerequisite.id);
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

    // Atualiza Estado Visual (CSS classes e disabled state) - Estilo 8-bit
    const cardBaseClasses =
      "pixel-border flex items-center justify-between p-3 transition duration-200";

    // Atualiza o display de pré-requisito
    const prereqDisplay = document.getElementById(`prereq-msg-${upgrade.id}`);

    if (!canBuy) {
      // Bloqueado por custo OU pré-requisito
      card.className = `${cardBaseClasses} locked-card bg-gray-800/50`;
      buyButton.className =
        "pixel-button py-2 px-3 text-xs font-bold bg-gray-600 cursor-not-allowed text-gray-300";
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
        "theme-button pixel-button py-2 px-3 text-xs text-white font-bold";
      buyButton.disabled = false;
      if (prereqDisplay) prereqDisplay.classList.add("hidden");
    }
  });

  // Atualiza barra de progresso do mundo
  if (typeof updateWorldProgress === "function") {
    updateWorldProgress();
  }
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
  return Math.round(upgrade.baseCost * Math.pow(upgrade.costMultiplier, level));
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

  // Aplica buffs do inventário
  if (typeof getInventoryCPSMultiplier === "function") {
    totalCPS *= getInventoryCPSMultiplier();
  }

  // Aplica multiplicador de prestígio
  if (typeof getPrestigeMultiplier === "function") {
    totalCPS *= getPrestigeMultiplier("autoPower");
  }

  // Aplica multiplicador procedural
  if (typeof getProceduralCPSMultiplier === "function") {
    totalCPS *= getProceduralCPSMultiplier();
  }

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

  // Aplica buffs do inventário
  if (typeof getInventoryCPCMultiplier === "function") {
    totalCPC *= getInventoryCPCMultiplier();
  }

  // Aplica multiplicador de prestígio
  if (typeof getPrestigeMultiplier === "function") {
    totalCPC *= getPrestigeMultiplier("clickPower");
  }

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
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
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

  // Aplica buffs do inventário
  if (typeof getInventoryCPCMultiplier === "function") {
    earnedAmount *= getInventoryCPCMultiplier();
  }

  // Calcula chance crítica com buffs do inventário e prestígio
  let criticalChance = gameState.criticalChance;
  if (typeof getInventoryCriticalChance === "function") {
    criticalChance += getInventoryCriticalChance();
  }
  // Aplica multiplicador de prestígio em chance crítica
  if (typeof getPrestigeMultiplier === "function") {
    criticalChance *= getPrestigeMultiplier("criticalChance");
  }

  if (Math.random() < criticalChance) {
    // Aplica multiplicador crítico com buffs do inventário
    let criticalMultiplier = gameState.criticalMultiplier;
    if (typeof getInventoryCriticalMultiplier === "function") {
      const inventoryMultiplier = getInventoryCriticalMultiplier();
      criticalMultiplier *= inventoryMultiplier;
    }
    earnedAmount *= criticalMultiplier;
    isCritical = true;
    // Rastreia golpe crítico
    if (typeof trackCriticalHit === "function") {
      trackCriticalHit();
    }
  }

  // Tenta dropar item
  if (typeof tryDropItem === "function") {
    const droppedItem = tryDropItem();
    if (droppedItem && typeof addItemToInventory === "function") {
      addItemToInventory(droppedItem);
    }
  }

  // Arredonda o valor ganho para inteiro antes de adicionar
  earnedAmount = Math.round(earnedAmount);
  gameState.coins += earnedAmount;

  // Rastreia total de moedas ganhas para progresso de mundos
  if (gameState.totalCoinsEarned === undefined) {
    gameState.totalCoinsEarned = 0;
  }
  gameState.totalCoinsEarned += earnedAmount;
  
  // Arredonda moedas para inteiro
  gameState.coins = Math.round(gameState.coins);
  gameState.totalCoinsEarned = Math.round(gameState.totalCoinsEarned);

  // Rastreia clique
  if (typeof trackClick === "function") {
    trackClick();
  }

  // Rastreia moedas acumuladas
  if (typeof trackCoins === "function") {
    trackCoins(gameState.coins);
  }

  const clickButton = document.getElementById("click-button");

  // Toca o som de picareta
  playMiningSound();

  // Se for crítico, toca o som de moeda também
  if (isCritical) {
    setTimeout(() => {
      playCoinSound();
    }, 50); // Pequeno delay para o som de moeda vir depois do impacto
  }

  // Cria partículas visuais ao clicar
  createClickParticles(clickButton, isCritical);

  createFloatingCoin(earnedAmount, clickButton, isCritical);

  // Animação de clique mais suave
  clickButton.classList.add("animate-pulse");
  setTimeout(() => clickButton.classList.remove("animate-pulse"), 150);

  updateUI();
}

function activatePower() {
  const now = Date.now();
  const cooldownTime = gameState.powerCooldown * 1000;

  if (now - gameState.lastPowerUse >= cooldownTime) {
    gameState.powerActive = true;
    gameState.powerStartTime = now;
    gameState.lastPowerUse = now;

    // Rastreia ativação do poder
    if (typeof trackPowerActivated === "function") {
      trackPowerActivated();
    }
    
    // Rastreia uso de poder para estatísticas
    if (typeof trackPowerUsed === "function") {
      trackPowerUsed();
    }

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
    showMessage(`O Poder está em cooldown. Faltam ${remainingTime}s.`, true);
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
      return; // Bloqueia a compra sem mostrar mensagem
    }
  }

  if (gameState.coins >= cost) {
    gameState.coins -= cost;
    // Arredonda moedas para inteiro após compra
    gameState.coins = Math.round(gameState.coins);

    gameState.upgradeLevels[upgradeId] = getUpgradeLevel(upgradeId) + 1;

    // Recalcula todos os stats
    gameState.coinsPerSecond = calculateTotalCPS();
    gameState.coinsPerClick = calculateTotalCPC();

    // Rastreia compra de upgrade
    if (typeof trackUpgradeBought === "function") {
      trackUpgradeBought();
    }

    // Toca o som de upgrade
    playUpgradeSound();

    updateUI();
    saveGame(); // Salva ao comprar
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
  
  // Atualiza estatísticas de CPS e CPC máximo
  if (typeof updateHighestCPS === "function") {
    updateHighestCPS(gameState.coinsPerSecond);
  }
  if (typeof updateHighestCPC === "function") {
    updateHighestCPC(gameState.coinsPerClick);
  }

  let currentCPS = gameState.coinsPerSecond;

  if (gameState.powerActive) {
    currentCPS *= gameState.powerMultiplier;
  }

  if (currentCPS > 0 && deltaTime > 0) {
    const earned = currentCPS * deltaTime;
    gameState.coins += earned;
    gameState.totalCoinsEarned += earned; // Rastreia total ganho para progresso
    // Arredonda moedas para inteiro
    gameState.coins = Math.round(gameState.coins);
    gameState.totalCoinsEarned = Math.round(gameState.totalCoinsEarned);
  }

  lastUpdateTime = now;

  // Checa novos unlocks a cada ciclo
  checkNewUpgrades();

  // Rastreia CPS para conquistas
  if (typeof trackCPS === "function") {
    trackCPS(currentCPS);
  }

  updateUI();
}

/**
 * Atualiza emojis dos upgrades baseado no tema atual
 */
function updateUpgradesEmojis() {
  if (typeof getUpgradeEmoji === "function") {
    // Atualiza upgrades ativos
    UPGRADE_DEFINITIONS.forEach((upgrade) => {
      const card = document.getElementById(`upgrade-card-${upgrade.id}`);
      if (card) {
        const iconSpan = card.querySelector("span.text-4xl");
        if (iconSpan) {
          iconSpan.textContent = getUpgradeEmoji(upgrade.id);
        }
      }
    });
    // Atualiza upgrades bloqueados
    LOCKED_UPGRADES.forEach((upgrade) => {
      const card = document.getElementById(`upgrade-card-${upgrade.id}`);
      if (card) {
        const iconSpan = card.querySelector("span.text-4xl");
        if (iconSpan) {
          iconSpan.textContent = getUpgradeEmoji(upgrade.id);
        }
      }
    });
  }
}

/**
 * Atualiza emoji do botão de poder baseado no tema atual
 * (Função mantida para compatibilidade, mas o emoji é aplicado diretamente no updateUI)
 */
function updatePowerButtonEmoji() {
  // Emoji já é aplicado no updateUI através do texto do tema
  // Esta função é chamada quando o tema muda para garantir atualização
  updateUI();
}

// --- Renderização Inicial dos Upgrades ---

function renderUpgradeCard(upgrade, container, isLocked = false) {
  // Cria o card DOM
  const card = document.createElement("div");
  card.id = `upgrade-card-${upgrade.id}`;
  const level = getUpgradeLevel(upgrade.id);
  const gainTextType = upgrade.type === "click" ? "CPC" : "MPS";

  // Obtém emoji do upgrade baseado no tema atual
  let upgradeIcon = upgrade.icon;
  if (typeof getUpgradeEmoji === "function") {
    upgradeIcon = getUpgradeEmoji(upgrade.id);
  }

  if (isLocked) {
    // Renderização para item BLOQUEADO (Dica) - Estilo 8-bit
    card.className =
      "locked-card pixel-border p-3 flex items-center space-x-3";
    card.innerHTML = `
            <span class="text-3xl text-gray-500 pixel-emoji">🔒</span>
            <div class="flex-1">
                <p class="text-base font-semibold text-gray-400 pixel-text">Upgrade Desconhecido</p>
                <p class="text-xs text-gray-500 pixel-text-small">Alcance ${formatNumber(
                  upgrade.unlockCPS
                )} MPS para desbloquear</p>
            </div>
        `;
  } else {
    // Renderização para item ATIVO (Comprável) - Estilo 8-bit
    card.className =
      "pixel-border flex items-center justify-between p-3 transition duration-200";
    card.innerHTML = `
            <div class="flex items-center space-x-3 flex-1">
                <span class="text-3xl pixel-emoji">${upgradeIcon}</span>
                <div class="flex-1 min-w-0">
                    <p class="text-base font-semibold pixel-text">${
                      upgrade.name
                    } <span class="text-xs text-gray-400">(Nv.<span id="count-${upgrade.id}">${level}</span>)</span></p>
                    <p class="text-xs text-gray-400 pixel-text-small truncate">${upgrade.description}</p>
                    <p class="text-xs text-green-400 pixel-text-small">+${formatNumber(
                      upgrade.baseGain
                    )} ${gainTextType}/nível</p>
                     <!-- Mensagem de Pré-requisito (visível apenas se não atendido) -->
                    <p id="prereq-msg-${
                      upgrade.id
                    }" class="text-xs font-semibold text-secondary mt-1 hidden pixel-text-small"></p>
                </div>
            </div>
            <button id="buy-btn-${upgrade.id}" 
                    data-upgrade-id="${upgrade.id}" 
                    class="theme-button pixel-button py-2 px-3 text-xs text-white font-bold whitespace-nowrap ml-2"
                    disabled>
                Comprar (<span id="cost-${upgrade.id}">0</span>)
            </button>
        `;
  }
  container.appendChild(card);
}

// --- Funções de Customização (usando themes.js) ---

/**
 * Atualiza a barra de progresso do mundo
 */
function updateWorldProgress() {
  if (
    typeof getWorldProgress === "function" &&
    typeof getCurrentWorld === "function"
  ) {
    const progress = getWorldProgress(gameState.totalCoinsEarned);
    const currentWorld = getCurrentWorld();
    const progressBar = document.getElementById("world-progress-bar");
    const progressText = document.getElementById("world-progress-text");
    const worldName = document.getElementById("current-world-name");
    const advanceButton = document.getElementById("advance-world-button");

    if (worldName) {
      worldName.textContent = `Mundo: ${currentWorld.name}`;
    }

    if (progressBar) {
      progressBar.style.width = `${progress.percent}%`;
    }

    if (progressText) {
      if (progress.hasNext) {
        progressText.textContent = `${formatNumber(
          progress.current
        )} / ${formatNumber(progress.required)}`;
      } else {
        progressText.textContent = "Máximo";
      }
    }

    if (advanceButton) {
      if (
        progress.hasNext &&
        typeof canAdvanceWorld === "function" &&
        canAdvanceWorld(gameState.totalCoinsEarned)
      ) {
        advanceButton.classList.remove("hidden");
        const nextWorld = getNextWorld();
        if (nextWorld) {
          advanceButton.textContent = `🌍 Avançar para ${nextWorld.name}`;
        }
      } else {
        advanceButton.classList.add("hidden");
      }
    }
  }
}

// --- Sistema de Mundos (substituiu customização) ---

function renderUpgradesInitial(appendOnly = false) {
  const activeContainer = document.getElementById("upgrades-container");
  const lockedContainer = document.getElementById("locked-upgrades-container");

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
  // Inicializa mundos primeiro para aplicar antes de renderizar
  if (typeof initializeWorlds === "function") {
    initializeWorlds();
  }

  // Inicializa conquistas
  if (typeof initializeAchievements === "function") {
    initializeAchievements();
  }

  // Inicializa inventário
  if (typeof initializeInventory === "function") {
    initializeInventory();
  }

  // Inicializa prestígio
  if (typeof initializePrestige === "function") {
    initializePrestige();
  }

  // Inicializa sistema procedural
  if (typeof initializeProcedural === "function") {
    initializeProcedural();
  }

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
      totalCoinsEarned: 0, // Inicia com 0 para progresso de mundos
      inventoryBuffs: {
        cpc_multiplier: 1,
        cps_multiplier: 1,
        critical_chance: 0,
        critical_multiplier: 1,
        total_multiplier: 1,
      },
    };
  } else {
    // Tenta carregar o jogo salvo
    loadGame();
  }

  // Garante que o estado inicial do CPC e CPS está correto após o load
  gameState.coinsPerSecond = calculateTotalCPS();
  gameState.coinsPerClick = calculateTotalCPC();

  // Garante que totalCoinsEarned existe
  if (gameState.totalCoinsEarned === undefined) {
    gameState.totalCoinsEarned = gameState.coins || 0;
  }

  // Renderiza a estrutura inicial dos upgrades
  renderUpgradesInitial();

  updateUI();

  // Aplica tema novamente após renderizar para atualizar textos e emojis
  if (typeof getCurrentWorld === "function") {
    const world = getCurrentWorld();
    if (world && typeof applyTheme === "function") {
      applyTheme(world.id);
    }
  }

  // Inicia o loop do jogo
  if (!gameInterval) {
    gameInterval = setInterval(gameLoop, 100); // Roda 10 vezes por segundo para precisão
  }

  // Inicia o loop de salvamento
  if (!saveInterval) {
    saveInterval = setInterval(saveGame, 5000); // Salva a cada 5 segundos
  }

  // Adiciona listener do botão principal
  document.getElementById("click-button").addEventListener("click", () => {
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

  // Adiciona listener para o botão de avançar mundo
  const advanceButton = document.getElementById("advance-world-button");
  if (advanceButton) {
    advanceButton.addEventListener("click", () => {
      if (typeof advanceToNextWorld === "function") {
        advanceToNextWorld();
        updateUI();
      }
    });
  }

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
