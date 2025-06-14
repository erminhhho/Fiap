/**
 * Módulo de Perfil Social
 */

// Limpar função de inicialização anterior
window.initModule = null;

// Definir nova função de inicialização do módulo
window.initModule = function() {
  console.log('[social.js] initModule: Iniciando módulo social.');

  // Forçar reinicialização quando acessado diretamente pela URL
  if (window.location.hash === '#social') {
    window._socialInitialized = false;
  }

  // Verificar se o módulo já foi inicializado nesta sessão
  if (window._socialInitialized) {
    console.log('[social.js] Módulo social já inicializado.');
    return;
  }

  // Marcar como inicializado
  window._socialInitialized = true;

  // Inicializar o conteúdo da página de forma estruturada
  initializePageContent();

  // Adicionar listener para o evento de sincronização de dados
  document.addEventListener('dataSynchronized', function(event) {
    console.log('[social.js] Evento de sincronização de dados detectado:', event.detail);
    // Recarregar os dados do assistido após a sincronização
    setTimeout(preencherDadosAssistido, 50); // Pequeno timeout para garantir que a sincronização foi concluída
  });

  // Limpar flag quando a página mudar
  document.addEventListener('stepChanged', function handleStepChange() {
    window._socialInitialized = false;
    document.removeEventListener('stepChanged', handleStepChange);
  }, { once: true });

  console.log('[social.js] Módulo social: eventos configurados e inicialização do assistido/restauração solicitada.');
};

// Função unificada para inicializar o conteúdo da página
function initializePageContent() {
  // Configurar eventos
  setupEvents();

  // Garantir que addFamilyMember esteja disponível globalmente
  if (typeof window.addFamilyMember === 'undefined' && typeof addFamilyMember === 'function') {
    window.addFamilyMember = addFamilyMember;
    console.log("[social.js] initModule: window.addFamilyMember definido.");
  }

  // Verificar se o formStateManager existe
  if (window.formStateManager && window.formStateManager.formData) {
    console.log('[social.js] initModule: formStateManager.formData existe.');

    // Verificar se há dados do assistido a serem preenchidos
    preencherDadosAssistido();

    if (window.formStateManager.formData.personal) {
      console.log('[social.js] initModule: formStateManager.formData.personal encontrado:',
                  JSON.parse(JSON.stringify(window.formStateManager.formData.personal)));
    } else {
      console.warn('[social.js] initModule: formStateManager.formData.personal NÃO encontrado.');
    }
  } else {
    console.warn('[social.js] initModule: formStateManager ou formStateManager.formData NÃO encontrado.');
  }

  // Inicializar o assistido
  const container = document.getElementById('membros-familia-list');
  if (container) {
    console.log("Container 'membros-familia-list' encontrado, inicializando assistido...");
    inicializarAssistido(); // Isso preenche a linha do assistido e os campos de nome/cpf/idade
  } else {
    console.error("ERRO: Container 'membros-familia-list' não encontrado. A lista de família não será populada corretamente.");
    return; // Se não conseguir inicializar o assistido, não continue
  }

  // Restaurar dados para esta etapa
  if (window.formStateManager) {
    const currentStepKey = 'social';
    console.log(`[social.js] initModule: Solicitando restauração para a etapa: ${currentStepKey} após inicialização do assistido.`);
    window.formStateManager.ensureFormAndRestore(currentStepKey);

    // Aplicar formatação imediatamente após a restauração
    document.querySelectorAll('input[name="familiar_nome[]"]').forEach(input => {
      if (typeof formatarNomeProprio === 'function') formatarNomeProprio(input);
    });
    document.querySelectorAll('input[name="familiar_cpf[]"]').forEach(input => {
      if (typeof maskCPF === 'function') maskCPF(input);
    });
    document.querySelectorAll('input[name="familiar_idade[]"]').forEach(input => {
      if (typeof formatAgeWithSuffix === 'function') formatAgeWithSuffix(input);
    });    // Reaplicar máscara de renda inteira após restauração
    document.querySelectorAll('input[name="familiar_renda[]"]').forEach(input => {
      if (typeof Mask !== 'undefined' && typeof Mask.moneyInteger === 'function') {
        Mask.moneyInteger(input);
      } else if (FIAP && FIAP.masks && typeof FIAP.masks.moneyInteger === 'function') {
        FIAP.masks.moneyInteger(input);
      }
    });
  } else {
    console.error("[social.js] initModule: formStateManager não encontrado. A restauração de dados não ocorrerá.");
  }

  // Configurar botões de navegação usando o sistema padronizado
  if (window.Navigation) {
    window.Navigation.setupNavigationButtons();
  }
}

// Função para resetar a UI da seção de perfil social (membros da família)
function resetSocialUI() {
  console.log('[social.js] resetSocialUI: Iniciando limpeza de membros da família.');
  const membrosList = document.getElementById('membros-familia-list');
  if (membrosList) {
    membrosList.innerHTML = ''; // Limpa todos os membros, incluindo o assistido
    console.log('[social.js] resetSocialUI: Container #membros-familia-list limpo.');

    // Recriar a linha do assistido, que é a base da seção
    if (typeof inicializarAssistido === 'function') {
      inicializarAssistido();
      console.log('[social.js] resetSocialUI: Linha do assistido recriada.');
    } else {
      console.warn('[social.js] resetSocialUI: Função inicializarAssistido() não encontrada.');
    }
  } else {
    console.warn('[social.js] resetSocialUI: Container #membros-familia-list não encontrado.');
  }
  // Limpar campos de renda total e observações, se necessário (clearForm já deve fazer, mas para garantir)
  const rendaTotalInput = document.getElementById('renda_total_familiar');
  if (rendaTotalInput) rendaTotalInput.value = '0.00'; // ou '' dependendo do comportamento esperado
  const rendaPerCapitaInput = document.getElementById('renda_per_capita');
  if (rendaPerCapitaInput) rendaPerCapitaInput.value = '0'; // ou ''
  const observacoesTextarea = document.getElementById('observacoes'); // ID genérico, verificar se é o correto para esta seção
  if (observacoesTextarea && observacoesTextarea.closest('#social-form')) { // Checar se é a observacao desta pagina
      observacoesTextarea.value = '';
  }
  if(typeof setupRendaFamiliar === 'function') {
    setupRendaFamiliar(); // Recalcular/resetar visualizações de renda
  }
}
window.resetSocialUI = resetSocialUI;

// Variável global para armazenar o select de parentesco que disparou o modal
// Garantir que currentParentescoSelect seja declarado apenas uma vez globalmente
if (typeof window.currentParentescoSelectGlobal === 'undefined') {
  window.currentParentescoSelectGlobal = null;
}
// Usar window.currentParentescoSelectGlobal ao invés de currentParentescoSelect localmente
// let currentParentescoSelect = null; // Comentado ou removido

