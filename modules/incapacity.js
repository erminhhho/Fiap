/**
 * Módulo de Incapacidades
 *
 * Este é o módulo principal para o tratamento de incapacidades no sistema.
 * O arquivo modules/disability.js foi marcado como obsoleto em favor deste.
 */

console.log('[incapacity.js] *** INICIANDO CARREGAMENTO DO MÓDULO ***');
console.log('[incapacity.js] Timestamp:', new Date().toLocaleTimeString());
console.log('[incapacity.js] window.setupProfissaoAutocomplete será definido...');

/**
 * Classe para gerenciar múltiplos CIDs por documento
 */
class MultiCIDManager {
  constructor() {
    this.cidsData = new Map(); // Armazena CIDs por índice de documento
    this.initialized = false;
  }

  /**
   * Inicializa o sistema
   */
  init() {
    if (this.initialized) {
      console.log('[MultiCIDManager] Já inicializado');
      return;
    }

    console.log('[MultiCIDManager] Inicializando sistema de múltiplos CIDs...');
    this.initialized = true;

    // Restaurar dados se existirem
    this.restoreFromFormState();
  }

  /**
   * Adiciona um CID a um documento específico
   * @param {string} documentIndex - Índice do documento
   * @param {string} code - Código CID
   * @param {string} description - Descrição da doença
   * @returns {boolean} - Sucesso da operação
   */
  addCid(documentIndex, code, description) {
    if (!documentIndex || !code || !description) {
      console.warn('[MultiCIDManager] Parâmetros inválidos para addCid');
      return false;
    }

    // Inicializar array se não existir
    if (!this.cidsData.has(documentIndex)) {
      this.cidsData.set(documentIndex, []);
    }

    const cidList = this.cidsData.get(documentIndex);

    // Verificar se já existe
    const exists = cidList.some(cid => cid.code.toLowerCase() === code.toLowerCase());
    if (exists) {
      console.warn('[MultiCIDManager] CID já existe para este documento');
      return false;
    }

    // Verificar isenção de carência
    const isencao = this.checkIsencaoCarencia(code, description);

    // Adicionar CID
    cidList.push({
      code: code.toUpperCase(),
      description,
      isencao,
      timestamp: Date.now()
    });

    console.log(`[MultiCIDManager] CID ${code} adicionado ao documento ${documentIndex}`);

    // Atualizar UI
    this.renderCidLinks(documentIndex);

    // Atualizar estado do formulário
    this.updateFormState();

    // Atualizar tag de isenção no documento
    this.updateIsencaoCarencia(documentIndex);

    return true;
  }  /**
   * Remove um CID de um documento
   * @param {string} documentIndex - Índice do documento
   * @param {string} code - Código CID a remover
   * @param {boolean} isFromModal - Se a remoção é feita a partir do modal "Ver todos"
   */
  removeCid(documentIndex, code, isFromModal = false) {
    if (!this.cidsData.has(documentIndex)) return;

    const cidList = this.cidsData.get(documentIndex);
    const index = cidList.findIndex(cid => cid.code === code);

    if (index > -1) {
      cidList.splice(index, 1);
      console.log(`[MultiCIDManager] CID ${code} removido do documento ${documentIndex}`);

      // Se não há mais CIDs, remover o array
      if (cidList.length === 0) {
        this.cidsData.delete(documentIndex);
      }

      // Atualizar UI sempre
      this.renderCidLinks(documentIndex);

      // Atualizar estado do formulário
      this.updateFormState();

      // Atualizar tag de isenção
      this.updateIsencaoCarencia(documentIndex);      // Se a remoção foi feita a partir de um modal, verificar qual modal atualizar
      if (isFromModal) {
        // Usar timeout para garantir que a atualização aconteça após o DOM ser atualizado
        setTimeout(() => {
          // Verificar se algum modal está aberto usando seletor mais específico
          const activeModal = document.querySelector('.modal:not(.hidden)');
          const modalTitle = activeModal?.querySelector('.modal-title');

          if (modalTitle) {
            const modalTitleText = modalTitle.textContent?.trim();
            const isShowingAllCidsModal = modalTitleText?.includes(`CIDs - Documento ${documentIndex}`);
            const isShowingDetailModal = modalTitleText === code;

            console.log(`[MultiCIDManager] Modal ativo detectado: "${modalTitleText}"`);

            // Se está mostrando o modal "Ver todos", atualizar sem fechar
            if (isShowingAllCidsModal) {
              if (cidList.length > 0) {
                console.log(`[MultiCIDManager] Atualizando modal "Ver todos" para documento ${documentIndex}`);
                this.updateAllCidsModalContent(documentIndex);
              } else {
                console.log(`[MultiCIDManager] Fechando modal "Ver todos" - não há mais CIDs`);
                window.closeGenericModal();
              }
            }
            // Se está mostrando o modal de detalhes do CID removido, fechar
            else if (isShowingDetailModal) {
              console.log(`[MultiCIDManager] Fechando modal de detalhes do CID ${code}`);
              window.closeGenericModal();
            }
          }
        }, 100);
      }
    }
  }
  /**
   * Renderiza os links de CIDs no campo de doença
   * @param {string} documentIndex - Índice do documento
   */
  renderCidLinks(documentIndex) {
    const doencaInput = document.getElementById(`doenca${documentIndex}`);
    if (!doencaInput) return;

    const cidList = this.cidsData.get(documentIndex) || [];

    if (cidList.length === 0) {
      doencaInput.innerHTML = '<span class="text-gray-400" style="display: block; width: 100%;">Adicione CIDs usando o campo ao lado</span>';

      // Remover label destacada quando vazio
      const label = doencaInput.closest('.relative')?.querySelector('label');
      if (label) {
        label.classList.remove('text-blue-600');
        label.classList.add('text-gray-500');
      }
      return;
    }    // Manter label destacada quando tem conteúdo
    const label = doencaInput.closest('.relative')?.querySelector('label');
    if (label) {
      label.classList.add('text-blue-600');
      label.classList.remove('text-gray-500');
      label.style.opacity = '1';
      label.style.visibility = 'visible';
      label.style.color = 'var(--color-primary)';
      label.style.background = 'var(--color-bg)';
    }    // Criar CIDs separados por vírgula (sem ícones de atenção)
    const cidCodes = cidList.map(cid => {
      const isencaoStyle = cid.isencao ? 'font-weight: bold; color: #059669;' : 'color: #2563eb;';
      return `<span class="cid-code" data-code="${cid.code}" style="${isencaoStyle} cursor: pointer; text-decoration: underline;">${cid.code}</span>`;
    });

    // Container flexível para CIDs com botão "Ver todos" se houver múltiplos CIDs
    let cidsContainer;
    if (cidList.length > 1) {
      cidsContainer = `
        <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 4px;">
          ${cidCodes.join(', ')}
          <button class="ver-todos-btn ml-2 text-xs text-blue-600 hover:text-blue-800 underline"
                  style="background: none; border: none; cursor: pointer; font-size: 0.75rem;"
                  onclick="window.multiCIDManager.showAllCidsModal('${documentIndex}')"
                  title="Ver detalhes de todos os CIDs">
            Ver todos (${cidList.length})
          </button>
        </div>`;
    } else {
      cidsContainer = `<div style="display: flex; align-items: center; flex-wrap: wrap; gap: 4px;">${cidCodes.join(', ')}</div>`;
    }    doencaInput.innerHTML = cidsContainer;
    doencaInput.style.height = 'auto';
    doencaInput.style.minHeight = '48px';

    // Adicionar eventos aos links
    this.attachCidLinkEvents(documentIndex);    // Forçar atualização do estado do label após renderizar
    setTimeout(() => {
      if (typeof updateLabelState === 'function') {
        updateLabelState(doencaInput);
      } else {
        // Fallback: forçar visibilidade do label manualmente
        const label = doencaInput.closest('.relative')?.querySelector('label');
        if (label) {
          if (cidList.length > 0) {
            // Há CIDs - mostrar label
            doencaInput.classList.add('field-filled');
            label.classList.add('text-blue-600');
            label.classList.remove('text-gray-500', 'text-transparent');
            label.style.opacity = '1';
            label.style.visibility = 'visible';
            label.style.color = 'var(--color-primary)';
            label.style.background = 'var(--color-bg)';
            label.style.display = 'block';
            console.log(`[renderCidLinks] Label forçado como visível para ${documentIndex}`);
          } else {
            // Sem CIDs - ocultar label
            doencaInput.classList.remove('field-filled');
            label.classList.remove('text-blue-600');
            label.classList.add('text-gray-500');
            label.style.opacity = '0';
            label.style.visibility = 'hidden';
            console.log(`[renderCidLinks] Label forçado como oculto para ${documentIndex}`);
          }
        }
      }
    }, 50);
  }
  /**
   * Adiciona eventos aos links de CID
   * @param {string} documentIndex - Índice do documento
   */
  attachCidLinkEvents(documentIndex) {
    const doencaInput = document.getElementById(`doenca${documentIndex}`);
    if (!doencaInput) return;    // Eventos para códigos CID individuais
    doencaInput.querySelectorAll('.cid-code').forEach(span => {
      span.addEventListener('click', (e) => {
        e.preventDefault();
        const code = span.dataset.code;
        this.showCidDetailsModal(documentIndex, code);
      });
    });
  }  /**
   * Mostra modal com detalhes de um CID específico (versão minimalista)
   * @param {string} documentIndex - Índice do documento
   * @param {string} code - Código CID
   */  showCidDetailsModal(documentIndex, code) {
    const cidList = this.cidsData.get(documentIndex) || [];
    const cid = cidList.find(c => c.code === code);

    if (!cid) return;    // Layout minimal com espaçamento reduzido
    const content = `
      <div class="flex items-center justify-between gap-3">
        <div class="flex-1 min-w-0">
          <p class="text-gray-800 text-base leading-snug">${cid.description}</p>
          ${cid.isencao ? '<div class="inline-flex items-center px-2 py-1 bg-orange-50 text-orange-800 text-xs rounded-full mt-1"><i class="fas fa-shield-check mr-1 text-xs"></i>Isento de carência</div>' : ''}        </div>        <button class="bg-red-500 hover:bg-red-600 text-white rounded-full p-1 flex items-center justify-center w-8 h-8"
                onclick="window.multiCIDManager.removeCid('${documentIndex}', '${code}', true); window.closeGenericModal();"
                title="Remover CID">
          <i class="fas fa-minus text-lg"></i>
        </button>
      </div>
    `;

    if (window.showGenericModal) {
      window.showGenericModal({
        title: cid.code,
        content: content,
        buttons: []
      });
    }
  }
  /**
   * Mostra modal com todos os CIDs do documento (versão simplificada)
   * @param {string} documentIndex - Índice do documento
   */
  showAllCidsModal(documentIndex) {
    const cidList = this.cidsData.get(documentIndex) || [];

    if (cidList.length === 0) return;    // Layout minimalista com espaçamento reduzido
    const cidItems = cidList.map(cid => {
      return `
        <div class="border border-gray-200 rounded-lg p-2 hover:bg-gray-50 transition-colors" data-code="${cid.code}">
          <div class="flex items-center justify-between gap-2">
            <div class="flex-1 cursor-pointer cid-item-detail min-w-0" data-code="${cid.code}">
              <span class="font-semibold text-blue-600 text-sm">${cid.code}</span>
              <span class="text-gray-700 ml-2 text-sm">${cid.description}</span>
              ${cid.isencao ? '<span class="ml-2 text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">Isento de carência</span>' : ''}
            </div>            <button class="remove-cid-btn bg-red-500 hover:bg-red-600 text-white rounded-full p-1 flex items-center justify-center w-8 h-8"
                    data-doc-index="${documentIndex}" data-code="${cid.code}" title="Remover CID">
              <i class="fas fa-minus text-sm"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');    const content = `
      <div class="space-y-2">
        <div class="space-y-1.5 max-h-80 overflow-y-auto">
          ${cidItems}
        </div>
      </div>
    `;

    if (window.showGenericModal) {
      window.showGenericModal({
        title: `CIDs - Documento ${documentIndex}`,
        content: content,
        buttons: [] // Removido botão de fechar
      });      // Adicionar eventos aos itens e botões de remover
      setTimeout(() => {
        // Eventos para ver detalhes (clique no conteúdo)
        document.querySelectorAll('.cid-item-detail').forEach(item => {
          item.addEventListener('click', () => {
            const code = item.dataset.code;
            window.closeGenericModal();
            setTimeout(() => {
              this.showCidDetailsModal(documentIndex, code);
            }, 100);
          });
        });        // Eventos para remover CID
        document.querySelectorAll('.remove-cid-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const docIndex = btn.dataset.docIndex;
            const code = btn.dataset.code;
            this.removeCid(docIndex, code, true); // true para indicar que a remoção é feita a partir do modal

            // Atualizar modal sem fechar se ainda houver CIDs
            const remainingCids = this.cidsData.get(docIndex) || [];
            if (remainingCids.length > 0) {
              // Atualizar conteúdo do modal sem fechar
              this.updateAllCidsModalContent(docIndex);
            } else {
              // Fechar modal apenas se não houver mais CIDs
              window.closeGenericModal();
            }
          });
        });
      }, 100);
    }  }

  /**
   * Atualiza o conteúdo do modal "Ver todos" sem fechá-lo (elimina "piscada")
   * @param {string} documentIndex - Índice do documento
   */
  updateAllCidsModalContent(documentIndex) {
    const cidList = this.cidsData.get(documentIndex) || [];

    if (cidList.length === 0) {
      window.closeGenericModal();
      return;
    }

    // Regenerar conteúdo
    const cidItems = cidList.map(cid => {
      return `
        <div class="border border-gray-200 rounded-lg p-2 hover:bg-gray-50 transition-colors" data-code="${cid.code}">
          <div class="flex items-center justify-between gap-2">
            <div class="flex-1 cursor-pointer cid-item-detail min-w-0" data-code="${cid.code}">
              <span class="font-semibold text-blue-600 text-sm">${cid.code}</span>
              <span class="text-gray-700 ml-2 text-sm">${cid.description}</span>
              ${cid.isencao ? '<span class="ml-2 text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">Isento de carência</span>' : ''}
            </div>
            <button class="remove-cid-btn bg-red-500 hover:bg-red-600 text-white rounded-full p-1 flex items-center justify-center w-8 h-8"
                    data-doc-index="${documentIndex}" data-code="${cid.code}" title="Remover CID">
              <i class="fas fa-minus text-sm"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');

    const content = `
      <div class="space-y-2">
        <div class="space-y-1.5 max-h-80 overflow-y-auto">
          ${cidItems}
        </div>
      </div>
    `;    // Atualizar o conteúdo do modal existente
    const modalContent = document.querySelector('.modal-content .content') ||
                        document.querySelector('#genericModalContent');
    if (modalContent) {
      modalContent.innerHTML = content;

      // Triggerar atualização do label do campo principal após atualização do modal
      setTimeout(() => {
        const doencaInput = document.getElementById(`doenca${documentIndex}`);
        if (doencaInput) {
          if (typeof updateLabelState === 'function') {
            updateLabelState(doencaInput);
            console.log(`[updateAllCidsModalContent] Label atualizado para documento ${documentIndex}`);
          }
        }
      }, 10);

      // Reanexar eventos ao novo conteúdo
      setTimeout(() => {
        // Eventos para ver detalhes (clique no conteúdo)
        document.querySelectorAll('.cid-item-detail').forEach(item => {
          item.addEventListener('click', () => {
            const code = item.dataset.code;
            window.closeGenericModal();
            setTimeout(() => {
              this.showCidDetailsModal(documentIndex, code);
            }, 100);
          });
        });// Eventos para remover CID
        document.querySelectorAll('.remove-cid-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const docIndex = btn.dataset.docIndex;
            const code = btn.dataset.code;
            this.removeCid(docIndex, code, true); // true para indicar que a remoção é feita a partir do modal

            // Atualizar modal sem fechar se ainda houver CIDs
            const remainingCids = this.cidsData.get(docIndex) || [];
            if (remainingCids.length > 0) {
              // Atualizar conteúdo do modal sem fechar
              this.updateAllCidsModalContent(docIndex);
            } else {
              // Fechar modal apenas se não houver mais CIDs
              window.closeGenericModal();
            }
          });
        });
      }, 50);
    }
  }

  /**
   * Verifica se CID/doença tem isenção de carência
   * @param {string} code - Código CID
   * @param {string} description - Descrição da doença
   * @returns {boolean} - Se tem isenção
   */
  checkIsencaoCarencia(code, description) {
    // Verificar pelo CID
    const cidNormalizado = code.toLowerCase().replace(/\s+/g, '').replace(/\./g, '');
    const isentoPorCid = window.cidsSemCarencia && window.cidsSemCarencia.some(cid => {
      const cidRef = cid.toLowerCase().replace(/\s+/g, '').replace(/\./g, '');
      return cidNormalizado.startsWith(cidRef);
    });

    if (isentoPorCid) return true;

    // Verificar pela descrição
    if (window.doencasSemCarencia && description) {
      const descricaoNorm = description.toLowerCase().trim();
      const isentoPorDoenca = window.doencasSemCarencia.some(doenca => {
        const doencaNorm = doenca.toLowerCase().trim();
        return this.verificarCorrespondenciaDoenca(descricaoNorm, doencaNorm);
      });

      return isentoPorDoenca;
    }

    return false;
  }

  /**
   * Verifica correspondência entre doenças (método simplificado)
   * @param {string} doencaDigitada - Doença digitada
   * @param {string} doencaReferencia - Doença de referência
   * @returns {boolean} - Se há correspondência
   */
  verificarCorrespondenciaDoenca(doencaDigitada, doencaReferencia) {
    if (typeof verificarCorrespondenciaDoenca === 'function') {
      return verificarCorrespondenciaDoenca(doencaDigitada, doencaReferencia);
    }

    // Fallback simples
    return doencaDigitada.includes(doencaReferencia) || doencaReferencia.includes(doencaDigitada);
  }

  /**
   * Atualiza tag de isenção de carência no documento
   * @param {string} documentIndex - Índice do documento
   */
  updateIsencaoCarencia(documentIndex) {
    const doencaContainer = document.getElementById(`doenca${documentIndex}`)?.closest('.relative');
    const tagIsencao = doencaContainer?.querySelector('.isento-carencia-tag');

    if (!tagIsencao) return;

    const cidList = this.cidsData.get(documentIndex) || [];
    const temIsencao = cidList.some(cid => cid.isencao);    if (temIsencao) {
      tagIsencao.classList.remove('hidden');
      tagIsencao.setAttribute('title', 'Este documento possui CID(s) com isenção de carência');
      tagIsencao.style.cursor = 'pointer';

      // Remover listener anterior
      tagIsencao.removeEventListener('click', showIsencaoCarenciaModal);

      // Adicionar novo listener
      tagIsencao.addEventListener('click', showIsencaoCarenciaModal);
    } else {
      tagIsencao.classList.add('hidden');
      tagIsencao.removeAttribute('title');
    }  }

  /**
   * Atualiza estado do formulário
   */
  updateFormState() {
    if (!window.formStateManager) return;

    const incapacityData = window.formStateManager.formData.incapacity || {};

    // Converter dados para formato compatível
    incapacityData.multiCids = {};
    incapacityData.isencaoCarencia = {};

    this.cidsData.forEach((cidList, documentIndex) => {
      incapacityData.multiCids[documentIndex] = cidList;
      incapacityData.isencaoCarencia[documentIndex] = cidList.some(cid => cid.isencao);
    });

    window.formStateManager.formData.incapacity = incapacityData;
  }

  /**
   * Restaura dados do estado do formulário
   */
  restoreFromFormState() {
    if (!window.formStateManager?.formData?.incapacity?.multiCids) return;

    const multiCids = window.formStateManager.formData.incapacity.multiCids;

    Object.entries(multiCids).forEach(([documentIndex, cidList]) => {
      if (Array.isArray(cidList) && cidList.length > 0) {
        this.cidsData.set(documentIndex, cidList);
        // Aguardar DOM estar pronto antes de renderizar
        setTimeout(() => {
          this.renderCidLinks(documentIndex);
          this.updateIsencaoCarencia(documentIndex);
        }, 100);
      }
    });

    console.log('[MultiCIDManager] Dados restaurados do formState');
  }

  /**
   * Obtém CIDs de um documento
   * @param {string} documentIndex - Índice do documento
   * @returns {Array} - Lista de CIDs
   */
  getCids(documentIndex) {
    return this.cidsData.get(documentIndex) || [];
  }

  /**
   * Obtém todos os dados de CIDs
   * @returns {Map} - Mapa com todos os CIDs
   */
  getAllCids() {
    return new Map(this.cidsData);
  }

  /**
   * Limpa todos os dados
   */
  clear() {
    this.cidsData.clear();
    this.updateFormState();
  }

  /**
   * Limpa todos os CIDs de um documento específico
   * @param {string} documentIndex - Índice do documento
   */
  clearDocumentCids(documentIndex) {
    if (this.cidsData.has(documentIndex)) {
      this.cidsData.delete(documentIndex);
      console.log(`[MultiCIDManager] Todos os CIDs removidos do documento ${documentIndex}`);

      // Atualizar UI
      this.renderCidLinks(documentIndex);

      // Atualizar estado do formulário
      this.updateFormState();

      // Atualizar tag de isenção
      this.updateIsencaoCarencia(documentIndex);
    }
  }
}

