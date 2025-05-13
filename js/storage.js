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
  /**
   * Log condicional com base nas configurações de debug
   * @param {string} message - Mensagem a ser registrada
   * @param {Error} [error] - Objeto de erro opcional
   */
  function storageLog(message, error) {
    if (window.CONFIG?.debug?.enabled && window.CONFIG.debug.levels.storage) {
      if (error) {
        console.error(`[Storage] ${message}`, error);
      } else {
        console.log(`[Storage] ${message}`);
      }
    }
  }

  // Configurações locais
  const CONFIG = {
    storageKey: 'fiap_form_data',
    storeKey: 'fiap_store_data', // Chave adicional para compatibilidade com store.js
    autoSaveDelay: 800,
    notificationDuration: 2000,
    createSaveIndicator: false
  };

  // Componente DataStore (migrado de store.js) para coleções de dados
  class DataStore {
    constructor(storageKey = CONFIG.storeKey) {
      this.storageKey = storageKey;
      this.data = this.load() || {};
      this.lastSyncTime = null;
      this.setupAutoSave();

      // Verificar se já existe sistema de persistência
      this.hasExistingSystem = typeof window.FIAP !== 'undefined' &&
                             typeof window.FIAP.state !== 'undefined';

      if (this.hasExistingSystem) {
        console.log('Sistema de persistência existente detectado, operando em modo de integração');
      }
    }

    /**
     * Carrega todos os dados do localStorage
     * @return {Object} Dados salvos ou null em caso de erro
     */
    load() {
      try {
        return JSON.parse(localStorage.getItem(this.storageKey));
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        return null;
      }
    }

    /**
     * Salva todos os dados no localStorage
     * @return {Boolean} Sucesso da operação
     */
    save() {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        this.dispatchEvent('data-saved');
        return true;
      } catch (error) {
        this.handleStorageError(error);
        return false;
      }
    }

    /**
     * Obtém dados de uma coleção ou item específico
     * @param {String} collection - Nome da coleção
     * @param {String} id - ID do item (opcional)
     * @return {Array|Object} Coleção ou item específico
     */
    get(collection, id = null) {
      // Tentar pegar do sistema existente primeiro, se disponível
      if (this.hasExistingSystem && window.FIAP.state && typeof window.FIAP.state.getFormData === 'function') {
        try {
          const existingData = window.FIAP.state.getFormData(collection);
          if (existingData) {
            // Armazenar no nosso sistema também para backup
            if (!this.data[collection]) this.data[collection] = existingData;
            this.save();

            if (id) {
              return existingData.find ? existingData.find(item => item.id === id) : null;
            }
            return existingData;
          }
        } catch (e) {
          console.warn('Erro ao acessar dados do sistema existente:', e);
        }
      }

      // Usar nosso próprio armazenamento como fallback
      if (!this.data[collection]) return id ? null : [];
      return id ? this.data[collection].find(item => item.id === id) : this.data[collection];
    }

    /**
     * Salva um item em uma coleção com autosave
     * @param {String} collection - Nome da coleção
     * @param {Object} item - Item a ser salvo
     * @return {Object} Item salvo com ID e timestamps
     */
    set(collection, item) {
      if (!this.data[collection]) this.data[collection] = [];

      const index = this.data[collection].findIndex(i => i.id === item.id);
      const generateId = function() {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
          return crypto.randomUUID();
        } else {
          return Date.now().toString() + '-' + Math.random().toString(36).substring(2, 9);
        }
      };

      if (index >= 0) {
        this.data[collection][index] = {
          ...item,
          updatedAt: new Date().toISOString()
        };
      } else {
        this.data[collection].push({
          ...item,
          id: item.id || generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      // Tentar integrar com sistema existente
      if (this.hasExistingSystem && window.FIAP.state &&
          typeof window.FIAP.state.saveFormData === 'function') {
        try {
          window.FIAP.state.saveFormData(collection, this.data[collection]);
        } catch (e) {
          console.warn('Erro ao salvar no sistema existente:', e);
        }
      }

      this.autoSave();
      return item;
    }

    /**
     * Remove um item de uma coleção
     * @param {String} collection - Nome da coleção
     * @param {String} id - ID do item a remover
     * @return {Boolean} Sucesso da operação
     */
    remove(collection, id) {
      if (!this.data[collection]) return false;

      const initialLength = this.data[collection].length;
      this.data[collection] = this.data[collection].filter(item => item.id !== id);

      if (initialLength !== this.data[collection].length) {
        // Tentar integrar com sistema existente
        if (this.hasExistingSystem && window.FIAP.state &&
            typeof window.FIAP.state.saveFormData === 'function') {
          try {
            window.FIAP.state.saveFormData(collection, this.data[collection]);
          } catch (e) {
            console.warn('Erro ao atualizar o sistema existente após remoção:', e);
          }
        }

        this.autoSave();
        return true;
      }
      return false;
    }

    /**
     * Tratamento de erros de armazenamento
     * @param {Error} error - Objeto de erro
     */
    handleStorageError(error) {
      console.error('Erro de armazenamento:', error);

      // Verificar se é erro de cota excedida
      if (error.name === 'QuotaExceededError' || error.code === 22) {
        this.dispatchEvent('storage-full');
        console.warn('Armazenamento cheio! Alguns dados mais antigos serão removidos.');
        this.clearOldData();
      }
    }

    /**
     * Limpa dados antigos em caso de memória cheia
     */
    clearOldData() {
      // Encontrar coleção com mais itens
      let largest = '';
      let count = 0;

      Object.keys(this.data).forEach(key => {
        if (Array.isArray(this.data[key]) && this.data[key].length > count) {
          count = this.data[key].length;
          largest = key;
        }
      });

      if (largest && this.data[largest].length > 10) {
        // Ordenar por data e remover 20% mais antigos
        this.data[largest].sort((a, b) =>
          new Date(a.updatedAt) - new Date(b.updatedAt)
        );

        const removeCount = Math.ceil(this.data[largest].length * 0.2);
        this.data[largest] = this.data[largest].slice(removeCount);
        this.save();
      }
    }

    /**
     * Configura sistema de autosave
     */
    setupAutoSave() {
      const self = this;
      this.autoSave = function() {
        if (this._saveTimeout) clearTimeout(this._saveTimeout);
        this._saveTimeout = setTimeout(() => {
          self.save();
        }, 800);
      };

      // Salvar ao fechar/recarregar página
      window.addEventListener('beforeunload', () => this.save());

      // Restaurar ao voltar online
      window.addEventListener('online', () => {
        this.dispatchEvent('back-online');
      });
    }

    /**
     * Sistema de eventos para UI
     * @param {String} name - Nome do evento
     * @param {Object} detail - Detalhes do evento
     */
    dispatchEvent(name, detail = {}) {
      try {
        const eventDetail = {
          source: this.storageKey,
          ...detail
        };

        if (typeof CustomEvent === 'function') {
          window.dispatchEvent(new CustomEvent(`store:${name}`, {
            detail: eventDetail
          }));
        } else {
          // Fallback para IE
          const event = document.createEvent('CustomEvent');
          event.initCustomEvent(`store:${name}`, true, true, eventDetail);
          window.dispatchEvent(event);
        }
      } catch (e) {
        console.warn(`Erro ao disparar evento store:${name}`, e);
      }
    }
  }

  // Cache de dados em memória
  let dataCache = {};
  let autoSaveTimer = null;
  let initialized = false;
  let saveIndicator = null;
  let store = null; // Instância do DataStore

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

    // Inicializar o DataStore (antigo store.js)
    store = new DataStore(CONFIG.storeKey);

    log('Sistema de persistência inicializado');
    initialized = true;

    // Disparar evento de inicialização
    try {
      if (typeof CustomEvent === 'function') {
        document.dispatchEvent(new CustomEvent('storage:ready'));
      } else {
        // Fallback para IE
        const event = document.createEvent('CustomEvent');
        event.initCustomEvent('storage:ready', true, true, {});
        document.dispatchEvent(event);
      }
    } catch (e) {
      console.warn('Erro ao disparar evento storage:ready', e);
    }
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
    const saveBtnIcon = document.querySelector('#btn-save i');
    if (saveBtnIcon) {
      // Adicionar animação de pulso e cor para indicar salvamento
      saveBtnIcon.classList.add('text-green-500', 'animate-pulse');
      // Remover animação após a duração configurada
      setTimeout(() => {
        saveBtnIcon.classList.remove('text-green-500', 'animate-pulse');
      }, CONFIG.notificationDuration);
    }
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
    let formInputTimer;
    document.addEventListener('input', event => {
      if (formInputTimer) clearTimeout(formInputTimer);
      formInputTimer = setTimeout(() => {
        if (event.target.form) {
          const formId = event.target.form.id || 'default_form';
          const formData = collectFormData(event.target.form);
          setData(formId, formData);
        }
      }, CONFIG.autoSaveDelay);
    });
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
          // Usar método que funciona em navegadores mais antigos
          if (typeof Event === 'function') {
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
          } else {
            // Fallback para IE
            const event = document.createEvent('Event');
            event.initEvent('change', true, true);
            element.dispatchEvent(event);
          }
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
      try {
        if (typeof CustomEvent === 'function') {
          document.dispatchEvent(new CustomEvent('storage:saved', {
            detail: { data: dataCache }
          }));
        } else {
          // Fallback para navegadores antigos
          const event = document.createEvent('CustomEvent');
          event.initCustomEvent('storage:saved', true, true, { data: dataCache });
          document.dispatchEvent(event);
        }
      } catch (e) {
        console.warn('Erro ao disparar evento storage:saved', e);
      }

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
   * Registra mensagens de debug se ativado
   */
  function log(message) {
    storageLog(message);
  }

  /**
   * Ativa modo de debug
   */
  function enableDebug() {
    if (window.CONFIG && window.CONFIG.debug) {
      window.CONFIG.debug.enabled = true;
      window.CONFIG.debug.levels.storage = true;
      storageLog('Modo debug ativado');
    }
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
    enableDebug,
    // Adicionar API do DataStore
    store: {
      get: function(collection, id) {
        if (!store) store = new DataStore(CONFIG.storeKey);
        return store.get(collection, id);
      },
      set: function(collection, item) {
        if (!store) store = new DataStore(CONFIG.storeKey);
        return store.set(collection, item);
      },
      remove: function(collection, id) {
        if (!store) store = new DataStore(CONFIG.storeKey);
        return store.remove(collection, id);
      },
      save: function() {
        if (!store) store = new DataStore(CONFIG.storeKey);
        return store.save();
      }
    }
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
    storageLog('Interceptando chamada para openDatabase - usando localStorage');
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
  storageLog('Interceptando chamada para openDatabase - usando localStorage');
  return window.FIAP.persistence._mockDB;
};

// Substituir chamadas para IDB específicas
window.indexedDB = window.indexedDB || {};
window.indexedDB.open = function(name, version) {
  storageLog('Interceptando chamada para indexedDB.open - usando localStorage');

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
