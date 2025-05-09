/**
 * Módulo de Atividades Profissionais
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

  // Configurar botão de adicionar na primeira linha
  const firstAddBtn = document.querySelector('.add-atividade-btn');
  if (firstAddBtn) {
    firstAddBtn.addEventListener('click', function() {
      addAtividade();
    });
  }

  // Configurar tags da primeira linha
  setupTags(document.querySelector('.atividade-item'));

  // Botão Voltar
  const backButton = document.getElementById('btn-back');
  if (backButton) {
    backButton.addEventListener('click', function() {
      navigateTo('incapacity');
    });
  }

  // Botão Próximo
  const nextButton = document.getElementById('btn-next');
  if (nextButton) {
    nextButton.addEventListener('click', function() {
      navigateTo('documents');
    });
  }
}

// Função para configurar as tags de uma atividade
function setupTags(atividadeDiv) {
  const tagButtons = atividadeDiv.querySelectorAll('.tag-btn');

  tagButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Se a tag já está selecionada, apenas desmarca
      if (this.classList.contains('bg-blue-100')) {
        this.classList.remove('bg-blue-100', 'text-blue-700');
        const icon = this.querySelector('i');
        icon.classList.remove('fa-check');
        restoreOriginalIcon(icon, this.dataset.tag);
        return;
      }

      // Desmarca todas as outras tags
      tagButtons.forEach(otherButton => {
        if (otherButton !== this) {
          otherButton.classList.remove('bg-blue-100', 'text-blue-700');
          const otherIcon = otherButton.querySelector('i');
          otherIcon.classList.remove('fa-check');
          restoreOriginalIcon(otherIcon, otherButton.dataset.tag);
        }
      });

      // Marca a tag selecionada
      this.classList.add('bg-blue-100', 'text-blue-700');
      const icon = this.querySelector('i');
      icon.classList.remove('fa-check-circle', 'fa-file-invoice-dollar', 'fa-seedling', 'fa-handshake', 'fa-ban');
      icon.classList.add('fa-check');
    });
  });
}

// Função para restaurar o ícone original da tag
function restoreOriginalIcon(icon, tag) {
  switch(tag) {
    case 'contribuiu':
      icon.classList.add('fa-check-circle');
      break;
    case 'pagou_carnes':
      icon.classList.add('fa-file-invoice-dollar');
      break;
    case 'subsistencia':
      icon.classList.add('fa-seedling');
      break;
    case 'guida':
      icon.classList.add('fa-handshake');
      break;
    case 'sem_contribuicao':
      icon.classList.add('fa-ban');
      break;
  }
}

// Função para adicionar uma nova atividade
function addAtividade() {
  const template = document.getElementById('atividadeTemplate');
  const atividadesList = document.getElementById('atividadesList');

  if (!template || !atividadesList) return;

  // Clonar o template
  const clone = template.content.cloneNode(true);
  const atividadeDiv = clone.querySelector('.atividade-item');

  // Configurar botão de remover
  const removeBtn = atividadeDiv.querySelector('.remove-atividade');
  if (removeBtn) {
    removeBtn.addEventListener('click', function() {
      atividadeDiv.remove();
    });
  }

  // Configurar select de tipo de atividade
  const tipoSelect = atividadeDiv.querySelector('.tipo-atividade');
  if (tipoSelect) {
    tipoSelect.addEventListener('change', function() {
      const seguradoEspecialFields = atividadeDiv.querySelector('.segurado-especial-fields');
      if (seguradoEspecialFields) {
        seguradoEspecialFields.classList.toggle('hidden', this.value !== 'segurado_especial');
      }
    });
  }

  // Configurar tags
  setupTags(atividadeDiv);

  // Adicionar ao DOM
  atividadesList.appendChild(atividadeDiv);

  // Destacar campos preenchidos
  if (typeof destacarCamposPreenchidos === 'function') {
    destacarCamposPreenchidos();
  }
}

// Exportar funções para uso global
window.addAtividade = addAtividade;

// Função para ativar/desativar a tag de atividade
function toggleActivityTag(element) {
  // Obter o tipo de relacionamento atual
  const currentRelationship = element.getAttribute('data-selected');
  const relationshipValue = element.getAttribute('data-value') || element.querySelector('select').value;

  // Garantir que sempre tenhamos o data-value para aplicar a cor correta
  if (!element.hasAttribute('data-value')) {
    element.setAttribute('data-value', relationshipValue);
  }

  // Se já tem um relacionamento selecionado, vamos deixá-lo no formato padrão
  if (currentRelationship) {
    element.removeAttribute('data-selected');
  } else {
    // Caso contrário, vamos usar o valor do data-value como o tipo de relacionamento selecionado
    element.setAttribute('data-selected', relationshipValue);
  }
}

// Função para atualizar a tag selecionada
function updateActivityTag(select) {
  const container = select.closest('.relationship-select');
  const value = select.value;
  const text = select.options[select.selectedIndex].text;

  // Atualiza os atributos data-selected e data-value
  container.setAttribute('data-selected', text);
  container.setAttribute('data-value', value);
}
