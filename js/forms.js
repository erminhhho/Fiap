/**
 * Funções para manipulação de formulários
 */

// Função para limpar o formulário atual (atualizada)
function clearForm(showConfirmation = true) {
  if (!showConfirmation || confirm('Tem certeza que deseja limpar todos os campos do formulário?')) {
    document.querySelectorAll('input:not([type="button"]):not([type="submit"]), select, textarea').forEach(field => {
      field.value = '';
      field.classList.remove('field-filled', 'cpf-valid', 'cpf-invalid', 'cep-valid', 'cep-invalid');
    });

    // Remover mensagens de validação
    document.querySelectorAll('.validation-message').forEach(msg => msg.remove());

    // Limpar listas dinâmicas, se existirem
    const membrosFamilia = document.getElementById('membros-familia-list');
    if (membrosFamilia) {
      membrosFamilia.innerHTML = '';
      // Adicionar um membro em branco para começar
      addFamilyMember();
    }

    const medicamentosList = document.getElementById('medicamentos-list');
    if (medicamentosList && medicamentosList.children.length > 1) {
      // Manter apenas o primeiro item
      const firstMed = medicamentosList.firstElementChild;
      medicamentosList.innerHTML = '';
      if (firstMed) {
        medicamentosList.appendChild(firstMed.cloneNode(true));
        // Limpar campos do primeiro item
        firstMed.querySelectorAll('input').forEach(input => {
          input.value = '';
        });
      }
    }

    if (showConfirmation) {
      showSuccess('Formulário foi limpo com sucesso!', null, { duration: 3000 });
    }
    return true;
  }
  return false;
}

// Função para criar um novo formulário
function newForm() {
  if (confirm('Deseja iniciar um novo formulário? Os dados não salvos serão perdidos.')) {
    clearForm(false);
    showSuccess('Novo formulário iniciado!', null, { duration: 3000 });
  }
}

// Função para salvar o formulário com feedback visual
function saveForm() {
  // Feedback apenas para simular funcionalidade
  showSuccess('Funcionalidade de salvamento será implementada em breve!', null, {
    duration: 3000,
    position: 'top-right'
  });
}

// Função para impressão do formulário
function printForm() {
  window.print();
}

// Função para adicionar um novo membro à família
function addFamilyMember() {
  const membrosList = document.getElementById('membros-familia-list');
  if (!membrosList) return;

  // Clone do template ou crie um novo se não existir
  let template = document.getElementById('membro-familia-template');

  if (!template) {
    // Criar novo modelo se não existir um explícito
    template = membrosList.querySelector('.membro-familia');
    if (!template) return; // Se não houver nada para clonar, sair
  }

  // Clonar o template
  const novoMembro = template.cloneNode(true);
  novoMembro.classList.remove('hidden');
  novoMembro.removeAttribute('id');

  // Limpar os campos do novo membro
  novoMembro.querySelectorAll('input, select').forEach(campo => {
    campo.value = '';
    campo.classList.remove('field-filled', 'cpf-valid', 'cpf-invalid');
  });

  // Adicionar à lista
  membrosList.appendChild(novoMembro);

  // Atualizar os botões de remoção
  updateRemoveMemberButton();

  return novoMembro;
}

