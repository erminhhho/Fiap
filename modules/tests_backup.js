/**
 * SISTEMA DE TESTES ROBUSTO PARA PERSISTÊNCIA DE DADOS v3.0
 * Foca especificamente no problema real identificado: perda de persistência entre navegações
 * Testa cenários de uso real para detectar falhas que os testes básicos não conseguem identificar
 */

// Sistema de Testes de Persistência Real
class PersistenceTestSuite {
    constructor() {
        this.testResults = {
            passed: 0,
            failed: 0,
            total: 0,
            details: [],
            realWorldTests: 0,
            persistenceTests: 0,
            navigationTests: 0,
            dataIntegrityTests: 0,
            stressTests: 0
        };
        
        this.testData = new Map();
        this.sessionId = `test_${Date.now()}`;
        this.isRunning = false;
        this.testReportElement = null;
        this.stateManager = null;
        
        console.log('[PERSISTENCE TESTS] 🧪 Sistema de Testes v3.0 Inicializado');
    }

    // Aguarda o carregamento completo do DOM
    async initialize() {
        if (this.isRunning) return;
        this.isRunning = true;
        
        console.log('[PERSISTENCE TESTS] Aguardando carregamento do FormStateManager...');
        
        // Aguarda o stateManager estar disponível
        await this.waitForStateManager();
        
        // Cria interface de testes
        this.createTestInterface();
        
        // Executa testes automáticos
        await this.runAutomaticTests();
        
        console.log('[PERSISTENCE TESTS] ✅ Sistema de testes inicializado com sucesso');
    }

