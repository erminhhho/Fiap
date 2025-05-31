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
    const temIsencao = cidList.some(cid => cid.isencao);

    if (temIsencao) {
      tagIsencao.classList.remove('hidden');
      tagIsencao.setAttribute('title', 'Este documento possui CID(s) com isenção de carência');
      tagIsencao.style.cursor = 'pointer';

      // Remover listener anterior
      tagIsencao.removeEventListener('click', this.showIsencaoInfo);

      // Adicionar novo listener
      tagIsencao.addEventListener('click', this.showIsencaoInfo);
    } else {
      tagIsencao.classList.add('hidden');
      tagIsencao.removeAttribute('title');
    }
  }

  /**
   * Mostra informações sobre isenção de carência
   */
  showIsencaoInfo() {
    if (typeof showIsencaoCarenciaModal === 'function') {
      showIsencaoCarenciaModal();
    }
  }

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
      console.log('[incapacity.js] ✅ Elementos encontrados, configurando autocomplete...');
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
    console.log('[incapacity.js] ✅ Módulo de incapacidades já inicializado, ignorando duplicata.');
    return;
  }

  // Marcar como inicializado
  window._incapacityInitialized = true;

  // Inicializar o autocomplete de profissão
  console.log('[incapacity.js] 🔧 Inicializando componentes do módulo...');
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
    window.formStateManager.ensureFormAndRestore(currentStepKey);

    // Aplicar validações após a restauração
    setTimeout(function() {
      console.log('[incapacity.js] Aplicando validações pós-restauração...');

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
      });      // O novo sistema CID detecta e configura campos automaticamente
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
      const doencaNormalizada = doenca.toLowerCase().trim();

      // Verificação rigorosa: a doença digitada deve conter o termo completo
      // ou ser uma correspondência muito próxima
      const match = verificarCorrespondenciaDoenca(doencaValor, doencaNormalizada);

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
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^\w\s]/g, '') // Remove pontuação
      .replace(/\s+/g, ' ') // Normaliza espaços
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

// Função para configurar eventos do módulo
function setupEvents() {
  // Destacar campos preenchidos
  if (typeof destacarCamposPreenchidos === 'function') {
    destacarCamposPreenchidos();
  }

  // Botão para adicionar doença/CID
  const addDoencaBtn = document.getElementById('addDoenca');
  if (addDoencaBtn) {
    // Remover qualquer evento existente para evitar duplicação
    const newBtn = addDoencaBtn.cloneNode(true);
    addDoencaBtn.parentNode.replaceChild(newBtn, addDoencaBtn);

    // Aplicar estilo centralizado ao botão de adicionar
    if (window.tw && typeof window.tw.applyTo === 'function') {
      window.tw.applyTo(newBtn, 'button.add');
    }

    // Adicionar o evento ao novo botão - versão simplificada
    newBtn.addEventListener('click', function(e) {
      addDoencaField();
    });
  }

  // Configurar campos "outro" nos selects
  document.querySelectorAll('select[data-other-target]').forEach(select => {
    select.addEventListener('change', function() {
      const targetId = this.getAttribute('data-other-target');
      const targetField = document.getElementById(targetId);

      if (targetField) {
        if (this.value === 'outro') {
          targetField.classList.remove('hidden');
        } else {
          targetField.classList.add('hidden');
        }
      }
    });
  });

  // Configurar botões de navegação usando o sistema padronizado
  if (typeof window.Navigation !== 'undefined') {
    console.log('[incapacity.js] Configurando navegação com sistema padronizado...');
    window.Navigation.setupNavigationButtons();
  } else {
    console.warn('[incapacity.js] Sistema de navegação padronizado não encontrado, usando método legado...');

    // Fallback para método legado - botão voltar
    const backButton = document.getElementById('btn-back');
    if (backButton) {
      // Aplicar estilo centralizado ao botão voltar
      if (window.tw && typeof window.tw.applyTo === 'function') {
        window.tw.applyTo(backButton, 'button.secondary');
      }

      backButton.addEventListener('click', function() {
        navigateTo('social');
      });
    }

    // Fallback para método legado - botão próximo
    const nextButton = document.getElementById('btn-next');
    if (nextButton) {
      // Aplicar estilo centralizado ao botão próximo
      if (window.tw && typeof window.tw.applyTo === 'function') {
        window.tw.applyTo(nextButton, 'button.primary');
      }

      // Remover eventos existentes
      const newBtn = nextButton.cloneNode(true);
      nextButton.parentNode.replaceChild(newBtn, nextButton);

      // Flag para prevenir múltiplos cliques
      let isNavigating = false;

      // Adicionar novo evento com proteção
      newBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        if (isNavigating) return;
        isNavigating = true;

        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Carregando...';
        this.classList.add('opacity-75');

        try {
          if (window.formStateManager) {
            window.formStateManager.captureCurrentFormData();
          }

          setTimeout(() => {
            navigateTo('professional');
            setTimeout(() => {
              if (document.body.contains(this)) {
                this.innerHTML = originalText;
                this.classList.remove('opacity-75');
              }
              isNavigating = false;
            }, 500);
          }, 100);
        } catch (error) {
          console.error('Erro ao navegar para a próxima página:', error);
          this.innerHTML = originalText;
          this.classList.remove('opacity-75');
          isNavigating = false;
        }
      });
    }
  }
}

