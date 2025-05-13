/**
 * Módulo de Atividades Profissionais
 */

// Limpar função de inicialização anterior
window.initModule = null;

// Definir nova função de inicialização do módulo
window.initModule = function() {
  console.log('Inicializando módulo de atividades profissionais...');

  // Forçar reinicialização quando acessado diretamente pela URL
  if (window.location.hash === '#professional') {
    window._professionalInitialized = false;
  }

  // Verificar se o módulo já foi inicializado nesta sessão
  if (window._professionalInitialized) {
    console.log('Módulo de atividades profissionais já inicializado.');

    // Mesmo que já inicializado, vamos garantir que os botões de adicionar estejam configurados
    document.querySelectorAll('.add-atividade-btn').forEach(btn => {
      // Remover eventos existentes
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);

      // Adicionar evento ao novo botão
      newBtn.addEventListener('click', addAtividade);
    });

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

  // Corrigido: Abordagem para o botão de adicionar atividade
  document.querySelectorAll('.add-atividade-btn').forEach(btn => {
    // Remover eventos existentes
    const newBtn = btn.cloneNode(true);

    // Substituir o botão original pelo clone
    btn.parentNode.replaceChild(newBtn, btn);

    // Adicionar evento ao novo botão
    newBtn.addEventListener('click', addAtividade);
  });

  // Configurar tags da primeira linha
  setupTags(document.querySelector('.atividade-item'));

  // Botão Voltar
  const backButton = document.getElementById('btn-back');
  if (backButton) {
    // Preservar classes originais
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
    newBtn.addEventListener('click', function() {
      // Evitar múltiplos cliques
      if (isNavigating) return;
      isNavigating = true;

      // Feedback visual
      const originalText = this.innerHTML;
      this.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Carregando...';
      this.classList.add('opacity-75');

      // Navegar para a próxima página
      navigateTo('documents');

      // Restaurar o botão após um tempo, caso a navegação não tenha ocorrido
      setTimeout(() => {
        if (document.body.contains(this)) {
          this.innerHTML = originalText;
          this.classList.remove('opacity-75');
          isNavigating = false;
        }
      }, 1000);
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
  // Evitar múltiplos cliques
  if (window._atividadeAddLock) return;
  window._atividadeAddLock = true;

  // Abordagem simplificada que funcionará com garantia
  const template = document.getElementById('atividadeTemplate');
  const atividadesList = document.getElementById('atividadesList');

  if (!template || !atividadesList) {
    console.error("Template ou lista de atividades não encontrado");
    window._atividadeAddLock = false;
    return;
  }

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

  // Adicionar ao DOM - coloque sempre no final da lista
  atividadesList.appendChild(atividadeDiv);

  // Destacar campos preenchidos
  if (typeof destacarCamposPreenchidos === 'function') {
    destacarCamposPreenchidos();
  }

  // Reconfigurar os botões de adicionar após adicionar uma nova atividade
  setTimeout(() => {
    document.querySelectorAll('.add-atividade-btn').forEach(btn => {
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      newBtn.addEventListener('click', addAtividade);
    });
    window._atividadeAddLock = false;
  }, 100);
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
