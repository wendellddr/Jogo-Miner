/**
 * menu.js
 * Código do Menu Inicial e Sistema de Música
 */

// --- Variáveis de Música e Menu ---
let backgroundMusic = null;
let musicEnabled = false;

// --- Funções de Menu Inicial ---

/**
 * Verifica se existe um save game no localStorage
 * @returns {boolean} true se existir save, false caso contrário
 */
function hasSaveGame() {
  try {
    const savedData = localStorage.getItem("coinClickerSave");
    return savedData !== null && savedData !== "";
  } catch (e) {
    return false;
  }
}

/**
 * Inicializa o menu principal
 * Configura botões e música de fundo
 */
function initializeMainMenu() {
  const mainMenu = document.getElementById("main-menu-overlay");
  const continueButton = document.getElementById("continue-button");
  const newGameButton = document.getElementById("new-game-button");
  const toggleMusicButton = document.getElementById("toggle-music-button");

  // Verifica se há save e mostra o botão Continuar
  if (hasSaveGame()) {
    continueButton.classList.remove("hidden");
  }

  // Inicializa o elemento de áudio
  backgroundMusic = document.getElementById("background-music");
  if (backgroundMusic) {
    backgroundMusic.volume = 0.3; // Volume mais baixo para música de fundo
  }

  // Botão Continuar
  continueButton.addEventListener("click", () => {
    hideMainMenu();
    // startGame será definido em game.js
    if (typeof startGame === "function") {
      startGame(true); // true = carregar save
    } else {
      console.error("game.js não foi carregado! startGame não está disponível.");
    }
  });

  // Botão Novo Jogo
  newGameButton.addEventListener("click", () => {
    // Confirma se o usuário realmente quer começar um novo jogo
    if (hasSaveGame()) {
      showConfirmNewGameModal();
    } else {
      // Não há save, vai direto para o modal de nome
      showPlayerNameModal();
    }
  });

  // Botão Toggle Música
  toggleMusicButton.addEventListener("click", () => {
    toggleBackgroundMusic();
  });

  // Verifica preferência de música do localStorage, mas inicia automaticamente se não houver preferência
  const musicPref = localStorage.getItem("coinClickerMusicEnabled");
  if (musicPref === "false") {
    // Se o usuário desativou antes, respeita a preferência
    musicEnabled = false;
    updateMusicUI();
  } else {
    // Por padrão, inicia a música automaticamente no menu
    musicEnabled = true;
    localStorage.setItem("coinClickerMusicEnabled", "true");
    updateMusicUI();
    // Aguarda um pouco antes de iniciar para evitar problemas de autoplay
    setTimeout(() => {
      startBackgroundMusic();
    }, 500);
  }
}

/**
 * Esconde o menu principal e mostra o conteúdo do jogo
 */
function hideMainMenu() {
  const mainMenu = document.getElementById("main-menu-overlay");
  const gameContent = document.getElementById("game-content");
  if (mainMenu) {
    mainMenu.style.opacity = "0";
    mainMenu.style.transition = "opacity 0.5s ease-out";
    setTimeout(() => {
      mainMenu.classList.add("hidden");
      if (gameContent) {
        gameContent.classList.add("active");
      }
    }, 500);
  }
}

/**
 * Atualiza a interface do botão de música
 */
function updateMusicUI() {
  const musicIcon = document.getElementById("music-icon");
  const musicText = document.getElementById("music-text");
  
  if (musicIcon && musicText) {
    if (musicEnabled) {
      musicIcon.textContent = "🔊";
      musicText.textContent = "Música: Ligada";
    } else {
      musicIcon.textContent = "🔇";
      musicText.textContent = "Música: Desligada";
    }
  }
}

/**
 * Alterna o estado da música de fundo
 */
