/**
 * SIU - Módulo de CID
 */

class CID {
    constructor() {
      // Inicializa o helper de busca
      this.search = new Search();

      // Base de dados de CIDs comuns para fallback quando offline
      this.database = [
        { code: 'A00', description: 'Cólera' },
        { code: 'A15', description: 'Tuberculose respiratória, com confirmação bacteriológica e histológica' },
        { code: 'B20', description: 'Doença pelo HIV resultando em doenças infecciosas e parasitárias' },
        { code: 'C50', description: 'Neoplasia maligna da mama' },
        { code: 'D50', description: 'Anemia por deficiência de ferro' },
        { code: 'E10', description: 'Diabetes mellitus insulino-dependente' },
        { code: 'E11', description: 'Diabetes mellitus não-insulino-dependente' },
        { code: 'F20', description: 'Esquizofrenia' },
        { code: 'F21', description: 'Transtorno esquizotípico' },
        { code: 'F22', description: 'Transtornos delirantes persistentes' },
        { code: 'F23', description: 'Transtornos psicóticos agudos e transitórios' },
        { code: 'F25', description: 'Transtornos esquizoafetivos' },
        { code: 'F30', description: 'Episódio maníaco' },
        { code: 'F31', description: 'Transtorno afetivo bipolar' },
        { code: 'F32', description: 'Episódio depressivo' },
        { code: 'F33', description: 'Transtorno depressivo recorrente' },
        { code: 'F41', description: 'Outros transtornos ansiosos' },
        { code: 'F43', description: 'Reações ao estresse grave e transtornos de adaptação' },
        { code: 'G40', description: 'Epilepsia' },
        { code: 'G43', description: 'Enxaqueca' },
        { code: 'H25', description: 'Catarata senil' },
        { code: 'H40', description: 'Glaucoma' },
        { code: 'I10', description: 'Hipertensão essencial (primária)' },
        { code: 'I21', description: 'Infarto agudo do miocárdio' },
        { code: 'I50', description: 'Insuficiência cardíaca' },
        { code: 'J45', description: 'Asma' },
        { code: 'K29', description: 'Gastrite e duodenite' },
        { code: 'K80', description: 'Colelitíase' },
        { code: 'L40', description: 'Psoríase' },
        { code: 'M17', description: 'Gonartrose [artrose do joelho]' },
        { code: 'M51', description: 'Outros transtornos de discos intervertebrais' },
        { code: 'M54', description: 'Dorsalgia' },
        { code: 'N18', description: 'Insuficiência renal crônica' },
        { code: 'O00', description: 'Gravidez ectópica' },
        { code: 'Q90', description: 'Síndrome de Down' },
        { code: 'R10', description: 'Dor abdominal e pélvica' },
        { code: 'S52', description: 'Fratura do antebraço' },
        { code: 'T14', description: 'Traumatismo de região não especificada do corpo' },
        { code: 'Z00', description: 'Exame geral e investigação de pessoas sem queixas ou diagnóstico relatado' },
        // Adicionar mais códigos F (saúde mental)
        { code: 'F01', description: 'Demência vascular' },
        { code: 'F02', description: 'Demência em outras doenças classificadas em outra parte' },
        { code: 'F03', description: 'Demência não especificada' },
        { code: 'F04', description: 'Síndrome amnésica orgânica não induzida pelo álcool ou por outras substâncias psicoativas' },
        { code: 'F05', description: 'Delirium não induzido pelo álcool ou por outras substâncias psicoativas' },
        { code: 'F06', description: 'Outros transtornos mentais devidos a lesão e disfunção cerebral e a doença física' },
        { code: 'F07', description: 'Transtornos de personalidade e do comportamento devidos a doença, a lesão e a disfunção cerebral' },
        { code: 'F09', description: 'Transtorno mental orgânico ou sintomático não especificado' },
        { code: 'F10', description: 'Transtornos mentais e comportamentais devidos ao uso de álcool' },
        { code: 'F11', description: 'Transtornos mentais e comportamentais devidos ao uso de opiáceos' },
        { code: 'F12', description: 'Transtornos mentais e comportamentais devidos ao uso de canabinóides' },
        { code: 'F13', description: 'Transtornos mentais e comportamentais devidos ao uso de sedativos e hipnóticos' },
        { code: 'F14', description: 'Transtornos mentais e comportamentais devidos ao uso da cocaína' },
        { code: 'F15', description: 'Transtornos mentais e comportamentais devidos ao uso de outros estimulantes, inclusive a cafeína' },
        { code: 'F16', description: 'Transtornos mentais e comportamentais devidos ao uso de alucinógenos' },
        { code: 'F17', description: 'Transtornos mentais e comportamentais devidos ao uso de fumo' },
        { code: 'F18', description: 'Transtornos mentais e comportamentais devidos ao uso de solventes voláteis' },
        { code: 'F19', description: 'Transtornos mentais e comportamentais devidos ao uso de múltiplas drogas e ao uso de outras substâncias psicoativas' },
        { code: 'F20', description: 'Esquizofrenia' },
        { code: 'F21', description: 'Transtorno esquizotípico' },
        { code: 'F22', description: 'Transtornos delirantes persistentes' },
        { code: 'F23', description: 'Transtornos psicóticos agudos e transitórios' },
        { code: 'F24', description: 'Transtorno delirante induzido' },
        { code: 'F25', description: 'Transtornos esquizoafetivos' },
        { code: 'F28', description: 'Outros transtornos psicóticos não-orgânicos' },
        { code: 'F29', description: 'Psicose não-orgânica não especificada' },
        { code: 'F30', description: 'Episódio maníaco' },
        { code: 'F31', description: 'Transtorno afetivo bipolar' },
        { code: 'F32', description: 'Episódio depressivo' },
        { code: 'F33', description: 'Transtorno depressivo recorrente' },
        { code: 'F34', description: 'Transtornos de humor [afetivos] persistentes' },
        { code: 'F38', description: 'Outros transtornos do humor [afetivos]' },
        { code: 'F39', description: 'Transtorno do humor [afetivo] não especificado' },
        { code: 'F40', description: 'Transtornos fóbico-ansiosos' },
        { code: 'F41', description: 'Outros transtornos ansiosos' },
        { code: 'F42', description: 'Transtorno obsessivo-compulsivo' },
        { code: 'F43', description: 'Reação ao "stress" grave e transtornos de adaptação' },
        { code: 'F44', description: 'Transtornos dissociativos [de conversão]' },
        { code: 'F45', description: 'Transtornos somatoformes' },

        // Adicionar CIDs para problemas comuns
        { code: 'I10', description: 'Hipertensão essencial (primária)' },
        { code: 'I11', description: 'Doença cardíaca hipertensiva' },
        { code: 'I20', description: 'Angina pectoris' },
        { code: 'I21', description: 'Infarto agudo do miocárdio' },
        { code: 'I25', description: 'Doença isquêmica crônica do coração' },
        { code: 'I50', description: 'Insuficiência cardíaca' },
        { code: 'I64', description: 'Acidente vascular cerebral, não especificado como hemorrágico ou isquêmico' },
        { code: 'I80', description: 'Flebite e tromboflebite' },

        // Doenças respiratórias
        { code: 'J00', description: 'Nasofaringite aguda [resfriado comum]' },
        { code: 'J01', description: 'Sinusite aguda' },
        { code: 'J02', description: 'Faringite aguda' },
        { code: 'J03', description: 'Amigdalite aguda' },
        { code: 'J04', description: 'Laringite e traqueíte agudas' },
        { code: 'J06', description: 'Infecções agudas das vias aéreas superiores de localizações múltiplas e não especificadas' },
        { code: 'J10', description: 'Influenza devida a outro vírus da influenza [gripe] identificado' },
        { code: 'J11', description: 'Influenza [gripe] devida a vírus não identificado' },
        { code: 'J15', description: 'Pneumonia bacteriana não classificada em outra parte' },
        { code: 'J18', description: 'Pneumonia por microorganismo não especificada' },
        { code: 'J20', description: 'Bronquite aguda' },
        { code: 'J30', description: 'Rinite alérgica e vasomotora' },
        { code: 'J43', description: 'Enfisema' },
        { code: 'J44', description: 'Outras doenças pulmonares obstrutivas crônicas' },
        { code: 'J45', description: 'Asma' },

        // Códigos R - Sintomas e sinais
        { code: 'R00', description: 'Anormalidades do batimento cardíaco' },
        { code: 'R01', description: 'Sopros e outros ruídos cardíacos' },
        { code: 'R03', description: 'Valor anormal da pressão arterial sem diagnóstico' },
        { code: 'R04', description: 'Hemorragia das vias respiratórias' },
        { code: 'R05', description: 'Tosse' },
        { code: 'R06', description: 'Anormalidades da respiração' },
        { code: 'R07', description: 'Dor de garganta e no peito' },
        { code: 'R10', description: 'Dor abdominal e pélvica' },
        { code: 'R11', description: 'Náusea e vômitos' },
        { code: 'R12', description: 'Pirose' },
        { code: 'R13', description: 'Disfagia' },
        { code: 'R14', description: 'Flatulência e afecções correlatas' },
        { code: 'R15', description: 'Incontinência fecal' },
        { code: 'R16', description: 'Hepatomegalia e esplenomegalia não classificadas em outra parte' },
        { code: 'R17', description: 'Icterícia não especificada' },
        { code: 'R18', description: 'Ascite' },
        { code: 'R19', description: 'Outras anormalidades do aparelho digestivo e do abdome' },
        { code: 'R20', description: 'Distúrbios da sensibilidade cutânea' },
        { code: 'R30', description: 'Dor associada à micção' },
        { code: 'R42', description: 'Tontura e instabilidade' },
        { code: 'R50', description: 'Febre de origem desconhecida e outras origens' },
        { code: 'R51', description: 'Cefaléia' },
        { code: 'R52', description: 'Dor não classificada em outra parte' },
        { code: 'R53', description: 'Mal estar, fadiga' },
        { code: 'R55', description: 'Síncope e colapso' },
        { code: 'R56', description: 'Convulsões, não classificadas em outra parte' },
        { code: 'R57', description: 'Choque não classificado em outra parte' }
      ];

      // Marcar que já tentamos baixar dados completos
      this.apiDataLoaded = false;
      this.completeDatabase = [];

      // Tentar carregar todos os dados da API no início
      this.preloadAllCIDs();
    }

