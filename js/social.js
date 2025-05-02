/**
 * Script para o gerenciamento do formulário social
 */

// Esperar o DOM estar pronto
document.addEventListener('DOMContentLoaded', function() {
  console.log("Inicializando módulo social...");

  // Inicializar os seletores do CAD Único
  setupCadUnicoOptions();

  // Adicionar o assistido como membro inicial
  addAssistidoAsPrimaryMember();

  // CORREÇÃO: Configurar uma única vez os eventos dos botões
  setupFamilyButtons();

  // NOVO: Verificar se já existem membros e atualizar a visibilidade do botão remover
  updateRemoveButtonVisibility();
});

// Configurar os botões de adicionar e remover membros da família
function setupFamilyButtons() {
  // Obter referências para o botão de adicionar e remover
  const addButton = document.getElementById('add-family-member-btn');

  // CORREÇÃO: Garantir que o botão de remover exista na estrutura HTML
  let removeButton = document.getElementById('remove-family-member-btn');
  if (!removeButton) {
    // Se o botão não existe, vamos criá-lo
    removeButton = document.createElement('button');
    removeButton.id = 'remove-family-member-btn';
    removeButton.className = 'bg-red-500 hover:bg-red-600 text-white text-xs font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1 transition-colors';
    removeButton.title = 'Remover Membro';
    removeButton.innerHTML = '<i class="fas fa-minus text-xs"></i> Remover';

    // Inserir antes do botão de adicionar
    if (addButton && addButton.parentNode) {
      addButton.parentNode.insertBefore(removeButton, addButton);
    }
  }

  if (addButton) {
    // CORREÇÃO: Remover qualquer listener anterior para evitar duplicação
    const newAddButton = addButton.cloneNode(true);
    addButton.parentNode.replaceChild(newAddButton, addButton);

    // Adicionar evento de clique ao novo botão
    newAddButton.addEventListener('click', function() {
      addFamilyMember();
    });
  }

  if (removeButton) {
    // CORREÇÃO: Remover qualquer listener anterior para evitar duplicação
    const newRemoveButton = removeButton.cloneNode(true);
    if (removeButton.parentNode) {
      removeButton.parentNode.replaceChild(newRemoveButton, removeButton);
    }

    // Adicionar evento de clique ao novo botão
    newRemoveButton.addEventListener('click', function() {
      removeFamilyMember();
    });

    // Inicialmente oculto até que haja membros para remover
    newRemoveButton.style.display = 'none';
  }
}

// Nova função para atualizar a visibilidade do botão remover
function updateRemoveButtonVisibility() {
  const container = document.getElementById('membros-familia-list');
  const removeBtn = document.getElementById('remove-family-member-btn');

  if (container && removeBtn) {
    const members = container.querySelectorAll('.membro-familia:not(.assistido)');
    removeBtn.style.display = members.length > 0 ? 'flex' : 'none';
  }
}

// Adicionar um novo membro da família
function addFamilyMember() {
  console.log("Adicionando novo membro da família");

  const memberTemplate = document.getElementById('membro-familia-template');
  const membersList = document.getElementById('membros-familia-list');
  const removeButton = document.getElementById('remove-family-member-btn');

  if (memberTemplate && membersList) {
    // CORREÇÃO: Usar o conteúdo diretamente do template (não o elemento HTML)
    const newMember = document.createElement('div');
    newMember.innerHTML = memberTemplate.innerHTML;

    // Adicionar o novo membro ao final da lista
    membersList.appendChild(newMember.firstElementChild);

    // CORREÇÃO: Certificar que o botão de remover esteja visível
    if (removeButton) {
      removeButton.style.display = 'flex';
    }
  }

  // Inicializar botões CadÚnico para o novo membro
  initCadUnicoButtons();

  // CORREÇÃO: Atualizar a visibilidade do botão remover após adicionar um membro
  updateRemoveButtonVisibility();
}

