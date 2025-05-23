// Script para controlar a barra de progresso entre páginas
(function() {
  // Cria a barra de progresso se não existir
  if (!document.getElementById('progress-bar')) {
    var bar = document.createElement('div');
    bar.id = 'progress-bar';
    document.body.appendChild(bar);
  }

  // Função para iniciar a barra
  window.startProgressBar = function() {
    var bar = document.getElementById('progress-bar');
    bar.style.width = '0';
    bar.style.opacity = '1';
    bar.style.transition = 'none';
    // Pequeno delay para garantir o reset
    setTimeout(function() {
      bar.style.transition = 'width .5s ease, opacity .5s ease';
      bar.style.width = '80%';
    }, 10);
  };

  // Função para finalizar a barra
  window.finishProgressBar = function() {
    var bar = document.getElementById('progress-bar');
    bar.style.width = '100%';
    setTimeout(function() {
      bar.style.opacity = '0';
      bar.style.width = '0';
    }, 500);
  };
})();
