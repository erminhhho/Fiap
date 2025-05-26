/**
 * Módulo de Incapacidades
 *
 * Este é o módulo principal para o tratamento de incapacidades no sistema.
 * O arquivo modules/disability.js foi marcado como obsoleto em favor deste.
 */

console.log('[incapacity.js] *** INICIANDO CARREGAMENTO DO MÓDULO ***');
console.log('[incapacity.js] Timestamp:', new Date().toLocaleTimeString());
console.log('[incapacity.js] window.setupProfissaoAutocomplete será definido...');

// Lista de CIDs e doenças que dispensam carência
// Verificar se já existe para evitar redeclaração
if (typeof window.cidsSemCarencia === 'undefined') {
  // Definir no escopo global para evitar redeclaração
  window.cidsSemCarencia = [
    // Tuberculose ativa
    'a15', 'a16', 'a17', 'a18', 'a19',
    // Hanseníase
    'a30',
    // Alienação mental / transtornos mentais graves
    'f00', 'f01', 'f02', 'f03', 'f20', 'f21', 'f22', 'f23', 'f24', 'f25', 'f28', 'f29',
    'f30', 'f31', 'f32', 'f33',
    // Neoplasia maligna (câncer)
    'c00', 'c01', 'c02', 'c03', 'c04', 'c05', 'c06', 'c07', 'c08', 'c09',
    'c10', 'c11', 'c12', 'c13', 'c14', 'c15', 'c16', 'c17', 'c18', 'c19',
    'c20', 'c21', 'c22', 'c23', 'c24', 'c25', 'c26', 'c27', 'c28', 'c29',
    'c30', 'c31', 'c32', 'c33', 'c34', 'c35', 'c36', 'c37', 'c38', 'c39',
    'c40', 'c41', 'c42', 'c43', 'c44', 'c45', 'c46', 'c47', 'c48', 'c49',
    'c50', 'c51', 'c52', 'c53', 'c54', 'c55', 'c56', 'c57', 'c58', 'c59',
    'c60', 'c61', 'c62', 'c63', 'c64', 'c65', 'c66', 'c67', 'c68', 'c69',
    'c70', 'c71', 'c72', 'c73', 'c74', 'c75', 'c76', 'c77', 'c78', 'c79',
    'c80', 'c81', 'c82', 'c83', 'c84', 'c85', 'c86', 'c87', 'c88', 'c89',
    'c90', 'c91', 'c92', 'c93', 'c94', 'c95', 'c96', 'c97',
    // Cegueira
    'h54.0', 'h54.1', 'h54.3',
    // Paralisia irreversível e incapacitante
    'g80', 'g81', 'g82', 'g83',
    // Cardiopatia grave
    'i20', 'i21', 'i22', 'i24', 'i25', 'i42', 'i50',
    // Doença de Parkinson
    'g20',
    // Espondiloartrose anquilosante
    'm45',
    // Nefropatia grave
    'n17', 'n18', 'n19',
    // Estado avançado da Doença de Paget (osteíte deformante)
    'm88',
    // AIDS
    'b20', 'b21', 'b22', 'b23', 'b24',
    // Contaminação por radiação
    't66',
    // Hepatopatia grave
    'k72', 'k74', 'k76.6', 'k76.7'
  ];
}

// Lista de doenças que dispensam carência (REVISADA - termos mais específicos)
if (typeof window.doencasSemCarencia === 'undefined') {
  window.doencasSemCarencia = [
    // Tuberculose - deve ser "ativa"
    'tuberculose ativa',
    'tuberculose pulmonar ativa',
    'tuberculose extrapulmonar ativa',

    // Hanseníase
    'hanseníase',
    'lepra',
    'mal de hansen',

    // Transtornos mentais graves - termos mais específicos
    'alienação mental',
    'esquizofrenia',
    'transtorno esquizoafetivo',
    'transtorno bipolar',
    'transtorno depressivo maior',
    'transtorno depressivo grave',
    'demência',
    'alzheimer',
    'transtorno psicótico',
      // Neoplasias malignas - termos mais específicos (REFINADO)
    'neoplasia maligna',
    'carcinoma in situ',
    'carcinoma invasivo',
    'carcinoma metastático',
    'adenocarcinoma',
    'carcinoma espinocelular',
    'carcinoma basocelular invasivo',
    'sarcoma',
    'melanoma maligno',
    'linfoma hodgkin',
    'linfoma não hodgkin',
    'leucemia mieloide',
    'leucemia linfoide',
    'leucemia aguda',
    'leucemia crônica',
    'mieloma múltiplo',
    'tumor maligno primário',
    'tumor maligno secundário',
    'metástase',

    // Cegueira
    'cegueira',
    'cegueira bilateral',
    'amaurose',
    'perda total da visão',

    // Paralisia
    'paralisia irreversível',
    'paralisia incapacitante',
    'tetraplegia',
    'paraplegia',
    'hemiplegia',
    'paralisia cerebral',

    // Cardiopatia grave
    'cardiopatia grave',
    'insuficiência cardíaca',
    'cardiopatia isquêmica',
    'cardiomiopatia',
    'infarto do miocárdio',

    // Parkinson
    'doença de parkinson',
    'parkinsonismo',

    // Espondiloartrose
    'espondiloartrose anquilosante',
    'espondilite anquilosante',

    // Nefropatia grave
    'nefropatia grave',
    'insuficiência renal crônica',
    'doença renal crônica',

    // Doença de Paget
    'doença de paget',
    'osteíte deformante',

    // AIDS/HIV
    'aids',
    'síndrome da imunodeficiência adquirida',
    'síndrome da deficiência imunológica adquirida',
    'hiv',
    'vírus da imunodeficiência humana',

    // Contaminação por radiação
    'contaminação por radiação',
    'síndrome da radiação',

    // Hepatopatia grave
    'hepatopatia grave',
    'cirrose hepática',
    'insuficiência hepática'
  ];
}

