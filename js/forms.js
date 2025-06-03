/**
 * Funções para manipulação de formulários
 */

// Função para limpar o formulário atual (atualizada)
function clearForm(showConfirmation = true) {
  if (!showConfirmation || confirm('Tem certeza que deseja limpar todos os campos do formulário?')) {
    document.querySelectorAll('input:not([type="button"]):not([type="submit"]), select, textarea').forEach(field => {
      field.value = '';
      field.classList.remove('field-filled', 'cpf-valid', 'cpf-invalid', 'cep-valid', 'cep-invalid');
      // Resetar o valor de selects para o primeiro option ou um valor padrão
      if (field.tagName === 'SELECT') {
        if (field.options.length > 0) {
            field.selectedIndex = 0; // Ou o índice do placeholder, se houver
        }
        // Para selects customizados (como o de status em documentos), pode ser necessário um reset específico
        // Se houver um manipulador visual para o select, chamar aqui.
        const relationshipSelectDiv = field.closest('.relationship-select');
        if (relationshipSelectDiv && typeof updateRelationshipVisual === 'function') {
            // Assumindo que o valor padrão é o primeiro ou está no data-default-value
            const defaultValue = field.options.length > 0 ? field.options[0].value : '';
            field.value = defaultValue;
            updateRelationshipVisual(relationshipSelectDiv, defaultValue);
        }
      }
    });

    // Remover mensagens de validação
    document.querySelectorAll('.validation-message').forEach(msg => msg.remove());

    // As listas dinâmicas serão limpas pelas funções resetUI de cada módulo
    // if (membrosFamilia) { ... } // REMOVIDO
    // if (medicamentosList) { ... } // REMOVIDO

    if (showConfirmation) {
      showSuccess('Formulário foi limpo com sucesso!', null, { duration: 3000 });
    }
    return true;
  }
  return false;
}

// Função para criar um novo formulário
function newForm() {
    // 1. Limpar os valores dos campos estáticos do formulário atual
    clearForm(false);

    // 2. Limpar o estado persistido (localStorage)
    if (window.formStateManager) {
      window.formStateManager.clearState();
      console.log("[forms.js] newForm: Estado limpo pelo formStateManager.");
    }

    // 3. Disparar um evento para que os módulos possam resetar suas UIs
    console.log("[forms.js] newForm: Disparando evento 'formCleared' para reset de UIs dos módulos.");
    document.dispatchEvent(new CustomEvent('formCleared'));

    // Remover as chamadas diretas às funções de reset da UI
    // if (typeof window.resetPersonalUI === 'function') { ... } // REMOVIDO
    // ... remover outras chamadas de reset ...
    console.log("[forms.js] newForm: Evento 'formCleared' disparado. Os módulos devem lidar com o reset de suas UIs.");

    // 4. Navegar para a primeira página
    if (window.navigateTo) {
      window.navigateTo('personal');
      console.log("[forms.js] newForm: Navegado para a página 'personal'.");
    } else {
      console.warn("[forms.js] newForm: window.navigateTo não definida. Navegação não ocorreu.");
    }

    showSuccess('Novo formulário iniciado!', null, { duration: 3000 });
}