// Criar instância global
window.multiCIDManager = new MultiCIDManager();

// Lista de CIDs que dispensam carência - ATUALIZADA conforme Portaria Interministerial MTPS/MS Nº 22 DE 31/08/2022
// Verificar se já existe para evitar redeclaração
if (typeof window.cidsSemCarencia === 'undefined') {
  // Definir no escopo global para evitar redeclaração
  window.cidsSemCarencia = [
    // I - tuberculose ativa
    'a15', 'a16', 'a17', 'a18', 'a19',

    // II - hanseníase
    'a30',

    // III - transtorno mental grave (cursando com alienação mental)
    'f20', 'f21', 'f22', 'f23', 'f24', 'f25', 'f28', 'f29', // Esquizofrenia e transtornos psicóticos
    'f30', 'f31', // Transtorno bipolar
    'f32', 'f33', // Transtornos depressivos graves
    'f00', 'f01', 'f02', 'f03', // Demências
    'f84', // Autismo (transtorno global do desenvolvimento)

    // IV - neoplasia maligna
    'c00', 'c01', 'c02', 'c03', 'c04', 'c05', 'c06', 'c07', 'c08', 'c09',
    'c10', 'c11', 'c12', 'c13', 'c14', 'c15', 'c16', 'c17', 'c18', 'c19',
    'c20', 'c21', 'c22', 'c23', 'c24', 'c25', 'c26', 'c27', 'c28', 'c29',
    'c30', 'c31', 'c32', 'c33', 'c34', 'c35', 'c36', 'c37', 'c38', 'c39',
    'c40', 'c41', 'c42', 'c43', 'c44', 'c45', 'c46', 'c47', 'c48', 'c49',
    'c50', 'c51', 'c52', 'c53', 'c54', 'c55', 'c56', 'c57', 'c58', 'c59',
    'c60', 'c61', 'c62', 'c63', 'c64', 'c65', 'c66', 'c67', 'c68', 'c69',
    'c70', 'c71', 'c72', 'c73', 'c74', 'c75', 'c76', 'c77', 'c78', 'c79',
    'c80', 'c81', 'c82', 'c83', 'c84', 'c85', 'c86', 'c87', 'c88', 'c89',
    'c90', 'c91', 'c92', 'c93', 'c94', 'c95', 'c96', 'c97',
    'd00', 'd01', 'd02', 'd03', 'd04', 'd05', 'd06', 'd07', 'd08', 'd09', // Neoplasias in situ

    // V - cegueira
    'h54.0', 'h54.1', 'h54.4', 'h54.9', // Cegueira total e amaurose

    // VI - paralisia irreversível e incapacitante
    'g80', 'g81', 'g82', 'g83', // Paralisia cerebral, hemiplegia, paraplegia, tetraplegia
    'g12', 'g14', // Esclerose lateral amiotrófica e doenças do neurônio motor

    // VII - cardiopatia grave
    'i20', 'i21', 'i22', 'i24', 'i25', // Doença isquêmica do coração
    'i42', 'i43', // Cardiomiopatia
    'i50', // Insuficiência cardíaca

    // VIII - doença de Parkinson
    'g20', 'g21', // Doença de Parkinson e parkinsonismo secundário

    // IX - espondilite anquilosante
    'm45', // Espondilite anquilosante

    // X - nefropatia grave
    'n17', 'n18', 'n19', // Insuficiência renal aguda e crônica
    'n04', 'n05', 'n06', // Síndrome nefrítica e nefrótica

    // XI - estado avançado da doença de Paget (osteíte deformante)
    'm88', // Doença de Paget

    // XII - síndrome da deficiência imunológica adquirida (AIDS)
    'b20', 'b21', 'b22', 'b23', 'b24', // HIV/AIDS
    'z21', // Estado de infecção assintomática pelo HIV

    // XIII - contaminação por radiação
    't66', // Efeitos da radiação
    'z87.891', // História pessoal de exposição à radiação

    // XIV - hepatopatia grave
    'k72', // Insuficiência hepática
    'k74', // Fibrose e cirrose hepática
    'k76.6', 'k76.7', // Hipertensão portal e síndrome hepatorrenal

    // XV - esclerose múltipla
    'g35', // Esclerose múltipla

    // XVI - acidente vascular encefálico (agudo)
    'i60', 'i61', 'i62', 'i63', 'i64', // AVC hemorrágico e isquêmico
    'g93.1', // Lesão cerebral anóxica

    // XVII - abdome agudo cirúrgico
    'k35', 'k36', 'k37', // Apendicite aguda
    'k40', 'k41', 'k42', 'k43', 'k44', 'k45', 'k46', // Hérnias com obstrução/gangrena
    'k56', // Íleo paralítico e obstrução intestinal
    'k92.2', // Hemorragia gastrointestinal
    'n13.3', 'n13.4', 'n13.5' // Hidronefrose com obstrução
  ];
}

