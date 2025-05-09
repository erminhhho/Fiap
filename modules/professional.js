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
  const tagButtons = atividadeDiv.querySelectorAll('.tag-btn');
  tagButtons.forEach(button => {
    button.addEventListener('click', function() {
      this.classList.toggle('bg-blue-100');
      this.classList.toggle('text-blue-700');

      // Adicionar/remover ícone de check
      const icon = this.querySelector('i');
      if (this.classList.contains('bg-blue-100')) {
        if (!icon.classList.contains('fa-check')) {
          icon.classList.add('fa-check');
          icon.classList.remove('fa-check-circle', 'fa-file-invoice-dollar', 'fa-seedling', 'fa-handshake', 'fa-ban');
        }
      } else {
        // Restaurar ícone original baseado no data-tag
        const tag = this.dataset.tag;
        icon.classList.remove('fa-check');
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
    });
  });

  // Adicionar ao DOM
  atividadesList.appendChild(atividadeDiv);

  // Destacar campos preenchidos
  if (typeof destacarCamposPreenchidos === 'function') {
    destacarCamposPreenchidos();
  }
}

// Exportar funções para uso global
window.addAtividade = addAtividade;
