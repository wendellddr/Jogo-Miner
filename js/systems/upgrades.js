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
 * Obtém o emoji de um upgrade baseado no tema atual
 * @param {string} upgradeId - ID do upgrade
 * @returns {string} Emoji do upgrade
 */
function getUpgradeEmoji(upgradeId) {
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