// Lista de doenças que dispensam carência - ATUALIZADA conforme Portaria Interministerial MTPS/MS Nº 22 DE 31/08/2022
if (typeof window.doencasSemCarencia === 'undefined') {
  window.doencasSemCarencia = [
    // I - tuberculose ativa
    'tuberculose ativa',
    'tuberculose pulmonar ativa',
    'tuberculose extrapulmonar ativa',
    'tuberculose miliar ativa',

    // II - hanseníase
    'hanseníase',
    'lepra',
    'mal de hansen',
    'doença de hansen',

    // III - transtorno mental grave (cursando com alienação mental)
    'transtorno mental grave',
    'alienação mental',
    'esquizofrenia',
    'transtorno esquizofreniforme',
    'transtorno esquizoafetivo',
    'transtorno delirante',
    'transtorno psicótico breve',
    'transtorno psicótico induzido',
    'transtorno bipolar',
    'episódio maníaco',
    'episódio depressivo maior grave',
    'transtorno depressivo maior grave',
    'demência',
    'alzheimer',
    'doença de alzheimer',
    'demência vascular',
    'demência por corpos de lewy',
    'transtorno neurocognitivo maior',

    // IV - neoplasia maligna
    'neoplasia maligna',
    'tumor maligno',
    'câncer',
    'carcinoma',
    'adenocarcinoma',
    'carcinoma espinocelular',
    'carcinoma de células escamosas',
    'carcinoma basocelular invasivo',
    'sarcoma',
    'melanoma maligno',
    'melanoma',
    'linfoma hodgkin',
    'linfoma não hodgkin',
    'linfoma',
    'leucemia',
    'leucemia mieloide aguda',
    'leucemia linfoide aguda',
    'leucemia mieloide crônica',
    'leucemia linfoide crônica',
    'mieloma múltiplo',
    'plasmocitoma',
    'tumor de wilms',
    'neuroblastoma',
    'retinoblastoma',
    'osteossarcoma',
    'condrossarcoma',
    'rabdomiossarcoma',
    'fibrossarcoma',
    'lipossarcoma',
    'angiosarcoma',
    'tumor maligno primário',
    'tumor maligno secundário',
    'metástase',
    'carcinomatose',

    // V - cegueira
    'cegueira',
    'cegueira bilateral',
    'cegueira total',
    'amaurose',
    'perda total da visão',
    'ausência de percepção luminosa',

    // VI - paralisia irreversível e incapacitante
    'paralisia irreversível',
    'paralisia incapacitante',
    'tetraplegia',
    'quadriplegia',
    'paraplegia',
    'hemiplegia',
    'paralisia cerebral',
    'esclerose lateral amiotrófica',
    'ela',
    'doença do neurônio motor',
    'paralisia bulbar progressiva',
    'paralisia pseudobulbar',

    // VII - cardiopatia grave
    'cardiopatia grave',
    'insuficiência cardíaca',
    'insuficiência cardíaca congestiva',
    'cardiopatia isquêmica',
    'doença arterial coronariana',
    'cardiomiopatia',
    'cardiomiopatia dilatada',
    'cardiomiopatia hipertrófica',
    'cardiomiopatia restritiva',
    'infarto agudo do miocárdio',
    'infarto do miocárdio',
    'síndrome coronariana aguda',
    'angina instável',

    // VIII - doença de Parkinson
    'doença de parkinson',
    'mal de parkinson',
    'parkinsonismo',
    'síndrome parkinsoniana',

    // IX - espondilite anquilosante
    'espondilite anquilosante',
    'espondiloartrite anquilosante',
    'doença de bechterew',

    // X - nefropatia grave
    'nefropatia grave',
    'insuficiência renal crônica',
    'doença renal crônica',
    'insuficiência renal aguda',
    'síndrome nefrítica',
    'síndrome nefrótica',
    'glomerulonefrite',
    'nefrite',
    'rim policístico',

    // XI - estado avançado da doença de Paget (osteíte deformante)
    'doença de paget',
    'osteíte deformante',
    'estado avançado da doença de paget',

    // XII - síndrome da deficiência imunológica adquirida (AIDS)
    'aids',
    'síndrome da imunodeficiência adquirida',
    'síndrome da deficiência imunológica adquirida',
    'hiv',
    'vírus da imunodeficiência humana',
    'infecção pelo hiv',

    // XIII - contaminação por radiação
    'contaminação por radiação',
    'síndrome da radiação',
    'exposição à radiação',
    'doença da radiação',
    'efeitos da radiação',

    // XIV - hepatopatia grave
    'hepatopatia grave',
    'cirrose hepática',
    'cirrose',
    'insuficiência hepática',
    'insuficiência hepática aguda',
    'insuficiência hepática crônica',
    'hepatite fulminante',
    'doença hepática terminal',

    // XV - esclerose múltipla
    'esclerose múltipla',
    'esclerose em placas',

    // XVI - acidente vascular encefálico (agudo)
    'acidente vascular encefálico',
    'acidente vascular cerebral',
    'avc',
    'ave',
    'derrame cerebral',
    'avc isquêmico',
    'avc hemorrágico',
    'hemorragia cerebral',
    'hemorragia intracerebral',
    'hemorragia subaracnóidea',
    'infarto cerebral',
    'trombose cerebral',
    'embolia cerebral',

    // XVII - abdome agudo cirúrgico
    'abdome agudo cirúrgico',
    'abdômen agudo cirúrgico',
    'apendicite aguda',
    'peritonite',
    'perfuração intestinal',
    'obstrução intestinal',
    'íleo paralítico',
    'volvo intestinal',
    'intussuscepção',
    'hénia encarcerada',
    'hénia estrangulada',
    'colecistite aguda',
    'pancreatite aguda',
    'perfuração gástrica',
    'perfuração duodenal',
    'hemorragia digestiva alta',
    'hemorragia digestiva baixa',
    'isquemia mesentérica',
    'torção testicular',
    'gravidez ectópica'
  ];
}

