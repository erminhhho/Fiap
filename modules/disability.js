/**
 * Módulo de Incapacidades (antigo módulo de saúde)
 */

// Limpar função de inicialização anterior
window.initModule = null;

// Definir nova função de inicialização do módulo
window.initModule = function() {
  setupEvents();
};

// Função para configurar eventos do módulo
function setupEvents() {
  // Destacar campos preenchidos
  if (typeof destacarCamposPreenchidos === 'function') {
    destacarCamposPreenchidos();
  }

  // Configurar pesquisa de CID
  const btnSearchCID = document.getElementById('btn-search-cid');
  if (btnSearchCID && typeof searchCID === 'function') {
    btnSearchCID.addEventListener('click', function() {
      const searchTerm = document.getElementById('cid_principal').value;
      searchCID(searchTerm, 'cid-search-results', function(selectedCID) {
        document.getElementById('cid_principal').value = selectedCID;
      });
    });
  }

  // Configurar pesquisa de CID secundário
  const btnSearchCIDSecondary = document.getElementById('btn-search-cid-secondary');
  if (btnSearchCIDSecondary && typeof searchCID === 'function') {
    btnSearchCIDSecondary.addEventListener('click', function() {
      const searchTerm = document.getElementById('cid_secundarios').value;
      searchCID(searchTerm, 'cid-secondary-search-results', function(selectedCID) {
        const currentValue = document.getElementById('cid_secundarios').value;
        document.getElementById('cid_secundarios').value = currentValue ?
          currentValue + ', ' + selectedCID : selectedCID;
      });
    });
  }

  // Botão Voltar
  const backButton = document.getElementById('btn-back');
  if (backButton) {
    backButton.addEventListener('click', function() {
      navigateTo('social');
    });
  }

  // Botão Próximo
  const nextButton = document.getElementById('btn-next');
  if (nextButton) {
    nextButton.addEventListener('click', function() {
      navigateTo('insurance');
    });
  }
}
