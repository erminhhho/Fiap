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

// Exportar funções
window.buscarEndereco = buscarEndereco;
window.formatarCEP = formatarCEP;
