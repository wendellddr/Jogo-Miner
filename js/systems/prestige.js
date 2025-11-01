/**
 * prestige.js
 * Sistema de Prestígio/Ascensão para progressão de longo prazo
 */

// --- Constantes ---
const PRESTIGE_STORAGE_KEY = "coinClickerPrestige";

// --- Estado do Prestígio ---
let prestigeState = {
  level: 0,                    // Nível de prestígio atual
  totalPrestiges: 0,          // Total de vezes que resetou
  prestigePoints: 0,          // Pontos de prestígio disponíveis para gastar
  totalPrestigePoints: 0,     // Total acumulado de pontuação de prestígio
  multipliers: {
    clickPower: 1,            // Multiplicador de força de clique
    autoPower: 1,             // Multiplicador de produção automática
    criticalChance: 1,        // Multiplicador de chance crítica
    allEarnings: 1,           // Multiplicador geral de ganhos
  }
};

// Multiplicadores de custo para upgrades de prestígio
const PRESTIGE_COST_MULTIPLIERS = {
  clickPower: {
    baseCost: 10,
    costMultiplier: 3,       // Custo triplica a cada nível
  },
  autoPower: {
    baseCost: 15,
    costMultiplier: 3,
  },
  criticalChance: {
    baseCost: 20,
    costMultiplier: 3,
  },
  allEarnings: {
    baseCost: 50,
    costMultiplier: 5,       // O mais poderoso, mais caro
  }
};

// Níveis de upgrades de prestígio
let prestigeUpgradeLevels = {
  clickPower: 0,
  autoPower: 0,
  criticalChance: 0,
  allEarnings: 0,
};

/**
 * Carrega o estado de prestígio
 */
function loadPrestige() {
  try {
    const saved = localStorage.getItem(PRESTIGE_STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      Object.assign(prestigeState, data.state);
      prestigeUpgradeLevels = data.levels || prestigeUpgradeLevels;
    }
  } catch (e) {
    console.error("Erro ao carregar prestígio:", e);
  }
}

/**
 * Salva o estado de prestígio
 */