// Lista de profissões mais comuns para autocomplete
window.profissoesComuns = [
  "Agricultor(a)",
  "Pedreiro(a)",
  "Professor(a)",
  "Motorista",
  "Açougueiro(a)",
  "Cozinheiro(a)",
  "Vendedor(a)",
  "Auxiliar Administrativo",
  "Enfermeiro(a)",
  "Médico(a)",
  "Advogado(a)",
  "Carpinteiro(a)",
  "Eletricista",
  "Garçom/Garçonete",
  "Pintor(a)",
  "Mecânico(a)",
  "Diarista",
  "Babá",
  "Porteiro(a)",
  "Zelador(a)",
  "Costureira",
  "Frentista",
  "Gari",
  "Jardineiro(a)",
  "Padeiro(a)",
  "Recepcionista",
  "Secretária",
  "Técnico(a) de Enfermagem",
  "Vigilante"
];

console.log('[incapacity.js] Profissões carregadas:', window.profissoesComuns.length, 'itens');

// Função de busca de profissões (pode ser adaptada para API futuramente)
window.buscarProfissoes = function(query) {
  return new Promise(resolve => {
    const resultados = window.profissoesComuns.filter(p => p.toLowerCase().includes(query.toLowerCase()));
    resolve(resultados);
  });
};

// Função para renderizar itens do dropdown de profissão
window.renderProfissoesDropdown = function(resultados) {
  return resultados.map(prof =>
    `<div class="dropdown-item px-4 py-2 hover:bg-blue-50 cursor-pointer">${prof}</div>`
  ).join('');
};

// Função para configurar autocomplete de profissão usando Search.js
window.setupProfissaoAutocomplete = function() {
  const input = document.getElementById('profissao');
  const dropdown = document.getElementById('profissaoDropdown');
  if (!input || !dropdown) return;

  console.log('[incapacity.js] Configurando autocomplete de profissão...');

  // Sempre esconder o dropdown de profissão se o campo já estiver preenchido ao restaurar
  dropdown.classList.add('hidden');

  let debounceTimer;
  // Função para buscar profissões
  function buscarProfissoes(query) {
    const resultados = window.profissoesComuns.filter(p => p.toLowerCase().includes(query.toLowerCase()));
    // Log apenas se encontrar resultados ou se a query for significativa
    if (resultados.length > 0 || query.length > 2) {
      console.log('[incapacity.js] Profissões encontradas para "' + query + '":', resultados.length);
    }
    return resultados;
  }

  // Função para renderizar resultados
  function renderizarProfissoes(resultados, query) {
    dropdown.innerHTML = '';
    if (!resultados.length) {
      dropdown.classList.add('hidden');
      return;
    }
    resultados.forEach(prof => {
      const item = document.createElement('div');
      item.className = 'dropdown-item px-4 py-2 hover:bg-blue-50 cursor-pointer';
      item.textContent = prof;
      item.addEventListener('mousedown', function(e) {
        e.preventDefault();
        input.value = prof;
        dropdown.classList.add('hidden');
        input.dispatchEvent(new Event('change', { bubbles: true }));
        console.log('[incapacity.js] Profissão selecionada:', prof);
      });
      dropdown.appendChild(item);
    });
    dropdown.classList.remove('hidden');
  }

  // Evento de input com debounce
  input.addEventListener('input', function() {
    const query = this.value.trim();
    console.log('[incapacity.js] Input digitado:', query);
    clearTimeout(debounceTimer);
    if (!query || query.length < 2) {
      dropdown.classList.add('hidden');
      return;
    }
    debounceTimer = setTimeout(() => {
      const resultados = buscarProfissoes(query);
      // Se só existe um resultado e ele é igual ao valor do campo, não mostrar dropdown
      if (resultados.length === 1 && resultados[0] === this.value) {
        dropdown.classList.add('hidden');
        return;
      }
      renderizarProfissoes(resultados, query);
    }, 250);
  });

  // Permitir selecionar com Enter
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !dropdown.classList.contains('hidden')) {
      e.preventDefault();
      const firstItem = dropdown.querySelector('.dropdown-item');
      if (firstItem) firstItem.dispatchEvent(new MouseEvent('mousedown'));
    }
  });

  // Fechar dropdown ao clicar fora
  document.addEventListener('mousedown', function(event) {
    if (!dropdown.contains(event.target) && event.target !== input) {
      dropdown.classList.add('hidden');
    }
  });
  console.log('[incapacity.js] Autocomplete de profissão configurado com sucesso!');
};

console.log('[incapacity.js] window.setupProfissaoAutocomplete definida!');

// Variável para controlar inicialização única do autocomplete
let profissaoAutocompleteInitialized = false;

// Função para resetar o estado de inicialização (útil para testes ou reinicialização)
window.resetProfissaoAutocompleteState = function() {
  profissaoAutocompleteInitialized = false;
  console.log('[incapacity.js] Estado do autocomplete de profissão resetado.');
};