// Função para configurar eventos do módulo
function setupEvents() {
  // Destacar campos preenchidos
  if (typeof destacarCamposPreenchidos === 'function') {
    destacarCamposPreenchidos();
  }

  // Configurar máscaras monetárias em todos os campos de renda
  const configMoneyMasks = () => {
    document.querySelectorAll('input[name="familiar_renda[]"]').forEach(input => {
      if (input) {
        // Remover event listener antigo para evitar duplicidade ou conflito
        const new_input = input.cloneNode(true);
        input.parentNode.replaceChild(new_input, input);        new_input.addEventListener('input', function() {
          if (typeof Mask !== 'undefined' && typeof Mask.moneyInteger === 'function') {
            Mask.moneyInteger(this);
          } else if (FIAP.masks && typeof FIAP.masks.moneyInteger === 'function') {
            FIAP.masks.moneyInteger(this);
          }
        });
        // Adicionar também no blur para garantir a formatação correta ao sair do campo
        new_input.addEventListener('blur', function() {
          if (typeof Mask !== 'undefined' && typeof Mask.moneyInteger === 'function') {
            Mask.moneyInteger(this);
          } else if (FIAP.masks && typeof FIAP.masks.moneyInteger === 'function') {
            FIAP.masks.moneyInteger(this);
          }
        });
      }
    });    // Campo de renda total
    const rendaTotalInput = document.getElementById('renda_total_familiar');
    if (rendaTotalInput) {
      rendaTotalInput.addEventListener('input', function() {
        if (typeof Mask !== 'undefined' && typeof Mask.moneyInteger === 'function') {
          Mask.moneyInteger(this);
        } else if (FIAP.masks && typeof FIAP.masks.money === 'function') {
          FIAP.masks.money(this);
        }
      });
    }
  };

  // Configurar máscaras
  setTimeout(configMoneyMasks, 500);

  // Inicializar cálculo de renda familiar
  setupRendaFamiliar();

  // Configurar botões de adicionar/remover membros da família
  // Nota: O botão de adicionar agora é inserido diretamente ao lado do assistido com onclick em linha

  const removeLastMemberBtn = document.getElementById('remove-last-family-member-btn');
  if (removeLastMemberBtn) {
    // Aplicar estilo centralizado ao botão de remover
    if (window.tw && typeof window.tw.applyTo === 'function') {
      window.tw.applyTo(removeLastMemberBtn, 'button.remove');
    }

    removeLastMemberBtn.addEventListener('click', removeLastFamilyMember);
  }
  // Configurar evento para os botões CadÚnico - evento delegado para evitar duplicação
  const membrosList = document.getElementById('membros-familia-list');
  if (membrosList) {
    // Remover eventos existentes para evitar duplicação
    const newMembrosList = membrosList.cloneNode(true);
    membrosList.parentNode.replaceChild(newMembrosList, membrosList);

    // Configurar novo evento
    newMembrosList.addEventListener('click', function(event) {
      const cadUnicoButton = event.target.closest('.cadunico-btn');
      if (cadUnicoButton && event.target === cadUnicoButton || cadUnicoButton.contains(event.target)) {
        // Evitar propagação para não ter chamadas múltiplas
        event.stopPropagation();
        toggleCadUnico(cadUnicoButton);
      }
    });
  }

  // Adicionar membro inicial se lista estiver vazia
  setTimeout(function() {
    const list = document.getElementById('membros-familia-list');
    // Verificar se o elemento existe e está vazio
    if (list && list.children.length === 0) {
      // Adicionar um membro inicial
      if (typeof addFamilyMember === 'function') {
        addFamilyMember();
      }
    }
  }, 200);

  // Botão Voltar
  const backButton = document.getElementById('btn-back');
  if (backButton) {
    // Aplicar estilo centralizado ao botão voltar
    if (window.tw && typeof window.tw.applyTo === 'function') {
      window.tw.applyTo(backButton, 'button.secondary');
    }

    backButton.addEventListener('click', function() {
      navigateTo('personal');
    });
  }

  // Botão Próximo
  const nextButton = document.getElementById('btn-next');
  if (nextButton) {
    // Aplicar estilo centralizado ao botão próximo
    if (window.tw && typeof window.tw.applyTo === 'function') {
      window.tw.applyTo(nextButton, 'button.primary');
    }

    // Remover eventos existentes
    const newBtn = nextButton.cloneNode(true);
    nextButton.parentNode.replaceChild(newBtn, nextButton);

    // Flag para prevenir múltiplos cliques
    let isNavigating = false;

    // Adicionar novo evento com proteção
    newBtn.addEventListener('click', function(e) {
      // Evitar comportamento padrão para prevenir propagação de evento
      e.preventDefault();
      e.stopPropagation();

      // Evitar múltiplos cliques
      if (isNavigating) return;
      isNavigating = true;

      // Feedback visual
      const originalText = this.innerHTML;
      this.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Carregando...';
      this.classList.add('opacity-75');

      try {
        // Salvar dados manualmente uma única vez, sem depender dos listeners em state.js
        if (window.formStateManager) {
          window.formStateManager.captureCurrentFormData();
        }

        // Atraso pequeno para garantir que o salvamento termine
        setTimeout(() => {
          // Navegar para a próxima página
          navigateTo('incapacity');

          // Restaurar estado do botão após navegação
          setTimeout(() => {
            if (document.body.contains(this)) {
              this.innerHTML = originalText;
              this.classList.remove('opacity-75');
            }
            isNavigating = false;
          }, 500);
        }, 100);
      } catch (error) {
        console.error('Erro ao navegar para a próxima página:', error);
        this.innerHTML = originalText;
        this.classList.remove('opacity-75');
        isNavigating = false;
      }
    });
  }

  // Configurar cálculo de renda familiar
  setupRendaFamiliar();

  // Event listener para os selects de parentesco
  document.getElementById('membros-familia-list').addEventListener('change', function(event) {
    if (event.target.classList.contains('parentesco-select') && event.target.value === 'Outro') {
      window.currentParentescoSelectGlobal = event.target;
      openOutroParentescoModal();
    }
  });

  // Event listeners para o modal de "Outro Parentesco"
  const outroParentescoModal = document.getElementById('outroParentescoModal');
  if (outroParentescoModal) {
    document.getElementById('closeOutroParentescoModal').addEventListener('click', closeOutroParentescoModal);
    document.getElementById('cancelOutroParentesco').addEventListener('click', closeOutroParentescoModal);
    document.getElementById('saveOutroParentesco').addEventListener('click', saveOutroParentesco);

    const outroParentescoInput = document.getElementById('outroParentescoInput');
    if (outroParentescoInput) {
        // Aplicar a máscara Mask.properName no evento blur
        outroParentescoInput.addEventListener('blur', function() {
            if (typeof formatarNomeProprio === 'function') {
                formatarNomeProprio(this);
            }
        });
        outroParentescoInput.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
              document.getElementById('saveOutroParentesco').click();
            }
        });
    }

    window.addEventListener('click', function(event) {
      if (event.target === outroParentescoModal) {
        closeOutroParentescoModal();
      }
    });
  }
}

