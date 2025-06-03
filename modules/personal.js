0/**
 * MÃ³dulo de Dados Pessoais
 */

// Limpar funÃ§Ã£o de inicializaÃ§Ã£o anterior
window.initModule = null;

// Definir nova funÃ§Ã£o de inicializaÃ§Ã£o do mÃ³dulo
window.initModule = function() {
  console.log('Inicializando mÃ³dulo de dados pessoais e configurando eventos...');

  // ForÃ§ar reinicializaÃ§Ã£o do mÃ³dulo ao acessar diretamente pela URL
  if (window.location.hash === '#personal') {
    window._personalInitialized = false;
  }

  // Verificar se o mÃ³dulo jÃ¡ foi inicializado nesta sessÃ£o
  if (window._personalInitialized && !window.forceModuleReload) {
    console.log('MÃ³dulo de dados pessoais jÃ¡ inicializado.');
    setupDynamicFieldEvents();
    return;
  }

  // Inicializar o conteÃºdo da pÃ¡gina de forma estruturada
  initializePageContent();

  window._personalInitialized = true;
  window.forceModuleReload = false;

  // Limpar flag quando a pÃ¡gina mudar
  document.addEventListener('stepChanged', function handleStepChange() {
    window._personalInitialized = false;
    document.removeEventListener('stepChanged', handleStepChange);
  }, { once: true });

  console.log('[personal.js] MÃ³dulo totalmente inicializado e restauraÃ§Ã£o solicitada.');
};

// FunÃ§Ã£o que centraliza a inicializaÃ§Ã£o do conteÃºdo da pÃ¡gina
function initializePageContent() {
  // Contador global de autores - usando window para evitar redeclaraÃ§Ã£o
  if (typeof window.authorCount === 'undefined') {
    window.authorCount = 1;
  }

  // Array com etiquetas para os autores adicionais - usando window para evitar redeclaraÃ§Ã£o
  if (typeof window.authorLabels === 'undefined') {
    window.authorLabels = ['Requerente', 'Instituidor', 'Dependente', 'Representante', 'Requerente Rep.', 'Litsconsorte'];
  }

  // Configurar eventos principais
  setupEvents();
  setupDynamicFieldEvents();

  // Reaplicar estilos das tags de relacionamento para garantir estado padrÃ£o
  if (typeof applyRelationshipStyles === 'function') {
    applyRelationshipStyles();
  }

  // Garantir que a funÃ§Ã£o addAuthor esteja disponÃ­vel globalmente
  window.addAuthor = addAuthor;

  // Restaurar dados para esta etapa
  if (window.formStateManager) {
    const currentStepKey = 'personal';
    console.log(`[personal.js] initModule: Solicitando restauraÃ§Ã£o para a etapa: ${currentStepKey}`);
    window.formStateManager.ensureFormAndRestore(currentStepKey);

    // ApÃ³s restaurar, disparar validaÃ§Ãµes
    setTimeout(function() {
      // Validar CPF
      document.querySelectorAll('input[name="autor_cpf[]"]').forEach(input => {
        if (typeof validateCPF === 'function') validateCPF(input);
      });

      // Calcular idade
      document.querySelectorAll('input[name="autor_nascimento[]"]').forEach(input => {
        if (typeof validateDateOfBirth === 'function') validateDateOfBirth(input);
      });

      // Nome prÃ³prio e apelido
      document.querySelectorAll('input[name="autor_nome[]"], input[name="autor_apelido[]"]').forEach(input => {
        if (typeof formatarNomeProprio === 'function') formatarNomeProprio(input);
      });

      // Reaplicar estilos das tags de relacionamento apÃ³s restauraÃ§Ã£o de estado
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

  // Configurar botÃµes de navegaÃ§Ã£o usando o sistema padronizado
  if (window.Navigation) {
    window.Navigation.setupNavigationButtons();
  }
}

// FunÃ§Ã£o para resetar a UI da seÃ§Ã£o de dados pessoais (autores)
function resetPersonalUI() {
  console.log('[personal.js] resetPersonalUI: Iniciando limpeza de autores adicionais.');
  const authorsContainer = document.getElementById('authors-container');
  if (authorsContainer) {
    // Selecionar todos os autores adicionais (ID diferente de author-1 ou que nÃ£o seja o primeiro author-row)
    // e todos os separadores
    const autoresAdicionais = authorsContainer.querySelectorAll('.author-row:not(:first-child), .author-separator');
    autoresAdicionais.forEach(el => el.remove());
    console.log(`[personal.js] resetPersonalUI: ${autoresAdicionais.length} elementos (autores adicionais e separadores) removidos.`);

    // Resetar o contador de autores para 1 (assumindo que o primeiro autor Ã© estÃ¡tico no HTML)
    window.authorCount = 1;
    console.log('[personal.js] resetPersonalUI: window.authorCount resetado para 1.');

    // Limpar campos do primeiro autor (que pode ter sido preenchido)
    // A funÃ§Ã£o clearForm() em forms.js jÃ¡ deve cuidar disso, mas uma limpeza explÃ­cita aqui pode ser um fallback.
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
          // Se houver lÃ³gica visual para o select (como relationship tags), resetar aqui tambÃ©m
          const relationshipDiv = field.closest('.relationship-select');
          if (relationshipDiv && typeof updateRelationshipVisual === 'function') {
            updateRelationshipVisual(relationshipDiv, field.options[0].value);
          } else if (relationshipDiv && typeof toggleRelationshipTag === 'function') {
            // Tentar resetar o data-selected e data-value para o padrÃ£o
            const defaultValue = field.options[0].value;
            relationshipDiv.setAttribute('data-value', defaultValue);
            relationshipDiv.setAttribute('data-selected', defaultValue);
            // Chamar a funÃ§Ã£o para atualizar visualmente se necessÃ¡rio (pode jÃ¡ estar coberto)
          }
        }
      });
      // Resetar campos de apelido, telefone, senha que estÃ£o fora da primeira linha clonada
      // mas associados ao primeiro autor.
      const apelidoAutor1 = document.getElementById('apelido'); // ID original Ã© 'apelido'
      if (apelidoAutor1) apelidoAutor1.value = '';
      const telefoneAutor1 = document.getElementById('telefone'); // ID original Ã© 'telefone'
      if (telefoneAutor1) telefoneAutor1.value = '';
      const senhaAutor1 = document.getElementById('senha_meuinss'); // ID original Ã© 'senha_meuinss'
      if (senhaAutor1) senhaAutor1.value = '';
       console.log('[personal.js] resetPersonalUI: Campos do primeiro autor (author-1) limpos.');
    }
  } else {
    console.warn('[personal.js] resetPersonalUI: Container #authors-container nÃ£o encontrado.');
  }
  // Garantir que o botÃ£o de adicionar autor no primeiro autor esteja visÃ­vel e o de remover escondido/correto
  const firstAuthorAddButton = document.querySelector('#author-1 .add-author-btn'); // Supondo que o botÃ£o add tenha essa classe/id
  const firstAuthorRemoveButton = document.querySelector('#author-1 .remove-author-btn'); // Supondo que o remover tenha essa classe/id

  if(firstAuthorAddButton) firstAuthorAddButton.style.display = 'flex'; // ou 'block' ou o que for apropriado
  if(firstAuthorRemoveButton) firstAuthorRemoveButton.style.display = 'none';

  // Se o primeiro autor tem um select de relacionamento, resetÃ¡-lo visualmente
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

