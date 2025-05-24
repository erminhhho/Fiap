/**
 * Módulo de Documentos
 */

// Limpar função de inicialização anterior
window.initModule = null;

// Banco de dados de documentos pré-cadastrados (em memória)
// Verificar se os documentos já estão definidos para evitar redeclaração
if (typeof documentosPreCadastrados === 'undefined') {
  const documentosPreCadastrados = [
    {
      id: 1,
      nome: "Declaração de Exercício de Atividade Rural",
      tipo: "declaracao",
      descricao: "Documento emitido pelo sindicato rural que comprova atividade rural. Deve constar período, forma de exploração e qualificação do agricultor.",
      palavrasChave: "rural, sindicato, atividade rural, segurado especial, declaração",
      detalhes: "<strong>Prova robusta</strong> para comprovar atividade rural. Contém dados essenciais como período trabalhado, forma de exploração e qualificação do trabalhador rural. <em>Considerada uma das principais provas aceitas pelo INSS para aposentadoria rural</em>."
    },
    {
      id: 2,
      nome: "Certidão de Nascimento com Profissão Rural",
      tipo: "certidao",
      descricao: "Certidão onde consta profissão rural dos pais, considerada início de prova material para comprovação de atividade rural desde a infância.",
      palavrasChave: "rural, nascimento, profissão, certidão, segurado especial, início de prova material",
      detalhes: "Serve como <em>início de prova material</em>. A qualificação dos pais como trabalhadores rurais permite estabelecer que o segurado esteve em ambiente rural desde o nascimento, <strong>fortalecendo o conjunto probatório</strong>."
    },
    {
      id: 3,
      nome: "Contrato de Parceria Rural",
      tipo: "contrato",
      descricao: "Contrato entre proprietário e trabalhador rural definindo condições de trabalho e repartição de resultados. Deve ser contemporâneo ao período trabalhado.",
      palavrasChave: "contrato, parceria, rural, segurado especial, arrendamento",
      detalhes: "<strong>Prova contundente</strong> que formaliza a relação de trabalho rural. Contém detalhes como período do acordo, atividades exercidas e forma de remuneração. <em>Muito valorizado nas análises previdenciárias</em> por demonstrar vínculo formal."
    },
    {
      id: 4,
      nome: "Contrato de Arrendamento Rural",
      tipo: "contrato",
      descricao: "Contrato onde o proprietário cede o imóvel rural para exploração mediante pagamento. Comprova atividade rural do arrendatário.",
      palavrasChave: "arrendamento, contrato, rural, segurado especial, exploração",
      detalhes: "<strong>Evidência consistente</strong> da exploração de imóvel rural. Demonstra a condição de arrendatário e o período de exploração da terra, <em>comprovando efetivamente</em> a atividade rural junto ao INSS."
    },
    {
      id: 5,
      nome: "Bloco de Notas do Produtor Rural",
      tipo: "nota",
      descricao: "Documento fiscal que comprova comercialização de produtos rurais. Serve como forte prova de atividade rural continuada.",
      palavrasChave: "notas, produtor, rural, comercialização, segurado especial, prova material",
      detalhes: "<strong>Uma das provas mais valorizadas</strong> para comprovar atividade rural. A comercialização de produtos rurais documentada nas notas demonstra <em>efetiva produção e regularidade</em>, sendo muito bem aceita pela Previdência Social."
    },
    {
      id: 6,
      nome: "Ficha de Matrícula Escolar Rural",
      tipo: "ficha",
      descricao: "Documento escolar que indica residência em zona rural. Considerado início de prova material quando indica profissão dos pais como agricultores.",
      palavrasChave: "escola, rural, matrícula, residência, segurado especial, filho",
      detalhes: "Funciona como <em>prova auxiliar</em>. Indica a residência em zona rural e, quando menciona a profissão dos pais, estabelece um vínculo com a atividade rural desde a infância, <strong>complementando</strong> outras provas mais substanciais."
    },
    {
      id: 7,
      nome: "Certidão de Casamento com Profissão Rural",
      tipo: "certidao",
      descricao: "Certidão onde consta profissão rural dos cônjuges, válida como início de prova material desde a data do casamento.",
      palavrasChave: "casamento, rural, certidão, cônjuge, segurado especial, início de prova material",
      detalhes: "Serve como <strong>marco temporal importante</strong>. A qualificação de um ou ambos os cônjuges como trabalhadores rurais estabelece um ponto de partida para a comprovação de atividade rural desde a data do casamento."
    },
    {
      id: 8,
      nome: "Certificado de Cadastro de Imóvel Rural (CCIR)",
      tipo: "cadastro",
      descricao: "Documento do INCRA que comprova regularidade do imóvel rural. Útil para comprovar vínculo com propriedade rural.",
      palavrasChave: "CCIR, INCRA, propriedade, cadastro, rural, segurado especial",
      detalhes: "Comprova a <em>regularidade de imóvel rural</em> junto ao INCRA. Estabelece vínculo formal com a propriedade rural, mas <strong>necessita de complementação</strong> com provas que demonstrem a efetiva exploração da terra pelo segurado."
    },
    {
      id: 9,
      nome: "Declaração de Aptidão ao PRONAF (DAP)",
      tipo: "declaracao",
      descricao: "Documento que identifica agricultores familiares para acesso a políticas públicas. Forte prova de atividade rural.",
      palavrasChave: "DAP, PRONAF, agricultura familiar, segurado especial, rural",
      detalhes: "<strong>Reconhecimento oficial</strong> da condição de agricultor familiar. Permite acesso a políticas públicas e programas governamentais, sendo <em>considerada prova substancial</em> de atividade rural pela Previdência Social."
    },
    {
      id: 10,
      nome: "ITR - Imposto Territorial Rural",
      tipo: "cadastro",
      descricao: "Comprovante de pagamento de imposto rural. Comprova propriedade ou posse de imóvel rural.",
      palavrasChave: "ITR, imposto, rural, propriedade, segurado especial, fiscal",
      detalhes: "Comprova a propriedade ou posse de imóvel rural. O pagamento regular deste imposto indica <strong>manutenção de vínculo com a terra</strong>, mas geralmente <em>precisa ser complementado</em> com outras provas que demonstrem a efetiva exploração rural."
    },
    {
      id: 11,
      nome: "CNIS - Cadastro Nacional de Informações Sociais",
      tipo: "cadastro",
      descricao: "Documento que mostra vínculos de trabalho e contribuições. Útil para verificar ausência de outros vínculos urbanos.",
      palavrasChave: "CNIS, contribuições, INSS, vínculos, segurado especial",
      detalhes: "<strong>Documento essencial</strong> que mostra o histórico de vínculos e contribuições. Embora não comprove atividade rural diretamente, é <em>fundamental para verificar</em> a ausência de vínculos urbanos que poderiam descaracterizar a condição de segurado especial."
    },
    {
      id: 12,
      nome: "Carteira de Associado ao Sindicato Rural",
      tipo: "cadastro",
      descricao: "Comprova filiação a sindicato rural. Considerado início de prova material desde a data de filiação.",
      palavrasChave: "sindicato, carteira, associado, rural, segurado especial",
      detalhes: "Demonstra <strong>vínculo formal com categoria rural</strong>. A filiação ao sindicato rural estabelece um marco temporal para início da comprovação da atividade, <em>fortalecendo</em> outras provas materiais."
    },
    {
      id: 13,
      nome: "Ficha de Cadastro no Posto de Saúde Rural",
      tipo: "ficha",
      descricao: "Documento médico que indica residência em zona rural. Pode indicar profissão como agricultor.",
      palavrasChave: "saúde, rural, ficha, residência, médico, segurado especial",
      detalhes: "Serve como <em>prova auxiliar</em>. Demonstra residência em zona rural e, quando indica a profissão como agricultor, ajuda a estabelecer vínculo com atividade rural, <strong>complementando</strong> provas mais consistentes."
    },
    {
      id: 14,
      nome: "Certidão da Justiça Eleitoral",
      tipo: "certidao",
      descricao: "Documento que pode indicar zona eleitoral rural e profissão do eleitor como agricultor.",
      palavrasChave: "eleitoral, certidão, zona, rural, segurado especial",
      detalhes: "Funciona como <em>prova complementar</em>. A indicação de zona eleitoral rural e a qualificação como agricultor ajudam a compor o conjunto probatório, tendo maior relevância <strong>quando combinada</strong> com outras provas."
    },
    {
      id: 15,
      nome: "Escritura Pública de Imóvel Rural",
      tipo: "inscricao",
      descricao: "Documento que comprova propriedade de imóvel rural. Forte prova de vínculo com atividade rural.",
      palavrasChave: "escritura, imóvel, rural, propriedade, segurado especial",
      detalhes: "<strong>Prova substancial</strong> que comprova a propriedade de imóvel rural. Estabelece vínculo formal e duradouro com a terra, sendo <em>evidência consistente</em> para demonstrar condição de produtor rural proprietário."
    },
    {
      id: 16,
      nome: "Comprovante de Cadastro no INCRA",
      tipo: "cadastro",
      descricao: "Documento que comprova registro de propriedade rural no INCRA. Útil para comprovar atividade rural.",
      palavrasChave: "INCRA, cadastro, rural, propriedade, segurado especial",
      detalhes: "Comprova <em>regularização junto ao INCRA</em>. Demonstra o registro oficial da propriedade rural, mas necessita de <strong>complementação</strong> com outras provas que demonstrem a efetiva exploração da terra."
    },
    {
      id: 17,
      nome: "Comprovante de Recebimento de Crédito Rural",
      tipo: "inscricao",
      descricao: "Documento bancário que prova financiamento para atividade rural. Demonstra investimento em produção rural.",
      palavrasChave: "crédito, financiamento, rural, banco, segurado especial, PRONAF",
      detalhes: "<strong>Evidência significativa</strong> de investimento na atividade rural. O acesso a crédito específico para produção rural demonstra intenção e capacidade de exploração econômica da terra, sendo <em>forte indicativo</em> de atividade rural efetiva."
    },
    {
      id: 18,
      nome: "Declaração de Associação de Moradores Rural",
      tipo: "declaracao",
      descricao: "Documento emitido por associação de moradores atestando residência e atividade rural.",
      palavrasChave: "associação, moradores, rural, declaração, segurado especial",
      detalhes: "Funciona como <strong>testemunho coletivo</strong>. A declaração de uma associação local atesta tanto a residência rural quanto a atividade exercida, tendo valor por <em>representar o reconhecimento</em> da comunidade local."
    },
    {
      id: 19,
      nome: "Registro de Imóvel Rural",
      tipo: "inscricao",
      descricao: "Documento cartorial que comprova propriedade de imóvel rural. Prova material forte para vínculo com terra.",
      palavrasChave: "registro, imóvel, cartório, rural, segurado especial, propriedade",
      detalhes: "<strong>Prova contundente</strong> com fé pública. O registro cartorial é evidência definitiva de propriedade, estabelecendo <em>marco temporal preciso</em> da aquisição do imóvel rural pelo segurado."
    },
    {
      id: 20,
      nome: "Receituário Agronômico",
      tipo: "outro",
      descricao: "Documento com prescrição de defensivos agrícolas. Evidencia atividade produtiva rural.",
      palavrasChave: "receituário, agrônomo, defensivos, rural, segurado especial, produção",
      detalhes: "Demonstra <strong>atividade produtiva específica</strong>. A utilização de defensivos agrícolas prescritos por profissional indica cultivo organizado e produção em escala comercial, <em>corroborando</em> a efetiva exploração rural."
    },
    {
      id: 21,
      nome: "Recibos de Pagamento a Trabalhadores Rurais",
      tipo: "outro",
      descricao: "Comprovantes de pagamento a funcionários contratados para trabalho em propriedade rural.",
      palavrasChave: "recibos, pagamento, funcionários, empregados, rural, contratação",
      detalhes: "<strong>Evidência objetiva</strong> de atividade rural como empregador. Demonstra capacidade econômica para manter funcionários e comprova <em>efetiva exploração</em> da propriedade rural em escala que necessita de mão de obra adicional."
    },
    {
      id: 22,
      nome: "Certificado de Cadastro Ambiental Rural (CAR)",
      tipo: "cadastro",
      descricao: "Registro público eletrônico obrigatório para imóveis rurais, com informações ambientais da propriedade.",
      palavrasChave: "ambiental, cadastro, CAR, propriedade, rural, meio ambiente",
      detalhes: "Comprova <strong>regularização ambiental</strong> da propriedade. Embora seja focado em questões ambientais, o CAR serve como <em>prova complementar</em> de vínculo com imóvel rural e intenção de exploração regular e sustentável."
    },
    {
      id: 23,
      nome: "Comprovante de Vacinação de Rebanho",
      tipo: "outro",
      descricao: "Certificados de vacinação de animais, emitidos por órgãos de controle sanitário animal.",
      palavrasChave: "vacinação, rebanho, gado, sanitário, agropecuária, rural",
      detalhes: "Documenta <strong>criação de animais</strong> na propriedade rural. Os certificados e comprovantes de vacinação são <em>evidências concretas</em> de atividade pecuária, demonstrando conformidade com exigências sanitárias e exercício regular da atividade."
    },
    {
      id: 24,
      nome: "Alvará de Licença para Comercialização de Produtos Rurais",
      tipo: "inscricao",
      descricao: "Licença municipal ou estadual que autoriza a comercialização de produtos de origem rural.",
      palavrasChave: "alvará, licença, comercialização, produtos, feira, rural",
      detalhes: "<strong>Prova formal</strong> de atividade comercial rural. A existência de licença para comercialização demonstra <em>produção regular</em> e intenção de venda dos produtos rurais, fortalecendo significativamente a comprovação da atividade."
    },
    {
      id: 25,
      nome: "Histórico de Conta de Luz Rural",
      tipo: "outro",
      descricao: "Faturas de energia elétrica classificadas como rurais, com tarifação específica para propriedades rurais.",
      palavrasChave: "conta, luz, energia, elétrica, rural, residência",
      detalhes: "Comprova <strong>residência em zona rural</strong> ao longo do tempo. A classificação rural da tarifa e o endereço indicado nas faturas servem como <em>prova auxiliar</em> para demonstrar permanência continuada em ambiente rural."
    }
  ];

  // Tornar disponível globalmente com window
  window.documentosPreCadastrados = documentosPreCadastrados;
}

