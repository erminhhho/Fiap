/**
 * FIAP - Sistema de persistência simplificado
 * Integrado com sistema existente e pronto para uso
 */

// Namespace global para expor funções públicas
window.FIAP = window.FIAP || {};
window.FIAP.storage = {};

/**
 * Sistema unificado de armazenamento e persistência
 */
(function() {
  // Configurações
  const CONFIG = {
    storageKey: 'fiap_form_data',
    autoSaveDelay: 800,
    debug: false,
    notificationDuration: 2000,
    createSaveIndicator: true
  };

  // Cache de dados em memória
  let dataCache = {};
  let autoSaveTimer = null;
  let initialized = false;
  let saveIndicator = null;

  /**
   * Inicializa o sistema de persistência
   */
  function init() {
    if (initialized) return;

    // Carregar dados salvos
    loadFromStorage();

    // Criar indicador de salvamento se configurado
    if (CONFIG.createSaveIndicator) {
      createSaveIndicator();
    }

    // Conectar eventos para salvamento automático
    setupAutoSave();

    log('Sistema de persistência inicializado');
    initialized = true;

    // Disparar evento de inicialização
    document.dispatchEvent(new CustomEvent('storage:ready'));
  }

  /**
   * Cria indicador visual de salvamento
   */
  function createSaveIndicator() {
    // Verificar se já existe
    saveIndicator = document.querySelector('.save-indicator');
    if (saveIndicator) return;

    // Criar elemento do zero
    saveIndicator = document.createElement('div');
    saveIndicator.className = 'save-indicator';
    saveIndicator.textContent = 'Dados salvos';
    saveIndicator.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background-color: rgba(0, 0, 0, 0.7);
      color: white;
      border-radius: 20px;
      padding: 6px 12px;
      font-size: 12px;
      opacity: 0;
      transform: translateY(10px);
      transition: opacity 0.3s ease, transform 0.3s ease;
      z-index: 9990;
    `;

    // Adicionar ícone de check
    const checkIcon = document.createElement('span');
    checkIcon.textContent = '✓ ';
    saveIndicator.prepend(checkIcon);

    document.body.appendChild(saveIndicator);
  }

  /**
   * Mostra o indicador de salvamento
   */
  function showSaveIndicator() {
    if (!saveIndicator) return;

    // Adicionar classe ou estilo de ativo
    saveIndicator.style.opacity = '1';
    saveIndicator.style.transform = 'translateY(0)';

    // Esconder após alguns segundos
    setTimeout(() => {
      saveIndicator.style.opacity = '0';
      saveIndicator.style.transform = 'translateY(10px)';
    }, CONFIG.notificationDuration);
  }

  /**
   * Configura salvamento automático em mudanças de formulário
   */
  function setupAutoSave() {
    // Salvar antes de fechar a página
    window.addEventListener('beforeunload', () => {
      saveToStorage();
    });

    // Salvar ao mudar de página
    window.addEventListener('hashchange', () => {
      saveToStorage();
    });

    // Conectar com router existente se disponível
    if (typeof navigateTo === 'function') {
      const originalNavigate = window.navigateTo;
      window.navigateTo = function(route) {
        saveToStorage();
        return originalNavigate.apply(this, arguments);
      };
    }

    // Escutar eventos de formulário
    document.addEventListener('input', debounce(event => {
      if (event.target.form) {
        const formId = event.target.form.id || 'default_form';
        const formData = collectFormData(event.target.form);
        setData(formId, formData);
      }
    }, CONFIG.autoSaveDelay));
  }

  /**
   * Coleta dados de um formulário
   */
  function collectFormData(form) {
    if (!form) return {};

    const data = {};
    const elements = form.elements;

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      if (!element.name) continue;

      switch (element.type) {
        case 'checkbox':
          data[element.name] = element.checked;
          break;
        case 'radio':
          if (element.checked) {
            data[element.name] = element.value;
          }
          break;
        case 'select-multiple':
          const selectedOptions = Array.from(element.selectedOptions).map(option => option.value);
          data[element.name] = selectedOptions;
          break;
        case 'file':
          // Arquivos não são armazenados
          break;
        default:
          data[element.name] = element.value;
      }
    }

    return data;
  }

  /**
   * Preenche um formulário com dados
   */
  function populateForm(form, data) {
    if (!form || !data) return;

    Object.keys(data).forEach(key => {
      const elements = form.elements[key];
      if (!elements) return;

      // Converter para array para lidar com radio/checkbox groups
      const fieldElements = elements.length ? Array.from(elements) : [elements];

      fieldElements.forEach(element => {
        switch (element.type) {
          case 'checkbox':
            element.checked = !!data[key];
            break;
          case 'radio':
            element.checked = (element.value === data[key]);
            break;
          case 'select-multiple':
            if (Array.isArray(data[key])) {
              for (let i = 0; i < element.options.length; i++) {
                element.options[i].selected = data[key].includes(element.options[i].value);
              }
            }
            break;
          case 'file':
            // Não podemos restaurar arquivos
            break;
          default:
            element.value = data[key] || '';
        }

        // Disparar evento de mudança para triggers
        try {
          const event = new Event('change', { bubbles: true });
          element.dispatchEvent(event);
        } catch (e) {
          // Alguns navegadores antigos podem não suportar isso
        }
      });
    });
  }

  /**
   * Mostra uma notificação temporária para o usuário
   */
  function showNotification(message, type = 'info') {
    // Verificar se o sistema existente tem função de notificação
    if (typeof window.FIAP.showMessage === 'function') {
      try {
        window.FIAP.showMessage(message, type);
        return;
      } catch (e) {
        console.warn('Erro ao usar notificação do sistema existente:', e);
      }
    }

    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      padding: 12px 16px;
      border-radius: 6px;
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
      background-color: #ffffff;
      color: #333;
      font-size: 14px;
      line-height: 1.4;
      opacity: 1;
      transform: translateX(0);
      transition: transform 0.3s ease, opacity 0.3s ease;
      max-width: 300px;
      border-left: 4px solid #666;
    `;

    // Estilizar por tipo
    switch (type) {
      case 'success':
        notification.style.borderLeftColor = '#4CAF50';
        notification.style.backgroundColor = '#E8F5E9';
        break;
      case 'warning':
        notification.style.borderLeftColor = '#FF9800';
        notification.style.backgroundColor = '#FFF3E0';
        break;
      case 'error':
        notification.style.borderLeftColor = '#F44336';
        notification.style.backgroundColor = '#FFEBEE';
        break;
      default: // info
        notification.style.borderLeftColor = '#2196F3';
        notification.style.backgroundColor = '#E3F2FD';
    }

    document.body.appendChild(notification);

    // Remover após alguns segundos
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  /**
   * Armazena dados para uma coleção específica
   */
  function setData(collection, data) {
    if (!collection) return false;

    // Evitar referências de objeto
    dataCache[collection] = JSON.parse(JSON.stringify(data || {}));

    // Agendar salvamento automático
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
      saveToStorage();
    }, CONFIG.autoSaveDelay);

    return true;
  }

  /**
   * Recupera dados de uma coleção específica
   */
  function getData(collection) {
    if (!collection) return null;

    // Carregar se o cache estiver vazio
    if (Object.keys(dataCache).length === 0) {
      loadFromStorage();
    }

    return dataCache[collection] || null;
  }

  /**
   * Salva todos os dados no localStorage
   */
  function saveToStorage() {
    try {
      localStorage.setItem(CONFIG.storageKey, JSON.stringify(dataCache));
      log('Dados salvos com sucesso');

      // Mostrar feedback visual
      showSaveIndicator();

      // Notificar aplicação
      document.dispatchEvent(new CustomEvent('storage:saved', {
        detail: { data: dataCache }
      }));

      return true;
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      handleStorageError(error);
      return false;
    }
  }

  /**
   * Carrega todos os dados do localStorage
   */
  function loadFromStorage() {
    try {
      const saved = localStorage.getItem(CONFIG.storageKey);
      if (saved) {
        dataCache = JSON.parse(saved);
        log('Dados carregados com sucesso');
      }
      return true;
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      dataCache = {};
      return false;
    }
  }

  /**
   * Restaura dados para um formulário específico
   */
  function restoreForm(formId, form) {
    if (!formId || !form) return false;

    const data = getData(formId);
    if (!data) return false;

    populateForm(form, data);
    log(`Formulário ${formId} restaurado com ${Object.keys(data).length} campos`);

    return true;
  }

  /**
   * Trata erros de armazenamento
   */
  function handleStorageError(error) {
    // Verificar se é erro de cota excedida
    if (error.name === 'QuotaExceededError' || error.code === 22) {
      clearOldData();

      // Tenta salvar novamente após limpar
      saveToStorage();

      // Notificar usuário
      showNotification('Armazenamento cheio! Alguns dados antigos foram removidos.', 'warning');
    }
  }

  /**
   * Limpa dados antigos em caso de memória cheia
   */
  function clearOldData() {
    console.warn('Armazenamento cheio. Limpando dados antigos...');

    // Abordagem simples: remover dados que não sejam do formulário atual
    const currentPage = window.location.hash.replace('#', '') || 'home';

    Object.keys(dataCache).forEach(key => {
      if (key !== currentPage && key !== 'global') {
        delete dataCache[key];
      }
    });
  }

  /**
   * Limita a frequência de chamadas de função
   */
  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  /**
   * Registra mensagens de debug se ativado
   */
  function log(message) {
    if (CONFIG.debug) {
      console.log(`[Storage] ${message}`);
    }
  }

  /**
   * Ativa modo de debug
   */
  function enableDebug() {
    CONFIG.debug = true;
    log('Modo debug ativado');
    return true;
  }

  // API pública
  window.FIAP.storage = {
    init,
    getData,
    setData,
    saveNow: saveToStorage,
    restore: restoreForm,
    collectFormData,
    showNotification,
    enableDebug
  };

  // Inicialização automática
  document.addEventListener('DOMContentLoaded', init);
})();

