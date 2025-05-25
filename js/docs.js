/**
 * Arquivo centralizado para funções relacionadas a documentos
 */

// Funções movidas de documents.html para garantir disponibilidade global
window.toggleDocumentStatus = function(button) {
  if (!button) return;
  const documentoElement = button.closest('.documento-item');
  if (!documentoElement) return;
  const status = button.dataset.status;
  const allTags = documentoElement.querySelectorAll('.documento-tag');
  allTags.forEach(tag => {
    tag.classList.remove('success', 'info', 'warning', 'active');
  });
  documentoElement.dataset.status = status;
  if (status === 'recebido') {
    button.classList.add('success', 'active');
  } else if (status === 'solicitado') {
    button.classList.add('info', 'active');
  } else if (status === 'obter') {
    button.classList.add('warning', 'active');
  }
  documentoElement.classList.remove('status-recebido', 'status-solicitado', 'status-obter');
  documentoElement.classList.add('status-' + status);
  if (typeof saveFormState === 'function') {
    saveFormState();
  }
};

window.toggleDocumentStatusTag = function(element) {
  const currentStatus = element.getAttribute('data-selected');
  const statusValue = element.getAttribute('data-value') || element.querySelector('select').value;
  if (!element.hasAttribute('data-value')) {
    element.setAttribute('data-value', statusValue);
  }
  if (currentStatus) {
    element.removeAttribute('data-selected');
  } else {
    element.setAttribute('data-selected', statusValue);
  }
  const documentoElement = element.closest('.documento-item');
  if (documentoElement) {
    let mappedStatus = statusValue.toLowerCase();
    if (mappedStatus === 'recebido') mappedStatus = 'recebido';
    else if (mappedStatus === 'solicitado') mappedStatus = 'solicitado';
    else if (mappedStatus === 'obter') mappedStatus = 'obter';
    documentoElement.dataset.status = mappedStatus;
    documentoElement.classList.remove('status-recebido', 'status-solicitado', 'status-obter');
    documentoElement.classList.add('status-' + mappedStatus);
  }
  if (typeof saveFormState === 'function') {
    saveFormState();
  }
};

window.updateDocumentStatusTag = function(select) {
  const container = select.closest('.relationship-select');
  const value = select.value;
  container.setAttribute('data-selected', value);
  container.setAttribute('data-value', value);
  const documentoElement = container.closest('.documento-item');
  if (documentoElement) {
    let mappedStatus = value.toLowerCase();
    if (mappedStatus === 'recebido') mappedStatus = 'recebido';
    else if (mappedStatus === 'solicitado') mappedStatus = 'solicitado';
    else if (mappedStatus === 'obter') mappedStatus = 'obter';
    documentoElement.dataset.status = mappedStatus;
    documentoElement.classList.remove('status-recebido', 'status-solicitado', 'status-obter');
    documentoElement.classList.add('status-' + mappedStatus);
  }
  if (typeof saveFormState === 'function') {
    saveFormState();
  }
};

window.toggleDocumentFields = function(button) {
  if (!button) return;
  const documentoElement = button.closest('.documento-item');
  if (!documentoElement) return;
  const detalhesArea = documentoElement.querySelector('.detalhes-documento-container');
  const icon = button.querySelector('i');
  if (detalhesArea) {
    if (detalhesArea.classList.contains('hidden')) {
      detalhesArea.classList.remove('hidden');
      icon.classList.remove('fa-chevron-down');
      icon.classList.add('fa-chevron-up');
    } else {
      detalhesArea.classList.add('hidden');
      icon.classList.remove('fa-chevron-up');
      icon.classList.add('fa-chevron-down');
    }
  }
};

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