// Lista de profissões mais comuns para autocomplete
window.profissoesComuns = [
  "Agricultor(a)",
  "Pedreiro(a)",
  "Professor(a)",
  "Motorista",
  "Açougueiro(a)",
  "Cozinheiro(a)",
  "Vendedor(a)",
  "Auxiliar Administrativo",
  "Enfermeiro(a)",
  "Médico(a)",
  "Advogado(a)",
  "Carpinteiro(a)",
  "Eletricista",
  "Garçom/Garçonete",
  "Pintor(a)",
  "Mecânico(a)",
  "Diarista",
  "Babá",
  "Porteiro(a)",
  "Zelador(a)",
  "Costureira",
  "Frentista",
  "Gari",
  "Jardineiro(a)",
  "Padeiro(a)",
  "Recepcionista",
  "Secretária",
  "Técnico(a) de Enfermagem",
  "Vigilante"
];

console.log('[incapacity.js] Profissões carregadas:', window.profissoesComuns.length, 'itens');

// Função de busca de profissões (pode ser adaptada para API futuramente)
window.buscarProfissoes = function(query) {
  return new Promise(resolve => {
    const resultados = window.profissoesComuns.filter(p => p.toLowerCase().includes(query.toLowerCase()));
    resolve(resultados);
  });
};

// Função para renderizar itens do dropdown de profissão
window.renderProfissoesDropdown = function(resultados) {
  return resultados.map(prof =>
    `<div class="dropdown-item px-4 py-2 hover:bg-blue-50 cursor-pointer">${prof}</div>`
  ).join('');
};

// Função para configurar autocomplete de profissão usando Search.js
window.setupProfissaoAutocomplete = function() {
  const input = document.getElementById('profissao');
  const dropdown = document.getElementById('profissaoDropdown');
  if (!input || !dropdown) return;

  console.log('[incapacity.js] Configurando autocomplete de profissão...');

  // Sempre esconder o dropdown de profissão se o campo já estiver preenchido ao restaurar
  dropdown.classList.add('hidden');

  let debounceTimer;
  // Função para buscar profissões
  function buscarProfissoes(query) {
    const resultados = window.profissoesComuns.filter(p => p.toLowerCase().includes(query.toLowerCase()));
    // Log apenas se encontrar resultados ou se a query for significativa
    if (resultados.length > 0 || query.length > 2) {
      console.log('[incapacity.js] Profissões encontradas para "' + query + '":', resultados.length);
    }
    return resultados;
  }

  // Função para renderizar resultados
  function renderizarProfissoes(resultados, query) {
    dropdown.innerHTML = '';
    if (!resultados.length) {
      dropdown.classList.add('hidden');
      return;
    }
    resultados.forEach(prof => {
      const item = document.createElement('div');
      item.className = 'dropdown-item px-4 py-2 hover:bg-blue-50 cursor-pointer';
      item.textContent = prof;
      item.addEventListener('mousedown', function(e) {
        e.preventDefault();
        input.value = prof;
        dropdown.classList.add('hidden');
        input.dispatchEvent(new Event('change', { bubbles: true }));
        console.log('[incapacity.js] Profissão selecionada:', prof);
      });
      dropdown.appendChild(item);
    });
    dropdown.classList.remove('hidden');
  }

  // Evento de input com debounce
  input.addEventListener('input', function() {
    const query = this.value.trim();
    console.log('[incapacity.js] Input digitado:', query);
    clearTimeout(debounceTimer);
    if (!query || query.length < 2) {
      dropdown.classList.add('hidden');
      return;
    }
    debounceTimer = setTimeout(() => {
      const resultados = buscarProfissoes(query);
      // Se só existe um resultado e ele é igual ao valor do campo, não mostrar dropdown
      if (resultados.length === 1 && resultados[0] === this.value) {
        dropdown.classList.add('hidden');
        return;
      }
      renderizarProfissoes(resultados, query);
    }, 250);
  });

  // Permitir selecionar com Enter
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !dropdown.classList.contains('hidden')) {
      e.preventDefault();
      const firstItem = dropdown.querySelector('.dropdown-item');
      if (firstItem) firstItem.dispatchEvent(new MouseEvent('mousedown'));
    }
  });

  // Fechar dropdown ao clicar fora
  document.addEventListener('mousedown', function(event) {
    if (!dropdown.contains(event.target) && event.target !== input) {
      dropdown.classList.add('hidden');
    }
  });
  console.log('[incapacity.js] Autocomplete de profissão configurado com sucesso!');
};

console.log('[incapacity.js] window.setupProfissaoAutocomplete definida!');

// Variável para controlar inicialização única do autocomplete
let profissaoAutocompleteInitialized = false;

// Função para resetar o estado de inicialização (útil para testes ou reinicialização)
window.resetProfissaoAutocompleteState = function() {
  profissaoAutocompleteInitialized = false;
  console.log('[incapacity.js] Estado do autocomplete de profissão resetado.');
};

// Função para inicializar o autocomplete de profissão
function initializeProfissaoAutocomplete() {
  // Verificar se já foi inicializado para evitar múltiplas tentativas
  if (profissaoAutocompleteInitialized) {
    console.log('[incapacity.js] Autocomplete de profissão já foi inicializado, ignorando chamada duplicada.');
    return;
  }

  console.log('[incapacity.js] Inicializando autocomplete de profissão...');

  let tentativas = 0;
  const maxTentativas = 20; // Reduzido para 2 segundos (20 * 100ms)

  // Espera o campo estar disponível antes de configurar
  function tryInitProfissaoAutocomplete() {
    tentativas++;
    const input = document.getElementById('profissao');
    const dropdown = document.getElementById('profissaoDropdown');

    // Log apenas nas primeiras e últimas tentativas para reduzir spam
    const shouldLog = tentativas <= 3 || tentativas >= maxTentativas - 2;

    if (shouldLog) {
      console.log(`[incapacity.js] Tentativa ${tentativas}/${maxTentativas} - input:`, !!input, 'dropdown:', !!dropdown, 'setupFunction:', !!window.setupProfissaoAutocomplete);
    }

    if (input && dropdown && window.setupProfissaoAutocomplete) {
      console.log('[incapacity.js] Elementos encontrados, configurando autocomplete...');
      window.setupProfissaoAutocomplete();
      profissaoAutocompleteInitialized = true; // Marcar como inicializado
      return true;
    } else if (tentativas < maxTentativas) {
      setTimeout(tryInitProfissaoAutocomplete, 100);
      return false;
    } else {
      console.warn('[incapacity.js] ⚠️  TIMEOUT: Não foi possível inicializar o autocomplete de profissão após', maxTentativas, 'tentativas');
      console.warn('[incapacity.js] Estado final - input:', !!input, 'dropdown:', !!dropdown, 'setupFunction:', !!window.setupProfissaoAutocomplete);
      console.warn('[incapacity.js] Isso pode ser normal se o template atual não contém campos de profissão.');
      profissaoAutocompleteInitialized = true; // Marcar para evitar novas tentativas
      return false;
    }
  }
  tryInitProfissaoAutocomplete();
}

// Inicialização será controlada apenas pelo initModule para evitar duplicatas
// A função será chamada quando o módulo for explicitamente inicializado

// Variável para evitar inicialização múltipla
if (typeof window.isDropdownHandlersInitialized === 'undefined') {
  window.isDropdownHandlersInitialized = false;
}

// Limpar função de inicialização anterior
window.initModule = null;

// Definir nova função de inicialização do módulo
window.initModule = function() {
  console.log('[incapacity.js] initModule: Iniciando módulo de incapacidades.');

  // Forçar reinicialização quando acessado diretamente pela URL
  if (window.location.hash === '#incapacity') {
    window._incapacityInitialized = false;
  }
  // Verificar se o módulo já foi inicializado nesta sessão
  if (window._incapacityInitialized) {
    console.log('[incapacity.js] Módulo de incapacidades já inicializado, ignorando duplicata.');
    return;
  }

  // Marcar como inicializado
  window._incapacityInitialized = true;

  // Inicializar o autocomplete de profissão
  console.log('[incapacity.js] Inicializando componentes do módulo...');
  initializeProfissaoAutocomplete();

  // Inicializar o conteúdo da página de forma estruturada
  initializePageContent();

  // Limpar flag quando a página mudar
  document.addEventListener('stepChanged', function handleStepChange() {
    window._incapacityInitialized = false;
    document.removeEventListener('stepChanged', handleStepChange);
  }, { once: true });

  console.log('[incapacity.js] Módulo de incapacidade: eventos configurados e inicialização solicitada.');
};

// Função para configurar eventos do módulo
function setupEvents() {
  console.log('[incapacity.js] Configurando eventos do módulo...');

  // Configurar verificação de isenção de carência
  setupIsencaoCarencia();

  // Configurar event listeners para limitações e medicamentos
  setupMultiSelectEventListeners();

  console.log('[incapacity.js] Eventos do módulo configurados');
}

/**
 * Configura event listeners para os selects de tipo de documento
 */
function setupDocumentoTipoSelects() {
  console.log('[incapacity.js] Configurando event listeners para tipo de documento...');

  document.addEventListener('change', function(event) {
    if (event.target.classList.contains('tipo-documento')) {
      if (event.target.value === 'outro') {
        window.currentDocumentoSelectGlobal = event.target;
        showOutroDocumentoModal();
      }
    }
  });

  console.log('[incapacity.js] Event listeners configurados para tipo de documento');
}

/**
 * Mostra modal para adicionar um tipo de documento personalizado
 */
