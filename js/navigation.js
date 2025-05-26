/**
 * Sistema de Navegação Padronizado e Seguro
 *
 * Implementa um sistema robusto de navegação entre páginas com:
 * - Proteção contra travamentos e falhas
 * - Inicialização controlada dos módulos
 * - Feedback visual consistente
 * - Salvamento automático de dados
 * - Retry automático em caso de falhas
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

  // Mapeamento de etapas e módulos
  stepMap: {
    'personal': {
      index: 1,
      next: 'social',
      prev: null,
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
      contentReady: () => document.getElementById('documentos-list')
    }
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
  },

  /**
   * Navega para uma etapa específica de forma segura
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

      // Salvar dados do formulário atual
      await this.saveCurrentFormData();

      // Aguardar um pouco para garantir que o salvamento foi processado
      await new Promise(resolve => setTimeout(resolve, this.config.navigationDelay));

      // Navegar usando o sistema de roteamento existente
      if (typeof navigateTo === 'function') {
        this.log(`Chamando navigateTo('${targetStep}')`);
        await navigateTo(targetStep);

        // Aguardar a inicialização do novo módulo
        await this.initializeModuleContent(targetStep);

        this.state.currentStep = targetStep;
        this.log(`Navegação para ${targetStep} concluída com sucesso`);
        return true;

      } else {
        throw new Error('Função navigateTo não encontrada');
      }

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
   * Configura os botões de navegação de forma padronizada
   */
  setupNavigationButtons() {
    this.log('Configurando botões de navegação...');

    // Configurar botão "Próximo"
    const nextButton = document.getElementById('btn-next');
    if (nextButton) {
      // Remover eventos existentes
      const newNextBtn = nextButton.cloneNode(true);
      nextButton.parentNode.replaceChild(newNextBtn, nextButton);

      // Aplicar estilos
      if (window.tw && typeof window.tw.applyTo === 'function') {
        window.tw.applyTo(newNextBtn, 'button.primary');
      }

      // Adicionar evento
      newNextBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await this.navigateNext(newNextBtn);
      });

      this.log('Botão "Próximo" configurado');
    }

    // Configurar botão "Voltar"
    const backButton = document.getElementById('btn-back');
    if (backButton) {
      // Remover eventos existentes
      const newBackBtn = backButton.cloneNode(true);
      backButton.parentNode.replaceChild(newBackBtn, backButton);

      // Aplicar estilos
      if (window.tw && typeof window.tw.applyTo === 'function') {
        window.tw.applyTo(newBackBtn, 'button.secondary');
      }

      // Adicionar evento
      newBackBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await this.navigatePrevious(newBackBtn);
      });

      this.log('Botão "Voltar" configurado');
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
    document.addEventListener('stepChanged', () => {
      setTimeout(() => this.setupNavigationButtons(), 100);
    });

    this.log('Sistema de navegação inicializado');
  }
};

// Expor para o escopo global
window.Navigation = Navigation;
window.navigateToStep = Navigation.navigateToStep.bind(Navigation);
window.navigateNext = Navigation.navigateNext.bind(Navigation);
window.navigatePrevious = Navigation.navigatePrevious.bind(Navigation);

// Inicializar automaticamente
Navigation.init();

// Log de inicialização
console.log('[Navigation] Sistema de navegação padronizado carregado');
