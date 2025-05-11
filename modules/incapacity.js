/**
 * Módulo de Incapacidades
 *
 * Este é o módulo principal para o tratamento de incapacidades no sistema.
 * O arquivo modules/disability.js foi marcado como obsoleto em favor deste.
 */

// Lista de CIDs que dispensam carência
const cidsSemCarencia = [
  // Tuberculose ativa
  'a15', 'a16', 'a17', 'a18', 'a19',
  // Hanseníase
  'a30',
  // Alienação mental / transtornos mentais graves
  'f00', 'f01', 'f02', 'f03', 'f20', 'f21', 'f22', 'f23', 'f24', 'f25', 'f28', 'f29',
  'f30', 'f31', 'f32', 'f33',
  // Neoplasia maligna (câncer)
  'c00', 'c01', 'c02', 'c03', 'c04', 'c05', 'c06', 'c07', 'c08', 'c09',
  'c10', 'c11', 'c12', 'c13', 'c14', 'c15', 'c16', 'c17', 'c18', 'c19',
  'c20', 'c21', 'c22', 'c23', 'c24', 'c25', 'c26', 'c27', 'c28', 'c29',
  'c30', 'c31', 'c32', 'c33', 'c34', 'c35', 'c36', 'c37', 'c38', 'c39',
  'c40', 'c41', 'c42', 'c43', 'c44', 'c45', 'c46', 'c47', 'c48', 'c49',
  'c50', 'c51', 'c52', 'c53', 'c54', 'c55', 'c56', 'c57', 'c58', 'c59',
  'c60', 'c61', 'c62', 'c63', 'c64', 'c65', 'c66', 'c67', 'c68', 'c69',
  'c70', 'c71', 'c72', 'c73', 'c74', 'c75', 'c76', 'c77', 'c78', 'c79',
  'c80', 'c81', 'c82', 'c83', 'c84', 'c85', 'c86', 'c87', 'c88', 'c89',
  'c90', 'c91', 'c92', 'c93', 'c94', 'c95', 'c96', 'c97',
  // Cegueira
  'h54.0', 'h54.1', 'h54.3',
  // Paralisia irreversível e incapacitante
  'g80', 'g81', 'g82', 'g83',
  // Cardiopatia grave
  'i20', 'i21', 'i22', 'i24', 'i25', 'i42', 'i50',
  // Doença de Parkinson
  'g20',
  // Espondiloartrose anquilosante
  'm45',
  // Nefropatia grave
  'n17', 'n18', 'n19',
  // Estado avançado da Doença de Paget (osteíte deformante)
  'm88',
  // AIDS
  'b20', 'b21', 'b22', 'b23', 'b24',
  // Contaminação por radiação
  't66',
  // Hepatopatia grave
  'k72', 'k74', 'k76.6', 'k76.7'
];

// Lista de doenças que dispensam carência (mantida para compatibilidade)
const doencasSemCarencia = [
  'tuberculose ativa',
  'hanseníase',
  'alienação mental',
  'transtorno mental grave',
  'esquizofrenia',
  'transtorno bipolar',
  'neoplasia maligna',
  'câncer',
  'cancer',
  'cegueira',
  'paralisia irreversível',
  'paralisia incapacitante',
  'cardiopatia grave',
  'doença de parkinson',
  'espondiloartrose anquilosante',
  'nefropatia grave',
  'doença de paget',
  'osteíte deformante',
  'aids',
  'hiv',
  'síndrome da deficiência imunológica adquirida',
  'contaminação por radiação',
  'hepatopatia grave',
  'cirrose hepática'
];

// Variável para evitar inicialização múltipla
let isDropdownHandlersInitialized = false;

// Limpar função de inicialização anterior
window.initModule = null;

