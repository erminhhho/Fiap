/**
 * SIU - Módulo de CID
 */

class CID {
    constructor() {
      // Inicializa o helper de busca
      this.search = new Search();

      // Verificar se o cache está inicializado
      if (!window.cache) {
        console.error('Cache não disponível. Certifique-se de que cache.js está carregado antes de cid.js');
      }
    }

    /**
     * Busca um código CID pela descrição ou uma descrição pelo código
     * @param {string} query - Código CID ou descrição para buscar
     * @returns {Promise<Array>} Lista de resultados correspondentes
     */
    async find(query) {
      if (!query || query.length < 2) {
        return [];
      }

      // Verificar cache primeiro
      if (this.search.hasCache(query)) {
        return this.search.getFromCache(query);
      }

      // Usar busca da API através do cache
      const results = await window.cache.findCID(query);

      // Guardar no cache de pesquisa
      this.search.addToCache(query, results);
      return results;
    }

    /**
     * Configura autocomplete para os campos de CID e doença
     * @param {number} index - Índice do par de campos
     */
    setupFields(index) {
      const cidInput = document.getElementById(`cid${index}`);
      const doencaInput = document.getElementById(`doenca${index}`);
      const cidDropdown = document.getElementById(`cidDropdown${index}`);
      const doencaDropdown = document.getElementById(`doencaDropdown${index}`);

      if (!cidInput || !doencaInput || !cidDropdown || !doencaDropdown) return;

      // Configura autocomplete para o campo CID
      this.search.setupAutocomplete(
        cidInput,
        cidDropdown,
        async (query) => {
          console.log('CID: Buscando por código:', query);
          const results = await this.find(query);
          console.log('CID: Resultados encontrados:', results.length);
          return results;
        },
        (results) => {
          if (results.length === 0) {
            return `<div class="p-3 text-center text-gray-500 text-sm">Nenhum resultado encontrado</div>`;
          }

          // Nova implementação para garantir que os cliques funcionem
          return `
            <div class="py-2" id="cidResultsList${index}">
              ${results.map((item, i) =>
                `<div class="cid-item flex items-center px-4 py-2 hover:bg-blue-50 transition-colors cursor-pointer"
                     data-index="${i}"
                     data-code="${item.code}"
                     data-description="${item.description}">
                  <span class="text-blue-600 font-bold mr-1">${item.code}</span>
                  <span class="text-gray-600">- ${item.description}</span>
                </div>`
              ).join('')}
            </div>
          `;
        },
        (selectedElement) => {
          // Esta função não é mais usada diretamente devido à nossa abordagem manual
          // A manipulação será feita pelo event listener abaixo
        }
      );

      // Adiciona manualmente listeners para os itens do dropdown
      cidDropdown.addEventListener('click', function(e) {
        const cidItem = e.target.closest('.cid-item');
        if (cidItem) {
          const code = cidItem.dataset.code;
          const description = cidItem.dataset.description;

          console.log('CID: Item selecionado manualmente:', code, description);

          // Preencher os campos
          cidInput.value = code;
          doencaInput.value = description;

          // Adicionar classe preenchida
          cidInput.classList.add('filled');
          doencaInput.classList.add('filled');

          // Disparar eventos
          cidInput.dispatchEvent(new Event('change', { bubbles: true }));
          doencaInput.dispatchEvent(new Event('change', { bubbles: true }));
          cidInput.dispatchEvent(new Event('input', { bubbles: true }));
          doencaInput.dispatchEvent(new Event('input', { bubbles: true }));

          // Fechar dropdown
          cidDropdown.classList.add('hidden');
          doencaDropdown.classList.add('hidden');

          // Destacar campos - usando a função global padronizada
          destacarCamposPreenchidos();
        }
      });

      // Configura autocomplete para o campo doença (similar ao anterior)
      this.search.setupAutocomplete(
        doencaInput,
        doencaDropdown,
        async (query) => {
          console.log('CID: Buscando por descrição:', query);
          const results = await this.find(query);
          console.log('CID: Resultados encontrados:', results.length);
          return results;
        },
        (results) => {
          if (results.length === 0) {
            return `<div class="p-3 text-center text-gray-500 text-sm">Nenhum resultado encontrado</div>`;
          }

          // Nova implementação para garantir que os cliques funcionem
          return `
            <div class="py-2" id="doencaResultsList${index}">
              ${results.map((item, i) =>
                `<div class="doenca-item flex items-center px-4 py-2 hover:bg-blue-50 transition-colors cursor-pointer"
                     data-index="${i}"
                     data-code="${item.code}"
                     data-description="${item.description}">
                  <span class="text-blue-600 font-bold mr-1">${item.code}</span>
                  <span class="text-gray-600">- ${item.description}</span>
                </div>`
              ).join('')}
            </div>
          `;
        },
        (selectedElement) => {
          // Esta função não é mais usada diretamente devido à nossa abordagem manual
          // A manipulação será feita pelo event listener abaixo
        }
      );

      // Adiciona manualmente listeners para os itens do dropdown
      doencaDropdown.addEventListener('click', function(e) {
        const doencaItem = e.target.closest('.doenca-item');
        if (doencaItem) {
          const code = doencaItem.dataset.code;
          const description = doencaItem.dataset.description;

          console.log('CID: Item selecionado via doença manualmente:', code, description);

          // Preencher os campos
          cidInput.value = code;
          doencaInput.value = description;

          // Adicionar classe preenchida
          cidInput.classList.add('filled');
          doencaInput.classList.add('filled');

          // Disparar eventos
          cidInput.dispatchEvent(new Event('change', { bubbles: true }));
          doencaInput.dispatchEvent(new Event('change', { bubbles: true }));
          cidInput.dispatchEvent(new Event('input', { bubbles: true }));
          doencaInput.dispatchEvent(new Event('input', { bubbles: true }));

          // Fechar dropdown
          cidDropdown.classList.add('hidden');
          doencaDropdown.classList.add('hidden');

          // Destacar campos - usando a função global padronizada
          destacarCamposPreenchidos();
        }
      });
    }
}

// Criar uma instância global para uso em toda a aplicação
window.cidInstance = new CID();

// Função init para inicializar o sistema de CID
function initCidSystem() {
  const inputs = document.querySelectorAll('.cid-input');
  const indices = [...new Set(Array.from(inputs).map(input => input.dataset.index))];

  indices.forEach(index => {
    if (window.cidInstance) {
      window.cidInstance.setupFields(index);
    }
  });
}

// Exportar funções para uso global
window.initCidSystem = initCidSystem;
