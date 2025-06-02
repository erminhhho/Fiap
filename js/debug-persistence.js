/**
 * SCRIPT DE TESTE ESPECÍFICO PARA DETECTAR PROBLEMAS DE PERSISTÊNCIA
 * Executa testes que simulam o uso real do sistema para identificar
 * onde exatamente a persistência está falhando
 */

class PersistenceDebugger {
    constructor() {
        this.debugData = [];
        this.testingActive = false;
        this.testResults = {
            beforeReload: null,
            afterReload: null,
            localStorage: null,
            sessionStorage: null,
            indexedDB: null
        };
    }

    // Inicia debug completo de persistência
    async startPersistenceDebug() {
        console.log('🔍 [PERSISTENCE DEBUG] Iniciando debug completo...');
        this.testingActive = true;

        await this.debugStorageMechanisms();
        await this.debugFormStateCapture();
        await this.debugFormStateRestore();
        await this.debugNavigationPersistence();

        this.generateDebugReport();
    }

    // Testa todos os mecanismos de armazenamento
    async debugStorageMechanisms() {
        console.log('🔍 [STORAGE DEBUG] Testando mecanismos de armazenamento...');

        const testData = {
            test: 'debug_persistence',
            timestamp: Date.now(),
            randomValue: Math.random()
        };

        // Testa localStorage
        try {
            localStorage.setItem('debug_test', JSON.stringify(testData));
            const retrieved = JSON.parse(localStorage.getItem('debug_test'));
            this.testResults.localStorage = this.deepEqual(testData, retrieved);
            console.log(`✅ localStorage: ${this.testResults.localStorage ? 'OK' : 'FALHOU'}`);
        } catch (error) {
            this.testResults.localStorage = false;
            console.error('❌ localStorage falhou:', error);
        }

        // Testa sessionStorage
        try {
            sessionStorage.setItem('debug_test', JSON.stringify(testData));
            const retrieved = JSON.parse(sessionStorage.getItem('debug_test'));
            this.testResults.sessionStorage = this.deepEqual(testData, retrieved);
            console.log(`✅ sessionStorage: ${this.testResults.sessionStorage ? 'OK' : 'FALHOU'}`);
        } catch (error) {
            this.testResults.sessionStorage = false;
            console.error('❌ sessionStorage falhou:', error);
        }

        // Testa IndexedDB se disponível
        if ('indexedDB' in window) {
            try {
                await this.testIndexedDB(testData);
                console.log(`✅ IndexedDB: ${this.testResults.indexedDB ? 'OK' : 'FALHOU'}`);
            } catch (error) {
                this.testResults.indexedDB = false;
                console.error('❌ IndexedDB falhou:', error);
            }
        } else {
            this.testResults.indexedDB = 'N/A';
            console.log('⚠️ IndexedDB não disponível');
        }
    }

    // Testa IndexedDB especificamente
    async testIndexedDB(testData) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('debugDB', 1);

            request.onerror = () => reject(request.error);

            request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction(['debug'], 'readwrite');
                const store = transaction.objectStore('debug');

                store.put(testData, 'test_key');

