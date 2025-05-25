/**
 * Funções para manipulação de endereços
 * Implementação otimizada para busca de cidades e CEP
 */

// Função para consultar CEP via API ViaCEP e preencher campos
function consultarCEP(cepInput) { // Alterado para receber o elemento HTML
  // Limpar formatação do CEP
  let cep = cepInput.value.replace(/\D/g, ''); // Correção: remover barras invertidas duplicadas

  if (cep.length !== 8) {
    cepInput.classList.remove('cep-loading', 'cep-valid', 'cep-invalid');
    return false;
  }

  cepInput.classList.remove('cep-valid', 'cep-invalid');
  // A classe 'cep-loading' é adicionada em mask.js ANTES de chamar consultarCEP.
  // Será removida aqui após a consulta.

  fetch(`https://viacep.com.br/ws/${cep}/json/`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro ao consultar o CEP. Verifique sua conexão com a internet.');
      }
      return response.json();
    })
    .then(data => {
      cepInput.classList.remove('cep-loading'); // Remover loader

      if (data.erro) {
        console.log("CEP não encontrado");
        cepInput.classList.add('cep-invalid');
        // As chamadas para adicionarIconeValidacao foram removidas.
        return;
      }

      cepInput.classList.add('cep-valid');
      // As chamadas para adicionarIconeValidacao foram removidas.

      // Preencher os campos com os dados retornados
      const cidadeParaPreencher = data.localidade || '';
      const ufParaPreencher = data.uf || '';

      const campoEndereco = document.getElementById('endereco');
      const campoBairro = document.getElementById('bairro');
      const campoCidade = document.getElementById('cidade');
      const campoUF = document.getElementById('uf');

      let enderecoAtualizado = false;
      let bairroAtualizado = false;

      if (campoEndereco) {
        const valorAPIEndereco = data.logradouro || '';
        if (valorAPIEndereco !== '' || campoEndereco.value === '') {
          if (campoEndereco.value !== valorAPIEndereco) {
            campoEndereco.value = valorAPIEndereco;
            enderecoAtualizado = true;
          }
        }
      }

      if (campoBairro) {
        const valorAPIBairro = data.bairro || '';
        if (valorAPIBairro !== '' || campoBairro.value === '') {
          if (campoBairro.value !== valorAPIBairro) {
            campoBairro.value = valorAPIBairro;
            bairroAtualizado = true;
          }
        }
      }

      let cidadeAtualizada = false;
      if (campoCidade && campoCidade.value !== cidadeParaPreencher) {
        campoCidade.value = cidadeParaPreencher;
        cidadeAtualizada = true;
      }

      let ufAtualizado = false;
      if (campoUF && campoUF.value !== ufParaPreencher) {
        campoUF.value = ufParaPreencher;
        ufAtualizado = true;
      }

      // Aplicar classes e disparar eventos apenas se os valores realmente mudaram
      if (enderecoAtualizado && campoEndereco) {
        campoEndereco.classList.add('field-filled', 'cep-highlight');
        campoEndereco.dispatchEvent(new Event('change', { bubbles: true }));
        setTimeout(() => campoEndereco.classList.remove('cep-highlight'), 1500);
      }
      if (bairroAtualizado && campoBairro) {
        campoBairro.classList.add('field-filled', 'cep-highlight');
        campoBairro.dispatchEvent(new Event('change', { bubbles: true }));
        setTimeout(() => campoBairro.classList.remove('cep-highlight'), 1500);
      }
      if (cidadeAtualizada && campoCidade) {
        campoCidade.classList.add('field-filled', 'cep-highlight');
        campoCidade.dispatchEvent(new Event('change', { bubbles: true }));
        setTimeout(() => campoCidade.classList.remove('cep-highlight'), 1500);
      }
      if (ufAtualizado && campoUF) {
        campoUF.classList.add('field-filled', 'cep-highlight');
        campoUF.dispatchEvent(new Event('change', { bubbles: true }));
        setTimeout(() => campoUF.classList.remove('cep-highlight'), 1500);
      }

      // Focar no campo número após preenchimento
      document.getElementById('numero')?.focus();
    })
    .catch(error => {
      console.error('Erro ao consultar CEP:', error);
      cepInput.classList.remove('cep-loading'); // Remover loader em caso de erro também
      cepInput.classList.add('cep-invalid');
      // As chamadas para adicionarIconeValidacao foram removidas.
    });

  return true;
}

/**
 * Adiciona um ícone de validação dentro do campo
 * @param {HTMLInputElement} input - Campo de entrada
 * @param {string} icon - Nome do ícone FontAwesome sem o prefixo 'fa-'
 * @param {string} colorClass - Classe de cor para o ícone
 */
// function adicionarIconeValidacao(input, icon, colorClass) { // COMENTADA - NÃO MAIS USADA DIRETAMENTE AQUI
//   removerIconeValidacao(input);
//
//   // Criar span para o ícone
//   const iconSpan = document.createElement('span');
//   iconSpan.className = `validation-field-icon absolute right-3 top-1/2 transform -translate-y-1/2 ${colorClass}`;
//   iconSpan.innerHTML = `<i class="fas fa-${icon}"></i>`;
//   iconSpan.style.zIndex = "20";
//
//   if (input.parentElement) {
//     input.parentElement.appendChild(iconSpan);
//   }
//
//   input.style.paddingRight = '2.5rem';
// }

/**
 * Remove ícone de validação do campo
 * @param {HTMLInputElement} input - Campo de entrada
 */
// function removerIconeValidacao(input) { // COMENTADA - NÃO MAIS USADA DIRETAMENTE AQUI
//   if (input.parentElement) {
//     const existingIcon = input.parentElement.querySelector('.validation-field-icon');
//
//     if (existingIcon) {
//       existingIcon.remove();
//     }
//   }
//   input.style.paddingRight = '';
// }