// Adicionar novo participante (usado na tela de autores)
function addAuthor() {
  const authorsContainer = document.getElementById('authors-container');
  if (!authorsContainer) return;

  // Calcular o próximo ID de autor
  const existentes = authorsContainer.querySelectorAll('.author-row');
  const proximoId = existentes.length + 1;

  // Clone do modelo do primeiro autor
  const primeiroAutor = authorsContainer.querySelector('.author-row');
  if (!primeiroAutor) return;

  const novoAutor = primeiroAutor.cloneNode(true);

  // Atualizar IDs e names para o novo autor
  novoAutor.querySelectorAll('input, select').forEach(campo => {
    if (campo.id) {
      // Manter nome do campo e adicionar _ID
      const baseName = campo.id.split('_')[0];
      campo.id = baseName + '_' + proximoId;

      // Se for um select de relacionamento, atualize também o handler
      if (campo.tagName === 'SELECT' && campo.id.includes('relationship')) {
        campo.setAttribute('onchange', `updateRelationshipLabel(this, ${proximoId})`);
      }
    }
    campo.value = '';
  });

  // Atualizar labels
  novoAutor.querySelectorAll('label').forEach(label => {
    if (label.getAttribute('for')) {
      const baseFor = label.getAttribute('for').split('_')[0];
      label.setAttribute('for', baseFor + '_' + proximoId);
    }
  });

  // Atualizar seletores de relacionamento
  const relacionamentoSelecao = novoAutor.querySelector('.relationship-select');
  if (relacionamentoSelecao) {
    relacionamentoSelecao.dataset.selected = 'Dependente';
    relacionamentoSelecao.dataset.value = 'Dependente';
    relacionamentoSelecao.setAttribute('onclick', `toggleRelationshipTag(this)`);
  }

  // Limpar valores e adicionar ao container
  authorsContainer.appendChild(novoAutor);

  // Retornar ao início da scroll position suavemente após adicionar
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Função para remover o último membro da família
function removeLastFamilyMember() {
  const membrosList = document.getElementById('membros-familia-list');
  if (!membrosList || membrosList.children.length <= 1) return;

  membrosList.lastElementChild.remove();
  updateRemoveMemberButton();
}

// Função para atualizar a visibilidade do botão de remover membros
function updateRemoveMemberButton() {
  const membrosList = document.getElementById('membros-familia-list');
  const btnRemove = document.getElementById('btn-remove-membro');

  if (!membrosList || !btnRemove) return;

  // Mostrar ou esconder o botão baseado na quantidade de membros
  if (membrosList.children.length > 1) {
    btnRemove.classList.remove('hidden');
  } else {
    btnRemove.classList.add('hidden');
  }
}

// Função para converter campos para o novo sistema de labels
function setupRightLabels() {
  document.querySelectorAll('.form-group').forEach(group => {
    // Adicionar classe para o novo estilo
    group.classList.add('right-label');

    // Pegar o input/select/textarea dentro do grupo
    const field = group.querySelector('input, select, textarea');
    if (!field) return;

    // Pegar o label existente ou o placeholder
    let labelText = '';
    const existingLabel = group.querySelector('label');

    if (existingLabel) {
      labelText = existingLabel.textContent;
      existingLabel.remove();
    } else if (field.placeholder) {
      labelText = field.placeholder;
    }

    if (labelText) {
      // Criar novo label posicionado à direita
      const newLabel = document.createElement('span');
      newLabel.className = 'label';
      newLabel.textContent = labelText;
      group.appendChild(newLabel);

      // Remover placeholder antigo
      field.placeholder = '';
    }

    // Adicionar área para mensagens de validação
    const validationMsg = document.createElement('span');
    validationMsg.className = 'validation-message';
    group.appendChild(validationMsg);

    // Configurar validação específica baseada no tipo de campo
    setupFieldValidation(field, validationMsg);
  });
}

// Função para configurar validação específica por campo
function setupFieldValidation(field, msgElement) {
  field.addEventListener('blur', function() {
    // Validação específica por tipo de campo
    const name = field.name || '';
    const id = field.id || '';

    // CPF
    if (name.includes('cpf') || id.includes('cpf')) {
      validateCPF(field, msgElement);
    }
    // CEP
    else if (name.includes('cep') || id.includes('cep')) {
      validateCEP(field, msgElement);
    }
    // Email
    else if (name.includes('email') || id.includes('email')) {
      validateEmail(field, msgElement);
    }
    // Telefone
    else if (name.includes('telefone') || id.includes('telefone') || name.includes('phone') || id.includes('phone')) {
      validatePhone(field, msgElement);
    }
    // Campo obrigatório
    else if (field.required && field.value.trim() === '') {
      showValidationMessage(msgElement, 'Campo obrigatório', true);
    }
    // Campo preenchido
    else if (field.value.trim() !== '') {
      showValidationMessage(msgElement, 'Campo preenchido');
    }
  });
}

// Função para validar CPF
function validateCPF(field, msgElement) {
  // Verificar se o campo está vazio
  if (field.value.trim() === '') {
    // Campo vazio não é considerado erro
    field.classList.remove('cpf-valid', 'cpf-invalid', 'field-invalid');

    // Se houver mensagem de validação, limpar
    if (msgElement) {
      msgElement.textContent = '';
      msgElement.classList.remove('validation-error', 'validation-success');
    }

    // Garantir que a label volte à cor padrão
    const label = field.parentElement.querySelector('label');
    if (label) {
      label.classList.remove('text-red-500', 'text-white');
      label.classList.add('text-gray-700');
    }

    return true;
  }

  let cpf = field.value.replace(/\D/g, '');

  if (cpf.length !== 11) {
    field.classList.remove('cpf-valid');
    field.classList.add('cpf-invalid');
    if (msgElement) showValidationMessage(msgElement, 'CPF incompleto', true);
    return false;
  }

  // Verificar se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpf)) {
    field.classList.remove('cpf-valid');
    field.classList.add('cpf-invalid');
    if (msgElement) showValidationMessage(msgElement, 'CPF inválido', true);
    return false;
  }

  // Algoritmo de validação do CPF
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  let dv1 = resto >= 10 ? 0 : resto;

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = 11 - (soma % 11);
  let dv2 = resto >= 10 ? 0 : resto;

  if (dv1 == cpf.charAt(9) && dv2 == cpf.charAt(10)) {
    field.classList.remove('cpf-invalid');
    field.classList.add('cpf-valid');
    if (msgElement) showValidationMessage(msgElement, 'CPF válido');
    return true;
  } else {
    field.classList.remove('cpf-valid');
    field.classList.add('cpf-invalid');
    if (msgElement) showValidationMessage(msgElement, 'CPF inválido', true);
    return false;
  }
}

