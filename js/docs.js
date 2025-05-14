/**
 * Arquivo centralizado para funções relacionadas a documentos
 * Combina as funcionalidades de fix-documents.js e document-functions.js
 */

document.addEventListener('DOMContentLoaded', function() {
  // Função para adicionar novo documento
  if (typeof window.adicionarNovoDocumento !== 'function') {
    window.adicionarNovoDocumento = function(textoDocumento = '') {
      try {
        const template = document.getElementById('documentoTemplate');
        const documentosContainer = document.getElementById('documentos-container');

        if (template && documentosContainer) {
          // Criar um clone do template
          const clone = document.importNode(template.content, true);
          const documentoItem = clone.querySelector('.documento-item');

          // Preencher o nome do documento se fornecido
          if (textoDocumento) {
            const nomeDocumento = clone.querySelector('.nome-documento');
            if (nomeDocumento) {
              nomeDocumento.value = textoDocumento;
            }
          }

          // Configurar botão remover
          const removerBtn = clone.querySelector('.remover-documento');
          if (removerBtn) {
            removerBtn.addEventListener('click', function() {
              if (typeof window.removerDocumento === 'function') {
                window.removerDocumento(this);
              } else {
                // Versão simplificada se a função não existe
                const documentoItem = this.closest('.documento-item');
                if (documentoItem && confirm('Tem certeza que deseja remover este documento?')) {
                  documentoItem.remove();
                  // Salvar após remover
                  if (typeof saveFormState === 'function') {
                    saveFormState();
                  }
                }
              }
            });
          }

          // Configurar o select de status, se disponível
          const relationshipSelect = documentoItem.querySelector('.relationship-select');
          if (relationshipSelect) {
            relationshipSelect.addEventListener('click', function() {
              if (typeof window.toggleDocumentStatusTag === 'function') {
                window.toggleDocumentStatusTag(this);
              }
            });

            // Configurar o select interno
            const statusSelect = relationshipSelect.querySelector('.documento-status');
            if (statusSelect) {
              statusSelect.addEventListener('change', function() {
                if (typeof window.updateDocumentStatusTag === 'function') {
                  window.updateDocumentStatusTag(this);
                }
              });
            }
          }

          // Permitir abrir modal de detalhes ao clicar no nome do documento
          const nomeDocumento = clone.querySelector('.nome-documento');
          if (nomeDocumento) {
            nomeDocumento.addEventListener('dblclick', function() {
              if (typeof window.abrirModalDetalhes === 'function') {
                window.abrirModalDetalhes(this);
              } else if (typeof abrirModalDetalhes === 'function') {
                abrirModalDetalhes(this);
              }
            });
          }

          // Configurar botão de info, se disponível
          const infoBtn = clone.querySelector('.info-documento-btn');
          if (infoBtn) {
            infoBtn.addEventListener('click', function() {
              if (typeof window.abrirPopupInfoDocumento === 'function') {
                window.abrirPopupInfoDocumento(this);
              }
            });
          }

          // Adicionar ao container
          documentosContainer.appendChild(clone);

          // Salvar após adicionar
          if (typeof saveFormState === 'function') {
            saveFormState();
          }

          console.log('Documento adicionado com sucesso');
          return documentoItem;
        }
      } catch (error) {
        console.error('Erro ao adicionar novo documento:', error);
      }
      return null;
    };
  }

  // Função para remover documento
  if (typeof window.removerDocumento !== 'function') {
    window.removerDocumento = function(button) {
      const documentoItem = button.closest('.documento-item');
      if (!documentoItem) return;

      if (confirm('Tem certeza que deseja remover este documento?')) {
        documentoItem.remove();

        // Salvar após remover
        if (typeof saveFormState === 'function') {
          saveFormState();
        }
      }
    };
  }

  // Função para abrir modal de detalhes
  if (typeof window.abrirModalDetalhes !== 'function') {
    window.abrirModalDetalhes = function(element) {
      const documentoItem = element.closest('.documento-item');
      if (!documentoItem) return;

      const modal = document.getElementById('documento-info-modal');
      if (!modal) return;

      // Obter dados do documento
      const nomeInput = documentoItem.querySelector('.nome-documento');
      const anoInput = documentoItem.querySelector('.ano-documento');
      const detalhesTextarea = documentoItem.querySelector('.detalhes-documento');

      const nome = nomeInput ? nomeInput.value : 'Documento';
      const ano = anoInput && anoInput.value ? anoInput.value : '';
      const detalhes = detalhesTextarea ? detalhesTextarea.value : '';

      // Preencher dados no modal
      const tituloEl = modal.querySelector('.documento-info-titulo');
      const detalhesEl = modal.querySelector('#documento-info-detalhes');

      if (tituloEl) {
        if (ano) {
          tituloEl.textContent = `${nome} (${ano})`;
        } else {
          tituloEl.textContent = nome;
        }
      }

      if (detalhesEl) {
        detalhesEl.value = detalhes;
      }

      // Mostrar o modal
      modal.classList.remove('hidden');

      // Configurar botão de fechar
      const fecharBtn = modal.querySelector('.fechar-info');
      if (fecharBtn) {
        const closeHandler = function() {
          modal.classList.add('hidden');
          fecharBtn.removeEventListener('click', closeHandler);
        };
        fecharBtn.addEventListener('click', closeHandler);
      }

      // Configurar botão de salvar
      const salvarBtn = modal.querySelector('.salvar-info');
      if (salvarBtn) {
        const saveHandler = function() {
          // Salvar detalhes no textarea oculto
          if (detalhesTextarea && detalhesEl) {
            detalhesTextarea.value = detalhesEl.value;
          }

          // Fechar modal
          modal.classList.add('hidden');

          // Salvar no estado
          if (typeof saveFormState === 'function') {
            saveFormState();
          }

          salvarBtn.removeEventListener('click', saveHandler);
        };
        salvarBtn.addEventListener('click', saveHandler);
      }
    };
  }

  // Função para abrir popup de informações do documento
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
  }

  console.log('Funções de documento inicializadas com sucesso');
});