// Flag para controle (se necessário, mas pode não ser usado com a abordagem atual)
// let saveFormStateOverridden = false;

// Definir a função de salvamento customizada no escopo do módulo
function customDocumentsSaveState() {
  if (window.formStateManager && window.formStateManager.isRestoring) {
    console.log("[documents.js] customDocumentsSaveState ignorado: FormStateManager está restaurando.");
    return;
  }
  console.log("[documents.js] customDocumentsSaveState CALLED");
  const documentosData = [];
  const observacoesEl = document.getElementById('observacoes');

  document.querySelectorAll('.documento-item').forEach(documentoItem => {
    const nomeInput = documentoItem.querySelector('.nome-documento');
    const anoInput = documentoItem.querySelector('.ano-documento');
    const detalhesTextarea = documentoItem.querySelector('.detalhes-documento');
    let status = 'obter';
    const statusSelect = documentoItem.querySelector('.documento-status');
    if (statusSelect && statusSelect.value) {
      status = statusSelect.value.toLowerCase();
    }
    documentosData.push({
      nome: nomeInput ? nomeInput.value : '',
      ano: anoInput ? anoInput.value : '',
      detalhes: detalhesTextarea ? detalhesTextarea.value : '',
      status: status,
      tipo: documentoItem.dataset.tipo || '',
      palavrasChave: documentoItem.dataset.palavrasChave || ''
    });
  });

  if (window.formStateManager) {
    if (!window.formStateManager.formData.documents) {
      window.formStateManager.formData.documents = {};
    }
    window.formStateManager.formData.documents.documentos = documentosData;
    window.formStateManager.formData.documents.observacoes = observacoesEl ? observacoesEl.value : '';
    console.log("[documents.js] window.formStateManager.formData.documents ATUALIZADO por customDocumentsSaveState:", JSON.parse(JSON.stringify(window.formStateManager.formData.documents)));
  } else {
    console.warn("[documents.js] FormStateManager não encontrado durante customDocumentsSaveState.");
  }
}

