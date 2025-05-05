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
  if (confirm('Deseja iniciar um novo formulário? Todos os dados não salvos serão perdidos.')) {
    // Limpar o formulário
    clearForm();

    // Redirecionar para a primeira etapa
    navigateTo('personal');

    alert('Novo formulário iniciado com sucesso!');
  }
}

// Função para salvar o formulário com feedback visual
function saveForm() {
  // Coletar todos os dados do formulário
  const formData = {};
  document.querySelectorAll('input:not([type="button"]):not([type="submit"]), select, textarea').forEach(field => {
    if (field.name) {
      formData[field.name] = field.value;
    }
  });

  // Salvar dados específicos de listas dinâmicas
  formData.familiares = [];
  document.querySelectorAll('#membros-familia-list .membro-familia').forEach(membro => {
    const familiar = {};
    membro.querySelectorAll('input, select').forEach(field => {
      if (field.name) {
        // Remover os colchetes do nome do campo para obter a chave
        const key = field.name.replace('[]', '');
        familiar[key] = field.value;
      }
    });
    if (Object.keys(familiar).length > 0) {
      formData.familiares.push(familiar);
    }
  });

  // Gerar um ID único baseado na data ou usar um existente
  const formId = localStorage.getItem('currentFormId') || 'form_' + Date.now();
  localStorage.setItem('currentFormId', formId);
  localStorage.setItem(formId, JSON.stringify(formData));

  // Salvar a data da última alteração
  const dataAtual = new Date();
  const dataFormatada = dataAtual.toLocaleString('pt-BR');
  localStorage.setItem(formId + '_lastSaved', dataFormatada);

  // Mostrar mensagem de sucesso usando o showSuccess
  showSuccess('Formulário salvo com sucesso!', null, {
    duration: 3000,
    position: 'top-right'
  });

  return formId;
}

// Função para configurar salvamento automático
function setupAutoSave(intervalMinutes = 2) {
  let timer;
  const intervalMs = intervalMinutes * 60 * 1000;
  const statusIndicator = document.getElementById('save-status-indicator');
  const statusText = document.getElementById('save-status-text');

  // Atualiza o indicador de status
  const updateSaveStatus = (status, isAuto = false) => {
    if (!statusIndicator || !statusText) return;

    const now = new Date();
    const timeFormatted = now.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});

    if (status === 'saving') {
      statusIndicator.classList.add('bg-blue-50');
      statusText.textContent = 'Salvando...';
    } else if (status === 'saved') {
      statusIndicator.classList.remove('bg-blue-50');
      statusText.textContent = `${isAuto ? 'Auto-save' : 'Salvo'} às ${timeFormatted}`;
    } else if (status === 'error') {
      statusIndicator.classList.add('bg-red-50');
      statusText.textContent = `Erro ao salvar às ${timeFormatted}`;
      setTimeout(() => {
        statusIndicator.classList.remove('bg-red-50');
      }, 5000);
    }
  };

  // Inicializar o status
  const lastSavedTime = localStorage.getItem('lastFormSaveTime');
  if (lastSavedTime) {
    const formattedTime = new Date(lastSavedTime).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
    statusText.textContent = `Último salvamento: ${formattedTime}`;
  } else {
    statusText.textContent = 'Nenhum salvamento ainda';
  }

  // Função que realiza o salvamento automático
  const autoSave = () => {
    // Verificar se há dados para salvar
    const camposPreenchidos = Array.from(
      document.querySelectorAll('input:not([type="button"]):not([type="submit"]), select, textarea')
    ).some(field => field.value.trim() !== '');

    if (camposPreenchidos) {
      try {
        updateSaveStatus('saving');
        const formId = saveForm(false); // Não exibir mensagem visual de sucesso
        localStorage.setItem('lastFormSaveTime', new Date().toString());
        updateSaveStatus('saved', true);
        console.log(`Auto-save realizado: ${new Date().toLocaleTimeString()}`);
      } catch (error) {
        console.error('Erro no auto-save:', error);
        updateSaveStatus('error');
      }
    }
  };

  // Iniciar o timer quando houver interação com o formulário
  const resetTimer = () => {
    clearTimeout(timer);
    timer = setTimeout(autoSave, intervalMs);
  };

  // Adicionar listeners para eventos de interação com o formulário
  const formElements = document.querySelectorAll('input, select, textarea');
  formElements.forEach(element => {
    element.addEventListener('change', resetTimer);
    element.addEventListener('input', resetTimer);
  });

  // Iniciar o timer quando a função for chamada
  resetTimer();

  return {
    stop: () => clearTimeout(timer),
    forceNow: autoSave,
    updateStatus: updateSaveStatus
  };
}

