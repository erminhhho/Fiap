/**
 * Módulo de Atividades Profissionais
 */

// Limpar função de inicialização anterior
window.initModule = null;

// Definir nova função de inicialização do módulo
window.initModule = function() {
  console.log('Inicializando módulo de atividades profissionais...');

  // Forçar reinicialização quando acessado diretamente pela URL
  if (window.location.hash === '#professional') {
    window._professionalInitialized = false;
  }

  // Verificar se o módulo já foi inicializado nesta sessão
  if (window._professionalInitialized) {
    console.log('Módulo de atividades profissionais já inicializado.');

    // Mesmo que já inicializado, vamos garantir que os botões de adicionar estejam configurados
    document.querySelectorAll('.add-atividade-btn').forEach(btn => {
      // Remover eventos existentes
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);

      // Adicionar evento ao novo botão
      newBtn.addEventListener('click', handleAddAtividadeClick);
    });

    return;
  }

  // Marcar como inicializado
  window._professionalInitialized = true;

  // Inicializar o conteúdo da página de forma estruturada
  initializePageContent();

  // Limpar flag quando a página mudar
  document.addEventListener('stepChanged', function handleStepChange() {
    window._professionalInitialized = false;
    document.removeEventListener('stepChanged', handleStepChange);
  }, { once: true });
};

// Função unificada para inicializar o conteúdo da página
function initializePageContent() {
  // Configurar eventos
  setupEvents();

  // Garantir que addAtividade esteja disponível globalmente
  window.addAtividade = addAtividade; // Garantir que está definido ANTES da restauração

  // Restaurar dados para esta etapa
  if (window.formStateManager) {
    const currentStepKey = 'professional';
    console.log(`[professional.js] initModule: Solicitando restauração para a etapa: ${currentStepKey}`);

    window.formStateManager.ensureFormAndRestore(currentStepKey);

    // Após restaurar, disparar validações
    setTimeout(function() {
      document.querySelectorAll('.atividade-item').forEach(atividade => {
        const inicioInput = atividade.querySelector('.periodo-inicio');
        const fimInput = atividade.querySelector('.periodo-fim');
        const prazoInput = atividade.querySelector('.periodo-prazo');
        if (inicioInput && fimInput && prazoInput) {
          if (inicioInput.value && fimInput.value) {
            let prazo = parseInt(fimInput.value, 10) - parseInt(inicioInput.value, 10) + 1;
            prazoInput.value = prazo > 0 ? prazo + ' anos' : '';
          } else if (inicioInput.value && prazoInput.value) {
            fimInput.value = parseInt(inicioInput.value, 10) + parseInt(prazoInput.value) - 1;
          } else if (fimInput.value && prazoInput.value) {
            inicioInput.value = parseInt(fimInput.value, 10) - parseInt(prazoInput.value) + 1;
          }
        }
        const profissaoInput = atividade.querySelector('#profissao');
        if (profissaoInput && typeof formatarNomeProprio === 'function') formatarNomeProprio(profissaoInput);
      });
    }, 350);
  }

  // Aplicar lógica de sincronização e máscara do campo prazo para a primeira linha
  const primeiraAtividade = document.querySelector('.atividade-item');
  if (primeiraAtividade) {
    const inicioInput = primeiraAtividade.querySelector('.periodo-inicio');
    const fimInput = primeiraAtividade.querySelector('.periodo-fim');
    const prazoInput = primeiraAtividade.querySelector('.periodo-prazo');
    if (inicioInput && fimInput && prazoInput) {
      function syncPrazo() {
        const inicio = parseInt(inicioInput.value, 10);
        const fim = parseInt(fimInput.value, 10);
        if (!isNaN(inicio) && !isNaN(fim)) {
          let prazo = fim - inicio + 1;
          if (prazo < 0) prazo = 0;
          prazoInput.value = prazo > 0 ? prazo + ' anos' : '';
        }
      }
      function syncFim() {
        const inicio = parseInt(inicioInput.value, 10);
        const prazo = parseInt(prazoInput.value);
        if (!isNaN(inicio) && !isNaN(prazo)) {
          fimInput.value = inicio + prazo - 1;
        }
      }

      // Aplicar as funções de sincronização aos campos
      inicioInput.addEventListener('input', syncPrazo);
      fimInput.addEventListener('input', syncPrazo);
      prazoInput.addEventListener('input', syncFim);
    }
  }

  // Configurar botões de navegação usando o sistema padronizado
  if (window.Navigation) {
    window.Navigation.setupNavigationButtons();
  }
}

