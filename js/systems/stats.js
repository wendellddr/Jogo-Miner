/**
 * stats.js
 * Sistema de Estatísticas do Jogo
 */

// --- Constantes ---
const STATS_STORAGE_KEY = "coinClickerStats";

// --- Estado das Estatísticas ---
let statsState = {
  firstPlayTime: Date.now(),
  totalPlayTime: 0, // em milissegundos
  lastSessionStart: Date.now(),
  totalSessions: 1,
  highestCPS: 0,
  highestCPC: 0,
  totalPowersUsed: 0,
  totalItemsFound: 0,
  worldsUnlocked: 1,
};

// --- Funções de Persistência ---

/**
 * Salva as estatísticas no localStorage
 */
function saveStats() {
  try {
    // Calcula o tempo de jogo da sessão atual antes de salvar
    const currentSessionTime = Date.now() - statsState.lastSessionStart;
    statsState.totalPlayTime += currentSessionTime;
    statsState.lastSessionStart = Date.now();

    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(statsState));
  } catch (err) {
    console.error("Erro ao salvar estatísticas:", err);
  }
}

/**
 * Carrega as estatísticas do localStorage
 */
function loadStats() {
  try {
    const saved = localStorage.getItem(STATS_STORAGE_KEY);
    if (saved) {
      const loaded = JSON.parse(saved);
      Object.assign(statsState, loaded);
      
      // Incrementa número de sessões
      if (statsState.lastSessionStart) {
        // Se já tinha uma sessão anterior, incrementa o contador
        const lastSessionTime = Date.now() - statsState.lastSessionStart;
        if (lastSessionTime > 60000) { // Se passou mais de 1 minuto desde a última sessão
          statsState.totalSessions++;
        }
      }
      
      // Reinicia o timer da sessão atual
      statsState.lastSessionStart = Date.now();
    } else {
      // Primeira vez jogando
      statsState.firstPlayTime = Date.now();
      statsState.lastSessionStart = Date.now();
      statsState.totalSessions = 1;
    }
  } catch (err) {
    console.error("Erro ao carregar estatísticas:", err);
  }
}

/**
 * Atualiza o tempo de jogo periodicamente
 */
function updatePlayTime() {
  const currentSessionTime = Date.now() - statsState.lastSessionStart;
  const totalTime = statsState.totalPlayTime + currentSessionTime;
  return totalTime;
}

/**
 * Formata o tempo em formato legível
 * @param {number} milliseconds - Tempo em milissegundos
 * @returns {string} Tempo formatado
 */
