/**
 * Módulo Home - Dashboard de Atendimentos
 */

// Variáveis globais para controle de paginação e filtros
let currentPage = 1;
let itemsPerPage = 10;
let allAttendances = [];
let filteredAttendances = [];

/**
 * Inicializa o módulo
 */
function initModule() {
  console.log('Inicializando módulo Home');

  // Carregar dados iniciais
  loadAttendances();

  // Configurar filtros e busca
  setupFilterHandlers();

  // Configurar busca por CPF
  setupCpfSearch();
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

  // Verificar se estamos online para buscar no Firebase
  if (navigator.onLine && window.FIAP && window.FIAP.firebase && window.FIAP.firebase.db) {
    window.FIAP.firebase.db.collection('formularios')
      .where('cpf', '==', cpf)
      .limit(1)
      .get()
      .then(snapshot => {
        hideLoading();

        if (snapshot.empty) {
          showErrorMessage('Nenhum atendimento encontrado com este CPF');
          return;
        }

        // Encontrou um atendimento, continuar
        const doc = snapshot.docs[0];
        continueAttendance(doc.id);
      })
      .catch(error => {
        hideLoading();
        console.error('Erro ao buscar por CPF:', error);
        showErrorMessage('Erro ao buscar atendimento: ' + error.message);
      });
  } else {
    // Estamos offline, verificar no localStorage
    hideLoading();

    const formId = localStorage.getItem('formId');
    const formData = localStorage.getItem('formData');

    if (formId && formData) {
      try {
        const parsedData = JSON.parse(formData);
        const personalData = parsedData.personal || {};

        if (personalData.cpf === cpf) {
          // Encontrou o atendimento local
          continueAttendance(formId);
        } else {
          showErrorMessage('Nenhum atendimento encontrado localmente com este CPF');
        }
      } catch (e) {
        console.error('Erro ao processar dados locais:', e);
        showErrorMessage('Erro ao processar dados locais');
      }
    } else {
      showErrorMessage('Nenhum atendimento encontrado localmente');
    }
  }
}

/**
 * Carrega os atendimentos
 */