// Função para adicionar um novo campo de doença
function addDoencaField() {
  // Obter o container de doenças
  const doencasList = document.getElementById('doencasList');
  if (!doencasList) {
    console.error('Container de doenças não encontrado');
    return;
  }

  // Obter o próximo índice para os campos
  const existingFields = doencasList.querySelectorAll('.cid-input');
  const nextIndex = existingFields.length + 1;

  // Criar o elemento HTML para o novo campo
  const newDoencaField = document.createElement('div');
  newDoencaField.className = 'mb-4';
  newDoencaField.innerHTML = `
    <!-- Layout otimizado: todos os campos na mesma linha -->
    <div class="grid grid-cols-1 md:grid-cols-24 gap-4">
      <!-- Documento (agora é o primeiro) -->
      <div class="relative md:col-span-4">
        <select class="tipo-documento peer w-full rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 px-4 py-3 text-gray-800 bg-white transition-colors duration-200" id="tipoDocumento${nextIndex}" name="tipoDocumentos[]" data-index="${nextIndex}">
          <option value="" selected disabled>Selecione</option>
          <option value="exame">Exame</option>
          <option value="atestado">Atestado</option>
          <option value="laudo">Laudo</option>
          <option value="pericia">Perícia</option>
          <option value="receita">Receita</option>
          <option value="outro">Outro</option>
        </select>
        <label for="tipoDocumento${nextIndex}" class="input-label">
          Documento
        </label>
      </div>

      <!-- CID (segundo campo - reduzido) -->
      <div class="relative md:col-span-5">
        <div class="relative">
          <input type="text" class="cid-input peer w-full rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 px-4 py-3 text-gray-800 bg-white placeholder-gray-400 transition-colors duration-200" id="cid${nextIndex}" placeholder="CID" name="cids[]" data-index="${nextIndex}" autocomplete="off">
          <label for="cid${nextIndex}" class="absolute left-4 -top-3 px-1 text-sm text-blue-600 bg-gray-50 rounded-t-lg rounded-b-none input-label">CID</label>
          <div class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <i class="fas fa-search"></i>
          </div>
          <div class="cid-dropdown hidden absolute z-50 bg-white w-full border border-gray-300 rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto" id="cidDropdown${nextIndex}"></div>
        </div>      </div>      <!-- Doença (terceiro campo - aumentado, agora suporta múltiplos CIDs) -->
      <div class="relative md:col-span-10">
        <div class="doenca-input peer w-full rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 px-4 py-3 text-gray-800 bg-gray-50 placeholder-gray-400 transition-colors duration-200 min-h-[48px]" id="doenca${nextIndex}" data-index="${nextIndex}" style="display: flex; align-items: center; flex-wrap: wrap; gap: 4px;">
          <span class="text-gray-400" style="display: block; width: 100%;">Adicione CIDs usando o campo ao lado</span>
        </div>
        <label for="doenca${nextIndex}" class="input-label">
          CIDs do Documento
        </label>
        <div class="isento-carencia-tag hidden">Isenção de carência</div>
      </div>      <!-- Data (quarto campo) -->
      <div class="relative md:col-span-4">
        <input type="text" class="peer w-full rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 px-4 py-3 text-gray-800 bg-white placeholder-gray-400 transition-colors duration-200" id="dataDocumento${nextIndex}" name="dataDocumentos[]" data-index="${nextIndex}" placeholder="dd/mm/aaaa" oninput="maskDate(this)">
        <label for="dataDocumento${nextIndex}" class="input-label">
          Data
        </label>
      </div>

      <!-- Botão de remover (último campo) -->
      <div class="md:col-span-1 flex items-center justify-center content-center text-center align-middle p-0">
        <button type="button" class="remove-doenca-btn bg-red-500 hover:bg-red-600 text-white rounded-full p-1 flex items-center justify-center w-8 h-8 mx-auto" title="Remover CID/Doença">
          <i class="fas fa-minus"></i>
        </button>
      </div>
    </div>
  `;

  // Adicionar ao DOM
  doencasList.appendChild(newDoencaField);
  // Configurar botão de remover
  const removeButton = newDoencaField.querySelector('.remove-doenca-btn');
  if (removeButton) {
    removeButton.addEventListener('click', function() {
      // Limpar dados do MultiCIDManager ao remover o campo
      if (window.multiCIDManager) {
        window.multiCIDManager.clearDocumentCids(nextIndex.toString());
      }
      newDoencaField.remove();
    });
  }

  // Inicializar o MultiCIDManager para este novo campo
  if (window.multiCIDManager) {
    window.multiCIDManager.renderCidLinks(nextIndex.toString());
  }

  // O novo sistema CID detecta campos dinamicamente via MutationObserver
  // Não é necessário reinicialização manual
  console.log(`Nova linha de doença adicionada com índice ${nextIndex} - CID configurado automaticamente`);

  // Aplicar máscaras e eventos aos novos campos
  const dataInput = newDoencaField.querySelector(`#dataDocumento${nextIndex}`);
  if (dataInput && typeof maskDate === 'function') {
    dataInput.oninput = function() { maskDate(this); };
  }

  // Destacar campos se a função estiver disponível
  if (typeof destacarCamposPreenchidos === 'function') {
    destacarCamposPreenchidos();
  }
}

