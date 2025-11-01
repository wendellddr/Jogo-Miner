# Como Adicionar Imagens Customizadas aos Itens

Para adicionar imagens pixel art aos itens, siga estes passos:

## 1. Preparar as Imagens

Salve suas imagens pixel art na pasta `assets/items/` com os seguintes nomes:

### Itens Mágicos:
- `gem_power.png` - Gema de Poder
- `crystal_strength.png` - Cristal de Força
- `diamond_might.png` - Diamante do Poder
- `speed_crystal.png` - Cristal de Velocidade
- `time_gem.png` - Gema Temporal
- `infinity_stone.png` - Pedra Infinita
- `crit_charm.png` - Amuleto Crítico
- `lucky_clover.png` - Trevo da Sorte
- `fate_dice.png` - Dado do Destino
- `power_ring.png` - Anel de Poder
- `chaos_orb.png` - Orbe do Caos
- `coin_magnet.png` - Ímã de Moedas
- `multiplier_gem.png` - Gema Multiplicadora

### Itens RPG:
- `leather_armor.png` - Armadura de Couro
- `iron_sword.png` - Espada de Ferro
- `oak_bow.png` - Arco de Carvalho
- `wooden_shield.png` - Escudo de Madeira
- ... (adicione todos os itens necessários)

## 2. Especificações das Imagens

- **Formato**: PNG com transparência
- **Tamanho recomendado**: 64x64 pixels ou 128x128 pixels
- **Estilo**: Pixel art consistente
- **Fundo**: Transparente

## 3. Sistema Automático

O sistema irá automaticamente:
1. Verificar se a imagem existe na pasta `assets/items/[item_id].png`
2. Se existir, usar a imagem ao invés do emoji
3. Se não existir, usar o emoji padrão

## 4. Exemplo de Estrutura de Pastas

```
Jogo-Miner/
├── assets/
│   ├── items/
│   │   ├── gem_power.png
│   │   ├── crystal_strength.png
│   │   ├── iron_sword.png
│   │   └── ... (outros itens)
│   └── logo-minerador-moedas.png
├── docs/
├── js/
└── ...
```

## 5. Atualização Automática

O código já está preparado para suportar imagens. Apenas adicione os arquivos PNG na pasta correta e eles serão carregados automaticamente!

## 6. CSS de Pixel Art

As imagens já possuem CSS especial para renderização pixel:
- `image-rendering: pixelated` - Mantém pixels nítidos
- Drop shadows pixelizados
- Efeitos de brilho e contraste
- Hover effects suaves

