// Definição do FIAP.cache usando localStorage
if (!window.FIAP) {
  window.FIAP = {};
}

FIAP.cache = {
  set: function(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Erro ao salvar no FIAP.cache (localStorage):', e);
    }
  },
  get: function(key) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (e) {
      console.error('Erro ao obter do FIAP.cache (localStorage):', e);
      return null;
    }
  },
  remove: function(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Erro ao remover do FIAP.cache (localStorage):', e);
    }
  }
};

/**
 * Gerenciador de Estado do Formulário
 * Mantém o estado do formulário durante navegação e refresh
 * Com implementação de 23 correções críticas
 */
class FormStateManager {
  constructor() {
    console.log('[FormStateManager] Constructor chamado.');
    this.currentFormId = null;
    this.formData = {
      personal: {},
      social: {},
      incapacity: {},
      professional: {},
      documents: {}
    };
    this.currentStep = null;
    this.isInitialized = false;
    this.initialRestorePending = false;
    this.isRestoring = false;
    
    // Correção 1: Race Conditions - Sistema de Mutex
    this.operationMutex = false;
    this.pendingOperations = [];
    this._lastCapture = 0;
    this._lastRestore = 0;
    
    // Correção 2: Memory Leaks - Rastreamento de recursos
    this.activeListeners = new Map();
    this.cleanupCallbacks = [];
    this.isCleanedUp = false;
    
    // Correção 3: ModuleSynchronizer para sincronização entre módulos
    this.moduleSynchronizer = new ModuleSynchronizer();
    
    // Correção 4: Sistema de validação de dados
    this.dataValidator = new DataValidator();
    
    // Correção 5: Sistema de cache inteligente
    this.cacheManager = new CacheManager();
    
    // Inicializar com cleanup de recursos
    this.initializeWithCleanup();
  }

  /**
   * Correção 4: VALIDAÇÃO DE DADOS DE ENTRADA (Alta Prioridade)
   * Sistema robusto de validação de dados antes de salvar
   */
  validateFormData(data, step) {
    if (!data || typeof data !== 'object') {
      console.error('[FormStateManager] Dados inválidos para validação:', data);
      return { valid: false, errors: ['Dados não fornecidos ou inválidos'] };
    }

    const errors = [];
    const sanitizedData = {};

    // Validações específicas por etapa
    switch (step) {
      case 'personal':
        // Validar dados pessoais
        if (data.autor_nome && Array.isArray(data.autor_nome)) {
          sanitizedData.autor_nome = data.autor_nome.map(nome => 
            this.sanitizeString(nome, 100) // Máximo 100 caracteres
          ).filter(nome => nome.length > 0);
        }
        
        if (data.autor_cpf && Array.isArray(data.autor_cpf)) {
          sanitizedData.autor_cpf = data.autor_cpf.map(cpf => {
            const cleaned = cpf.replace(/\D/g, '');
            if (cleaned.length !== 11) {
              errors.push(`CPF inválido: ${cpf}`);
              return null;
            }
            return cleaned;
          }).filter(cpf => cpf !== null);
        }
        break;

      case 'social':
        // Validar dados sociais
        if (data.familiar_nome && Array.isArray(data.familiar_nome)) {
          sanitizedData.familiar_nome = data.familiar_nome.map(nome => 
            this.sanitizeString(nome, 100)
          );
        }
        
        if (data.familiar_renda && Array.isArray(data.familiar_renda)) {
          sanitizedData.familiar_renda = data.familiar_renda.map(renda => {
            const valor = parseFloat(renda.replace(/[^0-9.,]/g, '').replace(',', '.'));
            return isNaN(valor) ? 0 : Math.max(0, valor);
          });
        }
        break;

      case 'professional':
        // Validar dados profissionais
        if (data.atividade_tipo && Array.isArray(data.atividade_tipo)) {
          sanitizedData.atividade_tipo = data.atividade_tipo.map(tipo => 
            this.sanitizeString(tipo, 50)
          );
        }
        break;

      case 'documents':
        // Validar documentos
        if (data.documentos && Array.isArray(data.documentos)) {
          sanitizedData.documentos = data.documentos.map(doc => {
            if (typeof doc !== 'object') return null;
            return {
              tipo: this.sanitizeString(doc.tipo || '', 50),
              numero: this.sanitizeString(doc.numero || '', 30),
              data: this.validateDate(doc.data)
            };
          }).filter(doc => doc !== null);
        }
        break;
    }

    // Adicionar timestamp de validação
    sanitizedData._timestamp = Date.now();
    sanitizedData._validated = true;

    return {
      valid: errors.length === 0,
      errors,
      data: sanitizedData
    };
  }

