/**
 * Sistema de Classes Tailwind Centralizadas
 * Este arquivo permite reutilizar classes Tailwind comuns sem repetição de código
 */

// Namespace para classes Tailwind
FIAP.tw = {
  // Classes para formulários
  form: {
    // Campos de entrada
    input: "peer w-full rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 px-4 py-3 text-gray-800 bg-gray-50 placeholder-gray-400 transition-colors duration-200",

    // Labels de formulário
    label: "absolute left-4 -top-3 px-1 text-sm text-transparent bg-transparent rounded-t-lg rounded-b-none transition-all duration-200 pointer-events-none peer-focus:text-blue-600 peer-focus:-top-3 peer-focus:bg-gray-50 peer-focus:text-blue-600 peer-focus:rounded-t-lg peer-focus:rounded-b-none peer-focus:text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:bg-transparent peer-placeholder-shown:rounded-none peer-placeholder-shown:text-transparent",

    // Textareas
    textarea: "peer w-full rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 px-4 py-3 text-gray-800 bg-gray-50 placeholder-gray-400 transition-colors duration-200 resize-vertical",

    // Campos somente-leitura
    readonly: "peer w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 bg-gray-50 placeholder-gray-400 transition-colors duration-200 cursor-not-allowed"
  },

  // Classes para botões
  button: {
    // Botão primário
    primary: "bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-8 py-3 text-base shadow transition focus:outline-none focus:ring-2 focus:ring-blue-300 flex items-center gap-2",

    // Botão secundário
    secondary: "bg-white hover:bg-gray-100 text-blue-600 font-semibold rounded-lg px-8 py-3 text-base shadow border border-blue-200 transition focus:outline-none focus:ring-2 focus:ring-blue-100 flex items-center gap-2",

    // Botão de adicionar (circular)
    add: "bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1 ml-2 flex items-center justify-center w-8 h-8 self-center",

    // Botão de remover (circular)
    remove: "bg-red-500 hover:bg-red-600 text-white rounded-full p-1 ml-2 flex items-center justify-center w-8 h-8 self-center",

    // Botão de ação (ícones da navbar)
    action: "text-gray-500 hover:text-blue-600 transition"
  },

  // Classes para cards e containers
  container: {
    // Card principal
    card: "bg-white rounded-2xl shadow p-8 mb-8",

    // Cabeçalho de seção
    header: "flex items-center gap-2 mb-4",

    // Título da seção
    title: "text-lg font-semibold text-blue-600",

    // Ícone da seção
    icon: "text-blue-500 text-2xl"
  },

  // Classes para grids e layouts
  layout: {
    // Grid padrão de 2 colunas
    grid2: "grid grid-cols-1 md:grid-cols-2 gap-6",

    // Grid de 12 colunas
    grid12: "grid grid-cols-1 md:grid-cols-12 gap-6 mb-6",

    // Layout flexível com espaçamento
    flex: "flex items-center gap-2"
  },

  // Utilitários
  util: {
    // Container relativo (para posicionamento absoluto interno)
    relative: "relative",

    // Margens comuns
    mb4: "mb-4",
    mb6: "mb-6",
    mb8: "mb-8",
    mt4: "mt-4",

    // Alinhamento horizontal
    alignRight: "flex justify-end",
    alignCenter: "flex justify-center",
    alignBetween: "flex justify-between"
  }
};

/**
 * Função para aplicar classes Tailwind centralizadas aos elementos
 * @param {string} selector - Seletor CSS para encontrar os elementos
 * @param {string} classPath - Caminho do objeto para as classes (ex: 'button.primary')
 */
FIAP.tw.apply = function(selector, classPath) {
  // Obter as classes do caminho fornecido
  const classes = classPath.split('.').reduce((obj, path) => obj?.[path], FIAP.tw);

  if (!classes) {
    console.error(`Classes não encontradas no caminho: ${classPath}`);
    return;
  }

  // Aplicar as classes aos elementos selecionados
  document.querySelectorAll(selector).forEach(element => {
    // Adicionar cada classe individualmente para não substituir as classes existentes
    classes.split(' ').forEach(className => {
      if (className) element.classList.add(className);
    });
  });
};

/**
 * Função para aplicar classes a um elemento específico
 * @param {Element} element - Elemento DOM para aplicar as classes
 * @param {string} classPath - Caminho do objeto para as classes (ex: 'button.primary')
 */
FIAP.tw.applyTo = function(element, classPath) {
  if (!element) return;

  // Obter as classes do caminho fornecido
  const classes = classPath.split('.').reduce((obj, path) => obj?.[path], FIAP.tw);

  if (!classes) {
    console.error(`Classes não encontradas no caminho: ${classPath}`);
    return;
  }

  // Adicionar cada classe individualmente para não substituir classes existentes
  classes.split(' ').forEach(className => {
    if (className) element.classList.add(className);
  });
};

/**
 * Função para obter as classes como string
 * @param {string} classPath - Caminho do objeto para as classes (ex: 'button.primary')
 * @returns {string} Classes Tailwind como string
 */
FIAP.tw.get = function(classPath) {
  // Obter as classes do caminho fornecido
  const classes = classPath.split('.').reduce((obj, path) => obj?.[path], FIAP.tw);

  if (!classes) {
    console.error(`Classes não encontradas no caminho: ${classPath}`);
    return '';
  }

  return classes;
};

// Função para inicializar os elementos comuns após o DOM ter carregado
FIAP.tw.init = function() {
  // Aplicar classes aos botões de navegação (anterior/próximo) em todas as páginas
  document.querySelectorAll('#btn-next').forEach(btn => {
    FIAP.tw.applyTo(btn, 'button.primary');
  });

  document.querySelectorAll('#btn-back').forEach(btn => {
    FIAP.tw.applyTo(btn, 'button.secondary');
  });

  // Aplicar classes aos botões de ação na navbar
  document.querySelectorAll('.navbar-action').forEach(btn => {
    FIAP.tw.applyTo(btn, 'button.action');
  });
};

// Executar inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', FIAP.tw.init);

// Executar inicialização também quando uma nova página for carregada pelo router
document.addEventListener('stepChanged', FIAP.tw.init);

// Alias para compatibilidade e conveniência
window.tw = FIAP.tw;
window.applyTw = FIAP.tw.apply;
window.applyTwTo = FIAP.tw.applyTo;