// Definir initModule aqui para que outras funções possam ser definidas antes se referenciadas por ele
window.initModule = function() {
  console.log("[documents.js] initModule chamado.");
  const form = document.getElementById('documents-form');
  const documentosContainer = document.getElementById('documentos-container');
  const documentoTemplate = document.getElementById('documentoTemplate');
  const documentoPesquisa = document.getElementById('documento-pesquisa');
  // A variável 'observacoes' agora é obtida dentro de customDocumentsSaveState
  const btnBack = document.getElementById('btn-back');
  const btnPrint = document.getElementById('btn-print');

  configurarEventos();

  if (window.formStateManager) {
    const currentStepKey = 'documents';
    setTimeout(() => {
      try {
        window.formStateManager.ensureFormAndRestore(currentStepKey);
        setTimeout(function() {
          document.dispatchEvent(new CustomEvent('formRestored', { detail: { step: currentStepKey } }));
        }, 350);
      } catch (e) {
        document.dispatchEvent(new CustomEvent('formRestored', { detail: { step: currentStepKey, error: true } }));
        console.error('[documents.js] Erro na restauração:', e);
      }
    }, 100);
  } else {
    console.error("[documents.js] initModule: formStateManager não encontrado. A restauração não ocorrerá.");
  }
  console.log("[documents.js] Módulo de documentos inicializado e restauração solicitada.");
};