    /**
     * Busca um CID pelo código
     * @param {string} code - Código do CID
     * @returns {Promise<Object>} - Dados do CID
     */
    async getCID(code) {
      try {
        // Usar o sistema de cache
        return await window.cache.getCID(code);
      } catch (error) {
        console.error('Erro ao buscar CID:', error);
        // Fallback para busca local
        return this.database.find(cid => cid.code === code);
      }
    }

    /**
     * Busca CIDs por descrição
     * @param {string} query - Termo de busca
     * @returns {Promise<Array>} - Lista de CIDs encontrados
     */
    async searchCIDs(query) {
      try {
        // Se o cache estiver válido, buscar nele
        if (window.cache.isCIDCacheValid()) {
          const results = Array.from(window.cache.cidCache.values())
            .filter(cid =>
              cid.description.toLowerCase().includes(query.toLowerCase())
            );
          return results;
        }

        // Se não, atualizar cache e buscar
        await window.cache.updateCIDCache();
        return this.searchCIDs(query);
      } catch (error) {
        console.error('Erro na busca de CIDs:', error);
        // Fallback para busca local
        return this.database.filter(cid =>
          cid.description.toLowerCase().includes(query.toLowerCase())
        );
      }
    }

    /**
     * Pré-carrega todos os CIDs da API
     */
    async preloadAllCIDs() {
      try {
        await window.cache.updateCIDCache();
        this.apiDataLoaded = true;
      } catch (error) {
        console.error('Erro ao pré-carregar CIDs:', error);
        this.apiDataLoaded = false;
      }
    }

