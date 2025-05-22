/**
 * Módulo de Incapacidades
 *
 * Este é o módulo principal para o tratamento de incapacidades no sistema.
 * O arquivo modules/disability.js foi marcado como obsoleto em favor deste.
 */

// Lista de CIDs e doenças que dispensam carência
// Verificar se já existe para evitar redeclaração
if (typeof window.cidsSemCarencia === 'undefined') {
  // Definir no escopo global para evitar redeclaração
  window.cidsSemCarencia = [
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
}

// Lista de doenças que dispensam carência (mantida para compatibilidade)
if (typeof window.doencasSemCarencia === 'undefined') {
  window.doencasSemCarencia = [
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
}

// Variável para evitar inicialização múltipla
if (typeof window.isDropdownHandlersInitialized === 'undefined') {
  window.isDropdownHandlersInitialized = false;
}

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

  // Implementar o novo sistema de pesquisa e autocomplete para CID e doença
  setupImprovedCidSearch();

  if (typeof initCidSystem === 'function') {
    try {
      initCidSystem();
    } catch (e) {
      console.warn("Erro na primeira inicialização do sistema CID:", e);
    }
    setTimeout(() => {
      try {
        initCidSystem();
      } catch (e) {
        console.warn("Erro na segunda inicialização do sistema CID:", e);
      }
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
    }, 500);
  }

  // Expor addDoencaField globalmente ANTES da restauração
  if (typeof window.addDoencaField === 'undefined' && typeof addDoencaField === 'function') {
    window.addDoencaField = addDoencaField;
    console.log("[incapacity.js] initModule: window.addDoencaField definido.");
  }

  // Restaurar dados para esta etapa
  if (window.formStateManager) {
    const currentStepKey = 'incapacity';
    // Adicionar um pequeno delay para garantir que os sistemas de CID e dropdowns estejam prontos
    setTimeout(() => {
        console.log(`[incapacity.js] initModule: Solicitando restauração para a etapa: ${currentStepKey}`);
        window.formStateManager.ensureFormAndRestore(currentStepKey);
    }, 700); // Delay um pouco maior devido às inicializações de CID
  } else {
    console.error("[incapacity.js] initModule: formStateManager não encontrado. A restauração não ocorrerá.");
  }
  console.log('[incapacity.js] Módulo de incapacidade totalmente inicializado e restauração solicitada.');
};

// Função para resetar a UI da seção de incapacidade (doenças/CIDs)
function resetIncapacityUI() {
  console.log('[incapacity.js] resetIncapacityUI: Iniciando limpeza de linhas de doença/CID.');
  const doencasListContainer = document.getElementById('doencas-list'); // CONFIRMAR ESTE ID

  if (doencasListContainer) {
    // Remover todas as linhas de doença existentes
    const doencaRows = doencasListContainer.querySelectorAll('.doenca-row'); // CONFIRMAR ESTA CLASSE
    doencaRows.forEach(row => row.remove());
    console.log(`[incapacity.js] resetIncapacityUI: ${doencaRows.length} linhas de doença removidas.`);

    // Adicionar uma primeira linha em branco, se a função addDoencaField existir e for apropriado
    if (typeof addDoencaField === 'function') {
      // addDoencaField(); // Descomentar se uma linha inicial for necessária
      // console.log('[incapacity.js] resetIncapacityUI: Uma linha de doença inicial adicionada (se configurado).');
      // Se addDoencaField já é chamada no initModule ou ao carregar o template, talvez não precise chamar aqui.
      // Por enquanto, apenas limpamos. O initModule/restauração deve lidar com a criação da primeira linha se necessário.
    } else {
      console.warn('[incapacity.js] resetIncapacityUI: Função addDoencaField() não encontrada para adicionar linha inicial.');
    }

    // Limpar campos de observações desta seção
    const observacoesTextarea = document.querySelector('#incapacity-form #observacoes'); // Ser mais específico
    if (observacoesTextarea) {
        observacoesTextarea.value = '';
    }

  } else {
    console.warn('[incapacity.js] resetIncapacityUI: Container #doencas-list não encontrado.');
  }
  // Resetar outros estados específicos do módulo de incapacidade, se houver.
  // Por exemplo, limpar seleções de dropdowns, resultados de pesquisa de CID, etc.
  // Isso pode ser complexo e depender da implementação exata dos componentes de UI.
  // Exemplo genérico para limpar dropdowns de pesquisa:
  document.querySelectorAll('.cid-dropdown').forEach(dropdown => dropdown.classList.add('hidden'));
  document.querySelectorAll('.cid-input').forEach(input => input.value = ''); // Limpa campos de input CID
  document.querySelectorAll('.doenca-input').forEach(input => input.value = ''); // Limpa campos de input Doença

  // Resetar a verificação de isenção de carência visualmente
  const carenciaInfo = document.getElementById('carencia-info');
  if (carenciaInfo) {
    carenciaInfo.innerHTML = '<p class="text-sm text-gray-500">Preencha os campos de CID ou Doença para verificar a isenção de carência.</p>';
    carenciaInfo.className = 'mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md'; // Resetar classes
  }
}
window.resetIncapacityUI = resetIncapacityUI;

/**
 * Nova função para implementar a pesquisa melhorada de CID e doença
 * seguindo o padrão utilizado na pesquisa de documentos
 */
function setupImprovedCidSearch() {
  // Encontrar todos os campos de CID
  const cidInputs = document.querySelectorAll('.cid-input');

  // Configurar cada campo CID
  cidInputs.forEach(configurarCampoCID);

  // Configurar evento para fechar dropdowns ao clicar fora
  document.addEventListener('click', (e) => {
    if (!e.target.classList.contains('cid-input')) {
      document.querySelectorAll('.cid-dropdown').forEach(dropdown => {
        if (!dropdown.contains(e.target)) {
          dropdown.classList.add('hidden');
        }
      });
    }
  });
}

/**
 * Configura campo de pesquisa de CID com interface melhorada
 * @param {HTMLElement} input - O campo de entrada de CID
 */
function configurarCampoCID(input) {
  if (!input) return;

  const index = input.getAttribute('data-index');
  if (!index) return;

  // Encontrar o dropdown correspondente
  const dropdown = document.getElementById(`cidDropdown${index}`);
  if (!dropdown) return;

  // Encontrar o campo de doença relacionado
  const doencaInput = document.getElementById(`doenca${index}`);
  if (!doencaInput) return;

  // Configurar evento de digitação para pesquisa
  input.addEventListener('input', async () => {
    const query = input.value.trim();

    // Limpar dropdown
    dropdown.innerHTML = '';

    // Se a query for muito curta, ocultar dropdown
    if (query.length < 2) {
      dropdown.classList.add('hidden');
      return;
    }

    try {
      // Mostrar o dropdown
      dropdown.classList.remove('hidden');

      // Mostrar indicador de carregamento
      dropdown.innerHTML = `
        <div class="p-4 text-center text-gray-500">
          <i class="fas fa-spinner fa-spin mr-2"></i> Pesquisando...
        </div>
      `;

      // Buscar resultados
      let resultados = [];
      if (window.cidInstance && typeof window.cidInstance.find === 'function') {
        resultados = await window.cidInstance.find(query);
      } else if (window.cache && typeof window.cache.findCID === 'function') {
        resultados = await window.cache.findCID(query);
      }

      // Verificar se ainda estamos digitando o mesmo texto
      if (input.value.trim() !== query) return;

      // Renderizar resultados
      renderizarResultadosCID(dropdown, resultados, input, doencaInput, query);
    } catch (error) {
      console.error('Erro ao pesquisar CID:', error);
      dropdown.innerHTML = `
        <div class="p-4 text-center text-red-500">
          Erro ao pesquisar. Tente novamente.
        </div>
      `;
    }
  });

  // Configurar evento de tecla Enter
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      // Se o dropdown estiver visível e houver um item selecionado/destacado
      const itemHighlighted = dropdown.querySelector('.bg-blue-50');
      if (!dropdown.classList.contains('hidden') && itemHighlighted) {
        itemHighlighted.click();
      } else if (!dropdown.classList.contains('hidden')) {
        // Se o dropdown estiver visível mas nenhum item estiver destacado, clicar no primeiro
        const firstItem = dropdown.querySelector('.cid-item');
        if (firstItem) firstItem.click();
      }
    }
  });
}

