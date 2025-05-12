/**
 * Gerenciador de Estado do Formulário
 * Mantém o estado do formulário durante navegação e refresh
 */

class FormStateManager {
  constructor() {
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
      this.initFormFromLocalStorage();
    });
  }

  /**
   * Configura listeners para eventos de navegação e unload
   */
  setupEventListeners() {
    // Salvar estado antes de fechar a página
    window.addEventListener('beforeunload', () => {
      this.captureCurrentFormData();
      this.saveToLocalStorage();
    });

    // Detectar cliques nos botões de navegação
    document.querySelectorAll('.step-link').forEach(link => {
      const originalClick = link.onclick;
      link.onclick = (e) => {
        // Capturar dados do formulário atual antes de navegar
        this.captureCurrentFormData();
        this.saveToLocalStorage();

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
        this.saveToLocalStorage();

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
    // Funções de navegação para próximo e anterior
    if (window.navigateToNextStep || window.navigateToPrevStep) {
      // Função para navegar para o próximo passo
      if (window.navigateToNextStep) {
        const originalNext = window.navigateToNextStep;
        window.navigateToNextStep = () => {
          // Capturar dados atuais
          this.captureCurrentFormData();
          this.saveToLocalStorage();

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
          // Capturar dados atuais
          this.captureCurrentFormData();
          this.saveToLocalStorage();

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

    // Adicionar listeners para botões de navegação internos
    document.addEventListener('click', (e) => {
      // Botão de próximo
      if (e.target.id === 'btn-next' || e.target.closest('#btn-next')) {
        this.captureCurrentFormData();
        this.saveToLocalStorage();
      }

      // Botão de anterior
      if (e.target.id === 'btn-back' || e.target.closest('#btn-back')) {
        this.captureCurrentFormData();
        this.saveToLocalStorage();
      }
    });
  }

  /**
   * Inicializa o formulário a partir do localStorage
   */
  initFormFromLocalStorage() {
    // Verificar se existe um ID de formulário no localStorage
    const formId = localStorage.getItem('formId');
    const formDataStr = localStorage.getItem('formData');

    if (formId && formDataStr) {
      try {
        // Restaurar dados do localStorage
        this.currentFormId = formId;
        this.formData = JSON.parse(formDataStr);
        this.currentStep = localStorage.getItem('currentStep') || 'personal';
        this.isInitialized = true;

        console.log('Formulário restaurado do localStorage:', formId);

        // Restaurar dados no formulário atual
        setTimeout(() => {
          const currentRoute = window.location.hash.substring(1) || 'personal';
          this.restoreFormData(currentRoute);
        }, 500);
      } catch (e) {
        console.error('Erro ao restaurar formulário do localStorage:', e);
        this.initNewForm();
      }
    } else {
      // Inicializar novo formulário
      this.initNewForm();
    }
  }

  /**
   * Inicializa um novo formulário
   */
  initNewForm() {
    // Gerar ID único para o formulário
    this.currentFormId = 'form_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    this.formData = {
      personal: {},
      social: {},
      incapacity: {},
      professional: {},
      documents: {}
    };
    this.currentStep = window.location.hash.substring(1) || 'personal';
    this.isInitialized = true;

    localStorage.setItem('formId', this.currentFormId);
    localStorage.setItem('currentStep', this.currentStep);
    localStorage.setItem('formData', JSON.stringify(this.formData));

    console.log('Novo formulário inicializado:', this.currentFormId);
  }

  /**
   * Captura os dados do formulário atual
   */
  captureCurrentFormData() {
    if (!this.isInitialized) return;

    const currentRoute = window.location.hash.substring(1) || 'personal';
    const form = document.querySelector('form');
    if (!form) return;

    // Capturar dados do formulário
    const formData = {};

    // Processar todos os inputs, selects e textareas
    form.querySelectorAll('input, select, textarea').forEach(input => {
      if (input.name) {
        if (input.type === 'checkbox') {
          formData[input.name] = input.checked ? 'true' : 'false';
        } else if (input.type === 'radio') {
          if (input.checked) {
            formData[input.name] = input.value;
          }
        } else {
          formData[input.name] = input.value;
        }
      } else if (input.id) {
        if (input.type === 'checkbox') {
          formData[input.id] = input.checked ? 'true' : 'false';
        } else if (input.type === 'radio') {
          if (input.checked) {
            formData[input.id] = input.value;
          }
        } else {
          formData[input.id] = input.value;
        }
      }
    });

    // Capturar CIDs se estiver na página de incapacidade
    if (currentRoute === 'incapacity') {
      document.querySelectorAll('.cid-input').forEach(input => {
        const index = input.getAttribute('data-index');
        if (index) {
          const doencaInput = document.getElementById(`doenca${index}`);
          formData[`cid${index}`] = input.value;
          if (doencaInput) {
            formData[`doenca${index}`] = doencaInput.value;
          }
        }
      });
    }

    // Adicionar timestamp para controle
    formData._timestamp = Date.now();

    // Atualizar o objeto de dados
    this.formData[currentRoute] = formData;
    console.log(`Dados capturados da página ${currentRoute}:`, formData);
  }

  /**
   * Salva os dados no localStorage
   */
  saveToLocalStorage() {
    if (!this.isInitialized) return;

    localStorage.setItem('formId', this.currentFormId);
    localStorage.setItem('currentStep', this.currentStep);
    localStorage.setItem('formData', JSON.stringify(this.formData));

    console.log('Dados salvos no localStorage com sucesso');
  }

  /**
   * Restaura os dados do formulário para o passo atual
   */
  restoreFormData(step) {
    if (!this.isInitialized || !this.formData[step]) return;

    const form = document.querySelector('form');
    if (!form) return;

    const data = this.formData[step];

    console.log(`Restaurando dados para ${step}:`, data);

    // Restaurar dados para cada campo
    Object.entries(data).forEach(([key, value]) => {
      // Ignorar campos internos que começam com _
      if (key.startsWith('_')) return;

      // Tentar encontrar o campo pelo name ou id
      const field = form.querySelector(`[name="${key}"]`) || form.querySelector(`#${key}`);

      if (field) {
        if (field.type === 'checkbox') {
          field.checked = value === 'true';
        } else if (field.type === 'radio') {
          const radio = form.querySelector(`[name="${key}"][value="${value}"]`) ||
                      form.querySelector(`#${key}[value="${value}"]`);
          if (radio) radio.checked = true;
        } else {
          field.value = value;
        }

        // Marcar o campo como preenchido
        field.classList.add('filled');

        // Disparar eventos para atualizar UI
        field.dispatchEvent(new Event('change', { bubbles: true }));
        field.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });

    // Processamento especial para CIDs
    if (step === 'incapacity') {
      const cidPattern = /^cid(\d+)$/;
      const doencaPattern = /^doenca(\d+)$/;

      Object.entries(data).forEach(([key, value]) => {
        // Verificar se é um campo CID
        const cidMatch = key.match(cidPattern);
        if (cidMatch && cidMatch[1]) {
          const index = cidMatch[1];
          const cidInput = document.getElementById(`cid${index}`);
          const doencaInput = document.getElementById(`doenca${index}`);

          if (cidInput && value) {
            cidInput.value = value;
            cidInput.classList.add('filled');
            cidInput.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }

        // Verificar se é um campo doença
        const doencaMatch = key.match(doencaPattern);
        if (doencaMatch && doencaMatch[1]) {
          const index = doencaMatch[1];
          const doencaInput = document.getElementById(`doenca${index}`);

          if (doencaInput && value) {
            doencaInput.value = value;
            doencaInput.classList.add('filled');
            doencaInput.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }
      });
    }
  }

  /**
   * Limpa o estado atual do formulário
   */
  clearState() {
    this.formData = {
      personal: {},
      social: {},
      incapacity: {},
      professional: {},
      documents: {}
    };

    localStorage.removeItem('formData');

    this.initNewForm();
    console.log('Estado do formulário limpo com sucesso');
  }
}

// Instância global
window.formStateManager = new FormStateManager();

// Injetar correção para garantir restauração após carregamento de módulo
document.addEventListener('DOMContentLoaded', function() {
  // Sobreescrevendo a função de carregamento de módulo para restaurar o estado
  const originalLoadModuleWithTemplate = window.loadModuleWithTemplate;

  if (originalLoadModuleWithTemplate) {
    window.loadModuleWithTemplate = async function(route) {
      // Chamar a função original
      await originalLoadModuleWithTemplate(route);

      // Após carregar o módulo, restaurar os dados
      const currentStep = route.scriptUrl.split('/').pop().replace('.js', '');

      setTimeout(() => {
        if (window.formStateManager) {
          window.formStateManager.currentStep = currentStep;
          window.formStateManager.restoreFormData(currentStep);
        }
      }, 500);
    };
  }
});