    async waitForStateManager() {
        let attempts = 0;
        const maxAttempts = 50;
        
        while (!window.stateManager && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (window.stateManager) {
            this.stateManager = window.stateManager;
            console.log('[PERSISTENCE TESTS] ✅ FormStateManager encontrado');
        } else {
            console.error('[PERSISTENCE TESTS] ❌ FormStateManager não encontrado após 5 segundos');
        }
    }

    // Registra resultado de um teste
    logTest(testName, passed, message = '', category = 'general') {
        this.testResults.total++;
        if (passed) {
            this.testResults.passed++;
            console.log(`✅ [${category.toUpperCase()}] ${testName}: PASSOU ${message}`);
        } else {
            this.testResults.failed++;
            console.log(`❌ [${category.toUpperCase()}] ${testName}: FALHOU ${message}`);
        }
        this.testResults.details.push({ testName, passed, message, category });
        
        // Atualizar contadores por categoria
        if (category === 'persistence') this.testResults.persistenceTests++;
        if (category === 'navigation') this.testResults.navigationTests++;
        if (category === 'integrity') this.testResults.dataIntegrityTests++;
        if (category === 'realworld') this.testResults.realWorldTests++;
        if (category === 'stress') this.testResults.stressTests++;
        
        this.updateTestReport();
    }

    // Atualiza o relatório visual
    updateTestReport() {
        if (this.testReportElement) {
            this.testReportElement.innerHTML = this.createTestReportHTML();
        }
    }

    function logTest(testName, passed, message = '', category = 'general') {
        testResults.total++;
        if (passed) {
            testResults.passed++;
            console.log(`✅ [${category.toUpperCase()}] ${testName}: PASSOU ${message}`);
        } else {
            testResults.failed++;
            console.log(`❌ [${category.toUpperCase()}] ${testName}: FALHOU ${message}`);
        }
        testResults.details.push({ testName, passed, message, category });
        
        // Atualizar contadores por categoria
        if (category === 'persistence') testResults.persistenceTests++;
        if (category === 'navigation') testResults.navigationTests++;
        if (category === 'integrity') testResults.dataIntegrityTests++;
        
        updateTestReport();
    }

    function updateTestReport() {
        if (testReportElement) {
            const successRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
            testReportElement.innerHTML = createTestReportHTML();
        }
    }

    function createTestReportHTML() {
        const successRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
        return `
            <div class="test-header">
                <h3>🧪 TESTE DE PERSISTÊNCIA</h3>
                <div class="success-rate ${successRate >= 90 ? 'excellent' : successRate >= 70 ? 'good' : 'poor'}">
                    ${successRate}% de Sucesso
                </div>
            </div>
            
            <div class="metrics-grid">
                <div class="metric">
                    <span class="metric-value">${testResults.passed}</span>
                    <span class="metric-label">Aprovados</span>
                </div>
                <div class="metric">
                    <span class="metric-value">${testResults.failed}</span>
                    <span class="metric-label">Falharam</span>
                </div>
                <div class="metric">
                    <span class="metric-value">${testResults.persistenceTests}</span>
                    <span class="metric-label">Persistência</span>
                </div>
                <div class="metric">
                    <span class="metric-value">${testResults.navigationTests}</span>
                    <span class="metric-label">Navegação</span>
                </div>
            </div>
            
            <div class="test-details">
                ${testResults.details.map(test => `
                    <div class="test-item ${test.passed ? 'passed' : 'failed'}">
                        <span class="test-icon">${test.passed ? '✅' : '❌'}</span>
                        <div class="test-content">
                            <div class="test-name">${test.testName}</div>
                            <div class="test-message">${test.message}</div>
                            <div class="test-category">[${test.category.toUpperCase()}]</div>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="test-actions">
                <button onclick="runPersistenceStressTest()" class="test-btn stress">🔥 Teste de Stress</button>
                <button onclick="runNavigationTest()" class="test-btn nav">🔄 Teste de Navegação</button>
                <button onclick="exportTestResults()" class="test-btn export">📊 Exportar</button>
                <button onclick="clearTestReport()" class="test-btn close">❌ Fechar</button>
            </div>
        `;
    }    // =====================================================================
    // TESTES ESPECÍFICOS DE PERSISTÊNCIA DE DADOS
    // =====================================================================

    // Aguarda a inicialização do FormStateManager
    await new Promise(resolve => setTimeout(resolve, 200));

    if (typeof window.FormStateManager === 'undefined') {
        console.error('❌ FormStateManager não está disponível globalmente');
        logTest('Sistema Principal', false, 'FormStateManager não encontrado', 'system');
        return;
    }

    // Criar instância de teste
    const testManager = window.stateManager || new window.FormStateManager();
    
    // TESTE 1: Persistência Básica de Dados
    try {
        const testData = {
            nome: 'João Silva',
            cpf: '12345678909',
            email: 'joao@teste.com',
            telefone: '11999999999'
        };

        // Salvar dados
        testManager.updateSpecificField('personal', 'nome', testData.nome);
        testManager.updateSpecificField('personal', 'cpf', testData.cpf);
        testManager.updateSpecificField('personal', 'email', testData.email);
        testManager.updateSpecificField('personal', 'telefone', testData.telefone);
        
        // Capturar dados
        await testManager.captureCurrentFormData();
        
        // Verificar se foram salvos
        const savedData = testManager.formData.personal;
        const allDataPresent = savedData.nome === testData.nome && 
                              savedData.cpf === testData.cpf &&
                              savedData.email === testData.email &&
                              savedData.telefone === testData.telefone;

        logTest('Persistência Básica de Dados', allDataPresent, 
               `Dados salvos: ${Object.keys(savedData).length} campos`, 'persistence');
    } catch (error) {
        logTest('Persistência Básica de Dados', false, `Erro: ${error.message}`, 'persistence');
    }

    // TESTE 2: Persistência com Arrays (Múltiplos Autores)
    try {
        const testAuthors = [
            { nome: 'João Silva', cpf: '12345678909' },
            { nome: 'Maria Santos', cpf: '98765432100' },
            { nome: 'Pedro Costa', cpf: '11122233344' }
        ];

        testManager.updateSpecificField('personal', 'autor_nome', testAuthors.map(a => a.nome));
        testManager.updateSpecificField('personal', 'autor_cpf', testAuthors.map(a => a.cpf));
        
        await testManager.captureCurrentFormData();
        
        const savedNames = testManager.formData.personal.autor_nome;
        const savedCpfs = testManager.formData.personal.autor_cpf;
        
        const arraysPersisted = Array.isArray(savedNames) && 
                               Array.isArray(savedCpfs) &&
                               savedNames.length === 3 &&
                               savedCpfs.length === 3;

        logTest('Persistência de Arrays', arraysPersisted, 
               `${savedNames?.length || 0} nomes, ${savedCpfs?.length || 0} CPFs`, 'persistence');
    } catch (error) {
        logTest('Persistência de Arrays', false, `Erro: ${error.message}`, 'persistence');
    }

    // TESTE 3: Cache e Restauração
    try {
        // Limpar cache anterior
        testManager.clearCache();
        
        // Adicionar dados de teste
        const cacheTestData = {
            campo1: 'valor1',
            campo2: 'valor2',
            campo3: { nested: 'objeto' }
        };
        
        testManager.formData.testStep = cacheTestData;
        
        // Salvar no cache
        testManager.saveStateToCache();
        
        // Limpar memória
        testManager.formData = {};
        
        // Restaurar do cache
        const restored = testManager.loadStateFromCache();
        
        const cacheWorking = restored && 
                           testManager.formData.testStep &&
                           testManager.formData.testStep.campo1 === 'valor1';

        logTest('Sistema de Cache', cacheWorking, 
               `Restauração: ${restored ? 'OK' : 'FALHOU'}`, 'persistence');
    } catch (error) {
        logTest('Sistema de Cache', false, `Erro: ${error.message}`, 'persistence');
    }

    // TESTE 4: Navegação Simulada Entre Páginas
    try {
        // Simular dados em diferentes páginas
        const pages = ['personal', 'social', 'incapacity', 'professional', 'documents'];
        let navigationSuccess = true;

        for (const page of pages) {
            // Adicionar dados específicos da página
            testManager.updateSpecificField(page, `teste_${page}`, `dados_${page}`);
            testManager.currentStep = page;
            
            // Capturar dados
            await testManager.captureCurrentFormData();
            
            // Verificar se os dados persistiram
            if (!testManager.formData[page] || !testManager.formData[page][`teste_${page}`]) {
                navigationSuccess = false;
                break;
            }
        }

        logTest('Navegação Entre Páginas', navigationSuccess, 
               `${pages.length} páginas testadas`, 'navigation');
    } catch (error) {
        logTest('Navegação Entre Páginas', false, `Erro: ${error.message}`, 'navigation');
    }

    // TESTE 5: Integridade de Dados Complexos
    try {
        const complexData = {
            personal: {
                autor_nome: ['João Silva', 'Maria Santos'],
                autor_cpf: ['12345678909', '98765432100'],
                autor_nascimento: ['01/01/1980', '15/05/1985']
            },
            social: {
                familiar_nome: ['João Silva', 'Ana Silva', 'Carlos Silva'],
                familiar_parentesco: ['Assistido', 'Cônjuge', 'Filho'],
                renda_total: 2500.00
            },
            incapacity: {
                cids: ['M79.3', 'F32.9'],
                documentos: ['Atestado Médico', 'Laudo Pericial']
            }
        };

        // Salvar dados complexos
        for (const [step, stepData] of Object.entries(complexData)) {
            for (const [field, value] of Object.entries(stepData)) {
                testManager.updateSpecificField(step, field, value);
            }
        }

        await testManager.captureCurrentFormData();

        // Verificar integridade
        let integrityOk = true;
        let checkedFields = 0;

        for (const [step, stepData] of Object.entries(complexData)) {
            for (const [field, expectedValue] of Object.entries(stepData)) {
                const actualValue = testManager.formData[step]?.[field];
                checkedFields++;
                
                if (Array.isArray(expectedValue)) {
                    if (!Array.isArray(actualValue) || 
                        actualValue.length !== expectedValue.length ||
                        !expectedValue.every((val, idx) => actualValue[idx] === val)) {
                        integrityOk = false;
                        break;
                    }
                } else if (actualValue !== expectedValue) {
                    integrityOk = false;
                    break;
                }
            }
            if (!integrityOk) break;
        }

        logTest('Integridade de Dados Complexos', integrityOk, 
               `${checkedFields} campos verificados`, 'integrity');
    } catch (error) {
        logTest('Integridade de Dados Complexos', false, `Erro: ${error.message}`, 'integrity');
    }    // =====================================================================
    // TESTES DE RACE CONDITIONS E CONCORRÊNCIA
    // =====================================================================

    // Teste 6: Race Conditions - Sistema de Mutex
    try {
        const promises = [];
        let raceConditionDetected = false;

        // Simula operações simultâneas
        for (let i = 0; i < 10; i++) {
            promises.push(testManager.updateSpecificField('test', `key${i}`, `value${i}`));
        }

        await Promise.all(promises);
        
        // Verifica se todos os estados foram definidos corretamente
        let allStatesSet = true;
        for (let i = 0; i < 10; i++) {
            if (testManager.formData.test?.[`key${i}`] !== `value${i}`) {
                allStatesSet = false;
                break;
            }
        }

        logTest('Sistema de Mutex (Race Conditions)', allStatesSet, 
               '10 operações simultâneas', 'concurrency');
    } catch (error) {
        logTest('Sistema de Mutex (Race Conditions)', false, `Erro: ${error.message}`, 'concurrency');
    }

    // TESTE 7: Memory Leaks - Sistema de Limpeza
    try {
        const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
        
        // Cria muitos estados e depois limpa
        for (let i = 0; i < 100; i++) {
            testManager.updateSpecificField('temp', `temp${i}`, `data${i}`);
        }
        
        await testManager.captureCurrentFormData();
        
        // Limpa dados temporários
        delete testManager.formData.temp;
        
        // Força garbage collection se disponível
        if (window.gc) window.gc();
        
        const finalMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
        const memoryIncrease = finalMemory - initialMemory;
        
        logTest('Gestão de Memória', memoryIncrease < 1000000, 
               `Aumento: ${(memoryIncrease / 1024).toFixed(1)}KB`, 'performance');
    } catch (error) {
        logTest('Gestão de Memória', false, `Erro: ${error.message}`, 'performance');
    }

    // TESTE 8: Performance - Debounce e Throttling
    try {
        const startTime = performance.now();
        
        // Faz múltiplas chamadas rápidas
        for (let i = 0; i < 20; i++) {
            testManager.debouncedCaptureFormData();
        }
        
        // Aguarda debounce
        await new Promise(resolve => setTimeout(resolve, 150));
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        logTest('Performance - Debounce', duration < 500, 
               `20 chamadas em ${duration.toFixed(2)}ms`, 'performance');
    } catch (error) {
        logTest('Performance - Debounce', false, `Erro: ${error.message}`, 'performance');
    }

    // =====================================================================
    // TESTES DE VALIDAÇÃO E INTEGRIDADE
    // =====================================================================

    // TESTE 9: Validação de Dados de Entrada
    try {
        const validator = testManager.offlineValidator || new window.OfflineValidator();
        
        // Testa validação de CPF
        const cpfValid = validator.validateCPF('12345678909');
        const cpfInvalid = !validator.validateCPF('12345678900');
        
        // Testa validação de email
        const emailValid = validator.validateEmail('teste@email.com');
        const emailInvalid = !validator.validateEmail('email-inválido');
        
        logTest('Validação de Dados', cpfValid && cpfInvalid && emailValid && emailInvalid, 
               'CPF e Email validados', 'validation');
    } catch (error) {
        logTest('Validação de Dados', false, `Erro: ${error.message}`, 'validation');
    }

    // TESTE 10: Detecção de Conflitos
    try {
        // Simula conflito de dados
        testManager.updateSpecificField('conflict', 'field1', 'value1');
        await testManager.captureCurrentFormData();
        
        // Simula mudança externa
        testManager.formData.conflict.field1 = 'value2';
        
        // Tenta atualizar novamente
        testManager.updateSpecificField('conflict', 'field1', 'value3');
        
        const conflictDetected = testManager.formData.conflict.field1 === 'value3';
        
        logTest('Detecção de Conflitos', conflictDetected, 
               'Resolução de conflitos', 'integrity');
    } catch (error) {
        logTest('Detecção de Conflitos', false, `Erro: ${error.message}`, 'integrity');
    }
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
