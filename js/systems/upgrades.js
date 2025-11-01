/**
 * upgrades.js
 * Sistema de Upgrades com Emojis por Tema
 */

// Lista de UPGRADES ATIVOS (Inicialmente desbloqueados)
// OBSERVAÇÃO: 'reforco_algoritmo' tem um PRÉ-REQUISITO de nível.
let UPGRADE_DEFINITIONS = [
  // Upgrade de Click inicial
  {
    id: "forca_manual",
    name: "Força Manual",
    description: "Aumenta a força muscular para cliques mais eficazes.",
    icon: "✊",
    image: "assets/upgrades/forca_manual.png",
    baseCost: 10,
    costMultiplier: 1.15,
    baseGain: 0.05,
    type: "click",
  },

  // Upgrade com Pré-Requisito (Não pode ser comprado antes do Nível 5 de Força Manual)
  {
    id: "reforco_algoritmo",
    name: "Reforço de Algoritmo",
    description: "Otimiza a taxa de crítico e eficiência de mineração.",
    icon: "💎",
    baseCost: 500,
    costMultiplier: 1.2,
    baseGain: 0.5,
    type: "click",
    prerequisite: { id: "forca_manual", level: 5 },
  },

  // Upgrade de Click original
  {
    id: "dedo_titanio",
    name: "Dedo de Titânio",
    description: "Melhora o ganho base por clique.",
    icon: "💪",
    baseCost: 15,
    costMultiplier: 1.15,
    baseGain: 0.1,
    type: "click",
  },
  {
    id: "punhos_relampago",
    name: "Punhos Relâmpago",
    description: "Velocidade de clique extrema!",
    icon: "⚡",
    baseCost: 5000,
    costMultiplier: 1.16,
    baseGain: 1,
    type: "click",
  },
  {
    id: "golpes_criticos",
    name: "Golpes Críticos",
    description: "Cada golpe causa devastação!",
    icon: "💥",
    baseCost: 50000,
    costMultiplier: 1.17,
    baseGain: 10,
    type: "click",
  },
  {
    id: "toque_midas",
    name: "Toque de Midas",
    description: "Transforma tudo em ouro com um toque!",
    icon: "👑",
    baseCost: 1000000,
    costMultiplier: 1.18,
    baseGain: 100,
    type: "click",
  },

  // Upgrades de Auto-Ganhos
  {
    id: "rato_automatico",
    name: "Rato Automático",
    description: "Um assistente que clica por você.",
    icon: "🖱️",
    baseCost: 100,
    costMultiplier: 1.15,
    baseGain: 1,
    type: "auto",
  },
  {
    id: "minerador_junior",
    name: "Minerador Junior",
    description: "Um minerador em treinamento.",
    icon: "⛏️",
    baseCost: 1000,
    costMultiplier: 1.14,
    baseGain: 10,
    type: "auto",
  },
  {
    id: "fazenda_clones",
    name: "Fazenda de Clones",
    description: "Clones minerando 24/7.",
    icon: "🤖",
    baseCost: 12000,
    costMultiplier: 1.13,
    baseGain: 80,
    type: "auto",
  },
  {
    id: "maquina_ouro",
    name: "Máquina de Ouro",
    description: "Criação de moedas em escala industrial.",
    icon: "🏭",
    baseCost: 150000,
    costMultiplier: 1.12,
    baseGain: 500,
    type: "auto",
  },
];

