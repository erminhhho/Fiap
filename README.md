# Boas Práticas do Projeto

Este projeto segue um conjunto de diretrizes que visam manter o código limpo, consistente e sustentável. As práticas descritas aqui devem ser seguidas sempre que algo novo for desenvolvido ou modificado.

## [AVISO] PROIBIÇÃO TOTAL DE EMOJIS

**ATENÇÃO: É ESTRITAMENTE PROIBIDO O USO DE EMOJIS EM QUALQUER PARTE DESTE PROJETO**

### Por que emojis são proibidos?
- Podem causar problemas de codificação em diferentes sistemas
- Dificultam a legibilidade e busca no código
- Criam inconsistências visuais entre diferentes ambientes
- Podem quebrar em terminais, logs ou sistemas de CI/CD
- Tornam o código menos profissional e padronizado

### O que é considerado emoji?
- Qualquer caractere Unicode emoji (símbolos visuais coloridos)
- Símbolos decorativos como estrelas, corações, símbolos geométricos
- Caracteres especiais desnecessários que não sejam ASCII padrão

### Como substituir emojis por texto?
Use sempre tags descritivas em português entre colchetes:

```
[ERRADO]
console.log('[EMOJI_LUPA] Iniciando busca...');
if (success) logger.info('[EMOJI_CHECK] Operação concluída');

[CORRETO]
console.log('[DEBUG] Iniciando busca...');
if (success) logger.info('[SUCESSO] Operação concluída');
```

### Tags recomendadas para substituição:
- `[OK]` ou `[SUCESSO]` - Para sucessos
- `[ERRO]` ou `[ERROR]` - Para erros
- `[AVISO]` ou `[WARNING]` - Para avisos
- `[INFO]` ou `[DEBUG]` - Para informações
- `[TEST]` - Para testes
- `[PROCESSING]` - Para processamento
- `[CLEANUP]` - Para limpeza
- `[BACKUP]` - Para backup
- `[RESTORE]` - Para restauração
- `[CACHE]` - Para operações de cache
- `[VALIDATION]` - Para validações

### Verificação automática:
Para verificar se há emojis no projeto, execute:
```bash
# Buscar por emojis em arquivos JS/HTML/CSS
grep -r -P "[\x{1F000}-\x{1F9FF}]|[\x{2600}-\x{26FF}]|[\x{2700}-\x{27BF}]" --include="*.js" --include="*.html" --include="*.css" .
```

### Consequências:
- Pull Requests com emojis serão REJEITADOS
- Código com emojis deve ser IMEDIATAMENTE corrigido
- Esta regra é INEGOCIÁVEL e se aplica a TODOS os contribuidores

---

## Organização de Arquivos

- Usar nomes de arquivos em inglês, minimalistas e não compostos.
- Evitar a criação de pastas desnecessárias. Manter a estrutura do projeto o mais simples possível.
- Reduzir a profundidade de diretórios sempre que possível.
- Antes de criar algo novo, verificar se existe um padrão já adotado no projeto e segui-lo.

## Código e Qualidade

- Jamais fazer gambiarras ou soluções paliativas.
- Resolver sempre a origem real dos problemas, em vez de contornar seus efeitos.
- Aplicar boas práticas de programação.
- Utilizar boas práticas de modularização, com responsabilidades bem definidas por módulo.
- Cada módulo, função ou componente deve ter uma única responsabilidade.
- Escrever código claro, objetivo e de fácil leitura.

## Estilo de Código

- Manter consistência no estilo de escrita (indentação, aspas, nomes de variáveis, etc.).
- Usar linters e formatadores para padronizar o código automaticamente.
- Comentar apenas o necessário, evitando explicar o que já é óbvio.

## Dependências

- Adicionar apenas dependências necessárias e justificadas.
- Priorizar bibliotecas bem mantidas e amplamente utilizadas.
- Manter os arquivos de gerenciamento de dependências atualizados.

## Scripts e Automação

- Criar scripts para tarefas repetitivas sempre que fizer sentido.
- Padronizar processos como build, lint, deploy ou outros para evitar inconsistências.

## Colaboração

- Commits devem ser claros, objetivos e escritos no imperativo (ex: `Add login validation`).
- Usar branches descritivas com prefixos temáticos como `feature/`, `fix/`, `refactor/`.
- Pull Requests devem ser pequenos, focados e fáceis de revisar.

---

## [PROIBIDO] LEMBRETE FINAL: ZERO EMOJIS

**ESTE PROJETO ESTÁ 100% LIVRE DE EMOJIS E DEVE PERMANECER ASSIM**

Se você encontrar qualquer emoji em qualquer arquivo, remova-o IMEDIATAMENTE usando as tags de texto recomendadas acima.

**Não há exceções para esta regra. Emojis = Código rejeitado.**

---

Estas práticas são parte essencial da manutenção de um código sustentável. Ao contribuir, respeite e preserve essas diretrizes.
