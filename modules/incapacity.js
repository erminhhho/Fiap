/**
 * Módulo de Incapacidades
 *
 * Este é o módulo principal para o tratamento de incapacidades no sistema.
 * O arquivo modules/disability.js foi marcado como obsoleto em favor deste.
 */

// Limpar função de inicialização anterior
window.initModule = null;

// Definir nova função de inicialização do módulo
window.initModule = function() {
  setupEvents();

  // Inicializar o sistema de CID para os campos existentes
  if (typeof initCidSystem === 'function') {
    setTimeout(() => {
      initCidSystem();
    }, 100);
  }
};

// Função para configurar eventos do módulo
function setupEvents() {
  // Destacar campos preenchidos
  if (typeof destacarCamposPreenchidos === 'function') {
    destacarCamposPreenchidos();
  }

  // Botão para adicionar doença/CID
  const addDoencaBtn = document.getElementById('addDoenca');
  if (addDoencaBtn) {
    // Aplicar estilo centralizado ao botão de adicionar
    if (window.tw && typeof window.tw.applyTo === 'function') {
      window.tw.applyTo(addDoencaBtn, 'button.add');
    }

    // Remover qualquer evento existente para evitar duplicação
    const newBtn = addDoencaBtn.cloneNode(true);
    addDoencaBtn.parentNode.replaceChild(newBtn, addDoencaBtn);

    // Aplicar estilo centralizado ao novo botão
    if (window.tw && typeof window.tw.applyTo === 'function') {
      window.tw.applyTo(newBtn, 'button.add');
    }

    // Adicionar o evento ao novo botão
    newBtn.addEventListener('click', addDoencaField);
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
      navigateTo('insurance');
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
    <div class="flex items-center">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-3 flex-grow">
        <!-- Documento (agora é o primeiro) -->
        <div class="relative md:col-span-2">
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
        <div class="relative md:col-span-4">
          <input type="text" class="cid-input peer w-full rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 px-4 py-3 text-gray-800 bg-white placeholder-gray-400 transition-colors duration-200" id="cid${nextIndex}" placeholder="CID" name="cids[]" data-index="${nextIndex}" autocomplete="off">
          <label for="cid${nextIndex}" class="absolute left-4 -top-3 px-1 text-sm text-transparent bg-white rounded-t-lg rounded-b-none transition-all duration-200 pointer-events-none peer-focus:text-blue-600 peer-focus:-top-3 peer-focus:bg-white peer-focus:text-blue-600 peer-focus:rounded-t-lg peer-focus:rounded-b-none peer-focus:text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:bg-transparent peer-placeholder-shown:rounded-none peer-placeholder-shown:text-transparent input-label">
            CID
          </label>
          <div class="cid-dropdown hidden absolute z-10 bg-white w-full border border-gray-300 rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto" id="cidDropdown${nextIndex}"></div>
        </div>

        <!-- Doença (terceiro campo) -->
        <div class="relative md:col-span-4">
          <input type="text" class="doenca-input peer w-full rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 px-4 py-3 text-gray-800 bg-white placeholder-gray-400 transition-colors duration-200" id="doenca${nextIndex}" placeholder="Doença ou condição" name="doencas[]" data-index="${nextIndex}" autocomplete="off">
          <label for="doenca${nextIndex}" class="absolute left-4 -top-3 px-1 text-sm text-transparent bg-white rounded-t-lg rounded-b-none transition-all duration-200 pointer-events-none peer-focus:text-blue-600 peer-focus:-top-3 peer-focus:bg-white peer-focus:text-blue-600 peer-focus:rounded-t-lg peer-focus:rounded-b-none peer-focus:text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:bg-transparent peer-placeholder-shown:rounded-none peer-placeholder-shown:text-transparent input-label">
            Doença
          </label>
          <div class="doenca-dropdown hidden absolute z-10 bg-white w-full border border-gray-300 rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto" id="doencaDropdown${nextIndex}"></div>
        </div>

        <!-- Data (último campo) -->
        <div class="relative md:col-span-2">
          <input type="text" class="peer w-full rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 px-4 py-3 text-gray-800 bg-white placeholder-gray-400 transition-colors duration-200" id="dataDocumento${nextIndex}" name="dataDocumentos[]" data-index="${nextIndex}" placeholder="dd/mm/aa" oninput="maskDate(this)">
          <label for="dataDocumento${nextIndex}" class="absolute left-4 -top-3 px-1 text-sm text-transparent bg-white rounded-t-lg rounded-b-none transition-all duration-200 pointer-events-none peer-focus:text-blue-600 peer-focus:-top-3 peer-focus:bg-white peer-focus:text-blue-600 peer-focus:rounded-t-lg peer-focus:rounded-b-none peer-focus:text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:bg-transparent peer-placeholder-shown:rounded-none peer-placeholder-shown:text-transparent input-label">
            Data
          </label>
        </div>
      </div>
      <button type="button" class="bg-red-500 hover:bg-red-600 text-white rounded-full p-1 ml-2 flex items-center justify-center w-8 h-8 self-center remove-doenca" title="Remover CID/Doença">
        <i class="fas fa-minus"></i>
      </button>
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
}

// Exportar funções para uso global
window.setupIncapacityEvents = setupEvents;
window.addIncapacityDoencaField = addDoencaField;
