/**
 * leaderboard-local.js
 * Sistema de Ranking Local (sem servidor externo)
 * Use esta versão se não quiser configurar JSONBin.io
 */

// Estado do leaderboard LOCAL
let leaderboardData = [];
let playerName = "";
let playerId = ""; // ID único e persistente

/**
 * Gera um ID único para o jogador (persistente)
 */
function getOrCreatePlayerId() {
  // Tenta carregar ID salvo
  let savedId = localStorage.getItem("playerUniqueId");
  
  if (!savedId) {
    // Gera novo ID único
    savedId = `player_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem("playerUniqueId", savedId);
  }
  
  return savedId;
}

/**
 * Inicializa o sistema de leaderboard local
 */
function initializeLeaderboard() {
  // Carrega/cria ID único do jogador
  playerId = getOrCreatePlayerId();
  
  // Carrega o nome do jogador salvo
  const savedName = localStorage.getItem("playerName");
  if (savedName) {
    playerName = savedName;
  }

  // Carrega o ranking local
  loadLeaderboard();
}

/**
 * Define o nome do jogador
 */
function setPlayerName(name) {
  if (name && name.trim() !== "") {
    // Limita tamanho e remove caracteres perigosos
    const sanitizedName = name.trim().substring(0, 20).replace(/[<>]/g, '');
    if (sanitizedName.length > 0) {
      playerName = sanitizedName;
      localStorage.setItem("playerName", playerName);
      return true;
    }
  }
  return false;
}

/**
 * Obtém o nome do jogador
 */
function getPlayerName() {
  return playerName;
}

/**
 * Carrega o ranking do localStorage
 */
function loadLeaderboard() {
  try {
    const saved = localStorage.getItem("localLeaderboard");
    if (saved) {
      leaderboardData = JSON.parse(saved);
      // Ordena por pontuação (maior para menor)
      leaderboardData.sort((a, b) => b.score - a.score);
      console.log("Ranking local carregado!", leaderboardData);
    } else {
      leaderboardData = [];
    }
    updateLeaderboardUI();
  } catch (error) {
    console.error("Erro ao carregar ranking local:", error);
    leaderboardData = [];
  }
}

/**
 * Submete uma pontuação ao ranking local
 */
function submitScore(score, coins) {
  if (!playerId) {
    console.warn("ID do jogador não definido, pulando submissão");
    return false;
  }

  try {
    // Validar pontuação
    const validCoins = Math.max(0, Math.min(coins, Number.MAX_SAFE_INTEGER));
    const safeScore = Math.floor(validCoins);
    
    // Verifica se o jogador já existe no ranking (por ID)
    const existingEntryIndex = leaderboardData.findIndex(
      (entry) => entry.id === playerId
    );

    // Cria a nova entrada
    const newEntry = {
      id: playerId,
      name: playerName || "Jogador Sem Nome",
      score: safeScore,
      timestamp: Date.now(),
    };

    if (existingEntryIndex !== -1) {
      // Se o jogador já existe, atualiza apenas se a nova pontuação for maior
      if (newEntry.score > leaderboardData[existingEntryIndex].score) {
        leaderboardData[existingEntryIndex] = newEntry;
      } else if (leaderboardData[existingEntryIndex].name !== newEntry.name) {
        // Nome mudou, atualiza nome
        leaderboardData[existingEntryIndex].name = newEntry.name;
      }
    } else {
      // Adiciona novo jogador ao ranking
      leaderboardData.push(newEntry);
    }

    // Ordena o ranking
    leaderboardData.sort((a, b) => b.score - a.score);

    // Mantém apenas os top 100
    if (leaderboardData.length > 100) {
      leaderboardData = leaderboardData.slice(0, 100);
    }

    // Salva no localStorage
    localStorage.setItem("localLeaderboard", JSON.stringify(leaderboardData));
    console.log("Pontuação salva localmente!");
    updateLeaderboardUI();
    return true;
  } catch (error) {
    console.error("Erro ao salvar pontuação local:", error);
    return false;
  }
}

/**
 * Atualiza a interface visual do ranking
 */
function updateLeaderboardUI() {
  const leaderboardContainer = document.getElementById(
    "leaderboard-list"
  );
  if (!leaderboardContainer) return;

  if (leaderboardData.length === 0) {
    leaderboardContainer.innerHTML = `
      <div class="text-center text-gray-400 py-8">
        <p class="text-xl">📊 Nenhuma pontuação ainda</p>
        <p class="text-sm mt-2">Seja o primeiro a aparecer no ranking!</p>
      </div>
    `;
    return;
  }

  // Renderiza até os top 10
  const topPlayers = leaderboardData.slice(0, 10);
  leaderboardContainer.innerHTML = topPlayers
    .map((entry, index) => {
      const rank = index + 1;
      const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `${rank}º`;
      const isCurrentPlayer = entry.id === playerId;
      const highlightClass = isCurrentPlayer ? "bg-yellow-500/20 border-yellow-500" : "bg-gray-700/50";
      
      return `
        <div class="flex items-center justify-between p-3 rounded-lg ${highlightClass} border-2 transition-all hover:scale-105">
          <div class="flex items-center space-x-3">
            <span class="text-2xl font-bold text-primary">${medal}</span>
            <div>
              <p class="font-bold ${isCurrentPlayer ? 'text-yellow-400' : 'text-white'}">${escapeHtml(entry.name || "Sem nome")}</p>
              <p class="text-xs text-gray-400">${new Date(entry.timestamp).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
          <span class="text-xl font-bold text-primary">${formatNumber(entry.score)}</span>
        </div>
      `;
    })
    .join("");
}

/**
 * Escapa HTML para prevenir XSS
 */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Formata números para exibição
 */
function formatNumber(num) {
  const absNum = Math.abs(num);
  if (absNum >= 1000000000) return (num / 1000000000).toFixed(2) + " B";
  if (absNum >= 1000000) return (num / 1000000).toFixed(2) + " M";
  if (absNum >= 1000) return (num / 1000).toFixed(2) + " K";
  return parseFloat(num.toFixed(2)).toLocaleString("pt-BR");
}

/**
 * Retorna a posição do jogador no ranking
 */
function getPlayerRank() {
  if (!playerId) return null;
  const index = leaderboardData.findIndex((entry) => entry.id === playerId);
  return index !== -1 ? index + 1 : null;
}

/**
 * Retorna o score do jogador
 */
function getPlayerScore() {
  if (!playerId) return 0;
  const entry = leaderboardData.find((entry) => entry.id === playerId);
  return entry ? entry.score : 0;
}

// Inicializa quando o script carrega
if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", initializeLeaderboard);
}

