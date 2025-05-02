/**
 * Classe para gerenciamento de busca e autocomplete
 */
class Search {
  constructor() {
    // Cache para armazenar resultados de pesquisas anteriores
    this.cache = {};
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
  }

  /**
   * Verifica se existe um cache válido para a consulta
   * @param {string} query - Termo de busca
   * @returns {boolean}
   */
  hasCache(query) {
    if (!this.cache[query]) return false;

    const now = Date.now();
    const cacheExpiry = this.cache[query].timestamp + this.cacheTimeout;
    return now < cacheExpiry;
  }

  /**
   * Obtém resultados do cache
   * @param {string} query - Termo de busca
   * @returns {Array}
   */
  getFromCache(query) {
    return this.cache[query].results;
  }

  /**
   * Adiciona resultados ao cache
   * @param {string} query - Termo de busca
   * @param {Array} results - Resultados encontrados
   */
  addToCache(query, results) {
    this.cache[query] = {
      results: results,
      timestamp: Date.now()
    };
  }

  /**
   * Configura autocomplete para um campo de entrada
   * @param {HTMLElement} input - Elemento de input
   * @param {HTMLElement} dropdown - Elemento do dropdown
   * @param {Function} searchFn - Função de busca que retorna Promise com resultados
   * @param {Function} renderFn - Função de renderização que retorna HTML
   * @param {Function} selectFn - Função chamada quando um item é selecionado
   */
  setupAutocomplete(input, dropdown, searchFn, renderFn, selectFn) {
    if (!input || !dropdown) return;

    // Variáveis para controle de debounce
    let debounceTimer;

    // Função para exibir dropdown
    const showDropdown = (html) => {
      dropdown.innerHTML = html;
      dropdown.style.display = 'block';
    };

    // Função para ocultar dropdown
    const hideDropdown = () => {
      dropdown.style.display = 'none';
    };

    // Configurar evento de digitação com debounce
    input.addEventListener('input', function() {
      const query = this.value.trim();

      clearTimeout(debounceTimer);

      if (!query || query.length < 2) {
        hideDropdown();
        return;
      }

      debounceTimer = setTimeout(async () => {
        try {
          const results = await searchFn(query);

          if (results && results.length) {
            showDropdown(renderFn(results));

            // Configurar eventos de clique nos itens
            dropdown.querySelectorAll('.dropdown-item').forEach(item => {
              item.addEventListener('click', function(e) {
                e.preventDefault();
                selectFn(this);
              });
            });
          } else {
            hideDropdown();
          }
        } catch (err) {
          console.error('Erro no autocomplete:', err);
          hideDropdown();
        }
      }, 300); // 300ms de delay para evitar muitas requisições
    });

    // Fechar dropdown quando clicar fora
    document.addEventListener('click', function(e) {
      if (!input.contains(e.target) && !dropdown.contains(e.target)) {
        hideDropdown();
      }
    });

    // Evitar envio de formulário ao pressionar Enter no campo
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && dropdown.style.display === 'block') {
        e.preventDefault();
        const firstItem = dropdown.querySelector('.dropdown-item[href]');
        if (firstItem) {
          firstItem.click();
        }
      }
    });
  }
}

// Exportar a classe para uso global
window.Search = Search;

// Função auxiliar para busca de CID (compatibilidade com código anterior)
function searchCID(term, dropdownId, onSelect) {
  const dropdown = document.getElementById(dropdownId);
  if (!dropdown) return;

  // Usar a instância global de CID se disponível
  if (window.cidInstance && typeof window.cidInstance.find === 'function') {
    window.cidInstance.find(term).then(results => {
      if (results.length === 0) {
        dropdown.innerHTML = `<div class="dropdown-item py-2 px-3">Nenhum resultado encontrado</div>`;
        dropdown.classList.remove('hidden');
        return;
      }

      dropdown.innerHTML = results.map(item =>
        `<a class="dropdown-item py-2 px-3 cursor-pointer hover:bg-blue-50" href="#" data-code="${item.code}" data-description="${item.description}">
          <strong>${item.code}</strong>: ${item.description}
        </a>`
      ).join('');

      dropdown.classList.remove('hidden');

      dropdown.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', function(e) {
          e.preventDefault();
          onSelect(this.dataset.code);
          dropdown.classList.add('hidden');
        });
      });
    });
  } else {
    console.error('Instância de CID não está disponível');
  }
}

// Exportar função de busca
window.searchCID = searchCID;