// Função para resetar a UI da seção de atividades profissionais
function resetProfessionalUI() {
  console.log('[professional.js] resetProfessionalUI: Iniciando limpeza de atividades.');
  const atividadesList = document.getElementById('atividadesList');

  if (atividadesList) {
    // Remover todas as linhas de atividade (elementos com a classe .atividade-item)
    const atividadeItems = atividadesList.querySelectorAll('.atividade-item');
    atividadeItems.forEach(item => item.remove());
    console.log(`[professional.js] resetProfessionalUI: ${atividadeItems.length} itens de atividade removidos.`);

    // Se o formulário DEVE começar com uma linha de atividade em branco,
    // e addAtividade() a cria, você pode chamá-la aqui.
    // Por ora, vamos assumir que pode começar vazio e o usuário adiciona conforme necessário.
    // if (typeof addAtividade === 'function') {
    //   addAtividade();
    // }
  } else {
    console.warn('[professional.js] resetProfessionalUI: Container #atividadesList não encontrado.');
  }

  // Limpar o campo de observações específico desta seção
  const observacoesTextarea = document.querySelector('#professional-form #observacoes'); // Ser mais específico
  if (observacoesTextarea) {
      observacoesTextarea.value = '';
  }
}
window.resetProfessionalUI = resetProfessionalUI;

// Função para configurar eventos do módulo
function setupEvents() {
  // Destacar campos preenchidos
  if (typeof destacarCamposPreenchidos === 'function') {
    destacarCamposPreenchidos();
  }

  // Botão de adicionar atividade
  document.querySelectorAll('.add-atividade-btn').forEach(btn => {
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    // MODIFICADO: Chamar o novo handler com lock
    newBtn.addEventListener('click', handleAddAtividadeClick);
  });

  // Configurar tags da primeira linha
  setupTags(document.querySelector('.atividade-item'));

  // Botão Voltar
  const backButton = document.getElementById('btn-back');
  if (backButton) {
    // Preservar classes originais
    const originalClasses = backButton.className;

    // Remover eventos existentes
    const newBackBtn = backButton.cloneNode(true);

    // Garantir que todas as classes originais sejam mantidas
    newBackBtn.className = originalClasses;

    // Se houver classes específicas que precisam ser adicionadas
    if (window.tw && typeof window.tw.applyTo === 'function') {
      window.tw.applyTo(newBackBtn, 'button.secondary');
    }

    backButton.parentNode.replaceChild(newBackBtn, backButton);

    // Adicionar novo evento
    newBackBtn.addEventListener('click', function() {
      navigateTo('incapacity');
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
          navigateTo('documents');

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
        isNavigating = false;      }
    });
  }
  // Configurar modal de "Outro Tipo de Atividade"
  setupAtividadeTipoSelects();
}

// Função para configurar as tags de uma atividade
function setupTags(atividadeDiv) {
  const tagButtons = atividadeDiv.querySelectorAll('.tag-btn');

  tagButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Se a tag já está selecionada, apenas desmarca
      if (this.classList.contains('bg-blue-100')) {
        this.classList.remove('bg-blue-100', 'text-blue-700');
        const icon = this.querySelector('i');
        icon.classList.remove('fa-check');
        restoreOriginalIcon(icon, this.dataset.tag);
        return;
      }

      // Desmarca todas as outras tags
      tagButtons.forEach(otherButton => {
        if (otherButton !== this) {
          otherButton.classList.remove('bg-blue-100', 'text-blue-700');
          const otherIcon = otherButton.querySelector('i');
          otherIcon.classList.remove('fa-check');
          restoreOriginalIcon(otherIcon, otherButton.dataset.tag);
        }
      });

      // Marca a tag selecionada
      this.classList.add('bg-blue-100', 'text-blue-700');
      const icon = this.querySelector('i');
      icon.classList.remove('fa-check-circle', 'fa-file-invoice-dollar', 'fa-seedling', 'fa-handshake', 'fa-ban');
      icon.classList.add('fa-check');
    });
  });
}

// Função para restaurar o ícone original da tag
function restoreOriginalIcon(icon, tag) {
  switch(tag) {
    case 'Contribuiu':
      icon.classList.add('fa-check-circle');
      break;
    case 'Pagou Guia':
      icon.classList.add('fa-file-invoice-dollar');
      break;
    case 'Subsistência':
      icon.classList.add('fa-seedling');
      break;
    case 'Sem Contribuição':
      icon.classList.add('fa-ban');
      break;
  }
}

