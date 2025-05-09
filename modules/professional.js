/**
 * Módulo de Atividades Profissionais
 */

// Limpar função de inicialização anterior
window.initModule = null;

// Definir nova função de inicialização do módulo
window.initModule = function() {
  // Verificar se o módulo já foi inicializado nesta sessão
  if (window._professionalInitialized) {
    console.log('Módulo de atividades profissionais já inicializado.');
    return;
  }

  // Marcar como inicializado
  window._professionalInitialized = true;

  // Configurar eventos
  setupEvents();

  // Limpar flag quando a página mudar
  document.addEventListener('stepChanged', function() {
    window._professionalInitialized = false;
  }, { once: true });
};

// Função para configurar eventos do módulo
function setupEvents() {
  // Destacar campos preenchidos
  if (typeof destacarCamposPreenchidos === 'function') {
    destacarCamposPreenchidos();
  }

  // Configurar botão de adicionar na primeira linha - abordagem mais segura
  // Primeiro remove qualquer botão existente e cria um completamente novo
  const container = document.querySelector('.atividade-item:first-child .md\\:col-span-1');
  if (container) {
    // Remover qualquer botão existente
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    // Criar um novo botão do zero
    const newBtn = document.createElement('button');
    newBtn.type = 'button';
    newBtn.className = 'add-atividade-btn bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1 flex items-center justify-center w-8 h-8';
    newBtn.title = 'Adicionar atividade';
    newBtn.innerHTML = '<i class="fas fa-plus"></i>';

    // Adicionar o evento uma única vez ao novo botão
    newBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      addAtividade();
    });

    // Adicionar o novo botão ao container
    container.appendChild(newBtn);
  }

  // Configurar tags da primeira linha
  setupTags(document.querySelector('.atividade-item'));

  // Botão Voltar
  const backButton = document.getElementById('btn-back');
  if (backButton) {
    // Preservar as classes originais
    const originalClasses = backButton.className;

    // Remover eventos existentes
    const newBackBtn = backButton.cloneNode(true);

    // Garantir que todas as classes originais sejam mantidas
    newBackBtn.className = originalClasses;

    // Se houver classes específicas que precisam ser adicionadas
    if (window.tw && typeof window.tw.applyTo === 'function') {
      window.tw.applyTo(newBackBtn, 'button.secondary');
    }

    backButton.parentNode.replaceChild(newBackBtn, backButton);

    // Adicionar novo evento
    newBackBtn.addEventListener('click', function() {
      navigateTo('incapacity');
    });
  }

  // Botão Próximo
  const nextButton = document.getElementById('btn-next');
  if (nextButton) {
    // Preservar as classes originais
    const originalClasses = nextButton.className;

    // Remover eventos existentes
    const newNextBtn = nextButton.cloneNode(true);

    // Garantir que todas as classes originais sejam mantidas
    newNextBtn.className = originalClasses;

    // Se houver classes específicas que precisam ser adicionadas
    if (window.tw && typeof window.tw.applyTo === 'function') {
      window.tw.applyTo(newNextBtn, 'button.primary');
    }

    nextButton.parentNode.replaceChild(newNextBtn, nextButton);

    // Adicionar novo evento
    newNextBtn.addEventListener('click', function() {
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
    case 'Contribuiu':
      icon.classList.add('fa-check-circle');
      break;
    case 'Pagou Guia':
      icon.classList.add('fa-file-invoice-dollar');
      break;
    case 'Subsistência':
      icon.classList.add('fa-seedling');
      break;
    case 'Sem Contribuição':
      icon.classList.add('fa-ban');
      break;
  }
}

// Função para adicionar uma nova atividade
function addAtividade() {
  // Global lock para prevenir múltiplas execuções
  if (window._addAtividadeLock === true) {
    console.log("Operação de adicionar em andamento, ignorando clique");
    return;
  }

  // Aplicar lock global
  window._addAtividadeLock = true;

  // Verificar se já existem múltiplas atividades (possível duplicação)
  const countExistingItems = document.querySelectorAll('.atividade-item').length;
  const lastItemTime = window._lastAddAtividadeTime || 0;
  const now = Date.now();

  // Se última adição foi muito recente (menos de 1 segundo atrás)
  if (now - lastItemTime < 1000) {
    console.log("Tentativa de adicionar atividade muito rápido, ignorando");
    window._addAtividadeLock = false;
    return;
  }

  // Armazenar momento desta operação
  window._lastAddAtividadeTime = now;

  try {
    const template = document.getElementById('atividadeTemplate');
    const atividadesList = document.getElementById('atividadesList');

    if (!template || !atividadesList) {
      console.error("Template ou lista de atividades não encontrado");
      return;
    }

    // Verificar se já não temos um item temporário em processamento
    if (atividadesList.querySelector('.processing-item')) {
      console.log("Já existe um item em processamento");
      return;
    }

    // Clonar o template
    const clone = template.content.cloneNode(true);
    const atividadeDiv = clone.querySelector('.atividade-item');

    // Marcar como item em processamento
    atividadeDiv.classList.add('processing-item');

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

    // Adicionar ao DOM
    atividadesList.appendChild(atividadeDiv);

    // Remover a classe de processamento após um curto período
    setTimeout(() => {
      atividadeDiv.classList.remove('processing-item');
    }, 500);

    // Destacar campos preenchidos
    if (typeof destacarCamposPreenchidos === 'function') {
      destacarCamposPreenchidos();
    }
  } catch (error) {
    console.error("Erro ao adicionar atividade:", error);
  } finally {
    // Liberar o lock após um período seguro
    setTimeout(() => {
      window._addAtividadeLock = false;
    }, 1000);
  }
}

// Exportar funções para uso global
window.addAtividade = addAtividade;

// Função para obter o texto formatado
function getFormattedText(value) {
  return value.split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Função para atualizar a tag selecionada
function updateActivityTag(select) {
  const container = select.closest('.relationship-select');
  const value = select.value;

  // Atualiza os atributos data-selected e data-value
  // Usamos o mesmo valor para ambos já que os valores já estão formatados no HTML
  container.setAttribute('data-selected', value);
  container.setAttribute('data-value', value);
}

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
    // Caso contrário, usar o valor diretamente
    element.setAttribute('data-selected', relationshipValue);
  }
}