function showOutroDocumentoModal() {
  if (typeof window.showGenericModal !== 'function') {
    console.error('Modal genérico não disponível');
    return;
  }

  window.showGenericModal({
    title: 'Informar Tipo de Documento',
    message: 'Digite o tipo de documento desejado:',
    content: '<input type="text" id="outroDocumentoInput" class="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Ex: Relatório médico, Declaração">',
    buttons: [
      {
        text: 'Cancelar',
        className: 'flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 text-center',
        onclick: function() {
          handleCancelOutroDocumento();
        }
      },
      {
        text: 'Salvar',
        className: 'flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-center',
        onclick: function() {
          handleSaveOutroDocumento();
        }
      }
    ]
  });

  // Configurar eventos adicionais
  setTimeout(() => {
    const input = document.getElementById('outroDocumentoInput');
    if (input) {
      // Salvar ao pressionar Enter
      input.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
          handleSaveOutroDocumento();
        }
      });

      // Focar no campo
      input.focus();
    }
  }, 100);
}

/**
 * Manipula o salvamento de um tipo de documento personalizado
 */
function handleSaveOutroDocumento() {
  const input = document.getElementById('outroDocumentoInput');
  if (!input || !window.currentDocumentoSelectGlobal) return;

  const novoTipoDocumento = input.value.trim();
  if (!novoTipoDocumento) {
    alert('Por favor, informe o tipo de documento.');
    input.focus();
    return;
  }

  // Verificar se a opção já existe
  const selectElement = window.currentDocumentoSelectGlobal;
  const existingOption = Array.from(selectElement.options).find(
    opt => opt.value.toLowerCase() === novoTipoDocumento.toLowerCase()
  );

  if (existingOption) {
    selectElement.value = existingOption.value;
  } else {
    // Criar nova opção
    const newOption = document.createElement('option');
    newOption.value = novoTipoDocumento;
    newOption.textContent = novoTipoDocumento;

    // Inserir antes da opção "Outro"
    const outroOption = Array.from(selectElement.options).find(opt => opt.value === 'outro');
    if (outroOption) {
      selectElement.insertBefore(newOption, outroOption);
    } else {
      selectElement.appendChild(newOption);
    }

    selectElement.value = novoTipoDocumento;
  }

  // Salvar automaticamente os dados do formulário
  if (window.formStateManager) {
    window.formStateManager.captureCurrentFormData();
  }

  window.currentDocumentoSelectGlobal = null;
  window.closeGenericModal();
}

/**
 * Manipula o cancelamento de tipo de documento personalizado
 */
function handleCancelOutroDocumento() {
  // Se o usuário cancelou e o valor do select ainda é "outro", reseta
  if (window.currentDocumentoSelectGlobal && window.currentDocumentoSelectGlobal.value === 'outro') {
    window.currentDocumentoSelectGlobal.value = ""; // Reseta para "Selecione..."
  }

  window.currentDocumentoSelectGlobal = null;
  window.closeGenericModal();
}

// Função unificada para inicializar o conteúdo da página
function initializePageContent() {
  // Configurar eventos do módulo
  setupEvents();

  // Configurar modal de "Outro Tipo de Documento"
  setupDocumentoTipoSelects();
  // Inicializar sistema de múltiplos CIDs
  if (window.multiCIDManager) {
    window.multiCIDManager.init();
  }

  // Inicializar sistemas de múltiplas limitações e medicamentos
  if (window.multiLimitacoesManager) {
    window.multiLimitacoesManager.init();
  }
  if (window.multiMedicamentosManager) {
    window.multiMedicamentosManager.init();
  }

  // Expor addDoencaField globalmente
  if (typeof window.addDoencaField === 'undefined' && typeof addDoencaField === 'function') {
    window.addDoencaField = addDoencaField;
    console.log("[incapacity.js] initModule: window.addDoencaField definido.");
  }
  console.log('[incapacity.js] Iniciando inicialização de componentes...');
  // Inicializar verificação de isenção de carência
  setupIsencaoCarencia();
  // O novo sistema CID se inicializa automaticamente via MutationObserver
  console.log('[incapacity.js] Sistema CID é gerenciado automaticamente pelo novo CIDSystem');

  // Configurar dropdowns múltiplos para limitações e tratamentos
  // setupMultipleSelectDropdowns(); // Removido - usando dropdowns simples agora

  // Ocultar dropdown de profissão antes de restaurar
  const profInput = document.getElementById('profissao');
  const profDropdown = document.getElementById('profissaoDropdown');
  if (profInput && profDropdown) {
    profDropdown.classList.add('hidden');
  }

  // Restaurar dados para esta etapa
  if (window.formStateManager) {
    const currentStepKey = 'incapacity';
    console.log(`[incapacity.js] initModule: Solicitando restauração para a etapa: ${currentStepKey}`);
    window.formStateManager.ensureFormAndRestore(currentStepKey);    // Aplicar validações após a restauração
    setTimeout(function() {
      console.log('[incapacity.js] Aplicando validações pós-restauração...');

      // Restaurar dados dos managers
      if (window.multiLimitacoesManager) {
        window.multiLimitacoesManager.restoreFromFormState();
      }
      if (window.multiMedicamentosManager) {
        window.multiMedicamentosManager.restoreFromFormState();
      }

      document.querySelectorAll('.doenca-input').forEach(input => {
        if (typeof verificarIsencaoCarencia === 'function') {
          verificarIsencaoCarencia(input);
        }
      });

      document.querySelectorAll('.cid-input').forEach(input => {
        const index = input.getAttribute('data-index');
        const doencaInput = document.getElementById('doenca' + index);
        if (doencaInput && typeof verificarIsencaoCarencia === 'function') {
          verificarIsencaoCarencia(doencaInput);
        }
      });// O novo sistema CID detecta e configura campos automaticamente
      // através do MutationObserver, não sendo necessário reinicialização manual
      console.log('[incapacity.js] Campos CID são configurados automaticamente pelo CIDSystem');

      // Garantir que dropdown de profissão permanece oculto
      requestAnimationFrame(() => {
        if (profInput && profDropdown) {
          profDropdown.classList.add('hidden');
        }
      });

      console.log('[incapacity.js] Validações pós-restauração aplicadas.');
    }, 350);
  } else {
    console.error("[incapacity.js] initModule: formStateManager não encontrado. A restauração não ocorrerá.");
  }
  // Configurar listeners para campos tipo-documento (modais)
  document.querySelectorAll('.tipo-documento').forEach(select => {
    select.addEventListener('change', function() {
      if (this.value === 'outro') {
        window.currentDocumentoSelectGlobal = this;
        if (typeof window.showOutroDocumentoModal === 'function') {
          window.showOutroDocumentoModal();
        }
      }
    });
  });

  // Configurar event listeners para limitações e medicamentos
  setupMultiSelectEventListeners();

  // Configurar botões de navegação usando o sistema padronizado
  if (window.Navigation) {
    window.Navigation.setupNavigationButtons();
  }

  console.log('[incapacity.js] Componentes inicializados com sucesso.');
}

// Função para resetar a UI da seção de incapacidade (doenças/CIDs)
function resetIncapacityUI() {
  console.log('[incapacity.js] resetIncapacityUI: Iniciando limpeza de linhas de doença/CID.');
  const doencasListContainer = document.getElementById('doencas-list'); // CONFIRMAR ESTE ID

  if (doencasListContainer) {
    // Remover todas as linhas de doença existentes
    const doencaRows = doencasListContainer.querySelectorAll('.doenca-row'); // CONFIRMAR ESTA CLASSE
    doencaRows.forEach(row => row.remove());
    console.log(`[incapacity.js] resetIncapacityUI: ${doencaRows.length} linhas de doença removidas.`);

    // Adicionar uma primeira linha em branco, se a função addDoencaField existir e for apropriado
    if (typeof addDoencaField === 'function') {
      // addDoencaField(); // Descomentar se uma linha inicial for necessária
      // console.log('[incapacity.js] resetIncapacityUI: Uma linha de doença inicial adicionada (se configurado).');
      // Se addDoencaField já é chamada no initModule ou ao carregar o template, talvez não precise chamar aqui.
      // Por enquanto, apenas limpamos. O initModule/restauração deve lidar com a criação da primeira linha se necessário.
    } else {
      console.warn('[incapacity.js] resetIncapacityUI: Função addDoencaField() não encontrada para adicionar linha inicial.');
    }

    // Limpar campos de observações desta seção
    const observacoesTextarea = document.querySelector('#incapacity-form #observacoes'); // Ser mais específico
    if (observacoesTextarea) {
        observacoesTextarea.value = '';
    }

  } else {
    console.warn('[incapacity.js] resetIncapacityUI: Container #doencas-list não encontrado.');
  }
  // Resetar outros estados específicos do módulo de incapacidade, se houver.
  // Por exemplo, limpar seleções de dropdowns, resultados de pesquisa de CID, etc.
  // Isso pode ser complexo e depender da implementação exata dos componentes de UI.
  // Exemplo genérico para limpar dropdowns de pesquisa:
  document.querySelectorAll('.cid-dropdown').forEach(dropdown => dropdown.classList.add('hidden'));
  document.querySelectorAll('.cid-input').forEach(input => input.value = ''); // Limpa campos de input CID
  document.querySelectorAll('.doenca-input').forEach(input => input.value = ''); // Limpa campos de input Doença

  // Resetar a verificação de isenção de carência visualmente
  const carenciaInfo = document.getElementById('carencia-info');
  if (carenciaInfo) {
    carenciaInfo.innerHTML = '';
    carenciaInfo.className = 'mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md'; // Resetar classes
  }
}
window.resetIncapacityUI = resetIncapacityUI;



















