/**
 * Sistema de Persistência de Dados
 * Gerencia o armazenamento local e sincronização com Firebase
 */

class PersistenceManager {
  constructor() {
    this.db = null;
    this.syncQueue = [];
    this.isOnline = navigator.onLine;
    this.syncInProgress = false;
    this.initializeDB();
    this.setupNetworkListeners();
  }

  /**
   * Inicializa o banco de dados IndexedDB
   */
  async initializeDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('fiapDB', 1);

      request.onerror = () => {
        console.error('Erro ao abrir o banco de dados');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('Banco de dados inicializado com sucesso');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Store para formulários
        if (!db.objectStoreNames.contains('formularios')) {
          const formulariosStore = db.createObjectStore('formularios', { keyPath: 'id' });
          formulariosStore.createIndex('cpf', 'cpf', { unique: false });
          formulariosStore.createIndex('ultimaAtualizacao', 'ultimaAtualizacao', { unique: false });
        }

        // Store para documentos
        if (!db.objectStoreNames.contains('documentos')) {
          const documentosStore = db.createObjectStore('documentos', { keyPath: 'id' });
          documentosStore.createIndex('formularioId', 'formularioId', { unique: false });
        }

        // Store para fila de sincronização
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  /**
   * Configura listeners para eventos de rede
   */
  setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processSyncQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  /**
   * Salva dados localmente e na nuvem
   * @param {string} store - Nome da store (formularios, documentos)
   * @param {object} data - Dados a serem salvos
   * @returns {Promise} - Promise com o resultado da operação
   */
  async save(store, data) {
    try {
      // Salva localmente primeiro
      await this.saveLocally(store, data);

      // Se estiver online, tenta sincronizar com Firebase
      if (this.isOnline) {
        await this.syncWithFirebase(store, data);
      } else {
        // Se offline, adiciona à fila de sincronização
        await this.addToSyncQueue(store, 'save', data);
      }

      return { success: true, data };
    } catch (error) {
      console.error(`Erro ao salvar em ${store}:`, error);
      return { success: false, error };
    }
  }

  /**
   * Salva dados localmente no IndexedDB
   * @param {string} store - Nome da store
   * @param {object} data - Dados a serem salvos
   */
  async saveLocally(store, data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(store, 'readwrite');
      const objectStore = transaction.objectStore(store);

      const request = objectStore.put({
        ...data,
        ultimaAtualizacao: new Date().toISOString()
      });

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Sincroniza dados com Firebase
   * @param {string} store - Nome da store
   * @param {object} data - Dados a serem sincronizados
   */
  async syncWithFirebase(store, data) {
    try {
      const db = firebase.firestore();
      const docRef = db.collection(store).doc(data.id);

      await docRef.set({
        ...data,
        ultimaAtualizacao: firebase.firestore.FieldValue.serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error('Erro na sincronização com Firebase:', error);
      throw error;
    }
  }

  /**
   * Adiciona operação à fila de sincronização
   * @param {string} store - Nome da store
   * @param {string} operation - Tipo de operação (save, delete)
   * @param {object} data - Dados da operação
   */
  async addToSyncQueue(store, operation, data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction('syncQueue', 'readwrite');
      const objectStore = transaction.objectStore('syncQueue');

      const queueItem = {
        store,
        operation,
        data,
        timestamp: new Date().toISOString()
      };

      const request = objectStore.add(queueItem);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Processa a fila de sincronização
   */
  async processSyncQueue() {
    if (this.syncInProgress || !this.isOnline) return;

    this.syncInProgress = true;

    try {
      const transaction = this.db.transaction('syncQueue', 'readwrite');
      const objectStore = transaction.objectStore('syncQueue');
      const index = objectStore.index('timestamp');
      const request = index.openCursor();

      request.onsuccess = async (event) => {
        const cursor = event.target.result;
        if (cursor) {
          const item = cursor.value;
          try {
            await this.syncWithFirebase(item.store, item.data);
            cursor.delete();
          } catch (error) {
            console.error('Erro ao processar item da fila:', error);
          }
          cursor.continue();
        } else {
          this.syncInProgress = false;
        }
      };
    } catch (error) {
      console.error('Erro ao processar fila de sincronização:', error);
      this.syncInProgress = false;
    }
  }

  /**
   * Busca dados localmente e na nuvem
   * @param {string} store - Nome da store
   * @param {string} id - ID do documento
   * @returns {Promise} - Promise com os dados encontrados
   */
  async get(store, id) {
    try {
      // Tenta buscar localmente primeiro
      const localData = await this.getLocally(store, id);

      // Se estiver online, verifica se há atualizações no Firebase
      if (this.isOnline) {
        const cloudData = await this.getFromFirebase(store, id);

        if (cloudData && (!localData || new Date(cloudData.ultimaAtualizacao) > new Date(localData.ultimaAtualizacao))) {
          // Atualiza localmente com os dados mais recentes
          await this.saveLocally(store, cloudData);
          return cloudData;
        }
      }

      return localData;
    } catch (error) {
      console.error(`Erro ao buscar em ${store}:`, error);
      throw error;
    }
  }

  /**
   * Busca dados localmente no IndexedDB
   * @param {string} store - Nome da store
   * @param {string} id - ID do documento
   */
  async getLocally(store, id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(store, 'readonly');
      const objectStore = transaction.objectStore(store);
      const request = objectStore.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Busca dados do Firebase
   * @param {string} store - Nome da store
   * @param {string} id - ID do documento
   */
  async getFromFirebase(store, id) {
    try {
      const db = firebase.firestore();
      const docRef = db.collection(store).doc(id);
      const doc = await docRef.get();

      if (doc.exists) {
        return doc.data();
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar do Firebase:', error);
      throw error;
    }
  }

  /**
   * Busca todos os documentos de uma store
   * @param {string} store - Nome da store
   * @returns {Promise} - Promise com array de documentos
   */
  async getAll(store) {
    try {
      const localData = await this.getAllLocally(store);

      if (this.isOnline) {
        const cloudData = await this.getAllFromFirebase(store);

        // Atualiza localmente com os dados mais recentes
        for (const doc of cloudData) {
          const localDoc = localData.find(d => d.id === doc.id);
          if (!localDoc || new Date(doc.ultimaAtualizacao) > new Date(localDoc.ultimaAtualizacao)) {
            await this.saveLocally(store, doc);
          }
        }

        return cloudData;
      }

      return localData;
    } catch (error) {
      console.error(`Erro ao buscar todos em ${store}:`, error);
      throw error;
    }
  }

  /**
   * Busca todos os documentos localmente
   * @param {string} store - Nome da store
   */
  async getAllLocally(store) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(store, 'readonly');
      const objectStore = transaction.objectStore(store);
      const request = objectStore.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Busca todos os documentos do Firebase
   * @param {string} store - Nome da store
   */
  async getAllFromFirebase(store) {
    try {
      const db = firebase.firestore();
      const snapshot = await db.collection(store).get();
      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error('Erro ao buscar todos do Firebase:', error);
      throw error;
    }
  }
}

// Criar instância global
window.persistenceManager = new PersistenceManager();