// FunÃ§Ã£o addAuthor SEM o lock interno
function addAuthor() {
  console.log(`[personal.js] addAuthor (programÃ¡tico ou via handler): Iniciando. window.authorCount inicial = ${window.authorCount}`);

  try {
    window.authorCount++;
    console.log(`[personal.js] addAuthor: authorCount incrementado para ${window.authorCount}`);

    // Obter apenas a primeira linha do autor (nÃ£o a segunda com apelido e telefone)
    const firstAuthorRow = document.querySelector('.author-row .flex.items-center') ||
                           document.querySelector('#author-1 > .flex.items-center');

    if (!firstAuthorRow) {
      console.error('Elemento da primeira linha do autor nÃ£o encontrado');
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
        // Extrair o nome base do campo sem o nÃºmero original (ex: "nome" de "nome_1" ou "nome")
        const baseName = originalId.replace(/_\d+$/, '').replace(/^relationship$/, 'relationship_1'); // Trata "relationship" como "relationship_1" para pegar o nome base
        const newId = `${baseName}_${window.authorCount}`;
        field.id = newId;

        // Definir o atributo 'name' para o formato de array
        // e limpar o valor do campo, e atualizar data-target-age
        switch (baseName) {
          case 'relationship_1': // O ID original do select Ã© relationship_1
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
            // Adicionar mÃ¡scara e validaÃ§Ã£o de CPF para campos clonados, se FIAP.masks e FIAP.validation estiverem disponÃ­veis
            if (window.FIAP && FIAP.masks && FIAP.validation) {
              field.addEventListener('input', function() {
                FIAP.masks.cpf(this); // A mÃ¡scara jÃ¡ chama a validaÃ§Ã£o em tempo real
              });
              field.addEventListener('blur', function() { FIAP.validation.cpfRealTime(this); });
            }
            break;
          case 'nascimento':
            field.name = 'autor_nascimento[]';
            field.value = '';
            if (field.hasAttribute('data-target-age')) {
              field.setAttribute('data-target-age', `autor_idade_${window.authorCount}`);
              console.log(`[personal.js] addAuthor: Campo nascimento ${field.id} terÃ¡ data-target-age: autor_idade_${window.authorCount}`);
            }
            // Adicionar mÃ¡scara, validaÃ§Ã£o e cÃ¡lculo de idade para campos de nascimento clonados
            if (window.FIAP && FIAP.masks && FIAP.validation && FIAP.calculation) {
              console.log('[personal.js] addAuthor: FIAP.calculation.age estÃ¡ disponÃ­vel. Configurando listeners para campo de nascimento clonado:', field.id);
              field.addEventListener('input', function() {
                FIAP.masks.date(this);
                // ValidaÃ§Ã£o em tempo real de data de nascimento (exibe erro de data futura imediatamente)
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
                    console.warn(`[personal.js] addAuthor: Campo de idade ${targetId} NÃƒO ENCONTRADO no DOM.`);
                  }
                } else {
                  console.log(`[personal.js] addAuthor: Campo nascimento ${this.id} nÃ£o possui data-target-age.`);
                }
              });
            } else {
              console.warn('[personal.js] addAuthor: FIAP.calculation.age ou outros mÃ³dulos FIAP NÃƒO estÃ£o disponÃ­veis para o campo de nascimento clonado:', field.id);
            }
            break;
          case 'idade':
            field.name = 'autor_idade[]';
            field.id = `autor_idade_${window.authorCount}`;
            field.value = ''; // Idade Ã© readonly mas limpamos para consistÃªncia
            console.log(`[personal.js] addAuthor: Campo idade ${field.id} nomeado para autor_idade[] e ID corrigido.`);
            // O data-target-age do campo nascimento correspondente jÃ¡ foi atualizado.
            break;
          // NÃ£o clonamos apelido, telefone, senha por autor adicional atualmente
        }
      }
    });

    // Atualizar os labels para apontar para os novos IDs
    newAuthor.querySelectorAll('label').forEach(label => {
      const forAttr = label.getAttribute('for');
      if (forAttr) {
        // Extrair o nome base do campo sem o nÃºmero original (ex: "nome" de "nome_1" ou "cpf" de "cpf_1")
        // Se forAttr for apenas "nome", "cpf", etc. (sem _1), usamos ele mesmo como base.
        const baseNameForLabel = forAttr.includes('_') ? forAttr.substring(0, forAttr.lastIndexOf('_')) : forAttr;
        const newForId = `${baseNameForLabel}_${window.authorCount}`;

        // Caso especial para o label do campo "nome"
        if (baseNameForLabel === 'nome' || baseNameForLabel === 'nome_autor') { // 'nome_autor' como seguranÃ§a
          label.textContent = 'Nome completo:';
        }

        label.setAttribute('for', newForId);
        console.log(`[personal.js] addAuthor: Label atualizado. For: ${newForId}, TextContent: ${label.textContent}`);
      }
    });

    // Substituir o botÃ£o de adicionar por um botÃ£o de remover
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

