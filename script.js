// Multi-step navigation
const steps = Array.from(document.querySelectorAll('.step'));
let currentStep = 0;

function showStep(idx) {
  steps.forEach((el, i) => el.style.display = i === idx ? '' : 'none');
  currentStep = idx;

  // Atualiza o indicador de progresso
  document.querySelectorAll('.progress-step').forEach((el, i) => {
    if (i === idx) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });

  // Atualiza os ícones de navegação
  updateStepMapActive(idx);
}

document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM carregado, inicializando formulário...");

  // Mostra a primeira etapa ao carregar a página
  showStep(0);

  // Configuração dos botões de navegação
  document.getElementById('next-1')?.addEventListener('click', () => showStep(1));
  document.getElementById('back-2')?.addEventListener('click', () => showStep(0));
  document.getElementById('next-2')?.addEventListener('click', () => showStep(2));
  document.getElementById('back-3')?.addEventListener('click', () => showStep(1));
  document.getElementById('next-3')?.addEventListener('click', () => showStep(3));
  document.getElementById('back-4')?.addEventListener('click', () => showStep(2));
  document.getElementById('next-4')?.addEventListener('click', () => showStep(4));
  document.getElementById('back-5')?.addEventListener('click', () => showStep(3));
  document.getElementById('next-5')?.addEventListener('click', () => showStep(5));
  document.getElementById('back-6')?.addEventListener('click', () => showStep(4));
  document.getElementById('next-6')?.addEventListener('click', () => showStep(6));

  // Adicionar eventos de clique aos links de navegação
  document.querySelectorAll('.step-link').forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const step = parseInt(this.getAttribute('data-step')) - 1;
      showStep(step);
    });
  });
});

// Função para navegar para uma etapa específica
function goToStep(stepNumber) {
  // Converter para índice baseado em zero (já que step-1 é o índice 0, etc.)
  const stepIndex = stepNumber - 1;

  // Chamar a função showStep existente para fazer a navegação
  if (stepIndex >= 0 && stepIndex < steps.length) {
    showStep(stepIndex);
  }

  // Atualizar a hash da URL para refletir a etapa atual (opcional)
  window.location.hash = `step-${stepNumber}`;

  // Atualizar classe active nos links de navegação
  document.querySelectorAll('.step-link').forEach(link => {
    const linkStep = parseInt(link.getAttribute('data-step'));
    link.classList.toggle('active', linkStep === stepNumber);
  });
}

// Inicialização dos campos de data com máscara (sem flatpickr)
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM carregado, iniciando preenchimento de seletores...");
  inicializarSeletoresDaEtapaAtual();

  // Aplicar máscara de data para campos de datas
  // Campo de nascimento com cálculo automático de idade
  const nascimentoInput = document.getElementById('nascimento');
  if (nascimentoInput) {
    nascimentoInput.addEventListener('input', function() {
      maskDate(this);
    });

    nascimentoInput.addEventListener('blur', function() {
      calcularIdadeAutomatica();
    });
  }

  // Aplicar máscaras a outros campos de data
  document.querySelectorAll('input[type="date"]').forEach(input => {
    input.type = 'text'; // Converter de tipo date para texto
    input.addEventListener('input', function() {
      maskDate(this);
    });
  });

  // Verificar e aplicar máscaras para os campos iniciais
  const cpfInput = document.getElementById('cpf');
  if (cpfInput) {
    cpfInput.addEventListener('input', function() {
      maskCPF(this);
    });
  }

  const telefoneInput = document.getElementById('telefone');
  if (telefoneInput) {
    telefoneInput.addEventListener('input', function() {
      maskPhone(this);
    });
  }

  const cepInput = document.getElementById('cep');
  if (cepInput) {
    cepInput.addEventListener('input', function() {
      maskCEP(this);
    });

    // Configurar autopreenchimento a partir do CEP
    cepInput.addEventListener('blur', function() {
      const cep = this.value.replace(/\D/g, '');
      if (cep.length === 8) {
        consultarCEP(cep);
      }
    });
  }
});

// Função para validar CPF
function validateCPF(cpf) {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/\D/g, '');

  // Verifica se o CPF tem 11 dígitos
  if (cpf.length !== 11) return false;

  // Verifica se todos os dígitos são iguais (caso contrário é inválido)
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

  // Verifica se os dígitos calculados são iguais aos dígitos informados
  return (parseInt(cpf.charAt(9)) === digit1 && parseInt(cpf.charAt(10)) === digit2);
}

// Funções de máscara para CPF e outros campos
function maskCPF(input) {
  let value = input.value.replace(/\D/g, '');
  if (value.length > 11) value = value.slice(0, 11);

  if (value.length > 9) {
    value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{1,2})$/, "$1.$2.$3-$4");
  } else if (value.length > 6) {
    value = value.replace(/^(\d{3})(\d{3})(\d{1,})$/, "$1.$2.$3");
  } else if (value.length > 3) {
    value = value.replace(/^(\d{3})(\d{1,})$/, "$1.$2");
  }

  input.value = value;

  // Valida o CPF apenas quando estiver completo
  if (value.replace(/\D/g, '').length === 11) {
    const isValid = validateCPF(value);

    // Feedback visual de CPF válido/inválido
    if (isValid) {
      // Feedback positivo para CPF válido
      input.style.backgroundColor = '#d4edda'; // Verde claro
      input.style.borderColor = '#c3e6cb';
      input.title = "CPF válido";

      // Remover qualquer mensagem de erro existente
      const errorMessage = input.parentElement.querySelector('.cpf-error-message');
      if (errorMessage) {
        errorMessage.remove();
      }

      // Remover o feedback visual após 1 segundo
      setTimeout(() => {
        input.style.backgroundColor = '';
        input.style.borderColor = '';
      }, 1000);
    } else {
      // Feedback visual para CPF inválido
      input.style.backgroundColor = '#fff3cd'; // Amarelo claro
      input.style.borderColor = '#ffeeba';
      input.title = "CPF inválido. Por favor, verifique os números.";

      // Adicionar mensagem de erro embaixo do campo
      let errorMessage = input.parentElement.querySelector('.cpf-error-message');
      if (!errorMessage) {
        errorMessage = document.createElement('div');
        errorMessage.className = 'cpf-error-message text-warning mt-1';
        errorMessage.style.fontSize = '0.875rem';
        errorMessage.style.position = 'absolute';  // Posicionamento absoluto
        errorMessage.style.bottom = '-20px';       // Abaixo do campo
        errorMessage.style.left = '0';             // Alinhado à esquerda
        errorMessage.style.zIndex = '10';          // Acima de outros elementos
        errorMessage.innerHTML = '<i class="fas fa-exclamation-triangle mr-1"></i> CPF inválido';
        input.parentElement.appendChild(errorMessage);
      }
    }
  } else {
    // Remover quaisquer estilos e mensagens se o CPF estiver incompleto
    input.style.backgroundColor = '';
    input.style.borderColor = '';

    const errorMessage = input.parentElement.querySelector('.cpf-error-message');
    if (errorMessage) {
      errorMessage.remove();
    }
  }
}