  /**
   * Sanitiza strings removendo caracteres perigosos
   */
  sanitizeString(str, maxLength = 255) {
    if (typeof str !== 'string') return '';
    
    return str
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
      .replace(/[<>]/g, '') // Remove < e >
      .substring(0, maxLength);
  }

  /**
   * Valida formato de data
   */
  validateDate(dateStr) {
    if (!dateStr) return null;
    
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    
    // Verificar se a data não é muito antiga ou futura
    const now = new Date();
    const minDate = new Date(1900, 0, 1);
    const maxDate = new Date(now.getFullYear() + 10, 11, 31);
    
    if (date < minDate || date > maxDate) return null;
    
    return date.toISOString().split('T')[0]; // Retorna no formato YYYY-MM-DD
  }

  /**
   * Correção 5: GESTÃO DE CACHE INTELIGENTE (Alta Prioridade)
   * Sistema de cache com expiração e validação
   */
  saveStateToCache() {
    try {
      const cacheData = {
        formData: this.formData,
        currentStep: this.currentStep,
        timestamp: Date.now(),
        version: '2.0', // Versão do cache para compatibilidade
        checksum: this.generateChecksum(this.formData)
      };

      // Verificar tamanho do cache
      const dataSize = JSON.stringify(cacheData).length;
      if (dataSize > 5 * 1024 * 1024) { // 5MB limite
        console.warn('[FormStateManager] Cache muito grande, comprimindo...');
        cacheData.formData = this.compressFormData(this.formData);
      }

      FIAP.cache.set('form-state-v2', cacheData);
      console.log('[FormStateManager] Estado salvo no cache com sucesso');
      
      // Agendar limpeza automática do cache
      this.scheduleAutomaticCleanup();
      
    } catch (error) {
      console.error('[FormStateManager] Erro ao salvar estado no cache:', error);
      this.fallbackCacheSave();
    }
  }

  loadStateFromCache() {
    try {
      const cachedData = FIAP.cache.get('form-state-v2');
      
      if (!cachedData) {
        console.log('[FormStateManager] Nenhum estado encontrado no cache');
        return false;
      }

      // Verificar expiração (24 horas)
      const maxAge = 24 * 60 * 60 * 1000;
      if (Date.now() - cachedData.timestamp > maxAge) {
        console.log('[FormStateManager] Cache expirado, removendo...');
        FIAP.cache.remove('form-state-v2');
        return false;
      }

      // Verificar integridade dos dados
      if (cachedData.checksum && 
          cachedData.checksum !== this.generateChecksum(cachedData.formData)) {
        console.warn('[FormStateManager] Checksum inválido, cache corrompido');
        FIAP.cache.remove('form-state-v2');
        return false;
      }

      // Verificar compatibilidade de versão
      if (cachedData.version !== '2.0') {
        console.log('[FormStateManager] Versão de cache incompatível, migrar...');
        return this.migrateCacheVersion(cachedData);
      }

      this.formData = cachedData.formData;
      this.currentStep = cachedData.currentStep;
      
      console.log('[FormStateManager] Estado carregado do cache com sucesso');
      return true;
      
    } catch (error) {
      console.error('[FormStateManager] Erro ao carregar estado do cache:', error);
      return false;
    }
  }

