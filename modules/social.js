/**
 * Módulo de Perfil Social
 */

// Limpar função de inicialização anterior
window.initModule = null;

// Definir nova função de inicialização do módulo
window.initModule = function() {
  setupEvents();

  // Tentativa de inicializar o assistido após um breve delay para garantir que o DOM esteja pronto
  // Substitui o MutationObserver anterior para simplificar.
  const tryInitializeAssistido = () => {
    const container = document.getElementById('membros-familia-list');
    if (container) {
      console.log("Container 'membros-familia-list' encontrado, inicializando assistido...");
      inicializarAssistido();
    } else {
      // Tentar novamente após um pequeno atraso se o container ainda não estiver pronto
      // Isso pode acontecer se o script do módulo executar antes do HTML ser totalmente renderizado pelo router.
      console.warn("Container 'membros-familia-list' não encontrado na primeira tentativa, tentando novamente em breve...");
      setTimeout(() => {
        const containerRetry = document.getElementById('membros-familia-list');
        if (containerRetry) {
          console.log("Container 'membros-familia-list' encontrado na RETENTATIVA, inicializando assistido...");
          inicializarAssistido();
        } else {
          console.error("ERRO CRÍTICO: Container 'membros-familia-list' NÃO encontrado após retentativa. A lista de família não será populada corretamente.");
        }
      }, 500); // Tenta novamente após 500ms
    }
  };

  // Chamar a tentativa de inicialização.
  // Um setTimeout aqui pode dar um ciclo de renderização para o navegador.
  setTimeout(tryInitializeAssistido, 100); // Pequeno delay inicial
};

// Função para configurar eventos do módulo
function setupEvents() {
  // Destacar campos preenchidos
  if (typeof destacarCamposPreenchidos === 'function') {
    destacarCamposPreenchidos();
  }

  // Configurar máscaras monetárias em todos os campos de renda
  const configMoneyMasks = () => {
    document.querySelectorAll('input[name="familiar_renda[]"]').forEach(input => {
      if (input) {
        input.addEventListener('input', function() {
          if (FIAP.masks && typeof FIAP.masks.money === 'function') {
            FIAP.masks.money(this);
          }
        });
      }
    });

    // Campo de renda total
    const rendaTotalInput = document.getElementById('renda_total_familiar');
    if (rendaTotalInput) {
      rendaTotalInput.addEventListener('input', function() {
        if (FIAP.masks && typeof FIAP.masks.money === 'function') {
          FIAP.masks.money(this);
        }
      });
    }
  };

  // Configurar máscaras
  setTimeout(configMoneyMasks, 500);

  // Inicializar cálculo de renda familiar
  setupRendaFamiliar();

  // Configurar botões de adicionar/remover membros da família
  // Nota: O botão de adicionar agora é inserido diretamente ao lado do assistido com onclick em linha

  const removeLastMemberBtn = document.getElementById('remove-last-family-member-btn');
  if (removeLastMemberBtn) {
    // Aplicar estilo centralizado ao botão de remover
    if (window.tw && typeof window.tw.applyTo === 'function') {
      window.tw.applyTo(removeLastMemberBtn, 'button.remove');
    }

    removeLastMemberBtn.addEventListener('click', removeLastFamilyMember);
  }
  // Configurar evento para os botões CadÚnico - evento delegado para evitar duplicação
  const membrosList = document.getElementById('membros-familia-list');
  if (membrosList) {
    // Remover eventos existentes para evitar duplicação
    const newMembrosList = membrosList.cloneNode(true);
    membrosList.parentNode.replaceChild(newMembrosList, membrosList);

    // Configurar novo evento
    newMembrosList.addEventListener('click', function(event) {
      const cadUnicoButton = event.target.closest('.cadunico-btn');
      if (cadUnicoButton && event.target === cadUnicoButton || cadUnicoButton.contains(event.target)) {
        // Evitar propagação para não ter chamadas múltiplas
        event.stopPropagation();
        toggleCadUnico(cadUnicoButton);
      }
    });
  }

  // Adicionar membro inicial se lista estiver vazia
  setTimeout(function() {
    const list = document.getElementById('membros-familia-list');
    // Verificar se o elemento existe e está vazio
    if (list && list.children.length === 0) {
      // Adicionar um membro inicial
      if (typeof addFamilyMember === 'function') {
        addFamilyMember();
      }
    }
  }, 200);

  // Botão Voltar
  const backButton = document.getElementById('btn-back');
  if (backButton) {
    // Aplicar estilo centralizado ao botão voltar
    if (window.tw && typeof window.tw.applyTo === 'function') {
      window.tw.applyTo(backButton, 'button.secondary');
    }

    backButton.addEventListener('click', function() {
      navigateTo('personal');
    });
  }

  // Botão Próximo
  const nextButton = document.getElementById('btn-next');
  if (nextButton) {
    // Aplicar estilo centralizado ao botão próximo
    if (window.tw && typeof window.tw.applyTo === 'function') {
      window.tw.applyTo(nextButton, 'button.primary');
    }

    // Remover eventos existentes
    const newBtn = nextButton.cloneNode(true);
    nextButton.parentNode.replaceChild(newBtn, nextButton);

    // Flag para prevenir múltiplos cliques
    let isNavigating = false;

    // Adicionar novo evento com proteção
    newBtn.addEventListener('click', function(e) {
      // Evitar comportamento padrão para prevenir propagação de evento
      e.preventDefault();
      e.stopPropagation();

      // Evitar múltiplos cliques
      if (isNavigating) return;
      isNavigating = true;

      // Feedback visual
      const originalText = this.innerHTML;
      this.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Carregando...';
      this.classList.add('opacity-75');

      try {
        // Salvar dados manualmente uma única vez, sem depender dos listeners em state.js
        if (window.formStateManager) {
          window.formStateManager.captureCurrentFormData();
        }

        // Atraso pequeno para garantir que o salvamento termine
        setTimeout(() => {
          // Navegar para a próxima página
          navigateTo('incapacity');

          // Restaurar estado do botão após navegação
          setTimeout(() => {
            if (document.body.contains(this)) {
              this.innerHTML = originalText;
              this.classList.remove('opacity-75');
            }
            isNavigating = false;
          }, 500);
        }, 100);
      } catch (error) {
        console.error('Erro ao navegar para a próxima página:', error);
        this.innerHTML = originalText;
        this.classList.remove('opacity-75');
        isNavigating = false;
      }
    });
  }

  // Configurar cálculo de renda familiar
  setupRendaFamiliar();
}