// Função para adicionar uma nova atividade (SEM o lock interno)
function addAtividade() {
  console.log("[professional.js] addAtividade (programático ou via handler): Iniciando.");

  const template = document.getElementById('atividadeTemplate');
  const atividadesList = document.getElementById('atividadesList');

  if (!template || !atividadesList) {
    console.error("Template ou lista de atividades não encontrado");
    return;
  }

  // Clonar o template
  const clone = template.content.cloneNode(true);
  const atividadeDiv = clone.querySelector('.atividade-item');

  // Configurar botão de remover
  const removeBtn = atividadeDiv.querySelector('.remove-atividade');
  if (removeBtn) {
    removeBtn.addEventListener('click', function() {
      atividadeDiv.remove();
    });
  }

  // Aplicar máscara de nome próprio ao campo de profissão
  const profissaoInput = atividadeDiv.querySelector('#profissao');
  if (profissaoInput) {
    profissaoInput.oninput = function() { formatarNomeProprio(this); };
  }

  // Adicionar ao DOM - coloque sempre no final da lista
  atividadesList.appendChild(atividadeDiv);

  // Lógica de sincronização dos campos de ano/prazo
  const inicioInput = atividadeDiv.querySelector('.periodo-inicio');
  const fimInput = atividadeDiv.querySelector('.periodo-fim');
  const prazoInput = atividadeDiv.querySelector('.periodo-prazo');

  function syncPrazo() {
    const inicio = parseInt(inicioInput.value, 10);
    const fim = parseInt(fimInput.value, 10);
    if (!isNaN(inicio) && !isNaN(fim)) {
      let prazo = fim - inicio + 1;
      if (prazo < 0) prazo = 0;
      prazoInput.value = prazo > 0 ? prazo + ' anos' : '';
    }
  }

  function syncFim() {
    const inicio = parseInt(inicioInput.value, 10);
    const prazo = parseInt(prazoInput.value);
    if (!isNaN(inicio) && !isNaN(prazo)) {
      fimInput.value = inicio + prazo - 1;
    }
  }

  function syncInicio() {
    const fim = parseInt(fimInput.value, 10);
    const prazo = parseInt(prazoInput.value);
    if (!isNaN(fim) && !isNaN(prazo)) {
      inicioInput.value = fim - prazo + 1;
    }
  }

  // Máscara para o campo prazo
  prazoInput.addEventListener('input', function(e) {
    let val = this.value.replace(/\D/g, '');
    if (val) this.value = val + ' anos';
    else this.value = '';
  });

  // Sincronização automática
  inicioInput.addEventListener('input', function() {
    if (fimInput.value) syncPrazo();
    else if (prazoInput.value) syncFim();
  });
  fimInput.addEventListener('input', function() {
    if (inicioInput.value) syncPrazo();
    else if (prazoInput.value) syncInicio();
  });
  prazoInput.addEventListener('input', function() {
    if (inicioInput.value) syncFim();
    else if (fimInput.value) syncInicio();
  });

  // Validação: início não pode ser maior que fim
  function validatePeriodo() {
    const inicio = parseInt(inicioInput.value, 10);
    const fim = parseInt(fimInput.value, 10);
    if (!isNaN(inicio) && !isNaN(fim) && inicio > fim) {
      inicioInput.setCustomValidity('O ano de início não pode ser maior que o ano de fim.');
    } else {
      inicioInput.setCustomValidity('');
    }
  }
  inicioInput.addEventListener('input', validatePeriodo);
  fimInput.addEventListener('input', validatePeriodo);

  // Destacar campos preenchidos
  if (typeof destacarCamposPreenchidos === 'function') {
    destacarCamposPreenchidos();
  }
}

// NOVO: Handler para o clique do botão Adicionar Atividade, contendo o lock
function handleAddAtividadeClick() {
  if (window._atividadeAddButtonClickLock) {
    console.log("[professional.js] handleAddAtividadeClick: Lock ativo, prevenindo novo clique.");
    return;
  }
  window._atividadeAddButtonClickLock = true;
  console.log("[professional.js] handleAddAtividadeClick: Botão Adicionar Atividade clicado, lock ativado.");

  try {
    addAtividade(); // Chama a função addAtividade (que agora está sem lock interno)
  } catch (error) {
    console.error("[professional.js] handleAddAtividadeClick: Erro ao chamar addAtividade:", error);
  } finally {
    setTimeout(() => {
      window._atividadeAddButtonClickLock = false;
      console.log("[professional.js] handleAddAtividadeClick: Lock do botão Adicionar Atividade liberado.");
    }, 300); // Lock para cliques do usuário
  }
}