// Adicionar um novo documento
function adicionarNovoDocumento(docData = null) {
    // ... (código de adicionarNovoDocumento como estava antes, mas sem a lógica de saveFormState interno)
    // ... (ele já deve preencher os campos baseado em docData se fornecido)
    try {
      const template = document.getElementById('documentoTemplate');
      const documentosContainer = document.getElementById('documentos-container');

      if (template && documentosContainer) {
        const clone = document.importNode(template.content, true);
        const documentoItem = clone.querySelector('.documento-item');

        if (docData && typeof docData === 'object') {
          const nomeDocumentoInput = clone.querySelector('.nome-documento');
          if (nomeDocumentoInput && docData.nome) nomeDocumentoInput.value = docData.nome;

          const anoDocumentoInput = clone.querySelector('.ano-documento');
          if (anoDocumentoInput && docData.ano) anoDocumentoInput.value = docData.ano;

          const detalhesTextarea = clone.querySelector('.detalhes-documento');
          if (detalhesTextarea && docData.detalhes) detalhesTextarea.value = docData.detalhes;

          if (docData.status) {
            const statusSelect = clone.querySelector('.documento-status');
            if (statusSelect) {
              const statusCapitalized = docData.status.charAt(0).toUpperCase() + docData.status.slice(1);
              statusSelect.value = statusCapitalized;
              const relationshipSelectDiv = statusSelect.closest('.relationship-select');
              if(relationshipSelectDiv) {
                  relationshipSelectDiv.setAttribute('data-selected', statusCapitalized);
                  relationshipSelectDiv.setAttribute('data-value', statusCapitalized);
              }
            }
          }
          if (docData.tipo) documentoItem.dataset.tipo = docData.tipo;
          if (docData.palavrasChave) documentoItem.dataset.palavrasChave = docData.palavrasChave;
        } else if (typeof docData === 'string' && docData) {
            const nomeDocumento = clone.querySelector('.nome-documento');
            if (nomeDocumento) nomeDocumento.value = docData;
        }

        const removeButton = clone.querySelector('.remover-documento');
        if (removeButton) {
          console.log('[documents.js] Botão .remover-documento ENCONTRADO no clone. Adicionando listener.', removeButton);
          removeButton.addEventListener('click', function(event) { // Adicionar event como parâmetro
            console.log('[documents.js] Event listener de REMOVER CLICADO. Botão:', this, 'Evento:', event);
            removerDocumento(this);
          });
        } else {
          console.warn('[documents.js] Botão .remover-documento NÃO ENCONTRADO no clone.');
        }
        const infoButton = clone.querySelector('.info-documento-btn');
        if (infoButton) {
          infoButton.addEventListener('click', function() { abrirPopupInfoDocumento(this.closest('.documento-item')); });
        }
        const detailsButton = clone.querySelector('.detalhes-documento-btn');
        if (detailsButton) {
            detailsButton.addEventListener('click', function() { abrirModalDetalhes(this.closest('.documento-item')); });
        }
        const statusSelect = clone.querySelector('.documento-status');
        if (statusSelect) {
            statusSelect.addEventListener('change', function() { updateDocumentStatusTag(this); });
            updateDocumentStatusTag(statusSelect); // Inicializa a tag visualmente
        }
        documentosContainer.appendChild(clone);
        return documentoItem;
      } else {
        console.error("Template de documento ou container não encontrado em adicionarNovoDocumento.");
        return null;
      }
    } catch (error) {
      console.error('Erro ao adicionar novo documento:', error);
      return null;
    }
}