// Inicializar dados do assistido
function inicializarAssistido() {
  console.log("Inicializando dados do assistido...");

  const container = document.getElementById('membros-familia-list');
  if (!container) {
    console.error("Container de membros da família não encontrado");
    return;
  }

  // Limpar o container
  container.innerHTML = '';

  // Criar elemento HTML para o assistido (primeira linha)
  const assistidoHtml = `
    <div class="membro-familia mb-6 relative assistido">
      <div class="grid grid-cols-1 md:grid-cols-24 gap-4">
        <!-- Nome do assistido - 6 colunas -->
        <div class="relative md:col-span-6">
          <input type="text" name="familiar_nome[]" id="assistido_nome" class="peer w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-3 text-gray-800 placeholder-gray-400 transition-colors duration-200" readonly />
          <label class="absolute left-4 -top-3 px-1 text-sm text-blue-600 bg-gray-50 rounded-t-lg rounded-b-none">
            Nome do Assistido
          </label>
        </div>

        <!-- CPF - 3 colunas -->
        <div class="relative md:col-span-3">
          <input type="text" name="familiar_cpf[]" id="assistido_cpf" class="peer w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-3 text-gray-800 placeholder-gray-400 transition-colors duration-200" readonly />
          <label class="absolute left-4 -top-3 px-1 text-sm text-blue-600 bg-gray-50 rounded-t-lg rounded-b-none">
            CPF
          </label>
        </div>

        <!-- Idade - 2 colunas -->
        <div class="relative md:col-span-2">
          <input type="text" name="familiar_idade[]" id="assistido_idade" class="peer w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-3 text-gray-800 placeholder-gray-400 transition-colors duration-200" readonly />
          <label class="absolute left-4 -top-3 px-1 text-sm text-blue-600 bg-gray-50 rounded-t-lg rounded-b-none">
            Idade
          </label>
        </div>

        <!-- Parentesco - 4 colunas (fixo como "Assistido") -->
        <div class="relative md:col-span-4">
          <input type="text" name="familiar_parentesco[]" value="Assistido" class="peer w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-3 text-gray-800 transition-colors duration-200" readonly />
          <label class="absolute left-4 -top-3 px-1 text-sm text-blue-600 bg-gray-50 rounded-t-lg rounded-b-none">
            Parentesco
          </label>
        </div>

        <!-- Estado Civil - 4 colunas (editável) -->
        <div class="relative md:col-span-4">
          <select name="familiar_estado_civil[]" class="peer w-full rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 px-4 py-3 text-gray-800 bg-gray-50 transition-colors duration-200">
            <option value="" selected disabled>Selecione...</option>
            <option value="Solteiro(a)">Solteiro(a)</option>
            <option value="Casado(a)">Casado(a)</option>
            <option value="União Estável">União Estável</option>
            <option value="Divorciado(a)">Divorciado(a)</option>
            <option value="Viúvo(a)">Viúvo(a)</option>
          </select>
          <label class="absolute left-4 -top-3 px-1 text-sm text-blue-600 bg-gray-50 rounded-t-lg rounded-b-none">
            Estado Civil
          </label>
        </div>        <!-- Renda Mensal - 2 colunas (editável) -->
        <div class="relative md:col-span-2">
          <input type="text" name="familiar_renda[]" id="assistido_renda" class="peer w-full rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 px-4 py-3 text-gray-800 bg-gray-50 placeholder-gray-400 transition-colors duration-200" placeholder="R$ 0" oninput="if(typeof Mask !== 'undefined' && typeof Mask.moneyInteger === 'function') Mask.moneyInteger(this)" />
          <label class="absolute left-4 -top-3 px-1 text-sm text-blue-600 bg-gray-50 rounded-t-lg rounded-b-none">
            Renda
          </label>
        </div><!-- CadÚnico - 2 colunas (editável) -->
        <div class="relative md:col-span-2 flex items-center justify-center">
          <input type="hidden" name="familiar_cadunico[]" value="Não" data-no-mask="true">
          <button type="button" class="cadunico-btn rounded-lg border border-gray-300 text-gray-500 hover:border-blue-500 hover:text-blue-600" title="Possui CadÚnico?" onclick="toggleCadUnico(this)">
            CadÚnico
          </button>
        </div>

        <!-- Botão de adicionar membro ao lado do assistido -->
        <div class="relative md:col-span-1 flex items-center justify-center">
          <button type="button" class="add-family-btn bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1 flex items-center justify-center w-8 h-8" title="Adicionar membro" onclick="addFamilyMember()">
            <i class="fas fa-plus"></i>
          </button>
        </div>
      </div>
    </div>
  `;
  // Inserir HTML diretamente
  container.innerHTML = assistidoHtml;
  // Preencher dados do assistido
  preencherDadosAssistido();
}

