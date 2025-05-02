/**
 * Script para o gerenciamento do formulário social
 */

// Variável para rastrear se o formulário já foi inicializado
let socialFormInitialized = false;

// Esperar o DOM estar pronto
document.addEventListener('DOMContentLoaded', function() {
  console.log("Inicializando módulo social...");

  if (!socialFormInitialized) {
    initSocialForm();
  }
});

// Função principal de inicialização do formulário social
function initSocialForm() {
  if (socialFormInitialized) {
    return; // Evitar inicialização dupla
  }

  console.log("Inicializando formulário social...");

  // Inicializar os seletores do CAD Único
  setupCadUnicoOptions();

  // Adicionar o assistido como membro inicial
  inicializarAssistido();

  // Marcar como inicializado
  socialFormInitialized = true;
}

// Inicializar dados do assistido e configurar botões
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

        <!-- Estado Civil - 4 colunas -->
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
        </div>

        <!-- Renda Mensal - 2 colunas -->
        <div class="relative md:col-span-2">
          <input type="text" name="familiar_renda[]" class="peer w-full rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 px-4 py-3 text-gray-800 bg-gray-50 placeholder-gray-400 transition-colors duration-200" placeholder="Renda" />
          <label class="absolute left-4 -top-3 px-1 text-sm text-blue-600 bg-gray-50 rounded-t-lg rounded-b-none">
            Renda
          </label>
        </div>

        <!-- CadÚnico - 2 colunas -->
        <div class="relative md:col-span-2 flex items-center justify-center">
          <input type="hidden" name="familiar_cadunico[]" value="Não">
          <button type="button" class="cadunico-btn rounded-lg border border-gray-300 text-gray-500 hover:border-blue-500 hover:text-blue-600" title="Possui CadÚnico?">
            CadÚnico
          </button>
        </div>

        <!-- Botão de adicionar (somente na primeira linha) - 1 coluna -->
        <div class="relative md:col-span-1 flex items-center justify-center">
          <button type="button" class="add-familiar-btn bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1 ml-2 flex items-center justify-center w-8 h-8" title="Adicionar membro">
            <i class="fas fa-plus"></i>
          </button>
        </div>
      </div>
    </div>
  `;

  // Inserir HTML diretamente (sem usar o template)
  container.innerHTML = assistidoHtml;

  // Preencher dados do assistido (nome, CPF, idade)
  preencherDadosAssistido();

  // Configurar os eventos dos botões
  configurarBotoesAcao();
}

// Função para preencher dados do assistido da primeira página
function preencherDadosAssistido() {
  console.log("Buscando dados do assistido...");

  // Obter os campos do formulário atual
  const nomeField = document.getElementById('assistido_nome');
  const cpfField = document.getElementById('assistido_cpf');
  const idadeField = document.getElementById('assistido_idade');

  if (!nomeField || !cpfField || !idadeField) {
    console.error("Campos do assistido não encontrados");
    return;
  }

  // MÉTODO 1: Buscar dados do formulário pessoal pelo DOM
  try {
    // Verificar se o campo nome está no DOM atual
    const nomePessoa = document.getElementById('nome');
    const cpfPessoa = document.getElementById('cpf');
    const dataNascimento = document.getElementById('data_nascimento');

    if (nomePessoa && nomePessoa.value) {
      console.log("Dados encontrados no DOM:", nomePessoa.value);

      // Preencher os campos do assistido
      nomeField.value = nomePessoa.value;

      if (cpfPessoa && cpfPessoa.value) {
        cpfField.value = cpfPessoa.value;
      }

      if (dataNascimento && dataNascimento.value) {
        // Calcular idade a partir da data de nascimento
        const idade = calcularIdade(dataNascimento.value);
        idadeField.value = idade + ' anos';
      } else {
        // Buscar campo de idade diretamente
        const idadePessoa = document.getElementById('idade');
        if (idadePessoa && idadePessoa.value) {
          idadeField.value = idadePessoa.value + ' anos';
        }
      }

      return; // Dados encontrados com sucesso
    }
  } catch (e) {
    console.error("Erro ao buscar dados do DOM:", e);
  }

  // MÉTODO 2: Buscar do sessionStorage
  try {
    const pessoaData = sessionStorage.getItem('pessoa');
    if (pessoaData) {
      const pessoa = JSON.parse(pessoaData);
      console.log("Dados encontrados no sessionStorage:", pessoa);

      if (pessoa.nome) nomeField.value = pessoa.nome;
      if (pessoa.cpf) cpfField.value = pessoa.cpf;
      if (pessoa.idade) idadeField.value = pessoa.idade;

      return; // Dados encontrados com sucesso
    }
  } catch (e) {
    console.error("Erro ao buscar dados do sessionStorage:", e);
  }

  // MÉTODO 3: Buscar do localStorage
  try {
    const pessoaData = localStorage.getItem('pessoa');
    if (pessoaData) {
      const pessoa = JSON.parse(pessoaData);
      console.log("Dados encontrados no localStorage:", pessoa);

      if (pessoa.nome) nomeField.value = pessoa.nome;
      if (pessoa.cpf) cpfField.value = pessoa.cpf;
      if (pessoa.idade) idadeField.value = pessoa.idade;

      return; // Dados encontrados com sucesso
    }
  } catch (e) {
    console.error("Erro ao buscar dados do localStorage:", e);
  }

  // MÉTODO 4: Usar dados fictícios se nada for encontrado
  nomeField.value = "Nome do Assistido";
  cpfField.value = "000.000.000-00";
  idadeField.value = "30 anos";

  console.log("Usando dados fictícios para o assistido");
}

// Configurar eventos dos botões de adicionar e remover
function configurarBotoesAcao() {
  console.log("Configurando eventos dos botões...");

  // 1. Configurar botão de adicionar membro (na linha do assistido)
  const addBtn = document.querySelector('.add-familiar-btn');
  if (addBtn) {
    addBtn.addEventListener('click', function() {
      console.log("Botão de adicionar clicado");
      adicionarNovoMembro();
    });
  }

  // 2. Configurar delegação de eventos para o container (para botões das linhas que serão adicionadas)
  const container = document.getElementById('membros-familia-list');
  if (container) {
    container.addEventListener('click', function(event) {
      // Detectar clique no botão de remover
      if (event.target.closest('.remove-familiar-btn')) {
        const btn = event.target.closest('.remove-familiar-btn');
        const membro = btn.closest('.membro-familia');
        if (membro && !membro.classList.contains('assistido')) {
          membro.remove();
        }
      }

      // Detectar clique no botão CadÚnico
      if (event.target.closest('.cadunico-btn')) {
        const btn = event.target.closest('.cadunico-btn');
        alternarCadUnico(btn);
      }
    });
  }
}

// Adicionar novo membro da família
function adicionarNovoMembro() {
  const container = document.getElementById('membros-familia-list');
  if (!container) {
    console.error("Container de membros da família não encontrado");
    return;
  }

  // Template HTML para um novo membro
  const novoMembroHtml = `
    <div class="membro-familia mb-6 relative">
      <div class="grid grid-cols-1 md:grid-cols-24 gap-4">
        <!-- Nome do membro - 6 colunas -->
        <div class="relative md:col-span-6">
          <input type="text" name="familiar_nome[]" class="peer w-full rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 px-4 py-3 text-gray-800 bg-gray-50 placeholder-gray-400 transition-colors duration-200" placeholder="Nome completo" />
          <label class="absolute left-4 -top-3 px-1 text-sm text-blue-600 bg-gray-50 rounded-t-lg rounded-b-none">
            Nome completo
          </label>
        </div>

        <!-- CPF - 3 colunas -->
        <div class="relative md:col-span-3">
          <input type="text" name="familiar_cpf[]" class="peer w-full rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 px-4 py-3 text-gray-800 bg-gray-50 placeholder-gray-400 transition-colors duration-200" placeholder="000.000.000-00" oninput="maskCPF(this)" />
          <label class="absolute left-4 -top-3 px-1 text-sm text-blue-600 bg-gray-50 rounded-t-lg rounded-b-none">
            CPF
          </label>
        </div>

        <!-- Idade - 2 colunas -->
        <div class="relative md:col-span-2">
          <input type="text" name="familiar_idade[]" class="peer w-full rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 px-4 py-3 text-gray-800 bg-gray-50 placeholder-gray-400 transition-colors duration-200" placeholder="Idade" />
          <label class="absolute left-4 -top-3 px-1 text-sm text-blue-600 bg-gray-50 rounded-t-lg rounded-b-none">
            Idade
          </label>
        </div>

        <!-- Parentesco - 4 colunas -->
        <div class="relative md:col-span-4">
          <select name="familiar_parentesco[]" class="peer w-full rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 px-4 py-3 text-gray-800 bg-gray-50 transition-colors duration-200">
            <option value="" selected disabled>Selecione...</option>
            <option value="Cônjuge">Cônjuge</option>
            <option value="Filho(a)">Filho(a)</option>
            <option value="Pai/Mãe">Pai/Mãe</option>
            <option value="Irmão/Irmã">Irmão/Irmã</option>
            <option value="Outro">Outro</option>
          </select>
          <label class="absolute left-4 -top-3 px-1 text-sm text-blue-600 bg-gray-50 rounded-t-lg rounded-b-none">
            Parentesco
          </label>
        </div>

        <!-- Estado Civil - 4 colunas -->
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
        </div>

        <!-- Renda Mensal - 2 colunas -->
        <div class="relative md:col-span-2">
          <input type="text" name="familiar_renda[]" class="peer w-full rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 px-4 py-3 text-gray-800 bg-gray-50 placeholder-gray-400 transition-colors duration-200" placeholder="Renda" />
          <label class="absolute left-4 -top-3 px-1 text-sm text-blue-600 bg-gray-50 rounded-t-lg rounded-b-none">
            Renda
          </label>
        </div>

        <!-- CadÚnico - 2 colunas -->
        <div class="relative md:col-span-2 flex items-center justify-center">
          <input type="hidden" name="familiar_cadunico[]" value="Não">
          <button type="button" class="cadunico-btn rounded-lg border border-gray-300 text-gray-500 hover:border-blue-500 hover:text-blue-600" title="Possui CadÚnico?">
            CadÚnico
          </button>
        </div>

        <!-- Botão de remover (somente nas linhas secundárias) - 1 coluna -->
        <div class="relative md:col-span-1 flex items-center justify-center">
          <button type="button" class="remove-familiar-btn bg-red-500 hover:bg-red-600 text-white rounded-full p-1 ml-2 flex items-center justify-center w-8 h-8" title="Remover membro">
            <i class="fas fa-minus"></i>
          </button>
        </div>
      </div>
    </div>
  `;

  // Adicionar ao container
  container.insertAdjacentHTML('beforeend', novoMembroHtml);

  // Inicializar o evento para máscara de CPF
  const novoCpf = container.querySelector('.membro-familia:last-child input[name="familiar_cpf[]"]');
  if (novoCpf && typeof maskCPF === 'function') {
    novoCpf.addEventListener('input', function() {
      maskCPF(this);
    });
  }

  console.log("Novo membro adicionado com sucesso");
}

// Função para alternar o status do CadÚnico
function alternarCadUnico(button) {
  if (!button) return;

  button.classList.toggle('active');
  button.classList.toggle('bg-blue-500');
  button.classList.toggle('text-white');

  const hiddenInput = button.previousElementSibling;
  if (hiddenInput && hiddenInput.type === 'hidden') {
    hiddenInput.value = button.classList.contains('active') ? 'Sim' : 'Não';
  }
}

// Configurar os botões de status do CAD Único
function setupCadUnicoOptions() {
  document.querySelectorAll('.status-option').forEach(option => {
    const radio = option.querySelector('input[type="radio"]');
    const badge = option.querySelector('.status-badge');
    const icon = option.querySelector('.option-icon');

    if (radio && badge) {
      badge.addEventListener('click', function() {
        // Desativar todos os outros
        document.querySelectorAll('.status-option input[type="radio"]').forEach(r => {
          r.checked = false;
          const otherBadge = r.closest('.status-option').querySelector('.status-badge');
          const otherIcon = r.closest('.status-option').querySelector('.option-icon');

          if (otherBadge) {
            otherBadge.classList.remove('bg-blue-500', 'text-white', 'border-blue-500');
            otherIcon.classList.remove('text-white');
            otherIcon.classList.add('text-gray-400');
          }
        });

        // Ativar este
        radio.checked = true;
        badge.classList.add('bg-blue-500', 'text-white', 'border-blue-500');
        icon.classList.remove('text-gray-400');
        icon.classList.add('text-white');

        // Efeito de animação
        badge.classList.add('scale-105');
        setTimeout(() => {
          badge.classList.remove('scale-105');
        }, 200);
      });
    }
  });
}
