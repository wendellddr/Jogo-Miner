/**
 * inventory.js
 * Sistema de Inventário com Itens e Buffs
 */

// --- Constantes ---
const INVENTORY_STORAGE_KEY = "coinClickerInventory";
const DROP_CHANCE = 0.02; // 0.02% de chance de dropar item por clique

// --- Estado do Inventário ---
let inventoryState = {
  items: [],
  maxSlots: 20,
};

// --- Estado da Mochila ---
let bagState = {
  items: [],
  maxSlots: 3,
};

// --- Definições de Itens ---
const ITEM_DEFINITIONS = {
  // Itens de Boost de Clique
  gem_power: {
    id: "gem_power",
    name: "Gema de Poder",
    description: "Aumenta CPC em 10%",
    icon: "💎",
    rarity: "common",
    buffType: "cpc_multiplier",
    buffValue: 0.1,
    duration: null, // permanente quando equipado
  },
  crystal_strength: {
    id: "crystal_strength",
    name: "Cristal de Força",
    description: "Aumenta CPC em 25%",
    icon: "💠",
    rarity: "uncommon",
    buffType: "cpc_multiplier",
    buffValue: 0.25,
    duration: null,
  },
  diamond_might: {
    id: "diamond_might",
    name: "Diamante do Poder",
    description: "Aumenta CPC em 50%",
    icon: "💍",
    rarity: "rare",
    buffType: "cpc_multiplier",
    buffValue: 0.5,
    duration: null,
  },
  // Itens de Boost de CPS
  speed_crystal: {
    id: "speed_crystal",
    name: "Cristal de Velocidade",
    description: "Aumenta CPS em 15%",
    icon: "⚡",
    rarity: "common",
    buffType: "cps_multiplier",
    buffValue: 0.15,
    duration: null,
  },
  time_gem: {
    id: "time_gem",
    name: "Gema Temporal",
    description: "Aumenta CPS em 30%",
    icon: "⏱️",
    rarity: "uncommon",
    buffType: "cps_multiplier",
    buffValue: 0.3,
    duration: null,
  },
  infinity_stone: {
    id: "infinity_stone",
    name: "Pedra Infinita",
    description: "Aumenta CPS em 60%",
    icon: "♾️",
    rarity: "rare",
    buffType: "cps_multiplier",
    buffValue: 0.6,
    duration: null,
  },
  // Itens de Boost de Crítico
  crit_charm: {
    id: "crit_charm",
    name: "Amuleto Crítico",
    description: "Aumenta chance crítica em 2%",
    icon: "🎯",
    rarity: "common",
    buffType: "critical_chance",
    buffValue: 0.02,
    duration: null,
  },
  lucky_clover: {
    id: "lucky_clover",
    name: "Trevo da Sorte",
    description: "Aumenta chance crítica em 5%",
    icon: "🍀",
    rarity: "uncommon",
    buffType: "critical_chance",
    buffValue: 0.05,
    duration: null,
  },
  fate_dice: {
    id: "fate_dice",
    name: "Dado do Destino",
    description: "Aumenta chance crítica em 10%",
    icon: "🎲",
    rarity: "rare",
    buffType: "critical_chance",
    buffValue: 0.1,
    duration: null,
  },
  // Itens de Boost de Multiplicador Crítico
  power_ring: {
    id: "power_ring",
    name: "Anel de Poder",
    description: "Aumenta multiplicador crítico em 20%",
    icon: "💍",
    rarity: "common",
    buffType: "critical_multiplier",
    buffValue: 0.2,
    duration: null,
  },
  chaos_orb: {
    id: "chaos_orb",
    name: "Orbe do Caos",
    description: "Aumenta multiplicador crítico em 50%",
    icon: "🔮",
    rarity: "uncommon",
    buffType: "critical_multiplier",
    buffValue: 0.5,
    duration: null,
  },
  // Itens especiais
  coin_magnet: {
    id: "coin_magnet",
    name: "Ímã de Moedas",
    description: "Aumenta ganho total em 5%",
    icon: "🧲",
    rarity: "uncommon",
    buffType: "total_multiplier",
    buffValue: 0.05,
    duration: null,
  },
  multiplier_gem: {
    id: "multiplier_gem",
    name: "Gema Multiplicadora",
    description: "Aumenta ganho total em 15%",
    icon: "✨",
    rarity: "rare",
    buffType: "total_multiplier",
    buffValue: 0.15,
    duration: null,
  },
};

// Pool de drops por raridade
const DROP_POOLS = {
  common: ["gem_power", "speed_crystal", "crit_charm", "power_ring"],
  uncommon: [
    "crystal_strength",
    "time_gem",
    "lucky_clover",
    "coin_magnet",
    "chaos_orb",
  ],
  rare: ["diamond_might", "infinity_stone", "fate_dice", "multiplier_gem"],
};

