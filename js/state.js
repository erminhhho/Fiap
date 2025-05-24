// Definição do FIAP.cache usando localStorage
if (!window.FIAP) {
  window.FIAP = {};
}

FIAP.cache = {
  set: function(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Erro ao salvar no FIAP.cache (localStorage):', e);
    }
  },
  get: function(key) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (e) {
      console.error('Erro ao obter do FIAP.cache (localStorage):', e);
      return null;
    }
  },
  remove: function(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Erro ao remover do FIAP.cache (localStorage):', e);
    }
  }
};
console.log('FIAP.cache (localStorage) inicializado internamente em state.js.');

/**
 * Gerenciador de Estado do Formulário
 * Mantém o estado do formulário durante navegação e refresh
 */

class FormStateManager {
  constructor() {
    console.log('[FormStateManager] Constructor chamado.');
    this.currentFormId = null;
    this.formData = {
      personal: {},
      social: {},
      incapacity: {},
      professional: {},
      documents: {}
    };
    this.currentStep = null;
    this.isInitialized = false;
    this.initialRestorePending = false;
    this.isRestoring = false;

    // Mapeamento de rotas e seus índices para navegação
    this.stepRoutes = {
      'personal': 1,
      'social': 2,
      'incapacity': 3,
      'professional': 4,
      'documents': 5
    };

    // Mapeamento inverso (índice -> rota)
    this.stepIndices = {
      1: 'personal',
      2: 'social',
      3: 'incapacity',
      4: 'professional',
      5: 'documents'
    };

    // Inicializar quando o DOM estiver carregado
    document.addEventListener('DOMContentLoaded', () => {
      this.setupEventListeners();
      this.init(); // Chamar init aqui também para garantir a inicialização completa
    });
  }

  init() {
    console.log('[FormStateManager] init() chamado.');
    if (this.isInitialized && !this.initialRestorePending) {
      console.log('[FormStateManager] Já inicializado e restauração não pendente, pulando init.');
      return;
    }
    this.initialRestorePending = true;

    if (this.loadStateFromCache()) {
      console.log('[FormStateManager] Estado carregado com sucesso do cache durante o init.');
    } else {
      console.log('[FormStateManager] Nenhum estado válido encontrado no cache durante o init. Usando padrões.');
    }

    this.currentStep = this.currentStep || (window.location.hash ? window.location.hash.substring(1) : 'personal');
    console.log('[FormStateManager] Etapa atual definida (ou confirmada) como:', this.currentStep);

    this.ensureFormAndRestore(this.currentStep);
    this.isInitialized = true;
    console.log('[FormStateManager] Inicialização completa.');
  }

  ensureFormAndRestore(step, retries = 5) {
    const formId = `${step}-form`; // Constrói o ID do formulário esperado (ex: personal-form)
    const form = document.getElementById(formId); // Tenta encontrar o formulário pelo ID

    if (form) {
      console.log(`[FormStateManager] Formulário com ID '${formId}' encontrado para a etapa ${step}.`);
      this.restoreFormData(step);
      this.initialRestorePending = false;
    } else if (retries > 0) {
      console.log(`[FormStateManager] Formulário com ID '${formId}' para ${step} ainda não disponível, tentando novamente... (${retries} tentativas restantes)`);
      setTimeout(() => this.ensureFormAndRestore(step, retries - 1), 200); // Tentar novamente após 200ms
    } else {
      console.error(`[FormStateManager] Formulário com ID '${formId}' não encontrado para ${step} após várias tentativas. A restauração pode não ocorrer até a navegação/interação.`);
      this.initialRestorePending = false; // Garante que isso seja definido como false mesmo em caso de falha total
    }
  }

  /**
   * Configura listeners para eventos de navegação e unload
   */
  setupEventListeners() {
    // Salvar estado antes de fechar a página
    window.addEventListener('beforeunload', () => {
      this.captureCurrentFormData();
    });

    // Detectar cliques nos botões de navegação
    document.querySelectorAll('.step-link').forEach(link => {
      const originalClick = link.onclick;
      link.onclick = (e) => {
        // Capturar dados do formulário atual antes de navegar
        this.captureCurrentFormData();

        // Chamar o handler original, se houver
        if (originalClick) return originalClick.call(link, e);
      };
    });

    // Sobreescrever a função navigateTo para capturar dados antes da navegação
    if (window.navigateTo) {
      const originalNavigateTo = window.navigateTo;
      window.navigateTo = (route) => {
        // Capturar dados atuais
        this.captureCurrentFormData();

        // Atualizar o passo atual
        this.currentStep = route;

        // Chamar a função original
        return originalNavigateTo(route);
      };
    }

    // Detectar e corrigir os botões de navegação (próximo/anterior)
    this.fixNavigationButtons();
  }

