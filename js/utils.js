/**
 * Sistema de utilidades para o FIAP Web App
 * Organizado em namespaces para melhor organização e reutilização.
 */

// Namespace global para o sistema
const FIAP = {};

/**
 * Módulo de persistência de dados entre páginas
 */
FIAP.data = {
  /**
   * Salva dados de um formulário no localStorage
   * @param {string} formId - ID do formulário ou prefixo para os campos
   * @param {Array} fieldNames - Lista de nomes de campos para salvar
   */
  saveFormData: function(formId, fieldNames) {
    const prefix = formId ? `${formId}_` : '';
    fieldNames.forEach(fieldName => {
      const value = document.getElementById(fieldName)?.value || '';
      localStorage.setItem(`${prefix}${fieldName}`, value);
    });
    console.log(`Dados do formulário ${formId || 'sem ID'} salvos no localStorage`);
  },

  /**
   * Recupera dados armazenados e preenche campos
   * @param {string} formId - ID do formulário ou prefixo usado ao salvar
   * @param {Object} fieldMapping - Mapeamento entre campos origem e destino
   */
  loadFormData: function(formId, fieldMapping) {
    const prefix = formId ? `${formId}_` : '';
    Object.entries(fieldMapping).forEach(([sourceField, targetId]) => {
      const storedValue = localStorage.getItem(`${prefix}${sourceField}`) || '';
      const target = document.getElementById(targetId);
      if (target && storedValue) {
        target.value = storedValue;
        console.log(`Campo ${targetId} preenchido com valor: ${storedValue}`);
      }
    });
  }
};

/**
 * Módulo de mascaramento e validação de dados
 */
