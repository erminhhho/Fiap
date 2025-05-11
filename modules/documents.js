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
  // Referências aos elementos DOM
  const form = document.getElementById('documents-form');
  const documentosContainer = document.getElementById('documentos-container');
  const documentoTemplate = document.getElementById('documentoTemplate');
  const documentoPesquisa = document.getElementById('documento-pesquisa');
  const observacoes = document.getElementById('observacoes');
  const btnBack = document.getElementById('btn-back');
  const btnSave = document.getElementById('btn-save');

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

        // Se foi passado um texto para o documento, preenchê-lo
        if (textoDocumento) {
          const nomeInput = clone.querySelector('.nome-documento');
          if (nomeInput) nomeInput.value = textoDocumento;
        }

        // Adicionar ao container
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

          // Configurar o evento de mudança de status para exibir os campos apropriados
          const statusSelect = novoDocumento.querySelector('.status-documento');
          if (statusSelect) {
            statusSelect.addEventListener('change', function() {
              toggleDocumentFields(this);
            });
          }

          // Rolar a tela para o novo documento
          setTimeout(() => {
            novoDocumento.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 100);
        }

        return novoDocumento;
      }
    } catch (error) {
      console.error('Erro ao adicionar documento:', error);
    }

    return null;
  }

  // Pesquisar documentos
  function pesquisarDocumentos(query) {
    if (!query) return [];

    query = query.toLowerCase().trim();

    // Filtrar documentos que correspondem à pesquisa
    return documentosPreCadastrados.filter(doc =>
      doc.nome.toLowerCase().includes(query) ||
      (doc.descricao && doc.descricao.toLowerCase().includes(query)) ||
      (doc.palavrasChave && doc.palavrasChave.toLowerCase().includes(query))
    );
  }

  // Exibir resultados da pesquisa
  function exibirResultadosPesquisa(query) {
    // Verificações de segurança
    if (!documentoPesquisa) {
      console.error('Campo de pesquisa não encontrado');
      return;
    }

    // Obter ou criar container de resultados
    let resultadosContainer = document.getElementById('resultados-pesquisa');
    if (!resultadosContainer) {
      console.error('Container de resultados não encontrado');
      return;
    }

    // Limpar conteúdo anterior
    resultadosContainer.innerHTML = '';

    // Se não há query, esconder resultados
    if (!query || query.length < 2) {
      resultadosContainer.classList.add('hidden');
      return;
    }

    // Mostrar container de resultados
    resultadosContainer.classList.remove('hidden');
    resultadosContainer.className = 'max-w-lg mx-auto mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 overflow-hidden';

    // Buscar resultados
    const resultados = pesquisarDocumentos(query);

    // Criar lista de resultados
    const listaResultados = document.createElement('div');
    listaResultados.className = 'max-h-60 overflow-y-auto divide-y divide-gray-100';

    // Adicionar resultados à lista
    if (resultados.length > 0) {
      resultados.forEach(doc => {
        const item = document.createElement('div');
        item.className = 'p-3 hover:bg-gray-50 cursor-pointer transition-colors';

        // Extrair ano da descrição, se possível
        const anoMatch = doc.descricao ? doc.descricao.match(/\b(19|20)\d{2}\b/) : null;
        const anoText = anoMatch ? ` (${anoMatch[0]})` : '';

        item.innerHTML = `
          <div class="font-medium text-gray-800">${doc.nome}${anoText}</div>
          <div class="text-sm text-gray-600 truncate">${doc.descricao || ''}</div>
        `;

        item.addEventListener('click', () => {
          preencherDocumento(doc);
          resultadosContainer.classList.add('hidden');
          documentoPesquisa.value = '';
          documentoPesquisa.focus();
        });

        listaResultados.appendChild(item);
      });
    } else {
      // Mensagem quando não há resultados
      const semResultados = document.createElement('div');
      semResultados.className = 'p-3 text-gray-500 text-center italic';
      semResultados.textContent = 'Nenhum documento encontrado';
      listaResultados.appendChild(semResultados);
    }

    resultadosContainer.appendChild(listaResultados);

    // Sempre adicionar opção para criar novo documento com o texto digitado
    const criarNovoDoc = document.createElement('div');
    criarNovoDoc.className = 'p-3 bg-blue-50 hover:bg-blue-100 cursor-pointer border-t border-blue-200 flex items-center transition-colors';
    criarNovoDoc.innerHTML = `
      <i class="fas fa-plus-circle text-blue-500 mr-2"></i>
      <span class="flex-grow">Criar novo documento: "${query}"</span>
    `;

    criarNovoDoc.addEventListener('click', () => {
      const novoDoc = adicionarNovoDocumento(query);
      resultadosContainer.classList.add('hidden');
      documentoPesquisa.value = '';
      documentoPesquisa.focus();
    });

    resultadosContainer.appendChild(criarNovoDoc);
  }

  // Preencher um documento com dados selecionados
  function preencherDocumento(doc) {
    const novoDocumento = adicionarNovoDocumento();

    if (!novoDocumento) {
      console.error('Erro ao criar novo documento para preenchimento');
      return;
    }

    // Preencher campos
    const nomeInput = novoDocumento.querySelector('.nome-documento');
    const anoInput = novoDocumento.querySelector('.ano-documento');
    const detalhesTextarea = novoDocumento.querySelector('.detalhes-documento');

    // Preencher nome
    if (nomeInput) nomeInput.value = doc.nome || '';

    // Preencher ano se disponível
    if (anoInput) {
      const anoMatch = doc.descricao ? doc.descricao.match(/\b(19|20)\d{2}\b/) : null;
      anoInput.value = anoMatch ? anoMatch[0] : new Date().getFullYear();
    }

    // Preencher detalhes
    if (detalhesTextarea) {
      detalhesTextarea.value = doc.detalhes || doc.descricao || '';
    }
  }

  // Configurar eventos
  function configurarEventos() {
    // Campo de pesquisa
    if (documentoPesquisa) {
      documentoPesquisa.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        if (query.length >= 2) {
          // Mostrar resultados da pesquisa
          exibirResultadosPesquisa(query);
        } else {
          // Esconder resultados quando o campo estiver quase vazio
          const resultadosPesquisa = document.getElementById('resultados-pesquisa');
          if (resultadosPesquisa) {
            resultadosPesquisa.classList.add('hidden');
          }
        }
      });

      // Permitir pressionar Enter para adicionar rapidamente
      documentoPesquisa.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const query = documentoPesquisa.value.trim();
          if (query.length > 0) {
            // Verificar se há resultados selecionados
            const resultadosPesquisa = document.getElementById('resultados-pesquisa');
            const resultadosSelecionados = resultadosPesquisa ?
              resultadosPesquisa.querySelector('.bg-blue-50') : null;

            if (resultadosSelecionados) {
              resultadosSelecionados.click();
            } else {
              // Se não houver selecionado, usar o texto atual
              adicionarNovoDocumento(query);
              documentoPesquisa.value = '';

              // Esconder resultados
              if (resultadosPesquisa) {
                resultadosPesquisa.classList.add('hidden');
              }
            }
          }
        }
      });
    }

    // Botão Voltar
    if (btnBack) {
      btnBack.addEventListener('click', () => {
        if (typeof window.navigateToPrevStep === 'function') {
          window.navigateToPrevStep();
        }
      });
    }

    // Formulário
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();

        try {
          // Coletar dados de todos os documentos
          const documentos = Array.from(documentosContainer.querySelectorAll('.documento-adicionado')).map(el => {
            return {
              nome: el.querySelector('.nome-documento')?.value || '',
              status: el.querySelector('.status-documento')?.value || '',
              ano: el.querySelector('.ano-documento')?.value || '',
              detalhes: el.querySelector('.detalhes-documento')?.value || ''
            };
          });

          // Coletar observações
          const obsTexto = observacoes?.value || '';

          // Aqui você enviaria os dados para o servidor
          console.log('Documentos a serem salvos:', documentos);
          console.log('Observações:', obsTexto);

          // Mostrar mensagem de sucesso
          alert('Dados salvos com sucesso!');
        } catch (error) {
          console.error('Erro ao salvar formulário:', error);
          alert('Ocorreu um erro ao salvar o formulário. Por favor, tente novamente.');
        }
      });
    }
  }

  // Função para alternar visibilidade dos campos baseado no status
  function toggleDocumentFields(selectElement) {
    try {
      if (!selectElement) return;

      const documentoElement = selectElement.closest('.documento-adicionado');
      if (!documentoElement) return;

      const status = selectElement.value;

      // Esconder todos os campos de status primeiro
      documentoElement.querySelectorAll('.document-status-fields').forEach(field => {
        field.classList.add('hidden');
      });

      // Mostrar os campos específicos para o status selecionado
      if (status) {
        const campos = documentoElement.querySelector(`.${status}-fields`);
        if (campos) {
          campos.classList.remove('hidden');
        }
      }
    } catch (error) {
      console.error('Erro ao alternar campos de documento:', error);
    }
  }

  // Inicializar
  configurarEventos();
};
