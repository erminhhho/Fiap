/**
 * Script de correção para problemas no módulo de documentos
 */

document.addEventListener('DOMContentLoaded', function() {
  // Definir uma versão substituta da função se ela não estiver disponível
  if (typeof window.abrirPopupInfoDocumento !== 'function') {
    window.abrirPopupInfoDocumento = function(element) {
      const documentoItem = element?.closest('.documento-item');
      if (!documentoItem) return;

      const popup = document.getElementById('documento-info-popup');
      if (!popup) return;

      // Obter o nome do documento
      const nomeInput = documentoItem.querySelector('.nome-documento');
      const nome = nomeInput ? nomeInput.value : 'Documento';

      // Obter a descrição do documento do banco de dados pré-cadastrado
      let descricao = '';
      if (nome && window.documentosPreCadastrados) {
        const documento = window.documentosPreCadastrados.find(doc => doc.nome.toLowerCase() === nome.toLowerCase());
        if (documento) {
          descricao = documento.descricao || '';

          // Se tiver detalhes HTML, adicione-os também
          if (documento.detalhes) {
            descricao += '<hr class="my-3 border-gray-200">' + documento.detalhes;
          }
        } else {
          descricao = 'Nenhuma descrição disponível para este documento.';
        }
      } else {
        descricao = 'Nenhuma descrição disponível para este documento.';
      }

      // Preencher dados no popup
      const tituloEl = popup.querySelector('.documento-info-popup-titulo');
      const descricaoEl = popup.querySelector('#documento-info-popup-descricao');

      if (tituloEl) {
        tituloEl.textContent = nome;
      }

      if (descricaoEl) {
        descricaoEl.innerHTML = descricao;
      }

      // Mostrar o popup
      popup.classList.remove('hidden');

      // Configurar botão de fechar
      const fecharBtn = popup.querySelector('.fechar-info-popup');
      if (fecharBtn) {
        fecharBtn.addEventListener('click', function() {
          popup.classList.add('hidden');
        });
      }

      // Fechar popup ao clicar fora
      popup.addEventListener('click', function(event) {
        if (event.target === popup) {
          popup.classList.add('hidden');
        }
      });
    };

    console.log('[Fix] Função abrirPopupInfoDocumento definida com sucesso.');
  }
});
