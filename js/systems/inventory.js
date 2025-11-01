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
    icon: "🟢",
    rarity: "common",
    buffType: "cpc_multiplier",
    buffValue: 0.1,
    duration: null, // permanente quando equipado
  },
  crystal_strength: {
    id: "crystal_strength",
    name: "Cristal de Força",
    description: "Aumenta CPC em 25%",
    icon: "🔵",
    rarity: "uncommon",
    buffType: "cpc_multiplier",
    buffValue: 0.25,
    duration: null,
  },
  diamond_might: {
    id: "diamond_might",
    name: "Diamante do Poder",
    description: "Aumenta CPC em 50%",
    icon: "💠",
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
    icon: "⏰",
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
  // Armaduras Medievais
  leather_armor: {
    id: "leather_armor",
    name: "Armadura de Couro",
    description: "Aumenta CPC em 8%",
    icon: "🧶",
    rarity: "common",
    buffType: "cpc_multiplier",
    buffValue: 0.08,
    duration: null,
  },
  steel_plate: {
    id: "steel_plate",
    name: "Armadura de Aço",
    description: "Aumenta CPC em 20%",
    icon: "🛡️",
    rarity: "uncommon",
    buffType: "cpc_multiplier",
    buffValue: 0.2,
    duration: null,
  },
  dragon_scale: {
    id: "dragon_scale",
    name: "Armadura de Escamas de Dragão",
    description: "Aumenta CPC em 45%",
    icon: "🐉",
    rarity: "rare",
    buffType: "cpc_multiplier",
    buffValue: 0.45,
    duration: null,
  },
  // Armas Medievais
  iron_sword: {
    id: "iron_sword",
    name: "Espada de Ferro",
    description: "Aumenta CPS em 12%",
    icon: "🗡️",
    rarity: "common",
    buffType: "cps_multiplier",
    buffValue: 0.12,
    duration: null,
  },
  steel_blade: {
    id: "steel_blade",
    name: "Lâmina de Aço",
    description: "Aumenta CPS em 28%",
    icon: "⚔️",
    rarity: "uncommon",
    buffType: "cps_multiplier",
    buffValue: 0.28,
    duration: null,
  },
  legendary_sword: {
    id: "legendary_sword",
    name: "Espada Lendária",
    description: "Aumenta CPS em 55%",
    icon: "🗡️",
    rarity: "rare",
    buffType: "cps_multiplier",
    buffValue: 0.55,
    duration: null,
  },
  // Arcos
  oak_bow: {
    id: "oak_bow",
    name: "Arco de Carvalho",
    description: "Aumenta chance crítica em 3%",
    icon: "🏹",
    rarity: "common",
    buffType: "critical_chance",
    buffValue: 0.03,
    duration: null,
  },
  elven_bow: {
    id: "elven_bow",
    name: "Arco Élfico",
    description: "Aumenta chance crítica em 6%",
    icon: "🏹",
    rarity: "uncommon",
    buffType: "critical_chance",
    buffValue: 0.06,
    duration: null,
  },
  // Escudos
  wooden_shield: {
    id: "wooden_shield",
    name: "Escudo de Madeira",
    description: "Aumenta multiplicador crítico em 25%",
    icon: "🛡️",
    rarity: "common",
    buffType: "critical_multiplier",
    buffValue: 0.25,
    duration: null,
  },
  steel_shield: {
    id: "steel_shield",
    name: "Escudo de Aço",
    description: "Aumenta multiplicador crítico em 55%",
    icon: "🛡️",
    rarity: "uncommon",
    buffType: "critical_multiplier",
    buffValue: 0.55,
    duration: null,
  },
  // Acessórios Medievais
  knights_ring: {
    id: "knights_ring",
    name: "Anel do Cavaleiro",
    description: "Aumenta ganho total em 8%",
    icon: "💍",
    rarity: "uncommon",
    buffType: "total_multiplier",
    buffValue: 0.08,
    duration: null,
  },
  // MAIS ARMADURAS
  chain_mail: {
    id: "chain_mail",
    name: "Cota de Malha",
    description: "Aumenta CPC em 12%",
    icon: "🛡️",
    rarity: "common",
    buffType: "cpc_multiplier",
    buffValue: 0.12,
    duration: null,
  },
  mithril_armor: {
    id: "mithril_armor",
    name: "Armadura de Mithril",
    description: "Aumenta CPC em 30%",
    icon: "🛡️",
    rarity: "uncommon",
    buffType: "cpc_multiplier",
    buffValue: 0.3,
    duration: null,
  },
  demonic_plate: {
    id: "demonic_plate",
    name: "Armadura Demoníaca",
    description: "Aumenta CPC em 60%",
    icon: "🛡️",
    rarity: "rare",
    buffType: "cpc_multiplier",
    buffValue: 0.6,
    duration: null,
  },
  // MAIS ARMAS - ESPADAS
  bronze_sword: {
    id: "bronze_sword",
    name: "Espada de Bronze",
    description: "Aumenta CPS em 8%",
    icon: "🗡️",
    rarity: "common",
    buffType: "cps_multiplier",
    buffValue: 0.08,
    duration: null,
  },
  mithril_sword: {
    id: "mithril_sword",
    name: "Espada de Mithril",
    description: "Aumenta CPS em 35%",
    icon: "🗡️",
    rarity: "uncommon",
    buffType: "cps_multiplier",
    buffValue: 0.35,
    duration: null,
  },
  excalibur: {
    id: "excalibur",
    name: "Excalibur",
    description: "Aumenta CPS em 70%",
    icon: "⚔️",
    rarity: "rare",
    buffType: "cps_multiplier",
    buffValue: 0.7,
    duration: null,
  },
  // MAIS ARMAS - MACHADOS
  iron_axe: {
    id: "iron_axe",
    name: "Machado de Ferro",
    description: "Aumenta CPS em 10%",
    icon: "🪓",
    rarity: "common",
    buffType: "cps_multiplier",
    buffValue: 0.1,
    duration: null,
  },
  war_axe: {
    id: "war_axe",
    name: "Machado de Guerra",
    description: "Aumenta CPS em 25%",
    icon: "🪓",
    rarity: "uncommon",
    buffType: "cps_multiplier",
    buffValue: 0.25,
    duration: null,
  },
  dragonslayer_axe: {
    id: "dragonslayer_axe",
    name: "Machado Matador de Dragões",
    description: "Aumenta CPS em 65%",
    icon: "🪓",
    rarity: "rare",
    buffType: "cps_multiplier",
    buffValue: 0.65,
    duration: null,
  },
  // MAIS ARCOS
  longbow: {
    id: "longbow",
    name: "Arco Longo",
    description: "Aumenta chance crítica em 2%",
    icon: "🏹",
    rarity: "common",
    buffType: "critical_chance",
    buffValue: 0.02,
    duration: null,
  },
  dragonslayer_bow: {
    id: "dragonslayer_bow",
    name: "Arco Matador de Dragões",
    description: "Aumenta chance crítica em 8%",
    icon: "🏹",
    rarity: "rare",
    buffType: "critical_chance",
    buffValue: 0.08,
    duration: null,
  },
  // MAIS ESCUDOS
  iron_shield: {
    id: "iron_shield",
    name: "Escudo de Ferro",
    description: "Aumenta multiplicador crítico em 30%",
    icon: "🛡️",
    rarity: "common",
    buffType: "critical_multiplier",
    buffValue: 0.3,
    duration: null,
  },
  tower_shield: {
    id: "tower_shield",
    name: "Escudo Torre",
    description: "Aumenta multiplicador crítico em 60%",
    icon: "🛡️",
    rarity: "uncommon",
    buffType: "critical_multiplier",
    buffValue: 0.6,
    duration: null,
  },
  aegis_shield: {
    id: "aegis_shield",
    name: "Égide Sagrada",
    description: "Aumenta multiplicador crítico em 80%",
    icon: "🛡️",
    rarity: "rare",
    buffType: "critical_multiplier",
    buffValue: 0.8,
    duration: null,
  },
  // LANÇAS
  spear: {
    id: "spear",
    name: "Lança de Caça",
    description: "Aumenta CPS em 9%",
    icon: "🔱",
    rarity: "common",
    buffType: "cps_multiplier",
    buffValue: 0.09,
    duration: null,
  },
  trident: {
    id: "trident",
    name: "Tridente do Nereu",
    description: "Aumenta CPS em 32%",
    icon: "🔱",
    rarity: "uncommon",
    buffType: "cps_multiplier",
    buffValue: 0.32,
    duration: null,
  },
  // CATAPULTAS/BALISTAS
  crossbow: {
    id: "crossbow",
    name: "Besta",
    description: "Aumenta chance crítica em 4%",
    icon: "🏹",
    rarity: "uncommon",
    buffType: "critical_chance",
    buffValue: 0.04,
    duration: null,
  },
  // CACHIMBOS/CAPACETES
  leather_helm: {
    id: "leather_helm",
    name: "Capacete de Couro",
    description: "Aumenta CPC em 6%",
    icon: "⛑️",
    rarity: "common",
    buffType: "cpc_multiplier",
    buffValue: 0.06,
    duration: null,
  },
  knights_helm: {
    id: "knights_helm",
    name: "Capacete de Cavaleiro",
    description: "Aumenta CPC em 18%",
    icon: "🪖",
    rarity: "uncommon",
    buffType: "cpc_multiplier",
    buffValue: 0.18,
    duration: null,
  },
  crown_of_kings: {
    id: "crown_of_kings",
    name: "Coroa Real",
    description: "Aumenta CPC em 40%",
    icon: "👑",
    rarity: "rare",
    buffType: "cpc_multiplier",
    buffValue: 0.4,
    duration: null,
  },
  // MARTELOS/MACAS
  war_hammer: {
    id: "war_hammer",
    name: "Martelo de Guerra",
    description: "Aumenta CPS em 14%",
    icon: "🔨",
    rarity: "common",
    buffType: "cps_multiplier",
    buffValue: 0.14,
    duration: null,
  },
  mjolnir: {
    id: "mjolnir",
    name: "Mjölnir",
    description: "Aumenta CPS em 75%",
    icon: "🔨",
    rarity: "rare",
    buffType: "cps_multiplier",
    buffValue: 0.75,
    duration: null,
  },
  // MANTOS/CAPAS
  mage_cloak: {
    id: "mage_cloak",
    name: "Manto do Mago",
    description: "Aumenta ganho total em 10%",
    icon: "🧙",
    rarity: "uncommon",
    buffType: "total_multiplier",
    buffValue: 0.1,
    duration: null,
  },
  shadow_cloak: {
    id: "shadow_cloak",
    name: "Manto das Sombras",
    description: "Aumenta ganho total em 20%",
    icon: "🦇",
    rarity: "rare",
    buffType: "total_multiplier",
    buffValue: 0.2,
    duration: null,
  },
  // ANÉIS
  ring_of_power: {
    id: "ring_of_power",
    name: "Anel do Poder",
    description: "Aumenta ganho total em 12%",
    icon: "💍",
    rarity: "uncommon",
    buffType: "total_multiplier",
    buffValue: 0.12,
    duration: null,
  },
  one_ring: {
    id: "one_ring",
    name: "O Um Anel",
    description: "Aumenta ganho total em 25%",
    icon: "💍",
    rarity: "rare",
    buffType: "total_multiplier",
    buffValue: 0.25,
    duration: null,
  },
  // BOTAS
  travelers_boots: {
    id: "travelers_boots",
    name: "Botas do Viajante",
    description: "Aumenta CPS em 7%",
    icon: "👢",
    rarity: "common",
    buffType: "cps_multiplier",
    buffValue: 0.07,
    duration: null,
  },
  winged_boots: {
    id: "winged_boots",
    name: "Botas Aladas",
    description: "Aumenta CPS em 40%",
    icon: "👢",
    rarity: "rare",
    buffType: "cps_multiplier",
    buffValue: 0.4,
    duration: null,
  },
  // LUVAS
  gauntlets: {
    id: "gauntlets",
    name: "Manoplas de Ferro",
    description: "Aumenta CPC em 7%",
    icon: "🥊",
    rarity: "common",
    buffType: "cpc_multiplier",
    buffValue: 0.07,
    duration: null,
  },
  power_gauntlets: {
    id: "power_gauntlets",
    name: "Manoplas do Poder",
    description: "Aumenta CPC em 35%",
    icon: "💪",
    rarity: "rare",
    buffType: "cpc_multiplier",
    buffValue: 0.35,
    duration: null,
  },
  // ARMADURAS COMPLETAS
  paladin_armor: {
    id: "paladin_armor",
    name: "Armadura de Paladino",
    description: "Aumenta CPC em 50%",
    icon: "🛡️",
    rarity: "rare",
    buffType: "cpc_multiplier",
    buffValue: 0.5,
    duration: null,
  },
  berserker_armor: {
    id: "berserker_armor",
    name: "Armadura de Berserker",
    description: "Aumenta CPC em 55%",
    icon: "🛡️",
    rarity: "rare",
    buffType: "cpc_multiplier",
    buffValue: 0.55,
    duration: null,
  },
};