// Função para salvar o formulário com Firebase
function saveForm() {
  // Usar o gerenciador de estado simplificado
  if (window.formStateManager) {
    // Capturar os dados atuais antes de salvar
    window.formStateManager.captureCurrentFormData();

    // Verificar se existe algum dado preenchido no formulário
    let hasData = false;

    // Verificar cada etapa do formulário
    for (const step in window.formStateManager.formData) {
      const stepData = window.formStateManager.formData[step];

      // Verificar se a etapa tem dados
      if (Object.keys(stepData).length > 0) {
        // Verificar se existem campos preenchidos (não vazios)
        for (const field in stepData) {
          if (stepData[field] && typeof stepData[field] === 'string' && stepData[field].trim() !== '') {
            hasData = true;
            break;
          } else if (stepData[field] && typeof stepData[field] === 'object' && Object.keys(stepData[field]).length > 0) {
            hasData = true;
            break;
          }
        }

        if (hasData) break;
      }
    }

    // Se não existir nenhum dado preenchido, mostrar mensagem e não salvar
    if (!hasData) {
      showError('Não é possível salvar um formulário vazio. Por favor, preencha pelo menos um campo.');
      return;
    }

    // Mostrar indicador de carregamento
    showLoading('Salvando dados...');

    // Tentar salvar no Firebase se estiver online
    /* REMOVIDO: Bloco de salvamento no Firebase
    if (typeof FIAP.firebase !== 'undefined' && FIAP.firebase.db && navigator.onLine) {
      // Usar uma única coleção - 'formularios' - para todos os formulários
      const formData = {
        id: window.formStateManager.currentFormId,
        // Configurar todos os campos em um único objeto
        dados: window.formStateManager.formData,
        currentStep: window.formStateManager.currentStep,
        ultimaAtualizacao: new Date().toISOString()
      };

      // Adicionar informações do CPF para facilitar buscas
      const cpf = window.formStateManager.formData.personal?.cpf || '';
      if (cpf) {
        formData.cpf = cpf;
      }

      FIAP.firebase.db.collection('formularios').doc(formData.id).set(formData, { merge: true })
        .then(() => {
          hideLoading();
          showSuccess('Dados salvos com sucesso no Firebase!', null, {
            duration: 3000,
            position: 'top-right'
          });
        })
        .catch(error => {
          hideLoading();
          console.error("Erro ao salvar no Firebase:", error);
          showError('Erro ao salvar no Firebase. Verifique sua conexão e tente novamente.', null, {
            duration: 3000,
            position: 'top-right'
          });
        });
    } else {
      // Estamos offline, ou Firebase não configurado.
      hideLoading();
      showError('Não foi possível salvar. Verifique sua conexão com a internet e a configuração do Firebase.');
    }
    */
    // Lógica de persistência removida. Apenas simular o salvamento.
    hideLoading();
    showSuccess('Salvo (simulado)! Persistência na nuvem desativada.', null, {
      duration: 3000,
      position: 'top-right'
    });

    return;
  }
}

// Função para carregar formulário do Firebase usando CPF
function loadFormByKey(key) {
  if (!key || key.trim() === '') {
    showError('Por favor, informe um CPF ou ID válido para buscar o formulário');
    return;
  }

  // Mostrar carregamento
  showLoading('Buscando formulário...');

  // Tentar carregar do Firebase primeiro
  /* REMOVIDO: Bloco de carregamento do Firebase
  if (typeof FIAP.firebase !== 'undefined' && FIAP.firebase.db && navigator.onLine) {
    FIAP.firebase.db.collection('formularios').doc(key).get()
      .then(doc => {
        hideLoading();
        if (doc.exists) {
          const formData = doc.data();
          const formIdToLoad = formData.id || key;
          handleFormLoaded(formData.dados || formData, formIdToLoad);
          showSuccess('Formulário carregado com sucesso do Firebase!');
        } else {
          showError('Formulário não encontrado com este CPF/ID no Firebase.');
        }
      })
      .catch(error => {
        hideLoading();
        console.error("Erro ao buscar formulário no Firebase:", error);
        showError('Erro ao buscar formulário no Firebase. Verifique sua conexão.');
      });
  } else {
    // Offline ou Firebase não configurado
    hideLoading();
    showError('Não é possível buscar formulários online. Verifique sua conexão e a configuração do Firebase.');
  }
  */
  // Lógica de persistência removida.
  hideLoading();
  showError('Busca de formulário desativada. Persistência na nuvem removida.');
}

/*
 * Processa os dados do formulário carregado e preenche os campos.
 * @param {Object} formData - Os dados do formulário.
 * @param {string} formId - O ID do formulário carregado.
 */
function handleFormLoaded(formData, formId) {
  console.log(`[forms.js] handleFormLoaded chamada com formId: ${formId}. Call stack:`);
  console.trace();

  if (window.formStateManager) {
    window.formStateManager.clearState();
    window.formStateManager.currentFormId = formId;
    window.formStateManager.formData = formData;
    window.formStateManager.currentStep = formData.currentStep || 'personal';
    window.formStateManager.isInitialized = true;

    if (window.navigateTo) {
      window.navigateTo(window.formStateManager.currentStep);
    } else {
      window.formStateManager.restoreFormData(window.formStateManager.currentStep);
    }
    console.log('Formulário restaurado no gerenciador de estado:', formId);
  } else {
    clearForm(false);
    Object.keys(formData).forEach(k => {
      const field = document.getElementById(k);
      if (field) {
        field.value = formData[k];
        if (formData[k]) {
          field.classList.add('field-filled');
        }
      }
    });
    if (formData.currentRoute && window.location.hash !== `#${formData.currentRoute}`) {
      window.location.hash = formData.currentRoute;
    }
  }
  showSuccess('Formulário carregado e campos preenchidos.');
}

// Função para imprimir o formulário
function printForm() {
  window.print();
}