/**
 * Renderiza os resultados da pesquisa de CID no dropdown
 */
function renderizarResultadosCID(dropdown, resultados, cidInput, doencaInput, query) {
  // Limpar conteúdo
  dropdown.innerHTML = '';

  // Se não houver resultados
  if (!resultados || resultados.length === 0) {
    dropdown.innerHTML = `
      <div class="p-4 text-center text-gray-500">
        Nenhum CID encontrado para "${query}"
      </div>
    `;
    // Não adicionar mais nada, apenas mostrar a mensagem.
    // A div e o listener para 'Criar novo registro com este código' foram removidos daqui.
    return;
  }

  // Criar lista de resultados
  const lista = document.createElement('div');
  lista.className = 'max-h-60 overflow-y-auto';

  // Adicionar cada resultado à lista
  resultados.forEach((resultado, idx) => {
    const item = document.createElement('div');
    item.className = 'cid-item flex px-4 py-3 hover:bg-blue-50 transition-colors cursor-pointer border-b border-gray-100';
    item.innerHTML = `
      <div class="flex items-center w-full">
        <div class="flex-shrink-0 bg-blue-100 text-blue-800 font-bold px-2 py-1 rounded-lg mr-3">
          ${resultado.code}
        </div>
        <div class="flex-grow text-gray-700 text-sm">
          ${resultado.description}
        </div>
      </div>
    `;

    // Adicionar evento de clique
    item.addEventListener('click', () => {
      // Preencher campos
      cidInput.value = resultado.code;
      if (doencaInput) doencaInput.value = resultado.description;

      // Fechar dropdown
      dropdown.classList.add('hidden');

      // Disparar eventos de mudança
      cidInput.dispatchEvent(new Event('change', { bubbles: true }));
      if (doencaInput) {
        doencaInput.dispatchEvent(new Event('change', { bubbles: true }));
        doencaInput.dispatchEvent(new Event('input', { bubbles: true }));
      }

      // Verificar isenção de carência
      if (doencaInput && typeof verificarIsencaoCarencia === 'function') {
        verificarIsencaoCarencia(doencaInput);
      }
    });

    lista.appendChild(item);
  });

  dropdown.appendChild(lista);
}