// Expor a função para ser chamada externamente (ex: pelo FormStateManager)
window.addDoencaField = addDoencaField;

document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    // Validar isenção de carência
    document.querySelectorAll('.doenca-input').forEach(input => {
      if (typeof verificarIsencaoCarencia === 'function') verificarIsencaoCarencia(input);
    });
    // Validar CID
    document.querySelectorAll('.cid-input').forEach(input => {
      const index = input.getAttribute('data-index');
      const doencaInput = document.getElementById('doenca' + index);
      if (doencaInput && typeof verificarIsencaoCarencia === 'function') verificarIsencaoCarencia(doencaInput);
    });
  }, 300);
});

// Função para configurar os event listeners nos selects de tipo de documento
function setupDocumentoTipoSelects() {
  document.addEventListener('change', function(event) {
    if (event.target.classList.contains('tipo-documento')) {
      if (event.target.value === 'outro') {
        window.currentDocumentoSelectGlobal = event.target;
        showOutroDocumentoModal();
      }
    }
  });
}

// Função para mostrar o modal de "Outro Tipo de Documento" usando o modal genérico
function showOutroDocumentoModal() {
  if (typeof window.showGenericModal !== 'function') {
    console.error('Modal genérico não disponível');
    return;
  }

  window.showGenericModal({
    title: 'Informar Tipo de Documento',
    message: 'Digite o tipo de documento desejado:',
    content: '<input type="text" id="outroDocumentoInputGeneric" class="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Ex: Relatório, Comprovante">',
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
    const input = document.getElementById('outroDocumentoInputGeneric');
    if (input) {
      // Aplicar formatação de nome próprio com delay no modal
      input.addEventListener('input', function() {
        formatarNomeProprioModal(this);
      });

      // Salvar ao pressionar Enter
      input.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
          handleSaveOutroDocumento();
        }
      });
    }
  }, 100);
}

// Função para formatação de nome próprio no modal com delay
function formatarNomeProprioModal(input) {
  if (!input) return;

  // Clear any existing timeout
  clearTimeout(input.formatTimeout);

  // Set new timeout
  input.formatTimeout = setTimeout(() => {
    if (typeof window.formatarNomeProprio === 'function') {
      window.formatarNomeProprio(input);
    }
  }, 300);
}

// Função para lidar com o cancelamento
function handleCancelOutroDocumento() {
  // Se o usuário cancelou e o valor do select ainda é "outro", reseta para "Selecione..."
  if (window.currentDocumentoSelectGlobal && window.currentDocumentoSelectGlobal.value === 'outro') {
    const options = Array.from(window.currentDocumentoSelectGlobal.options);
    const customOptionExists = options.some(opt => opt.value !== "" && opt.value !== "outro" && !isDefaultDocumentoOption(opt.value));

    if (!customOptionExists) {
      window.currentDocumentoSelectGlobal.value = ""; // Reseta para "Selecione..."
    }
  }
  window.currentDocumentoSelectGlobal = null;
  window.closeGenericModal();
}

// Função para lidar com o salvamento
function handleSaveOutroDocumento() {
  const input = document.getElementById('outroDocumentoInputGeneric');
  const novoDocumento = input ? input.value.trim() : '';

  if (novoDocumento && window.currentDocumentoSelectGlobal) {
    // Verificar se a opção já existe (para não duplicar)
    let optionExists = false;
    for (let i = 0; i < window.currentDocumentoSelectGlobal.options.length; i++) {
      if (window.currentDocumentoSelectGlobal.options[i].value === novoDocumento) {
        optionExists = true;
        break;
      }
    }

    // Adicionar nova opção se não existir
    if (!optionExists) {
      const newOption = new Option(novoDocumento, novoDocumento, true, true);
      // Insere a nova opção antes da opção "Outro..."
      const outroOption = Array.from(window.currentDocumentoSelectGlobal.options).find(opt => opt.value === 'outro');
      if (outroOption) {
        window.currentDocumentoSelectGlobal.insertBefore(newOption, outroOption);
      } else {
        window.currentDocumentoSelectGlobal.appendChild(newOption);
      }
    }

    window.currentDocumentoSelectGlobal.value = novoDocumento;

    // Salvar automaticamente os dados do formulário
    if (window.formStateManager) {
      window.formStateManager.captureCurrentFormData();
    }
  }

  window.currentDocumentoSelectGlobal = null;
  window.closeGenericModal();
}

// Função auxiliar para verificar se uma opção de documento é uma das padrões
function isDefaultDocumentoOption(value) {
    const defaultOptions = ["exame", "atestado", "laudo", "pericia", "receita", "outro"];
    return defaultOptions.includes(value);
}