    /**
     * Busca um código CID pela descrição ou uma descrição pelo código
     * @param {string} query - Código CID ou descrição para buscar
     * @returns {Promise<Array>} Lista de resultados correspondentes
     */
    async find(query) {
      if (!query || query.length < 2) {
        return [];
      }

      // Verificar cache primeiro
      if (this.search.hasCache(query)) {
        return this.search.getFromCache(query);
      }

      let results = [];

      // Usar dados da API se disponíveis
      if (this.apiDataLoaded && this.completeDatabase.length > 0) {
        results = this.findInCompleteDatabase(query);
      }

      // Se não tiver resultados ou API não carregada, usar dados offline
      if (results.length === 0) {
        results = this.findOffline(query);
      }

      // Guardar no cache
      this.search.addToCache(query, results);
      return results;
    }

    /**
     * Busca nos dados completos baixados da API
     */
    findInCompleteDatabase(query) {
      query = query.toLowerCase().trim();

      // Filtrar os resultados com base na query
      const results = this.completeDatabase.filter(item => {
        const code = item.code.toLowerCase();
        const description = item.description.toLowerCase();

        return code.includes(query) || description.includes(query);
      });

      // Ordenar por relevância
      results.sort((a, b) => {
        // Correspondência exata de código tem prioridade
        if (a.code.toLowerCase() === query) return -1;
        if (b.code.toLowerCase() === query) return 1;

        // Código começando com a query tem prioridade
        const aStartsWithCode = a.code.toLowerCase().startsWith(query);
        const bStartsWithCode = b.code.toLowerCase().startsWith(query);
        if (aStartsWithCode && !bStartsWithCode) return -1;
        if (!aStartsWithCode && bStartsWithCode) return 1;

        // Descrição começando com a query tem prioridade
        const aStartsWithDesc = a.description.toLowerCase().startsWith(query);
        const bStartsWithDesc = b.description.toLowerCase().startsWith(query);
        if (aStartsWithDesc && !bStartsWithDesc) return -1;
        if (!aStartsWithDesc && bStartsWithDesc) return 1;

        // Por último, ordenar alfabeticamente
        return a.code.localeCompare(b.code);
      });

      return results.slice(0, 10); // Limitar a 10 resultados
    }