  /**
   * Corrige os botões de navegação (próximo/anterior)
   */
  fixNavigationButtons() {
    // Se já inicializou, não inicializar novamente
    if (this._navigationButtonsFixed) {
      console.log('Botões de navegação já corrigidos anteriormente');
      return;
    }

    // Marcar como inicializado para evitar duplicações
    this._navigationButtonsFixed = true;

    // Criar um lock global se ainda não existir
    if (typeof window._formNavigationLock === 'undefined') {
      window._formNavigationLock = false;
    }

    // Criar um timestamp de última execução global
    if (typeof window._lastFormNavigation === 'undefined') {
      window._lastFormNavigation = 0;
    }

    // Função segura para capturar dados com proteção
    const captureDataSafely = () => {
      const now = Date.now();

      // Verificar se passou tempo suficiente desde a última execução e se não há lock
      if (now - window._lastFormNavigation < 800 || window._formNavigationLock) {
        console.log(`Navegação ignorada - última ação há ${now - window._lastFormNavigation}ms ou lock ativo`);
        return;
      }

      // Atualizar timestamp e ativar lock
      window._lastFormNavigation = now;
      window._formNavigationLock = true;

      // Tentar capturar e salvar dados
      try {
        this.captureCurrentFormData();
      } catch (err) {
        console.error('Erro ao capturar dados durante navegação:', err);
      } finally {
        // Sempre liberar o lock após execução completa
        setTimeout(() => {
          window._formNavigationLock = false;
        }, 1000);
      }
    };

    // Funções de navegação para próximo e anterior
    if (window.navigateToNextStep || window.navigateToPrevStep) {
      // Função para navegar para o próximo passo
      if (window.navigateToNextStep) {
        const originalNext = window.navigateToNextStep;
        window.navigateToNextStep = () => {
          // Se o lock estiver ativo, não executar
          if (window._formNavigationLock) {
            console.log('Lock ativo, navegação bloqueada');
            return false;
          }

          // Capturar dados de forma segura
          captureDataSafely();

          // Determinar próximo passo
          const currentRoute = window.location.hash.substring(1) || 'personal';
          const currentIndex = this.stepRoutes[currentRoute] || 1;
          const nextIndex = currentIndex + 1;

          if (nextIndex <= 5) {
            const nextRoute = this.stepIndices[nextIndex];
            this.currentStep = nextRoute;

            // Navegar para o próximo passo
            window.location.hash = nextRoute;
            return true;
          }

          return false;
        };
      }

      // Função para navegar para o passo anterior
      if (window.navigateToPrevStep) {
        const originalPrev = window.navigateToPrevStep;
        window.navigateToPrevStep = () => {
          // Se o lock estiver ativo, não executar
          if (window._formNavigationLock) {
            console.log('Lock ativo, navegação bloqueada');
            return false;
          }

          // Capturar dados de forma segura
          captureDataSafely();

          // Determinar passo anterior
          const currentRoute = window.location.hash.substring(1) || 'personal';
          const currentIndex = this.stepRoutes[currentRoute] || 1;
          const prevIndex = currentIndex - 1;

          if (prevIndex >= 1) {
            const prevRoute = this.stepIndices[prevIndex];
            this.currentStep = prevRoute;

            // Navegar para o passo anterior
            window.location.hash = prevRoute;
            return true;
          }

          return false;
        };
      }
    }

    // Remover todos os event listeners existentes dos botões de navegação
    // Isso evita adicionar múltiplos event listeners que causam salvamentos duplicados
    document.addEventListener('click', (e) => {
      // Botão de próximo ou anterior
      if (e.target.id === 'btn-next' || e.target.closest('#btn-next') ||
          e.target.id === 'btn-back' || e.target.closest('#btn-back')) {
        // Não processar nada aqui, deixar para os handlers específicos de cada página
        return;
      }
    });
  }

  /**
   * Captura os dados do formulário atual
   */
  captureCurrentFormData() {
    console.log('[FormStateManager] captureCurrentFormData() chamado.');

    if (this.initialRestorePending) {
      console.log('[FormStateManager] Captura ignorada, restauração inicial ainda pendente.');
      return;
    }

    // Implementar proteção contra chamadas repetidas
    const now = Date.now();
    if (this._lastCapture && (now - this._lastCapture < 1000)) {
      console.log(`Captura ignorada - última captura há ${now - this._lastCapture}ms`);
      return;
    }

    this._lastCapture = now;

    if (!this.isInitialized) {
      console.log('[FormStateManager] Não inicializado, pulando captura.');
      return;
    }

    const currentRoute = this.currentStep || FIAP.currentRoute;
    const form = document.querySelector('form');
    if (!currentRoute || !form) {
      console.log('[FormStateManager] Rota atual ou formulário não encontrado, pulando captura.');
      return;
    }

    console.log(`[FormStateManager] Capturando dados para a rota: ${currentRoute}`);

    // Usar o estado existente como base, se houver, para não perder dados customizados (ex: array de documentos)
    const existingStepData = this.formData[currentRoute] || {};
    let formData = { ...existingStepData }; // Começa com uma cópia dos dados existentes para a rota

    console.log(`[FormStateManager] Estado de this.formData[${currentRoute}] ANTES da coleta:`, JSON.parse(JSON.stringify(existingStepData)));

    // Mapear campos de array para rastreá-los corretamente
    const arrayFields = {};

    // Processar todos os inputs, selects e textareas
    form.querySelectorAll('input, select, textarea').forEach(input => {
      let value = input.value;
      let key = input.name || input.id;

      if (!key) return; // Pular se não houver nome ou id

      // Log detalhado do valor lido do DOM
      console.log(`[FormStateManager] captureCurrentFormData - Lendo DOM: Campo: ${key}, Tipo: ${input.type}, Valor DOM: '${value}'`);

      // Log específico para campos problemáticos
      if (key === 'autor_apelido[]' || key === 'autor_telefone[]' || key === 'autor_senha_meuinss[]') {
        console.log(`[FormStateManager] CAPTURE - Campo de autor problemático: ${key}, Valor: ${value}`);
      }
      if (['cep', 'bairro', 'cidade', 'uf', 'endereco', 'numero', 'colaborador', 'observacoes'].includes(key)) {
        console.log(`[FormStateManager] CAPTURE - Campo personal/endereço: ${key}, Valor: ${value}`);
      }

      if (input.type === 'checkbox') {
        value = input.checked; // Salvar como booleano diretamente
      } else if (input.type === 'radio') {
        if (!input.checked) return; // Salvar apenas o radio selecionado
      }

      // Para campos de múltipla seleção (ex: select-multiple), precisamos de tratamento especial
      if (input.type === 'select-multiple') {
        value = Array.from(input.selectedOptions).map(option => option.value);
      }

      // Se for um array de campos (ex: familiar_nome[]), armazenar como array
      if (key.endsWith('[]')) {
        const baseKey = key.slice(0, -2);
        if (!arrayFields[baseKey]) {
          arrayFields[baseKey] = [];
        }
        arrayFields[baseKey].push(value);
      } else {
        formData[key] = value;
        // LOG ADICIONADO: Ver atribuição de campos simples
        console.log(`[FormStateManager] CAMPO SIMPLES Atribuído: formData[${key}] = ${value}`);
      }
    });

    // Adicionar todos os campos de array ao formData
    Object.keys(arrayFields).forEach(key => {
      formData[key] = arrayFields[key];
      console.log(`[FormStateManager] CAMPO ARRAY Atribuído: formData[${key}] = ${JSON.stringify(arrayFields[key])}`);
    });

    formData['_timestamp'] = Date.now();

    console.log('[FormStateManager] Objeto formData LOCAL construído do DOM (antes da atribuição final):', JSON.parse(JSON.stringify(formData)));

    this.formData[currentRoute] = formData; // Atribuição direta dos dados coletados e mesclados
    console.log(`[FormStateManager] this.formData[${currentRoute}] APÓS atribuição final (DEVE REFLETIR O LOCAL ACIMA):`, JSON.parse(JSON.stringify(this.formData[currentRoute])));

    this.saveStateToCache();
  }