// Função para mostrar modal com informações legais sobre isenção de carência
function showIsencaoCarenciaModal() {
  if (typeof window.showGenericModal !== 'function') {
    console.error('Modal genérico não disponível');
    return;
  }
    const conteudoModal = `
    <div class="space-y-4">
      <!-- Status compacto -->
      <div class="bg-green-50 border border-green-200 rounded-lg p-3">
        <div class="flex items-center">
          <i class="fas fa-shield-check text-green-600 mr-2"></i>
          <p class="font-medium text-green-800">Isenção de carência confirmada</p>
        </div>
      </div>

      <!-- Benefício prático -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p class="text-sm text-blue-800">
          <i class="fas fa-clock text-blue-600 mr-2"></i>
          <strong>Sem período de carência</strong> - Pode requerer o benefício imediatamente após comprovar a incapacidade.
        </p>
      </div>

      <!-- Documentação necessária -->
      <div class="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <p class="text-sm text-amber-800 mb-2">
          <i class="fas fa-folder-medical text-amber-600 mr-2"></i>
          <strong>Documentação essencial:</strong>
        </p>
        <ul class="text-xs text-amber-700 space-y-1 ml-4">
          <li>• Relatórios médicos detalhados</li>
          <li>• Comprovação do diagnóstico</li>
          <li>• Demonstração da incapacidade laboral</li>
        </ul>
      </div>

      <!-- Base legal simplificada com link -->
      <div class="text-center">
        <p class="text-xs text-gray-600 mb-2">
          Fundamentação: 
          <a href="https://in.gov.br/en/web/dou/-/portaria-interministerial-mtp/ms-n-22-de-31-de-agosto-de-2022-426206445" 
             target="_blank" 
             class="text-blue-600 hover:text-blue-800 underline">
            Portaria MTP/MS 22/2022 e Lei 8.213/91
          </a>
        </p>
      </div>
    </div>
  `;
  window.showGenericModal({
    title: 'Isenção de Carência',
    content: conteudoModal,
    buttons: []
  });
}

// Lista de limitações populares organizadas por categoria para autocomplete
if (typeof window.limitacoesComuns === 'undefined') {
  window.limitacoesComuns = [
    // Limitações de mobilidade (12 itens)
    'Dificuldade para caminhar',
    'Não consegue caminhar',
    'Usa cadeira de rodas',
    'Usa muletas',
    'Dificuldade para subir escadas',
    'Não consegue subir escadas',
    'Dificuldade para se levantar',
    'Não consegue se levantar',
    'Dificuldade para se abaixar',
    'Não consegue se abaixar',
    'Limitação para ficar em pé',
    'Limitação para sentar',

    // Limitações de movimentos das mãos/braços (8 itens)
    'Dificuldade para pegar objetos',
    'Não consegue pegar objetos',
    'Dificuldade para escrever',
    'Não consegue escrever',
    'Limitação nos movimentos dos braços',
    'Limitação nos movimentos das mãos',
    'Dificuldade para fazer força',
    'Tremores nas mãos',

    // Limitações cognitivas/mentais (9 itens)
    'Dificuldade de concentração',
    'Problemas de memória',
    'Dificuldade para aprender',
    'Confusão mental',
    'Desorientação',
    'Dificuldade para tomar decisões',
    'Ansiedade limitante',
    'Depressão incapacitante',
    'Transtorno mental',

    // Limitações visuais (7 itens)
    'Cegueira total',
    'Cegueira parcial',
    'Baixa visão',
    'Dificuldade para enxergar',
    'Visão embaçada',
    'Sensibilidade à luz',
    'Campo visual reduzido',

    // Limitações auditivas (4 itens)
    'Surdez total',
    'Surdez parcial',
    'Dificuldade para ouvir',
    'Zumbido no ouvido',

    // Limitações respiratórias (5 itens)
    'Falta de ar',
    'Dificuldade para respirar',
    'Cansaço fácil',
    'Limitação para exercícios',
    'Uso de oxigênio',

    // Limitações de autocuidado (5 itens)
    'Dificuldade para se vestir',
    'Dificuldade para tomar banho',
    'Dificuldade para comer',
    'Dificuldade para usar banheiro',
    'Necessita de cuidador',

    // Limitações de dor (6 itens)
    'Dor crônica',
    'Dor constante',
    'Dor limitante',
    'Dor nas costas',
    'Dor nas articulações',
    'Dor de cabeça frequente',

    // Outras limitações (9 itens)
    'Limitação para trabalhar',
    'Limitação para dirigir',
    'Limitação para atividades domésticas',
    'Limitação para estudar',
    'Isolamento social',
    'Dependência de medicamentos',
    'Limitação para viajar',
    'Limitação para atividades de lazer',
    'Outras limitações funcionais'
  ];
}

