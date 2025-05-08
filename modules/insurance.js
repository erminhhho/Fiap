/**
 * Módulo de Segurado Especial
 */

// Limpar função de inicialização anterior
window.initModule = null;

// Definir nova função de inicialização do módulo
window.initModule = function() {
  setupEvents();
};

// Função para configurar eventos do módulo
function setupEvents() {
  // Botão Voltar
  const backButton = document.getElementById('btn-back');
  if (backButton) {
    backButton.addEventListener('click', function() {
      navigateTo('incapacity'); // Corrigido: apontando para 'incapacity' em vez de 'disability'
    });
  }

  // Botão Próximo
  const nextButton = document.getElementById('btn-next');
  if (nextButton) {
    nextButton.addEventListener('click', function() {
      navigateTo('professional');
    });
  }
}