// Função para carregar um formulário salvo
function loadForm(formId) {
  const savedData = localStorage.getItem(formId);
  if (!savedData) {
    showError('Formulário não encontrado!', null, { duration: 3000 });
    return false;
  }

  try {
    const formData = JSON.parse(savedData);

    // Limpar formulário atual antes de carregar
    clearForm(false);

    // Preencher os campos simples
    Object.keys(formData).forEach(key => {
      if (key !== 'familiares' && typeof formData[key] === 'string') {
        const field = document.querySelector(`[name="${key}"]`);
        if (field) {
          field.value = formData[key];
          field.classList.add('field-filled');
        }
      }
    });

    // Preencher listas dinâmicas como membros da família
    if (formData.familiares && Array.isArray(formData.familiares)) {
      const membrosList = document.getElementById('membros-familia-list');
      if (membrosList) {
        // Limpar a lista atual
        membrosList.innerHTML = '';

        // Adicionar cada membro da família
        formData.familiares.forEach(familiar => {
          addFamilyMember();
          const lastMember = membrosList.lastElementChild;

          // Preencher os campos do membro
          Object.keys(familiar).forEach(key => {
            const field = lastMember.querySelector(`[name="${key}[]"]`);
            if (field) {
              field.value = familiar[key];
              field.classList.add('field-filled');
            }
          });
        });
      }
    }

    // Atualizar a interface após o carregamento
    destacarCamposPreenchidos();
    updateRemoveMemberButton();

    // Mostrar informação da última vez que foi salvo
    const lastSaved = localStorage.getItem(formId + '_lastSaved');
    if (lastSaved) {
      showInfo(`Formulário carregado (Última modificação: ${lastSaved})`, null, {
        duration: 5000,
        position: 'top-right'
      });
    } else {
      showSuccess('Formulário carregado com sucesso!', null, { duration: 3000 });
    }

    return true;
  } catch (error) {
    console.error('Erro ao carregar formulário:', error);
    showError('Erro ao carregar o formulário!', null, { duration: 3000 });
    return false;
  }
}

// Função para imprimir o formulário
function printForm() {
  window.print();
}

// Função para adicionar membro da família
function addFamilyMember() {
  const container = document.getElementById('membros-familia-container');
  const list = document.getElementById('membros-familia-list');
  const template = document.getElementById('membro-familia-template').innerHTML;

  const memberDiv = document.createElement('div');
  memberDiv.innerHTML = template.trim();
  const newMemberElement = memberDiv.firstChild;

  list.appendChild(newMemberElement);

  // Aplicar máscaras aos novos campos
  newMemberElement.querySelectorAll('input[name="familiar_cpf[]"]').forEach(input => {
    input.addEventListener('input', function() {
      maskCPF(this);
    });
  });

  // Destacar campos
  destacarCamposPreenchidos();
  updateRemoveMemberButton();
}

// Função para adicionar autor
function addAuthor() {
  // Implementação baseada na lógica existente...
  console.log("Adicionar autor - Funcionalidade a ser implementada");
}

// Função para remover o último membro da família
function removeLastFamilyMember() {
  const list = document.getElementById('membros-familia-list');
  if (list.children.length > 1) {
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
  if (!field || !msgElement) return;

  const name = field.name || '';
  const id = field.id || '';

  field.addEventListener('blur', function() {
    // Limpar mensagem anterior
    msgElement.textContent = '';
    msgElement.classList.remove('validation-active', 'validation-error');

    // CPF
    if (name.includes('cpf') || id.includes('cpf')) {
      validateCPF(field, msgElement);
    }
    // CEP
    else if (name.includes('cep') || id.includes('cep')) {
      validateCEP(field, msgElement);
    }
    // Email
    else if (field.type === 'email' || name.includes('email') || id.includes('email')) {
      validateEmail(field, msgElement);
    }
    // Telefone
    else if (name.includes('phone') || name.includes('telefone') || id.includes('phone') || id.includes('telefone')) {
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
  const cpf = field.value.replace(/[^\d]/g, '');

  if (cpf === '') {
    field.classList.remove('cpf-valid', 'cpf-invalid');
    return;
  }

  if (cpf.length !== 11 ||
      cpf === '00000000000' ||
      cpf === '11111111111' ||
      cpf === '22222222222' ||
      cpf === '33333333333' ||
      cpf === '44444444444' ||
      cpf === '55555555555' ||
      cpf === '66666666666' ||
      cpf === '77777777777' ||
      cpf === '88888888888' ||
      cpf === '99999999999') {
    field.classList.remove('cpf-valid');
    field.classList.add('cpf-invalid');
    showValidationMessage(msgElement, 'CPF inválido', true);
    return;
  }

  // Validação do primeiro dígito
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(9))) {
    field.classList.remove('cpf-valid');
    field.classList.add('cpf-invalid');
    showValidationMessage(msgElement, 'CPF inválido', true);
    return;
  }

  // Validação do segundo dígito
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(10))) {
    field.classList.remove('cpf-valid');
    field.classList.add('cpf-invalid');
    showValidationMessage(msgElement, 'CPF inválido', true);
    return;
  }

  field.classList.remove('cpf-invalid');
  field.classList.add('cpf-valid');
  showValidationMessage(msgElement, 'CPF válido');
}

