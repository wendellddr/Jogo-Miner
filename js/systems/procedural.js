/**
 * procedural.js
 * Sistema Procedural de Geração Infinita de Conteúdo
 */

// --- Estado do Sistema Procedural ---
let proceduralState = {
  machines: [], // Máquinas proceduralmente geradas
  missions: [], // Missões ativas
  events: [], // Eventos ativos
  progressionTier: 1, // Tier atual de progressão
  pointsSpent: 0, // Pontos gastos nesta tier
};

const PROCEDURAL_STORAGE_KEY = "coinClickerProcedural";

// --- Configuração de Procedural ---
const PROCEDURAL_CONFIG = {
  TIER_BASE_COST: 1000000, // Custo base para próxima tier
  TIER_COST_MULTIPLIER: 2.5, // Multiplicador de custo por tier
  MACHINES_PER_TIER: 5, // Máquinas geradas por tier
  MISSION_DURATION: 86400000, // 24 horas em ms
  EVENT_CHANCE: 0.0001, // Chance de evento por tick (1 em 10000)
  MAX_ACTIVE_EVENTS: 2, // Máximo de eventos simultâneos
};

// --- Tipos de Máquinas Procedurais ---
const MACHINE_TYPES = [
  { name: "Enhancer", suffix: ["Alpha", "Beta", "Gamma", "Delta", "Prime"], multiplier: 1.2 },
  { name: "Optimizer", suffix: ["I", "II", "III", "IV", "V"], multiplier: 1.15 },
  { name: "Amplifier", suffix: ["MK1", "MK2", "MK3", "MK4", "MK5"], multiplier: 1.25 },
  { name: "Processor", suffix: ["V1", "V2", "V3", "V4", "V5"], multiplier: 1.18 },
  { name: "Generator", suffix: ["Type-A", "Type-B", "Type-C", "Type-D", "Type-E"], multiplier: 1.3 },
];

const MACHINE_ICONS = ["⚙️", "🔧", "💠", "🛠️", "⚡", "🔨", "⚒️", "🪛", "🔩", "🗜️"];
const MACHINE_COLORS = ["#FFC300", "#00FFFF", "#FF1493", "#00FF00", "#FF00FF", "#FFFF00", "#FF4500", "#9400D3", "#FF69B4", "#1E90FF"];

/**
 * Gera máquinas proceduralmente baseado na tier atual
 */
function generateProceduralMachines(tier) {
  const machines = [];
  const machinesPerType = Math.ceil(PROCEDURAL_CONFIG.MACHINES_PER_TIER / MACHINE_TYPES.length);
  
  MACHINE_TYPES.forEach((type, typeIndex) => {
    for (let i = 0; i < machinesPerType; i++) {
      const machineIndex = tier * machinesPerType + i;
      const suffixIndex = Math.floor(machineIndex % type.suffix.length);
      
      const baseCost = PROCEDURAL_CONFIG.TIER_BASE_COST * Math.pow(10, tier + 1);
      const baseGain = 1000 * Math.pow(type.multiplier, tier + i);
      
      const machine = {
        id: `machine_${tier}_${typeIndex}_${i}`,
        name: `${type.name} ${type.suffix[suffixIndex]}`,
        description: `Maquinário avançado que aumenta produção em ${(baseGain / 10).toFixed(0)}%.`,
        icon: MACHINE_ICONS[(tier + typeIndex + i) % MACHINE_ICONS.length],
        color: MACHINE_COLORS[(tier + typeIndex) % MACHINE_COLORS.length],
        tier: tier,
        machineType: typeIndex,
        baseCost: baseCost,
        costMultiplier: 1.1 + (tier * 0.01),
        baseGain: baseGain,
        level: 0,
        upgradeType: "auto",
      };
      
      machines.push(machine);
    }
  });
  
  return machines;
}

/**
 * Carrega estado procedural
 */
function loadProcedural() {
  try {
    const saved = localStorage.getItem(PROCEDURAL_STORAGE_KEY);
    if (saved) {
      proceduralState = JSON.parse(saved);
    }
  } catch (e) {
    console.error("Erro ao carregar estado procedural:", e);
  }
}

/**
 * Salva estado procedural
 */
function saveProcedural() {
  try {
    localStorage.setItem(PROCEDURAL_STORAGE_KEY, JSON.stringify(proceduralState));
  } catch (e) {
    console.error("Erro ao salvar estado procedural:", e);
  }
}

/**
 * Inicializa sistema procedural
 */
function initializeProcedural() {
  loadProcedural();
  
  // Gera máquinas para todas as tiers até a atual
  for (let tier = 1; tier <= proceduralState.progressionTier; tier++) {
    if (!proceduralState.machines.find(m => m.tier === tier)) {
      const newMachines = generateProceduralMachines(tier);
      proceduralState.machines.push(...newMachines);
    }
  }
  
  saveProcedural();
  renderProceduralUI();
}

/**
 * Renderiza UI procedural
 */
