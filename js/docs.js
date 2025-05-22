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
            background-color: #f0f3f5; /* Fundo geral cinza muito claro (mantido) */
            color: #1e293b; /* Azul acinzentado escuro para texto principal */
            font-size: 8.5pt;
            line-height: 1.5;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          .page {
            width: 210mm;
            min-height: 290mm;
            padding: 10mm; /* Margem mínima */
            margin: 0 auto 5mm auto; /* Reduzida margem inferior entre páginas */
            box-sizing: border-box;
            page-break-after: always;
            position: relative;
            background-color: #fff; /* Página branca */
            box-shadow: 0 0 8px rgba(0,0,0,0.08); /* Sombra mais sutil */
          }
          .page:last-of-type {
            page-break-after: avoid;
            margin-bottom: 0;
          }          /* Cabeçalho do Relatório */
          .report-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 6mm;
            padding-bottom: 4mm;
            border-bottom: 2px solid #60a5fa; /* Azul para linha do cabeçalho */
          }
          .report-header-left .logo-text {
            font-size: 18pt;
            font-weight: 700;
            color: #1d4ed8; /* Azul escuro */
            margin: 0 0 0.5mm 0;
          }
          .report-header-left .logo-subtext {
            font-size: 8.5pt;
            color: #374151; /* Cinza escuro */
            margin: 0;
          }
          .report-header-right .report-main-title {
            font-size: 14pt;
            font-weight: 600;
            color: #1e3a8a; /* Azul mais escuro */
            text-align: right;
          }          /* Estilos de Seção */
          .section {
            margin-bottom: 6mm;
            padding-top: 0;
          }
          .section-title {
            font-size: 12pt;
            font-weight: 600;
            color: #ffffff; /* Texto branco */
            background-color: #2563eb; /* Fundo azul */
            padding: 2mm 3mm;
            margin-top: 0;
            margin-bottom: 3.5mm;
            border-radius: 3px; /* Arredondamento geral */
          }

          /* Dados Pessoais do Assistido - Bloco Destacado */
          .assistido-info-block {
            background-color: #fdfdfe; /* Cinza muito sutil, quase branco */
            padding: 3.5mm;
            border-radius: 4px;
            margin-bottom: 6mm;
            border: 1px solid #e5e7eb; /* Borda cinza clara */
            border-top: 3px solid #2563eb; /* Borda superior azul mais forte */
          }
          .assistido-info-block .subsection-title {
            margin-top: 0;
            margin-bottom: 2.5mm;
            font-size: 10.5pt;
            color: #1e3a8a; /* Azul escuro para subtitulo */
            padding-bottom: 1.5mm;
            border-bottom: 1px solid #d1d5db; /* Linha cinza média */
          }

          /* Grupos de Campos e Campos Individuais */          .field-group {
            margin-bottom: 2.5mm;
            display: grid;
            grid-template-columns: repeat(4, 1fr); /* Alterado para 4 colunas */
            gap: 2.5mm 3.5mm;
            page-break-inside: avoid;
          }
          .field-item {
            padding: 1mm 0;
            word-wrap: break-word;
            line-height: 1.4;
          }          .field-item strong {
            display: block; /* Alterado para block para quebrar linha */
            font-weight: 500; /* Reduzido o peso para diminuir o negrito */
            color: #1e3a8a; /* Azul escuro para os títulos */
            font-size: 8.5pt;
            margin-bottom: 0.5mm;
            line-height: 1.3;
          }
          .field-item span, .field-item div {
            display: block; /* Forçando quebra de linha após label */
            color: #4b5563; /* Cinza médio para os valores */
            font-size: 9pt;
            line-height: 1.4;
            font-weight: normal;
          }
          .field-item.full-width {
            grid-column: 1 / -1;
          }
          .empty-value {
            color: #6b7280;
            font-style: italic;
          }

          /* Subtítulos dentro de seções (fora de blocos especiais) */
          .subsection-title {
            font-size: 10pt;
            font-weight: 600;
            color: #1e3a8a; /* Azul escuro (mantido) */
            margin-top: 4mm;
            margin-bottom: 2.5mm;
            padding-bottom: 1.5mm;
            border-bottom: 1px solid #93c5fd; /* Linha azul clara (mantida por enquanto) */
          }

          /* Tabelas */
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 3.5mm;
            font-size: 8.5pt;
            page-break-inside: auto;
            border: 1px solid #60a5fa; /* Borda azul principal da tabela */
          }
          table th,
          table td {
            border: 1px solid #e5e7eb !important; /* Borda cinza clara para TODAS as células internas */
            padding: 1.5mm 2mm;
            text-align: left;
            vertical-align: top;
            word-wrap: break-word;
          }
          table th {
            background-color: #f3f4f6; /* Fundo cinza claro para cabeçalhos */
            font-weight: 600;
            color: #1e3a8a; /* Azul escuro no texto do cabeçalho */
            font-size: 8.5pt;
            border: 1px solid #e5e7eb !important; /* Garante cinza nas bordas do cabeçalho */
          }
          table tr:nth-child(even) td {
            background-color: #f3f4f6; /* Cinza claro para zebrado */
          }
          table tr:nth-child(odd) td {
            background-color: #f9fafb; /* Cinza mais claro para zebrado */
          }          /* Estilo para Tags - Usando as cores dinâmicas do sistema */
          .data-tag {
            display: inline-block;
            padding: 0.25em 0.6em;
            font-size: 0.85em;
            font-weight: 500;
            line-height: 1.2;
            color: var(--tag-text-color, #ffffff); /* Usa a variável definida no projeto */
            background-color: var(--tag-bg-color, #60a5fa); /* Usa a variável definida no projeto */
            border-radius: 4px;
            text-transform: uppercase;
          }

          /* Blocos de Itens (Autores adicionais, etc.) */
          .item-block {
            border: 1px solid #e5e7eb; /* Borda cinza clara */
            border-radius: 4px;
            padding: 3mm;
            margin-bottom: 3.5mm;
            background-color: #fdfdfe; /* Cinza muito sutil, quase branco */
            page-break-inside: avoid;
          }
          .item-block .subsection-title {
            margin-top: 0;
            padding-bottom: 1.5mm;
            border-bottom: 1px solid #d1d5db; /* Linha cinza média */
            font-size: 10pt;
            color: #1e3a8a; /* Azul escuro (mantido) */
          }

          /* Rodapé da Página HTML */
          .page-footer {
            position: absolute;
            bottom: 3mm;
            left: 10mm;
            right: 10mm;
            width: calc(100% - 20mm);
            font-size: 7.5pt;
            color: #4b5563; /* Cinza */
            display: flex;
            justify-content: space-between;
            border-top: 1px solid #bfdbfe; /* Linha azul clara */
            padding-top: 2mm;
          }
          .page-footer a {
            color: #2563eb; /* Link azul */
            text-decoration: none;
          }
          .page-footer a:hover {
            text-decoration: underline;
          }

          /* Utilitários de impressão */
          @media print {
            body {
              font-size: 8pt;
              background-color: #fff !important;
              color: #000 !important;
            }
            .page {
              padding: 10mm;
              margin-bottom: 0;
              border: none !important; /* Remover bordas da página */
              box-shadow: none !important; /* Remover sombra da página */
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
                background-color: #ccc !important; /* Cinza para fundo de título de seção */
                color: #000 !important;
                border-radius: 0 !important; /* Sem bordas arredondadas na impressão */
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
        return '<span class="empty-value">Não informado</span>';
      }
      if (typeof value === 'boolean') { return value ? 'Sim' : 'Não'; }
      if (Array.isArray(value)) { return value.length > 0 ? value.map(v => formatValue(v)).join(', ') : '<span class="empty-value">Nenhum</span>';}
      if (!isHtml && typeof value === 'string') {
        const tempDiv = document.createElement('div');
        tempDiv.textContent = value;
        return tempDiv.innerHTML;
      }
      return String(value);
    };

    const createFieldItem = (label, value, options = {}) => {
      const className = options.fullWidth ? 'field-item full-width' : 'field-item';
      return `<div class="${className}"><strong>${label}:</strong> <span>${formatValue(value, options.isHtml)}</span></div>`;
    };

    const sectionOrder = ['personal', 'social', 'incapacity', 'professional', 'documents'];
    const sectionDisplayTitles = {
      personal: 'Dados Pessoais e de Contato',
      social: 'Perfil Social e Familiar',
      incapacity: 'Informações sobre Incapacidade e Saúde',
      professional: 'Informações Profissionais',
      documents: 'Documentos e Observações Finais'
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
      htmlContent += `<div class="section-title" style="background-color:#2563eb; color:#fff; border-radius:3px; border-bottom:2px solid #1e3a8a;">${sectionDisplayTitles[sectionKey]}</div>`;
      // Cards para cada bloco de dados
      if (sectionKey === 'personal') {
        // Card do assistido padronizado, sem detalhe azul no topo
        const relacaoPrincipal = sectionData.autor_relationship?.[0] || 'Requerente';
        htmlContent += `<div class="item-block author-block">`;
        htmlContent += `<div class="subsection-title">${formatValue(relacaoPrincipal)}</div>`;
        htmlContent += `<div class="field-group" style="grid-template-columns: repeat(3, 1fr); gap: 3mm 5mm;">`;
        let nomePrincipal = formatValue(sectionData.autor_nome?.[0]);
        if (relacaoPrincipal && String(relacaoPrincipal).trim() !== '' && relacaoPrincipal !== 'Requerente') {
          nomePrincipal += ` <span class="relationship-select" data-value="${relacaoPrincipal}">${formatValue(relacaoPrincipal)}</span>`;
        }
        htmlContent += createFieldItem('Nome Completo', nomePrincipal, { isHtml: true });
        htmlContent += createFieldItem('CPF', sectionData.autor_cpf?.[0]);
        htmlContent += createFieldItem('Data de Nascimento', sectionData.autor_nascimento?.[0]);
        htmlContent += createFieldItem('Idade', sectionData.autor_idade?.[0]);
        htmlContent += createFieldItem('Apelido', sectionData.autor_apelido?.[0]);
        htmlContent += createFieldItem('Telefone Principal', sectionData.autor_telefone?.[0]);
        htmlContent += createFieldItem('Detalhes Telefone', sectionData.telefone_detalhes);
        htmlContent += createFieldItem('Senha MeuINSS', sectionData.autor_senha_meuinss?.[0]);
        htmlContent += createFieldItem('Colaborador', sectionData.colaborador);
        if (sectionData.segurado_especial !== undefined) {
          htmlContent += createFieldItem('Segurado Especial', sectionData.segurado_especial ? 'Sim' : 'Não');
        }
        htmlContent += `</div>`;
        htmlContent += `</div>`;
        // Dependentes
        if (sectionData.autor_nome && Array.isArray(sectionData.autor_nome) && sectionData.autor_nome.length > 1) {
          sectionData.autor_nome.forEach((nome, index) => {
            if (index === 0) return;
            htmlContent += `<div class="item-block author-block" style="padding: 8px 10px; margin-bottom: 8px;">`;
            const relation = sectionData.autor_relationship?.[index] || '';
            let authorTitle = `Dependente/Envolvido ${index}`;
            if (relation) authorTitle = `${relation}`;
            htmlContent += `<div class="subsection-title" style="margin-bottom:4px; font-size:10pt; padding-bottom:2px; border-bottom:0;">${authorTitle}${relation?` <span class='relationship-select' data-value='${relation}'>${authorTitle}</span>`:''}</div>`;
            htmlContent += `<div class="field-group" style="grid-template-columns: repeat(4, 1fr); gap: 2mm 3mm; margin-bottom:0;">`;
            htmlContent += createFieldItem('Nome Completo', nome);
            htmlContent += createFieldItem('CPF', sectionData.autor_cpf?.[index]);
            htmlContent += createFieldItem('Data de Nascimento', sectionData.autor_nascimento?.[index]);
            htmlContent += createFieldItem('Idade', sectionData.autor_idade?.[index]);
            htmlContent += `</div></div>`;
          });
        }
        // Endereço: movido para antes das observações
        let enderecoCard = '';
        if (
          sectionData.cep || sectionData.endereco || sectionData.numero ||
          (sectionData.complemento && sectionData.complemento.trim() !== '' && sectionData.complemento.trim().toLowerCase() !== 'não informado') ||
          sectionData.bairro || sectionData.cidade
        ) {
          enderecoCard += `<div class="item-block" style="background:#f9fafb; border:1px solid #d1d5db; margin-top:8px;">`;
          enderecoCard += `<strong style="color:#1e3a8a;">Endereço:</strong> `;
          enderecoCard += `<div class="field-group" style="grid-template-columns: repeat(3, 1fr); gap: 3mm 5mm; margin-top:4px;">`;
          enderecoCard += createFieldItem('CEP', sectionData.cep);
          enderecoCard += createFieldItem('Endereço', sectionData.endereco);
          enderecoCard += createFieldItem('Número', sectionData.numero);
          if (sectionData.complemento && sectionData.complemento.trim() !== '' && sectionData.complemento.trim().toLowerCase() !== 'não informado') {
            enderecoCard += createFieldItem('Complemento', sectionData.complemento);
          }
          enderecoCard += createFieldItem('Bairro', sectionData.bairro);
          enderecoCard += createFieldItem('Cidade', sectionData.cidade);
          enderecoCard += `</div></div>`;
        }
        // Observações
        let obsCard = '';
        if (sectionData.observacoes && sectionData.observacoes.trim() !== '') {
          obsCard += `<div class="item-block" style="background:#f9fafb; border:1px solid #d1d5db; margin-top:8px;"><strong style="color:#1e3a8a;">Observações pessoais:</strong> ${formatValue(sectionData.observacoes, { isHtml: true })}</div>`;
        }
        // Ordem: cards principais, dependentes, endereço, observações
        htmlContent += enderecoCard;
        htmlContent += obsCard;
      } else if (sectionKey === 'social') {
        htmlContent += `<div class="item-block" style="border:1px solid #d1d5db; border-radius:4px; margin-bottom:0; padding:0; overflow:hidden;">`;
        htmlContent += `<div class="subsection-title" style="margin-bottom:8px; font-size:10.5pt; color:#374151; border-bottom:1px solid #d1d5db; padding:12px 16px 8px 16px; background:#f9fafb;">Composição Social e Renda</div>`;
        htmlContent += `<div class="field-group" style="grid-template-columns: repeat(3, 1fr); gap: 3mm 5mm; padding: 0 16px 8px 16px;">`;
        htmlContent += createFieldItem('Renda Total Familiar (Declarada)', sectionData.renda_total_familiar, { isHtml: true });
        htmlContent += createFieldItem('Renda Per Capita Familiar (Declarada)', sectionData.renda_per_capita, { isHtml: true });
        htmlContent += `</div>`;
        if (sectionData.familiar_nome && Array.isArray(sectionData.familiar_nome) && sectionData.familiar_nome.length > 0) {
          htmlContent += `<div class="subsection-title" style="margin-top:8px; font-size:10pt; color:#374151; border-bottom:1px solid #d1d5db; padding:8px 16px 8px 16px; background:#f9fafb;">Composição Familiar e Renda Detalhada</div>`;
          htmlContent += '<table style="width:100%; margin:0; border:none; box-shadow:none;">';
          htmlContent += '<thead><tr>';
          htmlContent += '<th style="background:#f3f4f6; color:#1e3a8a; border:none;">Nome</th>';
          htmlContent += '<th style="background:#f3f4f6; color:#1e3a8a; border:none;">Parentesco</th>';
          htmlContent += '<th style="background:#f3f4f6; color:#1e3a8a; border:none;">CPF</th>';
          htmlContent += '<th style="background:#f3f4f6; color:#1e3a8a; border:none;">Idade</th>';
          htmlContent += '<th style="background:#f3f4f6; color:#1e3a8a; border:none;">Estado Civil</th>';
          htmlContent += '<th style="background:#f3f4f6; color:#1e3a8a; border:none;">Renda (R$)</th>';
          htmlContent += '<th style="background:#f3f4f6; color:#1e3a8a; border:none;">CadÚnico?</th>';
          htmlContent += '</tr></thead><tbody>';
          sectionData.familiar_nome.forEach((nome, index) => {
            // Substituir todas as bordas das células das tabelas para cinza (#e5e7eb)
            htmlContent += '<tr>';
            htmlContent += `<td style="border-top:1px solid #e5e7eb; border-bottom:none; border-left:1px solid #e5e7eb; border-right:1px solid #e5e7eb;">${formatValue(nome)}</td>`;
            htmlContent += `<td style="border-top:1px solid #e5e7eb; border-bottom:none; border-left:1px solid #e5e7eb; border-right:1px solid #e5e7eb;">${formatValue(sectionData.familiar_parentesco?.[index])}</td>`;
            htmlContent += `<td style="border-top:1px solid #e5e7eb; border-bottom:none; border-left:1px solid #e5e7eb; border-right:1px solid #e5e7eb;">${formatValue(sectionData.familiar_cpf?.[index])}</td>`;
            htmlContent += `<td style="border-top:1px solid #e5e7eb; border-bottom:none; border-left:1px solid #e5e7eb; border-right:1px solid #e5e7eb;">${formatValue(sectionData.familiar_idade?.[index])}</td>`;
            htmlContent += `<td style="border-top:1px solid #e5e7eb; border-bottom:none; border-left:1px solid #e5e7eb; border-right:1px solid #e5e7eb;">${formatValue(sectionData.familiar_estado_civil?.[index])}</td>`;
            htmlContent += `<td style="border-top:1px solid #e5e7eb; border-bottom:none; border-left:1px solid #e5e7eb; border-right:1px solid #e5e7eb;">${formatValue(sectionData.familiar_renda?.[index])}</td>`;
            htmlContent += `<td style="border-top:1px solid #e5e7eb; border-bottom:none; border-left:1px solid #e5e7eb; border-right:1px solid #e5e7eb;">${formatValue(sectionData.familiar_cadunico?.[index])}</td>`;
            htmlContent += '</tr>';
          });
          htmlContent += '</tbody></table>';
        }
        htmlContent += `</div>`;
        if(sectionData.observacoes && sectionData.observacoes.trim() !== ''){
          htmlContent += `<div class="item-block" style="background:#f9fafb; border:1px solid #d1d5db; margin-top:8px;"><strong style="color:#1e3a8a;">Observações sociais:</strong> ${formatValue(sectionData.observacoes, { isHtml: true })}</div>`;
        }
      } else if (sectionKey === 'incapacity') {
        htmlContent += `<div class="item-block" style="border:1px solid #d1d5db; border-radius:4px; margin-bottom:0; padding:0; overflow:hidden;">`;
        htmlContent += `<div class="subsection-title" style="margin-bottom:8px; font-size:10.5pt; color:#374151; border-bottom:1px solid #d1d5db; padding:12px 16px 8px 16px; background:#f9fafb;">Situação Laboral e Saúde</div>`;
        htmlContent += `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 3mm 5mm; margin-bottom: 3mm; padding: 0 16px 0 16px;">`;
        htmlContent += `<div>${createFieldItem('Trabalha Atualmente?', sectionData.trabalhaAtualmente)}</div>`;
        htmlContent += `<div>${createFieldItem('Último Trabalho (Período)', sectionData.ultimoTrabalho)}</div>`;
        htmlContent += `<div>${createFieldItem('Limitações Diárias', sectionData.limitacoesDiarias)}</div>`;
        htmlContent += `<div>${createFieldItem('Tratamentos Realizados', sectionData.tratamentosRealizados)}</div>`;
        htmlContent += `<div style="grid-column: 1 / -1;">${createFieldItem('Medicamentos Atuais', sectionData.medicamentosAtuais)}</div>`;
        htmlContent += `</div>`;
        if (sectionData.tipoDocumentos || sectionData.doencas || sectionData.cids || sectionData.dataDocumentos) {
          const maxRows = Math.max(
            sectionData.tipoDocumentos?.length || 0,
            sectionData.doencas?.length || 0,
            sectionData.cids?.length || 0,
            sectionData.dataDocumentos?.length || 0
          );
          if (maxRows > 0) {
            htmlContent += `<div class="subsection-title" style="margin-top:8px; font-size:10pt; color:#374151; border-bottom:1px solid #d1d5db; padding:8px 16px 8px 16px; background:#f9fafb;">Documentos Comprobatórios e Detalhes da Incapacidade</div>`;
            htmlContent += '<table style="width:100%; margin:0; border:none; box-shadow:none;">';
            htmlContent += '<thead><tr>';
            htmlContent += '<th style="background:#f3f4f6; color:#1e3a8a; border:none;">Tipo Documento</th>';
            htmlContent += '<th style="background:#f3f4f6; color:#1e3a8a; border:none;">Doença/Condição (Conforme Documento)</th>';
            htmlContent += '<th style="background:#f3f4f6; color:#1e3a8a; border:none;">CID</th>';
            htmlContent += '<th style="background:#f3f4f6; color:#1e3a8a; border:none;">Data do Documento</th>';
            htmlContent += '</tr></thead><tbody>';
            for (let index = 0; index < maxRows; index++) {
              const tipoDoc = sectionData.tipoDocumentos?.[index] || '';
              const doenca = sectionData.doencas?.[index] || '';
              const cid = sectionData.cids?.[index] || '';
              const dataDoc = sectionData.dataDocumentos?.[index] || '';
              if (tipoDoc.trim() !== '' || doenca.trim() !== '' || cid.trim() !== '' || dataDoc.trim() !== '') {
                htmlContent += '<tr>';
                htmlContent += `<td style="border-top:1px solid #e5e7eb; border-bottom:none; border-left:1px solid #e5e7eb; border-right:1px solid #e5e7eb;">${formatValue(tipoDoc)}</td>`;
                htmlContent += `<td style="border-top:1px solid #e5e7eb; border-bottom:none; border-left:1px solid #e5e7eb; border-right:1px solid #e5e7eb;">${formatValue(doenca)}</td>`;
                htmlContent += `<td style="border-top:1px solid #e5e7eb; border-bottom:none; border-left:1px solid #e5e7eb; border-right:1px solid #e5e7eb;">${formatValue(cid)}</td>`;
                htmlContent += `<td style="border-top:1px solid #e5e7eb; border-bottom:none; border-left:1px solid #e5e7eb; border-right:1px solid #e5e7eb;">${formatValue(dataDoc)}</td>`;
                htmlContent += '</tr>';
              }
            }
            htmlContent += '</tbody></table>';
          }
        }
        htmlContent += `</div>`;
        if (sectionData.observacoes && sectionData.observacoes.trim() !== '') {
          htmlContent += `<div class="item-block" style="background:#f9fafb; border:1px solid #d1d5db; margin-top:8px;"><strong style="color:#1e3a8a;">Observações de saúde:</strong> ${formatValue(sectionData.observacoes, { isHtml: true })}</div>`;
        }
      } else if (sectionKey === 'professional') {
        htmlContent += `<div class="item-block" style="border:1px solid #d1d5db; border-radius:4px; margin-bottom:0; padding:0; overflow:hidden;">`;
        htmlContent += `<div class="subsection-title" style="margin-bottom:8px; font-size:10.5pt; color:#374151; border-bottom:1px solid #d1d5db; padding:12px 16px 8px 16px; background:#f9fafb;">Histórico Profissional</div>`;
        if (sectionData.atividade_tipo && Array.isArray(sectionData.atividade_tipo) && sectionData.atividade_tipo.length > 0) {
          htmlContent += '<table style="width:calc(100% - 0px); margin:0; border:none; box-shadow:none;">';
          htmlContent += '<thead><tr>';
          htmlContent += '<th style="background:#f3f4f6; color:#1e3a8a; border:none;">Tipo de Atividade</th>';
          htmlContent += '<th style="background:#f3f4f6; color:#1e3a8a; border:none;">Status Contrib.</th>';
          htmlContent += '<th style="background:#f3f4f6; color:#1e3a8a; border:none;">Início</th>';
          htmlContent += '<th style="background:#f3f4f6; color:#1e3a8a; border:none;">Fim</th>';
          htmlContent += '<th style="background:#f3f4f6; color:#1e3a8a; border:none;">Detalhes/Local</th>';
          htmlContent += '</tr></thead><tbody>';
          sectionData.atividade_tipo.forEach((tipoAtividade, index) => {
            htmlContent += '<tr>';
            htmlContent += `<td style="border-top:1px solid #e5e7eb; border-bottom:none; border-left:1px solid #e5e7eb; border-right:1px solid #e5e7eb;">${formatValue(tipoAtividade)}</td>`;
            const statusValProf = sectionData.atividade_tag_status?.[index];
            let cellContentProf;
            if (statusValProf === null || statusValProf === undefined || String(statusValProf).trim() === '') {
              cellContentProf = formatValue(statusValProf);
            } else {
              cellContentProf = `<span class="data-tag">${formatValue(statusValProf)}</span>`;
            }
            htmlContent += `<td style="border-top:1px solid #e5e7eb; border-bottom:none; border-left:1px solid #e5e7eb; border-right:1px solid #e5e7eb;">${cellContentProf}</td>`;
            htmlContent += `<td style="border-top:1px solid #e5e7eb; border-bottom:none; border-left:1px solid #e5e7eb; border-right:1px solid #e5e7eb;">${formatValue(sectionData.atividade_periodo_inicio?.[index])}</td>`;
            htmlContent += `<td style="border-top:1px solid #e5e7eb; border-bottom:none; border-left:1px solid #e5e7eb; border-right:1px solid #e5e7eb;">${formatValue(sectionData.atividade_periodo_fim?.[index])}</td>`;
            htmlContent += `<td style="border-top:1px solid #e5e7eb; border-bottom:none; border-left:1px solid #e5e7eb; border-right:1px solid #e5e7eb;">${formatValue(sectionData.atividade_detalhes?.[index])}</td>`;
            htmlContent += '</tr>';
          });
          htmlContent += '</tbody></table>';
        }
        htmlContent += `</div>`;
        if (sectionData.observacoes && sectionData.observacoes.trim() !== '') {
          htmlContent += `<div class="item-block" style="background:#f9fafb; border:1px solid #d1d5db; margin-top:8px;"><strong style="color:#1e3a8a;">Observações profissionais:</strong> ${formatValue(sectionData.observacoes, { isHtml: true })}</div>`;
        }
      } else if (sectionKey === 'documents') {
        htmlContent += `<div class="item-block" style="border:1px solid #d1d5db; border-radius:4px; margin-bottom:0; padding:0; overflow:hidden;">`;
        htmlContent += `<div class="subsection-title" style="margin-bottom:8px; font-size:10.5pt; color:#374151; border-bottom:1px solid #d1d5db; padding:12px 16px 8px 16px; background:#f9fafb;">Documentos</div>`;
        if (sectionData.documentos && Array.isArray(sectionData.documentos) && sectionData.documentos.length > 0) {
          htmlContent += '<table style="width:calc(100% - 0px); margin:0; border:none; box-shadow:none;">';
          htmlContent += '<thead><tr>';
          htmlContent += '<th style="background:#f3f4f6; color:#1e3a8a; border:none;">Documento</th>';
          htmlContent += '<th style="background:#f3f4f6; color:#1e3a8a; border:none;">Status</th>';
          htmlContent += '<th style="background:#f3f4f6; color:#1e3a8a; border:none;">Ano</th>';
          htmlContent += '<th style="background:#f3f4f6; color:#1e3a8a; border:none;">Obs. Documento</th>';
          htmlContent += '</tr></thead><tbody>';
          sectionData.documentos.forEach(doc => {
            htmlContent += '<tr>';
            htmlContent += `<td style="border-top:1px solid #e5e7eb; border-bottom:none; border-left:1px solid #e5e7eb; border-right:1px solid #e5e7eb;">${formatValue(doc.nome)}</td>`;
            const statusValDoc = doc.status;
            let cellContentDoc;
            if (statusValDoc === null || statusValDoc === undefined || String(statusValDoc).trim() === '') {
              cellContentDoc = formatValue(statusValDoc);
            } else {
              cellContentDoc = `<span class="relationship-select" data-value="${statusValDoc}">${formatValue(statusValDoc)}</span>`;
            }
            htmlContent += `<td style="border-top:1px solid #e5e7eb; border-bottom:none; border-left:1px solid #e5e7eb; border-right:1px solid #e5e7eb; vertical-align:middle; text-align:center;">${cellContentDoc}</td>`;
            htmlContent += `<td style="border-top:1px solid #e5e7eb; border-bottom:none; border-left:1px solid #e5e7eb; border-right:1px solid #e5e7eb;">${formatValue(doc.ano)}</td>`;
            htmlContent += `<td style="border-top:1px solid #e5e7eb; border-bottom:none; border-left:1px solid #e5e7eb; border-right:1px solid #e5e7eb;">${formatValue(doc.detalhes, true)}</td>`;
            htmlContent += '</tr>';
          });
          htmlContent += '</tbody></table>';
        }
        htmlContent += `</div>`;
        if (sectionData.observacoes && sectionData.observacoes.trim() !== '') {
          htmlContent += `<div class="item-block" style="background:#f9fafb; border:1px solid #d1d5db; margin-top:8px;"><strong style="color:#1e3a8a;">Observações finais:</strong> ${formatValue(sectionData.observacoes, { isHtml: true })}</div>`;
        }
      }
      htmlContent += '</div>';
    }    // Adiciona o rodapé ao final do conteúdo da .page
    htmlContent += `<div class="page-footer">
                      <div>FIAP é um serviço de <a href="https://orbitas.com.br" target="_blank">orbitas.com.br</a> &copy; ${new Date().getFullYear()}</div>
                      <div>Relatório Gerado em: ${new Date().toLocaleString('pt-BR')}</div>
                    </div>`;

    htmlContent += '</div></body></html>'; // Fecha a .page e body/html

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