// Compatibilidade com sistema existente
if (typeof FormStateManager !== 'undefined') {
  // Interceptar restauração de formulário para backup
  const originalRestore = FormStateManager.prototype.restoreFormData;
  if (originalRestore) {
    FormStateManager.prototype.restoreFormData = function(formName) {
      // Chamar método original primeiro
      const result = originalRestore.apply(this, arguments);

      // Fazer backup no nosso sistema
      if (formName && this.formData[formName]) {
        window.FIAP.storage.setData(formName, this.formData[formName]);
      }

      return result;
    };
  }
}

// Compatibilidade com persistence.js (substituindo completamente)
// Criar namespace para manter APIs antigas
window.FIAP.persistence = {
  // Compatibilidade com funções antigas
  saveForm: function(formId, data) {
    return window.FIAP.storage.setData(formId, data || {});
  },

  loadForm: function(formId) {
    return window.FIAP.storage.getData(formId);
  },

  deleteForm: function(formId) {
    const data = window.FIAP.storage.getData(formId);
    if (data) {
      window.FIAP.storage.setData(formId, null);
      return true;
    }
    return false;
  },

  // Emular API IndexedDB/WebSQL
  openDatabase: function(formId) {
    console.log('[Storage] Emulando IndexedDB para compatibilidade');
    return this._mockDB;
  },

  // Mock object para APIs antigas
  _mockDB: {
    transaction: function() {
      return {
        objectStore: function() {
          return {
            get: function(key) {
              const result = { data: window.FIAP.storage.getData(key) };
              return {
                onsuccess: function(callback) {
                  if (callback) callback({ target: { result: result } });
                  return this;
                },
                onerror: function() { return this; }
              };
            },
            put: function(data) {
              window.FIAP.storage.setData(data.id || 'default', data);
              return {
                onsuccess: function(callback) {
                  if (callback) callback();
                  return this;
                },
                onerror: function() { return this; }
              };
            },
            delete: function(key) {
              window.FIAP.storage.setData(key, null);
              return {
                onsuccess: function(callback) {
                  if (callback) callback();
                  return this;
                }
              };
            }
          };
        }
      };
    }
  }
};

// Substituir funções globais
window.openDatabase = function(name, version, displayName, size) {
  console.log('[Storage] Interceptando chamada para openDatabase - usando localStorage');
  return window.FIAP.persistence._mockDB;
};

// Substituir chamadas para IDB específicas
window.indexedDB = window.indexedDB || {};
window.indexedDB.open = function(name, version) {
  console.log('[Storage] Interceptando chamada para indexedDB.open - usando localStorage');

  // Objeto mock que simula abertura de banco
  return {
    onsuccess: function(callback) {
      if (callback) {
        callback({ target: { result: window.FIAP.persistence._mockDB } });
      }
      if (this.onsuccess) this.onsuccess({ target: { result: window.FIAP.persistence._mockDB } });
      return this;
    },
    onerror: function() { return this; },
    onupgradeneeded: function() { return this; }
  };
};