function toggleBackgroundMusic() {
  if (!backgroundMusic) {
    backgroundMusic = document.getElementById("background-music");
  }

  if (!backgroundMusic) {
    console.warn("Elemento de áudio não encontrado");
    return;
  }

  musicEnabled = !musicEnabled;
  localStorage.setItem(
    "coinClickerMusicEnabled",
    musicEnabled.toString()
  );

  if (musicEnabled) {
    startBackgroundMusic();
  } else {
    stopBackgroundMusic();
  }
  
  updateMusicUI();
}

/**
 * Inicia a música de fundo
 */
function startBackgroundMusic() {
  if (!backgroundMusic) {
    backgroundMusic = document.getElementById("background-music");
  }
  
  if (backgroundMusic && musicEnabled) {
    // Verifica se há uma fonte de áudio configurada
    const hasSource = backgroundMusic.querySelector("source")?.src;
    
    if (!hasSource || hasSource === "") {
      console.info(
        "⛏️ Música de mineração não configurada. Adicione uma música no elemento <audio>."
      );
      return;
    }

    // Alguns navegadores bloqueiam autoplay, então usamos play() com catch
    backgroundMusic
      .play()
      .then(() => {
        console.log("⛏️ Música de mineração iniciada");
      })
      .catch((error) => {
        console.warn(
          "Não foi possível reproduzir música automaticamente (alguns navegadores bloqueiam autoplay). Clique no botão de música para ativar manualmente.",
          error
        );
      });
  }
}

/**
 * Para a música de fundo
 */
function stopBackgroundMusic() {
  if (backgroundMusic) {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
  }
}

// Inicialização quando a página carregar
// Como game.js é carregado antes de menu.js, startGame já estará disponível
window.addEventListener("DOMContentLoaded", function () {
  // Esconde a tela de loading imediatamente
  const loadingOverlay = document.getElementById("loading-overlay");
  if (loadingOverlay) {
    loadingOverlay.classList.add("hidden");
  }

  // Aguarda um pouco para garantir que game.js foi completamente carregado
  setTimeout(initializeMainMenu, 50);
});

// Também tenta inicializar no window.onload como fallback
window.addEventListener("load", function () {
  // Só inicializa se ainda não foi inicializado e game.js já carregou
  const continueButton = document.getElementById("continue-button");
  if (continueButton && typeof startGame === "function") {
    // Verifica se já não foi inicializado
    if (!continueButton.hasAttribute("data-initialized")) {
      continueButton.setAttribute("data-initialized", "true");
      initializeMainMenu();
    }
  }
});

/**
 * Mostra o modal bonito para pedir o nome do jogador
 */
