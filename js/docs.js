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
            border: 1px solid #93c5fd; /* Borda azul clara para células internas */
            padding: 1.5mm 2mm;
            text-align: left;
            vertical-align: top;
            word-wrap: break-word;
          }
          table th {
            background-color: #2563eb; /* Fundo azul escuro para cabeçalhos (mantido) */
            font-weight: 600;
            color: #ffffff; /* Texto branco */
            font-size: 8.5pt;
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
      htmlContent += `<div class="section ${sectionKey}-section">`;
      htmlContent += `<div class="section-title">${sectionDisplayTitles[sectionKey]}</div>`;      if (sectionKey === 'personal') {
        htmlContent += `<div class="assistido-info-block">`;
          // Usa a tag referente como título, caso contrário, usa "Requerente" como padrão
        const tituloAssistido = sectionData.autor_relationship?.[0] || 'Requerente';
        htmlContent += `<div class="subsection-title">${formatValue(tituloAssistido)}</div>`;

        htmlContent += `<div class="field-group">`;

        let nomePrincipal = formatValue(sectionData.autor_nome?.[0]);
        const relacaoPrincipal = sectionData.autor_relationship?.[0];
        if (relacaoPrincipal && String(relacaoPrincipal).trim() !== '') {
          nomePrincipal += ` <span class="data-tag">${formatValue(relacaoPrincipal)}</span>`;
        }
        htmlContent += createFieldItem('Nome Completo', nomePrincipal, { isHtml: true });

        htmlContent += createFieldItem('CPF', sectionData.autor_cpf?.[0]);
        htmlContent += createFieldItem('Data de Nascimento', sectionData.autor_nascimento?.[0]);
        htmlContent += createFieldItem('Idade', sectionData.autor_idade?.[0]);
        htmlContent += createFieldItem('Apelido', sectionData.autor_apelido?.[0]);
        htmlContent += createFieldItem('Telefone Principal', sectionData.autor_telefone?.[0]);
        htmlContent += createFieldItem('Detalhes Telefone', sectionData.telefone_detalhes);
        htmlContent += createFieldItem('Senha MeuINSS', sectionData.autor_senha_meuinss?.[0]);
        htmlContent += createFieldItem('Atendimento Por', sectionData.colaborador);
        htmlContent += `</div></div>`;

        if (sectionData.autor_nome && Array.isArray(sectionData.autor_nome) && sectionData.autor_nome.length > 1) {
          sectionData.autor_nome.forEach((nome, index) => {
            if (index === 0) return;
            htmlContent += `<div class="item-block author-block">`;
            const relation = sectionData.autor_relationship?.[index] || '';
            let authorTitle = `Dependente/Envolvido ${index}`;
            if (relation) authorTitle = `${relation}`;

            htmlContent += `<div class="subsection-title">${authorTitle}</div>`;
            htmlContent += `<div class="field-group">`;
            htmlContent += createFieldItem('Nome Completo', nome);
            htmlContent += createFieldItem('CPF', sectionData.autor_cpf?.[index]);
            htmlContent += createFieldItem('Data de Nascimento', sectionData.autor_nascimento?.[index]);
            htmlContent += createFieldItem('Idade', sectionData.autor_idade?.[index]);
            htmlContent += `</div></div>`;
          });
        }        htmlContent += `<div class="subsection-title">Endereço do Assistido</div>`;

        // Organização em duas colunas para o endereço para melhor visualização
        htmlContent += `<div class="field-group" style="grid-template-columns: 1fr 1fr; gap: 3mm 5mm;">`;

        // Primeira coluna de endereço
        htmlContent += `<div style="display: flex; flex-direction: column; gap: 2mm;">`;
        htmlContent += createFieldItem('CEP', sectionData.cep);
        htmlContent += createFieldItem('Endereço', sectionData.endereco);
        htmlContent += createFieldItem('Número', sectionData.numero);
        htmlContent += createFieldItem('Complemento', sectionData.complemento);
        htmlContent += `</div>`;

        // Segunda coluna de endereço
        htmlContent += `<div style="display: flex; flex-direction: column; gap: 2mm;">`;
        htmlContent += createFieldItem('Bairro', sectionData.bairro);
        htmlContent += createFieldItem('Cidade', sectionData.cidade);
        htmlContent += createFieldItem('UF', sectionData.uf);
        htmlContent += createFieldItem('País', sectionData.pais || 'Brasil');
        htmlContent += `</div>`;

        // Ponto de referência em linha inteira abaixo
        htmlContent += createFieldItem('Ponto de Referência', sectionData.referencia, { fullWidth: true });

        htmlContent += `</div>`;if(sectionData.observacoes && sectionKey === 'personal'){
            htmlContent += `<div class="subsection-title">Observações pessoais: ${formatValue(sectionData.observacoes, { isHtml: true })}</div>`;
        }

      } else if (sectionKey === 'social') {
        htmlContent += `<div class="field-group">`;
        htmlContent += createFieldItem('Renda Total Familiar (Declarada)', sectionData.renda_total_familiar, { isHtml: true });
        htmlContent += createFieldItem('Renda Per Capita Familiar (Declarada)', sectionData.renda_per_capita, { isHtml: true });
        htmlContent += `</div>`;

        if (sectionData.familiar_nome && Array.isArray(sectionData.familiar_nome) && sectionData.familiar_nome.length > 0) {
          htmlContent += `<div class="subsection-title">Composição Familiar e Renda Detalhada</div>`;
          htmlContent += '<table><thead><tr><th>Nome</th><th>Parentesco</th><th>CPF</th><th>Idade</th><th>Estado Civil</th><th>Renda (R$)</th><th>CadÚnico?</th></tr></thead><tbody>';
          sectionData.familiar_nome.forEach((nome, index) => {
            htmlContent += '<tr>';
            htmlContent += `<td>${formatValue(nome)}</td>`;
            htmlContent += `<td>${formatValue(sectionData.familiar_parentesco?.[index])}</td>`;
            htmlContent += `<td>${formatValue(sectionData.familiar_cpf?.[index])}</td>`;
            htmlContent += `<td>${formatValue(sectionData.familiar_idade?.[index])}</td>`;
            htmlContent += `<td>${formatValue(sectionData.familiar_estado_civil?.[index])}</td>`;
            htmlContent += `<td>${formatValue(sectionData.familiar_renda?.[index])}</td>`;
            htmlContent += `<td>${formatValue(sectionData.familiar_cadunico?.[index])}</td>`;
            htmlContent += '</tr>';
          });
          htmlContent += '</tbody></table>';
        }        if(sectionData.observacoes){
            htmlContent += `<div class="subsection-title">Observações sociais: ${formatValue(sectionData.observacoes, { isHtml: true })}</div>`;
        }

      } else if (sectionKey === 'incapacity') {        // Subseção: Situação Laboral e Condições de Saúde - completamente reorganizada
        htmlContent += `<div class="subsection-title">Situação Laboral e Condições de Saúde</div>`;

        // Grid de 2x2 para melhor organização visual
        htmlContent += `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 3mm 5mm; margin-bottom: 3mm;">`;

        // Formatação especial para valores como "menos_1_mes" -> "Menos de 1 mês"
        const formatarPeriodo = (valor) => {
          if (!valor) return formatValue(valor);
          if (valor === 'menos_1_mes') return 'Menos de 1 mês';
          if (valor === 'menos_6_meses') return 'Menos de 6 meses';
          if (valor === 'menos_1_ano') return 'Menos de 1 ano';
          if (valor === 'mais_1_ano') return 'Mais de 1 ano';
          return formatValue(valor);
        };

        // Trabalhando atualmente
        htmlContent += `<div style="padding: 2mm; background-color: #f8fafc; border-radius: 3px; border: 1px solid #e2e8f0;">
          <strong style="color: #1e3a8a; font-size: 9pt; display: block; margin-bottom: 1mm;">Trabalha Atualmente?</strong>
          <span style="font-size: 10pt;">${formatValue(sectionData.trabalhaAtualmente)}</span>
        </div>`;

        // Último trabalho
        htmlContent += `<div style="padding: 2mm; background-color: #f8fafc; border-radius: 3px; border: 1px solid #e2e8f0;">
          <strong style="color: #1e3a8a; font-size: 9pt; display: block; margin-bottom: 1mm;">Último Trabalho (Período)</strong>
          <span style="font-size: 10pt;">${formatarPeriodo(sectionData.ultimoTrabalho)}</span>
        </div>`;

        // Limitações diárias
        htmlContent += `<div style="padding: 2mm; background-color: #f8fafc; border-radius: 3px; border: 1px solid #e2e8f0;">
          <strong style="color: #1e3a8a; font-size: 9pt; display: block; margin-bottom: 1mm;">Limitações Diárias</strong>
          <span style="font-size: 10pt;">${formatValue(sectionData.limitacoesDiarias)}</span>
        </div>`;

        // Tratamentos e medicamentos
        htmlContent += `<div style="padding: 2mm; background-color: #f8fafc; border-radius: 3px; border: 1px solid #e2e8f0;">
          <strong style="color: #1e3a8a; font-size: 9pt; display: block; margin-bottom: 1mm;">Tratamentos Realizados</strong>
          <span style="font-size: 10pt;">${formatValue(sectionData.tratamentosRealizados)}</span>
        </div>`;

        // Medicamentos em linha inteira
        htmlContent += `<div style="grid-column: 1 / -1; padding: 2mm; background-color: #f8fafc; border-radius: 3px; border: 1px solid #e2e8f0;">
          <strong style="color: #1e3a8a; font-size: 9pt; display: block; margin-bottom: 1mm;">Medicamentos Atuais</strong>
          <span style="font-size: 10pt;">${formatValue(sectionData.medicamentosAtuais)}</span>
        </div>`;

        htmlContent += `</div>`;

        // Subseção: Documentos e Detalhes da Incapacidade (Tabela)
        if (sectionData.tipoDocumentos && Array.isArray(sectionData.tipoDocumentos) && sectionData.tipoDocumentos.length > 0 && sectionData.tipoDocumentos.some(doc => doc && doc.trim() !== '')) {
          htmlContent += `<div class="subsection-title">Documentos Comprobatórios e Detalhes da Incapacidade</div>`;
          htmlContent += '<table><thead><tr><th>Tipo Documento</th><th>Doença/Condição (Conforme Documento)</th><th>CID</th><th>Data do Documento</th></tr></thead><tbody>';
          sectionData.tipoDocumentos.forEach((tipoDoc, index) => {
            if (tipoDoc && tipoDoc.trim() !== '') { // Garante que só adiciona linhas com tipo de documento preenchido
              htmlContent += '<tr>';
              htmlContent += `<td>${formatValue(tipoDoc)}</td>`;
              htmlContent += `<td>${formatValue(sectionData.doencas?.[index])}</td>`;
              htmlContent += `<td>${formatValue(sectionData.cids?.[index])}</td>`;
              htmlContent += `<td>${formatValue(sectionData.dataDocumentos?.[index])}</td>`;
              htmlContent += '</tr>';
            }
          });
          htmlContent += '</tbody></table>';
        }        // Subseção: Observações Adicionais
        if (sectionData.observacoes && sectionData.observacoes.trim() !== '') {
            htmlContent += `<div class="subsection-title">Observações de saúde: ${formatValue(sectionData.observacoes, { isHtml: true })}</div>`;
        }

      } else if (sectionKey === 'professional') {
        if (sectionData.atividade_tipo && Array.isArray(sectionData.atividade_tipo) && sectionData.atividade_tipo.length > 0) {
          htmlContent += `<div class="subsection-title">Histórico de Atividades/Vínculos</div>`;
          htmlContent += '<table><thead><tr><th>Tipo de Atividade</th><th>Status Contrib.</th><th>Início</th><th>Fim</th><th>Detalhes/Local</th></tr></thead><tbody>';
          sectionData.atividade_tipo.forEach((tipoAtividade, index) => {
            htmlContent += '<tr>';
            htmlContent += `<td>${formatValue(tipoAtividade)}</td>`;

            const statusValProf = sectionData.atividade_tag_status?.[index];
            let cellContentProf;
            if (statusValProf === null || statusValProf === undefined || String(statusValProf).trim() === '') {
              cellContentProf = formatValue(statusValProf);
            } else {
              cellContentProf = `<span class="data-tag">${formatValue(statusValProf)}</span>`;
            }
            htmlContent += `<td>${cellContentProf}</td>`;

            htmlContent += `<td>${formatValue(sectionData.atividade_periodo_inicio?.[index])}</td>`;
            htmlContent += `<td>${formatValue(sectionData.atividade_periodo_fim?.[index])}</td>`;
            htmlContent += `<td>${formatValue(sectionData.atividade_detalhes?.[index])}</td>`;
            htmlContent += '</tr>';
          });
          htmlContent += '</tbody></table>';
        }        if(sectionData.observacoes){
            htmlContent += `<div class="subsection-title">Observações profissionais: ${formatValue(sectionData.observacoes, { isHtml: true })}</div>`;
        }

      } else if (sectionKey === 'documents') {
        if (sectionData.documentos && Array.isArray(sectionData.documentos) && sectionData.documentos.length > 0) {
          htmlContent += `<div class="subsection-title">Documentos Apresentados/Solicitados</div>`;
          htmlContent += '<table><thead><tr><th>Documento</th><th>Status</th><th>Ano</th><th>Obs. Documento</th></tr></thead><tbody>';
          sectionData.documentos.forEach(doc => {
            htmlContent += '<tr>';
            htmlContent += `<td>${formatValue(doc.nome)}</td>`;

            const statusValDoc = doc.status;
            let cellContentDoc;
            if (statusValDoc === null || statusValDoc === undefined || String(statusValDoc).trim() === '') {
              cellContentDoc = formatValue(statusValDoc);
            } else {
              cellContentDoc = `<span class="data-tag">${formatValue(statusValDoc)}</span>`;
            }
            htmlContent += `<td>${cellContentDoc}</td>`;

            htmlContent += `<td>${formatValue(doc.ano)}</td>`;
            htmlContent += `<td>${formatValue(doc.detalhes, true)}</td>`;
            htmlContent += '</tr>';
          });
          htmlContent += '</tbody></table>';
        }        if(sectionData.observacoes){
            htmlContent += `<div class="subsection-title">Observações finais: ${formatValue(sectionData.observacoes, { isHtml: true })}</div>`;
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
