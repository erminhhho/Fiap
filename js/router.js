/**
 * Sistema simples de rotas para SPA
 * Arquivo consolidado (router + loader)
 *
 * IMPORTANTE: Este arquivo trabalha em conjunto com navigation.js.
 * - Router.js gerencia o carregamento de templates, scripts e a definição de rotas
 * - Navigation.js gerencia o estado de navegação e a lógica de interface do usuário
 *
 * ARQUITETURA DE INTEGRAÇÃO:
 * 1. Router.js é responsável por:
 *    - Gerenciar as definições de rotas (templates, scripts, títulos)
 *    - Controlar a navegação efetiva entre páginas
 *    - Carregar templates HTML e scripts dos módulos
 *    - Inicializar os módulos após carregamento
 *    - Sincronizar dados entre módulos relacionados (personal ↔ social)
 *    - Notificar outros sistemas sobre mudanças de rota
 *
 * 2. Pontos de integração com Navigation.js:
 *    - As funções `navigateTo` e `navigateToLegacy` servem como ponte entre os sistemas
 *    - O mapeamento de rotas é sincronizado com navigation.js via stepMap
 *    - Eventos 'stepChanged' são emitidos para notificar Navigation.js
 *    - O Router verifica se Navigation.js está disponível e o utiliza quando possível
 *
 * FLUXO DE NAVEGAÇÃO:
 * 1. Uma solicitação de navegação chega via hash URL ou chamada direta
 * 2. Router.js verifica se Navigation.js está disponível e delega se possível
 * 3. Caso contrário, Router.js executa a navegação pelo sistema legado
 * 4. Carrega o template HTML e script do módulo
 * 5. Inicializa o módulo com estado adequado
 * 6. Notifica outros sistemas através de eventos customizados
 *
 * As funções e mapeamentos deste arquivo são sincronizados com navigation.js
 * para garantir consistência na navegação.
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
  },
  tests: {
    title: 'Sistema de Testes',
    templateUrl: 'templates/tests.html',
    scriptUrl: 'modules/tests.js',
    step: -1 // Atualizado para corresponder ao Navigation.js
  }
};

// Estado atual da navegação
let currentRoute = null;

// Variável para controlar navegações em andamento
let navigationInProgress = false;

// Variável para controlar sincronização de dados
if (typeof window._syncInProgress === 'undefined') {
  window._syncInProgress = false;
}

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

/**
 * Função principal para navegação entre rotas.
 * Implementa um sistema de ponte entre navigation.js e router.js
 *
 * FLUXO DE INTEGRAÇÃO:
 * 1. Verifica se o Navigation.js está disponível
 * 2. Se estiver disponível, delega a navegação para ele
 * 3. Caso contrário, usa o sistema legado (navigateToLegacy)
 *
 * @param {string} routeName - O nome da rota para a qual navegar
 * @returns {boolean} - Sucesso ou falha da navegação
 */
function navigateTo(routeName) {
  routerLog(`Navegação solicitada para: ${routeName}`);

  // Verificar se Navigation.js está disponível e funcional
  if (window.Navigation && typeof window.Navigation.navigateToStep === 'function') {
    routerLog(`Delegando navegação para Navigation.js: ${routeName}`);
    return window.Navigation.navigateToStep(routeName);
  }

  // Se Navigation.js não estiver disponível, usar sistema legado
  routerLog(`Usando sistema legado para: ${routeName}`);
  return navigateToLegacy(routeName);
}

// Sistema legado de navegação (mantido como fallback)
function navigateToLegacy(routeName) {
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
    currentRoute = routeName;    // ETAPA 1: Proteção contra sincronização conflitante
    if (window._syncInProgress) {
      routerLog('Sincronização já em andamento, aguardando...');
      setTimeout(() => navigateTo(routeName), 100);
      return false;
    }    // CORREÇÃO CRÍTICA: Sincronização bidireccional entre módulos
    if ((routeName === 'social' && previousRoute === 'personal') ||
        (routeName === 'personal' && previousRoute === 'social')) {

      syncPersonalAndSocialData(routeName, previousRoute);
    }
    // FIM DA SINCRONIZAÇÃO

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

    // Notificar mudança de rota através de evento customizado
    notifyRouteChange(routeName);

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
    }    // Desbloquear navegação em caso de erro
    navigationInProgress = false;
    return false;
  }
} // Fim da função navigateToLegacy

// Exportar a função navigateToLegacy para o escopo global
// para permitir que o sistema de navegação a utilize como fallback
window.navigateToLegacy = navigateToLegacy;

