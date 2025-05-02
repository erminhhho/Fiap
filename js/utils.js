/**
 * Funções utilitárias para o sistema
 */

// Função para formatar CPF
function maskCPF(input) {
  let value = input.value.replace(/\D/g, '');
  if (value.length > 11) value = value.substring(0, 11);

  value = value.replace(/^(\d{3})(\d)/, '$1.$2');
  value = value.replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
  value = value.replace(/\.(\d{3})(\d)/, '.$1-$2');

  input.value = value;
}

// Função para validar CPF
function validateCPF(input) {
  let cpf = input.value.replace(/\D/g, '');

  // Verificações básicas
  if (cpf.length !== 11) return false;
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
  return (parseInt(cpf.charAt(9)) === digit1 && parseInt(cpf.charAt(10)) === digit2);
}

// Função para formatar CEP
function maskCEP(input) {
  let value = input.value.replace(/\D/g, '');
  if (value.length > 8) value = value.substring(0, 8);

  if (value.length > 5) {
    value = value.replace(/^(\d{5})(\d)/, '$1-$2');
  }

  input.value = value;
}

// Função para consultar CEP na API ViaCEP
function consultarCEP(cep) {
  cep = cep.replace(/\D/g, '');
  if (cep.length !== 8) return;

  const cepInput = document.getElementById('cep');
  const parentElement = cepInput.parentElement;

  // Procurar etiqueta existente ou criar nova
  let cepTag = parentElement.querySelector('.tag-cep');
  if (!cepTag) {
    cepTag = createTag({
      text: 'Consultando CEP...',
      color: 'blue',
      size: 'sm',
      position: 'float-right',
      animated: true
    });
    cepTag.classList.add('tag-cep');
    parentElement.appendChild(cepTag);
  } else {
    cepTag.className = 'tag tag-blue tag-sm tag-float-right tag-animated tag-cep';
    updateTagText(cepTag, 'Consultando CEP...');
    cepTag.style.display = 'inline-flex';
    cepTag.style.opacity = '1';
  }

  fetch(`https://viacep.com.br/ws/${cep}/json/`)
    .then(response => response.json())
    .then(data => {
      if (data.erro) {
        // CEP inválido
        cepTag.className = 'tag tag-invalid tag-sm tag-float-right tag-animated tag-cep';
        updateTagText(cepTag, 'CEP não encontrado');
        return;
      }

      // CEP válido
      cepTag.className = 'tag tag-valid tag-sm tag-float-right tag-animated tag-cep';
      updateTagText(cepTag, 'CEP encontrado');

      // Preencher campos de endereço
      document.getElementById('bairro').value = data.bairro || '';
      document.getElementById('cidade').value = data.localidade || '';
      document.getElementById('uf').value = data.uf || '';
      document.getElementById('endereco').value = data.logradouro || '';

      // Focar campo de número após preenchimento
      if (data.logradouro) {
        document.getElementById('numero').focus();
      }

      // Remover tag de confirmação após 3 segundos
      setTimeout(() => {
        cepTag.style.opacity = '0';
        setTimeout(() => {
          cepTag.style.display = 'none';
        }, 300);
      }, 3000);
    })
    .catch(error => {
      // Erro na consulta
      cepTag.className = 'tag tag-invalid tag-sm tag-float-right tag-animated tag-cep';
      updateTagText(cepTag, 'Erro ao consultar CEP');
    });
}

// Função para formatar datas
function maskDate(input) {
  let value = input.value.replace(/\D/g, '');

  if (value.length > 8) value = value.substring(0, 8);

  value = value.replace(/^(\d{2})(\d)/, '$1/$2');
  value = value.replace(/^(\d{2})\/(\d{2})(\d)/, '$1/$2/$3');

  input.value = value;

  // Se tiver campo de idade associado, calcular
  if (value.length === 10 && input.dataset.targetAge) {
    calcularIdade(input.value, input.dataset.targetAge);
  }
}

