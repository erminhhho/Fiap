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
            background-color: #fff;
            color: #1f2937; /* Cinza escuro para texto principal */
            font-size: 8.5pt;
            line-height: 1.45;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          .page {
            width: 210mm;
            min-height: 290mm; /* Levemente reduzido para dar espaço ao rodapé dentro do A4 */
            padding: 10mm; /* Margem mais convencional */
            margin: 0 auto 10mm auto; /* Margem inferior para separação entre páginas simuladas ou antes do rodapé final */
            box-sizing: border-box;
            page-break-after: always;
            position: relative; /* Para posicionar o rodapé da página */
          }
          .page:last-of-type {
            page-break-after: avoid;
            margin-bottom: 0; /* Sem margem inferior na última página */
          }

          /* Cabeçalho do Relatório */
          .report-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 6mm;
            padding-bottom: 3mm;
            border-bottom: 1px solid #e5e7eb; /* Linha sutil */
          }
          .report-header-left .logo-text {
            font-size: 16pt; /* Reduzido para não ser tão dominante */
            font-weight: 700;
            color: #111827; /* Preto/Cinza muito escuro */
            margin: 0 0 0.5mm 0;
          }
          .report-header-left .logo-subtext {
            font-size: 8pt;
            color: #6b7280; /* Cinza médio */
            margin: 0;
          }
          .report-header-right .generation-date {
            font-size: 7.5pt;
            color: #9ca3af; /* Cinza claro */
            text-align: right;
          }

          /* Título Principal do Relatório */
          .report-main-title {
            font-size: 13pt;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 6mm;
            text-align: left;
          }

          /* Dados Pessoais do Assistido - Bloco Destacado */
          .assistido-info-block {
            background-color: #f9fafb; /* Fundo muito leve */
            padding: 3mm;
            border-radius: 3px;
            margin-bottom: 5mm;
            border: 1px solid #e5e7eb;
          }
          .assistido-info-block .subsection-title {
            margin-top: 0; /* Remover margem de cima do subtitulo dentro do bloco */
            margin-bottom: 2mm; /* Ajustar margem inferior */
            font-size: 10pt; /* Tamanho do subtitulo no bloco */
            color: #374151; /* Cor do subtitulo no bloco */
            padding-bottom: 1mm;
            border-bottom: 1px solid #d1d5db;
          }

          /* Estilos de Seção */
          .section {
            margin-bottom: 5mm;
            padding-top: 3mm;
          }
          .section-title {
            font-size: 11.5pt; /* Levemente ajustado */
            font-weight: 600;
            color: #2c3e50; /* Azul acinzentado escuro */
            margin-bottom: 3mm;
            padding-bottom: 1.5mm;
            border-bottom: 1.5px solid #3b4b5a; /* Borda mais escura e um pouco mais grossa */
          }

          /* Grupos de Campos e Campos Individuais */
          .field-group {
            margin-bottom: 2mm;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); /* Ajuste minmax */
            gap: 2mm 3mm;
            page-break-inside: avoid;
          }
          .field-item {
            padding: 1mm 0;
            word-wrap: break-word;
            line-height: 1.35;
          }
          .field-item strong { /* Rótulo do Campo */
            display: block;
            font-weight: 500; /* Medium */
            color: #4b5563; /* Cinza escuro */
            font-size: 7.5pt;
            margin-bottom: 0.3mm;
            text-transform: none;
          }
          .field-item span, .field-item div { /* Valor do Campo */
            color: #1f2937;
            font-size: 8.5pt;
          }
          .field-item.full-width {
            grid-column: 1 / -1;
          }
          .empty-value {
            color: #6b7280; /* Cinza médio */
            font-style: italic;
          }

          /* Subtítulos dentro de seções (fora de blocos especiais) */
          .subsection-title {
            font-size: 9.5pt;
            font-weight: 500;
            color: #374151; /* Cinza mais escuro */
            margin-top: 4mm;
            margin-bottom: 2mm;
            padding-bottom: 1mm;
            border-bottom: 1px dotted #d1d5db; /* Linha pontilhada sutil */
          }

          /* Tabelas */
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 3mm;
            font-size: 8pt;
            page-break-inside: auto;
          }
          table th,
          table td {
            border: 1px solid #e5e7eb; /* Borda cinza clara */
            padding: 1.2mm 1.8mm;
            text-align: left;
            vertical-align: top;
            word-wrap: break-word;
          }
          table th {
            background-color: #f3f4f6; /* Cinza bem claro para cabeçalhos */
            font-weight: 600; /* Semibold */
            color: #1f2937; /* Texto escuro */
            font-size: 7.8pt;
          }
          table tr:nth-child(even) td {
            background-color: #f9fafb; /* Zebrado muito sutil */
          }

          /* Estilo para Tags */
          .data-tag {
            display: inline-block;
            padding: 0.2em 0.55em;
            font-size: 0.8em;
            font-weight: 500;
            line-height: 1.15;
            color: #374151; /* Texto da tag cinza escuro */
            background-color: #e5e7eb; /* Fundo da tag cinza claro */
            border-radius: 3px;
            text-transform: uppercase;
          }

          /* Blocos de Itens (Autores adicionais, etc.) */
          .item-block {
            border: 1px solid #e5e7eb;
            border-radius: 3px;
            padding: 2.5mm;
            margin-bottom: 3mm;
            background-color: #fff;
            page-break-inside: avoid;
          }
          .item-block .subsection-title {
            margin-top: 0;
            padding-bottom: 1mm;
            border-bottom: 1px solid #e5e7eb; /* Linha sutil dentro do bloco */
            font-size: 9pt; /* Ajuste para subtitulo em item-block */
          }

          /* Rodapé da Página HTML (simulado) */
          .page-footer {
            position: absolute; /* Para fixar no final da .page se ela tiver altura definida */
            bottom: 3mm; /* Distância da base da .page */
            left: 10mm;
            right: 10mm;
            width: calc(100% - 20mm); /* Subtrai os paddings laterais da .page */
            font-size: 7pt;
            color: #6b7280;
            display: flex;
            justify-content: space-between;
            border-top: 1px solid #e5e7eb;
            padding-top: 1.5mm;
          }

          /* Utilitários de impressão */
          @media print {
            body {
              font-size: 8pt;
              background-color: #fff !important;
              color: #000 !important;
            }
            .page {
              padding: 10mm; /* Manter margens */
              margin-bottom: 0; /* Remover margem entre paginas na impressão */
              border: none;
              min-height: initial; /* Deixar o navegador controlar a altura da página */
            }
            .report-header .logo-text,
            .report-header-left .logo-text,
            .report-main-title,
            .section-title,
            .subsection-title,
            .field-item strong,
            table th {
              color: #000 !important;
            }
            .data-tag {
              background-color: #f0f0f0 !important;
              color: #000 !important;
              border: 1px solid #ccc !important;
            }
            .assistido-info-block,
            .item-block {
              border: 1px solid #ccc !important;
              background-color: #f9f9f9 !important;
            }
            table th {
              background-color: #f0f0f0 !important;
            }
            table tr:nth-child(even) td {
              background-color: #f8f8f8 !important; /* Zebrado mais claro para impressão */
            }
            .page-footer {
              color: #333 !important;
              border-top: 1px solid #ccc !important;
              /* O posicionamento absoluto pode não funcionar bem em todas as impressões;
                 o navegador geralmente adiciona seus próprios cabeçalhos/rodapés.
                 Este rodapé HTML é mais para a visualização em tela. */
            }
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="report-header">
            <div class="report-header-left">
              <div class="logo-text">FIAP</div>
              <div class="logo-subtext">Ficha Inteligente de Atendimento Previdenciário</div>
            </div>
            <div class="report-header-right">
              <div class="generation-date">Relatório Gerado em: ${new Date().toLocaleString('pt-BR')}</div>
            </div>
          </div>
          <div class="report-main-title">Relatório Consolidado de Atendimento</div>
    `;

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

    let headerAdded = false;

    for (const sectionKey of sectionOrder) {
      if (!todasAsPaginas[sectionKey]) {
        console.warn(`[Relatório PDF] Seção ${sectionKey} não encontrada nos dados do formulário.`);
        continue;
      }
      const sectionData = todasAsPaginas[sectionKey];
      htmlContent += `<div class="section ${sectionKey}-section">`;
      htmlContent += `<div class="section-title">${sectionDisplayTitles[sectionKey]}</div>`;

      if (sectionKey === 'personal') {
        if (!headerAdded) {
          const headerHtml = `
<div class="report-header"> <div class="report-header-left"> <div class="logo-text">FIAP</div> <div class="logo-subtext">Ficha Inteligente de Atendimento Previdenciário</div> </div> <div class="report-header-right"> <div class="generation-date">Relatório Gerado em: ${new Date().toLocaleString('pt-BR')}</div> </div> </div> <div class="report-main-title">Relatório Consolidado de Atendimento</div>`;
          htmlContent = htmlContent.replace('<div class="page">', `<div class="page">${headerHtml}`);
          headerAdded = true;
        }

        htmlContent += `<div class="assistido-info-block">`;
        htmlContent += `<div class="subsection-title">Informações do Assistido Principal</div>`;
        htmlContent += `<div class="field-group">`;
        htmlContent += createFieldItem('Nome Completo', sectionData.autor_nome?.[0]);
        htmlContent += createFieldItem('CPF', sectionData.autor_cpf?.[0]);
        htmlContent += createFieldItem('Data de Nascimento', sectionData.autor_nascimento?.[0]);
        htmlContent += createFieldItem('Idade', sectionData.autor_idade?.[0]);
        htmlContent += createFieldItem('Apelido', sectionData.autor_apelido?.[0]);
        htmlContent += createFieldItem('Telefone Principal', sectionData.autor_telefone?.[0]);
        htmlContent += createFieldItem('Detalhes Telefone', sectionData.telefone_detalhes);
        htmlContent += createFieldItem('Senha MeuINSS', sectionData.autor_senha_meuinss?.[0]);
        htmlContent += createFieldItem('Atendimento Por', sectionData.colaborador);
        const dataPreenchimento = sectionData._formTimestamp ? new Date(sectionData._formTimestamp).toLocaleString('pt-BR') : (sectionData._timestamp ? new Date(sectionData._timestamp).toLocaleString('pt-BR') : 'N/A');
        htmlContent += createFieldItem('Data do Atendimento', dataPreenchimento);
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
        }
        htmlContent += `<div class="subsection-title">Endereço do Assistido</div>`;
        htmlContent += `<div class="field-group">`;
        htmlContent += createFieldItem('CEP', sectionData.cep);
        htmlContent += createFieldItem('Endereço', sectionData.endereco, { fullWidth: true });
        htmlContent += createFieldItem('Número', sectionData.numero);
        htmlContent += createFieldItem('Complemento', sectionData.complemento);
        htmlContent += createFieldItem('Bairro', sectionData.bairro);
        htmlContent += createFieldItem('Cidade', sectionData.cidade);
        htmlContent += createFieldItem('UF', sectionData.uf);
        htmlContent += createFieldItem('País', sectionData.pais || 'Brasil');
        htmlContent += createFieldItem('Ponto de Referência', sectionData.referencia, { fullWidth: true });
        htmlContent += `</div>`;
        if(sectionData.observacoes && sectionKey === 'personal'){
            htmlContent += `<div class="subsection-title">Observações Pessoais</div>`;
            htmlContent += `<div class="field-group">`;
            htmlContent += createFieldItem('', sectionData.observacoes, { fullWidth: true });
            htmlContent += `</div>`;
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
        }
        if(sectionData.observacoes){
            htmlContent += `<div class="subsection-title">Observações do Perfil Social</div>`;
            htmlContent += `<div class="field-group">`;
            htmlContent += createFieldItem('', sectionData.observacoes, { fullWidth: true });
            htmlContent += `</div>`;
        }

      } else if (sectionKey === 'incapacity') {
        htmlContent += `<div class="field-group">`;
        htmlContent += createFieldItem('Trabalha Atualmente?', sectionData.trabalhaAtualmente);
        htmlContent += createFieldItem('Último Trabalho (Período)', sectionData.ultimoTrabalho);
        htmlContent += createFieldItem('Limitações Diárias (Descrição)', sectionData.limitacoesDiarias, { fullWidth: true });
        htmlContent += createFieldItem('Tratamentos Realizados', sectionData.tratamentosRealizados, { fullWidth: true });
        htmlContent += createFieldItem('Medicamentos Atuais', sectionData.medicamentosAtuais, { fullWidth: true });
        htmlContent += `</div>`;

        if (sectionData.tipoDocumentos && Array.isArray(sectionData.tipoDocumentos) && sectionData.tipoDocumentos.length > 0) {
          htmlContent += `<div class="subsection-title">Documentos e Detalhes da Incapacidade</div>`;
          htmlContent += '<table><thead><tr><th>Tipo Documento</th><th>Doença/Condição</th><th>CID</th><th>Data Documento</th></tr></thead><tbody>';
          sectionData.tipoDocumentos.forEach((tipoDoc, index) => {
            htmlContent += '<tr>';
            htmlContent += `<td>${formatValue(tipoDoc)}</td>`;
            htmlContent += `<td>${formatValue(sectionData.doencas?.[index])}</td>`;
            htmlContent += `<td>${formatValue(sectionData.cids?.[index])}</td>`;
            htmlContent += `<td>${formatValue(sectionData.dataDocumentos?.[index])}</td>`;
            htmlContent += '</tr>';
          });
          htmlContent += '</tbody></table>';
        }
        if(sectionData.observacoes){
            htmlContent += `<div class="subsection-title">Observações Adicionais sobre Incapacidade</div>`;
            htmlContent += `<div class="field-group">`;
            htmlContent += createFieldItem('', sectionData.observacoes, { fullWidth: true });
            htmlContent += `</div>`;
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
        }
        if(sectionData.observacoes){
            htmlContent += `<div class="subsection-title">Outras Observações Profissionais</div>`;
            htmlContent += `<div class="field-group">`;
            htmlContent += createFieldItem('', sectionData.observacoes, { fullWidth: true });
            htmlContent += `</div>`;
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
        }
        if(sectionData.observacoes){
            htmlContent += `<div class="subsection-title">Observações Finais da Ficha</div>`;
            htmlContent += `<div class="field-group">`;
            htmlContent += createFieldItem('', sectionData.observacoes, { fullWidth: true });
            htmlContent += `</div>`;
        }
      }
      htmlContent += '</div>';
    }

    htmlContent += `<div class="page-footer"> <div>Relatório gerado por FIAP &copy; ${new Date().getFullYear()}</div> <div>Página <span class="page-number"></span></div> </div>`;

    htmlContent += '</div></body></html>';

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