  /**
   * Restaura os dados do formulário para o passo atual
   */
  restoreFormData(step) {
    console.log(`[FormStateManager] restoreFormData() chamado para a etapa: ${step}`);
    this.isRestoring = true;
    try {
    if (!step) {
      console.warn('[FormStateManager] Etapa não fornecida para restauração, usando currentStep:', this.currentStep);
      step = this.currentStep;
      if (!step) {
        console.error('[FormStateManager] Nenhuma etapa definida para restauração.');
          this.isRestoring = false; // Resetar flag em caso de saída antecipada
        return;
      }
    }

    const stepData = this.formData[step];
    console.log(`[FormStateManager] Tentando restaurar dados para a etapa ${step}. Dados disponíveis:`, stepData ? JSON.parse(JSON.stringify(stepData)) : 'Nenhum');

      if (!stepData) {
        this.isRestoring = false; // Resetar flag em caso de saída antecipada
        return;
      }

    const form = document.querySelector('form');
    if (!form) {
      console.error('[FormStateManager] Formulário não encontrado no DOM para restauração.');
        this.isRestoring = false; // Resetar flag em caso de saída antecipada
      return;
    }

    // Mapeamento de campos que são arrays e requerem manipulação de linhas dinâmicas
    // A chave é o nome do campo base (ex: 'cids'), o valor é uma função para adicionar uma nova linha.
    const dynamicArrayFieldHandlers = {
      incapacity: {
        // Estes são os nomes base dos campos que vêm como arrays de captureCurrentFormData
        // e são usados para popular as linhas de doença.
        // Ex: stepData.cids = ['CID1', 'CID2'], stepData.doencas = ['Doenca1', 'Doenca2']
        'tipoDocumentos': window.addDoencaField, // Assumindo que addDoencaField cria uma linha completa
        'cids': window.addDoencaField,
        'doencas': window.addDoencaField,
        'dataDocumentos': window.addDoencaField
      },
      social: { // Adicionar esta seção para membros da família
        'familiar_nome': window.addFamilyMember,
        'familiar_cpf': window.addFamilyMember,
        'familiar_idade': window.addFamilyMember,
        'familiar_parentesco': window.addFamilyMember,
        'familiar_estado_civil': window.addFamilyMember,
        'familiar_renda': window.addFamilyMember,
        'familiar_cadunico': window.addFamilyMember
      },
      professional: { // ADICIONADO PARA ATIVIDADES PROFISSIONAIS
        'atividade_tipo': window.addAtividade,
        'atividade_tag_status': window.addAtividade,
        'atividade_periodo_inicio': window.addAtividade,
        'atividade_periodo_fim': window.addAtividade,
        'atividade_prazo': window.addAtividade, // NOVO CAMPO PRAZO
        'atividade_detalhes': window.addAtividade
      },
      personal: { // ADICIONADO PARA AUTORES
        // Campos que addAuthor clona e para os quais cria inputs nas novas linhas
        'autor_relationship': window.addAuthor,
        'autor_nome': window.addAuthor,
        'autor_cpf': window.addAuthor,
        'autor_nascimento': window.addAuthor,
        'autor_idade': window.addAuthor,
        // Campos abaixo existem para o primeiro autor (name="autor_...[]") e serão salvos/restaurados no array,
        // mas addAuthor() NÃO os cria para autores subsequentes. Se precisar, expandir addAuthor().
        'autor_apelido': null, // Não mapeado para addAuthor pois não é clonado para novas linhas
        'autor_telefone': null,
        'autor_senha_meuinss': null
      },
      documents: { // ADICIONADO PARA DOCUMENTOS
        // A chave 'documentos' corresponde ao array de objetos de documento em formData.documents.documentos
        // Cada objeto nesse array será passado para adicionarNovoDocumento (ou deveria ser)
        'documentos': window.adicionarNovoDocumento
      }
      // Adicionar outros módulos e seus campos de array aqui, se necessário
    };

    // Primeiro, limpar todos os campos (exceto os protegidos) para evitar dados órfãos
    form.querySelectorAll('input, select, textarea').forEach(element => {
      // Não limpar campos específicos do assistido na aba 'social' pois são preenchidos por inicializarAssistido
      if (step === 'social') {
        const assistidoFieldsIds = ['assistido_nome', 'assistido_cpf', 'assistido_idade', 'assistido_renda'];
        // O campo de parentesco do assistido é um input com name="familiar_parentesco[]" e value="Assistido"
        // Os campos de estado civil e cadunico do assistido são arrays e devem ser limpos/restaurados normalmente.
        if (assistidoFieldsIds.includes(element.id)) {
          return; // Não limpa
        }
        // Para o campo de parentesco do assistido, que é readonly e preenchido com "Assistido"
        if (element.name === 'familiar_parentesco[]' && element.closest('.assistido') && element.value === 'Assistido') {
            return; // Não limpa o parentesco do assistido
        }
      }

      if (element.type !== 'submit' && element.type !== 'button' && element.type !== 'hidden' &&
          !element.classList.contains('no-auto-clear') && !element.closest('.no-auto-clear-parent')) {
        if (element.type === 'checkbox' || element.type === 'radio') {
          element.checked = false;
        } else {
          element.value = '';
        }
      }
    });

    // Se estivermos na etapa de incapacidade, e não houver dados para campos de doença,
    // mas o container de doenças já tiver linhas, vamos removê-las.
    if (step === 'incapacity') {
        const doencasList = document.getElementById('doencasList');
        if (doencasList) {
            let hasIncapacityArrayData = false;
            if (dynamicArrayFieldHandlers.incapacity) {
                for (const fieldName in dynamicArrayFieldHandlers.incapacity) {
                    if (stepData[fieldName] && Array.isArray(stepData[fieldName]) && stepData[fieldName].length > 0) {
                        hasIncapacityArrayData = true;
                        break;
                    }
                }
            }
            if (!hasIncapacityArrayData) {
                // Remove todas as linhas de doença exceto a primeira, se ela existir e for modelo
                const rows = doencasList.querySelectorAll('.mb-4.border-b'); // Seletor genérico para linhas
                rows.forEach((row, index) => {
                    // Manter a primeira linha se ela for um template ou se não houver dados.
                    // A lógica aqui pode precisar ser mais específica para identificar um "template"
                    // Por enquanto, se não há dados, e há mais de uma linha, remove as extras.
                    // Se não há dados e só há uma linha, ela pode ser o template.
                    // Para simplificar, se não há dados de array, remove todas as linhas adicionadas.
                    // A primeira linha geralmente é parte do HTML estático.
                    // Se 'addDoencaField' cria a primeira linha do zero, então podemos limpar tudo.
                    // O HTML original para incapacity parece ter uma linha já.
                    // Vamos assumir que o HTML inicial tem a primeira linha como modelo.
                    // E 'addDoencaField' adiciona a partir da segunda.
                    // Se 'addDoencaField' também manipula o índice 0, esta lógica precisa mudar.
                    // A função addDoencaField calcula nextIndex = existingFields.length + 1
                    // então ela sempre adiciona. O HTML deve ter a linha 0/1.
                    if (index > 0) { // Deixa a primeira linha (índice 0)
                        row.remove();
                    }
                });
            }
        }
    } else if (step === 'social') { // Limpeza para membros da família na etapa social
        const membrosList = document.getElementById('membros-familia-list');
        if (membrosList) {
            let hasSocialArrayData = false;
            if (dynamicArrayFieldHandlers.social) {
                for (const fieldName in dynamicArrayFieldHandlers.social) {
                    if (stepData[fieldName] && Array.isArray(stepData[fieldName]) && stepData[fieldName].length > 0) {
                        // Consideramos que há dados se qualquer um dos campos de array de familiar tiver dados.
                        // A primeira entrada de cada array corresponde ao "assistido", que não é adicionado por addFamilyMember
                        // mas sim por inicializarAssistido(). Os dados do assistido já estão no formData.
                        // Se familiar_nome.length > 1, significa que há membros além do assistido.
                        if (stepData[fieldName].length > 1) {
                            hasSocialArrayData = true;
                            break;
                        }
                    }
                }
            }

            // Se não há dados para membros *adicionais* (além do assistido),
            // remover todas as linhas de membro exceto a primeira (o assistido).
            if (!hasSocialArrayData) {
                const rows = membrosList.querySelectorAll('.membro-familia'); // Classe para cada linha de membro
                rows.forEach((row, index) => {
                    if (index > 0) { // Deixa a primeira linha (o assistido, índice 0)
                        row.remove();
                    }
                });
            }
        }
    } else if (step === 'professional') { // ADICIONADA LÓGICA DE LIMPEZA PARA PROFESSIONAL
        const atividadesList = document.getElementById('atividadesList');
        if (atividadesList) {
            let hasProfessionalArrayData = false;
            if (dynamicArrayFieldHandlers.professional) {
                // Verificar se há algum dado de array para atividades profissionais
                for (const fieldName in dynamicArrayFieldHandlers.professional) {
                    if (stepData[fieldName] && Array.isArray(stepData[fieldName]) && stepData[fieldName].length > 0) {
                        hasProfessionalArrayData = true;
                        break;
                    }
                }
            }

            const rows = atividadesList.querySelectorAll('.atividade-item');
            let numberOfDataRows = 0;
            if (hasProfessionalArrayData && dynamicArrayFieldHandlers.professional) {
                // Usar o primeiro campo definido nos handlers para determinar o número de linhas de dados
                const firstHandlerKey = Object.keys(dynamicArrayFieldHandlers.professional)[0];
                if (stepData[firstHandlerKey] && Array.isArray(stepData[firstHandlerKey])) {
                    numberOfDataRows = stepData[firstHandlerKey].length;
                }
            }

            // Remover linhas de atividade que excedem a quantidade de dados salvos.
            // A primeira linha (índice 0) é estática no HTML e não é adicionada por addAtividade.
            // As linhas adicionadas por addAtividade são clonadas do template.
            // Se numberOfDataRows é 1, significa que apenas a primeira linha (estática) deve ter dados.
            // Se numberOfDataRows é 2, a primeira linha estática + 1 linha adicionada devem ter dados.
            // Portanto, queremos manter 'numberOfDataRows' no total.
            for (let i = rows.length - 1; i >= numberOfDataRows; i--) {
                 // A condição i > 0 foi removida daqui porque a primeira linha (índice 0)
                 // também é uma 'atividade-item'. Se numberOfDataRows é 0, queremos limpar todas as linhas
                 // exceto a primeira que é parte do layout base (ou recriá-la se foi removida por engano).
                 // No entanto, addAtividade appenda. A primeira linha estática não é 'adicionada'.
                 // Se rows.length = 1 (só a estática) e numberOfDataRows = 0, não faz nada.
                 // Se rows.length = 2 (estática + 1 clone) e numberOfDataRows = 0, remove a clonada (rows[1]).
                 // Se rows.length = 2 e numberOfDataRows = 1, remove a clonada (rows[1]), pois dados são só para a estática.
                 // Se rows.length = 1 e numberOfDataRows = 1, não faz nada.
                 // A lógica de adicionar linhas depois vai criar as que faltam.
                 // O importante é que rows[0] é a estática e rows[1] em diante são as clones.
                 // Se há dados para N linhas, e temos M linhas no DOM (M > N), removemos M-N linhas do final,
                 // mas nunca removemos rows[0].
                if (i > 0) { // Só remove linhas clonadas (índice > 0)
                    rows[i].remove();
                }
            }
        }
    } else if (step === 'personal') { // ADICIONADA LÓGICA DE LIMPEZA PARA AUTORES
        const authorsContainer = document.getElementById('authors-container');
        if (authorsContainer) {
            let hasPersonalArrayData = false;
            if (dynamicArrayFieldHandlers.personal) {
                // Verificar se há algum dado de array para autores
                for (const fieldName in dynamicArrayFieldHandlers.personal) {
                    if (dynamicArrayFieldHandlers.personal[fieldName] !== null && // Considerar apenas campos que addAuthor manipula
                        stepData[fieldName] && Array.isArray(stepData[fieldName]) && stepData[fieldName].length > 0) {
                        hasPersonalArrayData = true;
                        break;
                    }
                }
            }

            const rows = authorsContainer.querySelectorAll('.author-row');
            let numberOfDataRows = 0;
            if (hasPersonalArrayData && dynamicArrayFieldHandlers.personal) {
                // Usar 'autor_nome' para determinar o número de linhas de dados de autores
                if (stepData['autor_nome'] && Array.isArray(stepData['autor_nome'])) {
                    numberOfDataRows = stepData['autor_nome'].length;
                }
            }

            // Remover linhas de autor que excedem a quantidade de dados salvos.
            // A primeira linha (author-1) é estática. As adicionadas são author-2, author-3, etc.
            for (let i = rows.length - 1; i >= numberOfDataRows; i--) {
                if (i > 0) { // Só remove linhas clonadas (índice > 0, ou seja, author-2 em diante)
                    // Antes de remover a linha (author-row), remover também o seu separador precedente se houver
                    const authorToRemove = rows[i];
                    const prevSibling = authorToRemove.previousElementSibling;
                    if (prevSibling && prevSibling.classList.contains('author-separator')) {
                        authorsContainer.removeChild(prevSibling);
                    }
                    authorsContainer.removeChild(authorToRemove);
                    // Atualizar o window.authorCount global se estivermos removendo o último autor visualmente.
                    // Esta parte é complexa pois authorCount pode dessincronizar. Melhor se addAuthor/removeAuthor gerenciasse visual e contagem.
                    // Por agora, a limpeza só remove do DOM. addAuthor será chamado para recriar se necessário.
                }
            }
             // Ajustar window.authorCount para o número de linhas de dados, pois a limpeza acima só afeta o DOM.
             // A função addAuthor usa window.authorCount para gerar IDs únicos.
             // Se restaurarmos N autores, authorCount deve ser N para o próximo add funcionar corretamente.
             window.authorCount = numberOfDataRows > 0 ? numberOfDataRows : 1; // Se 0 autores, próximo será autor 1 (o primeiro)
        }
    }

    // Iterar sobre os dados salvos para a etapa
    for (const key in stepData) {
      if (stepData.hasOwnProperty(key)) {
        const valueToRestore = stepData[key];

        // Verificar se é um campo de array dinâmico para a etapa atual
        const stepDynamicHandlers = dynamicArrayFieldHandlers[step];

          // Log para cada chave que tentamos restaurar
          if (key === '_timestamp') {
              console.log(`[FormStateManager] RESTORE - Tentando chave: '_timestamp', Valor: ${valueToRestore}. Pulando esta chave.`);
              continue; // Pular apenas a iteração do _timestamp
          }

          console.log(`[FormStateManager] RESTORE - Processando Chave: '${key}', Valor:`, JSON.parse(JSON.stringify(valueToRestore)));

          const handler = stepDynamicHandlers ? stepDynamicHandlers[key] : undefined;

          if (typeof handler === 'function' && Array.isArray(valueToRestore)) {
              // CASO 1: Campo de array com manipulador de função dinâmico (ex: addAuthor para autor_nome)
              console.log(`[FormStateManager] RESTORE - Chave '${key}' tem MANIPULADOR DE FUNÇÃO DINÂMICO.`);

              const addRowFunction = handler; // Renomeado para clareza
              const numValues = valueToRestore.length;

              if (step === 'documents' && key === 'documentos') { // Não precisa de typeof addRowFunction === 'function' aqui pois já foi checado
            // Lógica especial para restaurar documentos
            console.log(`[State] Iniciando restauração especial para documents. Documentos a restaurar:`, valueToRestore);
            const documentosContainer = document.getElementById('documentos-container');
            if (documentosContainer) {
              documentosContainer.innerHTML = ''; // Limpa para recomeçar
              console.log("[State] Container de documentos limpo para restauração.");
            }
            valueToRestore.forEach((docData, index) => {
                  if (docData && typeof docData === 'object') {
                try {
                  console.log(`[State] Chamando adicionarNovoDocumento (idx ${index}) com dados:`, docData);
                      const newDocElement = addRowFunction(docData);
                  if (!newDocElement) {
                    console.warn(`[State] adicionarNovoDocumento não retornou um elemento para o documento idx ${index}`, docData);
                  }
                } catch (e) {
                  console.error(`[FormStateManager] Erro ao chamar addRowFunction para documento (idx ${index}):`, e, docData);
                }
              } else {
                console.warn(`[State] Dados do documento inválidos no índice ${index}, pulando:`, docData);
              }
            });
            console.log("[State] Restauração especial de documentos concluída.");
                // Pular o preenchimento genérico abaixo, pois já foi feito
                console.log(`[FormStateManager] RESTORE - Chave '${key}' tratada por manipulador dinâmico (documentos).`);
            continue;
              } else { // Outros campos com manipuladores de função dinâmicos
            const fieldNameForQuery = `${key}[]`;
                let currentFieldsForName = form.querySelectorAll(`[name="${fieldNameForQuery}"]`);
              console.log(`[State] Antes do loop addRow: ${fieldNameForQuery}, currentInDOM: ${currentFieldsForName.length}, numValuesNeeded: ${numValues}, step: ${step}`);

              for (let i = currentFieldsForName.length; i < numValues; i++) {
                  try {
                        let countLog = '';
                        if (step === 'personal' && typeof window.authorCount !== 'undefined') countLog = `, window.authorCount antes: ${window.authorCount}`;
                        else if (step === 'professional' && typeof window.atividadeCount !== 'undefined') countLog = `, window.atividadeCount antes: ${window.atividadeCount || 'N/A'}`;

                        console.log(`[State] Chamando addRowFunction para ${key} (idx ${i} de ${numValues -1})${countLog}`);
                        addRowFunction();

                        if (step === 'personal' && typeof window.authorCount !== 'undefined') countLog = `, window.authorCount depois: ${window.authorCount}`;
                        else if (step === 'professional' && typeof window.atividadeCount !== 'undefined') countLog = `, window.atividadeCount depois: ${window.atividadeCount || 'N/A'}`;
                        console.log(`[State] addRowFunction chamada para ${key} (idx ${i})${countLog}`);

                        let tempCount = form.querySelectorAll(`[name="${fieldNameForQuery}"]`).length;
                        console.log(`[State] Após addRowFunction ${key} (idx ${i}), campos [name="${fieldNameForQuery}"] no DOM: ${tempCount}`);
                  } catch (e) {
                      console.error(`[FormStateManager] Erro ao chamar addRowFunction para ${key} (idx ${i}):`, e);
                      break;
                  }
              }
                currentFieldsForName = form.querySelectorAll(`[name="${fieldNameForQuery}"]`);
              console.log(`[State] Após loop addRow: ${fieldNameForQuery}, currentInDOM: ${currentFieldsForName.length}, step: ${step}`);

                const elementsForName = form.querySelectorAll(`[name="${fieldNameForQuery}"]`);
            valueToRestore.forEach((val, index) => {
              if (elementsForName[index]) {
                const element = elementsForName[index];
                    if (element.type === 'checkbox') element.checked = typeof val === 'boolean' ? val : val === 'true';
                    else if (element.type === 'radio' && element.value === String(val)) element.checked = true;
                    else element.value = val;
                console.log(`[FormStateManager] Restaurando array campo ${element.name}[${index}] com valor: ${val}`);

                // Adicionar dispatch de evento 'change' para selects de tag de atividade e relacionamento
                if (element.tagName === 'SELECT' &&
                    (element.name === 'atividade_tag_status[]' || element.classList.contains('activity-tag') ||
                     element.name === 'autor_relationship[]' || element.id.startsWith('relationship_')) ) {
                  element.dispatchEvent(new Event('change', { bubbles: true }));
                  console.log(`[FormStateManager] Evento 'change' disparado para ${element.name}[${index}] id: ${element.id} após restauração.`);
                }

                    if (element.name === 'autor_apelido[]' || element.name === 'autor_telefone[]' || element.name === 'autor_senha_meuinss[]') {
                      console.log(`[FormStateManager] RESTORE ARRAY - Campo de autor problemático: ${element.name}[${index}], Valor Restaurado: ${val}, Elemento Visível/Habilitado: ${!element.hidden && !element.disabled}`);
                }
                    if (typeof destacarCampoPreenchido === 'function') destacarCampoPreenchido(element);
              } else {
                console.warn(`[FormStateManager] Não encontrado elemento de array ${fieldNameForQuery} no índice ${index} para restaurar valor ${val}`);
              }
            });
              }
              console.log(`[FormStateManager] RESTORE - Chave '${key}' tratada por manipulador dinâmico.`);

          } else {
              // CASO 2 & 3: Campo não tem manipulador de função OU não é array para ele (handler é null ou não existe)
              console.log(`[FormStateManager] RESTORE - Chave '${key}' (handler: ${typeof handler}) NÃO tem manipulador de função ou não é array para ele. Entrando no tratamento GERAL.`);

              const arrayElementsByName = form.querySelectorAll(`[name="${key}[]"]`);
              console.log(`[FormStateManager] RESTORE (GERAL) - Para chave '${key}', buscando por nome de array [name="${key}[]"]. Encontrados: ${arrayElementsByName.length}`);

            if (Array.isArray(valueToRestore) && arrayElementsByName.length > 0) {
                  // CASO 2.1: É um array no stepData E encontramos elementos de array no DOM (ex: autor_apelido[])
                  console.log(`[FormStateManager] RESTORE (GERAL) - Entrando no bloco de restauração para ARRAY (e.g. autor_apelido[]) para chave: '${key}'`);
                  const isAutorProblematico = ['autor_apelido', 'autor_telefone', 'autor_senha_meuinss'].includes(key);
                  if (isAutorProblematico) {
                    console.log(`[FormStateManager] RESTORE (GERAL) - Campo problemático de autor detectado: ${key}, valores: ${JSON.stringify(valueToRestore)}`);
                  }
              valueToRestore.forEach((val, index) => {
                if (arrayElementsByName[index]) {
                  const element = arrayElementsByName[index];
                      console.log(`[FormStateManager] RESTORE ARRAY (GERAL) - Restaurando elemento ${element.name}[${index}] tipo ${element.type}`);
                      if (element.type === 'checkbox') element.checked = typeof val === 'boolean' ? val : val === 'true';
                      else if (element.type === 'radio' && element.value === String(val)) element.checked = true;
                      else element.value = val;
                      console.log(`[FormStateManager] Restaurando array (GERAL) campo ${element.name}[${index}] com valor: ${val}`);
                      element.dispatchEvent(new Event('input', { bubbles: true }));
                      element.dispatchEvent(new Event('change', { bubbles: true }));
                      if (typeof destacarCampoPreenchido === 'function') destacarCampoPreenchido(element);
                  } else {
                      console.warn(`[FormStateManager] (GERAL - ARRAY) Não encontrado elemento de array ${key}[] no índice ${index} para restaurar valor ${val}`);
                    }
                  });
              } else if (!Array.isArray(valueToRestore)) {
                  // CASO 3: Não é um array no stepData - TRATAR COMO CAMPO ÚNICO
                  console.log(`[FormStateManager] RESTORE (GERAL) - Entrando no bloco de restauração para CAMPO ÚNICO (e.g. cep, colaborador) para chave: '${key}'`);
                  let restored = false;
                  const elementById = form.querySelector(`#${CSS.escape(key)}`);
                  if (elementById) {
                    console.log(`[FormStateManager] RESTORE CAMPO ÚNICO (GERAL) - Encontrado por ID: #${key}, tipo: ${elementById.type}`);
                    if (elementById.type === 'checkbox') elementById.checked = typeof valueToRestore === 'boolean' ? valueToRestore : String(valueToRestore).toLowerCase() === 'true';
                    else if (elementById.type === 'radio' && elementById.value === String(valueToRestore)) elementById.checked = true;
                    else if (elementById.type === 'select-multiple' && Array.isArray(valueToRestore)) Array.from(elementById.options).forEach(o => o.selected = valueToRestore.includes(o.value));
                    else elementById.value = valueToRestore;
                    console.log(`[FormStateManager] Restaurado (GERAL - por ID) campo #${key} com valor:`, valueToRestore);
                    elementById.dispatchEvent(new Event('input', { bubbles: true }));
                    elementById.dispatchEvent(new Event('change', { bubbles: true }));
                    if (typeof destacarCampoPreenchido === 'function') destacarCampoPreenchido(elementById);
                    restored = true;
                  }

                  if (!restored) {
                    const elementsByName = form.querySelectorAll(`[name="${CSS.escape(key)}"]`);
                    if (elementsByName.length === 1) {
                      console.log(`[FormStateManager] RESTORE CAMPO ÚNICO (GERAL) - Encontrado por NAME: ${key}, tipo: ${elementsByName[0].type}`);
                      const el = elementsByName[0];
                      if (el.type === 'checkbox') el.checked = typeof valueToRestore === 'boolean' ? valueToRestore : String(valueToRestore).toLowerCase() === 'true';
                      else if (el.type === 'radio') elementsByName.forEach(r => r.checked = (r.value === String(valueToRestore)));
                      else if (el.type === 'select-multiple' && Array.isArray(valueToRestore)) Array.from(el.options).forEach(o => o.selected = valueToRestore.includes(o.value));
                      else el.value = valueToRestore;
                      console.log(`[FormStateManager] Restaurado (GERAL - por Nome) campo name="${key}" com valor:`, valueToRestore);
                      el.dispatchEvent(new Event('input', { bubbles: true }));
                      el.dispatchEvent(new Event('change', { bubbles: true }));
                      if (typeof destacarCampoPreenchido === 'function') destacarCampoPreenchido(el);
                      restored = true;
                    } else if (elementsByName.length > 1 && elementsByName[0].type === 'radio') {
                      console.log(`[FormStateManager] RESTORE CAMPO ÚNICO (GERAL) - Grupo de radios por NAME: ${key}`);
                      elementsByName.forEach(radioEl => {
                        radioEl.checked = (radioEl.value === String(valueToRestore));
                        if (radioEl.checked) console.log(`[FormStateManager] Restaurado (GERAL) radio name="${key}" value="${radioEl.value}"`);
                      });
                      restored = true;
                    }
                  }
                  if (!restored) {
                    if (typeof CONFIG !== 'undefined' && CONFIG.debug && CONFIG.debug.enabled) {
                      console.warn(`[FormStateManager] (GERAL - CAMPO ÚNICO) Campo '${key}' não foi encontrado/restaurado no DOM. Valor:`, valueToRestore);
                    }
                  }

              } else { // Array.isArray(valueToRestore) é true, mas não arrayElementsByName.length > 0
                if (typeof CONFIG !== 'undefined' && CONFIG.debug && CONFIG.debug.enabled) {
                  console.warn(`[FormStateManager] RESTORE (GERAL) - Chave '${key}' é um array nos dados, mas não foram encontrados elementos DOM '${key}[]'.`);
                }
                if (valueToRestore.length === 1) {
                  const singleValueToRestore = valueToRestore[0];
                  console.log(`[FormStateManager] RESTORE (GERAL) - Tentando restaurar '${key}' com valor único de array:`, singleValueToRestore);
                  let restoredSingle = false;
                  const elementByIdSingle = form.querySelector(`#${CSS.escape(key)}`);
                  if (elementByIdSingle) {
                    console.log(`[FormStateManager] RESTORE CAMPO ÚNICO DE ARRAY (GERAL) - Encontrado por ID: #${key}, tipo: ${elementByIdSingle.type}`);
                    if (elementByIdSingle.type === 'checkbox') elementByIdSingle.checked = typeof singleValueToRestore === 'boolean' ? singleValueToRestore : String(singleValueToRestore).toLowerCase() === 'true';
                    else if (elementByIdSingle.type === 'radio' && elementByIdSingle.value === String(singleValueToRestore)) elementByIdSingle.checked = true;
                    else if (elementByIdSingle.type === 'select-multiple' && Array.isArray(singleValueToRestore)) Array.from(elementByIdSingle.options).forEach(o => o.selected = singleValueToRestore.includes(o.value));
                    else elementByIdSingle.value = singleValueToRestore;
                    console.log(`[FormStateManager] Restaurado (GERAL - ÚNICO DE ARRAY por ID) campo #${key} com valor:`, singleValueToRestore);
                    elementByIdSingle.dispatchEvent(new Event('input', { bubbles: true }));
                    elementByIdSingle.dispatchEvent(new Event('change', { bubbles: true }));
                    if (typeof destacarCampoPreenchido === 'function') destacarCampoPreenchido(elementByIdSingle);
                    restoredSingle = true;
                  }
                  if (!restoredSingle) {
                    const elementsByNameSingle = form.querySelectorAll(`[name="${CSS.escape(key)}"]`);
                    if (elementsByNameSingle.length === 1) {
                      const elSingle = elementsByNameSingle[0];
                      console.log(`[FormStateManager] RESTORE CAMPO ÚNICO DE ARRAY (GERAL) - Encontrado por NAME: ${key}, tipo: ${elSingle.type}`);
                      if (elSingle.type === 'checkbox') elSingle.checked = typeof singleValueToRestore === 'boolean' ? singleValueToRestore : String(singleValueToRestore).toLowerCase() === 'true';
                      else if (elSingle.type === 'radio') elementsByNameSingle.forEach(r => r.checked = (r.value === String(singleValueToRestore)));
                      else if (elSingle.type === 'select-multiple' && Array.isArray(singleValueToRestore)) Array.from(elSingle.options).forEach(o => o.selected = singleValueToRestore.includes(o.value));
                      else elSingle.value = singleValueToRestore;
                      console.log(`[FormStateManager] Restaurado (GERAL - ÚNICO DE ARRAY por Nome) campo name="${key}" com valor:`, singleValueToRestore);
                      elSingle.dispatchEvent(new Event('input', { bubbles: true }));
                      elSingle.dispatchEvent(new Event('change', { bubbles: true }));
                      if (typeof destacarCampoPreenchido === 'function') destacarCampoPreenchido(elSingle);
                      restoredSingle = true;
                    } else if (elementsByNameSingle.length > 1 && elementsByNameSingle[0].type === 'radio'){
                      console.log(`[FormStateManager] RESTORE CAMPO ÚNICO DE ARRAY (GERAL) - Grupo de radios por NAME: ${key}`);
                      elementsByNameSingle.forEach(radioEl => {
                        radioEl.checked = (radioEl.value === String(singleValueToRestore));
                         if (radioEl.checked) console.log(`[FormStateManager] Restaurado (GERAL - ÚNICO DE ARRAY) radio name="${key}" value="${radioEl.value}"`);
                      });
                      restoredSingle = true;
                    }
                  }
                  if (!restoredSingle) {
                    if (typeof CONFIG !== 'undefined' && CONFIG.debug && CONFIG.debug.enabled) {
                      console.warn(`[FormStateManager] (GERAL - ÚNICO DE ARRAY) Campo '${key}' não encontrado/restaurado no DOM com valor único. Valor:`, singleValueToRestore);
                    }
                  }
                } else {
                  if (typeof CONFIG !== 'undefined' && CONFIG.debug && CONFIG.debug.enabled) {
                    console.warn(`[FormStateManager] RESTORE (GERAL) - Chave '${key}' é um array com múltiplos valores ou vazio (${valueToRestore.length}), e não há elementos DOM '${key}[]'. Não foi possível restaurar.`);
                  }
                }
              }
              console.log(`[FormStateManager] RESTORE - Chave '${key}' tratada (ou tentativa) por bloco geral.`);
          }

          // A antiga lógica de `if (step === 'documents' && key === 'documentos') { continue; }` foi movida para dentro do primeiro if,
          // pois só faz sentido pular se foi tratado pelo handler dinâmico de documentos.
        }
      }

    // Após restaurar todos os campos, atualizar visuais específicos se necessário
    if (step === 'social') {
      if (typeof window.updateCadUnicoButtonVisual === 'function') {
        const cadUnicoInputs = form.querySelectorAll('input[name="familiar_cadunico[]"]');
        cadUnicoInputs.forEach(input => {
          window.updateCadUnicoButtonVisual(input);
        });
      }
      // Chamar aqui outras funções de atualização visual para a etapa social, se houver.
      if (typeof window.calcularRendaTotal === 'function') {
        // Chamar após um pequeno delay para garantir que todos os valores de renda dos membros e o total
        // já foram restaurados no DOM e estão prontos para serem lidos por calcularRendaTotal.
        setTimeout(() => {
            window.calcularRendaTotal();
        }, 100); // Pequeno delay pode ser ajustado se necessário
      }
    }
    } finally {
      this.isRestoring = false;
      console.log(`[FormStateManager] restoreFormData para ${step} concluído. isRestoring: ${this.isRestoring}`);
    }
  }

