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

// Variável para controlar navegações em andamento
let navigationInProgress = false;

/**
 * Log condicional com base nas configurações de debug
 * @param {string} message - Mensagem a ser registrada
 * @param {Error} [error] - Objeto de erro opcional
 */
function routerLog(message, error) {
  if (window.logSystem) {
    window.logSystem('Navigation', message, error);
    return;
  }

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
  // Evitar navegações múltiplas para a mesma rota ou durante uma navegação em andamento
  if (navigationInProgress || currentRoute === routeName) {
    routerLog(`Navegação ignorada: ${navigationInProgress ? 'navegação em andamento' : 'mesma rota'}`);
    return false;
  }

  // Bloquear novas navegações temporariamente
  navigationInProgress = true;

  routerLog(`Iniciando navegação para: ${routeName}`);

  try {
    if (!routes[routeName]) {
      routerLog(`ERRO: Rota "${routeName}" não encontrada`, new Error('Rota não encontrada'));
      navigationInProgress = false;
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
    loadModuleWithTemplate(route).finally(() => {
      // Desbloquear navegação após finalizar o carregamento do módulo
      setTimeout(() => {
        navigationInProgress = false;
        routerLog(`Navegação desbloqueada após carregamento`);
      }, 300);
    });

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

    // Desbloquear navegação em caso de erro
    navigationInProgress = false;
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

    // Desbloquear navegação em caso de erro
    navigationInProgress = false;
    return false;
  }
}

// Função para atualizar a posição do slider da navegação
function updateNavSlider() {
  const activeStep = document.querySelector('.step-link.active');
  const slider = document.getElementById('nav-slider');

  if (activeStep && slider) {
    const stepRect = activeStep.getBoundingClientRect();
    const navRect = document.querySelector('.main-nav').getBoundingClientRect();

    slider.style.left = `${stepRect.left - navRect.left}px`;
    slider.style.width = `${stepRect.width}px`;
  }
}

// Função para carregar um template HTML
async function loadTemplate(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Erro ao carregar template: ${response.status} ${response.statusText}`);
  }
  return await response.text();
}

// Função para carregar um script JavaScript
async function loadScript(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.onload = () => resolve();
    script.onerror = e => reject(new Error(`Erro ao carregar script: ${url}`));
    document.head.appendChild(script);
  });
}

// Inicializar o sistema de rotas
function initRouter() {
  routerLog('Inicializando sistema de rotas');

  // Navegar para a rota especificada na hash URL, ou para a home se não houver hash
  const initialRoute = window.location.hash.substring(1) || 'home';

  // Configurar listener para mudanças na hash URL
  window.addEventListener('hashchange', function() {
    const route = window.location.hash.substring(1);
    if (route && route !== currentRoute) {
      navigateTo(route);
    }
  });

  // Realizar a navegação inicial
  navigateTo(initialRoute);

  routerLog('Sistema de rotas inicializado com sucesso');
}

// Exportar funções globalmente
window.navigateTo = navigateTo;
window.initRouter = initRouter;
window.updateNavSlider = updateNavSlider;

// Implementar função de navegação para etapas anteriores
window.navigateToPrevStep = function() {
  // Obter a etapa atual
  const currentHash = window.location.hash.substring(1) || 'home';

  // Mapear etapas
  const steps = [
    'home',
    'personal',
    'social',
    'incapacity',
    'professional',
    'documents'
  ];

  // Encontrar a posição atual
  const currentIndex = steps.indexOf(currentHash);

  // Verificar se podemos voltar
  if (currentIndex <= 0) {
    console.log('Já estamos na primeira etapa, não é possível voltar');
    return false;
  }

  // Navegar para a etapa anterior
  const prevStep = steps[currentIndex - 1];
  console.log(`Navegando de ${currentHash} para etapa anterior: ${prevStep}`);

  // Usar a função navigateTo para ir para a etapa anterior
  return navigateTo(prevStep);
};
