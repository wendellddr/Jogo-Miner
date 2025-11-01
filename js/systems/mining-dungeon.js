/**
 * mining-dungeon.js
 * Sistema de Cavernas de Mineração para encontrar itens raros
 */

// --- Constantes ---
const DUNGEON_STORAGE_KEY = "coinClickerDungeon";
const DROP_CHANCE_IN_DUNGEON = 0.15; // 15% de chance por sala

// --- Estado da Dungeon ---
let dungeonState = {
  currentFloor: 1,
  currentRoom: 0,
  roomsExplored: 0,
  itemsFound: 0,
  lastEntryTime: 0,
  dungeonActive: false,
  energy: 100, // Energia para explorar
  maxEnergy: 100,
  energyRegen: 1, // Por segundo
  inCombat: false,
  currentEnemy: null,
  playerHP: 100,
  maxPlayerHP: 100,
};

// Definições de Inimigos
const ENEMIES = {
  goblin: {
    name: "Goblin Raivoso",
    icon: "👺",
    hp: 30,
    attack: 5,
    coinReward: 100,
    xpReward: 10,
  },
  skeleton: {
    name: "Esqueleto Guerreiro",
    icon: "💀",
    hp: 50,
    attack: 8,
    coinReward: 200,
    xpReward: 20,
  },
  troll: {
    name: "Troll da Caverna",
    icon: "🧌",
    hp: 80,
    attack: 12,
    coinReward: 400,
    xpReward: 35,
  },
  orc: {
    name: "Orc Bruto",
    icon: "👹",
    hp: 100,
    attack: 15,
    coinReward: 600,
    xpReward: 50,
  },
  zombie: {
    name: "Zumbi Putrefato",
    icon: "🧟",
    hp: 60,
    attack: 10,
    coinReward: 300,
    xpReward: 25,
  },
  vampire: {
    name: "Vampiro Ancião",
    icon: "🧛",
    hp: 120,
    attack: 20,
    coinReward: 800,
    xpReward: 60,
  },
  demon: {
    name: "Demônio Infernal",
    icon: "😈",
    hp: 150,
    attack: 25,
    coinReward: 1000,
    xpReward: 80,
  },
  dragon: {
    name: "Dragão Antigo",
    icon: "🐉",
    hp: 300,
    attack: 40,
    coinReward: 2500,
    xpReward: 150,
  },
  boss: {
    name: "Guardião Lendário",
    icon: "👹",
    hp: 500,
    attack: 50,
    coinReward: 5000,
    xpReward: 300,
  },
};