function savePrestige() {
  try {
    const data = {
      state: prestigeState,
      levels: prestigeUpgradeLevels,
    };
    localStorage.setItem(PRESTIGE_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Erro ao salvar prestígio:", e);
  }
}

/**
 * Calcula pontos de prestígio baseado nas moedas atuais
 */
function calculatePrestigePoints(coins) {
  // Fórmula: sqrt(coins / 1000000)
  // Exemplo: 1M de moedas = 1 ponto, 100M = 10 pontos, 1B = 31.6 pontos
  return Math.floor(Math.sqrt(coins / 1000000));
}

/**
 * Verifica se o jogador pode fazer prestígio
 */
function canPrestige() {
  if (!gameState) return false;
  const requiredCoins = 1000000; // 1 milhão para primeiro prestígio
  return gameState.coins >= requiredCoins && prestigeState.level >= 0;
}

/**
 * Calcula pontos que serão ganhos ao fazer prestígio
 */
function getPrestigeReward() {
  if (!gameState) return 0;
  return calculatePrestigePoints(gameState.coins);
}

/**
 * Executa o prestígio (reset do progresso em troca de bônus permanentes)
 */
function performPrestige() {
  if (!canPrestige()) {
    return { success: false, error: "Condições não atendidas para prestígio" };
  }

  // Calcula pontos ganhos
  const pointsGained = getPrestigeReward();
  
  // Atualiza estado
  prestigeState.level++;
  prestigeState.totalPrestiges++;
  prestigeState.prestigePoints += pointsGained;
  prestigeState.totalPrestigePoints += pointsGained;

  // Reseta progresso (mas mantém itens e conquistas)
  if (gameState) {
    gameState.coins = 0;
    gameState.upgradeLevels = {};
    gameState.totalCoinsEarned = 0;
    gameState.criticalChance = 0.05;
    gameState.criticalMultiplier = 10;
    
    // Reseta mundos também
    if (typeof resetWorlds === "function") {
      resetWorlds();
    }
  }

  savePrestige();

  return {
    success: true,
    pointsGained: pointsGained,
    newLevel: prestigeState.level,
  };
}

/**
 * Compra uma melhoria de prestígio
 */
function buyPrestigeUpgrade(upgradeType) {
  if (!PRESTIGE_COST_MULTIPLIERS[upgradeType]) {
    return { success: false, error: "Upgrade inválido" };
  }

  const config = PRESTIGE_COST_MULTIPLIERS[upgradeType];
  const currentLevel = prestigeUpgradeLevels[upgradeType] || 0;
  const cost = config.baseCost * Math.pow(config.costMultiplier, currentLevel);

  if (prestigeState.prestigePoints < cost) {
    return { success: false, error: "Pontos insuficientes" };
  }

  // Compra o upgrade
  prestigeState.prestigePoints -= cost;
  prestigeUpgradeLevels[upgradeType] = currentLevel + 1;

  // Atualiza multiplicadores
  updatePrestigeMultipliers();

  savePrestige();

  return { success: true, pointsRemaining: prestigeState.prestigePoints };
}

/**
 * Atualiza multiplicadores baseado nos níveis de upgrades
 */
function updatePrestigeMultipliers() {
  // Multiplicador = 1 + (nível * 0.1)
  prestigeState.multipliers.clickPower = 1 + (prestigeUpgradeLevels.clickPower * 0.1);
  prestigeState.multipliers.autoPower = 1 + (prestigeUpgradeLevels.autoPower * 0.1);
  prestigeState.multipliers.criticalChance = 1 + (prestigeUpgradeLevels.criticalChance * 0.05);
  prestigeState.multipliers.allEarnings = 1 + (prestigeUpgradeLevels.allEarnings * 0.15);
}

/**
 * Obtém o custo do próximo nível de um upgrade
 */
function getPrestigeUpgradeCost(upgradeType) {
  const config = PRESTIGE_COST_MULTIPLIERS[upgradeType];
  if (!config) return Infinity;
  
  const currentLevel = prestigeUpgradeLevels[upgradeType] || 0;
  return Math.floor(config.baseCost * Math.pow(config.costMultiplier, currentLevel));
}

/**
 * Obtém o nível atual de um upgrade
 */
function getPrestigeUpgradeLevel(upgradeType) {
  return prestigeUpgradeLevels[upgradeType] || 0;
}

/**
 * Obtém o multiplicador atual de um tipo
 */
function getPrestigeMultiplier(type) {
  if (!prestigeState.multipliers) return 1;
  return prestigeState.multipliers[type] || 1;
}

/**
 * Renderiza a UI de prestígio
 */
function renderPrestigeUI() {
  const container = document.getElementById("prestige-container");
  if (!container) return;

  const canDoPrestige = canPrestige();
  const reward = getPrestigeReward();
  const totalMultiplier = Object.values(prestigeState.multipliers).reduce((a, b) => a * b, 1);

  container.innerHTML = `
    <div class="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-xl p-6 border-2 border-purple-600">
      <h2 class="text-2xl font-bold text-purple-200 mb-4 flex items-center space-x-2">
        <span>⭐</span>
        <span>Ascensão (Prestígio)</span>
        <span class="text-sm font-normal text-purple-400 ml-2">
          Nível ${prestigeState.level}
        </span>
      </h2>

      <div class="grid md:grid-cols-2 gap-4 mb-4">
        <!-- Card de Prestígio -->
        <div class="bg-purple-800/30 rounded-lg p-4 border border-purple-600">
          <h3 class="text-lg font-bold text-purple-200 mb-2">🔄 Fazer Ascensão</h3>
          <p class="text-sm text-gray-300 mb-3">
            Reset seu progresso em troca de bônus permanentes
          </p>
          
          <div class="mb-3">
            <div class="text-xs text-gray-400 mb-1">Requerido: 1.00M moedas</div>
            <div class="text-sm text-purple-200 font-bold">
              Ganhará: ${reward.toFixed(1)} pontos de prestígio
            </div>
          </div>

          <button
            id="prestige-button"
            class="w-full py-2 px-4 rounded-lg font-bold transition ${canDoPrestige 
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white' 
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'}"
            ${!canDoPrestige ? 'disabled' : ''}
          >
            ${canDoPrestige ? '⭐ Ascender Agora' : '⏳ Complete 1.00M moedas'}
          </button>
        </div>

        <!-- Status -->
        <div class="bg-purple-800/30 rounded-lg p-4 border border-purple-600">
          <h3 class="text-lg font-bold text-purple-200 mb-2">📊 Status</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-300">Pontos Disponíveis:</span>
              <span class="text-purple-200 font-bold">${prestigeState.prestigePoints.toFixed(1)}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-300">Total Ascensões:</span>
              <span class="text-purple-200 font-bold">${prestigeState.totalPrestiges}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-300">Multiplicador Total:</span>
              <span class="text-green-300 font-bold">${totalMultiplier.toFixed(2)}x</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Upgrades de Prestígio -->
      <div class="mt-4">
        <h3 class="text-lg font-bold text-purple-200 mb-3">🎯 Melhorias Permanentes</h3>
        <div class="grid md:grid-cols-2 gap-3">
          ${renderPrestigeUpgrade("clickPower", "💪", "Força de Clique", "+10% por nível")}
          ${renderPrestigeUpgrade("autoPower", "⚡", "Auto-Produção", "+10% por nível")}
          ${renderPrestigeUpgrade("criticalChance", "🎲", "Chance Crítica", "+5% por nível")}
          ${renderPrestigeUpgrade("allEarnings", "💰", "Todos Ganhos", "+15% por nível")}
        </div>
      </div>
    </div>
  `;

  // Adiciona listeners
  const prestigeButton = document.getElementById("prestige-button");
  if (prestigeButton && canDoPrestige) {
    prestigeButton.addEventListener("click", handlePrestige);
  }

  // Adiciona listeners para upgrades
  Object.keys(PRESTIGE_COST_MULTIPLIERS).forEach(type => {
    const button = document.getElementById(`prestige-upgrade-${type}`);
    if (button) {
      button.addEventListener("click", () => handleBuyPrestigeUpgrade(type));
    }
  });
}

/**
 * Renderiza um card de upgrade de prestígio
 */
function renderPrestigeUpgrade(type, icon, name, description) {
  const level = getPrestigeUpgradeLevel(type);
  const cost = getPrestigeUpgradeCost(type);
  const canAfford = prestigeState.prestigePoints >= cost;

  return `
    <div class="bg-purple-800/20 rounded-lg p-3 border border-purple-700">
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center space-x-2">
          <span class="text-2xl">${icon}</span>
          <div>
            <div class="font-bold text-purple-200">${name}</div>
            <div class="text-xs text-gray-400">${description}</div>
          </div>
        </div>
      </div>
      <div class="flex items-center justify-between">
        <div class="text-xs text-purple-300">Nível ${level}</div>
        <button
          id="prestige-upgrade-${type}"
          class="py-1 px-3 rounded text-xs font-bold transition ${canAfford 
            ? 'bg-purple-600 hover:bg-purple-700 text-white' 
            : 'bg-gray-700 text-gray-500 cursor-not-allowed'}"
          ${!canAfford ? 'disabled' : ''}
        >
          ${canAfford ? `${cost.toFixed(0)} 📍` : `${cost.toFixed(0)} 📍`}
        </button>
      </div>
    </div>
  `;
}

/**
 * Handler para fazer prestígio
 */
function handlePrestige() {
  if (!canPrestige()) return;

  const confirmMessage = `⚠️ Você está prestes a fazer uma Ascensão!\n\n` +
    `Você irá:\n` +
    `• Perder todas as moedas e upgrades\n` +
    `• Resetar os mundos\n` +
    `• Ganhar ${getPrestigeReward().toFixed(1)} pontos de prestígio\n\n` +
    `Continuar?`;

  if (!confirm(confirmMessage)) return;

  const result = performPrestige();
  
  if (result.success) {
    if (typeof showMessage === "function") {
      showMessage(`⭐ Ascensão realizada! Ganhou ${result.pointsGained.toFixed(1)} pontos de prestígio!`, false);
    }
    
    // Atualiza UI
    renderPrestigeUI();
    if (typeof renderUpgradesInitial === "function") {
      renderUpgradesInitial();
    }
    if (typeof updateUI === "function") {
      updateUI();
    }
  }
}

/**
 * Handler para comprar upgrade de prestígio
 */
function handleBuyPrestigeUpgrade(type) {
  const result = buyPrestigeUpgrade(type);
  
  if (result.success) {
    if (typeof showMessage === "function") {
      showMessage("⭐ Melhoria de prestígio comprada!", false);
    }
    renderPrestigeUI();
  } else if (result.error) {
    if (typeof showMessage === "function") {
      showMessage(result.error, true);
    }
  }
}

/**
 * Inicializa o sistema de prestígio
 */
function initializePrestige() {
  loadPrestige();
  updatePrestigeMultipliers();
  
  // Renderiza UI se o container existir
  if (document.getElementById("prestige-container")) {
    renderPrestigeUI();
  }
}

// Inicializa quando carrega
if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => {
    // Aguarda um pouco para garantir que outros sistemas inicializaram
    setTimeout(() => {
      initializePrestige();
    }, 500);
  });
}

// Exporta funções globais
if (typeof window !== "undefined") {
  window.getPrestigeMultiplier = getPrestigeMultiplier;
  window.performPrestige = performPrestige;
  window.canPrestige = canPrestige;
  window.getPrestigeReward = getPrestigeReward;
  window.renderPrestigeUI = renderPrestigeUI;
  window.initializePrestige = initializePrestige;
}

