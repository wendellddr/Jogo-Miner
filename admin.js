/**
 * admin.js
 * Sistema de Administração para Itens e Monstros
 */

// ====== ESTADO ======
let items = [];
let monsters = [];

// ====== INICIALIZAÇÃO ======
document.addEventListener('DOMContentLoaded', () => {
  loadItems();
  loadMonsters();
  setupTabs();
  setupItemForm();
  setupMonsterForm();
});

// ====== TABS ======
function setupTabs() {
  const tabs = ['items', 'monsters', 'export'];
  const sections = {
    'items': 'section-items',
    'monsters': 'section-monsters',
    'export': 'section-export'
  };
  
  tabs.forEach(tab => {
    document.getElementById(`tab-${tab}`).addEventListener('click', () => {
      // Remove active de todos
      tabs.forEach(t => {
        document.getElementById(`tab-${t}`).classList.remove('active', 'bg-blue-600');
        document.getElementById(sections[t]).classList.add('hidden');
      });
      
      // Adiciona active no clicado
      document.getElementById(`tab-${tab}`).classList.add('active');
      document.getElementById(sections[tab]).classList.remove('hidden');
      
      // Define cor
      if (tab === 'items') document.getElementById(`tab-${tab}`).classList.add('bg-blue-600');
      if (tab === 'monsters') document.getElementById(`tab-${tab}`).classList.add('bg-green-600');
      if (tab === 'export') document.getElementById(`tab-${tab}`).classList.add('bg-purple-600');
      
      if (tab === 'export') {
        updateExport();
      }
    });
  });
}

// ====== ITENS ======
function setupItemForm() {
  const form = document.getElementById('item-form');
  const previewIcon = document.getElementById('preview-icon');
  const previewName = document.getElementById('preview-name');
  const previewImage = document.getElementById('preview-image');
  const imageInput = document.getElementById('item-image');
  
  // Atualiza preview em tempo real
  ['item-id', 'item-name', 'item-icon', 'item-image'].forEach(fieldId => {
    document.getElementById(fieldId).addEventListener('input', updateItemPreview);
  });
  
  // File input para preview de imagem
  imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        previewImage.src = event.target.result;
        previewImage.classList.remove('hidden');
        previewIcon.style.display = 'none';
      };
      reader.readAsDataURL(file);
    }
  });
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    addItem();
  });
  
  document.getElementById('clear-item-form').addEventListener('click', () => {
    form.reset();
    previewImage.classList.add('hidden');
    previewIcon.style.display = 'block';
    updateItemPreview();
  });
}

function updateItemPreview() {
  const name = document.getElementById('item-name').value || 'Nome';
  const icon = document.getElementById('item-icon').value || '💎';
  
  document.getElementById('preview-name').textContent = name;
  document.getElementById('preview-icon').textContent = icon;
}

function addItem() {
  const item = {
    id: document.getElementById('item-id').value,
    name: document.getElementById('item-name').value,
    description: document.getElementById('item-description').value,
    icon: document.getElementById('item-icon').value,
    rarity: document.getElementById('item-rarity').value,
    buffType: document.getElementById('item-buff-type').value,
    buffValue: parseFloat(document.getElementById('item-buff-value').value),
    duration: null
  };
  
  // Salva imagem se houver
  const imageInput = document.getElementById('item-image');
  if (imageInput.files.length > 0) {
    saveItemImage(imageInput.files[0], item.id);
  }
  
  // Verifica duplicatas
  const existingIndex = items.findIndex(i => i.id === item.id);
  if (existingIndex !== -1) {
    if (!confirm(`Item ${item.id} já existe. Deseja substituir?`)) {
      return;
    }
    items[existingIndex] = item;
  } else {
    items.push(item);
  }
  
  saveItems();
  renderItemsList();
  
  // Limpa formulário
  document.getElementById('item-form').reset();
  document.getElementById('preview-image').classList.add('hidden');
  document.getElementById('preview-icon').style.display = 'block';
  
  alert(`Item "${item.name}" adicionado com sucesso!`);
}

function renderItemsList() {
  const container = document.getElementById('items-list');
  container.innerHTML = '';
  
  if (items.length === 0) {
    container.innerHTML = '<p class="text-gray-400 text-center py-8">Nenhum item cadastrado</p>';
    return;
  }
  
  items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'bg-gray-800 p-4 rounded-lg border border-gray-700';
    div.innerHTML = `
      <div class="flex justify-between items-start">
        <div class="flex items-start space-x-3">
          <div class="text-4xl">${item.icon}</div>
          <div>
            <h3 class="font-bold text-primary">${item.name}</h3>
            <p class="text-sm text-gray-400">${item.description}</p>
            <div class="flex flex-wrap gap-2 mt-2">
              <span class="text-xs px-2 py-1 bg-gray-700 rounded">${item.rarity}</span>
              <span class="text-xs px-2 py-1 bg-blue-700 rounded">${item.buffType}</span>
              <span class="text-xs px-2 py-1 bg-green-700 rounded">+${(item.buffValue * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>
        <button onclick="deleteItem('${item.id}')" class="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded">
          🗑️
        </button>
      </div>
    `;
    container.appendChild(div);
  });
}

function deleteItem(id) {
  if (confirm(`Deseja realmente deletar o item "${id}"?`)) {
    items = items.filter(i => i.id !== id);
    saveItems();
    renderItemsList();
  }
}

function saveItemImage(file, itemId) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    localStorage.setItem(`item_image_${itemId}`, dataUrl);
  };
  reader.readAsDataURL(file);
}

function loadItems() {
  const saved = localStorage.getItem('admin_items');
  if (saved) {
    items = JSON.parse(saved);
    renderItemsList();
  }
}

