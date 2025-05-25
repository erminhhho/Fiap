0/**
 * Módulo de Dados Pessoais
 */

// Limpar função de inicialização anterior
window.initModule = null;

// Definir nova função de inicialização do módulo
window.initModule = function() {
  console.log('Inicializando módulo de dados pessoais e configurando eventos...');

  // Forçar reinicialização do módulo ao acessar diretamente pela URL
  if (window.location.hash === '#personal') {
    window._personalInitialized = false;
  }

  // Verificar se o módulo já foi inicializado nesta sessão
  if (window._personalInitialized && !window.forceModuleReload) {
    console.log('Módulo de dados pessoais já inicializado.');
    setupDynamicFieldEvents();
    return;
  }

  // Inicializar o conteúdo da página de forma estruturada
  initializePageContent();

  window._personalInitialized = true;
  window.forceModuleReload = false;

  // Limpar flag quando a página mudar
  document.addEventListener('stepChanged', function handleStepChange() {
    window._personalInitialized = false;
    document.removeEventListener('stepChanged', handleStepChange);
  }, { once: true });

  console.log('[personal.js] Módulo totalmente inicializado e restauração solicitada.');
};

// Função que centraliza a inicialização do conteúdo da página
function initializePageContent() {
  // Contador global de autores - usando window para evitar redeclaração
  if (typeof window.authorCount === 'undefined') {
    window.authorCount = 1;
  }

  // Array com etiquetas para os autores adicionais - usando window para evitar redeclaração
  if (typeof window.authorLabels === 'undefined') {
    window.authorLabels = ['Requerente', 'Instituidor', 'Dependente', 'Representante', 'Requerente Rep.', 'Litsconsorte'];
  }

  // Configurar eventos principais
  setupEvents();
  setupDynamicFieldEvents();

  // Reaplicar estilos das tags de relacionamento para garantir estado padrão
  if (typeof applyRelationshipStyles === 'function') {
    applyRelationshipStyles();
  }

  // Garantir que a função addAuthor esteja disponível globalmente
  window.addAuthor = addAuthor;

  // Restaurar dados para esta etapa
  if (window.formStateManager) {
    const currentStepKey = 'personal';
    console.log(`[personal.js] initModule: Solicitando restauração para a etapa: ${currentStepKey}`);
    window.formStateManager.ensureFormAndRestore(currentStepKey);

    // Após restaurar, disparar validações
    setTimeout(function() {
      // Validar CPF
      document.querySelectorAll('input[name="autor_cpf[]"]').forEach(input => {
        if (typeof validateCPF === 'function') validateCPF(input);
      });

      // Calcular idade
      document.querySelectorAll('input[name="autor_nascimento[]"]').forEach(input => {
        if (typeof validateDateOfBirth === 'function') validateDateOfBirth(input);
      });

      // Nome próprio e apelido
      document.querySelectorAll('input[name="autor_nome[]"], input[name="autor_apelido[]"]').forEach(input => {
        if (typeof formatarNomeProprio === 'function') formatarNomeProprio(input);
      });

      // Reaplicar estilos das tags de relacionamento após restauração de estado
      if (typeof applyRelationshipStyles === 'function') {
        applyRelationshipStyles();
      }
    }, 350);
  }

  // Adicionar listener para o evento formCleared
  document.addEventListener('formCleared', function handleFormCleared() {
    console.log('[personal.js] Evento formCleared recebido. Chamando resetPersonalUI.');
    if (typeof resetPersonalUI === 'function') {
        resetPersonalUI();
    }
  });

  // Configurar botões de navegação usando o sistema padronizado
  if (window.Navigation) {
    window.Navigation.setupNavigationButtons();
  }
}