FIAP.masks = {
  /**
   * Formata CPF no formato 000.000.000-00 e valida em tempo real
   * @param {HTMLInputElement} input - Campo de entrada do CPF
   */
  cpf: function(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 11) value = value.substring(0, 11);

    value = value.replace(/^(\d{3})(\d)/, '$1.$2');
    value = value.replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
    value = value.replace(/\.(\d{3})(\d)/, '.$1-$2');

    input.value = value;

    // Realizar validação em tempo real após 3 dígitos ou se estiver completo
    if (value.length >= 3 || (value.length > 0 && input.dataset.validated === 'true')) {
      input.dataset.validated = 'true';
      FIAP.validation.cpfRealTime(input);
    }
  },

  /**
   * Formata CEP no formato 00000-000
   * @param {HTMLInputElement} input - Campo de entrada do CEP
   */
  cep: function(input) {
    // Guardar posição do cursor antes da formatação
    const cursorPos = input.selectionStart;
    const oldValue = input.value;

    let value = input.value.replace(/\D/g, '');
    if (value.length > 8) value = value.substring(0, 8);

    // Aplicar formatação
    if (value.length > 5) {
      value = value.replace(/^(\d{5})(\d)/, '$1-$2');
    }

    // Atualizar valor
    input.value = value;

    // Restaurar posição do cursor considerando a adição do hífen
    if (cursorPos < oldValue.length) {
      const newPos = cursorPos + (value.length - oldValue.length);
      input.setSelectionRange(newPos, newPos);
    }

    // Remover classes de validação existentes
    input.classList.remove('cep-valid', 'cep-invalid');

    // Remover mensagem de validação anterior
    const parentDiv = input.parentElement;
    const prevMessage = parentDiv.querySelector('.validation-message');
    if (prevMessage) prevMessage.remove();

    // Se não estiver completo, remover ícones de validação existentes
    if (value.length < 8) {
      FIAP.validation.removeValidationIcon(input);
    }

    // PONTO CHAVE: Se atingiu exatamente 8 dígitos, consultar CEP imediatamente
    if (value.replace(/\D/g, '').length === 8) {
      // Consultar imediatamente, sem timeout
      FIAP.api.consultarCEP(value);
    }
  },

  /**
   * Formata data no formato DD/MM/AAAA e valida
   * @param {HTMLInputElement} input - Campo de entrada da data
   */
  date: function(input) {
    let value = input.value.replace(/\D/g, '');

    if (value.length > 8) value = value.substring(0, 8);

    value = value.replace(/^(\d{2})(\d)/, '$1/$2');
    value = value.replace(/^(\d{2})\/(\d{2})(\d)/, '$1/$2/$3');

    input.value = value;

    // Realizar validação em tempo real após ter pelo menos dia e mês completos
    if (value.length >= 5) {
      input.dataset.validated = 'true';
      FIAP.validation.dateOfBirthRealTime(input);
    }

    // Se tiver campo de idade associado, calcular apenas se a data for válida
    if (value.length === 10 && input.dataset.targetAge && input.classList.contains('date-valid')) {
      FIAP.calculation.age(input.value, input.dataset.targetAge);
    }
  },

  /**
   * Formata telefone no formato (00) 00000-0000 com indicador de WhatsApp
   * @param {HTMLInputElement} input - Campo de entrada do telefone
   */
  phone: function(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 11) value = value.substring(0, 11);

    if (value.length > 2) {
      value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
    }
    if (value.length > 9) {
      value = value.replace(/(\d)(\d{4})$/, '$1-$2');
    }

    input.value = value;

    // Garantir que o ícone de WhatsApp seja adicionado
    this.addWhatsAppIcon(input);
  },

  /**
   * Adiciona ícone de WhatsApp clicável ao campo de telefone
   * @param {HTMLInputElement} input - Campo de entrada do telefone
   */
  addWhatsAppIcon: function(input) {
    if (!input || !input.parentElement) return;

    // Verificação mais rigorosa - evitar campos que são detalhes ou descrições de telefone
    const isExcluded = (
      (input.id && (input.id.includes('_detalhes') || input.id.includes('_descricao'))) ||
      (input.name && (input.name.includes('_detalhes') || input.name.includes('_descricao'))) ||
      (input.placeholder && (input.placeholder.includes('detalhe') || input.placeholder.includes('descrição')))
    );

    if (isExcluded) return;

    // Verificar se é realmente um campo principal de telefone
    const isPhoneField =
      (input.id && (input.id === 'telefone' || input.id.includes('phone') || input.id.match(/telefone[0-9]*/))) ||
      (input.name && (input.name === 'telefone' || input.name.includes('phone') || input.name.match(/telefone[0-9]*/))) ||
      input.type === 'tel' ||
      (input.placeholder && (
        input.placeholder.includes('(') &&
        input.placeholder.includes(')') &&
        input.placeholder.includes('-')
      ));

    // Se não for campo de telefone ou for excluído, não adicionar ícone
    if (!isPhoneField) return;

    // Remover antigas tags de WhatsApp (compatibilidade com sistemas antigos)
    const oldWhatsAppTags = input.parentElement.querySelectorAll('.whatsapp-tag');
    oldWhatsAppTags.forEach(tag => tag.remove());

    // Forçar posicionamento relativo do container
    input.parentElement.style.position = 'relative';

    // Verificar se já existe um ícone e remover para evitar duplicação
    const existingIcon = input.parentElement.querySelector('.whatsapp-icon-toggle');
    if (existingIcon) existingIcon.remove();

    // Criar o ícone de WhatsApp
    const whatsappIcon = document.createElement('div');
    whatsappIcon.className = 'whatsapp-icon-toggle';
    whatsappIcon.innerHTML = '<i class="fab fa-whatsapp"></i>';

    // CSS direto para design equilibrado - inspirado em botões de ação
    Object.assign(whatsappIcon.style, {
      position: 'absolute',
      right: '10px',
      top: '50%',
      transform: 'translateY(-50%)',
      cursor: 'pointer',
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5f5f5',
      color: '#888',
      fontSize: '14px',
      zIndex: '100',
      transition: 'all 0.2s ease',
      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
      border: '1px solid #ddd'
    });

    // Efeito de hover
    whatsappIcon.addEventListener('mouseenter', function() {
      if (input.dataset.whatsapp !== 'true') {
        this.style.background = '#e9e9e9';
        this.style.boxShadow = '0 2px 3px rgba(0,0,0,0.15)';
      }
    });

    whatsappIcon.addEventListener('mouseleave', function() {
      if (input.dataset.whatsapp !== 'true') {
        this.style.background = '#f5f5f5';
        this.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)';
      }
    });

    // Configurar estado inicial e data attribute
    input.dataset.whatsapp = 'false';

    // Adicionar o ícone ao container
    input.parentElement.appendChild(whatsappIcon);

    // Configurar padding para não sobrepor o texto
    input.style.paddingRight = '40px';

    // Adicionar evento de clique com handler robusto
    whatsappIcon.addEventListener('click', function(e) {
      e.stopPropagation();
      e.preventDefault();

      // Alternar estado de WhatsApp
      const currentState = input.dataset.whatsapp === 'true';
      const newState = !currentState;

      // Atualizar data attribute
      input.dataset.whatsapp = newState ? 'true' : 'false';

      // Atualização visual - equilibrada mas identificável
      if (newState) {
        // Estado ativo: estilo mais evidente sem ser exagerado
        Object.assign(whatsappIcon.style, {
          backgroundColor: '#25D366', // Verde WhatsApp reconhecível
          color: 'white',
          transform: 'translateY(-50%)',
          boxShadow: '0 2px 4px rgba(37, 211, 102, 0.3)',
          border: '1px solid #20b559'
        });

        // Usar apenas o ícone limpo com um check pequeno integrado
        whatsappIcon.innerHTML = '<i class="fab fa-whatsapp"></i>';

        // Adicionar um sutil indicador visual - uma borda brilhante em vez da bolinha
        whatsappIcon.style.boxShadow = '0 0 0 2px rgba(255,255,255,0.7), 0 2px 4px rgba(37, 211, 102, 0.3)';
      } else {
        // Estado inativo
        Object.assign(whatsappIcon.style, {
          backgroundColor: '#f5f5f5',
          color: '#888',
          transform: 'translateY(-50%)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
          border: '1px solid #ddd'
        });

        // Remover badge
        whatsappIcon.innerHTML = '<i class="fab fa-whatsapp"></i>';
      }

      whatsappIcon.title = newState ? 'Este é um número de WhatsApp (clique para desmarcar)' : 'Marcar como WhatsApp';
    });

    // Tooltip inicial
    whatsappIcon.title = 'Marcar como WhatsApp';

    return whatsappIcon;
  },

  /**
   * Permite apenas números no campo
   * @param {HTMLInputElement} input - Campo de entrada
   */
  onlyNumbers: function(input) {
    input.value = input.value.replace(/\D/g, '');
  },

  /**
   * Formata valor monetário no formato R$ 0,00
   * @param {HTMLInputElement} input - Campo de entrada do valor monetário
   */
  currency: function(input) {
    let value = input.value.replace(/\D/g, '');
    value = (parseInt(value) / 100).toFixed(2) + '';
    value = value.replace(".", ",");
    value = value.replace(/(\d)(\d{3})(\,)/g, "$1.$2$3");
    value = value.replace(/(\d)(\d{3})(\.\d{3})/g, "$1.$2$3");
    input.value = 'R$ ' + value;
  },

  /**
   * Formata nomes próprios (primeira letra maiúscula)
   * @param {HTMLInputElement} input - Campo de entrada do nome
   */
  properName: function(input) {
    // Lista de palavras que devem permanecer em minúsculo
    const excecoes = ['de', 'da', 'do', 'das', 'dos', 'e', 'em', 'para', 'por', 'com'];

    // Obter o texto e dividir em palavras
    let texto = input.value.toLowerCase().trim();
    if (!texto) return;

    // Dividir o texto em palavras
    let palavras = texto.split(' ');

    // Processar cada palavra
    for (let i = 0; i < palavras.length; i++) {
      const palavra = palavras[i];

      // Pular palavras vazias
      if (!palavra) continue;

      // Sempre colocar a primeira palavra com inicial maiúscula
      // ou palavras que não estão na lista de exceções
      if (i === 0 || !excecoes.includes(palavra)) {
        palavras[i] = palavra.charAt(0).toUpperCase() + palavra.slice(1);
      }
    }

    // Juntar as palavras novamente
    input.value = palavras.join(' ');
  },

  /**
   * Formata UF para aceitar apenas letras e converter para maiúsculo
   * @param {HTMLInputElement} input - Campo de entrada da UF
   */
  uf: function(input) {
    // Remove qualquer caractere que não seja letra
    let value = input.value.replace(/[^A-Za-z]/g, '');

    // Converte para maiúsculo (reforçando, mesmo que o campo já tenha a classe uppercase)
    value = value.toUpperCase();

    // Limitar a 2 caracteres (redundante com maxlength, mas para garantir)
    if (value.length > 2) value = value.substring(0, 2);

    input.value = value;
  },

  /**
   * Formata um valor monetário no padrão brasileiro (R$)
   * @param {HTMLInputElement} input - Campo de entrada do valor
   */
  money: function(input) {
    if (!input) return;

    // Salvar a posição do cursor
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const oldLength = input.value.length;

    // Remove tudo que não for número
    let value = input.value.replace(/\D/g, '');    // Converter para número e formatar
    if (value) {
      // Converte para reais (somente valor inteiro)
      value = parseInt(value);

      // Formata para moeda brasileira sem casas decimais
      value = value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      });
    } else {
      value = '';
    }

    // Atualiza o campo
    input.value = value;

    // Recalcula e restaura a posição do cursor
    if (oldLength < input.value.length) {
      const diff = input.value.length - oldLength;
      input.setSelectionRange(start + diff, end + diff);
    } else {
      input.setSelectionRange(start, end);
    }
  }
};

