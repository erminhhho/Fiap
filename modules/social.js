/**
 * Módulo de Perfil Social
 */

// Limpar função de inicialização anterior
window.initModule = null;

// Definir nova função de inicialização do módulo
window.initModule = function() {
  setupEvents();

  // Usar MutationObserver para garantir que o DOM foi carregado completamente
  // e que o contêiner "membros-familia-list" existe antes de tentar inicializá-lo
  const observer = new MutationObserver(function(mutations, obs) {
    const container = document.getElementById('membros-familia-list');
    if (container) {
      console.log("Container 'membros-familia-list' encontrado, inicializando assistido...");
      inicializarAssistido();
      obs.disconnect(); // Parar de observar quando o elemento for encontrado
    }
  });

  // Configurar e iniciar o observer
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Defina um timeout para garantir que o observer não continuará indefinidamente
  setTimeout(() => {
    observer.disconnect();
    if (!document.getElementById('membros-familia-list')) {
      console.warn("O container 'membros-familia-list' não foi encontrado após espera máxima.");
    }
  }, 2000);
};

// Função para configurar eventos do módulo
function setupEvents() {
  // Destacar campos preenchidos
  if (typeof destacarCamposPreenchidos === 'function') {
    destacarCamposPreenchidos();
  }  // Configurar botões de adicionar/remover membros da família
  // Nota: O botão de adicionar agora é inserido diretamente ao lado do assistido com onclick em linha

  const removeLastMemberBtn = document.getElementById('remove-last-family-member-btn');
  if (removeLastMemberBtn) {
    // Aplicar estilo centralizado ao botão de remover
    if (window.tw && typeof window.tw.applyTo === 'function') {
      window.tw.applyTo(removeLastMemberBtn, 'button.remove');
    }

    removeLastMemberBtn.addEventListener('click', removeLastFamilyMember);
  }

  // Configurar evento para os botões CadÚnico
  const membrosList = document.getElementById('membros-familia-list');
  if (membrosList) {
    membrosList.addEventListener('click', function(event) {
      const cadUnicoButton = event.target.closest('.cadunico-btn');
      if (cadUnicoButton) {
        toggleCadUnico(cadUnicoButton);
      }
    });
  }

  // Adicionar membro inicial se lista estiver vazia
  setTimeout(function() {
    const list = document.getElementById('membros-familia-list');
    // Verificar se o elemento existe e está vazio
    if (list && list.children.length === 0) {
      // Adicionar um membro inicial
      if (typeof addFamilyMember === 'function') {
        addFamilyMember();
      }
    }
  }, 200);

  // Botão Voltar
  const backButton = document.getElementById('btn-back');
  if (backButton) {
    // Aplicar estilo centralizado ao botão voltar
    if (window.tw && typeof window.tw.applyTo === 'function') {
      window.tw.applyTo(backButton, 'button.secondary');
    }

    backButton.addEventListener('click', function() {
      navigateTo('personal');
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
      navigateTo('incapacity');
    });
  }
}

