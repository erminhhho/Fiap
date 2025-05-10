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
      detalhes: "Documento com firma reconhecida. Requisitar ao sindicato rural da região onde o segurado exerceu atividade. Verificar se contém o período completo alegado."
    },
    {
      id: 2,
      nome: "Certidão de Nascimento com Profissão Rural",
      tipo: "certidao",
      descricao: "Certidão onde consta profissão rural dos pais, considerada início de prova material para comprovação de atividade rural desde a infância.",
      palavrasChave: "rural, nascimento, profissão, certidão, segurado especial, início de prova material",
      detalhes: "Solicitar cópia autenticada. A certidão deve conter expressamente a qualificação dos pais como lavradores, agricultores ou trabalhadores rurais."
    },
    {
      id: 3,
      nome: "Contrato de Parceria Rural",
      tipo: "contrato",
      descricao: "Contrato entre proprietário e trabalhador rural definindo condições de trabalho e repartição de resultados. Deve ser contemporâneo ao período trabalhado.",
      palavrasChave: "contrato, parceria, rural, segurado especial, arrendamento",
      detalhes: "Verificar registro em cartório. O contrato deve descrever a atividade exercida, a forma de remuneração e o período do acordo. Precisa ter firmas reconhecidas."
    },
    {
      id: 4,
      nome: "Contrato de Arrendamento Rural",
      tipo: "contrato",
      descricao: "Contrato onde o proprietário cede o imóvel rural para exploração mediante pagamento. Comprova atividade rural do arrendatário.",
      palavrasChave: "arrendamento, contrato, rural, segurado especial, exploração"
    },
    {
      id: 5,
      nome: "Bloco de Notas do Produtor Rural",
      tipo: "nota",
      descricao: "Documento fiscal que comprova comercialização de produtos rurais. Serve como forte prova de atividade rural continuada.",
      palavrasChave: "notas, produtor, rural, comercialização, segurado especial, prova material"
    },
    {
      id: 6,
      nome: "Ficha de Matrícula Escolar Rural",
      tipo: "ficha",
      descricao: "Documento escolar que indica residência em zona rural. Considerado início de prova material quando indica profissão dos pais como agricultores.",
      palavrasChave: "escola, rural, matrícula, residência, segurado especial, filho"
    },
    {
      id: 7,
      nome: "Certidão de Casamento com Profissão Rural",
      tipo: "certidao",
      descricao: "Certidão onde consta profissão rural dos cônjuges, válida como início de prova material desde a data do casamento.",
      palavrasChave: "casamento, rural, certidão, cônjuge, segurado especial, início de prova material"
    },
    {
      id: 8,
      nome: "Certificado de Cadastro de Imóvel Rural (CCIR)",
      tipo: "cadastro",
      descricao: "Documento do INCRA que comprova regularidade do imóvel rural. Útil para comprovar vínculo com propriedade rural.",
      palavrasChave: "CCIR, INCRA, propriedade, cadastro, rural, segurado especial"
    },
    {
      id: 9,
      nome: "Declaração de Aptidão ao PRONAF (DAP)",
      tipo: "declaracao",
      descricao: "Documento que identifica agricultores familiares para acesso a políticas públicas. Forte prova de atividade rural.",
      palavrasChave: "DAP, PRONAF, agricultura familiar, segurado especial, rural"
    },
    {
      id: 10,
      nome: "ITR - Imposto Territorial Rural",
      tipo: "cadastro",
      descricao: "Comprovante de pagamento de imposto rural. Comprova propriedade ou posse de imóvel rural.",
      palavrasChave: "ITR, imposto, rural, propriedade, segurado especial, fiscal"
    },
    {
      id: 11,
      nome: "CNIS - Cadastro Nacional de Informações Sociais",
      tipo: "cadastro",
      descricao: "Documento que mostra vínculos de trabalho e contribuições. Útil para verificar ausência de outros vínculos urbanos.",
      palavrasChave: "CNIS, contribuições, INSS, vínculos, segurado especial"
    },
    {
      id: 12,
      nome: "Carteira de Associado ao Sindicato Rural",
      tipo: "cadastro",
      descricao: "Comprova filiação a sindicato rural. Considerado início de prova material desde a data de filiação.",
      palavrasChave: "sindicato, carteira, associado, rural, segurado especial"
    },
    {
      id: 13,
      nome: "Ficha de Cadastro no Posto de Saúde Rural",
      tipo: "ficha",
      descricao: "Documento médico que indica residência em zona rural. Pode indicar profissão como agricultor.",
      palavrasChave: "saúde, rural, ficha, residência, médico, segurado especial"
    },
    {
      id: 14,
      nome: "Certidão da Justiça Eleitoral",
      tipo: "certidao",
      descricao: "Documento que pode indicar zona eleitoral rural e profissão do eleitor como agricultor.",
      palavrasChave: "eleitoral, certidão, zona, rural, segurado especial"
    },
    {
      id: 15,
      nome: "Escritura Pública de Imóvel Rural",
      tipo: "inscricao",
      descricao: "Documento que comprova propriedade de imóvel rural. Forte prova de vínculo com atividade rural.",
      palavrasChave: "escritura, imóvel, rural, propriedade, segurado especial"
    },
    {
      id: 16,
      nome: "Comprovante de Cadastro no INCRA",
      tipo: "cadastro",
      descricao: "Documento que comprova registro de propriedade rural no INCRA. Útil para comprovar atividade rural.",
      palavrasChave: "INCRA, cadastro, rural, propriedade, segurado especial"
    },
    {
      id: 17,
      nome: "Comprovante de Recebimento de Crédito Rural",
      tipo: "inscricao",
      descricao: "Documento bancário que prova financiamento para atividade rural. Demonstra investimento em produção rural.",
      palavrasChave: "crédito, financiamento, rural, banco, segurado especial, PRONAF"
    },
    {
      id: 18,
      nome: "Declaração de Associação de Moradores Rural",
      tipo: "declaracao",
      descricao: "Documento emitido por associação de moradores atestando residência e atividade rural.",
      palavrasChave: "associação, moradores, rural, declaração, segurado especial"
    },
    {
      id: 19,
      nome: "Registro de Imóvel Rural",
      tipo: "inscricao",
      descricao: "Documento cartorial que comprova propriedade de imóvel rural. Prova material forte para vínculo com terra.",
      palavrasChave: "registro, imóvel, cartório, rural, segurado especial, propriedade"
    },
    {
      id: 20,
      nome: "Receituário Agronômico",
      tipo: "outro",
      descricao: "Documento com prescrição de defensivos agrícolas. Evidencia atividade produtiva rural.",
      palavrasChave: "receituário, agrônomo, defensivos, rural, segurado especial, produção"
    }
  ];

  // Tornar disponível globalmente com window
  window.documentosPreCadastrados = documentosPreCadastrados;
}

