/**
 * Funções para manipulação de endereços
 * Implementação otimizada para busca de cidades e CEP
 */

// Função para consultar CEP via API ViaCEP e preencher campos
function consultarCEP(cep) {
  // Limpar formatação do CEP
  cep = cep.replace(/\D/g, '');

  if (cep.length !== 8) return false;

  // Remover mensagens de validação anteriores
  const cepInput = document.getElementById('cep');
  if (cepInput) {
    const parentDiv = cepInput.parentElement;
    const prevMessage = parentDiv.querySelector('.validation-message');
    if (prevMessage) prevMessage.remove();
  }

  // Usar a API do ViaCEP, que já está funcionando sem CORS
  fetch(`https://viacep.com.br/ws/${cep}/json/`)
    .then(response => response.json())
    .then(data => {
      if (data.erro) {
        console.log("CEP não encontrado");
        return;
      }

      // Preencher os campos com os dados retornados
      const fields = {
        'endereco': data.logradouro || '',
        'bairro': data.bairro || '',
        'cidade': data.localidade || '',
        'uf': data.uf || ''
      };

      // Preencher e destacar campos
      Object.keys(fields).forEach(id => {
        const field = document.getElementById(id);
        if (field) {
          field.value = fields[id];
          field.classList.add('field-filled');
        }
      });

      // Focar no campo número após preenchimento
      document.getElementById('numero')?.focus();
    })
    .catch(error => {
      console.error('Erro ao consultar CEP:', error);
    });

  return true;
}