function showPlayerNameModal() {
  const modal = document.getElementById("player-name-modal");
  const nameInput = document.getElementById("player-name-input");
  const confirmButton = document.getElementById("confirm-name-button");
  const cancelButton = document.getElementById("cancel-name-button");
  
  if (!modal || !nameInput || !confirmButton || !cancelButton) {
    console.error("Elementos do modal de nome não encontrados!");
    return;
  }
  
  // Mostra o modal
  modal.classList.remove("hidden");
  // Foca no input
  setTimeout(() => nameInput.focus(), 100);
  
  // Limpa o input
  nameInput.value = "";
  
  // Handler para confirmar
  const handleConfirm = () => {
    const playerName = nameInput.value.trim();
    
    if (!playerName) {
      alert("Por favor, digite seu nome!");
      nameInput.focus();
      return;
    }
    
    // Esconde o modal
    modal.classList.add("hidden");
    
    // Salva o nome do jogador
    if (typeof setPlayerName === "function") {
      setPlayerName(playerName);
    } else {
      localStorage.setItem("playerName", playerName.substring(0, 20));
    }
    
    // Limpa TODOS os dados do jogo do localStorage
    localStorage.removeItem("coinClickerSave");
    localStorage.removeItem("coinClickerWorlds");
    localStorage.removeItem("coinClickerAchievements");
    localStorage.removeItem("coinClickerInventory");
    localStorage.removeItem("coinClickerPrestige");
    
    hideMainMenu();
    
    // startGame será definido em game.js
    if (typeof startGame === "function") {
      startGame(false); // false = novo jogo
    } else {
      console.error("game.js não foi carregado! startGame não está disponível.");
    }
  };
  
  // Handler para cancelar
  const handleCancel = () => {
    // Esconde o modal
    modal.classList.add("hidden");
  };
  
  // Handler para clicar fora do modal
  const handleModalClick = (e) => {
    if (e.target === modal) {
      handleCancel();
    }
  };
  
  // Handler para Enter
  const handleEnterKey = (e) => {
    if (e.key === "Enter") {
      handleConfirm();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };
  
  // Adiciona listeners
  confirmButton.addEventListener("click", handleConfirm, { once: true });
  cancelButton.addEventListener("click", handleCancel, { once: true });
  modal.addEventListener("click", handleModalClick, { once: true });
  nameInput.addEventListener("keydown", handleEnterKey, { once: true });
  document.addEventListener("keydown", handleEnterKey, { once: true });
}

// Exporta função globalmente
if (typeof window !== "undefined") {
  window.showPlayerNameModal = showPlayerNameModal;
}

/**
 * Mostra o modal de confirmação para começar um novo jogo (quando há save)
 */
function showConfirmNewGameModal() {
  const modal = document.getElementById("confirm-new-game-modal");
  const confirmButton = document.getElementById("confirm-new-game-button");
  const cancelButton = document.getElementById("cancel-new-game-button");
  
  if (!modal || !confirmButton || !cancelButton) {
    console.error("Elementos do modal de confirmação não encontrados!");
    return;
  }
  
  // Mostra o modal
  modal.classList.remove("hidden");
  
  // Handler para confirmar
  const handleConfirm = () => {
    // Esconde o modal de confirmação
    modal.classList.add("hidden");
    
    // Abre o modal de nome
    showPlayerNameModal();
  };
  
  // Handler para cancelar
  const handleCancel = () => {
    // Esconde o modal
    modal.classList.add("hidden");
  };
  
  // Handler para clicar fora do modal
  const handleModalClick = (e) => {
    if (e.target === modal) {
      handleCancel();
    }
  };
  
  // Handler para ESC
  const handleEscKey = (e) => {
    if (e.key === "Escape") {
      handleCancel();
    }
  };
  
  // Adiciona listeners com once: true (auto-remove após primeiro uso)
  confirmButton.addEventListener("click", handleConfirm, { once: true });
  cancelButton.addEventListener("click", handleCancel, { once: true });
  modal.addEventListener("click", handleModalClick, { once: true });
  document.addEventListener("keydown", handleEscKey, { once: true });
}

/**
 * Inicializa o menu de navegação do jogo (sidebar lateral)
 */
function initializeGameMenu() {
  // Previne múltiplas inicializações
  if (window.gameMenuInitialized) return;
  window.gameMenuInitialized = true;
  
  const menuButton = document.getElementById("menu-button");
  const closeMenuButton = document.getElementById("close-main-menu");
  const menuSidebar = document.getElementById("main-menu-sidebar");
  const menuOverlay = document.getElementById("main-menu-overlay-close");

  if (!menuButton || !closeMenuButton || !menuSidebar || !menuOverlay) return;

  // Botões do menu que abrem outras sidebars
  const leaderboardButton = document.getElementById("menu-leaderboard-button");
  const myIdButton = document.getElementById("menu-my-id-button");
  const prestigeButton = document.getElementById("menu-prestige-button");
  const proceduralButton = document.getElementById("menu-procedural-button");

  // Abre menu principal
  menuButton.addEventListener("click", () => {
    updateMenuPlayerInfo();
    menuSidebar.classList.remove("-translate-x-full");
    menuOverlay.classList.remove("hidden");
  });

  // Fecha menu principal
  closeMenuButton.addEventListener("click", () => {
    menuSidebar.classList.add("-translate-x-full");
    menuOverlay.classList.add("hidden");
  });

  // Fecha ao clicar no overlay
  menuOverlay.addEventListener("click", () => {
    menuSidebar.classList.add("-translate-x-full");
    menuOverlay.classList.add("hidden");
  });

  // Fecha com ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !menuSidebar.classList.contains("-translate-x-full")) {
      menuSidebar.classList.add("-translate-x-full");
      menuOverlay.classList.add("hidden");
    }
  });

  // Abre Ranking
  if (leaderboardButton) {
    leaderboardButton.addEventListener("click", async () => {
      menuSidebar.classList.add("-translate-x-full");
      menuOverlay.classList.add("hidden");
      
      // Abre o sidebar de ranking diretamente
      const rankSidebar = document.getElementById("leaderboard-sidebar");
      const rankOverlay = document.getElementById("leaderboard-overlay");
      
      if (rankSidebar && rankOverlay) {
        // Mostra loading
        const loadingElement = document.getElementById("loading-leaderboard");
        if (loadingElement) {
          loadingElement.classList.remove("hidden");
        }
        
        try {
          // Atualiza o score antes de abrir o ranking
          if (typeof submitScore === "function" && typeof gameState !== "undefined") {
            await submitScore(gameState.coins, gameState.coins);
          }
          // Carrega o ranking quando abrir
          if (typeof loadLeaderboard === "function") {
            await loadLeaderboard();
          }
        } finally {
          // Esconde loading
          if (loadingElement) {
            loadingElement.classList.add("hidden");
          }
        }
        
        rankSidebar.classList.remove("translate-x-full");
        rankOverlay.classList.remove("hidden");
      }
    });
  }

  // Abre Meu ID / Cloud Save
  if (myIdButton) {
    myIdButton.addEventListener("click", () => {
      menuSidebar.classList.add("-translate-x-full");
      menuOverlay.classList.add("hidden");
      
      // Abre o modal de ID diretamente
      const modal = document.getElementById("player-id-modal");
      const playerIdDisplay = document.getElementById("player-id-display");
      const playerNameDisplay = document.getElementById("cloud-save-player-name");
      
      if (modal) {
        // Atualiza o nome do jogador
        if (playerNameDisplay) {
          const playerName = localStorage.getItem("coinClickerPlayerName") || "Minerador";
          playerNameDisplay.textContent = playerName;
        }
        
        // Atualiza o ID exibido
        if (playerIdDisplay) {
          if (typeof getCurrentPlayerIdForCloud === "function") {
            const currentId = getCurrentPlayerIdForCloud();
            if (currentId) {
              playerIdDisplay.value = currentId;
            } else {
              playerIdDisplay.value = "Sem ID";
            }
          }
        }
        
        modal.classList.remove("hidden");
      }
    });
  }

  // Abre Ascensão
  if (prestigeButton) {
    prestigeButton.addEventListener("click", () => {
      menuSidebar.classList.add("-translate-x-full");
      menuOverlay.classList.add("hidden");
      
      // Abre o sidebar de prestígio diretamente
      const prestigeSidebar = document.getElementById("prestige-sidebar");
      const prestigeOverlay = document.getElementById("prestige-overlay");
      
      if (prestigeSidebar && prestigeOverlay) {
        if (typeof renderPrestigeUI === "function") {
          renderPrestigeUI();
        }
        prestigeSidebar.classList.remove("translate-x-full");
        prestigeOverlay.classList.remove("hidden");
      }
    });
  }

  // Abre Motor Quântico
  if (proceduralButton) {
    proceduralButton.addEventListener("click", () => {
      menuSidebar.classList.add("-translate-x-full");
      menuOverlay.classList.add("hidden");
      
      // Abre o sidebar de procedural diretamente
      const proceduralSidebar = document.getElementById("procedural-sidebar");
      const proceduralOverlay = document.getElementById("procedural-overlay");
      
      if (proceduralSidebar && proceduralOverlay) {
        if (typeof renderProceduralUI === "function") {
          renderProceduralUI();
        }
        proceduralSidebar.classList.remove("translate-x-full");
        proceduralOverlay.classList.remove("hidden");
      }
    });
  }

  // Abre Cavernas de Mineração
  const dungeonButton = document.getElementById("menu-dungeon-button");
  if (dungeonButton) {
    dungeonButton.addEventListener("click", () => {
      menuSidebar.classList.add("-translate-x-full");
      menuOverlay.classList.add("hidden");
      
      // Abre o sidebar de dungeon diretamente
      const dungeonSidebar = document.getElementById("dungeon-sidebar");
      const dungeonOverlay = document.getElementById("dungeon-overlay");
      
      if (dungeonSidebar && dungeonOverlay) {
        if (typeof renderDungeonUI === "function") {
          renderDungeonUI();
        }
        dungeonSidebar.classList.remove("translate-x-full");
        dungeonOverlay.classList.remove("hidden");
      }
    });
  }

  // Abre Estatísticas
  const statsButton = document.getElementById("menu-stats-button");
  if (statsButton) {
    statsButton.addEventListener("click", () => {
      menuSidebar.classList.add("-translate-x-full");
      menuOverlay.classList.add("hidden");
      
      // Abre o sidebar de estatísticas diretamente
      const statsSidebar = document.getElementById("stats-sidebar");
      const statsOverlay = document.getElementById("stats-overlay");
      
      if (statsSidebar && statsOverlay) {
        if (typeof renderStatsUI === "function") {
          renderStatsUI();
        }
        statsSidebar.classList.remove("translate-x-full");
        statsOverlay.classList.remove("hidden");
      }
    });
  }

  // Abre Recompensas Diárias
  const dailyRewardsButton = document.getElementById("menu-daily-rewards-button");
  if (dailyRewardsButton) {
    dailyRewardsButton.addEventListener("click", () => {
      menuSidebar.classList.add("-translate-x-full");
      menuOverlay.classList.add("hidden");
      
      // Abre o sidebar de recompensas diárias diretamente
      const dailyRewardsSidebar = document.getElementById("daily-rewards-sidebar");
      const dailyRewardsOverlay = document.getElementById("daily-rewards-overlay");
      
      if (dailyRewardsSidebar && dailyRewardsOverlay) {
        if (typeof renderDailyRewardsUI === "function") {
          renderDailyRewardsUI();
        }
        dailyRewardsSidebar.classList.remove("translate-x-full");
        dailyRewardsOverlay.classList.remove("hidden");
      }
    });
  }
  
  // Inicializa sidebar de recompensas diárias se ainda não foi
  if (typeof initializeDailyRewards === "function") {
    initializeDailyRewards();
  }
}

/**
 * Atualiza informações do jogador no menu
 */
function updateMenuPlayerInfo() {
  const playerNameEl = document.getElementById("menu-player-name");
  const playerLevelEl = document.getElementById("menu-player-level");
  
  if (!playerNameEl || !playerLevelEl) return;

  // Nome do jogador
  const playerName = localStorage.getItem("coinClickerPlayerName") || "Minerador";
  playerNameEl.textContent = playerName;

  // Nível de ascensão
  try {
    const prestigeData = localStorage.getItem("coinClickerPrestige");
    if (prestigeData) {
      const data = JSON.parse(prestigeData);
      const level = data.state?.level || 0;
      playerLevelEl.textContent = `Nível de Ascensão: ${level}`;
    } else {
      playerLevelEl.textContent = "Nível de Ascensão: 0";
    }
  } catch (e) {
    playerLevelEl.textContent = "Nível de Ascensão: 0";
  }
}