// FunÃ§Ã£o para ativar/desativar a etiqueta de relacionamento
function toggleRelationshipTag(clickedDivElement) {
  const selectControl = clickedDivElement.querySelector('select');
  if (!selectControl) {
    console.warn('[Personal] toggleRelationshipTag: select nÃ£o encontrado dentro de:', clickedDivElement);
    return;
  }

  const tagValueToSelect = clickedDivElement.dataset.value;

  if (typeof tagValueToSelect === 'undefined') {
    console.warn('[Personal] toggleRelationshipTag: data-value nÃ£o definido em:', clickedDivElement);
    return;
  }

  if (selectControl.value === tagValueToSelect) {
    console.log(`[Personal] toggleRelationshipTag: Select jÃ¡ estÃ¡ com o valor '${tagValueToSelect}'. Sem aÃ§Ã£o.`);
    return;
  }

  selectControl.value = tagValueToSelect;
  console.log(`[Personal] toggleRelationshipTag: Select '${selectControl.name}' value set to '${tagValueToSelect}'`);

  selectControl.dispatchEvent(new Event('change', { bubbles: true }));
  console.log(`[Personal] toggleRelationshipTag: Evento 'change' disparado para select '${selectControl.name}'`);
}

// FunÃ§Ã£o para remover um autor especÃ­fico pelo seu ID
function removeSpecificAuthor(authorId) {
  if (window.authorCount <= 1) return; // Sempre manter pelo menos um autor

  const authorsContainer = document.getElementById('authors-container');

  // Encontrar o autor a ser removido
  const authorToRemove = document.getElementById(`author-${authorId}`);
  if (!authorToRemove) return;

  // Encontrar o separador anterior (irmÃ£o anterior do autor)
  const prevSibling = authorToRemove.previousElementSibling;
  if (prevSibling && prevSibling.classList.contains('author-separator')) {
    authorsContainer.removeChild(prevSibling);
  }

  // Remover o autor
  authorsContainer.removeChild(authorToRemove);

  // Se o autor removido for o Ãºltimo, decrementar o contador
  if (authorId === window.authorCount) {
    window.authorCount--;
  }
}

// FunÃ§Ã£o para remover o Ãºltimo autor (manter para compatibilidade)
function removeLastAuthor() {
  if (window.authorCount <= 1) return; // Sempre manter pelo menos um autor
  removeSpecificAuthor(window.authorCount);
}

// FunÃ§Ã£o para atualizar a etiqueta de relacionamento
function updateRelationshipLabel(selectElement, authorId) {
  let selectedValue = selectElement.value;
  const container = selectElement.closest('.relationship-select');
  // Se nÃ£o houver valor selecionado, usar valor padrÃ£o do HTML ou da primeira opÃ§Ã£o
  if (!selectedValue && container) {
    const defaultValueFromHTML = container.dataset.value || (selectElement.options[0] && selectElement.options[0].value);
    selectedValue = defaultValueFromHTML;
    selectElement.value = selectedValue;
  }

  // Atualizar a cor/estilo do seletor baseada na opÃ§Ã£o selecionada
  if (container) {
    container.setAttribute('data-selected', selectedValue);
    container.setAttribute('data-value', selectedValue);
  }

  // Implementar lÃ³gica para alterar label "Nascimento" para "Falecimento" quando "Instituidor" for selecionado
  updateBirthDeathLabel(selectElement, selectedValue);
}