// Função para configurar o sistema de limitações
function setupLimitacoesDiarias() {
  console.log('[incapacity.js] setupLimitacoesDiarias: Iniciando configuração...');

  const select = document.getElementById('limitacoesSelect');
  const containerSelecionadas = document.getElementById('limitacoesSelecionadas');
  const hiddenField = document.getElementById('limitacoesDiarias');

  console.log('[incapacity.js] Elementos encontrados:', {
    select: !!select,
    container: !!containerSelecionadas,
    hidden: !!hiddenField
  });

  if (!select || !containerSelecionadas || !hiddenField) {
    console.log('[incapacity.js] Elementos de limitações não encontrados no template atual');
    return;
  }

  console.log('[incapacity.js] Configurando sistema de limitações...');

  let limitacoesSelecionadas = [];

  // Função para popular o dropdown com limitações comuns
  function popularDropdown() {
    // Limpar opções existentes exceto a primeira
    select.innerHTML = '<option value="" selected disabled>Selecione limitações...</option>';

    // Adicionar limitações comuns agrupadas por categoria
    const categorias = {
      'Mobilidade': [
        'Dificuldade para caminhar',
        'Não consegue caminhar',
        'Usa cadeira de rodas',
        'Usa muletas',
        'Dificuldade para subir escadas',
        'Não consegue subir escadas',
        'Dificuldade para se levantar',
        'Não consegue se levantar',
        'Dificuldade para se abaixar',
        'Não consegue se abaixar',
        'Limitação para ficar em pé',
        'Limitação para sentar'
      ],
      'Movimentos das mãos/braços': [
        'Dificuldade para pegar objetos',
        'Não consegue pegar objetos',
        'Dificuldade para escrever',
        'Não consegue escrever',
        'Limitação nos movimentos dos braços',
        'Limitação nos movimentos das mãos',
        'Dificuldade para fazer força',
        'Tremores nas mãos'
      ],
      'Cognitivas/mentais': [
        'Dificuldade de concentração',
        'Problemas de memória',
        'Dificuldade para aprender',
        'Confusão mental',
        'Desorientação',
        'Dificuldade para tomar decisões',
        'Ansiedade limitante',
        'Depressão incapacitante',
        'Transtorno mental'
      ],
      'Visuais': [
        'Cegueira total',
        'Cegueira parcial',
        'Baixa visão',
        'Dificuldade para enxergar',
        'Visão embaçada',
        'Sensibilidade à luz',
        'Campo visual reduzido'
      ],
      'Auditivas': [
        'Surdez total',
        'Surdez parcial',
        'Dificuldade para ouvir',
        'Zumbido no ouvido'
      ],
      'Respiratórias': [
        'Falta de ar',
        'Dificuldade para respirar',
        'Cansaço fácil',
        'Limitação para exercícios',
        'Uso de oxigênio'
      ],
      'Autocuidado': [
        'Dificuldade para se vestir',
        'Dificuldade para tomar banho',
        'Dificuldade para comer',
        'Dificuldade para usar banheiro',
        'Necessita de cuidador'
      ],
      'Dor': [
        'Dor crônica',
        'Dor constante',
        'Dor limitante',
        'Dor nas costas',
        'Dor nas articulações',
        'Dor de cabeça frequente'
      ],
      'Outras': [
        'Limitação para trabalhar',
        'Limitação para dirigir',
        'Limitação para atividades domésticas',
        'Limitação para estudar',
        'Isolamento social',
        'Dependência de medicamentos',
        'Limitação para viajar',
        'Limitação para atividades de lazer',
        'Outras limitações funcionais'
      ]
    };

    // Adicionar opções agrupadas por categoria
    Object.keys(categorias).forEach(categoria => {
      const optgroup = document.createElement('optgroup');
      optgroup.label = categoria;

      categorias[categoria].forEach(limitacao => {
        const option = document.createElement('option');
        option.value = limitacao;
        option.textContent = limitacao;
        optgroup.appendChild(option);
      });

      select.appendChild(optgroup);
    });

    // Adicionar opção "Outra"
    const option = document.createElement('option');
    option.value = 'outra';
    option.textContent = 'Outra limitação...';
    select.appendChild(option);
  }

  // Função para adicionar limitação selecionada
  function adicionarLimitacao(limitacao) {
    if (limitacoesSelecionadas.includes(limitacao)) return;

    limitacoesSelecionadas.push(limitacao);
    atualizarTagsVisuais();
    atualizarCampoHidden();

    console.log('[incapacity.js] Limitação adicionada:', limitacao);
    console.log('[incapacity.js] Total selecionadas:', limitacoesSelecionadas.length);
  }

  // Função para remover limitação
  function removerLimitacao(limitacao) {
    const index = limitacoesSelecionadas.indexOf(limitacao);
    if (index > -1) {
      limitacoesSelecionadas.splice(index, 1);
      atualizarTagsVisuais();
      atualizarCampoHidden();

      console.log('[incapacity.js] Limitação removida:', limitacao);
      console.log('[incapacity.js] Total selecionadas:', limitacoesSelecionadas.length);
    }
  }

  // Função para atualizar as tags visuais
  function atualizarTagsVisuais() {
    containerSelecionadas.innerHTML = '';

    if (limitacoesSelecionadas.length === 0) {
      containerSelecionadas.innerHTML = '<p class="text-gray-500 text-sm italic">Nenhuma limitação selecionada</p>';
      return;
    }

    limitacoesSelecionadas.forEach(limitacao => {
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
      removeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        removerLimitacao(limitacao);
      });

      containerSelecionadas.appendChild(tag);
    });
  }

  // Função para atualizar o campo hidden
  function atualizarCampoHidden() {
    hiddenField.value = limitacoesSelecionadas.join('|');

    // Disparar evento change para o formStateManager
    hiddenField.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // Função para carregar limitações salvas
  function carregarLimitacoesSalvas() {
    const valorSalvo = hiddenField.value;
    if (valorSalvo && valorSalvo.trim() !== '') {
      limitacoesSelecionadas = valorSalvo.split('|').filter(l => l.trim() !== '');
      atualizarTagsVisuais();
      console.log('[incapacity.js] Limitações carregadas:', limitacoesSelecionadas);
    }
  }

  // Configurar evento do select
  select.addEventListener('change', function() {
    const valor = this.value;

    if (valor === 'outra') {
      // Mostrar modal para "outra limitação"
      showOutraLimitacaoModal();
    } else if (valor && valor !== '') {
      // Adicionar limitação selecionada
      adicionarLimitacao(valor);
    }

    // Reset do select
    this.value = '';
  });

  // Inicializar
  popularDropdown();
  carregarLimitacoesSalvas();

  // Expor funções para uso externo
  window.adicionarLimitacao = adicionarLimitacao;
  window.removerLimitacao = removerLimitacao;
  window.carregarLimitacoesSalvas = carregarLimitacoesSalvas;

  console.log('[incapacity.js] Sistema de limitações configurado com sucesso!');
}

