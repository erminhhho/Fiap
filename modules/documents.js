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
  // Botão Voltar
  const backButton = document.getElementById('btn-back');
  if (backButton) {
    backButton.addEventListener('click', function() {
      navigateTo('professional');
    });
  }

  // Botão Finalizar
  const finishButton = document.getElementById('btn-finish');
  if (finishButton) {
    finishButton.addEventListener('click', function() {
      alert('Formulário concluído com sucesso!');
      // Aqui você pode adicionar o código para salvar todas as informações
      // ou redirecionar para uma página de confirmação
    });
  }
}