// Função para validar CEP
function validateCEP(field, msgElement) {
  const cep = field.value.replace(/\D/g, '');

  if (cep.length !== 8) {
    field.classList.remove('cep-valid');
    field.classList.add('cep-invalid');
    showValidationMessage(msgElement, 'CEP inválido', true);
    return;
  }

  field.classList.remove('cep-invalid');
  field.classList.add('cep-valid');
  showValidationMessage(msgElement, 'CEP válido');
}

// Função para validar email
function validateEmail(field, msgElement) {
  const email = field.value.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    field.classList.remove('field-valid');
    field.classList.add('field-invalid');
    showValidationMessage(msgElement, 'E-mail inválido', true);
    return;
  }

  field.classList.remove('field-invalid');
  field.classList.add('field-valid');
  showValidationMessage(msgElement, 'E-mail válido');
}

// Função para validar telefone
function validatePhone(field, msgElement) {
  const phone = field.value.replace(/\D/g, '');

  if (phone.length < 10 || phone.length > 11) {
    field.classList.remove('field-valid');
    field.classList.add('field-invalid');
    showValidationMessage(msgElement, 'Telefone inválido', true);
    return;
  }

  field.classList.remove('field-invalid');
  field.classList.add('field-valid');
  showValidationMessage(msgElement, 'Telefone válido');
}

// Função para exibir mensagem de validação
function showValidationMessage(field, message, isValid) {
    const messageId = `${field.id}-validation-message`;
    const messageElement = document.getElementById(messageId);

    if (messageElement) {
        // Atualiza o estilo do campo
        field.classList.remove('field-valid', 'field-invalid');
        field.classList.add(isValid ? 'field-valid' : 'field-invalid');

        // Atualiza a mensagem de validação (apenas texto, sem background, sem borda)
        messageElement.textContent = message;
        messageElement.classList.remove('validation-error', 'validation-success');
        messageElement.classList.add('validation-active');
        messageElement.classList.add(isValid ? 'validation-success' : 'validation-error');

        // Adicionar ícone dentro do campo alinhado à direita
        let iconId = `${field.id}-validation-icon`;
        let iconElement = document.getElementById(iconId);

        // Se não existir, criar o ícone
        if (!iconElement) {
            iconElement = document.createElement('i');
            iconElement.id = iconId;
            iconElement.className = 'validation-icon';
            field.parentElement.appendChild(iconElement);
        }

        // Limpar classes anteriores do ícone
        iconElement.className = 'validation-icon';

        // Adicionar o ícone apropriado
        if (isValid) {
            iconElement.className += ' success fas fa-check';
        } else {
            iconElement.className += ' error fas fa-exclamation-circle';
        }
    }
}

/**
 * Limpa a validação de um campo
 * @param {HTMLElement} field - O campo a ser limpo
 */
function clearValidation(field) {
    const messageId = `${field.id}-validation-message`;
    const messageElement = document.getElementById(messageId);
    const iconId = `${field.id}-validation-icon`;
    const iconElement = document.getElementById(iconId);

    if (messageElement) {
        field.classList.remove('field-valid', 'field-invalid');
        messageElement.classList.remove('validation-active', 'validation-error', 'validation-success');
        messageElement.textContent = '';
    }

    // Remover o ícone se existir
    if (iconElement) {
        iconElement.remove();
    }
}