// Função para resetar a UI da seção de dados pessoais (autores)
function resetPersonalUI() {
  console.log('[personal.js] resetPersonalUI: Iniciando limpeza de autores adicionais.');
  const authorsContainer = document.getElementById('authors-container');
  if (authorsContainer) {
    // Selecionar todos os autores adicionais (ID diferente de author-1 ou que não seja o primeiro author-row)
    // e todos os separadores
    const autoresAdicionais = authorsContainer.querySelectorAll('.author-row:not(:first-child), .author-separator');
    autoresAdicionais.forEach(el => el.remove());
    console.log(`[personal.js] resetPersonalUI: ${autoresAdicionais.length} elementos (autores adicionais e separadores) removidos.`);

    // Resetar o contador de autores para 1 (assumindo que o primeiro autor é estático no HTML)
    window.authorCount = 1;
    console.log('[personal.js] resetPersonalUI: window.authorCount resetado para 1.');

    // Limpar campos do primeiro autor (que pode ter sido preenchido)
    // A função clearForm() em forms.js já deve cuidar disso, mas uma limpeza explícita aqui pode ser um fallback.
    const firstAuthorRow = authorsContainer.querySelector('.author-row:first-child');
    if (firstAuthorRow) {
      firstAuthorRow.querySelectorAll('input, select').forEach(field => {
        if (field.type === 'checkbox' || field.type === 'radio') {
          field.checked = false;
        } else {
          field.value = '';
        }
        if (field.tagName === 'SELECT' && field.options.length > 0) {
          field.selectedIndex = 0;
          // Se houver lógica visual para o select (como relationship tags), resetar aqui também
          const relationshipDiv = field.closest('.relationship-select');
          if (relationshipDiv && typeof updateRelationshipVisual === 'function') {
            updateRelationshipVisual(relationshipDiv, field.options[0].value);
          } else if (relationshipDiv && typeof toggleRelationshipTag === 'function') {
            // Tentar resetar o data-selected e data-value para o padrão
            const defaultValue = field.options[0].value;
            relationshipDiv.setAttribute('data-value', defaultValue);
            relationshipDiv.setAttribute('data-selected', defaultValue);
            // Chamar a função para atualizar visualmente se necessário (pode já estar coberto)
          }
        }
      });
      // Resetar campos de apelido, telefone, senha que estão fora da primeira linha clonada
      // mas associados ao primeiro autor.
      const apelidoAutor1 = document.getElementById('apelido'); // ID original é 'apelido'
      if (apelidoAutor1) apelidoAutor1.value = '';
      const telefoneAutor1 = document.getElementById('telefone'); // ID original é 'telefone'
      if (telefoneAutor1) telefoneAutor1.value = '';
      const senhaAutor1 = document.getElementById('senha_meuinss'); // ID original é 'senha_meuinss'
      if (senhaAutor1) senhaAutor1.value = '';
       console.log('[personal.js] resetPersonalUI: Campos do primeiro autor (author-1) limpos.');
    }
  } else {
    console.warn('[personal.js] resetPersonalUI: Container #authors-container não encontrado.');
  }
  // Garantir que o botão de adicionar autor no primeiro autor esteja visível e o de remover escondido/correto
  const firstAuthorAddButton = document.querySelector('#author-1 .add-author-btn'); // Supondo que o botão add tenha essa classe/id
  const firstAuthorRemoveButton = document.querySelector('#author-1 .remove-author-btn'); // Supondo que o remover tenha essa classe/id

  if(firstAuthorAddButton) firstAuthorAddButton.style.display = 'flex'; // ou 'block' ou o que for apropriado
  if(firstAuthorRemoveButton) firstAuthorRemoveButton.style.display = 'none';

  // Se o primeiro autor tem um select de relacionamento, resetá-lo visualmente
  const firstRelationshipSelectDiv = document.querySelector('#author-1 .relationship-select');
  if (firstRelationshipSelectDiv) {
      const firstSelect = firstRelationshipSelectDiv.querySelector('select');
      if (firstSelect && firstSelect.options.length > 0) {
          firstSelect.value = firstSelect.options[0].value;
          if (typeof updateRelationshipVisual === 'function') {
              updateRelationshipVisual(firstRelationshipSelectDiv, firstSelect.options[0].value);
          }
      }
  }
}
window.resetPersonalUI = resetPersonalUI;

