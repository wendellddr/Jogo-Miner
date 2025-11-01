/**
 * daily-rewards.js
 * Sistema de Recompensas Diárias
 */

const DAILY_REWARDS_STORAGE_KEY = "coinClickerDailyRewards";

let dailyRewardsState = {
  lastClaimDate: null,
  streak: 0,
};

/**
 * Carrega estado de recompensas diárias
 */
function loadDailyRewards() {
  try {
    const saved = localStorage.getItem(DAILY_REWARDS_STORAGE_KEY);
    if (saved) {
      dailyRewardsState = { ...dailyRewardsState, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error("Erro ao carregar recompensas diárias:", e);
  }
}

/**
 * Salva estado de recompensas diárias
 */
function saveDailyRewards() {
  try {
    localStorage.setItem(DAILY_REWARDS_STORAGE_KEY, JSON.stringify(dailyRewardsState));
  } catch (e) {
    console.error("Erro ao salvar recompensas diárias:", e);
  }
}

/**
 * Verifica se o jogador pode reivindicar recompensa diária
 */
function canClaimDailyReward() {
  if (!dailyRewardsState.lastClaimDate) return true;
  
  const lastClaim = new Date(dailyRewardsState.lastClaimDate);
  const now = new Date();
  
  // Reset às 00:00
  lastClaim.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  
  return now > lastClaim;
}

/**
 * Calcula recompensa baseada na streak
 */
function getDailyReward() {
  const streak = dailyRewardsState.streak;
  
  // Bonus crescente até 7 dias, depois estabiliza
  const streakBonus = Math.min(streak, 7);
  const baseReward = 1000;
  const multiplier = 1 + (streakBonus * 0.5); // +50% por dia até 7x
  
  return {
    coins: Math.floor(baseReward * multiplier),
    streak: streak,
  };
}

/**
 * Reivindica recompensa diária
 */
function claimDailyReward() {
  if (!canClaimDailyReward()) return false;
  
  const reward = getDailyReward();
  
  // Calcula se mantém ou quebra streak
  const now = new Date();
  const lastClaim = dailyRewardsState.lastClaimDate ? new Date(dailyRewardsState.lastClaimDate) : null;
  
  if (lastClaim) {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    lastClaim.setHours(0, 0, 0, 0);
    
    if (lastClaim.getTime() === yesterday.getTime()) {
      // Streak mantido
      dailyRewardsState.streak++;
    } else {
      // Streak quebrado
      dailyRewardsState.streak = 1;
    }
  } else {
    // Primeira recompensa
    dailyRewardsState.streak = 1;
  }
  
  dailyRewardsState.lastClaimDate = now.toISOString();
  saveDailyRewards();
  
  // Aplica recompensa
  if (typeof gameState !== "undefined" && gameState.coins !== undefined) {
    gameState.coins += reward.coins;
    if (typeof updateUI === "function") {
      updateUI();
    }
    if (typeof saveGame === "function") {
      saveGame();
    }
  }
  
  return true;
}

/**
 * Renderiza UI de recompensas diárias
 */
function renderDailyRewardsUI() {
  const container = document.getElementById("daily-rewards-sidebar-content");
  if (!container) return;
  
  const canClaim = canClaimDailyReward();
  const reward = getDailyReward();
  const progress = dailyRewardsState.streak > 0 ? Math.min(100, (dailyRewardsState.streak / 7) * 100) : 0;
  
  container.innerHTML = `
    <div class="space-y-4">
      <!-- Streak Atual -->
      <div class="bg-gradient-to-br from-orange-900/30 to-yellow-900/30 rounded-xl p-4 border border-orange-600/30">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-lg font-bold text-orange-300">🔥 Streak de ${dailyRewardsState.streak} dias!</h3>
        </div>
        <div class="w-full bg-gray-800 rounded-full h-2 mb-2">
          <div 
            class="bg-gradient-to-r from-orange-500 to-yellow-500 h-2 rounded-full transition-all duration-300"
            style="width: ${progress}%"
          ></div>
        </div>
        <p class="text-xs text-orange-400">
          ${dailyRewardsState.streak < 7 
            ? `${7 - dailyRewardsState.streak} dias até o bônus máximo!` 
            : "Bônus máximo alcançado!"}
        </p>
      </div>

      <!-- Recompensa de Hoje -->
      <div class="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-xl p-4 border border-purple-600/30">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-lg font-bold text-purple-300">🎁 Recompensa de Hoje</h3>
        </div>
        
        <div class="text-center mb-4">
          <div class="text-5xl mb-2">💰</div>
          <p class="text-2xl font-black text-purple-200">
            +${typeof formatNumber !== "undefined" ? formatNumber(reward.coins) : reward.coins.toLocaleString()}
          </p>
          <p class="text-xs text-purple-400 mt-1">
            Multiplicador: x${(1 + (Math.min(dailyRewardsState.streak, 7) * 0.5)).toFixed(1)}
          </p>
        </div>
        
        <button
          id="claim-daily-reward-button"
          class="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-4 rounded-lg transition duration-150 shadow-lg ${canClaim ? 'animate-pulse' : 'opacity-50 cursor-not-allowed'}"
          ${!canClaim ? 'disabled' : ''}
        >
          ${canClaim ? '🎉 Reivindicar Recompensa!' : '⏰ Já Reivindicada Hoje'}
        </button>
      </div>

      <!-- Próximas Recompensas -->
      <div class="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 rounded-xl p-4 border border-blue-600/30">
        <h3 class="text-lg font-bold text-blue-300 mb-3">📅 Próximas Recompensas</h3>
        <div class="space-y-2">
          ${generateNextRewardsPreview()}
        </div>
      </div>
      
      <!-- Info -->
      <div class="bg-gray-800/50 rounded-xl p-3 border border-gray-700">
        <p class="text-xs text-gray-400">
          <span class="text-yellow-400">⚠️</span> Volte amanhã para manter sua streak!
        </p>
        <p class="text-xs text-gray-500 mt-1">
          Streak aumenta seus bônus até 7 dias (x4.5 máximo)
        </p>
      </div>
    </div>
  `;
  
  // Event listener
  const claimButton = document.getElementById("claim-daily-reward-button");
  if (claimButton && canClaim) {
    claimButton.addEventListener("click", () => {
      const claimed = claimDailyReward();
      if (claimed) {
        showMessage(`🎉 Recompensa diária reivindicada! +${reward.coins.toLocaleString()} moedas!`, false);
        renderDailyRewardsUI();
      }
    });
  }
}

/**
 * Gera preview das próximas recompensas
 */
function generateNextRewardsPreview() {
  let html = '';
  const currentStreak = canClaimDailyReward() ? dailyRewardsState.streak : dailyRewardsState.streak + 1;
  const baseReward = 1000;
  
  for (let i = 0; i < 7; i++) {
    const dayStreak = currentStreak + i;
    const multiplier = 1 + (Math.min(dayStreak, 7) * 0.5);
    const reward = Math.floor(baseReward * multiplier);
    
    html += `
      <div class="flex items-center justify-between bg-gray-800/30 rounded-lg p-2 ${i === 0 ? 'border-2 border-green-500' : ''}">
        <span class="text-sm text-blue-200">Dia ${dayStreak}:</span>
        <span class="font-bold text-blue-100">+${typeof formatNumber !== "undefined" ? formatNumber(reward) : reward.toLocaleString()}</span>
      </div>
    `;
  }
  
  return html;
}

/**
 * Inicializa sistema de recompensas diárias e sidebar
 */
function initializeDailyRewards() {
  loadDailyRewards();
  
  // Inicializa sidebar se ainda não foi
  if (!window.dailyRewardsSidebarInitialized) {
    window.dailyRewardsSidebarInitialized = true;
    initializeDailyRewardsSidebar();
  }
  
  renderDailyRewardsUI();
}

/**
 * Inicializa sidebar de recompensas diárias
 */
function initializeDailyRewardsSidebar() {
  const sidebar = document.getElementById("daily-rewards-sidebar");
  const overlay = document.getElementById("daily-rewards-overlay");
  const closeBtn = document.getElementById("close-daily-rewards");
  
  if (!sidebar || !overlay || !closeBtn) return;
  
  closeBtn.addEventListener("click", () => {
    sidebar.classList.add("translate-x-full");
    overlay.classList.add("hidden");
    saveDailyRewards();
  });
  
  overlay.addEventListener("click", () => {
    sidebar.classList.add("translate-x-full");
    overlay.classList.add("hidden");
    saveDailyRewards();
  });
}

// Exporta funções globais
if (typeof window !== "undefined") {
  window.initializeDailyRewards = initializeDailyRewards;
  window.renderDailyRewardsUI = renderDailyRewardsUI;
  window.claimDailyReward = claimDailyReward;
  window.canClaimDailyReward = canClaimDailyReward;
}