// Funções para barra de progresso e fade
function showProgressBar() {
  let bar = document.getElementById('progress-bar');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'progress-bar';
    document.body.appendChild(bar);
  }
  // Reset
  clearInterval(bar._intervalId);
  bar.style.opacity = '1';
  bar.style.width = '0%';
  // Primeira animação até 20%
  setTimeout(() => { bar.style.width = '20%'; }, 10);
  // Trickle até 90% a cada 500ms
  bar._intervalId = setInterval(() => {
    let w = parseFloat(bar.style.width);
    if (w < 90) bar.style.width = (w + 2) + '%';
    else clearInterval(bar._intervalId);
  }, 500);
}

function completeProgressBar() {
  const bar = document.getElementById('progress-bar');
  if (bar) {
    clearInterval(bar._intervalId);
    bar.style.width = '100%';
    setTimeout(() => {
      bar.style.opacity = '0';
      setTimeout(() => bar.remove(), 300);
    }, 300);
  }
}

async function loadModuleWithTemplate(route) {
  routerLog(`Iniciando carregamento do módulo: ${route.scriptUrl}`);
  const appContent = document.getElementById('app-content');

  if (!appContent) {
    routerLog('ERRO: Elemento app-content não encontrado no DOM!', new Error('Elemento não encontrado'));
    return;
  }

  // Iniciar barra de progresso e aplicar fade-out
  showProgressBar();
  appContent.classList.remove('fade-in');
  appContent.classList.add('fade-out');

  try {
    // Carregar o template HTML
    routerLog(`Carregando template HTML: ${route.templateUrl}`);
    const templateHTML = await loadTemplate(route.templateUrl);
    routerLog('Template HTML carregado com sucesso');

    // Carregar o script do módulo (pré-carregamento)
    routerLog(`Pré-carregando script do módulo: ${route.scriptUrl}`);
    const scriptLoadPromise = loadScript(route.scriptUrl);

    // Esperar um tempo curto para a animação de fade-out
    await new Promise(resolve => setTimeout(resolve, 150));

    // Renderizar o template no container
    routerLog('Renderizando template no container');
    appContent.innerHTML = templateHTML;

    // Aguardar o carregamento completo do script
    await scriptLoadPromise;
    routerLog('Script do módulo carregado com sucesso');

    // Finalizar barra de progresso
    completeProgressBar();

    // Executar scripts inline para a página de testes
    if (route.scriptUrl.includes('tests.js')) {
      routerLog('Executando scripts inline para módulo de testes');

      // Re-executar os scripts inline do tests.html
      const scripts = appContent.querySelectorAll('script');
      scripts.forEach(script => {
        if (script.innerHTML.trim()) {
          try {
            // Criar novo script para re-executar
            const newScript = document.createElement('script');
            newScript.innerHTML = script.innerHTML;
            document.head.appendChild(newScript);
            document.head.removeChild(newScript);
          } catch (error) {
            console.warn('Erro ao re-executar script inline:', error);
          }
        }
      });    }

    // Aplicar fade-in somente após a inicialização do módulo
    const isSocialPage = route.scriptUrl.includes('social.js');
    const isTestsPage = route.scriptUrl.includes('tests.js');

    if (!isSocialPage && !isTestsPage) {
      // Para outras páginas, aplicar fade-in imediatamente
      appContent.classList.remove('fade-out');
      appContent.classList.add('fade-in');
    }

    // Determinar atraso apropriado com base no tipo de página
    const delay = isTestsPage ? 500 : 0;

    setTimeout(async () => {
      // Inicializar o módulo usando nossa função centralizada
      const initSuccess = await initializeModule(route);

      routerLog(`Inicialização do módulo ${initSuccess ? 'bem-sucedida' : 'não realizada'}`);

      // Casos especiais para páginas específicas
      if (route.scriptUrl.includes('incapacity.js') && typeof window.initCidSystem === 'function') {
        routerLog('Inicializando sistema CID');
        await window.initCidSystem();
      }

      // Aplicar fade-in após inicialização para páginas especiais
      if (isSocialPage || isTestsPage || !initSuccess) {
        requestAnimationFrame(() => {
          appContent.classList.remove('fade-out');
          appContent.classList.add('fade-in');
        });
      }

      // Configurar botões contextuais
      if (typeof window.setupContextualButtons === 'function') {
        routerLog('Configurando botões contextuais');
        const currentModule = route.scriptUrl.split('/').pop().replace('.js', '');
        window.setupContextualButtons(currentModule);
      }

      // Notificar que o módulo foi carregado
      document.dispatchEvent(new CustomEvent('moduleLoaded', {
        detail: { route: currentRoute, timestamp: Date.now() }
      }));
    }, delay);

    // Para páginas não especiais, aplicar fade-in imediatamente
    if (!isSocialPage && !isTestsPage) {
      appContent.classList.remove('fade-out');
      appContent.classList.add('fade-in');
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
  const slider = document.querySelector('.nav-slider');
  const mainNav = document.querySelector('.main-nav');

  if (!slider || !mainNav) {
    console.warn('[Router] Slider ou mainNav não encontrado para updateNavSlider.');
    return;
  }

  if (activeStep) {
    const containerRect = mainNav.getBoundingClientRect();
    const activeRect = activeStep.getBoundingClientRect();
    // Calcula o offset relativo ao container
    const offsetLeft = activeRect.left - containerRect.left;
    const width = activeRect.width;
    // Aplica transform e largura para animar o slider
    slider.style.transform = `translateX(${offsetLeft}px)`;
    slider.style.width = `${width}px`;
    slider.style.opacity = '1';
  } else if (currentRoute === 'home') {
    const homeLink = document.querySelector('.step-link[href="#home"]');
    if (homeLink) {
      if (!homeLink.classList.contains('active')) {
        document.querySelectorAll('.step-link.active').forEach(link => link.classList.remove('active'));
        homeLink.classList.add('active');
      }
      const containerRect = mainNav.getBoundingClientRect();
      const homeRect = homeLink.getBoundingClientRect();
      const offsetLeft = homeRect.left - containerRect.left;
      const width = homeRect.width;
      slider.style.transform = `translateX(${offsetLeft}px)`;
      slider.style.width = `${width}px`;
      slider.style.opacity = '1';
    } else {
      slider.style.opacity = '0';
      slider.style.transform = 'translateX(-100%)';
      slider.style.width = '0px';
    }
  } else {
    slider.style.opacity = '0';
    slider.style.transform = 'translateX(-100%)';
    slider.style.width = '0px';
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
    // Verificar se o script já foi carregado
    const existingScript = document.querySelector(`script[src="${url}"]`);
    if (existingScript) {
      console.log(`[Router] Script já carregado: ${url}`);
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = url;
    script.onload = () => resolve();
    script.onerror = e => reject(new Error(`Erro ao carregar script: ${url}`));
    document.head.appendChild(script);
  });
}

// Sistema de Roteamento SPA

class SPARouter {
    constructor() {
        this.routes = {
            '': 'home',
            'home': 'home',
            'tests': 'tests',
            'personal': 'personal',
            'social': 'social',
            'incapacity': 'incapacity',
            'professional': 'professional',
            'documents': 'documents'
        };

        this.init();
    }

    init() {
        // Escutar mudanças na URL
        window.addEventListener('hashchange', () => this.handleRoute());
        window.addEventListener('load', () => this.handleRoute());
    }

    handleRoute() {
        const hash = window.location.hash.slice(1); // Remove o #
        const route = this.routes[hash] || hash;

        console.log(`[ROUTER] Navegando para: ${route}`);

        // Usar navigateTo em vez de loadContent
        if (route && typeof navigateTo === 'function') {
            navigateTo(route);
        }
    }

    navigate(route) {
        window.location.hash = route;
    }
}

// Inicializar roteador
const router = new SPARouter();
window.router = router;

/**
 * Inicializa e sincroniza o sistema de navegação completo.
 * Esta função combina a inicialização do router com as verificações de sincronização.
 */
function initRouter() {
  routerLog('Inicializando sistema de rotas');

  // Sincronizar com Navigation.js se disponível
  syncWithNavigationModule();

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
window.navigateToLegacy = navigateToLegacy;
window.initRouter = initRouter;
window.updateNavSlider = updateNavSlider;
window.syncPersonalAndSocialData = syncPersonalAndSocialData;
window.initializeModule = initializeModule;
window.notifyRouteChange = notifyRouteChange;

// Verificar se a configuração de rotas está sincronizada com navigation.js
function syncWithNavigationModule() {
  if (window.Navigation && window.Navigation.stepMap) {
    routerLog('Sincronizando mapeamento de rotas com Navigation.js');

    // Sincronizar os valores de step com os índices no Navigation.js
    for (const [step, config] of Object.entries(window.Navigation.stepMap)) {
      if (routes[step] && config.index !== undefined) {
        if (routes[step].step !== config.index) {
          routerLog(`Atualizando índice para "${step}": ${routes[step].step} → ${config.index}`);
          routes[step].step = config.index;
        }
      }
    }
  }
}

// Executar sincronização quando o módulo carregar
document.addEventListener('DOMContentLoaded', syncWithNavigationModule);

/**
 * Função para notificar mudanças de etapa/rota através de eventos.
 * Isso permite que outros módulos (como navigation.js) respondam a mudanças de rota.
 *
 * OBJETIVO: Centralizar comunicação entre sistemas
 * 1. Dispara evento 'stepChanged' com detalhes da navegação
 * 2. Registra informações úteis no payload do evento
 * 3. Permite que qualquer sistema inscrito responda à mudança
 *
 * @param {string} route - Nome da rota ativa
 */
function notifyRouteChange(route) {
  routerLog(`Disparando evento de mudança de rota para: ${route}`);

  // Coletar informações da rota atual
  const routeConfig = routes[route] || {};
  const previousRoute = currentRoute !== route ? currentRoute : null;
  const routeStep = routeConfig.step !== undefined ? routeConfig.step : -1;

  // Criar payload rico com todas as informações relevantes
  const eventDetail = {
    route: route,
    previousRoute: previousRoute,
    step: routeStep,
    title: routeConfig.title,
    timestamp: Date.now(),
    isSpecialRoute: routeStep < 0
  };

  // Disparar evento com payload completo
  const event = new CustomEvent('stepChanged', { detail: eventDetail });
  document.dispatchEvent(event);

  // Registrar para debugging
  routerLog(`Evento stepChanged disparado: ${route} (step ${routeStep})`);
}

/**
 * Função para sincronizar dados entre os módulos personal e social
 * Extrai a lógica de sincronização para melhorar a manutenção
 *
 * FLUXO DE SINCRONIZAÇÃO BIDIRECIONAL:
 * 1. Salva o estado atual para evitar conflitos
 * 2. Verifica disponibilidade do gerenciador de estado
 * 3. Realiza sincronização de personal → social (assistido → familiar)
 * 4. Realiza sincronização de social → personal (familiar → assistido)
 * 5. Restaura o estado e notifica sobre a sincronização
 *
 * @param {string} targetRoute - Rota de destino
 * @param {string} previousRoute - Rota de origem
 */
function syncPersonalAndSocialData(targetRoute, previousRoute) {
  window._syncInProgress = true;

  try {
    routerLog(`Iniciando sincronização bidirecional: ${previousRoute} ↔ ${targetRoute}`);

    if (!window.formStateManager || !window.formStateManager.formData) {
      routerLog('FormStateManager não disponível, sincronização ignorada');
      return;
    }

    const personalData = window.formStateManager.formData.personal || {};
    const socialData = window.formStateManager.formData.social || {};

    // Sincronização de dados pessoais → sociais (assistido → família)
    if (personalData && personalData.autor_nome && personalData.autor_nome.length > 0) {
      syncAssistidoToFamiliar(personalData, socialData);
    }

    // Sincronização reversa (social → personal) quando navegando para personal
    if (targetRoute === 'personal' && socialData.familiar_nome && socialData.familiar_nome[0]) {
      syncFamiliarToAssistido(socialData, personalData);
    }

    // Notificar que os dados foram sincronizados
    document.dispatchEvent(new CustomEvent('dataSynchronized', {
      detail: {
        direction: `${previousRoute} → ${targetRoute}`,
        timestamp: Date.now()
      }
    }));

    routerLog(`Sincronização bidireccional concluída: ${previousRoute} ↔ ${targetRoute}`);
  } catch (error) {
    routerLog('Erro durante sincronização de dados', error);
  } finally {
    window._syncInProgress = false;
  }
}

/**
 * Sincroniza dados do assistido para o primeiro familiar
 * @param {Object} personalData - Dados pessoais
 * @param {Object} socialData - Dados sociais
 */
function syncAssistidoToFamiliar(personalData, socialData) {
  const assistidoNome = personalData.autor_nome[0] || '';
  const assistidoCpf = (personalData.autor_cpf && personalData.autor_cpf.length > 0) ? personalData.autor_cpf[0] : '';
  let assistidoIdade = '';

  if (personalData.autor_idade && personalData.autor_idade.length > 0) {
    assistidoIdade = personalData.autor_idade[0] || '';
  } else if (personalData.autor_nascimento && personalData.autor_nascimento.length > 0) {
    const dataNascimentoStr = personalData.autor_nascimento[0];
    if (dataNascimentoStr && typeof calcularIdadeCompleta === 'function') {
      try {
        const dataNasc = new Date(dataNascimentoStr.split('/').reverse().join('-'));
        if (!isNaN(dataNasc.getTime())) {
          const idadeObj = calcularIdadeCompleta(dataNasc);
          assistidoIdade = `${idadeObj.anos} anos`;
        }
      } catch(e) {
        routerLog("Erro ao calcular idade para sincronização", e);
      }
    }
  }

  // Atualizar dados do assistido para o primeiro familiar
  if (!socialData.familiar_nome) socialData.familiar_nome = [];
  if (!socialData.familiar_cpf) socialData.familiar_cpf = [];
  if (!socialData.familiar_idade) socialData.familiar_idade = [];
  if (!socialData.familiar_parentesco) socialData.familiar_parentesco = [];

  socialData.familiar_nome[0] = assistidoNome;
  socialData.familiar_cpf[0] = assistidoCpf;
  socialData.familiar_idade[0] = assistidoIdade;
  socialData.familiar_parentesco[0] = 'Assistido';

  window.formStateManager.formData.social = socialData;
  routerLog('Dados de personal → social sincronizados');
}

/**
 * Sincroniza dados do primeiro familiar para o assistido
 * @param {Object} socialData - Dados sociais
 * @param {Object} personalData - Dados pessoais
 */
function syncFamiliarToAssistido(socialData, personalData) {
  if (!personalData.autor_nome) personalData.autor_nome = [];
  if (!personalData.autor_cpf) personalData.autor_cpf = [];
  if (!personalData.autor_idade) personalData.autor_idade = [];

  personalData.autor_nome[0] = socialData.familiar_nome[0];
  if (socialData.familiar_cpf && socialData.familiar_cpf[0]) {
    personalData.autor_cpf[0] = socialData.familiar_cpf[0];
  }
  if (socialData.familiar_idade && socialData.familiar_idade[0]) {
    personalData.autor_idade[0] = socialData.familiar_idade[0];
  }

  window.formStateManager.formData.personal = personalData;
  routerLog('Dados de social → personal sincronizados');
}

/**
 * Função para inicializar o módulo de maneira consistente.
 * Esta função garante que os módulos sejam inicializados da mesma forma
 * independentemente de qual sistema de navegação está sendo usado.
 *
 * PROCESSO DE INICIALIZAÇÃO:
 * 1. Tenta inicializar via window.initModule (interface padrão)
 * 2. Se não disponível, tenta função específica do módulo (ex: initPersonalModule)
 * 3. Aplica personalizações específicas do módulo
 * 4. Notifica o sistema sobre a inicialização
 *
 * @param {Object} route - Configuração da rota
 * @returns {Promise<boolean>} - Sucesso ou falha da inicialização
 */
async function initializeModule(route) {
  const moduleName = route.scriptUrl.split('/').pop().replace('.js', '');
  routerLog(`Inicializando módulo: ${moduleName}`);

  let initSuccess = false;

  try {
    // Estratégia 1: Inicializar o módulo via função padrão
    if (typeof window.initModule === 'function') {
      routerLog('Executando window.initModule()');
      await window.initModule();
      initSuccess = true;
    }
    // Estratégia 2: Verificar se existe uma função específica do módulo
    else {
      const specificInitFunctionName = `init${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Module`;

      if (typeof window[specificInitFunctionName] === 'function') {
        routerLog(`Executando função específica: ${specificInitFunctionName}`);
        await window[specificInitFunctionName]();
        initSuccess = true;
      } else {
        routerLog(`Função de inicialização ${specificInitFunctionName} não encontrada`);
      }
    }

    // Personalizações específicas por módulo
    await applyModuleSpecificInitializations(moduleName);

    // Notificar que o módulo foi inicializado
    if (initSuccess) {
      document.dispatchEvent(new CustomEvent('moduleInitialized', {
        detail: { module: moduleName, timestamp: Date.now() }
      }));
    }

    return initSuccess;
  } catch (error) {
    routerLog(`Erro ao inicializar módulo ${moduleName}:`, error);
    return false;
  }
}

/**
 * Aplica inicializações específicas para certos módulos
 * @param {string} moduleName - Nome do módulo
 */
async function applyModuleSpecificInitializations(moduleName) {
  switch (moduleName) {
    case 'incapacity':
      // Inicializar sistema CID se necessário
      if (typeof window.initCidSystem === 'function' && !window.cidSystemInitialized) {
        routerLog('Inicializando sistema CID para módulo de incapacidades');
        await window.initCidSystem();
      }
      break;

    case 'social':
      // Inicializar dados do assistido
      if (typeof window.inicializarAssistido === 'function') {
        routerLog('Inicializando dados do assistido para módulo social');
        await window.inicializarAssistido();
      }
      break;

    case 'personal':
      // Inicializar validações CPF
      if (typeof window.initCPFValidation === 'function') {
        routerLog('Inicializando sistema de validação de CPF');
        window.initCPFValidation();
      }
      break;
  }
}