// Função para verificar se a doença dispensa carência (REVISADA PARA MÚLTIPLOS Cids)
function verificarIsencaoCarencia(element) {
  console.log('[incapacity.js] Verificando isenção de carência para elemento:', element.id);

  // Obter o índice do documento
  const cidIndex = element.getAttribute('data-index');
  if (!cidIndex) {
    console.warn('[incapacity.js] Índice não encontrado para elemento:', element.id);
    return;
  }

  // Com o novo sistema, verificar se há CIDs armazenados no MultiCIDManager
  if (window.multiCIDManager) {
    const isento = window.multiCIDManager.checkIsencaoCarencia(cidIndex);
    console.log('[incapacity.js] Resultado da verificação de isenção:', isento);
    return;
  }

  // Fallback para o sistema antigo (caso o MultiCIDManager não esteja disponível)
  const cidInput = document.getElementById('cid' + cidIndex);
  let isento = false;
  let motivoIsencao = '';

  if (cidInput && cidInput.value && cidInput.value.trim() !== '') {
    const cidValor = cidInput.value.toLowerCase().trim().replace(/\s+/g, '').replace(/\./g, '');
    console.log('[incapacity.js] Verificando CID (fallback):', cidValor);

    // Verificar se o CID está na lista de isentos (comparação por prefixo)
    isento = window.cidsSemCarencia.some(cid => {
      const cidNormalizado = cid.toLowerCase().replace(/\s+/g, '').replace(/\./g, '');
      const match = cidValor.startsWith(cidNormalizado);
      if (match) {
        motivoIsencao = `CID ${cid.toUpperCase()} - isenção legal de carência`;
        console.log('[incapacity.js] CID isento encontrado (fallback):', cid);
      }
      return match;
    });
  }
  // Verificar pelo texto da doença (método secundário - apenas para fallback)
  if (!isento && element.textContent && element.textContent.trim() !== '') {
    const doencaValor = element.textContent.toLowerCase().trim();
    console.log('[incapacity.js] Verificando doença (fallback):', doencaValor);

    // Usar busca mais rigorosa para evitar falsos positivos
    isento = window.doencasSemCarencia.some(doenca => {
      const doencaNorm = doenca.toLowerCase().trim();

      // Verificação rigorosa: a doença digitada deve conter o termo completo
      // ou ser uma correspondência muito próxima
      const match = verificarCorrespondenciaDoenca(doencaValor, doencaNorm);

      if (match) {
        motivoIsencao = `Doença: "${doenca}" - isenção legal de carência`;
        console.log('[incapacity.js] Doença isenta encontrada:', doenca);
      }
      return match;
    });
  }

  // Encontrar a tag de isenção associada a este elemento
  const tagIsencao = element.closest('.relative')?.querySelector('.isento-carencia-tag');

  if (isento && (element.textContent.trim() !== '' || (cidInput && cidInput.value && cidInput.value.trim() !== ''))) {
    console.log('[incapacity.js] Aplicando isenção de carência (fallback):', motivoIsencao);    if (tagIsencao) {
      tagIsencao.classList.remove('hidden');
      tagIsencao.setAttribute('title', motivoIsencao);

      // Tornar a tag clicável
      tagIsencao.style.cursor = 'pointer';

      // Remover listener anterior para evitar duplicatas
      tagIsencao.removeEventListener('click', showIsencaoCarenciaModal);

      // Adicionar evento de clique para mostrar modal com informações legais
      tagIsencao.addEventListener('click', showIsencaoCarenciaModal);    }

    // Adicionar classe visual para o campo (apenas no fallback)
    element.classList.add('isento-carencia-field');
    if (cidInput) cidInput.classList.add('isento-carencia-field');

    // Armazenar informação da isenção no formStateManager se disponível
    if (window.formStateManager && cidIndex) {
      // Acessar dados diretamente da propriedade formData
      const stepData = window.formStateManager.formData.incapacity || {};
      if (!stepData.isencaoCarencia) {
        stepData.isencaoCarencia = {};
      }
      stepData.isencaoCarencia[cidIndex] = {
        doenca: element.textContent || '',
        temIsencao: true,
        timestamp: Date.now()
      };
      // Os dados são automaticamente salvos pois stepData é uma referência
    }
  } else {
    console.log('[incapacity.js] Sem isenção de carência aplicável');    if (tagIsencao) {
      tagIsencao.classList.add('hidden');
      tagIsencao.removeAttribute('title');
    }

    // Remover a anotação visual (apenas no fallback)
    element.classList.remove('isento-carencia-field');
    if (cidInput) cidInput.classList.remove('isento-carencia-field');

    // Remover informação da isenção do formStateManager se disponível
    if (window.formStateManager && cidIndex) {
      // Acessar dados diretamente da propriedade formData
      const stepData = window.formStateManager.formData.incapacity || {};
      if (stepData.isencaoCarencia && stepData.isencaoCarencia[cidIndex]) {
        delete stepData.isencaoCarencia[cidIndex];
        // Os dados são automaticamente salvos pois stepData é uma referência
      }
    }
  }
}

/**
 * Função auxiliar para verificar correspondência rigorosa entre doenças
 * Evita falsos positivos com termos muito genéricos
 */
function verificarCorrespondenciaDoenca(doencaDigitada, doencaReferencia) {
  // Normalizar strings removendo acentos e caracteres especiais
  const normalizarTexto = (texto) => {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Removes accents
      .replace(/[^\w\s]/g, '') // Removes punctuation
      .replace(/\s+/g, ' ') // Normalizes spaces
      .trim();
  };

  const doencaDigitadaNorm = normalizarTexto(doencaDigitada);
  const doencaReferenciaNorm = normalizarTexto(doencaReferencia);

  // NOVA VALIDAÇÃO: Verificar se não contém termos que invalidam a isenção
  const termosExcludentes = [
    'benigno', 'benigna', 'suspeita', 'risco', 'chance', 'medo', 'exame',
    'preventivo', 'rastreamento', 'histórico', 'historico', 'familiar',
    'hereditário', 'hereditario', 'predisposição', 'predisposicao'
  ];

  const contemTermoExcludente = termosExcludentes.some(termo =>
    doencaDigitadaNorm.includes(termo)
  );

  if (contemTermoExcludente) {
    console.log('[incapacity.js] Termo excludente encontrado, rejeitando isenção');
    return false;
  }

  // Método 1: Correspondência exata
  if (doencaDigitadaNorm === doencaReferenciaNorm) {
    return true;
  }

  // Método 2: A doença digitada contém exatamente o termo de referência como palavra completa
  const palavrasReferencia = doencaReferenciaNorm.split(' ');
  const palavrasDigitada = doencaDigitadaNorm.split(' ');

  // Verificar se todas as palavras da referência estão presentes na doença digitada
  const todasPalavrasPresentes = palavrasReferencia.every(palavra => {
    return palavrasDigitada.includes(palavra);
  });

  if (todasPalavrasPresentes && palavrasReferencia.length >= 2) {
    return true; // Só aceita se a referência tem pelo menos 2 palavras
  }
  // Método 3: Para termos únicos importantes, verificar se são palavras completas
  const termosUnicos = [
    'esquizofrenia', 'hanseniase', 'lepra', 'aids', 'hiv', 'cegueira',
    'tetraplegia', 'paraplegia', 'alzheimer', 'parkinson', 'cirrose'
  ];

  if (termosUnicos.includes(doencaReferenciaNorm)) {
    // Verificar se a palavra aparece como termo completo (não como substring)
    const regex = new RegExp(`\\b${doencaReferenciaNorm}\\b`, 'i');
    return regex.test(doencaDigitadaNorm);
  }

  // Método 4: Para termos de neoplasia, aplicar validação muito rigorosa
  const termosNeoplasia = ['carcinoma', 'adenocarcinoma', 'sarcoma', 'melanoma', 'linfoma', 'leucemia', 'mieloma'];
  if (termosNeoplasia.some(termo => doencaReferenciaNorm.includes(termo))) {
    // Para neoplasias, exigir correspondência exata ou muito específica
    const termoEncontrado = termosNeoplasia.find(termo => doencaReferenciaNorm.includes(termo));
    const regex = new RegExp(`\\b${termoEncontrado}\\b`, 'i');
    const matchExato = regex.test(doencaDigitadaNorm);

    // Adicionalmente, verificar se não há qualificadores que invalidem
    const qualificadoresInvalidos = ['in situ', 'benigno', 'benigna'];
    const temQualificadorInvalido = qualificadoresInvalidos.some(qual =>
      doencaDigitadaNorm.includes(qual)
    );

    return matchExato && !temQualificadorInvalido;
  }

  // Método 5: Para neoplasias com qualificadores específicos, verificar ambos os termos
  if (doencaReferenciaNorm.includes('neoplasia maligna') ||
      doencaReferenciaNorm.includes('tumor maligno')) {
    const temNeoplasia = doencaDigitadaNorm.includes('neoplasia') || doencaDigitadaNorm.includes('tumor');
    const temMaligno = doencaDigitadaNorm.includes('maligna') || doencaDigitadaNorm.includes('maligno');
    return temNeoplasia && temMaligno;
  }

  // Se chegou até aqui, não houve correspondência válida
  return false;
}

// Função para configurar a verificação de isenção de carência
function setupIsencaoCarencia() {
  // Com o novo sistema de múltiplos CIDs, a verificação de isenção é feita pelo MultiCIDManager
  // Esta função serve como fallback para compatibilidade com o sistema antigo

  // Adicionar listeners para campos de doença (que agora são divs)
  document.querySelectorAll('.doenca-input').forEach(element => {
    if (!element.dataset.isencaoListenerAdded) {
      element.dataset.isencaoListenerAdded = 'true';

      // Verificar estado inicial apenas se não há MultiCIDManager
      if (!window.multiCIDManager) {
        verificarIsencaoCarencia(element);
      }
    }
  });

  // Adicionar listeners para campos CID existentes como fallback
  document.querySelectorAll('.cid-input').forEach(input => {
    if (!input.dataset.isencaoListenerAdded) {
      // Apenas adicionar listeners se MultiCIDManager não estiver disponível
      if (!window.multiCIDManager) {
        input.addEventListener('input', function() {
          const index = this.getAttribute('data-index');
          const doencaElement = document.getElementById('doenca' + index);
          if (doencaElement) {
            verificarIsencaoCarencia(doencaElement);
          }
        });

        input.addEventListener('change', function() {
          const index = this.getAttribute('data-index');
          const doencaElement = document.getElementById('doenca' + index);
          if (doencaElement) {
            verificarIsencaoCarencia(doencaElement);
          }
        });

        input.addEventListener('blur', function() {
          const index = this.getAttribute('data-index');
          const doencaElement = document.getElementById('doenca' + index);
          if (doencaElement) {
            verificarIsencaoCarencia(doencaElement);
          }
        });
      }

      input.dataset.isencaoListenerAdded = 'true';
    }
  });

  // Observar mudanças no DOM para novos campos adicionados
  const doencasList = document.getElementById('doencasList');
  if (doencasList && !window.multiCIDManager) {
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach(function(node) {
            if (node.nodeType === 1) { // Element node
              const novosCampos = node.querySelectorAll('.doenca-input, .cid-input');
              novosCampos.forEach(campo => {
                if (!campo.dataset.isencaoListenerAdded) {
                  if (campo.classList.contains('cid-input')) {
                    campo.addEventListener('change', function() {
                      const index = this.getAttribute('data-index');
                      const doencaElement = document.getElementById('doenca' + index);
                      if (doencaElement) {
                        verificarIsencaoCarencia(doencaElement);
                      }
                    });
                  }
                  campo.dataset.isencaoListenerAdded = 'true';
                }
              });
            }
          });
        }
      });
    });

    observer.observe(doencasList, { childList: true, subtree: true });
  }
}

