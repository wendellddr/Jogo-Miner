/**
 * auth.js
 * Sistema de autenticação simples com hash de senha
 */

// Configuração da API (mesmo bin do leaderboard)
const AUTH_API_KEY = "$2a$10$EpuCgK6DgQlDGMOkL.H3EOl81pf2SGyQBvsUMGTqQklMLuBN6AX5a";
const AUTH_BIN_ID = "690521d543b1c97be98f4023";
const AUTH_API_URL = `https://api.jsonbin.io/v3/b/${AUTH_BIN_ID}`;

// Estado da autenticação
let currentUser = null;
let authData = null;

/**
 * Gera hash SHA-256 de uma string
 */
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Carrega dados de autenticação do JSONBin
 */
async function loadAuthData() {
  try {
    const response = await fetch(AUTH_API_URL + "/latest", {
      headers: {
        "X-Master-Key": AUTH_API_KEY,
      },
    });

    if (response.ok) {
      const result = await response.json();
      authData = result.record.auth || {};
      return true;
    } else {
      authData = {};
      return false;
    }
  } catch (error) {
    console.error("Erro ao carregar dados de autenticação:", error);
    authData = {};
    return false;
  }
}

/**
 * Salva dados de autenticação no JSONBin
 */
async function saveAuthData() {
  try {
    // Carrega dados completos do bin
    const currentData = await fetch(AUTH_API_URL + "/latest", {
      headers: { "X-Master-Key": AUTH_API_KEY },
    }).then(r => r.json()).catch(() => ({}));

    const savePayload = currentData.record || {};
    
    // Garante que auth existe
    if (!savePayload.auth) {
      savePayload.auth = {};
    }
    
    // Atualiza auth
    savePayload.auth = authData;
    
    // Preserva outros campos (leaderboard, cloudSaves)
    const response = await fetch(AUTH_API_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": AUTH_API_KEY,
      },
      body: JSON.stringify(savePayload),
    });

    return response.ok;
  } catch (error) {
    console.error("Erro ao salvar dados de autenticação:", error);
    return false;
  }
}

/**
 * Registra um novo usuário
 */
async function registerUser(email, password, username) {
  try {
    await loadAuthData();

    // Validações
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Email inválido' };
    }
    
    if (!password || password.length < 6) {
      return { success: false, error: 'Senha deve ter pelo menos 6 caracteres' };
    }
    
    if (!username || username.trim().length < 3) {
      return { success: false, error: 'Nome de usuário deve ter pelo menos 3 caracteres' };
    }

    // Verifica se email já existe
    if (authData[email]) {
      return { success: false, error: 'Email já cadastrado' };
    }

    // Verifica se username já existe
    const existingUsername = Object.values(authData).find(
      user => user.username.toLowerCase() === username.toLowerCase()
    );
    if (existingUsername) {
      return { success: false, error: 'Nome de usuário já existe' };
    }

    // Cria hash da senha
    const passwordHash = await hashPassword(password);
    
    // Gera ID único
    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    // Salva usuário
    authData[email] = {
      id: userId,
      username: username.trim(),
      passwordHash,
      createdAt: Date.now(),
      lastLogin: Date.now(),
    };

    const saved = await saveAuthData();
    
    if (saved) {
      currentUser = {
        email,
        username: username.trim(),
        id: userId,
      };
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      return { success: true, user: currentUser };
    } else {
      return { success: false, error: 'Erro ao salvar usuário' };
    }
  } catch (error) {
    console.error("Erro ao registrar:", error);
    return { success: false, error: 'Erro ao criar conta' };
  }
}

/**
 * Faz login
 */
async function loginUser(email, password) {
  try {
    await loadAuthData();

    if (!authData[email]) {
      return { success: false, error: 'Email ou senha incorretos' };
    }

    const passwordHash = await hashPassword(password);
    
    if (authData[email].passwordHash !== passwordHash) {
      return { success: false, error: 'Email ou senha incorretos' };
    }

    // Atualiza lastLogin
    authData[email].lastLogin = Date.now();
    await saveAuthData();

    currentUser = {
      email,
      username: authData[email].username,
      id: authData[email].id,
    };
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    return { success: true, user: currentUser };
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    return { success: false, error: 'Erro ao fazer login' };
  }
}

/**
 * Faz logout
 */
function logoutUser() {
  currentUser = null;
  localStorage.removeItem('currentUser');
}

/**
 * Verifica se usuário está logado
 */
function isLoggedIn() {
  return currentUser !== null;
}

/**
 * Obtém usuário atual
 */
function getCurrentUser() {
  return currentUser;
}

/**
 * Recupera usuário do localStorage
 */
function restoreUserFromStorage() {
  try {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      currentUser = JSON.parse(saved);
      return currentUser;
    }
  } catch (error) {
    console.error("Erro ao restaurar usuário:", error);
  }
  return null;
}

// Exporta funções globais
if (typeof window !== "undefined") {
  window.registerUser = registerUser;
  window.loginUser = loginUser;
  window.logoutUser = logoutUser;
  window.isLoggedIn = isLoggedIn;
  window.getCurrentUser = getCurrentUser;
  window.restoreUserFromStorage = restoreUserFromStorage;
}