// Definir nova função de inicialização do módulo
window.initModule = function() {
  const form = document.getElementById('documents-form');
  const documentsList = document.getElementById('documentsList');
  const documentosContainer = document.getElementById('documentos-container');
  const documentoTemplate = document.getElementById('documentoTemplate').content;
  const documentoPesquisa = document.getElementById('documento-pesquisa');
  const btnAdicionarDocumento = document.querySelector('.add-documento-btn');
  const observacoesDocumentos = document.getElementById('observacoes-documentos');
  const btnBack = document.getElementById('btn-back');

  // Usar os documentos armazenados no objeto global window
  const documentosPreCadastrados = window.documentosPreCadastrados;

  let nextId = documentosPreCadastrados.length + 1;
  let documentosAdicionados = [];

  // Carregar documentos pré-cadastrados no campo de pesquisa
  function carregarDocumentosParaPesquisa() {
    // O campo de pesquisa já está pronto para uso
  }

  // Adicionar um novo documento em branco
  function adicionarNovoDocumento() {
    if (!documentoTemplate || !documentosContainer) return;

    const clone = document.importNode(documentoTemplate, true);
    const documentoId = 'documento-' + nextId++;

    const documentoElement = clone.querySelector('.documento-adicionado');
    if (documentoElement) {
      documentoElement.id = documentoId;
      documentosContainer.appendChild(clone);

      // Adicionar evento para remover este documento
      const novoDocumento = document.getElementById(documentoId);
      if (novoDocumento) {
        const btnRemover = novoDocumento.querySelector('.remover-documento');
        if (btnRemover) {
          btnRemover.addEventListener('click', function() {
            novoDocumento.remove();
          });
        }
      }
    }
  }

  // Pesquisar documentos
  function pesquisarDocumentos(query) {
    if (!query) return [];

    query = query.toLowerCase();
    return documentosPreCadastrados.filter(doc =>
      doc.nome.toLowerCase().includes(query) ||
      doc.descricao.toLowerCase().includes(query) ||
      (doc.palavrasChave && doc.palavrasChave.toLowerCase().includes(query))  // Mantém para dados pré-cadastrados
    );
  }

  // Exibir resultados da pesquisa
  function exibirResultadosPesquisa(resultados) {
    // Limpar resultados anteriores
    let resultsContainer = document.getElementById('resultados-pesquisa');
    if (resultsContainer) {
      resultsContainer.remove();
    }

    if (resultados.length === 0) return;

    // Criar container de resultados
    const container = document.createElement('div');
    container.id = 'resultados-pesquisa';
    container.className = 'absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto';

    resultados.forEach(doc => {
      const item = document.createElement('div');
      item.className = 'p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100';
      item.innerHTML = `
        <div class="font-medium">${doc.nome}</div>
        <div class="text-sm text-gray-600">${doc.tipo.charAt(0).toUpperCase() + doc.tipo.slice(1)}</div>
      `;

      item.addEventListener('click', function() {
        preencherDocumento(doc);
        if (container && container.parentNode) {
          container.remove();
        }
      });

      container.appendChild(item);
    });

    // Adicionar ao DOM, logo após o campo de pesquisa
    if (documentoPesquisa && documentoPesquisa.parentNode) {
      documentoPesquisa.parentNode.appendChild(container);
    }
  }

  // Preencher um documento com dados selecionados
  function preencherDocumento(doc) {
    adicionarNovoDocumento();

    const ultimoDocumento = documentosContainer ? documentosContainer.lastElementChild : null;
    if (!ultimoDocumento) return;

    const nomeInput = ultimoDocumento.querySelector('.nome-documento');
    const tipoSelect = ultimoDocumento.querySelector('.tipo-documento');
    const descricaoTextarea = ultimoDocumento.querySelector('.descricao-documento');
    const detalhesTextarea = ultimoDocumento.querySelector('.detalhes-documento');

    if (nomeInput) nomeInput.value = doc.nome || '';
    if (tipoSelect) tipoSelect.value = doc.tipo || '';
    if (descricaoTextarea) descricaoTextarea.value = doc.descricao || '';
    if (detalhesTextarea && doc.detalhes) detalhesTextarea.value = doc.detalhes;

    // Limpar campo de pesquisa
    if (documentoPesquisa) documentoPesquisa.value = '';
  }

  // Event listeners
  if (btnAdicionarDocumento) {
    btnAdicionarDocumento.addEventListener('click', adicionarNovoDocumento);
  }

  if (documentoPesquisa) {
    documentoPesquisa.addEventListener('input', function() {
      const query = this.value.trim();
      if (query.length >= 2) {
        const resultados = pesquisarDocumentos(query);
        exibirResultadosPesquisa(resultados);
      } else {
        const resultsContainer = document.getElementById('resultados-pesquisa');
        if (resultsContainer) {
          resultsContainer.remove();
        }
      }
    });
  }

  // Configurar botão Anterior para navegação
  if (btnBack) {
    btnBack.addEventListener('click', function() {
      // Usar a função de navegação para a etapa anterior
      if (window.navigateToPrevStep) {
        window.navigateToPrevStep();
      } else {
        console.error('Função navigateToPrevStep não está disponível no escopo global');
      }
    });
  }

  // Salvar documentos
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();

      // Coletar dados de todos os documentos
      const documentos = Array.from(documentosContainer.querySelectorAll('.documento-adicionado')).map(el => {
        return {
          nome: el.querySelector('.nome-documento').value,
          tipo: el.querySelector('.tipo-documento').value,
          descricao: el.querySelector('.descricao-documento').value,
          detalhes: el.querySelector('.detalhes-documento').value
        };
      });

      // Coletar observações
      const observacoes = observacoesDocumentos ? observacoesDocumentos.value : '';

      // Aqui você normalmente enviaria para um servidor
      documentosAdicionados = documentos;

      // Exibir mensagem de sucesso
      Swal.fire({
        icon: 'success',
        title: 'Documentos salvos com sucesso!',
        showConfirmButton: false,
        timer: 1500
      });
    });
  }

  // Inicialização
  carregarDocumentosParaPesquisa();
};
