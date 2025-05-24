/**
 * Sistema de utilidades para o FIAP Web App
 * Organizado em namespaces para melhor organização e reutilização.
 */

// Namespace global para o sistema
const FIAP = {};

/**
 * Módulo de mascaramento e validação de dados
 * Utiliza o objeto Mask centralizado
 */
FIAP.masks = {
  /**
   * Formata CPF no formato 000.000.000-00 e valida em tempo real
   * @param {HTMLInputElement} input - Campo de entrada do CPF
   */
  cpf: function(input) {
    // Utiliza a função centralizada
    if (window.Mask && typeof window.Mask.cpf === 'function') {
      window.Mask.cpf(input);
    } else {
      console.warn('FIAP.masks.cpf: Mask.cpf não está disponível');
    }
  },

  /**
   * Formata CEP no formato 00000-000
   * @param {HTMLInputElement} input - Campo de entrada do CEP
   */
  cep: function(input) {
    // Utiliza a função centralizada
    if (window.Mask && typeof window.Mask.cep === 'function') {
      window.Mask.cep(input);
    } else {
      console.warn('FIAP.masks.cep: Mask.cep não está disponível');
    }
  },

  /**
   * Formata data no formato DD/MM/AAAA e valida
   * @param {HTMLInputElement} input - Campo de entrada da data
   */
  date: function(input) {
    // Utiliza a função centralizada
    if (window.Mask && typeof window.Mask.date === 'function') {
      window.Mask.date(input);
    } else {
      console.warn('FIAP.masks.date: Mask.date não está disponível');
    }
  },

  /**
   * Formata telefone no formato (00) 00000-0000 com indicador de WhatsApp
   * @param {HTMLInputElement} input - Campo de entrada do telefone
   */
  phone: function(input) {
    // Utiliza a função centralizada
    if (window.Mask && typeof window.Mask.phone === 'function') {
      window.Mask.phone(input);
    } else {
      console.warn('FIAP.masks.phone: Mask.phone não está disponível');
    }
  },

  /**
   * Adiciona ícone de WhatsApp clicável ao campo de telefone
   * @param {HTMLInputElement} input - Campo de entrada do telefone
   */
  addWhatsAppIcon: function(input) {
    // Utiliza a função centralizada
    if (window.Mask && typeof window.Mask.addWhatsAppIcon === 'function') {
      window.Mask.addWhatsAppIcon(input);
    } else {
      console.warn('FIAP.masks.addWhatsAppIcon: Mask.addWhatsAppIcon não está disponível');
    }
  },

  /**
   * Permite apenas números no campo
   * @param {HTMLInputElement} input - Campo de entrada
   */
  onlyNumbers: function(input) {
    // Utiliza a função centralizada
    if (window.Mask && typeof window.Mask.onlyNumbers === 'function') {
      window.Mask.onlyNumbers(input);
    } else {
      console.warn('FIAP.masks.onlyNumbers: Mask.onlyNumbers não está disponível');
    }
  },

  /**
   * Formata valor monetário no formato R$ 0,00
   * @param {HTMLInputElement} input - Campo de entrada do valor monetário
   */
  money: function(input) {
    // Utiliza a função centralizada
    if (window.Mask && typeof window.Mask.money === 'function') {
      window.Mask.money(input);
    } else {
      console.warn('FIAP.masks.money: Mask.money não está disponível');
    }
  },

  /**
   * Formata UF (sigla de estado) em maiúsculas
   * @param {HTMLInputElement} input - Campo de entrada da UF
   */
  uf: function(input) {
    // Utiliza a função centralizada
    if (window.Mask && typeof window.Mask.uf === 'function') {
      window.Mask.uf(input);
    } else {
      console.warn('FIAP.masks.uf: Mask.uf não está disponível');
    }
  },

  /**
   * Formata nomes próprios (primeira letra maiúscula)
   * @param {HTMLInputElement} input - Campo de entrada do nome
   */
  properName: function(input) {
    // Utiliza a função centralizada
    if (window.Mask && typeof window.Mask.properName === 'function') {
      window.Mask.properName(input);
    } else {
      console.warn('FIAP.masks.properName: Mask.properName não está disponível');
    }
  },

  /**
   * Compatibilidade para funções adicionais
   */
  currency: function(input) {
    // Redireciona para money
    this.money(input);
  }
};