// Função addAuthor SEM o lock interno
function addAuthor() {
  console.log(`[personal.js] addAuthor (programático ou via handler): Iniciando. window.authorCount inicial = ${window.authorCount}`);

  try {
    window.authorCount++;
    console.log(`[personal.js] addAuthor: authorCount incrementado para ${window.authorCount}`);

    // Obter apenas a primeira linha do autor (não a segunda com apelido e telefone)
    const firstAuthorRow = document.querySelector('.author-row .flex.items-center') ||
                           document.querySelector('#author-1 > .flex.items-center');

    if (!firstAuthorRow) {
      console.error('Elemento da primeira linha do autor não encontrado');
      return;
    }

    // Criar uma nova div para o autor
    const newAuthor = document.createElement('div');
    newAuthor.className = 'author-row mb-4';
    newAuthor.id = `author-${window.authorCount}`;

    // Clonar apenas a primeira linha
    const firstRowClone = firstAuthorRow.cloneNode(true);
    newAuthor.appendChild(firstRowClone);

    // Atualizar IDs e names de todos os campos no novo autor
    newAuthor.querySelectorAll('input, select').forEach(field => {
      const originalId = field.id;
      if (originalId) {
        // Extrair o nome base do campo sem o número original (ex: "nome" de "nome_1" ou "nome")
        const baseName = originalId.replace(/_\d+$/, '').replace(/^relationship$/, 'relationship_1'); // Trata "relationship" como "relationship_1" para pegar o nome base
        const newId = `${baseName}_${window.authorCount}`;
        field.id = newId;

        // Definir o atributo 'name' para o formato de array
        // e limpar o valor do campo, e atualizar data-target-age
        switch (baseName) {
          case 'relationship_1': // O ID original do select é relationship_1
            field.name = 'autor_relationship[]';
            console.log(`[personal.js] addAuthor: Campo ${newId} nomeado para autor_relationship[]`);
            break;
          case 'nome':
            field.name = 'autor_nome[]';
            field.value = '';
            field.setAttribute('oninput', 'formatarNomeProprio(this)');
            console.log(`[personal.js] addAuthor: Campo ${newId} nomeado para autor_nome[]`);
            break;
          case 'cpf':
            field.name = 'autor_cpf[]';
            field.value = '';
            console.log(`[personal.js] addAuthor: Campo ${newId} nomeado para autor_cpf[]`);
            // Adicionar máscara e validação de CPF para campos clonados, se FIAP.masks e FIAP.validation estiverem disponíveis
            if (window.FIAP && FIAP.masks && FIAP.validation) {
              field.addEventListener('input', function() {
                FIAP.masks.cpf(this); // A máscara já chama a validação em tempo real
              });
              field.addEventListener('blur', function() { FIAP.validation.cpfRealTime(this); });
            }
            break;
          case 'nascimento':
            field.name = 'autor_nascimento[]';
            field.value = '';
            if (field.hasAttribute('data-target-age')) {
              field.setAttribute('data-target-age', `autor_idade_${window.authorCount}`);
              console.log(`[personal.js] addAuthor: Campo nascimento ${field.id} terá data-target-age: autor_idade_${window.authorCount}`);
            }
            // Adicionar máscara, validação e cálculo de idade para campos de nascimento clonados
            if (window.FIAP && FIAP.masks && FIAP.validation && FIAP.calculation) {
              console.log('[personal.js] addAuthor: FIAP.calculation.age está disponível. Configurando listeners para campo de nascimento clonado:', field.id);
              field.addEventListener('input', function() {
                FIAP.masks.date(this);
                // Validação em tempo real de data de nascimento (exibe erro de data futura imediatamente)
                FIAP.validation.dateOfBirthRealTime(this);
              });
              field.addEventListener('blur', function() {
                console.log(`[personal.js] addAuthor: Evento blur no campo nascimento ${this.id}. Valor: ${this.value}`);
                FIAP.validation.dateOfBirthRealTime(this);
                if (this.dataset.targetAge) {
                  const targetId = this.dataset.targetAge;
                  console.log(`[personal.js] addAuthor: Tentando calcular idade para ${this.id}. Target ID do campo idade: ${targetId}`);
                  const targetElement = document.getElementById(targetId);
                  if (targetElement) {
                    console.log(`[personal.js] addAuthor: Campo de idade ${targetId} ENCONTRADO. Chamando FIAP.calculation.age...`);
                    try {
                      FIAP.calculation.age(this.value, targetId);
                      console.log(`[personal.js] addAuthor: FIAP.calculation.age CHAMDADO para ${this.id} -> ${targetId}. Valor atual do campo idade (${targetId}): ${targetElement.value}`);
                    } catch (e) {
                      console.error(`[personal.js] addAuthor: ERRO ao chamar FIAP.calculation.age para ${targetId}:`, e);
                    }
                  } else {
                    console.warn(`[personal.js] addAuthor: Campo de idade ${targetId} NÃO ENCONTRADO no DOM.`);
                  }
                } else {
                  console.log(`[personal.js] addAuthor: Campo nascimento ${this.id} não possui data-target-age.`);
                }
              });
            } else {
              console.warn('[personal.js] addAuthor: FIAP.calculation.age ou outros módulos FIAP NÃO estão disponíveis para o campo de nascimento clonado:', field.id);
            }
            break;
          case 'idade':
            field.name = 'autor_idade[]';
            field.id = `autor_idade_${window.authorCount}`;
            field.value = ''; // Idade é readonly mas limpamos para consistência
            console.log(`[personal.js] addAuthor: Campo idade ${field.id} nomeado para autor_idade[] e ID corrigido.`);
            // O data-target-age do campo nascimento correspondente já foi atualizado.
            break;
          // Não clonamos apelido, telefone, senha por autor adicional atualmente
        }
      }
    });

    // Atualizar os labels para apontar para os novos IDs
    newAuthor.querySelectorAll('label').forEach(label => {
      const forAttr = label.getAttribute('for');
      if (forAttr) {
        // Extrair o nome base do campo sem o número original (ex: "nome" de "nome_1" ou "cpf" de "cpf_1")
        // Se forAttr for apenas "nome", "cpf", etc. (sem _1), usamos ele mesmo como base.
        const baseNameForLabel = forAttr.includes('_') ? forAttr.substring(0, forAttr.lastIndexOf('_')) : forAttr;
        const newForId = `${baseNameForLabel}_${window.authorCount}`;

        // Caso especial para o label do campo "nome"
        if (baseNameForLabel === 'nome' || baseNameForLabel === 'nome_autor') { // 'nome_autor' como segurança
          label.textContent = 'Nome completo:';
        }

        label.setAttribute('for', newForId);
        console.log(`[personal.js] addAuthor: Label atualizado. For: ${newForId}, TextContent: ${label.textContent}`);
      }
    });

    // Substituir o botão de adicionar por um botão de remover
    const addButton = newAuthor.querySelector('button[title="Adicionar autor"]');
    if (addButton) {
      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.className = 'bg-red-500 hover:bg-red-600 text-white rounded-full p-1 ml-2 flex items-center justify-center w-8 h-8 self-center';
      removeButton.title = 'Remover autor';
      removeButton.innerHTML = '<i class="fas fa-minus"></i>';
      removeButton.onclick = function() { removeSpecificAuthor(window.authorCount); };

      if (addButton.parentNode) {
        addButton.parentNode.replaceChild(removeButton, addButton);
      }
    }

    // Adicionar separador e o novo autor ao container
    const authorsContainer = document.getElementById('authors-container');
    if (authorsContainer) {
      authorsContainer.appendChild(newAuthor);
      console.log(`[personal.js] addAuthor: Novo autor author-${window.authorCount} (elemento ID: ${newAuthor.id}) adicionado ao DOM.`);
    }

    // Aplicar estilos ao novo select de relacionamento
    applyRelationshipStyles();
  } catch (error) {
    console.error('[personal.js] Erro em addAuthor:', error);
  }
}

// Função para ativar/desativar a etiqueta de relacionamento
function toggleRelationshipTag(clickedDivElement) {
  const selectControl = clickedDivElement.querySelector('select');
  if (!selectControl) {
    console.warn('[Personal] toggleRelationshipTag: select não encontrado dentro de:', clickedDivElement);
    return;
  }

  const tagValueToSelect = clickedDivElement.dataset.value;

  if (typeof tagValueToSelect === 'undefined') {
    console.warn('[Personal] toggleRelationshipTag: data-value não definido em:', clickedDivElement);
    return;
  }

  if (selectControl.value === tagValueToSelect) {
    console.log(`[Personal] toggleRelationshipTag: Select já está com o valor '${tagValueToSelect}'. Sem ação.`);
    return;
  }

  selectControl.value = tagValueToSelect;
  console.log(`[Personal] toggleRelationshipTag: Select '${selectControl.name}' value set to '${tagValueToSelect}'`);

  selectControl.dispatchEvent(new Event('change', { bubbles: true }));
  console.log(`[Personal] toggleRelationshipTag: Evento 'change' disparado para select '${selectControl.name}'`);
}

