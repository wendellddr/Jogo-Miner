/**
 * cloud-save.js
 * Sistema de salvamento em nuvem usando JSONBin.io
 */

// Usa as mesmas configurações do leaderboard
const CLOUD_SAVE_API_KEY = "$2a$10$EpuCgK6DgQlDGMOkL.H3EOl81pf2SGyQBvsUMGTqQklMLuBN6AX5a";
const CLOUD_SAVE_BIN_ID = "690521d543b1c97be98f4023";
const CLOUD_SAVE_API_URL = `https://api.jsonbin.io/v3/b/${CLOUD_SAVE_BIN_ID}`;

// Cache para evitar muitas requisições
let lastCloudSaveLoad = 0;
const CLOUD_SAVE_CACHE_TIME = 5000; // 5 segundos

/**
 * Salva o jogo na nuvem vinculado ao ID do jogador
 */
async function saveGameToCloud(gameData) {
  try {
    const playerId = getCurrentPlayerIdForCloud();
    if (!playerId) {
      console.warn("Sem ID do jogador, pulando salvamento em nuvem");
      return false;
    }

    // Carrega dados completos do bin
    const currentData = await fetch(CLOUD_SAVE_API_URL + "/latest", {
      headers: { "X-Master-Key": CLOUD_SAVE_API_KEY },
    }).then(r => r.json()).catch(() => ({}));

    const savePayload = currentData.record || {};
    
    // Garante que cloudSaves existe
    if (!savePayload.cloudSaves) {
      savePayload.cloudSaves = {};
    }

    // Atualiza o save deste jogador
    savePayload.cloudSaves[playerId] = {
      gameData: gameData,
      timestamp: Date.now()
    };

    console.log("💾 Salvando jogo na nuvem com ID:", playerId);

    // Preserva outros campos (leaderboard, auth)
    const response = await fetch(CLOUD_SAVE_API_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": CLOUD_SAVE_API_KEY,
      },
      body: JSON.stringify(savePayload),
    });

    if (response.ok) {
      console.log("✅ Jogo salvo na nuvem com sucesso!");
      lastCloudSaveLoad = Date.now();
      return true;
    } else {
      console.error("Erro ao salvar na nuvem:", response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error("Erro ao salvar jogo na nuvem:", error);
    return false;
  }
}

/**
 * Carrega o jogo da nuvem vinculado ao ID do jogador
 */
async function loadGameFromCloud() {
  try {
    const playerId = getCurrentPlayerIdForCloud();
    if (!playerId) {
      console.warn("Sem ID do jogador, pulando carregamento da nuvem");
      return null;
    }

    const now = Date.now();
    
    // Usa cache se foi carregado recentemente
    if (now - lastCloudSaveLoad < CLOUD_SAVE_CACHE_TIME) {
      console.log("Usando cache de salvamento em nuvem");
      return null;
    }

    const response = await fetch(CLOUD_SAVE_API_URL + "/latest", {
      headers: { "X-Master-Key": CLOUD_SAVE_API_KEY },
    });

    if (response.ok) {
      const data = await response.json();
      const cloudSaves = data.record.cloudSaves || {};
      
      console.log("🔍 Procurando ID:", playerId);
      console.log("📦 IDs disponíveis na nuvem:", Object.keys(cloudSaves));
      
      if (cloudSaves[playerId]) {
        console.log("✅ Jogo carregado da nuvem com sucesso!");
        lastCloudSaveLoad = now;
        return cloudSaves[playerId].gameData;
      } else {
        console.log("❌ Nenhum save encontrado na nuvem para este ID");
        return null;
      }
    } else {
      console.error("Erro ao carregar da nuvem:", response.status, response.statusText);
      return null;
    }
  } catch (error) {
    console.error("Erro ao carregar jogo da nuvem:", error);
    return null;
  }
}

/**
 * Obtém o ID atual do jogador (usuário autenticado ou ID gerado)
 */
function getCurrentPlayerIdForCloud() {
  console.log("🔍 Buscando ID do jogador...");
  
  // Tenta usar ID de usuário autenticado primeiro
  if (typeof getCurrentUser === "function" && getCurrentUser()) {
    const user = getCurrentUser();
    console.log("✅ Usando ID de usuário autenticado:", user.id);
    return user.id;
  }
  
  // Fallback para ID único gerado
  if (typeof getOrCreatePlayerId === "function") {
    const id = getOrCreatePlayerId();
    console.log("✅ Usando ID gerado:", id);
    return id;
  }
  
  // Última tentativa: localStorage
  const id = localStorage.getItem("playerUniqueId");
  console.log("✅ Usando ID do localStorage:", id);
  return id;
}

/**
 * Força carregar da nuvem (ignora cache)
 */
async function forceLoadFromCloud() {
  lastCloudSaveLoad = 0;
  return await loadGameFromCloud();
}

// Exporta funções globais
if (typeof window !== "undefined") {
  window.saveGameToCloud = saveGameToCloud;
  window.loadGameFromCloud = loadGameFromCloud;
  window.forceLoadFromCloud = forceLoadFromCloud;
  window.getCurrentPlayerIdForCloud = getCurrentPlayerIdForCloud;
}