// Função para remover documento com confirmação simples
function removerDocumento(button) {
  console.log('[documents.js] removerDocumento CALLED. Botão recebido:', button);
  const documentoItem = button.closest('.documento-item');
  if (!documentoItem) {
    console.warn('[documents.js] removerDocumento: documentoItem não encontrado a partir do botão.');
    return;
  }
  console.log('[documents.js] removerDocumento: documentoItem encontrado:', documentoItem);

  // const confirmacao = confirm('Tem certeza que deseja remover este documento?');
  // console.log('[documents.js] removerDocumento: Resultado da confirmação:', confirmacao);

  // if (confirmacao) {
  console.log('[documents.js] removerDocumento: Removendo item do DOM diretamente...');
  documentoItem.remove();
  console.log('[documents.js] removerDocumento: Item removido do DOM. Chamando customDocumentsSaveState...');
  customDocumentsSaveState(); // Salvar após remover
  // } else {
  //   console.log('[documents.js] removerDocumento: Usuário cancelou a remoção.');
  // }
}

// Função para abrir o modal de detalhes do documento
function abrirModalDetalhes(element) {
    // ... (início da função como estava)
    const salvarBtn = modal.querySelector('.salvar-info');
    if (salvarBtn) {
      const saveHandler = function() {
        if (detalhesTextarea && detalhesEl) {
          detalhesTextarea.value = detalhesEl.value;
        }
        modal.classList.add('hidden');
        customDocumentsSaveState(); // CHAMAR A FUNÇÃO CORRETA
        salvarBtn.removeEventListener('click', saveHandler);
      };
      salvarBtn.addEventListener('click', saveHandler);
    }
}