// Função para remover um autor específico pelo seu ID
function removeSpecificAuthor(authorId) {
  if (window.authorCount <= 1) return; // Sempre manter pelo menos um autor

  const authorsContainer = document.getElementById('authors-container');

  // Encontrar o autor a ser removido
  const authorToRemove = document.getElementById(`author-${authorId}`);
  if (!authorToRemove) return;

  // Encontrar o separador anterior (irmão anterior do autor)
  const prevSibling = authorToRemove.previousElementSibling;
  if (prevSibling && prevSibling.classList.contains('author-separator')) {
    authorsContainer.removeChild(prevSibling);
  }

  // Remover o autor
  authorsContainer.removeChild(authorToRemove);

  // Se o autor removido for o último, decrementar o contador
  if (authorId === window.authorCount) {
    window.authorCount--;
  }
}

// Função para remover o último autor (manter para compatibilidade)
function removeLastAuthor() {
  if (window.authorCount <= 1) return; // Sempre manter pelo menos um autor
  removeSpecificAuthor(window.authorCount);
}

// Função para atualizar a etiqueta de relacionamento
function updateRelationshipLabel(selectElement, authorId) {
  let selectedValue = selectElement.value;
  const container = selectElement.closest('.relationship-select');
  // Se não houver valor selecionado, usar valor padrão do HTML ou da primeira opção
  if (!selectedValue && container) {
    const defaultValueFromHTML = container.dataset.value || (selectElement.options[0] && selectElement.options[0].value);
    selectedValue = defaultValueFromHTML;
    selectElement.value = selectedValue;
  }

  // Atualizar a cor/estilo do seletor baseada na opção selecionada
  if (container) {
    container.setAttribute('data-selected', selectedValue);
    container.setAttribute('data-value', selectedValue);
  }
}

// Função para aplicar as classes de estilo às opções do select
function applyRelationshipStyles() {
  // Procurar todos os selects de relacionamento
  const relationshipSelects = document.querySelectorAll('.relationship-select select');

  relationshipSelects.forEach(select => {
    const container = select.closest('.relationship-select');
    if (!container) return;

    let valueToApply = select.value;
    const originalHtmlDataValue = container.dataset.value; // Valor original do data-value no HTML

    // Se o select.value estiver vazio
    if (!select.value) {
      const previousDataSelected = container.getAttribute('data-selected');
      if (previousDataSelected && previousDataSelected.trim() !== '') {
        console.log(`[DEBUG] applyRelationshipStyles: Para select '${select.id || select.name}', select.value é VAZIO, mas data-selected ('${previousDataSelected}') existe. Usando data-selected.`);
        valueToApply = previousDataSelected;
      } else {
        // Se data-selected também não ajudar, usar o valor original do HTML ou um fallback.
        // Para o primeiro autor, o padrão é 'Requerente'. Para os demais, pode ser o primeiro da lista ou um padrão específico.
        if (select.id === 'relationship_1' || (select.name === 'autor_relationship[]' && select.closest('#author-1'))) {
          valueToApply = originalHtmlDataValue || 'Requerente';
        } else if (select.options.length > 0) {
          // Para outros autores, usar o valor da primeira opção como padrão se o valor original do HTML não estiver definido
          valueToApply = originalHtmlDataValue || select.options[0].value;
        } else {
          valueToApply = 'Dependente'; // Um fallback genérico se não houver opções
        }
        console.log(`[DEBUG] applyRelationshipStyles: Para select '${select.id || select.name}', select.value e data-selected estavam vazios. Usando como padrão: '${valueToApply}'.`);
      }
      // Importante: Atualizar o valor do select para que o estado salvo reflita o padrão aplicado.
      select.value = valueToApply;
    }

    // Aplicar a classe inicialmente com base na opção selecionada ou no valor deduzido
    container.setAttribute('data-selected', valueToApply);
    // data-value é usado para o texto da tag via CSS ::after, então deve refletir o valor selecionado.
    container.setAttribute('data-value', valueToApply);

    // Remover estilos inline que possam estar causando conflitos
    container.removeAttribute('style');
    select.removeAttribute('style');

    // Adicionar evento change se ainda não tiver
    if (!select.dataset.styleInitialized) {
      select.dataset.styleInitialized = true;
      select.addEventListener('change', function() {
        const newValue = this.value;
        const currentContainer = this.closest('.relationship-select');
        if (currentContainer) {
          currentContainer.setAttribute('data-selected', newValue);
          currentContainer.setAttribute('data-value', newValue);
        }
      });
    }
  });

  // Adicionar também um evento que reaplicará os estilos ao voltar de outra página
  if (!window.relationshipStylesEventSet) {
    window.addEventListener('pageshow', function(event) {
      if (event.persisted) {
        setTimeout(applyRelationshipStyles, 100);
      }
    });
    window.relationshipStylesEventSet = true;
  }
}

// Exportar funções para o escopo global
window.removeLastAuthor = removeLastAuthor;
window.removeSpecificAuthor = removeSpecificAuthor;
window.updateRelationshipLabel = updateRelationshipLabel;
window.toggleRelationshipTag = toggleRelationshipTag;

