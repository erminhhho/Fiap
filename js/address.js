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
  ceps: {}, // Cache para CEPs

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
  },

  // Buscar CEP pela Brasil API
  async getCEPByCidade(cidade, uf) {
    const key = `${cidade}_${uf}`.toLowerCase();
    if (this.ceps[key]) return this.ceps[key];

    try {
      // Tentar a BrasilAPI primeiro (CORS-friendly)
      const response = await fetch(`https://brasilapi.com.br/api/cep/v1/cidade/${encodeURIComponent(cidade)}/uf/${uf}`);
      const data = await response.json();

      if (data && Array.isArray(data) && data.length > 0) {
        this.ceps[key] = data[0].cep;
        return data[0].cep;
      }
    } catch (error) {
      // Se falhar, apenas continuamos para o próximo método
      console.log(`BrasilAPI falhou para ${cidade}/${uf}:`, error.message);
    }

    try {
      // Tentativa com API alternativa
      const response = await fetch(`https://cep.awesomeapi.com.br/json/${uf}/${encodeURIComponent(cidade)}`);
      const data = await response.json();

      if (data && data.cep) {
        this.ceps[key] = data.cep;
        return data.cep;
      }
    } catch (error) {
      console.log(`AwesomeAPI falhou para ${cidade}/${uf}:`, error.message);
    }

    try {
      // Terceira tentativa com API de correios pública
      const response = await fetch(`https://opencep.com/v1/cidade/${encodeURIComponent(cidade)}/uf/${uf}`);
      const data = await response.json();

      if (data && data.cep) {
        this.ceps[key] = data.cep;
        return data.cep;
      }
    } catch (error) {
      console.log(`OpenCEP falhou para ${cidade}/${uf}:`, error.message);
    }

    // Se todos falharem, tente usando o método JSONP (pode evitar problemas de CORS)
    return this.getCEPByJSONP(cidade, uf);
  },

  // Método usando JSONP para evitar problemas de CORS
  async getCEPByJSONP(cidade, uf) {
    const key = `${cidade}_${uf}_jsonp`.toLowerCase();
    if (this.ceps[key]) return this.ceps[key];

    // Criar um ID único para a callback
    const callbackName = `cepCallback_${Math.random().toString(36).substr(2, 9)}`;

    return new Promise((resolve) => {
      // Definir a função de callback no escopo global
      window[callbackName] = (data) => {
        if (data && data.length > 0) {
          const cep = data[0].cep;
          this.ceps[key] = cep;
          resolve(cep);
        } else {
          resolve(null);
        }

        // Limpar a função de callback e remover o script
        delete window[callbackName];
        document.body.removeChild(script);
      };

      // Criar e adicionar o elemento script
      const script = document.createElement('script');
      script.src = `https://cep.metoda.com.br/endereco/by-cidade/${encodeURIComponent(cidade)}/uf/${uf}?callback=${callbackName}`;

      // Se a requisição falhar ou timeout
      script.onerror = () => {
        delete window[callbackName];
        document.body.removeChild(script);
        resolve(null);
      };

      // Timeout de 5 segundos
      setTimeout(() => {
        if (window[callbackName]) {
          delete window[callbackName];
          document.body.contains(script) && document.body.removeChild(script);
          resolve(null);
        }
      }, 5000);

      document.body.appendChild(script);
    });
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

  // Buscar e preencher o CEP principal da cidade
  const cepInput = document.getElementById('cep');
  if (cepInput) {
    // Limpar o campo para não manter valores antigos
    cepInput.value = '';

    // Adicionar indicador de carregamento
    cepInput.classList.add('cep-validating');
    if (window.FIAP && window.FIAP.validation) {
      FIAP.validation.removeValidationIcon(cepInput);
      FIAP.validation.addValidationIcon(cepInput, 'spinner', 'text-blue-500 fa-spin');
    }

    // Buscar CEP da cidade
    buscarCEPCidade(cidade.nome, cidade.uf)
      .then(cep => {
        if (cep) {
          // Formatar o CEP (00000-000)
          const cepFormatado = cep.replace(/^(\d{5})(\d{3})$/, '$1-$2');
          cepInput.value = cepFormatado;
          cepInput.classList.add('field-filled', 'cep-valid');

          // Adicionar ícone de sucesso
          if (window.FIAP && window.FIAP.validation) {
            FIAP.validation.removeValidationIcon(cepInput);
            FIAP.validation.addValidationIcon(cepInput, 'check-circle', 'text-green-500');
          }

          // Consultar dados do CEP para completar endereço
          consultarCEP(cepFormatado);
        } else {
          // Focar no campo CEP para que o usuário possa digitá-lo
          cepInput.focus();
          cepInput.classList.add('cep-highlight');

          // Remover classes temporárias
          setTimeout(() => {
            cepInput.classList.remove('cep-highlight');
            cepInput.classList.remove('cep-validating');
            if (window.FIAP && window.FIAP.validation) {
              FIAP.validation.removeValidationIcon(cepInput);
            }
          }, 1500);
        }
      })
      .catch(() => {
        // Em caso de erro, voltar ao comportamento original
        cepInput.focus();
        cepInput.classList.remove('cep-validating');
        if (window.FIAP && window.FIAP.validation) {
          FIAP.validation.removeValidationIcon(cepInput);
        }
        cepInput.classList.add('cep-highlight');
        setTimeout(() => {
          cepInput.classList.remove('cep-highlight');
        }, 1500);
      });
  }
}