  /**
   * Limpa o estado atual do formulário
   */
  clearState() {
    console.log('[FormStateManager] clearState() chamado. Call stack:');
    console.trace(); // Adiciona o stack trace para depuração

    this.formData = {
      personal: {},
      social: {},
      incapacity: {},
      professional: {},
      documents: {}
    };
    this.currentStep = 'personal';
    this.isInitialized = false;

    console.log('Estado do formulário limpo.');

    FIAP.cache.remove('formStateManagerData');
    console.log('[FormStateManager] Estado removido do cache e formData resetado.');
    // Atualizar a UI para refletir o estado limpo
    // this.restoreFormData(this.currentStep || 'personal'); // COMENTADO - pode causar loops/resets inesperados
  }

  // Função auxiliar para atualizar dados de um campo específico (se necessário)
  updateSpecificField(formType, fieldName, value) {
    console.log(`[FormStateManager] updateSpecificField chamado para ${formType}.${fieldName} com valor:`, value);

    if (this.formData[formType]) {
      this.formData[formType][fieldName] = value;
      FIAP.cache.set('formStateManagerData', { formData: this.formData, currentStep: this.currentStep });
      console.log(`[FormStateManager] Campo ${formType}.${fieldName} atualizado e estado salvo no cache.`);
    } else {
      console.warn(`[FormStateManager] Tipo de formulário ${formType} não encontrado em formData para updateSpecificField.`);
    }
  }

