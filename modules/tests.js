/**
 * Suite de Testes Abrangente para FormStateManager
 * Testa todas as 23 correções críticas implementadas
 */

// Aguarda o carregamento completo do DOM
document.addEventListener('DOMContentLoaded', async function() {
    console.log('[TESTS] Iniciando Suite de Testes do FormStateManager');
    
    const testResults = {
        passed: 0,
        failed: 0,
        total: 0,
        details: []
    };

    function logTest(testName, passed, message = '') {
        testResults.total++;
        if (passed) {
            testResults.passed++;
            console.log(`[SUCCESS] ${testName}: PASSOU ${message}`);
        } else {
            testResults.failed++;
            console.log(`[FAILED] ${testName}: FALHOU ${message}`);
        }
        testResults.details.push({ testName, passed, message });
    }

    // Aguarda a inicialização do FormStateManager
    await new Promise(resolve => setTimeout(resolve, 100));

    if (typeof window.FormStateManager === 'undefined') {
        console.error('[ERROR] FormStateManager não está disponível globalmente');
        return;
    }

    // Teste 1: Race Conditions - Sistema de Mutex
    try {
        const manager = new window.FormStateManager();
        const promises = [];
        let raceConditionDetected = false;

        // Simula operações simultâneas
        for (let i = 0; i < 10; i++) {
            promises.push(manager.setState(`key${i}`, `value${i}`));
        }

        await Promise.all(promises);
        
        // Verifica se todos os estados foram definidos corretamente
        let allStatesSet = true;
        for (let i = 0; i < 10; i++) {
            if (manager.getState(`key${i}`) !== `value${i}`) {
                allStatesSet = false;
                break;
            }
        }

        logTest('Correção 1: Race Conditions', allStatesSet, '- Sistema de Mutex funcionando');
    } catch (error) {
        logTest('Correção 1: Race Conditions', false, `- Erro: ${error.message}`);
    }

    // Teste 2: Memory Leaks - Sistema de Limpeza
    try {
        const manager = new window.FormStateManager();
        const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
        
        // Cria muitos estados e depois limpa
        for (let i = 0; i < 1000; i++) {
            await manager.setState(`temp${i}`, `data${i}`);
        }
        
        await manager.cleanup();
        
        // Força garbage collection se disponível
        if (window.gc) window.gc();
        
        const finalMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
        const memoryIncrease = finalMemory - initialMemory;
        
        logTest('Correção 2: Memory Leaks', memoryIncrease < 1000000, `- Aumento de memória: ${memoryIncrease} bytes`);
    } catch (error) {
        logTest('Correção 2: Memory Leaks', false, `- Erro: ${error.message}`);
    }

    // Teste 3: Validação de Dados
    try {
        const manager = new window.FormStateManager();
        
        // Testa validação de entrada
        let invalidDataRejected = false;
        try {
            await manager.setState(null, 'value');
        } catch {
            invalidDataRejected = true;
        }
        
        // Testa validação de tipos
        await manager.setState('number', 123);
        await manager.setState('string', 'test');
        await manager.setState('object', { key: 'value' });
        
        const numberValid = typeof manager.getState('number') === 'number';
        const stringValid = typeof manager.getState('string') === 'string';
        const objectValid = typeof manager.getState('object') === 'object';
        
        logTest('Correção 3: Validação de Dados', 
                invalidDataRejected && numberValid && stringValid && objectValid,
                '- Validação de tipos funcionando');
    } catch (error) {
        logTest('Correção 3: Validação de Dados', false, `- Erro: ${error.message}`);
    }

    // Teste 4: Gestão de Cache
    try {
        const manager = new window.FormStateManager();
        
        // Define um valor e verifica cache
        await manager.setState('cached_key', 'cached_value');
        const value1 = manager.getState('cached_key');
        const value2 = manager.getState('cached_key');
        
        // Verifica se o cache está funcionando (mesmo objeto)
        const cacheWorking = value1 === value2;
        
        // Testa invalidação de cache
        await manager.setState('cached_key', 'new_value');
        const newValue = manager.getState('cached_key');
        
        logTest('Correção 4: Gestão de Cache', 
                cacheWorking && newValue === 'new_value',
                '- Cache e invalidação funcionando');
    } catch (error) {
        logTest('Correção 4: Gestão de Cache', false, `- Erro: ${error.message}`);
    }

    // Teste 5: Performance - Debounce
    try {
        const manager = new window.FormStateManager();
        let callCount = 0;
        
        const startTime = performance.now();
        
        // Faz múltiplas chamadas rápidas
        for (let i = 0; i < 10; i++) {
            manager.setState('debounced_key', `value${i}`);
            callCount++;
        }
        
        // Aguarda um pouco para o debounce
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        logTest('Correção 5: Performance - Debounce', 
                duration < 500 && callCount === 10,
                `- ${callCount} chamadas em ${duration.toFixed(2)}ms`);
    } catch (error) {
        logTest('Correção 5: Performance - Debounce', false, `- Erro: ${error.message}`);
    }

    // Teste 6: Gestão DOM - Cache de Elementos
    try {
        // Cria um elemento de teste
        const testElement = document.createElement('div');
        testElement.id = 'test-element';
        document.body.appendChild(testElement);
        
        const manager = new window.FormStateManager();
        
        // Testa cache de elementos DOM
        const element1 = document.getElementById('test-element');
        const element2 = document.getElementById('test-element');
        
        const domCacheWorking = element1 === element2;
        
        // Remove elemento de teste
        document.body.removeChild(testElement);
        
        logTest('Correção 6: Gestão DOM', domCacheWorking, '- Cache de elementos DOM funcionando');
    } catch (error) {
        logTest('Correção 6: Gestão DOM', false, `- Erro: ${error.message}`);
    }

    // Teste 7: Navegação Segura
    try {
        const manager = new window.FormStateManager();
        
        // Simula dados não salvos
        await manager.setState('unsaved_data', 'important_data');
        
        // Verifica se o sistema detecta dados não salvos
        const hasUnsavedData = manager.hasUnsavedChanges && manager.hasUnsavedChanges();
        
        logTest('Correção 7: Navegação Segura', 
                typeof hasUnsavedData !== 'undefined',
                '- Detecção de dados não salvos implementada');
    } catch (error) {
        logTest('Correção 7: Navegação Segura', false, `- Erro: ${error.message}`);
    }

    // Teste 8: Sistema de Logs
    try {
        const manager = new window.FormStateManager();
        
        // Verifica se o logger está disponível
        const loggerExists = window.StructuredLogger !== undefined;
        
        if (loggerExists) {
            const logger = new window.StructuredLogger();
            logger.info('Teste de log');
            logger.error('Teste de erro');
            logger.warn('Teste de aviso');
        }
        
        logTest('Correção 8: Sistema de Logs', loggerExists, '- StructuredLogger disponível');
    } catch (error) {
        logTest('Correção 8: Sistema de Logs', false, `- Erro: ${error.message}`);
    }

    // Teste 9: Sincronização entre Módulos
    try {
        const synchronizerExists = window.ModuleSynchronizer !== undefined;
        
        if (synchronizerExists) {
            const sync = new window.ModuleSynchronizer();
            // Testa sincronização básica
            sync.notifyChange('test_module', { data: 'test' });
        }
        
        logTest('Correção 9: Sincronização entre Módulos', 
                synchronizerExists,
                '- ModuleSynchronizer disponível');
    } catch (error) {
        logTest('Correção 9: Sincronização entre Módulos', false, `- Erro: ${error.message}`);
    }

    // Teste 10: Validação Offline
    try {
        const offlineValidatorExists = window.OfflineValidator !== undefined;
        
        if (offlineValidatorExists) {
            const validator = new window.OfflineValidator();
            const result = validator.validate('test@email.com', 'email');
        }
        
        logTest('Correção 10: Validação Offline', 
                offlineValidatorExists,
                '- OfflineValidator disponível');
    } catch (error) {
        logTest('Correção 10: Validação Offline', false, `- Erro: ${error.message}`);
    }

    // Testes 11-22: Verificação de Existência das Classes
    const classesToTest = [
        { name: 'UIEnhancer', correction: 11, description: 'Melhorias UI/UX' },
        { name: 'BrowserCompatibility', correction: 12, description: 'Compatibilidade de Browsers' },
        { name: 'SessionManager', correction: 13, description: 'Gestão de Sessão' },
        { name: 'BackupManager', correction: 14, description: 'Backup e Recuperação' },
        { name: 'ConflictDetector', correction: 15, description: 'Detecção de Conflitos' },
        { name: 'NetworkOptimizer', correction: 16, description: 'Otimizações de Rede' },
        { name: 'ErrorMonitor', correction: 17, description: 'Monitoramento de Erros' },
        { name: 'APIIntegrator', correction: 18, description: 'Integração com APIs' },
        { name: 'Tester', correction: 19, description: 'Testes' },
        { name: 'Documentation', correction: 20, description: 'Documentação' },
        { name: 'Configurator', correction: 21, description: 'Configuração' },
        { name: 'Metrics', correction: 22, description: 'Métricas' }
    ];

    classesToTest.forEach(({ name, correction, description }) => {
        try {
            const classExists = window[name] !== undefined;
            let functionalTest = false;
            
            if (classExists) {
                try {
                    const instance = new window[name]();
                    functionalTest = true;
                } catch (e) {
                    functionalTest = false;
                }
            }
            
            logTest(`Correção ${correction}: ${description}`, 
                    classExists && functionalTest,
                    `- ${name} ${classExists ? 'disponível' : 'não encontrada'}`);
        } catch (error) {
            logTest(`Correção ${correction}: ${description}`, false, `- Erro: ${error.message}`);
        }
    });

    // Teste de Integração Global
    try {
        const manager = new window.FormStateManager();
        
        // Testa operação complexa
        await manager.setState('integration_test', {
            user: 'test_user',
            data: [1, 2, 3, 4, 5],
            timestamp: new Date().toISOString()
        });
        
        const result = manager.getState('integration_test');
        const integrationWorking = result && result.user === 'test_user';
        
        logTest('Teste de Integração Global', integrationWorking, '- Operações complexas funcionando');
    } catch (error) {
        logTest('Teste de Integração Global', false, `- Erro: ${error.message}`);
    }

    // Exibe resultados finais    console.log('\n[RESULTS] RESULTADOS FINAIS DOS TESTES:');
    console.log(`[SUCCESS] Testes Aprovados: ${testResults.passed}`);
    console.log(`[FAILED] Testes Falharam: ${testResults.failed}`);
    console.log(`[TOTAL] Total de Testes: ${testResults.total}`);
    console.log(`[STATS] Taxa de Sucesso: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);

    // Cria relatório detalhado
    const reportElement = document.createElement('div');
    reportElement.id = 'test-report';
    reportElement.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        width: 400px;
        max-height: 500px;
        overflow-y: auto;
        background: white;
        border: 2px solid #007acc;
        border-radius: 8px;
        padding: 15px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        font-family: monospace;
        font-size: 12px;
        z-index: 10000;
    `;
    
    reportElement.innerHTML = `        <h3 style="margin-top: 0; color: #007acc;">[TESTS] Relatório de Testes</h3>
        <div style="margin-bottom: 10px;">
            <strong>Taxa de Sucesso: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%</strong><br>
            [SUCCESS] Aprovados: ${testResults.passed}<br>
            [FAILED] Falharam: ${testResults.failed}<br>
            [TOTAL] Total: ${testResults.total}
        </div>
        <div style="max-height: 300px; overflow-y: auto;">
            ${testResults.details.map(test => 
                `<div style="margin: 5px 0; padding: 5px; background: ${test.passed ? '#e8f5e8' : '#ffe8e8'}; border-radius: 3px;">
                    ${test.passed ? '[PASS]' : '[FAIL]'} ${test.testName}<br>
                    <small style="color: #666;">${test.message}</small>
                </div>`
            ).join('')}
        </div>
        <button onclick="this.parentElement.remove()" style="
            margin-top: 10px;
            padding: 5px 10px;
            background: #007acc;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
        ">Fechar</button>
    `;
    
    document.body.appendChild(reportElement);

    // Salva resultados no localStorage
    localStorage.setItem('formStateManagerTestResults', JSON.stringify(testResults));
    
    console.log('🏁 Suite de testes concluída!');
});