// Função para validação dinâmica de campos enquanto o usuário digita
function setupLiveValidation() {
  document.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('input', function() {
      // Marcar o campo como modificado
      field.dataset.modified = 'true';

      // Se o campo estiver vazio, remover todas as classes de validação
      if (field.value.trim() === '') {
        field.classList.remove('field-filled', 'field-valid', 'field-invalid');
        return;
      }

      // Marcar como preenchido
      field.classList.add('field-filled');

      // Validação específica conforme o tipo de campo
      const name = field.name || '';
      const id = field.id || '';

      // Tipo de validação específica enquanto digita
      if (name.includes('cpf') || id.includes('cpf')) {
        const cpfValue = field.value.replace(/[^\d]/g, '');
        if (cpfValue.length === 11) {
          const isValid = cpfValue !== '00000000000' &&
                          cpfValue !== '11111111111' &&
                          cpfValue !== '22222222222';
          field.classList.toggle('preliminary-valid', isValid);
        }
      }
    });
  });
}

// Função para verificar o preenchimento de todos os campos obrigatórios
function checkRequiredFields(formId) {
  const form = document.getElementById(formId);
  if (!form) return true;

  const requiredFields = form.querySelectorAll('[required]');
  let allValid = true;

  requiredFields.forEach(field => {
    if (field.value.trim() === '') {
      allValid = false;

      // Destacar o campo não preenchido
      field.classList.add('field-invalid');

      // Exibir mensagem de validação
      const msgElement = field.closest('.form-group')?.querySelector('.validation-message');
      if (msgElement) {
        showValidationMessage(msgElement, 'Campo obrigatório', true);
      }
    }
  });

  if (!allValid) {
    showError('Por favor, preencha todos os campos obrigatórios', null, {
      duration: 5000,
      position: 'top-center'
    });
  }

  return allValid;
}

/**
 * Configura o sistema de validação para campos do formulário
 */
function setupFieldValidation() {
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
        const fields = form.querySelectorAll('input, select, textarea');

        fields.forEach(field => {
            // Determina o tipo de validação com base nos atributos do campo
            const validationType = field.getAttribute('data-validate');
            const isRequired = field.hasAttribute('required');

            if (isRequired) {
                const label = document.querySelector(`label[for="${field.id}"]`);
                if (label) label.classList.add('required-field');
            }

            // Adiciona o elemento de mensagem de validação após o campo
            const messageId = `${field.id}-validation-message`;

            if (!document.getElementById(messageId)) {
                const validationMessage = document.createElement('div');
                validationMessage.id = messageId;
                validationMessage.className = 'validation-message';
                field.parentNode.insertBefore(validationMessage, field.nextSibling);
            }

            // Configura eventos de validação
            field.addEventListener('blur', function() {
                validateField(field);
            });

            field.addEventListener('input', function() {
                // Aplicar validação em tempo real para alguns tipos de campos
                if (['cpf', 'cep', 'email', 'phone'].includes(validationType)) {
                    validateField(field);
                }
            });
        });

        // Validar formulário no envio
        form.addEventListener('submit', function(e) {
            const fields = form.querySelectorAll('input, select, textarea');
            let isValid = true;

            fields.forEach(field => {
                if (!validateField(field)) {
                    isValid = false;
                }
            });

            if (!isValid) {
                e.preventDefault();
                // Rolar até o primeiro campo inválido
                const firstInvalid = form.querySelector('.field-invalid');
                if (firstInvalid) {
                    firstInvalid.focus();
                    firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });
    });
}

/**
 * Valida um campo específico com base em seu tipo
 * @param {HTMLElement} field - O campo a ser validado
 * @returns {boolean} - Se o campo é válido ou não
 */
function validateField(field) {
    const value = field.value.trim();
    const validationType = field.getAttribute('data-validate') || '';
    const isRequired = field.hasAttribute('required');
    const messageId = `${field.id}-validation-message`;
    const messageElement = document.getElementById(messageId);

    if (!messageElement) return true;

    // Se o campo for obrigatório e estiver vazio
    if (isRequired && value === '') {
        showValidationMessage(field, 'Campo obrigatório', false);
        return false;
    }

    // Se o campo não for obrigatório e estiver vazio, é válido
    if (!isRequired && value === '') {
        clearValidation(field);
        return true;
    }

    let isValid = true;
    let message = '';

    // Validação baseada no tipo
    switch (validationType) {
        case 'cpf':
            isValid = validateCPF(value);
            message = isValid ? 'CPF válido' : 'CPF inválido';
            break;

        case 'cep':
            isValid = value.replace(/\D/g, '').length === 8;
            message = isValid ? 'CEP válido' : 'CEP inválido';
            break;

        case 'email':
            isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            message = isValid ? 'Email válido' : 'Email inválido';
            break;

        case 'phone':
            isValid = value.replace(/\D/g, '').length >= 10;
            message = isValid ? 'Telefone válido' : 'Telefone inválido';
            break;

        case 'name':
            isValid = validateName(value);
            message = isValid ? 'Nome válido' : 'Nome deve conter apenas letras e espaços';
            break;

        case 'numeric':
            isValid = validateNumeric(value);
            message = isValid ? 'Valor válido' : 'Digite apenas números';
            break;
    }

    showValidationMessage(field, message, isValid);
    return isValid;
}