// Função para mostrar o modal "Outra Limitação"
function showOutraLimitacaoModal() {
  if (typeof window.showGenericModal !== 'function') {
    console.error('Modal genérico não disponível');
    return;
  }

  const conteudoModal = `
    <div class="space-y-4">
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">
          Descreva a limitação específica
        </label>
        <input type="text" id="outraLimitacaoInput"
               class="peer w-full rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 px-4 py-3 text-gray-800 bg-white placeholder-gray-400 transition-colors duration-200"
               placeholder="Digite a limitação...">
      </div>

      <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p class="text-sm text-blue-800">
          <i class="fas fa-info-circle text-blue-600 mr-2"></i>
          Seja específico para melhor avaliação da limitação.
        </p>
      </div>
    </div>
  `;

  window.showGenericModal({
    title: 'Adicionar Limitação',
    message: '',
    content: conteudoModal,
    buttons: [
      {
        text: 'Cancelar',
        className: 'flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 text-center',
        onclick: function() {
          window.closeGenericModal();
        }
      },
      {
        text: 'Adicionar',
        className: 'flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-center',
        onclick: function() {
          handleSaveOutraLimitacao();
        }
      }
    ]
  });

  // Focar no input após o modal abrir
  setTimeout(() => {
    const input = document.getElementById('outraLimitacaoInput');
    if (input) {
      input.focus();

      // Configurar Enter para salvar
      input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleSaveOutraLimitacao();
        }
      });
    }
  }, 100);
}

// Função para lidar com o salvamento da limitação personalizada
function handleSaveOutraLimitacao() {
  const input = document.getElementById('outraLimitacaoInput');
  if (!input) return;

  const novaLimitacao = input.value.trim();

  // Validar input
  if (!novaLimitacao) {
    alert('Por favor, digite uma limitação.');
    input.focus();
    return;
  }

  if (novaLimitacao.length < 3) {
    alert('A limitação deve ter pelo menos 3 caracteres.');
    input.focus();
    return;
  }

  // Verificar se não é uma limitação já existente
  if (window.limitacoesComuns && window.limitacoesComuns.includes(novaLimitacao)) {
    alert('Esta limitação já está disponível na lista. Selecione-a diretamente no dropdown.');
    input.focus();
    return;
  }

  // Verificar se já foi adicionada
  if (window.adicionarLimitacao) {
    const limitacoesSelecionadas = document.getElementById('limitacoesDiarias').value.split('|').filter(l => l.trim() !== '');
    if (limitacoesSelecionadas.includes(novaLimitacao)) {
      alert('Esta limitação já foi adicionada.');
      window.closeGenericModal();
      return;
    }

    // Adicionar a nova limitação
    window.adicionarLimitacao(novaLimitacao);
    console.log('[incapacity.js] Nova limitação adicionada:', novaLimitacao);

    // Fechar modal
    window.closeGenericModal();
  } else {
        console.error('[incapacity.js] Função adicionarLimitacao não encontrada');
    alert('Erro interno. Por favor, recarregue a página.');
  }
}

// Função para configurar o modal "Outro Medicamento"
function setupOutroMedicamentoModal() {
  // Configurar listener para o select de medicamentos
  document.addEventListener('change', function(event) {
    if (event.target.id === 'medicamentos' && event.target.value === 'outro') {
      showOutroMedicamentoModal();
    }
  });
}

// Função para mostrar o modal "Outro Medicamento"
function showOutroMedicamentoModal() {
  const conteudoModal = `
    <div class="space-y-4">
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">
          Nome do Medicamento
        </label>
        <input type="text" id="novoMedicamentoInput"
               class="w-full rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 px-4 py-3 text-gray-800 bg-white placeholder-gray-400 transition-colors duration-200"
               placeholder="Digite o nome do medicamento">
      </div>

      <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p class="text-sm text-blue-800">
          <i class="fas fa-info-circle text-blue-600 mr-2"></i>
          Digite o nome completo do medicamento. Ele será adicionado à lista de opções.
        </p>
      </div>
    </div>
  `;

  window.showGenericModal({
    title: 'Adicionar Outro Medicamento',
    message: '',
    content: conteudoModal,
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

  // Focar no input após o modal abrir
  setTimeout(() => {
    const input = document.getElementById('novoMedicamentoInput');
    if (input) {
      input.focus();

      // Configurar formatação de nome próprio
      input.addEventListener('input', function() {
        formatarNomeProprioModal(this);
      });

      // Salvar com Enter
      input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleSaveOutroMedicamento();
        }
      });
    }
  }, 100);
}

