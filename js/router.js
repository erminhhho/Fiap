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

/**
 * Log condicional com base nas configurações de debug
 * @param {string} message - Mensagem a ser registrada
 * @param {Error} [error] - Objeto de erro opcional
 */
function routerLog(message, error) {
  if (window.CONFIG?.debug?.enabled && window.CONFIG.debug.levels.navigation) {
    if (error) {
      console.error(`[Router] ${message}`, error);
    } else {
      console.log(`[Router] ${message}`);
    }
  }
}

// Função para navegar para uma rota
function navigateTo(routeName) {
  routerLog(`Iniciando navegação para: ${routeName}`);

  try {
    if (!routes[routeName]) {
      routerLog(`ERRO: Rota "${routeName}" não encontrada`, new Error('Rota não encontrada'));
      return false;
    }

    const route = routes[routeName];
    const previousRoute = currentRoute;
    currentRoute = routeName;

    // Atualizar a URL com hash
    routerLog(`Atualizando hash para: ${routeName}`);
    window.location.hash = routeName;

    // Atualizar título da página
    routerLog(`Atualizando título da página para: ${route.title}`);
    document.title = `FIAP - ${route.title}`;

    // Marcar o link ativo na navegação
    routerLog('Atualizando link ativo');
    document.querySelectorAll('.step-link').forEach(link => {
      if (link.getAttribute('href') === `#${routeName}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Atualizar o slider da barra de navegação
    routerLog('Atualizando slider da navegação');
    updateNavSlider();

    // Carregar o conteúdo do módulo usando o template HTML
    routerLog(`Carregando template da rota: ${route.templateUrl}`);
    loadModuleWithTemplate(route);

    routerLog(`Navegação concluída com sucesso para: ${routeName}`);
    return true;
  } catch (error) {
    routerLog('ERRO CRÍTICO durante a navegação', error);
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
  routerLog(`Iniciando carregamento do módulo: ${route.scriptUrl}`);
  const appContent = document.getElementById('app-content');

  if (!appContent) {
    routerLog('ERRO: Elemento app-content não encontrado no DOM!', new Error('Elemento não encontrado'));
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
    routerLog(`Carregando template HTML: ${route.templateUrl}`);
    const templateHTML = await loadTemplate(route.templateUrl);
    routerLog('Template HTML carregado com sucesso');

    // Renderizar o template no container
    routerLog('Renderizando template no container');
    appContent.innerHTML = templateHTML;

    // Carregar e executar o script do módulo
    routerLog(`Carregando script do módulo: ${route.scriptUrl}`);
    await loadScript(route.scriptUrl);
    routerLog('Script do módulo carregado com sucesso');

    // Inicializar o módulo se a função estiver definida
    if (typeof window.initModule === 'function') {
      routerLog('Inicializando módulo via window.initModule()');
      window.initModule();
    } else {
      routerLog('Função window.initModule não encontrada');
    }

    // Inicializar o sistema CID se estiver na página de incapacidades
    if (route.scriptUrl.includes('incapacity.js') && typeof window.initCidSystem === 'function') {
      // Inicializa imediatamente
      routerLog('Inicializando sistema CID');
      window.initCidSystem();

      // E também com um pequeno atraso para garantir que todos os elementos foram carregados
      setTimeout(() => {
        routerLog('Re-inicializando sistema CID após delay');
        window.initCidSystem();
      }, 500);
    }

    // Restaurar o estado do formulário para o módulo carregado
    if (window.formStateManager && window.formStateManager.currentFormId) {
      routerLog('Restaurando estado do formulário');
      window.formStateManager.currentStep = route.scriptUrl.split('/').pop().replace('.js', '');
      setTimeout(() => {
        routerLog('Restaurando dados do formulário após delay');
        window.formStateManager.restoreFormData(window.formStateManager.currentStep);
      }, 300);
    } else {
      routerLog('Nenhum estado de formulário para restaurar');
    }

    routerLog('Módulo carregado e inicializado com sucesso');
  } catch (error) {
    routerLog('ERRO ao carregar módulo', error);
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

// Inicializa o router
function initRouter() {
  routerLog('Inicializando o router');

  try {
    // Definir evento para navegação via links
    document.querySelectorAll('.step-link').forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const route = this.getAttribute('href').replace('#', '');
        routerLog(`Link de navegação clicado: ${route}`);
        navigateTo(route);
      });
    });

    // Adicionar listener para eventos de mudança de hash na URL
    window.addEventListener('hashchange', function() {
      routerLog('===== EVENTO HASHCHANGE DETECTADO =====');

      // Obter rota da hash da URL
      const hash = window.location.hash;
      const requestedRoute = hash.replace('#', '');

      routerLog(`Rota solicitada via hash: ${requestedRoute}`);
      routerLog(`Hash completa: ${hash}`);

      if (window.CONFIG?.debug?.enabled && window.CONFIG.debug.levels.navigation) {
        console.log('[Router] Rotas disponíveis:', Object.keys(routes));
        console.log('[Router] A rota existe?', routes[requestedRoute] ? 'Sim' : 'Não');
      }

      // Verificar se a rota existe
      if (routes[requestedRoute]) {
        routerLog(`Chamando navigateTo com rota: ${requestedRoute}`);
        navigateTo(requestedRoute);
      } else if (hash && hash !== '#') {
        // Rota inválida na URL, redirecionar para home
        routerLog(`Rota inválida detectada na URL: ${requestedRoute}`);
        window.location.hash = '';
        navigateTo('home');
      }
    });

    // Verificar se há uma rota na URL inicial
    const initialHash = window.location.hash;
    const initialRoute = initialHash.replace('#', '');

    routerLog(`Rota inicial da hash: ${initialRoute}`);

    // Se não houver rota ou for uma rota inválida, usar a rota padrão
    if (!initialRoute || !routes[initialRoute]) {
      routerLog('Usando rota padrão (home)');
      navigateTo('home');
    } else {
      routerLog(`Navegando para a rota inicial: ${initialRoute}`);
      navigateTo(initialRoute);
    }

    // Ajustar o slider quando a janela for redimensionada
    window.addEventListener('resize', updateNavSlider);

    routerLog('Router inicializado com sucesso');
    return true;
  } catch (error) {
    routerLog('ERRO ao inicializar router', error);
    return false;
  }
}

// Exportar funções
window.navigateTo = navigateTo;
window.initRouter = initRouter;
window.navigateToNextStep = navigateToNextStep;
window.navigateToPreviousStep = navigateToPreviousStep;
window.navigateToPrevStep = navigateToPrevStep;
window.loadTemplate = loadTemplate;
window.renderTemplate = renderTemplate;