// Função para inicializar o autocomplete de profissão
function initializeProfissaoAutocomplete() {
  // Verificar se já foi inicializado para evitar múltiplas tentativas
  if (profissaoAutocompleteInitialized) {
    console.log('[incapacity.js] Autocomplete de profissão já foi inicializado, ignorando chamada duplicada.');
    return;
  }

  console.log('[incapacity.js] Inicializando autocomplete de profissão...');

  let tentativas = 0;
  const maxTentativas = 20; // Reduzido para 2 segundos (20 * 100ms)

  // Espera o campo estar disponível antes de configurar
  function tryInitProfissaoAutocomplete() {
    tentativas++;
    const input = document.getElementById('profissao');
    const dropdown = document.getElementById('profissaoDropdown');

    // Log apenas nas primeiras e últimas tentativas para reduzir spam
    const shouldLog = tentativas <= 3 || tentativas >= maxTentativas - 2;

    if (shouldLog) {
      console.log(`[incapacity.js] Tentativa ${tentativas}/${maxTentativas} - input:`, !!input, 'dropdown:', !!dropdown, 'setupFunction:', !!window.setupProfissaoAutocomplete);
    }

    if (input && dropdown && window.setupProfissaoAutocomplete) {
      console.log('[incapacity.js] ✅ Elementos encontrados, configurando autocomplete...');
      window.setupProfissaoAutocomplete();
      profissaoAutocompleteInitialized = true; // Marcar como inicializado
      return true;
    } else if (tentativas < maxTentativas) {
      setTimeout(tryInitProfissaoAutocomplete, 100);
      return false;
    } else {
      console.warn('[incapacity.js] ⚠️  TIMEOUT: Não foi possível inicializar o autocomplete de profissão após', maxTentativas, 'tentativas');
      console.warn('[incapacity.js] Estado final - input:', !!input, 'dropdown:', !!dropdown, 'setupFunction:', !!window.setupProfissaoAutocomplete);
      console.warn('[incapacity.js] Isso pode ser normal se o template atual não contém campos de profissão.');
      profissaoAutocompleteInitialized = true; // Marcar para evitar novas tentativas
      return false;
    }
  }
  tryInitProfissaoAutocomplete();
}

// Inicialização será controlada apenas pelo initModule para evitar duplicatas
// A função será chamada quando o módulo for explicitamente inicializado

// Variável para evitar inicialização múltipla
if (typeof window.isDropdownHandlersInitialized === 'undefined') {
  window.isDropdownHandlersInitialized = false;
}

// Limpar função de inicialização anterior
window.initModule = null;

// Definir nova função de inicialização do módulo
window.initModule = function() {
  console.log('[incapacity.js] initModule: Iniciando módulo de incapacidades.');

  // Forçar reinicialização quando acessado diretamente pela URL
  if (window.location.hash === '#incapacity') {
    window._incapacityInitialized = false;
  }
  // Verificar se o módulo já foi inicializado nesta sessão
  if (window._incapacityInitialized) {
    console.log('[incapacity.js] ✅ Módulo de incapacidades já inicializado, ignorando duplicata.');
    return;
  }

  // Marcar como inicializado
  window._incapacityInitialized = true;

  // Inicializar o autocomplete de profissão
  console.log('[incapacity.js] 🔧 Inicializando componentes do módulo...');
  initializeProfissaoAutocomplete();

  // Inicializar o conteúdo da página de forma estruturada
  initializePageContent();

  // Limpar flag quando a página mudar
  document.addEventListener('stepChanged', function handleStepChange() {
    window._incapacityInitialized = false;
    document.removeEventListener('stepChanged', handleStepChange);
  }, { once: true });

  console.log('[incapacity.js] Módulo de incapacidade: eventos configurados e inicialização solicitada.');
};

// Função unificada para inicializar o conteúdo da página
function initializePageContent() {
  // Configurar eventos do módulo
  setupEvents();

  // Configurar modal de "Outro Tipo de Documento"
  setupDocumentoTipoSelects();

  // Expor addDoencaField globalmente
  if (typeof window.addDoencaField === 'undefined' && typeof addDoencaField === 'function') {
    window.addDoencaField = addDoencaField;
    console.log("[incapacity.js] initModule: window.addDoencaField definido.");
  }
  console.log('[incapacity.js] Iniciando inicialização de componentes...');
  // Inicializar verificação de isenção de carência
  setupIsencaoCarencia();

  // Inicializar sistema CID (apenas se não foi inicializado)
  if (typeof initCidSystem === 'function' && !window.cidSystemInitialized) {
    console.log('[incapacity.js] Inicializando sistema CID...');
    try {
      initCidSystem();
    } catch (e) {
      console.warn("[incapacity.js] Erro na inicialização do sistema CID:", e);
    }
  } else if (window.cidSystemInitialized) {
    console.log('[incapacity.js] Sistema CID já inicializado, pulando...');
  }

  // Ocultar dropdown de profissão antes de restaurar
  const profInput = document.getElementById('profissao');
  const profDropdown = document.getElementById('profissaoDropdown');
  if (profInput && profDropdown) {
    profDropdown.classList.add('hidden');
  }

  // Restaurar dados para esta etapa
  if (window.formStateManager) {
    const currentStepKey = 'incapacity';
    console.log(`[incapacity.js] initModule: Solicitando restauração para a etapa: ${currentStepKey}`);
    window.formStateManager.ensureFormAndRestore(currentStepKey);

    // Aplicar validações após a restauração
    setTimeout(function() {
      console.log('[incapacity.js] Aplicando validações pós-restauração...');

      document.querySelectorAll('.doenca-input').forEach(input => {
        if (typeof verificarIsencaoCarencia === 'function') {
          verificarIsencaoCarencia(input);
        }
      });

      document.querySelectorAll('.cid-input').forEach(input => {
        const index = input.getAttribute('data-index');
        const doencaInput = document.getElementById('doenca' + index);
        if (doencaInput && typeof verificarIsencaoCarencia === 'function') {
          verificarIsencaoCarencia(doencaInput);
        }
      });      // Re-inicializar sistema CID apenas se necessário
      if (typeof initCidSystem === 'function' && !window.cidSystemInitialized) {
        setTimeout(() => {
          try {
            initCidSystem();
            console.log('[incapacity.js] Sistema CID inicializado após restauração.');
          } catch (e) {
            console.warn("[incapacity.js] Erro na inicialização do sistema CID:", e);
          }
        }, 200);
      } else if (window.cidSystemInitialized) {
        console.log('[incapacity.js] Sistema CID já está inicializado.');
      }

      // Garantir que dropdown de profissão permanece oculto
      requestAnimationFrame(() => {
        if (profInput && profDropdown) {
          profDropdown.classList.add('hidden');
        }
      });

      console.log('[incapacity.js] Validações pós-restauração aplicadas.');
    }, 350);
  } else {
    console.error("[incapacity.js] initModule: formStateManager não encontrado. A restauração não ocorrerá.");
  }

  // Configurar listeners para campos tipo-documento (modais)
  document.querySelectorAll('.tipo-documento').forEach(select => {
    select.addEventListener('change', function() {
      if (this.value === 'outro') {
        window.currentDocumentoSelectGlobal = this;
        if (typeof window.showOutroDocumentoModal === 'function') {
          window.showOutroDocumentoModal();
        }
      }
    });
  });

  // Configurar botões de navegação usando o sistema padronizado
  if (window.Navigation) {
    window.Navigation.setupNavigationButtons();
  }

  console.log('[incapacity.js] Componentes inicializados com sucesso.');
}