// Função para adicionar um novo membro à família
function addFamilyMember() {
  const membrosList = document.getElementById('membros-familia-list');
  if (!membrosList) return;

  // Clone do template ou crie um novo se não existir um explícito
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

// NOTA: A função addAuthor() foi movida para modules/personal.js
// para ter melhor controle sobre a funcionalidade específica dos dados pessoais
// incluindo a mudança automática de "Nascimento" para "Falecimento" quando "Instituidor" for selecionado

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
  // Usar a função centralizada
  if (window.Check && typeof window.Check.cpf === 'function') {
    return window.Check.cpf(field, msgElement);
  } else {
    console.warn('validateCPF: Check.cpf não está disponível');
    return false;
  }
}

// Função para validar CEP
function validateCEP(field, msgElement) {
  // Usar a função centralizada
  if (window.Check && typeof window.Check.cep === 'function') {
    return window.Check.cep(field, msgElement);
  } else {
    console.warn('validateCEP: Check.cep não está disponível');
    return false;
  }
}

// Função para validar email
function validateEmail(field, msgElement) {
  // Usar a função centralizada
  if (window.Check && typeof window.Check.email === 'function') {
    return window.Check.email(field, msgElement);
  } else {
    console.warn('validateEmail: Check.email não está disponível');
    return false;
  }
}

// Função para validar telefone
function validatePhone(field, msgElement) {
  // Usar a função centralizada
  if (window.Check && typeof window.Check.phone === 'function') {
    return window.Check.phone(field, msgElement);
  } else {
    console.warn('validatePhone: Check.phone não está disponível');
    return false;
  }
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

/**
 * Verifica campos obrigatórios em um formulário
 * @param {string} formId - ID do formulário ou seção a validar
 * @returns {boolean} - Indica se todos os campos obrigatórios estão preenchidos
 */
function checkRequiredFields(formId) {
  // Usar função centralizada
  if (window.Check && typeof window.Check.checkRequiredFields === 'function') {
    return window.Check.checkRequiredFields(formId);
  } else {
    console.warn('checkRequiredFields: Check.checkRequiredFields não está disponível');

    // Implementação alternativa caso a função centralizada não esteja disponível
    const form = document.getElementById(formId);
    if (!form) return true;

    const requiredFields = form.querySelectorAll('[required], [data-required="true"]');
    let isValid = true;

    requiredFields.forEach(field => {
      if (field.value.trim() === '') {
        field.classList.add('field-invalid');
        isValid = false;

        // Mostrar erro visual
        const msgElement = field.closest('.form-group')?.querySelector('.validation-message');
        if (msgElement) {
          showValidationMessage(msgElement, 'Campo obrigatório', true);
        }
      }
    });

    if (!isValid) {
      // Rolar para o primeiro campo com erro
      const firstInvalidField = form.querySelector('.field-invalid');
      if (firstInvalidField) {
        firstInvalidField.focus();
        firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    return isValid;
  }
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
            // Usar a função completa para CPF, que já trata visual e mensagem
            return validateCPF(field, messageElement);
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
 * Mostra uma mensagem de erro
 * @param {string} message - Mensagem de erro
 * @param {Element} parentElement - Elemento pai opcional
 * @param {Object} options - Opções adicionais
 */
function showError(message, parentElement = null, options = {}) {
  const defaults = {
    duration: 5000,
    position: 'top-right'
  };

  const settings = { ...defaults, ...options };

  const notification = document.createElement('div');
  notification.className = 'notification bg-red-100 bg-opacity-90 backdrop-blur-sm border-l-4 border-red-500 text-red-700 p-4 rounded shadow-lg fixed z-50';

  // Posicionamento
  if (settings.position === 'top-right') {
    notification.style.top = '1rem';
    notification.style.right = '1rem';
  } else if (settings.position === 'top-center') {
    notification.style.top = '1rem';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
  }

  notification.innerHTML = `
    <div class="flex items-center">
      <span>${message}</span>
    </div>
  `;

  (parentElement || document.body).appendChild(notification);

  if (settings.duration > 0) {
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transition = 'opacity 0.5s ease';
      setTimeout(() => notification.remove(), 500);
    }, settings.duration);
  }
}

/**
 * Mostra uma mensagem de sucesso
 * @param {string} message - Mensagem de sucesso
 * @param {Element} parentElement - Elemento pai opcional
 * @param {Object} options - Opções adicionais
 */
function showSuccess(message, parentElement = null, options = {}) {
  const defaults = {
    duration: 3000,
    position: 'top-right'
  };

  const settings = { ...defaults, ...options };

  const notification = document.createElement('div');
  notification.className = 'notification bg-green-100 bg-opacity-90 backdrop-blur-sm border-l-4 border-green-500 text-green-700 p-4 rounded shadow-lg fixed z-50';

  // Posicionamento
  if (settings.position === 'top-right') {
    notification.style.top = '1rem';
    notification.style.right = '1rem';
  } else if (settings.position === 'top-center') {
    notification.style.top = '1rem';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
  }

  notification.innerHTML = `
    <div class="flex items-center">
      <span>${message}</span>
    </div>
  `;

  (parentElement || document.body).appendChild(notification);

  if (settings.duration > 0) {
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transition = 'opacity 0.5s ease';
      setTimeout(() => notification.remove(), 500);
    }, settings.duration);
  }
}

