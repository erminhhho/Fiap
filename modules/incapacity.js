/**
 * Módulo de Incapacidades
 *
 * Este é o módulo principal para o tratamento de incapacidades no sistema.
 * O arquivo modules/disability.js foi marcado como obsoleto em favor deste.
 */

// Lista de CIDs que dispensam carência
const cidsSemCarencia = [
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

// Lista de doenças que dispensam carência (mantida para compatibilidade)
const doencasSemCarencia = [
  'tuberculose ativa',
  'hanseníase',
  'alienação mental',
  'transtorno mental grave',
  'esquizofrenia',
  'transtorno bipolar',
  'neoplasia maligna',
  'câncer',
  'cancer',
  'cegueira',
  'paralisia irreversível',
  'paralisia incapacitante',
  'cardiopatia grave',
  'doença de parkinson',
  'espondiloartrose anquilosante',
  'nefropatia grave',
  'doença de paget',
  'osteíte deformante',
  'aids',
  'hiv',
  'síndrome da deficiência imunológica adquirida',
  'contaminação por radiação',
  'hepatopatia grave',
  'cirrose hepática'
];

// Limpar função de inicialização anterior
window.initModule = null;

// Definir nova função de inicialização do módulo
window.initModule = function() {
  // Remover a proteção que estava bloqueando a inicialização
  window._incapacityInitialized = false;

  setupEvents();

  // Inicializar o sistema de CID para os campos existentes
  if (typeof initCidSystem === 'function') {
    setTimeout(() => {
      initCidSystem();
    }, 100);
  }

  // Inicializar verificação de isenção de carência
  setupIsencaoCarencia();
};

// Função para verificar se a doença dispensa carência
function verificarIsencaoCarencia(input) {
  // Verificar pelo CID primeiro (preferencial)
  const cidIndex = input.getAttribute('data-index');
  const cidInput = document.getElementById('cid' + cidIndex);
  let isento = false;

  if (cidInput && cidInput.value.trim() !== '') {
    const cidValor = cidInput.value.toLowerCase().replace(/\s+/g, '').replace(/\./g, '.');

    // Verificar se o CID está na lista de isentos
    isento = cidsSemCarencia.some(cid => {
      // Comparação exata do início do CID (prefixo)
      return cidValor.startsWith(cid.toLowerCase().replace(/\s+/g, ''));
    });
  }

  // Se não encontrou pelo CID, tenta pelo nome da doença (método secundário)
  if (!isento) {
    const doencaValor = input.value.toLowerCase();
    isento = doencasSemCarencia.some(doenca => doencaValor.includes(doenca));
  }

  // Encontrar a tag de isenção associada a este input
  const tagIsencao = input.closest('.relative').querySelector('.isento-carencia-tag');

  if (isento && (input.value.trim() !== '' || (cidInput && cidInput.value.trim() !== ''))) {
    tagIsencao.classList.remove('hidden');
  } else {
    tagIsencao.classList.add('hidden');
  }
}

// Função para configurar a verificação de isenção de carência
function setupIsencaoCarencia() {
  // Adicionar listeners para campos existentes
  document.querySelectorAll('.doenca-input').forEach(input => {
    input.addEventListener('input', function() {
      verificarIsencaoCarencia(this);
    });
    input.addEventListener('blur', function() {
      verificarIsencaoCarencia(this);
    });
    // Verificar estado inicial
    verificarIsencaoCarencia(input);
  });

  // Adicionar listeners também para os campos CID existentes
  document.querySelectorAll('.cid-input').forEach(input => {
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
    // Verificar estado inicial
    const index = input.getAttribute('data-index');
    const doencaInput = document.getElementById('doenca' + index);
    if (doencaInput) {
      verificarIsencaoCarencia(doencaInput);
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

  // Botão Voltar
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

  // Botão Próximo
  const nextButton = document.getElementById('btn-next');
  if (nextButton) {
    // Aplicar estilo centralizado ao botão próximo
    if (window.tw && typeof window.tw.applyTo === 'function') {
      window.tw.applyTo(nextButton, 'button.primary');
    }

    nextButton.addEventListener('click', function() {
      navigateTo('professional');
    });
  }
}

// Função para adicionar um novo campo de doença/CID
function addDoencaField() {
  const doencasList = document.getElementById('doencasList');
  if (!doencasList) return;

  // Obter o número do próximo índice
  const items = doencasList.querySelectorAll('.cid-input');
  const nextIndex = items.length + 1;

  // Criar um novo elemento de doença
  const newDoencaDiv = document.createElement('div');
  newDoencaDiv.className = 'mb-4 border-b border-gray-200 pb-4';
  newDoencaDiv.innerHTML = `
    <!-- Layout otimizado: todos os campos na mesma linha -->
    <div class="grid grid-cols-1 md:grid-cols-24 gap-4">
      <!-- Documento (agora é o primeiro) -->
      <div class="relative md:col-span-4">
        <select class="peer w-full rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 px-4 py-3 text-gray-800 bg-white transition-colors duration-200" id="tipoDocumento${nextIndex}" name="tipoDocumentos[]" data-index="${nextIndex}">
          <option value="" selected disabled>Selecione</option>
          <option value="exame">Exame</option>
          <option value="atestado">Atestado</option>
          <option value="laudo">Laudo</option>
          <option value="pericia">Perícia</option>
          <option value="receita">Receita</option>
          <option value="outro">Outro</option>
        </select>
        <label for="tipoDocumento${nextIndex}" class="absolute left-4 -top-3 px-1 text-sm text-blue-600 bg-white rounded-t-lg rounded-b-none transition-all duration-200 pointer-events-none">
          Documento
        </label>
      </div>

      <!-- CID (segundo campo) -->
      <div class="relative md:col-span-7">
        <input type="text" class="cid-input peer w-full rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 px-4 py-3 text-gray-800 bg-white placeholder-gray-400 transition-colors duration-200" id="cid${nextIndex}" placeholder="CID" name="cids[]" data-index="${nextIndex}" autocomplete="off">
        <label for="cid${nextIndex}" class="absolute left-4 -top-3 px-1 text-sm text-transparent bg-white rounded-t-lg rounded-b-none transition-all duration-200 pointer-events-none peer-focus:text-blue-600 peer-focus:-top-3 peer-focus:bg-white peer-focus:text-blue-600 peer-focus:rounded-t-lg peer-focus:rounded-b-none peer-focus:text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:bg-transparent peer-placeholder-shown:rounded-none peer-placeholder-shown:text-transparent input-label">
          CID
        </label>
        <div class="cid-dropdown hidden absolute z-10 bg-white w-full border border-gray-300 rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto" id="cidDropdown${nextIndex}"></div>
      </div>

      <!-- Doença (terceiro campo) -->
      <div class="relative md:col-span-8">
        <input type="text" class="doenca-input peer w-full rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 px-4 py-3 text-gray-800 bg-white placeholder-gray-400 transition-colors duration-200" id="doenca${nextIndex}" placeholder="Doença ou condição" name="doencas[]" data-index="${nextIndex}" autocomplete="off">
        <label for="doenca${nextIndex}" class="absolute left-4 -top-3 px-1 text-sm text-transparent bg-white rounded-t-lg rounded-b-none transition-all duration-200 pointer-events-none peer-focus:text-blue-600 peer-focus:-top-3 peer-focus:bg-white peer-focus:text-blue-600 peer-focus:rounded-t-lg peer-focus:rounded-b-none peer-focus:text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:bg-transparent peer-placeholder-shown:rounded-none peer-placeholder-shown:text-transparent input-label">
          Doença
        </label>
        <div class="doenca-dropdown hidden absolute z-10 bg-white w-full border border-gray-300 rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto" id="doencaDropdown${nextIndex}"></div>
        <div class="isento-carencia-tag hidden absolute -top-3 -right-3 bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded-full">Isento de Carência</div>
      </div>

      <!-- Data (último campo) -->
      <div class="relative md:col-span-4">
        <input type="text" class="peer w-full rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 px-4 py-3 text-gray-800 bg-white placeholder-gray-400 transition-colors duration-200" id="dataDocumento${nextIndex}" name="dataDocumentos[]" data-index="${nextIndex}" placeholder="dd/mm/aa" oninput="maskDate(this)">
        <label for="dataDocumento${nextIndex}" class="absolute left-4 -top-3 px-1 text-sm text-transparent bg-white rounded-t-lg rounded-b-none transition-all duration-200 pointer-events-none peer-focus:text-blue-600 peer-focus:-top-3 peer-focus:bg-white peer-focus:text-blue-600 peer-focus:rounded-t-lg peer-focus:rounded-b-none peer-focus:text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:bg-transparent peer-placeholder-shown:rounded-none peer-placeholder-shown:text-transparent input-label">
          Data
        </label>
      </div>

      <!-- Botão de remover como uma coluna do grid -->
      <div class="md:col-span-1 flex items-center justify-center content-center text-center align-middle p-0">
        <button type="button" class="bg-red-500 hover:bg-red-600 text-white rounded-full p-1 flex items-center justify-center w-8 h-8 mx-auto remove-doenca" title="Remover CID/Doença">
          <i class="fas fa-minus"></i>
        </button>
      </div>
    </div>
  `;

  doencasList.appendChild(newDoencaDiv);

  // Configurar o botão de remover
  const removeBtn = newDoencaDiv.querySelector('.remove-doenca');
  if (removeBtn) {
    removeBtn.addEventListener('click', function() {
      newDoencaDiv.remove();
    });
  }

  // Inicializar o sistema de pesquisa de CID para o novo campo
  if (typeof initCidSystem === 'function') {
    setTimeout(() => {
      initCidSystem();
    }, 100);
  }

  // Destacar campos preenchidos
  if (typeof destacarCamposPreenchidos === 'function') {
    destacarCamposPreenchidos();
  }

  // Verificar isenção de carência para o novo campo
  const doencaInput = newDoencaDiv.querySelector('.doenca-input');
  if (doencaInput) {
    doencaInput.addEventListener('input', function() {
      verificarIsencaoCarencia(this);
    });
    doencaInput.addEventListener('blur', function() {
      verificarIsencaoCarencia(this);
    });
    doencaInput.dataset.isencaoListenerAdded = 'true';
  }
}

// Exportar funções para uso global
window.setupIncapacityEvents = setupEvents;
window.addIncapacityDoencaField = addDoencaField;
