/**
 * Sistema de cache para dados de CEP e gerenciador de CIDs da API
 */

class Cache {
  constructor() {
    this.cepCache = new Map();
    this.completeDatabase = [];
    this.apiDataLoaded = false;
    this.cacheExpiration = 24 * 60 * 60 * 1000; // 24 horas em milissegundos
    this.initialized = false;

    // Tentar carregar todos os dados da API no início
    this.preloadAllCIDs();
  }

  /**
   * Inicializa o cache
   */
  async initialize() {
    if (this.initialized) return;
    this.initialized = true;
    console.log('Cache inicializado com sucesso');
  }

  /**
   * Pré-carrega todos os CIDs da API
   */
  async preloadAllCIDs() {
    try {
      const response = await fetch('https://cid10.cpp-ti.com.br/api');
      if (response.ok) {
        const data = await response.json();
        if (data.data && Array.isArray(data.data)) {
          this.completeDatabase = data.data.map(item => ({
            code: item.codigo,
            description: item.nome
          }));
          this.apiDataLoaded = true;
          console.log(`CID: Carregados ${this.completeDatabase.length} códigos da API`);
        }
      }
    } catch (error) {
      console.warn('CID: Erro ao carregar dados da API:', error);
      this.apiDataLoaded = false;
      this.completeDatabase = [];
    }
  }

  /**
   * Busca um código CID pela descrição ou uma descrição pelo código
   * @param {string} query - Código CID ou descrição para buscar
   * @returns {Promise<Array>} Lista de resultados correspondentes
   */
  async findCID(query) {
    if (!query || query.length < 2 || !this.apiDataLoaded) {
      return [];
    }

    return this.findInCompleteDatabase(query);
  }

  /**
   * Busca nos dados completos baixados da API
   */
  findInCompleteDatabase(query) {
    query = query.toLowerCase().trim();

    // Filtrar os resultados com base na query
    const results = this.completeDatabase.filter(item => {
      const code = item.code.toLowerCase();
      const description = item.description.toLowerCase();

      return code.includes(query) || description.includes(query);
    });

    // Ordenar por relevância
    results.sort((a, b) => {
      // Correspondência exata de código tem prioridade
      if (a.code.toLowerCase() === query) return -1;
      if (b.code.toLowerCase() === query) return 1;

      // Código começando com a query tem prioridade
      const aStartsWithCode = a.code.toLowerCase().startsWith(query);
      const bStartsWithCode = b.code.toLowerCase().startsWith(query);
      if (aStartsWithCode && !bStartsWithCode) return -1;
      if (!aStartsWithCode && bStartsWithCode) return 1;

      // Descrição começando com a query tem prioridade
      const aStartsWithDesc = a.description.toLowerCase().startsWith(query);
      const bStartsWithDesc = b.description.toLowerCase().startsWith(query);
      if (aStartsWithDesc && !bStartsWithDesc) return -1;
      if (!aStartsWithDesc && bStartsWithDesc) return 1;

      // Por último, ordenar alfabeticamente
      return a.code.localeCompare(b.code);
    });

    return results.slice(0, 10); // Limitar a 10 resultados
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
    this.cepCache.clear();
    this.initialized = false;
  }

  getCacheStats() {
    return {
      cidAPILoaded: this.apiDataLoaded,
      cidCount: this.completeDatabase.length,
      cepCount: this.cepCache.size,
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