  saveStateToCache() {
    const dataToCache = {
      formData: this.formData,
      currentStep: this.currentStep,
      // Adicionar outros metadados relevantes se necessário no futuro
      // currentFormId: this.currentFormId,
      // isInitialized: this.isInitialized,
      // initialRestorePending: this.initialRestorePending
    };
    console.log('[FormStateManager] saveStateToCache - Salvando no cache:', JSON.parse(JSON.stringify(dataToCache)));
    FIAP.cache.set('formStateManagerData', dataToCache);
    console.log('[FormStateManager] Estado efetivamente salvo no cache via saveStateToCache.');
  }

  loadStateFromCache() {
    const parsedData = FIAP.cache.get('formStateManagerData');

    console.log('[FormStateManager] loadStateFromCache - Parsed data (objeto) do cache:', parsedData ? JSON.parse(JSON.stringify(parsedData)): null);

    if (parsedData && parsedData.formData) {
      this.formData = parsedData.formData;
      this.currentStep = parsedData.currentStep;
      // Restaurar outros metadados se foram salvos e são necessários
      // this.currentFormId = parsedData.currentFormId;
      // this.isInitialized = parsedData.isInitialized;
      // this.initialRestorePending = parsedData.initialRestorePending;
      console.log('[FormStateManager] Estado (formData e currentStep) restaurado do cache via loadStateFromCache.');
      return true;
    } else {
      console.warn('[FormStateManager] loadStateFromCache - Dados do cache inválidos, não encontrados ou sem formData.');
      // Resetar para o padrão se não houver nada ou estiver corrompido
      this.formData = { personal: {}, social: {}, incapacity: {}, professional: {}, documents: {} };
      this.currentStep = null; // Ou um valor padrão como 'personal'
      return false;
    }
  }
}