function maskPhone(input) {
  let value = input.value.replace(/\D/g, '');
  if (value.length > 11) value = value.slice(0, 11);

  if (value.length > 10) {
    value = value.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  } else if (value.length > 6) {
    value = value.replace(/^(\d{2})(\d{4})(\d{1,4})$/, "($1) $2-$3");
  } else if (value.length > 2) {
    value = value.replace(/^(\d{2})(\d{1,})$/, "($1) $2");
  }

  input.value = value;
}

function maskCEP(input) {
  let value = input.value.replace(/\D/g, '');
  if (value.length > 8) value = value.slice(0, 8);

  if (value.length > 5) {
    value = value.replace(/^(\d{5})(\d{1,3})$/, "$1-$2");
  }

  input.value = value;

  // Remover qualquer mensagem de erro se o CEP não estiver completo
  if (value.length !== 8) {
    const errorMessage = input.parentElement.querySelector('.cep-error-message');
    if (errorMessage) {
      errorMessage.remove();
    }
    // Limpar os estilos visuais de erro
    input.style.backgroundColor = '';
    input.style.borderColor = '';
    // Resetar o status de CEP inválido
    input.dataset.cepInvalido = "false";
  } else {
    // Consultar CEP automaticamente quando tiver 8 dígitos
    consultarCEP(value);
  }
}

// Máscara de data com cálculo de idade em tempo real
function maskDate(input) {
  let value = input.value.replace(/\D/g, '');

  if (value.length > 8) value = value.substring(0, 8);

  if (value.length > 4) {
    value = value.replace(/(\d{2})(\d{2})(\d{0,4})/, '$1/$2/$3');
  } else if (value.length > 2) {
    value = value.replace(/(\d{2})(\d{0,2})/, '$1/$2');
  }

  input.value = value;

  // Calcular idade imediatamente se o formato da data estiver completo
  // e for o campo de nascimento (verificação do id do campo)
  if (value.length === 8 && input.id === 'nascimento') {
    calcularIdadeAutomatica();
  } else if (value.length === 8 && input.id && input.id.startsWith('nascimento-')) {
    // Para campos de nascimento de autores adicionais
    const idParts = input.id.split('-');
    if (idParts.length > 1) {
      const idadeId = 'idade-' + idParts[1];
      calcularIdadePersonalizada(input.id, idadeId);
    }
  }
}

// Função separada para calcular idade
function calcularIdadeAutomatica() {
  const nascimentoInput = document.getElementById('nascimento');
  const idadeInput = document.getElementById('idade');

  // Verificar se ambos os elementos existem antes de prosseguir
  if (!nascimentoInput || !idadeInput) {
    console.log("Campos de nascimento ou idade não encontrados");
    return;
  }

  // Verificar se o campo de nascimento tem valor válido (formato dd/mm/aaaa)
  if (nascimentoInput.value.length === 10) {
    const partes = nascimentoInput.value.split('/');
    if (partes.length === 3 && partes[2].length === 4) { // Garantir que o ano tenha 4 dígitos
      const dataNascimento = new Date(partes[2], partes[1] - 1, partes[0]);

      // Verificar se a data é válida
      if (!isNaN(dataNascimento.getTime())) {
        const hoje = new Date();
        let idade = hoje.getFullYear() - dataNascimento.getFullYear();

        // Ajustar a idade se ainda não fez aniversário este ano
        const mesAtual = hoje.getMonth();
        const diaAtual = hoje.getDate();
        const mesNascimento = dataNascimento.getMonth();
        const diaNascimento = dataNascimento.getDate();

        if (mesAtual < mesNascimento || (mesAtual === mesNascimento && diaAtual < diaNascimento)) {
          idade--;
        }

        // Definir o valor da idade no campo correspondente
        idadeInput.value = idade;
      }
    }
  }
}

// Função para calcular idade personalizada para autores adicionais
function calcularIdadePersonalizada(nascimentoId, idadeId) {
  const nascimentoInput = document.getElementById(nascimentoId);
  const idadeInput = document.getElementById(idadeId);

  // Verificar se ambos os elementos existem
  if (!nascimentoInput || !idadeInput) {
    console.log(`Elementos para cálculo de idade não encontrados: ${nascimentoId} ou ${idadeId}`);
    return;
  }

  // Verificar se o campo de nascimento tem valor válido (formato dd/mm/aaaa)
  if (nascimentoInput.value.length === 10) {
    const partes = nascimentoInput.value.split('/');
    if (partes.length === 3 && partes[2].length === 4) {
      const dataNascimento = new Date(partes[2], partes[1] - 1, partes[0]);

      // Verificar se a data é válida
      if (!isNaN(dataNascimento.getTime())) {
        const hoje = new Date();
        let idade = hoje.getFullYear() - dataNascimento.getFullYear();

        // Ajustar a idade se ainda não fez aniversário este ano
        const mesAtual = hoje.getMonth();
        const diaAtual = hoje.getDate();
        const mesNascimento = dataNascimento.getMonth();
        const diaNascimento = dataNascimento.getDate();

        if (mesAtual < mesNascimento || (mesAtual === mesNascimento && diaAtual < diaNascimento)) {
          idade--;
        }

        // Definir o valor da idade no campo correspondente
        idadeInput.value = idade;
      }
    }
  }
}

// Função para calcular idade automaticamente para autores adicionais - versão segura
function calcularIdadeAutomaticaAutor(inputElement) {
  // Verificar se o elemento de entrada existe
  if (!inputElement) return;

  // Extrair o ID do elemento para identificar o campo de idade correspondente
  const id = inputElement.id || '';
  const match = id.match(/nascimento-(\d+)/);

  if (!match) {
    console.log('ID de nascimento inválido, não foi possível calcular idade');
    return;
  }

  const authorId = match[1];
  const idadeId = `idade-${authorId}`;

  // Verificar se o elemento de idade existe antes de chamar a função
  const idadeElement = document.getElementById(idadeId);
  if (!idadeElement) {
    console.log(`Campo de idade com ID ${idadeId} não encontrado`);
    return;
  }

  calcularIdadePersonalizada(id, idadeId);
}

