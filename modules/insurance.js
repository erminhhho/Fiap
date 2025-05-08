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
  // Destacar campos preenchidos
  if (typeof destacarCamposPreenchidos === 'function') {
    destacarCamposPreenchidos();
  }

  // Botão Voltar
  const backButton = document.getElementById('btn-back');
  if (backButton) {
    // Aplicar estilo centralizado ao botão voltar
    if (window.tw && typeof window.tw.applyTo === 'function') {
      window.tw.applyTo(backButton, 'button.secondary');
    }

    backButton.addEventListener('click', function() {
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

    nextButton.addEventListener('click', function() {
      navigateTo('professional');
    });
  }

  // Aplicar estilos a outros botões do formulário, se existirem
  document.querySelectorAll('.add-document-btn').forEach(btn => {
    if (window.tw && typeof window.tw.applyTo === 'function') {
      window.tw.applyTo(btn, 'button.add');
    }
  });

  document.querySelectorAll('.remove-document-btn').forEach(btn => {
    if (window.tw && typeof window.tw.applyTo === 'function') {
      window.tw.applyTo(btn, 'button.remove');
    }
  });
}
