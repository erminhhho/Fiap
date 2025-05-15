/**
 * FIAP - Sistema de persistência simplificado
 * Baseado exclusivamente em localStorage
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
    if (window.logSystem) {
      window.logSystem('Storage', message, error);
      return;
    }

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
    storeKey: 'fiap_store_data',
    autoSaveDelay: 800,
    notificationDuration: 2000,
    createSaveIndicator: false
  };

  // Componente DataStore para coleções de dados
  class DataStore {
    constructor(storageKey = CONFIG.storeKey) {
      this.storageKey = storageKey;
      this.data = this.load() || {};
      this.lastSyncTime = null;
      this.setupAutoSave();
      this.savingInProgress = false;

      // Verificar se já existe sistema de persistência
      this.hasExistingSystem = typeof window.FIAP !== 'undefined' &&
                             typeof window.FIAP.state !== 'undefined';

      if (this.hasExistingSystem) {
        storageLog('Sistema de persistência existente detectado, operando em modo de integração');
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
        storageLog('Erro ao carregar dados:', error);
        return null;
      }
    }

    /**
     * Salva todos os dados no localStorage de forma atômica
     * @return {Promise<Boolean>} Promise com o sucesso da operação
     */
    save() {
      // Implementar salvamento como Promise para garantir atomicidade
      return new Promise((resolve, reject) => {
        // Evitar salvamentos simultâneos
        if (this.savingInProgress) {
          storageLog('Salvamento já em andamento, enfileirando operação');
          // Enfileirar a operação para executar quando o salvamento atual terminar
          if (!this._saveQueue) this._saveQueue = [];
          this._saveQueue.push({ resolve, reject });
          return;
        }

        this.savingInProgress = true;

        try {
          // Criar cópia dos dados para evitar problemas de referência
          const dataToSave = JSON.parse(JSON.stringify(this.data));

          // Adicionar metadados de salvamento
          dataToSave._lastSaved = new Date().toISOString();
          dataToSave._version = 2; // Versão do formato de dados

          // Salvar no localStorage
          localStorage.setItem(this.storageKey, JSON.stringify(dataToSave));

          // Verificar integridade do salvamento
          const savedIntegrity = this.verifyIntegrity();
          if (!savedIntegrity.success) {
            storageLog('Aviso: Verificação de integridade falhou após salvamento',
                      new Error(savedIntegrity.message));
          }

          this.dispatchEvent('data-saved');
          this.savingInProgress = false;

          // Processar fila de salvamentos pendentes
          this._processSaveQueue();

          resolve(true);
        } catch (error) {
          this.handleStorageError(error);
          this.savingInProgress = false;

          // Processar fila mesmo em caso de erro
          this._processSaveQueue();

          reject(error);
        }
      });
    }

    /**
     * Processa a fila de salvamentos pendentes
     * @private
     */
    _processSaveQueue() {
      if (this._saveQueue && this._saveQueue.length > 0) {
        const nextSave = this._saveQueue.shift();
        this.save().then(nextSave.resolve).catch(nextSave.reject);
      }
    }

    /**
     * Verifica a integridade dos dados salvos
     * @param {String} collection - Nome da coleção para verificar (opcional)
     * @return {Object} Resultado da verificação
     */
    verifyIntegrity(collection = null) {
      try {
        // Carregar dados salvos
        const savedData = JSON.parse(localStorage.getItem(this.storageKey));

        // Verificação básica
        if (!savedData) {
          return {
            success: false,
            message: 'Nenhum dado encontrado no armazenamento'
          };
        }

        // Se solicitou verificação específica de coleção
        if (collection) {
          // Verificar se a coleção existe nos dados em memória
          if (!this.data[collection]) {
            return {
              success: true,
              message: 'Coleção não existe em memória, nada para verificar'
            };
          }

          // Verificar se a coleção existe nos dados salvos
          if (!savedData[collection]) {
            return {
              success: false,
              message: `Coleção ${collection} não encontrada nos dados salvos`
            };
          }

          // Verificar tamanho da coleção
          const memorySize = Array.isArray(this.data[collection])
            ? this.data[collection].length
            : Object.keys(this.data[collection]).length;

          const savedSize = Array.isArray(savedData[collection])
            ? savedData[collection].length
            : Object.keys(savedData[collection]).length;

          if (memorySize !== savedSize) {
            return {
              success: false,
              message: `Tamanho da coleção ${collection} não corresponde: ${memorySize} em memória vs ${savedSize} salvo`
            };
          }

          return { success: true, message: 'Verificação de integridade bem-sucedida' };
        }

        // Verificação global
        return {
          success: true,
          message: 'Verificação de integridade global bem-sucedida',
          timestamp: savedData._lastSaved
        };
      } catch (error) {
        storageLog('Erro durante verificação de integridade:', error);
        return {
          success: false,
          message: `Erro durante verificação: ${error.message}`
        };
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
          storageLog('Erro ao acessar dados do sistema existente:', e);
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
          storageLog('Erro ao salvar no sistema existente:', e);
        }
      }

      this.autoSave();
      return item;
    }

    // ... O restante do código permanece igual

    // ... existing code ...
  }
})();
