/**
 * Carregador de templates HTML - ARQUIVO CONSOLIDADO
 *
 * ATENÇÃO: As funções neste arquivo foram consolidadas com js/router.js
 * Para evitar conflitos, este arquivo agora serve apenas para reexportar
 * as funções já implementadas no router.
 */

// Redirecionar para as funções já implementadas em router.js
if (typeof window.loadTemplate !== 'function') {
  console.warn('As funções do router não estão disponíveis. Verificar ordem de carregamento.');
}

// Reexportar as funções se já existirem
if (!window.renderTemplate && typeof window.loadTemplate === 'function') {
  /**
   * Renderiza um template com dados
   *
   * @param {string} templateHTML - HTML do template
   * @param {object} data - Dados para renderizar no template
   * @returns {string} - HTML renderizado com os dados
   */
  window.renderTemplate = function(templateHTML, data = {}) {
    // Implementação simples de substituição de variáveis no formato {{variavel}}
    return templateHTML.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
      return data[variable] !== undefined ? data[variable] : match;
    });
  };
}
