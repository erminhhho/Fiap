/**
 * Módulo Home - Dashboard de Atendimentos
 */

// Variáveis globais para controle de paginação e filtros
var currentPage = window.homeModule ? window.homeModule.currentPage : 1;
var itemsPerPage = window.homeModule ? window.homeModule.itemsPerPage : 10;
var allAttendances = window.homeModule ? window.homeModule.allAttendances : [];
var filteredAttendances = window.homeModule ? window.homeModule.filteredAttendances : [];

// Criar namespace global para o módulo
window.homeModule = window.homeModule || {
  currentPage: currentPage,
  itemsPerPage: itemsPerPage,
  allAttendances: allAttendances,
  filteredAttendances: filteredAttendances,
  initialized: false
};

/**
 * Inicializa o módulo
 */
function initModule() {
  // Verificar se já foi inicializado para evitar duplicação
  if (window.homeModule.initialized) {
    if (window.logSystem) {
      window.logSystem('Modules', 'Módulo Home já inicializado, ignorando chamada duplicada');
    }
    return;
  }

  if (window.logSystem) {
    window.logSystem('Modules', 'Inicializando módulo Home');
  } else if (window.CONFIG?.debug?.enabled && window.CONFIG.debug.levels.modules) {
    console.log('[Modules] Inicializando módulo Home');
  }

  // Carregar dados iniciais
  loadAttendances();

  // Configurar filtros e busca
  setupFilterHandlers();

  // Configurar busca por CPF
  setupCpfSearch();

  // Marcar como inicializado
  window.homeModule.initialized = true;
}

/**
 * Configura a busca por CPF
 */
function setupCpfSearch() {
  const cpfSearchInput = document.getElementById('cpf-search');
  const cpfSearchBtn = document.getElementById('btn-search-cpf');

  if (cpfSearchInput) {
    // Aplicar máscara de CPF ao campo
    if (window.FIAP && window.FIAP.masks && window.FIAP.masks.cpf) {
      cpfSearchInput.addEventListener('input', function() {
        window.FIAP.masks.cpf(this);
      });
    }

    // Buscar ao pressionar Enter
    cpfSearchInput.addEventListener('keyup', function(event) {
      if (event.key === 'Enter') {
        searchByCpf();
      }
    });
  }

  if (cpfSearchBtn) {
    cpfSearchBtn.addEventListener('click', searchByCpf);
  }
}

/**
 * Busca atendimento por CPF
 */
function searchByCpf() {
  const cpfInput = document.getElementById('cpf-search');
  const cpf = cpfInput?.value?.trim();

  if (!cpf) {
    showErrorMessage('Por favor, informe um CPF válido');
    return;
  }

  // Exibir indicador de carregamento
  showLoading('Buscando atendimento...');

  // Lógica de persistência removida.
  hideLoading();
  showErrorMessage('Busca por CPF desativada. Persistência na nuvem removida.');
}

/**
 * Carrega os atendimentos
 */
async function loadAttendances() {
  try {
    // Mostrar carregamento
    const tableBody = document.getElementById('attendances-table-body');
    tableBody.innerHTML = `<tr><td colspan="6" class="py-4 text-center text-gray-500">Carregando dados...</td></tr>`;

    // Lógica de persistência removida.
    tableBody.innerHTML = `<tr><td colspan="6" class="py-4 text-center text-gray-500">Carregamento de atendimentos desativado. Persistência na nuvem removida.</td></tr>`;
    updateCounts({ today: 0, completed: 0, inProgress: 0, total: 0 });
    allAttendances = []; // Limpar lista de atendimentos
    filteredAttendances = []; // Limpar lista filtrada
    window.homeModule.allAttendances = allAttendances;
    window.homeModule.filteredAttendances = filteredAttendances;
    renderAttendances(allAttendances); // Renderizar tabela vazia

  } catch (error) {
    console.error('Erro ao carregar atendimentos (persistência removida):', error);
    document.getElementById('attendances-table-body').innerHTML =
      `<tr><td colspan="6" class="py-4 text-center text-red-500">Erro ao processar (persistência removida): ${error.message}</td></tr>`;
  }
}

/**
 * Renderiza os atendimentos na tabela
 * @param {Array} attendances - Lista de atendimentos
 */
