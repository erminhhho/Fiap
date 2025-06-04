/**
 * Sistema de Navegação Padronizado e Seguro
 *
 * Implementa um sistema robusto de navegação entre páginas com:
 * - Proteção contra travamentos e falhas
 * - Inicialização controlada dos módulos
 * - Feedback visual consistente
 * - Salvamento automático de dados
 * - Retry automático em caso de falhas
 *
 * IMPORTANTE: Este arquivo trabalha em conjunto com router.js.
 * - Navigation.js gerencia o estado de navegação e a lógica de interface do usuário
 * - Router.js gerencia a mudança efetiva de rotas e o carregamento de templates/scripts
 *
 * ARQUITETURA DE NAVEGAÇÃO:
 * 1. Navigation.js é responsável por:
 *    - Controlar o estado interno da navegação (carregando, etapa atual, etc.)
 *    - Fornecer feedback visual (botões de loading, alertas, etc.)
 *    - Gerenciar a persistência de dados entre navegações
 *    - Lidar com casos de erro e retentativas
 *    - Fornecer API pública para os módulos (navigateNext, navigatePrevious, etc.)
 *
 * 2. Router.js é responsável por:
 *    - Carregar os templates HTML das páginas
 *    - Carregar os scripts dos módulos
 *    - Gerenciar a URL e hash de navegação
 *    - Inicializar os módulos após carregamento
 *    - Sincronizar dados entre módulos relacionados
 *
 * FLUXO DE INTEGRAÇÃO:
 * 1. O usuário aciona um botão de navegação que chama Navigation.navigateToStep()
 * 2. Navigation.js valida, salva dados e delega para router.js através de navigateToLegacy()
 * 3. Router.js carrega o template e script necessários
 * 4. Router.js notifica de volta o Navigation.js através de eventos 'stepChanged'
 * 5. Navigation.js restaura o estado da UI e dados do formulário
 */