// Pool de drops por raridade (apenas itens mágicos antigos, para drops gerais)
const DROP_POOLS_GENERAL = {
  common: ["gem_power", "speed_crystal", "crit_charm", "power_ring"],
  uncommon: ["crystal_strength", "time_gem", "lucky_clover", "coin_magnet", "chaos_orb"],
  rare: ["diamond_might", "infinity_stone", "fate_dice", "multiplier_gem"],
};

// Pool de drops por raridade (apenas itens RPG da dungeon)
const DROP_POOLS = {
  common: [
    "leather_armor", "iron_sword", "oak_bow", "wooden_shield",
    "chain_mail", "bronze_sword", "iron_axe", "longbow", "iron_shield",
    "spear", "leather_helm", "war_hammer", "travelers_boots", "gauntlets"
  ],
  uncommon: [
    "steel_plate", "steel_blade", "elven_bow", "steel_shield", "knights_ring",
    "mithril_armor", "mithril_sword", "war_axe", "crossbow", "tower_shield",
    "trident", "knights_helm", "mage_cloak", "ring_of_power"
  ],
  rare: [
    "dragon_scale", "legendary_sword", "demonic_plate", "excalibur",
    "dragonslayer_axe", "dragonslayer_bow", "aegis_shield", "crown_of_kings",
    "mjolnir", "shadow_cloak", "one_ring", "winged_boots", "power_gauntlets",
    "paladin_armor", "berserker_armor"
  ],
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
 * Obtém o emoji/imagem do item baseado no tema
 * @param {Object} item - Item
 * @returns {string} Emoji ou HTML de imagem
 */
function getItemEmoji(item) {
  // Se o item tem uma imagem customizada explícita, retorna HTML da imagem
  if (item.image) {
    return `<img src="${item.image}" alt="${item.name}" class="w-full h-full object-contain" />`;
  }
  
  // Tenta carregar automaticamente de assets/items/[id].png
  const imagePath = `assets/items/${item.id}.png`;
  
  // Cria uma imagem de teste para verificar se existe
  const testImg = new Image();
  testImg.src = imagePath;
  
  // Usa a imagem se estiver disponível (não é 100% perfeito, mas funciona para a maioria dos casos)
  // Por simplicidade, sempre tenta primeiro a imagem e deixa o CSS fallback do emoji
  return `<img src="${imagePath}" alt="${item.name}" class="w-full h-full object-contain item-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-block';" /><span style="display:none;">${item.icon}</span>`;
}

// Versão simplificada para compatibilidade: apenas retorna emoji como string pura
function getItemEmojiText(item) {
  // Se o item tem uma imagem customizada explícita, retorna o emoji fallback
  if (item.image) {
    return item.icon;
  }
  
  // Caso contrário, usa o sistema de emojis
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
          <span class="text-xl mb-1 item-icon">${emoji}</span>
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
 * Calcula valor de venda baseado na raridade
 */
function calculateSellPrice(item) {
  let basePrice = 100;
  
  // Multiplicador baseado na raridade
  switch (item.rarity) {
    case "rare":
      basePrice = 5000;
      break;
    case "uncommon":
      basePrice = 1500;
      break;
    case "common":
      basePrice = 500;
      break;
    default:
      basePrice = 200;
  }
  
  // Bonus baseado no buffValue
  if (item.buffValue) {
    const buffBonus = Math.floor(item.buffValue * 100);
    basePrice += buffBonus * 10;
  }
  
  return basePrice;
}

/**
 * Renderiza inventário na sidebar moderna
 */
function renderInventorySidebar() {
  const container = document.getElementById("inventory-sidebar-content");
  if (!container) return;
  
  const emptySlots = inventoryState.maxSlots - inventoryState.items.length;
  
  container.innerHTML = `
    <div class="space-y-4">
      <!-- Info -->
      <div class="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 rounded-xl p-4 border border-indigo-600/30">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-lg font-bold text-indigo-300">📊 Inventário</h3>
          <span class="text-sm text-indigo-400">${inventoryState.items.length}/${inventoryState.maxSlots}</span>
        </div>
      </div>
      
      <!-- Grid de Itens -->
      <div class="grid grid-cols-3 gap-3">
        ${inventoryState.items.map((item, index) => {
          const isInBag = bagState.items.some((bagItem) => bagItem.id === item.id);
          const emoji = getItemEmoji(item);
          const rarityColor = getRarityColor(item.rarity);
          
          let rarityClass = "";
          if (item.rarity === "rare") rarityClass = "inventory-item-rare";
          else if (item.rarity === "uncommon") rarityClass = "inventory-item-uncommon";
          
          const borderClass = rarityColor.split(" ")[1] || "border-gray-500"; // Pega apenas a classe de borda
          
          return `
            <div 
              class="inventory-item inventory-item-entering bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-xl p-3 ${borderClass} cursor-pointer transition-all duration-200 hover:scale-105 ${
                isInBag ? "border-blue-400 bg-blue-500/20" : ""
              } ${rarityClass}"
              data-item-index="${index}"
              style="animation-delay: ${index * 0.05}s;"
            >
              <div class="flex flex-col items-center justify-center text-center">
                <div class="text-4xl mb-2 item-icon">${emoji}</div>
                <div class="text-xs font-bold text-white truncate w-full">${item.name}</div>
                ${isInBag ? '<div class="text-xs text-blue-300 mt-1">📦 Equipado</div>' : ''}
              </div>
            </div>
          `;
        }).join("")}
        
        ${Array(emptySlots).fill(0).map((_, index) => `
          <div class="bg-gray-800/30 rounded-xl p-3 border-2 border-gray-700">
            <div class="flex items-center justify-center h-full text-gray-500 text-xs">
              Vazio
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
  
  // Adiciona event listeners
  inventoryState.items.forEach((item, index) => {
    const element = container.querySelector(`[data-item-index="${index}"]`);
    if (element) {
      element.addEventListener("click", () => {
        showItemActionModal(item);
      });
    }
  });
}

/**
 * Mostra modal de ação para item
 */
function showItemActionModal(item) {
  const modal = document.getElementById("item-action-modal");
  const icon = document.getElementById("item-action-icon");
  const name = document.getElementById("item-action-name");
  const description = document.getElementById("item-action-description");
  const stats = document.getElementById("item-action-stats");
  const equipButton = document.getElementById("item-action-equip-button");
  const sellButton = document.getElementById("item-action-sell-button");
  const cancelButton = document.getElementById("item-action-cancel-button");
  
  if (!modal) return;
  
  const emoji = getItemEmoji(item);
  const isInBag = bagState.items.some((bagItem) => bagItem.id === item.id);
  const sellPrice = calculateSellPrice(item);
  
  icon.innerHTML = `<span class="item-icon">${emoji}</span>`;
  name.textContent = item.name;
  description.textContent = item.description;
  
  // Stats
  let statsHtml = `<div class="text-left space-y-1">`;
  statsHtml += `<div class="text-xs text-gray-400">Raridade: <span class="font-bold text-${getRarityTextColor(item.rarity)}">${getRarityDisplayName(item.rarity)}</span></div>`;
  if (item.buffType) {
    const buffIcon = item.buffType.includes("cpc") ? "👆" : item.buffType.includes("cps") ? "⚡" : "💥";
    statsHtml += `<div class="text-xs text-gray-400">Bônus: <span class="font-bold text-yellow-300">${buffIcon} +${(item.buffValue * 100).toFixed(0)}%</span></div>`;
  }
  statsHtml += `</div>`;
  stats.innerHTML = statsHtml;
  
  // Configura botões
  if (isInBag) {
    equipButton.textContent = "❌ Desequipar";
    equipButton.classList.remove("from-blue-600", "to-blue-700");
    equipButton.classList.add("from-red-600", "to-red-700");
  } else {
    const bagFull = bagState.items.length >= bagState.maxSlots;
    if (bagFull) {
      equipButton.textContent = "📦 Mochila Cheia";
      equipButton.disabled = true;
      equipButton.classList.add("opacity-50", "cursor-not-allowed");
    } else {
      equipButton.textContent = "✅ Equipar";
      equipButton.disabled = false;
      equipButton.classList.remove("opacity-50", "cursor-not-allowed");
    }
    equipButton.classList.remove("from-red-600", "to-red-700");
    equipButton.classList.add("from-blue-600", "to-blue-700");
  }
  
  sellButton.innerHTML = `💰 Vender: ${typeof formatNumber !== "undefined" ? formatNumber(sellPrice) : sellPrice.toLocaleString()}`;
  
  // Remove listeners antigos e adiciona novos
  const newEquipButton = equipButton.cloneNode(true);
  equipButton.parentNode.replaceChild(newEquipButton, equipButton);
  
  const newSellButton = sellButton.cloneNode(true);
  sellButton.parentNode.replaceChild(newSellButton, sellButton);
  
  const newCancelButton = cancelButton.cloneNode(true);
  cancelButton.parentNode.replaceChild(newCancelButton, cancelButton);
  
  newEquipButton.addEventListener("click", () => {
    if (isInBag) {
      removeItemFromBag(item.id);
    } else {
      addItemToBag(item.id);
    }
    modal.classList.add("hidden");
    renderInventorySidebar();
    renderBag();
  });
  
  newSellButton.addEventListener("click", () => {
    sellItem(item);
    modal.classList.add("hidden");
  });
  
  newCancelButton.addEventListener("click", () => {
    modal.classList.add("hidden");
  });
  
  modal.classList.remove("hidden");
}

/**
 * Vende um item
 */
function sellItem(item) {
  const sellPrice = calculateSellPrice(item);
  
  // Remove da mochila se estiver equipado
  const isInBag = bagState.items.some((bagItem) => bagItem.id === item.id);
  if (isInBag) {
    removeItemFromBag(item.id);
  }
  
  // Remove do inventário
  removeItemFromInventory(item.id);
  
  // Adiciona moedas
  if (typeof gameState !== "undefined" && gameState.coins !== undefined) {
    gameState.coins += sellPrice;
    if (typeof updateUI === "function") {
      updateUI();
    }
    if (typeof saveGame === "function") {
      saveGame();
    }
  }
  
  // Mostra feedback
  if (typeof showMessage === "function") {
    showMessage(`💰 ${item.name} vendido por ${typeof formatNumber !== "undefined" ? formatNumber(sellPrice) : sellPrice.toLocaleString()} moedas!`, false);
  }
  
  // Efeitos visuais
  if (typeof createParticles === "function") {
    const modal = document.getElementById("item-action-modal");
    if (modal) {
      const rect = modal.getBoundingClientRect();
      createParticles(15, rect.left + rect.width / 2, rect.top + rect.height / 2, "#FFD700");
    }
  }
  
  renderInventorySidebar();
  renderBag();
}

/**
 * Retorna nome de exibição da raridade
 */
function getRarityDisplayName(rarity) {
  switch (rarity) {
    case "rare":
      return "Raro";
    case "uncommon":
      return "Incomum";
    case "common":
      return "Comum";
    default:
      return "Normal";
  }
}

/**
 * Retorna cor de texto da raridade
 */
function getRarityTextColor(rarity) {
  switch (rarity) {
    case "rare":
      return "pink-400";
    case "uncommon":
      return "green-400";
    case "common":
      return "blue-400";
    default:
      return "gray-400";
  }
}

/**
 * Inicializa sidebar de inventário
 */
function initializeInventorySidebar() {
  const sidebar = document.getElementById("inventory-sidebar");
  const overlay = document.getElementById("inventory-overlay");
  const closeBtn = document.getElementById("close-inventory");
  const openBtn = document.getElementById("open-inventory-button");
  
  if (!sidebar || !overlay || !closeBtn) return;
  
  // Abre sidebar
  if (openBtn) {
    openBtn.addEventListener("click", () => {
      sidebar.classList.remove("translate-x-full");
      overlay.classList.remove("hidden");
      renderInventorySidebar();
    });
  }
  
  // Fecha sidebar
  closeBtn.addEventListener("click", () => {
    sidebar.classList.add("translate-x-full");
    overlay.classList.add("hidden");
  });
  
  overlay.addEventListener("click", () => {
    sidebar.classList.add("translate-x-full");
    overlay.classList.add("hidden");
  });
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
  
  // Inicializa sidebar moderna
  if (!window.inventorySidebarInitialized) {
    window.inventorySidebarInitialized = true;
    initializeInventorySidebar();
  }

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

// Exporta funções globais
if (typeof window !== "undefined") {
  window.ITEM_DEFINITIONS = ITEM_DEFINITIONS;
  window.DROP_POOLS = DROP_POOLS;
}