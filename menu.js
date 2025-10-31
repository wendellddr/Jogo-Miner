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
      if (
        !confirm(
          "Você tem um progresso salvo. Deseja realmente começar um novo jogo? Todo o progresso será perdido."
        )
      ) {
        return; // Cancela se o usuário não confirmar
      }
    }
    // Limpa o save
    localStorage.removeItem("coinClickerSave");
    hideMainMenu();
    // startGame será definido em game.js
    if (typeof startGame === "function") {
      startGame(false); // false = novo jogo
    } else {
      console.error("game.js não foi carregado! startGame não está disponível.");
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