    /**
     * Busca CID no banco de dados offline
     * @param {string} query
     * @returns {Array}
     */
    findOffline(query) {
      console.log('CID: Usando busca offline para:', query);
      query = query.toLowerCase().trim();

      // Verificar se é código CID ou descrição
      const isCIDCode = /^[a-z]\d+(\.\d+)?$/i.test(query);

      let results = [];

      if (isCIDCode) {
        // Primeiro tentar correspondência exata
        results = this.database.filter(item =>
          item.code.toLowerCase() === query
        );

        // Se não encontrou, tentar correspondência parcial
        if (results.length === 0) {
          results = this.database.filter(item =>
            item.code.toLowerCase().startsWith(query)
          );
        }

        // Se ainda não encontrou, usar apenas a primeira letra
        if (results.length === 0) {
          results = this.database.filter(item =>
            item.code.toLowerCase().startsWith(query[0])
          );
        }
      } else {
        // Buscar por descrição
        results = this.database.filter(item =>
          item.description.toLowerCase().includes(query)
        );
      }

      return results.slice(0, 10);
    }

    /**
     * Configura autocomplete para os campos de CID e doença
     * @param {number} index - Índice do par de campos
     */
    setupFields(index) {
      const cidInput = document.getElementById(`cid${index}`);
      const doencaInput = document.getElementById(`doenca${index}`);
      const cidDropdown = document.getElementById(`cidDropdown${index}`);
      const doencaDropdown = document.getElementById(`doencaDropdown${index}`);

      if (!cidInput || !doencaInput || !cidDropdown || !doencaDropdown) return;

      // Configura autocomplete para o campo CID
      this.search.setupAutocomplete(
        cidInput,
        cidDropdown,
        async (query) => {
          console.log('CID: Buscando por código:', query);
          const results = await this.find(query);
          console.log('CID: Resultados encontrados:', results.length);
          return results;
        },
        (results) => {
          if (results.length === 0) {
            return `<div class="p-3 text-center text-gray-500 text-sm">Nenhum resultado encontrado</div>`;
          }

          // Nova implementação para garantir que os cliques funcionem
          return `
            <div class="py-2" id="cidResultsList${index}">
              ${results.map((item, i) =>
                `<div class="cid-item flex items-center px-4 py-2 hover:bg-blue-50 transition-colors cursor-pointer"
                     data-index="${i}"
                     data-code="${item.code}"
                     data-description="${item.description}">
                  <span class="text-blue-600 font-bold mr-1">${item.code}</span>
                  <span class="text-gray-600">- ${item.description}</span>
                </div>`
              ).join('')}
            </div>
          `;
        },
        (selectedElement) => {
          // Esta função não é mais usada diretamente devido à nossa abordagem manual
          // A manipulação será feita pelo event listener abaixo
        }
      );

      // Adiciona manualmente listeners para os itens do dropdown
      cidDropdown.addEventListener('click', function(e) {
        const cidItem = e.target.closest('.cid-item');
        if (cidItem) {
          const code = cidItem.dataset.code;
          const description = cidItem.dataset.description;

          console.log('CID: Item selecionado manualmente:', code, description);

          // Preencher os campos
          cidInput.value = code;
          doencaInput.value = description;

          // Adicionar classe preenchida
          cidInput.classList.add('filled');
          doencaInput.classList.add('filled');

          // Disparar eventos
          cidInput.dispatchEvent(new Event('change', { bubbles: true }));
          doencaInput.dispatchEvent(new Event('change', { bubbles: true }));
          cidInput.dispatchEvent(new Event('input', { bubbles: true }));
          doencaInput.dispatchEvent(new Event('input', { bubbles: true }));

          // Fechar dropdown
          cidDropdown.classList.add('hidden');
          doencaDropdown.classList.add('hidden');

          // Destacar campos - usando a função global padronizada
          destacarCamposPreenchidos();
        }
      });

      // Configura autocomplete para o campo doença (similar ao anterior)
      this.search.setupAutocomplete(
        doencaInput,
        doencaDropdown,
        async (query) => {
          console.log('CID: Buscando por descrição:', query);
          const results = await this.find(query);
          console.log('CID: Resultados encontrados:', results.length);
          return results;
        },
        (results) => {
          if (results.length === 0) {
            return `<div class="p-3 text-center text-gray-500 text-sm">Nenhum resultado encontrado</div>`;
          }

          // Nova implementação para garantir que os cliques funcionem
          return `
            <div class="py-2" id="doencaResultsList${index}">
              ${results.map((item, i) =>
                `<div class="doenca-item flex items-center px-4 py-2 hover:bg-blue-50 transition-colors cursor-pointer"
                     data-index="${i}"
                     data-code="${item.code}"
                     data-description="${item.description}">
                  <span class="text-blue-600 font-bold mr-1">${item.code}</span>
                  <span class="text-gray-600">- ${item.description}</span>
                </div>`
              ).join('')}
            </div>
          `;
        },
        (selectedElement) => {
          // Esta função não é mais usada diretamente devido à nossa abordagem manual
          // A manipulação será feita pelo event listener abaixo
        }
      );

      // Adiciona manualmente listeners para os itens do dropdown
      doencaDropdown.addEventListener('click', function(e) {
        const doencaItem = e.target.closest('.doenca-item');
        if (doencaItem) {
          const code = doencaItem.dataset.code;
          const description = doencaItem.dataset.description;

          console.log('CID: Item selecionado via doença manualmente:', code, description);

          // Preencher os campos
          cidInput.value = code;
          doencaInput.value = description;

          // Adicionar classe preenchida
          cidInput.classList.add('filled');
          doencaInput.classList.add('filled');

          // Disparar eventos
          cidInput.dispatchEvent(new Event('change', { bubbles: true }));
          doencaInput.dispatchEvent(new Event('change', { bubbles: true }));
          cidInput.dispatchEvent(new Event('input', { bubbles: true }));
          doencaInput.dispatchEvent(new Event('input', { bubbles: true }));

          // Fechar dropdown
          cidDropdown.classList.add('hidden');
          doencaDropdown.classList.add('hidden');

          // Destacar campos - usando a função global padronizada
          destacarCamposPreenchidos();
        }
      });
    }
}

// Criar uma instância global para uso em toda a aplicação
window.cidInstance = new CID();

// Função init para inicializar o sistema de CID
function initCidSystem() {
  const inputs = document.querySelectorAll('.cid-input');
  const indices = [...new Set(Array.from(inputs).map(input => input.dataset.index))];

  indices.forEach(index => {
    if (window.cidInstance) {
      window.cidInstance.setupFields(index);
    }
  });
}

// Exportar funções para uso global
window.initCidSystem = initCidSystem;