// Definir nova função de inicialização do módulo
window.initModule = function() {
  // Remover a proteção que estava bloqueando a inicialização
  window._incapacityInitialized = false;

  // Inicializar configurações básicas
  setupEvents();

  // Configurar fechamento automático dos dropdowns
  setupDropdownHandlers();

  // Injetar estilos CSS para garantir que a visualização do item selecionado seja ocultada
  injectFixStyles();

  // Inicializar verificação de isenção de carência - garante que a verificação é feita
  setupIsencaoCarencia();

  // Inicializar o sistema de CID para os campos existentes
  if (typeof initCidSystem === 'function') {
    // Inicializa imediatamente
    try {
      initCidSystem();
    } catch (e) {
      console.warn("Erro na primeira inicialização do sistema CID:", e);
    }

    // E também com um pequeno atraso para garantir que todos os elementos foram carregados
    setTimeout(() => {
      try {
        initCidSystem();
      } catch (e) {
        console.warn("Erro na segunda inicialização do sistema CID:", e);
      }

      // Garantir que os campos sejam verificados após inicialização do sistema CID
      document.querySelectorAll('.doenca-input, .cid-input').forEach(input => {
        if (input.classList.contains('doenca-input')) {
          verificarIsencaoCarencia(input);
        } else if (input.classList.contains('cid-input')) {
          const index = input.getAttribute('data-index');
          const doencaInput = document.getElementById('doenca' + index);
          if (doencaInput) {
            verificarIsencaoCarencia(doencaInput);
          }
        }
      });
    }, 500); // Aumentado para 500ms para garantir que tudo carregue
  }
};

// Injetar estilos CSS para corrigir a exibição de itens selecionados
function injectFixStyles() {
  // Verificar se o estilo já foi adicionado
  if (document.getElementById('dropdown-fix-styles')) return;

  // Criar um elemento de estilo
  const style = document.createElement('style');
  style.id = 'dropdown-fix-styles';
  style.innerHTML = `
    /* Ocultar qualquer item de dropdown que apareça fora do dropdown */
    .dropdown-item-selected,
    .dropdown-select-selected,
    .dropdown-content > div:only-child,
    body > .dropdown-item,
    body > .autocomplete-item,
    .dropdown-content-selected,
    .autocomplete-selected,
    .dropdown-selected,
    body > div[class*="dropdown"],
    body > div[class*="autocomplete"],
    /* Seletores de componentes específicos de autocomplete */
    .autocomplete-items,
    .autocomplete-active,
    .autocomplete-suggestion,
    /* Capturar elementos soltos no body */
    body > div:not([class]):not([id])[style*="position: absolute"],
    body > .absolute {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
      height: 0 !important;
      width: 0 !important;
      position: absolute !important;
      left: -9999px !important;
    }

    /* Garantir que os dropdowns só fiquem visíveis quando tiverem a classe apropriada */
    .cid-dropdown,
    .doenca-dropdown,
    .dropdown-content {
      visibility: hidden;
      display: none;
      opacity: 0;
      transition: none !important;
    }

    .cid-dropdown:not(.hidden),
    .doenca-dropdown:not(.hidden),
    .dropdown-content:not(.hidden) {
      visibility: visible;
      display: block;
      opacity: 1;
    }
  `;

  // Adicionar o estilo ao cabeçalho do documento
  document.head.appendChild(style);

  // Intervalo para remover itens selecionados a cada 500ms
  setInterval(cleanupSelectedItems, 500);
}

// Função para limpar periodicamente itens selecionados
function cleanupSelectedItems() {
  // Seletores para capturar todos os possíveis componentes de item selecionado
  const selectors = [
    '.dropdown-item-selected',
    '.dropdown-select-selected',
    '.dropdown-content > div:only-child',
    'body > .dropdown-item',
    'body > .autocomplete-item',
    '.dropdown-content-selected',
    '.autocomplete-selected',
    '.dropdown-selected',
    'body > div[class*="dropdown"]:not(.cid-dropdown):not(.doenca-dropdown)',
    'body > div[class*="autocomplete"]',
    '.autocomplete-items',
    '.autocomplete-active',
    '.autocomplete-suggestion',
    // Capturar elementos soltos no body que parecem ser dropdowns
    'body > div:not([class]):not([id])[style*="position: absolute"]',
    'body > .absolute:not(.cid-dropdown):not(.doenca-dropdown)'
  ].join(', ');

  // Remover todos os elementos que correspondam aos seletores
  document.querySelectorAll(selectors).forEach(item => {
    if (item.parentElement && !item.parentElement.classList.contains('cid-dropdown') &&
        !item.parentElement.classList.contains('doenca-dropdown')) {
      item.remove();
    }
  });
}

