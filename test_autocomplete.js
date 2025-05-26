// Script de teste para verificar o autocomplete de profissões

console.log('=== TESTE DE AUTOCOMPLETE DE PROFISSÕES ===');

// Verificar se os elementos existem
const profissaoInput = document.getElementById('profissao');
const profissaoDropdown = document.getElementById('profissaoDropdown');

console.log('Input profissão:', profissaoInput);
console.log('Dropdown profissão:', profissaoDropdown);

// Verificar se o array de profissões está carregado
console.log('Array profissoesComuns:', window.profissoesComuns);
console.log('Função setupProfissaoAutocomplete:', window.setupProfissaoAutocomplete);

// Teste da função de busca
if (window.buscarProfissoes) {
  console.log('Teste de busca por "prof":', window.buscarProfissoes('prof'));
}

// Simular digitação no campo
if (profissaoInput) {
  console.log('Simulando digitação de "med"...');
  profissaoInput.value = 'med';
  profissaoInput.dispatchEvent(new Event('input', { bubbles: true }));

  setTimeout(() => {
    console.log('Dropdown após digitação:', profissaoDropdown.classList.contains('hidden') ? 'OCULTO' : 'VISÍVEL');
    console.log('Conteúdo do dropdown:', profissaoDropdown.innerHTML);
  }, 300);
}

// Verificar se há listeners no input
if (profissaoInput) {
  console.log('Input profissão tem listeners:', profissaoInput.getEventListeners ? profissaoInput.getEventListeners() : 'getEventListeners não disponível');
}