/**
 * Módulo de validação de dados
 */
FIAP.validation = {
  /**
   * Valida CPF em tempo real mostrando feedback visual
   * @param {HTMLInputElement} input - Campo de entrada do CPF
   */
  cpfRealTime: function(input) {
    const cpf = input.value.replace(/\D/g, '');
    const parentDiv = input.parentElement;

    // Remover ícones e status anteriores
    this.removeValidationIcon(input);

    // Validação progressiva
    if (cpf.length === 0) {
      // Campo vazio - remover qualquer indicação
      input.classList.remove('cpf-valid', 'cpf-invalid', 'cpf-validating');

      // Remover qualquer estilo de validação do parent que possa estar afetando a label
      parentDiv.classList.remove('invalid-parent', 'valid-parent');

      // Garantir que a label mantenha sua cor original
      const label = parentDiv.querySelector('label');
      if (label) {
        label.classList.remove('text-red-500', 'text-white');
        label.classList.add('text-gray-700'); // Cor padrão para labels
      }

      this.removeValidationMessage(parentDiv);
      return;
    } else if (cpf.length < 11) {
      // CPF incompleto - sempre remove status de erro/sucesso quando volta a ser incompleto
      input.classList.remove('cpf-valid', 'cpf-invalid');
      input.classList.add('cpf-validating');

      // Usar ícone de digitação (keyboard) com cor azul para indicar digitação em andamento
      this.addValidationIcon(input, 'keyboard', 'text-blue-500');
      this.showValidationMessage(parentDiv, `Digite os ${11-cpf.length} dígitos restantes`, 'info');
      return;
    }

    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) {
      input.classList.remove('cpf-validating', 'cpf-valid');
      input.classList.add('cpf-invalid');
      this.addValidationIcon(input, 'times-circle', 'text-red-500');
      this.showValidationMessage(parentDiv, 'CPF inválido', 'error');
      return;
    }

    // Validação do primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = sum % 11;
    let digit1 = remainder < 2 ? 0 : 11 - remainder;

    // Validação do segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = sum % 11;
    let digit2 = remainder < 2 ? 0 : 11 - remainder;

    // Verificar se os dígitos calculados são iguais aos dígitos informados
    const isValid = (parseInt(cpf.charAt(9)) === digit1 && parseInt(cpf.charAt(10)) === digit2);

    if (isValid) {
      // CPF válido
      input.classList.remove('cpf-validating', 'cpf-invalid');
      input.classList.add('cpf-valid');
      this.addValidationIcon(input, 'check-circle', 'text-green-500');
      this.showValidationMessage(parentDiv, 'CPF válido', 'success');
    } else {
      // CPF inválido
      input.classList.remove('cpf-validating', 'cpf-valid');
      input.classList.add('cpf-invalid');
      this.addValidationIcon(input, 'times-circle', 'text-red-500');
      this.showValidationMessage(parentDiv, 'Dígitos verificadores incorretos', 'error');
    }
  },

  /**
   * Valida data de nascimento em tempo real
   * @param {HTMLInputElement} input - Campo de entrada da data
   */
  dateOfBirthRealTime: function(input) {
    const dateValue = input.value;
    const parentDiv = input.parentElement;

    // Remover ícones e status anteriores
    this.removeValidationIcon(input);

    // Verificar se está vazio
    if (!dateValue || dateValue.length === 0) {
      input.classList.remove('date-valid', 'date-invalid', 'date-validating');
      this.removeValidationMessage(parentDiv);
      return;
    }

    // Se ainda não está no formato completo (DD/MM/AAAA)
    if (dateValue.length < 10) {
      input.classList.remove('date-valid', 'date-invalid');
      input.classList.add('date-validating');
      this.addValidationIcon(input, 'keyboard', 'text-blue-500');
      this.showValidationMessage(parentDiv, `Continue digitando...`, 'info');
      return;
    }

    // Fazer o parse da data
    const parts = dateValue.split('/');
    if (parts.length !== 3) {
      input.classList.remove('date-validating', 'date-valid');
      input.classList.add('date-invalid');
      this.addValidationIcon(input, 'times-circle', 'text-red-500');
      this.showValidationMessage(parentDiv, 'Data em formato inválido', 'error');
      return;
    }

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);

    // Verificar valores básicos
    if (month < 1 || month > 12) {
      input.classList.remove('date-validating', 'date-valid');
      input.classList.add('date-invalid');
      this.addValidationIcon(input, 'times-circle', 'text-red-500');
      this.showValidationMessage(parentDiv, 'Mês inválido', 'error');
      return;
    }

    // Verificar dias por mês
    const daysInMonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    // Ajuste para ano bissexto
    if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
      daysInMonth[2] = 29;
    }

    if (day < 1 || day > daysInMonth[month]) {
      input.classList.remove('date-validating', 'date-valid');
      input.classList.add('date-invalid');
      this.addValidationIcon(input, 'times-circle', 'text-red-500');
      this.showValidationMessage(parentDiv, 'Dia inválido para este mês', 'error');
      return;
    }

    // Verificar se é uma data no futuro
    const currentDate = new Date();
    const inputDate = new Date(year, month - 1, day);

    if (inputDate > currentDate) {
      input.classList.remove('date-validating', 'date-valid');
      input.classList.add('date-invalid');
      this.addValidationIcon(input, 'times-circle', 'text-red-500');
      this.showValidationMessage(parentDiv, 'Data não pode ser no futuro', 'error');
      return;
    }

    // Verificar se não é uma data muito antiga (150 anos atrás)
    const minDate = new Date();
    minDate.setFullYear(currentDate.getFullYear() - 150);

    if (inputDate < minDate) {
      input.classList.remove('date-validating', 'date-valid');
      input.classList.add('date-invalid');
      this.addValidationIcon(input, 'times-circle', 'text-red-500');
      this.showValidationMessage(parentDiv, 'Data muito antiga', 'error');
      return;
    }

    // Validar se a pessoa é maior de idade (opcional, comentado)
    /*
    const adultDate = new Date();
    adultDate.setFullYear(currentDate.getFullYear() - 18);

    if (inputDate > adultDate) {
      input.classList.remove('date-validating');
      input.classList.remove('date-invalid');
      input.classList.add('date-valid');
      this.addValidationIcon(input, 'exclamation-triangle', 'text-amber-500');
      this.showValidationMessage(parentDiv, 'Pessoa menor de idade', 'warning');
      return;
    }
    */

    // Tudo ok
    input.classList.remove('date-validating', 'date-invalid');
    input.classList.add('date-valid');
    this.addValidationIcon(input, 'check-circle', 'text-green-500');
    this.showValidationMessage(parentDiv, 'Data válida', 'success');

    // Calcular idade se necessário
    if (input.dataset.targetAge) {
      FIAP.calculation.age(input.value, input.dataset.targetAge);
    }
  },

  /**
   * Valida data de nascimento quando o campo perde o foco
   * @param {HTMLInputElement} input - Campo de entrada da data
   * @returns {boolean} - Indica se a data é válida
   */
  dateOfBirth: function(input) {
    // Executar a validação em tempo real para garantir feedback consistente
    this.dateOfBirthRealTime(input);

    // Verificar se o campo está marcado como válido
    return input.classList.contains('date-valid');
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
   * Exibe mensagem de validação abaixo do campo
   * @param {HTMLElement} parentDiv - Elemento pai onde a mensagem será exibida
   * @param {string} message - Mensagem a ser exibida
   * @param {string} type - Tipo de mensagem: 'error', 'success', 'info', 'warning'
   */
  showValidationMessage: function(parentDiv, message, type = 'info') {
    this.removeValidationMessage(parentDiv);

    const messageDiv = document.createElement('div');
    messageDiv.className = `validation-message text-xs ${type === 'error' ? 'text-red-500' :
                                                      type === 'success' ? 'text-green-500' :
                                                      type === 'warning' ? 'text-amber-500' : 'text-blue-500'}`;
    messageDiv.innerHTML = message;

    // Estilo minimalista para a mensagem
    messageDiv.style.marginTop = "1px";
    messageDiv.style.paddingLeft = "2px";
    messageDiv.style.background = "transparent";
    messageDiv.style.position = "absolute";
    messageDiv.style.left = "0";
    messageDiv.style.bottom = "-16px"; // Ajuste fino para ficar próximo ao campo
    messageDiv.style.fontWeight = "normal"; // Garantir que não seja em negrito

    // Adicionar a mensagem após o campo de entrada
    parentDiv.appendChild(messageDiv);
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
   * Valida CPF quando o campo perde o foco
   * @param {HTMLInputElement} input - Campo de entrada do CPF
   * @returns {boolean} - Indica se o CPF é válido
   */
  cpf: function(input) {
    // Se o campo estiver vazio, limpar todos os estados de validação
    if (input.value.trim() === '' || input.value.replace(/\D/g, '') === '') {
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
      this.removeValidationMessage(input.parentElement);

      // Remover qualquer estilo de borda no input
      input.style.borderColor = '';

      // Garantir que o campo não tenha borda vermelha
      input.classList.remove('field-invalid');
      input.classList.remove('cpf-invalid');

      return true; // Campo vazio não é considerado erro
    }

    // Se não estiver vazio, executar a validação normal
    this.cpfRealTime(input);
    return input.classList.contains('cpf-valid');
  }
};

/**
 * Módulo de cálculos e operações com dados
 */
FIAP.calculation = {
  /**
   * Calcula idade a partir da data de nascimento
   * @param {string} dataNascimento - Data de nascimento no formato DD/MM/YYYY
   * @param {string} idadeElementId - ID do elemento para exibir a idade
   */
  age: function(dataNascimento, idadeElementId) {
    const idadeInput = document.getElementById(idadeElementId);
    if (!idadeInput) return;

    const partes = dataNascimento.split('/');
    if (partes.length === 3) {
      const dataNasc = new Date(partes[2], partes[1] - 1, partes[0]);
      const hoje = new Date();

      // Validar se a data é válida antes de calcular
      if (isNaN(dataNasc.getTime())) {
        idadeInput.value = "Data inválida";
        idadeInput.classList.add('field-invalid');
        return;
      }

      // Verificar se a data não é futura
      if (dataNasc > hoje) {
        idadeInput.value = "Data no futuro";
        idadeInput.classList.add('field-invalid');
        // Remover tag existente
        const parentElement = idadeInput.parentElement;
        const existingTag = parentElement.querySelector('.age-classification-tag');
        if (existingTag) existingTag.remove();
        return;
      }

      // Verificar se a data não é muito antiga (limite de 120 anos)
      const limiteIdade = new Date();
      limiteIdade.setFullYear(hoje.getFullYear() - 120);
      if (dataNasc < limiteIdade) {
        idadeInput.value = "Mais de 120 anos";
        idadeInput.classList.add('field-invalid');

        // Adicionar tag de erro
        const parentElement = idadeInput.parentElement;

        // Remover tag existente
        const existingTag = parentElement.querySelector('.age-classification-tag');
        if (existingTag) existingTag.remove();

        // Criar tag de erro
        const tagElement = document.createElement('span');
        tagElement.className = 'age-classification-tag relationship-tag';
        tagElement.setAttribute('data-value', 'error');
        tagElement.setAttribute('data-selected', 'error');
        tagElement.innerText = 'Idade inválida';
        tagElement.title = 'A idade ultrapassou o limite de 120 anos';
        tagElement.style.position = 'absolute';
        tagElement.style.right = '12px';
        tagElement.style.top = '0';
        tagElement.style.transform = 'translateY(-50%)';
        tagElement.style.zIndex = '10';
        tagElement.style.backgroundColor = '#ef4444';
        parentElement.appendChild(tagElement);

        return;
      }

      // Calcular diferença em anos
      let idadeAnos = hoje.getFullYear() - dataNasc.getFullYear();

      // Calcular diferença em meses
      let idadeMeses = hoje.getMonth() - dataNasc.getMonth();

      // Ajustar se ainda não chegou no dia do mês do aniversário
      if (hoje.getDate() < dataNasc.getDate()) {
        idadeMeses--;
      }

      // Ajustar os meses e anos se necessário
      if (idadeMeses < 0) {
        idadeMeses += 12;
        idadeAnos--;
      }

      // Verificar se idade é negativa (caso de erro na entrada da data)
      if (idadeAnos < 0 || (idadeAnos === 0 && idadeMeses < 0)) {
        idadeInput.value = "Idade negativa";
        idadeInput.classList.add('field-invalid');

        // Remover tag existente
        const parentElement = idadeInput.parentElement;
        const existingTag = parentElement.querySelector('.age-classification-tag');
        if (existingTag) existingTag.remove();
        return;
      }

      // Formatação da idade para mostrar anos e meses
      let idadeFormatada = idadeAnos + " anos";
      if (idadeMeses > 0) {
        idadeFormatada += " e " + idadeMeses + " meses";
      }

      // Definir valor da idade no campo correspondente
      idadeInput.value = idadeFormatada;
      idadeInput.classList.remove('field-invalid');
      idadeInput.classList.add('field-valid');

      // Adicionar tag apenas no campo idade
      this.addAgeClassificationTag(idadeAnos, idadeMeses, idadeInput);
    }
  },

  /**
   * Adiciona uma tag indicando a classificação etária judicial
   * @param {number} anos - Idade em anos
   * @param {number} meses - Idade em meses
   * @param {HTMLElement} targetInput - Campo onde adicionar a tag (opcional)
   */
  addAgeClassificationTag: function(anos, meses, targetInput) {
    try {
      // Validar se a idade é válida antes de prosseguir
      if (anos < 0 || anos > 120) {
        console.error("Idade fora dos limites válidos:", anos);
        return null;
      }

      // Buscar o campo de idade se não fornecido explicitamente
      const input = targetInput || document.querySelector('input[id^="idade"]');
      if (!input) return;

      const parentElement = input.parentElement;
      if (!parentElement) return;

      // Remover tag anterior se existir
      const existingTag = parentElement.querySelector('.age-classification-tag');
      if (existingTag) existingTag.remove();

      // Determinar a classificação com base na idade
      let classificacao = '';
      let tipoClassificacao = '';

      if (anos === 0 && meses < 1) {
        classificacao = 'Nascituro';
        tipoClassificacao = 'nascituro';
      } else if (anos < 7) {
        classificacao = 'Infante';
        tipoClassificacao = 'infante';
      } else if (anos < 12) {
        classificacao = 'Impúbere';
        tipoClassificacao = 'impubere';
      } else if (anos < 16) {
        classificacao = 'Púbere';
        tipoClassificacao = 'pubere';
      } else if (anos < 18) {
        classificacao = 'Rel. Incapaz';
        tipoClassificacao = 'rel-incapaz';
      } else if (anos >= 60) {
        classificacao = 'Idoso';
        tipoClassificacao = 'idoso';
      } else {
        classificacao = 'Capaz';
        tipoClassificacao = 'capaz';
      }

      // Criar a tag usando o mesmo padrão das tags de relacionamento
      const tagElement = document.createElement('span');

      // Aplicar a mesma estrutura de classes das tags de relacionamento
      tagElement.className = 'age-classification-tag relationship-tag';

      // Adicionar atributos de dados para estilo consistente com as tags de relacionamento
      tagElement.setAttribute('data-value', tipoClassificacao);
      tagElement.setAttribute('data-selected', tipoClassificacao);

      // Texto da tag
      tagElement.innerText = classificacao;

      // Tooltip com detalhes
      tagElement.title = `Classificação: ${classificacao} (${anos} anos e ${meses} meses)`;

      // Posicionamento consistente com as tags de relacionamento
      tagElement.style.position = 'absolute';
      tagElement.style.right = '12px';
      tagElement.style.top = '0';
      tagElement.style.transform = 'translateY(-50%)';
      tagElement.style.zIndex = '10';

      // Garantir posicionamento relativo no container
      parentElement.style.position = 'relative';

      // Adicionar a tag ao container
      parentElement.appendChild(tagElement);

      return tagElement;
    } catch (error) {
      console.error("Erro ao adicionar tag de classificação etária:", error);
      return null;
    }
  }
};

/**
 * Módulo para operações de API e serviços externos
 */
FIAP.api = {
  /**
   * Consulta CEP na API ViaCEP e preenche campos de endereço
   * @param {string} cep - CEP a ser consultado
   */
  consultarCEP: function(cep) {
    cep = cep.replace(/\D/g, '');
    if (cep.length !== 8) return;

    const cepInput = document.getElementById('cep');
    const parentDiv = cepInput.parentElement;

    // Remover classes de validação e ícones anteriores
    cepInput.classList.remove('cep-valid', 'cep-invalid');
    FIAP.validation.removeValidationIcon(cepInput);

    // Feedback visual de carregamento com ícone de spinner
    FIAP.validation.addValidationIcon(cepInput, 'spinner', 'text-blue-500 fa-spin');

    // Remover mensagem de validação anterior
    const prevMessage = parentDiv.querySelector('.validation-message');
    if (prevMessage) prevMessage.remove();

    fetch(`https://viacep.com.br/ws/${cep}/json/`)
      .then(response => {
        // Verificar se a resposta foi bem-sucedida
        if (!response.ok) {
          throw new Error('Erro ao consultar o CEP. Verifique sua conexão com a internet.');
        }
        return response.json();
      })
      .then(data => {
        // Remover ícone de carregamento
        FIAP.validation.removeValidationIcon(cepInput);

        if (data.erro) {
          // CEP inválido ou não encontrado
          cepInput.classList.add('cep-invalid');
          FIAP.validation.addValidationIcon(cepInput, 'times-circle', 'text-red-500');
          FIAP.validation.showValidationMessage(parentDiv, 'CEP não encontrado. Verifique o número.', 'error');
          return;
        }

        // CEP válido - feedback visual verde
        cepInput.classList.add('cep-valid');
        FIAP.validation.addValidationIcon(cepInput, 'check-circle', 'text-green-500');
        FIAP.validation.showValidationMessage(parentDiv, 'CEP encontrado com sucesso!', 'success');

        // Preencher campos de endereço
        document.getElementById('bairro').value = data.bairro || '';
        document.getElementById('cidade').value = data.localidade || '';
        document.getElementById('uf').value = data.uf || '';
        document.getElementById('endereco').value = data.logradouro || '';

        // Focar campo de número após preenchimento
        if (data.logradouro) {
          document.getElementById('numero').focus();
        }

        // Remover feedback visual depois de 5 segundos (aumentado para melhor visibilidade)
        setTimeout(() => {
          FIAP.validation.removeValidationMessage(parentDiv);
          FIAP.validation.removeValidationIcon(cepInput);
          // Manter a classe de validação para referência visual
        }, 5000);
      })
      .catch(error => {
        // Remover ícone de carregamento
        FIAP.validation.removeValidationIcon(cepInput);

        // Erro na consulta
        cepInput.classList.add('cep-invalid');
        FIAP.validation.addValidationIcon(cepInput, 'exclamation-triangle', 'text-amber-500');
        FIAP.validation.showValidationMessage(parentDiv, 'Erro ao consultar CEP. ' + error.message, 'error');
      });
  }
};

/**
 * Módulo de navegação entre telas/passos
 */
FIAP.navigation = {
  /**
   * Armazena o histórico de navegação entre passos
   */
  history: [],

  /**
   * Navega para um passo específico
   * @param {string} step - ID do passo para navegação
   * @param {boolean} addToHistory - Se deve adicionar ao histórico
   */
  navigateToStep: function(step, addToHistory = true) {
    if (!step) return;

    // Ocultar todos os passos
    const steps = document.querySelectorAll('.step-content');
    steps.forEach(s => s.classList.add('hidden'));

    // Mostrar o passo solicitado
    const targetStep = document.getElementById(step);
    if (targetStep) {
      targetStep.classList.remove('hidden');

      // Adicionar ao histórico se necessário
      if (addToHistory) {
        this.history.push(step);
      }

      // Disparar evento de mudança de passo
      document.dispatchEvent(new CustomEvent('stepChanged', {
        detail: { step: step }
      }));
    }
  },

  /**
   * Navega para o passo anterior no histórico
   * @returns {boolean} - Indica se a navegação foi bem-sucedida
   */
  navigateToPreviousStep: function() {
    // Remover o passo atual (último)
    if (this.history.length > 1) {
      this.history.pop();

      // Navegar para o passo anterior sem adicionar ao histórico
      const previousStep = this.history[this.history.length - 1];
      this.navigateToStep(previousStep, false);
      return true;
    }

    // Se não há histórico suficiente, voltar para o início
    if (this.history.length === 1) {
      this.navigateToStep('personal', false);
      this.history = ['personal'];
      return true;
    }

    return false;
  }
};

/**
 * Módulo de interface do usuário
 */
FIAP.ui = {
  /**
   * Configuração global para etiquetas de status
   */
  statusConfig: {
    success: { icon: 'check-circle', defaultTimeout: 3000 },
    error: { icon: 'exclamation-circle', defaultTimeout: 0 },
    warning: { icon: 'exclamation-triangle', defaultTimeout: 5000 },
    info: { icon: 'info-circle', defaultTimeout: 4000 }
  },

  /**
   * Destaca campos preenchidos para feedback visual ao usuário
   */
  highlightFields: function() {
    const campos = document.querySelectorAll('input:not([readonly]):not([type="hidden"]):not([type="button"]):not([type="submit"]), select, textarea, input[id^="idade"]');

    campos.forEach(campo => {
      if (campo.value.trim() !== '') {
        campo.classList.add('field-filled');
        campo.classList.remove('bg-gray-50');

        // Adicionar classe preenchida também para inputs de CID e doença
        if (campo.classList.contains('cid-input') || campo.classList.contains('doenca-input')) {
          campo.classList.add('filled');
        }

        // Encontrar o label associado e garantir que seja visível
        const label = campo.parentElement.querySelector('.input-label');
        if (label && label.classList.contains('text-transparent')) {
          label.classList.remove('text-transparent');
          label.classList.add('text-gray-700');
        }

        // Disparar evento para notificar mudança de estado
        campo.dispatchEvent(new Event('field-highlight', { bubbles: true }));
      } else {
        campo.classList.remove('field-filled', 'filled');
        campo.classList.add('bg-gray-50');
      }
    });
  },

  /**
   * Configura o monitoramento de campos para destacar os preenchidos
   */
  setupFieldHighlighting: function() {
    document.addEventListener('input', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
        // Pequeno timeout para garantir que o valor foi processado (máscaras, etc)
        setTimeout(() => this.highlightFields(), 50);
      }
    });

    // Destacar campos inicialmente preenchidos
    this.highlightFields();
  },

  /**
   * Cria uma etiqueta de status padronizada
   * @param {string} message - Mensagem a ser exibida
   * @param {string} type - Tipo de etiqueta: success, error, warning, info
   * @param {string} icon - Ícone Font Awesome (sem o 'fa-')
   * @param {Element} container - Elemento onde a etiqueta será adicionada
   * @param {number} timeout - Tempo em ms para remover a etiqueta (0 para não remover)
   * @returns {Element} - O elemento de etiqueta criado
   */
  createStatusTag: function(message, type = 'info', icon = null, container, timeout = null) {
    // Usar configuração padrão baseada no tipo
    const config = this.statusConfig[type] || this.statusConfig.info;

    // Usar ícone específico ou o padrão para o tipo
    const iconClass = icon || config.icon;

    // Usar timeout específico ou o padrão para o tipo
    const finalTimeout = timeout !== null ? timeout : config.defaultTimeout;

    // Remover etiquetas anteriores do mesmo tipo no container
    this.removeStatusTags(container, type);

    // Criar elemento da etiqueta
    const statusTag = document.createElement('span');
    statusTag.className = `status-tag ${type}`;
    statusTag.innerHTML = `<i class="fas fa-${iconClass}"></i> ${message}`;

    // Adicionar etiqueta ao container
    if (container) {
      container.appendChild(statusTag);
    }

    // Configurar remoção automática após timeout
    if (finalTimeout > 0) {
      setTimeout(() => {
        if (statusTag.parentElement) {
          statusTag.remove();
        }
      }, finalTimeout);
    }

    return statusTag;
  },

  /**
   * Remove etiquetas de status de um container
   * @param {Element} container - O container das etiquetas
   * @param {string} type - Tipo específico a remover (opcional)
   */
  removeStatusTags: function(container, type = null) {
    if (!container) return;

    const selector = type ?
      `.status-tag.${type}` :
      '.status-tag';

    const tags = container.querySelectorAll(selector);
    tags.forEach(tag => tag.remove());
  },

  /**
   * Cria uma etiqueta de sucesso
   * @param {string} message - Mensagem de sucesso
   * @param {Element} container - Container para adicionar a etiqueta
   * @param {number} timeout - Tempo para remover automaticamente (ms)
   * @returns {Element} - O elemento de etiqueta criado
   */
  showSuccess: function(message, container, timeout = null) {
    return this.createStatusTag(message, 'success', null, container, timeout);
  },

  /**
   * Cria uma etiqueta de erro
   * @param {string} message - Mensagem de erro
   * @param {Element} container - Container para adicionar a etiqueta
   * @param {number} timeout - Tempo para remover automaticamente (ms)
   * @returns {Element} - O elemento de etiqueta criado
   */
  showError: function(message, container, timeout = null) {
    return this.createStatusTag(message, 'error', null, container, timeout);
  },

  /**
   * Cria uma etiqueta de aviso
   * @param {string} message - Mensagem de aviso
   * @param {Element} container - Container para adicionar a etiqueta
   * @param {number} timeout - Tempo para remover automaticamente (ms)
   * @returns {Element} - O elemento de etiqueta criado
   */
  showWarning: function(message, container, timeout = null) {
    return this.createStatusTag(message, 'warning', null, container, timeout);
  },

  /**
   * Cria uma etiqueta de informação
   * @param {string} message - Mensagem informativa
   * @param {Element} container - Container para adicionar a etiqueta
   * @param {number} timeout - Tempo para remover automaticamente (ms)
   * @returns {Element} - O elemento de etiqueta criado
   */
  showInfo: function(message, container, timeout = null) {
    return this.createStatusTag(message, 'info', null, container, timeout);
  }
};