// Função para abrir o popup de informações do documento
function abrirPopupInfoDocumento(element) {
  const documentoItem = element.closest('.documento-item');
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
    const closeHandler = function() {
      popup.classList.add('hidden');
      fecharBtn.removeEventListener('click', closeHandler);
    };
    fecharBtn.addEventListener('click', closeHandler);
  }

  // Fechar popup ao clicar fora
  const clickOutsideHandler = function(event) {
    if (event.target === popup) {
      popup.classList.add('hidden');
      popup.removeEventListener('click', clickOutsideHandler);
    }
  };
  popup.addEventListener('click', clickOutsideHandler);
}

// Função para pesquisar documentos
function pesquisarDocumentos(query) {
  if (!query || typeof query !== 'string' || query.length < 2) {
    // Esconder resultados se a consulta for muito curta
    document.getElementById('resultados-pesquisa').classList.add('hidden');
    return [];
  }

  query = query.toLowerCase().trim();
  return documentosPreCadastrados.filter(doc => {
    // Verificar nome
    if (doc.nome.toLowerCase().includes(query)) return true;
    // Verificar palavras-chave
    if (doc.palavrasChave && doc.palavrasChave.toLowerCase().includes(query)) return true;
    // Verificar descrição
    if (doc.descricao && doc.descricao.toLowerCase().includes(query)) return true;
    return false;
  });
}

// Exibir resultados da pesquisa
function exibirResultadosPesquisa(query) {
  const resultadosContainer = document.getElementById('resultados-pesquisa');
  if (!resultadosContainer) return;

  // Limpar resultados anteriores sempre que a função é chamada
  resultadosContainer.innerHTML = '';

  // Se não há consulta ou é muito curta para pesquisar, esconder o container e sair
  if (!query || query.length < 2) {
    resultadosContainer.classList.add('hidden');
    return;
  }

  const resultados = pesquisarDocumentos(query); // Fazer a pesquisa

  // Criar cabeçalho e lista (serão populados condicionalmente)
  const header = document.createElement('div');
  const lista = document.createElement('ul');
  lista.className = 'bg-white border border-t-0 border-gray-200 rounded-b max-h-60 overflow-y-auto shadow-sm';

  if (resultados.length > 0) {
    // Resultados encontrados
    header.className = 'bg-blue-50 p-2 rounded-t text-sm text-blue-700 border border-blue-100 flex justify-between items-center';
    header.innerHTML = `
      <span><i class="fas fa-search mr-2"></i>Resultados para "${query}" (${resultados.length})</span>
      <button type="button" class="text-gray-500 hover:text-gray-700 btn-close-document-search">
        <i class="fas fa-times"></i>
      </button>
    `;
    resultadosContainer.appendChild(header);

    resultados.forEach(doc => {
      const item = document.createElement('li');
      item.className = 'p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 documento-resultado';
      item.innerHTML = `
        <div class="font-medium text-gray-800">${doc.nome}</div>
        <div class="text-xs text-gray-500 truncate">${doc.descricao}</div>
      `;
      item.dataset.docId = doc.id;
      item.dataset.docNome = doc.nome;
      item.dataset.docDetalhes = doc.detalhes || '';

      item.addEventListener('click', function() {
        preencherDocumento(doc); // preencherDocumento chama adicionarNovoDocumento e customDocumentsSaveState
        const docPesquisaEl = document.getElementById('documento-pesquisa');
        if(docPesquisaEl) docPesquisaEl.value = ''; // Limpa o campo de pesquisa
        resultadosContainer.classList.add('hidden');
      });
      lista.appendChild(item);
    });
    resultadosContainer.appendChild(lista);

  } else { // Nenhum resultado encontrado (e query.length >= 2)
    header.className = 'bg-green-50 p-2 rounded-t text-sm text-green-700 border border-green-100 flex justify-between items-center';
    header.innerHTML = `
      <span><i class="fas fa-lightbulb mr-2"></i>Nenhum documento encontrado para "${query}"</span>
      <button type="button" class="text-gray-500 hover:text-gray-700 btn-close-document-search">
        <i class="fas fa-times"></i>
      </button>
    `;
    resultadosContainer.appendChild(header);

    const addItem = document.createElement('li');
    addItem.className = 'p-3 hover:bg-green-100 cursor-pointer border-b border-gray-100 text-green-700 flex items-center';
    addItem.innerHTML = `
      <i class="fas fa-plus-circle mr-2"></i>Adicionar "<strong>${query}</strong>" como novo documento?
    `;
    addItem.addEventListener('click', function() {
      adicionarNovoDocumento(query); // Adiciona o texto da query como nome
      if (typeof customDocumentsSaveState === 'function') {
        customDocumentsSaveState(); // Garante que o estado é salvo
      }
      const docPesquisaEl = document.getElementById('documento-pesquisa');
      if(docPesquisaEl) docPesquisaEl.value = ''; // Limpa o campo de pesquisa
      resultadosContainer.classList.add('hidden');
    });
    lista.appendChild(addItem);
    resultadosContainer.appendChild(lista);
  }

  // Mostrar o container se tivermos algo para mostrar (resultados ou sugestão)
  resultadosContainer.classList.remove('hidden');

  // Adicionar evento para fechar resultados/sugestão
  const closeButton = resultadosContainer.querySelector('.btn-close-document-search');
  if (closeButton) {
    // Remover listener antigo para evitar duplicação, caso a função seja chamada múltiplas vezes
    const newCloseButton = closeButton.cloneNode(true);
    closeButton.parentNode.replaceChild(newCloseButton, closeButton);
    newCloseButton.addEventListener('click', function() {
      resultadosContainer.classList.add('hidden');
    });
  }
}