// Consultar CEP e preencher campos automaticamente
function consultarCEP(cep) {
  cep = cep.replace(/\D/g, '');
  if (cep.length !== 8) return;

  // Referência ao campo CEP
  const cepField = document.getElementById('cep');

  // Armazenar o CEP atual para verificar se houve mudança
  if (!cepField.dataset.lastCep || cepField.dataset.lastCep !== cep) {
    cepField.dataset.lastCep = cep;
  } else if (cepField.dataset.cepInvalido === "true") {
    // Se o CEP já foi consultado e é inválido, não consultar novamente
    return;
  }

  // Feedback visual de carregamento
  if (cepField) {
    cepField.style.backgroundColor = '#f8f9fa';
    cepField.style.backgroundImage = "url('data:image/svg+xml;charset=utf8,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"%3E%3Cpath fill=\"%23007bff\" d=\"M73,50c0-12.7-10.3-23-23-23S27,37.3,27,50 M30.9,50c0-10.5,8.5-19.1,19.1-19.1S69.1,39.5,69.1,50\"%3E%3CanimateTransform attributeName=\"transform\" attributeType=\"XML\" type=\"rotate\" dur=\"1s\" from=\"0 50 50\" to=\"360 50 50\" repeatCount=\"indefinite\" /%3E%3C/path%3E%3C/svg%3E')";
    cepField.style.backgroundRepeat = "no-repeat";
    cepField.style.backgroundPosition = "right 10px center";
    cepField.style.backgroundSize = "20px 20px";
  }

  fetch(`https://viacep.com.br/ws/${cep}/json/`)
    .then(r => r.json())
    .then(data => {
      // Remover o indicador de carregamento
      if (cepField) {
        cepField.style.backgroundImage = "none";
      }

      if (data.erro) {
        // Feedback visual não bloqueante para CEP não encontrado
        if (cepField) {
          // Marcar o CEP como inválido
          cepField.dataset.cepInvalido = "true";

          cepField.style.backgroundColor = '#fff3cd'; // Fundo amarelo suave
          cepField.style.borderColor = '#ffeeba';
          cepField.title = "CEP não encontrado. Verifique e tente novamente.";

          // Mostrar um feedback temporário sem bloquear a interface
          const parent = cepField.parentElement;

          // Verificar se já existe uma mensagem de erro para não duplicar
          let errorMessage = parent.querySelector('.cep-error-message');
          if (!errorMessage) {
            errorMessage = document.createElement('div');
            errorMessage.className = 'cep-error-message text-warning mt-1';
            errorMessage.style.fontSize = '0.875rem';
            errorMessage.style.position = 'absolute';  // Posicionamento absoluto
            errorMessage.style.bottom = '-20px';       // Abaixo do campo
            errorMessage.style.left = '0';             // Alinhado à esquerda
            errorMessage.style.zIndex = '10';          // Acima de outros elementos
            errorMessage.innerHTML = '<i class="fas fa-exclamation-triangle mr-1"></i> CEP não encontrado';
            parent.appendChild(errorMessage);
          }
        }
        return;
      }

      // Se chegou aqui, o CEP é válido
      if (cepField) {
        // Marcar o CEP como válido
        cepField.dataset.cepInvalido = "false";

        // Remover qualquer mensagem de erro existente
        const errorMessage = cepField.parentElement.querySelector('.cep-error-message');
        if (errorMessage) {
          errorMessage.remove();
        }

        cepField.style.backgroundColor = '#d4edda'; // Fundo verde suave
        cepField.style.borderColor = '#c3e6cb';

        // Remover o feedback visual após 1 segundo
        setTimeout(() => {
          cepField.style.backgroundColor = '';
          cepField.style.borderColor = '';
        }, 1000);
      }

      // Preencher os campos de endereço
      ['bairro', 'localidade', 'uf'].forEach(field => {
        const el = document.getElementById(field === 'localidade' ? 'cidade' : field);
        if (el) {
          el.value = data[field] || '';

          // Destaque visual nos campos preenchidos
          el.style.backgroundColor = '#e8f4ff'; // Azul claro
          setTimeout(() => {
            el.style.backgroundColor = '';
          }, 1000);
        }
      });

      // Preencher o campo de endereço/logradouro
      const enderecoEl = document.getElementById('endereco');
      if (enderecoEl && data.logradouro) {
        enderecoEl.value = data.logradouro;

        // Destaque visual
        enderecoEl.style.backgroundColor = '#e8f4ff';
        setTimeout(() => {
          enderecoEl.style.backgroundColor = '';
        }, 1000);

        // Focar no campo número após preenchimento
        document.getElementById('numero')?.focus();
      }
    })
    .catch(error => {
      console.error('Erro ao consultar CEP:', error);

      // Remover o indicador de carregamento
      if (cepField) {
        cepField.style.backgroundImage = "none";

        // Marcar o CEP como inválido
        cepField.dataset.cepInvalido = "true";

        // Feedback visual de erro não bloqueante
        cepField.style.backgroundColor = '#f8d7da'; // Fundo vermelho suave
        cepField.style.borderColor = '#f5c6cb';
        cepField.title = "Erro ao consultar o CEP. Verifique sua conexão.";

        // Mostrar um feedback temporário sem bloquear a interface
        const parent = cepField.parentElement;

        // Verificar se já existe uma mensagem de erro para não duplicar
        let errorMessage = parent.querySelector('.cep-error-message');
        if (!errorMessage) {
          errorMessage = document.createElement('div');
          errorMessage.className = 'cep-error-message text-danger mt-1';
          errorMessage.style.fontSize = '0.875rem';
          errorMessage.style.position = 'absolute';  // Posicionamento absoluto
          errorMessage.style.bottom = '-20px';       // Abaixo do campo
          errorMessage.style.left = '0';             // Alinhado à esquerda
          errorMessage.style.zIndex = '10';          // Acima de outros elementos
          errorMessage.innerHTML = '<i class="fas fa-exclamation-circle mr-1"></i> Erro ao consultar CEP';
          parent.appendChild(errorMessage);
        }
      }
    });
}

// Função atualizada para o mapa de passos com efeito de slide
function updateStepMapActive(idx) {
  const stepMap = document.getElementById('step-map');
  if (!stepMap) return; // Sair se o elemento não existir

  const stepLinks = stepMap.querySelectorAll('.step-link');
  const navSlider = document.querySelector('.nav-slider');
  if (!navSlider) return; // Sair se o slider não existir

  // Atualiza a classe active nos links
  stepLinks.forEach((el, i) => {
    el.classList.toggle('active', i === idx);
  });

  // Ajusta a posição do slider para o item ativo
  if (stepLinks[idx]) {
    const activeLink = stepLinks[idx];
    const linkWidth = activeLink.offsetWidth;
    const linkLeft = activeLink.offsetLeft;

    // Posiciona o slider sob o item ativo
    navSlider.style.width = `${linkWidth}px`;
    navSlider.style.left = `${linkLeft}px`;
  }
}