// Configurar fechamento automático dos dropdowns ao selecionar um item ou clicar fora
function setupDropdownHandlers() {
  if (isDropdownHandlersInitialized) return;

  // Sobrescrever funções globais associadas a autocomplete
  overrideAutocompleteFunctions();

  // Fechar dropdowns quando clicar fora - usando mousedown para capturar antes do click
  document.addEventListener('mousedown', function(e) {
    // Fechar todos os dropdowns e itens selecionados visíveis quando clicar fora
    const dropdowns = document.querySelectorAll('.cid-dropdown:not(.hidden), .doenca-dropdown:not(.hidden), .dropdown-item-selected');
    dropdowns.forEach(dropdown => {
      // Se o clique não foi no dropdown e nem em seu input associado
      let inputId = dropdown.id ? dropdown.id.replace('Dropdown', '') : null;
      const associatedInput = inputId ? document.getElementById(inputId) : null;

      if (!dropdown.contains(e.target) && (!associatedInput || !associatedInput.contains(e.target))) {
        // Fechar dropdown ou remover o item selecionado
        if (dropdown.classList.contains('dropdown-item-selected')) {
          dropdown.remove(); // Remove completamente o item selecionado
        } else {
          dropdown.classList.add('hidden');
        }
      }
    });
  });

  // Sobrescrever a função de clique nos itens do dropdown para garantir que o dropdown seja fechado
  function handleDropdownItemClick(e) {
    e.preventDefault();
    e.stopPropagation();

    // Encontrar o dropdown pai
    const dropdown = this.closest('.cid-dropdown, .doenca-dropdown');
    if (dropdown) {
      // Fechar o dropdown imediatamente
      dropdown.classList.add('hidden');

      // Encontrar o input associado
      const inputId = dropdown.id.replace('Dropdown', '');
      const input = document.getElementById(inputId);

      if (input) {
        // Garantir que o input receba o foco após selecionar item
        setTimeout(() => {
          input.focus();

          // Remover qualquer item selecionado que possa estar visível
          const selectedItems = document.querySelectorAll('.dropdown-item-selected');
          selectedItems.forEach(item => item.remove());
        }, 10);
      }
    }
  }

  // Aplicar handler para todos os itens de dropdown existentes
  document.querySelectorAll('.cid-dropdown .dropdown-item, .doenca-dropdown .dropdown-item, .dropdown-item').forEach(item => {
    // Remover manipuladores anteriores para evitar duplicação
    item.removeEventListener('mousedown', handleDropdownItemClick);
    // Adicionar novo manipulador usando mousedown para capturar antes do click
    item.addEventListener('mousedown', handleDropdownItemClick);
  });

  // Adicionar manipuladores de eventos para os campos existentes
  document.querySelectorAll('.cid-input, .doenca-input').forEach(input => {
    setupInputEventHandlers(input);

    // Adicionar handler específico para limpar itens selecionados quando o input recebe foco
    input.addEventListener('focus', function() {
      // Remover qualquer item selecionado que possa estar visível
      const selectedItems = document.querySelectorAll('.dropdown-item-selected');
      selectedItems.forEach(item => item.remove());
    });
  });

  // Observe o documento inteiro para detectar novos itens de dropdown adicionados dinamicamente
  const documentObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes.length > 0) {
        // Procurar por novos itens de dropdown
        const newItems = Array.from(mutation.addedNodes)
          .filter(node => node.nodeType === 1) // Apenas elementos
          .map(node => {
            if (node.querySelectorAll) {
              // Procurar itens de dropdown dentro do nó
              const items = Array.from(node.querySelectorAll('.dropdown-item'));

              // Verificar se o próprio nó é um item de dropdown ou item selecionado
              if (node.classList &&
                 (node.classList.contains('dropdown-item') ||
                  node.classList.contains('dropdown-item-selected'))) {
                items.push(node);
              }

              return items;
            } else {
              return [];
            }
          })
          .flat();

        // Adicionar handler aos novos itens
        newItems.forEach(item => {
          if (item.classList.contains('dropdown-item-selected')) {
            // Remover automaticamente após um breve delay
            setTimeout(() => {
              if (document.body.contains(item)) {
                item.remove();
              }
            }, 100);
          } else {
            // Adicionar handler para itens de dropdown
            item.removeEventListener('mousedown', handleDropdownItemClick);
            item.addEventListener('mousedown', handleDropdownItemClick);
          }
        });
      }
    });
  });

  // Observar o documento inteiro
  documentObserver.observe(document.body, { childList: true, subtree: true });

  isDropdownHandlersInitialized = true;
}

