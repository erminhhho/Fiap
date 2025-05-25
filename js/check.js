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
  cpf: function(input) {
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
      return true;
    } else {
      input.classList.remove('cpf-valid');
      input.classList.add('cpf-invalid');
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
   * @returns {boolean} - Indica se a data é válida
   */
  dateOfBirth: function(input) {
    // Executar a validação em tempo real para garantir feedback consistente
    const isValid = this.dateOfBirthRealTime(input);

    // Não recalcula idade nem exibe erro de data futura no blur, apenas retorna o estado de validade
    return isValid;
  },

  /**
   * Valida CEP no formato 00000-000
   * @param {HTMLInputElement} input - Campo de entrada do CEP
   * @returns {boolean} - Indica se o CEP é válido
   */
  cep: function(input) {
    const cep = input.value.replace(/\D/g, '');

    if (cep.length !== 8) {
      input.classList.remove('cep-valid');
      input.classList.add('cep-invalid');
      return false;
    }

    input.classList.remove('cep-invalid');
    input.classList.add('cep-valid');
    return true;
  },

  /**
   * Valida formato de email
   * @param {HTMLInputElement} input - Campo de entrada do email
   * @returns {boolean} - Indica se o email é válido
   */
  email: function(input) {
    const email = input.value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      input.classList.remove('field-valid');
      input.classList.add('field-invalid');
      return false;
    }

    input.classList.remove('field-invalid');
    input.classList.add('field-valid');
    return true;
  },

  /**
   * Valida formato de telefone (quantidade de dígitos)
   * @param {HTMLInputElement} input - Campo de entrada do telefone
   * @returns {boolean} - Indica se o telefone é válido
   */
  phone: function(input) {
    const phone = input.value.replace(/\D/g, '');

    if (phone.length < 10 || phone.length > 11) {
      input.classList.remove('field-valid');
      input.classList.add('field-invalid');
      return false;
    }

    input.classList.remove('field-invalid');
    input.classList.add('field-valid');
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
   * @returns {boolean} - Indica se o campo está preenchido
   */
  required: function(input) {
    const isEmpty = input.value.trim() === '';

    if (isEmpty) {
      input.classList.remove('field-valid');
      input.classList.add('field-invalid');
      return false;
    }

    input.classList.remove('field-invalid');
    input.classList.add('field-valid');
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
   * @param {string} message - Mensagem de erro (REMOVIDO O USO DIRETO DA MENSAGEM)
   */
  markFieldAsInvalid: function(field) {
    field.classList.add('field-invalid');
    // Destacar visualmente o campo
    field.focus();
  },

  /**
   * Limpa todas as validações de um campo
   * @param {HTMLElement} field - Campo a ser limpo
   */
  clearValidation: function(field) {
    if (!field) return;

    field.classList.remove('field-valid', 'field-invalid', 'cpf-valid', 'cpf-invalid',
                          'date-valid', 'date-invalid', 'cep-valid', 'cep-invalid');

    // Restaurar padding original que poderia ter sido alterado por ícones
    field.style.paddingRight = '';
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
