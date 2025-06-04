// Sobrescrever a função de limpeza para manter linhas adicionadas
// Salvamos a referência da função original
window.executeClearSectionOriginal = window.executeClearSection || function() {};

// Sobrescrevemos a função para modificar o comportamento
window.executeClearSection = function(section) {
  // Remover o popup de confirmação
  const confirmation = document.getElementById('clear-confirmation');
  if (confirmation) {
    confirmation.remove();
  }

  // Limpa os dados da seção no gerenciador de estado
  if (window.formStateManager) {
    // Não limpa completamente, apenas os campos específicos em cada seção
    const formData = window.formStateManager.formData;    if (section === 'personal') {
      // Limpar apenas os campos, não a estrutura
      const fields = ['nome', 'cpf', 'nascimento', 'idade', 'apelido', 'telefone', 'telefone_detalhes', 'colaborador', 'observacoes_personal'];
      fields.forEach(field => {
        if (formData.personal && formData.personal[field]) {
          formData.personal[field] = '';
        }
      });
    } else if (section === 'address') {
      // Limpar campos de endereço
      const fields = ['cep', 'bairro', 'cidade', 'uf', 'endereco', 'numero'];
      fields.forEach(field => {
        if (formData.address && formData.address[field]) {
          formData.address[field] = '';
        }
      });
    } else if (section === 'familia') {
      // Limpar dados dos membros da família, mas manter a estrutura
      if (formData.familia && formData.familia.membros) {
        formData.familia.membros.forEach(membro => {
          Object.keys(membro).forEach(key => {
            if (key !== 'id' && key !== 'isAssistido') {
              membro[key] = '';
            }
          });
        });
      }    } else if (section === 'renda') {
      // Limpar valores de renda
      if (formData.renda) {
        formData.renda.renda_total_familiar = '';
        formData.renda.renda_per_capita = '';
      }
    } else if (section === 'social') {
      // Limpar campos sociais
      if (formData.social) {
        formData.social.observacoes_social = '';
      }
    } else if (section === 'professional') {
      // Limpar campos profissionais
      if (formData.professional) {
        formData.professional.observacoes_professional = '';
      }
    } else if (section === 'incapacity') {
      // Limpar campos de incapacidades
      if (formData.incapacity) {
        formData.incapacity.observacoes_incapacity = '';
      }
    } else if (section === 'doencas') {
      // Limpar dados das doenças, mas manter a estrutura
      if (formData.doencas && formData.doencas.lista) {
        formData.doencas.lista.forEach(doenca => {
          Object.keys(doenca).forEach(key => {
            if (key !== 'id') {
              doenca[key] = '';
            }
          });
        });
      }
    } else if (section === 'duracao') {
      // Limpar duração
      if (formData.duracao) {
        formData.duracao.trabalhaAtualmente = '';
        formData.duracao.ultimoTrabalho = '';
      }    } else if (section === 'limitacoes') {
      // Limpar limitações
      if (formData.limitacoes) {
        formData.limitacoes.limitacoesDiarias = '';
        formData.limitacoes.medicamentosAtuais = '';
      }
    } else if (section === 'atividades') {
      // Limpar atividades, mas manter a estrutura
      if (formData.atividades && formData.atividades.lista) {
        formData.atividades.lista.forEach(atividade => {
          Object.keys(atividade).forEach(key => {
            if (key !== 'id') {
              atividade[key] = '';
            }
          });
        });
      }
    } else if (section === 'documentos') {
      // Para documentos, limpar valores mas manter a estrutura
      if (formData.documents && formData.documents.documentos) {
        formData.documents.documentos.forEach(doc => {
          Object.keys(doc).forEach(key => {
            if (key !== 'id') {
              doc[key] = '';
            }
          });
        });        // Limpar observações
        if (formData.documents.observacoes_documents) {
          formData.documents.observacoes_documents = '';
        }
      }
    }
  }

  // Limpar os campos da interface sem remover elementos adicionados
  const form = document.querySelector('form');    if (form) {
    // Seleciona todos os campos que pertencem à seção pelo id ou name
    let fields = [];
    if (section === 'personal') {
      fields = ['nome', 'cpf', 'nascimento', 'idade', 'apelido', 'telefone', 'telefone_detalhes', 'colaborador', 'observacoes_personal'];
    } else if (section === 'address') {
      fields = ['cep', 'bairro', 'cidade', 'uf', 'endereco', 'numero'];
    } else if (section === 'familia') {
      // Limpar campos dos membros, mas não remover
      const familiaContainers = document.querySelectorAll('.membro-familia-card');
      familiaContainers.forEach(container => {
        const inputs = container.querySelectorAll('input:not([readonly]), select, textarea');
        inputs.forEach(input => {
          if (!input.closest('.assistido')) {
            input.value = '';
          }
        });
      });
    } else if (section === 'renda') {
      fields = ['renda_total_familiar', 'renda_per_capita'];
      // Resetar displays
      const rendaDisplay = document.getElementById('renda_total_display');
      const percapitaDisplay = document.getElementById('renda_per_capita_display');
      if (rendaDisplay) rendaDisplay.textContent = 'R$ 0';
      if (percapitaDisplay) percapitaDisplay.textContent = 'R$ 0';
    } else if (section === 'doencas') {
      // Limpar campos nas linhas de doenças, mas não remover as linhas
      const doencasInputs = document.querySelectorAll('#doencasList input, #doencasList select, #doencasList textarea');
      doencasInputs.forEach(input => {
        input.value = '';
      });
    } else if (section === 'duracao') {
      fields = ['trabalhaAtualmente', 'ultimoTrabalho'];    } else if (section === 'limitacoes') {
      // Limpar limitações múltiplas selecionadas
      const limitacoesSelecionadas = document.getElementById('limitacoesSelecionadas');
      if (limitacoesSelecionadas) {
        limitacoesSelecionadas.innerHTML = '';
      }

      // Limpar select de limitações
      const limitacoesSelect = document.getElementById('limitacoesSelect');
      if (limitacoesSelect) {
        limitacoesSelect.value = '';
      }

      fields = ['limitacoesDiarias', 'medicamentosAtuais'];
    } else if (section === 'atividades') {
      // Limpar campos nas linhas de atividades, mas não remover as linhas
      const atividadesInputs = document.querySelectorAll('#atividadesList input, #atividadesList select, #atividadesList textarea');
      atividadesInputs.forEach(input => {
        input.value = '';
      });
    } else if (section === 'documentos') {
      // Limpar campos de documentos, mas não remover os documentos
      const documentosInputs = document.querySelectorAll('#documentos-container input, #documentos-container textarea');
      documentosInputs.forEach(input => {
        input.value = '';      });

      // Limpar o campo de observações específico de documentos
      const observacoes = document.getElementById('observacoes_documents');
      if (observacoes) {
        observacoes.value = '';
      }
    }

    // Limpar campos da seção especificados
    fields.forEach(fieldId => {
      const field = form.querySelector(`[id='${fieldId}'], [name='${fieldId}']`);
      if (field) {
        field.value = '';
        field.classList.remove('field-filled', 'cpf-valid', 'cpf-invalid', 'cep-valid', 'cep-invalid');
      }
    });
  }

  // Mostra notificação sutil de sucesso com transparência
  const notification = document.createElement('div');
  notification.className = 'fixed bottom-4 right-4 bg-green-100 bg-opacity-90 backdrop-blur-sm border-l-4 border-green-500 text-green-700 p-3 rounded shadow-md z-50 animate-fade-in';
  notification.innerHTML = `
    <div class="flex items-center">
      <span class="text-sm">Campos limpos com sucesso!</span>
    </div>
  `;
  document.body.appendChild(notification);

  // Remove a notificação após 2 segundos
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.5s ease';
    setTimeout(() => notification.remove(), 500);
  }, 2000);
};
