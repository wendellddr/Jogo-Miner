/**
 * stats.js
 * Sistema de Estatísticas Detalhadas
 */

// --- Constantes ---
const STATS_STORAGE_KEY = "coinClickerStats";

// --- Estado de Estatísticas ---
let statsState = {
  startTime: Date.now(),
  totalPlayTime: 0, // Em milissegundos
  lastSession: {
    startTime: Date.now(),
    coinsEarned: 0,
    upgradesBought: 0,
    clicksMade: 0,
    criticalsHit: 0,
    dungeonsEntered: 0,
    enemiesDefeated: 0,
    itemsFound: 0,
  },
  lifetime: {
    totalCoinsEarned: 0,
    totalClicks: 0,
    totalCriticals: 0,
    totalUpgradesBought: 0,
    totalEnemiesDefeated: 0,
    totalItemsFound: 0,
    totalDungeonsEntered: 0,
    highestFloor: 1,
    prestigeCount: 0,
    worldsCompleted: 0,
  },
};

/**
 * Carrega estatísticas salvas
 */
function loadStats() {
  try {
    const saved = localStorage.getItem(STATS_STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      Object.assign(statsState, data);
    }
  } catch (e) {
    console.error("Erro ao carregar estatísticas:", e);
  }
}

/**
 * Salva estatísticas
 */
function saveStats() {
  try {
    // Calcula tempo total de jogo
    statsState.totalPlayTime += Date.now() - statsState.lastSession.startTime;
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(statsState));
  } catch (e) {
    console.error("Erro ao salvar estatísticas:", e);
  }
}

/**
 * Inicializa sidebar de estatísticas
 */
function initializeStatsSidebar() {
  if (!document.getElementById("stats-sidebar")) return;
  
  // Prevent duplicate initialization
  if (window.statsSidebarInitialized) return;
  window.statsSidebarInitialized = true;
  
  const sidebar = document.getElementById("stats-sidebar");
  const overlay = document.getElementById("stats-overlay");
  const closeBtn = document.getElementById("close-stats");
  
  // Event listeners (menu-stats-button já é tratado no menu.js)
  closeBtn.addEventListener("click", () => {
    sidebar.classList.add("translate-x-full");
    overlay.classList.add("hidden");
    saveStats(); // Salva tempo de jogo
  });
  
  overlay.addEventListener("click", () => {
    sidebar.classList.add("translate-x-full");
    overlay.classList.add("hidden");
    saveStats(); // Salva tempo de jogo
  });
}

/**
 * Renderiza UI de estatísticas
 */