// Aliases para compatibilidade com código legado
// Estes aliases mantêm a retrocompatibilidade enquanto promovem o novo padrão
window.maskCPF = FIAP.masks.cpf;
window.validateCPF = FIAP.validation.cpf.bind(FIAP.validation);
window.validateCPFRealTime = FIAP.validation.cpfRealTime.bind(FIAP.validation);
window.maskCEP = FIAP.masks.cep;
window.consultarCEP = FIAP.api.consultarCEP;
window.maskDate = FIAP.masks.date;
window.validateDateOfBirth = FIAP.validation.dateOfBirth.bind(FIAP.validation);
window.validateDateOfBirthRealTime = FIAP.validation.dateOfBirthRealTime.bind(FIAP.validation);
window.calcularIdade = FIAP.calculation.age;
window.maskPhone = FIAP.masks.phone;
window.maskOnlyNumbers = FIAP.masks.onlyNumbers;
window.maskCurrency = FIAP.masks.currency;
window.destacarCamposPreenchidos = FIAP.ui.highlightFields.bind(FIAP.ui);
window.setupFieldHighlighting = FIAP.ui.setupFieldHighlighting.bind(FIAP.ui);
window.FIAP = FIAP;
window.addAgeClassificationTag = FIAP.calculation.addAgeClassificationTag;
window.navigateToPreviousStep = FIAP.navigation.navigateToPreviousStep.bind(FIAP.navigation);
window.navigateToStep = FIAP.navigation.navigateToStep.bind(FIAP.navigation);
window.createInfoTag = FIAP.ui.showInfo.bind(FIAP.ui);
window.createWarningTag = FIAP.ui.showWarning.bind(FIAP.ui);
window.createErrorTag = FIAP.ui.showError.bind(FIAP.ui);
window.createSuccessTag = FIAP.ui.showSuccess.bind(FIAP.ui);
window.showInfo = FIAP.ui.showInfo.bind(FIAP.ui);
window.showWarning = FIAP.ui.showWarning.bind(FIAP.ui);
window.showError = FIAP.ui.showError.bind(FIAP.ui);
window.showSuccess = FIAP.ui.showSuccess.bind(FIAP.ui);
window.removeStatusTags = FIAP.ui.removeStatusTags.bind(FIAP.ui);
window.createStatusTag = FIAP.ui.createStatusTag.bind(FIAP.ui);
window.maskUF = FIAP.masks.uf;
window.formatarNomeProprio = FIAP.masks.properName;
window.maskMoney = FIAP.masks.money;