// Injetar estilos CSS para corrigir a exibição de itens selecionados
function injectFixStyles() {
  // Verificar se o estilo já foi adicionado
  if (document.getElementById('dropdown-fix-styles')) return;

  // Criar um elemento de estilo
  const style = document.createElement('style');
  style.id = 'dropdown-fix-styles';
  style.innerHTML = `
    /* Ocultar apenas os itens selecionados que apareçam diretamente no body */
    body > .dropdown-item-selected,
    body > .dropdown-select-selected,
    body > .dropdown-item:not(.dropdown-item-hover),
    body > .autocomplete-item:not(.autocomplete-hover),
    body > .autocomplete-selected {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
    }

    /* Permitir que os dropdowns funcionem normalmente */
    .cid-dropdown:not(.hidden) {
      visibility: visible !important;
      display: block !important;
      opacity: 1 !important;
      z-index: 100 !important;
    }

    /* Melhorar a exibição de itens de dropdown com textos longos */
    .cid-dropdown .dropdown-item,
    .cid-dropdown .cid-item {
      padding: 10px 12px !important;
      white-space: normal !important;
      line-height: 1.4 !important;
      word-wrap: break-word !important;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05) !important;
      max-width: 100% !important;
      text-overflow: ellipsis !important;
      display: block !important;
      font-size: 0.9rem !important;
    }

    /* Estilo de hover para itens de dropdown */
    .cid-dropdown .dropdown-item:hover,
    .cid-dropdown .dropdown-item.active,
    .cid-dropdown .cid-item:hover {
      background-color: rgba(59, 130, 246, 0.1) !important;
    }

    /* Estilo para os dropdowns em si */
    .cid-dropdown {
      max-height: 300px !important;
      overflow-y: auto !important;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
      border-radius: 0.5rem !important;
      border: 1px solid rgba(0, 0, 0, 0.1) !important;
      width: 100% !important;
      background-color: white !important;
    }

    /* Estilizar o botão de adicionar novo */
    .cid-dropdown .bg-blue-50 {
      color: #3b82f6 !important;
      font-weight: 500 !important;
    }

    /* Estilos para o indicador de carregamento */
    .cid-dropdown .fa-spinner {
      color: #3b82f6 !important;
    }

    /* Destaque para o código CID */
    .cid-item .bg-blue-100 {
      background-color: rgba(59, 130, 246, 0.1) !important;
      color: #1e40af !important;
      padding: 4px 8px !important;
      border-radius: 4px !important;
      font-weight: 600 !important;
      font-family: monospace !important;
      letter-spacing: 0.5px !important;
    }

    /* Estilo para a descrição do CID */
    .cid-item .text-gray-700 {
      color: #4B5563 !important;
      line-height: 1.4 !important;
    }

    /* Estilo para o ícone de lupa */
    .cid-input + div .fa-search {
      color: #9CA3AF !important;
    }

    /* Campo doença somente leitura */
    .doenca-input[readonly] {
      background-color: #F9FAFB !important;
      cursor: default !important;
    }
  `;

  // Adicionar o estilo ao cabeçalho do documento
  document.head.appendChild(style);

  // Intervalo mais suave para remover itens selecionados apenas a cada 1 segundo
  setInterval(cleanupSelectedItems, 1000);
}

