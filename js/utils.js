/**
 * Sistema de utilidades para o FIAP Web App
 * Organizado em namespaces para melhor organização e reutilização.
 */

// Namespace global para o sistema
const FIAP = {};

/**
 * Módulo de mascaramento e validação de dados
 */
FIAP.masks = {
  /**
   * Formata CPF no formato 000.000.000-00
   * @param {HTMLInputElement} input - Campo de entrada do CPF
   */
  cpf: function(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 11) value = value.substring(0, 11);

    value = value.replace(/^(\d{3})(\d)/, '$1.$2');
    value = value.replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
    value = value.replace(/\.(\d{3})(\d)/, '.$1-$2');

    input.value = value;
    FIAP.validation.cpf(input);
  },

  /**
   * Formata CEP no formato 00000-000
   * @param {HTMLInputElement} input - Campo de entrada do CEP
   */
  cep: function(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 8) value = value.substring(0, 8);

    if (value.length > 5) {
      value = value.replace(/^(\d{5})(\d)/, '$1-$2');
    }

    input.value = value;

    // Remover classes de validação existentes
    input.classList.remove('cep-valid', 'cep-invalid');

    // Remover mensagem de validação anterior
    const parentDiv = input.parentElement;
    const prevMessage = parentDiv.querySelector('.validation-message');
    if (prevMessage) prevMessage.remove();
  },

  /**
   * Formata data no formato DD/MM/AAAA
   * @param {HTMLInputElement} input - Campo de entrada da data
   */
  date: function(input) {
    let value = input.value.replace(/\D/g, '');

    if (value.length > 8) value = value.substring(0, 8);

    value = value.replace(/^(\d{2})(\d)/, '$1/$2');
    value = value.replace(/^(\d{2})\/(\d{2})(\d)/, '$1/$2/$3');

    input.value = value;

    // Se tiver campo de idade associado, calcular
    if (value.length === 10 && input.dataset.targetAge) {
      FIAP.calculation.age(input.value, input.dataset.targetAge);
    }
  },

  /**
   * Formata telefone no formato (00) 00000-0000
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
  }
};

/**
 * Módulo de validação de dados
 */
FIAP.validation = {
  /**
   * Valida CPF usando algoritmo oficial
   * @param {HTMLInputElement} input - Campo de entrada do CPF
   * @returns {boolean} - Indica se o CPF é válido
   */
  cpf: function(input) {
    let cpf = input.value.replace(/\D/g, '');

    // Remover classes de validação existentes
    input.classList.remove('cpf-valid', 'cpf-invalid');

    // Remover mensagem de validação anterior
    const parentDiv = input.parentElement;
    const prevMessage = parentDiv.querySelector('.validation-message');
    if (prevMessage) prevMessage.remove();

    if (cpf.length !== 11) return false;

    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) return false;

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
      // CPF válido - feedback visual verde
      input.classList.add('cpf-valid');

      // Adicionar mensagem de confirmação com etiqueta de status
      FIAP.ui.showSuccess('CPF válido', parentDiv, 1500);
    } else {
      // CPF inválido - feedback visual vermelho
      input.classList.add('cpf-invalid');

      // Adicionar mensagem de erro com etiqueta de status
      FIAP.ui.showError('CPF inválido', parentDiv);
    }

    return isValid;
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

      // Formatação da idade para mostrar anos e meses
      let idadeFormatada = idadeAnos + " anos";
      if (idadeMeses > 0) {
        idadeFormatada += " e " + idadeMeses + " meses";
      }

      // Definir valor da idade no campo correspondente
      idadeInput.value = idadeFormatada;
    }
  }
};

/**
 * Módulo para operações de armazenamento persistente
 */
