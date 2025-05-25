/**
 * Sistema centralizado de máscaras para formulários
 * Este arquivo contém todas as funções de máscara utilizadas na aplicação
 */

const Mask = {
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

    // Realizar validação em tempo real se esta funcionalidade estiver disponível
    if ((window.Check && typeof window.Check.cpfRealTime === 'function') &&
        (value.length >= 3 || (value.length > 0 && input.dataset.validated === 'true'))) {
      input.dataset.validated = 'true';
      window.Check.cpfRealTime(input);
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

    // Remover classes de validação e ícones ao editar o CEP
    if (value.length < 8) {
      input.classList.remove('cep-valid', 'cep-invalid');

      // Remover ícone de validação se a função existir
      if (typeof window.removerIconeValidacao === 'function') {
        window.removerIconeValidacao(input);
      }

      // Remover mensagem de validação se a função existir
      if (typeof window.removerMensagemValidacao === 'function') {
        const parentDiv = input.parentElement;
        window.removerMensagemValidacao(parentDiv);
      }
    }

    // Consultar CEP quando completo
    if (value.replace(/\D/g, '').length === 8 && typeof window.consultarCEP === 'function') {
      window.consultarCEP(value);
    }
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

    // Realizar validação em tempo real se disponível
    if (value.length >= 5 && (window.Check && typeof window.Check.dateOfBirthRealTime === 'function')) {
      input.dataset.validated = 'true';
      window.Check.dateOfBirthRealTime(input);
    }

    // Se tiver campo de idade associado, calcular apenas se a data estiver completa
    if (value.length === 10 && input.dataset.targetAge && typeof window.calcularIdade === 'function') {
      window.calcularIdade(input.value, input.dataset.targetAge);
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

    // Garantir que o ícone de WhatsApp seja adicionado
    if (this.whatsappIconsEnabled && typeof this.addWhatsAppIcon === 'function') {
      this.addWhatsAppIcon(input);
    }
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
      zIndex: '1', // Reduzido para não sobrepor a navbar
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
  money: function(input) {
    let value = input.value.replace(/\D/g, '');

    if (value === '') {
      input.value = '';
      return;
    }

    // Converter para centavos e formatar
    value = (parseInt(value) / 100).toFixed(2) + '';
    value = value.replace(".", ",");
    value = value.replace(/(\d)(\d{3})(\,)/g, "$1.$2$3");
    value = value.replace(/(\d)(\d{3})(\.\d{3})/g, "$1.$2$3");
    input.value = 'R$ ' + value;
  },

  /**
   * Formata UF (sigla de estado) em maiúsculas
   * @param {HTMLInputElement} input - Campo de entrada da UF
   */
  uf: function(input) {
    // Certificar que estamos lidando com um campo
    if (!input || !input.value) return;

    // Remover caracteres que não são letras
    let value = input.value.replace(/[^a-zA-Z]/g, '');

    // Limitar a 2 caracteres e converter para maiúsculas
    if (value.length > 2) value = value.substring(0, 2);
    value = value.toUpperCase();

    input.value = value;
  },
  /**
   * Formata nomes próprios em tempo real (primeira letra maiúscula)
   * @param {HTMLInputElement} input - Campo de entrada do nome
   */
  properName: function(input) {
    // Salvar posição do cursor
    const cursorPos = input.selectionStart;
    const cursorEnd = input.selectionEnd;

    // Lista de palavras que devem permanecer em minúsculo
    const excecoes = ['de', 'da', 'do', 'das', 'dos', 'e', 'em', 'para', 'por', 'com'];

    // Obter o texto e dividir em palavras
    let texto = input.value.toLowerCase();
    if (!texto) return;

    // Dividir o texto em palavras, preservando espaços
    let palavras = texto.split(' ');

    // Processar cada palavra
    for (let i = 0; i < palavras.length; i++) {
      const palavra = palavras[i];

      // Pular palavras vazias
      if (!palavra) continue;

      // Sempre colocar a primeira palavra com inicial maiúscula
      // ou se não for uma exceção
      if (i === 0 || !excecoes.includes(palavra)) {
        palavras[i] = palavra.charAt(0).toUpperCase() + palavra.slice(1);
      }
    }

    // Juntar as palavras novamente
    const novoTexto = palavras.join(' ');

    // Só atualizar se realmente mudou para evitar loop infinito
    if (input.value !== novoTexto) {
      input.value = novoTexto;

      // Restaurar posição do cursor
      if (cursorPos !== null) {
        input.setSelectionRange(cursorPos, cursorEnd);
      }
    }
  },

  /**
   * Formata nome próprio em tempo real (durante a digitação)
   * @param {HTMLInputElement} input - Campo de entrada
   */
  properNameRealTime: function(input) {
    // Salvar posição do cursor
    const cursorPos = input.selectionStart;
    const cursorEnd = input.selectionEnd;

    // Lista de palavras que devem permanecer em minúsculo
    const excecoes = ['de', 'da', 'do', 'das', 'dos', 'e', 'em', 'para', 'por', 'com'];

    // Obter o texto e dividir em palavras
    let texto = input.value.toLowerCase();
    if (!texto) return;

    // Dividir o texto em palavras, preservando espaços
    let palavras = texto.split(' ');

    // Processar cada palavra
    for (let i = 0; i < palavras.length; i++) {
      const palavra = palavras[i];

      // Pular palavras vazias
      if (!palavra) continue;

      // Sempre colocar a primeira palavra com inicial maiúscula
      // ou se não for uma exceção
      if (i === 0 || !excecoes.includes(palavra)) {
        palavras[i] = palavra.charAt(0).toUpperCase() + palavra.slice(1);
      }
    }

    // Juntar as palavras novamente
    const novoTexto = palavras.join(' ');

    // Só atualizar se realmente mudou para evitar loop infinito
    if (input.value !== novoTexto) {
      input.value = novoTexto;

      // Restaurar posição do cursor
      if (cursorPos !== null) {
        input.setSelectionRange(cursorPos, cursorEnd);
      }
    }
  },

  /**
   * Formata código CID no padrão correto
   * @param {HTMLInputElement} input - Campo de entrada do CID
   */
  cid: function(input) {
    // Máscara removida - campo CID não precisa de formatação
    // pois é pesquisável diretamente na API
    return;
  },

  // Configuração
  whatsappIconsEnabled: true,

  /**
   * Capitaliza apenas a primeira letra do texto.
   * @param {HTMLInputElement} input - Campo de entrada do texto.
   */
  capitalizeFirstLetterOnly: function(input) {
    let value = input.value;
    if (value.length > 0) {
      input.value = value.charAt(0).toUpperCase() + value.slice(1);
    }
  },

  /**
   * Permite apenas números e limita o comprimento para campos de idade (oninput).
   * @param {HTMLInputElement} input - Campo de entrada do texto.
   */
  numericAge: function(input) {
    let value = input.value.replace(/\D/g, ''); // Remove não dígitos
    if (value.length > 3) { // Limita a 3 dígitos (ex: max 150)
      value = value.substring(0, 3);
    }
    const numericVal = parseInt(value, 10);
    if (!isNaN(numericVal) && numericVal > 150) { // Limite superior durante digitação
        value = "150";
    }
    input.value = value;
  },

  /**
   * Formata a idade com " anos" e valida o valor (onblur).
   * @param {HTMLInputElement} input - Campo de entrada do texto.
   */
  formatAgeWithSuffix: function(input) {
    let value = input.value.replace(/\D/g, ''); // Pega só os números

    if (value === '') {
      input.value = ''; // Limpa se estiver vazio
      return;
    }

    let numValue = parseInt(value, 10);

    if (isNaN(numValue)) {
      input.value = '';
      return;
    }

    if (numValue < 0) numValue = 0;
    if (numValue > 150) numValue = 150; // Limite superior final

    input.value = numValue + " anos";  },

  /**
   * Inicializa as máscaras nos elementos da página
   */
  init: function() {
    // Mapear atributos oninput para usar as funções deste objeto
    document.querySelectorAll('[oninput]').forEach(element => {
      const onInputAttr = element.getAttribute('oninput');

      if (onInputAttr.includes('maskCPF')) {
        element.oninput = () => Mask.cpf(element);
      } else if (onInputAttr.includes('maskCEP')) {
        element.oninput = () => Mask.cep(element);
      } else if (onInputAttr.includes('maskDate')) {
        element.oninput = () => Mask.date(element);
      } else if (onInputAttr.includes('maskPhone')) {
        element.oninput = () => Mask.phone(element);      } else if (onInputAttr.includes('maskUF')) {
        element.oninput = () => Mask.uf(element);
      } else if (onInputAttr.includes('maskMoney') || onInputAttr.includes('FIAP.masks.money')) {
        element.oninput = () => Mask.money(element);
      } else if (onInputAttr.includes('maskOnlyNumbers')) {
        element.oninput = () => Mask.onlyNumbers(element);
      } else if (onInputAttr.includes('formatarNomeProprio')) {
        element.onblur = () => Mask.properName(element);
      } else if (onInputAttr.includes('capitalizeFirstLetterOnly')) {
        element.oninput = () => Mask.capitalizeFirstLetterOnly(element);
      } else if (onInputAttr.includes('maskNumericAge')) {
        element.oninput = () => Mask.numericAge(element);
      } else if (onInputAttr.includes('formatAgeWithSuffix')) {
        element.onblur = () => Mask.formatAgeWithSuffix(element);
      }
    });
  }
};

// Exportar para escopo global para compatibilidade com código legado
window.maskCPF = Mask.cpf.bind(Mask);
window.maskCEP = Mask.cep.bind(Mask);
window.maskDate = Mask.date.bind(Mask);
window.maskPhone = Mask.phone.bind(Mask);
window.maskUF = Mask.uf.bind(Mask);
window.maskOnlyNumbers = Mask.onlyNumbers.bind(Mask);
window.maskMoney = Mask.money.bind(Mask);
window.formatarNomeProprio = Mask.properName.bind(Mask);
window.formatarNomeProprio = Mask.properName.bind(Mask);
window.capitalizeFirstLetterOnly = Mask.capitalizeFirstLetterOnly.bind(Mask);
window.maskNumericAge = Mask.numericAge.bind(Mask);
window.formatAgeWithSuffix = Mask.formatAgeWithSuffix.bind(Mask);

// Exportar todo o objeto Mask
window.Mask = Mask;

// Inicializar automaticamente quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  // Inicializar as máscaras
  Mask.init();

  console.log('Sistema de máscaras centralizado inicializado');
});
