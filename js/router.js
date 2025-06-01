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

// ETAPA 1: Variável para controlar sincronização de dados
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
    currentRoute = routeName;    // ETAPA 1: Proteção contra sincronização conflitante
    if (window._syncInProgress) {
      routerLog('Sincronização já em andamento, aguardando...');
      setTimeout(() => navigateTo(routeName), 100);
      return false;
    }

    // SINCRONIZAR DADOS DO ASSISTIDO ANTES DE NAVEGAR PARA SOCIAL
    if (routeName === 'social' && window.formStateManager && window.formStateManager.formData) {
      window._syncInProgress = true;
      try {
        const personalData = window.formStateManager.formData.personal;
        const socialData = window.formStateManager.formData.social || {}; // Garante que socialData exista

        if (personalData && personalData.autor_nome && personalData.autor_nome.length > 0) {
          const assistidoNome = personalData.autor_nome[0] || '';
          const assistidoCpf = (personalData.autor_cpf && personalData.autor_cpf.length > 0) ? personalData.autor_cpf[0] : '';
          let assistidoIdade = '';

          if (personalData.autor_idade && personalData.autor_idade.length > 0) {
            assistidoIdade = personalData.autor_idade[0] || '';
          } else if (personalData.autor_nascimento && personalData.autor_nascimento.length > 0) {
            const dataNascimentoStr = personalData.autor_nascimento[0];
            if (dataNascimentoStr && typeof calcularIdadeCompleta === 'function') { // Assumindo que calcularIdadeCompleta está global
              try {
                  const dataNasc = new Date(dataNascimentoStr.split('/').reverse().join('-'));
                  if (!isNaN(dataNasc.getTime())) {
                      const idadeObj = calcularIdadeCompleta(dataNasc);
                      assistidoIdade = `${idadeObj.anos} anos`; // Ou formato completo se preferir
                  }
              } catch(e) { console.error("Erro ao calcular idade para sincronização do assistido:", e); }
            }
          }

          // Atualizar os campos do primeiro membro em socialData (o assistido)
          if (!socialData.familiar_nome) socialData.familiar_nome = [];
          if (!socialData.familiar_cpf) socialData.familiar_cpf = [];
          if (!socialData.familiar_idade) socialData.familiar_idade = [];
          if (!socialData.familiar_parentesco) socialData.familiar_parentesco = [];
          // Adicionar outros campos do assistido que são fixos ou precisam ser sincronizados aqui

          socialData.familiar_nome[0] = assistidoNome;
          socialData.familiar_cpf[0] = assistidoCpf;
          socialData.familiar_idade[0] = assistidoIdade;
          socialData.familiar_parentesco[0] = 'Assistido'; // Garantir que o parentesco está correto

          window.formStateManager.formData.social = socialData;
          console.log('[Router] Dados do assistido sincronizados para formStateManager.formData.social:', JSON.parse(JSON.stringify(socialData)));
        }
      } finally {
        window._syncInProgress = false;
      }
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
    // Isso garante que a transição seja suave
    await new Promise(resolve => setTimeout(resolve, 150));

    // Renderizar o template no container
    routerLog('Renderizando template no container');
    appContent.innerHTML = templateHTML;

    // Aguardar o carregamento completo do script
    await scriptLoadPromise;
    routerLog('Script do módulo carregado com sucesso');

    // Finalizar barra de progresso
    completeProgressBar();

    // Aplicar fade-in somente após a inicialização do módulo
    // para o caso da página 'social', que tem inicialização complexa
    const isSocialPage = route.scriptUrl.includes('social.js');

    if (!isSocialPage) {
      // Para outras páginas, aplicar fade-in imediatamente
      appContent.classList.remove('fade-out');
      appContent.classList.add('fade-in');
    }

    // Inicializar o módulo se a função estiver definida
    if (typeof window.initModule === 'function') {
      routerLog('Inicializando módulo via window.initModule()');
      window.initModule();

      // Para a página social, aplicar fade-in após a inicialização
      if (isSocialPage) {
        requestAnimationFrame(() => {
          appContent.classList.remove('fade-out');
          appContent.classList.add('fade-in');
        });
      }
    } else {
      routerLog('Função window.initModule não encontrada');
      // Garantir que o fade-in seja aplicado mesmo sem initModule
      appContent.classList.remove('fade-out');
      appContent.classList.add('fade-in');
    }    // Inicializar o sistema CID se estiver na página de incapacidades
    if (route.scriptUrl.includes('incapacity.js') && typeof window.initCidSystem === 'function') {
      // Usar apenas um timeout para garantir que todos os elementos foram carregados
      setTimeout(() => {
        routerLog('Inicializando sistema CID após elementos carregados');
        window.initCidSystem();
      }, 200);
    }

    // Restaurar o estado do formulário para o módulo carregado
    // REMOVIDO O BLOCO CONDICIONAL E O SETTIMEOUT QUE CHAMAVA restoreFormData
    // A restauração será agora responsabilidade de cada initModule.

    // Configurar botões contextuais (Limpar em cada página e Imprimir na última)
    if (typeof window.setupContextualButtons === 'function') {
      routerLog('Configurando botões contextuais');
      const currentModule = route.scriptUrl.split('/').pop().replace('.js', '');
      window.setupContextualButtons(currentModule);
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