// Função para limpar periodicamente itens selecionados
function cleanupSelectedItems() {
  // Seletores específicos para elementos fora do contexto
  const selectors = [
    'body > .dropdown-item-selected',
    'body > .dropdown-select-selected',
    'body > .dropdown-item:not(.dropdown-item-hover)',
    'body > .autocomplete-item:not(.autocomplete-hover)',
    'body > .autocomplete-selected'
  ].join(', ');

  // Remover apenas elementos que estejam diretamente no body
  const items = document.querySelectorAll(selectors);
  items.forEach(item => {
    // Verificar se o elemento está diretamente no body ou em um container incorreto
    if (item.parentElement === document.body ||
        (item.parentElement &&
         !item.parentElement.classList.contains('cid-dropdown') &&
         !item.parentElement.classList.contains('doenca-dropdown'))) {
      item.remove();
    }
  });
}

// Configurar fechamento automático dos dropdowns ao selecionar um item ou clicar fora
function setupDropdownHandlers() {
  if (window.isDropdownHandlersInitialized) return;

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

  window.isDropdownHandlersInitialized = true;
}

// Sobrescrever funções globais associadas a componentes de autocomplete
function overrideAutocompleteFunctions() {
  // Não vamos sobrescrever as funções globais para preservar a funcionalidade
  // Apenas adicionamos handlers específicos para limpar itens soltos

  // Adicionar handlers globais para eventos de clique em itens de dropdown
  document.addEventListener('click', function(e) {
    // Se clicar em um item de dropdown
    if (e.target.classList &&
        (e.target.classList.contains('dropdown-item') ||
         e.target.classList.contains('autocomplete-item'))) {
      // Agendar uma limpeza após a seleção
      setTimeout(cleanupSelectedItems, 100);
    }
  });

  // Não sobrescrever addEventListener para evitar interferência com a funcionalidade
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
  });

  // Adicionar manipulador para os itens do dropdown (sem interferir com a funcionalidade de pesquisa)
  dropdown.addEventListener('click', function(e) {
    // Se clicou em um item do dropdown
    if (e.target.classList && e.target.classList.contains('dropdown-item')) {
      // Agendar limpeza após seleção
      setTimeout(cleanupSelectedItems, 100);
    }
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
    isento = window.cidsSemCarencia.some(cid => {
      // Comparação exata do início do CID (prefixo)
      return cidValor.startsWith(cid.toLowerCase().replace(/\s+/g, ''));
    });
  }

  // Se não encontrou pelo CID, tenta pelo nome da doença (método secundário)
  if (!isento) {
    const doencaValor = input.value.toLowerCase();
    isento = window.doencasSemCarencia.some(doenca => doencaValor.includes(doenca));
  }

  // Encontrar a tag de isenção associada a este input
  const tagIsencao = input.closest('.relative').querySelector('.isento-carencia-tag');

  if (isento && (input.value.trim() !== '' || (cidInput && cidInput.value.trim() !== ''))) {
    tagIsencao.classList.remove('hidden');

    // Adicionar tooltip (title) para explicar a isenção
    tagIsencao.setAttribute('title', 'Esta condição/CID dispensa o cumprimento de carência para benefícios previdenciários');

    // Garantir que o campo tenha uma anotação visual também
    input.classList.add('isento-carencia-field');
    if (cidInput) cidInput.classList.add('isento-carencia-field');
  } else {
    tagIsencao.classList.add('hidden');

    // Remover a anotação visual se existir
    input.classList.remove('isento-carencia-field');
    if (cidInput) cidInput.classList.remove('isento-carencia-field');
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

    // Remover eventos existentes
    const newBtn = nextButton.cloneNode(true);
    nextButton.parentNode.replaceChild(newBtn, nextButton);

    // Flag para prevenir múltiplos cliques
    let isNavigating = false;

    // Adicionar novo evento com proteção
    newBtn.addEventListener('click', function(e) {
      // Evitar comportamento padrão para prevenir propagação de evento
      e.preventDefault();
      e.stopPropagation();

      // Evitar múltiplos cliques
      if (isNavigating) return;
      isNavigating = true;

      // Feedback visual
      const originalText = this.innerHTML;
      this.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Carregando...';
      this.classList.add('opacity-75');

      try {
        // Salvar dados manualmente uma única vez, sem depender dos listeners em state.js
        if (window.formStateManager) {
          window.formStateManager.captureCurrentFormData();
        }

        // Atraso pequeno para garantir que o salvamento termine
        setTimeout(() => {
          // Navegar para a próxima página
          navigateTo('professional');

          // Restaurar estado do botão após navegação
          setTimeout(() => {
            if (document.body.contains(this)) {
              this.innerHTML = originalText;
              this.classList.remove('opacity-75');
            }
            isNavigating = false;
          }, 500);
        }, 100);
      } catch (error) {
        console.error('Erro ao navegar para a próxima página:', error);
        this.innerHTML = originalText;
        this.classList.remove('opacity-75');
        isNavigating = false;
      }
    });
  }
}