function saveItems() {
  localStorage.setItem('admin_items', JSON.stringify(items));
}

// ====== MONSTROS ======
function setupMonsterForm() {
  const form = document.getElementById('monster-form');
  const previewIcon = document.getElementById('preview-monster-icon');
  const previewName = document.getElementById('preview-monster-name');
  const previewImage = document.getElementById('preview-monster-image');
  const imageInput = document.getElementById('monster-image');
  
  // Atualiza preview em tempo real
  ['monster-id', 'monster-name', 'monster-icon', 'monster-image'].forEach(fieldId => {
    document.getElementById(fieldId).addEventListener('input', updateMonsterPreview);
  });
  
  // File input para preview de imagem
  imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        previewImage.src = event.target.result;
        previewImage.classList.remove('hidden');
        previewIcon.style.display = 'none';
      };
      reader.readAsDataURL(file);
    }
  });
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    addMonster();
  });
  
  document.getElementById('clear-monster-form').addEventListener('click', () => {
    form.reset();
    previewImage.classList.add('hidden');
    previewIcon.style.display = 'block';
    updateMonsterPreview();
  });
}

function updateMonsterPreview() {
  const name = document.getElementById('monster-name').value || 'Nome';
  const icon = document.getElementById('monster-icon').value || '👹';
  
  document.getElementById('preview-monster-name').textContent = name;
  document.getElementById('preview-monster-icon').textContent = icon;
}

function addMonster() {
  const monster = {
    id: document.getElementById('monster-id').value,
    name: document.getElementById('monster-name').value,
    description: document.getElementById('monster-description').value,
    icon: document.getElementById('monster-icon').value,
    hp: parseInt(document.getElementById('monster-hp').value),
    attack: parseInt(document.getElementById('monster-attack').value),
    coinReward: parseInt(document.getElementById('monster-coin-reward').value),
    xpReward: parseInt(document.getElementById('monster-xp-reward').value)
  };
  
  // Salva imagem se houver
  const imageInput = document.getElementById('monster-image');
  if (imageInput.files.length > 0) {
    saveMonsterImage(imageInput.files[0], monster.id);
  }
  
  // Verifica duplicatas
  const existingIndex = monsters.findIndex(m => m.id === monster.id);
  if (existingIndex !== -1) {
    if (!confirm(`Monstro ${monster.id} já existe. Deseja substituir?`)) {
      return;
    }
    monsters[existingIndex] = monster;
  } else {
    monsters.push(monster);
  }
  
  saveMonsters();
  renderMonstersList();
  
  // Limpa formulário
  document.getElementById('monster-form').reset();
  document.getElementById('preview-monster-image').classList.add('hidden');
  document.getElementById('preview-monster-icon').style.display = 'block';
  
  alert(`Monstro "${monster.name}" adicionado com sucesso!`);
}

function renderMonstersList() {
  const container = document.getElementById('monsters-list');
  container.innerHTML = '';
  
  if (monsters.length === 0) {
    container.innerHTML = '<p class="text-gray-400 text-center py-8">Nenhum monstro cadastrado</p>';
    return;
  }
  
  monsters.forEach(monster => {
    const div = document.createElement('div');
    div.className = 'bg-gray-800 p-4 rounded-lg border border-gray-700';
    div.innerHTML = `
      <div class="flex justify-between items-start">
        <div class="flex items-start space-x-3">
          <div class="text-4xl">${monster.icon}</div>
          <div>
            <h3 class="font-bold text-primary">${monster.name}</h3>
            <p class="text-sm text-gray-400">${monster.description}</p>
            <div class="flex flex-wrap gap-2 mt-2">
              <span class="text-xs px-2 py-1 bg-red-700 rounded">❤️ HP: ${monster.hp}</span>
              <span class="text-xs px-2 py-1 bg-orange-700 rounded">⚔️ ATK: ${monster.attack}</span>
              <span class="text-xs px-2 py-1 bg-yellow-700 rounded">💰 +${monster.coinReward}</span>
              <span class="text-xs px-2 py-1 bg-purple-700 rounded">⭐ +${monster.xpReward} XP</span>
            </div>
          </div>
        </div>
        <button onclick="deleteMonster('${monster.id}')" class="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded">
          🗑️
        </button>
      </div>
    `;
    container.appendChild(div);
  });
}

function deleteMonster(id) {
  if (confirm(`Deseja realmente deletar o monstro "${id}"?`)) {
    monsters = monsters.filter(m => m.id !== id);
    saveMonsters();
    renderMonstersList();
  }
}

function saveMonsterImage(file, monsterId) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    localStorage.setItem(`monster_image_${monsterId}`, dataUrl);
  };
  reader.readAsDataURL(file);
}

function loadMonsters() {
  const saved = localStorage.getItem('admin_monsters');
  if (saved) {
    monsters = JSON.parse(saved);
    renderMonstersList();
  }
}

function saveMonsters() {
  localStorage.setItem('admin_monsters', JSON.stringify(monsters));
}

// ====== EXPORT ======
function updateExport() {
  document.getElementById('export-items').value = JSON.stringify(items, null, 2);
  document.getElementById('export-monsters').value = JSON.stringify(monsters, null, 2);
}

function copyToClipboard(elementId) {
  const element = document.getElementById(elementId);
  element.select();
  element.setSelectionRange(0, 99999);
  document.execCommand('copy');
  alert('Copiado para a área de transferência!');
}

// Export globais
window.deleteItem = deleteItem;
window.deleteMonster = deleteMonster;
window.copyToClipboard = copyToClipboard;

