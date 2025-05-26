/**
 * SIU - Módulo de CID
 */

class CID {
    constructor() {
      // Inicializa o helper de busca
      this.search = new Search();

      // Armazenar listeners para poder removê-los depois
      this.activeListeners = new Map();

      // Verificar se o cache está inicializado
      if (!window.cache) {
        console.error('Cache não disponível. Certifique-se de que cache.js está carregado antes de cid.js');
      }
    }

    /**
     * Remove todos os event listeners ativos para evitar duplicação
     */
    clearListeners() {
      console.log('Limpando listeners antigos do CID...');
      this.activeListeners.forEach((listener, element) => {
        if (element && listener) {
          element.removeEventListener('click', listener);
          element.removeEventListener('input', listener);
        }
      });
      this.activeListeners.clear();
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
    }    /**
     * Configura autocomplete para os campos de CID e doença
     * @param {number} index - Índice do par de campos
     */    setupFields(index) {
      const cidInput = document.getElementById(`cid${index}`);
      const doencaInput = document.getElementById(`doenca${index}`);
      const cidDropdown = document.getElementById(`cidDropdown${index}`);

      if (!cidInput || !doencaInput || !cidDropdown) return;

      console.log(`Configurando campo CID ${index}...`);

      // Remover listeners existentes se já foram configurados
      const existingKey = `cid-${index}`;
      if (this.activeListeners.has(existingKey)) {
        console.log(`Removendo listeners existentes para CID ${index}`);
        const oldListeners = this.activeListeners.get(existingKey);
        oldListeners.forEach(({ element, event, listener }) => {
          element.removeEventListener(event, listener);
        });
        this.activeListeners.delete(existingKey);
      }

      // Limpar dropdown completamente
      cidDropdown.innerHTML = '';
      cidDropdown.classList.add('hidden');
      cidDropdown.style.display = 'none';

      // Array para armazenar os listeners deste campo
      const listeners = [];

      // Função para fechar dropdown definitivamente
      const closeDropdownCompletely = () => {
        cidDropdown.classList.add('hidden');
        cidDropdown.style.display = 'none';
        cidDropdown.innerHTML = '';
      };      // Implementação direta sem usar o sistema search.js para evitar conflitos
      let debounceTimer;

      const inputListener = async function() {
        const query = this.value.trim();

        clearTimeout(debounceTimer);

        if (!query || query.length < 2) {
          closeDropdownCompletely();
          return;
        }

        debounceTimer = setTimeout(async () => {
          try {
            console.log('CID: Buscando por código:', query);
            const results = await window.cidInstance.find(query);
            console.log('CID: Resultados encontrados:', results.length);

            if (results && results.length > 0) {
              // Renderizar resultados com nossa própria implementação
              const html = `
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

              cidDropdown.innerHTML = html;
              cidDropdown.style.display = 'block';
              cidDropdown.classList.remove('hidden');
            } else {
              closeDropdownCompletely();
            }
          } catch (err) {
            console.error('Erro na busca CID:', err);
            closeDropdownCompletely();
          }
        }, 300);
      };

      cidInput.addEventListener('input', inputListener);
      listeners.push({ element: cidInput, event: 'input', listener: inputListener });      // Adicionar listener para cliques nos itens do dropdown
      const clickListener = function(e) {
        const cidItem = e.target.closest('.cid-item');
        if (cidItem) {
          const code = cidItem.dataset.code;
          const description = cidItem.dataset.description;

          console.log('CID: Item selecionado:', code, description);

          // Preencher os campos
          cidInput.value = code;
          doencaInput.value = description;

          // Adicionar classes de preenchimento
          cidInput.classList.add('filled');
          doencaInput.classList.add('filled');

          // Disparar eventos para notificar outros sistemas
          ['change', 'input'].forEach(eventType => {
            cidInput.dispatchEvent(new Event(eventType, { bubbles: true }));
            doencaInput.dispatchEvent(new Event(eventType, { bubbles: true }));
          });

          // Fechar dropdown definitivamente
          closeDropdownCompletely();

          // Destacar campos se a função estiver disponível
          if (typeof destacarCamposPreenchidos === 'function') {
            destacarCamposPreenchidos();
          }

          // Foco no próximo campo se disponível
          const nextField = document.querySelector(`[data-index="${parseInt(index) + 1}"]`);
          if (nextField) {
            nextField.focus();
          }
        }
      };

      cidDropdown.addEventListener('click', clickListener);
      listeners.push({ element: cidDropdown, event: 'click', listener: clickListener });

      // Fechar dropdown ao clicar fora - criar listener único para este campo
      const outsideClickListener = function(e) {
        if (!cidInput.contains(e.target) && !cidDropdown.contains(e.target)) {
          closeDropdownCompletely();
        }
      };

      document.addEventListener('click', outsideClickListener);
      listeners.push({ element: document, event: 'click', listener: outsideClickListener });

      // Fechar dropdown ao pressionar Escape - criar listener único para este campo
      const escapeListener = function(e) {
        if (e.key === 'Escape') {
          closeDropdownCompletely();
        }
      };

      document.addEventListener('keydown', escapeListener);
      listeners.push({ element: document, event: 'keydown', listener: escapeListener });

      // Armazenar todos os listeners para este campo
      this.activeListeners.set(existingKey, listeners);

      console.log(`Campo CID ${index} configurado com sucesso`);
    }

    /**
     * Debug function to check dropdown state
     */
    debugDropdownState(index) {
      const dropdown = document.getElementById(`cidDropdown${index}`);
      if (dropdown) {
        console.log(`Dropdown ${index} state:`, {
          isVisible: dropdown.style.display !== 'none',
          hasHiddenClass: dropdown.classList.contains('hidden'),
          innerHTML: dropdown.innerHTML.length > 0,
          computedDisplay: window.getComputedStyle(dropdown).display,
          computedVisibility: window.getComputedStyle(dropdown).visibility
        });
      }
    }
}

// Criar uma instância global para uso em toda a aplicação
window.cidInstance = new CID();

// Função init para inicializar o sistema de CID
function initCidSystem() {
  console.log('Inicializando sistema CID...');

  // Evitar múltiplas inicializações, mas permitir quando há novos campos
  if (window.cidSystemInitialized) {
    console.log('Sistema CID já foi inicializado, verificando novos campos...');
  }

  // Limpar listeners antigos antes de configurar novos
  if (window.cidInstance && typeof window.cidInstance.clearListeners === 'function') {
    window.cidInstance.clearListeners();
  }

  const inputs = document.querySelectorAll('.cid-input');
  const indices = [...new Set(Array.from(inputs).map(input => input.dataset.index))];

  console.log('Campos CID encontrados:', indices.length, indices);

  if (indices.length === 0) {
    console.log('Nenhum campo CID encontrado na página');
    return;
  }

  indices.forEach(index => {
    if (window.cidInstance) {
      console.log('Configurando campo CID:', index);
      window.cidInstance.setupFields(index);
    }
  });

  // Marcar como inicializado
  window.cidSystemInitialized = true;
  console.log('Sistema CID inicializado com sucesso');
}

// Exportar funções para uso global
window.initCidSystem = initCidSystem;