// Tipos de Salas
const ROOM_TYPES = [
  {
    type: "gem_chamber",
    name: "Câmara de Gemas",
    description: "Brilhos dourados refletem nas paredes!",
    icon: "💎",
    color: "#FFD700",
    itemChance: 0.3,
    energyCost: 20,
  },
  {
    type: "crystal_cave",
    name: "Caverna de Cristais",
    description: "Cristais pulsantes emitem luz mágica!",
    icon: "🔮",
    color: "#00CED1",
    itemChance: 0.25,
    energyCost: 15,
  },
  {
    type: "treasure_hall",
    name: "Salão do Tesouro",
    description: "Um baú antigo espera ser aberto!",
    icon: "🎁",
    color: "#FF6347",
    itemChance: 0.5,
    energyCost: 30,
  },
  {
    type: "deep_mine",
    name: "Minas Profundas",
    description: "O ar é pesado, mas promissor...",
    icon: "⛏️",
    color: "#8B7355",
    itemChance: 0.2,
    energyCost: 10,
  },
  {
    type: "goblin_lair",
    name: "Covil de Goblin",
    description: "Goblins escondem equipamentos roubados!",
    icon: "👺",
    color: "#32CD32",
    itemChance: 0.4,
    energyCost: 25,
  },
  {
    type: "skeleton_chamber",
    name: "Câmara de Esqueletos",
    description: "Espadas enferrujadas espalhadas pelo chão...",
    icon: "💀",
    color: "#708090",
    itemChance: 0.35,
    energyCost: 22,
  },
  {
    type: "dragon_den",
    name: "Covil de Dragão",
    description: "O tesouro de um dragão antigo brilha ao longe!",
    icon: "🐉",
    color: "#FF4500",
    itemChance: 0.6,
    energyCost: 40,
  },
  {
    type: "armory",
    name: "Arsenal Abandonado",
    description: "Armas e armaduras milenares guardadas!",
    icon: "⚔️",
    color: "#8B4513",
    itemChance: 0.45,
    energyCost: 28,
  },
  {
    type: "boss_room",
    name: "Câmara do Guardião",
    description: "Um guardião antigo protege um tesouro lendário!",
    icon: "👹",
    color: "#DC143C",
    itemChance: 1.0,
    energyCost: 50,
  },
  {
    type: "troll_cave",
    name: "Caverna de Troll",
    description: "Um troll dorme profundamente... Cuidado!",
    icon: "🧌",
    color: "#228B22",
    itemChance: 0.42,
    energyCost: 26,
  },
  {
    type: "undead_tomb",
    name: "Tumba dos Mortos-Vivos",
    description: "Zumbis guardam uma cripta antiga...",
    icon: "🧟",
    color: "#556B2F",
    itemChance: 0.38,
    energyCost: 24,
  },
  {
    type: "orc_stronghold",
    name: "Fortaleza Orc",
    description: "Orcs acumulam pilhagem de batalhas!",
    icon: "👹",
    color: "#8B4513",
    itemChance: 0.48,
    energyCost: 32,
  },
  {
    type: "vampire_chamber",
    name: "Câmara Vampírica",
    description: "Um vampiro guarda jóias ancestrais...",
    icon: "🧛",
    color: "#8B0000",
    itemChance: 0.52,
    energyCost: 35,
  },
  {
    type: "demon_lair",
    name: "Covil Demoníaco",
    description: "Demônios guardam armas profanas!",
    icon: "😈",
    color: "#4B0082",
    itemChance: 0.58,
    energyCost: 38,
  },
  {
    type: "merchant_camp",
    name: "Acampamento de Mercadores",
    description: "Mercadores oferecem itens especiais!",
    icon: "🛒",
    color: "#FF8C00",
    itemChance: 0.55,
    energyCost: 30,
  },
  {
    type: "ancient_library",
    name: "Biblioteca Antiga",
    description: "Tomos mágicos aumentam seu poder!",
    icon: "📚",
    color: "#654321",
    itemChance: 0.4,
    energyCost: 25,
  },
  {
    type: "wizard_tower",
    name: "Torre do Mago",
    description: "Relíquias mágicas brilham nas paredes!",
    icon: "🧙",
    color: "#9B59B6",
    itemChance: 0.5,
    energyCost: 28,
  },
  {
    type: "necromancer_lab",
    name: "Laboratório de Necromante",
    description: "Algumas experiências deram certo...",
    icon: "🧪",
    color: "#2F4F4F",
    itemChance: 0.45,
    energyCost: 26,
  },
];

// Mapeamento de inimigos por tipo de sala
const ROOM_ENEMIES = {
  goblin_lair: ["goblin"],
  skeleton_chamber: ["skeleton"],
  troll_cave: ["troll"],
  orc_stronghold: ["orc"],
  undead_tomb: ["zombie"],
  vampire_chamber: ["vampire"],
  demon_lair: ["demon"],
  dragon_den: ["dragon"],
  boss_room: ["boss"],
  merchant_camp: [], // Sem combate
  ancient_library: [], // Sem combate
  wizard_tower: ["skeleton", "demon"],
  necromancer_lab: ["zombie", "skeleton"],
  gem_chamber: ["goblin"],
  crystal_cave: ["skeleton"],
  treasure_hall: ["orc", "troll"],
  deep_mine: ["goblin", "troll"],
  armory: ["skeleton", "zombie"],
};

// --- Funções de Combate ---

/**
 * Inicia combate com um inimigo
 */