// Array de colaboradores pré-cadastrados para demonstração
window.colaboradores = [
  { id: 1, nome: "Ana Silva", cargo: "Assistente Social" },
  { id: 2, nome: "João Oliveira", cargo: "Defensor Público" },
  { id: 3, nome: "Maria Santos", cargo: "Psicóloga" },
  { id: 4, nome: "Carlos Ferreira", cargo: "Médico" },
  { id: 5, nome: "Patrícia Lima", cargo: "Assistente Social" },
  { id: 6, nome: "Roberto Almeida", cargo: "Estagiário" },
  { id: 7, nome: "Fernanda Costa", cargo: "Advogada" },
  { id: 8, nome: "Lucas Martins", cargo: "Técnico Administrativo" },
  { id: 9, nome: "Mariana Souza", cargo: "Assistente Administrativo" },
  { id: 10, nome: "Paulo Ribeiro", cargo: "Defensor Público" }
];

// Função para pesquisar colaboradores
function pesquisarColaboradores(query) {
  if (!query || typeof query !== 'string' || query.length < 2) {
    return [];
  }

  query = query.toLowerCase().trim();
  return window.colaboradores.filter(colab => {
    // Verificar nome
    if (colab.nome.toLowerCase().includes(query)) return true;
    // Verificar cargo
    if (colab.cargo.toLowerCase().includes(query)) return true;
    return false;
  });
}

// Função para renderizar resultados da pesquisa de colaboradores
function renderizarResultadosColaborador(resultados, query) {
  const dropdown = document.getElementById('colaboradorDropdown');
  if (!dropdown) return;

  // Limpar conteúdo
  dropdown.innerHTML = '';

  // Se não houver resultados
  if (!resultados || resultados.length === 0) {
    dropdown.innerHTML = ''; // Limpar qualquer conteúdo anterior
    dropdown.classList.add('hidden'); // Ocultar o dropdown
    return;
  }

  // Criar cabeçalho
  const header = document.createElement('div');
  header.className = 'flex justify-between items-center bg-gray-50 p-2 border border-gray-200 rounded-t';
  header.innerHTML = `
    <span class="text-sm font-medium text-gray-700">Colaboradores encontrados (${resultados.length})</span>
    <button id="btn-close-colaborador" class="text-gray-400 hover:text-gray-600">
      <i class="fas fa-times"></i>
    </button>
  `;
  dropdown.appendChild(header);

  // Criar lista de resultados
  const lista = document.createElement('div');
  lista.className = 'bg-white border border-t-0 border-gray-200 rounded-b max-h-60 overflow-y-auto';

  // Adicionar cada resultado à lista
  resultados.forEach((colab) => {
    const item = document.createElement('div');
    item.className = 'p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 colaborador-resultado';
    item.innerHTML = `
      <div class="font-medium text-gray-800">${colab.nome}</div>
      <div class="text-xs text-gray-500">${colab.cargo}</div>
    `;

    item.addEventListener('click', function() {
      const inputColaborador = document.getElementById('colaborador');
      if (inputColaborador) {
        inputColaborador.value = colab.nome;
        dropdown.classList.add('hidden');
      }
    });

    lista.appendChild(item);
  });

  dropdown.appendChild(lista);
  dropdown.classList.remove('hidden');

  // Adicionar evento para fechar resultados
  document.getElementById('btn-close-colaborador').addEventListener('click', function() {
    dropdown.classList.add('hidden');
  });
}

// Função para configurar o campo de pesquisa de colaboradores
function setupColaboradorSearch() {
  const inputColaborador = document.getElementById('colaborador');
  const dropdownColaborador = document.getElementById('colaboradorDropdown');

  if (!inputColaborador || !dropdownColaborador) return;

  // Sempre esconder o dropdown se o campo já estiver preenchido ao restaurar
  dropdownColaborador.classList.add('hidden');

  // Configurar evento de digitação para pesquisa
  inputColaborador.addEventListener('input', function() {
    const query = this.value.trim();

    // Se a query for muito curta, ocultar dropdown
    if (query.length < 2) {
      dropdownColaborador.classList.add('hidden');
      return;
    }

    // Buscar resultados
    const resultados = pesquisarColaboradores(query);

    // Se só existe um resultado e ele é igual ao valor do campo, não mostrar dropdown
    if (resultados.length === 1 && resultados[0].nome === this.value) {
      dropdownColaborador.classList.add('hidden');
      return;
    }

    // Renderizar resultados
    renderizarResultadosColaborador(resultados, query);
  });

  // Configurar evento de tecla Enter
  inputColaborador.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
      event.preventDefault();

      // Se o dropdown estiver visível, selecionar o primeiro resultado
      if (!dropdownColaborador.classList.contains('hidden')) {
        const primeiroResultado = dropdownColaborador.querySelector('.colaborador-resultado');
        if (primeiroResultado) {
          primeiroResultado.click();
          return;
        }
      }

      // Se não há resultados visíveis, adicionar o texto digitado como colaborador
      if (this.value.trim()) {
        this.value = this.value.trim();
        dropdownColaborador.classList.add('hidden');
      }
    }
  });

  // Fechar dropdown ao clicar fora
  document.addEventListener('click', function(event) {
    if (!dropdownColaborador.contains(event.target) && event.target !== inputColaborador) {
      dropdownColaborador.classList.add('hidden');
    }
  });

  // Sempre esconder o dropdown ao restaurar a página
  window.addEventListener('pageshow', function() {
    dropdownColaborador.classList.add('hidden');
  });
}

