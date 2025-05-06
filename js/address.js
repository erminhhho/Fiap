/**
 * Funções para manipulação de endereços
 * Migrado do address.js original
 */

// Função para consultar CEP via API ViaCEP e preencher campos
// Esta função substitui partes da função consultarCEP em utils.js
function buscarEndereco(cep) {
  // Limpar formatação do CEP
  cep = cep.replace(/\D/g, '');

  if (cep.length !== 8) return false;

  const url = `https://viacep.com.br/ws/${cep}/json/`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.erro) {
        alert('CEP não encontrado');
        return;
      }

      // Preencher os campos com os dados retornados
      document.getElementById('endereco').value = data.logradouro || '';
      document.getElementById('bairro').value = data.bairro || '';
      document.getElementById('cidade').value = data.localidade || '';
      document.getElementById('uf').value = data.uf || '';

      // Destacar campos preenchidos
      document.getElementById('endereco').classList.add('field-filled');
      document.getElementById('bairro').classList.add('field-filled');
      document.getElementById('cidade').classList.add('field-filled');
      document.getElementById('uf').classList.add('field-filled');

      // Focar no campo número
      document.getElementById('numero').focus();
    })
    .catch(error => {
      console.error('Erro ao consultar CEP:', error);
      alert('Erro ao consultar CEP. Tente novamente mais tarde.');
    });

  return true;
}

// Função para formatar CEP com máscara
function formatarCEP(input) {
  let value = input.value.replace(/\D/g, '');
  if (value.length > 8) value = value.substring(0, 8);

  if (value.length > 5) {
    value = value.replace(/^(\d{5})(\d)/, '$1-$2');
  }

  input.value = value;
}

// Cache temporário de resultados de pesquisa de cidades
const cacheCidades = {};

/**
 * Busca cidades pela API do ViaCEP baseado no texto digitado
 * @param {HTMLInputElement} input - Campo de entrada da cidade
 */
function buscarCidades(input) {
  const texto = input.value.trim();

  // Remover dropdowns anteriores
  removerDropdownAnterior();

  // Só buscar quando tiver pelo menos 3 caracteres
  if (texto.length < 3) return;

  // Verificar cache antes de fazer requisição
  const cacheKey = texto.toLowerCase();
  if (cacheCidades[cacheKey]) {
    mostrarResultadosCidades(cacheCidades[cacheKey], input);
    return;
  }

  // Criar e mostrar indicador de carregamento
  const loadingIndicator = criarIndicadorCarregamento(input);

  // Tentar encontrar o campo UF para restringir a busca
  const ufInput = document.getElementById('uf');
  let uf = '';

  if (ufInput && ufInput.value.trim().length === 2) {
    uf = ufInput.value.trim().toUpperCase();
  }

  // Montar URL da API - se tiver UF, limitar a busca ao estado
  const apiURL = uf
    ? `https://viacep.com.br/ws/${uf}/${texto}/json/`
    : `https://viacep.com.br/ws/RS/${texto}/json/`; // Estado padrão para busca inicial

  // Fazer a requisição à API
  fetch(apiURL)
    .then(response => {
      if (!response.ok) throw new Error('Erro na API');
      return response.json();
    })
    .then(data => {
      // Remover indicador de carregamento
      loadingIndicator.remove();

      if (!Array.isArray(data) || data.length === 0) {
        // Se não encontrou resultados no estado específico, tentar em outro estado
        if (uf) {
          buscarCidadesEmOutrosEstados(texto, input);
        }
        return;
      }

      // Processar dados para formato uniforme
      const resultados = processarResultadosCidades(data);

      // Armazenar em cache
      cacheCidades[cacheKey] = resultados;

      // Mostrar resultados
      mostrarResultadosCidades(resultados, input);
    })
    .catch(error => {
      console.error('Erro ao buscar cidades:', error);
      loadingIndicator.remove();

      // Se falhou com UF específica, tentar sem UF
      if (uf) {
        buscarCidadesEmOutrosEstados(texto, input);
      }
    });
}

/**
 * Busca cidades em outros estados quando não há resultados no estado atual
 * @param {string} texto - Texto digitado pelo usuário
 * @param {HTMLInputElement} input - Campo de entrada
 */
function buscarCidadesEmOutrosEstados(texto, input) {
  // Estados com maior população para priorizar na busca
  const estadosPrioritarios = ['SP', 'RJ', 'MG', 'BA', 'RS', 'PR'];

  // Tentar buscar no primeiro estado prioritário
  const estado = estadosPrioritarios[0];
  const apiURL = `https://viacep.com.br/ws/${estado}/${texto}/json/`;

  // Indicador de carregamento
  const loadingIndicator = criarIndicadorCarregamento(input);

  fetch(apiURL)
    .then(response => {
      if (!response.ok) throw new Error('Erro na API');
      return response.json();
    })
    .then(data => {
      loadingIndicator.remove();

      if (!Array.isArray(data) || data.length === 0) return;

      // Processar dados para formato uniforme
      const resultados = processarResultadosCidades(data);

      // Armazenar em cache
      const cacheKey = texto.toLowerCase();
      cacheCidades[cacheKey] = resultados;

      // Mostrar resultados
      mostrarResultadosCidades(resultados, input);
    })
    .catch(error => {
      console.error('Erro ao buscar cidades em outros estados:', error);
      loadingIndicator.remove();
    });
}