// Função para resetar a UI da seção de incapacidade (doenças/CIDs)
function resetIncapacityUI() {
  console.log('[incapacity.js] resetIncapacityUI: Iniciando limpeza de linhas de doença/CID.');
  const doencasListContainer = document.getElementById('doencas-list'); // CONFIRMAR ESTE ID

  if (doencasListContainer) {
    // Remover todas as linhas de doença existentes
    const doencaRows = doencasListContainer.querySelectorAll('.doenca-row'); // CONFIRMAR ESTA CLASSE
    doencaRows.forEach(row => row.remove());
    console.log(`[incapacity.js] resetIncapacityUI: ${doencaRows.length} linhas de doença removidas.`);

    // Adicionar uma primeira linha em branco, se a função addDoencaField existir e for apropriado
    if (typeof addDoencaField === 'function') {
      // addDoencaField(); // Descomentar se uma linha inicial for necessária
      // console.log('[incapacity.js] resetIncapacityUI: Uma linha de doença inicial adicionada (se configurado).');
      // Se addDoencaField já é chamada no initModule ou ao carregar o template, talvez não precise chamar aqui.
      // Por enquanto, apenas limpamos. O initModule/restauração deve lidar com a criação da primeira linha se necessário.
    } else {
      console.warn('[incapacity.js] resetIncapacityUI: Função addDoencaField() não encontrada para adicionar linha inicial.');
    }

    // Limpar campos de observações desta seção
    const observacoesTextarea = document.querySelector('#incapacity-form #observacoes'); // Ser mais específico
    if (observacoesTextarea) {
        observacoesTextarea.value = '';
    }

  } else {
    console.warn('[incapacity.js] resetIncapacityUI: Container #doencas-list não encontrado.');
  }
  // Resetar outros estados específicos do módulo de incapacidade, se houver.
  // Por exemplo, limpar seleções de dropdowns, resultados de pesquisa de CID, etc.
  // Isso pode ser complexo e depender da implementação exata dos componentes de UI.
  // Exemplo genérico para limpar dropdowns de pesquisa:
  document.querySelectorAll('.cid-dropdown').forEach(dropdown => dropdown.classList.add('hidden'));
  document.querySelectorAll('.cid-input').forEach(input => input.value = ''); // Limpa campos de input CID
  document.querySelectorAll('.doenca-input').forEach(input => input.value = ''); // Limpa campos de input Doença

  // Resetar a verificação de isenção de carência visualmente
  const carenciaInfo = document.getElementById('carencia-info');
  if (carenciaInfo) {
    carenciaInfo.innerHTML = '';
    carenciaInfo.className = 'mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md'; // Resetar classes
  }
}
window.resetIncapacityUI = resetIncapacityUI;



















// Função para verificar se a doença dispensa carência (REVISADA)
function verificarIsencaoCarencia(input) {
  console.log('[incapacity.js] Verificando isenção de carência para input:', input.id);

  // Verificar pelo CID primeiro (método preferencial e mais preciso)
  const cidIndex = input.getAttribute('data-index');
  const cidInput = document.getElementById('cid' + cidIndex);
  let isento = false;
  let motivoIsencao = '';

  if (cidInput && cidInput.value.trim() !== '') {
    const cidValor = cidInput.value.toLowerCase().trim().replace(/\s+/g, '').replace(/\./g, '');
    console.log('[incapacity.js] Verificando CID:', cidValor);

    // Verificar se o CID está na lista de isentos (comparação por prefixo)
    isento = window.cidsSemCarencia.some(cid => {
      const cidNormalizado = cid.toLowerCase().replace(/\s+/g, '').replace(/\./g, '');
      const match = cidValor.startsWith(cidNormalizado);
      if (match) {
        motivoIsencao = `CID ${cid.toUpperCase()} - isenção legal de carência`;
        console.log('[incapacity.js] CID isento encontrado:', cid);
      }
      return match;
    });
  }

  // Se não encontrou pelo CID, verificar pelo nome da doença (método secundário)
  if (!isento && input.value.trim() !== '') {
    const doencaValor = input.value.toLowerCase().trim();
    console.log('[incapacity.js] Verificando doença:', doencaValor);

    // Usar busca mais rigorosa para evitar falsos positivos
    isento = window.doencasSemCarencia.some(doenca => {
      const doencaNormalizada = doenca.toLowerCase().trim();

      // Verificação rigorosa: a doença digitada deve conter o termo completo
      // ou ser uma correspondência muito próxima
      const match = verificarCorrespondenciaDoenca(doencaValor, doencaNormalizada);

      if (match) {
        motivoIsencao = `Doença: "${doenca}" - isenção legal de carência`;
        console.log('[incapacity.js] Doença isenta encontrada:', doenca);
      }
      return match;
    });
  }

  // Encontrar a tag de isenção associada a este input
  const tagIsencao = input.closest('.relative')?.querySelector('.isento-carencia-tag');

  if (isento && (input.value.trim() !== '' || (cidInput && cidInput.value.trim() !== ''))) {
    console.log('[incapacity.js] Aplicando isenção de carência:', motivoIsencao);

    if (tagIsencao) {
      tagIsencao.classList.remove('hidden');
      tagIsencao.setAttribute('title', motivoIsencao);
    }

    // Adicionar classe visual para o campo
    input.classList.add('isento-carencia-field');
    if (cidInput) cidInput.classList.add('isento-carencia-field');    // Armazenar informação da isenção no formStateManager se disponível
    if (window.formStateManager && cidIndex) {
      // Acessar dados diretamente da propriedade formData
      const stepData = window.formStateManager.formData.incapacity || {};
      if (!stepData.isencaoCarencia) {
        stepData.isencaoCarencia = {};
      }
      stepData.isencaoCarencia[cidIndex] = {
        doenca: doenca,
        temIsencao: true,
        timestamp: Date.now()
      };
      // Os dados são automaticamente salvos pois stepData é uma referência
    }
  } else {
    console.log('[incapacity.js] Sem isenção de carência aplicável');

    if (tagIsencao) {
      tagIsencao.classList.add('hidden');
      tagIsencao.removeAttribute('title');
    }

    // Remover a anotação visual
    input.classList.remove('isento-carencia-field');
    if (cidInput) cidInput.classList.remove('isento-carencia-field');    // Remover informação da isenção do formStateManager se disponível
    if (window.formStateManager && cidIndex) {
      // Acessar dados diretamente da propriedade formData
      const stepData = window.formStateManager.formData.incapacity || {};
      if (stepData.isencaoCarencia && stepData.isencaoCarencia[cidIndex]) {
        delete stepData.isencaoCarencia[cidIndex];
        // Os dados são automaticamente salvos pois stepData é uma referência
      }
    }
  }
}