// FunÃ§Ã£o para alterar o label do campo de nascimento quando "Instituidor" for selecionado
function updateBirthDeathLabel(selectElement, selectedValue) {
  console.log('[Personal] updateBirthDeathLabel: Iniciando com', { selectedValue });

  // Encontrar o autor container (pode ser #author-1, #author-2, etc.)
  const authorContainer = selectElement.closest('.author-row');
  if (!authorContainer) {
    console.warn('[Personal] updateBirthDeathLabel: Container do autor nÃ£o encontrado');
    return;
  }

  // Encontrar o campo de nascimento e seu label dentro deste autor
  const birthInput = authorContainer.querySelector('input[name="autor_nascimento[]"]');

  // Buscar o label de mÃºltiplas formas para garantir compatibilidade
  let birthLabel = null;

  // 1. Buscar pelo atributo for que contÃ©m "nascimento"
  birthLabel = authorContainer.querySelector('label[for*="nascimento"]');

  // 2. Se nÃ£o encontrou, buscar por classe input-label prÃ³ximo ao campo de nascimento
  if (!birthLabel && birthInput) {
    const parentDiv = birthInput.parentElement;
    birthLabel = parentDiv.querySelector('label.input-label') || parentDiv.querySelector('label');
  }

  // 3. Se ainda nÃ£o encontrou, buscar pelo texto do label
  if (!birthLabel) {
    const labels = authorContainer.querySelectorAll('label');
    birthLabel = Array.from(labels).find(label =>
      label.textContent.trim().includes('Nascimento') ||
      label.textContent.trim().includes('Falecimento')
    );
  }

  // 4. Ãšltimo recurso: buscar qualquer label no container do input de nascimento
  if (!birthLabel && birthInput) {
    const inputContainer = birthInput.closest('.relative') || birthInput.parentElement;
    birthLabel = inputContainer.querySelector('label');
  }

  // Encontrar o campo de idade e seu label dentro deste autor
  const ageInput = authorContainer.querySelector('input[name="autor_idade[]"]');
  let ageLabel = null;

  // Buscar o label do campo idade de mÃºltiplas formas
  if (ageInput) {
    // 1. Buscar pelo atributo for que contÃ©m "idade"
    ageLabel = authorContainer.querySelector('label[for*="idade"]');

    // 2. Se nÃ£o encontrou, buscar por classe input-label prÃ³ximo ao campo de idade
    if (!ageLabel) {
      const parentDiv = ageInput.parentElement;
      ageLabel = parentDiv.querySelector('label.input-label') || parentDiv.querySelector('label');
    }    // 3. Se ainda nÃ£o encontrou, buscar pelo texto do label
    if (!ageLabel) {
      const labels = authorContainer.querySelectorAll('label');
      ageLabel = Array.from(labels).find(label =>
        label.textContent.trim().includes('Idade') ||
        label.textContent.trim().includes('Ã“bito')
      );
    }
  }

  if (!birthInput || !birthLabel) {
    console.warn('[Personal] updateBirthDeathLabel: Campo de nascimento ou label nÃ£o encontrado', {
      authorContainer: authorContainer.id,
      birthInput: !!birthInput,
      birthLabel: !!birthLabel,
      availableLabels: authorContainer.querySelectorAll('label').length
    });
    return;
  }

  // Se "Instituidor" for selecionado, mudar para "Falecimento"
  if (selectedValue === 'Instituidor') {
    birthLabel.textContent = 'Falecimento';
    // Adicionar uma classe para facilitar identificaÃ§Ã£o posterior
    birthLabel.classList.add('death-label');
    birthLabel.classList.remove('birth-label');
    // Adicionar atributo ao input para identificar que este campo agora Ã© de falecimento
    birthInput.setAttribute('data-field-type', 'death');
    birthInput.setAttribute('data-original-placeholder', birthInput.placeholder);    // Modificar o campo de idade para mostrar "Ã“bito"
    if (ageInput && ageLabel) {
      ageLabel.textContent = 'Ã“bito';
      ageLabel.classList.add('death-time-label');
      ageLabel.classList.remove('age-label');
      ageInput.setAttribute('data-field-type', 'death-time');

      // Adicionar tag "Falecido" no campo de idade
      addDeathTag(ageInput);
    }

    console.log('[Personal] Label alterado para "Falecimento" no autor', authorContainer.id || 'sem ID');
  } else {
    // Para qualquer outra opÃ§Ã£o, voltar para "Nascimento"
    birthLabel.textContent = 'Nascimento';
    // Restaurar classes originais
    birthLabel.classList.add('birth-label');
    birthLabel.classList.remove('death-label');
    // Remover atributos de falecimento
    birthInput.removeAttribute('data-field-type');
    const originalPlaceholder = birthInput.getAttribute('data-original-placeholder');
    if (originalPlaceholder) {
      birthInput.placeholder = originalPlaceholder;
      birthInput.removeAttribute('data-original-placeholder');
    }

    // Restaurar o campo de idade para "Idade" normal
    if (ageInput && ageLabel) {
      ageLabel.textContent = 'Idade';
      ageLabel.classList.add('age-label');
      ageLabel.classList.remove('death-time-label');
      ageInput.removeAttribute('data-field-type');

      // Remover tag "Falecido" do campo de idade
      removeDeathTag(ageInput);
    }

    console.log('[Personal] Label alterado para "Nascimento" no autor', authorContainer.id || 'sem ID');
  }
}

