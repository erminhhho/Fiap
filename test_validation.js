// Script de validação da funcionalidade Nascimento/Falecimento
// Este script pode ser executado no console do navegador para testar a funcionalidade

function testBirthDeathFunctionality() {
    console.log('=== TESTE DA FUNCIONALIDADE NASCIMENTO/FALECIMENTO ===');

    let testsPassed = 0;
    let totalTests = 0;

    function test(description, testFunction) {
        totalTests++;
        console.log(`\n${totalTests}. Testando: ${description}`);
        try {
            const result = testFunction();
            if (result) {
                testsPassed++;
                console.log('✅ PASSOU');
            } else {
                console.log('❌ FALHOU');
            }
        } catch (error) {
            console.log('❌ ERRO:', error.message);
        }
        return result;
    }

    // Teste 1: Verificar se a função existe
    test('Existência da função updateBirthDeathLabel', () => {
        return typeof window.updateBirthDeathLabel === 'function';
    });

    // Teste 2: Verificar se há selects de relacionamento na página
    test('Presença de selects de relacionamento', () => {
        const selects = document.querySelectorAll('select[name="autor_relationship[]"]');
        console.log(`Encontrados ${selects.length} selects de relacionamento`);
        return selects.length > 0;
    });

    // Teste 3: Verificar se há campos de nascimento
    test('Presença de campos de nascimento', () => {
        const birthInputs = document.querySelectorAll('input[name="autor_nascimento[]"]');
        console.log(`Encontrados ${birthInputs.length} campos de nascimento`);
        return birthInputs.length > 0;
    });

    // Teste 4: Verificar se há labels de nascimento
    test('Presença de labels de nascimento', () => {
        const labels = Array.from(document.querySelectorAll('label')).filter(label =>
            label.textContent.includes('Nascimento') || label.textContent.includes('Falecimento')
        );
        console.log(`Encontrados ${labels.length} labels relacionados`);
        return labels.length > 0;
    });

    // Teste 5: Simular mudança para "Instituidor"
    test('Simulação de mudança para Instituidor', () => {
        const firstSelect = document.querySelector('select[name="autor_relationship[]"]');
        if (!firstSelect) return false;

        // Buscar label original
        const authorContainer = firstSelect.closest('.author-row');
        const birthLabel = authorContainer.querySelector('label');

        if (!birthLabel) return false;

        const originalText = birthLabel.textContent;

        // Simular chamada da função
        window.updateBirthDeathLabel(firstSelect, 'Instituidor');

        const newText = birthLabel.textContent;
        console.log(`Label mudou de "${originalText}" para "${newText}"`);

        return newText.includes('Falecimento');
    });

    // Teste 6: Simular mudança de volta para outro valor
    test('Simulação de mudança de volta para Requerente', () => {
        const firstSelect = document.querySelector('select[name="autor_relationship[]"]');
        if (!firstSelect) return false;

        const authorContainer = firstSelect.closest('.author-row');
        const birthLabel = authorContainer.querySelector('label');

        if (!birthLabel) return false;

        const originalText = birthLabel.textContent;

        // Simular chamada da função
        window.updateBirthDeathLabel(firstSelect, 'Requerente');

        const newText = birthLabel.textContent;
        console.log(`Label mudou de "${originalText}" para "${newText}"`);

        return newText.includes('Nascimento');
    });

    // Teste 7: Verificar se eventos estão configurados
    test('Verificação de eventos configurados', () => {
        const firstSelect = document.querySelector('select[name="autor_relationship[]"]');
        if (!firstSelect) return false;

        // Verificar se tem o attribute de inicialização
        return firstSelect.dataset.styleInitialized === 'true';
    });

    console.log(`\n=== RESULTADO DOS TESTES ===`);
    console.log(`Testes passaram: ${testsPassed}/${totalTests}`);
    console.log(`Taxa de sucesso: ${Math.round((testsPassed/totalTests)*100)}%`);

    if (testsPassed === totalTests) {
        console.log('🎉 TODOS OS TESTES PASSARAM! A funcionalidade está funcionando corretamente.');
    } else {
        console.log('⚠️ Alguns testes falharam. Verifique a implementação.');
    }

    return {
        passed: testsPassed,
        total: totalTests,
        success: testsPassed === totalTests
    };
}

// Executar automaticamente se estiver no contexto do navegador
if (typeof window !== 'undefined') {
    // Aguardar carregamento da página antes de executar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(testBirthDeathFunctionality, 1000);
        });
    } else {
        setTimeout(testBirthDeathFunctionality, 1000);
    }
}

// Exportar para uso manual
window.testBirthDeathFunctionality = testBirthDeathFunctionality;