// Inicializar dados do assistido
function inicializarAssistido() {
  console.log("Inicializando dados do assistido...");

  const container = document.getElementById('membros-familia-list');
  if (!container) {
    console.error("Container de membros da família não encontrado");
    return;
  }

  // Limpar o container
  container.innerHTML = '';

  // Criar elemento HTML para o assistido (primeira linha)
  const assistidoHtml = `
    <div class="membro-familia mb-6 relative assistido">
      <div class="grid grid-cols-1 md:grid-cols-24 gap-4">
        <!-- Nome do assistido - 6 colunas -->
        <div class="relative md:col-span-6">
          <input type="text" name="familiar_nome[]" id="assistido_nome" class="peer w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-3 text-gray-800 placeholder-gray-400 transition-colors duration-200" readonly />
          <label class="absolute left-4 -top-3 px-1 text-sm text-blue-600 bg-gray-50 rounded-t-lg rounded-b-none">
            Nome do Assistido
          </label>
        </div>

        <!-- CPF - 3 colunas -->
        <div class="relative md:col-span-3">
          <input type="text" name="familiar_cpf[]" id="assistido_cpf" class="peer w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-3 text-gray-800 placeholder-gray-400 transition-colors duration-200" readonly />
          <label class="absolute left-4 -top-3 px-1 text-sm text-blue-600 bg-gray-50 rounded-t-lg rounded-b-none">
            CPF
          </label>
        </div>

        <!-- Idade - 2 colunas -->
        <div class="relative md:col-span-2">
          <input type="text" name="familiar_idade[]" id="assistido_idade" class="peer w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-3 text-gray-800 placeholder-gray-400 transition-colors duration-200" readonly />
          <label class="absolute left-4 -top-3 px-1 text-sm text-blue-600 bg-gray-50 rounded-t-lg rounded-b-none">
            Idade
          </label>
        </div>

        <!-- Parentesco - 4 colunas (fixo como "Assistido") -->
        <div class="relative md:col-span-4">
          <input type="text" name="familiar_parentesco[]" value="Assistido" class="peer w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-3 text-gray-800 transition-colors duration-200" readonly />
          <label class="absolute left-4 -top-3 px-1 text-sm text-blue-600 bg-gray-50 rounded-t-lg rounded-b-none">
            Parentesco
          </label>
        </div>

        <!-- Estado Civil - 4 colunas (editável) -->
        <div class="relative md:col-span-4">
          <select name="familiar_estado_civil[]" class="peer w-full rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 px-4 py-3 text-gray-800 bg-gray-50 transition-colors duration-200">
            <option value="" selected disabled>Selecione...</option>
            <option value="Solteiro(a)">Solteiro(a)</option>
            <option value="Casado(a)">Casado(a)</option>
            <option value="União Estável">União Estável</option>
            <option value="Divorciado(a)">Divorciado(a)</option>
            <option value="Viúvo(a)">Viúvo(a)</option>
          </select>
          <label class="absolute left-4 -top-3 px-1 text-sm text-blue-600 bg-gray-50 rounded-t-lg rounded-b-none">
            Estado Civil
          </label>
        </div>

        <!-- Renda Mensal - 2 colunas (editável) -->
        <div class="relative md:col-span-2">
          <input type="text" name="familiar_renda[]" class="peer w-full rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 px-4 py-3 text-gray-800 bg-gray-50 placeholder-gray-400 transition-colors duration-200" placeholder="Renda" />
          <label class="absolute left-4 -top-3 px-1 text-sm text-blue-600 bg-gray-50 rounded-t-lg rounded-b-none">
            Renda
          </label>
        </div>        <!-- CadÚnico - 2 colunas (editável) -->
        <div class="relative md:col-span-2 flex items-center justify-center">
          <input type="hidden" name="familiar_cadunico[]" value="Não">
          <button type="button" class="cadunico-btn rounded-lg border border-gray-300 text-gray-500 hover:border-blue-500 hover:text-blue-600" title="Possui CadÚnico?" onclick="toggleCadUnico(this)">
            CadÚnico
          </button>
        </div>

        <!-- Botão de adicionar membro ao lado do assistido -->
        <div class="relative md:col-span-1 flex items-center justify-center">
          <button type="button" class="add-family-btn bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1 flex items-center justify-center w-8 h-8" title="Adicionar membro" onclick="addFamilyMember()">
            <i class="fas fa-plus"></i>
          </button>
        </div>
      </div>
    </div>
  `;
  // Inserir HTML diretamente
  container.innerHTML = assistidoHtml;
  // Preencher dados do assistido
  preencherDadosAssistido();
}

