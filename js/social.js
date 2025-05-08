/**
 * Este arquivo foi marcado como redundante.
 * Toda a funcionalidade necessária foi consolidada em modules/social.js
 *
 * Se precisar fazer alterações no módulo social, edite o arquivo modules/social.js
 */

// Redirecionar para a implementação principal
if (typeof window.initModule === 'function') {
  console.log('Redirecionando para a implementação principal em modules/social.js');
} else {
  console.warn('A implementação principal modules/social.js pode não estar carregada.');
}

// Manter apenas aliases para funções importantes para compatibilidade
function adicionarNovoMembro() {
  if (typeof window.addFamilyMember === 'function') {
    window.addFamilyMember();
  }
}
