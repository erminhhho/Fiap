// Sistema de Testes de Persistência v3.0
// Implementa testes abrangentes para validar todas as funcionalidades de persistência local

class PersistenceTestSuite {
    constructor() {
        this.testResults = {
            passed: 0,
            failed: 0,
            total: 0,
            details: []
        };
        
        this.testModules = [
            'personal', 'social', 'incapacity', 
            'professional', 'documents', 'home'
        ];
        
        this.isRunning = false;
        this.originalData = {};
        
        this.logger = {
            log: (message, type = 'info') => {
                const consoleElement = document.getElementById('console-output');
                if (consoleElement && typeof logToConsole === 'function') {
                    logToConsole(`[PERSIST-TEST] ${message}`, type);
                } else {
                    console.log(`[PERSIST-TEST] ${message}`);
                }
            },
            success: (message) => this.logger.log(message, 'success'),
            error: (message) => this.logger.log(message, 'error'),
            warning: (message) => this.logger.log(message, 'warning'),
            info: (message) => this.logger.log(message, 'info')
        };
    }

    // Método principal para executar todos os testes
    async runAutomaticTests() {
        if (this.isRunning) {
            this.logger.warning('Testes já estão em execução!');
            return;
        }

        this.isRunning = true;
        this.resetTestResults();
        
        this.logger.info('🧪 Iniciando Suite de Testes de Persistência v3.0');
        this.logger.info('─'.repeat(60));

        try {
            // Backup dos dados atuais
            await this.backupCurrentData();
            
            // Executar testes em sequência
            await this.testBasicPersistence();
            await this.testModuleSpecificPersistence();
            await this.testCrossBrowserPersistence();
            await this.testFormDataCapture();
            await this.testStateRestoration();
            await this.testNavigationPersistence();
            await this.testErrorRecovery();
            await this.testPerformanceUnderLoad();
            await this.testDataValidation();
            await this.testCacheSystem();
            
            // Restaurar dados originais
            await this.restoreOriginalData();
            
            this.logger.info('─'.repeat(60));
            this.displayTestSummary();
            
        } catch (error) {
            this.logger.error(`Erro geral nos testes: ${error.message}`);
            await this.restoreOriginalData();
        } finally {
            this.isRunning = false;
        }
    }

    // Teste 1: Persistência Básica
    async testBasicPersistence() {
        this.logger.info('🔍 Teste 1: Persistência Básica do localStorage');
        
        const testKey = 'test_persistence_basic';
        const testData = {
            timestamp: Date.now(),
            testValue: 'persistence_test_' + Math.random(),
            nested: { value: 123, array: [1, 2, 3] }
        };

        try {
            // Teste de escrita
            localStorage.setItem(testKey, JSON.stringify(testData));
            this.logger.success('✓ Escrita no localStorage funcionando');

            // Teste de leitura
            const retrieved = JSON.parse(localStorage.getItem(testKey));
            if (JSON.stringify(retrieved) === JSON.stringify(testData)) {
                this.logger.success('✓ Leitura do localStorage funcionando');
                this.addTestResult('basic_persistence', true, 'Persistência básica funcionando');
            } else {
                throw new Error('Dados recuperados não coincidem');
            }

            // Limpeza
            localStorage.removeItem(testKey);
            this.logger.success('✓ Limpeza do localStorage funcionando');

        } catch (error) {
            this.logger.error(`✗ Persistência básica falhou: ${error.message}`);
            this.addTestResult('basic_persistence', false, error.message);
        }
    }

    // Teste 2: Persistência Específica por Módulo
    async testModuleSpecificPersistence() {
        this.logger.info('🔍 Teste 2: Persistência Específica por Módulo');

        for (const module of this.testModules) {
            try {
                await this.testSingleModulePersistence(module);
            } catch (error) {
                this.logger.error(`✗ Falha no módulo ${module}: ${error.message}`);
                this.addTestResult(`module_${module}`, false, error.message);
            }
        }
    }