function renderProceduralUI() {
  const container = document.getElementById("procedural-container");
  if (!container) return;
  
  // Renderiza máquinas da tier atual
  const currentTierMachines = proceduralState.machines.filter(m => m.tier === proceduralState.progressionTier);
  
  let machinesHtml = "";
  currentTierMachines.forEach((machine) => {
    const cost = machine.baseCost * Math.pow(machine.costMultiplier, machine.level);
    const canAfford = gameState.coins >= cost;
    
    machinesHtml += `
      <div class="bg-dark-card p-4 rounded-lg flex items-center justify-between border border-gray-700 hover:border-${machine.color.replace('#', '')}" style="border-color: ${machine.color};">
        <div class="flex items-center space-x-3">
          <span class="text-4xl">${machine.icon}</span>
          <div>
            <p class="font-bold text-white">${machine.name}</p>
            <p class="text-xs text-gray-400">${machine.description}</p>
            <p class="text-xs text-gray-500">Tier ${machine.tier} • Nível ${machine.level}</p>
          </div>
        </div>
        <button
          class="buy-machine-button bg-primary hover:bg-yellow-400 text-dark-bg font-bold py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          data-machine-id="${machine.id}"
          ${!canAfford ? "disabled" : ""}
        >
          ${formatNumber(cost)}
        </button>
      </div>
    `;
  });
  
  const nextTierCost = PROCEDURAL_CONFIG.TIER_BASE_COST * Math.pow(PROCEDURAL_CONFIG.TIER_COST_MULTIPLIER, proceduralState.progressionTier);
  const canUnlockTier = gameState.coins >= nextTierCost;
  
  container.innerHTML = `
    <div class="bg-dark-card p-6 rounded-xl shadow-2xl">
      <h2 class="text-2xl font-bold mb-4 text-primary border-b border-primary/50 pb-2 flex items-center space-x-2">
        <span>♾️</span>
        <span>Sistema Procedural (Tier ${proceduralState.progressionTier})</span>
      </h2>
      
      <div class="bg-blue-900/20 border border-blue-600 rounded-lg p-4 mb-4">
        <p class="text-sm text-gray-300">
          Este sistema gera conteúdo infinito! Quanto mais você progride, mais máquinas poderosas são desbloqueadas.
        </p>
      </div>
      
      <div class="bg-purple-900/20 border border-purple-600 rounded-lg p-4 mb-4 flex items-center justify-between">
        <div>
          <p class="text-sm font-bold text-white">Desbloquear Próxima Tier</p>
          <p class="text-xs text-gray-400">Custo: ${formatNumber(nextTierCost)} moedas</p>
        </div>
        <button
          id="unlock-tier-button"
          class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          ${!canUnlockTier ? "disabled" : ""}
        >
          Desbloquear Tier ${proceduralState.progressionTier + 1}
        </button>
      </div>
      
      <h3 class="text-xl font-bold text-purple-300 mb-3 mt-6 border-b border-gray-700 pb-2">
        Máquinas da Tier ${proceduralState.progressionTier}
      </h3>
      <div class="space-y-3">
        ${machinesHtml}
      </div>
    </div>
  `;
  
  // Adiciona listeners
  document.getElementById("unlock-tier-button")?.addEventListener("click", unlockNextTier);
  
  document.querySelectorAll(".buy-machine-button").forEach((button) => {
    button.addEventListener("click", (e) => {
      const machineId = e.target.dataset.machineId;
      buyProceduralMachine(machineId);
    });
  });
}

/**
 * Desbloqueia próxima tier
 */
function unlockNextTier() {
  const nextTierCost = PROCEDURAL_CONFIG.TIER_BASE_COST * Math.pow(PROCEDURAL_CONFIG.TIER_COST_MULTIPLIER, proceduralState.progressionTier);
  
  if (gameState.coins < nextTierCost) {
    alert("Moedas insuficientes!");
    return;
  }
  
  gameState.coins -= nextTierCost;
  proceduralState.progressionTier++;
  
  // Gera máquinas para nova tier
  const newMachines = generateProceduralMachines(proceduralState.progressionTier);
  proceduralState.machines.push(...newMachines);
  
  saveProcedural();
  renderProceduralUI();
  
  if (typeof updateUI === "function") {
    updateUI();
  }
  
  showMessage(`🎉 Tier ${proceduralState.progressionTier} desbloqueada! Novas máquinas disponíveis!`, true);
}

/**
 * Compra uma máquina procedural
 */
function buyProceduralMachine(machineId) {
  const machine = proceduralState.machines.find(m => m.id === machineId);
  if (!machine) return;
  
  const cost = machine.baseCost * Math.pow(machine.costMultiplier, machine.level);
  
  if (gameState.coins < cost) {
    alert("Moedas insuficientes!");
    return;
  }
  
  gameState.coins -= cost;
  machine.level++;
  
  saveProcedural();
  renderProceduralUI();
  
  if (typeof updateUI === "function") {
    updateUI();
  }
}

/**
 * Calcula bônus total das máquinas procedural
 */
function getProceduralCPSMultiplier() {
  let multiplier = 1;
  
  proceduralState.machines.forEach(machine => {
    if (machine.level > 0) {
      multiplier += (machine.baseGain * machine.level) / 100;
    }
  });
  
  return multiplier;
}

// Exporta funções globais
if (typeof window !== "undefined") {
  window.initializeProcedural = initializeProcedural;
  window.renderProceduralUI = renderProceduralUI;
  window.getProceduralCPSMultiplier = getProceduralCPSMultiplier;
  window.saveProcedural = saveProcedural;
}