// Função para configurar os eventos da página
function setupEvents() {
  // Inicializar estilos para os selects de relacionamento
  applyRelationshipStyles();

  // Lista de campos para salvar individualmente na aba Pessoal
  const fieldsToUpdatePersonal = [
    // Campos do autor principal foram movidos para persistência de array (autor_nome[], autor_cpf[], etc.)
    // 'nome', 'cpf', 'nascimento', 'apelido', 'telefone', 'telefone_detalhes', 'relationship_1',
    'colaborador', // Campo único de colaborador
    'cep', 'endereco', 'numero', 'bairro', 'cidade', 'uf', // Endereço
    'observacoes', // Observações gerais da página
    'telefone_whatsapp_ativo' // Checkbox único do telefone principal
    // Adicionar outros IDs de campos estáticos da aba pessoal aqui, se necessário
  ];

  fieldsToUpdatePersonal.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      const eventType = (field.type === 'checkbox' || field.type === 'radio' || field.tagName === 'SELECT') ? 'change' : 'blur';
      field.addEventListener(eventType, function() {
        let valueToSave = this.type === 'checkbox' ? this.checked : this.value;
        if (window.formStateManager && typeof window.formStateManager.updateSpecificField === 'function') {
          const currentKnownValue = window.formStateManager.formData.personal[this.id];
          if (currentKnownValue !== valueToSave && !this.readOnly) {
              console.log(`[personal.js] Evento '${eventType}' no campo '${this.id}'. Valor DOM: '${valueToSave}', Valor no State: '${currentKnownValue}'. ATUALIZANDO.`);
              window.formStateManager.updateSpecificField('personal', this.id, valueToSave);
          } else if (this.readOnly) {
              console.log(`[personal.js] Evento '${eventType}' no campo '${this.id}'. Campo é readOnly. NÃO atualizando state.`);
          } else {
              console.log(`[personal.js] Evento '${eventType}' no campo '${this.id}'. Valor DOM: '${valueToSave}', Valor no State: '${currentKnownValue}'. SEM MUDANÇA. NÃO atualizando state.`);
          }
        }
      });
    }
  });

  // Restaurar estado do Checkbox de WhatsApp para o telefone principal
  try {
    const whatsAppCheckbox = document.getElementById('telefone_whatsapp_ativo');

    if (whatsAppCheckbox && window.formStateManager && window.formStateManager.formData && window.formStateManager.formData.personal) {
      // O FormStateManager salva 'true'/'false' como strings
      const temWhatsApp = window.formStateManager.formData.personal.telefone_whatsapp_ativo === 'true';
      whatsAppCheckbox.checked = temWhatsApp;
    } else {
      if (!whatsAppCheckbox) console.warn('Checkbox de WhatsApp (telefone_whatsapp_ativo) não encontrado para restauração.');
    }
  } catch (e) {
    console.error('Erro ao restaurar estado do checkbox de WhatsApp:', e);
  }

  // Botão de remover autor (o primeiro, que não é dinâmico)
  const removeAuthorButton = document.querySelector('.remove-author-button');
  if (removeAuthorButton) {
    // Este botão só deve remover o autor se houver mais de um.
    // A lógica de remover autor específico já cuida disso.
    // A remoção do primeiro autor deve ser tratada com cuidado ou desabilitada.
  }

  // Configurar validação para campos de data e CPF
  const dataNascimentoField = document.getElementById('nascimento');
  if (dataNascimentoField) {
    dataNascimentoField.addEventListener('blur', function() {
      FIAP.validation.dateOfBirthRealTime(this);
      if (this.dataset.targetAge) {
        FIAP.calculation.age(this.value, this.dataset.targetAge);
      }
    });
  }

  const cpfField = document.getElementById('cpf');
  if (cpfField) {
    cpfField.addEventListener('input', function() {
      FIAP.masks.cpf(this); // A máscara já chama a validação em tempo real
    });
    cpfField.addEventListener('blur', function() { FIAP.validation.cpfRealTime(this); });
  }

  // Configurar máscara de telefone
  const telefoneField = document.getElementById('telefone');
  if (telefoneField) {
    telefoneField.addEventListener('input', function() { FIAP.masks.phone(this); });
  }

  // Adicionar evento de clique aos botões de navegação (próximo/anterior)
  const btnNext = document.getElementById('btn-next');
  const btnBack = document.getElementById('btn-back');

  if (btnNext) {
    // Remover eventuais listeners antigos para evitar duplicação
    const newBtnNext = btnNext.cloneNode(true);
    btnNext.parentNode.replaceChild(newBtnNext, btnNext);

    let isNavigating = false;
    newBtnNext.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();

      if (isNavigating) return;
      isNavigating = true;

      const originalText = this.innerHTML;
      this.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Carregando...';
      this.disabled = true;
      this.classList.add('opacity-75');

      try {
        // <<< INÍCIO DA MODIFICAÇÃO: Adicionar Logs ANTES da captura >>>
        if (window.formStateManager) {
          const bairroField = document.getElementById('bairro');
          const enderecoField = document.getElementById('endereco');
          console.log(`[PersonalJS - btnNext] ANTES da captura. Bairro DOM: '${bairroField ? bairroField.value : 'N/A'}', Endereco DOM: '${enderecoField ? enderecoField.value : 'N/A'}'`);
          if (window.formStateManager.formData && window.formStateManager.formData.personal) {
            console.log(`[PersonalJS - btnNext] ANTES da captura. Bairro State: '${window.formStateManager.formData.personal.bairro}', Endereco State: '${window.formStateManager.formData.personal.endereco}'`);
          } else {
            console.log("[PersonalJS - btnNext] ANTES da captura. formData.personal não disponível no state.");
          }
        }
        // <<< FIM DA MODIFICAÇÃO >>>

        if (window.formStateManager && typeof window.formStateManager.captureCurrentFormData === 'function') {
          console.log('Capturando dados do formulário pessoal...');
          window.formStateManager.captureCurrentFormData();
        } else {
          console.warn('formStateManager ou captureCurrentFormData não está disponível.');
        }

        // Pequeno atraso para garantir que a captura de dados (se houver) seja processada
        setTimeout(() => {
          if (typeof navigateTo === 'function') {
            console.log('Navegando para a próxima etapa: social');
            navigateTo('social'); // Assumindo que 'social' é a próxima etapa
          } else {
            console.error('Função navigateTo não encontrada.');
            this.innerHTML = originalText; // Restaura o botão em caso de erro
            this.disabled = false;
            this.classList.remove('opacity-75');
            isNavigating = false;
          }

          // O botão será re-habilitado pela mudança de página ou se a navegação falhar no catch
        }, 100);

      } catch (error) {
        console.error('Erro ao tentar navegar ou capturar dados:', error);
        this.innerHTML = originalText;
        this.disabled = false;
        this.classList.remove('opacity-75');
        isNavigating = false;
      }
    });
  }

  if (btnBack) {
    // Remover eventuais listeners antigos para evitar duplicação
    const newBtnBack = btnBack.cloneNode(true);
    btnBack.parentNode.replaceChild(newBtnBack, btnBack);

    newBtnBack.addEventListener('click', function() {
      if (typeof navigateTo === 'function') {
        navigateTo('home'); // Ou a etapa anterior correta, ex: 'welcome' ou a identificada pelo router
      } else {
        console.error('Função navigateTo não encontrada para voltar.');
      }
    });
  }

  // Configurar a busca de colaboradores
  setupColaboradorSearch();
  setupCidadeSearch();

  // Configurar a capitalização automática
  if (typeof setupAutoCapitalize === 'function') {
    setupAutoCapitalize();
  }
}