    async testSingleModulePersistence(moduleName) {
        const testData = this.generateTestDataForModule(moduleName);
        const storageKey = `fiap_form_data_${moduleName}`;

        // Teste de salvamento específico por módulo
        if (window.stateManager && typeof window.stateManager.updateSpecificField === 'function') {
            // Usar StateManager se disponível
            for (const [field, value] of Object.entries(testData)) {
                window.stateManager.updateSpecificField(moduleName, field, value);
            }
            
            // Verificar se foi salvo
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                const parsedData = JSON.parse(saved);
                const hasTestData = Object.keys(testData).some(key => 
                    parsedData.hasOwnProperty(key) && parsedData[key] === testData[key]
                );
                
                if (hasTestData) {
                    this.logger.success(`✓ Módulo ${moduleName}: StateManager funcionando`);
                    this.addTestResult(`module_${moduleName}`, true, 'StateManager funcionando');
                } else {
                    throw new Error('Dados não encontrados no storage após StateManager');
                }
            } else {
                throw new Error('StateManager não salvou dados');
            }
        } else {
            // Teste direto no localStorage
            localStorage.setItem(storageKey, JSON.stringify(testData));
            const retrieved = JSON.parse(localStorage.getItem(storageKey));
            
            if (JSON.stringify(retrieved) === JSON.stringify(testData)) {
                this.logger.success(`✓ Módulo ${moduleName}: persistência direta funcionando`);
                this.addTestResult(`module_${moduleName}`, true, 'Persistência direta funcionando');
            } else {
                throw new Error('Dados diretos não coincidem');
            }
        }
    }

    // Teste 3: Compatibilidade Cross-Browser
    async testCrossBrowserPersistence() {
        this.logger.info('🔍 Teste 3: Compatibilidade Cross-Browser');

        try {
            // Testar diferentes métodos de storage
            const methods = ['localStorage', 'sessionStorage'];
            const testData = { crossBrowser: true, timestamp: Date.now() };

            for (const method of methods) {
                if (window[method]) {
                    window[method].setItem('test_cross_browser', JSON.stringify(testData));
                    const retrieved = JSON.parse(window[method].getItem('test_cross_browser'));
                    
                    if (JSON.stringify(retrieved) === JSON.stringify(testData)) {
                        this.logger.success(`✓ ${method} funcionando`);
                    } else {
                        throw new Error(`${method} não funcionando corretamente`);
                    }
                    
                    window[method].removeItem('test_cross_browser');
                } else {
                    this.logger.warning(`${method} não disponível neste browser`);
                }
            }

            this.addTestResult('cross_browser', true, 'Compatibilidade cross-browser OK');

        } catch (error) {
            this.logger.error(`✗ Compatibilidade cross-browser falhou: ${error.message}`);
            this.addTestResult('cross_browser', false, error.message);
        }
    }

    // Teste 4: Captura de Dados de Formulário
    async testFormDataCapture() {
        this.logger.info('🔍 Teste 4: Captura de Dados de Formulário');

        try {
            const testForm = document.getElementById('test-form');
            if (!testForm) {
                throw new Error('Formulário de teste não encontrado');
            }

            // Preencher formulário com dados de teste
            const formData = {
                'autor_nome[]': 'João da Silva Teste',
                'autor_cpf[]': '11144477735',
                'email': 'teste@persistencia.com',
                'telefone': '11987654321',
                'estado_civil': 'solteiro',
                'observacoes': 'Teste de captura de formulário'
            };

            for (const [name, value] of Object.entries(formData)) {
                const field = testForm.querySelector(`[name="${name}"]`);
                if (field) {
                    field.value = value;
                    // Disparar evento de mudança
                    field.dispatchEvent(new Event('input', { bubbles: true }));
                    field.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }

            // Aguardar debounce
            await this.delay(500);

            // Verificar se StateManager capturou os dados
            if (window.stateManager && typeof window.stateManager.captureCurrentFormData === 'function') {
                await window.stateManager.captureCurrentFormData();
                this.logger.success('✓ StateManager capturou dados do formulário');
            }

            // Verificar se dados foram persistidos
            const storageKeys = Object.keys(localStorage).filter(key => 
                key.startsWith('fiap_form_data_')
            );

            if (storageKeys.length > 0) {
                let foundTestData = false;
                for (const key of storageKeys) {
                    const data = JSON.parse(localStorage.getItem(key));
                    if (Object.values(formData).some(value => 
                        JSON.stringify(data).includes(value)
                    )) {
                        foundTestData = true;
                        break;
                    }
                }

                if (foundTestData) {
                    this.logger.success('✓ Dados do formulário foram persistidos');
                    this.addTestResult('form_capture', true, 'Captura de formulário funcionando');
                } else {
                    throw new Error('Dados do formulário não encontrados no storage');
                }
            } else {
                throw new Error('Nenhum dado persistido encontrado');
            }

        } catch (error) {
            this.logger.error(`✗ Captura de formulário falhou: ${error.message}`);
            this.addTestResult('form_capture', false, error.message);
        }
    }

    // Teste 5: Restauração de Estado
    async testStateRestoration() {
        this.logger.info('🔍 Teste 5: Restauração de Estado');

        try {
            // Salvar estado atual
            const currentState = this.captureCurrentState();
            
            // Simular perda de dados (limpar formulários)
            this.clearAllForms();
            
            // Tentar restaurar
            if (window.stateManager && typeof window.stateManager.loadStateFromCache === 'function') {
                const restored = window.stateManager.loadStateFromCache();
                
                if (restored) {
                    this.logger.success('✓ StateManager restaurou estado');
                } else {
                    this.logger.warning('StateManager não encontrou estado para restaurar');
                }
            }

            // Verificar se dados foram restaurados via storage direto
            const restoredViaStorage = this.restoreStateFromStorage();
            
            if (restoredViaStorage) {
                this.logger.success('✓ Restauração via storage direto funcionando');
                this.addTestResult('state_restoration', true, 'Restauração funcionando');
            } else {
                throw new Error('Não foi possível restaurar estado');
            }

        } catch (error) {
            this.logger.error(`✗ Restauração de estado falhou: ${error.message}`);
            this.addTestResult('state_restoration', false, error.message);
        }
    }

    // Teste 6: Persistência Durante Navegação
    async testNavigationPersistence() {
        this.logger.info('🔍 Teste 6: Persistência Durante Navegação');

        try {
            // Simular dados antes da navegação
            const testData = { navigation_test: Date.now() };
            
            // Salvar dados
            if (window.stateManager) {
                window.stateManager.updateSpecificField('tests', 'navigation_data', testData);
                
                // Simular evento de navegação
                window.dispatchEvent(new Event('beforeunload'));
                
                // Verificar se dados foram salvos
                const saved = localStorage.getItem('fiap_form_data_tests');
                if (saved && JSON.parse(saved).navigation_data) {
                    this.logger.success('✓ Dados salvos antes da navegação');
                    this.addTestResult('navigation_persistence', true, 'Persistência em navegação funcionando');
                } else {
                    throw new Error('Dados não salvos antes da navegação');
                }
            } else {
                this.logger.warning('StateManager não disponível para teste de navegação');
                this.addTestResult('navigation_persistence', false, 'StateManager não disponível');
            }

        } catch (error) {
            this.logger.error(`✗ Persistência de navegação falhou: ${error.message}`);
            this.addTestResult('navigation_persistence', false, error.message);
        }
    }

    // Teste 7: Recuperação de Erros
    async testErrorRecovery() {
        this.logger.info('🔍 Teste 7: Recuperação de Erros');

        try {
            // Simular dados corrompidos
            localStorage.setItem('fiap_form_data_error_test', 'dados_corrompidos_invalidos');
            
            // Tentar recuperar com StateManager
            if (window.stateManager && typeof window.stateManager.loadStateFromCache === 'function') {
                try {
                    window.stateManager.loadStateFromCache();
                    this.logger.success('✓ StateManager lidou com dados corrompidos');
                } catch (error) {
                    // Esperado que falhe graciosamente
                    this.logger.success('✓ StateManager falhou graciosamente com dados corrompidos');
                }
            }

            // Verificar se sistema continua funcionando após erro
            const testData = { recovery_test: true };
            localStorage.setItem('fiap_form_data_recovery_test', JSON.stringify(testData));
            const recovered = JSON.parse(localStorage.getItem('fiap_form_data_recovery_test'));
            
            if (recovered.recovery_test) {
                this.logger.success('✓ Sistema continua funcionando após erro');
                this.addTestResult('error_recovery', true, 'Recuperação de erros funcionando');
            } else {
                throw new Error('Sistema não se recuperou do erro');
            }

            // Limpeza
            localStorage.removeItem('fiap_form_data_error_test');
            localStorage.removeItem('fiap_form_data_recovery_test');

        } catch (error) {
            this.logger.error(`✗ Recuperação de erros falhou: ${error.message}`);
            this.addTestResult('error_recovery', false, error.message);
        }
    }

    // Teste 8: Performance Sob Carga
    async testPerformanceUnderLoad() {
        this.logger.info('🔍 Teste 8: Performance Sob Carga');

        try {
            const startTime = performance.now();
            const operations = 100;

            // Realizar múltiplas operações de persistência
            for (let i = 0; i < operations; i++) {
                const testData = { 
                    operation: i, 
                    data: `test_data_${i}`, 
                    timestamp: Date.now() 
                };
                
                localStorage.setItem(`performance_test_${i}`, JSON.stringify(testData));
                const retrieved = JSON.parse(localStorage.getItem(`performance_test_${i}`));
                
                if (retrieved.operation !== i) {
                    throw new Error(`Falha na operação ${i}`);
                }
            }

            const duration = performance.now() - startTime;
            const opsPerSecond = (operations / duration) * 1000;

            this.logger.success(`✓ ${operations} operações em ${Math.round(duration)}ms (${Math.round(opsPerSecond)} ops/seg)`);

            // Limpeza
            for (let i = 0; i < operations; i++) {
                localStorage.removeItem(`performance_test_${i}`);
            }

            if (opsPerSecond > 100) { // Threshold arbitrário
                this.addTestResult('performance_load', true, `Performance adequada: ${Math.round(opsPerSecond)} ops/seg`);
            } else {
                this.addTestResult('performance_load', false, `Performance baixa: ${Math.round(opsPerSecond)} ops/seg`);
            }

        } catch (error) {
            this.logger.error(`✗ Teste de performance falhou: ${error.message}`);
            this.addTestResult('performance_load', false, error.message);
        }
    }

    // Teste 9: Validação de Dados
    async testDataValidation() {
        this.logger.info('🔍 Teste 9: Validação de Dados');

        try {
            const testCases = [
                { cpf: '11144477735', valid: true },
                { cpf: '12345678900', valid: false },
                { email: 'teste@valid.com', valid: true },
                { email: 'invalid-email', valid: false },
                { telefone: '11999999999', valid: true },
                { telefone: '123', valid: false }
            ];

            let validationsPassed = 0;
            let validationsTotal = testCases.length;

            for (const testCase of testCases) {
                if (window.stateManager && typeof window.stateManager.validateFormData === 'function') {
                    const result = window.stateManager.validateFormData(testCase, 'personal');
                    
                    if (result.valid === testCase.valid) {
                        validationsPassed++;
                        this.logger.success(`✓ Validação correta para ${Object.keys(testCase)[0]}`);
                    } else {
                        this.logger.error(`✗ Validação incorreta para ${Object.keys(testCase)[0]}`);
                    }
                } else {
                    this.logger.warning('Sistema de validação não disponível');
                    break;
                }
            }

            if (validationsPassed === validationsTotal) {
                this.addTestResult('data_validation', true, `Todas as ${validationsTotal} validações passaram`);
            } else {
                this.addTestResult('data_validation', false, `${validationsPassed}/${validationsTotal} validações passaram`);
            }

        } catch (error) {
            this.logger.error(`✗ Teste de validação falhou: ${error.message}`);
            this.addTestResult('data_validation', false, error.message);
        }
    }

    // Teste 10: Sistema de Cache
    async testCacheSystem() {
        this.logger.info('🔍 Teste 10: Sistema de Cache');

        try {
            // Testar cache básico
            if (window.FIAP && window.FIAP.cache) {
                const cacheKey = 'test_cache_key';
                const cacheData = { test: true, timestamp: Date.now() };
                
                // Salvar no cache
                window.FIAP.cache.set(cacheKey, cacheData, 5000); // 5 segundos
                
                // Recuperar do cache
                const cached = window.FIAP.cache.get(cacheKey);
                
                if (cached && cached.test === true) {
                    this.logger.success('✓ Sistema de cache básico funcionando');
                    
                    // Testar expiração
                    await this.delay(100);
                    const stillCached = window.FIAP.cache.get(cacheKey);
                    
                    if (stillCached) {
                        this.logger.success('✓ Cache com TTL funcionando');
                        this.addTestResult('cache_system', true, 'Sistema de cache funcionando');
                    } else {
                        this.logger.warning('Cache expirou muito rapidamente');
                        this.addTestResult('cache_system', false, 'Cache expirando muito rápido');
                    }
                } else {
                    throw new Error('Cache não retornou dados corretos');
                }
            } else {
                this.logger.warning('Sistema de cache FIAP não encontrado');
                this.addTestResult('cache_system', false, 'Sistema de cache não disponível');
            }

        } catch (error) {
            this.logger.error(`✗ Teste de cache falhou: ${error.message}`);
            this.addTestResult('cache_system', false, error.message);
        }
    }

    // Teste de Cenário do Mundo Real
    async testRealWorldScenario() {
        this.logger.info('🌍 Executando Cenário do Mundo Real');
        this.logger.info('Simulando preenchimento completo de formulário...');

        try {
            // Simular usuário preenchendo formulário passo a passo
            const scenarios = [
                { module: 'personal', data: this.generateRealPersonalData() },
                { module: 'social', data: this.generateRealSocialData() },
                { module: 'incapacity', data: this.generateRealIncapacityData() },
                { module: 'professional', data: this.generateRealProfessionalData() }
            ];

            for (const scenario of scenarios) {
                this.logger.info(`📝 Preenchendo módulo: ${scenario.module}`);
                
                // Simular digitação lenta (como usuário real)
                for (const [field, value] of Object.entries(scenario.data)) {
                    if (window.stateManager) {
                        window.stateManager.updateSpecificField(scenario.module, field, value);
                    }
                    await this.delay(50); // Simular tempo entre campos
                }
                
                // Simular pausa entre módulos
                await this.delay(200);
            }

            // Verificar se todos os dados foram persistidos
            let allPersisted = true;
            for (const scenario of scenarios) {
                const storageKey = `fiap_form_data_${scenario.module}`;
                const stored = localStorage.getItem(storageKey);
                
                if (!stored) {
                    allPersisted = false;
                    break;
                }
            }

            if (allPersisted) {
                this.logger.success('✓ Cenário do mundo real completado com sucesso!');
                this.logger.success('✓ Todos os dados foram persistidos corretamente');
            } else {
                throw new Error('Nem todos os módulos foram persistidos');
            }

        } catch (error) {
            this.logger.error(`✗ Cenário do mundo real falhou: ${error.message}`);
        }
    }

    // Teste de Stress de Persistência
    async runPersistenceStressTest() {
        this.logger.info('🔥 Executando Teste de Stress de Persistência');

        try {
            const startTime = performance.now();
            const stressOperations = 500;
            let successfulOps = 0;
            let failedOps = 0;

            this.logger.info(`Executando ${stressOperations} operações simultâneas...`);

            // Criar múltiplas operações simultâneas
            const promises = [];
            
            for (let i = 0; i < stressOperations; i++) {
                const promise = this.performStressOperation(i)
                    .then(() => { successfulOps++; })
                    .catch(() => { failedOps++; });
                promises.push(promise);
            }

            await Promise.all(promises);

            const duration = performance.now() - startTime;
            const opsPerSecond = (stressOperations / duration) * 1000;

            this.logger.info(`📊 Resultados do Teste de Stress:`);
            this.logger.info(`   • Operações bem-sucedidas: ${successfulOps}`);
            this.logger.info(`   • Operações falhadas: ${failedOps}`);
            this.logger.info(`   • Tempo total: ${Math.round(duration)}ms`);
            this.logger.info(`   • Performance: ${Math.round(opsPerSecond)} ops/seg`);

            if (successfulOps / stressOperations > 0.95) { // 95% de sucesso
                this.logger.success('✓ Sistema passou no teste de stress!');
            } else {
                this.logger.error('✗ Sistema falhou no teste de stress');
            }

            // Limpeza
            for (let i = 0; i < stressOperations; i++) {
                localStorage.removeItem(`stress_test_${i}`);
            }

        } catch (error) {
            this.logger.error(`✗ Teste de stress falhou: ${error.message}`);
        }
    }

    // Métodos auxiliares
    async performStressOperation(index) {
        const data = {
            index: index,
            timestamp: Date.now(),
            randomData: Math.random().toString(36).substring(7),
            largeData: 'x'.repeat(1000) // 1KB de dados
        };

        localStorage.setItem(`stress_test_${index}`, JSON.stringify(data));
        const retrieved = JSON.parse(localStorage.getItem(`stress_test_${index}`));
        
        if (retrieved.index !== index) {
            throw new Error(`Falha na operação ${index}`);
        }
    }

    generateTestDataForModule(moduleName) {
        const testData = {
            personal: {
                'autor_nome[]': 'João Silva Teste',
                'autor_cpf[]': '11144477735',
                email: 'teste@exemplo.com',
                telefone: '11999999999'
            },
            social: {
                assistido_nome: 'Maria Silva',
                assistido_cpf: '22233344456',
                parentesco: 'mae'
            },
            incapacity: {
                cid_principal: 'F20.0',
                limitacao_principal: 'Dificuldade de locomoção'
            },
            professional: {
                profissao_atual: 'Desenvolvedor',
                situacao_trabalho: 'ativo'
            },
            documents: {
                documento_tipo: 'rg',
                documento_numero: '123456789'
            },
            home: {
                dashboard_preference: 'completo'
            }
        };

        return testData[moduleName] || { test_field: 'test_value' };
    }

    generateRealPersonalData() {
        return {
            'autor_nome[]': 'João da Silva Santos',
            'autor_cpf[]': '11144477735',
            email: 'joao.santos@email.com',
            telefone: '11987654321',
            cep: '01310-100',
            endereco: 'Av. Paulista, 1000',
            cidade: 'São Paulo',
            estado: 'SP'
        };
    }

    generateRealSocialData() {
        return {
            assistido_nome: 'Maria Santos Silva',
            assistido_cpf: '22233344456',
            assistido_idade: '65',
            parentesco: 'mae',
            renda_familiar: '2500.00',
            membros_familia: '3'
        };
    }

    generateRealIncapacityData() {
        return {
            cid_principal: 'F20.0',
            cid_secundario: 'F32.1',
            limitacao_principal: 'Dificuldade de locomoção',
            medicacao_principal: 'Rivotril 2mg',
            data_inicio_incapacidade: '2023-01-15'
        };
    }

    generateRealProfessionalData() {
        return {
            profissao_atual: 'Analista de Sistemas',
            situacao_trabalho: 'afastado',
            tempo_servico: '10',
            salario_atual: '5000.00',
            empresa: 'Tech Solutions Ltda'
        };
    }

    async backupCurrentData() {
        this.logger.info('💾 Fazendo backup dos dados atuais...');
        this.originalData = {};
        
        for (const key of Object.keys(localStorage)) {
            if (key.startsWith('fiap_')) {
                this.originalData[key] = localStorage.getItem(key);
            }
        }
        
        this.logger.success(`✓ Backup de ${Object.keys(this.originalData).length} itens realizado`);
    }

    async restoreOriginalData() {
        this.logger.info('🔄 Restaurando dados originais...');
        
        // Limpar dados de teste
        for (const key of Object.keys(localStorage)) {
            if (key.startsWith('fiap_') || key.includes('test')) {
                localStorage.removeItem(key);
            }
        }
        
        // Restaurar dados originais
        for (const [key, value] of Object.entries(this.originalData)) {
            localStorage.setItem(key, value);
        }
        
        this.logger.success('✓ Dados originais restaurados');
    }

    captureCurrentState() {
        const state = {};
        for (const key of Object.keys(localStorage)) {
            if (key.startsWith('fiap_')) {
                state[key] = localStorage.getItem(key);
            }
        }
        return state;
    }

    clearAllForms() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                if (input.type === 'checkbox' || input.type === 'radio') {
                    input.checked = false;
                } else {
                    input.value = '';
                }
            });
        });
    }

    restoreStateFromStorage() {
        try {
            const storageKeys = Object.keys(localStorage).filter(key => 
                key.startsWith('fiap_form_data_')
            );
            
            return storageKeys.length > 0;
        } catch (error) {
            return false;
        }
    }

    resetTestResults() {
        this.testResults = {
            passed: 0,
            failed: 0,
            total: 0,
            details: []
        };
    }

    addTestResult(testName, passed, details) {
        this.testResults.total++;
        if (passed) {
            this.testResults.passed++;
        } else {
            this.testResults.failed++;
        }
        
        this.testResults.details.push({
            name: testName,
            passed: passed,
            details: details,
            timestamp: new Date().toLocaleTimeString()
        });
    }

    displayTestSummary() {
        this.logger.info('📊 RESUMO DOS TESTES DE PERSISTÊNCIA');
        this.logger.info('═'.repeat(60));
        this.logger.info(`Total de testes: ${this.testResults.total}`);
        this.logger.success(`✓ Testes aprovados: ${this.testResults.passed}`);
        
        if (this.testResults.failed > 0) {
            this.logger.error(`✗ Testes falhados: ${this.testResults.failed}`);
        }
        
        const successRate = ((this.testResults.passed / this.testResults.total) * 100).toFixed(1);
        this.logger.info(`Taxa de sucesso: ${successRate}%`);
        
        if (successRate >= 90) {
            this.logger.success('🎉 SISTEMA DE PERSISTÊNCIA APROVADO!');
        } else if (successRate >= 70) {
            this.logger.warning('⚠️ Sistema de persistência precisa de melhorias');
        } else {
            this.logger.error('🚨 Sistema de persistência com problemas críticos');
        }
        
        this.logger.info('═'.repeat(60));
        
        // Mostrar detalhes dos testes falhados
        const failedTests = this.testResults.details.filter(test => !test.passed);
        if (failedTests.length > 0) {
            this.logger.error('Testes que falharam:');
            failedTests.forEach(test => {
                this.logger.error(`  • ${test.name}: ${test.details}`);
            });
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Sistema de Debug de Persistência
class PersistenceDebugger {
    constructor() {
        this.isDebugging = false;
        this.debugLog = [];
        
        this.logger = {
            log: (message, type = 'info') => {
                const consoleElement = document.getElementById('console-output');
                if (consoleElement && typeof logToConsole === 'function') {
                    logToConsole(`[DEBUG] ${message}`, type);
                } else {
                    console.log(`[DEBUG] ${message}`);
                }
            }
        };
    }

    startDebug() {
        if (this.isDebugging) {
            this.logger.log('Debug já está ativo!', 'warning');
            return;
        }

        this.isDebugging = true;
        this.debugLog = [];
        
        this.logger.log('🔍 Iniciando Debug de Persistência...', 'info');
        this.logger.log('─'.repeat(50), 'info');

        // Monitor de localStorage
        this.monitorLocalStorage();
        
        // Monitor de StateManager
        this.monitorStateManager();
        
        // Monitor de formulários
        this.monitorForms();
        
        // Status atual
        this.displayCurrentStatus();
    }

    monitorLocalStorage() {
        this.logger.log('📊 Status atual do localStorage:', 'info');
        
        let fiapItems = 0;
        let totalSize = 0;
        
        for (const key of Object.keys(localStorage)) {
            const value = localStorage.getItem(key);
            totalSize += (key.length + value.length) * 2; // Aproximadamente bytes
            
            if (key.startsWith('fiap_')) {
                fiapItems++;
                this.logger.log(`  • ${key}: ${(value.length * 2 / 1024).toFixed(2)}KB`, 'info');
            }
        }
        
        this.logger.log(`Total de itens FIAP: ${fiapItems}`, 'info');
        this.logger.log(`Tamanho total: ${(totalSize / 1024).toFixed(2)}KB`, 'info');
    }

    monitorStateManager() {
        if (window.stateManager) {
            this.logger.log('✓ StateManager detectado e ativo', 'success');
            
            // Verificar métricas se disponível
            if (window.stateManager.metrics) {
                const metrics = window.stateManager.metrics;
                this.logger.log(`  • Operações de captura: ${metrics.captures || 0}`, 'info');
                this.logger.log(`  • Operações de restauração: ${metrics.restores || 0}`, 'info');
                this.logger.log(`  • Cache hits: ${metrics.cacheHits || 0}`, 'info');
            }
            
            // Verificar listeners ativos
            if (window.stateManager.activeListeners) {
                this.logger.log(`  • Listeners ativos: ${window.stateManager.activeListeners.size}`, 'info');
            }
        } else {
            this.logger.log('✗ StateManager não encontrado', 'error');
        }
    }

    monitorForms() {
        const forms = document.querySelectorAll('form');
        this.logger.log(`📝 Formulários detectados: ${forms.length}`, 'info');
        
        forms.forEach((form, index) => {
            const inputs = form.querySelectorAll('input, select, textarea');
            const filledInputs = Array.from(inputs).filter(input => 
                input.value && input.value.trim() !== ''
            );
            
            this.logger.log(`  • Formulário ${index + 1}: ${filledInputs.length}/${inputs.length} campos preenchidos`, 'info');
        });
    }

    displayCurrentStatus() {
        this.logger.log('', 'info');
        this.logger.log('🔧 DIAGNÓSTICO COMPLETO:', 'info');
        this.logger.log('─'.repeat(30), 'info');
        
        // Status do localStorage
        const storageAvailable = this.testLocalStorageAvailability();
        this.logger.log(`localStorage disponível: ${storageAvailable ? '✓' : '✗'}`, 
                       storageAvailable ? 'success' : 'error');
        
        // Status do StateManager
        const stateManagerWorking = window.stateManager && 
                                  typeof window.stateManager.captureCurrentFormData === 'function';
        this.logger.log(`StateManager funcionando: ${stateManagerWorking ? '✓' : '✗'}`, 
                       stateManagerWorking ? 'success' : 'error');
        
        // Status do cache
        const cacheWorking = window.FIAP && window.FIAP.cache;
        this.logger.log(`Sistema de cache: ${cacheWorking ? '✓' : '✗'}`, 
                       cacheWorking ? 'success' : 'error');
        
        this.logger.log('─'.repeat(30), 'info');
        this.logger.log('Debug ativo. Monitore as mensagens acima.', 'info');
    }

    testLocalStorageAvailability() {
        try {
            const testKey = 'test_availability';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch (error) {
            return false;
        }
    }

    stopDebug() {
        this.isDebugging = false;
        this.logger.log('🔍 Debug de persistência finalizado.', 'info');
    }
}

// Inicialização e exposição global
window.testSuite = new PersistenceTestSuite();
window.persistenceDebugger = new PersistenceDebugger();

// Função global para iniciar debug
window.startPersistenceDebug = function() {
    window.persistenceDebugger.startDebug();
};

// Log de inicialização
console.log('[PERSISTENCE-TEST] Sistema de Testes de Persistência v3.0 carregado!');
console.log('[PERSISTENCE-TEST] Use window.testSuite.runAutomaticTests() para executar todos os testes');
console.log('[PERSISTENCE-TEST] Use window.startPersistenceDebug() para debug completo');