function startCombat(enemyType) {
  const enemy = ENEMIES[enemyType];
  if (!enemy) return;
  
  dungeonState.inCombat = true;
  dungeonState.currentEnemy = {
    ...enemy,
    currentHP: enemy.hp,
  };
  
  if (typeof showMessage === "function") {
    showMessage(`⚔️ Combate iniciado! ${enemy.name} ${enemy.icon} apareceu!`, false);
  }
  
  saveDungeon();
  renderDungeonUI();
}

/**
 * Calcula dano do jogador baseado em itens equipados
 */
function calculatePlayerDamage() {
  let damage = 15; // Dano base
  
  if (typeof bagState !== "undefined" && bagState.items) {
    // Cada item equipado aumenta o dano
    damage += bagState.items.length * 8;
    
    // Itens raros dão mais dano
    bagState.items.forEach(item => {
      if (item.rarity === "rare") {
        damage += 15;
      } else if (item.rarity === "uncommon") {
        damage += 8;
      }
    });
  }
  
  return Math.floor(damage);
}

/**
 * Ataque do jogador
 */
function playerAttack() {
  if (!dungeonState.inCombat || !dungeonState.currentEnemy) return;
  
  const damage = calculatePlayerDamage();
  dungeonState.currentEnemy.currentHP -= damage;
  
  if (typeof showMessage === "function") {
    showMessage(`⚔️ Você causou ${damage} de dano!`, false);
  }
  
  // Verifica se o inimigo morreu
  if (dungeonState.currentEnemy.currentHP <= 0) {
    onEnemyDefeated();
  } else {
    // Inimigo contra-ataca
    setTimeout(() => enemyAttack(), 500);
  }
  
  saveDungeon();
  renderDungeonUI();
}

/**
 * Ataque do inimigo
 */
function enemyAttack() {
  if (!dungeonState.inCombat || !dungeonState.currentEnemy) return;
  
  const damage = dungeonState.currentEnemy.attack;
  dungeonState.playerHP -= damage;
  
  if (typeof showMessage === "function") {
    showMessage(`💥 ${dungeonState.currentEnemy.name} causou ${damage} de dano!`, true);
  }
  
  // Verifica se o jogador morreu
  if (dungeonState.playerHP <= 0) {
    onPlayerDefeated();
  }
  
  saveDungeon();
  renderDungeonUI();
}

/**
 * Quando o inimigo é derrotado
 */
function onEnemyDefeated() {
  const enemy = dungeonState.currentEnemy;
  
  dungeonState.inCombat = false;
  
  // Recompensas (escaladas pelo andar da dungeon)
  const floorMultiplier = 1 + (dungeonState.currentFloor - 1) * 0.5; // +50% por andar
  const finalReward = Math.floor(enemy.coinReward * floorMultiplier);
  
  if (typeof gameState !== "undefined") {
    gameState.coins += finalReward;
    if (typeof updateUI === "function") {
      updateUI();
    }
  }
  
  if (typeof showMessage === "function") {
    showMessage(`🎉 ${enemy.name} derrotado! +${finalReward} moedas! (Andar ${dungeonState.currentFloor})`, false);
  }
  
  // Efeitos visuais especiais na derrota do inimigo
  if (typeof createParticles === "function") {
    // Partículas douradas para recompensa
    const container = document.getElementById("dungeon-container");
    if (container) {
      const rect = container.getBoundingClientRect();
      createParticles(8, rect.left + rect.width / 2, rect.top + rect.height / 2, "#FFD700");
    }
  }
  
  dungeonState.currentEnemy = null;
  
  // Rastreia inimigo derrotado
  if (typeof trackStatsEnemyDefeated === "function") {
    trackStatsEnemyDefeated();
  }
  
  // Chance de dropar item após derrotar inimigo (30%)
  if (Math.random() < 0.3) {
    const item = generateDungeonItem(dungeonState.currentFloor);
    if (item && typeof addItemToInventory === "function") {
      addItemToInventory(item);
      
      // Rastreia item encontrado
      if (typeof trackStatsItemFound === "function") {
        trackStatsItemFound();
      }
      
      if (typeof showMessage === "function") {
        setTimeout(() => {
          showMessage(`🎁 Item raro encontrado: ${item.name} ${item.icon}!`, false);
        }, 1000);
      }
      
      // Partículas especiais para item raro
      if (typeof createParticles === "function") {
        const container = document.getElementById("dungeon-container");
        if (container) {
          const rect = container.getBoundingClientRect();
          const color = item.rarity === "rare" ? "#FF1493" : item.rarity === "uncommon" ? "#00FF00" : "#4169E1";
          createParticles(12, rect.left + rect.width / 2, rect.top + rect.height / 2, color);
        }
      }
    }
  }
  
  saveDungeon();
  renderDungeonUI();
}