// Função para preencher os dados do assistido baseado na primeira página
function preencherDadosAssistido() {
  console.log('[social.js] preencherDadosAssistido: Iniciando preenchimento de dados do assistido.');

  const nomeInput = document.getElementById('assistido_nome');
  const cpfInput = document.getElementById('assistido_cpf');
  const idadeInput = document.getElementById('assistido_idade');

  // Valores padrão
  let nomeValue = 'Assistido';
  let cpfValue = '';
  let idadeValue = '';

  // Flag para registro da fonte de dados utilizada
  let fonteUtilizada = 'padrão';

  try {    // ESTRATÉGIA DE BUSCA CORRIGIDA:
    // 1. PRIMEIRO verificar no formStateManager.formData.personal (dados mais recentes vindos do personal)
    // 2. Se não encontrar, verificar no localStorage de personal
    // 3. Se não encontrar, verificar no formStateManager.formData.social
    // 4. Por último, verificar no localStorage de social

    // Inicializar flag para cada campo
    let nomeEncontrado = false;
    let cpfEncontrado = false;
    let idadeEncontrada = false;

    // Função auxiliar para obter e formatar idade a partir de uma data de nascimento
    const processarDataNascimento = (dataNascimentoStr) => {
      if (!dataNascimentoStr || typeof calcularIdadeCompleta !== 'function') return null;

      try {
        // Converter de DD/MM/YYYY para Date object
        const dataNasc = new Date(dataNascimentoStr.split('/').reverse().join('-'));
        if (!isNaN(dataNasc.getTime())) {
          const idadeObj = calcularIdadeCompleta(dataNasc);
          return `${idadeObj.anos} anos`;
        }
      } catch(e) {
        console.warn("[social.js] Erro ao calcular idade a partir da data de nascimento:", e);
      }
      return null;
    };

    // ==== FONTE 1: formStateManager.formData.personal (PRIORIDADE MÁXIMA) ====
    if (window.formStateManager && window.formStateManager.formData && window.formStateManager.formData.personal) {
      const personalData = window.formStateManager.formData.personal;
      console.log('[social.js] Verificando formStateManager.formData.personal (PRIORIDADE):', JSON.parse(JSON.stringify(personalData)));        // Verificar nome
        if (!nomeEncontrado && personalData['autor_nome[]'] && personalData['autor_nome[]'].length > 0 && personalData['autor_nome[]'][0]) {
          nomeValue = personalData['autor_nome[]'][0];
          nomeEncontrado = true;
          console.log('[social.js] Nome encontrado em formStateManager.formData.personal (PRIORIDADE):', nomeValue);
          fonteUtilizada = 'formStateManager.personal';
        }

        // Verificar CPF
        if (!cpfEncontrado && personalData['autor_cpf[]'] && personalData['autor_cpf[]'].length > 0 && personalData['autor_cpf[]'][0]) {
          cpfValue = personalData['autor_cpf[]'][0];
          cpfEncontrado = true;
          console.log('[social.js] CPF encontrado em formStateManager.formData.personal (PRIORIDADE):', cpfValue);
          fonteUtilizada = 'formStateManager.personal';
        }

        // Verificar idade
        if (!idadeEncontrada) {
          // Primeiro tentar com autor_idade[]
          if (personalData['autor_idade[]'] && personalData['autor_idade[]'].length > 0 && personalData['autor_idade[]'][0]) {
            idadeValue = personalData['autor_idade[]'][0];
            idadeEncontrada = true;
            console.log('[social.js] Idade encontrada em formStateManager.formData.personal (autor_idade[] - PRIORIDADE):', idadeValue);
            fonteUtilizada = 'formStateManager.personal';
          }
          // Se não encontrar, tentar calcular a partir da data de nascimento
          else if (personalData['autor_nascimento[]'] && personalData['autor_nascimento[]'].length > 0 && personalData['autor_nascimento[]'][0]) {
            const idadeCalculada = processarDataNascimento(personalData['autor_nascimento[]'][0]);
            if (idadeCalculada) {
              idadeValue = idadeCalculada;
              idadeEncontrada = true;
              console.log('[social.js] Idade calculada a partir de formStateManager.formData.personal (autor_nascimento[] - PRIORIDADE):', idadeValue);
              fonteUtilizada = 'formStateManager.personal (data de nascimento)';
            }
          }
        }
    }

    // ==== FONTE 2: localStorage do módulo personal ====
    if (!nomeEncontrado || !cpfEncontrado || !idadeEncontrada) {
      try {
        const personalModuleData = localStorage.getItem('fiap_form_data_personal');
        if (personalModuleData) {
          const personalData = JSON.parse(personalModuleData);
          console.log('[social.js] Verificando localStorage personal:', personalData);
            // Verificar nome
          if (!nomeEncontrado && personalData['autor_nome[]'] && personalData['autor_nome[]'].length > 0 && personalData['autor_nome[]'][0]) {
            nomeValue = personalData['autor_nome[]'][0];
            nomeEncontrado = true;
            console.log('[social.js] Nome encontrado em localStorage personal:', nomeValue);
            fonteUtilizada = 'localStorage.personal';
          }

          // Verificar CPF
          if (!cpfEncontrado && personalData['autor_cpf[]'] && personalData['autor_cpf[]'].length > 0 && personalData['autor_cpf[]'][0]) {
            cpfValue = personalData['autor_cpf[]'][0];
            cpfEncontrado = true;
            console.log('[social.js] CPF encontrado em localStorage personal:', cpfValue);
            fonteUtilizada = 'localStorage.personal';
          }

          // Verificar idade
          if (!idadeEncontrada) {
            // Primeiro tentar com autor_idade[]
            if (personalData['autor_idade[]'] && personalData['autor_idade[]'].length > 0 && personalData['autor_idade[]'][0]) {
              idadeValue = personalData['autor_idade[]'][0];
              idadeEncontrada = true;
              console.log('[social.js] Idade encontrada em localStorage personal (autor_idade[]):', idadeValue);
              fonteUtilizada = 'localStorage.personal';
            }
            // Se não encontrar, tentar calcular a partir da data de nascimento
            else if (personalData['autor_nascimento[]'] && personalData['autor_nascimento[]'].length > 0 && personalData['autor_nascimento[]'][0]) {
              const idadeCalculada = processarDataNascimento(personalData['autor_nascimento[]'][0]);
              if (idadeCalculada) {
                idadeValue = idadeCalculada;
                idadeEncontrada = true;
                console.log('[social.js] Idade calculada a partir de localStorage personal (autor_nascimento[]):', idadeValue);
                fonteUtilizada = 'localStorage.personal (data de nascimento)';
              }
            }
          }
        }
      } catch (e) {
        console.error('[social.js] Erro ao ler dados do localStorage personal:', e);
      }
    }

    // ==== FONTE 3: formStateManager.formData.social ====
    if (!nomeEncontrado || !cpfEncontrado || !idadeEncontrada) {
      if (window.formStateManager && window.formStateManager.formData && window.formStateManager.formData.social) {
        const socialData = window.formStateManager.formData.social;
        console.log('[social.js] Verificando formStateManager.formData.social (FALLBACK):', JSON.parse(JSON.stringify(socialData)));

        // Verificar nome
        if (!nomeEncontrado && socialData.familiar_nome && socialData.familiar_nome.length > 0 && socialData.familiar_nome[0] && socialData.familiar_nome[0] !== 'Assistido') {
          nomeValue = socialData.familiar_nome[0];
          nomeEncontrado = true;
          console.log('[social.js] Nome encontrado em formStateManager.formData.social (FALLBACK):', nomeValue);
          fonteUtilizada = 'formStateManager.social';
        }

        // Verificar CPF
        if (!cpfEncontrado && socialData.familiar_cpf && socialData.familiar_cpf.length > 0 && socialData.familiar_cpf[0]) {
          cpfValue = socialData.familiar_cpf[0];
          cpfEncontrado = true;
          console.log('[social.js] CPF encontrado em formStateManager.formData.social (FALLBACK):', cpfValue);
          fonteUtilizada = 'formStateManager.social';
        }

        // Verificar idade
        if (!idadeEncontrada && socialData.familiar_idade && socialData.familiar_idade.length > 0 && socialData.familiar_idade[0]) {
          idadeValue = socialData.familiar_idade[0];
          idadeEncontrada = true;
          console.log('[social.js] Idade encontrada em formStateManager.formData.social (FALLBACK):', idadeValue);
          fonteUtilizada = 'formStateManager.social';
        }
      }
    }

    // ==== FONTE 4: localStorage do módulo social ====
    if (!nomeEncontrado || !cpfEncontrado || !idadeEncontrada) {
      try {
        const socialModuleData = localStorage.getItem('fiap_form_data_social');
        if (socialModuleData) {
          const socialData = JSON.parse(socialModuleData);
          console.log('[social.js] Verificando localStorage social (FALLBACK):', socialData);

          // Verificar nome
          if (!nomeEncontrado && socialData.familiar_nome && socialData.familiar_nome.length > 0 && socialData.familiar_nome[0] && socialData.familiar_nome[0] !== 'Assistido') {
            nomeValue = socialData.familiar_nome[0];
            nomeEncontrado = true;
            console.log('[social.js] Nome encontrado em localStorage social (FALLBACK):', nomeValue);
            fonteUtilizada = 'localStorage.social';
          }

          // Verificar CPF
          if (!cpfEncontrado && socialData.familiar_cpf && socialData.familiar_cpf.length > 0 && socialData.familiar_cpf[0]) {
            cpfValue = socialData.familiar_cpf[0];
            cpfEncontrado = true;
            console.log('[social.js] CPF encontrado em localStorage social (FALLBACK):', cpfValue);
            fonteUtilizada = 'localStorage.social';
          }

          // Verificar idade
          if (!idadeEncontrada && socialData.familiar_idade && socialData.familiar_idade.length > 0 && socialData.familiar_idade[0]) {
            idadeValue = socialData.familiar_idade[0];
            idadeEncontrada = true;
            console.log('[social.js] Idade encontrada em localStorage social (FALLBACK):', idadeValue);
            fonteUtilizada = 'localStorage.social';
          }
        }
      } catch (e) {
        console.error('[social.js] Erro ao ler dados do localStorage social:', e);
      }    }

    // Formatação padronizada da idade
    if (idadeValue) {
      let idadeFormatada = '';
      // Extrair apenas o número de anos, ignorando meses ou qualquer outra informação
      const matchAnos = idadeValue.match(/(\d+)\s*ano(s)?/);
      if (matchAnos && matchAnos[1]) {
        idadeFormatada = matchAnos[1] + " anos";
      } else if (idadeValue && !isNaN(parseInt(idadeValue.trim()))) {
        // Se for apenas um número, adiciona " anos"
        idadeFormatada = parseInt(idadeValue.trim()) + " anos";
      } else {
        const justDigits = idadeValue.replace(/\D/g, '');
        if (justDigits) {
          const firstDigitSequence = justDigits.match(/\d+/);
          if (firstDigitSequence) {
            idadeFormatada = firstDigitSequence[0] + " anos";
          }
        }
      }

      if (idadeFormatada) {
        idadeValue = idadeFormatada;
      }
    }

    // Preencher os inputs com os valores encontrados
    if (nomeInput) {
      nomeInput.value = nomeValue;
      console.log('[social.js] Nome do assistido preenchido:', nomeValue);
    }

    if (cpfInput) {
      cpfInput.value = cpfValue;
      console.log('[social.js] CPF do assistido preenchido:', cpfValue);
    }

    if (idadeInput) {
      idadeInput.value = idadeValue;
      console.log('[social.js] Idade do assistido preenchida:', idadeValue);
    }

    // Atualizar o formStateManager para refletir os valores recuperados
    // Isso garante que as informações estarão disponíveis para acesso futuro
    if (window.formStateManager && window.formStateManager.formData) {
      if (!window.formStateManager.formData.social) {
        window.formStateManager.formData.social = {};
      }

      if (!window.formStateManager.formData.social.familiar_nome) {
        window.formStateManager.formData.social.familiar_nome = [];
      }

      if (!window.formStateManager.formData.social.familiar_cpf) {
        window.formStateManager.formData.social.familiar_cpf = [];
      }

      if (!window.formStateManager.formData.social.familiar_idade) {
        window.formStateManager.formData.social.familiar_idade = [];
      }

      if (!window.formStateManager.formData.social.familiar_parentesco) {
        window.formStateManager.formData.social.familiar_parentesco = [];
      }

      // Atualizar os dados no formStateManager
      window.formStateManager.formData.social.familiar_nome[0] = nomeValue;
      window.formStateManager.formData.social.familiar_cpf[0] = cpfValue;
      window.formStateManager.formData.social.familiar_idade[0] = idadeValue;
      window.formStateManager.formData.social.familiar_parentesco[0] = 'Assistido';

      // Salvar imediatamente para garantir persistência
      if (typeof window.formStateManager.saveStateImmediately === 'function') {
        window.formStateManager.saveStateImmediately();
        console.log('[social.js] Dados atualizados no formStateManager e salvos imediatamente');
      }
    }

    console.log(`[social.js] Preenchimento de dados do assistido concluído. Fonte principal utilizada: ${fonteUtilizada}`);

  } catch (error) {
    console.error('[social.js] Erro durante o preenchimento dos dados do assistido:', error);
  }
}

