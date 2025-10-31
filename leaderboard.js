/**
 * leaderboard.js
 * Sistema de Ranking Online usando JSONBin.io como backend gratuito
 */

// Configuração da API
const LEADERBOARD_API_KEY = "$2a$10$EpuCgK6DgQlDGMOkL.H3EOl81pf2SGyQBvsUMGTqQklMLuBN6AX5a";
const LEADERBOARD_BIN_ID = "690521d543b1c97be98f4023";
const LEADERBOARD_API_URL = `https://api.jsonbin.io/v3/b/${LEADERBOARD_BIN_ID}`;

// Estado do leaderboard
let leaderboardData = [];
let playerName = "";
let playerId = ""; // ID único e persistente
let lastLeaderboardLoad = 0;
const LEADERBOARD_CACHE_TIME = 60000; // 1 minuto de cache
let autoRefreshInterval = null; // Interval para atualização automática
let currentRefreshRate = 10000; // Taxa de atualização em ms (10s padrão)
let lastPlayerAction = 0; // Timestamp da última ação do jogador

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
 * Inicializa o sistema de leaderboard
 * Carrega o nome do jogador salvo e o ranking
 */
function initializeLeaderboard() {
  // Carrega/cria ID único do jogador
  playerId = getOrCreatePlayerId();
  
  // Carrega o nome do jogador salvo
  const savedName = localStorage.getItem("playerName");
  if (savedName) {
    playerName = savedName;
  }

  // Inicializa timestamp de atividade para começar no modo normal
  lastPlayerAction = Date.now();

  console.log("🎮 Jogador ID:", playerId, "| Nome:", playerName || "Sem nome");

  // Carrega o ranking
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
 * Carrega o ranking do servidor (com cache para economizar requisições)
 */
async function loadLeaderboard() {
  const now = Date.now();
  
  // Usa cache se foi carregado recentemente (economiza requisições!)
  if (now - lastLeaderboardLoad < LEADERBOARD_CACHE_TIME && leaderboardData.length > 0) {
    console.log("Usando ranking em cache.");
    updateLeaderboardUI();
    return;
  }
  
  try {
    const response = await fetch(`${LEADERBOARD_API_URL}/latest`, {
      headers: {
        "X-Master-Key": LEADERBOARD_API_KEY,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      leaderboardData = data.record.leaderboard || [];
      // Ordena por pontuação (maior para menor)
      leaderboardData.sort((a, b) => b.score - a.score);
      lastLeaderboardLoad = now; // Atualiza timestamp do cache
      console.log("Ranking carregado com sucesso!", leaderboardData.length, "jogadores");
      updateLeaderboardUI();
    } else {
      console.warn("Erro ao carregar ranking:", response.status, response.statusText);
      const errorText = await response.text();
      console.warn("Detalhes do erro:", errorText);
      // Cria array vazio se não existir
      leaderboardData = [];
      updateLeaderboardUI();
    }
  } catch (error) {
    console.error("Erro ao conectar com o servidor de ranking:", error.message);
    // Falha silenciosa - o jogo continua funcionando mesmo sem ranking
    leaderboardData = [];
    // Ainda atualiza a UI para mostrar mensagem de erro
    updateLeaderboardUI();
  }
}

/**
 * Submete uma pontuação ao ranking
 */
async function submitScore(score, coins) {
  if (!playerId) {
    console.warn("ID do jogador não definido, pulando submissão");
    return false;
  }

  try {
    // Validar pontuação (prevenir valores inválidos)
    const validCoins = Math.max(0, Math.min(coins, Number.MAX_SAFE_INTEGER));
    const safeScore = Math.floor(validCoins);
    
    // Verifica se o jogador já existe no ranking (por ID único!)
    const existingEntryIndex = leaderboardData.findIndex(
      (entry) => entry.id === playerId
    );

    // Cria a nova entrada
    const newEntry = {
      id: playerId, // ID único persistente
      name: playerName || "Jogador Sem Nome", // Nome atual
      score: safeScore,
      timestamp: Date.now(),
    };

    // Só atualiza se a pontuação melhorou
    let shouldUpdate = true;
    if (existingEntryIndex !== -1) {
      if (newEntry.score > leaderboardData[existingEntryIndex].score) {
        // Pontuação melhorou: atualiza tudo (score + nome)
        leaderboardData[existingEntryIndex] = newEntry;
      } else {
        // Pontuação não melhorou, mas atualiza nome se mudou
        if (leaderboardData[existingEntryIndex].name !== newEntry.name) {
          leaderboardData[existingEntryIndex].name = newEntry.name;
          shouldUpdate = true;
        } else {
          // Nada mudou, não precisa salvar
          shouldUpdate = false;
        }
      }
    } else {
      // Adiciona novo jogador ao ranking
      leaderboardData.push(newEntry);
    }

    // Só faz requisição se realmente precisa atualizar
    if (!shouldUpdate) {
      console.log("Pontuação não melhorou, pulando submissão.");
      return false;
    }

    // Ordena o ranking
    leaderboardData.sort((a, b) => b.score - a.score);

    // Mantém apenas os top 100
    if (leaderboardData.length > 100) {
      leaderboardData = leaderboardData.slice(0, 100);
    }

    // Salva no servidor (apenas PUT, sem GET antes - economia de 50%!)
    const response = await fetch(LEADERBOARD_API_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": LEADERBOARD_API_KEY,
      },
      body: JSON.stringify({
        leaderboard: leaderboardData,
      }),
    });

    if (response.ok) {
      console.log("Pontuação submetida com sucesso!");
      lastLeaderboardLoad = 0; // Invalida cache para mostrar dados atualizados
      updateLeaderboardUI();
      return true;
    } else {
      console.error("Erro ao salvar pontuação:", response.status, response.statusText);
      const errorText = await response.text();
      console.error("Detalhes do erro:", errorText);
      return false;
    }
  } catch (error) {
    console.error("Erro ao submetir pontuação:", error.message);
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
      // Identifica por ID único ao invés de nome
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
  if (typeof text !== 'string') return '';
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

/**
 * Inicia atualização automática do ranking (adaptativa)
 */
function startAutoRefresh() {
  // Limpa intervalo existente se houver
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
    clearTimeout(autoRefreshInterval);
  }
  
  // Função recursiva que ajusta taxa de atualização
  function refreshWithAdaptiveRate() {
    const now = Date.now();
    const timeSinceAction = now - lastPlayerAction;
    
    // Escolhe taxa baseada em atividade:
    // - Se jogou recentemente (30s): atualiza rápido (10s)
    // - Se jogou há 2min: atualiza normal (30s)
    // - Se jogou há 5min+: atualiza lento (2min)
    if (timeSinceAction < 30000) {
      // Jogador ativo: atualiza a cada 10s
      currentRefreshRate = 10000;
      console.log("⚡ Ranking: Modo Rápido (10s)");
    } else if (timeSinceAction < 120000) {
      // Jogador médio: atualiza a cada 30s
      currentRefreshRate = 30000;
      console.log("🔄 Ranking: Modo Normal (30s)");
    } else {
      // Jogador inativo: atualiza a cada 2min
      currentRefreshRate = 120000;
      console.log("⏸️ Ranking: Modo Economia (2min)");
    }
    
    // Força atualização ignorando cache
    lastLeaderboardLoad = 0;
    loadLeaderboard();
    
    // Agenda próximo refresh com nova taxa
    autoRefreshInterval = setTimeout(refreshWithAdaptiveRate, currentRefreshRate);
  }
  
  // Inicia o primeiro refresh
  refreshWithAdaptiveRate();
}

/**
 * Marca que o jogador fez uma ação (acelera polling)
 */
function markPlayerActivity() {
  lastPlayerAction = Date.now();
}

/**
 * Para atualização automática do ranking
 */
function stopAutoRefresh() {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
    clearTimeout(autoRefreshInterval);
    autoRefreshInterval = null;
  }
}

// Inicializa quando o script carrega
if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => {
    initializeLeaderboard();
    // Inicia atualização automática
    startAutoRefresh();
  });
  
  // Para atualização automática quando a aba é minimizada (opcional)
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAutoRefresh();
    } else {
      startAutoRefresh();
    }
  });
}

