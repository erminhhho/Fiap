/**
 * Sistema simples de rotas para SPA
 * Arquivo consolidado (router + loader)
 */

// Definição das rotas disponíveis
const routes = {
  home: {
    title: 'Dashboard',
    templateUrl: 'templates/home.html',
    scriptUrl: 'modules/home.js',
    step: 0
  },
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
  'home': 0,
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
  console.log('[navigateTo] Iniciando navegação para:', routeName);

  try {
    if (!routes[routeName]) {
      console.error(`[navigateTo] ERRO: Rota "${routeName}" não encontrada`);
      return false;
    }

    const route = routes[routeName];
    const previousRoute = currentRoute;
    currentRoute = routeName;

    // Atualizar a URL com hash
    console.log('[navigateTo] Atualizando hash para:', routeName);
    window.location.hash = routeName;

    // Atualizar título da página
    console.log('[navigateTo] Atualizando título da página para:', route.title);
    document.title = `FIAP - ${route.title}`;

    // Marcar o link ativo na navegação
    console.log('[navigateTo] Atualizando link ativo');
    document.querySelectorAll('.step-link').forEach(link => {
      if (link.getAttribute('href') === `#${routeName}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Atualizar o slider da barra de navegação
    console.log('[navigateTo] Atualizando slider da navegação');
    updateNavSlider();

    // Carregar o conteúdo do módulo usando o template HTML
    console.log('[navigateTo] Carregando template da rota:', route.templateUrl);
    loadModuleWithTemplate(route);

    console.log('[navigateTo] Navegação concluída com sucesso para:', routeName);
    return true;
  } catch (error) {
    console.error('[navigateTo] ERRO CRÍTICO durante a navegação:', error);
    const appContent = document.getElementById('app-content');
    if (appContent) {
      appContent.innerHTML = `
        <div class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <h3 class="font-bold mb-2">Erro durante a navegação</h3>
          <p>${error.message}</p>
          <pre class="mt-2 bg-red-100 p-2 rounded text-xs overflow-auto">${error.stack}</pre>
        </div>
      `;
    }
    return false;
  }
}

// Função para carregar um módulo via template HTML e script
async function loadModuleWithTemplate(route) {
  console.log('[loadModuleWithTemplate] Iniciando carregamento do módulo:', route.scriptUrl);
  const appContent = document.getElementById('app-content');

  if (!appContent) {
    console.error('[loadModuleWithTemplate] ERRO: Elemento app-content não encontrado no DOM!');
    return;
  }

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
    console.log('[loadModuleWithTemplate] Carregando template HTML:', route.templateUrl);
    const templateHTML = await loadTemplate(route.templateUrl);
    console.log('[loadModuleWithTemplate] Template HTML carregado com sucesso');

    // Renderizar o template no container
    console.log('[loadModuleWithTemplate] Renderizando template no container');
    appContent.innerHTML = templateHTML;

    // Carregar e executar o script do módulo
    console.log('[loadModuleWithTemplate] Carregando script do módulo:', route.scriptUrl);
    await loadScript(route.scriptUrl);
    console.log('[loadModuleWithTemplate] Script do módulo carregado com sucesso');

    // Inicializar o módulo se a função estiver definida
    if (typeof window.initModule === 'function') {
      console.log('[loadModuleWithTemplate] Inicializando módulo via window.initModule()');
      window.initModule();
    } else {
      console.warn('[loadModuleWithTemplate] Função window.initModule não encontrada');
    }

    // Inicializar o sistema CID se estiver na página de incapacidades
    if (route.scriptUrl.includes('incapacity.js') && typeof window.initCidSystem === 'function') {
      // Inicializa imediatamente
      console.log('[loadModuleWithTemplate] Inicializando sistema CID');
      window.initCidSystem();

      // E também com um pequeno atraso para garantir que todos os elementos foram carregados
      setTimeout(() => {
        console.log('[loadModuleWithTemplate] Re-inicializando sistema CID após delay');
        window.initCidSystem();
      }, 500);
    }

    // Restaurar o estado do formulário para o módulo carregado
    if (window.formStateManager && window.formStateManager.currentFormId) {
      console.log('[loadModuleWithTemplate] Restaurando estado do formulário');
      window.formStateManager.currentStep = route.scriptUrl.split('/').pop().replace('.js', '');
      setTimeout(() => {
        console.log('[loadModuleWithTemplate] Restaurando dados do formulário após delay');
        window.formStateManager.restoreFormData(window.formStateManager.currentStep);
      }, 300);
    } else {
      console.log('[loadModuleWithTemplate] Nenhum estado de formulário para restaurar');
    }

    console.log('[loadModuleWithTemplate] Módulo carregado e inicializado com sucesso');
  } catch (error) {
    console.error('[loadModuleWithTemplate] ERRO ao carregar módulo:', error);
    appContent.innerHTML = `
      <div class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        <h3 class="font-bold mb-2">Erro ao carregar módulo</h3>
        <p>${error.message}</p>
        <p class="mt-2"><b>Detalhes técnicos:</b></p>
        <pre class="mt-2 bg-red-100 p-2 rounded text-xs overflow-auto">${error.stack}</pre>
        <div class="mt-4">
          <button onclick="navigateTo('home')" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
            Voltar para Home
          </button>
        </div>
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
  console.log('[initRouter] Inicializando o router');

  // Adicionar listeners para os links de navegação
  document.querySelectorAll('.step-link').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const route = this.getAttribute('href').substring(1); // Remover o # do início
      console.log('[initRouter] Link de navegação clicado:', route);
      navigateTo(route);
    });
  });

  // Ouvir mudanças na hash da URL
  window.addEventListener('hashchange', function() {
    console.log('===== EVENTO HASHCHANGE DETECTADO =====');
    const route = window.location.hash.substring(1);
    console.log('Rota solicitada via hash:', route);
    console.log('Hash completa:', window.location.hash);
    console.log('Rotas disponíveis:', Object.keys(routes));
    console.log('A rota existe?', routes[route] ? 'Sim' : 'Não');

    if (route && routes[route]) {
      // Limpar flags de inicialização ao mudar de rota via hash
      if (route === 'professional') {
        window._professionalInitialized = false;
      }
      console.log('Chamando navigateTo com rota:', route);
      navigateTo(route);
    } else {
      console.warn('A rota não foi encontrada ou está vazia. Não realizando navegação.');
    }
  });

  // Navegar para a rota inicial
  const initialRoute = window.location.hash.substring(1);
  console.log('[initRouter] Rota inicial da hash:', initialRoute);

  // Verificar se a rota é válida
  let targetRoute = 'home'; // Default

  if (initialRoute && routes[initialRoute]) {
    console.log('[initRouter] Usando rota da hash:', initialRoute);
    targetRoute = initialRoute;
  } else {
    console.log('[initRouter] Usando rota padrão (home)');
  }

  if (targetRoute === 'professional') {
    window._professionalInitialized = false;
  }

  console.log('[initRouter] Navegando para a rota inicial:', targetRoute);
  navigateTo(targetRoute);

  // Ajustar o slider quando a janela for redimensionada
  window.addEventListener('resize', updateNavSlider);

  console.log('[initRouter] Router inicializado com sucesso');
}

// Exportar funções
window.navigateTo = navigateTo;
window.initRouter = initRouter;
window.navigateToNextStep = navigateToNextStep;
window.navigateToPreviousStep = navigateToPreviousStep;
window.navigateToPrevStep = navigateToPrevStep;
window.loadTemplate = loadTemplate;
window.renderTemplate = renderTemplate;