/**
 * Mostra uma mensagem de validação para um campo e adiciona ícone dentro do campo
 * @param {HTMLElement} field - O campo relacionado
 * @param {string} message - A mensagem a ser exibida
 * @param {boolean} isValid - Se o campo é válido ou não
 */
function showValidationMessage(field, message, isValid) {
    const messageId = `${field.id}-validation-message`;
    const messageElement = document.getElementById(messageId);

    if (messageElement) {
        // Atualiza o estilo do campo
        field.classList.remove('field-valid', 'field-invalid');
        field.classList.add(isValid ? 'field-valid' : 'field-invalid');

        // Atualiza a mensagem de validação (apenas texto, sem background, sem borda)
        messageElement.textContent = message;
        messageElement.classList.remove('validation-error', 'validation-success');
        messageElement.classList.add('validation-active');
        messageElement.classList.add(isValid ? 'validation-success' : 'validation-error');

        // Adicionar ícone dentro do campo alinhado à direita
        let iconId = `${field.id}-validation-icon`;
        let iconElement = document.getElementById(iconId);

        // Se não existir, criar o ícone
        if (!iconElement) {
            iconElement = document.createElement('i');
            iconElement.id = iconId;
            iconElement.className = 'validation-icon';
            field.parentElement.appendChild(iconElement);
        }

        // Limpar classes anteriores do ícone
        iconElement.className = 'validation-icon';

        // Adicionar o ícone apropriado
        if (isValid) {
            iconElement.className += ' success fas fa-check';
        } else {
            iconElement.className += ' error fas fa-exclamation-circle';
        }
    }
}

/**
 * Limpa a validação de um campo
 * @param {HTMLElement} field - O campo a ser limpo
 */
function clearValidation(field) {
    const messageId = `${field.id}-validation-message`;
    const messageElement = document.getElementById(messageId);
    const iconId = `${field.id}-validation-icon`;
    const iconElement = document.getElementById(iconId);

    if (messageElement) {
        field.classList.remove('field-valid', 'field-invalid');
        messageElement.classList.remove('validation-active', 'validation-error', 'validation-success');
        messageElement.textContent = '';
    }

    // Remover o ícone se existir
    if (iconElement) {
        iconElement.remove();
    }
}

/**
 * Valida uma data no formato DD/MM/AAAA
 * @param {string} value - O valor a ser validado
 * @returns {boolean} - Se é uma data válida
 */
function validateDate(value) {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = value.match(regex);

    if (!match) return false;

    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const year = parseInt(match[3], 10);

    const date = new Date(year, month, day);

    return date.getDate() === day &&
           date.getMonth() === month &&
           date.getFullYear() === year;
}

/**
 * Valida um nome (apenas letras e espaços)
 * @param {string} value - O valor a ser validado
 * @returns {boolean} - Se é um nome válido
 */
function validateName(value) {
    return /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(value);
}

/**
 * Valida um valor numérico
 * @param {string} value - O valor a ser validado
 * @returns {boolean} - Se é um valor numérico
 */
function validateNumeric(value) {
    return /^\d+$/.test(value);
}

// Inicializar sistema de labels no carregamento da página
document.addEventListener('DOMContentLoaded', function() {
  setupRightLabels();
  setupLiveValidation();

  // Configurar o destaque de campos preenchidos
  if (typeof setupFieldHighlighting === 'function') {
    setupFieldHighlighting();
  }
});

// Funções de exportação
window.clearForm = clearForm;
window.newForm = newForm;
window.saveForm = saveForm;
window.printForm = printForm;
window.addFamilyMember = addFamilyMember;
window.addAuthor = addAuthor;
window.removeLastFamilyMember = removeLastFamilyMember;
window.updateRemoveMemberButton = updateRemoveMemberButton;