// Função para adicionar um novo campo de doença
function addDoencaField() {
  // Obter o container de doenças
  const doencasList = document.getElementById('doencasList');
  if (!doencasList) {
    console.error('Container de doenças não encontrado');
    return;
  }

  // Obter o próximo índice para os campos
  const existingFields = doencasList.querySelectorAll('.cid-input');
  const nextIndex = existingFields.length + 1;

  // Criar o elemento HTML para o novo campo
  const newDoencaField = document.createElement('div');
  newDoencaField.className = 'mb-4 border-b border-gray-200 pb-4';
  newDoencaField.innerHTML = `
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
        <label for="tipoDocumento${nextIndex}" class="input-label">
          Documento
        </label>
      </div>

      <!-- CID (segundo campo - reduzido) -->
      <div class="relative md:col-span-5">
        <div class="relative">
          <input type="text" class="cid-input peer w-full rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 px-4 py-3 text-gray-800 bg-white placeholder-gray-400 transition-colors duration-200" id="cid${nextIndex}" placeholder="CID" name="cids[]" data-index="${nextIndex}" autocomplete="off">
          <div class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <i class="fas fa-search"></i>
          </div>
        </div>
        <label for="cid${nextIndex}" class="input-label">
          CID
        </label>
        <div class="cid-dropdown hidden absolute z-50 bg-white w-full border border-gray-300 rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto" id="cidDropdown${nextIndex}"></div>
      </div>

      <!-- Doença (terceiro campo - aumentado e readonly) -->
      <div class="relative md:col-span-10">
        <input type="text" class="doenca-input peer w-full rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 px-4 py-3 text-gray-800 bg-gray-50 placeholder-gray-400 transition-colors duration-200" id="doenca${nextIndex}" placeholder="Preenchido automaticamente pelo CID" name="doencas[]" data-index="${nextIndex}" autocomplete="off" readonly>
        <label for="doenca${nextIndex}" class="input-label">
          Doença
        </label>
        <div class="doenca-dropdown hidden absolute z-50 bg-white w-full border border-gray-300 rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto" id="doencaDropdown${nextIndex}"></div>
        <div class="isento-carencia-tag hidden">Isenção de carência</div>
      </div>

      <!-- Data (quarto campo) -->
      <div class="relative md:col-span-4">
        <input type="text" class="peer w-full rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 px-4 py-3 text-gray-800 bg-white placeholder-gray-400 transition-colors duration-200" id="dataDocumento${nextIndex}" name="dataDocumentos[]" data-index="${nextIndex}" placeholder="dd/mm/aa" oninput="maskDate(this)">
        <label for="dataDocumento${nextIndex}" class="input-label">
          Data
        </label>
      </div>

      <!-- Botão de remover (último campo) -->
      <div class="md:col-span-1 flex items-center justify-center content-center text-center align-middle p-0">
        <button type="button" class="remove-doenca-btn bg-red-500 hover:bg-red-600 text-white rounded-full p-1 flex items-center justify-center w-8 h-8 mx-auto" title="Remover CID/Doença">
          <i class="fas fa-minus"></i>
        </button>
      </div>
    </div>
  `;

  // Adicionar ao DOM
  doencasList.appendChild(newDoencaField);

  // Configurar botão de remover
  const removeButton = newDoencaField.querySelector('.remove-doenca-btn');
  if (removeButton) {
    removeButton.addEventListener('click', function() {
      newDoencaField.remove();
    });
  }

  // Inicializar verificação de isenção de carência
  const doencaInput = newDoencaField.querySelector('.doenca-input');
  if (doencaInput) {
    doencaInput.addEventListener('input', function() {
      verificarIsencaoCarencia(this);
    });
  }

  // Inicializar sistema CID para o novo campo, se disponível
  if (typeof initCidSystem === 'function') {
    try {
      initCidSystem();
    } catch (e) {
      console.warn("Erro ao inicializar CID para novos campos:", e);
    }
  }

  // Aplicar o novo sistema de pesquisa para o campo CID adicionado
  const cidInput = newDoencaField.querySelector('.cid-input');
  if (cidInput) {
    configurarCampoCID(cidInput);
    cidInput.focus();
  }
}

// Expor a função para ser chamada externamente (ex: pelo FormStateManager)
window.addDoencaField = addDoencaField;
