# Guia de Edição do Banco de Exercícios

O banco de exercícios está localizado em `server/data/exercises.json`.

## Estrutura de um Exercício

```json
{
  "nome": "Nome do Exercício",
  "grupos_musculares": ["Músculo Principal", "Músculo Secundário"],
  "equipamentos": ["equipamento1 / equipamento2"],
  "improvise": ["alternativa 1", "alternativa 2", "alternativa 3"],
  "youtube_url": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

## Campos Explicados

### `nome`
Nome do exercício em português.

### `grupos_musculares`
Array com os grupos musculares trabalhados. O primeiro é o principal.

### `equipamentos`
Array com os equipamentos necessários. Use "/" para separar alternativas no mesmo item.
Exemplos:
- `["barra fixa / barra"]`
- `["peso corporal"]`
- `["halteres / barra"]`

### `improvise` ⭐ NOVO
Array com alternativas criativas para fazer o exercício sem equipamento profissional.
Isso permite que alunos treinem em casa ou em qualquer lugar!

Exemplos:
- `["galho de árvore resistente", "barra de playground"]`
- `["garrafas de água como pesos", "mochila com livros"]`
- `["cadeira doméstica resistente", "degrau de escada"]`

### `youtube_url`
Link do vídeo demonstrativo no YouTube. Será incorporado no treino para o aluno assistir.

## Como Adicionar um Novo Exercício

1. Abra `server/data/exercises.json`
2. Adicione um novo objeto no array seguindo a estrutura acima
3. Salve o arquivo
4. Reinicie o servidor (`./start.sh`)

## Como a IA Usa o Campo "Improvise"

Quando a IA detecta que o aluno não tem o equipamento ideal:
1. Ela sugere o exercício principal
2. Nas observações, inclui as alternativas do campo "improvise"
3. O aluno pode treinar mesmo sem academia!

## Exemplo Completo

```json
{
  "nome": "Rosca Scott",
  "grupos_musculares": ["Bíceps", "Antebraços"],
  "equipamentos": ["Barra W / Barra reta", "Banco Scott"],
  "improvise": [
    "rosca concentrada com garrafa de água",
    "rosca apoiando cotovelo na coxa (sentado)",
    "usar mochila como peso"
  ],
  "youtube_url": "https://www.youtube.com/watch?v=EXEMPLO"
}
```

## Dicas

- Seja específico nos nomes dos exercícios
- Liste músculos do mais trabalhado para o menos
- No "improvise", seja criativo mas seguro
- Sempre teste se o JSON está válido após editar