FIAP.storage = {
  /**
   * Salva dados no localStorage com prefixo padrão
   * @param {Object} dados - Dados a serem armazenados
   * @returns {string} - Chave gerada para o registro
   */
  save: function(dados) {
    const timestamp = new Date().getTime();
    const chave = `fiap_${timestamp}`;

    localStorage.setItem(chave, JSON.stringify(dados));
    return chave;
  },

  /**
   * Carrega dados do localStorage
   * @param {string} chave - Chave do registro a ser carregado
   * @returns {Object|null} - Dados carregados ou null
   */
  load: function(chave) {
    const dados = localStorage.getItem(chave);
    return dados ? JSON.parse(dados) : null;
  },

  /**
   * Lista todos os registros salvos com o prefixo padrão
   * @returns {Array} - Lista de registros encontrados
   */
  listAll: function() {
    const registros = [];
    for (let i = 0; i < localStorage.length; i++) {
      const chave = localStorage.key(i);
      if (chave.startsWith('fiap_')) {
        const dados = this.load(chave);
        registros.push({chave, dados});
      }
    }
    return registros;
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

    // Feedback visual de carregamento
    cepInput.classList.remove('cep-valid', 'cep-invalid');
    cepInput.style.backgroundImage = "url('data:image/svg+xml;charset=utf8,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"%3E%3Cpath fill=\"%232563eb\" d=\"M73,50c0-12.7-10.3-23-23-23S27,37.3,27,50 M30.9,50c0-10.5,8.5-19.1,19.1-19.1S69.1,39.5,69.1,50\"%3E%3CanimateTransform attributeName=\"transform\" attributeType=\"XML\" type=\"rotate\" dur=\"1s\" from=\"0 50 50\" to=\"360 50 50\" repeatCount=\"indefinite\" /%3E%3C/path%3E%3C/svg%3E')";
    cepInput.style.backgroundRepeat = "no-repeat";
    cepInput.style.backgroundPosition = "right 10px center";
    cepInput.style.backgroundSize = "20px 20px";

    // Remover mensagem de validação anterior
    const prevMessage = parentDiv.querySelector('.validation-message');
    if (prevMessage) prevMessage.remove();

    fetch(`https://viacep.com.br/ws/${cep}/json/`)
      .then(response => response.json())
      .then(data => {
        // Remover indicador de carregamento
        cepInput.style.backgroundImage = "none";

        if (data.erro) {
          // CEP inválido ou não encontrado
          cepInput.classList.add('cep-invalid');
          FIAP.ui.showError('CEP não encontrado', parentDiv);
          return;
        }

        // CEP válido - feedback visual verde
        cepInput.classList.add('cep-valid');
        FIAP.ui.showSuccess('CEP encontrado', parentDiv, 1500);

        // Preencher campos de endereço
        document.getElementById('bairro').value = data.bairro || '';
        document.getElementById('cidade').value = data.localidade || '';
        document.getElementById('uf').value = data.uf || '';
        document.getElementById('endereco').value = data.logradouro || '';

        // Focar campo de número após preenchimento
        if (data.logradouro) {
          document.getElementById('numero').focus();
        }

        // Remover feedback visual depois de 1.5 segundos
        setTimeout(() => {
          cepInput.classList.remove('cep-valid');
        }, 1500);
      })
      .catch(error => {
        // Remover indicador de carregamento
        cepInput.style.backgroundImage = "none";

        // Erro na consulta
        cepInput.classList.add('cep-invalid');
        FIAP.ui.showError('Erro ao consultar CEP', parentDiv);
      });
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
window.validateCPF = FIAP.validation.cpf;
window.maskCEP = FIAP.masks.cep;
window.consultarCEP = FIAP.api.consultarCEP;
window.maskDate = FIAP.masks.date;
window.calcularIdade = FIAP.calculation.age;
window.maskPhone = FIAP.masks.phone;
window.maskOnlyNumbers = FIAP.masks.onlyNumbers;
window.maskCurrency = FIAP.masks.currency;
window.destacarCamposPreenchidos = FIAP.ui.highlightFields.bind(FIAP.ui);
window.setupFieldHighlighting = FIAP.ui.setupFieldHighlighting.bind(FIAP.ui);
window.formatarNomeProprio = FIAP.masks.properName;
window.salvarLocalStorage = FIAP.storage.save;
window.carregarLocalStorage = FIAP.storage.load;
window.listarTodosRegistros = FIAP.storage.listAll;
window.createStatusTag = FIAP.ui.createStatusTag.bind(FIAP.ui);
window.removeStatusTags = FIAP.ui.removeStatusTags.bind(FIAP.ui);
window.showSuccess = FIAP.ui.showSuccess.bind(FIAP.ui);
window.showError = FIAP.ui.showError.bind(FIAP.ui);
window.showWarning = FIAP.ui.showWarning.bind(FIAP.ui);
window.showInfo = FIAP.ui.showInfo.bind(FIAP.ui);
window.createSuccessTag = FIAP.ui.showSuccess.bind(FIAP.ui);
window.createErrorTag = FIAP.ui.showError.bind(FIAP.ui);
window.createWarningTag = FIAP.ui.showWarning.bind(FIAP.ui);
window.createInfoTag = FIAP.ui.showInfo.bind(FIAP.ui);

// Exportar namespace FIAP para uso global
window.FIAP = FIAP;