function renderAttendances(attendances) {
  const tableBody = document.getElementById('attendances-table-body');
  const template = document.getElementById('attendance-row-template');

  // Limpar tabela
  tableBody.innerHTML = '';

  if (!attendances || attendances.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" class="py-4 text-center text-gray-500">Nenhum atendimento encontrado</td></tr>`;
    return;
  }

  // Calcular paginação
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, attendances.length);
  const paginatedAttendances = attendances.slice(startIndex, endIndex);

  // Atualizar contadores de exibição
  document.getElementById('showing-count').textContent = paginatedAttendances.length;
  document.getElementById('total-items').textContent = attendances.length;

  // Atualizar botões de paginação
  updatePaginationButtons();

  // Renderizar cada linha
  paginatedAttendances.forEach(attendance => {
    const clone = template.content.cloneNode(true);

    // Preencher dados
    clone.querySelector('.attendance-name').textContent = attendance.name;
    clone.querySelector('.attendance-cpf').textContent = attendance.cpf;
    clone.querySelector('.attendance-date').textContent = attendance.date;

    // Status
    const statusEl = clone.querySelector('.attendance-status');
    statusEl.textContent = attendance.status;

    if (attendance.status === 'Concluído') {
      statusEl.classList.add('bg-green-100', 'text-green-800');
      statusEl.classList.remove('bg-yellow-100', 'text-yellow-800', 'bg-blue-100', 'text-blue-800');
    } else if (attendance.status === 'Em andamento') {
      statusEl.classList.add('bg-yellow-100', 'text-yellow-800');
      statusEl.classList.remove('bg-green-100', 'text-green-800', 'bg-blue-100', 'text-blue-800');
    } else {
      statusEl.classList.add('bg-blue-100', 'text-blue-800');
      statusEl.classList.remove('bg-green-100', 'text-green-800', 'bg-yellow-100', 'text-yellow-800');
    }

    // Progresso
    clone.querySelector('.attendance-progress').style.width = `${attendance.progress}%`;

    // Botões de ação
    clone.querySelector('.btn-continue').addEventListener('click', function() {
      continueAttendance(attendance.id);
    });

    clone.querySelector('.btn-print').addEventListener('click', function() {
      printAttendance(attendance.id);
    });

    clone.querySelector('.btn-delete').addEventListener('click', function() {
      deleteAttendance(attendance.id);
    });

    // Adicionar à tabela
    tableBody.appendChild(clone);
  });
}

/**
 * Configura os handlers de filtro
 */
function setupFilterHandlers() {
  const searchInput = document.getElementById('search-attendances');
  const statusFilter = document.getElementById('filter-status');
  const dateFilter = document.getElementById('filter-date');

  if (searchInput) {
    searchInput.addEventListener('input', filterAttendances);
  }

  if (statusFilter) {
    statusFilter.addEventListener('change', filterAttendances);
  }

  if (dateFilter) {
    dateFilter.addEventListener('change', filterAttendances);
  }
}

/**
 * Filtra os atendimentos conforme pesquisa e filtros
 */
