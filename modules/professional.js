/**
 * Módulo de Atividades Profissionais
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
      navigateTo('insurance');
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
      navigateTo('documents');
    });
  }

  // Aplicar estilos aos outros botões do formulário
  document.querySelectorAll('.add-job-btn').forEach(btn => {
    if (window.tw && typeof window.tw.applyTo === 'function') {
      window.tw.applyTo(btn, 'button.add');
    }
  });

  document.querySelectorAll('.remove-job-btn').forEach(btn => {
    if (window.tw && typeof window.tw.applyTo === 'function') {
      window.tw.applyTo(btn, 'button.remove');
    }
  });
}