// FunÃ§Ã£o para adicionar tag "Falecido" no campo de idade
function addDeathTag(ageInput) {
  if (!ageInput) return;

  const parentElement = ageInput.parentElement;
  if (!parentElement) return;

  // Verificar se jÃ¡ existe uma tag de falecimento
  const existingDeathTag = parentElement.querySelector('.death-tag');
  if (existingDeathTag) return;

  // Remover tag de classificaÃ§Ã£o etÃ¡ria existente (ex: "Capaz", "Idoso", etc.)
  const existingAgeTag = parentElement.querySelector('.age-classification-tag');
  if (existingAgeTag) {
    existingAgeTag.remove();
  }

  // Criar a tag "Falecido"
  const deathTag = document.createElement('span');
  deathTag.className = 'death-tag relationship-tag';
  deathTag.setAttribute('data-value', 'deceased');
  deathTag.setAttribute('data-selected', 'deceased');
  deathTag.innerText = 'Falecido';
  deathTag.title = 'Pessoa falecida - Instituidor de benefÃ­cio';

  // Estilo da tag (seguindo o padrÃ£o das tags de relacionamento)
  deathTag.style.position = 'absolute';
  deathTag.style.right = '0.5rem';
  deathTag.style.top = '0';
  deathTag.style.transform = 'translateY(-50%)';
  deathTag.style.zIndex = '10';
  deathTag.style.backgroundColor = '#6B7280'; // Cor cinza para falecido
  deathTag.style.color = 'white';
  deathTag.style.padding = '0.125rem 0.375rem';
  deathTag.style.borderRadius = '0.375rem';
  deathTag.style.fontSize = '0.75rem';
  deathTag.style.fontWeight = '500';

  // Garantir posicionamento relativo no container
  parentElement.style.position = 'relative';

  // Adicionar a tag ao container
  parentElement.appendChild(deathTag);

  console.log('[Personal] Tag "Falecido" adicionada ao campo de idade');
}

// FunÃ§Ã£o para remover tag "Falecido" do campo de idade
function removeDeathTag(ageInput) {
  if (!ageInput) return;

  const parentElement = ageInput.parentElement;
  if (!parentElement) return;

  // Remover tag de falecimento
  const existingDeathTag = parentElement.querySelector('.death-tag');
  if (existingDeathTag) {
    existingDeathTag.remove();
    console.log('[Personal] Tag "Falecido" removida do campo de idade');
  }

  // Se o campo de idade tiver um valor vÃ¡lido, recriar a tag de classificaÃ§Ã£o etÃ¡ria
  if (ageInput.value && ageInput.value.includes('anos') && window.FIAP && FIAP.calculation) {
    const ageText = ageInput.value;
    const anosMatch = ageText.match(/(\d+)\s*anos/);
    const mesesMatch = ageText.match(/(\d+)\s*meses/);

    if (anosMatch) {
      const anos = parseInt(anosMatch[1], 10);
      const meses = mesesMatch ? parseInt(mesesMatch[1], 10) : 0;

      // Pequeno delay para garantir que a tag foi removida antes de adicionar a nova
      setTimeout(() => {
        FIAP.calculation.addAgeClassificationTag(anos, meses, ageInput);
      }, 50);
    }
  }
}