/**
 * Classe para gerenciar múltiplas limitações
 */
class MultiLimitacoesManager {
  constructor() {
    this.limitacoesData = new Set();
  }

  /**
   * Inicializa o sistema
   */
  init() {
    console.log('[MultiLimitacoesManager] Inicializando sistema de múltiplas limitações...');
    this.setupDropdownOptions();
  }

  /**
   * Configura as opções do dropdown de limitações
   */
  setupDropdownOptions() {
    const limitacoesSelect = document.getElementById('limitacoesSelect');
    if (!limitacoesSelect) return;    const limitacoesComuns = [
      'Dificuldade para caminhar',
      'Não consegue carregar peso',
      'Dificuldade para ficar em pé',
      'Dificuldade para se concentrar',
      'Dores constantes',
      'Fadiga extrema',
      'Limitação de movimentos',
      'Dificuldade respiratória',
      'Outro'
    ];    // Limpar opções existentes (exceto a primeira)
    while (limitacoesSelect.children.length > 1) {
      limitacoesSelect.removeChild(limitacoesSelect.lastChild);
    }

    // Adicionar opções
    limitacoesComuns.forEach(limitacao => {
      const option = document.createElement('option');
      option.value = limitacao === 'Outro' ? 'outro' : limitacao;
      option.textContent = limitacao;
      limitacoesSelect.appendChild(option);
    });
  }

  /**
   * Adiciona uma limitação
   * @param {string} limitacao - Limitação a adicionar
   * @returns {boolean} - Sucesso da operação
   */
  addLimitacao(limitacao) {
    if (!limitacao || typeof limitacao !== 'string') {
      console.warn('[MultiLimitacoesManager] Limitação inválida');
      return false;
    }

    const limitacaoTrimmed = limitacao.trim();
    if (this.limitacoesData.has(limitacaoTrimmed)) {
      console.warn('[MultiLimitacoesManager] Limitação já existe');
      return false;
    }

    this.limitacoesData.add(limitacaoTrimmed);
    console.log(`[MultiLimitacoesManager] Limitação adicionada: ${limitacaoTrimmed}`);

    this.renderLimitacoes();
    this.updateFormState();
    this.updateLabelState();

    return true;
  }

  /**
   * Remove uma limitação
   * @param {string} limitacao - Limitação a remover
   */
  removeLimitacao(limitacao) {
    if (!limitacao) return;

    this.limitacoesData.delete(limitacao);
    console.log(`[MultiLimitacoesManager] Limitação removida: ${limitacao}`);

    this.renderLimitacoes();
    this.updateFormState();
    this.updateLabelState();
  }

  /**
   * Renderiza as limitações como tags visuais
   */
  renderLimitacoes() {
    const container = document.getElementById('limitacoesSelecionadas');
    if (!container) return;

    container.innerHTML = '';

    if (this.limitacoesData.size === 0) {
      container.innerHTML = '<p class="text-gray-500 text-sm italic">Nenhuma limitação selecionada</p>';
      return;
    }

    this.limitacoesData.forEach(limitacao => {
      const tag = document.createElement('div');
      tag.className = 'inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm mr-2 mb-2';
      tag.innerHTML = `
        <span class="mr-2">${limitacao}</span>
        <button type="button" class="text-blue-600 hover:text-blue-800 focus:outline-none" title="Remover limitação">
          <i class="fas fa-times text-xs"></i>
        </button>
      `;

      // Configurar botão de remover
      const removeBtn = tag.querySelector('button');
      removeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.removeLimitacao(limitacao);
      });

      container.appendChild(tag);
    });
  }

  /**
   * Atualiza estado do formulário
   */
  updateFormState() {
    if (!window.formStateManager) return;

    const incapacityData = window.formStateManager.formData.incapacity || {};
    incapacityData.limitacoes = Array.from(this.limitacoesData);
    window.formStateManager.formData.incapacity = incapacityData;

    // Atualizar também o campo hidden
    const hiddenField = document.getElementById('limitacoesDiarias');
    if (hiddenField) {
      hiddenField.value = JSON.stringify(Array.from(this.limitacoesData));
    }
  }

  /**
   * Restaura dados do estado do formulário
   */
  restoreFromFormState() {
    if (!window.formStateManager?.formData?.incapacity?.limitacoes) return;

    const savedLimitacoes = window.formStateManager.formData.incapacity.limitacoes;

    if (Array.isArray(savedLimitacoes)) {
      this.limitacoesData.clear();
      savedLimitacoes.forEach(limitacao => {
        if (limitacao && typeof limitacao === 'string') {
          this.limitacoesData.add(limitacao);
        }
      });

      // Aguardar DOM estar pronto antes de renderizar
      setTimeout(() => {
        this.renderLimitacoes();
        this.updateLabelState();
      },  100);

      console.log('[MultiLimitacoesManager] Dados restaurados do formState');
    }
  }

  /**
   * Obtém todas as limitações
   * @returns {Array} Array com todas as limitações
   */
  getLimitacoes() {
    return Array.from(this.limitacoesData);
  }

  /**
   * Limpa todas as limitações
   */
  clear() {
    this.limitacoesData.clear();
    this.renderLimitacoes();
    this.updateFormState();
    this.updateLabelState();
  }

  /**
   * Atualiza o estado do label
   */
  updateLabelState() {
    const limitacoesSelect = document.getElementById('limitacoesSelect');
    if (!limitacoesSelect) return;

    const label = limitacoesSelect.closest('.relative')?.querySelector('label');
    if (!label) return;

    if (this.limitacoesData.size > 0) {
      label.classList.add('text-blue-600');
      label.classList.remove('text-gray-500');
      label.style.opacity = '1';
      label.style.visibility = 'visible';
      label.style.color = 'var(--color-primary)';
      label.style.background = 'var(--color-bg)';
    } else {
      label.classList.remove('text-blue-600');
      label.classList.add('text-gray-500');
    }
  }
}

/**
 * Classe para gerenciar múltiplos medicamentos
 */
class MultiMedicamentosManager {
  constructor() {
    this.medicamentosData = new Set();
    this.medicamentosMap = new Map(); // Para mapear valores do select para texto
  }

  /**
   * Inicializa o sistema
   */
  init() {
    console.log('[MultiMedicamentosManager] Inicializando sistema de múltiplos medicamentos...');
    this.setupMedicamentosMap();
  }  /**
   * Configura o mapeamento de medicamentos
   */
  setupMedicamentosMap() {
    this.medicamentosMap.set('para_dor', 'Para dor');
    this.medicamentosMap.set('para_inflamacao', 'Para inflamação');
    this.medicamentosMap.set('para_relaxamento_muscular', 'Para relaxamento muscular');
    this.medicamentosMap.set('para_depressao', 'Para depressão');
    this.medicamentosMap.set('para_ansiedade', 'Para ansiedade');
    this.medicamentosMap.set('para_dormir', 'Para dormir');
    this.medicamentosMap.set('outro', 'Outro');
  }

  /**
   * Adiciona um medicamento
   * @param {string} medicamento - Medicamento a adicionar
   * @returns {boolean} - Sucesso da operação
   */
  addMedicamento(medicamento) {
    if (!medicamento || typeof medicamento !== 'string') {
      console.warn('[MultiMedicamentosManager] Medicamento inválido');
      return false;
    }

    const medicamentoTrimmed = medicamento.trim();
    if (this.medicamentosData.has(medicamentoTrimmed)) {
      console.warn('[MultiMedicamentosManager] Medicamento já existe');
      return false;
    }

    this.medicamentosData.add(medicamentoTrimmed);
    console.log(`[MultiMedicamentosManager] Medicamento adicionado: ${medicamentoTrimmed}`);

    this.renderMedicamentos();
    this.updateFormState();
    this.updateLabelState();

    return true;
  }

  /**
   * Remove um medicamento
   * @param {string} medicamento - Medicamento a remover
   */
  removeMedicamento(medicamento) {
    if (!medicamento) return;

    this.medicamentosData.delete(medicamento);
    console.log(`[MultiMedicamentosManager] Medicamento removido: ${medicamento}`);

    this.renderMedicamentos();
    this.updateFormState();
    this.updateLabelState();
  }

  /**
   * Renderiza os medicamentos como tags visuais
   */
  renderMedicamentos() {
    const container = document.getElementById('medicamentosSelecionados');
    if (!container) return;

    container.innerHTML = '';

    if (this.medicamentosData.size === 0) {
      container.innerHTML = '<p class="text-gray-500 text-sm italic">Nenhum medicamento selecionado</p>';
      return;
    }

    this.medicamentosData.forEach(medicamento => {
      const tag = document.createElement('div');
      tag.className = 'inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm mr-2 mb-2';
      tag.innerHTML = `
        <span class="mr-2">${medicamento}</span>
        <button type="button" class="text-green-600 hover:text-green-800 focus:outline-none" title="Remover medicamento">
          <i class="fas fa-times text-xs"></i>
        </button>
      `;

      // Configurar botão de remover
      const removeBtn = tag.querySelector('button');
      removeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.removeMedicamento(medicamento);
      });

      container.appendChild(tag);
    });
  }

  /**
   * Atualiza estado do formulário
   */
  updateFormState() {
    if (!window.formStateManager) return;

    const incapacityData = window.formStateManager.formData.incapacity || {};
    incapacityData.medicamentos = Array.from(this.medicamentosData);
    window.formStateManager.formData.incapacity = incapacityData;

    // Atualizar também o campo hidden
    const hiddenField = document.getElementById('medicamentosAtuaisHidden');
    if (hiddenField) {
      hiddenField.value = JSON.stringify(Array.from(this.medicamentosData));
    }
  }

  /**
   * Restaura dados do estado do formulário
   */
  restoreFromFormState() {
    if (!window.formStateManager?.formData?.incapacity?.medicamentos) return;

    const savedMedicamentos = window.formStateManager.formData.incapacity.medicamentos;

    if (Array.isArray(savedMedicamentos)) {
      this.medicamentosData.clear();
      savedMedicamentos.forEach(medicamento => {
        if (medicamento && typeof medicamento === 'string') {
          this.medicamentosData.add(medicamento);
        }
      });

      // Aguardar DOM estar pronto antes de renderizar
      setTimeout(() => {
        this.renderMedicamentos();
        this.updateLabelState();
      }, 100);

      console.log('[MultiMedicamentosManager] Dados restaurados do formState');
    }
  }

  /**
   * Obtém todos os medicamentos
   * @returns {Array} Array com todos os medicamentos
   */
  getMedicamentos() {
    return Array.from(this.medicamentosData);
  }

  /**
   * Limpa todos os medicamentos
   */
  clear() {
    this.medicamentosData.clear();
    this.renderMedicamentos();
    this.updateFormState();
    this.updateLabelState();
  }

  /**
   * Atualiza o estado do label
   */
  updateLabelState() {
    const medicamentosSelect = document.getElementById('medicamentosAtuais');
    if (!medicamentosSelect) return;

    const label = medicamentosSelect.closest('.relative')?.querySelector('label');
    if (!label) return;

    if (this.medicamentosData.size > 0) {
      label.classList.add('text-blue-600');
      label.classList.remove('text-gray-500');
      label.style.opacity = '1';
      label.style.visibility = 'visible';
      label.style.color = 'var(--color-primary)';
      label.style.background = 'var(--color-bg)';
    } else {
      label.classList.remove('text-blue-600');
      label.classList.add('text-gray-500');
    }
  }

  /**
   * Obtém o texto do medicamento a partir do valor do select
   * @param {string} value - Valor do select
   * @returns {string} Texto do medicamento
   */
  getMedicamentoText(value) {
    return this.medicamentosMap.get(value) || value;
  }
}