// Sobrescrever funções globais associadas a componentes de autocomplete
function overrideAutocompleteFunctions() {
  // Verificar e sobrescrever funções comuns de autocomplete
  const functionsToOverride = [
    'showAutocompleteItems',
    'displayMatches',
    'showDropdown',
    'showSuggestions',
    'renderDropdown',
    'renderSuggestions',
    'displaySelected',
    'selectItem'
  ];

  // Para cada função, adicionar um wrapper que limpa itens selecionados após execução
  functionsToOverride.forEach(funcName => {
    if (typeof window[funcName] === 'function') {
      const originalFunc = window[funcName];
      window[funcName] = function(...args) {
        const result = originalFunc.apply(this, args);

        // Limpar itens selecionados após um pequeno atraso
        setTimeout(cleanupSelectedItems, 50);
        return result;
      };
    }
  });

  // Adicionar handlers globais para eventos de clique
  document.addEventListener('click', cleanupSelectedItems);
  document.addEventListener('mousedown', cleanupSelectedItems);

  // Sobrescrever o método de clique padrão para todos os elementos
  const originalAddEventListener = Element.prototype.addEventListener;
  Element.prototype.addEventListener = function(type, listener, options) {
    if (type === 'click' || type === 'mousedown') {
      const wrappedListener = function(e) {
        const result = listener.call(this, e);
        setTimeout(cleanupSelectedItems, 10);
        return result;
      };
      return originalAddEventListener.call(this, type, wrappedListener, options);
    }
    return originalAddEventListener.call(this, type, listener, options);
  };
}

// Configura os manipuladores de eventos para um campo de input específico
function setupInputEventHandlers(input) {
  if (input.dataset.handlersInitialized) return;

  const type = input.classList.contains('cid-input') ? 'cid' : 'doenca';
  const index = input.getAttribute('data-index');
  const dropdownId = type + 'Dropdown' + index;
  const dropdown = document.getElementById(dropdownId);

  if (!dropdown) return;

  // Adicionar manipulador para cada input para fechar outros dropdowns
  input.addEventListener('click', function() {
    // Fechar todos os outros dropdowns
    document.querySelectorAll('.cid-dropdown:not(.hidden), .doenca-dropdown:not(.hidden)').forEach(d => {
      if (d.id !== dropdownId) {
        d.classList.add('hidden');
      }
    });

    // Limpar itens selecionados
    cleanupSelectedItems();
  });

  // Adicionar manipulador de eventos para fechar o dropdown ao selecionar um item
  dropdown.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('mousedown', function(e) {
      e.preventDefault();
      e.stopPropagation();

      // Fechar o dropdown imediatamente
      dropdown.classList.add('hidden');

      // Força limpeza imediata e após um pequeno atraso
      cleanupSelectedItems();
      setTimeout(cleanupSelectedItems, 50);
      setTimeout(cleanupSelectedItems, 200);
    });
  });

  input.dataset.handlersInitialized = 'true';
}

// Função para verificar se a doença dispensa carência
function verificarIsencaoCarencia(input) {
  // Verificar pelo CID primeiro (preferencial)
  const cidIndex = input.getAttribute('data-index');
  const cidInput = document.getElementById('cid' + cidIndex);
  let isento = false;

  if (cidInput && cidInput.value.trim() !== '') {
    const cidValor = cidInput.value.toLowerCase().replace(/\s+/g, '').replace(/\./g, '.');

    // Verificar se o CID está na lista de isentos
    isento = cidsSemCarencia.some(cid => {
      // Comparação exata do início do CID (prefixo)
      return cidValor.startsWith(cid.toLowerCase().replace(/\s+/g, ''));
    });
  }

  // Se não encontrou pelo CID, tenta pelo nome da doença (método secundário)
  if (!isento) {
    const doencaValor = input.value.toLowerCase();
    isento = doencasSemCarencia.some(doenca => doencaValor.includes(doenca));
  }

  // Encontrar a tag de isenção associada a este input
  const tagIsencao = input.closest('.relative').querySelector('.isento-carencia-tag');

  if (isento && (input.value.trim() !== '' || (cidInput && cidInput.value.trim() !== ''))) {
    tagIsencao.classList.remove('hidden');
  } else {
    tagIsencao.classList.add('hidden');
  }
}

