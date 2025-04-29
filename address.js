// Inicializar o autocomplete de endereço quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  console.log("Inicializando sistema de endereços...");
  initAddressAutocomplete();

  // Comentado para resolver problema de margens nos campos UF e Número
  // ajustarTamanhoCampos();

  // Adicionar eventos de CEP para garantir preenchimento bidirecional
  const cepField = document.getElementById('cep');
  if (cepField) {
    // Adicionar máscara de formatação para o CEP enquanto digita
    cepField.addEventListener('input', function(e) {
      maskCEP(this);

      // Verificar se o CEP está completo (8 dígitos) para buscar o endereço
      const cep = this.value.replace(/\D/g, '');
      if (cep.length === 8) {
        console.log(`CEP completado: ${cep} - Buscando endereço...`);
        // Garantir que o consultarCEP seja chamado diretamente
        if (typeof window.consultarCEP === 'function') {
          window.consultarCEP(cep);
        }
      }
    });

    // Evento para quando o usuário termina de digitar o CEP
    cepField.addEventListener('blur', function() {
      const cep = this.value.replace(/\D/g, '');
      if (cep.length === 8) {
        console.log(`CEP digitado: ${cep} - Buscando endereço...`);
        // Garantir que o consultarCEP seja chamado diretamente
        if (typeof window.consultarCEP === 'function') {
          window.consultarCEP(cep);
        }
      }
    });
  }

  // Event listener para o campo CEP
  const cepInput = document.getElementById('cep');
  if (cepInput) {
    // Remover event listeners duplicados, se houver
    const oldInputListener = cepInput._inputListener;
    if (oldInputListener) {
      cepInput.removeEventListener('input', oldInputListener);
    }

    // Armazenar o listener para referência futura
    const newInputListener = function() {
      const cepDigitos = this.value.replace(/\D/g, '');
      if (cepDigitos.length < 8) {
        // Remover qualquer mensagem de erro existente
        const errorMessage = this.parentElement.querySelector('.cep-error-message');
        if (errorMessage) {
          errorMessage.remove();
        }

        // Limpar os estilos visuais de erro
        this.style.backgroundColor = '';
        this.style.borderColor = '';

        // Resetar o status de CEP inválido
        this.dataset.cepInvalido = "false";
      }
    };

    cepInput.addEventListener('input', newInputListener);
    cepInput._inputListener = newInputListener;
  }
});

// Função principal de inicialização
function initAddressAutocomplete() {
  // Inicializar autopreenchimento de cidade/UF
  setupCityStateAutocomplete();

  // Configurar evento de mudança no campo UF
  const ufField = document.getElementById('uf');
  if (ufField) {
    ufField.addEventListener('change', function() {
      if (this.value) {
        fetchCitiesByState(this.value);
      }
    });
  }

  // Adicionar evento para buscar CEP ao selecionar uma cidade
  const cityField = document.getElementById('cidade');
  if (cityField) {
    cityField.addEventListener('change', function() {
      const city = this.value;
      const uf = document.getElementById('uf')?.value;

      if (city && uf) {
        console.log(`Cidade selecionada: ${city}, UF: ${uf}`);
        searchGenericCEP(city, uf);
      }
    });
  }
}

// Configurar autocomplete de cidade e estado
function setupCityStateAutocomplete() {
  const cityField = document.getElementById('cidade');
  if (!cityField) return;

  // Criar container de sugestões se não existir
  if (!document.getElementById('city-suggestions')) {
    const container = document.createElement('div');
    container.id = 'city-suggestions';
    container.className = 'absolute z-10 bg-white shadow-lg rounded-lg border border-gray-300 w-full max-h-48 overflow-y-auto';
    container.style.display = 'none';
    cityField.parentNode.style.position = 'relative';
    cityField.parentNode.appendChild(container);
  }

  // Configurar evento de input para mostrar sugestões
  cityField.addEventListener('input', function() {
    if (this.value.length > 2) {
      searchCitiesAPI(this.value);
    } else {
      document.getElementById('city-suggestions').style.display = 'none';
    }
  });

  // Fechar sugestões quando clicar fora
  document.addEventListener('click', function(e) {
    if (e.target !== cityField) {
      document.getElementById('city-suggestions').style.display = 'none';
    }
  });
}