// Criar instâncias globais
window.multiLimitacoesManager = new MultiLimitacoesManager();
window.multiMedicamentosManager = new MultiMedicamentosManager();

/**
 * Configura event listeners para os dropdowns de limitações e medicamentos
 */
function setupMultiSelectEventListeners() {
  console.log('[incapacity.js] Configurando event listeners para limitações e medicamentos...');

  // Event listener para limitações
  const limitacoesSelect = document.getElementById('limitacoesSelect');
  if (limitacoesSelect) {
    limitacoesSelect.addEventListener('change', function() {
      const value = this.value;
      if (value && value !== '') {
        if (value === 'outro') {
          // Abrir modal para "Outra limitação"
          if (typeof showOutraLimitacaoModal === 'function') {
            showOutraLimitacaoModal();
          }
        } else {
          const success = window.multiLimitacoesManager.addLimitacao(value);
          if (success) {
            // Resetar dropdown após adicionar
            this.value = '';
            console.log('[incapacity.js] Limitação adicionada via dropdown:', value);
          }
        }
      }
    });
    console.log('[incapacity.js] Event listener configurado para limitações');
  }

  // Event listener para medicamentos
  const medicamentosSelect = document.getElementById('medicamentosAtuais');
  if (medicamentosSelect) {
    medicamentosSelect.addEventListener('change', function() {
      const value = this.value;
      if (value && value !== '') {
        if (value === 'outro') {
          // Abrir modal para "Outro medicamento"
          if (typeof showOutroMedicamentoModal === 'function') {
            showOutroMedicamentoModal();
          }
        } else {
          // Obter texto legível do medicamento
          const medicamentoText = window.multiMedicamentosManager.getMedicamentoText(value);
          const success = window.multiMedicamentosManager.addMedicamento(medicamentoText);
          if (success) {
            // Resetar dropdown após adicionar
            this.value = '';
            console.log('[incapacity.js] Medicamento adicionado via dropdown:', medicamentoText);
          }
        }
      }
    });
    console.log('[incapacity.js] Event listener configurado para medicamentos');
  }
}

/**
 * Mostra modal para adicionar uma limitação personalizada
 */
function showOutraLimitacaoModal() {
  if (typeof window.showGenericModal !== 'function') {
    console.error('Modal genérico não disponível');
    return;
  }

  window.showGenericModal({
    title: 'Informar Outra Limitação',
    message: 'Digite a limitação que você possui:',
    content: '<input type="text" id="outraLimitacaoInput" class="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Ex: Dificuldade para ler, Problemas de memória">',
    buttons: [
      {
        text: 'Cancelar',
        className: 'flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 text-center',
        onclick: function() {
          handleCancelOutraLimitacao();
        }
      },
      {
        text: 'Salvar',
        className: 'flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-center',
        onclick: function() {
          handleSaveOutraLimitacao();
        }
      }
    ]
  });

  // Configurar eventos adicionais
  setTimeout(() => {
    const input = document.getElementById('outraLimitacaoInput');
    if (input) {
      // Salvar ao pressionar Enter
      input.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
          handleSaveOutraLimitacao();
        }
      });

      // Focar no campo
      input.focus();
    }
  }, 100);
}

/**
 * Mostra modal para adicionar um medicamento personalizado
 */
function showOutroMedicamentoModal() {
  if (typeof window.showGenericModal !== 'function') {
    console.error('Modal genérico não disponível');
    return;
  }

  window.showGenericModal({
    title: 'Informar Outro Medicamento',
    message: 'Digite o medicamento que você usa:',
    content: '<input type="text" id="outroMedicamentoInput" class="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Ex: Dipirona, Paracetamol, Ibuprofeno">',
    buttons: [
      {
        text: 'Cancelar',
        className: 'flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 text-center',
        onclick: function() {
          handleCancelOutroMedicamento();
        }
      },
      {
        text: 'Salvar',
        className: 'flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-center',
        onclick: function() {
          handleSaveOutroMedicamento();
        }
      }
    ]
  });

  // Configurar eventos adicionais
  setTimeout(() => {
    const input = document.getElementById('outroMedicamentoInput');
    if (input) {
      // Salvar ao pressionar Enter
      input.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
          handleSaveOutroMedicamento();
        }
      });

      // Focar no campo
      input.focus();
    }
  }, 100);
}

/**
 * Manipula o salvamento de uma limitação personalizada
 */
function handleSaveOutraLimitacao() {
  const input = document.getElementById('outraLimitacaoInput');
  if (!input) return;

  const novaLimitacao = input.value.trim();
  if (!novaLimitacao) {
    alert('Por favor, informe a limitação.');
    input.focus();
    return;
  }

  // Adicionar limitação ao sistema
  const success = window.multiLimitacoesManager.addLimitacao(novaLimitacao);
  if (success) {
    console.log('[incapacity.js] Limitação personalizada adicionada:', novaLimitacao);

    // Salvar automaticamente os dados do formulário
    if (window.formStateManager) {
      window.formStateManager.captureCurrentFormData();
    }
  }

  window.closeGenericModal();
}

/**
 * Manipula o cancelamento de limitação personalizada
 */
function handleCancelOutraLimitacao() {
  window.closeGenericModal();
}

/**
 * Manipula o salvamento de um medicamento personalizado
 */
function handleSaveOutroMedicamento() {
  const input = document.getElementById('outroMedicamentoInput');
  if (!input) return;

  const novoMedicamento = input.value.trim();
  if (!novoMedicamento) {
    alert('Por favor, informe o medicamento.');
    input.focus();
    return;
  }

  // Adicionar medicamento ao sistema
  const success = window.multiMedicamentosManager.addMedicamento(novoMedicamento);
  if (success) {
    console.log('[incapacity.js] Medicamento personalizado adicionado:', novoMedicamento);

    // Salvar automaticamente os dados do formulário
    if (window.formStateManager) {
      window.formStateManager.captureCurrentFormData();
    }
  }

  window.closeGenericModal();
}

/**
 * Manipula o cancelamento de medicamento personalizado
 */
function handleCancelOutroMedicamento() {
  window.closeGenericModal();
}

/**
 * Mostra modal com informações sobre isenção de carência
 */
function showIsencaoCarenciaModal() {
  if (typeof window.showGenericModal !== 'function') {
    console.error('Modal genérico não disponível');
    return;
  }

  const conteudoModal = `
    <div class="space-y-3">
      <!-- Informação Principal -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p class="text-blue-700 text-sm">
          Para receber o benefício, é necessário ter <strong>12 contribuições mensais</strong> ao INSS.
          Porém, algumas situações dispensam esse período de carência.
        </p>
      </div>

      <!-- Exceções -->
      <div class="space-y-2">
        <h4 class="font-semibold text-gray-800 text-sm">Situações que dispensam carência:</h4>

        <div class="bg-orange-50 border border-orange-200 rounded-lg p-2">
          <p class="font-medium text-orange-800 text-sm mb-1">Acidentes</p>
          <p class="text-orange-700 text-xs">
            Acidentes de trabalho, trajeto, domésticos ou doenças ocupacionais sempre dispensam o período de carência.
          </p>
        </div>

        <div class="bg-green-50 border border-green-200 rounded-lg p-2">
          <p class="font-medium text-green-800 text-sm mb-1">Doenças Graves</p>
          <p class="text-green-700 text-xs">
            Existe uma lista específica de doenças graves que também dispensam carência.
          </p>
        </div>
      </div>      <!-- Links para mais informações -->
      <div class="space-y-1">
        <a href="https://www.planalto.gov.br/ccivil_03/leis/l8213cons.htm"
           target="_blank"
           class="block text-blue-600 hover:text-blue-800 text-sm underline">
          Lei 8.213/91 - Base legal completa
        </a>
        <a href="https://www.planalto.gov.br/ccivil_03/decreto/d3048compilado.htm"
           target="_blank"
           class="block text-blue-600 hover:text-blue-800 text-sm underline">
          Decreto nº 3.048/99 (atualizado pelo Decreto nº 10.410/2020)
        </a>        <a href="https://www.gov.br/inss/pt-br/direitos-e-deveres/beneficios-por-incapacidade/auxilio-por-incapacidade-temporaria"
           target="_blank"
           class="block text-blue-600 hover:text-blue-800 text-sm underline">
          Portaria Interministerial MTP/MS nº 22/2022 - Doenças que dispensam carência
        </a>
      </div>
    </div>
  `;

  window.showGenericModal({
    title: 'Informações sobre Isenção de Carência',
    content: conteudoModal,
    buttons: []
  });
}

// Expor funções para uso global
if (typeof window !== 'undefined') {
  window.showOutroMedicamentoModal = showOutroMedicamentoModal;
  window.showOutraLimitacaoModal = showOutraLimitacaoModal;
  window.handleSaveOutroMedicamento = handleSaveOutroMedicamento;
  window.handleCancelOutroMedicamento = handleCancelOutroMedicamento;
  window.handleSaveOutraLimitacao = handleSaveOutraLimitacao;
  window.handleCancelOutraLimitacao = handleCancelOutraLimitacao;
  window.showIsencaoCarenciaModal = showIsencaoCarenciaModal;
}