// Lista de UPGRADES BLOQUEADOS (Desbloqueio por CPS)
let LOCKED_UPGRADES = [
  {
    id: "satelite_energia",
    name: "Satelite de Energia",
    description: "Otimiza a rede de mineração global.",
    icon: "🛰️",
    baseCost: 1000000,
    costMultiplier: 1.11,
    baseGain: 3000,
    type: "auto",
    unlockCPS: 1000,
  },
  {
    id: "fusao_quantica",
    name: "Fusão Quântica",
    description: "Geração de moedas através de buracos de minhoca.",
    icon: "🌌",
    baseCost: 5000000,
    costMultiplier: 1.1,
    baseGain: 15000,
    type: "auto",
    unlockCPS: 5000,
  },
  {
    id: "portal_temporal",
    name: "Portal Temporal",
    description: "Traz moedas de futuras linhas do tempo.",
    icon: "🌀",
    baseCost: 100000000,
    costMultiplier: 1.09,
    baseGain: 100000,
    type: "auto",
    unlockCPS: 50000,
  },
  {
    id: "universo_paralelo",
    name: "Universo Paralelo",
    description: "Acesso a moedas em dimensões alternativas.",
    icon: "🪐",
    baseCost: 1000000000,
    costMultiplier: 1.08,
    baseGain: 1000000,
    type: "auto",
    unlockCPS: 500000,
  },
  {
    id: "matriz_cosmos",
    name: "Matriz Cósmica",
    description: "Geração infinita além da compreensão.",
    icon: "🌌",
    baseCost: 50000000000,
    costMultiplier: 1.07,
    baseGain: 50000000,
    type: "auto",
    unlockCPS: 5000000,
  },
  {
    id: "singularidade",
    name: "Singularidade",
    description: "Ponto de infinito ganho automático.",
    icon: "⚫",
    baseCost: 500000000000,
    costMultiplier: 1.06,
    baseGain: 500000000,
    type: "auto",
    unlockCPS: 50000000,
  },
  {
    id: "realidade_virtual",
    name: "Realidade Virtual",
    description: "Moedas de mundos simulados.",
    icon: "🥽",
    baseCost: 5000000000000,
    costMultiplier: 1.05,
    baseGain: 5000000000,
    type: "auto",
    unlockCPS: 500000000,
  },
  {
    id: "divindade_mineradora",
    name: "Divindade Mineradora",
    description: "Você transcendeu o físico!",
    icon: "✨",
    baseCost: 50000000000000,
    costMultiplier: 1.04,
    baseGain: 50000000000,
    type: "auto",
    unlockCPS: 5000000000,
  },
];

/**
 * Mapeamento de emojis por upgrade e por tema
 * Se um upgrade não tiver emoji específico para um tema, usa o icon padrão
 */
const UPGRADE_EMOJIS_BY_THEME = {
  default: {
    forca_manual: "✊",
    reforco_algoritmo: "💎",
    dedo_titanio: "💪",
    rato_automatico: "🖱️",
    minerador_junior: "⛏️",
    fazenda_clones: "🤖",
    maquina_ouro: "🏭",
    satelite_energia: "🛰️",
    fusao_quantica: "🌌",
    portal_temporal: "🌀",
    universo_paralelo: "🪐",
  },
  neon: {
    forca_manual: "⚡",
    reforco_algoritmo: "💠",
    dedo_titanio: "🔥",
    rato_automatico: "🎮",
    minerador_junior: "🚀",
    fazenda_clones: "🤖",
    maquina_ouro: "💎",
    satelite_energia: "🛸",
    fusao_quantica: "🌟",
    portal_temporal: "✨",
    universo_paralelo: "🌠",
  },
  green: {
    forca_manual: "🌿",
    reforco_algoritmo: "🍀",
    dedo_titanio: "🌳",
    rato_automatico: "🐿️",
    minerador_junior: "🌱",
    fazenda_clones: "🌾",
    maquina_ouro: "🌲",
    satelite_energia: "🍃",
    fusao_quantica: "🌍",
    portal_temporal: "🌴",
    universo_paralelo: "🌏",
  },
  blue: {
    forca_manual: "🌊",
    reforco_algoritmo: "💧",
    dedo_titanio: "🌊",
    rato_automatico: "🐟",
    minerador_junior: "🏊",
    fazenda_clones: "🐋",
    maquina_ouro: "⚓",
    satelite_energia: "🌊",
    fusao_quantica: "🌌",
    portal_temporal: "🌀",
    universo_paralelo: "🪐",
  },
  pink: {
    forca_manual: "💖",
    reforco_algoritmo: "💗",
    dedo_titanio: "🌸",
    rato_automatico: "🐰",
    minerador_junior: "💝",
    fazenda_clones: "🎀",
    maquina_ouro: "🌺",
    satelite_energia: "💕",
    fusao_quantica: "✨",
    portal_temporal: "💫",
    universo_paralelo: "🌙",
  },
  dark: {
    forca_manual: "🌙",
    reforco_algoritmo: "⭐",
    dedo_titanio: "🌑",
    rato_automatico: "🦇",
    minerador_junior: "🌚",
    fazenda_clones: "👻",
    maquina_ouro: "⚫",
    satelite_energia: "🌌",
    fusao_quantica: "🌠",
    portal_temporal: "🌀",
    universo_paralelo: "🪐",
  },
  purple: {
    forca_manual: "🔮",
    reforco_algoritmo: "💜",
    dedo_titanio: "🟣",
    rato_automatico: "👾",
    minerador_junior: "🪐",
    fazenda_clones: "🌌",
    maquina_ouro: "✨",
    satelite_energia: "🌟",
    fusao_quantica: "💫",
    portal_temporal: "🌀",
    universo_paralelo: "🌠",
  },
  red: {
    forca_manual: "🔥",
    reforco_algoritmo: "💥",
    dedo_titanio: "⚡",
    rato_automatico: "🎯",
    minerador_junior: "🌋",
    fazenda_clones: "💀",
    maquina_ouro: "🏭",
    satelite_energia: "🌠",
    fusao_quantica: "💫",
    portal_temporal: "🌀",
    universo_paralelo: "🪐",
  },
  cyberpunk: {
    forca_manual: "🤖",
    reforco_algoritmo: "💻",
    dedo_titanio: "⚡",
    rato_automatico: "🎮",
    minerador_junior: "🔌",
    fazenda_clones: "🤖",
    maquina_ouro: "💎",
    satelite_energia: "🛸",
    fusao_quantica: "🌌",
    portal_temporal: "🌀",
    universo_paralelo: "🪐",
  },
};