// Buscar cidades por estado usando API Brasil - OTIMIZADO
function fetchCitiesByState(uf) {
  if (!uf) return;

  const cityField = document.getElementById('cidade');
  if (!cityField) return;

  // Limpar campo cidade ao mudar o estado
  cityField.value = '';

  // Mostrar indicador de carregamento
  cityField.classList.add('loading');
  cityField.placeholder = 'Carregando cidades...';

  // API IBGE atualizada - retorna todas as cidades do estado
  fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Erro ao buscar cidades: ${response.status}`);
      }
      return response.json();
    })
    .then(cities => {
      console.log(`Encontradas ${cities.length} cidades para o estado ${uf}`);

      // Criar ou atualizar datalist para o autocomplete
      let datalistId = 'cities-' + uf.toLowerCase();
      let datalist = document.getElementById(datalistId);

      if (!datalist) {
        datalist = document.createElement('datalist');
        datalist.id = datalistId;
        document.body.appendChild(datalist);
      } else {
        datalist.innerHTML = '';
      }

      // Adicionar opções ao datalist
      cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city.nome;
        datalist.appendChild(option);
      });

      // Associar datalist ao campo
      cityField.setAttribute('list', datalistId);
      cityField.placeholder = 'Digite o nome da cidade';
    })
    .catch(error => {
      console.error('Erro ao buscar cidades:', error);
      cityField.placeholder = 'Digite o nome da cidade';
    })
    .finally(() => {
      // Remover indicador de carregamento
      cityField.classList.remove('loading');
    });
}

// Buscar cidades com API enquanto digita - CORRIGIDO
function searchCitiesAPI(text) {
  if (!text || text.length < 3) return;

  const suggestionsContainer = document.getElementById('city-suggestions');
  const ufField = document.getElementById('uf');
  const currentUF = ufField.value.toUpperCase();

  // Mostrar indicador de carregamento
  suggestionsContainer.innerHTML = '<div class="p-3 text-center text-gray-500"><i class="fas fa-spinner fa-spin mr-2"></i>Buscando...</div>';
  suggestionsContainer.style.display = 'block';

  // Obter todas as cidades ou filtrar por estado - a API do IBGE não suporta parâmetro de busca
  const apiUrl = currentUF
    ? `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${currentUF}/municipios`
    : `https://servicodados.ibge.gov.br/api/v1/localidades/municipios`;

  fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Erro na resposta: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log(`Total de cidades recebidas: ${data.length}`);

      // Filtrar cidades que contenham o texto digitado
      const filteredResults = data.filter(item =>
        item.nome.toLowerCase().includes(text.toLowerCase())
      );

      console.log(`Cidades filtradas por "${text}": ${filteredResults.length}`);

      suggestionsContainer.innerHTML = '';

      if (filteredResults.length === 0) {
        suggestionsContainer.innerHTML = '<div class="p-3 text-center text-gray-500">Nenhuma cidade encontrada</div>';
        return;
      }

      // Limitar a 10 resultados
      const results = filteredResults.slice(0, 10);

      results.forEach(item => {
        const cityName = item.nome;
        const stateUF = item.microrregiao?.mesorregiao?.UF?.sigla || currentUF;

        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'p-3 hover:bg-gray-100 cursor-pointer';
        suggestionItem.textContent = currentUF ? cityName : `${cityName} - ${stateUF}`;

        suggestionItem.addEventListener('click', function() {
          document.getElementById('cidade').value = cityName;
          document.getElementById('uf').value = stateUF;
          suggestionsContainer.style.display = 'none';

          // Buscar CEP para a cidade selecionada
          console.log(`Buscando CEP para: ${cityName}, ${stateUF}`);
          searchGenericCEP(cityName, stateUF);
        });

        suggestionsContainer.appendChild(suggestionItem);
      });
    })
    .catch(error => {
      console.error('Erro na busca de cidades:', error);
      suggestionsContainer.innerHTML = `<div class="p-3 text-center text-red-500">Erro ao buscar cidades: ${error.message}</div>`;
    });
}