// Inicializar dados do assistido
function inicializarAssistido() {
  console.log("Inicializando dados do assistido...");

  const container = document.getElementById('membros-familia-list');
  if (!container) {
    console.error("Container de membros da família não encontrado");
    return;
  }

  // Limpar o container
  container.innerHTML = '';

  // Criar elemento HTML para o assistido (primeira linha)
  const assistidoHtml = `
    <div class="membro-familia mb-6 relative assistido">
      <div class="grid grid-cols-1 md:grid-cols-24 gap-4">
        <!-- Nome do assistido - 6 colunas -->
        <div class="relative md:col-span-6">
          <input type="text" name="familiar_nome[]" id="assistido_nome" class="peer w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-3 text-gray-800 placeholder-gray-400 transition-colors duration-200" readonly />
          <label class="absolute left-4 -top-3 px-1 text-sm text-blue-600 bg-gray-50 rounded-t-lg rounded-b-none">
            Nome do Assistido
          </label>
        </div>

        <!-- CPF - 3 colunas -->
        <div class="relative md:col-span-3">
          <input type="text" name="familiar_cpf[]" id="assistido_cpf" class="peer w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-3 text-gray-800 placeholder-gray-400 transition-colors duration-200" readonly />
          <label class="absolute left-4 -top-3 px-1 text-sm text-blue-600 bg-gray-50 rounded-t-lg rounded-b-none">
            CPF
          </label>
        </div>

        <!-- Idade - 2 colunas -->
        <div class="relative md:col-span-2">
          <input type="text" name="familiar_idade[]" id="assistido_idade" class="peer w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-3 text-gray-800 placeholder-gray-400 transition-colors duration-200" readonly />
          <label class="absolute left-4 -top-3 px-1 text-sm text-blue-600 bg-gray-50 rounded-t-lg rounded-b-none">
            Idade
          </label>
        </div>

        <!-- Parentesco - 4 colunas (fixo como "Assistido") -->
        <div class="relative md:col-span-4">
          <input type="text" name="familiar_parentesco[]" value="Assistido" class="peer w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-3 text-gray-800 transition-colors duration-200" readonly />
          <label class="absolute left-4 -top-3 px-1 text-sm text-blue-600 bg-gray-50 rounded-t-lg rounded-b-none">
            Parentesco
          </label>
        </div>

        <!-- Estado Civil - 4 colunas (editável) -->
        <div class="relative md:col-span-4">
          <select name="familiar_estado_civil[]" class="peer w-full rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 px-4 py-3 text-gray-800 bg-gray-50 transition-colors duration-200">
            <option value="" selected disabled>Selecione...</option>
            <option value="Solteiro(a)">Solteiro(a)</option>
            <option value="Casado(a)">Casado(a)</option>
            <option value="União Estável">União Estável</option>
            <option value="Divorciado(a)">Divorciado(a)</option>
            <option value="Viúvo(a)">Viúvo(a)</option>
          </select>
          <label class="absolute left-4 -top-3 px-1 text-sm text-blue-600 bg-gray-50 rounded-t-lg rounded-b-none">
            Estado Civil
          </label>
        </div>        <!-- Renda Mensal - 2 colunas (editável) -->
        <div class="relative md:col-span-2">
          <input type="text" name="familiar_renda[]" id="assistido_renda" class="peer w-full rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 px-4 py-3 text-gray-800 bg-gray-50 placeholder-gray-400 transition-colors duration-200" placeholder="R$ 0" oninput="if(FIAP.masks && typeof FIAP.masks.money === 'function') FIAP.masks.money(this)" />
          <label class="absolute left-4 -top-3 px-1 text-sm text-blue-600 bg-gray-50 rounded-t-lg rounded-b-none">
            Renda
          </label>
        </div><!-- CadÚnico - 2 colunas (editável) -->
        <div class="relative md:col-span-2 flex items-center justify-center">
          <input type="hidden" name="familiar_cadunico[]" value="Não" data-no-mask="true">
          <button type="button" class="cadunico-btn rounded-lg border border-gray-300 text-gray-500 hover:border-blue-500 hover:text-blue-600" title="Possui CadÚnico?" onclick="toggleCadUnico(this)">
            CadÚnico
          </button>
        </div>

        <!-- Botão de adicionar membro ao lado do assistido -->
        <div class="relative md:col-span-1 flex items-center justify-center">
          <button type="button" class="add-family-btn bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1 flex items-center justify-center w-8 h-8" title="Adicionar membro" onclick="addFamilyMember()">
            <i class="fas fa-plus"></i>
          </button>
        </div>
      </div>
    </div>
  `;
  // Inserir HTML diretamente
  container.innerHTML = assistidoHtml;
  // Preencher dados do assistido
  preencherDadosAssistido();
}