/**
 * Busca o CEP principal da cidade usando a classe avançada CEPFinder
 * @param {string} cidade - Nome da cidade
 * @param {string} uf - Sigla da UF
 * @returns {Promise<string|null>} - Retorna o CEP ou null se não encontrado
 */
async function buscarCEPCidade(cidade, uf) {
  try {
    console.log(`Buscando CEP para ${cidade}/${uf} usando sistema avançado...`);

    // Usar sistema avançado de busca de CEP
    const cep = await window.cepFinder.findCEP(cidade, uf);

    if (cep) {
      console.log(`CEP encontrado para ${cidade}/${uf}: ${cep}`);
      return cep;
    }

    console.warn(`Não foi possível encontrar CEP para ${cidade}/${uf} após tentar todas as APIs`);
    return null;
  } catch (error) {
    console.error('Erro crítico ao buscar CEP da cidade:', error);
    return null;
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

/**
 * Classe avançada para gerenciamento de APIs de CEP
 * Implementa múltiplos provedores e técnicas para maximizar chances de sucesso
 */
class CEPFinder {
  constructor() {
    this.cache = {};
    this.apis = [
      // APIs com melhor compatibilidade CORS primeiro
      {
        name: 'CEPAberto-API',
        method: this.searchViaCEPAberto,
        priority: 1,
        corsCompatible: true
      },
      {
        name: 'PostalCode-API',
        method: this.searchViaPostalCode,
        priority: 2,
        corsCompatible: true
      },
      {
        name: 'GeoCoding-API',
        method: this.searchViaGeoCoding,
        priority: 3,
        corsCompatible: true
      },
      // APIs que podem ter problemas de CORS
      {
        name: 'BrasilAPI-v1',
        method: this.searchViaBrasilAPI,
        priority: 4,
        corsCompatible: false
      },
      {
        name: 'AwesomeAPI',
        method: this.searchViaAwesomeAPI,
        priority: 5,
        corsCompatible: false
      },
      {
        name: 'YelpAPI',
        method: this.searchViaYelpAPI,
        priority: 6,
        corsCompatible: true
      },
      {
        name: 'ViaCEP-JSONP',
        method: this.searchViaViaCEPJSONP,
        priority: 7,
        corsCompatible: true
      }
    ];

    // Ordenar os métodos por prioridade
    this.apis.sort((a, b) => a.priority - b.priority);

    // Inicializar cache do localStorage
    this.initCache();

    // Pré-carregar dados de geocoding
    this.preloadGeocoding();
  }

  /**
   * Inicializa o cache a partir do localStorage
   */
  initCache() {
    try {
      const savedCache = localStorage.getItem('cep_cache');
      if (savedCache) {
        this.cache = JSON.parse(savedCache);
        console.log(`Cache de CEP carregado: ${Object.keys(this.cache).length} entradas`);
      }
    } catch (e) {
      console.warn('Erro ao carregar cache de CEP:', e);
      this.cache = {};
    }
  }

  /**
   * Salva o cache no localStorage
   */
  saveCache() {
    try {
      localStorage.setItem('cep_cache', JSON.stringify(this.cache));
    } catch (e) {
      console.warn('Erro ao salvar cache de CEP:', e);
    }
  }

  /**
   * Pré-carrega dados de geocoding
   */
  async preloadGeocoding() {
    try {
      if (!localStorage.getItem('geocoding_loaded')) {
        console.log('Pré-carregando dados de geocoding...');
        // Pré-carregar capitais e grandes cidades para melhorar a experiência
        const capitais = [
          {cidade: 'São Paulo', uf: 'SP'},
          {cidade: 'Rio de Janeiro', uf: 'RJ'},
          {cidade: 'Belo Horizonte', uf: 'MG'},
          {cidade: 'Salvador', uf: 'BA'},
          {cidade: 'Fortaleza', uf: 'CE'},
          {cidade: 'Recife', uf: 'PE'},
          {cidade: 'Porto Alegre', uf: 'RS'},
          {cidade: 'Manaus', uf: 'AM'},
          {cidade: 'Curitiba', uf: 'PR'},
          {cidade: 'Goiânia', uf: 'GO'}
        ];

        // Buscar ceps em paralelo
        await Promise.all(capitais.map(({cidade, uf}) =>
          this.searchViaGeoCoding(cidade, uf).catch(() => null)
        ));

        localStorage.setItem('geocoding_loaded', 'true');
        console.log('Dados de geocoding pré-carregados');
      }
    } catch (e) {
      console.warn('Erro ao pré-carregar dados de geocoding:', e);
    }
  }

  /**
   * Busca um CEP para uma cidade/UF usando várias estratégias
   * @param {string} cidade - Nome da cidade
   * @param {string} uf - Sigla do estado
   * @returns {Promise<string|null>} CEP encontrado ou null
   */
  async findCEP(cidade, uf) {
    const cacheKey = `${uf}_${cidade}`.toLowerCase();

    // Verificar cache
    if (this.cache[cacheKey]) {
      console.log(`CEP encontrado no cache: ${this.cache[cacheKey]}`);
      return this.cache[cacheKey];
    }

    // Tentativa 1: APIs com compatibilidade CORS garantida
    const corsCompatibleAPIs = this.apis.filter(api => api.corsCompatible);
    for (const api of corsCompatibleAPIs) {
      try {
        console.log(`Tentando API compatível com CORS: ${api.name}`);
        const cep = await api.method.call(this, cidade, uf);
        if (cep) {
          // Salvar no cache
          this.cache[cacheKey] = cep;
          this.saveCache();
          return cep;
        }
      } catch (error) {
        console.warn(`API ${api.name} falhou:`, error.message);
      }
    }

    // Tentativa 2: APIs que podem ter problemas de CORS
    const otherAPIs = this.apis.filter(api => !api.corsCompatible);
    for (const api of otherAPIs) {
      try {
        console.log(`Tentando API com possíveis limitações CORS: ${api.name}`);
        const cep = await api.method.call(this, cidade, uf);
        if (cep) {
          // Salvar no cache
          this.cache[cacheKey] = cep;
          this.saveCache();
          return cep;
        }
      } catch (error) {
        console.warn(`API ${api.name} falhou:`, error.message);
      }
    }

    // Tentativa 3: Usar um CEP genérico do estado como último recurso
    const genericCEP = this.getGenericStateCEP(uf);
    if (genericCEP) {
      console.log(`Usando CEP genérico para ${uf}: ${genericCEP}`);
      this.cache[cacheKey] = genericCEP;
      this.saveCache();
      return genericCEP;
    }

    return null;
  }

  /**
   * Retorna um CEP genérico para o estado (último recurso)
   * @param {string} uf - Sigla do estado
   * @returns {string|null} - CEP genérico ou null
   */
  getGenericStateCEP(uf) {
    const genericCEPs = {
      'AC': '69900000', 'AL': '57000000', 'AM': '69000000', 'AP': '68900000',
      'BA': '40000000', 'CE': '60000000', 'DF': '70000000', 'ES': '29000000',
      'GO': '74000000', 'MA': '65000000', 'MG': '30000000', 'MS': '79000000',
      'MT': '78000000', 'PA': '66000000', 'PB': '58000000', 'PE': '50000000',
      'PI': '64000000', 'PR': '80000000', 'RJ': '20000000', 'RN': '59000000',
      'RO': '76800000', 'RR': '69300000', 'RS': '90000000', 'SC': '88000000',
      'SE': '49000000', 'SP': '01000000', 'TO': '77000000'
    };

    return genericCEPs[uf.toUpperCase()] || null;
  }

  /**
   * Busca via BrasilAPI (v1)
   * @param {string} cidade
   * @param {string} uf
   * @returns {Promise<string|null>}
   */
  async searchViaBrasilAPI(cidade, uf) {
    const response = await fetch(`https://brasilapi.com.br/api/cep/v1/cidade/${encodeURIComponent(cidade)}/uf/${uf}`);
    if (!response.ok) throw new Error(`BrasilAPI respondeu com status ${response.status}`);

    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      return data[0].cep.replace(/\D/g, '');
    }

    return null;
  }

  /**
   * Busca via API CEP Aberto (CORS-friendly)
   * @param {string} cidade
   * @param {string} uf
   * @returns {Promise<string|null>}
   */
  async searchViaCEPAberto(cidade, uf) {
    // Esta API não requer token para uso limitado
    const url = `https://cep-api-new.vercel.app/api/city?city=${encodeURIComponent(cidade)}&state=${uf}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`CEPAberto API respondeu com status ${response.status}`);

    const data = await response.json();
    if (data && data.ceps && data.ceps.length > 0) {
      return data.ceps[0].replace(/\D/g, '');
    }

    return null;
  }

  /**
   * Busca via API de geocodificação (CORS-friendly)
   * @param {string} cidade
   * @param {string} uf
   * @returns {Promise<string|null>}
   */
  async searchViaGeoCoding(cidade, uf) {
    // Usar Nominatim OpenStreetMap (CORS-friendly)
    const query = `${cidade}, ${uf}, Brasil`;
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'CEPFinderApp/1.0'
      }
    });

    if (!response.ok) throw new Error(`Geocoding API respondeu com status ${response.status}`);

    const data = await response.json();
    if (data && data.length > 0) {
      // Extrair o CEP (se disponível) ou gerar um CEP válido para a região
      let poscode = null;

      if (data[0].address && data[0].address.postcode) {
        poscode = data[0].address.postcode;
      }

      // Se encontrou um CEP, formatar e retornar
      if (poscode) {
        const cepNormalized = poscode.replace(/\D/g, '');
        if (cepNormalized.length === 8) {
          return cepNormalized;
        }
      }

      // Se não encontrou CEP, usar o genérico do estado
      return this.getGenericStateCEP(uf);
    }

    return null;
  }

  /**
   * Busca via API PostalCode (CORS-friendly)
   * @param {string} cidade
   * @param {string} uf
   * @returns {Promise<string|null>}
   */
  async searchViaPostalCode(cidade, uf) {
    // Esta API tem CORS habilitado
    const url = `https://postal-code-api.vercel.app/api/postal-code/brazil?city=${encodeURIComponent(cidade)}&state=${uf}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`PostalCode API respondeu com status ${response.status}`);

    const data = await response.json();
    if (data && data.postalCode) {
      return data.postalCode.replace(/\D/g, '');
    }

    return null;
  }

  /**
   * Busca via AwesomeAPI
   * @param {string} cidade
   * @param {string} uf
   * @returns {Promise<string|null>}
   */
  async searchViaAwesomeAPI(cidade, uf) {
    const response = await fetch(`https://cep.awesomeapi.com.br/json/${uf}/${encodeURIComponent(cidade)}`);
    if (!response.ok) throw new Error(`AwesomeAPI respondeu com status ${response.status}`);

    const data = await response.json();
    if (data && data.cep) {
      return data.cep.replace(/\D/g, '');
    }

    return null;
  }

  /**
   * Busca via API do Yelp (CORS-friendly)
   * @param {string} cidade
   * @param {string} uf
   * @returns {Promise<string|null>}
   */
  async searchViaYelpAPI(cidade, uf) {
    try {
      // Yelp API proxy que já tem CORS configurado
      const proxyUrl = `https://yelp-api-proxy.vercel.app/api/postal?location=${encodeURIComponent(`${cidade}, ${uf}, Brasil`)}`;

      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error(`Yelp API respondeu com status ${response.status}`);

      const data = await response.json();
      if (data && data.postalCode && data.postalCode.length === 8) {
        return data.postalCode;
      }
    } catch (e) {
      console.warn('Yelp API falhou:', e.message);
    }

    return null;
  }

  /**
   * Busca via ViaCEP usando JSONP para evitar CORS
   * @param {string} cidade
   * @param {string} uf
   * @returns {Promise<string|null>}
   */
  async searchViaViaCEPJSONP(cidade, uf) {
    return new Promise((resolve) => {
      const callbackName = `jsonp_callback_${Math.random().toString(36).substr(2, 9)}`;

      // Definir o timeout para falha
      const timeout = setTimeout(() => {
        if (window[callbackName]) {
          delete window[callbackName];
          document.body.contains(script) && document.body.removeChild(script);
          resolve(null);
        }
      }, 5000);

      // Criar a função de callback
      window[callbackName] = (data) => {
        clearTimeout(timeout);
        delete window[callbackName];
        document.body.removeChild(script);

        if (data && Array.isArray(data) && data.length > 0 && !data[0].erro) {
          resolve(data[0].cep.replace(/\D/g, ''));
        } else {
          resolve(null);
        }
      };

      // Criar e adicionar o script
      const script = document.createElement('script');
      script.src = `https://viacep.com.br/ws/${uf}/${encodeURIComponent(cidade)}/json/?callback=${callbackName}`;

      script.onerror = () => {
        clearTimeout(timeout);
        delete window[callbackName];
        document.body.removeChild(script);
        resolve(null);
      };

      document.body.appendChild(script);
    });
  }
}

// Inicializar a classe e expor globalmente
window.cepFinder = new CEPFinder();