// Inicialização do slider de navegação
document.addEventListener('DOMContentLoaded', function() {
  const stepMap = document.getElementById('step-map');
  const navSlider = document.querySelector('.nav-slider');

  // Inicializa o slider na primeira etapa
  if (stepMap && navSlider) {
    const firstLink = stepMap.querySelector('.step-link');
    if (firstLink) {
      firstLink.classList.add('active');
      navSlider.style.width = `${firstLink.offsetWidth}px`;
      navSlider.style.left = `${firstLink.offsetLeft}px`;
    }
  }

  // Adiciona efeito de hover aos links da navegação
  document.querySelectorAll('.step-link').forEach(function(link) {
    link.addEventListener('mouseover', function() {
      // Efeito visual ao passar o mouse (opção)
      this.style.transform = 'translateY(-2px)';
    });

    link.addEventListener('mouseout', function() {
      // Retorno ao normal ao sair do mouse (se não for o ativo)
      if (!this.classList.contains('active')) {
        this.style.transform = '';
      }
    });
  });
});

// Função para verificar elementos de forma segura
function elementExists(elementId) {
  return document.getElementById(elementId) !== null;
}

// Função modificada para verificar se elementos existem antes de manipulá-los
document.addEventListener('DOMContentLoaded', function() {
  // Código original removido para evitar os erros
  // Adicionando verificação segura para evitar acesso a propriedades de null

  // Verificar elementos seletores de forma segura
  const stepMapExists = elementExists('step-map');

  if (stepMapExists) {
    // Atualiza os ícones de navegação apenas se o elemento existir
    updateStepMapActive(0);
  }
});

// Função para mostrar/ocultar detalhes de segurado especial
function toggleSeguradoEspecialSwitch() {
  const switchInput = document.getElementById('segurado_especial_switch');
  const detalhes = document.getElementById('segurado-especial-detalhes');
  const label = document.getElementById('segurado_especial_label');
  const documentacaoBlock = document.getElementById('documentacao-segurado-block');

  if (switchInput.checked) {
    detalhes.style.display = 'block';
    documentacaoBlock.style.display = 'block';
    label.textContent = 'Exerceu atividade como Segurado Especial: Sim';
  } else {
    detalhes.style.display = 'none';
    documentacaoBlock.style.display = 'none';
    label.textContent = 'Exerceu atividade como Segurado Especial?';

    // Desativa todos os toggles de categoria quando o principal é desativado
    document.querySelectorAll('.categoria-segurado').forEach(function(toggle) {
      toggle.checked = false;
      toggleCategoriaSegurado(toggle);
    });
  }
}

// Função para alternar campos de categorias de segurado especial
function toggleCategoriaSegurado(checkbox) {
  const targetId = checkbox.dataset.target;
  const targetElement = document.getElementById(targetId);

  if (checkbox.checked) {
    targetElement.style.display = 'block';
  } else {
    targetElement.style.display = 'none';
  }

  // Atualiza a visibilidade da documentação relacionada
  atualizaDocumentacaoVisivel();
}

// Função para atualizar quais documentações estão visíveis com base nas categorias selecionadas
function atualizaDocumentacaoVisivel() {
  // Esta função é chamada quando uma categoria é marcada/desmarcada
  // Cada categoria tem sua própria seção de documentação que já está
  // naturalmente visível/oculta junto com o conteúdo da categoria
}

// Função para habilitar/desabilitar campo de fim segurado especial
function atualizaFimSegurado(checkbox) {
  const mesSelect = document.getElementById('mes_fim_segurado');
  const anoSelect = document.getElementById('ano_fim_segurado');

  if (checkbox.checked) {
    // Obter mês e ano atuais
    const dataAtual = new Date();
    const mesAtual = (dataAtual.getMonth() + 1).toString().padStart(2, '0');
    const anoAtual = dataAtual.getFullYear().toString();

    // Definir os valores nos selects
    mesSelect.value = mesAtual;
    anoSelect.value = anoAtual;

    // Desabilitar os selects
    mesSelect.disabled = true;
    anoSelect.disabled = true;
  } else {
    // Habilitar os selects novamente
    mesSelect.disabled = false;
    anoSelect.disabled = false;
  }
}

// Adicionar documento de segurado especial
function adicionarDocSegurado() {
  const novoDoc = document.getElementById('novo_doc_segurado').value.trim();

  if (novoDoc) {
    // Criar um novo documento no grid
    const docsAdicionaisList = document.getElementById('docs-adicionais-list');
    const novoItem = document.createElement('div');
    novoItem.className = 'alert alert-info d-flex align-items-center justify-content-between p-2 mb-2';

    // ID único para o item
    const idItem = 'doc_custom_' + Date.now();

    // HTML do novo documento
    novoItem.innerHTML = `
      <div>
        <i class="fas fa-file-alt me-2"></i>
        <span>${novoDoc}</span>
      </div>
      <button type="button" class="btn btn-sm btn-outline-danger" onclick="this.closest('.alert').remove()">
        <i class="fas fa-times"></i>
      </button>
    `;

    // Adicionar à lista
    docsAdicionaisList.appendChild(novoItem);

    // Limpar campo
    document.getElementById('novo_doc_segurado').value = '';
  }
}

