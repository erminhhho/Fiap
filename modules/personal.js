0/**
 * Módulo de Dados Pessoais
 */

// Limpar função de inicialização anterior
window.initModule = null;

// Definir nova função de inicialização do módulo
window.initModule = function() {
  console.log('Inicializando módulo de dados pessoais e configurando eventos...');

  // Contador global de autores - usando window para evitar redeclaração
  if (typeof window.authorCount === 'undefined') {
    window.authorCount = 1;
  }

  // Array com etiquetas para os autores adicionais - usando window para evitar redeclaração
  if (typeof window.authorLabels === 'undefined') {
    window.authorLabels = ['Requerente', 'Instituidor', 'Dependente', 'Representante', 'Requerente Rep.', 'Litsconsorte'];
  }

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

  window._personalInitialized = true;
  window.forceModuleReload = false;

  setupEvents();
  setupDynamicFieldEvents();

  document.addEventListener('stepChanged', function handleStepChange() {
    window._personalInitialized = false;
    document.removeEventListener('stepChanged', handleStepChange);
  }, { once: true });

  window.addAuthor = addAuthor;

  if (window.formStateManager) {
    const currentStepKey = 'personal';
    console.log(`[personal.js] initModule: Solicitando restauração para a etapa: ${currentStepKey}`);
    window.formStateManager.ensureFormAndRestore(currentStepKey);
  }
  console.log('[personal.js] Módulo totalmente inicializado e restauração solicitada.');
};

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
            console.log(`[personal.js] addAuthor: Campo ${newId} nomeado para autor_nome[]`);
            break;
          case 'cpf':
            field.name = 'autor_cpf[]';
            field.value = '';
            console.log(`[personal.js] addAuthor: Campo ${newId} nomeado para autor_cpf[]`);
            // Adicionar máscara e validação de CPF para campos clonados, se FIAP.masks e FIAP.validation estiverem disponíveis
            if (window.FIAP && FIAP.masks && FIAP.validation) {
              field.addEventListener('input', function() { FIAP.masks.cpf(this); });
              field.addEventListener('blur', function() { FIAP.validation.cpfRealTime(this); });
            }
            break;
          case 'nascimento':
            field.name = 'autor_nascimento[]';
            field.value = '';
            if (field.hasAttribute('data-target-age')) {
              field.setAttribute('data-target-age', `autor_idade_${window.authorCount}`); // ID do campo idade correspondente
            }
            // Adicionar máscara, validação e cálculo de idade para campos de nascimento clonados
            if (window.FIAP && FIAP.masks && FIAP.validation && FIAP.calculation) {
              field.addEventListener('input', function() { FIAP.masks.date(this); }); // Adiciona máscara de data
              field.addEventListener('blur', function() {
                FIAP.validation.dateOfBirthRealTime(this);
                if (this.dataset.targetAge) {
                  const targetId = this.dataset.targetAge; // Deve ser algo como autor_idade_2
                  FIAP.calculation.age(this.value, targetId);
                }
              });
            }
            break;
          case 'idade':
            field.name = 'autor_idade[]';
            field.value = ''; // Idade é readonly mas limpamos para consistência
            // O ID do campo idade já deve ser atualizado para autor_idade_X pela lógica de newId
            // e o data-target-age do campo nascimento correspondente também.
            break;
          // Não clonamos apelido, telefone, senha por autor adicional atualmente
        }
      }
    });

    // Atualizar os labels para apontar para os novos IDs
    newAuthor.querySelectorAll('label').forEach(label => {
      const forAttr = label.getAttribute('for');
      if (forAttr) {
        const baseNameOriginal = forAttr.replace(/(_\d+$|^\w+$)/, '');
        const newFor = baseNameOriginal ? `${baseNameOriginal}_${window.authorCount}` : `${forAttr}_${window.authorCount}`;
        label.setAttribute('for', newFor);

        // Se esta é a label do campo nome recém-clonado, definir seu texto para "Nome"
        // O ID do campo nome clonado será algo como "nome_2", "nome_3", etc.
        if (newFor === `nome_${window.authorCount}`) {
          label.textContent = 'Nome';
        }
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
    const separator = document.createElement('div');
    separator.className = 'author-separator border-t border-gray-200 my-4';

    const authorsContainer = document.getElementById('authors-container');
    if (authorsContainer) {
      authorsContainer.appendChild(separator);
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
function toggleRelationshipTag(element) {
  // Obter o tipo de relacionamento atual
  const currentRelationship = element.getAttribute('data-selected');
  const relationshipValue = element.getAttribute('data-value') || element.querySelector('select').value;

  // Garantir que sempre tenhamos o data-value para aplicar a cor correta
  if (!element.hasAttribute('data-value')) {
    element.setAttribute('data-value', relationshipValue);
  }

  // Se já tem um relacionamento selecionado, vamos deixá-lo no formato padrão
  if (currentRelationship) {
    element.removeAttribute('data-selected');
  } else {
    // Caso contrário, vamos usar o valor do data-value como o tipo de relacionamento selecionado
    element.setAttribute('data-selected', relationshipValue);
  }
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
  const selectedValue = selectElement.value;
  // const nameField = document.getElementById(`nome_${authorId}`); // Não é mais necessário para a label

  // A label do nome deve permanecer "Nome". O tipo de relacionamento é indicado pelo estilo do select.
  // const nameLabel = document.querySelector(`label[for="nome_${authorId > 1 ? '_' + authorId : ''}"]`);
  // if (nameLabel) {
  //   nameLabel.textContent = selectedValue; // REMOVER OU COMENTAR ESTA LINHA
  // }

  // Atualizar a cor/estilo do seletor baseada na opção selecionada
  const relationshipSelect = selectElement.closest('.relationship-select');
  if (relationshipSelect) {
    relationshipSelect.setAttribute('data-selected', selectedValue);
    relationshipSelect.setAttribute('data-value', selectedValue); // Atualizar o data-value para exibir o texto correto
  }
}

// Função para aplicar as classes de estilo às opções do select
function applyRelationshipStyles() {
  // Procurar todos os selects de relacionamento
  const relationshipSelects = document.querySelectorAll('.relationship-select select');

  relationshipSelects.forEach(select => {
    // Aplicar a classe inicialmente com base na opção selecionada
    const selectedValue = select.value;
    const container = select.closest('.relationship-select');

    if (container) {
      // Garantir que tanto data-selected quanto data-value estejam configurados
      container.setAttribute('data-selected', selectedValue);
      container.setAttribute('data-value', selectedValue);

      // Remover estilos inline que possam estar causando conflitos
      container.removeAttribute('style');
      select.removeAttribute('style');

      // Garantir que o texto da etiqueta está sempre atualizado
      // Não precisamos mais adicionar o texto manualmente porque estamos usando ::after no CSS
    }

    // Adicionar evento change se ainda não tiver
    if (!select.dataset.styleInitialized) {
      select.dataset.styleInitialized = true;

      // Adicionar um evento onchange para atualizar o data-value quando a seleção mudar
      select.addEventListener('change', function() {
        const newValue = this.value;
        const container = this.closest('.relationship-select');
        if (container) {
          // Atualizar tanto data-selected quanto data-value para manter a consistência visual
          container.setAttribute('data-selected', newValue);
          container.setAttribute('data-value', newValue);
        }
      });
    }
  });

  // Adicionar também um evento que reaplicará os estilos ao voltar de outra página
  if (!window.relationshipStylesEventSet) {
    window.addEventListener('pageshow', function(event) {
      // Se a página foi carregada do cache (ao navegar com o botão voltar)
      if (event.persisted) {
        setTimeout(applyRelationshipStyles, 100); // Aplicar estilos com um pequeno delay
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
    dropdown.innerHTML = `
      <div class="p-4 text-center text-gray-500 bg-white border border-gray-200 rounded-b">
        Nenhum colaborador encontrado para "${query}"
      </div>
      <div class="p-3 bg-blue-50 hover:bg-blue-100 cursor-pointer border border-blue-200 text-center transition-colors rounded-b">
        <i class="fas fa-plus-circle text-blue-500 mr-2"></i>
        <span>Adicionar novo colaborador</span>
      </div>
    `;

    // Adicionar evento para o botão de criar novo
    const btnCriar = dropdown.querySelector('.bg-blue-50');
    if (btnCriar) {
      btnCriar.addEventListener('click', () => {
        const inputColaborador = document.getElementById('colaborador');
        if (inputColaborador) {
          inputColaborador.value = query;
          dropdown.classList.add('hidden');
        }
      });
    }

    dropdown.classList.remove('hidden');
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
    if (!dropdownColaborador.contains(event.target) &&
        event.target !== inputColaborador) {
      dropdownColaborador.classList.add('hidden');
    }
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
          window.formStateManager.updateSpecificField('personal', this.id, valueToSave);
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
    cpfField.addEventListener('input', function() { FIAP.masks.cpf(this); });
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
