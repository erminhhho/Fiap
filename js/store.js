/**
 * Sistema de persistência automática complementar - LocalStorage
 * Integrado com sistema existente para evitar conflitos
 */
import debounce from './debounce.js';

class DataStore {
  constructor(storageKey = 'fiap_store_data') {
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

    if (index >= 0) {
      this.data[collection][index] = {
        ...item,
        updatedAt: new Date().toISOString()
      };
    } else {
      this.data[collection].push({
        ...item,
        id: item.id || crypto.randomUUID(),
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
    this.autoSave = debounce(() => {
      this.save();
    }, 800); // Salvar 800ms após última modificação

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
    window.dispatchEvent(new CustomEvent(`store:${name}`, {
      detail: {
        source: this.storageKey,
        ...detail
      }
    }));
  }
}

// Exportar instância única
const store = new DataStore();
export default store;