// Função para mostrar loading
function showLoading(message = 'Carregando...', parentElement = null) {
  // Prevenção contra recursão infinita
  if (document.getElementById('loading-overlay')) return;

  // Implementação alternativa
  const overlay = document.createElement('div');
  overlay.id = 'loading-overlay';
  // Posicionar overlay logo abaixo do header, usando estilos diretos para garantir efeito
  Object.assign(overlay.style, {
    position: 'fixed',
    top: '4rem',       // ajustar conforme altura do navbar
    right: '0',
    bottom: '0',
    left: '0',
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingTop: '1.5rem',
    zIndex: '1000'
  });
  overlay.innerHTML = `
    <div class="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
      <div class="loader-dots">
        <span></span><span></span><span></span>
      </div>
    </div>
  `;
  (parentElement || document.body).appendChild(overlay);
}

// Função para esconder loading
function hideLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.remove();
  }
}

// Função para configurar autocapitalização em campos de texto
function setupAutoCapitalize() {
  // Selecionar campos de texto onde queremos capitalizar
  const camposParaCapitalizar = document.querySelectorAll('input[type="text"]:not([data-no-capitalize]), textarea:not([data-no-capitalize])');

  camposParaCapitalizar.forEach(campo => {
    // Adicionar atributo de capitalização
    campo.autocapitalize = "words";

    // Para textos maiores, capitalizar quando o usuário terminar de digitar
    if (campo.tagName.toLowerCase() === 'textarea') {
      campo.addEventListener('blur', function() {
        if (!this.value) return;

        // Capitalizar primeira letra de cada frase
        this.value = this.value.replace(/(^\s*\w|[.!?]\s*\w)/g, function(c) {
          return c.toUpperCase();
        });
      });
    }
    // Para campos de texto simples, capitalizar enquanto digita
    else {
      campo.addEventListener('input', function() {
        if (!this.value) return;

        // Capitalizar primeira letra de palavras para nomes, suportando acentos
        if (this.id === 'nome' || this.name === 'nome' ||
            this.id.includes('name') || this.name.includes('name')) {
          this.value = this.value.replace(/(^|\s)(\S)/g, (m, g1, g2) => g1 + g2.toUpperCase());
        }
      });
    }
  });
}

// Inicializar sistema de labels no carregamento da página
document.addEventListener('DOMContentLoaded', function() {
  setupRightLabels();
  setupLiveValidation();

  // Configurar o destaque de campos preenchidos
  if (typeof setupFieldHighlighting === 'function') {
    setupFieldHighlighting();
  }

  // Capitalização automática
  setupAutoCapitalize();
});

// Exportar funções para uso global
window.clearForm = clearForm;
window.newForm = newForm;
window.saveForm = saveForm;
window.printForm = printForm;
// window.addFamilyMember = addFamilyMember; // REMOVIDO: addFamilyMember é definido no módulo social.js
// window.addAuthor = addAuthor; // REMOVIDO: addAuthor é definido no módulo personal.js
// window.removeLastFamilyMember = removeLastFamilyMember; // REMOVIDO: removeLastFamilyMember é definido no módulo social.js
// window.updateRemoveMemberButton = updateRemoveMemberButton; // REMOVIDO: updateRemoveMemberButton é definido no módulo social.js
window.loadFormByKey = loadFormByKey;
window.showError = showError;
window.showSuccess = showSuccess;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.showClearConfirmation = showClearConfirmation;
window.executeClearSection = executeClearSection;
window.setupAutoCapitalize = setupAutoCapitalize;

