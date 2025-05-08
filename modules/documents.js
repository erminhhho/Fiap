/**
 * Módulo de Documentos e Conclusão
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
      navigateTo('professional');
    });
  }

  // Botão Finalizar
  const finishButton = document.getElementById('btn-finish');
  if (finishButton) {
    // Aplicar estilo centralizado ao botão finalizar
    if (window.tw && typeof window.tw.applyTo === 'function') {
      window.tw.applyTo(finishButton, 'button.primary');
    }

    finishButton.addEventListener('click', function() {
      alert('Formulário concluído com sucesso!');
      // Aqui você pode adicionar o código para salvar todas as informações
      // ou redirecionar para uma página de confirmação
    });
  }

  // Aplicar estilos aos botões de upload, se existirem
  document.querySelectorAll('.upload-btn').forEach(btn => {
    if (window.tw && typeof window.tw.applyTo === 'function') {
      window.tw.applyTo(btn, 'button.secondary');
    }
  });
}
