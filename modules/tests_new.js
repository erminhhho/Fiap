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

    // Cria HTML do relatório de testes
    createTestReportHTML() {
        const successRate = this.testResults.total > 0 ?
            ((this.testResults.passed / this.testResults.total) * 100).toFixed(1) : 0;

        return `
            <div class="test-header">
                <h3>🧪 TESTE DE PERSISTÊNCIA REAL</h3>
                <div class="success-rate ${successRate >= 90 ? 'excellent' : successRate >= 70 ? 'good' : 'poor'}">
                    ${successRate}% de Sucesso
                </div>
            </div>

            <div class="metrics-grid">
                <div class="metric">
                    <span class="metric-value">${this.testResults.passed}</span>
                    <span class="metric-label">Aprovados</span>
                </div>
                <div class="metric">
                    <span class="metric-value">${this.testResults.failed}</span>
                    <span class="metric-label">Falharam</span>
                </div>
                <div class="metric">
                    <span class="metric-value">${this.testResults.persistenceTests}</span>
                    <span class="metric-label">Persistência</span>
                </div>
                <div class="metric">
                    <span class="metric-value">${this.testResults.realWorldTests}</span>
                    <span class="metric-label">Mundo Real</span>
                </div>
            </div>

            <div class="test-details">
                ${this.testResults.details.map(test => `
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
                <button onclick="testSuite.runPersistenceStressTest()" class="test-btn stress">🔥 Teste de Stress</button>
                <button onclick="testSuite.runRealWorldScenario()" class="test-btn realworld">🌍 Cenário Real</button>
                <button onclick="testSuite.runNavigationTest()" class="test-btn nav">🔄 Navegação</button>
                <button onclick="testSuite.exportTestResults()" class="test-btn export">📊 Exportar</button>
                <button onclick="testSuite.clearTestReport()" class="test-btn close">❌ Fechar</button>
            </div>
        `;
    }

    // Cria interface de testes
    createTestInterface() {
        // Remove interface anterior se existir
        const existingReport = document.getElementById('persistence-test-report');
        if (existingReport) {
            existingReport.remove();
        }

        // Cria nova interface
        this.testReportElement = document.createElement('div');
        this.testReportElement.id = 'persistence-test-report';
        this.testReportElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 450px;
            max-height: 80vh;
            overflow-y: auto;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 15px;
            padding: 20px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            z-index: 10000;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        `;

        // Adiciona estilos CSS personalizados
        const style = document.createElement('style');
        style.textContent = `
            .test-header {
                text-align: center;
                margin-bottom: 20px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.2);
                padding-bottom: 15px;
            }

            .success-rate {
                font-size: 24px;
                font-weight: bold;
                margin-top: 10px;
                padding: 8px 16px;
                border-radius: 20px;
                display: inline-block;
            }

            .success-rate.excellent { background: rgba(76, 175, 80, 0.3); }
            .success-rate.good { background: rgba(255, 152, 0, 0.3); }
            .success-rate.poor { background: rgba(244, 67, 54, 0.3); }

            .metrics-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 10px;
                margin-bottom: 20px;
            }

            .metric {
                background: rgba(255, 255, 255, 0.1);
                padding: 10px;
                border-radius: 8px;
                text-align: center;
            }

            .metric-value {
                display: block;
                font-size: 20px;
                font-weight: bold;
                color: #FFD700;
            }

            .metric-label {
                font-size: 12px;
                opacity: 0.8;
                margin-top: 5px;
            }

            .test-details {
                max-height: 300px;
                overflow-y: auto;
                margin-bottom: 20px;
            }

            .test-item {
                display: flex;
                align-items: flex-start;
                margin-bottom: 10px;
                padding: 10px;
                border-radius: 8px;
                background: rgba(255, 255, 255, 0.1);
            }

            .test-item.passed { border-left: 4px solid #4CAF50; }
            .test-item.failed { border-left: 4px solid #F44336; }

            .test-icon {
                margin-right: 10px;
                font-size: 16px;
            }

            .test-content {
                flex: 1;
            }

            .test-name {
                font-weight: bold;
                margin-bottom: 4px;
            }

            .test-message {
                font-size: 12px;
                opacity: 0.8;
                margin-bottom: 4px;
            }

            .test-category {
                font-size: 10px;
                background: rgba(255, 255, 255, 0.2);
                padding: 2px 6px;
                border-radius: 4px;
                display: inline-block;
            }

            .test-actions {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 8px;
            }

            .test-btn {
                padding: 8px 12px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 12px;
                font-weight: bold;
                transition: all 0.2s;
            }

            .test-btn.stress { background: #FF5722; color: white; }
            .test-btn.realworld { background: #2196F3; color: white; }
            .test-btn.nav { background: #FF9800; color: white; }
            .test-btn.export { background: #4CAF50; color: white; }
            .test-btn.close { background: #9E9E9E; color: white; }

            .test-btn:hover { transform: translateY(-1px); opacity: 0.9; }
        `;
        document.head.appendChild(style);

        // Adiciona à página
        document.body.appendChild(this.testReportElement);
        this.updateTestReport();
    }

    // =====================================================================
    // TESTES AUTOMÁTICOS DE PERSISTÊNCIA
    // =====================================================================

    async runAutomaticTests() {
        console.log('[PERSISTENCE TESTS] 🚀 Iniciando testes automáticos...');

        if (!this.stateManager) {
            this.logTest('Verificação de Sistema', false, 'FormStateManager não encontrado', 'system');
            return;
        }

        // Teste 1: Verificação básica do sistema
        await this.testBasicSystem();

        // Teste 2: Persistência simples
        await this.testSimplePersistence();

        // Teste 3: Persistência entre navegações simuladas
        await this.testNavigationPersistence();

        // Teste 4: Integridade de dados complexos
        await this.testComplexDataIntegrity();

        // Teste 5: Cenário de uso real
        await this.testRealWorldScenario();

        console.log('[PERSISTENCE TESTS] ✅ Testes automáticos concluídos');
    }

    // Teste 1: Verificação básica do sistema
    async testBasicSystem() {
        try {
            const isManagerAvailable = !!this.stateManager;
            const hasRequiredMethods = this.stateManager.updateSpecificField &&
                                      this.stateManager.captureCurrentFormData &&
                                      this.stateManager.restoreFormData;

            this.logTest('Sistema Básico', isManagerAvailable && hasRequiredMethods,
                        'FormStateManager com métodos essenciais', 'system');
        } catch (error) {
            this.logTest('Sistema Básico', false, `Erro: ${error.message}`, 'system');
        }
    }

    // Teste 2: Persistência simples
    async testSimplePersistence() {
        try {
            const testKey = 'test_persistence_simple';
            const testValue = `valor_teste_${Date.now()}`;

            // Salva dados
            this.stateManager.updateSpecificField('personal', testKey, testValue);
            await this.stateManager.captureCurrentFormData();

            // Simula perda de estado (limpa cache)
            if (this.stateManager.clearCache) {
                this.stateManager.clearCache();
            }

            // Tenta restaurar
            await this.stateManager.restoreFormData();

            // Verifica se os dados persistiram
            const restoredValue = this.stateManager.formData?.personal?.[testKey];
            const isPersisted = restoredValue === testValue;

            this.logTest('Persistência Simples', isPersisted,
                        `Valor: ${restoredValue === testValue ? 'OK' : 'PERDIDO'}`, 'persistence');
        } catch (error) {
            this.logTest('Persistência Simples', false, `Erro: ${error.message}`, 'persistence');
        }
    }

    // Teste 3: Persistência entre navegações simuladas
    async testNavigationPersistence() {
        try {
            const steps = ['personal', 'social', 'incapacity', 'professional', 'documents'];
            const testData = {};

            // Simula navegação salvando dados em cada step
            for (const step of steps) {
                const key = `nav_test_${step}`;
                const value = `dados_${step}_${Date.now()}`;
                testData[step] = { [key]: value };

                // Simula mudança de step
                this.stateManager.currentStep = step;
                this.stateManager.updateSpecificField(step, key, value);
                await this.stateManager.captureCurrentFormData();

                // Pequena pausa para simular navegação real
                await new Promise(resolve => setTimeout(resolve, 50));
            }

            // Simula refresh/reload da página
            const originalFormData = JSON.parse(JSON.stringify(this.stateManager.formData));

            // Limpa estado atual
            this.stateManager.formData = {};

            // Tenta restaurar após "reload"
            await this.stateManager.restoreFormData();

            // Verifica se todos os dados foram restaurados
            let allDataRestored = true;
            for (const step of steps) {
                const key = `nav_test_${step}`;
                const expectedValue = testData[step][key];
                const actualValue = this.stateManager.formData?.[step]?.[key];

                if (actualValue !== expectedValue) {
                    allDataRestored = false;
                    break;
                }
            }

            this.logTest('Navegação Entre Steps', allDataRestored,
                        `${steps.length} steps testados`, 'navigation');
        } catch (error) {
            this.logTest('Navegação Entre Steps', false, `Erro: ${error.message}`, 'navigation');
        }
    }

    // Teste 4: Integridade de dados complexos
    async testComplexDataIntegrity() {
        try {
            const complexData = {
                personal: {
                    autor_nome: ['João Silva', 'Maria Santos'],
                    autor_cpf: ['12345678909', '98765432100'],
                    autor_nascimento: ['01/01/1980', '15/05/1985'],
                    dados_compostos: {
                        endereco: {
                            rua: 'Rua das Flores, 123',
                            cidade: 'São Paulo',
                            cep: '01234-567'
                        },
                        contato: {
                            telefone: '(11) 99999-9999',
                            email: 'teste@exemplo.com'
                        }
                    }
                },
                social: {
                    familiar_nome: ['João Silva', 'Ana Silva', 'Carlos Silva'],
                    familiar_parentesco: ['Assistido', 'Cônjuge', 'Filho'],
                    renda_total: 2500.50,
                    beneficios: ['Auxílio Emergencial', 'Bolsa Família']
                }
            };

            // Salva dados complexos
            for (const [step, stepData] of Object.entries(complexData)) {
                for (const [field, value] of Object.entries(stepData)) {
                    this.stateManager.updateSpecificField(step, field, value);
                }
            }

            await this.stateManager.captureCurrentFormData();

            // Simula perda de estado
            const backup = JSON.parse(JSON.stringify(this.stateManager.formData));
            this.stateManager.formData = {};

            // Restaura dados
            await this.stateManager.restoreFormData();

            // Verifica integridade detalhada
            let integrityOk = true;
            let checkedFields = 0;

            for (const [step, stepData] of Object.entries(complexData)) {
                for (const [field, expectedValue] of Object.entries(stepData)) {
                    const actualValue = this.stateManager.formData[step]?.[field];
                    checkedFields++;

                    if (!this.deepEqual(actualValue, expectedValue)) {
                        integrityOk = false;
                        console.error(`Falha na integridade: ${step}.${field}`, {
                            expected: expectedValue,
                            actual: actualValue
                        });
                        break;
                    }
                }
                if (!integrityOk) break;
            }

            this.logTest('Integridade de Dados Complexos', integrityOk,
                        `${checkedFields} campos verificados`, 'integrity');
        } catch (error) {
            this.logTest('Integridade de Dados Complexos', false, `Erro: ${error.message}`, 'integrity');
        }
    }

    // Teste 5: Cenário de uso real
    async testRealWorldScenario() {
        try {
            console.log('[PERSISTENCE TESTS] 🌍 Iniciando cenário de uso real...');

            // Simula preenchimento real de formulário
            const realData = {
                personal: {
                    autor_nome: ['João da Silva Santos'],
                    autor_cpf: ['12345678909'],
                    autor_nascimento: ['15/03/1985'],
                    autor_telefone: ['(11) 98765-4321'],
                    autor_email: ['joao.santos@email.com']
                },
                social: {
                    familiar_nome: ['João da Silva Santos', 'Maria Santos Silva', 'Pedro Santos Silva'],
                    familiar_parentesco: ['Assistido', 'Cônjuge', 'Filho'],
                    familiar_nascimento: ['15/03/1985', '20/07/1990', '10/12/2015'],
                    renda_total: 3500.00
                },
                incapacity: {
                    cids: ['M79.3', 'F32.9'],
                    data_inicio: '01/01/2023',
                    descricao: 'Dor lombar crônica e transtorno depressivo'
                }
            };

            let success = true;
            let stepsTested = 0;

            // Simula navegação real entre steps
            for (const [step, stepData] of Object.entries(realData)) {
                console.log(`[REAL WORLD] Preenchendo step: ${step}`);

                // Simula mudança de step
                this.stateManager.currentStep = step;

                // Preenche campos do step
                for (const [field, value] of Object.entries(stepData)) {
                    this.stateManager.updateSpecificField(step, field, value);
                }

                // Captura dados do step atual
                await this.stateManager.captureCurrentFormData();
                stepsTested++;

                // Simula pausa do usuário (tempo real de preenchimento)
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            // Simula fechamento e reabertura do navegador
            console.log('[REAL WORLD] Simulando fechamento/reabertura do navegador...');
            const dataBeforeReload = JSON.parse(JSON.stringify(this.stateManager.formData));

            // Limpa estado (simula reload)
            this.stateManager.formData = {};
            this.stateManager.currentStep = 'personal';

            // Aguarda um momento (simula carregamento)
            await new Promise(resolve => setTimeout(resolve, 200));

            // Tenta restaurar dados após "reload"
            await this.stateManager.restoreFormData();

            // Verifica se todos os dados foram preservados
            for (const [step, stepData] of Object.entries(realData)) {
                for (const [field, expectedValue] of Object.entries(stepData)) {
                    const actualValue = this.stateManager.formData[step]?.[field];

                    if (!this.deepEqual(actualValue, expectedValue)) {
                        success = false;
                        console.error(`[REAL WORLD] Dados perdidos em ${step}.${field}:`, {
                            expected: expectedValue,
                            actual: actualValue
                        });
                        break;
                    }
                }
                if (!success) break;
            }

            this.logTest('Cenário de Uso Real', success,
                        `${stepsTested} steps, navegação completa`, 'realworld');
        } catch (error) {
            this.logTest('Cenário de Uso Real', false, `Erro: ${error.message}`, 'realworld');
        }
    }

    // =====================================================================
    // TESTES INTERATIVOS
    // =====================================================================

    // Teste de stress de persistência
    async runPersistenceStressTest() {
        console.log('[PERSISTENCE TESTS] 🔥 Iniciando teste de stress...');

        try {
            const iterations = 100;
            const fieldsPerIteration = 10;
            let successCount = 0;

            for (let i = 0; i < iterations; i++) {
                // Gera dados aleatórios
                const step = ['personal', 'social', 'incapacity'][i % 3];

                for (let j = 0; j < fieldsPerIteration; j++) {
                    const field = `stress_test_${i}_${j}`;
                    const value = `valor_${Date.now()}_${Math.random()}`;

                    this.stateManager.updateSpecificField(step, field, value);
                }

                // Captura e restaura rapidamente
                await this.stateManager.captureCurrentFormData();

                if (i % 10 === 0) {
                    // A cada 10 iterações, testa restauração
                    const backup = JSON.parse(JSON.stringify(this.stateManager.formData));
                    this.stateManager.formData = {};
                    await this.stateManager.restoreFormData();

                    // Verifica se dados foram restaurados
                    if (this.deepEqual(this.stateManager.formData, backup)) {
                        successCount++;
                    }
                }
            }

            const stressSuccess = successCount >= (iterations / 10) * 0.9; // 90% de sucesso

            this.logTest('Teste de Stress', stressSuccess,
                        `${successCount}/${iterations/10} ciclos bem-sucedidos`, 'stress');
        } catch (error) {
            this.logTest('Teste de Stress', false, `Erro: ${error.message}`, 'stress');
        }
    }

    // Teste específico de navegação
    async runNavigationTest() {
        console.log('[PERSISTENCE TESTS] 🔄 Testando navegação específica...');

        try {
            const steps = ['personal', 'social', 'incapacity', 'professional', 'documents'];
            const testData = new Map();

            // Preenche dados em cada step
            for (const step of steps) {
                this.stateManager.currentStep = step;

                const data = {
                    [`${step}_field1`]: `valor1_${step}`,
                    [`${step}_field2`]: `valor2_${step}`,
                    [`${step}_timestamp`]: Date.now()
                };

                testData.set(step, data);

                for (const [field, value] of Object.entries(data)) {
                    this.stateManager.updateSpecificField(step, field, value);
                }

                await this.stateManager.captureCurrentFormData();
            }

            // Navega para frente e para trás
            let navigationSuccess = true;

            for (let i = 0; i < steps.length; i++) {
                this.stateManager.currentStep = steps[i];
                await this.stateManager.restoreFormData();

                const expectedData = testData.get(steps[i]);
                for (const [field, expectedValue] of Object.entries(expectedData)) {
                    const actualValue = this.stateManager.formData[steps[i]]?.[field];
                    if (actualValue !== expectedValue) {
                        navigationSuccess = false;
                        break;
                    }
                }

                if (!navigationSuccess) break;
            }

            this.logTest('Navegação Específica', navigationSuccess,
                        `${steps.length} steps navegados`, 'navigation');
        } catch (error) {
            this.logTest('Navegação Específica', false, `Erro: ${error.message}`, 'navigation');
        }
    }

    // =====================================================================
    // UTILITÁRIOS
    // =====================================================================

    // Comparação profunda de objetos
    deepEqual(obj1, obj2) {
        if (obj1 === obj2) return true;

        if (obj1 == null || obj2 == null) return false;

        if (typeof obj1 !== typeof obj2) return false;

        if (typeof obj1 !== 'object') return obj1 === obj2;

        if (Array.isArray(obj1) !== Array.isArray(obj2)) return false;

        if (Array.isArray(obj1)) {
            if (obj1.length !== obj2.length) return false;
            for (let i = 0; i < obj1.length; i++) {
                if (!this.deepEqual(obj1[i], obj2[i])) return false;
            }
            return true;
        }

        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);

        if (keys1.length !== keys2.length) return false;

        for (const key of keys1) {
            if (!keys2.includes(key)) return false;
            if (!this.deepEqual(obj1[key], obj2[key])) return false;
        }

        return true;
    }

    // Exporta resultados dos testes
    exportTestResults() {
        const results = {
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId,
            summary: {
                total: this.testResults.total,
                passed: this.testResults.passed,
                failed: this.testResults.failed,
                successRate: this.testResults.total > 0 ?
                    ((this.testResults.passed / this.testResults.total) * 100).toFixed(1) : 0
            },
            categories: {
                persistence: this.testResults.persistenceTests,
                navigation: this.testResults.navigationTests,
                integrity: this.testResults.dataIntegrityTests,
                realworld: this.testResults.realWorldTests,
                stress: this.testResults.stressTests
            },
            details: this.testResults.details
        };

        // Salva no localStorage
        localStorage.setItem('persistenceTestResults', JSON.stringify(results));

        // Download como arquivo
        const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `persistence-test-results-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log('[PERSISTENCE TESTS] 📊 Resultados exportados');
    }

    // Limpa relatório de testes
    clearTestReport() {
        if (this.testReportElement) {
            this.testReportElement.remove();
            this.testReportElement = null;
        }
        console.log('[PERSISTENCE TESTS] 🗑️ Relatório limpo');
    }
}

// =====================================================================
// INICIALIZAÇÃO GLOBAL
// =====================================================================

// Instância global do sistema de testes
let testSuite = null;

// Inicializa quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', async function() {
    console.log('[PERSISTENCE TESTS] 🚀 Inicializando sistema de testes...');

    testSuite = new PersistenceTestSuite();
    window.testSuite = testSuite; // Disponibiliza globalmente

    await testSuite.initialize();
});

// Fallback para inicialização tardia
if (document.readyState === 'loading') {
    // DOM ainda carregando, aguarda DOMContentLoaded
} else {
    // DOM já carregado, inicializa imediatamente
    setTimeout(async () => {
        if (!testSuite) {
            testSuite = new PersistenceTestSuite();
            window.testSuite = testSuite;
            await testSuite.initialize();
        }
    }, 100);
}

// Funções globais para testes manuais
window.runPersistenceTests = async function() {
    if (testSuite) {
        await testSuite.runAutomaticTests();
    } else {
        console.error('[PERSISTENCE TESTS] Sistema de testes não inicializado');
    }
};

window.runStressTest = async function() {
    if (testSuite) {
        await testSuite.runPersistenceStressTest();
    } else {
        console.error('[PERSISTENCE TESTS] Sistema de testes não inicializado');
    }
};

window.runNavigationTest = async function() {
    if (testSuite) {
        await testSuite.runNavigationTest();
    } else {
        console.error('[PERSISTENCE TESTS] Sistema de testes não inicializado');
    }
};

console.log('[PERSISTENCE TESTS] ✅ Módulo de testes carregado');
