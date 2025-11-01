# 📸 Como Adicionar Imagens de Ícones para Upgrades

Este guia explica como adicionar imagens pixel art para os upgrades do jogo.

## 📁 Estrutura de Arquivos

Coloque as imagens dos upgrades na pasta:
```
assets/upgrades/
```

## 🎨 Especificações das Imagens

### Formato
- **Tipo**: PNG com transparência (fundo transparente)
- **Resolução**: 64x64 ou 128x128 pixels
- **Estilo**: Pixel art com paleta de cores vibrantes

### Nomeação
O nome do arquivo deve seguir o padrão:
```
[upgrade_id].png
```

**Exemplo**: Para o upgrade "Força Manual" (que tem `id: "forca_manual"`), o arquivo deve ser:
```
forca_manual.png
```

## 🔍 Lista de Upgrade IDs

Para referência, aqui estão os IDs dos upgrades:

### Upgrades Desbloqueados Inicialmente
- `forca_manual` - Força Manual
- `reforco_algoritmo` - Reforço de Algoritmo
- `dedo_titanio` - Dedo de Titânio
- `punhos_relampago` - Punhos Relâmpago
- `golpes_criticos` - Golpes Críticos
- `toque_midas` - Toque de Midas
- `rato_automatico` - Rato Automático
- `minerador_junior` - Minerador Junior
- `fazenda_clones` - Fazenda de Clones
- `maquina_ouro` - Máquina de Ouro

### Upgrades Bloqueados (Desbloqueio por CPS)
- `satelite_energia` - Satélite de Energia
- `fusao_quantica` - Fusão Quântica
- `portal_temporal` - Portal Temporal
- `universo_paralelo` - Universo Paralelo
- `matriz_cosmos` - Matriz Cósmica
- `singularidade` - Singularidade
- `realidade_virtual` - Realidade Virtual
- `divindade_mineradora` - Divindade Mineradora

## ✅ Como Funciona

1. **Sistema Automático**: O jogo tenta carregar automaticamente a imagem de `assets/upgrades/[id].png` para cada upgrade
2. **Fallback**: Se a imagem não existir, o emoji padrão do upgrade é exibido
3. **Suporte Implícito**: Apenas adicione o arquivo PNG na pasta e o sistema funcionará automaticamente

## 🖼️ CSS Aplicado

As imagens recebem automaticamente as seguintes estilizações:
- Renderização pixelizada
- Drop shadow escuro para profundidade
- Brilho e contraste ajustados
- Efeitos de hover com zoom
- Transições suaves

## 📝 Exemplo de Uso

Para adicionar a imagem do upgrade "Força Manual":

1. Crie/obtenha uma imagem pixel art de um punho fechado com botão de energia
2. Salve como `forca_manual.png` na pasta `assets/upgrades/`
3. O jogo automaticamente usará essa imagem em vez do emoji ✊

## 🎨 Dicas de Design

- Use paletas de cores vibrantes (cores primárias, neon, etc.)
- Mantenha o estilo consistente com pixel art retro
- Garanta que a imagem seja legível mesmo em tamanhos pequenos
- Use transparência para o fundo
- Considere adicionar um leve brilho nos itens raros

## 🔧 Troubleshooting

Se a imagem não aparecer:
1. Verifique se o nome do arquivo está correto (case-sensitive)
2. Verifique se o formato é PNG
3. Confirme que o arquivo está na pasta `assets/upgrades/`
4. Verifique o console do navegador para erros de carregamento

## 📚 Referência

Veja também:
- `docs/COMO_ADICIONAR_IMAGENS_ITENS.md` - Guia similar para itens de inventário
- `docs/LISTA_ICONES_UPGRADES.md` - Lista completa de ícones dos upgrades