                const getRequest = store.get('test_key');
                getRequest.onsuccess = () => {
                    this.testResults.indexedDB = this.deepEqual(testData, getRequest.result);
                    db.close();
                    resolve();
                };
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                db.createObjectStore('debug');
            };
        });
    }

    // Debug da captura de dados do formulário
    async debugFormStateCapture() {
        console.log('🔍 [CAPTURE DEBUG] Testando captura de dados...');

        if (!window.stateManager) {
            console.error('❌ window.stateManager não encontrado');
            return;
        }

        // Adiciona dados de teste
        const testData = {
            personal: {
                debug_nome: 'João da Silva',
                debug_cpf: '12345678909',
                debug_timestamp: Date.now()
            },
            social: {
                debug_renda: 2500.50,
                debug_familia: ['João', 'Maria', 'Pedro'],
                debug_timestamp: Date.now()
            }
        };

        // Injeta dados no stateManager
        for (const [step, stepData] of Object.entries(testData)) {
            for (const [field, value] of Object.entries(stepData)) {
                window.stateManager.updateSpecificField(step, field, value);
            }
        }

        // Captura dados
        this.testResults.beforeReload = JSON.parse(JSON.stringify(window.stateManager.formData));
        await window.stateManager.captureCurrentFormData();

        console.log('📊 Dados antes da captura:', this.testResults.beforeReload);

        // Verifica se os dados foram salvos no storage
        this.debugStorageContents();
    }

    // Debug da restauração de dados
    async debugFormStateRestore() {
        console.log('🔍 [RESTORE DEBUG] Testando restauração de dados...');

        if (!window.stateManager) {
            console.error('❌ window.stateManager não encontrado');
            return;
        }

        // Limpa dados atuais (simula reload)
        const backupData = JSON.parse(JSON.stringify(window.stateManager.formData));
        window.stateManager.formData = {};

        console.log('🗑️ Dados limpos (simulando reload)');

        // Tenta restaurar
        await window.stateManager.restoreFormData();
        this.testResults.afterReload = JSON.parse(JSON.stringify(window.stateManager.formData));

        console.log('📊 Dados após restauração:', this.testResults.afterReload);

        // Compara dados
        const isEqual = this.deepEqual(backupData, this.testResults.afterReload);
        console.log(`${isEqual ? '✅' : '❌'} Restauração: ${isEqual ? 'SUCESSO' : 'FALHOU'}`);

        if (!isEqual) {
            console.log('🔍 Diferenças encontradas:');
            this.findDifferences(backupData, this.testResults.afterReload);
        }
    }

    // Debug da navegação entre steps
    async debugNavigationPersistence() {
        console.log('🔍 [NAVIGATION DEBUG] Testando persistência na navegação...');

        if (!window.stateManager) {
            console.error('❌ window.stateManager não encontrado');
            return;
        }

        const steps = ['personal', 'social', 'incapacity', 'professional', 'documents'];
        const navigationResults = [];

        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            console.log(`🔄 Navegando para step: ${step}`);

            // Simula mudança de step
            window.stateManager.currentStep = step;

            // Adiciona dados específicos do step
            const testField = `nav_debug_${step}`;
            const testValue = `valor_${step}_${Date.now()}`;

            window.stateManager.updateSpecificField(step, testField, testValue);
            await window.stateManager.captureCurrentFormData();

            // Verifica se dados persistiram
            const persistedValue = window.stateManager.formData[step]?.[testField];
            const isPersisted = persistedValue === testValue;

            navigationResults.push({
                step,
                field: testField,
                expected: testValue,
                actual: persistedValue,
                persisted: isPersisted
            });

            console.log(`${isPersisted ? '✅' : '❌'} Step ${step}: ${isPersisted ? 'OK' : 'FALHOU'}`);
        }

        this.debugData.push({
            type: 'navigation',
            results: navigationResults
        });
    }

    // Verifica conteúdo dos storages
    debugStorageContents() {
        console.log('🔍 [STORAGE CONTENTS] Verificando conteúdo dos storages...');

        // localStorage
        console.log('📦 localStorage:');
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.includes('form') || key.includes('state') || key.includes('fiap')) {
                console.log(`  ${key}:`, localStorage.getItem(key));
            }
        }

        // sessionStorage
        console.log('📦 sessionStorage:');
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key.includes('form') || key.includes('state') || key.includes('fiap')) {
                console.log(`  ${key}:`, sessionStorage.getItem(key));
            }
        }
    }

    // Encontra diferenças específicas entre objetos
    findDifferences(obj1, obj2, path = '') {
        if (obj1 === obj2) return;

        if (typeof obj1 !== typeof obj2) {
            console.log(`🔍 Tipo diferente em ${path}: ${typeof obj1} vs ${typeof obj2}`);
            return;
        }

        if (typeof obj1 !== 'object' || obj1 === null || obj2 === null) {
            console.log(`🔍 Valor diferente em ${path}: ${obj1} vs ${obj2}`);
            return;
        }

        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);

        // Chaves presentes em obj1 mas não em obj2
        for (const key of keys1) {
            if (!keys2.includes(key)) {
                console.log(`🔍 Chave perdida: ${path}.${key}`);
            } else {
                this.findDifferences(obj1[key], obj2[key], `${path}.${key}`);
            }
        }

        // Chaves presentes em obj2 mas não em obj1
        for (const key of keys2) {
            if (!keys1.includes(key)) {
                console.log(`🔍 Chave adicionada: ${path}.${key}`);
            }
        }
    }

    // Compara objetos profundamente
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

    // Gera relatório completo de debug
    generateDebugReport() {
        console.log('\n🔍 [DEBUG REPORT] Relatório Completo de Debug de Persistência');
        console.log('================================================');

        console.log('\n📊 Resultados dos Testes de Storage:');
        console.log(`localStorage: ${this.testResults.localStorage ? '✅ OK' : '❌ FALHOU'}`);
        console.log(`sessionStorage: ${this.testResults.sessionStorage ? '✅ OK' : '❌ FALHOU'}`);
        console.log(`IndexedDB: ${this.testResults.indexedDB === true ? '✅ OK' : this.testResults.indexedDB === false ? '❌ FALHOU' : '⚠️ N/A'}`);

        console.log('\n📊 Comparação de Dados:');
        const dataMatches = this.deepEqual(this.testResults.beforeReload, this.testResults.afterReload);
        console.log(`Dados antes vs depois: ${dataMatches ? '✅ IGUAIS' : '❌ DIFERENTES'}`);

        if (!dataMatches) {
            console.log('\n🔍 Analisando diferenças...');
            this.findDifferences(this.testResults.beforeReload, this.testResults.afterReload, 'formData');
        }

        console.log('\n💾 Estado dos Storages:');
        this.debugStorageContents();

        console.log('\n📝 Recomendações:');
        if (!this.testResults.localStorage) {
            console.log('⚠️ localStorage pode estar bloqueado ou cheio');
        }
        if (!dataMatches) {
            console.log('⚠️ Problema na restauração de dados - verificar lógica de restore');
        }

        // Salva relatório no localStorage para análise posterior
        try {
            localStorage.setItem('persistenceDebugReport', JSON.stringify({
                timestamp: new Date().toISOString(),
                results: this.testResults,
                debugData: this.debugData
            }));
            console.log('\n💾 Relatório salvo em localStorage como "persistenceDebugReport"');
        } catch (error) {
            console.error('❌ Erro ao salvar relatório:', error);
        }

        console.log('\n================================================');
    }
}

// Instância global do debugger
window.persistenceDebugger = new PersistenceDebugger();

// Função global para iniciar debug
window.startPersistenceDebug = function() {
    window.persistenceDebugger.startPersistenceDebug();
};

console.log('🔍 [PERSISTENCE DEBUGGER] Sistema de debug carregado. Use startPersistenceDebug() para iniciar.');