// Função para obter o texto formatado
function getFormattedText(value) {
  return value.split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Função para atualizar a tag selecionada
function updateActivityTag(select) {
  const container = select.closest('.relationship-select');
  let value = select.value;

  // Se o valor restaurado/atual for vazio, usar o valor padrão do HTML (data-value original da div)
  // ou um padrão fixo se o data-value original não estiver disponível.
  if (!value) {
    const defaultValueFromHTML = container.dataset.value; // O valor original definido no HTML
    value = defaultValueFromHTML || 'Contribuiu'; // Fallback para 'Contribuiu'
    select.value = value; // Atualizar o próprio select para refletir o padrão
    console.log(`[Professional] updateActivityTag: Valor do select estava vazio. Definido para o padrão: '${value}'`);
  }

  // Atualiza os atributos data-selected e data-value
  container.setAttribute('data-selected', value);
  container.setAttribute('data-value', value); // Mantido para consistência, CSS pode usar isso
  console.log(`[Professional] updateActivityTag: div data-selected/data-value set to '${value}' para select '${select.name}'`);
}

// Função para ativar/desativar a tag de atividade
function toggleActivityTag(clickedDivElement) {
  const selectControl = clickedDivElement.querySelector('select.activity-tag');
  if (!selectControl) {
    console.warn('[Professional] toggleActivityTag: select.activity-tag não encontrado dentro de:', clickedDivElement);
    return;
  }

  const currentTagValue = clickedDivElement.dataset.value;
  if (typeof currentTagValue === 'undefined') {
    console.warn('[Professional] toggleActivityTag: data-value não definido em:', clickedDivElement);
    return;
  }

  // Se a div clicada já está "ativa" E o select já reflete esse valor, não faz nada.
  if (clickedDivElement.hasAttribute('data-selected') && selectControl.value === currentTagValue) {
    console.log(`[Professional] toggleActivityTag: Tag '${currentTagValue}' já está selecionada e select sincronizado. Sem ação.`);
    return;
  }

  // Encontrar todos os containers de tag dentro do mesmo item de atividade
  const atividadeItem = clickedDivElement.closest('.atividade-item');
  if (!atividadeItem) {
    console.warn('[Professional] toggleActivityTag: .atividade-item pai não encontrado para:', clickedDivElement);
    return;
  }
  const allTagContainersInItem = atividadeItem.querySelectorAll('.relationship-select');

  // Desmarcar todas as outras divs de tag no mesmo item de atividade
  allTagContainersInItem.forEach(container => {
    if (container !== clickedDivElement) {
      container.removeAttribute('data-selected');
      // O select filho da outra div não precisa ser alterado aqui,
      // pois apenas um select (o da div clicada) deve ter o valor ativo.
    }
  });

  // Marcar a div clicada (atualizar seu visual)
  clickedDivElement.setAttribute('data-selected', currentTagValue);

  // Sincronizar o select interno com o valor da tag clicada
  selectControl.value = currentTagValue;
  console.log(`[Professional] toggleActivityTag: Select '${selectControl.name}' value set to '${currentTagValue}'`);

  // Disparar o evento onchange no select para que updateActivityTag seja chamada
  // e para que o FormStateManager possa pegar a mudança.
  selectControl.dispatchEvent(new Event('change', { bubbles: true }));
  console.log(`[Professional] toggleActivityTag: Evento 'change' disparado para select '${selectControl.name}'`);
}

document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    // Sincronizar campos de período/prazo
    document.querySelectorAll('.atividade-item').forEach(atividade => {
      const inicioInput = atividade.querySelector('.periodo-inicio');
      const fimInput = atividade.querySelector('.periodo-fim');
      const prazoInput = atividade.querySelector('.periodo-prazo');
      if (inicioInput && fimInput && prazoInput) {
        // Forçar sincronização
        if (inicioInput.value && fimInput.value) {
          let prazo = parseInt(fimInput.value, 10) - parseInt(inicioInput.value, 10) + 1;
          prazoInput.value = prazo > 0 ? prazo + ' anos' : '';
        } else if (inicioInput.value && prazoInput.value) {
          fimInput.value = parseInt(inicioInput.value, 10) + parseInt(prazoInput.value) - 1;
        } else if (fimInput.value && prazoInput.value) {
          inicioInput.value = parseInt(fimInput.value, 10) - parseInt(prazoInput.value) + 1;
        }
      }
      // Nome próprio
      const profissaoInput = atividade.querySelector('#profissao');
      if (profissaoInput && typeof formatarNomeProprio === 'function') formatarNomeProprio(profissaoInput);
    });
  }, 300);
});

// Função para configurar os event listeners nos selects de tipo de atividade
function setupAtividadeTipoSelects() {
  document.addEventListener('change', function(event) {
    if (event.target.classList.contains('tipo-atividade')) {
      if (event.target.value === 'outro') {
        window.currentAtividadeSelectGlobal = event.target;
        showOutroAtividadeModal();
      }
    }
  });
}