// Função auxiliar para formatar moeda sem precisar de input
FIAP.utils = FIAP.utils || {};
FIAP.utils.formatMoney = function(value) {
  if (value === undefined || value === null) return 'R$ 0';
  // Arredondar para valor inteiro
  value = Math.round(value);
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
};

/**
 * Obtém o salário mínimo vigente
 * @returns {number} Valor do salário mínimo vigente
 */
FIAP.utils.getSalarioMinimo = function() {
  // Usar o valor do CONFIG
  return CONFIG.financial.minimumWage;
};

// Inicializar após o carregamento do DOM
document.addEventListener('DOMContentLoaded', function() {
  // Verificar se existem campos de idade preenchidos e adicionar as tags etárias
  setTimeout(() => {
    const idadeInputs = document.querySelectorAll('input[id^="idade"]');

    idadeInputs.forEach(input => {
      if (input.value && input.value.includes('anos')) {
        const idadeText = input.value;
        const anosMatch = idadeText.match(/(\d+)\s*anos/);
        const mesesMatch = idadeText.match(/(\d+)\s*meses/);

        const anos = anosMatch ? parseInt(anosMatch[1]) : 0;
        const meses = mesesMatch ? parseInt(mesesMatch[1]) : 0;

        FIAP.calculation.addAgeClassificationTag(anos, meses, input);
      }
    });
  }, 200);

  // Configuração da consulta automática de CEP
  const cepInput = document.getElementById('cep');
  if (cepInput) {
    // Adicionar evento para garantir que máscaras e formatações de CEP não bloqueiem a consulta
    cepInput.addEventListener('blur', function() {
      const cepNumerico = this.value.replace(/\D/g, '');
      if (cepNumerico.length === 8) {
        FIAP.api.consultarCEP(cepNumerico);
      }
    });
  }

  // Inicializar ícones de WhatsApp em todos os campos de telefone existentes
  document.querySelectorAll('input[id*="telefone"], input[id*="phone"], input[name*="telefone"], input[name*="phone"]').forEach(input => {
    setTimeout(() => FIAP.masks.phone(input), 100);
  });

  // INICIALIZAÇÃO APENAS DOS CAMPOS DE TELEFONE PRINCIPAIS
  function initializePhoneFields() {
    // Remover todas as tags antigas de WhatsApp
    document.querySelectorAll('.whatsapp-tag').forEach(tag => tag.remove());

    // Seletor mais específico e restritivo para campos de telefone
    const phoneFields = Array.from(document.querySelectorAll('input')).filter(input => {
      // Excluir explicitamente campos de detalhes/descrições
      if (
        (input.id && (input.id.includes('_detalhes') || input.id.includes('descricao'))) ||
        (input.name && (input.name.includes('_detalhes') || input.name.includes('descricao'))) ||
        (input.placeholder && input.placeholder.includes('descreva'))
      ) {
        return false;
      }

      // Critérios positivos para identificar um campo de telefone principal
      return (
        (input.id && (
          input.id === 'telefone' ||
          input.id.match(/^telefone[0-9]*$/) ||
          input.id.match(/^phone[0-9]*$/)
        )) ||
        (input.name && (
          input.name === 'telefone' ||
          input.name.match(/^telefone[0-9]*$/) ||
          input.name.match(/^phone[0-9]*$/)
        )) ||
        input.type === 'tel' ||
        (input.placeholder && input.placeholder.match(/\(\d{2}\)\s*\d{4,5}-\d{4}/))
      );
    });

    // Aplicar o ícone apenas aos campos específicos de telefone principal
    phoneFields.forEach(phone => {
      FIAP.masks.addWhatsAppIcon(phone);
    });
  }

  // Inicializar os campos após um atraso para garantir renderização completa
  setTimeout(initializePhoneFields, 500);

  // Observar mudanças no DOM para campos adicionados dinamicamente
  const observer = new MutationObserver(mutations => {
    let shouldInitialize = false;

    // Verificar por nodes adicionados que possam ser campos de telefone
    for (let mutation of mutations) {
      if (mutation.addedNodes.length) {
        for (let node of mutation.addedNodes) {
          if (node.nodeType === 1 && (node.tagName === 'INPUT' || node.querySelector && node.querySelector('input'))) {
            shouldInitialize = true;
            break;
          }
        }
      }
    }

    if (shouldInitialize) {
      setTimeout(initializePhoneFields, 100);
    }
  });

  // Iniciar observação com configurações mais específicas
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['id', 'name', 'type', 'placeholder']
  });

  // Desativar qualquer função antiga de toggle WhatsApp
  if (window.toggleWhatsAppTag) {
    window.toggleWhatsAppTag = function() {
      console.log('Antiga função toggleWhatsAppTag substituída');
      return false;
    };
  }
});