/**
 * Obtém o emoji/imagem de um upgrade baseado no tema atual
 * @param {string} upgradeId - ID do upgrade
 * @returns {string} Emoji ou HTML da imagem do upgrade
 */
function getUpgradeEmoji(upgradeId) {
  // Busca o upgrade
  const upgrade =
    UPGRADE_DEFINITIONS.find((u) => u.id === upgradeId) ||
    LOCKED_UPGRADES.find((u) => u.id === upgradeId);
  
  if (!upgrade) return "❓";
  
  // Se o upgrade tem uma imagem customizada explícita, retorna HTML da imagem
  if (upgrade.image) {
    return `<img src="${upgrade.image}" alt="${upgrade.name}" class="w-full h-full object-contain item-image" />`;
  }
  
  // Tenta carregar automaticamente de assets/upgrades/[id].png
  const imagePath = `assets/upgrades/${upgradeId}.png`;
  
  // Sempre tenta primeiro a imagem e deixa o CSS fallback do emoji
  return `<img src="${imagePath}" alt="${upgrade.name}" class="w-full h-full object-contain item-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-block';" /><span style="display:none;">${upgrade.icon}</span>`;
}

/**
 * Obtém o emoji de um upgrade (versão de texto puro para compatibilidade)
 * @param {string} upgradeId - ID do upgrade
 * @returns {string} Emoji do upgrade
 */
function getUpgradeEmojiText(upgradeId) {
  // Obtém o tema atual
  if (typeof getCurrentTheme === "function") {
    const theme = getCurrentTheme();
    if (theme && UPGRADE_EMOJIS_BY_THEME[theme.id]) {
      const themeEmojis = UPGRADE_EMOJIS_BY_THEME[theme.id];
      if (themeEmojis[upgradeId]) {
        return themeEmojis[upgradeId];
      }
    }
  }

  // Se não encontrar emoji do tema, busca o upgrade e retorna seu icon padrão
  const upgrade =
    UPGRADE_DEFINITIONS.find((u) => u.id === upgradeId) ||
    LOCKED_UPGRADES.find((u) => u.id === upgradeId);
  return upgrade ? upgrade.icon : "❓";
}