// Função para adicionar membro da família
function addFamilyMember() {
  const container = document.getElementById('membros-familia-container');
  const list = document.getElementById('membros-familia-list');

  // Verificar se os elementos existem
  if (!container || !list) {
    console.error('Elementos necessários não encontrados.');
    return;
  }

  const template = document.getElementById('membro-familia-template');
  if (!template) {
    console.error('Template de membro da família não encontrado.');
    return;
  }

  const memberDiv = document.createElement('div');
  memberDiv.innerHTML = template.innerHTML.trim();
  const newMemberElement = memberDiv.firstChild;

  list.appendChild(newMemberElement);  // Aplicar máscaras aos novos campos
  if (typeof maskCPF === 'function') {
    newMemberElement.querySelectorAll('input[name="familiar_cpf[]"]').forEach(input => {
      input.addEventListener('input', function() {
        maskCPF(this);
      });
    });
  }

  // Aplicar máscaras de idade nos novos membros
  newMemberElement.querySelectorAll('input[name="familiar_idade[]"]').forEach(input => {
    input.addEventListener('input', function() {
      if (typeof maskNumericAge === 'function') maskNumericAge(this);
    });
    input.addEventListener('blur', function() {
      if (typeof formatAgeWithSuffix === 'function') formatAgeWithSuffix(this);
    });
  });
  // Aplicar máscaras de renda nos novos membros
  newMemberElement.querySelectorAll('input[name="familiar_renda[]"]').forEach(input => {
    input.addEventListener('input', function() {
      if (typeof Mask !== 'undefined' && typeof Mask.moneyInteger === 'function') {
        Mask.moneyInteger(this);
      } else if (FIAP && FIAP.masks && typeof FIAP.masks.moneyInteger === 'function') {
        FIAP.masks.moneyInteger(this);
      }
    });
  });

  // Aplicar formatação de nome próprio nos novos membros
  newMemberElement.querySelectorAll('input[name="familiar_nome[]"]').forEach(input => {
    input.addEventListener('input', function() {
      if (typeof formatarNomeProprio === 'function') formatarNomeProprio(this);
    });
    input.addEventListener('blur', function() {
      if (typeof formatarNomeProprio === 'function') formatarNomeProprio(this);
    });
  });

  // Configurar evento do botão CadÚnico no novo membro
  const cadUnicoBtn = newMemberElement.querySelector('.cadunico-btn');
  if (cadUnicoBtn) {
    // Garantir que o evento onclick está funcionando
    cadUnicoBtn.onclick = function() {
      toggleCadUnico(this);
    };
    console.log('Botão CadÚnico configurado para novo membro:', cadUnicoBtn);
  }
  // Destacar campos
  if (typeof destacarCamposPreenchidos === 'function') {
    destacarCamposPreenchidos();
  }

  // Recalcular renda familiar após adicionar novo membro
  setTimeout(() => {
    if (typeof calcularRendaTotal === 'function') {
      calcularRendaTotal();
    }
  }, 100);

  updateRemoveMemberButton();
}

window.addFamilyMember = addFamilyMember;