// Buscar CEP genérico pela internet usando ViaCEP ou APIs alternativas
function searchGenericCEP(city, uf) {
  if (!city || !uf) {
    console.log("Cidade ou UF não fornecidos para busca de CEP");
    return;
  }

  const cepField = document.getElementById('cep');
  if (!cepField) {
    console.log("Campo CEP não encontrado");
    return;
  }

  // Limpar CEP anterior se estiver preenchendo novamente
  if (cepField.value) {
    cepField.value = '';
  }

  console.log(`Buscando CEP para ${city}/${uf}`);

  // Mostrar feedback visual de carregamento
  cepField.placeholder = "Buscando CEP...";

  // PRIMEIRA TENTATIVA: Brasil API (geralmente sem problemas de CORS)
  buscarCepBrasilAPI(city, uf)
    .then(cep => {
      if (cep) {
        console.log(`CEP encontrado via Brasil API: ${cep}`);
        // Formatar e preencher o campo
        const formattedCEP = cep.replace(/\D/g, '').replace(/^(\d{5})(\d{3})$/, "$1-$2");
        cepField.value = formattedCEP;

        // Efeito visual
        cepField.style.backgroundColor = '#e8f4ff';
        setTimeout(() => {
          cepField.style.backgroundColor = '';
        }, 1000);

        // Consultar detalhes do CEP
        if (typeof window.consultarCEP === 'function') {
          setTimeout(() => window.consultarCEP(cep.replace(/\D/g, '')), 100);
        }
      } else {
        throw new Error("CEP não encontrado");
      }
    })
    .catch(error => {
      console.warn(`Erro ao buscar CEP via Brasil API: ${error}. Tentando via proxy...`);

      // SEGUNDA TENTATIVA: ViaCEP com proxy para contornar CORS
      const originalUrl = `https://viacep.com.br/ws/${uf}/${encodeURIComponent(city)}/json/`;
      const proxyUrl = `https://cors-anywhere.herokuapp.com/${originalUrl}`;

      // URL de fallback com outro proxy
      const fallbackProxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(originalUrl)}`;

      console.log("Tentando buscar via proxy CORS:", proxyUrl);

      // Cancelar a busca com proxy após 5 segundos para não ficar esperando indefinidamente
      // e mostrar uma mensagem mais amigável
      setTimeout(() => {
        if (!cepField.value) {
          console.log("Tempo esgotado para busca de CEP, usando CEP genérico");

          // ÚLTIMO RECURSO: Usar um CEP genérico baseado no estado
          const genericStateCEPs = {
            'AC': '69900-000', 'AL': '57000-000', 'AM': '69000-000', 'AP': '68900-000',
            'BA': '40000-000', 'CE': '60000-000', 'DF': '70000-000', 'ES': '29000-000',
            'GO': '74000-000', 'MA': '65000-000', 'MG': '30000-000', 'MS': '79000-000',
            'MT': '78000-000', 'PA': '66000-000', 'PB': '58000-000', 'PE': '50000-000',
            'PI': '64000-000', 'PR': '80000-000', 'RJ': '20000-000', 'RN': '59000-000',
            'RO': '76800-000', 'RR': '69300-000', 'RS': '90000-000', 'SC': '88000-000',
            'SE': '49000-000', 'SP': '01000-000', 'TO': '77000-000'
          };

          if (genericStateCEPs[uf]) {
            cepField.value = genericStateCEPs[uf];

            // Efeito visual com amarelo claro para indicar que é um CEP genérico
            cepField.style.backgroundColor = '#fffde8';
            setTimeout(() => {
              cepField.style.backgroundColor = '';
            }, 1000);

            // Mostrar uma dica para o usuário
            cepField.title = "CEP genérico da capital do estado. Para mais precisão, digite o CEP manualmente.";

            // Preencher outros campos com informações do estado/cidade já fornecidos
            const endereco = document.getElementById('endereco');
            const bairro = document.getElementById('bairro');

            if (endereco && !endereco.value) endereco.value = "Preencha o endereço";
            if (bairro && !bairro.value) bairro.value = "Centro";

            // Focus no campo número após preenchimento
            document.getElementById('numero')?.focus();
          } else {
            cepField.placeholder = "Digite o CEP";
          }
        }
      }, 5000); // Aumento para 5 segundos para dar mais tempo de busca

      // Tenta com o primeiro proxy
      fetch(proxyUrl, {
        method: 'GET',
        headers: {'Origin': window.location.origin}
      })
      .then(response => {
        if (!response.ok) throw new Error(`Erro na resposta do proxy: ${response.status}`);
        return response.json();
      })
      .catch(error => {
        console.log("Erro no proxy:", error);

        // Tenta com o segundo proxy
        return fetch(fallbackProxyUrl)
          .then(response => {
            if (!response.ok) throw new Error(`Erro no proxy alternativo: ${response.status}`);
            return response.json();
          });
      })
      .then(data => {
        console.log("Resposta da API ViaCEP:", data);

        if (Array.isArray(data) && data.length > 0) {
          const genericCEP = data[0].cep.replace(/\D/g, '');
          if (genericCEP) {
            const formattedCEP = genericCEP.replace(/^(\d{5})(\d{3})$/, "$1-$2");
            if (!cepField.value) { // Só preenche se ainda não estiver preenchido
              cepField.value = formattedCEP;
              cepField.style.backgroundColor = '#e8f4ff';
              setTimeout(() => {
                cepField.style.backgroundColor = '';
              }, 1000);

              if (typeof window.consultarCEP === 'function') {
                setTimeout(() => window.consultarCEP(genericCEP), 100);
              }
            }
          }
        }
      })
      .catch(error => {
        console.warn("Erro em todos os proxies:", error.message);
        // Não fazemos nada aqui - o timeout vai resolver após 5 segundos
      });
    });
}

// Implementando busca via Brasil API
function buscarCepBrasilAPI(cidade, uf) {
  if (!cidade || !uf) {
    console.log("Cidade ou UF não fornecidos");
    return Promise.reject("Dados incompletos");
  }

  // Normalizar o texto da cidade (remover acentos)
  const cidadeNormalizada = cidade.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  console.log(`Buscando CEP para ${cidadeNormalizada}/${uf} via Brasil API`);

  return fetch(`https://brasilapi.com.br/api/cep/v2/cidade/${encodeURIComponent(cidadeNormalizada)}/uf/${uf}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Erro na resposta: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log("Resposta da Brasil API:", data);

      // A API retorna um array de CEPs para a cidade
      if (Array.isArray(data) && data.length > 0) {
        // Retorna o primeiro CEP do centro da cidade geralmente
        return data[0].cep;
      } else if (data.ceps && Array.isArray(data.ceps) && data.ceps.length > 0) {
        // Formato alternativo de resposta
        return data.ceps[0];
      } else if (data.cep) {
        // Formato único de resposta
        return data.cep;
      }

      throw new Error("Nenhum CEP encontrado na resposta");
    });
}