// FunÃ§Ã£o para aplicar as classes de estilo Ã s opÃ§Ãµes do select
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
        console.log(`[DEBUG] applyRelationshipStyles: Para select '${select.id || select.name}', select.value Ã© VAZIO, mas data-selected ('${previousDataSelected}') existe. Usando data-selected.`);
        valueToApply = previousDataSelected;
      } else {
        // Se data-selected tambÃ©m nÃ£o ajudar, usar o valor original do HTML ou um fallback.
        // Para o primeiro autor, o padrÃ£o Ã© 'Requerente'. Para os demais, pode ser o primeiro da lista ou um padrÃ£o especÃ­fico.
        if (select.id === 'relationship_1' || (select.name === 'autor_relationship[]' && select.closest('#author-1'))) {
          valueToApply = originalHtmlDataValue || 'Requerente';
        } else if (select.options.length > 0) {
          // Para outros autores, usar o valor da primeira opÃ§Ã£o como padrÃ£o se o valor original do HTML nÃ£o estiver definido
          valueToApply = originalHtmlDataValue || select.options[0].value;
        } else {
          valueToApply = 'Dependente'; // Um fallback genÃ©rico se nÃ£o houver opÃ§Ãµes
        }
        console.log(`[DEBUG] applyRelationshipStyles: Para select '${select.id || select.name}', select.value e data-selected estavam vazios. Usando como padrÃ£o: '${valueToApply}'.`);
      }
      // Importante: Atualizar o valor do select para que o estado salvo reflita o padrÃ£o aplicado.
      select.value = valueToApply;
    }    // Aplicar a classe inicialmente com base na opÃ§Ã£o selecionada ou no valor deduzido
    container.setAttribute('data-selected', valueToApply);
    // data-value Ã© usado para o texto da tag via CSS ::after, entÃ£o deve refletir o valor selecionado.
    container.setAttribute('data-value', valueToApply);

    // Aplicar a funcionalidade de mudanÃ§a de label baseada no valor inicial
    updateBirthDeathLabel(select, valueToApply);

    // Remover estilos inline que possam estar causando conflitos
    container.removeAttribute('style');
    select.removeAttribute('style');

    // Adicionar evento change se ainda nÃ£o tiver
    if (!select.dataset.styleInitialized) {
      select.dataset.styleInitialized = true;
      select.addEventListener('change', function() {
        const newValue = this.value;
        const currentContainer = this.closest('.relationship-select');
        if (currentContainer) {
          currentContainer.setAttribute('data-selected', newValue);
          currentContainer.setAttribute('data-value', newValue);
        }
        // Aplicar tambÃ©m a mudanÃ§a de label quando o valor muda
        updateBirthDeathLabel(this, newValue);
      });
    }
  });

  // Adicionar tambÃ©m um evento que reaplicarÃ¡ os estilos ao voltar de outra pÃ¡gina
  if (!window.relationshipStylesEventSet) {
    window.addEventListener('pageshow', function(event) {
      if (event.persisted) {
        setTimeout(applyRelationshipStyles, 100);
      }
    });
    window.relationshipStylesEventSet = true;
  }
}

// Exportar funÃ§Ãµes para o escopo global
window.removeLastAuthor = removeLastAuthor;
window.removeSpecificAuthor = removeSpecificAuthor;
window.updateRelationshipLabel = updateRelationshipLabel;
window.updateBirthDeathLabel = updateBirthDeathLabel;
window.toggleRelationshipTag = toggleRelationshipTag;
window.addDeathTag = addDeathTag;
window.removeDeathTag = removeDeathTag;

// Array de colaboradores prÃ©-cadastrados para demonstraÃ§Ã£o
window.colaboradores = [
  { id: 1, nome: "Ana Silva", cargo: "Assistente Social" },
  { id: 2, nome: "JoÃ£o Oliveira", cargo: "Defensor PÃºblico" },
  { id: 3, nome: "Maria Santos", cargo: "PsicÃ³loga" },
  { id: 4, nome: "Carlos Ferreira", cargo: "MÃ©dico" },
  { id: 5, nome: "PatrÃ­cia Lima", cargo: "Assistente Social" },
  { id: 6, nome: "Roberto Almeida", cargo: "EstagiÃ¡rio" },
  { id: 7, nome: "Fernanda Costa", cargo: "Advogada" },
  { id: 8, nome: "Lucas Martins", cargo: "TÃ©cnico Administrativo" },
  { id: 9, nome: "Mariana Souza", cargo: "Assistente Administrativo" },
  { id: 10, nome: "Paulo Ribeiro", cargo: "Defensor PÃºblico" }
];

// FunÃ§Ã£o para pesquisar colaboradores
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