/**
 * Processa os resultados da API para um formato uniforme
 * @param {Array} data - Dados da API
 * @returns {Array} - Dados processados
 */
function processarResultadosCidades(data) {
  // Extrair cidades únicas dos resultados
  const cidadesMap = {};

  data.forEach(item => {
    const cidadeKey = `${item.localidade}-${item.uf}`;

    if (!cidadesMap[cidadeKey]) {
      cidadesMap[cidadeKey] = {
        nome: item.localidade,
        uf: item.uf,
        cep: item.cep,
        bairro: item.bairro
      };
    }
  });

  // Converter para array
  return Object.values(cidadesMap)
    .sort((a, b) => a.nome.localeCompare(b.nome))
    .slice(0, 10); // Limitar a 10 resultados
}

/**
 * Cria indicador de carregamento
 * @param {HTMLInputElement} input - Campo de entrada
 * @returns {HTMLElement} - Elemento do indicador
 */
function criarIndicadorCarregamento(input) {
  const parentDiv = input.parentElement;
  const loadingIndicator = document.createElement('div');

  loadingIndicator.className = 'absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500';
  loadingIndicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  loadingIndicator.id = 'cidade-loading';

  parentDiv.appendChild(loadingIndicator);
  return loadingIndicator;
}

/**
 * Remove qualquer dropdown existente
 */
function removerDropdownAnterior() {
  const dropdownExistente = document.getElementById('cidade-dropdown');
  if (dropdownExistente) {
    dropdownExistente.remove();
  }

  const loadingExistente = document.getElementById('cidade-loading');
  if (loadingExistente) {
    loadingExistente.remove();
  }
}

/**
 * Mostra os resultados das cidades encontradas
 * @param {Array} resultados - Lista de cidades
 * @param {HTMLInputElement} input - Campo de entrada
 */
function mostrarResultadosCidades(resultados, input) {
  if (!resultados || resultados.length === 0) return;

  const parentDiv = input.parentElement;

  // Criar dropdown
  const dropdown = document.createElement('div');
  dropdown.id = 'cidade-dropdown';
  dropdown.className = 'cidade-dropdown absolute z-50 bg-white w-full border border-gray-300 rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto';
  parentDiv.appendChild(dropdown);

  // Criar itens para cada resultado
  resultados.forEach(cidade => {
    const item = document.createElement('div');
    item.className = 'cidade-item px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center';

    // Estrutura do item
    item.innerHTML = `
      <div class="flex-grow">
        <span class="text-gray-800 font-medium">${cidade.nome}</span>
      </div>
      <span class="text-gray-500 text-sm font-semibold">${cidade.uf}</span>
    `;

    // Adicionar ao dropdown
    dropdown.appendChild(item);

    // Adicionar evento de clique
    item.addEventListener('click', () => {
      selecionarCidade(cidade, input);
      dropdown.classList.add('hidden');
    });
  });

  // Mostrar o dropdown
  dropdown.classList.remove('hidden');

  // Fechar dropdown ao clicar fora
  document.addEventListener('click', fecharDropdownAoClicarFora);
}

/**
 * Fecha o dropdown quando clica fora
 * @param {Event} event - Evento de clique
 */
function fecharDropdownAoClicarFora(event) {
  const dropdown = document.getElementById('cidade-dropdown');
  const cidadeInput = document.getElementById('cidade');

  if (dropdown && cidadeInput && !dropdown.contains(event.target) && !cidadeInput.contains(event.target)) {
    dropdown.classList.add('hidden');
    document.removeEventListener('click', fecharDropdownAoClicarFora);
  }
}

/**
 * Aplica a seleção da cidade nos campos
 * @param {Object} cidade - Dados da cidade selecionada
 * @param {HTMLInputElement} input - Campo de entrada
 */
function selecionarCidade(cidade, input) {
  // Preencher o campo de cidade
  input.value = cidade.nome;
  input.classList.add('field-filled');

  // Preencher UF
  const ufInput = document.getElementById('uf');
  if (ufInput) {
    ufInput.value = cidade.uf;
    ufInput.classList.add('field-filled');
  }

  // Preencher CEP se disponível
  if (cidade.cep) {
    const cepInput = document.getElementById('cep');
    if (cepInput) {
      cepInput.value = cidade.cep;
      cepInput.classList.add('field-filled');

      // Buscar dados detalhados do endereço
      consultarCEP(cidade.cep);
    }
  }

  // Preencher bairro se disponível
  if (cidade.bairro) {
    const bairroInput = document.getElementById('bairro');
    if (bairroInput) {
      bairroInput.value = cidade.bairro;
      bairroInput.classList.add('field-filled');
    }
  }

  // Efeito visual de seleção
  input.classList.add('border-blue-400');
  setTimeout(() => input.classList.remove('border-blue-400'), 500);
}

/**
 * Remove acentos de um texto
 * @param {string} text - Texto a ser normalizado
 * @returns {string} - Texto sem acentos
 */
function removerAcentos(text) {
  if (!text) return '';
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Exportar funções
window.buscarEndereco = buscarEndereco;
window.formatarCEP = formatarCEP;
window.buscarCidades = buscarCidades;
window.removerAcentos = removerAcentos;