/**
 * Módulo de validação de dados
 * Redireciona para o objeto Check centralizado
 */
FIAP.validation = {
  /**
   * Valida CPF em tempo real mostrando feedback visual
   * @param {HTMLInputElement} input - Campo de entrada do CPF
   */
  cpfRealTime: function(input) {
    // Usar função centralizada
    if (window.Check && typeof window.Check.cpfRealTime === 'function') {
      return window.Check.cpfRealTime(input);
    } else {
      console.warn('FIAP.validation.cpfRealTime: Check.cpfRealTime não está disponível');
      return false;
    }
  },

  /**
   * Valida data de nascimento em tempo real
   * @param {HTMLInputElement} input - Campo de entrada da data
   */
  dateOfBirthRealTime: function(input) {
    // Usar função centralizada
    if (window.Check && typeof window.Check.dateOfBirthRealTime === 'function') {
      return window.Check.dateOfBirthRealTime(input);
    } else {
      console.warn('FIAP.validation.dateOfBirthRealTime: Check.dateOfBirthRealTime não está disponível');
      return false;
    }
  },

  /**
   * Valida data de nascimento quando o campo perde o foco
   * @param {HTMLInputElement} input - Campo de entrada da data
   * @returns {boolean} - Indica se a data é válida
   */
  dateOfBirth: function(input) {
    // Usar função centralizada
    if (window.Check && typeof window.Check.dateOfBirth === 'function') {
      return window.Check.dateOfBirth(input);
    } else {
      console.warn('FIAP.validation.dateOfBirth: Check.dateOfBirth não está disponível');
      return false;
    }
  },

  /**
   * Remove ícone de validação do campo
   * @param {HTMLInputElement} input - Campo de entrada
   */
  removeValidationIcon: function(input) {
    // Usar função centralizada
    if (window.Check && typeof window.Check.removeValidationIcon === 'function') {
      window.Check.removeValidationIcon(input);
    } else {
      console.warn('FIAP.validation.removeValidationIcon: Check.removeValidationIcon não está disponível');
    }
  },

  /**
   * Valida CPF quando o campo perde o foco
   * @param {HTMLInputElement} input - Campo de entrada do CPF
   * @returns {boolean} - Indica se o CPF é válido
   */
  cpf: function(input) {
    // Usar função centralizada
    if (window.Check && typeof window.Check.cpf === 'function') {
      return window.Check.cpf(input);
    } else {
      console.warn('FIAP.validation.cpf: Check.cpf não está disponível');
      return false;
    }
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
      const day = parseInt(partes[0], 10);
      const month = parseInt(partes[1], 10);
      const year = parseInt(partes[2], 10);
      // Validação básica de data
      if (
        isNaN(day) || isNaN(month) || isNaN(year) ||
        year < 1900 || year > new Date().getFullYear() + 1 ||
        month < 1 || month > 12 ||
        day < 1 || day > 31
      ) {
        idadeInput.value = '';
        idadeInput.classList.remove('field-valid', 'field-invalid');
        // Remover tag existente
        const parentElement = idadeInput.parentElement;
        const existingTag = parentElement.querySelector('.age-classification-tag');
        if (existingTag) existingTag.remove();
        return;
      }
      // Validação de dias no mês
      const daysInMonth = [31, (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      if (day > daysInMonth[month - 1]) {
        idadeInput.value = '';
        idadeInput.classList.remove('field-valid', 'field-invalid');
        const parentElement = idadeInput.parentElement;
        const existingTag = parentElement.querySelector('.age-classification-tag');
        if (existingTag) existingTag.remove();
        return;
      }

      // Verificar se a data não é futura
      const hoje = new Date();
      const dataNascimentoFormatada = new Date(year, month - 1, day);
      if (dataNascimentoFormatada > hoje) {
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
      if (dataNascimentoFormatada < limiteIdade) {
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
      let idadeAnos = hoje.getFullYear() - dataNascimentoFormatada.getFullYear();

      // Calcular diferença em meses
      let idadeMeses = hoje.getMonth() - dataNascimentoFormatada.getMonth();

      // Ajustar se ainda não chegou no dia do mês do aniversário
      if (hoje.getDate() < dataNascimentoFormatada.getDate()) {
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
    if (!cepInput) return;

    // Limpar classes de validação anteriores
    cepInput.classList.remove('cep-valid', 'cep-invalid');

    fetch(`https://viacep.com.br/ws/${cep}/json/`)
      .then(response => {
        if (!response.ok) throw new Error('Erro ao consultar o CEP.');
        return response.json();
      })
      .then(data => {
        if (data.erro) {
          cepInput.classList.add('cep-invalid');
          return;
        }
        cepInput.classList.add('cep-valid');
        document.getElementById('bairro').value = data.bairro || '';
        document.getElementById('cidade').value = data.localidade || '';
        document.getElementById('uf').value = data.uf || '';
        document.getElementById('endereco').value = data.logradouro || '';
        if (data.logradouro) {
          document.getElementById('numero').focus();
        }
      })
      .catch(() => {
        cepInput.classList.add('cep-invalid');
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
    // const iconClass = icon || config.icon; // Ícone não é mais usado

    // Usar timeout específico ou o padrão para o tipo
    const finalTimeout = timeout !== null ? timeout : config.defaultTimeout;

    // Remover etiquetas anteriores do mesmo tipo no container
    this.removeStatusTags(container, type);

    // Criar elemento da etiqueta
    const statusTag = document.createElement('span');
    statusTag.className = `status-tag ${type}`;
    statusTag.innerHTML = `${message}`; // Modificado para remover o ícone

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
// Funções de máscara são fornecidas pelo objeto Mask em mask.js
// window.maskCPF = FIAP.masks.cpf;
window.validateCPF = FIAP.validation.cpf.bind(FIAP.validation);
window.validateCPFRealTime = FIAP.validation.cpfRealTime.bind(FIAP.validation);
// window.maskCEP = FIAP.masks.cep;
window.consultarCEP = FIAP.api.consultarCEP;
// window.maskDate = FIAP.masks.date;
window.validateDateOfBirth = FIAP.validation.dateOfBirth.bind(FIAP.validation);
window.validateDateOfBirthRealTime = FIAP.validation.dateOfBirthRealTime.bind(FIAP.validation);
window.calcularIdade = FIAP.calculation.age;
// window.maskPhone = FIAP.masks.phone;
// window.maskOnlyNumbers = FIAP.masks.onlyNumbers;
// window.maskCurrency = FIAP.masks.currency;
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
// window.maskUF = FIAP.masks.uf;
// window.formatarNomeProprio = FIAP.masks.properName;
// window.maskMoney = FIAP.masks.money;

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
    setTimeout(() => {
      if (window.Mask && typeof window.Mask.phone === 'function') {
        window.Mask.phone(input);
      } else {
        console.warn('Função window.Mask.phone não disponível para inicialização de telefone');
      }
    }, 100);
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
      if (window.Mask && typeof window.Mask.addWhatsAppIcon === 'function') {
        window.Mask.addWhatsAppIcon(phone);
      } else {
        console.warn('Função window.Mask.addWhatsAppIcon não disponível para inicialização de telefone');
      }
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

// ==================================================================================
// Funções de Feedback Visual (Alertas, Loading etc.)
// ==================================================================================

/**
 * Mostra um indicador de carregamento global.
 * @param {string} message - A mensagem a ser exibida no indicador.
 */
function showLoadingIndicator(message = 'Carregando...') {
  let loadingOverlay = document.getElementById('loading-overlay');
  if (!loadingOverlay) {
    loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'loading-overlay';
    loadingOverlay.innerHTML = `
      <div class="loading-spinner"></div>
      <p class="loading-message"></p>
    `;
    document.body.appendChild(loadingOverlay);
  }
  loadingOverlay.querySelector('.loading-message').textContent = message;
  loadingOverlay.style.display = 'flex';
  document.body.style.overflow = 'hidden'; // Prevenir scroll da página por baixo
}
window.showLoadingIndicator = showLoadingIndicator;

/**
 * Esconde o indicador de carregamento global.
 */
function hideLoadingIndicator() {
  const loadingOverlay = document.getElementById('loading-overlay');
  if (loadingOverlay) {
    loadingOverlay.style.display = 'none';
  }
  document.body.style.overflow = ''; // Restaurar scroll da página
}
window.hideLoadingIndicator = hideLoadingIndicator;