// Função para calcular idade a partir da data
function calcularIdade(dataNascimento, idadeElementId) {
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

// Função para formatar telefone
function maskPhone(input) {
  let value = input.value.replace(/\D/g, '');
  if (value.length > 11) value = value.substring(0, 11);

  if (value.length > 2) {
    value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
  }
  if (value.length > 9) {
    value = value.replace(/(\d)(\d{4})$/, '$1-$2');
  }

  input.value = value;
}

// Função para permitir apenas números
function maskOnlyNumbers(input) {
  input.value = input.value.replace(/\D/g, '');
}

// Função para formatar valores em moeda
function maskCurrency(input) {
  let value = input.value.replace(/\D/g, '');
  value = (parseInt(value) / 100).toFixed(2) + '';
  value = value.replace(".", ",");
  value = value.replace(/(\d)(\d{3})(\,)/g, "$1.$2$3");
  value = value.replace(/(\d)(\d{3})(\.\d{3})/g, "$1.$2$3");
  input.value = 'R$ ' + value;
}

// Função para destacar campos preenchidos
function destacarCamposPreenchidos() {
  const campos = document.querySelectorAll('input:not([readonly]):not([type="hidden"]):not([type="button"]):not([type="submit"]), select, textarea, input[id^="idade"]');

  campos.forEach(campo => {
    if (campo.value.trim() !== '') {
      campo.classList.add('field-filled');
      campo.classList.remove('bg-gray-50');
    } else {
      campo.classList.remove('field-filled');
      campo.classList.add('bg-gray-50');
    }
  });
}

// Função para formatar nomes próprios (primeira letra maiúscula)
function formatarNomeProprio(input) {
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

// Funções para manipulação de Local Storage
function salvarLocalStorage(dados) {
  const timestamp = new Date().getTime();
  const chave = `fiap_${timestamp}`;

  localStorage.setItem(chave, JSON.stringify(dados));
  return chave;
}

function carregarLocalStorage(chave) {
  const dados = localStorage.getItem(chave);
  return dados ? JSON.parse(dados) : null;
}

function listarTodosRegistros() {
  const registros = [];
  for (let i = 0; i < localStorage.length; i++) {
    const chave = localStorage.key(i);
    if (chave.startsWith('fiap_')) {
      const dados = carregarLocalStorage(chave);
      registros.push({chave, dados});
    }
  }
  return registros;
}

/**
 * Funções para o sistema de etiquetas (tags)
 */

// Criar uma tag
function createTag(options) {
  const {
    text,
    icon,
    color = 'neutral',
    size = 'md',
    position = 'inline',
    clickable = false,
    active = false,
    animated = false,
    onClick = null
  } = options;

  // Criar elemento div para a tag
  const tag = document.createElement('div');

  // Classes base
  let classes = ['tag', `tag-${color}`, `tag-${size}`, `tag-${position}`];

  // Classes opcionais
  if (clickable) classes.push('tag-clickable');
  if (active) classes.push('active');
  if (animated) classes.push('tag-animated');

  // Aplicar classes
  tag.className = classes.join(' ');

  // Adicionar ícone, se especificado
  if (icon) {
    const iconElement = document.createElement('i');
    iconElement.className = icon;
    tag.appendChild(iconElement);
  }

  // Adicionar o texto
  const textSpan = document.createElement('span');
  textSpan.textContent = text;
  tag.appendChild(textSpan);

  // Adicionar evento de clique, se especificado
  if (onClick) {
    tag.addEventListener('click', onClick);
  }

  return tag;
}

// Função para alternar o estado ativo de uma tag
function toggleTag(tag, active = null) {
  if (active === null) {
    // Alternar o estado atual
    tag.classList.toggle('active');
  } else if (active) {
    // Forçar estado ativo
    tag.classList.add('active');
  } else {
    // Forçar estado inativo
    tag.classList.remove('active');
  }
}

// Atualizar texto de uma tag
function updateTagText(tag, newText) {
  const textSpan = tag.querySelector('span');
  if (textSpan) {
    textSpan.textContent = newText;
  }
}

// Criar uma tag de validação para um campo de formulário
function createValidationTag(inputField, position = 'float-right') {
  // Criar a tag
  const tag = createTag({
    text: 'Verificando...',
    color: 'neutral',
    size: 'sm',
    position: position
  });

  // Adicionar à página
  const parentElement = inputField.parentElement;
  parentElement.style.position = 'relative';
  parentElement.appendChild(tag);

  // Inicialmente ocultar
  tag.style.display = 'none';

  return tag;
}

// Atualizar tag de validação
function updateValidationTag(tag, isValid, message) {
  // Mostrar a tag
  tag.style.display = 'inline-flex';

  // Atualizar classes com base na validação
  if (isValid) {
    tag.className = tag.className.replace(/tag-\w+/g, 'tag-valid');
  } else {
    tag.className = tag.className.replace(/tag-\w+/g, 'tag-invalid');
  }

  // Atualizar texto
  updateTagText(tag, message);

  // Adicionar animação
  tag.classList.add('tag-animated');

  // Se quiser que a tag desapareça após alguns segundos
  setTimeout(() => {
    tag.style.opacity = '0';
    setTimeout(() => {
      tag.style.display = 'none';
      tag.style.opacity = '1';
    }, 300);
  }, 3000);
}

// Criar uma tag WhatsApp
function createWhatsAppTag(inputField) {
  // Criar a tag
  const tag = createTag({
    text: 'WhatsApp',
    icon: 'fab fa-whatsapp',
    color: 'whatsapp',
    size: 'sm',
    position: 'float-right',
    clickable: true
  });

  // Adicionar checkbox oculto
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.name = inputField.name + '_whatsapp';
  checkbox.value = 'Sim';
  checkbox.style.display = 'none';
  tag.appendChild(checkbox);

  // Adicionar evento de clique para alternar o estado
  tag.addEventListener('click', () => {
    toggleTag(tag);
    checkbox.checked = tag.classList.contains('active');
  });

  // Adicionar à página
  const parentElement = inputField.parentElement;
  parentElement.style.position = 'relative';
  parentElement.appendChild(tag);

  return tag;
}

// Funções de exportação
window.maskCPF = maskCPF;
window.validateCPF = validateCPF;
window.maskCEP = maskCEP;
window.consultarCEP = consultarCEP;
window.maskDate = maskDate;
window.calcularIdade = calcularIdade;
window.maskPhone = maskPhone;
window.maskOnlyNumbers = maskOnlyNumbers;
window.maskCurrency = maskCurrency;
window.destacarCamposPreenchidos = destacarCamposPreenchidos;
window.formatarNomeProprio = formatarNomeProprio;
window.salvarLocalStorage = salvarLocalStorage;
window.carregarLocalStorage = carregarLocalStorage;
window.listarTodosRegistros = listarTodosRegistros;
window.createTag = createTag;
window.toggleTag = toggleTag;
window.updateTagText = updateTagText;
window.createValidationTag = createValidationTag;
window.updateValidationTag = updateValidationTag;
window.createWhatsAppTag = createWhatsAppTag;