// Função para configurar os eventos dinâmicos do módulo
function setupDynamicFieldEvents() {
  const addAuthorButton = document.querySelector('.add-author-button');
  if (addAuthorButton) {
    // Garantir que o listener seja adicionado apenas uma vez
    if (!addAuthorButton.dataset.customClickListener) {
      addAuthorButton.addEventListener('click', handleAddAuthorClick);
      addAuthorButton.dataset.customClickListener = 'true';
    }
  }
}

// Novo handler para o clique do botão Adicionar Autor, contendo o lock
function handleAddAuthorClick() {
  if (window._addingAuthorFromButtonClick) {
    console.log('[personal.js] handleAddAuthorClick: Lock ativo, prevenindo novo clique.');
    return;
  }
  window._addingAuthorFromButtonClick = true;
  console.log('[personal.js] handleAddAuthorClick: Botão Adicionar Autor clicado, lock ativado.');

  try {
    addAuthor(); // Chama a função addAuthor (que agora está sem lock interno)
  } catch (error) {
    console.error('[personal.js] handleAddAuthorClick: Erro ao chamar addAuthor:', error);
  } finally {
    setTimeout(() => {
      window._addingAuthorFromButtonClick = false;
      console.log('[personal.js] handleAddAuthorClick: Lock do botão Adicionar Autor liberado.');
    }, 300); // Lock para cliques do usuário
  }
}

// Função para configurar o campo de busca de cidades
function setupCidadeSearch() {
  const inputCidade = document.getElementById('cidade');
  const dropdownCidade = document.getElementById('cidadeDropdown');
  if (!inputCidade || !dropdownCidade) return;

  // Sempre esconder o dropdown se o campo já estiver preenchido ao restaurar
  dropdownCidade.classList.add('hidden');

  inputCidade.addEventListener('input', function() {
    const query = this.value.trim();
    if (query.length < 2) {
      dropdownCidade.classList.add('hidden');
      return;
    }
    // Buscar cidades (usa buscarCidades do address.js)
    if (typeof buscarCidades === 'function') {
      buscarCidades(inputCidade);
    }
  });

  // Sempre esconder o dropdown ao restaurar a página
  window.addEventListener('pageshow', function() {
    dropdownCidade.classList.add('hidden');
  });
}

