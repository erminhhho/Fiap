/**
 * Módulo de Perfil Social
 */

// Limpar função de inicialização anterior
window.initModule = null;

// Definir nova função de inicialização do módulo
window.initModule = function() {
  setupEvents();
};

// Função para configurar eventos do módulo
function setupEvents() {
  // Destacar campos preenchidos
  if (typeof destacarCamposPreenchidos === 'function') {
    destacarCamposPreenchidos();
  }

  // Configurar botões de adicionar/remover membros da família
  const addMemberBtn = document.getElementById('add-family-member-btn');
  if (addMemberBtn) {
    addMemberBtn.addEventListener('click', addFamilyMember);
  }

  const removeLastMemberBtn = document.getElementById('remove-last-family-member-btn');
  if (removeLastMemberBtn) {
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
    backButton.addEventListener('click', function() {
      navigateTo('personal');
    });
  }

  // Botão Próximo
  const nextButton = document.getElementById('btn-next');
  if (nextButton) {
    nextButton.addEventListener('click', function() {
      navigateTo('disability');
    });
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

// Função para remover o último membro da família
function removeLastFamilyMember() {
  const list = document.getElementById('membros-familia-list');
  if (list && list.children.length > 1) {
    list.lastElementChild.remove();
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

// Inicializar os botões na carga da página
document.addEventListener('DOMContentLoaded', function() {
  setupAddButtons();
});