// --- Funções de Persistência ---

/**
 * Salva o inventário no localStorage
 */
function saveInventory() {
  try {
    localStorage.setItem(
      INVENTORY_STORAGE_KEY,
      JSON.stringify({ items: inventoryState.items, bag: bagState.items })
    );
  } catch (e) {
    console.error("Erro ao salvar inventário:", e);
  }
}

/**
 * Carrega o inventário do localStorage
 */
function loadInventory() {
  try {
    const savedData = localStorage.getItem(INVENTORY_STORAGE_KEY);
    if (savedData) {
      const loaded = JSON.parse(savedData);
      inventoryState.items = loaded.items || [];
      bagState.items = loaded.bag || [];
      inventoryState.maxSlots = loaded.maxSlots || 20;
    }
  } catch (e) {
    console.warn("Erro ao carregar inventário:", e);
  }
}

// --- Funções de Drop e Itens ---

/**
 * Tenta dropar um item baseado na chance
 * @returns {Object|null} Item dropado ou null
 */
function tryDropItem() {
  if (Math.random() < DROP_CHANCE) {
    // Determina raridade (85% comum, 12% incomum, 3% raro)
    const rarityRoll = Math.random();
    let rarity;
    if (rarityRoll < 0.85) {
      rarity = "common";
    } else if (rarityRoll < 0.97) {
      rarity = "uncommon";
    } else {
      rarity = "rare";
    }

    // Seleciona item aleatório da raridade
    const pool = DROP_POOLS[rarity];
    const randomItemId = pool[Math.floor(Math.random() * pool.length)];
    const item = ITEM_DEFINITIONS[randomItemId];

    if (item) {
      // Verifica se já existe um item com o mesmo id base no inventário
      const baseItemId = item.id;
      const hasDuplicate = inventoryState.items.some(
        (invItem) => invItem.baseId === baseItemId
      );

      if (hasDuplicate) {
        // Não dropa se já existe um item com o mesmo id base
        return null;
      }

      return {
        ...item,
        id: `${item.id}_${Date.now()}`, // ID único
        baseId: item.id, // ID base para verificação de duplicatas
      };
    }
  }
  return null;
}

/**
 * Adiciona item ao inventário
 * @param {Object} item - Item a ser adicionado
 */
function addItemToInventory(item) {
  if (inventoryState.items.length >= inventoryState.maxSlots) {
    if (typeof showMessage === "function") {
      showMessage(
        "Inventário cheio! Equipe ou remova itens para adicionar novos.",
        true
      );
    }
    return false;
  }

  // Garante que o item tem baseId
  if (!item.baseId) {
    item.baseId = item.id.replace(/_\d+$/, ""); // Remove timestamp se houver
  }

  inventoryState.items.push(item);
  saveInventory();
  renderInventory();

  // Rastreia item encontrado para estatísticas
  if (typeof trackItemFound === "function") {
    trackItemFound();
  }

  if (typeof showMessage === "function") {
    showMessage(`Novo item obtido: ${item.name} ${item.icon}`, false);
  }

  return true;
}

/**
 * Remove item do inventário
 * @param {string} itemId - ID do item a ser removido
 */
function removeItemFromInventory(itemId) {
  inventoryState.items = inventoryState.items.filter(
    (item) => item.id !== itemId
  );
  // Remove também da mochila se estiver lá
  bagState.items = bagState.items.filter((item) => item.id !== itemId);
  saveInventory();
  renderInventory();
  renderBag();
  applyInventoryBuffs(); // Recalcula buffs
}

/**
 * Move item do inventário para a mochila
 * @param {string} itemId - ID do item
 */
function addItemToBag(itemId) {
  if (bagState.items.length >= bagState.maxSlots) {
    if (typeof showMessage === "function") {
      showMessage(
        "Mochila cheia! Remova um item antes de adicionar outro.",
        true
      );
    }
    return false;
  }

  // Verifica se o item já está na mochila
  const alreadyInBag = bagState.items.some((item) => item.id === itemId);
  if (alreadyInBag) {
    if (typeof showMessage === "function") {
      showMessage("Item já está na mochila!", true);
    }
    return false;
  }

  const item = inventoryState.items.find((i) => i.id === itemId);
  if (item) {
    bagState.items.push(item);
    saveInventory();
    renderBag();
    renderInventory();
    applyInventoryBuffs();

    if (typeof showMessage === "function") {
      showMessage(`${item.name} adicionado à mochila!`, false);
    }
    return true;
  }
  return false;
}

/**
 * Remove item da mochila (retorna para o inventário)
 * @param {string} itemId - ID do item
 */