// Exportar outras funções relacionadas à família para o escopo global
window.removeLastFamilyMember = removeLastFamilyMember;
window.updateRemoveMemberButton = updateRemoveMemberButton;
window.removeSpecificFamilyMember = removeSpecificFamilyMember;

// Função para remover o último membro da família (nunca remove o assistido)
function removeLastFamilyMember() {
  const list = document.getElementById('membros-familia-list');
  if (list && list.children.length > 1) {
    list.lastElementChild.remove();
    updateRemoveMemberButton();
  }
}

// Função para remover um membro específico da família (nunca o assistido)
function removeSpecificFamilyMember(button) {
  if (!button) return;

  const memberDiv = button.closest('.membro-familia');
  if (memberDiv && !memberDiv.classList.contains('assistido')) {
    memberDiv.remove();
    updateRemoveMemberButton();
  }
}

// Função para atualizar a visibilidade do botão de remover membro
function updateRemoveMemberButton() {
  const removeButton = document.getElementById('remove-last-family-member-btn');
  const list = document.getElementById('membros-familia-list');
  if (removeButton && list) {
    removeButton.style.display = list.children.length > 1 ? 'flex' : 'none';
  }
}

// Função para alternar o estado do botão CadÚnico
function toggleCadUnico(button) {
  if (!button) return;

  console.log("toggleCadUnico chamado para:", button);

  // Garantir que estamos trabalhando com o próprio botão, não com filhos
  const targetButton = button.classList.contains('cadunico-btn') ? button : button.closest('.cadunico-btn');
  if (!targetButton) {
    console.error("Botão CadÚnico não encontrado");
    return;
  }

  // Remover event listeners antigos para evitar chamadas duplicadas
  // Clone o nó para remover todos os listeners
  const newButton = targetButton.cloneNode(true);
  if (targetButton.parentNode) {
    targetButton.parentNode.replaceChild(newButton, targetButton);
  }

  // Readicionar o onclick event
  newButton.onclick = function() {
    toggleCadUnico(this);
  };

  // Toggle da classe active
  newButton.classList.toggle('active');

  // Atualizar estilos visuais
  if (newButton.classList.contains('active')) {
    newButton.classList.add('bg-green-500', 'text-white', 'border-green-500');
    newButton.classList.remove('text-gray-500', 'border-gray-300');
  } else {
    newButton.classList.remove('bg-green-500', 'text-white', 'border-green-500');
    newButton.classList.add('text-gray-500', 'border-gray-300');
  }

  // Atualizar valor do input hidden
  const hiddenInput = newButton.previousElementSibling;
  if (hiddenInput && hiddenInput.type === 'hidden') {
    hiddenInput.value = newButton.classList.contains('active') ? 'Sim' : 'Não';
  }

  // Recalcular a renda total e per capita quando o status de CadÚnico mudar
  // Usar requestAnimationFrame para garantir que a UI foi atualizada antes do cálculo
  requestAnimationFrame(() => {
    calcularRendaTotal();
  });
}

// Corrigir o problema de duplicação ao adicionar linhas
function setupAddButtons() {
  // Remover eventos existentes para evitar duplicação
  const addButtons = document.querySelectorAll('.add-item-button');
  addButtons.forEach(button => {
    // Clone o botão para remover todos os event listeners
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);

    // Adicionar o novo event listener
    newButton.addEventListener('click', function() {
      const targetId = this.getAttribute('data-target');
      addItem(targetId);
    });
  });
}

/**
 * Adiciona um novo item a uma lista
 * @param {string} targetId - ID do container onde adicionar o item
 */
function addItem(targetId) {
  const container = document.getElementById(targetId);
  if (!container) return;

  const itemsCount = container.querySelectorAll('.social-item').length;
  const newId = itemsCount + 1;

  let template;

  // Escolher o template baseado no targetId
  switch(targetId) {
    case 'beneficiosList':
      template = createBeneficioTemplate(newId);
      break;
    case 'composicaoFamiliarList':
      template = createFamiliarTemplate(newId);
      break;
    case 'rendaList':
      template = createRendaTemplate(newId);
      break;
    // Adicione outros casos conforme necessário
    default:
      console.error('Template não encontrado para:', targetId);
      return;
  }

  const itemDiv = document.createElement('div');
  itemDiv.className = 'social-item mb-4 border-b border-gray-200 pb-4';
  itemDiv.innerHTML = template;
  container.appendChild(itemDiv);

  // Configurar o botão de remover
  const removeBtn = itemDiv.querySelector('.remove-item');
  if (removeBtn) {
    removeBtn.addEventListener('click', function() {
      itemDiv.remove();
    });
  }

  // Inicializar máscaras e outros comportamentos especiais
  if (typeof initMasks === 'function') {
    initMasks();
  }
}

// Funções para criar templates (mantenha as que você já tem)
function createBeneficioTemplate(id) {
  return `
    <!-- Template para benefício -->
    <!-- ...existing code... -->
  `;
}

// Função para inicializar os elementos da interface
function initSocialModule() {
  // Configurar as opções selecionáveis do CAD Único
  setupStatusOptions();

  // Carregar os dados do assistido como primeiro membro familiar
  carregarDadosAssistido();

  // Configurar os botões de adição e remoção
  setupAddButtons();
}

// Inicializar as opções estilizadas do status (versão horizontal)
function setupStatusOptions() {
  document.querySelectorAll('.status-option').forEach(option => {
    const radio = option.querySelector('input[type="radio"]');
    const badge = option.querySelector('.status-badge');
    const icon = option.querySelector('.option-icon');

    badge.addEventListener('click', () => {
      // Desmarcar todos
      document.querySelectorAll('.status-option input[type="radio"]').forEach(r => r.checked = false);
      document.querySelectorAll('.status-badge').forEach(b => {
        b.classList.remove('border-blue-500', 'bg-blue-50');
        b.querySelector('.option-icon').classList.remove('text-blue-500');
        b.querySelector('.option-icon').classList.add('text-gray-400');
      });

      // Marcar o selecionado
      radio.checked = true;
      badge.classList.add('border-blue-500', 'bg-blue-50');
      icon.classList.remove('text-gray-400');
      icon.classList.add('text-blue-500');
    });
  });
}

// Configurar cálculo de renda familiar
function setupRendaFamiliar() {
  const membrosList = document.getElementById('membros-familia-list');
  const rendaTotalInput = document.getElementById('renda_total_familiar');
  const rendaPerCapitaInput = document.getElementById('renda_per_capita');

  if (!membrosList || !rendaTotalInput || !rendaPerCapitaInput) return;
  // Monitorar mudanças de renda nos membros da família - removendo e recriando para evitar duplicação
  const newMembrosList = membrosList.cloneNode(false);
  while (membrosList.firstChild) {
    newMembrosList.appendChild(membrosList.firstChild);
  }
  membrosList.parentNode.replaceChild(newMembrosList, membrosList);

  // Adicionar novo listener para input de renda
  newMembrosList.addEventListener('input', function(event) {
    if (event.target.name === 'familiar_renda[]') {
      // Usar requestAnimationFrame para garantir que a UI foi atualizada
      requestAnimationFrame(() => {
        calcularRendaTotal();
      });
    }
  });

  // Monitorar mudanças no campo de renda total
  rendaTotalInput.addEventListener('input', function() {
    calcularRendaPerCapita();
    atualizarTermometro();
  });

  // Configuração inicial
  setTimeout(calcularRendaTotal, 500);
}