/**
 * Função auxiliar para verificar correspondência rigorosa entre doenças
 * Evita falsos positivos com termos muito genéricos
 */
function verificarCorrespondenciaDoenca(doencaDigitada, doencaReferencia) {
  // Normalizar strings removendo acentos e caracteres especiais
  const normalizarTexto = (texto) => {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^\w\s]/g, '') // Remove pontuação
      .replace(/\s+/g, ' ') // Normaliza espaços
      .trim();
  };

  const doencaDigitadaNorm = normalizarTexto(doencaDigitada);
  const doencaReferenciaNorm = normalizarTexto(doencaReferencia);

  // NOVA VALIDAÇÃO: Verificar se não contém termos que invalidam a isenção
  const termosExcludentes = [
    'benigno', 'benigna', 'suspeita', 'risco', 'chance', 'medo', 'exame',
    'preventivo', 'rastreamento', 'histórico', 'historico', 'familiar',
    'hereditário', 'hereditario', 'predisposição', 'predisposicao'
  ];

  const contemTermoExcludente = termosExcludentes.some(termo =>
    doencaDigitadaNorm.includes(termo)
  );

  if (contemTermoExcludente) {
    console.log('[incapacity.js] Termo excludente encontrado, rejeitando isenção');
    return false;
  }

  // Método 1: Correspondência exata
  if (doencaDigitadaNorm === doencaReferenciaNorm) {
    return true;
  }

  // Método 2: A doença digitada contém exatamente o termo de referência como palavra completa
  const palavrasReferencia = doencaReferenciaNorm.split(' ');
  const palavrasDigitada = doencaDigitadaNorm.split(' ');

  // Verificar se todas as palavras da referência estão presentes na doença digitada
  const todasPalavrasPresentes = palavrasReferencia.every(palavra => {
    return palavrasDigitada.includes(palavra);
  });

  if (todasPalavrasPresentes && palavrasReferencia.length >= 2) {
    return true; // Só aceita se a referência tem pelo menos 2 palavras
  }
  // Método 3: Para termos únicos importantes, verificar se são palavras completas
  const termosUnicos = [
    'esquizofrenia', 'hanseniase', 'lepra', 'aids', 'hiv', 'cegueira',
    'tetraplegia', 'paraplegia', 'alzheimer', 'parkinson', 'cirrose'
  ];

  if (termosUnicos.includes(doencaReferenciaNorm)) {
    // Verificar se a palavra aparece como termo completo (não como substring)
    const regex = new RegExp(`\\b${doencaReferenciaNorm}\\b`, 'i');
    return regex.test(doencaDigitadaNorm);
  }

  // Método 4: Para termos de neoplasia, aplicar validação muito rigorosa
  const termosNeoplasia = ['carcinoma', 'adenocarcinoma', 'sarcoma', 'melanoma', 'linfoma', 'leucemia', 'mieloma'];
  if (termosNeoplasia.some(termo => doencaReferenciaNorm.includes(termo))) {
    // Para neoplasias, exigir correspondência exata ou muito específica
    const termoEncontrado = termosNeoplasia.find(termo => doencaReferenciaNorm.includes(termo));
    const regex = new RegExp(`\\b${termoEncontrado}\\b`, 'i');
    const matchExato = regex.test(doencaDigitadaNorm);

    // Adicionalmente, verificar se não há qualificadores que invalidem
    const qualificadoresInvalidos = ['in situ', 'benigno', 'benigna'];
    const temQualificadorInvalido = qualificadoresInvalidos.some(qual =>
      doencaDigitadaNorm.includes(qual)
    );

    return matchExato && !temQualificadorInvalido;
  }

  // Método 5: Para neoplasias com qualificadores específicos, verificar ambos os termos
  if (doencaReferenciaNorm.includes('neoplasia maligna') ||
      doencaReferenciaNorm.includes('tumor maligno')) {
    const temNeoplasia = doencaDigitadaNorm.includes('neoplasia') || doencaDigitadaNorm.includes('tumor');
    const temMaligno = doencaDigitadaNorm.includes('maligna') || doencaDigitadaNorm.includes('maligno');
    return temNeoplasia && temMaligno;
  }

  // Se chegou até aqui, não houve correspondência válida
  return false;
}