// Função para validar CEP
function validateCEP(field, msgElement) {
  const cep = field.value.replace(/[^\d]/g, '');

  if (cep === '') {
    field.classList.remove('cep-valid', 'cep-invalid');
    return;
  }

  if (cep.length !== 8) {
    field.classList.remove('cep-valid');
    field.classList.add('cep-invalid');
    showValidationMessage(msgElement, 'CEP inválido', true);
    return;
  }

  // Poderia adicionar uma verificação com API dos Correios aqui

  field.classList.remove('cep-invalid');
  field.classList.add('cep-valid');
  showValidationMessage(msgElement, 'CEP válido');
}

// Função para validar email
function validateEmail(field, msgElement) {
  const email = field.value.trim();

  if (email === '') return;

  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) {
    showValidationMessage(msgElement, 'Email inválido', true);
    return;
  }

  showValidationMessage(msgElement, 'Email válido');
}

// Função para validar telefone
function validatePhone(field, msgElement) {
  const phone = field.value.replace(/[^\d]/g, '');

  if (phone === '') return;

  if (phone.length < 10 || phone.length > 11) {
    showValidationMessage(msgElement, 'Telefone inválido', true);
    return;
  }

  showValidationMessage(msgElement, 'Telefone válido');
}

// Função para exibir mensagem de validação
function showValidationMessage(element, message, isError = false) {
  if (!element) return;

  element.textContent = message;
  element.classList.add('validation-active');

  if (isError) {
    element.classList.add('validation-error');
  } else {
    element.classList.remove('validation-error');
    element.classList.add('validation-success');

    // Esconder a mensagem de sucesso após 3 segundos
    setTimeout(() => {
      element.classList.remove('validation-active', 'validation-success');
      element.textContent = '';
    }, 3000);
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
    // Determina o tipo de validação
    const validationType = field.getAttribute('data-validate');
    const isRequired = field.hasAttribute('required');
    const value = field.value.trim();

    // Verificar se é campo obrigatório vazio
    if (isRequired && value === '') {
        showValidationMessage(field, 'Este campo é obrigatório', false);
        return false;
    }

    // Se o campo não é obrigatório e está vazio, é considerado válido
    if (!isRequired && value === '') {
        clearValidation(field);
        return true;
    }

    // Aplicar validação específica com base no tipo
    let isValid = true;
    let message = '';

    switch(validationType) {
        case 'cpf':
            isValid = validateCPF(value);
            message = isValid ? 'CPF válido' : 'CPF inválido';
            break;

        case 'cep':
            isValid = validateCEP(value);
            message = isValid ? 'CEP válido' : 'Formato inválido. Use: 00000-000';
            break;

        case 'email':
            isValid = validateEmail(value);
            message = isValid ? 'Email válido' : 'Email inválido';
            break;

        case 'phone':
            isValid = validatePhone(value);
            message = isValid ? 'Telefone válido' : 'Formato inválido. Use: (00) 00000-0000';
            break;

        case 'date':
            isValid = validateDate(value);
            message = isValid ? 'Data válida' : 'Formato inválido. Use: DD/MM/AAAA';
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
 * Mostra uma mensagem de validação para um campo
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

        // Atualiza a mensagem de validação
        messageElement.textContent = message;
        messageElement.classList.remove('validation-error', 'validation-success');
        messageElement.classList.add('validation-active');
        messageElement.classList.add(isValid ? 'validation-success' : 'validation-error');
    }
}

/**
 * Limpa a validação de um campo
 * @param {HTMLElement} field - O campo a ser limpo
 */
function clearValidation(field) {
    const messageId = `${field.id}-validation-message`;
    const messageElement = document.getElementById(messageId);

    if (messageElement) {
        field.classList.remove('field-valid', 'field-invalid');
        messageElement.classList.remove('validation-active', 'validation-error', 'validation-success');
        messageElement.textContent = '';
    }
}

/**
 * Valida uma data no formato DD/MM/AAAA
 * @param {string} value - O valor a ser validado
 * @returns {boolean} - Se é uma data válida
 */
function validateDate(value) {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return false;

    const parts = value.split('/');
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);

    const date = new Date(year, month, day);

    return date.getFullYear() === year &&
           date.getMonth() === month &&
           date.getDate() === day;
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
    return /^[0-9]+$/.test(value);
}

// Inicializar sistema de labels no carregamento da página
document.addEventListener('DOMContentLoaded', function() {
  setupRightLabels();
  setupLiveValidation();

  // Verificar se há um formulário salvo para carregar automaticamente
  const currentFormId = localStorage.getItem('currentFormId');
  if (currentFormId) {
    // Carregar o formulário salvo, mas somente após perguntar ao usuário
    const lastSaved = localStorage.getItem(currentFormId + '_lastSaved') || '';

    if (confirm(`Deseja carregar o último formulário salvo? (${lastSaved})`)) {
      loadForm(currentFormId);
    }
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
window.setupAutoSave = setupAutoSave;
window.loadForm = loadForm;