function formatPlayTime(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h ${minutes % 60}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Rastreia o uso de poder
 */
function trackPowerUsed() {
  statsState.totalPowersUsed++;
  saveStats();
}

/**
 * Rastreia item encontrado
 */
function trackItemFound() {
  statsState.totalItemsFound++;
  saveStats();
}

/**
 * Atualiza o maior CPS alcançado
 * @param {number} cps - Coins per second atual
 */
function updateHighestCPS(cps) {
  if (cps > statsState.highestCPS) {
    statsState.highestCPS = cps;
    saveStats();
  }
}

/**
 * Atualiza o maior CPC alcançado
 * @param {number} cpc - Coins per click atual
 */
function updateHighestCPC(cpc) {
  if (cpc > statsState.highestCPC) {
    statsState.highestCPC = cpc;
    saveStats();
  }
}

/**
 * Atualiza o número de mundos desbloqueados
 * @param {number} worlds - Número de mundos desbloqueados
 */
function updateWorldsUnlocked(worlds) {
  if (worlds > statsState.worldsUnlocked) {
    statsState.worldsUnlocked = worlds;
    saveStats();
  }
}

/**
 * Renderiza o modal de estatísticas
 */
function renderStats() {
  const container = document.getElementById("stats-content");
  if (!container) return;

  // Calcula estatísticas atuais
  const totalPlayTime = updatePlayTime();
  const currentCPS = typeof calculateTotalCPS === "function" ? calculateTotalCPS() : 0;
  const currentCPC = typeof calculateTotalCPC === "function" ? calculateTotalCPC() : 0;
  const currentCoins = typeof gameState !== "undefined" ? gameState.coins : 0;
  const totalCoinsEarned = typeof gameState !== "undefined" ? (gameState.totalCoinsEarned || 0) : 0;
  
  // Estatísticas de achievements
  const totalClicks = typeof achievementsState !== "undefined" ? achievementsState.totalClicks : 0;
  const totalCriticalHits = typeof achievementsState !== "undefined" ? achievementsState.totalCriticalHits : 0;
  const totalUpgradesBought = typeof achievementsState !== "undefined" ? achievementsState.totalUpgradesBought : 0;
  const completedAchievements = typeof achievementsState !== "undefined" 
    ? Object.keys(achievementsState.completedAchievements).length 
    : 0;
  const totalAchievements = typeof ACHIEVEMENTS_DEFINITIONS !== "undefined" 
    ? ACHIEVEMENTS_DEFINITIONS.length 
    : 0;

  // Estatísticas de upgrades
  let totalUpgradeLevels = 0;
  let highestUpgradeLevel = 0;
  let upgradeNames = [];
  
  if (typeof UPGRADE_DEFINITIONS !== "undefined" && typeof gameState !== "undefined") {
    UPGRADE_DEFINITIONS.forEach((upgrade) => {
      const level = gameState.upgradeLevels[upgrade.id] || 0;
      totalUpgradeLevels += level;
      if (level > highestUpgradeLevel) {
        highestUpgradeLevel = level;
      }
      if (level > 0) {
        upgradeNames.push(`${upgrade.name} (Nv.${level})`);
      }
    });
  }

  // Estatísticas de inventário
  const totalItems = typeof inventoryState !== "undefined" ? inventoryState.items.length : 0;
  const itemsInBag = typeof bagState !== "undefined" ? bagState.items.length : 0;

  // Estatísticas de mundo atual
  const currentWorld = typeof getCurrentWorld === "function" ? getCurrentWorld() : null;
  const worldName = currentWorld ? currentWorld.name : "Natureza";

  // Formata números
  const formatNum = typeof formatNumber === "function" ? formatNumber : (n) => n.toLocaleString("pt-BR");

  container.innerHTML = `
    <!-- Estatísticas Gerais -->
    <div class="pixel-border p-3">
      <h3 class="text-lg font-bold text-primary pixel-text-header mb-3">📈 Geral</h3>
      <div class="grid grid-cols-2 gap-2 text-sm pixel-text-small">
        <div class="flex justify-between">
          <span class="text-gray-400">💰 Moedas Atuais:</span>
          <span class="text-primary font-bold">${formatNum(Math.round(currentCoins))}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">💎 Total Ganho:</span>
          <span class="text-primary font-bold">${formatNum(Math.round(totalCoinsEarned))}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">⚡ CPS Atual:</span>
          <span class="text-green-400 font-bold">${formatNum(Math.round(currentCPS))}/s</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">💪 CPC Atual:</span>
          <span class="text-green-400 font-bold">${formatNum(Math.round(currentCPC))}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">🌟 Maior CPS:</span>
          <span class="text-yellow-400 font-bold">${formatNum(Math.round(statsState.highestCPS))}/s</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">💥 Maior CPC:</span>
          <span class="text-yellow-400 font-bold">${formatNum(Math.round(statsState.highestCPC))}</span>
        </div>
      </div>
    </div>

    <!-- Estatísticas de Ações -->
    <div class="pixel-border p-3">
      <h3 class="text-lg font-bold text-primary pixel-text-header mb-3">🎮 Ações</h3>
      <div class="grid grid-cols-2 gap-2 text-sm pixel-text-small">
        <div class="flex justify-between">
          <span class="text-gray-400">👆 Total de Cliques:</span>
          <span class="text-primary font-bold">${formatNum(totalClicks)}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">✨ Críticos:</span>
          <span class="text-red-400 font-bold">${formatNum(totalCriticalHits)}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">⬆️ Upgrades Comprados:</span>
          <span class="text-blue-400 font-bold">${formatNum(totalUpgradesBought)}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">⚡ Poderes Usados:</span>
          <span class="text-purple-400 font-bold">${formatNum(statsState.totalPowersUsed)}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">📦 Itens Encontrados:</span>
          <span class="text-cyan-400 font-bold">${formatNum(statsState.totalItemsFound)}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">🎒 Itens na Mochila:</span>
          <span class="text-green-400 font-bold">${itemsInBag}/3</span>
        </div>
      </div>
    </div>

    <!-- Estatísticas de Progresso -->
    <div class="pixel-border p-3">
      <h3 class="text-lg font-bold text-primary pixel-text-header mb-3">🌍 Progresso</h3>
      <div class="grid grid-cols-2 gap-2 text-sm pixel-text-small">
        <div class="flex justify-between">
          <span class="text-gray-400">🌎 Mundo Atual:</span>
          <span class="text-primary font-bold">${worldName}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">🗺️ Mundos Desbloqueados:</span>
          <span class="text-primary font-bold">${statsState.worldsUnlocked}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">🏆 Conquistas:</span>
          <span class="text-yellow-400 font-bold">${completedAchievements}/${totalAchievements}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">⬆️ Níveis de Upgrade:</span>
          <span class="text-blue-400 font-bold">${formatNum(totalUpgradeLevels)}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">📊 Maior Nível:</span>
          <span class="text-purple-400 font-bold">${highestUpgradeLevel}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">🎒 Total de Itens:</span>
          <span class="text-cyan-400 font-bold">${totalItems}</span>
        </div>
      </div>
    </div>

    <!-- Estatísticas de Tempo -->
    <div class="pixel-border p-3">
      <h3 class="text-lg font-bold text-primary pixel-text-header mb-3">⏱️ Tempo</h3>
      <div class="grid grid-cols-1 gap-2 text-sm pixel-text-small">
        <div class="flex justify-between">
          <span class="text-gray-400">🎮 Tempo Total de Jogo:</span>
          <span class="text-primary font-bold">${formatPlayTime(totalPlayTime)}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">📅 Primeira Jogada:</span>
          <span class="text-gray-300">${new Date(statsState.firstPlayTime).toLocaleDateString("pt-BR")}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">🔄 Sessões Totais:</span>
          <span class="text-gray-300">${formatNum(statsState.totalSessions)}</span>
        </div>
      </div>
    </div>

    <!-- Estatísticas de Upgrades (se houver upgrades) -->
    ${upgradeNames.length > 0 ? `
    <div class="pixel-border p-3">
      <h3 class="text-lg font-bold text-primary pixel-text-header mb-3">⬆️ Seus Upgrades</h3>
      <div class="max-h-40 overflow-y-auto pixel-scroll">
        <div class="grid grid-cols-1 gap-1 text-xs pixel-text-small">
          ${upgradeNames.slice(0, 10).map(name => `
            <div class="flex items-center space-x-2">
              <span class="text-green-400">✓</span>
              <span class="text-gray-300">${name}</span>
            </div>
          `).join('')}
          ${upgradeNames.length > 10 ? `
            <div class="text-gray-400 text-xs mt-1">... e mais ${upgradeNames.length - 10} upgrades</div>
          ` : ''}
        </div>
      </div>
    </div>
    ` : ''}
  `;
}

/**
 * Abre o modal de estatísticas
 */
function openStatsModal() {
  const modal = document.getElementById("stats-modal");
  if (modal) {
    renderStats();
    modal.classList.remove("hidden");
  }
}

/**
 * Fecha o modal de estatísticas
 */
function closeStatsModal() {
  const modal = document.getElementById("stats-modal");
  if (modal) {
    modal.classList.add("hidden");
    // Salva o tempo de jogo antes de fechar
    saveStats();
  }
}

/**
 * Inicializa o sistema de estatísticas
 */
function initializeStats() {
  loadStats();
  
  // Event listeners
  const statsButton = document.getElementById("stats-button");
  const closeButton = document.getElementById("close-stats-modal");
  
  if (statsButton) {
    statsButton.addEventListener("click", openStatsModal);
  }
  
  if (closeButton) {
    closeButton.addEventListener("click", closeStatsModal);
  }
  
  // Fecha ao clicar fora do modal
  const modal = document.getElementById("stats-modal");
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeStatsModal();
      }
    });
  }

  // Salva estatísticas periodicamente
  setInterval(() => {
    saveStats();
  }, 30000); // A cada 30 segundos

  // Atualiza estatísticas ao fechar a página
  window.addEventListener("beforeunload", () => {
    saveStats();
  });
}