// Função para configurar a verificação de isenção de carência
function setupIsencaoCarencia() {
  // Adicionar listeners para campos existentes
  document.querySelectorAll('.doenca-input').forEach(input => {
    if (!input.dataset.isencaoListenerAdded) {
      input.addEventListener('input', function() {
        verificarIsencaoCarencia(this);
      });
      input.addEventListener('blur', function() {
        verificarIsencaoCarencia(this);
      });
      input.dataset.isencaoListenerAdded = 'true';
      // Verificar estado inicial
      verificarIsencaoCarencia(input);
    }
  });

  // Adicionar listeners também para os campos CID existentes
  document.querySelectorAll('.cid-input').forEach(input => {
    if (!input.dataset.isencaoListenerAdded) {
      input.addEventListener('input', function() {
        const index = this.getAttribute('data-index');
        const doencaInput = document.getElementById('doenca' + index);
        if (doencaInput) {
          verificarIsencaoCarencia(doencaInput);
        }
      });
      input.addEventListener('blur', function() {
        const index = this.getAttribute('data-index');
        const doencaInput = document.getElementById('doenca' + index);
        if (doencaInput) {
          verificarIsencaoCarencia(doencaInput);
        }
      });
      input.dataset.isencaoListenerAdded = 'true';
      // Verificar estado inicial
      const index = input.getAttribute('data-index');
      const doencaInput = document.getElementById('doenca' + index);
      if (doencaInput) {
        verificarIsencaoCarencia(doencaInput);
      }
    }
  });

  // Atualizar quando novos campos forem adicionados
  const doencasList = document.getElementById('doencasList');
  if (doencasList) {
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach(function(node) {
            if (node.nodeType === 1) { // Element node
              const novosCampos = node.querySelectorAll('.doenca-input, .cid-input');
              novosCampos.forEach(input => {
                if (!input.dataset.isencaoListenerAdded) {
                  if (input.classList.contains('doenca-input')) {
                    input.addEventListener('input', function() {
                      verificarIsencaoCarencia(this);
                    });
                    input.addEventListener('blur', function() {
                      verificarIsencaoCarencia(this);
                    });
                  } else if (input.classList.contains('cid-input')) {
                    input.addEventListener('input', function() {
                      const index = this.getAttribute('data-index');
                      const doencaInput = document.getElementById('doenca' + index);
                      if (doencaInput) {
                        verificarIsencaoCarencia(doencaInput);
                      }
                    });
                    input.addEventListener('blur', function() {
                      const index = this.getAttribute('data-index');
                      const doencaInput = document.getElementById('doenca' + index);
                      if (doencaInput) {
                        verificarIsencaoCarencia(doencaInput);
                      }
                    });
                  }
                  input.dataset.isencaoListenerAdded = 'true';

                  // Verificar estado inicial se for um campo de doença
                  if (input.classList.contains('doenca-input')) {
                    verificarIsencaoCarencia(input);
                  }
                }

                // Configurar manipuladores de eventos para os dropdowns
                setupInputEventHandlers(input);
              });
            }
          });
        }
      });
    });

    // Observar o container de doenças para detectar quando novos campos são adicionados
    observer.observe(doencasList, { childList: true, subtree: true });
  }
}

// Função para configurar eventos do módulo
function setupEvents() {
  // Destacar campos preenchidos
  if (typeof destacarCamposPreenchidos === 'function') {
    destacarCamposPreenchidos();
  }

  // Botão para adicionar doença/CID
  const addDoencaBtn = document.getElementById('addDoenca');
  if (addDoencaBtn) {
    // Remover qualquer evento existente para evitar duplicação
    const newBtn = addDoencaBtn.cloneNode(true);
    addDoencaBtn.parentNode.replaceChild(newBtn, addDoencaBtn);

    // Aplicar estilo centralizado ao botão de adicionar
    if (window.tw && typeof window.tw.applyTo === 'function') {
      window.tw.applyTo(newBtn, 'button.add');
    }

    // Adicionar o evento ao novo botão - versão simplificada
    newBtn.addEventListener('click', function(e) {
      addDoencaField();
    });
  }

  // Configurar campos "outro" nos selects
  document.querySelectorAll('select[data-other-target]').forEach(select => {
    select.addEventListener('change', function() {
      const targetId = this.getAttribute('data-other-target');
      const targetField = document.getElementById(targetId);

      if (targetField) {
        if (this.value === 'outro') {
          targetField.classList.remove('hidden');
        } else {
          targetField.classList.add('hidden');
        }
      }
    });
  });

  // Botão Voltar
  const backButton = document.getElementById('btn-back');
  if (backButton) {
    // Aplicar estilo centralizado ao botão voltar
    if (window.tw && typeof window.tw.applyTo === 'function') {
      window.tw.applyTo(backButton, 'button.secondary');
    }

    backButton.addEventListener('click', function() {
      navigateTo('social');
    });
  }

  // Botão Próximo
  const nextButton = document.getElementById('btn-next');
  if (nextButton) {
    // Aplicar estilo centralizado ao botão próximo
    if (window.tw && typeof window.tw.applyTo === 'function') {
      window.tw.applyTo(nextButton, 'button.primary');
    }

    nextButton.addEventListener('click', function() {
      navigateTo('professional');
    });
  }
}

