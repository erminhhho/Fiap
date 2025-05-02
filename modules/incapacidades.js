/**
 * Módulo de Incapacidades (antigo módulo de Saúde)
 */

// Limpando qualquer renderModule anterior
window.renderModule = null;

// Definindo a função de renderização do módulo
window.renderModule = function(container) {
  // HTML do formulário de incapacidades
  container.innerHTML = `
    <form id="incapacidades-form" autocomplete="off">
      <div class="bg-white rounded-2xl shadow p-8 mb-8">
        <div class="flex items-center gap-2 mb-6">
          <i class="fas fa-heartbeat text-blue-500 text-2xl"></i>
          <h2 class="text-lg font-semibold text-blue-600">Incapacidades</h2>
        </div>

        <!-- Seção de diagnóstico e CIDs -->
        <div class="bg-gray-50 rounded-xl p-6 mb-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <!-- Cartão SUS -->
            <div class="relative">
              <input type="text" id="sus" name="sus" class="peer w-full rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 px-4 py-3 text-gray-800 bg-gray-50 placeholder-gray-400 transition-colors duration-200" placeholder="Número do Cartão SUS" maxlength="15" oninput="maskOnlyNumbers(this)" />
              <label for="sus" class="absolute left-4 -top-3 px-1 text-sm text-transparent bg-transparent rounded-t-lg rounded-b-none transition-all duration-200 pointer-events-none peer-focus:text-blue-600 peer-focus:-top-3 peer-focus:bg-gray-50 peer-focus:text-blue-600 peer-focus:rounded-t-lg peer-focus:rounded-b-none peer-focus:text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:bg-transparent peer-placeholder-shown:rounded-none peer-placeholder-shown:text-transparent input-label">
                Cartão SUS
              </label>
            </div>

            <!-- CID principal com busca -->
            <div class="relative">
              <div class="flex">
                <input type="text" id="cid_principal" name="cid_principal" class="peer w-full rounded-l-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 px-4 py-3 text-gray-800 bg-gray-50 placeholder-gray-400 transition-colors duration-200" placeholder="CID principal (Ex: F70, G80.0)" />
                <button type="button" id="btn-search-cid" class="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-r-lg flex items-center">
                  <i class="fas fa-search"></i>
                </button>
              </div>
              <label for="cid_principal" class="absolute left-4 -top-3 px-1 text-sm text-transparent bg-transparent rounded-t-lg rounded-b-none transition-all duration-200 pointer-events-none peer-focus:text-blue-600 peer-focus:-top-3 peer-focus:bg-gray-50 peer-focus:text-blue-600 peer-focus:rounded-t-lg peer-focus:rounded-b-none peer-focus:text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:bg-transparent peer-placeholder-shown:rounded-none peer-placeholder-shown:text-transparent input-label">
                CID Principal
              </label>
              <!-- Resultado da pesquisa de CID aparecerá aqui -->
              <div id="cid-search-results" class="hidden absolute z-10 bg-white w-full border border-gray-300 rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto"></div>
            </div>
          </div>

          <!-- Diagnóstico principal -->
          <div class="relative mb-6">
            <input type="text" id="diagnostico_principal" name="diagnostico_principal" class="peer w-full rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 px-4 py-3 text-gray-800 bg-gray-50 placeholder-gray-400 transition-colors duration-200" placeholder="Diagnóstico principal (Ex: Deficiência intelectual leve, Paralisia cerebral)" />
            <label for="diagnostico_principal" class="absolute left-4 -top-3 px-1 text-sm text-transparent bg-transparent rounded-t-lg rounded-b-none transition-all duration-200 pointer-events-none peer-focus:text-blue-600 peer-focus:-top-3 peer-focus:bg-gray-50 peer-focus:text-blue-600 peer-focus:rounded-t-lg peer-focus:rounded-b-none peer-focus:text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:bg-transparent peer-placeholder-shown:rounded-none peer-placeholder-shown:text-transparent input-label">
              Diagnóstico Principal
            </label>
          </div>

          <!-- CIDs secundários -->
          <div class="relative mb-4">
            <div class="flex">
              <input type="text" id="cid_secundarios" name="cid_secundarios" class="peer w-full rounded-l-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 px-4 py-3 text-gray-800 bg-gray-50 placeholder-gray-400 transition-colors duration-200" placeholder="CIDs secundários (Ex: F90.0, F81)" />
              <button type="button" id="btn-search-cid-secondary" class="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-r-lg flex items-center">
                <i class="fas fa-search"></i>
              </button>
            </div>
            <label for="cid_secundarios" class="absolute left-4 -top-3 px-1 text-sm text-transparent bg-transparent rounded-t-lg rounded-b-none transition-all duration-200 pointer-events-none peer-focus:text-blue-600 peer-focus:-top-3 peer-focus:bg-gray-50 peer-focus:text-blue-600 peer-focus:rounded-t-lg peer-focus:rounded-b-none peer-focus:text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:bg-transparent peer-placeholder-shown:rounded-none peer-placeholder-shown:text-transparent input-label">
              CIDs Secundários
            </label>
            <!-- Resultado da pesquisa de CID secundário aparecerá aqui -->
            <div id="cid-secondary-search-results" class="hidden absolute z-10 bg-white w-full border border-gray-300 rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto"></div>
          </div>
        </div>

        <!-- Histórico de saúde e condições -->
        <div class="mb-6">
          <h4 class="text-blue-600 font-medium mb-3">Histórico e Acompanhamento</h4>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <!-- Início dos sintomas -->
            <div class="relative">
              <input type="text" id="inicio_sintomas" name="inicio_sintomas" oninput="maskDate(this)" class="peer w-full rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 px-4 py-3 text-gray-800 bg-gray-50 placeholder-gray-400 transition-colors duration-200" placeholder="dd/mm/aaaa" />
              <label for="inicio_sintomas" class="absolute left-4 -top-3 px-1 text-sm text-transparent bg-transparent rounded-t-lg rounded-b-none transition-all duration-200 pointer-events-none peer-focus:text-blue-600 peer-focus:-top-3 peer-focus:bg-gray-50 peer-focus:text-blue-600 peer-focus:rounded-t-lg peer-focus:rounded-b-none peer-focus:text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:bg-transparent peer-placeholder-shown:rounded-none peer-placeholder-shown:text-transparent input-label">
                Início dos Sintomas
              </label>
            </div>

            <!-- Data do diagnóstico -->
            <div class="relative">
              <input type="text" id="data_diagnostico" name="data_diagnostico" oninput="maskDate(this)" class="peer w-full rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 px-4 py-3 text-gray-800 bg-gray-50 placeholder-gray-400 transition-colors duration-200" placeholder="dd/mm/aaaa" />
              <label for="data_diagnostico" class="absolute left-4 -top-3 px-1 text-sm text-transparent bg-transparent rounded-t-lg rounded-b-none transition-all duration-200 pointer-events-none peer-focus:text-blue-600 peer-focus:-top-3 peer-focus:bg-gray-50 peer-focus:text-blue-600 peer-focus:rounded-t-lg peer-focus:rounded-b-none peer-focus:text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:bg-transparent peer-placeholder-shown:rounded-none peer-placeholder-shown:text-transparent input-label">
                Data do Diagnóstico
              </label>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <!-- Local de tratamento -->
            <div class="relative">
              <input type="text" id="local_tratamento" name="local_tratamento" class="peer w-full rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 px-4 py-3 text-gray-800 bg-gray-50 placeholder-gray-400 transition-colors duration-200" placeholder="Local de Tratamento" />
              <label for="local_tratamento" class="absolute left-4 -top-3 px-1 text-sm text-transparent bg-transparent rounded-t-lg rounded-b-none transition-all duration-200 pointer-events-none peer-focus:text-blue-600 peer-focus:-top-3 peer-focus:bg-gray-50 peer-focus:text-blue-600 peer-focus:rounded-t-lg peer-focus:rounded-b-none peer-focus:text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:bg-transparent peer-placeholder-shown:rounded-none peer-placeholder-shown:text-transparent input-label">
                Local de Tratamento
              </label>
            </div>

            <!-- Médico Responsável -->
            <div class="relative">
              <input type="text" id="medico_responsavel" name="medico_responsavel" class="peer w-full rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 px-4 py-3 text-gray-800 bg-gray-50 placeholder-gray-400 transition-colors duration-200" placeholder="Nome do médico responsável" />
              <label for="medico_responsavel" class="absolute left-4 -top-3 px-1 text-sm text-transparent bg-transparent rounded-t-lg rounded-b-none transition-all duration-200 pointer-events-none peer-focus:text-blue-600 peer-focus:-top-3 peer-focus:bg-gray-50 peer-focus:text-blue-600 peer-focus:rounded-t-lg peer-focus:rounded-b-none peer-focus:text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:bg-transparent peer-placeholder-shown:rounded-none peer-placeholder-shown:text-transparent input-label">
                Médico Responsável
              </label>
            </div>
          </div>
        </div>

        <!-- Grau de comprometimento -->
        <div class="mb-6">
          <h4 class="text-blue-600 font-medium mb-3">Grau de Comprometimento Funcional</h4>

          <div class="flex flex-wrap gap-3 mb-4">
            <label class="inline-flex items-center p-3 border rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
              <input type="radio" name="grau_comprometimento" value="Leve" class="sr-only peer">
              <div class="peer-checked:text-blue-600 peer-checked:font-semibold transition-all">
                <div class="flex items-center mb-1">
                  <div class="w-3 h-3 bg-blue-200 rounded-full mr-2"></div>
                  <span class="font-medium">Leve</span>
                </div>
                <p class="text-xs text-gray-600">Comprometimento mínimo. Consegue realizar atividades diárias com pouca ou nenhuma dificuldade.</p>
              </div>
            </label>
            <label class="inline-flex items-center p-3 border rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
              <input type="radio" name="grau_comprometimento" value="Moderado" class="sr-only peer">
              <div class="peer-checked:text-blue-600 peer-checked:font-semibold transition-all">
                <div class="flex items-center mb-1">
                  <div class="w-3 h-3 bg-blue-400 rounded-full mr-2"></div>
                  <span class="font-medium">Moderado</span>
                </div>
                <p class="text-xs text-gray-600">Consegue realizar atividades diárias com alguma dificuldade, pode necessitar de assistência parcial.</p>
              </div>
            </label>
            <label class="inline-flex items-center p-3 border rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
              <input type="radio" name="grau_comprometimento" value="Grave" class="sr-only peer">
              <div class="peer-checked:text-blue-600 peer-checked:font-semibold transition-all">
                <div class="flex items-center mb-1">
                  <div class="w-3 h-3 bg-blue-600 rounded-full mr-2"></div>
                  <span class="font-medium">Grave</span>
                </div>
                <p class="text-xs text-gray-600">Dificuldade significativa para realizar atividades diárias, necessita de assistência regular.</p>
              </div>
            </label>
            <label class="inline-flex items-center p-3 border rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
              <input type="radio" name="grau_comprometimento" value="Completo" class="sr-only peer">
              <div class="peer-checked:text-blue-600 peer-checked:font-semibold transition-all">
                <div class="flex items-center mb-1">
                  <div class="w-3 h-3 bg-blue-800 rounded-full mr-2"></div>
                  <span class="font-medium">Completo</span>
                </div>
                <p class="text-xs text-gray-600">Dependência total para atividades diárias, requer cuidados constantes.</p>
              </div>
            </label>
          </div>
        </div>

        <!-- Observações sobre a situação de saúde -->
        <div class="relative">
          <textarea id="obs_saude" name="obs_saude" rows="3"
            class="peer w-full rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 px-4 py-3 text-gray-800 bg-gray-50 placeholder-gray-400 transition-colors duration-200"
            placeholder="Observações relevantes sobre a situação de saúde, histórico médico, dificuldades, barreiras, etc."></textarea>
          <label for="obs_saude"
            class="absolute left-4 -top-3 px-1 text-sm text-blue-600 bg-gray-50 rounded-t-lg rounded-b-none transition-all duration-200 pointer-events-none">
            Observações sobre Saúde
          </label>
        </div>
      </div>

      <div class="flex justify-between mt-8">
        <button type="button" class="bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg px-8 py-3 text-base shadow transition focus:outline-none focus:ring-2 focus:ring-gray-300 flex items-center gap-2" id="btn-back">
          <i class="fas fa-arrow-left"></i> Anterior
        </button>
        <button type="button" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-8 py-3 text-base shadow transition focus:outline-none focus:ring-2 focus:ring-blue-300 flex items-center gap-2" id="btn-next">
          Próximo <i class="fas fa-arrow-right"></i>
        </button>
      </div>
    </form>
  `;

  // Configurar eventos após renderizar
  setupEvents();
};

