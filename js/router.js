/**
 * Sistema simples de rotas para SPA
 * Arquivo consolidado (router + loader)
 */

// Definição das rotas disponíveis
const routes = {
  personal: {
    title: 'Dados Pessoais',
    templateUrl: 'templates/personal.html',
    scriptUrl: 'modules/personal.js',
    step: 1
  },
  social: {
    title: 'Perfil Social',
    templateUrl: 'templates/social.html',
    scriptUrl: 'modules/social.js',
    step: 2
  },
  incapacity: {
    title: 'Incapacidades',
    templateUrl: 'templates/incapacity.html',
    scriptUrl: 'modules/incapacity.js',
    step: 3
  },
  professional: {
    title: 'Atividades Profissionais',
    templateUrl: 'templates/professional.html',
    scriptUrl: 'modules/professional.js',
    step: 4
  },
  documents: {
    title: 'Documentos e Conclusão',
    templateUrl: 'templates/documents.html',
    scriptUrl: 'modules/documents.js',
    step: 5
  }
};

// Mapa de rotas com seus respectivos números de etapas
const routeSteps = {
  'personal': 1,
  'social': 2,
  'incapacity': 3,
  'professional': 4,
  'documents': 5
};

// Estado atual da navegação
let currentRoute = null;

// Função para navegar para uma rota
function navigateTo(routeName) {
  if (!routes[routeName]) {
    console.error(`Rota "${routeName}" não encontrada`);
    return false;
  }

  const route = routes[routeName];
  const previousRoute = currentRoute;
  currentRoute = routeName;

  // Atualizar a URL com hash
  window.location.hash = routeName;

  // Atualizar título da página
  document.title = `FIAP - ${route.title}`;

  // Marcar o link ativo na navegação
  document.querySelectorAll('.step-link').forEach(link => {
    if (link.getAttribute('href') === `#${routeName}`) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Atualizar o slider da barra de navegação
  updateNavSlider();

  // Carregar o conteúdo do módulo usando o template HTML
  loadModuleWithTemplate(route);

  return true;
}

// Função para carregar um módulo via template HTML e script
async function loadModuleWithTemplate(route) {
  const appContent = document.getElementById('app-content');

  // Mostrar indicador de carregamento
  appContent.innerHTML = `
    <div class="flex items-center justify-center h-64">
      <div class="text-center">
        <i class="fas fa-spinner fa-spin text-blue-600 text-4xl mb-4"></i>
        <p class="text-gray-600">Carregando...</p>
      </div>
    </div>
  `;

  try {
    // Carregar o template HTML
    const templateHTML = await loadTemplate(route.templateUrl);

    // Renderizar o template no container
    appContent.innerHTML = templateHTML;

    // Carregar e executar o script do módulo
    await loadScript(route.scriptUrl);

    // Inicializar o módulo se a função estiver definida
    if (typeof window.initModule === 'function') {
      window.initModule();
    }

    // Inicializar o sistema CID se estiver na página de incapacidades
    if (route.scriptUrl.includes('incapacity.js') && typeof window.initCidSystem === 'function') {
      // Inicializa imediatamente
      window.initCidSystem();

      // E também com um pequeno atraso para garantir que todos os elementos foram carregados
      setTimeout(() => {
        window.initCidSystem();
      }, 500);
    }

  } catch (error) {
    console.error('Erro ao carregar módulo:', error);
    appContent.innerHTML = `
      <div class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        <h3 class="font-bold mb-2">Erro ao carregar módulo</h3>
        <p>${error.message}</p>
      </div>
    `;
  }
}

// Função para carregar um script JS de forma assíncrona
function loadScript(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;

    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Não foi possível carregar o script: ${url}`));

    document.body.appendChild(script);
  });
}

// Cache de templates para evitar múltiplas requisições
const templateCache = {};

// Função para carregar um template HTML de forma assíncrona com cache
function loadTemplate(url) {
  // Verificar se o template já está em cache
  if (templateCache[url]) {
    return Promise.resolve(templateCache[url]);
  }

  // Se não estiver em cache, carregar via fetch
  return fetch(url)
    .then(response => {
      if (!response.ok) {
        console.error(`Erro ao carregar template: ${url} - Status: ${response.status}`);
        throw new Error(`Não foi possível carregar o template: ${url}`);
      }
      return response.text();
    })
    .then(html => {
      // Armazenar em cache para uso futuro
      templateCache[url] = html;
      return html;
    });
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

// Função para atualizar o slider da barra de navegação
function updateNavSlider() {
  const activeLink = document.querySelector('.step-link.active');
  const slider = document.querySelector('.nav-slider');

  if (activeLink && slider) {
    const rect = activeLink.getBoundingClientRect();
    const containerRect = activeLink.parentElement.getBoundingClientRect();

    slider.style.width = `${rect.width}px`;
    slider.style.left = `${rect.left - containerRect.left}px`;
  }
}

// Função para navegar para a próxima etapa
function navigateToNextStep() {
  // Obtém a rota atual
  const currentRoute = window.location.hash.substring(1) || 'personal';

  // Obtém o número da etapa atual
  const currentStep = routeSteps[currentRoute];

  // Encontra a próxima rota baseada no número da etapa
  let nextRoute = '';
  Object.entries(routeSteps).forEach(([route, step]) => {
    if (step === currentStep + 1) {
      nextRoute = route;
    }
  });

  // Se encontrou uma próxima rota, navega para ela
  if (nextRoute) {
    window.location.hash = nextRoute;
    return true;
  }

  return false; // Não há próxima etapa
}

// Função para navegar para a etapa anterior
function navigateToPrevStep() {
  // Obtém a rota atual
  const currentRoute = window.location.hash.substring(1) || 'personal';

  // Obtém o número da etapa atual
  const currentStep = routeSteps[currentRoute];

  // Encontra a rota anterior baseada no número da etapa
  let prevRoute = '';
  Object.entries(routeSteps).forEach(([route, step]) => {
    if (step === currentStep - 1) {
      prevRoute = route;
    }
  });

  // Se encontrou uma rota anterior, navega para ela
  if (prevRoute) {
    window.location.hash = prevRoute;
    return true;
  }

  return false; // Não há etapa anterior
}

// Inicialização do router
function initRouter() {
  // Adicionar listeners para os links de navegação
  document.querySelectorAll('.step-link').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const route = this.getAttribute('href').substring(1); // Remover o # do início
      navigateTo(route);
    });
  });

  // Ouvir mudanças na hash da URL
  window.addEventListener('hashchange', function() {
    const route = window.location.hash.substring(1);
    if (route && routes[route]) {
      // Limpar flags de inicialização ao mudar de rota via hash
      if (route === 'professional') {
        window._professionalInitialized = false;
      }
      navigateTo(route);
    }
  });

  // Navegar para a rota inicial
  const initialRoute = window.location.hash.substring(1);
  if (initialRoute === 'professional') {
    window._professionalInitialized = false;
  }
  navigateTo(initialRoute && routes[initialRoute] ? initialRoute : 'personal');

  // Ajustar o slider quando a janela for redimensionada
  window.addEventListener('resize', updateNavSlider);
}

// Exportar funções
window.navigateTo = navigateTo;
window.initRouter = initRouter;
window.navigateToNextStep = navigateToNextStep;
window.navigateToPreviousStep = navigateToPreviousStep;
window.navigateToPrevStep = navigateToPrevStep;
window.loadTemplate = loadTemplate;
window.renderTemplate = renderTemplate;