function removeItemFromBag(itemId) {
  bagState.items = bagState.items.filter((item) => item.id !== itemId);
  saveInventory();
  renderBag();
  renderInventory();
  applyInventoryBuffs();

  if (typeof showMessage === "function") {
    const item = inventoryState.items.find((i) => i.id === itemId);
    if (item) {
      showMessage(`${item.name} removido da mochila!`, false);
    }
  }
}

/**
 * Equipa/desequipa um item (mantido para compatibilidade, mas agora usa mochila)
 * @param {string} itemId - ID do item
 */
function toggleItemEquip(itemId) {
  // Função mantida para compatibilidade, mas agora usa addItemToBag
  const isInBag = bagState.items.some((item) => item.id === itemId);
  if (isInBag) {
    removeItemFromBag(itemId);
  } else {
    addItemToBag(itemId);
  }
}

// --- Funções de Buffs ---

/**
 * Aplica todos os buffs dos itens equipados
 */
function applyInventoryBuffs() {
  if (typeof gameState === "undefined") {
    return;
  }

  // Reseta buffs
  gameState.inventoryBuffs = {
    cpc_multiplier: 1,
    cps_multiplier: 1,
    critical_chance: 0,
    critical_multiplier: 1,
    total_multiplier: 1,
  };

  // Aplica buffs dos itens da MOCHILA (não mais dos equipados)
  bagState.items.forEach((item) => {
    const buffType = item.buffType;
    const buffValue = item.buffValue;

    switch (buffType) {
      case "cpc_multiplier":
        gameState.inventoryBuffs.cpc_multiplier += buffValue;
        break;
      case "cps_multiplier":
        gameState.inventoryBuffs.cps_multiplier += buffValue;
        break;
      case "critical_chance":
        gameState.inventoryBuffs.critical_chance += buffValue;
        break;
      case "critical_multiplier":
        gameState.inventoryBuffs.critical_multiplier *= 1 + buffValue;
        break;
      case "total_multiplier":
        gameState.inventoryBuffs.total_multiplier += buffValue;
        break;
    }
  });
}

/**
 * Obtém o multiplicador de CPC do inventário
 * @returns {number} Multiplicador
 */
function getInventoryCPCMultiplier() {
  if (gameState && gameState.inventoryBuffs) {
    return (
      gameState.inventoryBuffs.cpc_multiplier *
      gameState.inventoryBuffs.total_multiplier
    );
  }
  return 1;
}

/**
 * Obtém o multiplicador de CPS do inventário
 * @returns {number} Multiplicador
 */
function getInventoryCPSMultiplier() {
  if (gameState && gameState.inventoryBuffs) {
    return (
      gameState.inventoryBuffs.cps_multiplier *
      gameState.inventoryBuffs.total_multiplier
    );
  }
  return 1;
}

/**
 * Obtém o bônus de chance crítica do inventário
 * @returns {number} Bônus de chance crítica
 */
function getInventoryCriticalChance() {
  if (gameState && gameState.inventoryBuffs) {
    return gameState.inventoryBuffs.critical_chance;
  }
  return 0;
}

/**
 * Obtém o multiplicador crítico do inventário
 * @returns {number} Multiplicador crítico
 */
function getInventoryCriticalMultiplier() {
  if (gameState && gameState.inventoryBuffs) {
    return gameState.inventoryBuffs.critical_multiplier;
  }
  return 1;
}

// --- Funções de UI ---

/**
 * Obtém o emoji do item baseado no tema
 * @param {Object} item - Item
 * @returns {string} Emoji
 */
function getItemEmoji(item) {
  if (typeof getCurrentTheme === "function") {
    const theme = getCurrentTheme();
    if (theme && theme.emojis) {
      // Mapeia tipos de buff para emojis do tema
      switch (item.buffType) {
        case "cpc_multiplier":
          return theme.emojis.upgrade || item.icon;
        case "cps_multiplier":
          return theme.emojis.power || item.icon;
        case "critical_chance":
        case "critical_multiplier":
          return theme.emojis.critical || item.icon;
        case "total_multiplier":
          return theme.emojis.coin || item.icon;
        default:
          return item.icon;
      }
    }
  }
  return item.icon;
}

/**
 * Obtém a cor da raridade
 * @param {string} rarity - Raridade do item
 * @returns {string} Classe CSS de cor
 */
function getRarityColor(rarity) {
  switch (rarity) {
    case "common":
      return "text-gray-300 border-gray-500";
    case "uncommon":
      return "text-green-400 border-green-500";
    case "rare":
      return "text-purple-400 border-purple-500";
    default:
      return "text-gray-300 border-gray-500";
  }
}

/**
 * Renderiza a mochila
 */