// Cache para armazenar consultas de estados e cidades
const cacheAPI = {
  estados: null,
  cidades: {},

  // Buscar todos os estados do Brasil via API do IBGE
  async getEstados() {
    if (this.estados) return this.estados;

    try {
      const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome');
      this.estados = await response.json();
      return this.estados;
    } catch (error) {
      console.error('Erro ao buscar estados:', error);
      return [];
    }
  },

  // Buscar cidades de um estado específico via API do IBGE
  async getCidades(uf) {
    if (this.cidades[uf]) return this.cidades[uf];

    try {
      const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`);
      this.cidades[uf] = await response.json();
      return this.cidades[uf];
    } catch (error) {
      console.error(`Erro ao buscar cidades de ${uf}:`, error);
      return [];
    }
  }
};

/**
 * Função para buscar cidades com base no texto digitado
 * Usa a API do IBGE que não tem problemas de CORS
 * @param {HTMLInputElement} input - Campo de entrada da cidade
 */
async function buscarCidades(input) {
  const texto = input.value.trim().toLowerCase();

  // Remover dropdowns anteriores
  removerDropdownAnterior();

  // Não mostrar dropdown para menos de 2 caracteres
  if (texto.length < 2) return;

  // Criar o container do dropdown
  const dropdown = criarDropdown(input);

  // Adicionar indicador de carregamento
  adicionarIndicadorCarregamento(dropdown);

  try {
    // Obter lista de estados para busca
    const estados = await cacheAPI.getEstados();

    // Se temos um UF específico, buscar apenas naquele estado
    const ufInput = document.getElementById('uf');
    const ufValue = ufInput?.value.trim().toUpperCase();

    // Array para armazenar resultados
    let resultados = [];

    if (ufValue && ufValue.length === 2) {
      // Buscar apenas no estado selecionado
      const estado = estados.find(e => e.sigla === ufValue);
      if (estado) {
        const cidades = await cacheAPI.getCidades(estado.id);
        resultados = filtrarCidades(cidades, texto);
      }
    } else {
      // Buscar em todos os estados, começando pelos mais populosos
      const estadosPrioritarios = ['SP', 'RJ', 'MG', 'BA', 'RS', 'PR', 'PE', 'CE', 'SC'];

      for (const sigla of estadosPrioritarios) {
        const estado = estados.find(e => e.sigla === sigla);
        if (!estado) continue;

        const cidades = await cacheAPI.getCidades(estado.id);
        const cidadesFiltradas = filtrarCidades(cidades, texto);

        // Adicionar ao resultado total
        resultados = [...resultados, ...cidadesFiltradas];

        // Limitar a 10 resultados no total
        if (resultados.length >= 10) break;
      }

      // Limitar a 10 resultados
      resultados = resultados.slice(0, 10);
    }

    // Remover indicador de carregamento
    removerIndicadorCarregamento(dropdown);

    // Exibir resultados ou mensagem de não encontrado
    if (resultados.length > 0) {
      exibirResultadosCidades(resultados, input, dropdown);
    } else {
      exibirMensagemNenhumResultado(dropdown);
    }

  } catch (error) {
    console.error('Erro ao buscar cidades:', error);
    removerIndicadorCarregamento(dropdown);
    exibirMensagemErro(dropdown);
  }
}

/**
 * Filtra as cidades com base no texto digitado
 * @param {Array} cidades - Lista de cidades para filtrar
 * @param {string} texto - Texto para filtragem
 * @returns {Array} Cidades filtradas
 */
function filtrarCidades(cidades, texto) {
  const textoNormalizado = removerAcentos(texto.toLowerCase());

  return cidades
    .filter(cidade => {
      const nomeNormalizado = removerAcentos(cidade.nome.toLowerCase());
      return nomeNormalizado.includes(textoNormalizado);
    })
    .map(cidade => ({
      nome: cidade.nome,
      uf: cidade.microrregiao?.mesorregiao?.UF.sigla || ''
    }))
    .sort((a, b) => {
      // Cidades que começam com o texto digitado primeiro
      const aNome = removerAcentos(a.nome.toLowerCase());
      const bNome = removerAcentos(b.nome.toLowerCase());

      const aComecaCom = aNome.startsWith(textoNormalizado);
      const bComecaCom = bNome.startsWith(textoNormalizado);

      if (aComecaCom && !bComecaCom) return -1;
      if (!aComecaCom && bComecaCom) return 1;

      // Depois ordenar alfabeticamente
      return a.nome.localeCompare(b.nome);
    })
    .slice(0, 10); // Limitar a 10 resultados por estado
}

/**
 * Cria o dropdown para sugestões de cidades
 * @param {HTMLInputElement} input - Campo de entrada
 * @returns {HTMLElement} Elemento do dropdown
 */
function criarDropdown(input) {
  const parentDiv = input.parentElement;

  // Remover dropdown anterior se existir
  removerDropdownAnterior();

  // Criar novo dropdown
  const dropdown = document.createElement('div');
  dropdown.id = 'cidade-dropdown';
  dropdown.className = 'cidade-dropdown absolute z-50 bg-white w-full border border-gray-300 rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto';

  // Adicionar ao DOM
  parentDiv.appendChild(dropdown);

  // Configurar evento para fechar dropdown ao clicar fora
  setTimeout(() => {
    document.addEventListener('click', fecharDropdownAoClicarFora);
  }, 10);

  return dropdown;
}

/**
 * Remove elementos de dropdown anterior
 */
function removerDropdownAnterior() {
  const dropdown = document.getElementById('cidade-dropdown');
  if (dropdown) dropdown.remove();
}

/**
 * Adiciona indicador de carregamento ao dropdown
 * @param {HTMLElement} dropdown - Elemento do dropdown
 */
function adicionarIndicadorCarregamento(dropdown) {
  dropdown.innerHTML = '<div class="px-4 py-2 text-center text-blue-500"><i class="fas fa-spinner fa-spin"></i> Buscando cidades...</div>';
}

/**
 * Remove o indicador de carregamento
 * @param {HTMLElement} dropdown - Elemento do dropdown
 */
function removerIndicadorCarregamento(dropdown) {
  dropdown.innerHTML = '';
}

/**
 * Exibe mensagem quando nenhum resultado for encontrado
 * @param {HTMLElement} dropdown - Elemento do dropdown
 */
function exibirMensagemNenhumResultado(dropdown) {
  dropdown.innerHTML = '<div class="px-4 py-2 text-center text-gray-500">Nenhuma cidade encontrada</div>';
}

/**
 * Exibe mensagem de erro
 * @param {HTMLElement} dropdown - Elemento do dropdown
 */
function exibirMensagemErro(dropdown) {
  dropdown.innerHTML = '<div class="px-4 py-2 text-center text-red-500">Erro ao buscar cidades</div>';
}

/**
 * Exibe os resultados das cidades no dropdown
 * @param {Array} resultados - Lista de cidades para exibir
 * @param {HTMLInputElement} input - Campo de entrada
 * @param {HTMLElement} dropdown - Elemento do dropdown
 */
function exibirResultadosCidades(resultados, input, dropdown) {
  // Limpar conteúdo anterior
  dropdown.innerHTML = '';

  // Criar item para cada resultado
  resultados.forEach(cidade => {
    const item = document.createElement('div');
    item.className = 'cidade-item px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center justify-between';

    item.innerHTML = `
      <div class="flex-grow">
        <span class="text-gray-800 font-medium">${cidade.nome}</span>
      </div>
      <span class="text-gray-500 ml-2 text-sm font-semibold">${cidade.uf}</span>
    `;

    // Adicionar evento de clique
    item.addEventListener('click', () => {
      selecionarCidade(cidade, input);
      dropdown.classList.add('hidden');
    });

    // Adicionar ao dropdown
    dropdown.appendChild(item);
  });

  // Exibir o dropdown
  dropdown.classList.remove('hidden');
}

/**
 * Fecha o dropdown ao clicar fora dele
 * @param {Event} event - Evento de clique
 */
function fecharDropdownAoClicarFora(event) {
  const dropdown = document.getElementById('cidade-dropdown');
  const cidadeInput = document.getElementById('cidade');

  if (dropdown && cidadeInput && !dropdown.contains(event.target) && !cidadeInput.contains(event.target)) {
    dropdown.remove();
    document.removeEventListener('click', fecharDropdownAoClicarFora);
  }
}

/**
 * Aplica a seleção de cidade aos campos do formulário
 * @param {Object} cidade - Objeto com dados da cidade
 * @param {HTMLInputElement} input - Campo de entrada da cidade
 */
function selecionarCidade(cidade, input) {
  // Preencher cidade
  input.value = cidade.nome;
  input.classList.add('field-filled');

  // Preencher UF
  const ufInput = document.getElementById('uf');
  if (ufInput && cidade.uf) {
    ufInput.value = cidade.uf;
    ufInput.classList.add('field-filled');
  }

  // Como não podemos buscar o CEP por causa do CORS, apenas destacamos o campo para o usuário
  // e mostramos uma mensagem incentivando a completar o CEP
  const cepInput = document.getElementById('cep');
  if (cepInput) {
    // Limpar o campo para não manter valores antigos
    cepInput.value = '';

    // Focar no campo CEP para que o usuário possa digitá-lo
    setTimeout(() => {
      cepInput.focus();

      // Adicionar mensagem transitória como placeholder
      const originalPlaceholder = cepInput.placeholder;
      cepInput.placeholder = "Digite o CEP para completar";

      // Restaurar o placeholder original depois de um tempo
      setTimeout(() => {
        cepInput.placeholder = originalPlaceholder;
      }, 3000);

      // Adicionar classe visual transitória para chamar atenção
      cepInput.classList.add('cep-highlight');
      setTimeout(() => {
        cepInput.classList.remove('cep-highlight');
      }, 1500);
    }, 100);
  }
}

/**
 * Remove acentos de um texto
 * @param {string} texto - Texto para normalizar
 * @returns {string} Texto sem acentos
 */
function removerAcentos(texto) {
  if (!texto) return '';
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Aplica máscara ao CEP
 * @param {HTMLInputElement} input - Campo de entrada do CEP
 */
function maskCEP(input) {
  let value = input.value.replace(/\D/g, '');
  if (value.length > 8) value = value.substring(0, 8);

  if (value.length > 5) {
    value = value.replace(/^(\d{5})(\d)/, '$1-$2');
  }

  input.value = value;

  // Se digitar todos os 8 dígitos, consultar CEP automaticamente
  if (value.replace(/\D/g, '').length === 8) {
    consultarCEP(value);
  }
}

// Exportar funções para uso global
window.consultarCEP = consultarCEP;
window.buscarCidades = buscarCidades;
window.maskCEP = maskCEP;