// Função para preencher os dados do assistido baseado na primeira página
function preencherDadosAssistido() {
  console.log('Preenchendo dados do assistido da primeira página...');

  const nomeInput = document.getElementById('assistido_nome');
  const cpfInput = document.getElementById('assistido_cpf');
  const idadeInput = document.getElementById('assistido_idade');

  let nomeValue = 'Assistido';
  let cpfValue = '';
  let idadeValue = '';

  if (window.formStateManager && window.formStateManager.formData && window.formStateManager.formData.personal) {
    const personalData = window.formStateManager.formData.personal;
    console.log('Dados obtidos do formStateManager (personalData):', JSON.parse(JSON.stringify(personalData)));

    // Assumindo que o assistido é o primeiro autor
    if (personalData.autor_nome && personalData.autor_nome.length > 0) {
      nomeValue = personalData.autor_nome[0] || nomeValue;
    }
    if (personalData.autor_cpf && personalData.autor_cpf.length > 0) {
      cpfValue = personalData.autor_cpf[0] || cpfValue;
    }
    // Para idade, usar autor_idade se disponível, caso contrário tentar calcular a partir de autor_nascimento
    if (personalData.autor_idade && personalData.autor_idade.length > 0) {
      idadeValue = personalData.autor_idade[0] || idadeValue;
    } else if (personalData.autor_nascimento && personalData.autor_nascimento.length > 0) {
      const dataNascimentoStr = personalData.autor_nascimento[0];
      if (dataNascimentoStr) {
        // Tentar usar a função calcularIdadeCompleta se existir e for robusta
        if (typeof calcularIdadeCompleta === 'function') {
          const dataNasc = new Date(dataNascimentoStr.split('/').reverse().join('-')); // DD/MM/YYYY para YYYY-MM-DD
          if (!isNaN(dataNasc.getTime())) {
            const idadeObj = calcularIdadeCompleta(dataNasc);
            idadeValue = `${idadeObj.anos} anos`; // Simplificando para apenas anos por enquanto
          } else {
            console.warn('[preencherDadosAssistido] Data de nascimento inválida:', dataNascimentoStr);
          }
        } else {
            console.warn('[preencherDadosAssistido] Função calcularIdadeCompleta não encontrada. Idade não pode ser calculada.');
        }
      }
    }

  } else {
    // Fallback se formStateManager não tiver os dados
    console.log('formStateManager.formData.personal não encontrado, tentando obter dos elementos do DOM.');
    const nomePaginaAnterior = document.getElementById('nome');
    const cpfPaginaAnterior = document.getElementById('cpf');
    const idadePaginaAnterior = document.getElementById('idade');

    if (nomePaginaAnterior) nomeValue = nomePaginaAnterior.value || nomeValue;
    if (cpfPaginaAnterior) cpfValue = cpfPaginaAnterior.value || cpfValue;
    if (idadePaginaAnterior) idadeValue = idadePaginaAnterior.value || idadeValue;
  }

  if (nomeInput) {
    nomeInput.value = nomeValue;
    console.log('Nome do assistido preenchido:', nomeValue);
  }

  if (cpfInput) {
    cpfInput.value = cpfValue;
    console.log('CPF do assistido preenchido:', cpfValue);
  }

  if (idadeInput) {
    // Extrair apenas o número de anos (remover os meses) se a string contiver "anos"
    if (idadeValue.includes('anos')) {
        const anosMatch = idadeValue.match(/(\d+)\s+anos?/);
        if (anosMatch && anosMatch[1]) {
            idadeInput.value = anosMatch[1] + ' anos';
        } else {
            idadeInput.value = idadeValue; // Mantém o valor original se o regex falhar mas "anos" estiver presente
        }
    } else if (idadeValue.trim() !== '' && !isNaN(idadeValue)) { // Se for apenas um número, assume que são anos
        idadeInput.value = idadeValue + ' anos';
    } else { // Caso contrário, usa o valor como está ou string vazia se for o caso
        idadeInput.value = idadeValue;
    }
    console.log('Idade do assistido preenchida:', idadeInput.value);
  }
}

