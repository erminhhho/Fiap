/**
 * Módulo de Dados Pessoais
 */

// Limpar função de inicialização anterior
window.initModule = null;

// Contador global de autores
let authorCount = 1;

// Array com etiquetas para os autores adicionais
const authorLabels = ['Requerente', 'Instituidor', 'Dependente', 'Responsável', 'Procurador', 'Representante Legal', 'Titular', 'Beneficiário'];

// Função para adicionar um novo autor
function addAuthor() {
  authorCount++;

  // Criar um novo elemento div para o autor
  const newAuthor = document.createElement('div');
  newAuthor.className = 'author-row mb-4';
  newAuthor.id = `author-${authorCount}`;

  // Criar HTML com opções de relacionamento/etiqueta
  let relationshipOptions = '';
  authorLabels.forEach(label => {
    relationshipOptions += `<option value="${label}" class="relationship-option ${label.toLowerCase().replace('representante legal', 'representante').replace('beneficiário', 'beneficiario').replace('responsável', 'responsavel')}">${label}</option>`;
  });

  // Estrutura da primeira linha (campos essenciais) - APENAS a primeira linha agora
  const firstRowHTML = `
    <div class="flex items-center">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 relative flex-grow">
        <!-- Nome com seletor de relacionamento -->
        <div class="relative">
          <div class="relationship-select" data-selected="${authorLabels[0]}">
            <select id="relationship_${authorCount}" name="relationship_${authorCount}" onchange="updateRelationshipLabel(this, ${authorCount})">
              ${relationshipOptions}
            </select>
          </div>
          <input type="text" id="nome_${authorCount}" name="nome_${authorCount}" required onblur="formatarNomeProprio(this)"
            class="peer w-full rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 px-4 py-3 text-gray-800 bg-gray-50 placeholder-gray-400 transition-colors duration-200"
            placeholder="Digite o nome completo" />
          <label for="nome_${authorCount}"
            class="absolute left-4 -top-3 px-1 text-sm text-transparent bg-transparent rounded-t-lg rounded-b-none transition-all duration-200 pointer-events-none peer-focus:text-blue-600 peer-focus:-top-3 peer-focus:bg-gray-50 peer-focus:text-blue-600 peer-focus:rounded-t-lg peer-focus:rounded-b-none peer-focus:text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:bg-transparent peer-placeholder-shown:rounded-none peer-placeholder-shown:text-transparent input-label">
            ${authorLabels[0]}
          </label>
        </div>
        <!-- Nascimento, Idade e CPF -->
        <div class="grid grid-cols-12 gap-6">
          <!-- CPF -->
          <div class="relative col-span-4">
            <input type="text" id="cpf_${authorCount}" name="cpf_${authorCount}" required oninput="maskCPF(this)" maxlength="14"
              class="peer w-full rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 px-4 py-3 text-gray-800 bg-gray-50 placeholder-gray-400 transition-colors duration-200"
              placeholder="000.000.000-00" />
            <label for="cpf_${authorCount}"
              class="absolute left-4 -top-3 px-1 text-sm text-transparent bg-transparent rounded-t-lg rounded-b-none transition-all duration-200 pointer-events-none peer-focus:text-blue-600 peer-focus:-top-3 peer-focus:bg-gray-50 peer-focus:text-blue-600 peer-focus:rounded-t-lg peer-focus:rounded-b-none peer-focus:text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:bg-transparent peer-placeholder-shown:rounded-none peer-placeholder-shown:text-transparent input-label">
              CPF
            </label>
          </div>
          <!-- Nascimento -->
          <div class="relative col-span-4">
            <input type="text" id="nascimento_${authorCount}" name="nascimento_${authorCount}" required oninput="maskDate(this)"
              class="peer w-full rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 px-4 py-3 text-gray-800 bg-gray-50 placeholder-gray-400 transition-colors duration-200"
              placeholder="dd/mm/aaaa" data-target-age="idade_${authorCount}" />
            <label for="nascimento_${authorCount}"
              class="absolute left-4 -top-3 px-1 text-sm text-transparent bg-transparent rounded-t-lg rounded-b-none transition-all duration-200 pointer-events-none peer-focus:text-blue-600 peer-focus:-top-3 peer-focus:bg-gray-50 peer-focus:text-blue-600 peer-focus:rounded-t-lg peer-focus:rounded-b-none peer-focus:text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:bg-transparent peer-placeholder-shown:rounded-none peer-placeholder-shown:text-transparent input-label">
              Nascimento
            </label>
          </div>
          <!-- Idade -->
          <div class="relative col-span-4">
            <input type="text" id="idade_${authorCount}" name="idade_${authorCount}" readonly
              class="peer w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 bg-gray-50 placeholder-gray-400 transition-colors duration-200 cursor-not-allowed"
              placeholder="Idade" />
            <label for="idade_${authorCount}"
              class="absolute left-4 -top-3 px-1 text-sm text-transparent bg-transparent rounded-t-lg rounded-b-none transition-all duration-200 pointer-events-none peer-focus:text-blue-600 peer-focus:-top-3 peer-focus:bg-gray-50 peer-focus:text-blue-600 peer-focus:rounded-t-lg peer-focus:rounded-b-none peer-focus:text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:bg-transparent peer-placeholder-shown:rounded-none peer-placeholder-shown:text-transparent input-label">
              Idade
            </label>
          </div>
        </div>
      </div>
      <!-- Botão circular de remover -->
      <button type="button" class="bg-red-500 hover:bg-red-600 text-white rounded-full p-1 ml-2 flex items-center justify-center w-8 h-8 self-center" title="Remover autor" onclick="removeSpecificAuthor(${authorCount})">
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

// Função para remover um autor específico pelo seu ID
function removeSpecificAuthor(authorId) {
  if (authorCount <= 1) return; // Sempre manter pelo menos um autor

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
  if (authorId === authorCount) {
    authorCount--;
  }
}

// Função para remover o último autor (manter para compatibilidade)
function removeLastAuthor() {
  if (authorCount <= 1) return; // Sempre manter pelo menos um autor
  removeSpecificAuthor(authorCount);
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
      container.setAttribute('data-selected', selectedValue);
    }

    // Adicionar evento change se ainda não tiver
    if (!select.dataset.styleInitialized) {
      select.dataset.styleInitialized = true;

      // Substituir os options com versões estilizadas
      const options = select.querySelectorAll('option');
      options.forEach(option => {
        // Adicionar classe baseada no valor da opção
        const value = option.value;
        const className = value.toLowerCase()
          .replace('representante legal', 'representante')
          .replace('beneficiário', 'beneficiario')
          .replace('responsável', 'responsavel');

        option.className = `relationship-option ${className}`;
      });
    }
  });
}

// Exportar funções para o escopo global
window.addAuthor = addAuthor;
window.removeLastAuthor = removeLastAuthor;
window.removeSpecificAuthor = removeSpecificAuthor;
window.updateRelationshipLabel = updateRelationshipLabel;
window.toggleWhatsAppTag = toggleWhatsAppTag;

// Definir nova função de inicialização do módulo
window.initModule = function() {
  setupEvents();
  applyRelationshipStyles();
  setupValidationTags(); // Adicionamos esta linha
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

    cepInput.addEventListener('blur', function() {
      // Ao sair do campo CEP, mostrar tag de validação
      if (this.value.replace(/\D/g, '').length === 8) {
        const cepTag = this.parentElement.querySelector('.tag-cep-validating') ||
                      createTag({
                        text: 'Consultando CEP...',
                        color: 'blue',
                        size: 'sm',
                        position: 'float-right',
                        animated: true
                      });

        cepTag.className = 'tag tag-blue tag-sm tag-float-right tag-animated tag-cep-validating';
        updateTagText(cepTag, 'Consultando CEP...');
        this.parentElement.appendChild(cepTag);
      }
    });
  }

  // Ao preencher CPF, mostrar tag de validação
  const cpfInput = document.getElementById('cpf');
  if (cpfInput) {
    cpfInput.addEventListener('blur', function() {
      if (this.value.replace(/\D/g, '').length === 11) {
        const isValid = validateCPF(this);

        // Ao invés de usar a função antiga de validação, usamos nosso novo sistema de etiquetas
        const cpfTag = this.parentElement.querySelector('.tag-cpf-validation') ||
                      createTag({
                        text: isValid ? 'CPF válido' : 'CPF inválido',
                        icon: isValid ? 'fas fa-check-circle' : 'fas fa-times-circle',
                        color: isValid ? 'valid' : 'invalid',
                        size: 'sm',
                        position: 'float-right',
                        animated: true
                      });

        cpfTag.className = `tag tag-${isValid ? 'valid' : 'invalid'} tag-sm tag-float-right tag-animated tag-cpf-validation`;
        updateTagText(cpfTag, isValid ? 'CPF válido' : 'CPF inválido');

        if (!this.parentElement.querySelector('.tag-cpf-validation')) {
          this.parentElement.appendChild(cpfTag);
        }

        // Mostrar por 3 segundos e ocultar se for válido
        if (isValid) {
          setTimeout(() => {
            cpfTag.style.opacity = '0';
            setTimeout(() => {
              if (cpfTag.parentElement) {
                cpfTag.remove();
              }
            }, 300);
          }, 3000);
        }
      }
    });
  }
}

// Configurar etiquetas de validação para campos
function setupValidationTags() {
  // Configurar os campos onde queremos etiquetas de validação
  const fieldsToSetup = [
    { id: 'cpf', type: 'cpf' },
    { id: 'cep', type: 'cep' },
    { id: 'telefone', type: 'phone' }
  ];

  fieldsToSetup.forEach(fieldInfo => {
    const field = document.getElementById(fieldInfo.id);
    if (field) {
      // Se for campo de telefone, adicionar etiqueta de WhatsApp
      if (fieldInfo.type === 'phone') {
        // A etiqueta já foi adicionada no HTML, não precisamos adicionar via JS
      }
      // Para campos CPF e CEP, preparamos para adicionar etiquetas de validação quando necessário
    }
  });

  // Atualizar a função de validação de CPF original para usar nossas etiquetas
  // (Isso é feito diretamente no evento 'blur' configurado acima)
}