// Chamar setupCidadeSearch no setupEvents
function setupEvents() {
  // Inicializar estilos para os selects de relacionamento
  applyRelationshipStyles();

  // Lista de campos para salvar individualmente na aba Pessoal
  const fieldsToUpdatePersonal = [
    // Campos do autor principal foram movidos para persistência de array (autor_nome[], autor_cpf[], etc.)
    // 'nome', 'cpf', 'nascimento', 'apelido', 'telefone', 'telefone_detalhes', 'relationship_1',
    'colaborador', // Campo único de colaborador
    'cep', 'endereco', 'numero', 'bairro', 'cidade', 'uf', // Endereço
    'observacoes', // Observações gerais da página
    'telefone_whatsapp_ativo' // Checkbox único do telefone principal
    // Adicionar outros IDs de campos estáticos da aba pessoal aqui, se necessário
  ];

  fieldsToUpdatePersonal.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      const eventType = (field.type === 'checkbox' || field.type === 'radio' || field.tagName === 'SELECT') ? 'change' : 'blur';
      field.addEventListener(eventType, function() {
        let valueToSave = this.type === 'checkbox' ? this.checked : this.value;
        if (window.formStateManager && typeof window.formStateManager.updateSpecificField === 'function') {
          const currentKnownValue = window.formStateManager.formData.personal[this.id];
          if (currentKnownValue !== valueToSave && !this.readOnly) {
              console.log(`[personal.js] Evento '${eventType}' no campo '${this.id}'. Valor DOM: '${valueToSave}', Valor no State: '${currentKnownValue}'. ATUALIZANDO.`);
              window.formStateManager.updateSpecificField('personal', this.id, valueToSave);
          } else if (this.readOnly) {
              console.log(`[personal.js] Evento '${eventType}' no campo '${this.id}'. Campo é readOnly. NÃO atualizando state.`);
          } else {
              console.log(`[personal.js] Evento '${eventType}' no campo '${this.id}'. Valor DOM: '${valueToSave}', Valor no State: '${currentKnownValue}'. SEM MUDANÇA. NÃO atualizando state.`);
          }
        }
      });
    }
  });

  // Restaurar estado do Checkbox de WhatsApp para o telefone principal
  try {
    const whatsAppCheckbox = document.getElementById('telefone_whatsapp_ativo');

    if (whatsAppCheckbox && window.formStateManager && window.formStateManager.formData && window.formStateManager.formData.personal) {
      // O FormStateManager salva 'true'/'false' como strings
      const temWhatsApp = window.formStateManager.formData.personal.telefone_whatsapp_ativo === 'true';
      whatsAppCheckbox.checked = temWhatsApp;
    } else {
      if (!whatsAppCheckbox) console.warn('Checkbox de WhatsApp (telefone_whatsapp_ativo) não encontrado para restauração.');
    }
  } catch (e) {
    console.error('Erro ao restaurar estado do checkbox de WhatsApp:', e);
  }

  // Botão de remover autor (o primeiro, que não é dinâmico)
  const removeAuthorButton = document.querySelector('.remove-author-button');
  if (removeAuthorButton) {
    // Este botão só deve remover o autor se houver mais de um.
    // A lógica de remover autor específico já cuida disso.
    // A remoção do primeiro autor deve ser tratada com cuidado ou desabilitada.
  }

  // Configurar validação para campos de data e CPF
  const dataNascimentoField = document.getElementById('nascimento');
  if (dataNascimentoField) {
    dataNascimentoField.addEventListener('blur', function() {
      FIAP.validation.dateOfBirthRealTime(this);
      if (this.dataset.targetAge) {
        FIAP.calculation.age(this.value, this.dataset.targetAge);
      }
    });
  }

  const cpfField = document.getElementById('cpf');
  if (cpfField) {
    cpfField.addEventListener('input', function() {
      FIAP.masks.cpf(this); // A máscara já chama a validação em tempo real
    });
    cpfField.addEventListener('blur', function() { FIAP.validation.cpfRealTime(this); });
  }

  // Configurar máscara de telefone
  const telefoneField = document.getElementById('telefone');
  if (telefoneField) {
    telefoneField.addEventListener('input', function() { FIAP.masks.phone(this); });
  }

  // Adicionar evento de clique aos botões de navegação (próximo/anterior)
  const btnNext = document.getElementById('btn-next');
  const btnBack = document.getElementById('btn-back');

  if (btnNext) {
    // Remover eventuais listeners antigos para evitar duplicação
    const newBtnNext = btnNext.cloneNode(true);
    btnNext.parentNode.replaceChild(newBtnNext, btnNext);

    let isNavigating = false;
    newBtnNext.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();

      if (isNavigating) return;
      isNavigating = true;

      const originalText = this.innerHTML;
      this.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Carregando...';
      this.disabled = true;
      this.classList.add('opacity-75');

      try {
        // <<< INÍCIO DA MODIFICAÇÃO: Adicionar Logs ANTES da captura >>>
        if (window.formStateManager) {
          const bairroField = document.getElementById('bairro');
          const enderecoField = document.getElementById('endereco');
          console.log(`[PersonalJS - btnNext] ANTES da captura. Bairro DOM: '${bairroField ? bairroField.value : 'N/A'}', Endereco DOM: '${enderecoField ? enderecoField.value : 'N/A'}'`);
          if (window.formStateManager.formData && window.formStateManager.formData.personal) {
            console.log(`[PersonalJS - btnNext] ANTES da captura. Bairro State: '${window.formStateManager.formData.personal.bairro}', Endereco State: '${window.formStateManager.formData.personal.endereco}'`);
          } else {
            console.log("[PersonalJS - btnNext] ANTES da captura. formData.personal não disponível no state.");
          }
        }
        // <<< FIM DA MODIFICAÇÃO >>>

        if (window.formStateManager && typeof window.formStateManager.captureCurrentFormData === 'function') {
          console.log('Capturando dados do formulário pessoal...');
          window.formStateManager.captureCurrentFormData();
        } else {
          console.warn('formStateManager ou captureCurrentFormData não está disponível.');
        }

        // Pequeno atraso para garantir que a captura de dados (se houver) seja processada
        setTimeout(() => {
          if (typeof navigateTo === 'function') {
            console.log('Navegando para a próxima etapa: social');
            navigateTo('social'); // Assumindo que 'social' é a próxima etapa
          } else {
            console.error('Função navigateTo não encontrada.');
            this.innerHTML = originalText; // Restaura o botão em caso de erro
            this.disabled = false;
            this.classList.remove('opacity-75');
            isNavigating = false;
          }

          // O botão será re-habilitado pela mudança de página ou se a navegação falhar no catch
        }, 100);

      } catch (error) {
        console.error('Erro ao tentar navegar ou capturar dados:', error);
        this.innerHTML = originalText;
        this.disabled = false;
        this.classList.remove('opacity-75');
        isNavigating = false;
      }
    });
  }

  if (btnBack) {
    // Remover eventuais listeners antigos para evitar duplicação
    const newBtnBack = btnBack.cloneNode(true);
    btnBack.parentNode.replaceChild(newBtnBack, btnBack);

    newBtnBack.addEventListener('click', function() {
      if (typeof navigateTo === 'function') {
        navigateTo('home'); // Ou a etapa anterior correta, ex: 'welcome' ou a identificada pelo router
      } else {
        console.error('Função navigateTo não encontrada para voltar.');
      }
    });
  }

  // Configurar a busca de colaboradores
  setupColaboradorSearch();
  setupCidadeSearch();

  // Configurar a capitalização automática
  if (typeof setupAutoCapitalize === 'function') {
    setupAutoCapitalize();
  }
}