// Namespace para o sistema de navegação
const Navigation = {
  // Estado interno do sistema
  state: {
    isNavigating: false,
    retryCount: 0,
    maxRetries: 3,
    currentStep: null,
    initializationQueue: []
  },

  // Configurações do sistema
  config: {
    navigationDelay: 100,
    initializationTimeout: 5000,
    retryDelay: 500,
    fadeTransitionTime: 200,
    enableDebugLogs: true
  },
  // Mapeamento de etapas e módulos - UNIFICADO
  stepMap: {
    'home': {
      index: 0,
      next: 'personal',
      prev: null,
      initFunction: 'initHomeModule',
      contentReady: () => document.getElementById('attendances-table-body')
    },
    'personal': {
      index: 1,
      next: 'social',
      prev: 'home',
      initFunction: 'initPersonalModule',
      contentReady: () => document.getElementById('autores-list')
    },
    'social': {
      index: 2,
      next: 'incapacity',
      prev: 'personal',
      initFunction: 'initSocialModule',
      contentReady: () => document.getElementById('membros-familia-list')
    },
    'incapacity': {
      index: 3,
      next: 'professional',
      prev: 'social',
      initFunction: 'initIncapacityModule',
      contentReady: () => document.getElementById('doencasList')
    },
    'professional': {
      index: 4,
      next: 'documents',
      prev: 'incapacity',
      initFunction: 'initProfessionalModule',
      contentReady: () => document.getElementById('atividades-list')
    },
    'documents': {
      index: 5,
      next: null,
      prev: 'professional',
      initFunction: 'initDocumentsModule',
      contentReady: () => document.getElementById('documentos-list'),
      isFinalStep: true    }
  },

  /**
   * Log debug com controle de verbosidade
   */
  log(message, ...args) {
    if (this.config.enableDebugLogs) {
      console.log(`[Navigation] ${message}`, ...args);
    }
  },

  /**
   * Log de erro (sempre ativo)
   */
  error(message, ...args) {
    console.error(`[Navigation] ${message}`, ...args);
  },

  /**
   * Verifica se uma etapa é válida
   */
  isValidStep(step) {
    return step && this.stepMap.hasOwnProperty(step);
  },

  /**
   * Salva dados do formulário atual com proteção contra falhas
   */
  async saveCurrentFormData() {
    try {
      if (window.formStateManager && typeof window.formStateManager.captureCurrentFormData === 'function') {
        this.log('Salvando dados do formulário atual...');
        await window.formStateManager.captureCurrentFormData();
        this.log('Dados salvos com sucesso');
        return true;
      } else {
        this.log('FormStateManager não disponível, pulando salvamento');
        return false;
      }
    } catch (error) {
      this.error('Erro ao salvar dados do formulário:', error);
      return false;
    }
  },

  /**
   * Aplica feedback visual nos botões durante navegação
   */
  setButtonLoadingState(button, isLoading) {
    if (!button) return;

    if (isLoading) {
      button.dataset.originalText = button.innerHTML;
      button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Carregando...';
      button.classList.add('opacity-75');
      button.disabled = true;
    } else {
      if (button.dataset.originalText) {
        button.innerHTML = button.dataset.originalText;
        delete button.dataset.originalText;
      }
      button.classList.remove('opacity-75');
      button.disabled = false;
    }
  },

  /**
   * Inicializa o conteúdo de um módulo de forma segura
   */
  async initializeModuleContent(step) {
    const stepConfig = this.stepMap[step];
    if (!stepConfig) {
      this.error(`Configuração não encontrada para a etapa: ${step}`);
      return false;
    }

    try {
      this.log(`Iniciando inicialização do módulo: ${step}`);

      // 1. Aguardar que o conteúdo básico esteja disponível
      await this.waitForContent(stepConfig.contentReady);

      // 2. Executar a função de inicialização do módulo
      if (typeof window.initModule === 'function') {
        this.log(`Executando window.initModule() para: ${step}`);
        await window.initModule();
      } else {
        this.log(`window.initModule não encontrada para: ${step}`);
      }

      // 3. Aguardar inicialização específica do módulo
      await this.waitForModuleInit(step);

      // 4. Restaurar dados salvos
      await this.restoreFormData(step);

      // 5. Aplicar validações e formatações
      await this.applyPostInitValidations(step);

      this.log(`Módulo ${step} inicializado com sucesso`);
      return true;

    } catch (error) {
      this.error(`Erro ao inicializar módulo ${step}:`, error);

      // Tentar novamente se não excedeu o máximo de tentativas
      if (this.state.retryCount < this.config.maxRetries) {
        this.state.retryCount++;
        this.log(`Tentativa ${this.state.retryCount} de ${this.config.maxRetries} para ${step}`);

        await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
        return this.initializeModuleContent(step);
      }

      return false;
    }
  },

  /**
   * Aguarda que o conteúdo básico esteja disponível
   */
  async waitForContent(contentChecker, timeout = 3000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();

      const checkContent = () => {
        if (typeof contentChecker === 'function' && contentChecker()) {
          resolve(true);
        } else if (Date.now() - startTime > timeout) {
          reject(new Error('Timeout aguardando conteúdo estar disponível'));
        } else {
          setTimeout(checkContent, 50);
        }
      };

      checkContent();
    });
  },

  /**
   * Aguarda inicialização específica do módulo
   */
  async waitForModuleInit(step) {
    // Aguardar um tempo mínimo para garantir que elementos dinâmicos foram criados
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verificações específicas por módulo
    switch (step) {      case 'incapacity':
        // Aguardar sistema CID estar disponível (apenas se não foi inicializado)
        if (typeof window.initCidSystem === 'function' && !window.cidSystemInitialized) {
          this.log('Inicializando sistema CID...');
          await window.initCidSystem();
        } else if (window.cidSystemInitialized) {
          this.log('Sistema CID já inicializado, pulando...');
        }
        break;

      case 'social':
        // Aguardar assistido estar inicializado
        if (typeof window.inicializarAssistido === 'function') {
          this.log('Inicializando dados do assistido...');
          await window.inicializarAssistido();
        }
        break;

      case 'professional':
        // Aguardar sistema de atividades estar pronto
        if (typeof window.addAtividade === 'function') {
          this.log('Sistema de atividades profissionais pronto');
        }
        break;
    }
  },

  /**
   * Restaura dados do formulário para a etapa atual
   */
  async restoreFormData(step) {
    try {
      if (window.formStateManager && typeof window.formStateManager.ensureFormAndRestore === 'function') {
        this.log(`Restaurando dados para etapa: ${step}`);
        await window.formStateManager.ensureFormAndRestore(step);
        this.log('Dados restaurados com sucesso');
      }
    } catch (error) {
      this.error('Erro ao restaurar dados:', error);
    }
  },

  /**
   * Aplica validações e formatações pós-inicialização
   */
  async applyPostInitValidations(step) {
    try {
      // Aguardar um pouco para garantir que elementos estão no DOM
      await new Promise(resolve => setTimeout(resolve, 200));

      switch (step) {
        case 'personal':
          this.log('Aplicando validações para dados pessoais...');
          document.querySelectorAll('input[name="autor_cpf[]"]').forEach(input => {
            if (typeof validateCPF === 'function') validateCPF(input);
          });
          document.querySelectorAll('input[name="autor_nascimento[]"]').forEach(input => {
            if (typeof validateDateOfBirth === 'function') validateDateOfBirth(input);
          });
          document.querySelectorAll('input[name="autor_nome[]"], input[name="autor_apelido[]"]').forEach(input => {
            if (typeof formatarNomeProprio === 'function') formatarNomeProprio(input);
          });
          break;

        case 'social':
          this.log('Aplicando validações para dados sociais...');
          document.querySelectorAll('input[name="familiar_nome[]"]').forEach(input => {
            if (typeof formatarNomeProprio === 'function') formatarNomeProprio(input);
          });
          document.querySelectorAll('input[name="familiar_cpf[]"]').forEach(input => {
            if (typeof maskCPF === 'function') maskCPF(input);
          });
          break;

        case 'incapacity':
          this.log('Aplicando validações para incapacidades...');
          document.querySelectorAll('.doenca-input').forEach(input => {
            if (typeof verificarIsencaoCarencia === 'function') verificarIsencaoCarencia(input);
          });
          break;
      }

      // Aplicar destaque em campos preenchidos
      if (typeof destacarCamposPreenchidos === 'function') {
        destacarCamposPreenchidos();
      }

    } catch (error) {
      this.error('Erro ao aplicar validações pós-inicialização:', error);
    }
  },  /**
   * Navega para uma etapa específica de forma segura
   *
   * FLUXO DE INTEGRAÇÃO COM ROUTER.JS:
   * 1. Verifica o estado atual da navegação (bloqueios, validações)
   * 2. Inicia o feedback visual (botões, barra de progresso)
   * 3. Salva os dados do formulário atual
   * 4. Delega para router.js através de navigateToLegacy
   * 5. Retorna o resultado da navegação
   *
   * @param {string} targetStep - O ID da etapa de destino
   * @param {HTMLElement} sourceButton - O botão que iniciou a navegação (opcional)
   * @returns {Promise<boolean>} - Sucesso ou falha da navegação
   */
  async navigateToStep(targetStep, sourceButton = null) {
    // Verificar se já está navegando
    if (this.state.isNavigating) {
      this.log('Navegação já em andamento, ignorando...');
      return false;
    }

    // Verificar se a etapa é válida
    if (!this.isValidStep(targetStep)) {
      this.error(`Etapa inválida: ${targetStep}`);
      return false;
    }

    try {
      this.state.isNavigating = true;
      this.state.retryCount = 0;
      this.log(`Iniciando navegação para: ${targetStep}`);

      // Aplicar feedback visual no botão
      this.setButtonLoadingState(sourceButton, true);

      // Capturar e salvar dados antes da navegação
      await this.captureAndSaveCurrentFormData();

      // Aguardar processamento
      await new Promise(resolve => setTimeout(resolve, this.config.navigationDelay));

      // Sistema de navegação simplificado
      let navigationSuccess = false;

      // Usar sistema legado se disponível
      if (typeof navigateToLegacy === 'function') {
        this.log(`Usando navigateToLegacy para: ${targetStep}`);
        navigationSuccess = navigateToLegacy(targetStep);
      }
      // Último recurso: navegação manual
      else {
        this.log(`Usando navegação manual para: ${targetStep}`);
        navigationSuccess = await this.manualNavigation(targetStep);
      }

      if (!navigationSuccess) {
        throw new Error(`Falha na navegação para ${targetStep}`);
      }

      this.log(`Navegação para ${targetStep} concluída com sucesso`);
      return true;

    } catch (error) {
      this.error('Erro durante navegação:', error);
      return false;

    } finally {
      // Restaurar estado do botão
      setTimeout(() => {
        this.setButtonLoadingState(sourceButton, false);
        this.state.isNavigating = false;
      }, 500);
    }
  },

  /**
   * NOVO: Capturar e salvar dados do formulário atual
   */
  async captureAndSaveCurrentFormData() {
    try {
      // Usar FormStateManager se disponível
      if (window.formStateManager && typeof window.formStateManager.captureCurrentFormData === 'function') {
        this.log('Capturando dados via FormStateManager...');
        await window.formStateManager.captureCurrentFormData();
        await window.formStateManager.saveStateImmediately();
        this.log('Dados capturados e salvos via FormStateManager');
        return;
      }

      // Fallback: captura manual básica
      this.log('Capturando dados manualmente...');
      const formData = {};
      const formElements = document.querySelectorAll('input, select, textarea');

      for (const element of formElements) {
        if (element.name || element.id) {
          const key = element.name || element.id;
          const value = element.type === 'checkbox' ? element.checked : element.value;
          if (value !== null && value !== undefined && value !== '') {
            formData[key] = value;
          }
        }
      }

      // Salvar no localStorage
      const currentStep = this.getCurrentStep();
      if (currentStep) {
        localStorage.setItem(`fiap_form_data_${currentStep}`, JSON.stringify(formData));
        this.log(`Dados salvos manualmente para: ${currentStep}`);
      }

    } catch (error) {
      this.error('Erro ao capturar dados do formulário:', error);
    }
  },

  /**
   * NOVO: Navegação manual como último recurso
   */
  async manualNavigation(targetStep) {
    try {
      // Atualizar hash
      window.location.hash = targetStep;

      // Aguardar mudança
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verificar se mudou
      const currentHash = window.location.hash.substring(1);
      return currentHash === targetStep;

    } catch (error) {
      this.error('Erro na navegação manual:', error);
      return false;
    }
  },

  /**
   * Navega para a próxima etapa
   */
  async navigateNext(sourceButton = null) {
    const currentStep = this.getCurrentStep();
    const stepConfig = this.stepMap[currentStep];

    if (stepConfig && stepConfig.next) {
      return this.navigateToStep(stepConfig.next, sourceButton);
    } else {
      this.error('Não há próxima etapa disponível');
      return false;
    }
  },

  /**
   * Navega para a etapa anterior
   */
  async navigatePrevious(sourceButton = null) {
    const currentStep = this.getCurrentStep();
    const stepConfig = this.stepMap[currentStep];

    if (stepConfig && stepConfig.prev) {
      return this.navigateToStep(stepConfig.prev, sourceButton);
    } else {
      this.error('Não há etapa anterior disponível');
      return false;
    }
  },

  /**
   * Obtém a etapa atual
   */
  getCurrentStep() {
    // Tentar obter do hash da URL
    const hash = window.location.hash.substring(1);
    if (this.isValidStep(hash)) {
      return hash;
    }

    // Tentar obter do formStateManager
    if (window.formStateManager && window.formStateManager.currentStep) {
      return window.formStateManager.currentStep;
    }

    // Fallback para 'personal'
    return 'personal';
  },
  /**
   * Configura os botões de navegação de forma padronizada - CORREÇÃO CRÍTICA
   */
  setupNavigationButtons() {
    this.log('Configurando botões de navegação...');

    // CORREÇÃO: Usar sistema de event delegation para evitar duplicação
    const existingHandler = document._navigationButtonsConfigured;

    if (existingHandler) {
      this.log('Botões já configurados, pulando reconfiguração');
      return;
    }

    // Configurar event delegation no documento
    document.addEventListener('click', this.handleNavigationClick.bind(this));
    document._navigationButtonsConfigured = true;

    this.log('Event delegation para navegação configurado');
  },

  /**
   * NOVO: Handler unificado para clicks de navegação
   */
  async handleNavigationClick(e) {
    // Verificar se é um botão de navegação
    const target = e.target.closest('#btn-next, #btn-back');
    if (!target) return;

    e.preventDefault();
    e.stopPropagation();

    // Evitar múltiplos clicks
    if (this.state.isNavigating || target.disabled) return;

    const isNext = target.id === 'btn-next';

    try {
      this.setButtonLoadingState(target, true);

      if (isNext) {
        await this.navigateNext(target);
      } else {
        await this.navigatePrevious(target);
      }
    } finally {
      setTimeout(() => {
        this.setButtonLoadingState(target, false);
      }, 500);
    }
  },
  /**
   * Inicializa o sistema de navegação
   */
  init() {
    this.log('Inicializando sistema de navegação...');

    // Configurar botões sempre que uma nova página carregar
    document.addEventListener('DOMContentLoaded', () => {
      this.setupNavigationButtons();
    });

    // Reconfigurar botões após mudanças de rota
    document.addEventListener('stepChanged', (event) => {
      this.handleStepChangedEvent(event);
    });

    // Ouvir eventos de inicialização de módulo
    document.addEventListener('moduleInitialized', (event) => {
      this.handleModuleInitializedEvent(event);
    });

    // Ouvir eventos de sincronização de dados
    document.addEventListener('dataSynchronized', (event) => {
      this.handleDataSynchronizedEvent(event);
    });

    this.log('Sistema de navegação inicializado');
  },

  /**
   * NOVO: Manipulador do evento stepChanged
   * @param {Event} event - Evento disparado pelo router.js
   */
  handleStepChangedEvent(event) {
    const detail = event.detail || {};
    const route = detail.route;

    this.log(`Evento stepChanged recebido para rota: ${route}`);

    // Atualizar estado interno
    this.state.currentStep = route;

    // Reconfigurar botões
    setTimeout(() => this.setupNavigationButtons(), 100);

    // Atualizar botões de navegação conforme a etapa
    this.updateNavigationButtons(route);
  },

  /**
   * NOVO: Manipulador do evento moduleInitialized
   * @param {Event} event - Evento disparado após inicialização do módulo
   */
  handleModuleInitializedEvent(event) {
    const detail = event.detail || {};
    const module = detail.module;

    this.log(`Módulo inicializado: ${module}`);

    // Verificar se precisamos aplicar validações específicas
    if (this.state.currentStep) {
      this.applyPostInitValidations(this.state.currentStep);
    }
  },

  /**
   * NOVO: Manipulador do evento dataSynchronized
   * @param {Event} event - Evento disparado após sincronização de dados
   */
  handleDataSynchronizedEvent(event) {
    const detail = event.detail || {};

    this.log(`Dados sincronizados: ${detail.direction}`);

    // Podemos adicionar lógica adicional aqui se necessário
  },

  /**
   * NOVO: Atualiza botões de navegação baseado na etapa atual
   * @param {string} step - Etapa atual de navegação
   */
  updateNavigationButtons(step) {
    if (!step) return;

    const stepConfig = this.stepMap[step];
    if (!stepConfig) return;

    const btnNext = document.getElementById('btn-next');
    const btnBack = document.getElementById('btn-back');

    if (btnNext) {
      btnNext.disabled = !stepConfig.next;
      if (stepConfig.isFinalStep) {
        btnNext.textContent = 'Finalizar';
      } else {
        btnNext.textContent = 'Próximo';
      }
    }

    if (btnBack) {
      btnBack.disabled = !stepConfig.prev;
    }
  },
};

// Expor para o escopo global
window.Navigation = Navigation;
window.navigateToStep = Navigation.navigateToStep.bind(Navigation);
window.navigateNext = Navigation.navigateNext.bind(Navigation);
window.navigatePrevious = Navigation.navigatePrevious.bind(Navigation);

// Expor funções adicionais para integração com router.js
window.handleStepChangedEvent = Navigation.handleStepChangedEvent.bind(Navigation);
window.handleModuleInitializedEvent = Navigation.handleModuleInitializedEvent.bind(Navigation);
window.updateNavigationButtons = Navigation.updateNavigationButtons.bind(Navigation);

// Inicializar automaticamente
Navigation.init();

// Log de inicialização
console.log('[Navigation] Sistema de navegação padronizado carregado');
