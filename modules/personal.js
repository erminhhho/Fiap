/**
 * Módulo de Dados Pessoais
 */

// Limpar função de inicialização anterior
window.initModule = null;

// Contador global de autores - usando window para evitar redeclaração
if (typeof window.authorCount === 'undefined') {
    window.authorCount = 1;
}

// Array com etiquetas para os autores adicionais - usando window para evitar redeclaração
if (typeof window.authorLabels === 'undefined') {
    window.authorLabels = ['Requerente', 'Instituidor', 'Dependente', 'Representante', 'Requerente Rep.', 'Litsconsorte'];
}

// Função para adicionar um novo autor
function addAuthor() {
  // Prevenir cliques duplicados
  if (window._addingAuthor) return;
  window._addingAuthor = true;

  try {
    window.authorCount++;

    // Obter apenas a primeira linha do autor (não a segunda com apelido e telefone)
    const firstAuthorRow = document.querySelector('.author-row .flex.items-center') ||
                           document.querySelector('#author-1 > .flex.items-center');

    if (!firstAuthorRow) {
      console.error('Elemento da primeira linha do autor não encontrado');
      window._addingAuthor = false;
      return;
    }

    // Criar uma nova div para o autor
    const newAuthor = document.createElement('div');
    newAuthor.className = 'author-row mb-4';
    newAuthor.id = `author-${window.authorCount}`;

    // Clonar apenas a primeira linha
    const firstRowClone = firstAuthorRow.cloneNode(true);
    newAuthor.appendChild(firstRowClone);

    // Atualizar IDs e names de todos os campos no novo autor
    newAuthor.querySelectorAll('input, select').forEach(field => {
      const originalId = field.id;
      if (originalId) {
        // Extrair o nome base do campo sem o número
        const baseName = originalId.replace(/(_\d+$|^\w+$)/, '');
        const newId = baseName ? `${baseName}_${window.authorCount}` : `${originalId}_${window.authorCount}`;

        // Atualizar ID e name
        field.id = newId;
        field.name = newId;

        // Limpar o valor do campo
        if (field.tagName === 'INPUT') {
          field.value = '';
        }

        // Atualizar atributos de data se existirem
        if (field.hasAttribute('data-target-age')) {
          field.setAttribute('data-target-age', `idade_${window.authorCount}`);
        }
      }
    });

    // Atualizar os labels para apontar para os novos IDs
    newAuthor.querySelectorAll('label').forEach(label => {
      const forAttr = label.getAttribute('for');
      if (forAttr) {
        // Extrair o nome base do campo sem o número
        const baseName = forAttr.replace(/(_\d+$|^\w+$)/, '');
        const newFor = baseName ? `${baseName}_${window.authorCount}` : `${forAttr}_${window.authorCount}`;
        label.setAttribute('for', newFor);
      }
    });

    // Substituir o botão de adicionar por um botão de remover
    const addButton = newAuthor.querySelector('button[title="Adicionar autor"]');
    if (addButton) {
      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.className = 'bg-red-500 hover:bg-red-600 text-white rounded-full p-1 ml-2 flex items-center justify-center w-8 h-8 self-center';
      removeButton.title = 'Remover autor';
      removeButton.innerHTML = '<i class="fas fa-minus"></i>';
      removeButton.onclick = function() { removeSpecificAuthor(window.authorCount); };

      if (addButton.parentNode) {
        addButton.parentNode.replaceChild(removeButton, addButton);
      }
    }

    // Adicionar separador e o novo autor ao container
    const separator = document.createElement('div');
    separator.className = 'author-separator border-t border-gray-200 my-4';

    const authorsContainer = document.getElementById('authors-container');
    if (authorsContainer) {
      authorsContainer.appendChild(separator);
      authorsContainer.appendChild(newAuthor);
    }

    // Aplicar estilos ao novo select de relacionamento
    applyRelationshipStyles();
  } catch (error) {
    console.error('Erro ao adicionar autor:', error);
  } finally {
    // Sempre liberar o lock após processamento
    setTimeout(() => {
      window._addingAuthor = false;
    }, 300);
  }
}

// Função para ativar/desativar a etiqueta de WhatsApp
function toggleWhatsAppTag(element) {
  // Alternar a classe 'active'
  element.classList.toggle('active');

  // Obter o checkbox dentro da etiqueta
  const checkbox = element.querySelector('input[type="checkbox"]');

  // Inverter o estado do checkbox
  if (checkbox) {
    checkbox.checked = !checkbox.checked;
  }
}