// Vínculos dinâmicos (com colunas)
function addVinculo() {
  const container = document.getElementById('vinculos-list');
  const div = document.createElement('div');
  div.className = 'dynamic-item p-3';
  div.innerHTML = `
    <div class="row align-items-end g-2 mb-2">
      <div class="col-md-3">
        <label class="form-label mb-1">Tipo</label>
        <select class="form-select" required>
          <option value="" selected disabled>Selecione...</option>
          <option value="urbano">Urbano</option>
          <option value="rural">Rural</option>
          <option value="autonomo">Autônomo</option>
          <option value="outro">Outro</option>
        </select>
      </div>
      <div class="col-md-5">
        <label class="form-label mb-1">Empregador/Atividade</label>
        <input type="text" class="form-control" required>
      </div>
      <div class="col-md-4">
        <label class="form-label mb-1">Função</label>
        <input type="text" class="form-control">
      </div>
    </div>
    <div class="row align-items-end g-2 mb-2">
      <div class="col-md-3">
        <label class="form-label mb-1">Início</label>
        <input type="text" class="form-control date-start" placeholder="DD/MM/AAAA">
      </div>
      <div class="col-md-3">
        <label class="form-label mb-1">Fim</label>
        <input type="text" class="form-control date-end" placeholder="DD/MM/AAAA">
      </div>
      <div class="col-md-3">
        <div class="form-check mt-4">
          <input class="form-check-input" type="checkbox" id="trabalho_atual_${Date.now()}">
          <label class="form-check-label" for="trabalho_atual_${Date.now()}">Trabalho atual</label>
        </div>
      </div>
      <div class="col-md-3 text-end">
        <button type="button" class="btn btn-outline-danger btn-sm mt-2" onclick="this.closest('.dynamic-item').remove()">
          <i class="fas fa-trash-alt"></i> Remover
        </button>
      </div>
    </div>
    <div class="row g-2">
      <div class="col-12">
        <label class="form-label mb-1">Observações (opcional)</label>
        <textarea class="form-control" style="height: 50px"></textarea>
      </div>
    </div>
  `;
  container.appendChild(div);

  // Aplicar máscara para os campos de data
  const dateStartInput = div.querySelector('.date-start');
  const dateEndInput = div.querySelector('.date-end');

  if (dateStartInput) {
    dateStartInput.addEventListener('input', function() {
      maskDate(this);
    });
  }

  if (dateEndInput) {
    dateEndInput.addEventListener('input', function() {
      maskDate(this);
    });
  }

  // Checkbox trabalho atual
  const checkboxAtual = div.querySelector('[type="checkbox"]');
  const dataFimInput = div.querySelector('.date-end');
  checkboxAtual.addEventListener('change', function() {
    if (this.checked) {
      dataFimInput.value = "Atual";
      dataFimInput.disabled = true;
    } else {
      dataFimInput.value = "";
      dataFimInput.disabled = false;
    }
  });
}

// Doenças dinâmicas (com colunas)
function addDoenca() {
  const container = document.getElementById('doencas-list');
  const div = document.createElement('div');
  div.className = 'dynamic-item';
  div.innerHTML = `
    <div class="row">
      <div class="col-md-5">
        <label>Doença/Problema:</label>
        <input type="text" placeholder="Nome da doença ou problema">
      </div>
      <div class="col-md-3">
        <label>Data de início:</label>
        <input type="text" class="date-input" placeholder="DD/MM/AAAA">
      </div>
      <div class="col-md-4">
        <label>Tratamentos/Laudos:</label>
        <input type="text" placeholder="Ex: exames, laudos">
      </div>
    </div>
    <button type="button" class="remove-btn" onclick="this.parentNode.remove()">Remover</button>
  `;
  container.appendChild(div);

  // Aplicar máscara para o campo de data
  const dateInput = div.querySelector('.date-input');
  if (dateInput) {
    dateInput.addEventListener('input', function() {
      maskDate(this);
    });
  }
}

// Outros documentos dinâmicos
function addOutroDocumento() {
  const container = document.getElementById('outros-documentos-list');
  const div = document.createElement('div');
  div.className = 'dynamic-item';
  div.innerHTML = `
    <input type="text" placeholder="Outro documento">
    <button type="button" class="remove-btn" onclick="this.parentNode.remove()">Remover</button>
  `;
  container.appendChild(div);
}

// Outros documentos rurais dinâmicos
function addOutroDocumentoRural() {
  const container = document.getElementById('outros-documentos-list');
  const div = document.createElement('div');
  div.className = 'dynamic-item';
  div.innerHTML = `
    <input type="text" placeholder="Outro documento rural">
    <button type="button" class="remove-btn" onclick="this.parentNode.remove()">Remover</button>
  `;
  container.appendChild(div);
}

// Função para alternar status do documento (apresentado/solicitado)
function toggleDocStatus(element) {
  const docCard = element.closest('.doc-card');
  const currentStatus = docCard.querySelector('.doc-status');

  if (!currentStatus) {
    // Criar novo status se não existir
    const statusElem = document.createElement('div');
    statusElem.className = 'doc-status status-apresentado';
    statusElem.innerHTML = '<i class="fas fa-check-circle me-1"></i> Apresentado';
    docCard.appendChild(statusElem);
  } else if (currentStatus.classList.contains('status-apresentado')) {
    // Alternar para solicitado
    currentStatus.className = 'doc-status status-solicitado';
    currentStatus.innerHTML = '<i class="fas fa-hourglass-half me-1"></i> Solicitado';
  } else {
    // Remover status
    currentStatus.remove();
  }
}

// Função para alternar checkbox
function toggleCheckbox(element) {
  const checkbox = element.querySelector('input[type="checkbox"]');
  checkbox.checked = !checkbox.checked;

  // Atualizar o visual do card quando o checkbox é clicado
  if (checkbox.checked) {
    element.style.backgroundColor = '#e7f1ff';
    element.style.borderColor = '#b8daff';
  } else {
    element.style.backgroundColor = '#f8f9fa';
    element.style.borderColor = '#e0e0e0';
  }

  // Permite alternar o status do documento (apresentado/solicitado)
  if (element.classList.contains('doc-card')) {
    toggleDocStatus(element);
  }
}

// Função para adicionar documento médico adicional
function adicionarDocMedico() {
  const novoDoc = document.getElementById('novo_doc_medico').value.trim();

  if (novoDoc) {
    const docList = document.getElementById('docs-medicos-list');
    const novoItem = document.createElement('div');
    novoItem.className = 'alert alert-info d-flex align-items-center justify-content-between p-2 mb-2';

    // HTML do novo documento médico com botão de remover
    novoItem.innerHTML = `
      <div>
        <i class="fas fa-file-medical me-2"></i>
        <span>${novoDoc}</span>
      </div>
      <button type="button" class="btn btn-sm btn-danger" onclick="this.closest('.alert').remove()">
        <i class="fas fa-times"></i>
      </button>
    `;

    // Adicionar ao container
    docList.appendChild(novoItem);

    // Limpar campo
    document.getElementById('novo_doc_medico').value = '';
  }
}

// Função para preencher os seletores de anos
function preencherSelectAnos(elementId, anoInicial, anoFinal) {
  const select = document.getElementById(elementId);
  if (select) {
    // Limpar opções existentes
    select.innerHTML = '<option value="">Selecione o ano</option>';

    // Adicionar anos em ordem decrescente (mais recentes primeiro)
    for (let ano = anoFinal; ano >= anoInicial; ano--) {
      const option = document.createElement('option');
      option.value = ano;
      option.textContent = ano;
      select.appendChild(option);
    }
  } else {
    console.warn(`Elemento com ID ${elementId} não encontrado`);
  }
}

// Wrapper seguro para acessar elementos do DOM - evita erros quando elementos não existem
function getElementSafely(elementId) {
  const element = document.getElementById(elementId);
  return element;
}

// Função para verificar se uma seção/etapa específica está presente na página
function isStepPresent(stepNumber) {
  return document.getElementById(`step-${stepNumber}`) !== null;
}