/**
 * Quando o jogador é derrotado
 */
function onPlayerDefeated() {
  dungeonState.inCombat = false;
  dungeonState.playerHP = 0;
  dungeonState.currentEnemy = null;
  
  if (typeof showMessage === "function") {
    showMessage(`💀 Você foi derrotado! Recuperando...`, true);
  }
  
  // Restaura HP após 5 segundos
  setTimeout(() => {
    dungeonState.playerHP = dungeonState.maxPlayerHP;
    if (typeof showMessage === "function") {
      showMessage(`💚 HP restaurado! Continue explorando!`, false);
    }
    saveDungeon();
    renderDungeonUI();
  }, 5000);
  
  saveDungeon();
  renderDungeonUI();
}

// --- Funções de Persistência ---

function saveDungeon() {
  try {
    localStorage.setItem(DUNGEON_STORAGE_KEY, JSON.stringify(dungeonState));
  } catch (e) {
    console.error("Erro ao salvar dungeon:", e);
  }
}

function loadDungeon() {
  try {
    const saved = localStorage.getItem(DUNGEON_STORAGE_KEY);
    if (saved) {
      dungeonState = { ...dungeonState, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.warn("Erro ao carregar dungeon:", e);
  }
}

// --- Funções de Geração ---

/**
 * Gera uma sala aleatória
 */
function generateRoom() {
  // Boss room a cada 10 salas
  if (dungeonState.currentRoom > 0 && dungeonState.currentRoom % 10 === 0) {
    return ROOM_TYPES.find(r => r.type === "boss_room");
  }
  
  // Seleciona sala aleatória
  const availableRooms = ROOM_TYPES.filter(r => r.type !== "boss_room");
  return availableRooms[Math.floor(Math.random() * availableRooms.length)];
}

/**
 * Explora uma sala na dungeon
 */
function exploreRoom(room) {
  if (dungeonState.energy < room.energyCost) {
    if (typeof showMessage === "function") {
      showMessage("⚡ Energia insuficiente! Aguarde regeneração.", true);
    }
    return null;
  }
  
  // Verifica se há inimigo nesta sala
  const possibleEnemies = ROOM_ENEMIES[room.type] || [];
  
  if (possibleEnemies.length > 0 && !dungeonState.inCombat) {
    // 70% de chance de ter combate
    if (Math.random() < 0.7) {
      const enemyType = possibleEnemies[Math.floor(Math.random() * possibleEnemies.length)];
      startCombat(enemyType);
      return null; // Não explora ainda, espera vencer o combate
    }
  }
  
  dungeonState.energy -= room.energyCost;
  dungeonState.currentRoom++;
  dungeonState.roomsExplored++;
  
  // Recompensa de moedas por explorar sala (escala melhor)
  const coinReward = Math.floor(100 * Math.pow(1.3, dungeonState.currentFloor - 1));
  if (typeof gameState !== "undefined" && gameState.coins !== undefined) {
    gameState.coins += coinReward;
    if (typeof updateUI === "function") {
      updateUI();
    }
  }
  
  // Chance de encontrar item
  const foundItem = Math.random() < room.itemChance;
  
  if (foundItem) {
    dungeonState.itemsFound++;
    
    // Gera item da raridade apropriada
    const item = generateDungeonItem(dungeonState.currentFloor);
    
    if (item && typeof addItemToInventory === "function") {
      addItemToInventory(item);
      
      // Rastreia item encontrado
      if (typeof trackStatsItemFound === "function") {
        trackStatsItemFound();
      }
      
      if (typeof showMessage === "function") {
        showMessage(`🎉 ${room.name}: ${item.name} ${item.icon} +${coinReward} moedas!`, false);
      }
      
      // Partículas coloridas baseadas na raridade do item
      if (typeof createParticles === "function") {
        const container = document.getElementById("dungeon-container");
        if (container) {
          const rect = container.getBoundingClientRect();
          const color = item.rarity === "rare" ? "#FF1493" : item.rarity === "uncommon" ? "#00FF00" : "#4169E1";
          createParticles(10, rect.left + rect.width / 2, rect.top + rect.height / 2, color);
        }
      }
      
      saveDungeon();
      return item;
    }
  } else {
    if (typeof showMessage === "function") {
      showMessage(`🚪 ${room.name}: +${coinReward} moedas coletadas!`, true);
    }
  }
  
  saveDungeon();
  return null;
}

/**
 * Gera item baseado no andar da dungeon
 */
function generateDungeonItem(floor) {
  // Determina raridade baseado no andar
  let rarity;
  const rarityRoll = Math.random();
  
  if (floor <= 5) {
    // Andares 1-5: comum
    rarity = "common";
  } else if (floor <= 15) {
    // Andares 6-15: incomum
    rarity = rarityRoll < 0.7 ? "common" : "uncommon";
  } else {
    // Andares 16+: raro
    if (rarityRoll < 0.5) {
      rarity = "common";
    } else if (rarityRoll < 0.85) {
      rarity = "uncommon";
    } else {
      rarity = "rare";
    }
  }
  
  // Pega pool de items
  const pool = typeof DROP_POOLS !== "undefined" ? DROP_POOLS[rarity] : [];
  if (pool.length === 0) return null;
  
  const randomItemId = pool[Math.floor(Math.random() * pool.length)];
  const itemDef = typeof ITEM_DEFINITIONS !== "undefined" ? ITEM_DEFINITIONS[randomItemId] : null;
  
  if (!itemDef) return null;
  
  return {
    ...itemDef,
    id: `${itemDef.id}_${Date.now()}`,
    baseId: itemDef.id,
  };
}

/**
 * Regenera energia da dungeon
 */
function regenerateDungeonEnergy() {
  if (dungeonState.energy < dungeonState.maxEnergy) {
    dungeonState.energy = Math.min(
      dungeonState.maxEnergy,
      dungeonState.energy + dungeonState.energyRegen
    );
    saveDungeon();
  }
  
  // Regenera HP fora de combate
  if (!dungeonState.inCombat && dungeonState.playerHP < dungeonState.maxPlayerHP) {
    dungeonState.playerHP = Math.min(
      dungeonState.maxPlayerHP,
      dungeonState.playerHP + 2
    );
    saveDungeon();
  }
}

/**
 * Entra na dungeon
 */
function enterDungeon() {
  dungeonState.dungeonActive = true;
  dungeonState.lastEntryTime = Date.now();
  saveDungeon();
  
  // Rastreia entrada na dungeon
  if (typeof trackStatsDungeonEnter === "function") {
    trackStatsDungeonEnter();
  }
  
  if (typeof showMessage === "function") {
    showMessage(`⛏️ Entrando no Andar ${dungeonState.currentFloor}... Boa sorte, minerador!`, false);
  }
  
  renderDungeonUI();
}

/**
 * Sai da dungeon
 */
function exitDungeon() {
  dungeonState.dungeonActive = false;
  saveDungeon();
  
  if (typeof showMessage === "function") {
    showMessage("🚪 Voltou à superfície em segurança!", true);
  }
}

/**
 * Avança para próximo andar
 */
function advanceDungeonFloor() {
  dungeonState.currentFloor++;
  dungeonState.currentRoom = 0;
  dungeonState.energy = dungeonState.maxEnergy;
  dungeonState.energyRegen += 0.1;
  
  // Rastreia maior andar alcançado
  if (typeof trackStatsHighestFloor === "function") {
    trackStatsHighestFloor(dungeonState.currentFloor);
  }
  
  if (typeof showMessage === "function") {
    showMessage(`🔥 Avançou para o Andar ${dungeonState.currentFloor}! Eletricidade no ar...`, false);
  }
  
  saveDungeon();
  renderDungeonUI();
}

/**
 * Renderiza UI da Dungeon
 */
function renderDungeonUI() {
  const container = document.getElementById("dungeon-container");
  if (!container) return;
  
  const currentRoom = generateRoom();
  
  container.innerHTML = `
    <div class="space-y-4">
      <!-- Header da Dungeon -->
      <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border-2 border-gray-600">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-lg font-bold text-white">⛏️ Cavernas de Mineração</h3>
          <div class="text-right">
            <p class="text-sm text-gray-400">Andar</p>
            <p class="text-2xl font-bold text-primary">${dungeonState.currentFloor}</p>
          </div>
        </div>
        
        <!-- Barra de Energia e HP -->
        <div class="mb-3 space-y-2">
          <div>
            <div class="flex justify-between text-xs text-gray-400 mb-1">
              <span>⚡ Energia</span>
              <span>${Math.ceil(dungeonState.energy)} / ${dungeonState.maxEnergy}</span>
            </div>
            <div class="w-full bg-gray-700 rounded-full h-3">
              <div 
                class="bg-blue-500 h-3 rounded-full transition-all duration-300"
                style="width: ${(dungeonState.energy / dungeonState.maxEnergy) * 100}%"
              ></div>
            </div>
          </div>
          <div>
            <div class="flex justify-between text-xs text-gray-400 mb-1">
              <span>❤️ HP</span>
              <span>${dungeonState.playerHP} / ${dungeonState.maxPlayerHP}</span>
            </div>
            <div class="w-full bg-gray-700 rounded-full h-3">
              <div 
                class="bg-red-500 h-3 rounded-full transition-all duration-300"
                style="width: ${(dungeonState.playerHP / dungeonState.maxPlayerHP) * 100}%"
              ></div>
            </div>
          </div>
        </div>
        
        <!-- Estatísticas -->
        <div class="grid grid-cols-3 gap-2 text-center mb-3">
          <div class="bg-gray-700/50 rounded-lg p-2">
            <p class="text-xs text-gray-400">Salas</p>
            <p class="text-lg font-bold text-white">${dungeonState.roomsExplored}</p>
          </div>
          <div class="bg-gray-700/50 rounded-lg p-2">
            <p class="text-xs text-gray-400">Itens</p>
            <p class="text-lg font-bold text-green-400">${dungeonState.itemsFound}</p>
          </div>
          <div class="bg-gray-700/50 rounded-lg p-2">
            <p class="text-xs text-gray-400">Taxa</p>
            <p class="text-lg font-bold text-blue-400">${dungeonState.roomsExplored > 0 ? (dungeonState.itemsFound / dungeonState.roomsExplored * 100).toFixed(0) : 0}%</p>
          </div>
        </div>
        
        <!-- Estatísticas de Buffs Ativos -->
        <div class="bg-gradient-to-br from-green-900/30 to-green-800/20 rounded-lg p-3 border border-green-600/30">
          <p class="text-xs text-green-400 font-bold mb-2">💪 Seu Poder Ativo</p>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div class="flex justify-between">
              <span class="text-gray-400">Itens Equipados:</span>
              <span class="text-green-400 font-bold">${typeof bagState !== "undefined" ? bagState.items.length : 0} / ${typeof bagState !== "undefined" ? bagState.maxSlots : 3}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Multiplicador CPC:</span>
              <span class="text-yellow-400 font-bold">${typeof gameState !== "undefined" && gameState.inventoryBuffs ? (gameState.inventoryBuffs.cpc_multiplier * gameState.inventoryBuffs.total_multiplier * 100).toFixed(0) : 0}%</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Multiplicador CPS:</span>
              <span class="text-blue-400 font-bold">${typeof gameState !== "undefined" && gameState.inventoryBuffs ? (gameState.inventoryBuffs.cps_multiplier * gameState.inventoryBuffs.total_multiplier * 100).toFixed(0) : 0}%</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Chance Crítica:</span>
              <span class="text-red-400 font-bold">+${typeof gameState !== "undefined" && gameState.inventoryBuffs ? (gameState.inventoryBuffs.critical_chance * 100).toFixed(1) : 0}%</span>
            </div>
          </div>
          ${typeof bagState !== "undefined" && bagState.items.length === bagState.maxSlots ? `
            <p class="text-xs text-amber-400 mt-2 text-center">⚠️ Mochila cheia! Equipe seus melhores itens.</p>
          ` : ''}
        </div>
      </div>
      
      <!-- Combate em Andamento -->
      ${dungeonState.inCombat && dungeonState.currentEnemy ? `
        <div class="bg-gradient-to-br from-red-900 to-orange-900 rounded-xl p-4 border-2 border-red-600">
          <p class="text-center text-red-400 font-bold mb-4 text-lg">⚔️ EM COMBATE!</p>
          
          <!-- HP do Inimigo -->
          <div class="bg-gray-800 rounded-lg p-3 mb-3">
            <div class="flex items-center justify-between mb-2">
              <span class="text-2xl">${dungeonState.currentEnemy.icon}</span>
              <span class="text-white font-bold">${dungeonState.currentEnemy.name}</span>
            </div>
            <div class="w-full bg-gray-700 rounded-full h-4 mb-1">
              <div 
                class="bg-red-500 h-4 rounded-full transition-all duration-300"
                style="width: ${(dungeonState.currentEnemy.currentHP / dungeonState.currentEnemy.hp) * 100}%"
              ></div>
            </div>
            <p class="text-xs text-right text-gray-400">${dungeonState.currentEnemy.currentHP} / ${dungeonState.currentEnemy.hp} HP</p>
          </div>
          
          <!-- HP do Jogador -->
          <div class="bg-gray-800 rounded-lg p-3 mb-3">
            <div class="flex items-center justify-between mb-2">
              <span class="text-2xl">⚔️</span>
              <span class="text-white font-bold">Você</span>
            </div>
            <div class="w-full bg-gray-700 rounded-full h-4 mb-1">
              <div 
                class="bg-green-500 h-4 rounded-full transition-all duration-300"
                style="width: ${(dungeonState.playerHP / dungeonState.maxPlayerHP) * 100}%"
              ></div>
            </div>
            <p class="text-xs text-right text-gray-400">${dungeonState.playerHP} / ${dungeonState.maxPlayerHP} HP</p>
          </div>
          
          <button
            id="attack-button"
            class="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-4 rounded-lg transition duration-150 shadow-lg"
          >
            ⚔️ Atacar!
          </button>
        </div>
      ` : `
        <!-- Sala Atual -->
        ${dungeonState.energy >= currentRoom.energyCost ? `
          <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border-2 border-opacity-50 relative overflow-hidden" style="border-color: ${currentRoom.color};">
            <div class="absolute inset-0 bg-gradient-to-br from-transparent to-black opacity-20"></div>
            <div class="relative z-10">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-3">
                  <span class="text-4xl filter drop-shadow-lg">${currentRoom.icon}</span>
                  <div>
                    <h4 class="text-lg font-bold text-white">${currentRoom.name}</h4>
                    <p class="text-xs text-gray-300">${currentRoom.description}</p>
                  </div>
                </div>
              </div>
              
              <div class="bg-black/30 rounded-lg p-3 mb-3">
                <div class="flex justify-between text-sm mb-2">
                  <span class="text-gray-400">Chance de Item:</span>
                  <span class="text-green-400 font-bold">${(currentRoom.itemChance * 100).toFixed(0)}%</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-400">Custo de Energia:</span>
                  <span class="text-red-400 font-bold">-${currentRoom.energyCost}</span>
                </div>
              </div>
              
              <button
                id="explore-room-button"
                class="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-4 rounded-lg transition duration-150 shadow-lg"
              >
                ⛏️ Explorar Sala
              </button>
            </div>
          </div>
        ` : `
          <div class="bg-gray-800 rounded-xl p-4 border-2 border-gray-700">
            <div class="text-center py-4">
              <span class="text-4xl block mb-2">⚡</span>
              <p class="text-gray-400 mb-3">Energia insuficiente!</p>
              <p class="text-xs text-gray-500">Aguarde regeneração ou avance para o próximo andar.</p>
            </div>
          </div>
        `}
      `}
      
      <!-- Botões de Ação -->
      <div class="flex gap-2">
        ${dungeonState.currentRoom >= 10 ? `
          <button
            id="advance-floor-button"
            class="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-2 px-4 rounded-lg transition duration-150 shadow-md"
          >
            🔥 Avançar Andar
          </button>
        ` : ''}
        <button
          id="exit-dungeon-button"
          class="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-150 shadow-md"
        >
          🚪 Sair
        </button>
      </div>
    </div>
  `;
  
  // Event listeners
  const attackBtn = document.getElementById("attack-button");
  if (attackBtn) {
    attackBtn.addEventListener("click", () => {
      playerAttack();
      renderDungeonUI();
      
      if (typeof gameState !== "undefined" && typeof updateUI === "function") {
        updateUI();
      }
    });
  }
  
  const exploreBtn = document.getElementById("explore-room-button");
  if (exploreBtn) {
    exploreBtn.addEventListener("click", () => {
      if (currentRoom) {
        exploreRoom(currentRoom);
        renderDungeonUI();
        
        // Recalcula stats
        if (typeof gameState !== "undefined" && typeof applyInventoryBuffs === "function") {
          applyInventoryBuffs();
          gameState.coinsPerSecond = typeof calculateTotalCPS === "function" ? calculateTotalCPS() : 0;
          gameState.coinsPerClick = typeof calculateTotalCPC === "function" ? calculateTotalCPC() : 0;
          if (typeof updateUI === "function") {
            updateUI();
          }
        }
      }
    });
  }
  
  const advanceBtn = document.getElementById("advance-floor-button");
  if (advanceBtn) {
    advanceBtn.addEventListener("click", () => {
      advanceDungeonFloor();
    });
  }
  
  const exitBtn = document.getElementById("exit-dungeon-button");
  if (exitBtn) {
    exitBtn.addEventListener("click", () => {
      exitDungeon();
      renderDungeonUI();
    });
  }
}

/**
 * Inicializa a sidebar da dungeon
 */
let dungeonSidebarInitialized = false;
function initializeDungeonSidebar() {
  if (dungeonSidebarInitialized) return;
  
  const closeButton = document.getElementById("close-dungeon");
  const sidebar = document.getElementById("dungeon-sidebar");
  const overlay = document.getElementById("dungeon-overlay");

  if (!closeButton || !sidebar || !overlay) return;
  
  dungeonSidebarInitialized = true;

  // Fecha sidebar
  closeButton.addEventListener("click", () => {
    sidebar.classList.add("translate-x-full");
    overlay.classList.add("hidden");
  });

  // Fecha ao clicar no overlay
  overlay.addEventListener("click", () => {
    sidebar.classList.add("translate-x-full");
    overlay.classList.add("hidden");
  });

  // Fecha com ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !sidebar.classList.contains("translate-x-full")) {
      sidebar.classList.add("translate-x-full");
      overlay.classList.add("hidden");
    }
  });
}

/**
 * Inicializa sistema de dungeon
 */
function initializeDungeon() {
  loadDungeon();
  initializeDungeonSidebar();
  
  // Regenera energia periodicamente
  setInterval(() => {
    if (typeof gameState !== "undefined") {
      regenerateDungeonEnergy();
      if (dungeonState.dungeonActive) {
        renderDungeonUI();
      }
    }
  }, 1000);
  
  // Se não entrou na dungeon ainda, renderiza UI inicial
  if (document.getElementById("dungeon-container")) {
    renderDungeonUI();
  }
}

// Exporta funções globais
if (typeof window !== "undefined") {
  window.initializeDungeon = initializeDungeon;
  window.renderDungeonUI = renderDungeonUI;
  window.enterDungeon = enterDungeon;
  window.exitDungeon = exitDungeon;
  window.advanceDungeonFloor = advanceDungeonFloor;
  window.saveDungeon = saveDungeon;
}