// Função para configurar a verificação de isenção de carência
function setupIsencaoCarencia() {
  // Adicionar listeners para campos existentes
  document.querySelectorAll('.doenca-input').forEach(input => {
    if (!input.dataset.isencaoListenerAdded) {
      input.addEventListener('input', function() {
        verificarIsencaoCarencia(this);
      });
      input.addEventListener('blur', function() {
        verificarIsencaoCarencia(this);
      });
      input.dataset.isencaoListenerAdded = 'true';
      // Verificar estado inicial
      verificarIsencaoCarencia(input);
    }
  });

  // Adicionar listeners também para os campos CID existentes
  document.querySelectorAll('.cid-input').forEach(input => {
    if (!input.dataset.isencaoListenerAdded) {
      input.addEventListener('input', function() {
        const index = this.getAttribute('data-index');
        const doencaInput = document.getElementById('doenca' + index);
        if (doencaInput) {
          verificarIsencaoCarencia(doencaInput);
        }
      });
      input.addEventListener('blur', function() {
        const index = this.getAttribute('data-index');
        const doencaInput = document.getElementById('doenca' + index);
        if (doencaInput) {
          verificarIsencaoCarencia(doencaInput);
        }
      });
      input.dataset.isencaoListenerAdded = 'true';
      // Verificar estado inicial
      const index = input.getAttribute('data-index');
      const doencaInput = document.getElementById('doenca' + index);
      if (doencaInput) {
        verificarIsencaoCarencia(doencaInput);
      }
    }
  });

  // Atualizar quando novos campos forem adicionados
  const doencasList = document.getElementById('doencasList');
  if (doencasList) {
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach(function(node) {
            if (node.nodeType === 1) { // Element node
              const novosCampos = node.querySelectorAll('.doenca-input, .cid-input');
              novosCampos.forEach(input => {
                if (!input.dataset.isencaoListenerAdded) {
                  if (input.classList.contains('doenca-input')) {
                    input.addEventListener('input', function() {
                      verificarIsencaoCarencia(this);
                    });
                    input.addEventListener('blur', function() {
                      verificarIsencaoCarencia(this);
                    });
                  } else if (input.classList.contains('cid-input')) {
                    input.addEventListener('input', function() {
                      const index = this.getAttribute('data-index');
                      const doencaInput = document.getElementById('doenca' + index);
                      if (doencaInput) {
                        verificarIsencaoCarencia(doencaInput);
                      }
                    });
                    input.addEventListener('blur', function() {
                      const index = this.getAttribute('data-index');
                      const doencaInput = document.getElementById('doenca' + index);
                      if (doencaInput) {
                        verificarIsencaoCarencia(doencaInput);
                      }
                    });
                  }
                  input.dataset.isencaoListenerAdded = 'true';

                  // Verificar estado inicial se for um campo de doença
                  if (input.classList.contains('doenca-input')) {
                    verificarIsencaoCarencia(input);
                  }
                }

                // Configurar manipuladores de eventos para os dropdowns
                setupInputEventHandlers(input);
              });
            }
          });
        }
      });
    });

    // Observar o container de doenças para detectar quando novos campos são adicionados
    observer.observe(doencasList, { childList: true, subtree: true });
  }
}

// Função para configurar eventos do módulo
function setupEvents() {
  // Destacar campos preenchidos
  if (typeof destacarCamposPreenchidos === 'function') {
    destacarCamposPreenchidos();
  }

  // Botão para adicionar doença/CID
  const addDoencaBtn = document.getElementById('addDoenca');
  if (addDoencaBtn) {
    // Remover qualquer evento existente para evitar duplicação
    const newBtn = addDoencaBtn.cloneNode(true);
    addDoencaBtn.parentNode.replaceChild(newBtn, addDoencaBtn);

    // Aplicar estilo centralizado ao botão de adicionar
    if (window.tw && typeof window.tw.applyTo === 'function') {
      window.tw.applyTo(newBtn, 'button.add');
    }

    // Adicionar o evento ao novo botão - versão simplificada
    newBtn.addEventListener('click', function(e) {
      addDoencaField();
    });
  }

  // Configurar campos "outro" nos selects
  document.querySelectorAll('select[data-other-target]').forEach(select => {
    select.addEventListener('change', function() {
      const targetId = this.getAttribute('data-other-target');
      const targetField = document.getElementById(targetId);

      if (targetField) {
        if (this.value === 'outro') {
          targetField.classList.remove('hidden');
        } else {
          targetField.classList.add('hidden');
        }
      }
    });
  });

  // Configurar botões de navegação usando o sistema padronizado
  if (typeof window.Navigation !== 'undefined') {
    console.log('[incapacity.js] Configurando navegação com sistema padronizado...');
    window.Navigation.setupNavigationButtons();
  } else {
    console.warn('[incapacity.js] Sistema de navegação padronizado não encontrado, usando método legado...');

    // Fallback para método legado - botão voltar
    const backButton = document.getElementById('btn-back');
    if (backButton) {
      // Aplicar estilo centralizado ao botão voltar
      if (window.tw && typeof window.tw.applyTo === 'function') {
        window.tw.applyTo(backButton, 'button.secondary');
      }

      backButton.addEventListener('click', function() {
        navigateTo('social');
      });
    }

    // Fallback para método legado - botão próximo
    const nextButton = document.getElementById('btn-next');
    if (nextButton) {
      // Aplicar estilo centralizado ao botão próximo
      if (window.tw && typeof window.tw.applyTo === 'function') {
        window.tw.applyTo(nextButton, 'button.primary');
      }

      // Remover eventos existentes
      const newBtn = nextButton.cloneNode(true);
      nextButton.parentNode.replaceChild(newBtn, nextButton);

      // Flag para prevenir múltiplos cliques
      let isNavigating = false;

      // Adicionar novo evento com proteção
      newBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        if (isNavigating) return;
        isNavigating = true;

        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Carregando...';
        this.classList.add('opacity-75');

        try {
          if (window.formStateManager) {
            window.formStateManager.captureCurrentFormData();
          }

          setTimeout(() => {
            navigateTo('professional');
            setTimeout(() => {
              if (document.body.contains(this)) {
                this.innerHTML = originalText;
                this.classList.remove('opacity-75');
              }
              isNavigating = false;
            }, 500);
          }, 100);
        } catch (error) {
          console.error('Erro ao navegar para a próxima página:', error);
          this.innerHTML = originalText;
          this.classList.remove('opacity-75');
          isNavigating = false;
        }
      });
    }
  }
}

