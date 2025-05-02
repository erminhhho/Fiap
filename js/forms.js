/**
 * Funções para manipulação de formulários
 */

// Função para limpar o formulário atual
function clearForm() {
  if (confirm('Tem certeza que deseja limpar todos os campos do formulário?')) {
    document.querySelectorAll('input:not([type="button"]):not([type="submit"]), select, textarea').forEach(field => {
      field.value = '';
      field.classList.remove('field-filled', 'cpf-valid', 'cpf-invalid', 'cep-valid', 'cep-invalid');
    });

    // Remover mensagens de validação
    document.querySelectorAll('.validation-message').forEach(msg => msg.remove());

    // Limpar listas dinâmicas, se existirem
    const membrosFamilia = document.getElementById('membros-familia-list');
    if (membrosFamilia) {
      membrosFamilia.innerHTML = '';
    }

    const medicamentosList = document.getElementById('medicamentos-list');
    if (medicamentosList && medicamentosList.children.length > 1) {
      // Manter apenas o primeiro item
      const firstMed = medicamentosList.firstElementChild;
      medicamentosList.innerHTML = '';
      if (firstMed) {
        medicamentosList.appendChild(firstMed.cloneNode(true));
        // Limpar campos do primeiro item
        firstMed.querySelectorAll('input').forEach(input => {
          input.value = '';
        });
      }
    }

    alert('Formulário foi limpo com sucesso!');
  }
}

// Função para criar um novo formulário
function newForm() {
  if (confirm('Deseja iniciar um novo formulário? Todos os dados não salvos serão perdidos.')) {
    // Limpar o formulário
    clearForm();

    // Redirecionar para a primeira etapa
    navigateTo('personal');

    alert('Novo formulário iniciado com sucesso!');
  }
}

// Função para salvar o formulário (exemplo básico)
function saveForm() {
  // Exemplo básico: salvar no localStorage
  const formData = {};
  document.querySelectorAll('input:not([type="button"]):not([type="submit"]), select, textarea').forEach(field => {
    if (field.name) {
      formData[field.name] = field.value;
    }
  });

  // Gerar um ID único baseado na data ou usar um existente
  const formId = localStorage.getItem('currentFormId') || 'form_' + Date.now();
  localStorage.setItem('currentFormId', formId);
  localStorage.setItem(formId, JSON.stringify(formData));

  alert('Formulário salvo com sucesso!');
}

// Função para imprimir o formulário
function printForm() {
  window.print();
}

// Função para adicionar membro da família
function addFamilyMember() {
  const container = document.getElementById('membros-familia-container');
  const list = document.getElementById('membros-familia-list');
  const template = document.getElementById('membro-familia-template').innerHTML;

  const memberDiv = document.createElement('div');
  memberDiv.innerHTML = template.trim();
  const newMemberElement = memberDiv.firstChild;

  list.appendChild(newMemberElement);

  // Aplicar máscaras aos novos campos
  newMemberElement.querySelectorAll('input[name="familiar_cpf[]"]').forEach(input => {
    input.addEventListener('input', function() {
      maskCPF(this);
    });
  });

  // Destacar campos
  destacarCamposPreenchidos();
  updateRemoveMemberButton();
}

// Função para adicionar autor
function addAuthor() {
  // Implementação baseada na lógica existente...
  console.log("Adicionar autor - Funcionalidade a ser implementada");
}

// Função para remover o último membro da família
function removeLastFamilyMember() {
  const list = document.getElementById('membros-familia-list');
  if (list.children.length > 1) {
    list.lastElementChild.remove();
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

// Funções de exportação
window.clearForm = clearForm;
window.newForm = newForm;
window.saveForm = saveForm;
window.printForm = printForm;
window.addFamilyMember = addFamilyMember;
window.addAuthor = addAuthor;
window.removeLastFamilyMember = removeLastFamilyMember;
window.updateRemoveMemberButton = updateRemoveMemberButton;