// Calcular renda total da família somando valores dos campos
function calcularRendaTotal() {
  const membrosFamilia = document.querySelectorAll('.membro-familia');
  const rendaTotalInput = document.getElementById('renda_total_familiar');
  const rendaTotalDisplay = document.getElementById('renda_total_display');

  // Verificar se os elementos necessários existem antes de prosseguir
  if (!membrosFamilia.length || !rendaTotalInput) {
    console.log('Elementos para cálculo de renda não encontrados, ignorando atualização.');
    return;
  }

  let total = 0;
  let totalCadunico = 0;
  let membrosCadunico = 0;
  membrosFamilia.forEach(membro => {
    const rendaInput = membro.querySelector('input[name="familiar_renda[]"]');
    const cadunicoBtn = membro.querySelector('.cadunico-btn');
    const possuiCadunico = cadunicoBtn && cadunicoBtn.classList.contains('active');

    if (rendaInput) {    // Limpar valor para processamento (remover R$, pontos e trocar vírgula por ponto)
      const valorLimpo = rendaInput.value
        .replace('R$', '')
        .replace(/\./g, '')
        .replace(',', '.')
        .trim();    if (valorLimpo && !isNaN(valorLimpo)) {
        // Processar o valor como inteiro
        const valorNumerico = Math.round(parseFloat(valorLimpo));
        total += valorNumerico;
        // Somar apenas membros com CadÚnico
        if (possuiCadunico) {
          totalCadunico += valorNumerico;
          membrosCadunico++;
        }
      }
    }
  });

  // Formatar e atualizar valores
  const valorFormatado = FIAP && FIAP.utils && typeof FIAP.utils.formatMoney === 'function'
    ? FIAP.utils.formatMoney(total)
    : formatarMoeda(total);

  // Atualizar valores nos campos
  rendaTotalInput.value = total.toFixed(2);

  // Atualizar display de renda total
  if (rendaTotalDisplay) {
    rendaTotalDisplay.textContent = valorFormatado;
  }
  // Calcular renda per capita apenas com membros CadÚnico e atualizar termômetro
  calcularRendaPerCapita(totalCadunico, membrosCadunico);

  // Verificar se os elementos necessários para o termômetro existem antes de atualizá-lo
  if (document.getElementById('renda-indicator') && document.getElementById('renda-progress')) {
    atualizarTermometro();
  }
}
window.calcularRendaTotal = calcularRendaTotal;

// Calcular renda per capita (total dividido pelo número de membros com CadÚnico)
function calcularRendaPerCapita(totalCadunico, membrosCadunico) {
  const rendaTotalInput = document.getElementById('renda_total_familiar');
  const rendaPerCapitaInput = document.getElementById('renda_per_capita');
  const rendaPerCapitaDisplay = document.getElementById('renda_per_capita_display');
  const membrosList = document.getElementById('membros-familia-list');

  if (!rendaPerCapitaInput || !membrosList) return;

  // Se não foram fornecidos os parâmetros, calcular com base nos botões CadÚnico
  if (totalCadunico === undefined || membrosCadunico === undefined) {
    totalCadunico = 0;
    membrosCadunico = 0;

    const membrosFamilia = document.querySelectorAll('.membro-familia');
    membrosFamilia.forEach(membro => {
      const rendaInput = membro.querySelector('input[name="familiar_renda[]"]');
      const cadunicoBtn = membro.querySelector('.cadunico-btn');
      const possuiCadunico = cadunicoBtn && cadunicoBtn.classList.contains('active');

      if (rendaInput && possuiCadunico) {
        const valorLimpo = rendaInput.value
          .replace('R$', '')
          .replace(/\./g, '')
          .replace(',', '.')
          .trim();

        if (valorLimpo && !isNaN(valorLimpo)) {
          totalCadunico += parseFloat(valorLimpo);
          membrosCadunico++;
        }
      }
    });
  }

  // Se não houver membros com CadÚnico, usar o total geral
  if (membrosCadunico === 0) {
    const totalMembros = membrosList.querySelectorAll('.membro-familia').length;
    if (totalMembros === 0) return;

    // Obter renda total e converter para número
    let rendaTotal = rendaTotalInput.value || 0;
    if (typeof rendaTotal === 'string') {
      rendaTotal = parseFloat(rendaTotal) || 0;
    }

    membrosCadunico = totalMembros;
    totalCadunico = rendaTotal;
  }
  // Calcular per capita e arredondar para inteiro
  const rendaPerCapita = Math.round(totalCadunico / membrosCadunico);

  // Formatar o valor
  const valorFormatado = FIAP && FIAP.utils && typeof FIAP.utils.formatMoney === 'function'
    ? FIAP.utils.formatMoney(rendaPerCapita)
    : formatarMoeda(rendaPerCapita);

  // Atualizar campo hidden com o valor numérico arredondado
  rendaPerCapitaInput.value = rendaPerCapita;

  // Atualizar display com o valor formatado
  if (rendaPerCapitaDisplay) {
    rendaPerCapitaDisplay.textContent = valorFormatado;
  }
}

// Atualizar termômetro de renda per capita
function atualizarTermometro() {
  const rendaPerCapitaInput = document.getElementById('renda_per_capita');
  const indicador = document.getElementById('renda-indicator');
  const progresso = document.getElementById('renda-progress');
  const salarioMinimoDisplay = document.getElementById('salario-minimo-display');

  // Verificar se todos os elementos necessários existem antes de prosseguir
  if (!rendaPerCapitaInput || !indicador || !progresso) {
    console.log('Elementos do termômetro não encontrados na página atual, ignorando atualização.');
    return;
  }

  // Obter o salário mínimo atual usando o valor dinâmico da API
  let salarioMinimo = CONFIG.financial.minimumWage; // Usar valor do CONFIG

  if (FIAP && FIAP.utils && typeof FIAP.utils.getSalarioMinimo === 'function') {
    salarioMinimo = FIAP.utils.getSalarioMinimo();
  }

  // Atualizar o display do salário mínimo na interface
  if (salarioMinimoDisplay) {
    const salarioFormatado = FIAP && FIAP.utils && typeof FIAP.utils.formatMoney === 'function'
      ? FIAP.utils.formatMoney(salarioMinimo)
      : formatarMoeda(salarioMinimo);

    salarioMinimoDisplay.textContent = salarioFormatado;
  }
  // Obter valor de renda per capita
  let rendaPerCapita = rendaPerCapitaInput.value;
  // Verificar se já é um número ou se precisa conversão
  if (typeof rendaPerCapita === 'string') {
    rendaPerCapita = rendaPerCapita
      .replace('R$', '')
      .replace(/\./g, '')
      .replace(',', '.')
      .trim();
  }

  rendaPerCapita = parseFloat(rendaPerCapita) || 0;

  // Não aplicar divisão adicional, usar o valor como está
  // Calcular porcentagem em relação ao salário mínimo (limitado a 100%)
  let porcentagem = Math.min((rendaPerCapita / salarioMinimo) * 100, 100);

  // Atualizar barra de progresso (máscara branca cobre o restante)
  progresso.style.width = (100 - porcentagem) + '%';

  // Verificar se o indicador existe antes de prosseguir
  if (!indicador) {
    console.log('Elemento indicador não encontrado na página atual.');
    return;
  }

  // Atualizar posição do indicador (sem o texto ou bolinha)
  indicador.style.left = porcentagem + '%';
  // Removida a manipulação do indicador visual (bolinha)
  // Apenas movemos o indicador para a posição correta sem criar ou manipular elementos visuais
}

