/**
 * FIAP - Interface de compatibilidade com persistence.js
 *
 * Este arquivo é apenas um redirecionador para o novo storage.js
 * Mantido para compatibilidade com código existente
 */

// Verificar se o sistema de armazenamento já está inicializado
if (!window.FIAP || !window.FIAP.storage) {
  console.error('[Persistence] Sistema de armazenamento não inicializado. Certifique-se que storage.js está carregado primeiro.');
}

// Se algum código antigo tentar usar este arquivo diretamente, redirecionar para storage
(function() {
  console.log('[Persistence] Usando sistema de armazenamento unificado');

  // Definir propriedades de compatibilidade
  window.FIAP = window.FIAP || {};

  // Se o código antigo tentar abrir um banco de dados
  if (!window.openDatabase) {
    window.openDatabase = function() {
      console.warn('[Persistence] Chamada para openDatabase. Usando localStorage.');
      return window.FIAP.persistence._mockDB;
    };
  }

  // Métodos principais de compatibilidade
  const persistence = {
    // Métodos de compatibilidade com código antigo
    saveForm: function(formId, data) {
      return window.FIAP.storage.setData(formId, data);
    },

    loadForm: function(formId) {
      return window.FIAP.storage.getData(formId);
    },

    deleteForm: function(formId) {
      const data = window.FIAP.storage.getData(formId);
      window.FIAP.storage.setData(formId, null);
      return !!data;
    },

    init: function() {
      console.log('[Persistence] Inicialização redirecionada para storage.js');
      return true;
    }
  };

  // Expor métodos
  window.FIAP.persistence = window.FIAP.persistence || persistence;
})();