function renderStatsUI() {
  const container = document.getElementById("stats-container");
  if (!container) return;
  
  // Calcula tempo de jogo atual
  const currentSessionTime = Date.now() - statsState.lastSession.startTime;
  const totalPlayTime = statsState.totalPlayTime + currentSessionTime;
  const hours = Math.floor(totalPlayTime / 3600000);
  const minutes = Math.floor((totalPlayTime % 3600000) / 60000);
  const seconds = Math.floor((totalPlayTime % 60000) / 1000);
  
  // Calcula médias
  const avgCoinsPerClick = statsState.lifetime.totalClicks > 0 
    ? (statsState.lifetime.totalCoinsEarned / statsState.lifetime.totalClicks).toFixed(2)
    : "0.00";
  const criticalRate = statsState.lifetime.totalClicks > 0
    ? ((statsState.lifetime.totalCriticals / statsState.lifetime.totalClicks) * 100).toFixed(2)
    : "0.00";
  
  container.innerHTML = `
    <!-- Tempo de Jogo -->
    <div class="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-xl p-4 mb-4 border border-blue-600/30">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-lg font-bold text-blue-300">⏱️ Tempo de Jogo</h3>
      </div>
      <p class="text-3xl font-black text-blue-200">${hours}h ${minutes}m ${seconds}s</p>
      <p class="text-xs text-blue-400 mt-1">Desde que começou a jogar</p>
    </div>

    <!-- Ganhos Totais -->
    <div class="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-xl p-4 mb-4 border border-green-600/30">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-lg font-bold text-green-300">💰 Ganhos Totais</h3>
      </div>
      <p class="text-3xl font-black text-green-200">${typeof formatNumber !== "undefined" ? formatNumber(statsState.lifetime.totalCoinsEarned) : statsState.lifetime.totalCoinsEarned.toLocaleString()}</p>
      <p class="text-xs text-green-400 mt-1">Moedas ganhas na vida toda</p>
    </div>

    <!-- Cliques -->
    <div class="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 rounded-xl p-4 mb-4 border border-yellow-600/30">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-lg font-bold text-yellow-300">👆 Total de Cliques</h3>
      </div>
      <p class="text-3xl font-black text-yellow-200">${statsState.lifetime.totalClicks.toLocaleString()}</p>
      <p class="text-xs text-yellow-400 mt-1">Média: ${avgCoinsPerClick} moedas/clique</p>
    </div>

    <!-- Críticos -->
    <div class="bg-gradient-to-br from-red-900/30 to-pink-900/30 rounded-xl p-4 mb-4 border border-red-600/30">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-lg font-bold text-red-300">💥 Golpes Críticos</h3>
      </div>
      <p class="text-3xl font-black text-red-200">${statsState.lifetime.totalCriticals.toLocaleString()}</p>
      <p class="text-xs text-red-400 mt-1">Taxa: ${criticalRate}% de críticos</p>
    </div>

    <!-- Progressão -->
    <div class="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 rounded-xl p-4 mb-4 border border-purple-600/30">
      <h3 class="text-lg font-bold text-purple-300 mb-3">⭐ Progressão</h3>
      <div class="space-y-2">
        <div class="flex justify-between items-center">
          <span class="text-purple-200">Níveis de Prestígio:</span>
          <span class="font-bold text-purple-100">${statsState.lifetime.prestigeCount}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-purple-200">Mundos Completos:</span>
          <span class="font-bold text-purple-100">${statsState.lifetime.worldsCompleted}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-purple-200">Andar Mais Alto:</span>
          <span class="font-bold text-purple-100">Andar ${statsState.lifetime.highestFloor}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-purple-200">Upgrades Comprados:</span>
          <span class="font-bold text-purple-100">${statsState.lifetime.totalUpgradesBought}</span>
        </div>
      </div>
    </div>

    <!-- Dungeon -->
    <div class="bg-gradient-to-br from-orange-900/30 to-red-900/30 rounded-xl p-4 mb-4 border border-orange-600/30">
      <h3 class="text-lg font-bold text-orange-300 mb-3">⛏️ Cavernas</h3>
      <div class="space-y-2">
        <div class="flex justify-between items-center">
          <span class="text-orange-200">Entradas:</span>
          <span class="font-bold text-orange-100">${statsState.lifetime.totalDungeonsEntered}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-orange-200">Inimigos Derrotados:</span>
          <span class="font-bold text-orange-100">${statsState.lifetime.totalEnemiesDefeated}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-orange-200">Itens Encontrados:</span>
          <span class="font-bold text-orange-100">${statsState.lifetime.totalItemsFound}</span>
        </div>
      </div>
    </div>

    <!-- Última Sessão -->
    <div class="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 rounded-xl p-4 border border-cyan-600/30">
      <h3 class="text-lg font-bold text-cyan-300 mb-3">🕐 Última Sessão</h3>
      <div class="space-y-2 text-sm">
        <div class="flex justify-between items-center">
          <span class="text-cyan-200">Moedas Ganhas:</span>
          <span class="font-bold text-cyan-100">${typeof formatNumber !== "undefined" ? formatNumber(statsState.lastSession.coinsEarned) : statsState.lastSession.coinsEarned.toLocaleString()}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-cyan-200">Cliques:</span>
          <span class="font-bold text-cyan-100">${statsState.lastSession.clicksMade}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-cyan-200">Upgrades:</span>
          <span class="font-bold text-cyan-100">${statsState.lastSession.upgradesBought}</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Inicializa sistema de estatísticas
 */
function initializeStats() {
  loadStats();
  initializeStatsSidebar();
  
  // Salva periodicamente
  setInterval(() => {
    saveStats();
  }, 60000); // A cada minuto
}

/**
 * Atualiza estatísticas de cliques
 */
function trackStatsClick() {
  statsState.lastSession.clicksMade++;
  statsState.lifetime.totalClicks++;
}

/**
 * Atualiza estatísticas de críticos
 */
function trackStatsCritical() {
  statsState.lastSession.criticalsHit++;
  statsState.lifetime.totalCriticals++;
}

/**
 * Atualiza estatísticas de upgrades
 */
function trackStatsUpgrade() {
  statsState.lastSession.upgradesBought++;
  statsState.lifetime.totalUpgradesBought++;
}

/**
 * Atualiza estatísticas de moedas
 */
function trackStatsCoins(coins) {
  if (coins > statsState.lifetime.totalCoinsEarned) {
    statsState.lifetime.totalCoinsEarned = coins;
  }
}

/**
 * Atualiza estatísticas de dungeon
 */
function trackStatsDungeonEnter() {
  statsState.lastSession.dungeonsEntered++;
  statsState.lifetime.totalDungeonsEntered++;
}

/**
 * Atualiza estatísticas de inimigo derrotado
 */
function trackStatsEnemyDefeated() {
  statsState.lastSession.enemiesDefeated++;
  statsState.lifetime.totalEnemiesDefeated++;
}

/**
 * Atualiza estatísticas de item encontrado
 */
function trackStatsItemFound() {
  statsState.lastSession.itemsFound++;
  statsState.lifetime.totalItemsFound++;
}

/**
 * Atualiza maior andar alcançado
 */
function trackStatsHighestFloor(floor) {
  if (floor > statsState.lifetime.highestFloor) {
    statsState.lifetime.highestFloor = floor;
  }
}

/**
 * Atualiza estatísticas de prestígio
 */
function trackStatsPrestige() {
  statsState.lifetime.prestigeCount++;
}

/**
 * Atualiza estatísticas de mundos
 */
function trackStatsWorldComplete() {
  statsState.lifetime.worldsCompleted++;
}

// Exporta funções globais
if (typeof window !== "undefined") {
  window.initializeStats = initializeStats;
  window.renderStatsUI = renderStatsUI;
  window.trackStatsClick = trackStatsClick;
  window.trackStatsCritical = trackStatsCritical;
  window.trackStatsUpgrade = trackStatsUpgrade;
  window.trackStatsCoins = trackStatsCoins;
  window.trackStatsDungeonEnter = trackStatsDungeonEnter;
  window.trackStatsEnemyDefeated = trackStatsEnemyDefeated;
  window.trackStatsItemFound = trackStatsItemFound;
  window.trackStatsHighestFloor = trackStatsHighestFloor;
  window.trackStatsPrestige = trackStatsPrestige;
  window.trackStatsWorldComplete = trackStatsWorldComplete;
}