// Função para mostrar a confirmação de limpeza de forma moderna e não invasiva
function showClearConfirmation(event, section) {
  // Remover qualquer confirmação existente
  const existingConfirmation = document.getElementById('clear-confirmation');
  if (existingConfirmation) {
    existingConfirmation.remove();
  }

  // Criar o popup de confirmação
  const confirmation = document.createElement('div');
  confirmation.id = 'clear-confirmation';
  confirmation.className = 'absolute bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-lg p-3 z-50 border border-gray-200 animate-fade-in';
  confirmation.style.minWidth = '200px';

  // Posicionar o popup próximo ao clique do mouse
  const rect = event.target.getBoundingClientRect();
  confirmation.style.top = (window.scrollY + rect.bottom + 5) + 'px';  // 5px abaixo do botão
  confirmation.style.right = (document.body.clientWidth - rect.right) + 'px';

  // Conteúdo do popup
  confirmation.innerHTML = `
    <p class="text-sm text-gray-700 mb-4">Limpar esta seção?</p>
    <div class="flex gap-2 w-full mt-2">
  <button class="flex-1 px-3 py-2 text-xs bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700 font-semibold transition" onclick="document.getElementById('clear-confirmation').remove()">
    Cancelar
  </button>
  <button class="flex-1 px-3 py-2 text-xs bg-red-500 hover:bg-red-600 rounded-md text-white font-semibold transition" onclick="executeClearSection('${section}')">
    Limpar
  </button>
</div>
  `;

  // Adicionar ao documento
  document.body.appendChild(confirmation);

  // Adicionar estilo CSS para animação
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.2s ease-out forwards;
    }
  `;
  document.head.appendChild(style);

  // Fechar ao clicar fora
  document.addEventListener('click', function closeConfirmation(e) {
    if (!confirmation.contains(e.target) && e.target !== event.target) {
      confirmation.remove();
      document.removeEventListener('click', closeConfirmation);
    }
  });
}

// Função para executar a limpeza da seção
function executeClearSection(section) {
  console.log('Limpando seção:', section);
  const form = document.querySelector('form');
  if (!form) return;

  // Limpar campos da seção específica
  const sectionElement = document.getElementById(`step-${section}`);
  if (sectionElement) {
    sectionElement.querySelectorAll('input:not([type="button"]):not([type="submit"]), select, textarea').forEach(field => {
      if (field.type === 'checkbox' || field.type === 'radio') {
        field.checked = false;
      } else {
        field.value = '';
      }
      field.classList.remove('field-filled', 'cpf-valid', 'cpf-invalid', 'cep-valid', 'cep-invalid');
    });
    // Remover mensagens de validação da seção
    sectionElement.querySelectorAll('.validation-message').forEach(msg => msg.remove());
    // Limpar o conteúdo de containers específicos da seção, se necessário
    // Exemplo: limpar lista de membros da família se a seção for 'social'
    if (section === 'social') {
      const membrosFamilia = document.getElementById('membros-familia-list');
      if (membrosFamilia) {
        membrosFamilia.innerHTML = '';
        // Adicionar um membro em branco para começar, se for a lógica do seu app
        if (typeof addFamilyMember === 'function') addFamilyMember();
      }
    }
    // Adicione mais casos conforme necessário para outras seções
  }

  // Chamar a função de limpeza específica do módulo, se existir
  if (typeof window.clearSectionModule === 'function') {
    window.clearSectionModule(section);
  }

  // Atualizar o estado no formStateManager
  if (window.formStateManager) {
    const currentStep = window.formStateManager.currentStep; // Ou 'section' se for o caso
    if (currentStep && window.formStateManager.formData[currentStep]) {
      // Limpar apenas os dados da seção atual no formData
      window.formStateManager.formData[currentStep] = {};
    }
  }

  // Atualizar a interface (ex: destacar campos)
  if (typeof destacarCamposPreenchidos === 'function') {
    destacarCamposPreenchidos();
  }

  showSuccess(`Seção ${section} limpa com sucesso.`);
}

// Exportar funções para uso global
window.showClearConfirmation = showClearConfirmation;
window.executeClearSection = executeClearSection;

// Função para auto-salvamento ao sair do campo (onblur)
function autoSaveOnChange(fieldId) {
  const field = document.getElementById(fieldId);
  if (field) {
    field.addEventListener('blur', function() {
      // Atualizar o estado no formStateManager ao invés de localStorage diretamente
      if (window.formStateManager && window.formStateManager.formData) {
        const currentRoute = window.location.hash.substring(1) || 'personal';
        if (!window.formStateManager.formData[currentRoute]) {
          window.formStateManager.formData[currentRoute] = {};
        }
        window.formStateManager.formData[currentRoute][fieldId] = this.value;
        // Não chamar saveToLocalStorage aqui para evitar salvamentos excessivos.
        // A captura principal de dados antes da navegação ou em saveForm() cuidará disso.
      }
    });
  }
}