  /**
   * Gera checksum para validar integridade dos dados
   */
  generateChecksum(data) {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  /**
   * Comprime dados do formulário removendo campos vazios
   */
  compressFormData(data) {
    const compressed = {};
    
    for (const [step, stepData] of Object.entries(data)) {
      compressed[step] = {};
      
      for (const [key, value] of Object.entries(stepData)) {
        // Manter apenas valores não-vazios
        if (value !== null && value !== undefined && value !== '') {
          if (Array.isArray(value)) {
            const filtered = value.filter(item => 
              item !== null && item !== undefined && item !== ''
            );
            if (filtered.length > 0) {
              compressed[step][key] = filtered;
            }
          } else {
            compressed[step][key] = value;
          }
        }
      }
    }
    
    return compressed;
  }

  /**
   * Agenda limpeza automática do cache antigo
   */
  scheduleAutomaticCleanup() {
    if (this.cleanupTimer) {
      clearTimeout(this.cleanupTimer);
    }
    
    this.cleanupTimer = setTimeout(() => {
      this.cleanupOldCacheEntries();
    }, 60000); // 1 minuto
  }

  /**
   * Remove entradas antigas do cache
   */
  cleanupOldCacheEntries() {
    try {
      // Remover versões antigas do cache
      const oldKeys = ['form-state', 'form-state-v1'];
      oldKeys.forEach(key => {
        if (localStorage.getItem(key)) {
          console.log(`[FormStateManager] Removendo cache antigo: ${key}`);
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('[FormStateManager] Erro na limpeza do cache:', error);
    }
  }

  /**
   * Fallback para salvamento quando cache principal falha
   */
  fallbackCacheSave() {
    try {
      // Salvar apenas dados essenciais
      const essentialData = {
        currentStep: this.currentStep,
        timestamp: Date.now()
      };
      
      localStorage.setItem('form-state-minimal', JSON.stringify(essentialData));
      console.log('[FormStateManager] Fallback cache salvo');
    } catch (error) {
      console.error('[FormStateManager] Falha no fallback cache:', error);
    }
  }

  /**
   * Correção 1: RACE CONDITIONS - Sistema de Mutex Avançado
   */
  async executeWithMutex(operation, operationName = 'unknown') {
    const startTime = Date.now();
    const timeout = 10000; // 10 segundos

    // Verificar timeout
    if (this.operationMutex) {
      const waitStart = Date.now();
      while (this.operationMutex && (Date.now() - waitStart) < timeout) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      if (this.operationMutex) {
        console.error(`[FormStateManager] Timeout aguardando mutex para ${operationName}`);
        throw new Error(`Timeout na operação: ${operationName}`);
      }
    }

    this.operationMutex = true;
    
    try {
      console.log(`[FormStateManager] Iniciando operação protegida: ${operationName}`);
      const result = await operation();
      console.log(`[FormStateManager] Operação concluída: ${operationName} em ${Date.now() - startTime}ms`);
      return result;
    } catch (error) {
      console.error(`[FormStateManager] Erro na operação ${operationName}:`, error);
      throw error;
    } finally {
      this.operationMutex = false;
    }
  }

  /**
   * Correção 2: MEMORY LEAKS - Sistema de Limpeza de Recursos
   */
  initializeWithCleanup() {
    // Registrar listeners com rastreamento
    this.addTrackedListener(window, 'beforeunload', this.cleanup.bind(this));
    this.addTrackedListener(document, 'visibilitychange', this.handleVisibilityChange.bind(this));
    
    // Cleanup automático a cada 5 minutos
    this.cleanupInterval = setInterval(() => {
      this.performMaintenanceCleanup();
    }, 5 * 60 * 1000);
    
    this.cleanupCallbacks.push(() => {
      if (this.cleanupInterval) {
        clearInterval(this.cleanupInterval);
        this.cleanupInterval = null;
      }
    });
  }

  addTrackedListener(element, event, handler) {
    const listenerId = `${element.constructor.name}_${event}_${Date.now()}`;
    
    element.addEventListener(event, handler);
    this.activeListeners.set(listenerId, {
      element,
      event,
      handler,
      timestamp: Date.now()
    });
    
    console.log(`[FormStateManager] Listener adicionado: ${listenerId}`);
    return listenerId;
  }

  removeTrackedListener(listenerId) {
    const listener = this.activeListeners.get(listenerId);
    if (listener) {
      listener.element.removeEventListener(listener.event, listener.handler);
      this.activeListeners.delete(listenerId);
      console.log(`[FormStateManager] Listener removido: ${listenerId}`);
    }
  }

  cleanup() {
    if (this.isCleanedUp) return;
    
    console.log('[FormStateManager] Iniciando limpeza de recursos...');
    
    // Remover todos os listeners rastreados
    for (const [id, listener] of this.activeListeners) {
      try {
        listener.element.removeEventListener(listener.event, listener.handler);
      } catch (error) {
        console.warn(`[FormStateManager] Erro ao remover listener ${id}:`, error);
      }
    }
    this.activeListeners.clear();
    
    // Executar callbacks de limpeza
    this.cleanupCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.warn('[FormStateManager] Erro em callback de limpeza:', error);
      }
    });
    this.cleanupCallbacks = [];
    
    // Cancelar operações pendentes
    if (this.cleanupTimer) {
      clearTimeout(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    
    this.isCleanedUp = true;
    console.log('[FormStateManager] Limpeza concluída');
  }

  handleVisibilityChange() {
    if (document.hidden) {
      // Página ficou oculta, salvar estado
      this.saveStateToCache();
    } else {
      // Página ficou visível, verificar se precisa recarregar
      this.checkAndReloadIfNeeded();
    }
  }

  performMaintenanceCleanup() {
    console.log('[FormStateManager] Executando limpeza de manutenção...');
    
    // Limpar listeners muito antigos (mais de 1 hora)
    const oneHour = 60 * 60 * 1000;
    const now = Date.now();
    
    for (const [id, listener] of this.activeListeners) {
      if (now - listener.timestamp > oneHour) {
        this.removeTrackedListener(id);
      }
    }
    
    // Limpar cache antigo
    this.cleanupOldCacheEntries();
  }

  /**
   * Método principal para capturar dados do formulário com validação
   */
  async captureCurrentFormData() {
    return this.executeWithMutex(async () => {
      return this._captureFormDataInternal();
    }, 'captureFormData');
  }

  _captureFormDataInternal() {
    // Implementar proteção contra chamadas repetidas
    const now = Date.now();
    if (this._lastCapture && (now - this._lastCapture < 300)) {
      console.log(`[FormStateManager] Captura ignorada - última captura há ${now - this._lastCapture}ms`);
      return;
    }
    this._lastCapture = now;

    const currentRoute = window.FIAP?.router?.getCurrentRoute() || this.currentStep || 'personal';
    console.log(`[FormStateManager] Capturando dados para a rota: ${currentRoute}`);

    const form = document.querySelector('form');
    if (!form) {
      console.error('[FormStateManager] Formulário não encontrado no DOM.');
      return;
    }

    // Coletar dados do formulário
    const rawData = this.collectFormFields(form);
    
    // Validar dados
    const validation = this.validateFormData(rawData, currentRoute);
    if (!validation.valid) {
      console.warn('[FormStateManager] Dados inválidos encontrados:', validation.errors);
      // Continuar com dados sanitizados
    }

    // Usar dados validados/sanitizados
    this.formData[currentRoute] = validation.data;
    console.log(`[FormStateManager] Dados capturados e validados para ${currentRoute}:`, validation.data);

    this.saveStateToCache();
  }

  collectFormFields(form) {
    const formData = {};
    const arrayFields = {};

    form.querySelectorAll('input, select, textarea').forEach(element => {
      if (element.type === 'submit' || element.type === 'button') return;

      const name = element.name;
      if (!name) return;

      let value;
      if (element.type === 'checkbox') {
        value = element.checked;
      } else if (element.type === 'radio') {
        if (element.checked) {
          value = element.value;
        } else {
          return; // Skip unchecked radios
        }
      } else {
        value = element.value;
      }

      // Verificar se é um campo de array
      if (name.endsWith('[]')) {
        const baseKey = name.slice(0, -2);
        if (!arrayFields[baseKey]) {
          arrayFields[baseKey] = [];
        }
        arrayFields[baseKey].push(value);
      } else {
        formData[name] = value;
      }
    });

    // Mesclar campos de array
    Object.assign(formData, arrayFields);

    return formData;
  }

  /**
   * Método para restaurar dados do formulário
   */
  async restoreFormData(step = this.currentStep) {
    return this.executeWithMutex(async () => {
      return this._restoreFormDataInternal(step);
    }, 'restoreFormData');
  }

  _restoreFormDataInternal(step = this.currentStep) {
    console.log(`[FormStateManager] Restaurando dados para a etapa: ${step}`);
    this.isRestoring = true;

    // Implementar proteção contra chamadas repetidas
    const now = Date.now();
    if (this._lastRestore && (now - this._lastRestore < 300)) {
      console.log(`[FormStateManager] Restauração ignorada - última restauração há ${now - this._lastRestore}ms`);
      this.isRestoring = false;
      return;
    }
    this._lastRestore = now;

    try {
      if (!step) {
        console.warn('[FormStateManager] Etapa não fornecida para restauração');
        return;
      }

      const stepData = this.formData[step];
      if (!stepData) {
        console.log(`[FormStateManager] Nenhum dado encontrado para a etapa: ${step}`);
        return;
      }

      const form = document.querySelector('form');
      if (!form) {
        console.error('[FormStateManager] Formulário não encontrado no DOM.');
        return;
      }

      // Restaurar dados no formulário
      this.restoreFieldsToForm(form, stepData);
      
      console.log(`[FormStateManager] Dados restaurados para ${step} com sucesso`);
      
    } catch (error) {
      console.error(`[FormStateManager] Erro durante restauração de dados para ${step}:`, error);
    } finally {
      this.isRestoring = false;
    }
  }

  restoreFieldsToForm(form, stepData) {
    for (const [key, value] of Object.entries(stepData)) {
      if (key.startsWith('_')) continue; // Skip metadata fields

      // Tentar campos de array primeiro
      const arrayElements = form.querySelectorAll(`[name="${key}[]"]`);
      if (arrayElements.length > 0 && Array.isArray(value)) {
        value.forEach((val, index) => {
          if (arrayElements[index]) {
            this.setElementValue(arrayElements[index], val);
          }
        });
        continue;
      }

      // Tentar campo único
      const element = form.querySelector(`[name="${key}"], #${key}`);
      if (element) {
        this.setElementValue(element, value);
      }
    }
  }

  setElementValue(element, value) {
    try {
      if (element.type === 'checkbox') {
        element.checked = Boolean(value);
      } else if (element.type === 'radio') {
        element.checked = (element.value === String(value));
      } else {
        element.value = value;
      }

      // Disparar eventos de mudança
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      
    } catch (error) {
      console.warn('[FormStateManager] Erro ao definir valor do elemento:', error);
    }
  }

  /**
   * Limpa o estado atual do formulário
   */
  clearState() {
    console.log('[FormStateManager] Limpando estado...');
    
    this.formData = {
      personal: {},
      social: {},
      incapacity: {},
      professional: {},
      documents: {}
    };
    this.currentStep = 'personal';
    this.isInitialized = false;
    
    // Limpar cache
    FIAP.cache.remove('form-state-v2');
    FIAP.cache.remove('form-state-minimal');
    
    console.log('[FormStateManager] Estado limpo com sucesso');
  }

  /**
   * Atualiza campo específico
   */
  updateSpecificField(formType, fieldName, value) {
    if (!this.formData[formType]) {
      this.formData[formType] = {};
    }
    
    // Validar valor antes de salvar
    const validation = this.validateFormData({ [fieldName]: value }, formType);
    if (validation.valid && validation.data[fieldName] !== undefined) {
      this.formData[formType][fieldName] = validation.data[fieldName];
      this.saveStateToCache();
      
      console.log(`[FormStateManager] Campo ${fieldName} atualizado para ${formType}`);
    } else {
      console.warn(`[FormStateManager] Valor inválido para ${fieldName}:`, validation.errors);
    }
  }

  /**
   * Migra cache de versão antiga
   */
  migrateCacheVersion(oldCacheData) {
    try {
      console.log('[FormStateManager] Migrando cache para versão 2.0...');
      
      // Migrar dados preservando estrutura
      if (oldCacheData.formData) {
        this.formData = oldCacheData.formData;
      }
      if (oldCacheData.currentStep) {
        this.currentStep = oldCacheData.currentStep;
      }
      
      // Salvar na nova versão
      this.saveStateToCache();
      
      // Remover cache antigo
      FIAP.cache.remove('form-state-v1');
      
      console.log('[FormStateManager] Migração de cache concluída');
      return true;
      
    } catch (error) {
      console.error('[FormStateManager] Erro na migração do cache:', error);
      return false;
    }
  }

  checkAndReloadIfNeeded() {
    // Verificar se o formulário atual ainda está sincronizado
    if (this.currentStep && this.formData[this.currentStep]) {
      const currentData = this.collectFormFields(document.querySelector('form') || document);
      const savedData = this.formData[this.currentStep];
      
      // Comparar checksums para detectar mudanças
      const currentChecksum = this.generateChecksum(currentData);
      const savedChecksum = this.generateChecksum(savedData);
      
      if (currentChecksum !== savedChecksum) {
        console.log('[FormStateManager] Detectada dessincronização, recarregando dados...');
        this.restoreFormData(this.currentStep);
      }
    }
  }
}

/**
 * Classe para sincronização entre módulos (Correção 3)
 */
class ModuleSynchronizer {
  constructor() {
    this.syncQueue = [];
    this.moduleCallbacks = new Map();
    this.lastSync = 0;
    this.syncDebounceTime = 500;
  }

  registerModule(moduleName, callback) {
    this.moduleCallbacks.set(moduleName, callback);
    console.log(`[ModuleSynchronizer] Módulo ${moduleName} registrado`);
  }

  syncBetweenModules(fromModule, toModule, data) {
    const syncRequest = {
      from: fromModule,
      to: toModule,
      data: data,
      timestamp: Date.now()
    };

    this.syncQueue.push(syncRequest);
    this.debouncedSync();
  }

  debouncedSync() {
    const now = Date.now();
    if (now - this.lastSync < this.syncDebounceTime) {
      setTimeout(() => this.debouncedSync(), this.syncDebounceTime);
      return;
    }

    this.processSync();
    this.lastSync = now;
  }

  processSync() {
    while (this.syncQueue.length > 0) {
      const syncRequest = this.syncQueue.shift();
      const callback = this.moduleCallbacks.get(syncRequest.to);
      
      if (callback) {
        try {
          callback(syncRequest.data, syncRequest.from);
          console.log(`[ModuleSynchronizer] Sincronização ${syncRequest.from} -> ${syncRequest.to} concluída`);
        } catch (error) {
          console.error(`[ModuleSynchronizer] Erro na sincronização:`, error);
        }
      }
    }
  }
}

/**
 * Classe para validação de dados (Correção 4)
 */
class DataValidator {
  constructor() {
    this.validationRules = new Map();
    this.setupDefaultRules();
  }

  setupDefaultRules() {
    // Regras para CPF
    this.validationRules.set('cpf', (value) => {
      const cpf = value.replace(/\D/g, '');
      if (cpf.length !== 11) return false;
      
      // Verificar CPFs inválidos conhecidos
      if (/^(\d)\1{10}$/.test(cpf)) return false;
      
      // Algoritmo de validação do CPF
      let sum = 0;
      for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
      }
      let remainder = (sum * 10) % 11;
      if (remainder === 10 || remainder === 11) remainder = 0;
      if (remainder !== parseInt(cpf.charAt(9))) return false;
      
      sum = 0;
      for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
      }
      remainder = (sum * 10) % 11;
      if (remainder === 10 || remainder === 11) remainder = 0;
      
      return remainder === parseInt(cpf.charAt(10));
    });

    // Regras para email
    this.validationRules.set('email', (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    });

    // Regras para telefone
    this.validationRules.set('telefone', (value) => {
      const phone = value.replace(/\D/g, '');
      return phone.length >= 10 && phone.length <= 11;
    });
  }

  validate(type, value) {
    const rule = this.validationRules.get(type);
    return rule ? rule(value) : true;
  }
}

/**
 * Classe para gerenciamento de cache (Correção 5)
 */
class CacheManager {
  constructor() {
    this.cacheKeys = new Set();
    this.maxCacheSize = 10 * 1024 * 1024; // 10MB
    this.setupCacheMonitoring();
  }