// Função para mostrar o modal de "Outro Tipo de Atividade" usando o modal genérico
function showOutroAtividadeModal() {
  if (typeof window.showGenericModal !== 'function') {
    console.error('Modal genérico não disponível');
    return;
  }

  window.showGenericModal({
    title: 'Informar Tipo de Atividade',
    message: 'Digite o tipo de atividade desejado:',
    content: '<input type="text" id="outroAtividadeInputGeneric" class="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Ex: Professor, Vendedor">',    buttons: [
      {
        text: 'Cancelar',
        className: 'flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 text-center',
        onclick: function() {
          handleCancelOutroAtividade();
        }
      },
      {
        text: 'Salvar',
        className: 'flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-center',
        onclick: function() {
          handleSaveOutroAtividade();
        }
      }
    ]
  });  // Configurar eventos adicionais
  setTimeout(() => {
    const input = document.getElementById('outroAtividadeInputGeneric');
    if (input) {
      // Aplicar formatação de nome próprio com delay para detectar exceções
      input.addEventListener('input', function() {
        if (typeof window.formatarNomeProprioModal === 'function') {
          window.formatarNomeProprioModal(this);
        }
      });

      // Salvar ao pressionar Enter
      input.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
          handleSaveOutroAtividade();
        }
      });

      // Focar no campo
      input.focus();
    }
  }, 100);
}

// Função para lidar com o cancelamento
function handleCancelOutroAtividade() {
  // Se o usuário cancelou e o valor do select ainda é "outro", reseta para "Selecione..."
  if (window.currentAtividadeSelectGlobal && window.currentAtividadeSelectGlobal.value === 'outro') {
    const options = Array.from(window.currentAtividadeSelectGlobal.options);
    const customOptionExists = options.some(opt => opt.value !== "" && opt.value !== "outro" && !isDefaultAtividadeOption(opt.value));

    if (!customOptionExists) {
      window.currentAtividadeSelectGlobal.value = ""; // Reseta para "Selecione..."
    }
  }
  window.currentAtividadeSelectGlobal = null;
  window.closeGenericModal();
}

// Função para lidar com o salvamento
function handleSaveOutroAtividade() {
  const input = document.getElementById('outroAtividadeInputGeneric');
  const novaAtividade = input ? input.value.trim() : '';

  if (novaAtividade && window.currentAtividadeSelectGlobal) {
    // Verificar se a opção já existe (para não duplicar)
    let optionExists = false;
    for (let i = 0; i < window.currentAtividadeSelectGlobal.options.length; i++) {
      if (window.currentAtividadeSelectGlobal.options[i].value === novaAtividade) {
        optionExists = true;
        break;
      }
    }

    // Adicionar nova opção se não existir
    if (!optionExists) {
      const newOption = new Option(novaAtividade, novaAtividade, true, true);
      // Insere a nova opção antes da opção "Outro..."
      const outroOption = Array.from(window.currentAtividadeSelectGlobal.options).find(opt => opt.value === 'outro');
      if (outroOption) {
        window.currentAtividadeSelectGlobal.insertBefore(newOption, outroOption);
      } else {
        window.currentAtividadeSelectGlobal.appendChild(newOption);
      }
    }

    window.currentAtividadeSelectGlobal.value = novaAtividade;

    // Salvar automaticamente os dados do formulário
    if (window.formStateManager) {
      window.formStateManager.captureCurrentFormData();
    }
  }

  window.currentAtividadeSelectGlobal = null;
  window.closeGenericModal();
}

// Função auxiliar para verificar se uma opção de atividade é uma das padrões
function isDefaultAtividadeOption(value) {
    const defaultOptions = ["segurado_especial", "empregado", "autonomo", "empresario", "pescador", "domestico", "informal", "outro"];
    return defaultOptions.includes(value);
}

// Função para formatação de nome próprio no modal com delay
function formatarNomeProprioModal(input) {
  if (!input) return;

  // Clear any existing timeout
  clearTimeout(input.formatTimeout);

  // Set new timeout
  input.formatTimeout = setTimeout(() => {
    if (typeof window.formatarNomeProprio === 'function') {
      window.formatarNomeProprio(input);
    }
  }, 300);
}

// Exportar para o escopo global
if (typeof window !== 'undefined') {
  window.formatarNomeProprioModal = formatarNomeProprioModal;
  window.showOutroAtividadeModal = showOutroAtividadeModal;
  window.handleSaveOutroAtividade = handleSaveOutroAtividade;
  window.handleCancelOutroAtividade = handleCancelOutroAtividade;
}