async function loadAttendances() {
  try {
    // Mostrar carregamento
    const tableBody = document.getElementById('attendances-table-body');
    tableBody.innerHTML = `<tr><td colspan="6" class="py-4 text-center text-gray-500">Carregando dados...</td></tr>`;

    // Verificar se estamos online
    if (navigator.onLine && window.FIAP && window.FIAP.firebase && window.FIAP.firebase.db) {
      // Carregar do Firebase
      const snapshot = await window.FIAP.firebase.db.collection('formularios').orderBy('ultimaAtualizacao', 'desc').get();

      if (snapshot.empty) {
        tableBody.innerHTML = `<tr><td colspan="6" class="py-4 text-center text-gray-500">Nenhum atendimento encontrado</td></tr>`;
        updateCounts({ today: 0, completed: 0, inProgress: 0, total: 0 });
        return;
      }

      // Processar dados
      allAttendances = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        const personal = data.dados?.personal || {};

        allAttendances.push({
          id: doc.id,
          name: personal.nome || 'Sem nome',
          cpf: personal.cpf || '-',
          date: formatDate(data.ultimaAtualizacao),
          status: getStatusFromData(data),
          progress: calculateProgress(data),
          formData: data
        });
      });

      // Atualizar também a lista filtrada
      filteredAttendances = [...allAttendances];

      // Renderizar dados
      renderAttendances(allAttendances);

      // Atualizar contadores
      updateCountsFromData(allAttendances);
    } else {
      // Carregar do localStorage
      const formId = localStorage.getItem('formId');
      const formData = localStorage.getItem('formData');

      if (formId && formData) {
        try {
          const parsedData = JSON.parse(formData);
          const personal = parsedData.personal || {};

          allAttendances = [{
            id: formId,
            name: personal.nome || 'Formulário Local',
            cpf: personal.cpf || '-',
            date: formatDate(new Date()),
            status: 'Em andamento',
            progress: calculateProgressFromLocalData(parsedData),
            formData: parsedData
          }];

          // Atualizar também a lista filtrada
          filteredAttendances = [...allAttendances];

          renderAttendances(allAttendances);
          updateCounts({ today: 1, completed: 0, inProgress: 1, total: 1 });
        } catch (e) {
          console.error('Erro ao processar dados locais:', e);
          tableBody.innerHTML = `<tr><td colspan="6" class="py-4 text-center text-gray-500">Erro ao carregar dados locais</td></tr>`;
        }
      } else {
        tableBody.innerHTML = `<tr><td colspan="6" class="py-4 text-center text-gray-500">Nenhum atendimento encontrado localmente</td></tr>`;
        updateCounts({ today: 0, completed: 0, inProgress: 0, total: 0 });
      }
    }
  } catch (error) {
    console.error('Erro ao carregar atendimentos:', error);
    document.getElementById('attendances-table-body').innerHTML =
      `<tr><td colspan="6" class="py-4 text-center text-red-500">Erro ao carregar dados: ${error.message}</td></tr>`;
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

  // Atualizar informações de paginação
  document.getElementById('showing-count').textContent = paginatedAttendances.length;
  document.getElementById('total-items').textContent = attendances.length;

  // Configurar estado dos botões de paginação
  const prevPageBtn = document.getElementById('prev-page');
  const nextPageBtn = document.getElementById('next-page');

  if (prevPageBtn) {
    prevPageBtn.disabled = currentPage === 1;
  }

  if (nextPageBtn) {
    nextPageBtn.disabled = endIndex >= attendances.length;
  }
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
 * Filtra os atendimentos com base nos critérios de pesquisa e filtros
 */
function filterAttendances() {
  if (!allAttendances || allAttendances.length === 0) return;

  const searchValue = document.getElementById('search-attendances')?.value?.toLowerCase() || '';
  const statusValue = document.getElementById('filter-status')?.value || 'all';
  const dateValue = document.getElementById('filter-date')?.value || 'all';

  // Filtrar com base nos critérios
  filteredAttendances = allAttendances.filter(attendance => {
    // Filtro de texto (nome, CPF)
    const matchesSearch = searchValue === '' ||
      attendance.name.toLowerCase().includes(searchValue) ||
      attendance.cpf.toLowerCase().includes(searchValue) ||
      attendance.date.toLowerCase().includes(searchValue);

    // Filtro de status
    const matchesStatus = statusValue === 'all' ||
      (statusValue === 'new' && attendance.status === 'Novo') ||
      (statusValue === 'in-progress' && attendance.status === 'Em andamento') ||
      (statusValue === 'completed' && attendance.status === 'Concluído');

    // Filtro de data
    let matchesDate = true;
    if (dateValue !== 'all') {
      const today = new Date().toLocaleDateString('pt-BR');
      const currentDate = new Date();
      const attendanceDate = new Date(attendance.date.split('/').reverse().join('-'));

      if (dateValue === 'today') {
        matchesDate = attendance.date === today;
      } else if (dateValue === 'week') {
        // Início da semana (domingo)
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        matchesDate = attendanceDate >= startOfWeek;
      } else if (dateValue === 'month') {
        // Início do mês
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        matchesDate = attendanceDate >= startOfMonth;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Resetar a paginação para a primeira página
  currentPage = 1;

  // Atualizar a visualização da tabela
  renderAttendances(filteredAttendances);
}

/**
 * Navega para a página anterior
 */
function goToPrevPage() {
  if (currentPage > 1) {
    currentPage--;
    renderAttendances(filteredAttendances.length > 0 ? filteredAttendances : allAttendances);
  }
}

/**
 * Navega para a próxima página
 */
function goToNextPage() {
  const maxPage = Math.ceil((filteredAttendances.length > 0 ? filteredAttendances : allAttendances).length / itemsPerPage);
  if (currentPage < maxPage) {
    currentPage++;
    renderAttendances(filteredAttendances.length > 0 ? filteredAttendances : allAttendances);
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
  console.log('Função startNewAttendance executada no modules/home.js');

  // Verificar se há dados não salvos
  const formStateManager = window.formStateManager;
  if (formStateManager && formStateManager.currentFormId) {
    // Verificar se o formulário tem dados preenchidos que precisam ser salvos
    let hasData = false;

    // Verificar se há dados em qualquer etapa
    for (const step in formStateManager.formData) {
      if (Object.keys(formStateManager.formData[step]).length > 0) {
        hasData = true;
        break;
      }
    }

    if (hasData) {
      if (confirm('Há um formulário em andamento. Deseja salvá-lo antes de iniciar um novo?')) {
        // Salvar o formulário atual antes de iniciar um novo
        if (window.saveForm) {
          window.saveForm();
        }
      }
    }
  }

  // Limpar dados locais
  if (window.formStateManager) {
    window.formStateManager.clearState();
  } else {
    // Fallback se o formStateManager não estiver disponível
    localStorage.removeItem('formId');
    localStorage.removeItem('formData');
    localStorage.removeItem('currentStep');
  }

  // Navegar para o primeiro passo usando hash diretamente
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

  // Primeiro tentar carregar do Firebase se online
  if (navigator.onLine && window.FIAP && window.FIAP.firebase && window.FIAP.firebase.db) {
    window.FIAP.firebase.db.collection('formularios').doc(id).get()
      .then(doc => {
        if (doc.exists) {
          const data = doc.data();

          // Configurar o formStateManager
          if (window.formStateManager) {
            window.formStateManager.currentFormId = id;
            window.formStateManager.formData = data.dados || {
              personal: {},
              social: {},
              incapacity: {},
              professional: {},
              documents: {}
            };
            window.formStateManager.currentStep = data.currentStep || 'personal';
            window.formStateManager.isInitialized = true;
            window.formStateManager.saveToLocalStorage();
          }

          // Navegar para a etapa atual ou a primeira usando hash diretamente
          const route = data.currentStep || 'personal';
          console.log('Navegando para:', route);
          window.location.hash = route;
        } else {
          appContent.innerHTML = `
            <div class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
              <h3 class="font-bold mb-2">Erro</h3>
              <p>Atendimento não encontrado</p>
            </div>
          `;
        }
      })
      .catch(error => {
        console.error('Erro ao carregar atendimento:', error);
        appContent.innerHTML = `
          <div class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
            <h3 class="font-bold mb-2">Erro ao carregar atendimento</h3>
            <p>${error.message}</p>
          </div>
        `;
      });
  } else {
    // Se offline, verificar se é o formulário local
    const formId = localStorage.getItem('formId');

    if (formId === id) {
      // Navegar para o formulário local usando hash diretamente
      const currentStep = localStorage.getItem('currentStep') || 'personal';
      console.log('Navegando para (offline):', currentStep);
      window.location.hash = currentStep;
    } else {
      appContent.innerHTML = `
        <div class="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-lg">
          <h3 class="font-bold mb-2">Conexão offline</h3>
          <p>Apenas o formulário atual pode ser acessado offline.</p>
        </div>
      `;
    }
  }
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
    // Verificar se estamos online
    if (navigator.onLine && window.FIAP && window.FIAP.firebase && window.FIAP.firebase.db) {
      // Excluir do Firebase
      window.FIAP.firebase.db.collection('formularios').doc(id).delete()
        .then(() => {
          // Mostrar mensagem de sucesso
          const alertDiv = document.createElement('div');
          alertDiv.className = 'fixed bottom-4 left-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-lg z-50';
          alertDiv.innerHTML = `
            <div class="flex items-center">
              <div class="text-green-500 rounded-full p-1">
                <i class="fas fa-check-circle"></i>
              </div>
              <span class="ml-2">Atendimento excluído com sucesso</span>
            </div>
          `;
          document.body.appendChild(alertDiv);

          // Remover alerta após 3 segundos
          setTimeout(() => {
            alertDiv.remove();
          }, 3000);

          // Recarregar a lista
          loadAttendances();
        })
        .catch(error => {
          console.error('Erro ao excluir atendimento:', error);

          // Mostrar mensagem de erro
          const alertDiv = document.createElement('div');
          alertDiv.className = 'fixed bottom-4 left-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-lg z-50';
          alertDiv.innerHTML = `
            <div class="flex items-center">
              <div class="text-red-500 rounded-full p-1">
                <i class="fas fa-exclamation-circle"></i>
              </div>
              <span class="ml-2">Erro ao excluir atendimento: ${error.message}</span>
            </div>
          `;
          document.body.appendChild(alertDiv);

          // Remover alerta após 5 segundos
          setTimeout(() => {
            alertDiv.remove();
          }, 5000);
        });
    } else {
      // Se offline, limpar dados locais se for o formulário atual
      const formId = localStorage.getItem('formId');

      if (formId === id) {
        localStorage.removeItem('formId');
        localStorage.removeItem('formData');
        localStorage.removeItem('currentStep');

        if (window.formStateManager) {
          window.formStateManager.clearState();
        }

        // Mostrar mensagem de sucesso
        const alertDiv = document.createElement('div');
        alertDiv.className = 'fixed bottom-4 left-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-lg z-50';
        alertDiv.innerHTML = `
          <div class="flex items-center">
            <div class="text-green-500 rounded-full p-1">
              <i class="fas fa-check-circle"></i>
            </div>
            <span class="ml-2">Formulário local excluído</span>
          </div>
        `;
        document.body.appendChild(alertDiv);

        // Remover alerta após 3 segundos
        setTimeout(() => {
          alertDiv.remove();
        }, 3000);

        // Recarregar a lista
        loadAttendances();
      } else {
        // Mostrar mensagem de erro
        const alertDiv = document.createElement('div');
        alertDiv.className = 'fixed bottom-4 left-4 right-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded shadow-lg z-50';
        alertDiv.innerHTML = `
          <div class="flex items-center">
            <div class="text-yellow-500 rounded-full p-1">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <span class="ml-2">Conexão offline. Apenas o formulário atual pode ser excluído.</span>
          </div>
        `;
        document.body.appendChild(alertDiv);

        // Remover alerta após 4 segundos
        setTimeout(() => {
          alertDiv.remove();
        }, 4000);
      }
    }
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
  // Verificar se existe a função global
  if (window.showLoading) {
    window.showLoading(message);
    return;
  }

  // Implementação alternativa
  if (document.getElementById('loading-overlay')) return;

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
  // Verificar se existe a função global
  if (window.hideLoading) {
    window.hideLoading();
    return;
  }

  // Implementação alternativa
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.remove();
  }
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