// Função atualizada para inicializar apenas os seletores necessários para a etapa atual
function inicializarSeletoresDaEtapaAtual() {
  // Mapear quais seletores pertencem a cada etapa
  const seletoresPorEtapa = {
    3: ['ano_inicio_doenca', 'ano_inicio_tratamento'], // Etapa 3: Condições de Saúde
    4: ['ano_inicio_segurado', 'ano_fim_segurado']     // Etapa 4: Segurado Especial
  };

  // Para cada etapa presente no formulário, inicializar seus respectivos seletores
  Object.keys(seletoresPorEtapa).forEach(etapa => {
    if (isStepPresent(etapa)) {
      console.log(`Etapa ${etapa} encontrada, inicializando seus seletores de ano`);

      const anoAtual = new Date().getFullYear();
      seletoresPorEtapa[etapa].forEach(seletorId => {
        const selector = getElementSafely(seletorId);
        if (selector) {
          preencherSelectAnos(seletorId, 1960, anoAtual);
        }
      });
    }
  });
}

// Function to calculate age based on birth date and display it next to the date
document.addEventListener('DOMContentLoaded', function() {
  // Set up date of birth field with age calculation
  const nascimentoInput = document.getElementById('nascimento');
  if (nascimentoInput) {
    nascimentoInput.addEventListener('change', function() {
      calculateAndDisplayAge(this);
    });
    nascimentoInput.addEventListener('blur', function() {
      calculateAndDisplayAge(this);
    });
  }
});

function calculateAndDisplayAge(inputElement) {
  const dateValue = inputElement.value;
  if (!dateValue) return;

  // Extract date components (assuming DD/MM/YYYY format)
  const parts = dateValue.split('/');
  if (parts.length !== 3) return;

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Month is 0-based in JS
  const year = parseInt(parts[2], 10);

  if (isNaN(day) || isNaN(month) || isNaN(year)) return;

  const birthDate = new Date(year, month, day);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();

  // Adjust age if birthday hasn't occurred this year yet
  if (today.getMonth() < birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
    age--;
  }

  // Only update if the age is a reasonable value
  if (age >= 0 && age < 120) {
    // Format with the age in parentheses
    inputElement.value = `${parts[0]}/${parts[1]}/${parts[2]}`;
  }
}

/**
 * Transforma o texto para primeira letra maiúscula, mantendo termos de ligação em minúsculo
 * Ex: "ermeson do nascimento da silva" -> "Ermeson do Nascimento da Silva"
 * @param {string} text - O texto a ser capitalizado
 * @return {string} - O texto formatado
 */
