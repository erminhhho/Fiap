/**
 * Sistema centralizado de validação para formulários FIAP
 * Este arquivo contém todas as funções de validação utilizadas na aplicação
 */

const Check = {
  /**
   * Valida CPF em tempo real mostrando feedback visual
   * @param {HTMLInputElement} input - Campo de entrada do CPF
   * @returns {boolean} - Indica se o CPF é válido
   */
  cpfRealTime: function(input) {
    const cpf = input.value.replace(/\D/g, '');
    input.classList.remove('cpf-valid', 'cpf-invalid', 'cpf-validating');

    // Campo vazio ou incompleto
    if (cpf.length === 0) return true;
    if (cpf.length < 11) {
      // Ao apagar, neutraliza o campo (sem erro visual)
      input.classList.remove('cpf-valid', 'cpf-invalid', 'cpf-validating');
      return false;
    }

    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) {
      input.classList.add('cpf-invalid');
      return false;
    }

    // Algoritmo de validação do CPF
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(cpf.charAt(i)) * (10 - i);
    let remainder = sum % 11;
    let digit1 = remainder < 2 ? 0 : 11 - remainder;

    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(cpf.charAt(i)) * (11 - i);
    remainder = sum % 11;
    let digit2 = remainder < 2 ? 0 : 11 - remainder;

    // Verificar se os dígitos calculados são iguais aos dígitos informados
    if (parseInt(cpf.charAt(9)) === digit1 && parseInt(cpf.charAt(10)) === digit2) {
      input.classList.add('cpf-valid');
      return true;
    } else {
      input.classList.add('cpf-invalid');
      return false;
    }
  },

  /**
   * Valida CPF quando o campo perde o foco
   * @param {HTMLInputElement} input - Campo de entrada do CPF
   * @param {HTMLElement} [msgElement] - Elemento opcional para exibir mensagem
   * @returns {boolean} - Indica se o CPF é válido
   */
  cpf: function(input, msgElement) {
    // Se o campo estiver vazio ou incompleto, limpar todos os estados de validação
    const cpf = input.value.replace(/\D/g, '');
    if (cpf.length === 0 || cpf.length < 11) {
      input.classList.remove('cpf-valid', 'cpf-invalid', 'cpf-validating');

      // Garantir que a label volte à cor padrão
      const label = input.parentElement.querySelector('label');
      if (label) {
        label.classList.remove('text-red-500', 'text-white');
        label.classList.add('text-gray-700');
      }

      // Remover ícone de validação
      this.removeValidationIcon(input);

      // Remover qualquer mensagem de validação
      if (msgElement) {
        msgElement.textContent = '';
        msgElement.classList.remove('validation-error', 'validation-success');
      } else {
        this.removeValidationMessage(input.parentElement);
      }

      // Remover qualquer estilo de borda no input
      input.style.borderColor = '';

      // Garantir que o campo não tenha borda vermelha
      input.classList.remove('field-invalid');
      input.classList.remove('cpf-invalid');

      return true; // Campo vazio ou incompleto não é considerado erro
    }

    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) {
      input.classList.remove('cpf-valid');
      input.classList.add('cpf-invalid');

      if (msgElement) {
        msgElement.textContent = 'CPF inválido';
        msgElement.classList.remove('validation-success');
        msgElement.classList.add('validation-error');
      }

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
      input.classList.remove('cpf-invalid');
      input.classList.add('cpf-valid');

      if (msgElement) {
        msgElement.textContent = 'CPF válido';
        msgElement.classList.remove('validation-error');
        msgElement.classList.add('validation-success');
      }

      return true;
    } else {
      input.classList.remove('cpf-valid');
      input.classList.add('cpf-invalid');

      if (msgElement) {
        msgElement.textContent = 'CPF inválido';
        msgElement.classList.remove('validation-success');
        msgElement.classList.add('validation-error');
      }

      return false;
    }
  },

  /**
   * Valida data de nascimento em tempo real
   * @param {HTMLInputElement} input - Campo de entrada da data
   * @returns {boolean} - Indica se a data é válida
   */
  dateOfBirthRealTime: function(input) {
    const dateValue = input.value;
    input.classList.remove('date-valid', 'date-invalid', 'date-validating');

    // Limpar campo de idade e tag de classificação se data estiver vazia ou incompleta
    if ((dateValue.trim() === '' || dateValue.length < 10) && input.dataset.targetAge) {
      const idadeInput = document.getElementById(input.dataset.targetAge);
      if (idadeInput) {
        idadeInput.value = '';
        idadeInput.classList.remove('field-valid', 'field-invalid');
        // Remover tag de classificação etária
        const parentElement = idadeInput.parentElement;
        if (parentElement) {
          const existingTag = parentElement.querySelector('.age-classification-tag');
          if (existingTag) existingTag.remove();
        }
      }
      // Apenas remover classes de validação existentes do campo data
      return false;
    }

    if (dateValue.trim() === '') {
      // Se o campo estiver vazio, não aplicar classes de erro.
      // Apenas remover as classes de validação existentes.
      return true;
    }

    if (dateValue.length < 10) { // DD/MM/AAAA incompleto
      // Ao apagar, remover qualquer erro e deixar neutro
      return false;
    }

    input.classList.add('date-validating'); // Adiciona classe enquanto valida

    const parts = dateValue.split('/');
    if (parts.length !== 3) {
      input.classList.remove('date-validating');
      input.classList.add('date-invalid');
      return false;
    }

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);

    if (isNaN(day) || isNaN(month) || isNaN(year) ||
        year < 1900 || year > new Date().getFullYear() + 1 ||
        month < 1 || month > 12 ||
        day < 1 || day > 31) {
      input.classList.remove('date-validating');
      input.classList.add('date-invalid');
      return false;
    }

    // Validação de dias no mês
    const daysInMonth = [31, (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (day > daysInMonth[month - 1]) {
      input.classList.remove('date-validating');
      input.classList.add('date-invalid');
      return false;
    }

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Zerar horas para comparar apenas datas
    const inputDate = new Date(year, month - 1, day);

    if (isNaN(inputDate.getTime())) { // Checagem final se a data é realmente válida
        input.classList.remove('date-validating');
        input.classList.add('date-invalid');
        return false;
    }

    if (inputDate > currentDate) { // Data no futuro
        input.classList.remove('date-validating');
        input.classList.add('date-invalid');
        return false;
    }

    const minDate = new Date();
    minDate.setFullYear(currentDate.getFullYear() - 150); // Limite de 150 anos no passado
    minDate.setHours(0,0,0,0);
    if (inputDate < minDate) { // Data muito antiga
        input.classList.remove('date-validating');
        input.classList.add('date-invalid');
        return false;
    }

    input.classList.remove('date-validating', 'date-invalid');
    input.classList.add('date-valid');
    return true;
  },

  /**
   * Valida data de nascimento quando o campo perde o foco
   * @param {HTMLInputElement} input - Campo de entrada da data
   * @param {HTMLElement} [msgElement] - Elemento opcional para exibir mensagem
   * @returns {boolean} - Indica se a data é válida
   */
  dateOfBirth: function(input, msgElement) {
    // Executar a validação em tempo real para garantir feedback consistente
    const isValid = this.dateOfBirthRealTime(input);

    if (msgElement) {
      if (isValid && input.value.trim() !== '') {
        msgElement.textContent = 'Data válida';
        msgElement.classList.remove('validation-error');
        msgElement.classList.add('validation-success');
      } else if (!isValid && input.value.trim() !== '' && input.value.length === 10) {
        msgElement.textContent = 'Data inválida';
        msgElement.classList.remove('validation-success');
        msgElement.classList.add('validation-error');
      } else {
        msgElement.textContent = '';
        msgElement.classList.remove('validation-error', 'validation-success');
      }
    }

    // Não recalcula idade nem exibe erro de data futura no blur, apenas retorna o estado de validade
    return isValid;
  },

  /**
   * Valida CEP no formato 00000-000
   * @param {HTMLInputElement} input - Campo de entrada do CEP
   * @param {HTMLElement} [msgElement] - Elemento opcional para exibir mensagem
   * @returns {boolean} - Indica se o CEP é válido
   */
  cep: function(input, msgElement) {
    const cep = input.value.replace(/\D/g, '');

    if (cep.length !== 8) {
      input.classList.remove('cep-valid');
      input.classList.add('cep-invalid');

      if (msgElement) {
        msgElement.textContent = 'CEP inválido';
        msgElement.classList.remove('validation-success');
        msgElement.classList.add('validation-error');
      }

      return false;
    }

    input.classList.remove('cep-invalid');
    input.classList.add('cep-valid');

    if (msgElement) {
      msgElement.textContent = 'CEP válido';
      msgElement.classList.remove('validation-error');
      msgElement.classList.add('validation-success');
    }

    return true;
  },

  /**
   * Valida formato de email
   * @param {HTMLInputElement} input - Campo de entrada do email
   * @param {HTMLElement} [msgElement] - Elemento opcional para exibir mensagem
   * @returns {boolean} - Indica se o email é válido
   */
  email: function(input, msgElement) {
    const email = input.value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      input.classList.remove('field-valid');
      input.classList.add('field-invalid');

      if (msgElement) {
        msgElement.textContent = 'E-mail inválido';
        msgElement.classList.remove('validation-success');
        msgElement.classList.add('validation-error');
      }

      return false;
    }

    input.classList.remove('field-invalid');
    input.classList.add('field-valid');

    if (msgElement) {
      msgElement.textContent = 'E-mail válido';
      msgElement.classList.remove('validation-error');
      msgElement.classList.add('validation-success');
    }

    return true;
  },

  /**
   * Valida formato de telefone (quantidade de dígitos)
   * @param {HTMLInputElement} input - Campo de entrada do telefone
   * @param {HTMLElement} [msgElement] - Elemento opcional para exibir mensagem
   * @returns {boolean} - Indica se o telefone é válido
   */
  phone: function(input, msgElement) {
    const phone = input.value.replace(/\D/g, '');

    if (phone.length < 10 || phone.length > 11) {
      input.classList.remove('field-valid');
      input.classList.add('field-invalid');

      if (msgElement) {
        msgElement.textContent = 'Telefone inválido';
        msgElement.classList.remove('validation-success');
        msgElement.classList.add('validation-error');
      }

      return false;
    }

    input.classList.remove('field-invalid');
    input.classList.add('field-valid');

    if (msgElement) {
      msgElement.textContent = 'Telefone válido';
      msgElement.classList.remove('validation-error');
      msgElement.classList.add('validation-success');
    }

    return true;
  },

  /**
   * Valida idade (numérica e dentro de limites razoáveis)
   * @param {HTMLInputElement} input - Campo de entrada da idade
   * @returns {boolean} - Indica se a idade é válida
   */
  age: function(input) {
    const ageText = input.value;
    const ageMatch = ageText.match(/(\d+)/);

    if (!ageMatch) return false;

    const age = parseInt(ageMatch[1], 10);

    if (isNaN(age) || age < 0 || age > 150) {
      input.classList.add('field-invalid');
      return false;
    }

    input.classList.remove('field-invalid');
    input.classList.add('field-valid');
    return true;
  },

  /**
   * Valida campo obrigatório
   * @param {HTMLInputElement} input - Campo de entrada
   * @param {HTMLElement} [msgElement] - Elemento opcional para exibir mensagem
   * @returns {boolean} - Indica se o campo está preenchido
   */
  required: function(input, msgElement) {
    const isEmpty = input.value.trim() === '';

    if (isEmpty) {
      input.classList.remove('field-valid');
      input.classList.add('field-invalid');

      if (msgElement) {
        msgElement.textContent = 'Campo obrigatório';
        msgElement.classList.remove('validation-success');
        msgElement.classList.add('validation-error');
      }

      return false;
    }

    input.classList.remove('field-invalid');
    input.classList.add('field-valid');

    if (msgElement) {
      msgElement.textContent = 'Campo preenchido';
      msgElement.classList.remove('validation-error');
      msgElement.classList.add('validation-success');
    }

    return true;
  },

  /**
   * Verifica campos obrigatórios em um formulário
   * @param {string} formId - ID do formulário ou seção a validar
   * @returns {boolean} - Indica se todos os campos obrigatórios estão preenchidos
   */
  checkRequiredFields: function(formId) {
    const form = document.getElementById(formId);
    if (!form) return true;

    const requiredFields = form.querySelectorAll('[required], [data-required="true"]');
    let isValid = true;

    requiredFields.forEach(field => {
      if (field.type === 'checkbox' || field.type === 'radio') {
        // Lógica para checkbox e radio
        const name = field.name;
        const checked = form.querySelector(`[name="${name}"]:checked`);
        if (!checked) {
          this.markFieldAsInvalid(field, 'Este campo é obrigatório');
          isValid = false;
        }
      } else {
        // Campos de texto, select, etc.
        if (field.value.trim() === '') {
          this.markFieldAsInvalid(field, 'Campo obrigatório');
          isValid = false;
        }
      }
    });

    return isValid;
  },

  /**
   * Marca campo como inválido e exibe mensagem
   * @param {HTMLElement} field - Campo a marcar
   * @param {string} message - Mensagem de erro
   */
  markFieldAsInvalid: function(field, message) {
    field.classList.add('field-invalid');

    // Buscar container de mensagem existente ou criar um novo
    const msgElement = field.parentElement.querySelector('.validation-message');
    if (msgElement) {
      msgElement.textContent = message;
      msgElement.classList.remove('validation-success');
      msgElement.classList.add('validation-error', 'validation-active');
    } else {
      // Criar novo elemento de mensagem
      const newMsg = document.createElement('div');
      newMsg.className = 'validation-message validation-error validation-active';
      newMsg.textContent = message;
      field.parentElement.appendChild(newMsg);
    }

    // Destacar visualmente o campo
    field.focus();
  },

  /**
   * Remove ícone de validação do campo
   * @param {HTMLInputElement} input - Campo de entrada
   */
  removeValidationIcon: function(input) {
    const parent = input.parentElement;
    const existingIcon = parent.querySelector('.validation-field-icon');

    if (existingIcon) {
      existingIcon.remove();
    }

    // Restaurar padding original
    input.style.paddingRight = '';
  },

  /**
   * Remove mensagem de validação
   * @param {HTMLElement} parentDiv - Elemento pai que contém a mensagem
   */
  removeValidationMessage: function(parentDiv) {
    const existingMessage = parentDiv.querySelector('.validation-message');

    if (existingMessage) {
      existingMessage.remove();
    }
  },

  /**
   * Adiciona um ícone de validação dentro do campo
   * @param {HTMLInputElement} input - Campo de entrada
   * @param {string} icon - Nome do ícone FontAwesome sem o prefixo 'fa-'
   * @param {string} colorClass - Classe de cor para o ícone
   */
  addValidationIcon: function(input, icon, colorClass) {
    this.removeValidationIcon(input);

    // Criar span para o ícone
    const iconSpan = document.createElement('span');
    iconSpan.className = `validation-field-icon absolute right-3 top-1/2 transform -translate-y-1/2 ${colorClass}`;
    iconSpan.innerHTML = `<i class="fas fa-${icon}"></i>`;
    iconSpan.style.zIndex = "20"; // Garantir que o ícone esteja acima de outros elementos

    // Adicionar o ícone após o input (mas dentro do container)
    input.parentElement.appendChild(iconSpan);

    // Adicionar padding extra à direita para evitar sobreposição
    input.style.paddingRight = '2.5rem';
  },

  /**
   * Limpa todas as validações de um campo
   * @param {HTMLElement} field - Campo a ser limpo
   */
  clearValidation: function(field) {
    if (!field) return;

    field.classList.remove('field-valid', 'field-invalid', 'cpf-valid', 'cpf-invalid',
                          'date-valid', 'date-invalid', 'cep-valid', 'cep-invalid');

    // Remover ícone de validação
    this.removeValidationIcon(field);

    // Remover mensagem de validação
    this.removeValidationMessage(field.parentElement);
  },

  /**
   * Configura validação em tempo real para campos específicos
   */
  setupLiveValidation: function() {
    // CPF
    document.querySelectorAll('input[id*="cpf"], input[name*="cpf"]').forEach(input => {
      input.addEventListener('blur', () => this.cpf(input));
      input.addEventListener('input', function() {
        if (this.value.replace(/\D/g, '').length >= 11) {
          Check.cpfRealTime(this);
        }
      });
    });

    // Data de nascimento
    document.querySelectorAll('input[id*="nascimento"], input[name*="nascimento"], input[id*="data_nasc"], input[name*="data_nasc"]').forEach(input => {
      input.addEventListener('blur', () => this.dateOfBirth(input));
      input.addEventListener('input', function() {
        if (this.value.length >= 8) {
          Check.dateOfBirthRealTime(this);
        }
      });
    });

    // CEP
    document.querySelectorAll('input[id*="cep"], input[name*="cep"]').forEach(input => {
      input.addEventListener('blur', () => this.cep(input));
    });

    // Email
    document.querySelectorAll('input[type="email"], input[id*="email"], input[name*="email"]').forEach(input => {
      input.addEventListener('blur', () => this.email(input));
    });

    // Telefone
    document.querySelectorAll('input[id*="telefone"], input[id*="phone"], input[name*="telefone"], input[name*="phone"]').forEach(input => {
      input.addEventListener('blur', () => this.phone(input));
    });

    // Campos obrigatórios
    document.querySelectorAll('[required]').forEach(input => {
      input.addEventListener('blur', () => this.required(input));
    });
  },

  /**
   * Inicializa o sistema de validação
   */
  init: function() {
    // Configurar validação em tempo real
    this.setupLiveValidation();

    console.log('Sistema de validação centralizado inicializado');
  }
};

// Exportar para escopo global
window.Check = Check;
window.validateCPF = Check.cpf.bind(Check);
window.validateCPFRealTime = Check.cpfRealTime.bind(Check);
window.validateDateOfBirth = Check.dateOfBirth.bind(Check);
window.validateDateOfBirthRealTime = Check.dateOfBirthRealTime.bind(Check);
window.validateEmail = Check.email.bind(Check);
window.validatePhone = Check.phone.bind(Check);
window.checkRequiredFields = Check.checkRequiredFields.bind(Check);

// Inicializar automaticamente quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  // Inicializar o sistema de validação
  Check.init();
});