// Função para formatar valores em moeda brasileira (fallback caso FIAP.utils não esteja disponível)
function formatarMoeda(valor) {
  // Arredondar para valor inteiro
  valor = Math.round(valor);
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

function updateCadUnicoButtonVisual(hiddenInput) {
  if (!hiddenInput || hiddenInput.type !== 'hidden') return;

  const button = hiddenInput.nextElementSibling;
  // Garantir que o próximo irmão é realmente o botão CadÚnico esperado
  if (!button || !button.classList.contains('cadunico-btn')) {
    // Tentar encontrar o botão de forma mais robusta se não for o próximo irmão direto
    // Isso pode acontecer se houver outros elementos ou a estrutura mudar.
    // Esta busca é um fallback e pode precisar de ajuste se a estrutura for complexa.
    const parentContainer = hiddenInput.closest('.relative'); // Ou o container mais apropriado
    const cadUnicoButtonInContainer = parentContainer ? parentContainer.querySelector('.cadunico-btn') : null;
    if (!cadUnicoButtonInContainer) {
        console.warn('Botão CadÚnico não encontrado para o input hidden:', hiddenInput);
        return;
    }
     // Se encontrou, usar o botão encontrado
     if(cadUnicoButtonInContainer && cadUnicoButtonInContainer.classList.contains('cadunico-btn')) {
        // Se o botão encontrado for o correto, prosseguir
     } else {
        return; // Não é o botão esperado
     }
  }

  const isActive = hiddenInput.value === 'Sim';

  if (isActive) {
    button.classList.add('active', 'bg-green-500', 'text-white', 'border-green-500');
    button.classList.remove('text-gray-500', 'border-gray-300');
  } else {
    button.classList.remove('active', 'bg-green-500', 'text-white', 'border-green-500');
    button.classList.add('text-gray-500', 'border-gray-300');
  }
}
window.updateCadUnicoButtonVisual = updateCadUnicoButtonVisual;

// Função para abrir o modal de "Outro Parentesco"
function openOutroParentescoModal() {
  const modal = document.getElementById('outroParentescoModal');
  if (modal) {
    document.getElementById('outroParentescoInput').value = ''; // Limpa o input
    modal.classList.remove('hidden');
    document.getElementById('outroParentescoInput').focus();
  }
}

// Função para fechar o modal de "Outro Parentesco"
function closeOutroParentescoModal() {
  const modal = document.getElementById('outroParentescoModal');
  if (modal) {
    modal.classList.add('hidden');
    // Se o usuário cancelou ou fechou, e o valor do select ainda é "Outro" (porque não salvou um novo valor),
    // e não há uma opção customizada já adicionada, reseta para "Selecione..."
    if (window.currentParentescoSelectGlobal && window.currentParentescoSelectGlobal.value === 'Outro') {
        // Verifica se não existe uma opção com o valor que seria o input (evita resetar se já tinha um "Outro" customizado)
        const options = Array.from(window.currentParentescoSelectGlobal.options);
        const customOptionExists = options.some(opt => opt.value !== "" && opt.value !== "Outro" && !isDefaultParentescoOption(opt.value));

        if (!customOptionExists) {
             window.currentParentescoSelectGlobal.value = ""; // Reseta para "Selecione..."
        }
    }
    window.currentParentescoSelectGlobal = null; // Limpa a referência
  }
}

// Função auxiliar para verificar se uma opção de parentesco é uma das padrões
function isDefaultParentescoOption(value) {
    const defaultOptions = ["Cônjuge", "Companheiro", "Companheira", "Filho", "Filha", "Pai", "Mãe", "Irmão", "Irmã", "Enteado", "Enteada", "Outro"];
    return defaultOptions.includes(value);
}

// Função para salvar o valor do "Outro Parentesco"
function saveOutroParentesco() {
  const input = document.getElementById('outroParentescoInput');
  const novoParentesco = input.value.trim();

  if (novoParentesco && window.currentParentescoSelectGlobal) {
    // Verificar se a opção já existe (para não duplicar)
    let optionExists = false;
    for (let i = 0; i < window.currentParentescoSelectGlobal.options.length; i++) {
      if (window.currentParentescoSelectGlobal.options[i].value === novoParentesco) {
        optionExists = true;
        break;
      }
    }

    // Adicionar nova opção se não existir
    if (!optionExists) {
      const newOption = new Option(novoParentesco, novoParentesco, true, true);
      // Insere a nova opção antes da opção "Outro"
      const outroOption = Array.from(window.currentParentescoSelectGlobal.options).find(opt => opt.value === 'Outro');
      if (outroOption) {
        window.currentParentescoSelectGlobal.insertBefore(newOption, outroOption);
      } else {
        // Fallback caso a opção "Outro" não seja encontrada (improvável)
        window.currentParentescoSelectGlobal.appendChild(newOption);
      }
    }

    window.currentParentescoSelectGlobal.value = novoParentesco; // Define o valor do select para o novo parentesco
    closeOutroParentescoModal();

    // Disparar evento de change manualmente para que o formStateManager capture a alteração
    const event = new Event('change', { bubbles: true });
    window.currentParentescoSelectGlobal.dispatchEvent(event);

  } else if (!novoParentesco) {
    // Poderia adicionar um feedback para o usuário aqui se desejado
    console.warn("Nome do parentesco não pode ser vazio.");
    input.focus();
  }
  // Não precisa limpar currentParentescoSelect aqui, pois closeOutroParentescoModal já faz
}

document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    // Nome próprio
    document.querySelectorAll('input[name="familiar_nome[]"]').forEach(input => {
      if (typeof formatarNomeProprio === 'function') formatarNomeProprio(input);
    });
    // CPF
    document.querySelectorAll('input[name="familiar_cpf[]"]').forEach(input => {
      if (typeof maskCPF === 'function') maskCPF(input);
    });
    // Idade
    document.querySelectorAll('input[name="familiar_idade[]"]').forEach(input => {
      if (typeof formatAgeWithSuffix === 'function') formatAgeWithSuffix(input);
    });
    // Parentesco (se houver lógica automática)
    // ...
  }, 300);
});
