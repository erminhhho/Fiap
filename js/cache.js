/**
 * Cache system for CID and CEP data
 */

class Cache {
  constructor() {
    this.cidCache = new Map();
    this.cepCache = new Map();
    this.lastUpdate = {
      cid: null,
      cep: null
    };
    this.cacheExpiration = 24 * 60 * 60 * 1000; // 24 horas em milissegundos
    this.initialized = false;
  }

  /**
   * Inicializa o cache quando todas as dependências estiverem prontas
   */
  async initialize() {
    if (this.initialized) return;

    // Aguardar o cidInstance estar disponível
    let attempts = 0;
    while (!window.cidInstance && attempts < 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }

    if (!window.cidInstance) {
      console.error('cidInstance não disponível após várias tentativas');
      return;
    }

    try {
      await this.updateCIDCache();
      this.initialized = true;
      console.log('Cache inicializado com sucesso');
    } catch (error) {
      console.error('Erro ao inicializar cache:', error);
    }
  }

  /**
   * CID Cache methods
   */
  async getCID(code) {
    if (!code) return null;

    if (!this.initialized) {
      await this.initialize();
    }

    if (this.isCIDCacheValid()) {
      return this.cidCache.get(code);
    }
    await this.updateCIDCache();
    return this.cidCache.get(code);
  }

  async updateCIDCache() {
    try {
      if (!window.cidInstance) {
        console.warn('Aguardando cidInstance estar disponível...');
        await this.initialize();
      }

      if (window.cidInstance && window.cidInstance.database) {
        this.cidCache = new Map(window.cidInstance.database.map(cid => [cid.code, cid]));
        this.lastUpdate.cid = Date.now();
        console.log('Cache de CIDs atualizado com sucesso do banco local');
      } else {
        console.error('Banco de dados local de CIDs não disponível');
        throw new Error('Banco de dados local não disponível');
      }
    } catch (error) {
      console.error('Erro ao atualizar cache de CIDs:', error);
      throw error;
    }
  }

  isCIDCacheValid() {
    return this.lastUpdate.cid &&
           (Date.now() - this.lastUpdate.cid) < this.cacheExpiration;
  }

  /**
   * CEP Cache methods
   */
  async getCEP(code) {
    if (!code) return null;

    if (this.isCEPCacheValid(code)) {
      return this.cepCache.get(code).data;
    }
    return await this.fetchCEP(code);
  }

  async fetchCEP(code) {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${code}/json/`);
      if (response.ok) {
        const data = await response.json();
        if (!data.erro) {
          this.cepCache.set(code, {
            data,
            timestamp: Date.now()
          });
          return data;
        }
      }
      throw new Error('CEP não encontrado');
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      throw error;
    }
  }

  isCEPCacheValid(code) {
    const cached = this.cepCache.get(code);
    return cached &&
           (Date.now() - cached.timestamp) < this.cacheExpiration;
  }

  /**
   * Cache management methods
   */
  clearCache() {
    this.cidCache.clear();
    this.cepCache.clear();
    this.lastUpdate = {
      cid: null,
      cep: null
    };
    this.initialized = false;
  }

  getCacheStats() {
    return {
      cidCount: this.cidCache.size,
      cepCount: this.cepCache.size,
      lastUpdate: this.lastUpdate,
      initialized: this.initialized
    };
  }
}

// Initialize cache system
const cache = new Cache();

// Export cache instance
window.cache = cache;

// Inicializar o cache quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  cache.initialize().catch(console.error);
});