/**
 * Exibe mensagem de validação abaixo do campo
 * @param {HTMLElement} parentDiv - Elemento pai onde a mensagem será exibida
 * @param {string} message - Mensagem a ser exibida
 * @param {string} type - Tipo de mensagem: 'error', 'success', 'info', 'warning'
 */
// function mostrarMensagemValidacao(parentDiv, message, type = 'info') { // COMENTADA - NÃO MAIS USADA
//   removerMensagemValidacao(parentDiv);
//
//   const messageDiv = document.createElement('div');
//   messageDiv.className = `validation-message text-xs ${type === 'error' ? 'text-red-500' :
//                                                     type === 'success' ? 'text-green-500' :
//                                                     type === 'warning' ? 'text-amber-500' : 'text-blue-500'}`;
//   messageDiv.innerHTML = message;
//
//   messageDiv.style.marginTop = "1px";
//   messageDiv.style.paddingLeft = "2px";
//   messageDiv.style.background = "transparent";
//   messageDiv.style.position = "absolute";
//   messageDiv.style.left = "0";
//   messageDiv.style.bottom = "-16px";
//   messageDiv.style.fontWeight = "normal";
//   messageDiv.style.zIndex = "30";
//
//   parentDiv.appendChild(messageDiv);
// }

/**
 * Remove mensagem de validação
 * @param {HTMLElement} parentDiv - Elemento pai que contém a mensagem
 */
// function removerMensagemValidacao(parentDiv) { // COMENTADA - NÃO MAIS USADA
//   const existingMessage = parentDiv.querySelector('.validation-message');
//
//   if (existingMessage) {
//     existingMessage.remove();
//   }
// }

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
  // Só exibe o dropdown se o campo estiver em foco (usuário interagindo)
  if (document.activeElement !== input) return;
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
      const estadosPrioritarios = ['SP', 'RJ', 'MG', 'BA', 'RS', 'PR', 'PE', 'CE', 'SC', 'GO', 'ES', 'PA', 'PB', 'MS', 'MT'];

      for (const sigla of estadosPrioritarios) {
        const estado = estados.find(e => e.sigla === sigla);
        if (!estado) continue;

        const cidades = await cacheAPI.getCidades(estado.id);
        const cidadesFiltradas = filtrarCidades(cidades, texto);

        // Adicionar ao resultado total
        resultados = [...resultados, ...cidadesFiltradas];

        // Limitar a 20 resultados no total para busca mais abrangente
        if (resultados.length >= 20) break;
      }

      // Limitar a 20 resultados
      resultados = resultados.slice(0, 20);
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

  // Primeiro, tentar correspondência completa ou parcial no nome da cidade
  const resultados = cidades
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

      // Cidades que contêm o texto como palavra inteira vêm depois
      const aContemPalavra = new RegExp(`\\b${textoNormalizado}\\b`, 'i').test(aNome);
      const bContemPalavra = new RegExp(`\\b${textoNormalizado}\\b`, 'i').test(bNome);

      if (aContemPalavra && !bContemPalavra) return -1;
      if (!aContemPalavra && bContemPalavra) return 1;

      // Por fim, ordenar alfabeticamente
      return a.nome.localeCompare(b.nome);
    })
    .slice(0, 20); // Aumentar o limite para 20 resultados por estado

  // Se o texto for mais curto (2 ou 3 caracteres), filtrar para cidades mais relevantes
  if (texto.length <= 3) {
    // Para textos curtos, damos mais peso para cidades que começam com o texto
    return resultados.filter((cidade, index, arr) => {
      const nomeNormalizado = removerAcentos(cidade.nome.toLowerCase());
      return nomeNormalizado.startsWith(textoNormalizado) || index < 10;
    }).slice(0, 15);
  }

  return resultados;
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

// Exportar funções para uso global
window.consultarCEP = consultarCEP;
window.buscarCidades = buscarCidades;

/**
 * Módulo de endereço e CEP
 */

class Address {
  constructor() {
    this.setupCEPListeners();
  }

  setupCEPListeners() {
    const cepInputs = document.querySelectorAll('input[data-cep]');
    cepInputs.forEach(input => {
      input.addEventListener('blur', () => this.handleCEPInput(input));
    });
  }

  async handleCEPInput(input) {
    const cep = input.value.replace(/\D/g, '');

    if (cep.length !== 8) {
      this.showError(input, 'CEP inválido');
      return;
    }

    try {
      // Usar o sistema de cache
      const address = await window.cache.getCEP(cep);
      this.fillAddressFields(address);
      this.showSuccess(input, 'CEP encontrado');
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      this.showError(input, 'CEP não encontrado');
    }
  }

  fillAddressFields(address) {
    const fields = {
      'logradouro': address.logradouro,
      'bairro': address.bairro,
      'cidade': address.localidade,
      'uf': address.uf
    };

    Object.entries(fields).forEach(([fieldName, value]) => {
      const field = document.getElementById(fieldName);
      if (field) {
        field.value = value;
        field.classList.add('field-filled');
      }
    });
  }

  showError(input, message) {
    input.classList.add('border-red-500');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'text-red-500 text-sm mt-1';
    errorDiv.textContent = message;

    const existingError = input.parentNode.querySelector('.text-red-500');
    if (existingError) {
      existingError.remove();
    }

    input.parentNode.appendChild(errorDiv);
  }

  showSuccess(input, message) {
    input.classList.remove('border-red-500');
    input.classList.add('border-green-500');

    const existingError = input.parentNode.querySelector('.text-red-500');
    if (existingError) {
      existingError.remove();
    }
  }
}

// Inicializar o módulo de endereço
const address = new Address();