// Função para adicionar membro da família
function addFamilyMember() {
  const container = document.getElementById('membros-familia-container');
  const list = document.getElementById('membros-familia-list');

  // Verificar se os elementos existem
  if (!container || !list) {
    console.error('Elementos necessários não encontrados.');
    return;
  }

  const template = document.getElementById('membro-familia-template');
  if (!template) {
    console.error('Template de membro da família não encontrado.');
    return;
  }

  const memberDiv = document.createElement('div');
  memberDiv.innerHTML = template.innerHTML.trim();
  const newMemberElement = memberDiv.firstChild;

  list.appendChild(newMemberElement);

  // Aplicar máscaras aos novos campos
  if (typeof maskCPF === 'function') {
    newMemberElement.querySelectorAll('input[name="familiar_cpf[]"]').forEach(input => {
      input.addEventListener('input', function() {
        maskCPF(this);
      });
    });
  }

  // Destacar campos
  if (typeof destacarCamposPreenchidos === 'function') {
    destacarCamposPreenchidos();
  }

  updateRemoveMemberButton();
}

window.addFamilyMember = addFamilyMember;

// Função para remover o último membro da família (nunca remove o assistido)
function removeLastFamilyMember() {
  const list = document.getElementById('membros-familia-list');
  if (list && list.children.length > 1) {
    list.lastElementChild.remove();
    updateRemoveMemberButton();
  }
}