// Função para adicionar um novo campo de doença
function addDoencaField() {
  // Obter o container de doenças
  const doencasList = document.getElementById('doencasList');
  if (!doencasList) {
    console.error('Container de doenças não encontrado');
    return;
  }

  // Obter o próximo índice para os campos
  const existingFields = doencasList.querySelectorAll('.cid-input');
  const nextIndex = existingFields.length + 1;

  // Criar o elemento HTML para o novo campo
  const newDoencaField = document.createElement('div');
  newDoencaField.className = 'mb-4';
  newDoencaField.innerHTML = `
    <!-- Layout otimizado: todos os campos na mesma linha -->
    <div class="grid grid-cols-1 md:grid-cols-24 gap-4">
      <!-- Documento (agora é o primeiro) -->
      <div class="relative md:col-span-4">
        <select class="tipo-documento peer w-full rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 px-4 py-3 text-gray-800 bg-white transition-colors duration-200" id="tipoDocumento${nextIndex}" name="tipoDocumentos[]" data-index="${nextIndex}">
          <option value="" selected disabled>Selecione</option>
          <option value="exame">Exame</option>
          <option value="atestado">Atestado</option>
          <option value="laudo">Laudo</option>
          <option value="pericia">Perícia</option>
          <option value="receita">Receita</option>
          <option value="outro">Outro</option>
        </select>
        <label for="tipoDocumento${nextIndex}" class="input-label">
          Documento
        </label>
      </div>

      <!-- CID (segundo campo - reduzido) -->
      <div class="relative md:col-span-5">
        <div class="relative">
          <input type="text" class="cid-input peer w-full rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 px-4 py-3 text-gray-800 bg-white placeholder-gray-400 transition-colors duration-200" id="cid${nextIndex}" placeholder="CID" name="cids[]" data-index="${nextIndex}" autocomplete="off">
          <label for="cid${nextIndex}" class="absolute left-4 -top-3 px-1 text-sm text-blue-600 bg-gray-50 rounded-t-lg rounded-b-none input-label">CID</label>
          <div class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <i class="fas fa-search"></i>
          </div>
          <div class="cid-dropdown hidden absolute z-50 bg-white w-full border border-gray-300 rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto" id="cidDropdown${nextIndex}"></div>
        </div>
      </div>      <!-- Doença (terceiro campo - aumentado e readonly) -->
      <div class="relative md:col-span-10">
        <input type="text" class="doenca-input peer w-full rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 px-4 py-3 text-gray-800 bg-gray-50 placeholder-gray-400 transition-colors duration-200" id="doenca${nextIndex}" placeholder="Preenchido automaticamente pelo CID" name="doencas[]" data-index="${nextIndex}" autocomplete="off" readonly>
        <label for="doenca${nextIndex}" class="input-label">
          Doença
        </label>
        <div class="isento-carencia-tag hidden">Isenção de carência</div>
      </div>

      <!-- Data (quarto campo) -->
      <div class="relative md:col-span-4">
        <input type="text" class="peer w-full rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 px-4 py-3 text-gray-800 bg-white placeholder-gray-400 transition-colors duration-200" id="dataDocumento${nextIndex}" name="dataDocumentos[]" data-index="${nextIndex}" placeholder="dd/mm/aa" oninput="maskDate(this)">
        <label for="dataDocumento${nextIndex}" class="input-label">
          Data
        </label>
      </div>

      <!-- Botão de remover (último campo) -->
      <div class="md:col-span-1 flex items-center justify-center content-center text-center align-middle p-0">
        <button type="button" class="remove-doenca-btn bg-red-500 hover:bg-red-600 text-white rounded-full p-1 flex items-center justify-center w-8 h-8 mx-auto" title="Remover CID/Doença">
          <i class="fas fa-minus"></i>
        </button>
      </div>
    </div>
  `;

  // Adicionar ao DOM
  doencasList.appendChild(newDoencaField);

  // Configurar botão de remover
  const removeButton = newDoencaField.querySelector('.remove-doenca-btn');
  if (removeButton) {
    removeButton.addEventListener('click', function() {
      newDoencaField.remove();
    });
  }

  // Inicializar verificação de isenção de carência
  const doencaInput = newDoencaField.querySelector('.doenca-input');
  if (doencaInput) {
    doencaInput.addEventListener('input', function() {
      verificarIsencaoCarencia(this);
    });
  }
  // Forçar inicialização do sistema CID para novos campos adicionados dinamicamente
  if (typeof initCidSystem === 'function') {
    try {
      // Reset o flag para permitir reinicialização com novos campos
      window.cidSystemInitialized = false;
      initCidSystem();
      console.log("Sistema CID inicializado para novos campos adicionados");
    } catch (e) {
      console.warn("Erro ao inicializar CID para novos campos:", e);
    }
  }

  // Aplicar o novo sistema de pesquisa para o campo CID adicionado
  const cidInput = newDoencaField.querySelector('.cid-input');
  if (cidInput) {
    configurarCampoCID(cidInput);
    cidInput.focus();
  }

  // Após adicionar o campo de profissão (input#profissao) ou ao criar dinamicamente:
  const profissaoInput = document.getElementById('profissao') || newDoencaField.querySelector('#profissao');
  if (profissaoInput) {
    profissaoInput.oninput = function() { formatarNomeProprio(this); };
  }
}