// Garantir que a instância seja criada e inicializada
if (typeof window.formStateManager === 'undefined') {
  window.formStateManager = new FormStateManager();
  console.log('[FormStateManager] Nova instância criada e atribuída a window.formStateManager.');
} else {
  console.log('[FormStateManager] Instância existente de window.formStateManager encontrada.');
  // Se a instância já existe mas não foi inicializada (improvável com DOMContentLoaded no construtor, mas para garantir)
  if (!window.formStateManager.isInitialized) {
    console.log('[FormStateManager] Instância existente não estava inicializada, chamando init().');
    // A chamada de init dentro do construtor via DOMContentLoaded deve cuidar disso,
    // mas podemos adicionar uma chamada direta se necessário em cenários específicos.
    // window.formStateManager.init();
  }
}

// Injetar correção para garantir restauração após carregamento de módulo
document.addEventListener('DOMContentLoaded', function() {
  // Sobreescrevendo a função de carregamento de módulo para restaurar o estado
  const originalLoadModuleWithTemplate = window.loadModuleWithTemplate;

  if (originalLoadModuleWithTemplate) {
    window.loadModuleWithTemplate = async function(route) {
      // Chamar a função original
      await originalLoadModuleWithTemplate(route);

      // Após carregar o módulo, podemos ainda querer definir o currentStep no formStateManager,
      // embora o initModule de cada módulo também possa fazer isso se necessário, ou ser baseado no hash.
      // Por enquanto, vamos manter a definição do currentStep aqui, pois parece inofensivo
      // e pode ajudar se a lógica de currentStep dentro de initModule for removida ou falhar.
      // const currentStep = route.scriptUrl.split('/').pop().replace('.js', '');
      // if (window.formStateManager) {
      // window.formStateManager.currentStep = currentStep;
      // }
    };
  }
});
