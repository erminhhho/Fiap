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
    if (this.isInitialized) {
      console.log('[FormStateManager] Já inicializado, pulando init.');
      return;
    }

    const savedState = FIAP.cache.get('formStateManagerData');
    if (savedState) {
      console.log('[FormStateManager] Estado encontrado no cache, restaurando:', savedState);
      this.formData = savedState.formData || this.formData; // Garante que formData não seja undefined
      this.currentStep = savedState.currentStep;
    } else {
      console.log('[FormStateManager] Nenhum estado salvo encontrado no cache.');
    }

    this.currentStep = this.currentStep || (window.location.hash ? window.location.hash.substring(1) : 'personal');
    console.log('[FormStateManager] Etapa atual definida como:', this.currentStep);

    this.restoreFormData(this.currentStep);
    this.isInitialized = true;
    console.log('[FormStateManager] Inicialização completa.');
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

    const currentRoute = window.location.hash.substring(1) || this.currentStep || 'personal';
    console.log(`[FormStateManager] Capturando dados para a rota: ${currentRoute}`);
    const form = document.querySelector('form');
    if (!form) return;

    // Capturar dados do formulário
    const formData = {};

    // Processar todos os inputs, selects e textareas
    form.querySelectorAll('input, select, textarea').forEach(input => {
      let value = input.value;
      let key = input.name || input.id;

      if (!key) return; // Pular se não houver nome ou id

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
        if (!formData[baseKey]) {
          formData[baseKey] = [];
        }
        formData[baseKey].push(value);
      } else {
        formData[key] = value;
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

    console.log('[FormStateManager] Dados do formulário coletados:', JSON.parse(JSON.stringify(formData)));

    if (this.formData[currentRoute]) {
      Object.assign(this.formData[currentRoute], formData);
      console.log(`[FormStateManager] Dados mesclados em this.formData[${currentRoute}]:`, JSON.parse(JSON.stringify(this.formData[currentRoute])));
    } else {
      this.formData[currentRoute] = formData;
      console.log(`[FormStateManager] Dados atribuídos a this.formData[${currentRoute}]:`, JSON.parse(JSON.stringify(this.formData[currentRoute])));
    }

    FIAP.cache.set('formStateManagerData', { formData: this.formData, currentStep: this.currentStep });
    console.log('[FormStateManager] Estado salvo no cache.', JSON.parse(JSON.stringify(this.formData)));
  }

  /**
   * Restaura os dados do formulário para o passo atual
   */
  restoreFormData(step) {
    console.log(`[FormStateManager] restoreFormData() chamado para a etapa: ${step}`);
    if (!step) {
      console.warn('[FormStateManager] Etapa não fornecida para restauração, usando currentStep:', this.currentStep);
      step = this.currentStep;
      if (!step) {
        console.error('[FormStateManager] Nenhuma etapa definida para restauração.');
        return;
      }
    }

    const stepData = this.formData[step];
    console.log(`[FormStateManager] Tentando restaurar dados para a etapa ${step}. Dados disponíveis:`, stepData ? JSON.parse(JSON.stringify(stepData)) : 'Nenhum');

    if (stepData) {
      const form = document.querySelector('form');
      if (!form) return;

      // Restaurar dados para cada campo
      const elements = form.querySelectorAll('input, select, textarea');
      elements.forEach(element => {
        const keyToUse = element.name || element.id;
        if (stepData.hasOwnProperty(keyToUse)) {
          let valueToRestore = stepData[keyToUse];

          if (element.type === 'checkbox') {
            element.checked = typeof valueToRestore === 'boolean' ? valueToRestore : valueToRestore === 'true';
            console.log(`[FormStateManager] Restaurando checkbox ${keyToUse}: ${element.checked}`);
          } else if (element.type === 'radio') {
            // Para radio, precisamos encontrar o específico com o valor correto
            // (Esta parte da lógica do state-fix para radio é mais robusta se houver múltiplos radios com o mesmo nome mas IDs diferentes)
            let foundRadio = false;
            const radiosWithName = form.querySelectorAll(`input[type="radio"][name="${element.name}"]`);
            for (let i = 0; i < radiosWithName.length; i++) {
              if (radiosWithName[i].value === String(valueToRestore)) { // Comparar como string
                radiosWithName[i].checked = true;
                foundRadio = true;
                break;
              }
            }
            // Fallback se não encontrar por nome e valor, tentar por ID (se o campo original tinha ID)
            if (!foundRadio && element.id === keyToUse) {
               const radioById = form.querySelector(`input[type="radio"]#${CSS.escape(keyToUse)}[value="${CSS.escape(String(valueToRestore))}"]`);
               if (radioById) radioById.checked = true;
            }

          } else if (element.type === 'select-multiple') {
            if (Array.isArray(valueToRestore)) {
              Array.from(element.options).forEach(option => {
                option.selected = valueToRestore.includes(option.value);
              });
              console.log(`[FormStateManager] Restaurando select-multiple ${keyToUse}:`, valueToRestore);
            }
          } else {
            element.value = valueToRestore;
            console.log(`[FormStateManager] Restaurando campo ${keyToUse} com valor: ${valueToRestore}`);
          }
          // Atualizar visual de campos preenchidos, se a função existir
          if (typeof destacarCampoPreenchido === 'function') {
            destacarCampoPreenchido(element);
          }
        } else {
          // Limpar campos que não estão nos dados salvos, exceto se forem botões ou hidden
          if (element.type !== 'submit' && element.type !== 'button' && element.type !== 'hidden' && !element.classList.contains('no-auto-clear')) {
            if (element.type === 'checkbox' || element.type === 'radio') {
              element.checked = false;
            } else {
              element.value = '';
            }
          }
        }
      });

      // Processamento especial para CIDs
      if (step === 'incapacity') {
        const cidPattern = /^cid(\d+)$/;
        const doencaPattern = /^doenca(\d+)$/;

        Object.entries(stepData).forEach(([key, value]) => {
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
  }

  /**
   * Limpa o estado atual do formulário
   */
  clearState() {
    console.log('[FormStateManager] clearState() chamado.');
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
    this.restoreFormData(this.currentStep || 'personal');
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