function filterAttendances() {
  // Obter valores de entrada
  const searchTerm = document.getElementById('search-attendances')?.value?.toLowerCase() || '';
  const statusFilter = document.getElementById('filter-status')?.value || 'all';
  const dateFilter = document.getElementById('filter-date')?.value || 'all';

  // Aplicar filtros
  filteredAttendances = allAttendances.filter(attendance => {
    // Pesquisa textual
    const matchesSearch = searchTerm === '' ||
      attendance.name.toLowerCase().includes(searchTerm) ||
      attendance.cpf.toLowerCase().includes(searchTerm) ||
      attendance.date.toLowerCase().includes(searchTerm);

    // Filtro de status
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'completed' && attendance.status === 'Concluído') ||
      (statusFilter === 'in-progress' && attendance.status === 'Em andamento') ||
      (statusFilter === 'new' && attendance.status === 'Novo');

    // Filtro de data
    let matchesDate = dateFilter === 'all';

    if (dateFilter === 'today') {
      const today = new Date().toLocaleDateString('pt-BR');
      matchesDate = attendance.date === today;
    } else if (dateFilter === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const attendanceDate = parseDate(attendance.date);
      matchesDate = attendanceDate >= oneWeekAgo;
    } else if (dateFilter === 'month') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      const attendanceDate = parseDate(attendance.date);
      matchesDate = attendanceDate >= oneMonthAgo;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Atualizar namespace global
  window.homeModule.filteredAttendances = filteredAttendances;

  // Redefinir página atual para 1
  currentPage = 1;
  window.homeModule.currentPage = currentPage;

  // Renderizar resultados
  renderAttendances(filteredAttendances);
}

/**
 * Atualiza o estado dos botões de paginação
 */
function updatePaginationButtons() {
  const prevBtn = document.getElementById('prev-page');
  const nextBtn = document.getElementById('next-page');

  if (prevBtn) {
    prevBtn.disabled = currentPage <= 1;
  }

  if (nextBtn) {
    const maxPages = Math.ceil(filteredAttendances.length / itemsPerPage);
    nextBtn.disabled = currentPage >= maxPages;
  }
}

/**
 * Atualiza para a página anterior
 */
function goToPrevPage() {
  if (currentPage > 1) {
    currentPage--;
    window.homeModule.currentPage = currentPage;
    renderAttendances(filteredAttendances);
    updatePaginationButtons();
  }
}

/**
 * Atualiza para a próxima página
 */
function goToNextPage() {
  const maxPages = Math.ceil(filteredAttendances.length / itemsPerPage);
  if (currentPage < maxPages) {
    currentPage++;
    window.homeModule.currentPage = currentPage;
    renderAttendances(filteredAttendances);
    updatePaginationButtons();
  }
}

/**
 * Funções auxiliares
 */

/**
 * Formata a data para exibição
 * @param {Date|string} dateStr - Data para formatar
 * @returns {string} - Data formatada
 */
function formatDate(dateStr) {
  if (!dateStr) return '-';
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  return date.toLocaleDateString('pt-BR');
}

/**
 * Determina o status com base nos dados do atendimento
 * @param {Object} data - Dados do atendimento
 * @returns {string} - Status do atendimento
 */
function getStatusFromData(data) {
  if (!data.currentStep) return 'Novo';
  if (data.currentStep === 'documents') return 'Concluído';
  return 'Em andamento';
}

/**
 * Calcula o progresso do atendimento
 * @param {Object} data - Dados do atendimento
 * @returns {number} - Percentual de progresso (0-100)
 */
function calculateProgress(data) {
  const steps = ['personal', 'social', 'incapacity', 'professional', 'documents'];
  const currentStepIndex = steps.indexOf(data.currentStep || 'personal');
  return Math.round(((currentStepIndex + 1) / steps.length) * 100);
}

/**
 * Calcula o progresso com base nos dados locais
 * @param {Object} data - Dados do formulário
 * @returns {number} - Percentual de progresso (0-100)
 */
function calculateProgressFromLocalData(data) {
  const steps = ['personal', 'social', 'incapacity', 'professional', 'documents'];
  let completedSteps = 0;

  for (const step of steps) {
    if (data[step] && Object.keys(data[step]).length > 0) {
      completedSteps++;
    }
  }

  return Math.round((completedSteps / steps.length) * 100);
}

/**
 * Atualiza os contadores do dashboard
 * @param {Object} counts - Contadores
 */
function updateCounts(counts) {
  document.getElementById('today-count').textContent = counts.today;
  document.getElementById('completed-count').textContent = counts.completed;
  document.getElementById('in-progress-count').textContent = counts.inProgress;
  document.getElementById('total-count').textContent = counts.total;
  document.getElementById('showing-count').textContent = counts.total;
  document.getElementById('total-items').textContent = counts.total;
}

/**
 * Atualiza os contadores com base nos dados dos atendimentos
 * @param {Array} attendances - Lista de atendimentos
 */
function updateCountsFromData(attendances) {
  const today = new Date().toLocaleDateString('pt-BR');
  const counts = {
    today: attendances.filter(a => a.date === today).length,
    completed: attendances.filter(a => a.status === 'Concluído').length,
    inProgress: attendances.filter(a => a.status === 'Em andamento').length,
    total: attendances.length
  };

  updateCounts(counts);
}

/**
 * Inicia um novo atendimento
 */
function startNewAttendance() {
  // Limpar o estado do formulário atual no gerenciador de estado
  if (window.formStateManager) {
    window.formStateManager.currentFormId = null; // Novo formulário não tem ID ainda
    window.formStateManager.formData = {
      personal: {},
      social: {},
      incapacity: {},
      professional: {},
      documents: {}
    };
    window.formStateManager.currentStep = 'personal'; // Começar sempre da primeira etapa
    window.formStateManager.isInitialized = true;
  }

  // Navegar para a primeira página do formulário
  // Usar replace para não adicionar ao histórico de navegação
  console.log('Navegando para: personal (via startNewAttendance)');
  window.location.hash = 'personal';
}

/**
 * Continua um atendimento existente
 * @param {string} id - ID do atendimento
 */
function continueAttendance(id) {
  // Exibir indicador de carregamento
  const appContent = document.getElementById('app-content');
  appContent.innerHTML = `
    <div class="flex items-center justify-center h-64">
      <div class="text-center">
        <i class="fas fa-spinner fa-spin text-blue-600 text-4xl mb-4"></i>
        <p class="text-gray-600">Carregando atendimento...</p>
      </div>
    </div>
  `;

  // Lógica de persistência removida.
  appContent.innerHTML = `
    <div class="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-lg">
      <h3 class="font-bold mb-2">Funcionalidade Indisponível</h3>
      <p>O carregamento de atendimentos foi desativado (persistência na nuvem removida).</p>
      <button onclick="window.location.hash = 'home'" class="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
        Voltar para Home
      </button>
    </div>
  `;
}

/**
 * Imprime um atendimento
 * @param {string} id - ID do atendimento
 */
function printAttendance(id) {
  // Implementação básica - abre a janela de impressão do navegador
  window.print();
}

/**
 * Exclui um atendimento
 * @param {string} id - ID do atendimento
 */
function deleteAttendance(id) {
  if (confirm('Tem certeza que deseja excluir este atendimento? Esta ação não pode ser desfeita.')) {
    // Lógica de persistência removida.
    showSuccess('Exclusão (simulada)! Persistência na nuvem desativada.');
    // Como a persistência foi removida, a recarga da lista não mostrará a remoção real.
    // Apenas limpamos o estado em memória se for o formulário atual:
    if (window.formStateManager && window.formStateManager.currentFormId === id) {
        window.formStateManager.clearState();
    }
    // Para simular visualmente, podemos remover o item da lista `allAttendances` e `filteredAttendances`
    // e renderizar novamente, mas isso não reflete uma exclusão real de dados persistidos.
    // Por ora, apenas exibimos a mensagem e o loadAttendances (que não carrega nada) fará a tabela parecer vazia.
    loadAttendances(); // Irá mostrar a tabela vazia ou com dados não persistidos.
  }
}

/**
 * Exibe mensagem de erro
 * @param {string} message - Mensagem de erro
 */
function showErrorMessage(message) {
  // Verificar se existe a função global de erro
  if (window.showError) {
    window.showError(message);
    return;
  }

  // Implementação alternativa
  const alertDiv = document.createElement('div');
  alertDiv.className = 'fixed bottom-4 left-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-lg z-50';
  alertDiv.innerHTML = `
    <div class="flex items-center">
      <div class="text-red-500 rounded-full p-1">
        <i class="fas fa-exclamation-circle"></i>
      </div>
      <span class="ml-2">${message}</span>
    </div>
  `;
  document.body.appendChild(alertDiv);

  // Remover após 4 segundos
  setTimeout(() => {
    alertDiv.remove();
  }, 4000);
}

/**
 * Exibe indicador de carregamento
 * @param {string} message - Mensagem a ser exibida
 */
function showLoading(message = 'Carregando...') {
  // Prevenção contra recursão infinita
  // Se já temos um overlay de carregamento, não criar outro
  if (document.getElementById('loading-overlay')) return;

  // Implementação alternativa
  const overlay = document.createElement('div');
  overlay.id = 'loading-overlay';
  overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]';
  overlay.innerHTML = `
    <div class="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
      <div class="flex flex-col items-center">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
        <p class="text-gray-700">${message}</p>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
}

/**
 * Oculta o indicador de carregamento
 */
function hideLoading() {
  // Verificar se existe a função global que não é esta mesma função
  if (window.hideLoading && window.hideLoading !== hideLoading) {
    window.hideLoading();
    return;
  }

  // Implementação alternativa
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.remove();
  }
}

/**
 * Função para interpretar uma data no formato brasileiro
 * @param {String} dateString - Data no formato dd/mm/aaaa
 * @return {Date} Objeto de data
 */
function parseDate(dateString) {
  if (!dateString) return new Date();

  const parts = dateString.split('/');
  if (parts.length !== 3) return new Date();

  // Formato brasileiro: dia/mês/ano
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Meses em JS são 0-11
  const year = parseInt(parts[2], 10);

  return new Date(year, month, day);
}

// Exportar funções auxiliares
window.startNewAttendance = startNewAttendance;
window.continueAttendance = continueAttendance;
window.printAttendance = printAttendance;
window.deleteAttendance = deleteAttendance;
window.searchByCpf = searchByCpf;

// Exportar funções de inicialização e paginação
window.initModule = initModule;
window.filterAttendances = filterAttendances;
window.goToPrevPage = goToPrevPage;
window.goToNextPage = goToNextPage;