// Preencher um documento com dados selecionados
function preencherDocumento(doc) {
  const novoDocumento = adicionarNovoDocumento(doc);
  if (!novoDocumento) return;
  // ... (lógica de preenchimento já está em adicionarNovoDocumento)
  customDocumentsSaveState(); // Salvar estado após adicionar o documento preenchido
  const documentoPesquisa = document.getElementById('documento-pesquisa');
  const resultadosContainer = document.getElementById('resultados-pesquisa');
  if (documentoPesquisa) documentoPesquisa.value = '';
  if (resultadosContainer) resultadosContainer.classList.add('hidden');
}

// Função para configurar eventos
function configurarEventos() {
  const form = document.getElementById('documents-form');
  const documentoPesquisa = document.getElementById('documento-pesquisa');
  const btnBack = document.getElementById('btn-back');
  const btnPrint = document.getElementById('btn-print');

  if (documentoPesquisa) {
    documentoPesquisa.addEventListener('input', function() {
      const query = this.value.trim();
      exibirResultadosPesquisa(query);
    });
    documentoPesquisa.addEventListener('keypress', function(event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        const textoDigitado = this.value.trim();
        if (!textoDigitado) return;
        const resultadosContainer = document.getElementById('resultados-pesquisa');
        if (!resultadosContainer.classList.contains('hidden')) {
          const primeiroResultado = resultadosContainer.querySelector('.documento-resultado');
          if (primeiroResultado) {
            primeiroResultado.click(); // preencherDocumento será chamado, que já salva
            return;
          }
        }
        let documentoExistente = false;
        document.querySelectorAll('.nome-documento').forEach(input => {
          if (input.value.toLowerCase() === textoDigitado.toLowerCase()) {
            documentoExistente = true;
          }
        });
        if (!documentoExistente) {
          adicionarNovoDocumento(textoDigitado);
          this.value = '';
          if (resultadosContainer) resultadosContainer.classList.add('hidden');
          customDocumentsSaveState(); // CHAMAR A FUNÇÃO CORRETA
        }
      }
    });
  }

  if (btnBack) {
    btnBack.addEventListener('click', function() {
      customDocumentsSaveState(); // CHAMAR A FUNÇÃO CORRETA
      if (typeof navigateTo === 'function') {
        navigateTo('professional');
      }
    });
  }

  if (btnPrint) {
    btnPrint.addEventListener('click', function() { window.print(); });
  }

  document.addEventListener('click', function(event) {
    const resultadosContainer = document.getElementById('resultados-pesquisa');
    const pesquisaInput = document.getElementById('documento-pesquisa');
    if (resultadosContainer && !resultadosContainer.contains(event.target) && pesquisaInput && !pesquisaInput.contains(event.target)) {
      resultadosContainer.classList.add('hidden');
    }
    if (event.target.classList.contains('info-documento-btn')) {
      abrirPopupInfoDocumento(event.target.closest('.documento-item'));
    }
  });

  if (form) {
    form.addEventListener('change', function(event) {
      if (window.formStateManager && window.formStateManager.isRestoring) {
        console.log("[documents.js] Evento 'change' no formulário ignorado: FormStateManager está restaurando.");
        return;
      }

      // Evitar salvar em loop se a mudança for programática ou de um select dentro de um item já existente
      // A mudança no select de status já chama updateDocumentStatusTag -> customDocumentsSaveState
      if (event.target && event.target.classList.contains('documento-status')) {
          return;
      }
      console.log("[documents.js] Form change event, calling customDocumentsSaveState");
      customDocumentsSaveState();
    });
  }

  const modal = document.getElementById('documento-info-modal');
  if (modal) {
    window.addEventListener('click', function(event) {
      if (event.target === modal) {
        modal.classList.add('hidden');
      }
    });
  }
}