// Função para preencher os dados do assistido baseado na primeira página
function preencherDadosAssistido() {
  console.log('Preenchendo dados do assistido da primeira página...');

  // Usar o novo módulo de persistência de dados se disponível
  if (typeof FIAP !== 'undefined' && FIAP.data) {
    // Mapeamento entre os campos da página anterior e os campos atuais
    const fieldMapping = {
      'nome': 'assistido_nome',
      'cpf': 'assistido_cpf',
      'idade': 'assistido_idade'
    };

    // Carregar dados usando o novo módulo
    FIAP.data.loadFormData('assistido', fieldMapping);

    // Processamento especial para a idade (extrair apenas anos)
    const idadeInput = document.getElementById('assistido_idade');
    if (idadeInput && idadeInput.value) {
      const anosMatch = idadeInput.value.match(/(\d+)\s+anos?/);
      if (anosMatch && anosMatch[1]) {
        idadeInput.value = anosMatch[1] + ' anos';
        console.log('Idade do assistido processada:', idadeInput.value);
      }
    }
  } else {
    // Fallback para o método anterior caso o módulo não esteja disponível
    console.log('Usando método legacy para preencher dados');

    // Obter nome da primeira página (priorizar localStorage para maior confiabilidade)
    const nomeInput = document.getElementById('assistido_nome');
    if (nomeInput) {
      const nomePrimeiraPagina = localStorage.getItem('nome') || document.getElementById('nome')?.value || 'Assistido';
      nomeInput.value = nomePrimeiraPagina;
      console.log('Nome do assistido preenchido:', nomePrimeiraPagina);
    }

    // Obter CPF da primeira página - sem ícone de validação
    const cpfInput = document.getElementById('assistido_cpf');
    if (cpfInput) {
      const cpfPrimeiraPagina = localStorage.getItem('cpf') || document.getElementById('cpf')?.value || '';
      cpfInput.value = cpfPrimeiraPagina;
      console.log('CPF do assistido preenchido:', cpfPrimeiraPagina);
    }

    // Obter idade da primeira página (somente anos, sem meses)
    const idadeInput = document.getElementById('assistido_idade');
    if (idadeInput) {
      const idadePrimeiraPagina = localStorage.getItem('idade') || document.getElementById('idade')?.value || '';
      // Extrair apenas o número de anos (remover os meses)
      const anosMatch = idadePrimeiraPagina.match(/(\d+)\s+anos?/);
      if (anosMatch && anosMatch[1]) {
        idadeInput.value = anosMatch[1] + ' anos';
      } else {
        idadeInput.value = idadePrimeiraPagina;
      }
      console.log('Idade do assistido preenchida:', idadeInput.value);
    }
  }
}

// Função para adicionar membro da família
function addFamilyMember() {
  const container = document.getElementById('membros-familia-container');
  const list = document.getElementById('membros-familia-list');

  // Verificar se os elementos existem
  if (!container || !list) {
    console.error('Elementos necessários não encontrados.');
    return;
  }

  const template = document.getElementById('membro-familia-template');
  if (!template) {
    console.error('Template de membro da família não encontrado.');
    return;
  }

  const memberDiv = document.createElement('div');
  memberDiv.innerHTML = template.innerHTML.trim();
  const newMemberElement = memberDiv.firstChild;

  list.appendChild(newMemberElement);

  // Aplicar máscaras aos novos campos
  if (typeof maskCPF === 'function') {
    newMemberElement.querySelectorAll('input[name="familiar_cpf[]"]').forEach(input => {
      input.addEventListener('input', function() {
        maskCPF(this);
      });
    });
  }

  // Destacar campos
  if (typeof destacarCamposPreenchidos === 'function') {
    destacarCamposPreenchidos();
  }

  updateRemoveMemberButton();
}

// Função para remover o último membro da família (nunca remove o assistido)
function removeLastFamilyMember() {
  const list = document.getElementById('membros-familia-list');
  if (list && list.children.length > 1) {
    list.lastElementChild.remove();
    updateRemoveMemberButton();
  }
}

// Função para remover um membro específico da família (nunca o assistido)
function removeSpecificFamilyMember(button) {
  if (!button) return;

  const memberDiv = button.closest('.membro-familia');
  if (memberDiv && !memberDiv.classList.contains('assistido')) {
    memberDiv.remove();
    updateRemoveMemberButton();
  }
}

// Função para atualizar a visibilidade do botão de remover membro
function updateRemoveMemberButton() {
  const removeButton = document.getElementById('remove-last-family-member-btn');
  const list = document.getElementById('membros-familia-list');
  if (removeButton && list) {
    removeButton.style.display = list.children.length > 1 ? 'flex' : 'none';
  }
}