// Função para lidar com o cancelamento do modal de medicamento
function handleCancelOutroMedicamento() {
  const medicamentosSelect = document.getElementById('medicamentos');
  if (medicamentosSelect) {
    medicamentosSelect.value = '';
  }
  window.closeGenericModal();
}

// Função para lidar com o salvamento do modal de medicamento
function handleSaveOutroMedicamento() {
  const input = document.getElementById('novoMedicamentoInput');
  const medicamentosSelect = document.getElementById('medicamentos');

  if (!input || !medicamentosSelect) {
    console.error('[incapacity.js] Elementos não encontrados no modal de medicamento');
    return;
  }

  const novoMedicamento = input.value.trim();

  if (!novoMedicamento) {
    input.focus();
    input.classList.add('border-red-300', 'focus:border-red-600');
    setTimeout(() => {
      input.classList.remove('border-red-300', 'focus:border-red-600');
    }, 3000);
    return;
  }

  // Verificar se não é uma opção padrão
  if (isDefaultMedicamentoOption(novoMedicamento.toLowerCase())) {
    input.focus();
    input.classList.add('border-yellow-300', 'focus:border-yellow-600');
    setTimeout(() => {
      input.classList.remove('border-yellow-300', 'focus:border-yellow-600');
    }, 3000);
    return;
  }

  // Adicionar nova opção ao select
  const novaOpcao = document.createElement('option');
  novaOpcao.value = novoMedicamento.toLowerCase().replace(/\s+/g, '_');
  novaOpcao.textContent = novoMedicamento;
  novaOpcao.selected = true;

  // Inserir antes da opção "Outro"
  const opcaoOutro = medicamentosSelect.querySelector('option[value="outro"]');
  if (opcaoOutro) {
    medicamentosSelect.insertBefore(novaOpcao, opcaoOutro);
  } else {
    medicamentosSelect.appendChild(novaOpcao);
  }

  // Disparar evento change
  medicamentosSelect.dispatchEvent(new Event('change', { bubbles: true }));

  console.log('[incapacity.js] Novo medicamento adicionado:', novoMedicamento);

  window.closeGenericModal();
}

// Função auxiliar para verificar se um medicamento é uma das opções padrão
function isDefaultMedicamentoOption(value) {
  const defaultOptions = [
    'analgesicos', 'anti-inflamatorios', 'antidepressivos', 'ansiolíticos',
    'anticonvulsivantes', 'relaxantes_musculares', 'corticoides',
    'medicamentos_cardiovasculares', 'hipnoticos', 'antipsicoticos', 'outros'
  ];
  return defaultOptions.includes(value.toLowerCase().replace(/\s+/g, '_'));
}

// Função para inicializar as novas funcionalidades de limitações e medicamentos
function initializeLimitacoesAndMedicamentos() {
  console.log('[incapacity.js] initializeLimitacoesAndMedicamentos: Iniciando...');

  // Configurar sistema de limitações diárias
  setupLimitacoesDiarias();

  // Configurar modal de "Outro Medicamento"
  setupOutroMedicamentoModal();

  console.log('[incapacity.js] Sistemas de limitações e medicamentos configurados');
}

// Inicializar as funcionalidades quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  console.log('[incapacity.js] DOM carregado, iniciando configuração...');

  // Aguardar um pouco para garantir que outros scripts foram carregados
  setTimeout(function() {
    console.log('[incapacity.js] Timeout executado, chamando initializeLimitacoesAndMedicamentos...');
    initializeLimitacoesAndMedicamentos();

    // Configurar labels fixos
    setupStickyLabels();
  }, 100);
});

