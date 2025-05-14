/**
 * Fix para problemas com seletores no state.js
 *
 * Este arquivo corrige o problema de seletores inválidos como '#familiar_nome[]'
 * que não funcionam porque os colchetes [] têm significado especial em seletores CSS.
 */

document.addEventListener('DOMContentLoaded', function() {
  // Verificar se o FormStateManager existe
  if (window.formStateManager) {
    // Função original
    const originalRestoreFormData = window.formStateManager.restoreFormData;

    // Substituir a função com uma versão que trata os colchetes corretamente
    window.formStateManager.restoreFormData = function(step) {
      try {
        if (!this.isInitialized || !this.formData[step]) return;

        const form = document.querySelector('form');
        if (!form) return;

        const data = this.formData[step];

        console.log(`Restaurando dados para ${step}:`, data);

        // Restaurar dados para cada campo
        Object.entries(data).forEach(([key, value]) => {
          // Ignorar campos internos que começam com _
          if (key.startsWith('_')) return;

          try {
            // Verificar se o key contém colchetes [] que tornariam o seletor inválido
            if (key.includes('[') || key.includes(']')) {
              // Campos com colchetes requerem tratamento especial
              // Ao invés de usar querySelector, tentamos encontrar o elemento por iteração
              const allInputs = form.querySelectorAll('input, select, textarea');
              let field = null;

              // Procura o campo pelo name exato ou id exato
              for (let i = 0; i < allInputs.length; i++) {
                if (allInputs[i].name === key || allInputs[i].id === key) {
                  field = allInputs[i];
                  break;
                }
              }

              if (field) {
                if (field.type === 'checkbox') {
                  field.checked = value === 'true';
                } else if (field.type === 'radio') {
                  // Para radio, precisamos encontrar o específico com o valor correto
                  let foundRadio = false;
                  const radios = form.querySelectorAll('input[type="radio"]');
                  for (let i = 0; i < radios.length; i++) {
                    if ((radios[i].name === key || radios[i].id === key) && radios[i].value === value) {
                      radios[i].checked = true;
                      foundRadio = true;
                      break;
                    }
                  }
                } else {
                  field.value = value;
                }

                // Marcar o campo como preenchido
                field.classList.add('filled');

                // Verificar se o campo não deve receber eventos de máscara
                if (field.type !== 'hidden' && !field.hasAttribute('data-no-mask')) {
                  // Disparar eventos para atualizar UI apenas para campos não hidden
                  try {
                    field.dispatchEvent(new Event('change', { bubbles: true }));
                    field.dispatchEvent(new Event('input', { bubbles: true }));
                  } catch (e) {
                    console.debug(`Erro ao disparar eventos para o campo ${key}:`, e.message);
                  }
                }
              }
            } else {
              // Caminho normal - tentar encontrar o campo pelo name ou id (seletor CSS normal)
              const field = form.querySelector(`[name="${key}"]`) || form.querySelector(`#${key}`);

              if (field) {
                if (field.type === 'checkbox') {
                  field.checked = value === 'true';
                } else if (field.type === 'radio') {
                  const radio = form.querySelector(`[name="${key}"][value="${value}"]`) ||
                              form.querySelector(`#${key}[value="${value}"]`);
                  if (radio) radio.checked = true;
                } else {
                  field.value = value;
                }

                // Marcar o campo como preenchido
                field.classList.add('filled');

                // Verificar se o campo não deve receber eventos de máscara
                if (field.type !== 'hidden' && !field.hasAttribute('data-no-mask')) {
                  // Disparar eventos para atualizar UI apenas para campos não hidden
                  try {
                    field.dispatchEvent(new Event('change', { bubbles: true }));
                    field.dispatchEvent(new Event('input', { bubbles: true }));
                  } catch (e) {
                    console.debug(`Erro ao disparar eventos para o campo ${key}:`, e.message);
                  }
                }
              }
            }
          } catch (error) {
            console.warn(`Erro ao processar o campo ${key}:`, error);
          }
        });

        // Processamento especial para CIDs
        if (step === 'incapacity') {
          const cidPattern = /^cid(\d+)$/;
          const doencaPattern = /^doenca(\d+)$/;

          Object.entries(data).forEach(([key, value]) => {
            try {
              // Verificar se é um campo CID
              const cidMatch = key.match(cidPattern);
              if (cidMatch && cidMatch[1]) {
                const index = cidMatch[1];
                const cidInput = document.getElementById(`cid${index}`);
                const doencaInput = document.getElementById(`doenca${index}`);

                if (cidInput && value) {
                  cidInput.value = value;
                  cidInput.classList.add('filled');
                  cidInput.dispatchEvent(new Event('change', { bubbles: true }));
                }
              }

              // Verificar se é um campo doença
              const doencaMatch = key.match(doencaPattern);
              if (doencaMatch && doencaMatch[1]) {
                const index = doencaMatch[1];
                const doencaInput = document.getElementById(`doenca${index}`);

                if (doencaInput && value) {
                  doencaInput.value = value;
                  doencaInput.classList.add('filled');
                  doencaInput.dispatchEvent(new Event('change', { bubbles: true }));
                }
              }
            } catch (error) {
              console.warn(`Erro ao processar o campo especial ${key}:`, error);
            }
          });
        }
      } catch (error) {
        console.error("Erro ao restaurar dados do formulário:", error);
      }
    };

    console.log('[Fix] Correção aplicada para seletores com caracteres especiais');
  }
});
