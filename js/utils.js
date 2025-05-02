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
  validateCPF(input);
}

// Função para validar CPF
function validateCPF(input) {
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

    // Adicionar mensagem de confirmação
    const validMessage = document.createElement('div');
    validMessage.className = 'validation-message valid';
    validMessage.innerHTML = '<i class="fas fa-check-circle"></i> CPF válido';
    parentDiv.appendChild(validMessage);

    // Remover depois de 1.5 segundos
    setTimeout(() => {
      input.classList.remove('cpf-valid');
      if (validMessage.parentElement) validMessage.remove();
    }, 1500);
  } else {
    // CPF inválido - feedback visual vermelho
    input.classList.add('cpf-invalid');

    // Adicionar mensagem de erro
    const invalidMessage = document.createElement('div');
    invalidMessage.className = 'validation-message invalid';
    invalidMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> CPF inválido';
    parentDiv.appendChild(invalidMessage);
  }

  return isValid;
}

// Função para formatar CEP
function maskCEP(input) {
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
}

// Função para consultar CEP na API ViaCEP
function consultarCEP(cep) {
  cep = cep.replace(/\D/g, '');
  if (cep.length !== 8) return;

  const cepInput = document.getElementById('cep');

  // Feedback visual de carregamento
  cepInput.classList.remove('cep-valid', 'cep-invalid');
  cepInput.style.backgroundImage = "url('data:image/svg+xml;charset=utf8,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"%3E%3Cpath fill=\"%232563eb\" d=\"M73,50c0-12.7-10.3-23-23-23S27,37.3,27,50 M30.9,50c0-10.5,8.5-19.1,19.1-19.1S69.1,39.5,69.1,50\"%3E%3CanimateTransform attributeName=\"transform\" attributeType=\"XML\" type=\"rotate\" dur=\"1s\" from=\"0 50 50\" to=\"360 50 50\" repeatCount=\"indefinite\" /%3E%3C/path%3E%3C/svg%3E')";
  cepInput.style.backgroundRepeat = "no-repeat";
  cepInput.style.backgroundPosition = "right 10px center";
  cepInput.style.backgroundSize = "20px 20px";

  // Remover mensagem de validação anterior
  const parentDiv = cepInput.parentElement;
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

        // Adicionar mensagem de erro
        const invalidMessage = document.createElement('div');
        invalidMessage.className = 'validation-message invalid';
        invalidMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> CEP não encontrado';
        parentDiv.appendChild(invalidMessage);
        return;
      }

      // CEP válido - feedback visual verde
      cepInput.classList.add('cep-valid');

      // Adicionar mensagem de confirmação
      const validMessage = document.createElement('div');
      validMessage.className = 'validation-message valid';
      validMessage.innerHTML = '<i class="fas fa-check-circle"></i> CEP encontrado';
      parentDiv.appendChild(validMessage);

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
        if (validMessage.parentElement) validMessage.remove();
      }, 1500);
    })
    .catch(error => {
      // Remover indicador de carregamento
      cepInput.style.backgroundImage = "none";

      // Erro na consulta
      cepInput.classList.add('cep-invalid');

      // Adicionar mensagem de erro
      const errorMessage = document.createElement('div');
      errorMessage.className = 'validation-message invalid';
      errorMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> Erro ao consultar CEP';
      parentDiv.appendChild(errorMessage);
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