function capitalizeWords(text) {
  if (!text) return text;

  // Lista de termos de ligação que devem permanecer em minúsculo
  const termsToSkip = ["de", "da", "do", "das", "dos", "e", "a", "o", "em", "com", "para", "por"];

  // Divide o texto em palavras e capitaliza cada uma, exceto os termos de ligação
  return text.toLowerCase().split(' ').map((word, index) => {
    // Ignora palavras vazias
    if (!word) return word;

    // A primeira palavra sempre tem a primeira letra maiúscula, independentemente do que for
    if (index === 0) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }

    // Se a palavra for um termo de ligação, mantém em minúsculo
    if (termsToSkip.includes(word)) {
      return word;
    }

    // Caso contrário, capitaliza a primeira letra
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
}

// Função para aplicar a formatação quando o campo perder o foco
function applyCapitalization(inputElement) {
  if (inputElement && inputElement.value) {
    inputElement.value = capitalizeWords(inputElement.value);
  }
}

// Adiciona o evento blur aos campos que precisam de capitalização
document.addEventListener('DOMContentLoaded', function() {
  // Lista de campos que devem receber a capitalização
  const fieldsToCapitalize = [
    'nome', 'apelido', 'endereco', 'bairro', 'cidade',
    'medico_assistente', 'comunidade_quilombola', 'etnia_indigena',
    'terra_indigena', 'local_marisqueiro', 'comunidade_ribeirinho',
    'rio_ribeirinho', 'regiao_seringueiro', 'associacao_seringueiro'
  ];

  // Adiciona o evento blur para cada campo
  fieldsToCapitalize.forEach(fieldId => {
    const inputField = document.getElementById(fieldId);
    if (inputField) {
      inputField.addEventListener('blur', function() {
        applyCapitalization(this);
      });
    }
  });
});

// Função para aplicar a capitalização a todos os campos de texto onde faz sentido
document.addEventListener('DOMContentLoaded', function() {
  // Lista completa de todos os campos que devem receber a capitalização
  const fieldsToCapitalize = [
    // Dados pessoais
    'nome', 'apelido', 'telefone_detalhes',

    // Endereço
    'endereco', 'bairro', 'cidade', 'Observação',

    // Perfil social (qualquer campo de texto)
    'obs_sociais',

    // Saúde
    'diagnosticos', 'medico_assistente', 'detalhes_impacto', 'obs_documentacao_medica',
    'novo_doc_medico',

    // Segurado Especial
    'comunidade_quilombola', 'etnia_indigena', 'terra_indigena', 'local_marisqueiro',
    'comunidade_ribeirinho', 'rio_ribeirinho', 'regiao_seringueiro', 'associacao_seringueiro',
    'colonia_pescador', 'produtos_extraidos', 'associacao_marisqueiro', 'tipos_mariscos',
    'detalhes_seringueiro', 'detalhes_ribeirinho', 'outros_docs_quilombola',
    'outros_docs_pescador', 'outros_docs_indigena', 'outros_docs_extrativista',
    'outros_docs_seringueiro', 'outros_docs_marisqueiro', 'outros_docs_ribeirinho',
    'outros_docs_rural', 'novo_doc_segurado',

    // Atividades profissionais
    'gaps_trabalho', 'outras_atividades', 'contribuicoes_autonomas',

    // Documentos e conclusão
    'novo_doc_geral', 'observacoes_finais', 'advogado', 'assinatura_cliente'
  ];

  // Para cada ID na lista, adiciona o evento blur para capitalizar o texto
  fieldsToCapitalize.forEach(fieldId => {
    const inputField = document.getElementById(fieldId);
    if (inputField) {
      // Adiciona o evento quando o campo perde foco
      inputField.addEventListener('blur', function() {
        applyCapitalization(this);
      });
    }
  });

  // Aplicar também nos campos dinâmicos que serão adicionados posteriormente
  // Utilizando delegação de eventos para capturar novos campos
  document.addEventListener('focusout', function(e) {
    // Se o elemento que perdeu o foco é um input text ou textarea dentro de um elemento dinâmico
    if ((e.target.tagName === 'INPUT' && e.target.type === 'text') ||
        e.target.tagName === 'TEXTAREA') {

      // Verificar se está em um contêiner dinâmico
      if (e.target.closest('#vinculos-list') ||
          e.target.closest('#doencas-list') ||
          e.target.closest('#outros-documentos-list') ||
          e.target.closest('#docs-medicos-list') ||
          e.target.closest('#docs-adicionais-list')) {

        // Não aplicar em campos específicos como data, CPF, CEP, telefone, etc.
        const skipFields = ['data', 'cpf', 'cep', 'telefone', 'numero', 'code', 'email'];
        const shouldSkip = skipFields.some(term =>
          e.target.id.toLowerCase().includes(term) ||
          e.target.name.toLowerCase().includes(term)
        );

        // Também não aplicar em campos com classes específicas
        const skipClasses = ['date-', 'number', 'codigo', 'numeric'];
        const hasSkipClass = skipClasses.some(cls =>
          e.target.className.toLowerCase().includes(cls)
        );

        // Se não for para pular, aplica a capitalização
        if (!shouldSkip && !hasSkipClass) {
          applyCapitalization(e.target);
        }
      }
    }
  });
});

document.addEventListener('DOMContentLoaded', function() {
  // Funções para os botões de ação no topo
  // Limpar formulário
  document.getElementById('limpar-form')?.addEventListener('click', function() {
    if (confirm('Tem certeza que deseja limpar todos os campos do formulário?')) {
      limparFormularioCompleto();
    }
  });

  // Novo formulário - abre diretamente um formulário em branco sem pedir confirmação
  document.getElementById('novo-form')?.addEventListener('click', function() {
    // Limpar todos os campos do formulário
    limparFormularioCompleto();

    // Voltar para a primeira etapa
    goToStep(1);
  });

  // Salvar formulário em PDF
  document.getElementById('salvar-form')?.addEventListener('click', function() {
    // Usar a função personalizada para gerar e baixar o PDF
    gerarEBaixarPDF();
  });

  // Imprimir formulário - apenas chama a função de impressão do navegador
  document.getElementById('imprimir-form')?.addEventListener('click', function() {
    // Preparar o formulário para impressão
    prepararFormularioParaImpressao();

    // Abrir a janela de impressão do navegador
    window.print();

    // Adicionar evento para detectar quando a janela de impressão é fechada
    window.addEventListener('afterprint', function onAfterPrint() {
      // Remover este evento para não executar múltiplas vezes
      window.removeEventListener('afterprint', onAfterPrint);

      // Restaurar o formulário após a impressão
      setTimeout(restaurarFormularioAposImpressao, 200);
    });
  });

  // Diferenciar visualmente os ícones de função dos de navegação
  diferenciarIconesFuncao();

  // Usando setTimeout para garantir que o DOM esteja totalmente carregado antes de inicializar o slider
  setTimeout(() => {
    // Inicialização do slider de navegação
    if(typeof initNavSlider === 'function') {
      initNavSlider();
    }
  }, 100);
});

// Função para diferenciar visualmente os ícones de função dos de navegação
function diferenciarIconesFuncao() {
  // Adicionar classes especiais aos ícones de função (ações)
  const iconesFuncao = document.querySelectorAll('#limpar-form, #novo-form, #salvar-form, #imprimir-form');

  iconesFuncao.forEach(icone => {
    // Adicionar classe de destaque se não existir
    if (!icone.classList.contains('btn-funcao')) {
      icone.classList.add('btn-funcao');
    }

    // Adicionar estilo visual diferenciado aos ícones
    const iconElement = icone.querySelector('i');
    if (iconElement && !iconElement.classList.contains('icon-funcao')) {
      iconElement.classList.add('icon-funcao');
    }
  });

  // Verificar se os estilos já foram adicionados
  if (!document.getElementById('icones-funcao-style')) {
    // Adicionar estilos CSS inline para os botões de função
    const style = document.createElement('style');
    style.id = 'icones-funcao-style';
    style.textContent = `
      .btn-funcao {
        background-color: #f8f9fa;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-left: 8px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        transition: all 0.3s ease;
      }

      .btn-funcao:hover {
        transform: translateY(-3px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        background-color: #fff;
      }

      .icon-funcao {
        font-size: 1.2rem;
        color: #495057;
      }

      .btn-funcao:hover .icon-funcao {
        color: #007bff;
      }

      /* Estilo para impressão */
      @media print {
        .no-print, .btn-funcao, .nav-container {
          display: none !important;
        }

        body.printing {
          background-color: white;
          padding: 0;
          margin: 0;
        }

        .printing .container {
          max-width: 100%;
          width: 100%;
          padding: 0;
          margin: 0;
        }

        .printing .step {
          page-break-after: always;
          margin-bottom: 20px;
        }

        .printing h2, .printing h3 {
          margin-top: 15px;
        }
      }
    `;

    document.head.appendChild(style);
  }
}

// Função completa para limpar o formulário totalmente
function limparFormularioCompleto() {
  console.log("Limpando todos os campos e estados do formulário...");

  // 1. Limpar todos os inputs, selects e textareas
  const campos = document.querySelectorAll('input:not([type="button"]):not([type="submit"]), select, textarea');
  campos.forEach(campo => {
    campo.value = '';

    // Remover todas as classes de estilo e validação
    campo.classList.remove(
      'bg-filled-bg',
      'field-filled',
      'cpf-valid', 'cpf-invalid',
      'cep-valid', 'cep-invalid',
      'field-valid', 'field-invalid',
      'input-valid', 'input-invalid',
      'input-valid-bg', 'input-invalid-bg'
    );

    // Resetar outros estados CSS inline
    campo.style.backgroundColor = '';
    campo.style.borderColor = '';
    campo.style.backgroundImage = 'none';

    // Resetar atributos de dados
    if (campo.dataset) {
      delete campo.dataset.cepInvalido;
      delete campo.dataset.lastCep;
    }

    // Remover títulos/tooltips que possam ter sido adicionados
    campo.title = '';

    // Adicionar classe padrão de fundo
    campo.classList.add('bg-gray-50');
  });

  // 2. Desmarcar todos os checkboxes
  document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.checked = false;
  });

  // 3. Remover todas as mensagens de erro ou validação
  document.querySelectorAll('.cpf-error-message, .cep-error-message, .validation-message').forEach(msg => {
    msg.remove();
  });

  // 4. Remover itens dinâmicos adicionados pelo usuário
  const containersParaLimpar = [
    'vinculos-list',
    'doencas-list',
    'outros-documentos-list',
    'docs-medicos-list',
    'docs-adicionais-list'
  ];

  containersParaLimpar.forEach(id => {
    const container = document.getElementById(id);
    if (container) {
      container.innerHTML = '';
    }
  });

  // 5. Voltar para a primeira etapa
  if (typeof showStep === 'function') {
    showStep(0);
  }

  // 6. Atualizar a visualização dos campos
  if (typeof destacarCamposPreenchidos === 'function') {
    destacarCamposPreenchidos();
  }

  console.log('Formulário completamente limpo');
}