// Função para alternar o estado do botão CadÚnico
function toggleCadUnico(button) {
  if (!button) return;

  button.classList.toggle('active');
  const hiddenInput = button.previousElementSibling;
  if (hiddenInput && hiddenInput.type === 'hidden') {
    hiddenInput.value = button.classList.contains('active') ? 'Sim' : 'Não';
  }
}

// Corrigir o problema de duplicação ao adicionar linhas
function setupAddButtons() {
  // Remover eventos existentes para evitar duplicação
  const addButtons = document.querySelectorAll('.add-item-button');
  addButtons.forEach(button => {
    // Clone o botão para remover todos os event listeners
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);

    // Adicionar o novo event listener
    newButton.addEventListener('click', function() {
      const targetId = this.getAttribute('data-target');
      addItem(targetId);
    });
  });
}

/**
 * Adiciona um novo item a uma lista
 * @param {string} targetId - ID do container onde adicionar o item
 */
function addItem(targetId) {
  const container = document.getElementById(targetId);
  if (!container) return;

  const itemsCount = container.querySelectorAll('.social-item').length;
  const newId = itemsCount + 1;

  let template;

  // Escolher o template baseado no targetId
  switch(targetId) {
    case 'beneficiosList':
      template = createBeneficioTemplate(newId);
      break;
    case 'composicaoFamiliarList':
      template = createFamiliarTemplate(newId);
      break;
    case 'rendaList':
      template = createRendaTemplate(newId);
      break;
    // Adicione outros casos conforme necessário
    default:
      console.error('Template não encontrado para:', targetId);
      return;
  }

  const itemDiv = document.createElement('div');
  itemDiv.className = 'social-item mb-4 border-b border-gray-200 pb-4';
  itemDiv.innerHTML = template;
  container.appendChild(itemDiv);

  // Configurar o botão de remover
  const removeBtn = itemDiv.querySelector('.remove-item');
  if (removeBtn) {
    removeBtn.addEventListener('click', function() {
      itemDiv.remove();
    });
  }

  // Inicializar máscaras e outros comportamentos especiais
  if (typeof initMasks === 'function') {
    initMasks();
  }
}

// Funções para criar templates (mantenha as que você já tem)
function createBeneficioTemplate(id) {
  return `
    <!-- Template para benefício -->
    <!-- ...existing code... -->
  `;
}

// Função para inicializar os elementos da interface
function initSocialModule() {
  // Configurar as opções selecionáveis do CAD Único
  setupStatusOptions();

  // Carregar os dados do assistido como primeiro membro familiar
  carregarDadosAssistido();

  // Configurar os botões de adição e remoção
  setupAddButtons();
}

// Inicializar as opções estilizadas do status (versão horizontal)
function setupStatusOptions() {
  document.querySelectorAll('.status-option').forEach(option => {
    const radio = option.querySelector('input[type="radio"]');
    const badge = option.querySelector('.status-badge');
    const icon = option.querySelector('.option-icon');

    badge.addEventListener('click', () => {
      // Desmarcar todos
      document.querySelectorAll('.status-option input[type="radio"]').forEach(r => r.checked = false);
      document.querySelectorAll('.status-badge').forEach(b => {
        b.classList.remove('border-blue-500', 'bg-blue-50');
        b.querySelector('.option-icon').classList.remove('text-blue-500');
        b.querySelector('.option-icon').classList.add('text-gray-400');
      });

      // Marcar o selecionado
      radio.checked = true;
      badge.classList.add('border-blue-500', 'bg-blue-50');
      icon.classList.remove('text-gray-400');
      icon.classList.add('text-blue-500');
    });
  });
}

// Exportar funções para o escopo global
window.addFamilyMember = addFamilyMember;
window.removeLastFamilyMember = removeLastFamilyMember;
window.removeSpecificFamilyMember = removeSpecificFamilyMember;
window.toggleCadUnico = toggleCadUnico;
window.updateRemoveMemberButton = updateRemoveMemberButton;

// Inicializar os botões na carga da página
document.addEventListener('DOMContentLoaded', function() {
  setupAddButtons();
});