// Função para remover um membro específico da família (nunca o assistido)
function removeSpecificFamilyMember(button) {
  if (!button) return;

  const memberDiv = button.closest('.membro-familia');
  if (memberDiv && !memberDiv.classList.contains('assistido')) {
    memberDiv.remove();
    updateRemoveMemberButton();
  }
}

// Função para atualizar a visibilidade do botão de remover membro
function updateRemoveMemberButton() {
  const removeButton = document.getElementById('remove-last-family-member-btn');
  const list = document.getElementById('membros-familia-list');
  if (removeButton && list) {
    removeButton.style.display = list.children.length > 1 ? 'flex' : 'none';
  }
}

// Função para alternar o estado do botão CadÚnico
function toggleCadUnico(button) {
  if (!button) return;

  console.log("toggleCadUnico chamado para:", button);

  // Garantir que estamos trabalhando com o próprio botão, não com filhos
  const targetButton = button.classList.contains('cadunico-btn') ? button : button.closest('.cadunico-btn');
  if (!targetButton) {
    console.error("Botão CadÚnico não encontrado");
    return;
  }

  // Remover event listeners antigos para evitar chamadas duplicadas
  // Clone o nó para remover todos os listeners
  const newButton = targetButton.cloneNode(true);
  if (targetButton.parentNode) {
    targetButton.parentNode.replaceChild(newButton, targetButton);
  }

  // Readicionar o onclick event
  newButton.onclick = function() {
    toggleCadUnico(this);
  };

  // Toggle da classe active
  newButton.classList.toggle('active');

  // Atualizar estilos visuais
  if (newButton.classList.contains('active')) {
    newButton.classList.add('bg-green-500', 'text-white', 'border-green-500');
    newButton.classList.remove('text-gray-500', 'border-gray-300');
  } else {
    newButton.classList.remove('bg-green-500', 'text-white', 'border-green-500');
    newButton.classList.add('text-gray-500', 'border-gray-300');
  }

  // Atualizar valor do input hidden
  const hiddenInput = newButton.previousElementSibling;
  if (hiddenInput && hiddenInput.type === 'hidden') {
    hiddenInput.value = newButton.classList.contains('active') ? 'Sim' : 'Não';
  }

  // Recalcular a renda total e per capita quando o status de CadÚnico mudar
  // Usar requestAnimationFrame para garantir que a UI foi atualizada antes do cálculo
  requestAnimationFrame(() => {
    calcularRendaTotal();
  });
}

// Corrigir o problema de duplicação ao adicionar linhas
function setupAddButtons() {
  // Remover eventos existentes para evitar duplicação
  const addButtons = document.querySelectorAll('.add-item-button');
  addButtons.forEach(button => {
    // Clone o botão para remover todos os event listeners
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);

    // Adicionar o novo event listener
    newButton.addEventListener('click', function() {
      const targetId = this.getAttribute('data-target');
      addItem(targetId);
    });
  });
}

/**
 * Adiciona um novo item a uma lista
 * @param {string} targetId - ID do container onde adicionar o item
 */
function addItem(targetId) {
  const container = document.getElementById(targetId);
  if (!container) return;

  const itemsCount = container.querySelectorAll('.social-item').length;
  const newId = itemsCount + 1;

  let template;

  // Escolher o template baseado no targetId
  switch(targetId) {
    case 'beneficiosList':
      template = createBeneficioTemplate(newId);
      break;
    case 'composicaoFamiliarList':
      template = createFamiliarTemplate(newId);
      break;
    case 'rendaList':
      template = createRendaTemplate(newId);
      break;
    // Adicione outros casos conforme necessário
    default:
      console.error('Template não encontrado para:', targetId);
      return;
  }

  const itemDiv = document.createElement('div');
  itemDiv.className = 'social-item mb-4 border-b border-gray-200 pb-4';
  itemDiv.innerHTML = template;
  container.appendChild(itemDiv);

  // Configurar o botão de remover
  const removeBtn = itemDiv.querySelector('.remove-item');
  if (removeBtn) {
    removeBtn.addEventListener('click', function() {
      itemDiv.remove();
    });
  }

  // Inicializar máscaras e outros comportamentos especiais
  if (typeof initMasks === 'function') {
    initMasks();
  }
}