// As funções de toggle/update de status precisam chamar customDocumentsSaveState
function toggleDocumentStatus(buttonOrTag) {
  if (!buttonOrTag) return;

  const documentoItem = buttonOrTag.closest('.documento-item');
  if (!documentoItem) return;

  const status = buttonOrTag.dataset.status;
  const allTags = documentoItem.querySelectorAll('.documento-tag');

  // Removemos a classe 'active' de todas as tags
  allTags.forEach(tag => {
    tag.classList.remove('active');
  });

  // Atualizar o data-status no elemento do documento
  documentoItem.dataset.status = status;

  // Atualizar a classe do botão clicado para mostrar que está ativo
  buttonOrTag.classList.add('active');

  // Adicionar classe ao documento para visualização rápida
  documentoItem.classList.remove('status-recebido', 'status-solicitado', 'status-obter');
  documentoItem.classList.add('status-' + status);

  // Salvar alterações
  customDocumentsSaveState();
}

function updateDocumentStatusTag(selectElement) {
  const container = selectElement.closest('.relationship-select');
  const value = selectElement.value;

  // Atualiza os atributos data-selected e data-value
  container.setAttribute('data-selected', value);
  container.setAttribute('data-value', value);

  // Atualizar o status no elemento do documento
  const documentoElement = container.closest('.documento-item');
  if (documentoElement) {
    // Mapear o valor do status para o formato correto esperado pelo sistema
    let mappedStatus = value.toLowerCase();

    // Corrigir o mapeamento para a convenção de nomenclatura do sistema
    if (mappedStatus === 'recebido') mappedStatus = 'recebido';
    else if (mappedStatus === 'solicitado') mappedStatus = 'solicitado';
    else if (mappedStatus === 'obter') mappedStatus = 'obter';

    // Atualizar o atributo data-status
    documentoElement.dataset.status = mappedStatus;

    // Atualizar as classes CSS para visualização rápida
    documentoElement.classList.remove('status-recebido', 'status-solicitado', 'status-obter');
    documentoElement.classList.add('status-' + mappedStatus);
  }

  // Salvar alterações
  customDocumentsSaveState();
}

window.updateDocumentStatusTag = updateDocumentStatusTag;
window.toggleDocumentStatus = toggleDocumentStatus;
window.abrirPopupInfoDocumento = abrirPopupInfoDocumento;
window.adicionarNovoDocumento = adicionarNovoDocumento;
window.removerDocumento = removerDocumento;
window.abrirModalDetalhes = abrirModalDetalhes;

// Função para resetar a UI da seção de documentos
function resetDocumentsUI() {
  const documentosContainer = document.getElementById('documentos-container');
  if (documentosContainer) {
    documentosContainer.innerHTML = '';
    console.log("[documents.js] resetDocumentsUI: Container de documentos limpo.");
  }
  // Limpar também o campo de pesquisa e observações, se necessário
  const pesquisaInput = document.getElementById('documento-pesquisa');
  if (pesquisaInput) pesquisaInput.value = '';
  const observacoesInput = document.getElementById('observacoes');
  if (observacoesInput) observacoesInput.value = ''; // Observações desta seção
}
window.resetDocumentsUI = resetDocumentsUI;

// A antiga função carregarDadosSalvos não é mais necessária no initModule,
// pois a restauração é feita por FormStateManager + adicionarNovoDocumento(docData)

// A antiga sobrescrita de executeClearSection também deve chamar customDocumentsSaveState
// Se window.executeClearSectionOriginal é definido em outro lugar.
if (typeof window.executeClearSection === 'function') {
    const originalExecuteClearSection = window.executeClearSection;
    window.executeClearSection = function(section) {
        originalExecuteClearSection(section);
        if (section === 'documentos') {
            // ... (lógica de limpar container, etc.)
            customDocumentsSaveState(); // Garantir que o estado reflita a limpeza
        }
    };
}

