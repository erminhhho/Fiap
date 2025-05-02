/**
 * Carregador de templates HTML
 */

// Cache de templates para evitar múltiplas requisições do mesmo template
const templateCache = {};

/**
 * Carrega um template HTML a partir de um arquivo
 *
 * @param {string} templatePath - Caminho para o arquivo de template
 * @returns {Promise<string>} - Promise com o conteúdo HTML do template
 */
async function loadTemplate(templatePath) {
  // Verificar se o template já está em cache
  if (templateCache[templatePath]) {
    return templateCache[templatePath];
  }

  try {
    // Carregar o template via fetch
    const response = await fetch(templatePath);

    if (!response.ok) {
      throw new Error(`Erro ao carregar template: ${response.status} ${response.statusText}`);
    }

    const templateHTML = await response.text();

    // Armazenar em cache para uso futuro
    templateCache[templatePath] = templateHTML;

    return templateHTML;
  } catch (error) {
    console.error(`Erro ao carregar template ${templatePath}:`, error);
    return `<div class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
              <h3 class="font-bold mb-2">Erro ao carregar template</h3>
              <p>Não foi possível carregar o arquivo: ${templatePath}</p>
              <p class="text-sm mt-2">${error.message}</p>
            </div>`;
  }
}

/**
 * Renderiza um template com dados
 *
 * @param {string} templateHTML - HTML do template
 * @param {object} data - Dados para renderizar no template
 * @returns {string} - HTML renderizado com os dados
 */
function renderTemplate(templateHTML, data = {}) {
  // Implementação simples de substituição de variáveis no formato {{variavel}}
  return templateHTML.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
    return data[variable] !== undefined ? data[variable] : match;
  });
}

// Exportar funções para uso global
window.loadTemplate = loadTemplate;
window.renderTemplate = renderTemplate;