// Função para gerar o relatório em PDF
async function gerarRelatorioPDF() {
  console.log('[docs.js] gerarRelatorioPDF chamado');

  if (typeof html2pdf === 'undefined') {
    console.error('[docs.js] html2pdf is not defined. Certifique-se de que a biblioteca está carregada.');
    showError('Erro ao gerar PDF: Biblioteca html2pdf não encontrada.');
    return;
  }

  if (!window.formStateManager) {
    console.error('[docs.js] formStateManager não está disponível.');
    showError('Erro ao gerar PDF: Gerenciador de estado não encontrado.');
    return;
  }

  const todasAsPaginas = window.formStateManager.formData;
  console.log('[docs.js] Dados coletados para o relatório:', todasAsPaginas);

  if (!todasAsPaginas || Object.keys(todasAsPaginas).length === 0) {
    showInfo('Não há dados para gerar o relatório.');
    return;
  }

  if (typeof showLoadingIndicator === 'function') {
    showLoadingIndicator('Gerando relatório PDF...');
  } else {
    console.warn('[docs.js] showLoadingIndicator não definida.');
  }

  try {
    // Inicializa htmlContent com o cabeçalho principal e a primeira página
    let htmlContent = `
      <!DOCTYPE html>
      <html lang="pt-br">
      <head>
        <meta charset="UTF-8">
        <title>Relatório de Atendimento Previdenciário</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f0f3f5;
            color: #1e293b;
            font-size: 8pt; /* Reduzido de 8.5pt */
            line-height: 1.4; /* Reduzido de 1.5 */
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          .page {
            width: 210mm;
            min-height: 290mm;
            padding: 8mm; /* Reduzido de 10mm */
            margin: 0 auto 5mm auto;
            box-sizing: border-box;
            page-break-after: always;
            position: relative;
            background-color: #fff;
            box-shadow: 0 0 8px rgba(0,0,0,0.08);
          }
          .page:last-of-type {
            page-break-after: avoid;
            margin-bottom: 0;
          }
          .report-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 4mm; /* Reduzido de 6mm */
            padding-bottom: 3mm; /* Reduzido de 4mm */
            border-bottom: 2px solid #60a5fa;
          }
          .report-header-left .logo-text {
            font-size: 16pt; /* Reduzido de 18pt */
            font-weight: 700;
            color: #1d4ed8;
            margin: 0 0 0.5mm 0;
          }
          .report-header-left .logo-subtext {
            font-size: 8pt; /* Reduzido de 8.5pt */
            color: #374151;
            margin: 0;
          }
          .report-header-right .report-main-title {
            font-size: 12pt; /* Reduzido de 14pt */
            font-weight: 600;
            color: #1e3a8a;
            text-align: right;
          }
          .section {
            margin-bottom: 4mm; /* Reduzido de 6mm */
            padding-top: 0;
          }
          .section-title {
            font-size: 11pt; /* Reduzido de 12pt */
            font-weight: 600;
            color: #ffffff;
            background-color: #2563eb;
            padding: 1.5mm 2.5mm; /* Reduzido de 2mm 3mm */
            margin-top: 0;
            margin-bottom: 2.5mm; /* Reduzido de 3.5mm */
            border-radius: 3px;
          }

          /* Dados Pessoais do Assistido - Bloco Destacado */
          .assistido-info-block {
            background-color: #fdfdfe;
            padding: 2.5mm; /* Reduzido de 3.5mm */
            border-radius: 4px;
            margin-bottom: 4mm; /* Reduzido de 6mm */
            border: 1px solid #e5e7eb;
            border-top: 3px solid #2563eb;
          }
          .assistido-info-block .subsection-title {
            margin-top: 0;
            margin-bottom: 2mm; /* Reduzido de 2.5mm */
            font-size: 10pt; /* Reduzido de 10.5pt */
            color: #1e3a8a;
            padding-bottom: 1mm; /* Reduzido de 1.5mm */
            border-bottom: 1px solid #d1d5db;
          }

          /* Grupos de Campos e Campos Individuais */
          .field-group {
            margin-bottom: 2mm; /* Reduzido de 2.5mm */
            display: grid;
            grid-template-columns: repeat(5, 1fr); /* Aumentado para 5 colunas */
            gap: 1.5mm 2.5mm; /* Reduzido de 2.5mm 3.5mm */
            page-break-inside: avoid;
          }
          .field-item {
            padding: 0.5mm 0; /* Reduzido de 1mm 0 */
            word-wrap: break-word;
            line-height: 1.3; /* Reduzido de 1.4 */
          }
          .field-item strong {
            display: block;
            font-weight: 500;
            color: #1e3a8a;
            font-size: 8pt; /* Reduzido de 8.5pt */
            margin-bottom: 0.3mm; /* Reduzido de 0.5mm */
            line-height: 1.2; /* Reduzido de 1.3 */
          }
          .field-item span, .field-item div {
            display: block;
            color: #4b5563;
            font-size: 8.5pt; /* Reduzido de 9pt */
            line-height: 1.3; /* Reduzido de 1.4 */
            font-weight: normal;
          }
          .field-item.full-width {
            grid-column: 1 / -1;
          }
          .empty-value {
            color: #6b7280;
            font-style: italic;
          }

          /* Subtítulos dentro de seções */
          .subsection-title {
            font-size: 9.5pt; /* Reduzido de 10pt */
            font-weight: 600;
            color: #1e3a8a;
            margin-top: 3mm; /* Reduzido de 4mm */
            margin-bottom: 2mm; /* Reduzido de 2.5mm */
            padding-bottom: 1mm; /* Reduzido de 1.5mm */
            border-bottom: 1px solid #93c5fd;
          }

          /* Tabelas */
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 2.5mm; /* Reduzido de 3.5mm */
            font-size: 8pt; /* Reduzido de 8.5pt */
            page-break-inside: auto;
            border: 1px solid #60a5fa;
          }
          table th,
          table td {
            border: 1px solid #e5e7eb !important;
            padding: 1mm 1.5mm; /* Reduzido de 1.5mm 2mm */
            text-align: left;
            vertical-align: top;
            word-wrap: break-word;
          }
          table th {
            background-color: #f3f4f6;
            font-weight: 600;
            color: #1e3a8a;
            font-size: 8pt; /* Reduzido de 8.5pt */
            border: 1px solid #e5e7eb !important;
          }
          table tr:nth-child(even) td {
            background-color: #f3f4f6;
          }
          table tr:nth-child(odd) td {
            background-color: #f9fafb;
          }

          /* Estilo para Tags */
          .data-tag {
            display: inline-block;
            padding: 0.2em 0.5em; /* Reduzido de 0.25em 0.6em */
            font-size: 0.8em; /* Reduzido de 0.85em */
            font-weight: 500;
            line-height: 1.1; /* Reduzido de 1.2 */
            color: var(--tag-text-color, #ffffff);
            background-color: var(--tag-bg-color, #60a5fa);
            border-radius: 3px; /* Reduzido de 4px */
            text-transform: uppercase;
          }

          /* Blocos de Itens */
          .item-block {
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            padding: 2mm; /* Reduzido de 3mm */
            margin-bottom: 2.5mm; /* Reduzido de 3.5mm */
            background-color: #fdfdfe;
            page-break-inside: avoid;
          }
          .item-block .subsection-title {
            margin-top: 0;
            padding-bottom: 1mm; /* Reduzido de 1.5mm */
            border-bottom: 1px solid #d1d5db;
            font-size: 9.5pt; /* Reduzido de 10pt */
            color: #1e3a8a;
          }

          /* Rodapé da Página HTML */
          .page-footer {
            position: absolute;
            bottom: 2mm; /* Reduzido de 3mm */
            left: 8mm; /* Reduzido de 10mm */
            right: 8mm; /* Reduzido de 10mm */
            width: calc(100% - 16mm); /* Ajustado de 20mm */
            font-size: 7pt; /* Reduzido de 7.5pt */
            color: #4b5563;
            display: flex;
            justify-content: space-between;
            border-top: 1px solid #bfdbfe;
            padding-top: 1.5mm; /* Reduzido de 2mm */
          }
          .page-footer a {
            color: #2563eb;
            text-decoration: none;
          }
          .page-footer a:hover {
            text-decoration: underline;
          }

          /* Layout compacto para algumas seções específicas */
          .compact-layout .field-group {
            grid-template-columns: repeat(6, 1fr); /* Layout mais compacto para 6 colunas */
            gap: 1mm 2mm; /* Espaçamento ainda mais reduzido */
          }

          .compact-table th, .compact-table td {
            padding: 0.8mm 1.2mm; /* Células de tabela mais compactas */
            font-size: 7.8pt; /* Fonte ainda menor para tabelas compactas */
          }

          /* Cards mais compactos */
          .compact-card {
            padding: 1.5mm;
            margin-bottom: 2mm;
          }

          .compact-card .subsection-title {
            font-size: 9pt;
            margin-bottom: 1.5mm;
            padding-bottom: 0.8mm;
          }

          /* Utilitários de impressão */
          @media print {
            body {
              font-size: 7.5pt; /* Reduzido para impressão */
              background-color: #fff !important;
              color: #000 !important;
            }
            .page {
              padding: 8mm; /* Mantido reduzido */
              margin-bottom: 0;
              border: none !important;
              box-shadow: none !important;
              min-height: initial;
            }
            .report-header,
            .report-header-left .logo-text,
            .report-main-title,
            .assistido-info-block .subsection-title,
            .item-block .subsection-title,
            .subsection-title,
            .field-item strong,
            table th,
            .page-footer,
            .page-footer a {
              color: #000 !important;
            }
            .section-title {
                background-color: #ccc !important;
                color: #000 !important;
                border-radius: 0 !important;
            }
            .assistido-info-block, .item-block {
              border: 1px solid #bbb !important;
              background-color: #f0f0f0 !important;
              border-top: 2px solid #888 !important;
            }
            table,
            table th,
            table td {
              border: 1px solid #aaa !important;
            }
            table th {
              background-color: #ddd !important;
            }
            table tr:nth-child(even) td,
            table tr:nth-child(odd) td {
              background-color: #f8f8f8 !important;
            }
            .data-tag {
              background-color: #ddd !important;
              color: #000 !important;
              border: 1px solid #bbb !important;
            }
            .page-footer {
              border-top: 1px solid #aaa !important;
            }
          }
        </style>
      </head>
      <body>        <div class="page">
          <div class="report-header">
            <div class="report-header-left">
              <div class="logo-text">FIAP</div>
              <div class="logo-subtext">Ficha Inteligente de Atendimento Previdenciário</div>
            </div>
            <div class="report-header-right">
              <div class="report-main-title">Relatório Consolidado de Atendimento</div>
            </div>
          </div>
    `; // Fim da inicialização de htmlContent com cabeçalho

    const formatValue = (value, isHtml = false) => {
      if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
        return isHtml ? 'Não informado' : '<span class="empty-value">Não informado</span>';
      }
      if (typeof value === 'boolean') { return value ? 'Sim' : 'Não'; }
      if (Array.isArray(value)) { return value.length > 0 ? value.map(v => formatValue(v)).join(', ') : (isHtml ? 'Nenhum' : '<span class="empty-value">Nenhum</span>');}
      if (!isHtml && typeof value === 'string') {
        const tempDiv = document.createElement('div');
        tempDiv.textContent = value;
        return tempDiv.innerHTML;
      }
      return String(value);
    };

    // Adicionar função de capitalização diretamente no escopo
    const capitalizeFirst = (text) => {
      if (typeof text !== 'string' || !text) return text;
      return text.charAt(0).toUpperCase() + text.slice(1);
    };

    const createFieldItem = (label, value, options = {}) => {
      const className = options.fullWidth ? 'field-item full-width' : 'field-item';
      // Para perguntas booleanas ou de seleção direta, mostrar 'Não informado' puro se vazio
      const perguntasDiretas = [
        'Trabalha Atualmente?',
        'Último Trabalho (Período)',
        'Limitações Diárias',
        'Tratamentos Realizados',
        'Medicamentos Atuais'
      ];
      let displayValue = value;
      if (perguntasDiretas.includes(label) && (value === undefined || value === null || value === '' || value === '<span class="empty-value">Não informado</span>')) {
        displayValue = 'Não informado';
      }
      return `<div class="${className}"><strong>${label}:</strong> <span>${displayValue}</span></div>`;
    };

    const sectionOrder = ['personal', 'social', 'incapacity', 'professional', 'documents'];
    const sectionDisplayTitles = {
      personal: 'Dados Pessoais e de Contato',
      social: 'Perfil Social e Familiar',
      incapacity: 'Informações sobre Incapacidade e Saúde',
      professional: 'Informações Profissionais',
      documents: 'Documentos'  // Alterado de "Documentos e Observações Finais"
    };

    // Log detalhado dos dados de cada seção
    console.log("[Relatório PDF] Dados da seção Personal:", JSON.stringify(todasAsPaginas.personal, null, 2));
    console.log("[Relatório PDF] Dados da seção Social:", JSON.stringify(todasAsPaginas.social, null, 2));
    console.log("[Relatório PDF] Dados da seção Incapacity:", JSON.stringify(todasAsPaginas.incapacity, null, 2));
    console.log("[Relatório PDF] Dados da seção Professional:", JSON.stringify(todasAsPaginas.professional, null, 2));
    console.log("[Relatório PDF] Dados da seção Documents:", JSON.stringify(todasAsPaginas.documents, null, 2));

    for (const sectionKey of sectionOrder) {
      if (!todasAsPaginas[sectionKey]) {
        console.warn(`[Relatório PDF] Seção ${sectionKey} não encontrada nos dados do formulário.`);
        continue;
      }
      const sectionData = todasAsPaginas[sectionKey];
      // Barra de título principal da sessão
      htmlContent += `<div class="section ${sectionKey}-section">`;
      // Título principal: azul
      htmlContent += `<div class="section-title" style="background-color:#2563eb; color:#fff; border-radius:3px; border-bottom:2px solid #1e3a8a; padding:1.2mm 2.2mm;">${sectionDisplayTitles[sectionKey]}</div>`;

      // Cards para cada bloco de dados
      if (sectionKey === 'personal') {
        // Card do assistido com layout em linha única
        const relacaoPrincipal = sectionData.autor_relationship?.[0] || 'Requerente';
        htmlContent += `<div class="item-block compact-card">`;
        htmlContent += `<div class="subsection-title" style="margin-bottom:1.5mm; padding-bottom:0.8mm;">${formatValue(relacaoPrincipal)}</div>`;

        // Layout de dados em linha única: nome à esquerda, dados à direita
        let nomePrincipal = formatValue(sectionData.autor_nome?.[0]);
        if (relacaoPrincipal && String(relacaoPrincipal).trim() !== '' && relacaoPrincipal !== 'Requerente') {
          nomePrincipal += ` <span class="relationship-select" data-value="${relacaoPrincipal}">${formatValue(relacaoPrincipal)}</span>`;
        }

        // Container principal em linha única
        htmlContent += `<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2mm; border-bottom:1px dashed #e5e7eb; padding-bottom:1mm;">`;

        // Nome à esquerda - estilo inline
        htmlContent += `<div style="flex:1; padding-right:5mm; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"><strong style="color:#1e3a8a; font-size:8pt; margin-right:2mm;">Nome:</strong><span style="font-size:8.5pt;">${nomePrincipal}</span></div>`;

        // Dados pessoais à direita - todos em linha
        htmlContent += `<div style="flex:0 0 auto; white-space:nowrap; text-align:right;">`;
        htmlContent += `<strong style="color:#1e3a8a; font-size:8pt; margin-right:1mm;">CPF:</strong><span style="font-size:8pt; margin-right:4mm;">${formatValue(sectionData.autor_cpf?.[0])}</span>`;
        htmlContent += `<strong style="color:#1e3a8a; font-size:8pt; margin-right:1mm;">Nasc:</strong><span style="font-size:8pt; margin-right:4mm;">${formatValue(sectionData.autor_nascimento?.[0])}</span>`;
        htmlContent += `<strong style="color:#1e3a8a; font-size:8pt; margin-right:1mm;">Idade:</strong><span style="font-size:8pt;">${formatValue(sectionData.autor_idade?.[0])}</span>`;
        htmlContent += `</div>`;

        htmlContent += `</div>`; // Fecha o container principal

        // Dados adicionais em linha única (substituindo o grid)
        const telefone = sectionData.autor_telefone?.[0];
        const telefoneWhatsapp = sectionData.autor_telefone_whatsapp && sectionData.autor_telefone_whatsapp[0] === true;

        let telefoneDisplay = formatValue(telefone);
        if (telefoneWhatsapp && telefone && telefone.trim() !== '') {
          telefoneDisplay += ' <span style="font-size:7pt; padding:0 0.2em; color:#25D366; font-weight:bold;">★</span>';
        }

        // Container para dados adicionais em linha única
        htmlContent += `<div style="display:flex; flex-wrap:wrap; align-items:center; margin-bottom:1mm; font-size:8pt; gap:1mm 4mm;">`;

        // Apelido (se existir) - usando o nome completo "Apelido" em vez da abreviação
        if (sectionData.autor_apelido && sectionData.autor_apelido[0] && sectionData.autor_apelido[0].trim() !== '') {
          htmlContent += `<div style="white-space:nowrap;"><strong style="color:#1e3a8a; font-size:7.8pt; margin-right:1mm;">Apelido:</strong>${formatValue(sectionData.autor_apelido?.[0])}</div>`;
        }

        // Telefone (sempre mostrar)
        htmlContent += `<div style="white-space:nowrap;"><strong style="color:#1e3a8a; font-size:7.8pt; margin-right:1mm;">Tel:</strong>${telefoneDisplay}</div>`;

        // Senha MeuINSS (se existir)
        if (sectionData.autor_senha_meuinss && sectionData.autor_senha_meuinss[0] && sectionData.autor_senha_meuinss[0].trim() !== '') {
          htmlContent += `<div style="white-space:nowrap;"><strong style="color:#1e3a8a; font-size:7.8pt; margin-right:1mm;">INSS:</strong>${formatValue(sectionData.autor_senha_meuinss?.[0])}</div>`;
        }

        // Senha Gov.BR (corrigido para "Senha gov")
        if (sectionData.senha_gov && sectionData.senha_gov.trim && sectionData.senha_gov.trim() !== '') {
          htmlContent += `<div style="white-space:nowrap;"><strong style="color:#1e3a8a; font-size:7.8pt; margin-right:1mm;">Senha gov:</strong>${formatValue(sectionData.senha_gov)}</div>`;
        }

        // Colaborador (mantido completo, sem abreviação)
        if (sectionData.colaborador && sectionData.colaborador.trim() !== '') {
          htmlContent += `<div style="white-space:nowrap;"><strong style="color:#1e3a8a; font-size:7.8pt; margin-right:1mm;">Colaborador:</strong>${formatValue(sectionData.colaborador)}</div>`;
        }

        // Segurado Especial (se existir)
        if (sectionData.segurado_especial !== undefined) {
          htmlContent += `<div style="white-space:nowrap;"><strong style="color:#1e3a8a; font-size:7.8pt; margin-right:1mm;">Seg.Esp:</strong>${sectionData.segurado_especial ? 'Sim' : 'Não'}</div>`;
        }

        htmlContent += `</div>`;

        // Dependentes - layout em linha única para cada dependente (igual ao autor principal)
        if (sectionData.autor_nome && Array.isArray(sectionData.autor_nome) && sectionData.autor_nome.length > 1) {
          htmlContent += `<div class="item-block compact-card" style="padding:1.2mm; margin-bottom:1.8mm;">`;
          htmlContent += `<div class="subsection-title" style="margin-bottom:1.2mm; padding-bottom:0.6mm; font-size:9pt;">Dependentes/Envolvidos</div>`;
          htmlContent += `<div style="display:grid; grid-template-columns:repeat(1, 1fr); gap:1mm;">`;

          for (let index = 1; index < sectionData.autor_nome.length; index++) {
            const relation = sectionData.autor_relationship?.[index] || '';
            const authorTitle = relation || `Dependente ${index}`;

            // Layout em linha única para cada dependente
            htmlContent += `<div style="border:1px solid #e5e7eb; border-radius:3px; padding:1mm; margin-bottom:0.8mm; background:#f9fafb;">`;
            htmlContent += `<div style="font-weight:600; font-size:8.5pt; color:#1e3a8a; margin-bottom:1mm;">${authorTitle}</div>`;

            // Container principal em linha única para cada dependente (igual ao autor principal)
            htmlContent += `<div style="display:flex; justify-content:space-between; align-items:center;">`;

            // Nome à esquerda - estilo inline
            htmlContent += `<div style="flex:1; padding-right:5mm; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"><strong style="color:#1e3a8a; font-size:8pt; margin-right:2mm;">Nome:</strong><span style="font-size:8.5pt;">${formatValue(sectionData.autor_nome[index])}</span></div>`;

            // Dados pessoais à direita - todos em linha
            htmlContent += `<div style="flex:0 0 auto; white-space:nowrap; text-align:right;">`;
            htmlContent += `<strong style="color:#1e3a8a; font-size:8pt; margin-right:1mm;">CPF:</strong><span style="font-size:8pt; margin-right:4mm;">${formatValue(sectionData.autor_cpf?.[index])}</span>`;
            htmlContent += `<strong style="color:#1e3a8a; font-size:8pt; margin-right:1mm;">Nasc:</strong><span style="font-size:8pt; margin-right:4mm;">${formatValue(sectionData.autor_nascimento?.[index])}</span>`;
            htmlContent += `<strong style="color:#1e3a8a; font-size:8pt; margin-right:1mm;">Idade:</strong><span style="font-size:8pt;">${formatValue(sectionData.autor_idade?.[index])}</span>`;
            htmlContent += `</div>`;

            htmlContent += `</div>`; // Fecha o container principal de layout em linha

            htmlContent += `</div>`; // Fecha o card do dependente
          }

          htmlContent += `</div></div>`; // Fecha o container de todos os dependentes
        }

        // Endereço e Observações - Agora observações fica embaixo do endereço, não ao lado
        let addressContent = '';
        let obsContent = '';

        // Endereço: layout ainda mais compacto - tudo numa única linha
        if (sectionData.cep || sectionData.endereco || sectionData.numero ||
            (sectionData.complemento && sectionData.complemento.trim() !== '' && sectionData.complemento.trim().toLowerCase() !== 'não informado') ||
            sectionData.bairro || sectionData.cidade) {

          addressContent += `<div class="item-block compact-card" style="padding:1.2mm; margin-bottom:1.8mm;">`;
          addressContent += `<div class="subsection-title" style="margin:0 0 1mm 0; padding-bottom:0.6mm; font-size:9pt;">Endereço</div>`;

          // Layout simples sem redundâncias
          addressContent += `<div style="font-size:8pt; line-height:1.3;">`;

          // Componentes do endereço
          let enderecoParts = [];

          // Rua e número
          let ruaNumero = '';
          if (sectionData.endereco && sectionData.endereco.trim() !== '') {
            ruaNumero = formatValue(sectionData.endereco);

            if (sectionData.numero && sectionData.numero.trim() !== '') {
              ruaNumero += `, ${formatValue(sectionData.numero)}`;
            }

            if (sectionData.complemento && sectionData.complemento.trim() !== '' &&
                sectionData.complemento.trim().toLowerCase() !== 'não informado') {
              ruaNumero += `, ${formatValue(sectionData.complemento)}`;
            }

            if (ruaNumero) enderecoParts.push(ruaNumero);
          }

          // Bairro, cidade e CEP
          let localidade = [];

          if (sectionData.bairro && sectionData.bairro.trim() !== '') {
            localidade.push(formatValue(sectionData.bairro));
          }

          if (sectionData.cidade && sectionData.cidade.trim() !== '') {
            localidade.push(formatValue(sectionData.cidade));
          }

          if (sectionData.cep && sectionData.cep.trim() !== '') {
            localidade.push(`CEP: ${formatValue(sectionData.cep)}`);
          }

          if (localidade.length > 0) {
            enderecoParts.push(localidade.join(' - '));
          }

          // Montar endereço completo com separador hífen em vez de bullet point
          if (enderecoParts.length > 0) {
            addressContent += enderecoParts.join(' - ');
          } else {
            addressContent += `<span class="empty-value">Endereço não informado</span>`;
          }

          addressContent += `</div></div>`;
        }

        // Observações: layout compacto
        if (sectionData.observacoes && sectionData.observacoes.trim() !== '') {
          obsContent += `<div class="item-block compact-card" style="padding:1.2mm; margin-bottom:1.8mm;">`;
          obsContent += `<div class="subsection-title" style="margin:0 0 1mm 0; padding-bottom:0.6mm; font-size:9pt;">Observações</div>`;
          obsContent += `<div style="font-size:8pt;">${formatValue(sectionData.observacoes, { isHtml: true })}</div>`;
          obsContent += `</div>`;
        }

        htmlContent += addressContent;
        htmlContent += obsContent;

      } else if (sectionKey === 'social') {
        // Layout social otimizado
        htmlContent += `<div style="display:grid; grid-template-columns:1fr; gap:1.5mm;">`;

        // Bloco de renda familiar - tudo em uma única linha com título integrado
        htmlContent += `<div class="item-block compact-card" style="padding:1.2mm; margin-bottom:1.5mm;">`;
        // Remover título separado e incluir direto na linha do conteúdo
        htmlContent += `<div style="font-size:8pt; line-height:1.3;">`;
        // Salário mínimo atual como referência (pode ser atualizado conforme necessário)
        const salarioMinimo = "R$ 1.412,00";
        htmlContent += `<strong style="color:#1e3a8a; font-size:8.5pt; margin-right:1mm;">Renda Familiar:</strong> Renda Total: ${formatValue(sectionData.renda_total_familiar)} &nbsp;&nbsp;&nbsp; Renda Per Capita: ${formatValue(sectionData.renda_per_capita)} &nbsp;&nbsp;&nbsp; Salário Mínimo: ${salarioMinimo}`;
        htmlContent += `</div></div>`;

        // Tabela de composição familiar compacta
        if (sectionData.familiar_nome && Array.isArray(sectionData.familiar_nome) && sectionData.familiar_nome.length > 0) {
          htmlContent += `<div class="item-block compact-card" style="padding:1.2mm; margin-bottom:1.5mm;">`;
          htmlContent += `<div class="subsection-title" style="margin-bottom:1.2mm; padding-bottom:0.6mm; font-size:9pt;">Composição Familiar</div>`;
          htmlContent += '<table class="compact-table" style="margin:0; font-size:7.8pt;">';
          htmlContent += '<thead><tr>';
          htmlContent += '<th style="padding:0.8mm 1mm;">Nome</th>';
          htmlContent += '<th style="padding:0.8mm 1mm;">Parentesco</th>';
          htmlContent += '<th style="padding:0.8mm 1mm;">CPF</th>';
          htmlContent += '<th style="padding:0.8mm 1mm;">Idade</th>';
          htmlContent += '<th style="padding:0.8mm 1mm;">Estado Civil</th>';
          htmlContent += '<th style="padding:0.8mm 1mm;">Renda</th>';
          htmlContent += '<th style="padding:0.8mm 1mm;">CadÚnico</th>';
          htmlContent += '</tr></thead><tbody>';

          sectionData.familiar_nome.forEach((nome, index) => {
            htmlContent += '<tr>';
            htmlContent += `<td style="padding:0.8mm 1mm;">${formatValue(nome)}</td>`;
            htmlContent += `<td style="padding:0.8mm 1mm;">${formatValue(sectionData.familiar_parentesco?.[index])}</td>`;
            htmlContent += `<td style="padding:0.8mm 1mm;">${formatValue(sectionData.familiar_cpf?.[index])}</td>`;
            htmlContent += `<td style="padding:0.8mm 1mm;">${formatValue(sectionData.familiar_idade?.[index])}</td>`;
            htmlContent += `<td style="padding:0.8mm 1mm;">${formatValue(sectionData.familiar_estado_civil?.[index])}</td>`;
            htmlContent += `<td style="padding:0.8mm 1mm;">${formatValue(sectionData.familiar_renda?.[index])}</td>`;
            htmlContent += `<td style="padding:0.8mm 1mm;">${formatValue(sectionData.familiar_cadunico?.[index])}</td>`;
            htmlContent += '</tr>';
          });

          htmlContent += '</tbody></table></div>';
        }

        // Observações sociais
        if(sectionData.observacoes && sectionData.observacoes.trim() !== ''){
          htmlContent += `<div class="item-block compact-card" style="padding:1.2mm; margin-bottom:0;">`;
          htmlContent += `<div class="subsection-title" style="margin-bottom:1.2mm; padding-bottom:0.6mm; font-size:9pt;">Observações Sociais</div>`;
          htmlContent += `<div style="font-size:8pt;">${formatValue(sectionData.observacoes, { isHtml: true })}</div>`;
          htmlContent += `</div>`;
        }

        htmlContent += `</div>`; // Fecha o grid

      } else if (sectionKey === 'incapacity') {
        // Layout incapacidade otimizado
        htmlContent += `<div style="display:grid; grid-template-columns:1fr; gap:1.5mm;">`;

        // Bloco situação laboral
        htmlContent += `<div class="item-block compact-card" style="padding:1.2mm; margin-bottom:1.5mm;">`;
        htmlContent += `<div class="subsection-title" style="margin-bottom:1.2mm; padding-bottom:0.6mm; font-size:9pt;">Situação Laboral e Saúde</div>`;
        htmlContent += `<div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:0.8mm 1.5mm;">`;

        // Formatação do período de trabalho
        function formatPeriodoTrabalho(valor) {
          if (!valor || typeof valor !== 'string') return formatValue(valor);
          if (valor.startsWith('menos_')) {
            const meses = valor.replace('menos_', '').replace('_mes', '').replace('_meses', '');
            return `Menos de ${meses} mês${meses === '1' ? '' : 'es'}`;
          }
          if (valor.match(/^\d+_mes(es)?$/)) {
            const meses = valor.replace('_mes', '').replace('_meses', '');
            return `${meses} mês${meses === '1' ? '' : 'es'}`;
          }
          if (valor.match(/^\d+_\d+_anos$/)) {
            const [de, ate] = valor.replace('_anos', '').split('_');
            return `${de} a ${ate} anos`;
          }
          if (valor.match(/^\d+_anos$/)) {
            const anos = valor.replace('_anos', '');
            return `${anos} ano${anos === '1' ? '' : 's'}`;
          }
          return formatValue(valor);
        }

        htmlContent += `<div style="font-size:8pt;"><strong style="color:#374151; font-size:7.8pt;">Trabalha Atualmente:</strong> ${formatValue(sectionData.trabalhaAtualmente)}</div>`;
        htmlContent += `<div style="font-size:8pt;"><strong style="color:#374151; font-size:7.8pt;">Último Trabalho:</strong> ${formatPeriodoTrabalho(sectionData.ultimoTrabalho)}</div>`;
        htmlContent += `<div style="font-size:8pt;"><strong style="color:#374151; font-size:7.8pt;">Limitações Diárias:</strong> ${formatValue(sectionData.limitacoesDiarias)}</div>`;
        htmlContent += `<div style="font-size:8pt;"><strong style="color:#374151; font-size:7.8pt;">Tratamentos:</strong> ${formatValue(sectionData.tratamentosRealizados)}</div>`;
        htmlContent += `<div style="grid-column:1/-1; font-size:8pt;"><strong style="color:#374151; font-size:7.8pt;">Medicamentos:</strong> ${formatValue(sectionData.medicamentosAtuais)}</div>`;
        htmlContent += `</div></div>`;

        // Tabela de documentos comprobatórios
        if (sectionData.tipoDocumentos || sectionData.doencas || sectionData.cids || sectionData.dataDocumentos) {
          const maxRows = Math.max(
            sectionData.tipoDocumentos?.length || 0,
            sectionData.doencas?.length || 0,
            sectionData.cids?.length || 0,
            sectionData.dataDocumentos?.length || 0
          );

          if (maxRows > 0) {
            htmlContent += `<div class="item-block compact-card" style="padding:1.2mm; margin-bottom:1.5mm;">`;
            htmlContent += `<div class="subsection-title" style="margin-bottom:1.2mm; padding-bottom:0.6mm; font-size:9pt;">Documentos Comprobatórios</div>`;
            htmlContent += '<table class="compact-table" style="margin:0; font-size:7.8pt;">';
            htmlContent += '<thead><tr>';
            htmlContent += '<th style="padding:0.8mm 1mm;">Tipo Documento</th>';
            htmlContent += '<th style="padding:0.8mm 1mm;">Doença/Condição</th>';
            htmlContent += '<th style="padding:0.8mm 1mm;">CID</th>';
            htmlContent += '<th style="padding:0.8mm 1mm;">Data</th>';
            htmlContent += '</tr></thead><tbody>';

            for (let index = 0; index < maxRows; index++) {
              const tipoDoc = sectionData.tipoDocumentos?.[index] || '';
              const doenca = sectionData.doencas?.[index] || '';
              const cid = sectionData.cids?.[index] || '';
              const dataDoc = sectionData.dataDocumentos?.[index] || '';

              // Verificar todas as propriedades possíveis para isenção de carência
              const isencaoCarencia =
                sectionData.isencaoCarencia?.[index] === true ||
                sectionData.isencao_carencia?.[index] === true ||
                (sectionData.doencas_tags &&
                 Array.isArray(sectionData.doencas_tags[index]) &&
                 sectionData.doencas_tags[index].some(tag =>
                   typeof tag === 'string' &&
                   (tag.toLowerCase().includes('isenção') ||
                    tag.toLowerCase().includes('isencao') ||
                    tag.toLowerCase().includes('carencia'))));

              if (tipoDoc.trim() !== '' || doenca.trim() !== '' || cid.trim() !== '' || dataDoc.trim() !== '') {
                htmlContent += '<tr>';
                // Capitalizar primeira letra do tipo de documento
                htmlContent += `<td style="padding:0.8mm 1mm;">${capitalizeFirst(formatValue(tipoDoc))}</td>`;

                // Adicionar tag de isenção de carência com fonte menor
                let doencaCell = formatValue(doenca);
                if (isencaoCarencia) {
                  doencaCell = doenca + ' <span class="data-tag" style="font-size:7pt; padding:0.1em 0.4em; margin-left:3px; background-color:#ff6b6b; color:#fff; font-weight:500;">Isenção de Carência</span>';
                }

                htmlContent += `<td style="padding:0.8mm 1mm;">${doencaCell}</td>`;
                htmlContent += `<td style="padding:0.8mm 1mm;">${formatValue(cid)}</td>`;
                htmlContent += `<td style="padding:0.8mm 1mm;">${formatValue(dataDoc)}</td>`;
                htmlContent += '</tr>';
              }
            }

            htmlContent += '</tbody></table></div>';
          }
        }

        // Observações de saúde
        if (sectionData.observacoes && sectionData.observacoes.trim() !== '') {
          htmlContent += `<div class="item-block compact-card" style="padding:1.2mm; margin-bottom:0;">`;
          htmlContent += `<div class="subsection-title" style="margin-bottom:1.2mm; padding-bottom:0.6mm; font-size:9pt;">Observações de Saúde</div>`;
          htmlContent += `<div style="font-size:8pt;">${formatValue(sectionData.observacoes, { isHtml: true })}</div>`;
          htmlContent += `</div>`;
        }

        htmlContent += `</div>`; // Fecha o grid

      } else if (sectionKey === 'professional') {
        // Layout profissional otimizado
        htmlContent += `<div style="display:grid; grid-template-columns:1fr; gap:1.5mm;">`;

        // Tabela de histórico profissional
        if (sectionData.atividade_tipo && Array.isArray(sectionData.atividade_tipo) && sectionData.atividade_tipo.length > 0) {
          htmlContent += `<div class="item-block compact-card" style="padding:1.2mm; margin-bottom:1.5mm;">`;
          htmlContent += `<div class="subsection-title" style="margin-bottom:1.2mm; padding-bottom:0.6mm; font-size:9pt;">Histórico Profissional</div>`;
          htmlContent += '<table class="compact-table" style="margin:0; font-size:7.8pt;">';
          htmlContent += '<thead><tr>';
          htmlContent += '<th style="padding:0.8mm 1mm;">Vínculo</th>'; // Alterado de "Tipo de Atividade" para "Vínculo"
          htmlContent += '<th style="padding:0.8mm 1mm;">Status</th>';
          htmlContent += '<th style="padding:0.8mm 1mm;">Início</th>';
          htmlContent += '<th style="padding:0.8mm 1mm;">Fim</th>';
          htmlContent += '<th style="padding:0.8mm 1mm;">Prazo</th>';
          htmlContent += '<th style="padding:0.8mm 1mm;">Detalhes</th>'; // Alterado de "Detalhes/Local" para "Detalhes"
          htmlContent += '</tr></thead><tbody>';

          sectionData.atividade_tipo.forEach((tipoAtividade, index) => {
            htmlContent += '<tr>';

            // Formatar o tipo de atividade: primeira letra maiúscula e remover underlines
            let formattedTipoAtividade = tipoAtividade || '';
            if (formattedTipoAtividade) {
              // Substituir underlines por espaços e capitalizar primeira letra
              formattedTipoAtividade = formattedTipoAtividade.replace(/_/g, ' ');
              formattedTipoAtividade = capitalizeFirst(formattedTipoAtividade);
            }

            htmlContent += `<td style="padding:0.8mm 1mm;">${formatValue(formattedTipoAtividade)}</td>`;

            const statusValProf = sectionData.atividade_tag_status?.[index];
            let cellContentProf;
            if (statusValProf === null || statusValProf === undefined || String(statusValProf).trim() === '') {
              cellContentProf = formatValue(statusValProf);
            } else {
              // Tamanho de fonte reduzido
              cellContentProf = `<span class="data-tag" style="font-size:7pt; font-weight:500; display:inline-block; padding:0.2em 0.5em; background-color:#60a5fa; color:#ffffff; border-radius:3px;">${formatValue(statusValProf)}</span>`;
            }

            htmlContent += `<td style="padding:0.8mm 1mm;">${cellContentProf}</td>`;
            htmlContent += `<td style="padding:0.8mm 1mm;">${formatValue(sectionData.atividade_periodo_inicio?.[index])}</td>`;
            htmlContent += `<td style="padding:0.8mm 1mm;">${formatValue(sectionData.atividade_periodo_fim?.[index])}</td>`;
            htmlContent += `<td style="padding:0.8mm 1mm;">${formatValue(sectionData.atividade_prazo?.[index])}</td>`;
            htmlContent += `<td style="padding:0.8mm 1mm;">${formatValue(sectionData.atividade_detalhes?.[index])}</td>`;
            htmlContent += '</tr>';
          });

          htmlContent += '</tbody></table></div>';
        }

        // Observações profissionais
        if (sectionData.observacoes && sectionData.observacoes.trim() !== '') {
          htmlContent += `<div class="item-block compact-card" style="padding:1.2mm; margin-bottom:0;">`;
          htmlContent += `<div class="subsection-title" style="margin-bottom:1.2mm; padding-bottom:0.6mm; font-size:9pt;">Observações Profissionais</div>`;
          htmlContent += `<div style="font-size:8pt;">${formatValue(sectionData.observacoes, { isHtml: true })}</div>`;
          htmlContent += `</div>`;
        }

        htmlContent += `</div>`; // Fecha o grid

      } else if (sectionKey === 'documents') {
        // Layout documentos otimizado
        htmlContent += `<div style="display:grid; grid-template-columns:1fr; gap:1.5mm;">`;

        // Tabela de documentos
        if (sectionData.documentos && Array.isArray(sectionData.documentos) && sectionData.documentos.length > 0) {
          htmlContent += `<div class="item-block compact-card" style="padding:1.2mm; margin-bottom:1.5mm;">`;
          htmlContent += `<div class="subsection-title" style="margin-bottom:1.2mm; padding-bottom:0.6mm; font-size:9pt;">Documentação</div>`;
          htmlContent += '<table class="compact-table" style="margin:0; font-size:7.8pt;">';
          htmlContent += '<thead><tr>';
          htmlContent += '<th style="padding:0.8mm 1mm; width:40%;">Documento</th>';
          htmlContent += '<th style="padding:0.8mm 1mm; width:15%;">Status</th>';
          htmlContent += '<th style="padding:0.8mm 1mm; width:10%;">Ano</th>';
          htmlContent += '<th style="padding:0.8mm 1mm; width:35%;">Observações</th>';
          htmlContent += '</tr></thead><tbody>';

          sectionData.documentos.forEach(doc => {
            htmlContent += '<tr>';
            htmlContent += `<td style="padding:0.8mm 1mm;">${formatValue(doc.nome)}</td>`;

            // Padronização do estilo das tags de status - igual ao histórico profissional
            const statusValDoc = doc.status;
            let cellContentDoc;
            if (statusValDoc === null || statusValDoc === undefined || String(statusValDoc).trim() === '') {
              cellContentDoc = formatValue(statusValDoc);
            } else {
              // Usando exatamente o mesmo estilo das tags do histórico profissional
              cellContentDoc = `<span class="data-tag" style="font-size:7pt; font-weight:500; display:inline-block; padding:0.2em 0.5em; background-color:#60a5fa; color:#ffffff; border-radius:3px;">${formatValue(statusValDoc)}</span>`;
            }

            htmlContent += `<td style="padding:0.8mm 1mm; text-align:center;">${cellContentDoc}</td>`;
            htmlContent += `<td style="padding:0.8mm 1mm; text-align:center;">${formatValue(doc.ano)}</td>`;
            htmlContent += `<td style="padding:0.8mm 1mm;">${formatValue(doc.detalhes, true)}</td>`;
            htmlContent += '</tr>';
          });

          htmlContent += '</tbody></table></div>';
        }

        // Observações sobre documentação (título alterado)
        if (sectionData.observacoes && sectionData.observacoes.trim() !== '') {
          htmlContent += `<div class="item-block compact-card" style="padding:1.2mm; margin-bottom:0;">`;
          htmlContent += `<div class="subsection-title" style="margin-bottom:1.2mm; padding-bottom:0.6mm; font-size:9pt;">Observações sobre documentação</div>`;
          htmlContent += `<div style="font-size:8pt;">${formatValue(sectionData.observacoes, { isHtml: true })}</div>`;
          htmlContent += `</div>`;
        }

        htmlContent += `</div>`; // Fecha o grid
      }

      htmlContent += '</div>'; // Fecha a section
    }

    // Adiciona o rodapé ao final do conteúdo da .page
    htmlContent += `<div class="page-footer">
                      <div>FIAP é um serviço de <a href="https://orbitas.com.br" target="_blank">orbitas.com.br</a> &copy; ${new Date().getFullYear()}</div>
                      <div>Relatório Gerado em: ${new Date().toLocaleString('pt-BR')}</div>
                    </div>`;

    htmlContent += '</div>'; // Fecha a .page

    // Botão flutuante para gerar PDF
    htmlContent += `
      <button id="btn-gerar-pdf-relatorio" style="position:fixed;bottom:32px;right:32px;z-index:9999;padding:14px 28px;font-size:15px;font-weight:600;background:#2563eb;color:#fff;border:none;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.13);cursor:pointer;transition:background 0.2s;display:inline-block;"
        onmouseover="this.style.background='#1e40af'" onmouseout="this.style.background='#2563eb'">
        Gerar PDF
      </button>
      <style>@media print { #btn-gerar-pdf-relatorio { display:none !important; } }</style>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
      <script>
        window.onload = function() {
          var btn = document.getElementById('btn-gerar-pdf-relatorio');
          if (btn) {
            btn.onclick = function() {
              btn.style.display = 'none'; // Esconde o botão antes de gerar o PDF
              var page = document.querySelector('.page');
              if (window.html2pdf) {
                html2pdf().set({
                  margin: 0,
                  filename: 'relatorio-fiap.pdf',
                  image: { type: 'jpeg', quality: 1 },
                  html2canvas: { scale: 5, useCORS: true, backgroundColor: '#fff', logging: false },
                  jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                  pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
                }).from(page).save().then(function() {
                  btn.style.display = 'inline-block';
                }).catch(function() {
                  btn.style.display = 'inline-block';
                  alert('Erro ao gerar PDF.');
                });
              } else {
                alert('A biblioteca html2pdf.js não está carregada.');
                btn.style.display = 'inline-block';
              }
            };
          }
        };
      <\/script>
    `;

    htmlContent += '</body></html>'; // Fecha body/html

    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
      console.log('[docs.js] Relatório HTML aberto em nova aba.');
    } else {
      console.error('[docs.js] Não foi possível abrir uma nova janela. Verifique as configurações do bloqueador de pop-ups.');
      if (typeof showError === 'function') {
        showError('Não foi possível abrir o relatório em uma nova janela. Verifique seu bloqueador de pop-ups.');
      } else {
        alert('Não foi possível abrir o relatório em uma nova janela. Verifique seu bloqueador de pop-ups.');
      }
    }

  } catch (error) {
    console.error('[docs.js] Erro ao gerar relatório HTML:', error);
    if (typeof showError === 'function') {
      showError('Ocorreu um erro ao gerar o relatório HTML: ' + error.message);
    } else {
      alert('Ocorreu um erro ao gerar o relatório HTML: ' + error.message);
    }
  } finally {
    if (typeof hideLoadingIndicator === 'function') {
      hideLoadingIndicator();
    } else {
      console.warn('[docs.js] hideLoadingIndicator não definida.');
    }
  }
}

window.gerarRelatorioPDF = gerarRelatorioPDF;
