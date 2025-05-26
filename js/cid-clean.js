/**
 * Sistema CID - Implementação Limpa e Simplificada
 * Substitui todas as implementações anteriores
 */

class CIDSystem {
  constructor() {
    this.initialized = false;
    this.dropdowns = new Map(); // Track all active dropdowns
  }

  /**
   * Inicializa o sistema CID para todos os campos existentes e futuros
   */
  init() {
    if (this.initialized) {
      console.log('CID System já inicializado');
      return;
    }

    console.log('Inicializando CID System...');

    // Setup existing fields
    this.setupExistingFields();

    // Setup observer for new fields
    this.setupMutationObserver();

    this.initialized = true;
    console.log('CID System inicializado com sucesso');
  }

  /**
   * Configura campos CID existentes
   */
  setupExistingFields() {
    const cidInputs = document.querySelectorAll('.cid-input');
    cidInputs.forEach(input => {
      const index = input.dataset.index;
      if (index && !this.dropdowns.has(index)) {
        this.setupCIDField(index);
      }
    });
  }

  /**
   * Observa mudanças no DOM para detectar novos campos CID
   */
  setupMutationObserver() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if the added node contains CID inputs
            const cidInputs = node.querySelectorAll ? node.querySelectorAll('.cid-input') : [];
            cidInputs.forEach(input => {
              const index = input.dataset.index;
              if (index && !this.dropdowns.has(index)) {
                this.setupCIDField(index);
              }
            });
          }
        });
      });
    });

    // Observe the main container
    const container = document.getElementById('doencasList') || document.body;
    observer.observe(container, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Configura um campo CID específico
   */
  setupCIDField(index) {
    const cidInput = document.getElementById(`cid${index}`);
    const doencaInput = document.getElementById(`doenca${index}`);
    const dropdown = document.getElementById(`cidDropdown${index}`);

    if (!cidInput || !doencaInput || !dropdown) {
      console.warn(`Elementos CID não encontrados para índice ${index}`);
      return;
    }

    console.log(`Configurando campo CID ${index}`);

    // Clean any existing setup
    this.cleanupField(index);

    // Setup new field
    const fieldData = {
      cidInput,
      doencaInput,
      dropdown,
      debounceTimer: null,
      listeners: []
    };

    this.dropdowns.set(index, fieldData);
    this.attachEvents(index, fieldData);
  }

  /**
   * Remove configuração anterior de um campo
   */
  cleanupField(index) {
    if (this.dropdowns.has(index)) {
      const fieldData = this.dropdowns.get(index);

      // Remove listeners
      fieldData.listeners.forEach(({element, event, listener}) => {
        element.removeEventListener(event, listener);
      });

      // Clear timer
      if (fieldData.debounceTimer) {
        clearTimeout(fieldData.debounceTimer);
      }

      // Hide dropdown
      fieldData.dropdown.classList.add('hidden');
      fieldData.dropdown.innerHTML = '';

      this.dropdowns.delete(index);
    }
  }

  /**
   * Anexa eventos a um campo CID
   */
  attachEvents(index, fieldData) {
    const { cidInput, doencaInput, dropdown } = fieldData;

    // Input event for search
    const inputListener = (e) => {
      const query = e.target.value.trim();

      if (fieldData.debounceTimer) {
        clearTimeout(fieldData.debounceTimer);
      }

      if (!query || query.length < 2) {
        this.hideDropdown(index);
        return;
      }

      fieldData.debounceTimer = setTimeout(() => {
        this.searchCID(index, query);
      }, 300);
    };

    // Click event for dropdown items
    const dropdownClickListener = (e) => {
      const cidItem = e.target.closest('.cid-item');
      if (!cidItem) return;

      e.preventDefault();
      e.stopPropagation();

      const code = cidItem.dataset.code;
      const description = cidItem.dataset.description;

      // Fill fields
      cidInput.value = code;
      doencaInput.value = description;

      // Add filled class
      cidInput.classList.add('filled');
      doencaInput.classList.add('filled');

      // Trigger events
      cidInput.dispatchEvent(new Event('change', { bubbles: true }));
      doencaInput.dispatchEvent(new Event('change', { bubbles: true }));

      // Hide dropdown immediately
      this.hideDropdown(index);

      // Call highlight function if available
      if (typeof destacarCamposPreenchidos === 'function') {
        destacarCamposPreenchidos();
      }

      console.log(`CID selecionado: ${code} - ${description}`);
    };

    // Outside click to close dropdown
    const outsideClickListener = (e) => {
      if (!cidInput.contains(e.target) && !dropdown.contains(e.target)) {
        this.hideDropdown(index);
      }
    };

    // Escape key to close dropdown
    const escapeListener = (e) => {
      if (e.key === 'Escape') {
        this.hideDropdown(index);
      }
    };

    // Attach listeners
    cidInput.addEventListener('input', inputListener);
    dropdown.addEventListener('click', dropdownClickListener);
    document.addEventListener('click', outsideClickListener);
    document.addEventListener('keydown', escapeListener);

    // Store listeners for cleanup
    fieldData.listeners = [
      { element: cidInput, event: 'input', listener: inputListener },
      { element: dropdown, event: 'click', listener: dropdownClickListener },
      { element: document, event: 'click', listener: outsideClickListener },
      { element: document, event: 'keydown', listener: escapeListener }
    ];
  }

  /**
   * Busca CIDs
   */
  async searchCID(index, query) {
    try {
      console.log(`Buscando CID: ${query}`);

      const results = await window.cache.findCID(query);

      if (results && results.length > 0) {
        this.showDropdown(index, results);
      } else {
        this.hideDropdown(index);
      }
    } catch (error) {
      console.error('Erro na busca CID:', error);
      this.hideDropdown(index);
    }
  }

  /**
   * Mostra dropdown com resultados
   */
  showDropdown(index, results) {
    const fieldData = this.dropdowns.get(index);
    if (!fieldData) return;

    const html = results.map(item => `
      <div class="cid-item" data-code="${item.code}" data-description="${item.description}">
        <span class="text-blue-600 font-bold mr-2">${item.code}</span>
        <span class="text-gray-700">${item.description}</span>
      </div>
    `).join('');

    fieldData.dropdown.innerHTML = html;
    fieldData.dropdown.classList.remove('hidden');
  }

  /**
   * Esconde dropdown
   */
  hideDropdown(index) {
    const fieldData = this.dropdowns.get(index);
    if (!fieldData) return;

    fieldData.dropdown.classList.add('hidden');
    fieldData.dropdown.innerHTML = '';
  }

  /**
   * Limpa todo o sistema
   */
  destroy() {
    this.dropdowns.forEach((fieldData, index) => {
      this.cleanupField(index);
    });
    this.dropdowns.clear();
    this.initialized = false;
  }
}

// Instância global
window.cidSystem = new CIDSystem();

// Auto-inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.cidSystem.init();
  });
} else {
  window.cidSystem.init();
}

// Função de conveniência para reinicializar
window.initCidSystem = () => {
  if (window.cidSystem) {
    window.cidSystem.setupExistingFields();
  }
};