// Funções para criar templates (mantenha as que você já tem)
function createBeneficioTemplate(id) {
  return `
    <!-- Template para benefício -->
    <!-- ...existing code... -->
  `;
}

// Função para inicializar os elementos da interface
function initSocialModule() {
  // Configurar as opções selecionáveis do CAD Único
  setupStatusOptions();

  // Carregar os dados do assistido como primeiro membro familiar
  carregarDadosAssistido();

  // Configurar os botões de adição e remoção
  setupAddButtons();
}

// Inicializar as opções estilizadas do status (versão horizontal)
function setupStatusOptions() {
  document.querySelectorAll('.status-option').forEach(option => {
    const radio = option.querySelector('input[type="radio"]');
    const badge = option.querySelector('.status-badge');
    const icon = option.querySelector('.option-icon');

    badge.addEventListener('click', () => {
      // Desmarcar todos
      document.querySelectorAll('.status-option input[type="radio"]').forEach(r => r.checked = false);
      document.querySelectorAll('.status-badge').forEach(b => {
        b.classList.remove('border-blue-500', 'bg-blue-50');
        b.querySelector('.option-icon').classList.remove('text-blue-500');
        b.querySelector('.option-icon').classList.add('text-gray-400');
      });

      // Marcar o selecionado
      radio.checked = true;
      badge.classList.add('border-blue-500', 'bg-blue-50');
      icon.classList.remove('text-gray-400');
      icon.classList.add('text-blue-500');
    });
  });
}

// Configurar cálculo de renda familiar
function setupRendaFamiliar() {
  const membrosList = document.getElementById('membros-familia-list');
  const rendaTotalInput = document.getElementById('renda_total_familiar');
  const rendaPerCapitaInput = document.getElementById('renda_per_capita');

  if (!membrosList || !rendaTotalInput || !rendaPerCapitaInput) return;
  // Monitorar mudanças de renda nos membros da família - removendo e recriando para evitar duplicação
  const newMembrosList = membrosList.cloneNode(false);
  while (membrosList.firstChild) {
    newMembrosList.appendChild(membrosList.firstChild);
  }
  membrosList.parentNode.replaceChild(newMembrosList, membrosList);

  // Adicionar novo listener para input de renda
  newMembrosList.addEventListener('input', function(event) {
    if (event.target.name === 'familiar_renda[]') {
      // Usar requestAnimationFrame para garantir que a UI foi atualizada
      requestAnimationFrame(() => {
        calcularRendaTotal();
      });
    }
  });

  // Monitorar mudanças no campo de renda total
  rendaTotalInput.addEventListener('input', function() {
    calcularRendaPerCapita();
    atualizarTermometro();
  });

  // Configuração inicial
  setTimeout(calcularRendaTotal, 500);
}

// Calcular renda total da família somando valores dos campos
function calcularRendaTotal() {
  const membrosFamilia = document.querySelectorAll('.membro-familia');
  const rendaTotalInput = document.getElementById('renda_total_familiar');
  const rendaTotalDisplay = document.getElementById('renda_total_display');

  // Verificar se os elementos necessários existem antes de prosseguir
  if (!membrosFamilia.length || !rendaTotalInput) {
    console.log('Elementos para cálculo de renda não encontrados, ignorando atualização.');
    return;
  }

  let total = 0;
  let totalCadunico = 0;
  let membrosCadunico = 0;
  membrosFamilia.forEach(membro => {
    const rendaInput = membro.querySelector('input[name="familiar_renda[]"]');
    const cadunicoBtn = membro.querySelector('.cadunico-btn');
    const possuiCadunico = cadunicoBtn && cadunicoBtn.classList.contains('active');

    if (rendaInput) {    // Limpar valor para processamento (remover R$, pontos e trocar vírgula por ponto)
      const valorLimpo = rendaInput.value
        .replace('R$', '')
        .replace(/\./g, '')
        .replace(',', '.')
        .trim();    if (valorLimpo && !isNaN(valorLimpo)) {
        // Processar o valor como inteiro
        const valorNumerico = Math.round(parseFloat(valorLimpo));
        total += valorNumerico;
        // Somar apenas membros com CadÚnico
        if (possuiCadunico) {
          totalCadunico += valorNumerico;
          membrosCadunico++;
        }
      }
    }
  });

  // Formatar e atualizar valores
  const valorFormatado = FIAP && FIAP.utils && typeof FIAP.utils.formatMoney === 'function'
    ? FIAP.utils.formatMoney(total)
    : formatarMoeda(total);

  // Atualizar valores nos campos
  rendaTotalInput.value = total.toFixed(2);

  // Atualizar display de renda total
  if (rendaTotalDisplay) {
    rendaTotalDisplay.textContent = valorFormatado;
  }
  // Calcular renda per capita apenas com membros CadÚnico e atualizar termômetro
  calcularRendaPerCapita(totalCadunico, membrosCadunico);

  // Verificar se os elementos necessários para o termômetro existem antes de atualizá-lo
  if (document.getElementById('renda-indicator') && document.getElementById('renda-progress')) {
    atualizarTermometro();
  }
}
window.calcularRendaTotal = calcularRendaTotal;