function renderBag() {
  const container = document.getElementById("bag-container");
  if (!container) {
    return;
  }

  container.innerHTML = "";

  // Mostra slots vazios ou itens
  for (let i = 0; i < bagState.maxSlots; i++) {
    const item = bagState.items[i];
    const slot = document.createElement("div");

    if (item) {
      const emoji = getItemEmoji(item);
      const rarityColor = getRarityColor(item.rarity);

      slot.className = `bag-slot p-2 cursor-pointer ${rarityColor} hover:scale-105`;

      slot.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full">
          <span class="text-xl mb-1 pixel-emoji">${emoji}</span>
          <div class="text-xs font-semibold truncate w-full text-center text-green-300 pixel-text-small">
            ✓
          </div>
        </div>
      `;

      slot.title = `${item.name}\n${item.description}\nClique para remover da mochila`;

      slot.addEventListener("click", () => {
        removeItemFromBag(item.id);
      });

      slot.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        removeItemFromBag(item.id);
      });
    } else {
      slot.className = "bag-slot empty p-2";
      slot.innerHTML = `
        <div class="flex items-center justify-center h-full text-gray-500 text-xs pixel-text-small">
          +
        </div>
      `;
      slot.title = "Slot vazio da mochila";
    }

    container.appendChild(slot);
  }
}

/**
 * Renderiza o inventário
 */
function renderInventory() {
  const container = document.getElementById("inventory-container");
  if (!container) {
    return;
  }

  container.innerHTML = "";

  // Mostra slots vazios ou itens
  for (let i = 0; i < inventoryState.maxSlots; i++) {
    const item = inventoryState.items[i];
    const slot = document.createElement("div");

    if (item) {
      const emoji = getItemEmoji(item);
      const rarityColor = getRarityColor(item.rarity);

      // Verifica se o item está na mochila
      const isInBag = bagState.items.some((bagItem) => bagItem.id === item.id);

      slot.className = `inventory-slot p-2 cursor-pointer ${
        isInBag
          ? "bg-blue-500/20 border-blue-400"
          : `bg-gray-700/50 ${rarityColor}`
      } hover:scale-105`;

      slot.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full">
          <span class="text-xl mb-1 pixel-emoji">${emoji}</span>
          <div class="text-xs font-semibold truncate w-full text-center ${
            isInBag ? "text-blue-300" : ""
          } pixel-text-small">
            ${isInBag ? "📦" : ""}
          </div>
        </div>
      `;

      slot.title = `${item.name}\n${item.description}\n${
        isInBag ? "Na mochila (ativo)" : "Clique para adicionar à mochila"
      }`;

      slot.addEventListener("click", () => {
        if (isInBag) {
          removeItemFromBag(item.id);
        } else {
          addItemToBag(item.id);
        }
      });

      slot.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        if (confirm(`Deseja remover ${item.name} do inventário?`)) {
          removeItemFromInventory(item.id);
        }
      });
    } else {
      slot.className = "inventory-slot p-2";
      slot.innerHTML = `
        <div class="flex items-center justify-center h-full text-gray-500 text-xs pixel-text-small">
          +
        </div>
      `;
    }

    container.appendChild(slot);
  }
}

/**
 * Inicializa o sistema de inventário
 */
function initializeInventory() {
  loadInventory();

  // Garante que itens antigos tenham baseId e migra equipped para mochila
  inventoryState.items.forEach((item) => {
    if (!item.baseId) {
      // Extrai o baseId do id (remove o timestamp)
      const baseIdMatch = item.id.match(/^(.+?)_\d+$/);
      if (baseIdMatch) {
        item.baseId = baseIdMatch[1];
      } else {
        // Se não tem timestamp, usa o próprio id como baseId
        item.baseId = item.id;
      }
    }

    // Migra itens equipados para a mochila (compatibilidade com versão antiga)
    if (item.equipped && bagState.items.length < bagState.maxSlots) {
      const alreadyInBag = bagState.items.some(
        (bagItem) => bagItem.id === item.id
      );
      if (!alreadyInBag) {
        bagState.items.push(item);
      }
      delete item.equipped; // Remove propriedade antiga
    }
  });

  bagState.items.forEach((item) => {
    if (!item.baseId) {
      const baseIdMatch = item.id.match(/^(.+?)_\d+$/);
      if (baseIdMatch) {
        item.baseId = baseIdMatch[1];
      } else {
        item.baseId = item.id;
      }
    }
    delete item.equipped; // Remove propriedade antiga se existir
  });

  // Salva após migração
  saveInventory();

  renderBag();
  renderInventory();

  // Inicializa buffs se gameState existir
  if (typeof gameState !== "undefined" && !gameState.inventoryBuffs) {
    gameState.inventoryBuffs = {
      cpc_multiplier: 1,
      cps_multiplier: 1,
      critical_chance: 0,
      critical_multiplier: 1,
      total_multiplier: 1,
    };
  }

  applyInventoryBuffs();
}