// Funções para o Perfil Social

// Máscara para valores monetários
function maskMoney(input) {
  let value = input.value.replace(/\D/g, '');

  // Converter para centavos
  value = (parseInt(value) / 100).toFixed(2) + '';

  // Formatar com R$ e separadores
  value = 'R$ ' + value.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  // Se o valor for R$ 0,00, limpar o campo para facilitar digitação
  if (value === 'R$ 0,00') {
    input.value = '';
    return;
  }

  input.value = value;

  // Atualizar os cálculos de renda familiar
  calcularRendaFamiliar();
}

// Remover a máscara e extrair apenas o valor numérico
function unmaskMoney(value) {
  // Remover 'R$ ', pontos e substituir vírgula por ponto
  return parseFloat(value.replace('R$ ', '').replace(/\./g, '').replace(',', '.')) || 0;
}

// Gerar campos para os membros da família
function gerarCamposFamilia(quantidade) {
  // Atualizar o campo oculto com o número de familiares
  document.getElementById('numero_familiares').value = quantidade;

  // Obter o container onde serão inseridos os membros
  const container = document.getElementById('membros-familia-list');
  container.innerHTML = '';

  // Mostrar o container (inicialmente oculto)
  document.getElementById('membros-familia-container').classList.remove('hidden');

  // Obter o template
  const template = document.getElementById('membro-familia-template').innerHTML;

  // Gerar um campo para cada membro da família
  for (let i = 1; i <= quantidade; i++) {
    const novoMembro = document.createElement('div');
    novoMembro.innerHTML = template;
    novoMembro.querySelector('.membro-familia').setAttribute('data-member', i);

    // Ajustar o título do primeiro membro (assistido)
    if (i === 1) {
      // Adicionar rótulo indicando que é o assistido
      const header = document.createElement('div');
      header.className = 'text-blue-600 font-medium mb-2';
      header.innerHTML = 'Assistido <span class="text-xs text-gray-500">(dados copiados do cadastro principal)</span>';
      novoMembro.querySelector('.membro-familia').prepend(header);

      // Preencher com os dados do assistido (da primeira etapa)
      setTimeout(() => {
        const nome = document.getElementById('nome')?.value || '';
        const cpf = document.getElementById('cpf')?.value || '';
        const idade = document.getElementById('idade')?.value || '';

        // Preencher os campos do primeiro membro
        const camposMembro = novoMembro.querySelector('.membro-familia');
        camposMembro.querySelector('input[name="familiar_nome[]"]').value = nome;
        camposMembro.querySelector('input[name="familiar_cpf[]"]').value = cpf;
        camposMembro.querySelector('input[name="familiar_idade[]"]').value = idade?.replace(' anos', '');

        // Marcar como o próprio assistido no campo de parentesco
        const parentescoSelect = camposMembro.querySelector('select[name="familiar_parentesco[]"]');
        const opcaoAssistido = document.createElement('option');
        opcaoAssistido.value = "Próprio Assistido";
        opcaoAssistido.textContent = "Próprio Assistido";
        opcaoAssistido.selected = true;
        parentescoSelect.appendChild(opcaoAssistido);

        // Destacar campos preenchidos
        destacarCamposPreenchidos();
      }, 100);
    }

    container.appendChild(novoMembro);
  }

  // Aplicar máscaras e adicionar eventos
  const camposRenda = document.querySelectorAll('input[name="familiar_renda[]"]');
  camposRenda.forEach(campo => {
    campo.addEventListener('input', function() {
      maskMoney(this);
    });

    campo.addEventListener('blur', function() {
      calcularRendaFamiliar();
    });
  });

  // Inicializar cálculo da renda
  calcularRendaFamiliar();
}

// Calcular renda familiar total e per capita
function calcularRendaFamiliar() {
  const camposRenda = document.querySelectorAll('input[name="familiar_renda[]"]');
  let rendaTotal = 0;

  camposRenda.forEach(campo => {
    if (campo.value) {
      rendaTotal += unmaskMoney(campo.value);
    }
  });

  // Quantidade de familiares
  const numFamiliares = parseInt(document.getElementById('numero_familiares').value) || 1;

  // Calcular renda per capita
  const rendaPerCapita = numFamiliares > 0 ? rendaTotal / numFamiliares : rendaTotal;

  // Formatar valores
  const rendaTotalFormatada = 'R$ ' + rendaTotal.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const rendaPerCapitaFormatada = 'R$ ' + rendaPerCapita.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  // Atualizar campos
  document.getElementById('renda_familiar_total').value = rendaTotalFormatada;
  document.getElementById('renda_familiar_per_capita').value = rendaPerCapitaFormatada;
}

// Ao marcar o benefício "Nenhum", desmarcar os outros
function toggleBeneficios(checkbox) {
  if (checkbox.id === 'beneficio_nenhum' && checkbox.checked) {
    // Se "Nenhum" for marcado, desmarcar os outros
    document.querySelectorAll('input[name="beneficios_sociais[]"]').forEach(cb => {
      if (cb.id !== 'beneficio_nenhum') {
        cb.checked = false;
      }
    });
  } else if (checkbox.id !== 'beneficio_nenhum' && checkbox.checked) {
    // Se qualquer outro for marcado, desmarcar "Nenhum"
    document.getElementById('beneficio_nenhum').checked = false;
  }
}

// Inicializar a funcionalidade quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
  // Botões para selecionar número de pessoas na família
  document.querySelectorAll('.numero-familia').forEach(botao => {
    botao.addEventListener('click', function() {
      // Remover classe ativa de todos os botões
      document.querySelectorAll('.numero-familia').forEach(btn => {
        btn.classList.remove('bg-blue-500', 'text-white', 'border-blue-500');
        btn.classList.add('border-blue-300');
      });

      // Adicionar classe ativa ao botão clicado
      this.classList.add('bg-blue-500', 'text-white', 'border-blue-500');
      this.classList.remove('border-blue-300');

      // Gerar campos para os membros da família
      const quantidade = parseInt(this.getAttribute('data-num'));
      gerarCamposFamilia(quantidade);
    });
  });

  // Adicionar eventos aos checkboxes de benefícios sociais
  document.querySelectorAll('input[name="beneficios_sociais[]"]').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      toggleBeneficios(this);
    });
  });
});