// Função para configurar eventos do módulo
function setupEvents() {
  // Destacar campos preenchidos
  destacarCamposPreenchidos();

  // Configurar pesquisa de CID
  const btnSearchCID = document.getElementById('btn-search-cid');
  if (btnSearchCID) {
    btnSearchCID.addEventListener('click', function() {
      const searchTerm = document.getElementById('cid_principal').value;
      searchCID(searchTerm, 'cid-search-results', function(selectedCID) {
        document.getElementById('cid_principal').value = selectedCID;
      });
    });
  }

  // Configurar pesquisa de CID secundário
  const btnSearchCIDSecondary = document.getElementById('btn-search-cid-secondary');
  if (btnSearchCIDSecondary) {
    btnSearchCIDSecondary.addEventListener('click', function() {
      const searchTerm = document.getElementById('cid_secundarios').value;
      searchCID(searchTerm, 'cid-secondary-search-results', function(selectedCID) {
        const currentValue = document.getElementById('cid_secundarios').value;
        document.getElementById('cid_secundarios').value = currentValue ?
          currentValue + ', ' + selectedCID : selectedCID;
      });
    });
  }

  // Botão Voltar
  const backButton = document.getElementById('btn-back');
  if (backButton) {
    backButton.addEventListener('click', function() {
      navigateTo('social');
    });
  }

  // Botão Próximo
  const nextButton = document.getElementById('btn-next');
  if (nextButton) {
    nextButton.addEventListener('click', function() {
      navigateTo('insurance');
    });
  }
}