// Função para ativar/desativar a etiqueta de relacionamento
function toggleRelationshipTag(element) {
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

// Função para remover um autor específico pelo seu ID
function removeSpecificAuthor(authorId) {
  if (window.authorCount <= 1) return; // Sempre manter pelo menos um autor

  const authorsContainer = document.getElementById('authors-container');

  // Encontrar o autor a ser removido
  const authorToRemove = document.getElementById(`author-${authorId}`);
  if (!authorToRemove) return;

  // Encontrar o separador anterior (irmão anterior do autor)
  const prevSibling = authorToRemove.previousElementSibling;
  if (prevSibling && prevSibling.classList.contains('author-separator')) {
    authorsContainer.removeChild(prevSibling);
  }

  // Remover o autor
  authorsContainer.removeChild(authorToRemove);

  // Se o autor removido for o último, decrementar o contador
  if (authorId === window.authorCount) {
    window.authorCount--;
  }
}

// Função para remover o último autor (manter para compatibilidade)
function removeLastAuthor() {
  if (window.authorCount <= 1) return; // Sempre manter pelo menos um autor
  removeSpecificAuthor(window.authorCount);
}

// Função para atualizar a etiqueta de relacionamento
function updateRelationshipLabel(selectElement, authorId) {
  const selectedValue = selectElement.value;
  const nameField = document.getElementById(`nome_${authorId}`);

  // Atualizar o labelText do campo de nome com a relação selecionada
  const nameLabel = document.querySelector(`label[for="nome_${authorId > 1 ? '_' + authorId : ''}"]`);

  if (nameLabel) {
    nameLabel.textContent = selectedValue;
  }

  // Atualizar a cor do seletor baseada na opção selecionada
  const relationshipSelect = selectElement.closest('.relationship-select');
  if (relationshipSelect) {
    relationshipSelect.setAttribute('data-selected', selectedValue);
    relationshipSelect.setAttribute('data-value', selectedValue); // Atualizar o data-value para exibir o texto correto
  }
}

// Função para aplicar as classes de estilo às opções do select
function applyRelationshipStyles() {
  // Procurar todos os selects de relacionamento
  const relationshipSelects = document.querySelectorAll('.relationship-select select');

  relationshipSelects.forEach(select => {
    // Aplicar a classe inicialmente com base na opção selecionada
    const selectedValue = select.value;
    const container = select.closest('.relationship-select');

    if (container) {
      // Garantir que tanto data-selected quanto data-value estejam configurados
      container.setAttribute('data-selected', selectedValue);
      container.setAttribute('data-value', selectedValue);

      // Remover estilos inline que possam estar causando conflitos
      container.removeAttribute('style');
      select.removeAttribute('style');

      // Garantir que o texto da etiqueta está sempre atualizado
      // Não precisamos mais adicionar o texto manualmente porque estamos usando ::after no CSS
    }

    // Adicionar evento change se ainda não tiver
    if (!select.dataset.styleInitialized) {
      select.dataset.styleInitialized = true;

      // Adicionar um evento onchange para atualizar o data-value quando a seleção mudar
      select.addEventListener('change', function() {
        const newValue = this.value;
        const container = this.closest('.relationship-select');
        if (container) {
          // Atualizar tanto data-selected quanto data-value para manter a consistência visual
          container.setAttribute('data-selected', newValue);
          container.setAttribute('data-value', newValue);
        }
      });
    }
  });

  // Adicionar também um evento que reaplicará os estilos ao voltar de outra página
  if (!window.relationshipStylesEventSet) {
    window.addEventListener('pageshow', function(event) {
      // Se a página foi carregada do cache (ao navegar com o botão voltar)
      if (event.persisted) {
        setTimeout(applyRelationshipStyles, 100); // Aplicar estilos com um pequeno delay
      }
    });
    window.relationshipStylesEventSet = true;
  }
}

// Exportar funções para o escopo global
window.addAuthor = addAuthor;
window.removeLastAuthor = removeLastAuthor;
window.removeSpecificAuthor = removeSpecificAuthor;
window.updateRelationshipLabel = updateRelationshipLabel;
window.toggleWhatsAppTag = toggleWhatsAppTag;
window.toggleRelationshipTag = toggleRelationshipTag;

// Definir nova função de inicialização do módulo
window.initModule = function() {
  // Evitar múltiplas inicializações
  if (window._personalInitialized) {
    console.log('Módulo de dados pessoais já inicializado.');
    return;
  }

  // Marcar como inicializado
  window._personalInitialized = true;

  // Setup inicial
  setupEvents();

  // Log de diagnóstico após inicialização
  console.log('Módulo de dados pessoais inicializado, funções disponíveis:', {
    navigateToNextStep: typeof window.navigateToNextStep === 'function',
    navigateTo: typeof window.navigateTo === 'function'
  });

  // Resetar flag quando a página mudar
  document.addEventListener('stepChanged', function() {
    window._personalInitialized = false;
  }, { once: true });
};

// Função para configurar eventos do módulo
function setupEvents() {
  // Inicializar estilos para os selects de relacionamento
  applyRelationshipStyles();

  // Destacar campos preenchidos
  if (typeof destacarCamposPreenchidos === 'function') {
    destacarCamposPreenchidos();
  }

  // Carregamento dos dados do assistido
  if (typeof loadAssistidoData === 'function') {
    loadAssistidoData();
  }

  // Prevenção contra duplicação de botões
  const addAuthorButton = document.querySelector('button[onclick="addAuthor()"]');
  if (addAuthorButton) {
    // Remover evento existente
    const newBtn = addAuthorButton.cloneNode(true);
    addAuthorButton.parentNode.replaceChild(newBtn, addAuthorButton);

    // Adicionar novo evento
    newBtn.addEventListener('click', function() {
      addAuthor();
    });
  }

  // Botão Voltar
  const backButton = document.getElementById('btn-back');
  if (backButton) {
    // Preservar classes originais
    const originalClasses = backButton.className;

    // Remover eventos existentes
    const newBtn = backButton.cloneNode(true);

    // Manter as classes originais
    newBtn.className = originalClasses;

    // Aplicar estilos Tailwind centralizados
    if (window.tw && typeof window.tw.applyTo === 'function') {
      window.tw.applyTo(newBtn, 'button.secondary');
    }

    backButton.parentNode.replaceChild(newBtn, backButton);

    newBtn.addEventListener('click', function() {
      // Navegação para a tela anterior
      window.history.back();
    });
  }

  // Botão Próximo
  const nextButton = document.getElementById('btn-next');
  console.log('Botão próximo encontrado:', nextButton !== null);

  if (nextButton) {
    // Preservar classes originais
    const originalClasses = nextButton.className;

    // Remover eventos existentes e criar um novo botão
    const newBtn = nextButton.cloneNode(true);
    newBtn.className = originalClasses;

    // Aplicar estilos Tailwind centralizados
    if (window.tw && typeof window.tw.applyTo === 'function') {
      window.tw.applyTo(newBtn, 'button.primary');
    }

    nextButton.parentNode.replaceChild(newBtn, nextButton);

    // Adicionar evento de clique diretamente
    newBtn.onclick = function() {
      console.log('Botão próximo clicado!');

      // Salvar dados do formulário (opcional)
      saveAssistidoData();

      // Verificar e usar a melhor função de navegação disponível
      if (typeof window.navigateToNextStep === 'function') {
        console.log('Usando navigateToNextStep()');
        window.navigateToNextStep();
      } else if (typeof window.navigateTo === 'function') {
        console.log('Usando navigateTo("social")');
        window.navigateTo('social');
      } else {
        console.error('Nenhuma função de navegação disponível!');
        // Tentar usar a navegação direta como último recurso
        window.location.hash = 'social';
      }
    };

    // Adicionar também como addEventListener para garantir
    newBtn.addEventListener('click', function(event) {
      console.log('Evento de clique captado via addEventListener');
    });

    console.log('Evento de clique configurado para o botão próximo');
  } else {
    console.error('Botão próximo não encontrado!');
  }
}

// Função para salvar os dados do assistido no localStorage
function saveAssistidoData() {
  // Dados básicos do assistido (primeira linha do formulário)
  const nome = document.getElementById('nome')?.value || '';
  const cpf = document.getElementById('cpf')?.value || '';
  const nascimento = document.getElementById('nascimento')?.value || '';
  const idade = document.getElementById('idade')?.value || '';

  // Salvar no localStorage
  localStorage.setItem('nome', nome);
  localStorage.setItem('cpf', cpf);
  localStorage.setItem('nascimento', nascimento);
  localStorage.setItem('idade', idade);

  // Registrar que os dados foram salvos
  console.log('Dados do assistido salvos no localStorage');
}