// Calcular renda per capita (total dividido pelo número de membros com CadÚnico)
function calcularRendaPerCapita(totalCadunico, membrosCadunico) {
  const rendaTotalInput = document.getElementById('renda_total_familiar');
  const rendaPerCapitaInput = document.getElementById('renda_per_capita');
  const rendaPerCapitaDisplay = document.getElementById('renda_per_capita_display');
  const membrosList = document.getElementById('membros-familia-list');

  if (!rendaPerCapitaInput || !membrosList) return;

  // Se não foram fornecidos os parâmetros, calcular com base nos botões CadÚnico
  if (totalCadunico === undefined || membrosCadunico === undefined) {
    totalCadunico = 0;
    membrosCadunico = 0;

    const membrosFamilia = document.querySelectorAll('.membro-familia');
    membrosFamilia.forEach(membro => {
      const rendaInput = membro.querySelector('input[name="familiar_renda[]"]');
      const cadunicoBtn = membro.querySelector('.cadunico-btn');
      const possuiCadunico = cadunicoBtn && cadunicoBtn.classList.contains('active');

      if (rendaInput && possuiCadunico) {
        const valorLimpo = rendaInput.value
          .replace('R$', '')
          .replace(/\./g, '')
          .replace(',', '.')
          .trim();

        if (valorLimpo && !isNaN(valorLimpo)) {
          totalCadunico += parseFloat(valorLimpo);
          membrosCadunico++;
        }
      }
    });
  }

  // Se não houver membros com CadÚnico, usar o total geral
  if (membrosCadunico === 0) {
    const totalMembros = membrosList.querySelectorAll('.membro-familia').length;
    if (totalMembros === 0) return;

    // Obter renda total e converter para número
    let rendaTotal = rendaTotalInput.value || 0;
    if (typeof rendaTotal === 'string') {
      rendaTotal = parseFloat(rendaTotal) || 0;
    }

    membrosCadunico = totalMembros;
    totalCadunico = rendaTotal;
  }
  // Calcular per capita e arredondar para inteiro
  const rendaPerCapita = Math.round(totalCadunico / membrosCadunico);

  // Formatar o valor
  const valorFormatado = FIAP && FIAP.utils && typeof FIAP.utils.formatMoney === 'function'
    ? FIAP.utils.formatMoney(rendaPerCapita)
    : formatarMoeda(rendaPerCapita);

  // Atualizar campo hidden com o valor numérico arredondado
  rendaPerCapitaInput.value = rendaPerCapita;

  // Atualizar display com o valor formatado
  if (rendaPerCapitaDisplay) {
    rendaPerCapitaDisplay.textContent = valorFormatado;
  }
}