// Função para manter títulos fixos nos campos com conteúdo
function setupStickyLabels() {
  console.log('[incapacity.js] setupStickyLabels: Configurando labels fixos...');  // Função para atualizar o estado do label
  function updateLabelState(field) {
    let label = field.nextElementSibling || field.previousElementSibling;

    if (!label || !label.classList.contains('input-label')) {
      // Tentar encontrar o label associado pelo 'for'
      const fieldId = field.id;
      if (fieldId) {
        const associatedLabel = document.querySelector(`label[for="${fieldId}"]`);
        if (associatedLabel) {
          label = associatedLabel;
        }
      }
    }

    // Tratamento específico para campos doença (que são divs simulando inputs)
    if (field.id && field.id.startsWith('doenca') && field.tagName.toLowerCase() === 'div') {
      const fieldContainer = field.closest('.relative');
      if (fieldContainer) {
        label = fieldContainer.querySelector('label, .input-label');
      }
      
      if (label) {        // Detecção aprimorada para CIDs: verificar múltiplos indicadores de conteúdo válido
        const hasValidContent = field.innerHTML && (
          // Verificar se há elementos CID específicos
          field.querySelector('.cid-code') !== null ||
          field.querySelector('[data-code]') !== null ||
          field.querySelector('.ver-todos-btn') !== null ||
          field.querySelector('.text-blue-600') !== null ||
          field.querySelector('span[style*="color"]') !== null ||
          // Verificar se há spans estruturados (CIDs renderizados)
          (field.innerHTML.includes('<span') && !field.innerHTML.includes('Adicione CIDs')) ||
          // Verificar se há divs com estrutura de CID
          field.innerHTML.includes('text-blue-600') ||
          field.innerHTML.includes('cid-code') ||
          field.innerHTML.includes('data-code') ||
          field.innerHTML.includes('underline') ||
          // Verificar se há texto substantivo (não placeholder)
          (field.textContent && 
           field.textContent.trim() !== '' && 
           !field.textContent.includes('Adicione CIDs usando o campo ao lado') &&
           !field.textContent.includes('Selecione') &&
           field.textContent.trim().length > 3 &&
           // Verificar se há códigos CID (padrão alfanumérico melhorado)
           (/[A-Z]\d+(\.\d+)?|[a-z]\d+(\.\d+)?|\d+[A-Z]|\d+[a-z]|[A-Z]\d+[A-Z]?|\d+\.?\d*/.test(field.textContent.trim()) ||
            // Ou se há texto substantivo sem placeholder
            (/[a-zA-Z0-9]/.test(field.textContent.trim()) && 
             !field.textContent.includes('campo ao lado') &&
             field.textContent.trim().length > 5)))
        );
        
        // Forçar visibilidade se o campo tem conteúdo válido ou está em foco
        if (hasValidContent || field === document.activeElement) {
          field.classList.add('field-filled');
          label.classList.add('text-blue-600');
          label.classList.remove('text-gray-500', 'text-transparent');
          label.style.opacity = '1';
          label.style.visibility = 'visible';
          label.style.color = 'var(--color-primary)';
          label.style.background = 'var(--color-bg)';
          label.style.display = 'block';
          
          // Log para debug quando o campo doença está sendo detectado como preenchido
          console.log(`[updateLabelState] Campo doença ${field.id} detectado como preenchido:`, {
            hasValidContent,
            innerHTML: field.innerHTML.substring(0, 100),
            textContent: field.textContent.substring(0, 50)
          });
        } else {
          field.classList.remove('field-filled');
          label.classList.remove('text-blue-600');
          label.classList.add('text-gray-500');
          label.style.opacity = '0';
          label.style.visibility = 'hidden';
        }
      }
      return;
    }

    // Tratamento para campos normais (input, select, textarea)
    if (label && label.classList.contains('input-label')) {
      const hasContent = field.value && field.value.trim() !== '';
      const isSelect = field.tagName.toLowerCase() === 'select';
      const isSelectWithValue = isSelect && field.value && field.value !== '';

      if (hasContent || isSelectWithValue || field === document.activeElement) {
        field.classList.add('field-filled');
        label.style.opacity = '1';
        label.style.visibility = 'visible';
        label.style.color = 'var(--color-primary)';
        label.style.background = 'var(--color-bg)';
        label.classList.remove('text-transparent');
      } else if (field !== document.activeElement) {
        field.classList.remove('field-filled');
        if (!hasContent && !isSelectWithValue) {
          label.style.opacity = '0';
          label.style.visibility = 'hidden';
        }
      }
    }
  }
  // Configurar observadores para todos os campos
  function setupFieldObservers() {
    const fields = document.querySelectorAll('input, select, textarea, div[id^="doenca"]');

    fields.forEach(field => {
      // Estado inicial
      updateLabelState(field);

      // Eventos de foco e desfoque
      field.addEventListener('focus', () => updateLabelState(field));
      field.addEventListener('blur', () => {
        setTimeout(() => updateLabelState(field), 50);
      });

      // Eventos de mudança de valor
      field.addEventListener('input', () => updateLabelState(field));
      field.addEventListener('change', () => updateLabelState(field));

      // Para campos select
      if (field.tagName.toLowerCase() === 'select') {
        field.addEventListener('change', () => {
          setTimeout(() => updateLabelState(field), 10);
        });
      }

      // Para campos doença (divs que simulam inputs), observar mudanças no DOM
      if (field.id && field.id.startsWith('doenca') && field.tagName.toLowerCase() === 'div') {
        const observer = new MutationObserver(() => {
          setTimeout(() => updateLabelState(field), 10);
        });
        observer.observe(field, {
          childList: true,
          subtree: true,
          characterData: true
        });
      }
    });
  }
  // Configurar observador para novos campos adicionados dinamicamente
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const newFields = node.querySelectorAll ? node.querySelectorAll('input, select, textarea, div[id^="doenca"]') : [];
            newFields.forEach(field => {
              updateLabelState(field);

              field.addEventListener('focus', () => updateLabelState(field));
              field.addEventListener('blur', () => {
                setTimeout(() => updateLabelState(field), 50);
              });
              field.addEventListener('input', () => updateLabelState(field));
              field.addEventListener('change', () => updateLabelState(field));

              // Para campos doença (divs), observar mudanças internas
              if (field.id && field.id.startsWith('doenca') && field.tagName.toLowerCase() === 'div') {
                const doencaObserver = new MutationObserver(() => {
                  setTimeout(() => updateLabelState(field), 10);
                });
                doencaObserver.observe(field, {
                  childList: true,
                  subtree: true,
                  characterData: true
                });
              }
            });
          }
        });
      }
    });
  });

  // Iniciar observação
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Configurar campos existentes
  setupFieldObservers();
  // Verificar periodicamente o estado dos campos (fallback)
  setInterval(() => {
    const fields = document.querySelectorAll('input, select, textarea, div[id^="doenca"]');
    fields.forEach(updateLabelState);
  }, 2000);

  console.log('[incapacity.js] Labels fixos configurados com sucesso');
}
