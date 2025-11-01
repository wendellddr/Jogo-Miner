# 🎮 Painel de Administração - Game Miner

## 📋 Visão Geral

O Painel de Administração permite criar e gerenciar itens e monstros do jogo de forma visual e intuitiva, sem precisar editar código JavaScript diretamente.

## 🚀 Como Usar

### 1. Acessar o Painel

Abra o arquivo `admin.html` no navegador:

```
Jogo-Miner/admin.html
```

### 2. Interface

O painel possui 3 abas principais:

- **🎁 Itens** - Gerenciar equipamentos e itens
- **👾 Monstros** - Gerenciar inimigos das cavernas
- **💾 Exportar** - Copiar dados em JSON

## 🎁 Gerenciando Itens

### Campos do Formulário

#### **ID Único**
- Identificador interno do item
- Deve ser único (ex: `gem_power`, `iron_sword`)
- Use `snake_case` (letras, números e underscore)

#### **Nome**
- Nome exibido no jogo (ex: "Gema de Poder")
- Pode usar acentos e espaços

#### **Descrição**
- Explicação do que o item faz (ex: "Aumenta CPC em 10%")
- Aparece em tooltips

#### **Ícone Emoji**
- Emoji usado como fallback ou símbolo visual
- Ex: 💎, ⚔️, 🛡️, 🏹
- Máximo 2 caracteres

#### **Imagem PNG** (Opcional)
- Sprite pixel art customizada
- Recomendado: 64x64 ou 128x128 pixels
- Formato: PNG com transparência
- Será salva automaticamente

#### **Raridade**
- **Comum** - Cinza, mais fácil de encontrar
- **Incomum** - Verde, moderadamente raro
- **Raro** - Roxo/Rosa, muito difícil de encontrar

#### **Tipo de Buff**
- **CPC Multiplicador** - Aumenta dano por clique
- **CPS Multiplicador** - Aumenta moedas por segundo
- **Chance Crítica** - Aumenta probabilidade de crítico
- **Multiplicador Crítico** - Aumenta dano de crítico
- **Multiplicador Total** - Aumenta ganho geral

#### **Valor do Buff**
- Número decimal de 0.0 a 1.0
- 0.1 = +10%, 0.25 = +25%, 0.5 = +50%
- Use ponto (.) como decimal

### Preview em Tempo Real

O painel mostra um preview do item enquanto você preenche o formulário, permitindo ajustar visualmente antes de salvar.

## 👾 Gerenciando Monstros

### Campos do Formulário

#### **ID Único**
- Identificador interno do monstro
- Deve ser único (ex: `goblin_warrior`, `dragon_lord`)
- Use `snake_case`

#### **Nome**
- Nome exibido no combate (ex: "Goblin Guerreiro")

#### **Descrição**
- Descrição atmosférica (ex: "Um goblin feroz armado")

#### **Ícone Emoji**
- Emoji representativo (ex: 👹, 🐉, ⚰️)

#### **Imagem PNG** (Opcional)
- Sprite pixel art customizada

#### **HP Base**
- Vida inicial do monstro
- Recomendado: 50 a 500+

#### **Ataque**
- Dano que o monstro causa por turno
- Recomendado: 5 a 50+

#### **Recompensa em Moedas**
- Moedas ganhas ao derrotar
- Recomendado: 50 a 5000+

#### **XP Reward**
- Experiência ganha ao derrotar
- Recomendado: 25 a 500+

## 💾 Exportar Dados

A aba "Exportar" permite copiar os dados em formato JSON para:

1. Colar no código do jogo (`inventory.js`, `mining-dungeon.js`)
2. Fazer backup dos dados
3. Compartilhar configurações com outros desenvolvedores

### Como Integrar no Jogo

1. Adicione os itens exportados em `ITEM_DEFINITIONS` (`inventory.js`)
2. Adicione os monstros exportados em `ENEMIES` (`mining-dungeon.js`)
3. Configure os pools de drop conforme necessário

## 💾 Armazenamento

Todos os dados são salvos no **localStorage** do navegador:

- `admin_items` - Lista de itens cadastrados
- `admin_monsters` - Lista de monstros cadastrados
- `item_image_[id]` - Imagens dos itens (Base64)
- `monster_image_[id]` - Imagens dos monstros (Base64)

## 🎨 Dicas de Design

### Itens
- **Comuns**: Use cores cinza/friase
- **Incomuns**: Use cores verdes/azuis
- **Raros**: Use cores roxas/rosa/douradas

### Monstros
- **Fracos**: HP < 100, ATK < 15
- **Médios**: HP 100-300, ATK 15-30
- **Fortes**: HP 300-500, ATK 30-50
- **Elites**: HP 500+, ATK 50+

### Sprites Pixel Art
- **Resolução**: 64x64 ou 128x128 pixels
- **Fundo**: Transparente
- **Estilo**: Consistente com o tema do jogo
- **Cores**: Brilhantes e contrastantes

## 🔧 Funcionalidades

✅ **CRUD Completo**: Criar, Ler, Atualizar, Deletar
✅ **Preview em Tempo Real**: Veja antes de salvar
✅ **Validação**: Prevê dados incorretos
✅ **Imagens**: Upload e preview de sprites
✅ **Exportação**: JSON formatado e copiável
✅ **Persistência**: Salva automaticamente no localStorage

## 🐛 Troubleshooting

### Imagens não aparecem
- Verifique se o formato é PNG
- Certifique-se de que a imagem tem transparência
- Tamanho recomendado: 64x64 ou 128x128

### Dados não salvam
- Verifique o console do navegador (F12)
- Limite do localStorage pode ser atingido
- Tente limpar dados antigos

### Preview quebrado
- Recarregue a página
- Verifique se todos os campos obrigatórios estão preenchidos

## 📚 Exemplos

### Item de Exemplo
```json
{
  "id": "gem_power",
  "name": "Gema de Poder",
  "description": "Aumenta CPC em 10%",
  "icon": "💎",
  "rarity": "common",
  "buffType": "cpc_multiplier",
  "buffValue": 0.1,
  "duration": null
}
```

### Monstro de Exemplo
```json
{
  "id": "goblin_warrior",
  "name": "Goblin Guerreiro",
  "description": "Um goblin feroz armado com espada enferrujada",
  "icon": "👹",
  "hp": 150,
  "attack": 25,
  "coinReward": 200,
  "xpReward": 50
}
```

## 🎯 Próximos Passos

Após criar seus itens/monstros:

1. Exporte os dados JSON
2. Copie para os arquivos correspondentes no jogo
3. Teste no jogo
4. Ajuste valores conforme necessário
5. Compartilhe com a comunidade!

---

**Desenvolvido para Game Miner** 🎮⚡