// Remover o último membro adicionado
function removeFamilyMember() {
  console.log("Removendo membro da família");

  const container = document.getElementById('membros-familia-list');
  const removeBtn = document.getElementById('remove-family-member-btn');

  if (container) {
    // Obter todos os membros que não são o assistido
    const members = container.querySelectorAll('.membro-familia:not(.assistido)');

    if (members.length > 0) {
      // CORREÇÃO: Remover apenas o último membro
      const lastMember = members[members.length - 1];
      lastMember.remove();

      // Atualizar visibilidade do botão remover
      updateRemoveButtonVisibility();
    }
  }
}

// Adicionar o assistido como membro inicial
function addAssistidoAsPrimaryMember() {
  const container = document.getElementById('membros-familia-list');
  const template = document.getElementById('assistido-template');

  if (container && template && template.content) {
    // Limpar o container
    container.innerHTML = '';

    // Clonar o conteúdo do template e adicionar ao container
    const clone = template.content.cloneNode(true);
    container.appendChild(clone);

    // Preencher dados do assistido (usando dados simulados)
    const nomeField = document.getElementById('assistido_nome');
    const cpfField = document.getElementById('assistido_cpf');
    const idadeField = document.getElementById('assistido_idade');

    if (nomeField) nomeField.value = "Nome do Assistido";
    if (cpfField) cpfField.value = "000.000.000-00";
    if (idadeField) idadeField.value = "30";
  }
}

// Configurar os botões de status do CAD Único
function setupCadUnicoOptions() {
  document.querySelectorAll('.status-option').forEach(option => {
    const radio = option.querySelector('input[type="radio"]');
    const badge = option.querySelector('.status-badge');

    if (badge) {
      // Garantir que o badge seja clicável com cursor apropriado
      badge.classList.add('cursor-pointer');

      // Verificar se já está selecionado no carregamento inicial
      if (radio && radio.checked) {
        badge.classList.add('bg-blue-50', 'border-blue-500');
        const icon = badge.querySelector('.option-icon');
        if (icon) {
          icon.classList.remove('text-gray-400');
          icon.classList.add('text-blue-500');
        }
      }

      // Adicionar evento de clique com feedback visual
      badge.addEventListener('click', function() {
        // Remover seleção de todos os badges
        document.querySelectorAll('.status-badge').forEach(b => {
          b.classList.remove('bg-blue-50', 'border-blue-500');
          const icon = b.querySelector('.option-icon');
          if (icon) {
            icon.classList.remove('text-blue-500');
            icon.classList.add('text-gray-400');
          }
        });

        // Marcar este como selecionado
        if (radio) {
          radio.checked = true;

          // Disparar o evento change para garantir que qualquer handler escute a mudança
          const event = new Event('change', { bubbles: true });
          radio.dispatchEvent(event);
        }

        // Adicionar classes de estilo para mostrar seleção
        this.classList.add('bg-blue-50', 'border-blue-500');

        const icon = this.querySelector('.option-icon');
        if (icon) {
          icon.classList.remove('text-gray-400');
          icon.classList.add('text-blue-500');
        }

        // Feedback visual temporário para melhorar UX
        this.style.transform = 'scale(1.05)';
        setTimeout(() => {
          this.style.transform = '';
        }, 200);
      });
    }
  });

  // Inicializar os botões CadÚnico para os membros da família
  initCadUnicoButtons();
}

// Nova função para inicializar botões CadÚnico em membros da família
function initCadUnicoButtons() {
  document.querySelectorAll('.cadunico-btn').forEach(btn => {
    if (!btn.hasAttribute('data-initialized')) {
      btn.setAttribute('data-initialized', 'true');

      btn.addEventListener('click', function() {
        const hiddenInput = this.previousElementSibling;

        if (this.classList.contains('active')) {
          // Desativar
          this.classList.remove('active', 'bg-blue-500', 'text-white');
          this.classList.add('border-gray-300', 'text-gray-500');
          if (hiddenInput) hiddenInput.value = 'Não';
        } else {
          // Ativar
          this.classList.add('active', 'bg-blue-500', 'text-white');
          this.classList.remove('border-gray-300', 'text-gray-500');
          if (hiddenInput) hiddenInput.value = 'Sim';
        }
      });
    }
  });
}