// Função para validar e formatar CEP
function formatarCEP(cep) {
  // Remove caracteres não numéricos
  cep = cep.replace(/\D/g, '');

  // Verifica se tem o tamanho correto
  if (cep.length === 8) {
    return cep.replace(/^(\d{5})(\d{3})$/, '$1-$2');
  }

  return cep;
}

// Função para forçar o preenchimento de CEP
function forcarPreenchimentoCEP(cep) {
  const cepField = document.getElementById('cep');
  if (!cepField) return;

  // Se o campo já tiver um valor, não sobrescrever
  if (cepField.value) return;

  // Formatar e definir o valor
  cepField.value = formatarCEP(cep);

  // Disparar o evento para preencher os campos de endereço
  if (typeof window.consultarCEP === 'function') {
    window.consultarCEP(cep);
  }
}

// Função alternativa para preencher campos de endereço se consultarCEP não existir
function preencherCamposEndereco(data) {
  if (!data) return;

  const camposEndereco = {
    'endereco': data.logradouro,
    'bairro': data.bairro,
    'cidade': data.localidade,
    'uf': data.uf
  };

  for (const [id, valor] of Object.entries(camposEndereco)) {
    const campo = document.getElementById(id);
    if (campo && valor) {
      campo.value = valor;

      // Efeito visual para indicar preenchimento
      campo.style.backgroundColor = '#e8f4ff';
      setTimeout(() => {
        campo.style.backgroundColor = '';
      }, 1000);
    }
  }

  // Focar no campo de número após preenchimento
  const numeroInput = document.getElementById('numero');
  if (numeroInput) {
    numeroInput.focus();
  }
}

