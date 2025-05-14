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

// Definir nova função de inicialização do módulo
window.initModule = function() {
  // Referências aos elementos DOM
  const form = document.getElementById('documents-form');
  const documentosContainer = document.getElementById('documentos-container');
  const documentoTemplate = document.getElementById('documentoTemplate');
  const documentoPesquisa = document.getElementById('documento-pesquisa');
  const observacoes = document.getElementById('observacoes');
  const btnBack = document.getElementById('btn-back');
  const btnPrint = document.getElementById('btn-print');

  // Usar os documentos pré-cadastrados do objeto global
  const documentosPreCadastrados = window.documentosPreCadastrados || [];

  // Inicializar contador para IDs únicos
  let nextId = documentosPreCadastrados.length + 1;

  // Adicionar um novo documento em branco
  function adicionarNovoDocumento(textoDocumento = '') {
    try {
      // Verificar se temos os elementos necessários
      if (!documentoTemplate || !documentosContainer) {
        console.error('Elementos do template ou container não encontrados');
        return;
      }

      // Clonar o template
      const clone = document.importNode(documentoTemplate.content, true);
      const documentoId = 'documento-' + nextId++;

      // Configurar o novo documento
      const documentoElement = clone.querySelector('.documento-adicionado');
      if (documentoElement) {
        documentoElement.id = documentoId;

        // Definir o nome do documento se fornecido
        if (textoDocumento) {
          const nomeInput = documentoElement.querySelector('.nome-documento');
          if (nomeInput) {
            nomeInput.value = textoDocumento;
          }
        }

        // Configurar botões de controle
        const expandirBtn = documentoElement.querySelector('.expandir-documento');
        if (expandirBtn) {
          expandirBtn.addEventListener('click', function() {
            toggleDocumentFields(this);
          });
        }

        const removerBtn = documentoElement.querySelector('.remover-documento');
        if (removerBtn) {
          removerBtn.addEventListener('click', function() {
            if (confirm('Tem certeza que deseja remover este documento?')) {
              documentoElement.remove();
            }
          });
        }

        // Configurar tags de status
        const statusTags = documentoElement.querySelectorAll('.documento-tag');
        statusTags.forEach(tag => {
          tag.addEventListener('click', function() {
            toggleDocumentStatus(this);
          });
        });

        // Adicionar ao container
        documentosContainer.appendChild(clone);

        // Marcar como "obter" por padrão
        const obterTag = documentoElement.querySelector('.documento-tag[data-status="obter"]');
        if (obterTag) {
          setTimeout(() => toggleDocumentStatus(obterTag), 0);
        }

        return documentoElement;
      }
    } catch (error) {
      console.error('Erro ao adicionar novo documento:', error);
    }
    return null;
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
    const resultados = pesquisarDocumentos(query);
    const resultadosContainer = document.getElementById('resultados-pesquisa');

    if (!resultadosContainer) return;

    // Se não há resultados ou a consulta é muito curta, esconder o container
    if (resultados.length === 0 || query.length < 2) {
      resultadosContainer.classList.add('hidden');
      return;
    }

    // Limpar resultados anteriores
    resultadosContainer.innerHTML = '';

    // Adicionar novo cabeçalho
    const header = document.createElement('div');
    header.className = 'bg-blue-50 p-2 rounded-t text-sm text-blue-700 border border-blue-100 flex justify-between items-center';
    header.innerHTML = `
      <span><i class="fas fa-search mr-2"></i>Resultados para "${query}" (${resultados.length})</span>
      <button type="button" class="text-gray-500 hover:text-gray-700" id="btn-close-search">
        <i class="fas fa-times"></i>
      </button>
    `;
    resultadosContainer.appendChild(header);

    // Adicionar resultados em uma lista
    const lista = document.createElement('ul');
    lista.className = 'bg-white border border-t-0 border-gray-200 rounded-b max-h-60 overflow-y-auto shadow-sm';

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
        preencherDocumento(doc);
        resultadosContainer.classList.add('hidden');
        documentoPesquisa.value = '';
      });

      lista.appendChild(item);
    });

    resultadosContainer.appendChild(lista);
    resultadosContainer.classList.remove('hidden');

    // Adicionar evento para fechar resultados
    document.getElementById('btn-close-search').addEventListener('click', function() {
      resultadosContainer.classList.add('hidden');
    });
  }

  // Preencher um documento com dados selecionados
  function preencherDocumento(doc) {
    const novoDocumento = adicionarNovoDocumento(doc.nome);

    if (!novoDocumento) return;

    // Preencher detalhes do documento
    const detalhesContainer = novoDocumento.querySelector('.detalhes-documento-container');
    const detalhesTextarea = novoDocumento.querySelector('.detalhes-documento');

    if (detalhesTextarea && doc.detalhes) {
      detalhesTextarea.value = doc.detalhes.replace(/<[^>]*>/g, ''); // Remover tags HTML

      // Mostrar área de detalhes já que temos conteúdo
      detalhesContainer.classList.remove('hidden');
      const expandirBtn = novoDocumento.querySelector('.expandir-documento');
      if (expandirBtn) {
        const icon = expandirBtn.querySelector('i');
        if (icon) {
          icon.classList.remove('fa-chevron-down');
          icon.classList.add('fa-chevron-up');
        }
      }
    }
  }

  // Configurar eventos
  function configurarEventos() {
    // Evento para buscar documentos conforme digita
    documentoPesquisa.addEventListener('input', function() {
      const query = this.value.trim();
      exibirResultadosPesquisa(query);
    });

    // Evento para adicionar documento ao pressionar Enter
    documentoPesquisa.addEventListener('keypress', function(event) {
      if (event.key === 'Enter') {
        event.preventDefault();

        // Se há resultados visíveis, selecionar o primeiro
        const resultadosContainer = document.getElementById('resultados-pesquisa');
        if (!resultadosContainer.classList.contains('hidden')) {
          const primeiroResultado = resultadosContainer.querySelector('.documento-resultado');
          if (primeiroResultado) {
            primeiroResultado.click();
            return;
          }
        }

        // Se não há resultados, adicionar um novo documento com o texto digitado
        if (this.value.trim()) {
          adicionarNovoDocumento(this.value.trim());
          this.value = ''; // Limpar o campo
          document.getElementById('resultados-pesquisa').classList.add('hidden'); // Esconder resultados
        }
      }
    });

    // Configurar botão voltar
    if (btnBack) {
      btnBack.addEventListener('click', function() {
        if (typeof navigateTo === 'function') {
          navigateTo('professional');
        }
      });
    }

    // Configurar botão imprimir
    if (btnPrint) {
      btnPrint.addEventListener('click', function() {
        window.print();
      });
    }

    // Fechar resultados ao clicar fora
    document.addEventListener('click', function(event) {
      const resultadosContainer = document.getElementById('resultados-pesquisa');
      const pesquisaInput = document.getElementById('documento-pesquisa');

      if (resultadosContainer && !resultadosContainer.contains(event.target) &&
          pesquisaInput && !pesquisaInput.contains(event.target)) {
        resultadosContainer.classList.add('hidden');
      }
    });

    // Salvar automaticamente ao alterar o formulário
    form.addEventListener('change', function() {
      if (typeof saveFormState === 'function') {
        saveFormState();
      }
    });
  }

  // Carregar dados salvos do formulário
  function carregarDadosSalvos() {
    try {
      // Verificar se temos dados carregados no formStateManager
      if (window.formStateManager && formStateManager.formData && formStateManager.formData.documents) {
        const dados = formStateManager.formData.documents;

        // Limpar documentos existentes
        documentosContainer.innerHTML = '';

        // Carregar documentos salvos
        if (dados.documentos && Array.isArray(dados.documentos)) {
          dados.documentos.forEach(doc => {
            const novoDocumento = adicionarNovoDocumento(doc.nome || '');

            if (!novoDocumento) return;

            // Definir o ano se existir
            const anoInput = novoDocumento.querySelector('.ano-documento');
            if (anoInput && doc.ano) {
              anoInput.value = doc.ano;
            }

            // Definir os detalhes se existirem
            const detalhesTextarea = novoDocumento.querySelector('.detalhes-documento');
            if (detalhesTextarea && doc.detalhes) {
              detalhesTextarea.value = doc.detalhes;

              // Mostrar área de detalhes se temos conteúdo
              const detalhesContainer = novoDocumento.querySelector('.detalhes-documento-container');
              if (detalhesContainer) {
                detalhesContainer.classList.remove('hidden');
                const expandirBtn = novoDocumento.querySelector('.expandir-documento');
                if (expandirBtn) {
                  const icon = expandirBtn.querySelector('i');
                  if (icon) {
                    icon.classList.remove('fa-chevron-down');
                    icon.classList.add('fa-chevron-up');
                  }
                }
              }
            }

            // Definir o status do documento
            if (doc.status) {
              const statusBtn = novoDocumento.querySelector(`.documento-tag[data-status="${doc.status}"]`);
              if (statusBtn) {
                setTimeout(() => toggleDocumentStatus(statusBtn), 0);
              }
            }
          });
        }

        // Carregar observações
        if (dados.observacoes) {
          observacoes.value = dados.observacoes;
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados salvos dos documentos:', error);
    }
  }

  // Inicializar o módulo
  function inicializar() {
    if (typeof saveFormState === 'function') {
      // Sobrescrever a função saveFormState para incluir dados deste módulo
      const originalSaveFormState = saveFormState;
      saveFormState = function() {
        // Coletar dados do formulário de documentos
        const documentosData = [];

        document.querySelectorAll('.documento-adicionado').forEach(docElement => {
          const nomeInput = docElement.querySelector('.nome-documento');
          const anoInput = docElement.querySelector('.ano-documento');
          const detalhesTextarea = docElement.querySelector('.detalhes-documento');

          documentosData.push({
            nome: nomeInput ? nomeInput.value : '',
            ano: anoInput ? anoInput.value : '',
            detalhes: detalhesTextarea ? detalhesTextarea.value : '',
            status: docElement.dataset.status || 'obter'
          });
        });

        // Configurar os dados a serem salvos
        if (window.formStateManager) {
          formStateManager.formData.documents = {
            documentos: documentosData,
            observacoes: observacoes ? observacoes.value : ''
          };
        }

        // Chamar a função original
        originalSaveFormState();
      };
    }

    // Configurar eventos
    configurarEventos();

    // Carregar dados salvos
    carregarDadosSalvos();
  }

  // Iniciar o módulo
  inicializar();
};

// Função para alternar o status do documento - função global para uso no onclick do HTML
function toggleDocumentStatus(button) {
  if (!button) return;

  const documentoElement = button.closest('.documento-adicionado');
  if (!documentoElement) return;

  const statusValue = button.dataset.status;
  const allTags = documentoElement.querySelectorAll('.documento-tag');

  // Primeiro, reseta todas as tags para seu estado inicial
  allTags.forEach(tag => {
    tag.classList.remove('bg-green-100', 'text-green-800', 'border-green-200',
                        'bg-blue-100', 'text-blue-700', 'border-blue-200',
                        'bg-yellow-100', 'text-yellow-700', 'border-yellow-200');

    tag.classList.add('bg-gray-100', 'text-gray-500', 'border-gray-200');
  });

  // Depois, ativa a tag selecionada com o estilo apropriado
  if (statusValue === 'recebido') {
    button.classList.remove('bg-gray-100', 'text-gray-500', 'border-gray-200');
    button.classList.add('bg-green-100', 'text-green-800', 'border-green-200');
  } else if (statusValue === 'solicitado') {
    button.classList.remove('bg-gray-100', 'text-gray-500', 'border-gray-200');
    button.classList.add('bg-blue-100', 'text-blue-700', 'border-blue-200');
  } else if (statusValue === 'obter') {
    button.classList.remove('bg-gray-100', 'text-gray-500', 'border-gray-200');
    button.classList.add('bg-yellow-100', 'text-yellow-700', 'border-yellow-200');
  }

  // Atualizamos um atributo data no elemento do documento para facilitar o acesso ao status atual
  documentoElement.dataset.status = statusValue;

  // Salvar alterações
  if (typeof saveFormState === 'function') {
    saveFormState();
  }
}

// Função para expandir/contrair os detalhes do documento - função global para uso no onclick do HTML
function toggleDocumentFields(button) {
  if (!button) return;

  const documentoElement = button.closest('.documento-adicionado');
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
}
