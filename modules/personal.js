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
  window.authorCount++;

  // Criar um novo elemento div para o autor
  const newAuthor = document.createElement('div');
  newAuthor.className = 'author-row mb-4';
  newAuthor.id = `author-${window.authorCount}`;

  // Criar HTML com opções de relacionamento/etiqueta
  let relationshipOptions = '';
  window.authorLabels.forEach(label => {
    relationshipOptions += `<option value="${label}" class="relationship-option ${label.toLowerCase().replace('representante legal', 'representante').replace('beneficiário', 'beneficiario').replace('responsável', 'responsavel')}">${label}</option>`;
  });

  // Estrutura da primeira linha (campos essenciais) - APENAS a primeira linha agora
  const firstRowHTML = `
    <div class="flex items-center">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 relative flex-grow">
        <!-- Nome com seletor de relacionamento -->
        <div class="relative">
          <div class="relationship-select" data-selected="${window.authorLabels[0]}" onclick="toggleRelationshipTag(this)">
            <select id="relationship_${window.authorCount}" name="relationship_${window.authorCount}" onchange="updateRelationshipLabel(this, ${window.authorCount})">
              ${relationshipOptions}
            </select>
          </div>
          <input type="text" id="nome_${window.authorCount}" name="nome_${window.authorCount}" required onblur="formatarNomeProprio(this)"
            class="peer w-full rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 px-4 py-3 text-gray-800 bg-gray-50 placeholder-gray-400 transition-colors duration-200"
            placeholder="Digite o nome completo" />
          <label for="nome_${window.authorCount}"
            class="absolute left-4 -top-3 px-1 text-sm text-transparent bg-transparent rounded-t-lg rounded-b-none transition-all duration-200 pointer-events-none peer-focus:text-blue-600 peer-focus:-top-3 peer-focus:bg-gray-50 peer-focus:text-blue-600 peer-focus:rounded-t-lg peer-focus:rounded-b-none peer-focus:text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:bg-transparent peer-placeholder-shown:rounded-none peer-placeholder-shown:text-transparent input-label">
            ${window.authorLabels[0]}
          </label>
        </div>
        <!-- Nascimento, Idade e CPF -->
        <div class="grid grid-cols-12 gap-6">
          <!-- CPF -->
          <div class="relative col-span-4">
            <input type="text" id="cpf_${window.authorCount}" name="cpf_${window.authorCount}" required oninput="maskCPF(this)" maxlength="14"
              class="peer w-full rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 px-4 py-3 text-gray-800 bg-gray-50 placeholder-gray-400 transition-colors duration-200"
              placeholder="000.000.000-00" />
            <label for="cpf_${window.authorCount}"
              class="absolute left-4 -top-3 px-1 text-sm text-transparent bg-transparent rounded-t-lg rounded-b-none transition-all duration-200 pointer-events-none peer-focus:text-blue-600 peer-focus:-top-3 peer-focus:bg-gray-50 peer-focus:text-blue-600 peer-focus:rounded-t-lg peer-focus:rounded-b-none peer-focus:text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:bg-transparent peer-placeholder-shown:rounded-none peer-placeholder-shown:text-transparent input-label">
              CPF
            </label>
          </div>
          <!-- Nascimento -->
          <div class="relative col-span-4">
            <input type="text" id="nascimento_${window.authorCount}" name="nascimento_${window.authorCount}" required oninput="maskDate(this)"
              class="peer w-full rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 px-4 py-3 text-gray-800 bg-gray-50 placeholder-gray-400 transition-colors duration-200"
              placeholder="dd/mm/aaaa" data-target-age="idade_${window.authorCount}" />
            <label for="nascimento_${window.authorCount}"
              class="absolute left-4 -top-3 px-1 text-sm text-transparent bg-transparent rounded-t-lg rounded-b-none transition-all duration-200 pointer-events-none peer-focus:text-blue-600 peer-focus:-top-3 peer-focus:bg-gray-50 peer-focus:text-blue-600 peer-focus:rounded-t-lg peer-focus:rounded-b-none peer-focus:text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:bg-transparent peer-placeholder-shown:rounded-none peer-placeholder-shown:text-transparent input-label">
              Nascimento
            </label>
          </div>
          <!-- Idade -->
          <div class="relative col-span-4">
            <input type="text" id="idade_${window.authorCount}" name="idade_${window.authorCount}" readonly
              class="peer w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 bg-gray-50 placeholder-gray-400 transition-colors duration-200 cursor-not-allowed"
              placeholder="Idade" />
            <label for="idade_${window.authorCount}"
              class="absolute left-4 -top-3 px-1 text-sm text-transparent bg-transparent rounded-t-lg rounded-b-none transition-all duration-200 pointer-events-none peer-focus:text-blue-600 peer-focus:-top-3 peer-focus:bg-gray-50 peer-focus:text-blue-600 peer-focus:rounded-t-lg peer-focus:rounded-b-none peer-focus:text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:bg-transparent peer-placeholder-shown:rounded-none peer-placeholder-shown:text-transparent input-label">
              Idade
            </label>
          </div>
        </div>
      </div>
      <!-- Botão circular de remover -->
      <button type="button" class="bg-red-500 hover:bg-red-600 text-white rounded-full p-1 ml-2 flex items-center justify-center w-8 h-8 self-center" title="Remover autor" onclick="removeSpecificAuthor(${window.authorCount})">
        <i class="fas fa-minus"></i>
      </button>
    </div>
  `;

  // Definir o HTML do novo autor (apenas a primeira linha)
  newAuthor.innerHTML = firstRowHTML;

  // Adicionar apenas um separador visual mínimo antes do novo autor
  const separator = document.createElement('div');
  separator.className = 'author-separator border-t border-gray-200 my-4';

  // Adicionar o separador e o novo autor ao container
  const authorsContainer = document.getElementById('authors-container');
  authorsContainer.appendChild(separator);
  authorsContainer.appendChild(newAuthor);

  // Aplicar estilos ao novo select de relacionamento
  applyRelationshipStyles();
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
  setupEvents();
  applyRelationshipStyles(); // Adicionar chamada para aplicar estilos
};

// Função para configurar eventos do módulo
function setupEvents() {
  // Destacar campos preenchidos
  destacarCamposPreenchidos();

  // Botão Próximo
  const nextButton = document.getElementById('btn-next');
  if (nextButton) {
    nextButton.addEventListener('click', function() {
      navigateTo('social');
    });
  }

  // Outros eventos específicos do módulo
  const nascimentoInput = document.getElementById('nascimento');
  if (nascimentoInput) {
    nascimentoInput.addEventListener('blur', function() {
      if (this.value) {
        calcularIdade(this.value, 'idade');
      }
    });
  }

  const cepInput = document.getElementById('cep');
  if (cepInput) {
    cepInput.addEventListener('input', function() {
      maskCEP(this);
    });
  }
}
