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

  // Configurar eventos do tipo de atividade
  const tipoAtividadeSelect = document.getElementById('tipoAtividade');
  if (tipoAtividadeSelect) {
    tipoAtividadeSelect.addEventListener('change', function() {
      const seguradoEspecialFields = document.getElementById('seguradoEspecialFields');
      const outrasAtividadesFields = document.getElementById('outrasAtividadesFields');

      // Esconder todos os campos específicos primeiro
      seguradoEspecialFields.classList.add('hidden');
      outrasAtividadesFields.classList.add('hidden');

      // Mostrar campos específicos baseado na seleção
      if (this.value === 'segurado_especial') {
        seguradoEspecialFields.classList.remove('hidden');
      } else if (this.value !== '') {
        outrasAtividadesFields.classList.remove('hidden');
      }
    });
  }

  // Configurar máscara para área do imóvel
  const areaImovelInput = document.getElementById('areaImovel');
  if (areaImovelInput) {
    areaImovelInput.addEventListener('input', function() {
      // Permitir apenas números e ponto
      this.value = this.value.replace(/[^\d.]/g, '');

      // Garantir apenas um ponto decimal
      const parts = this.value.split('.');
      if (parts.length > 2) {
        this.value = parts[0] + '.' + parts.slice(1).join('');
      }
    });
  }

  // Botão Voltar
  const backButton = document.getElementById('btn-back');
  if (backButton) {
    // Aplicar estilo centralizado ao botão voltar
    if (window.tw && typeof window.tw.applyTo === 'function') {
      window.tw.applyTo(backButton, 'button.secondary');
    }

    backButton.addEventListener('click', function() {
      navigateTo('personal');
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