// Função para adicionar um novo campo de doença/CID
function addDoencaField() {
  const doencasList = document.getElementById('doencasList');
  if (!doencasList) return;

  // Obter o número do próximo índice
  const items = doencasList.querySelectorAll('.cid-input');
  const nextIndex = items.length + 1;

  // Criar um novo elemento de doença
  const newDoencaDiv = document.createElement('div');
  newDoencaDiv.className = 'mb-4 border-b border-gray-200 pb-4';
  newDoencaDiv.innerHTML = `
    <!-- Layout otimizado: todos os campos na mesma linha -->
    <div class="grid grid-cols-1 md:grid-cols-24 gap-4">
      <!-- Documento (agora é o primeiro) -->
      <div class="relative md:col-span-4">
        <select class="peer w-full rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 px-4 py-3 text-gray-800 bg-white transition-colors duration-200" id="tipoDocumento${nextIndex}" name="tipoDocumentos[]" data-index="${nextIndex}">
          <option value="" selected disabled>Selecione</option>
          <option value="exame">Exame</option>
          <option value="atestado">Atestado</option>
          <option value="laudo">Laudo</option>
          <option value="pericia">Perícia</option>
          <option value="receita">Receita</option>
          <option value="outro">Outro</option>
        </select>
        <label for="tipoDocumento${nextIndex}" class="absolute left-4 -top-3 px-1 text-sm text-transparent bg-white rounded-t-lg rounded-b-none transition-all duration-200 pointer-events-none peer-focus:text-blue-600 peer-focus:-top-3 peer-focus:bg-white peer-focus:text-blue-600 peer-focus:rounded-t-lg peer-focus:rounded-b-none peer-focus:text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:bg-transparent peer-placeholder-shown:rounded-none peer-placeholder-shown:text-transparent input-label">
          Documento
        </label>
      </div>

      <!-- CID (segundo campo) -->
      <div class="relative md:col-span-7">
        <input type="text" class="cid-input peer w-full rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 px-4 py-3 text-gray-800 bg-white placeholder-gray-400 transition-colors duration-200" id="cid${nextIndex}" placeholder="CID" name="cids[]" data-index="${nextIndex}" autocomplete="off">
        <label for="cid${nextIndex}" class="absolute left-4 -top-3 px-1 text-sm text-transparent bg-white rounded-t-lg rounded-b-none transition-all duration-200 pointer-events-none peer-focus:text-blue-600 peer-focus:-top-3 peer-focus:bg-white peer-focus:text-blue-600 peer-focus:rounded-t-lg peer-focus:rounded-b-none peer-focus:text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:bg-transparent peer-placeholder-shown:rounded-none peer-placeholder-shown:text-transparent input-label">
          CID
        </label>
        <div class="cid-dropdown hidden absolute z-50 bg-white w-full border border-gray-300 rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto" id="cidDropdown${nextIndex}"></div>
      </div>

      <!-- Doença (terceiro campo) -->
      <div class="relative md:col-span-8">
        <input type="text" class="doenca-input peer w-full rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 px-4 py-3 text-gray-800 bg-white placeholder-gray-400 transition-colors duration-200" id="doenca${nextIndex}" placeholder="Doença ou condição" name="doencas[]" data-index="${nextIndex}" autocomplete="off">
        <label for="doenca${nextIndex}" class="absolute left-4 -top-3 px-1 text-sm text-transparent bg-white rounded-t-lg rounded-b-none transition-all duration-200 pointer-events-none peer-focus:text-blue-600 peer-focus:-top-3 peer-focus:bg-white peer-focus:text-blue-600 peer-focus:rounded-t-lg peer-focus:rounded-b-none peer-focus:text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:bg-transparent peer-placeholder-shown:rounded-none peer-placeholder-shown:text-transparent input-label">
          Doença
        </label>
        <div class="doenca-dropdown hidden absolute z-50 bg-white w-full border border-gray-300 rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto" id="doencaDropdown${nextIndex}"></div>
        <div class="isento-carencia-tag hidden absolute top-0 right-2 font-bold text-xs px-2 py-0.5 rounded-full bg-orange-600 text-white transform -translate-y-1/2 z-20 shadow-sm text-[9px]">Isenção de carência</div>
      </div>

      <!-- Data (último campo) -->
      <div class="relative md:col-span-4">
        <input type="text" class="peer w-full rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 px-4 py-3 text-gray-800 bg-white placeholder-gray-400 transition-colors duration-200" id="dataDocumento${nextIndex}" name="dataDocumentos[]" data-index="${nextIndex}" placeholder="dd/mm/aa" oninput="maskDate(this)">
        <label for="dataDocumento${nextIndex}" class="absolute left-4 -top-3 px-1 text-sm text-transparent bg-white rounded-t-lg rounded-b-none transition-all duration-200 pointer-events-none peer-focus:text-blue-600 peer-focus:-top-3 peer-focus:bg-white peer-focus:text-blue-600 peer-focus:rounded-t-lg peer-focus:rounded-b-none peer-focus:text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:bg-transparent peer-placeholder-shown:rounded-none peer-placeholder-shown:text-transparent input-label">
          Data
        </label>
      </div>

      <!-- Botão de remover como uma coluna do grid -->
      <div class="md:col-span-1 flex items-center justify-center content-center text-center align-middle p-0">
        <button type="button" class="bg-red-500 hover:bg-red-600 text-white rounded-full p-1 flex items-center justify-center w-8 h-8 mx-auto remove-doenca" title="Remover CID/Doença">
          <i class="fas fa-minus"></i>
        </button>
      </div>
    </div>
  `;

  doencasList.appendChild(newDoencaDiv);

  // Configurar o botão de remover
  const removeBtn = newDoencaDiv.querySelector('.remove-doenca');
  if (removeBtn) {
    removeBtn.addEventListener('click', function() {
      newDoencaDiv.remove();
    });
  }

  // Inicializar o sistema de pesquisa de CID para o novo campo
  if (typeof initCidSystem === 'function') {
    setTimeout(() => {
      try {
        initCidSystem();
      } catch (e) {
        console.warn("Erro ao inicializar sistema CID para novo campo:", e);
      }
    }, 100);
  }

  // Destacar campos preenchidos
  if (typeof destacarCamposPreenchidos === 'function') {
    destacarCamposPreenchidos();
  }

  // Verificar isenção de carência para o novo campo
  const doencaInput = newDoencaDiv.querySelector('.doenca-input');
  const cidInput = newDoencaDiv.querySelector('.cid-input');

  if (doencaInput) {
    doencaInput.addEventListener('input', function() {
      verificarIsencaoCarencia(this);
    });
    doencaInput.addEventListener('blur', function() {
      verificarIsencaoCarencia(this);
    });
    doencaInput.dataset.isencaoListenerAdded = 'true';
  }

  if (cidInput) {
    cidInput.addEventListener('input', function() {
      const index = this.getAttribute('data-index');
      const doencaInput = document.getElementById('doenca' + index);
      if (doencaInput) {
        verificarIsencaoCarencia(doencaInput);
      }
    });
    cidInput.addEventListener('blur', function() {
      const index = this.getAttribute('data-index');
      const doencaInput = document.getElementById('doenca' + index);
      if (doencaInput) {
        verificarIsencaoCarencia(doencaInput);
      }
    });
    cidInput.dataset.isencaoListenerAdded = 'true';
  }

  // Configurar manipuladores de eventos para os dropdowns dos novos campos
  setTimeout(() => {
    const newInputs = newDoencaDiv.querySelectorAll('.cid-input, .doenca-input');
    newInputs.forEach(setupInputEventHandlers);
  }, 100);
}

// Exportar funções para uso global
window.setupIncapacityEvents = setupEvents;
window.addIncapacityDoencaField = addDoencaField;