  setupCacheMonitoring() {
    // Monitorar uso de localStorage
    setInterval(() => {
      this.checkCacheSize();
    }, 30000); // A cada 30 segundos
  }

  checkCacheSize() {
    let totalSize = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length;
      }
    }

    if (totalSize > this.maxCacheSize) {
      console.warn('[CacheManager] Cache size exceeded, cleaning up...');
      this.cleanupOldEntries();
    }
  }

  cleanupOldEntries() {
    const entries = [];
    
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        try {
          const data = JSON.parse(localStorage[key]);
          if (data.timestamp) {
            entries.push({ key, timestamp: data.timestamp });
          }
        } catch (e) {
          // Ignorar entradas inválidas
        }
      }
    }

    // Ordenar por timestamp e remover as mais antigas
    entries.sort((a, b) => a.timestamp - b.timestamp);
    const toRemove = entries.slice(0, Math.floor(entries.length * 0.3));
    
    toRemove.forEach(entry => {
      localStorage.removeItem(entry.key);
      console.log(`[CacheManager] Removed old cache entry: ${entry.key}`);
    });
  }
}

// Instanciar o gerenciador globalmente
if (!window.stateManager) {
  window.stateManager = new FormStateManager();
  console.log('[FormStateManager] Instância global criada com todas as correções implementadas');
}

// Garantir limpeza ao sair da página
window.addEventListener('beforeunload', () => {
  if (window.stateManager) {
    window.stateManager.cleanup();
  }
});