// Função específica para garantir que o CEP seja preenchido quando cidade e estado estiverem preenchidos
function verificarPreenchimentoAutomatico() {
  const cidadeField = document.getElementById('cidade');
  const ufField = document.getElementById('uf');
  const cepField = document.getElementById('cep');

  if (cidadeField && ufField && cidadeField.value && ufField.value && !cepField.value) {
    console.log("Cidade e Estado preenchidos sem CEP - buscando CEP automaticamente");
    searchGenericCEP(cidadeField.value, ufField.value);
  }
}

// Configurar observadores MutationObserver para detectar mudanças nos campos
document.addEventListener('DOMContentLoaded', function() {
  // Verificar preenchimento automático a cada 1 segundo
  setInterval(verificarPreenchimentoAutomatico, 1000);

  // Observador para detecção mais precisa de mudanças
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'attributes' &&
          (mutation.target.id === 'cidade' || mutation.target.id === 'uf')) {
        verificarPreenchimentoAutomatico();
      }
    });
  });

  // Observar mudanças nos campos cidade e UF
  const cidadeField = document.getElementById('cidade');
  const ufField = document.getElementById('uf');

  if (cidadeField) {
    observer.observe(cidadeField, { attributes: true });
  }

  if (ufField) {
    observer.observe(ufField, { attributes: true });
  }
});

// Função para ajustar o tamanho dos campos UF e Número para ficarem menores e iguais
function ajustarTamanhoCampos() {
  const ufField = document.getElementById('uf');
  const numeroField = document.getElementById('numero');

  if (ufField) {
    // Adicionar classes para deixar o campo UF menor
    ufField.classList.add('w-20', 'md:w-24');
    // Remover classes que possam interferir no tamanho
    ufField.classList.remove('w-full');

    // Adicionar estilo direto para garantir tamanho específico
    ufField.style.maxWidth = '6rem';
    ufField.style.minWidth = '5rem';
  }

  if (numeroField) {
    // Adicionar classes para deixar o campo Número menor
    numeroField.classList.add('w-20', 'md:w-24');
    // Remover classes que possam interferir no tamanho
    numeroField.classList.remove('w-full');

    // Adicionar estilo direto para garantir tamanho específico
    numeroField.style.maxWidth = '6rem';
    numeroField.style.minWidth = '5rem';
  }

  // Verificar se estamos em um layout de grade (grid)
  const parentUF = ufField?.closest('.col-md-4, .md\\:col-span-4');
  const parentNumero = numeroField?.closest('.col-md-4, .md\\:col-span-4');

  // Ajustar largura dos contêineres pais, se necessário
  if (parentUF) {
    parentUF.classList.remove('col-md-4', 'md:col-span-4');
    parentUF.classList.add('col-md-2', 'md:col-span-2');
  }

  if (parentNumero) {
    parentNumero.classList.remove('col-md-4', 'md:col-span-4');
    parentNumero.classList.add('col-md-2', 'md:col-span-2');
  }
}

// Função para aplicar máscara ao campo CEP: formato 00000-000
function maskCEP(input) {
  let value = input.value.replace(/\D/g, ''); // Remove caracteres não numéricos

  if (value.length > 8) {
    value = value.substring(0, 8); // Limita a 8 dígitos
  }

  if (value.length > 5) {
    // Formata como 00000-000
    value = value.replace(/^(\d{5})(\d{1,3})$/, '$1-$2');
  }

  input.value = value;

  return value;
}