// Expor a função para ser chamada externamente (ex: pelo FormStateManager)
window.addDoencaField = addDoencaField;

document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    // Validar isenção de carência
    document.querySelectorAll('.doenca-input').forEach(input => {
      if (typeof verificarIsencaoCarencia === 'function') verificarIsencaoCarencia(input);
    });
    // Validar CID
    document.querySelectorAll('.cid-input').forEach(input => {
      const index = input.getAttribute('data-index');
      const doencaInput = document.getElementById('doenca' + index);
      if (doencaInput && typeof verificarIsencaoCarencia === 'function') verificarIsencaoCarencia(doencaInput);
    });
  }, 300);
});

// Função para configurar os event listeners nos selects de tipo de documento
function setupDocumentoTipoSelects() {
  document.addEventListener('change', function(event) {
    if (event.target.classList.contains('tipo-documento')) {
      if (event.target.value === 'outro') {
        window.currentDocumentoSelectGlobal = event.target;
        showOutroDocumentoModal();
      }
    }
  });
}

// Função para mostrar o modal de "Outro Tipo de Documento" usando o modal genérico
function showOutroDocumentoModal() {
  if (typeof window.showGenericModal !== 'function') {
    console.error('Modal genérico não disponível');
    return;
  }

  window.showGenericModal({
    title: 'Informar Tipo de Documento',
    message: 'Digite o tipo de documento desejado:',
    content: '<input type="text" id="outroDocumentoInputGeneric" class="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Ex: Relatório, Comprovante">',
    buttons: [
      {
        text: 'Cancelar',
        className: 'flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 text-center',
        onclick: function() {
          handleCancelOutroDocumento();
        }
      },
      {
        text: 'Salvar',
        className: 'flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-center',
        onclick: function() {
          handleSaveOutroDocumento();
        }
      }
    ]
  });

  // Configurar eventos adicionais
  setTimeout(() => {
    const input = document.getElementById('outroDocumentoInputGeneric');
    if (input) {
      // Aplicar formatação de nome próprio com delay no modal
      input.addEventListener('input', function() {
        formatarNomeProprioModal(this);
      });

      // Salvar ao pressionar Enter
      input.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
          handleSaveOutroDocumento();
        }
      });
    }
  }, 100);
}

// Função para formatação de nome próprio no modal com delay
function formatarNomeProprioModal(input) {
  if (!input) return;

  // Clear any existing timeout
  clearTimeout(input.formatTimeout);

  // Set new timeout
  input.formatTimeout = setTimeout(() => {
    if (typeof window.formatarNomeProprio === 'function') {
      window.formatarNomeProprio(input);
    }
  }, 300);
}

// Função para lidar com o cancelamento
function handleCancelOutroDocumento() {
  // Se o usuário cancelou e o valor do select ainda é "outro", reseta para "Selecione..."
  if (window.currentDocumentoSelectGlobal && window.currentDocumentoSelectGlobal.value === 'outro') {
    const options = Array.from(window.currentDocumentoSelectGlobal.options);
    const customOptionExists = options.some(opt => opt.value !== "" && opt.value !== "outro" && !isDefaultDocumentoOption(opt.value));

    if (!customOptionExists) {
      window.currentDocumentoSelectGlobal.value = ""; // Reseta para "Selecione..."
    }
  }
  window.currentDocumentoSelectGlobal = null;
  window.closeGenericModal();
}

// Função para lidar com o salvamento
function handleSaveOutroDocumento() {
  const input = document.getElementById('outroDocumentoInputGeneric');
  const novoDocumento = input ? input.value.trim() : '';

  if (novoDocumento && window.currentDocumentoSelectGlobal) {
    // Verificar se a opção já existe (para não duplicar)
    let optionExists = false;
    for (let i = 0; i < window.currentDocumentoSelectGlobal.options.length; i++) {
      if (window.currentDocumentoSelectGlobal.options[i].value === novoDocumento) {
        optionExists = true;
        break;
      }
    }

    // Adicionar nova opção se não existir
    if (!optionExists) {
      const newOption = new Option(novoDocumento, novoDocumento, true, true);
      // Insere a nova opção antes da opção "Outro..."
      const outroOption = Array.from(window.currentDocumentoSelectGlobal.options).find(opt => opt.value === 'outro');
      if (outroOption) {
        window.currentDocumentoSelectGlobal.insertBefore(newOption, outroOption);
      } else {
        window.currentDocumentoSelectGlobal.appendChild(newOption);
      }
    }

    window.currentDocumentoSelectGlobal.value = novoDocumento;

    // Salvar automaticamente os dados do formulário
    if (window.formStateManager) {
      window.formStateManager.captureCurrentFormData();
    }
  }

  window.currentDocumentoSelectGlobal = null;
  window.closeGenericModal();
}

// Função auxiliar para verificar se uma opção de documento é uma das padrões
function isDefaultDocumentoOption(value) {
    const defaultOptions = ["exame", "atestado", "laudo", "pericia", "receita", "outro"];
    return defaultOptions.includes(value);
}

// Exportar funções para o escopo global
if (typeof window !== 'undefined') {
  window.showOutroDocumentoModal = showOutroDocumentoModal;
  window.handleSaveOutroDocumento = handleSaveOutroDocumento;
  window.handleCancelOutroDocumento = handleCancelOutroDocumento;
}