// Atualizar termômetro de renda per capita
function atualizarTermometro() {
  const rendaPerCapitaInput = document.getElementById('renda_per_capita');
  const indicador = document.getElementById('renda-indicator');
  const progresso = document.getElementById('renda-progress');
  const salarioMinimoDisplay = document.getElementById('salario-minimo-display');

  // Verificar se todos os elementos necessários existem antes de prosseguir
  if (!rendaPerCapitaInput || !indicador || !progresso) {
    console.log('Elementos do termômetro não encontrados na página atual, ignorando atualização.');
    return;
  }

  // Obter o salário mínimo atual usando o valor dinâmico da API
  let salarioMinimo = CONFIG.financial.minimumWage; // Usar valor do CONFIG

  if (FIAP && FIAP.utils && typeof FIAP.utils.getSalarioMinimo === 'function') {
    salarioMinimo = FIAP.utils.getSalarioMinimo();
  }

  // Atualizar o display do salário mínimo na interface
  if (salarioMinimoDisplay) {
    const salarioFormatado = FIAP && FIAP.utils && typeof FIAP.utils.formatMoney === 'function'
      ? FIAP.utils.formatMoney(salarioMinimo)
      : formatarMoeda(salarioMinimo);

    salarioMinimoDisplay.textContent = salarioFormatado;
  }
  // Obter valor de renda per capita
  let rendaPerCapita = rendaPerCapitaInput.value;
  // Verificar se já é um número ou se precisa conversão
  if (typeof rendaPerCapita === 'string') {
    rendaPerCapita = rendaPerCapita
      .replace('R$', '')
      .replace(/\./g, '')
      .replace(',', '.')
      .trim();
  }

  rendaPerCapita = parseFloat(rendaPerCapita) || 0;

  // Não aplicar divisão adicional, usar o valor como está
  // Calcular porcentagem em relação ao salário mínimo (limitado a 100%)
  let porcentagem = Math.min((rendaPerCapita / salarioMinimo) * 100, 100);

  // Atualizar barra de progresso (máscara branca cobre o restante)
  progresso.style.width = (100 - porcentagem) + '%';

  // Verificar se o indicador existe antes de prosseguir
  if (!indicador) {
    console.log('Elemento indicador não encontrado na página atual.');
    return;
  }

  // Atualizar posição do indicador (sem o texto ou bolinha)
  indicador.style.left = porcentagem + '%';
  // Removida a manipulação do indicador visual (bolinha)
  // Apenas movemos o indicador para a posição correta sem criar ou manipular elementos visuais
}

// Função para formatar valores em moeda brasileira (fallback caso FIAP.utils não esteja disponível)
function formatarMoeda(valor) {
  // Arredondar para valor inteiro
  valor = Math.round(valor);
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

function updateCadUnicoButtonVisual(hiddenInput) {
  if (!hiddenInput || hiddenInput.type !== 'hidden') return;

  const button = hiddenInput.nextElementSibling;
  // Garantir que o próximo irmão é realmente o botão CadÚnico esperado
  if (!button || !button.classList.contains('cadunico-btn')) {
    // Tentar encontrar o botão de forma mais robusta se não for o próximo irmão direto
    // Isso pode acontecer se houver outros elementos ou a estrutura mudar.
    // Esta busca é um fallback e pode precisar de ajuste se a estrutura for complexa.
    const parentContainer = hiddenInput.closest('.relative'); // Ou o container mais apropriado
    const cadUnicoButtonInContainer = parentContainer ? parentContainer.querySelector('.cadunico-btn') : null;
    if (!cadUnicoButtonInContainer) {
        console.warn('Botão CadÚnico não encontrado para o input hidden:', hiddenInput);
        return;
    }
     // Se encontrou, usar o botão encontrado
     if(cadUnicoButtonInContainer && cadUnicoButtonInContainer.classList.contains('cadunico-btn')) {
        // Se o botão encontrado for o correto, prosseguir
     } else {
        return; // Não é o botão esperado
     }
  }

  const isActive = hiddenInput.value === 'Sim';

  if (isActive) {
    button.classList.add('active', 'bg-green-500', 'text-white', 'border-green-500');
    button.classList.remove('text-gray-500', 'border-gray-300');
  } else {
    button.classList.remove('active', 'bg-green-500', 'text-white', 'border-green-500');
    button.classList.add('text-gray-500', 'border-gray-300');
  }
}
window.updateCadUnicoButtonVisual = updateCadUnicoButtonVisual;
