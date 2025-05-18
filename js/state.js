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
    });
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
    // Implementar proteção contra chamadas repetidas
    const now = Date.now();
    if (this._lastCapture && (now - this._lastCapture < 1000)) {
      console.log(`Captura ignorada - última captura há ${now - this._lastCapture}ms`);
      return;
    }

    this._lastCapture = now;

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

      try {
        // Verificar se o key contém colchetes [] que tornariam o seletor inválido
        if (key.includes('[') || key.includes(']')) {
          // Campos com colchetes requerem tratamento especial
          // Ao invés de usar querySelector, tentamos encontrar o elemento por iteração
          const allInputs = form.querySelectorAll('input, select, textarea');
          let field = null;

          // Procura o campo pelo name exato ou id exato
          for (let i = 0; i < allInputs.length; i++) {
            if (allInputs[i].name === key || allInputs[i].id === key) {
              field = allInputs[i];
              break;
            }
          }

          if (field) {
            if (field.type === 'checkbox') {
              field.checked = value === 'true';
            } else if (field.type === 'radio') {
              // Para radio, precisamos encontrar o específico com o valor correto
              // (Esta parte da lógica do state-fix para radio é mais robusta se houver múltiplos radios com o mesmo nome mas IDs diferentes)
              let foundRadio = false;
              const radiosWithName = form.querySelectorAll(`input[type="radio"][name="${field.name}"]`);
              for (let i = 0; i < radiosWithName.length; i++) {
                if (radiosWithName[i].value === String(value)) { // Comparar como string
                  radiosWithName[i].checked = true;
                  foundRadio = true;
                  break;
                }
              }
              // Fallback se não encontrar por nome e valor, tentar por ID (se o campo original tinha ID)
              if (!foundRadio && field.id === key) {
                 const radioById = form.querySelector(`input[type="radio"]#${CSS.escape(key)}[value="${CSS.escape(String(value))}"]`);
                 if (radioById) radioById.checked = true;
              }

            } else {
              field.value = value;
            }

            // Marcar o campo como preenchido
            field.classList.add('filled');

            // Verificar se o campo não deve receber eventos de máscara
            if (field.type !== 'hidden' && !field.hasAttribute('data-no-mask')) {
              // Disparar eventos para atualizar UI apenas para campos não hidden
              try {
                field.dispatchEvent(new Event('change', { bubbles: true }));
                field.dispatchEvent(new Event('input', { bubbles: true }));
              } catch (e) {
                console.debug(`Erro ao disparar eventos para o campo ${key}:`, e.message);
              }
            }
          }
        } else {
          // Caminho normal - tentar encontrar o campo pelo name ou id (seletor CSS normal)
          const field = form.querySelector(`[name="${CSS.escape(key)}"]`) || form.querySelector(`#${CSS.escape(key)}`);

          if (field) {
            if (field.type === 'checkbox') {
              field.checked = value === 'true';
            } else if (field.type === 'radio') {
              // Usar CSS.escape para os valores no seletor de atributo
              const radio = form.querySelector(`[name="${CSS.escape(key)}"][value="${CSS.escape(String(value))}"]`) ||
                          form.querySelector(`#${CSS.escape(key)}[value="${CSS.escape(String(value))}"]`);
              if (radio) radio.checked = true;
            } else {
              field.value = value;
            }

            // Marcar o campo como preenchido
            field.classList.add('filled');

            // Verificar se o campo não deve receber eventos de máscara
            if (field.type !== 'hidden' && !field.hasAttribute('data-no-mask')) {
              // Disparar eventos para atualizar UI apenas para campos não hidden
              try {
                field.dispatchEvent(new Event('change', { bubbles: true }));
                field.dispatchEvent(new Event('input', { bubbles: true }));
              } catch (e) {
                console.debug(`Erro ao disparar eventos para o campo ${key}:`, e.message);
              }
            }
          }
        }
      } catch (error) {
        console.warn(`Erro ao processar o campo ${key}:`, error);
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
    // Limpar ID do formulário e dados em memória
    this.currentFormId = null;
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

    // Se houver sistema de UI, atualizar
    // ... existing code ...
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