// FunÃ§Ã£o para renderizar resultados da pesquisa de colaboradores
function renderizarResultadosColaborador(resultados, query) {
  const dropdown = document.getElementById('colaboradorDropdown');
  if (!dropdown) return;

  // Limpar conteÃºdo
  dropdown.innerHTML = '';

  // Se nÃ£o houver resultados
  if (!resultados || resultados.length === 0) {
    dropdown.innerHTML = ''; // Limpar qualquer conteÃºdo anterior
    dropdown.classList.add('hidden'); // Ocultar o dropdown
    return;
  }

  // Criar cabeÃ§alho
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

  // Adicionar cada resultado Ã  lista
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

// FunÃ§Ã£o para configurar o campo de pesquisa de colaboradores
function setupColaboradorSearch() {
  const inputColaborador = document.getElementById('colaborador');
  const dropdownColaborador = document.getElementById('colaboradorDropdown');

  if (!inputColaborador || !dropdownColaborador) return;

  // Sempre esconder o dropdown se o campo jÃ¡ estiver preenchido ao restaurar
  dropdownColaborador.classList.add('hidden');

  // Configurar evento de digitaÃ§Ã£o para pesquisa
  inputColaborador.addEventListener('input', function() {
    const query = this.value.trim();

    // Se a query for muito curta, ocultar dropdown
    if (query.length < 2) {
      dropdownColaborador.classList.add('hidden');
      return;
    }

    // Buscar resultados
    const resultados = pesquisarColaboradores(query);

    // Se sÃ³ existe um resultado e ele Ã© igual ao valor do campo, nÃ£o mostrar dropdown
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

      // Se o dropdown estiver visÃ­vel, selecionar o primeiro resultado
      if (!dropdownColaborador.classList.contains('hidden')) {
        const primeiroResultado = dropdownColaborador.querySelector('.colaborador-resultado');
        if (primeiroResultado) {
          primeiroResultado.click();
          return;
        }
      }

      // Se nÃ£o hÃ¡ resultados visÃ­veis, adicionar o texto digitado como colaborador
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

  // Sempre esconder o dropdown ao restaurar a pÃ¡gina
  window.addEventListener('pageshow', function() {
    dropdownColaborador.classList.add('hidden');
  });
}

// FunÃ§Ã£o para configurar os eventos da pÃ¡gina
function setupEvents() {
  // Inicializar estilos para os selects de relacionamento
  applyRelationshipStyles();

  // Lista de campos para salvar individualmente na aba Pessoal
  const fieldsToUpdatePersonal = [
    // Campos do autor principal foram movidos para persistÃªncia de array (autor_nome[], autor_cpf[], etc.)
    // 'nome', 'cpf', 'nascimento', 'apelido', 'telefone', 'telefone_detalhes', 'relationship_1',
    'colaborador', // Campo Ãºnico de colaborador
    'cep', 'endereco', 'numero', 'bairro', 'cidade', 'uf', // EndereÃ§o
    'observacoes', // ObservaÃ§Ãµes gerais da pÃ¡gina
    'telefone_whatsapp_ativo' // Checkbox Ãºnico do telefone principal
    // Adicionar outros IDs de campos estÃ¡ticos da aba pessoal aqui, se necessÃ¡rio
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
              console.log(`[personal.js] Evento '${eventType}' no campo '${this.id}'. Campo Ã© readOnly. NÃƒO atualizando state.`);
          } else {
              console.log(`[personal.js] Evento '${eventType}' no campo '${this.id}'. Valor DOM: '${valueToSave}', Valor no State: '${currentKnownValue}'. SEM MUDANÃ‡A. NÃƒO atualizando state.`);
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
      if (!whatsAppCheckbox) console.warn('Checkbox de WhatsApp (telefone_whatsapp_ativo) nÃ£o encontrado para restauraÃ§Ã£o.');
    }
  } catch (e) {
    console.error('Erro ao restaurar estado do checkbox de WhatsApp:', e);
  }

  // BotÃ£o de remover autor (o primeiro, que nÃ£o Ã© dinÃ¢mico)
  const removeAuthorButton = document.querySelector('.remove-author-button');
  if (removeAuthorButton) {
    // Este botÃ£o sÃ³ deve remover o autor se houver mais de um.
    // A lÃ³gica de remover autor especÃ­fico jÃ¡ cuida disso.
    // A remoÃ§Ã£o do primeiro autor deve ser tratada com cuidado ou desabilitada.
  }

  // Configurar validaÃ§Ã£o para campos de data e CPF
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
      FIAP.masks.cpf(this); // A mÃ¡scara jÃ¡ chama a validaÃ§Ã£o em tempo real
    });
    cpfField.addEventListener('blur', function() { FIAP.validation.cpfRealTime(this); });
  }

  // Configurar mÃ¡scara de telefone
  const telefoneField = document.getElementById('telefone');
  if (telefoneField) {
    telefoneField.addEventListener('input', function() { FIAP.masks.phone(this); });
  }

  // Adicionar evento de clique aos botÃµes de navegaÃ§Ã£o (prÃ³ximo/anterior)
  const btnNext = document.getElementById('btn-next');
  const btnBack = document.getElementById('btn-back');

  if (btnNext) {
    // Remover eventuais listeners antigos para evitar duplicaÃ§Ã£o
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
        // <<< INÃCIO DA MODIFICAÃ‡ÃƒO: Adicionar Logs ANTES da captura >>>
        if (window.formStateManager) {
          const bairroField = document.getElementById('bairro');
          const enderecoField = document.getElementById('endereco');
          console.log(`[PersonalJS - btnNext] ANTES da captura. Bairro DOM: '${bairroField ? bairroField.value : 'N/A'}', Endereco DOM: '${enderecoField ? enderecoField.value : 'N/A'}'`);
          if (window.formStateManager.formData && window.formStateManager.formData.personal) {
            console.log(`[PersonalJS - btnNext] ANTES da captura. Bairro State: '${window.formStateManager.formData.personal.bairro}', Endereco State: '${window.formStateManager.formData.personal.endereco}'`);
          } else {
            console.log("[PersonalJS - btnNext] ANTES da captura. formData.personal nÃ£o disponÃ­vel no state.");
          }
        }
        // <<< FIM DA MODIFICAÃ‡ÃƒO >>>

        if (window.formStateManager && typeof window.formStateManager.captureCurrentFormData === 'function') {
          console.log('Capturando dados do formulÃ¡rio pessoal...');
          window.formStateManager.captureCurrentFormData();
        } else {
          console.warn('formStateManager ou captureCurrentFormData nÃ£o estÃ¡ disponÃ­vel.');
        }

        // Pequeno atraso para garantir que a captura de dados (se houver) seja processada
        setTimeout(() => {
          if (typeof navigateTo === 'function') {
            console.log('Navegando para a prÃ³xima etapa: social');
            navigateTo('social'); // Assumindo que 'social' Ã© a prÃ³xima etapa
          } else {
            console.error('FunÃ§Ã£o navigateTo nÃ£o encontrada.');
            this.innerHTML = originalText; // Restaura o botÃ£o em caso de erro
            this.disabled = false;
            this.classList.remove('opacity-75');
            isNavigating = false;
          }

          // O botÃ£o serÃ¡ re-habilitado pela mudanÃ§a de pÃ¡gina ou se a navegaÃ§Ã£o falhar no catch
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
    // Remover eventuais listeners antigos para evitar duplicaÃ§Ã£o
    const newBtnBack = btnBack.cloneNode(true);
    btnBack.parentNode.replaceChild(newBtnBack, btnBack);

    newBtnBack.addEventListener('click', function() {
      if (typeof navigateTo === 'function') {
        navigateTo('home'); // Ou a etapa anterior correta, ex: 'welcome' ou a identificada pelo router
      } else {
        console.error('FunÃ§Ã£o navigateTo nÃ£o encontrada para voltar.');
      }
    });
  }

  // Configurar a busca de colaboradores
  setupColaboradorSearch();
  setupCidadeSearch();

  // Configurar a capitalizaÃ§Ã£o automÃ¡tica
  if (typeof setupAutoCapitalize === 'function') {
    setupAutoCapitalize();
  }
}

// FunÃ§Ã£o para configurar os eventos dinÃ¢micos do mÃ³dulo
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

// Novo handler para o clique do botÃ£o Adicionar Autor, contendo o lock
function handleAddAuthorClick() {
  if (window._addingAuthorFromButtonClick) {
    console.log('[personal.js] handleAddAuthorClick: Lock ativo, prevenindo novo clique.');
    return;
  }
  window._addingAuthorFromButtonClick = true;
  console.log('[personal.js] handleAddAuthorClick: BotÃ£o Adicionar Autor clicado, lock ativado.');

  try {
    addAuthor(); // Chama a funÃ§Ã£o addAuthor (que agora estÃ¡ sem lock interno)
  } catch (error) {
    console.error('[personal.js] handleAddAuthorClick: Erro ao chamar addAuthor:', error);
  } finally {
    setTimeout(() => {
      window._addingAuthorFromButtonClick = false;
      console.log('[personal.js] handleAddAuthorClick: Lock do botÃ£o Adicionar Autor liberado.');
    }, 300); // Lock para cliques do usuÃ¡rio
  }
}

// FunÃ§Ã£o para configurar o campo de busca de cidades
function setupCidadeSearch() {
  const inputCidade = document.getElementById('cidade');
  const dropdownCidade = document.getElementById('cidadeDropdown');
  if (!inputCidade || !dropdownCidade) return;

  // Sempre esconder o dropdown se o campo jÃ¡ estiver preenchido ao restaurar
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

  // Sempre esconder o dropdown ao restaurar a pÃ¡gina
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
    // Campos do autor principal foram movidos para persistÃªncia de array (autor_nome[], autor_cpf[], etc.)
    // 'nome', 'cpf', 'nascimento', 'apelido', 'telefone', 'telefone_detalhes', 'relationship_1',
    'colaborador', // Campo Ãºnico de colaborador
    'cep', 'endereco', 'numero', 'bairro', 'cidade', 'uf', // EndereÃ§o
    'observacoes', // ObservaÃ§Ãµes gerais da pÃ¡gina
    'telefone_whatsapp_ativo' // Checkbox Ãºnico do telefone principal
    // Adicionar outros IDs de campos estÃ¡ticos da aba pessoal aqui, se necessÃ¡rio
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
              console.log(`[personal.js] Evento '${eventType}' no campo '${this.id}'. Campo Ã© readOnly. NÃƒO atualizando state.`);
          } else {
              console.log(`[personal.js] Evento '${eventType}' no campo '${this.id}'. Valor DOM: '${valueToSave}', Valor no State: '${currentKnownValue}'. SEM MUDANÃ‡A. NÃƒO atualizando state.`);
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
      if (!whatsAppCheckbox) console.warn('Checkbox de WhatsApp (telefone_whatsapp_ativo) nÃ£o encontrado para restauraÃ§Ã£o.');
    }
  } catch (e) {
    console.error('Erro ao restaurar estado do checkbox de WhatsApp:', e);
  }

  // BotÃ£o de remover autor (o primeiro, que nÃ£o Ã© dinÃ¢mico)
  const removeAuthorButton = document.querySelector('.remove-author-button');
  if (removeAuthorButton) {
    // Este botÃ£o sÃ³ deve remover o autor se houver mais de um.
    // A lÃ³gica de remover autor especÃ­fico jÃ¡ cuida disso.
    // A remoÃ§Ã£o do primeiro autor deve ser tratada com cuidado ou desabilitada.
  }

  // Configurar validaÃ§Ã£o para campos de data e CPF
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
      FIAP.masks.cpf(this); // A mÃ¡scara jÃ¡ chama a validaÃ§Ã£o em tempo real
    });
    cpfField.addEventListener('blur', function() { FIAP.validation.cpfRealTime(this); });
  }

  // Configurar mÃ¡scara de telefone
  const telefoneField = document.getElementById('telefone');
  if (telefoneField) {
    telefoneField.addEventListener('input', function() { FIAP.masks.phone(this); });
  }
  // Configurar a busca de colaboradores
  setupColaboradorSearch();
  setupCidadeSearch();

  // Configurar a capitalização automática
  if (typeof setupAutoCapitalize === 'function') {
    setupAutoCapitalize();
  }
}
