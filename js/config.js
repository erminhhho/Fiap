/**
 * Configurações centralizadas da aplicação
 */

const CONFIG = {
  // Configurações básicas
  version: '1.0.0',
  lastUpdate: '2024-03-20',

  // Configurações de debug
  debug: {
    enabled: false, // Defina como true para ativar logs de debug
    levels: {
      navigation: false, // Logs de navegação do router
      storage: false,    // Logs de armazenamento
      forms: false,      // Logs de manipulação de formulários
      api: false,        // Logs de chamadas de API
      modules: false     // Logs de inicialização dos módulos
    },
    // Controle de logs para evitar duplicação
    preventDuplicates: true,
    lastLogs: {}
  },

  // Configurações financeiras
  financial: {
    minimumWage: 1518.00,
    currency: 'BRL',
    currencySymbol: 'R$'
  },

  // Opções de status civil
  civilStatus: [
    { value: 'solteiro', label: 'Solteiro(a)' },
    { value: 'casado', label: 'Casado(a)' },
    { value: 'divorciado', label: 'Divorciado(a)' },
    { value: 'viuvo', label: 'Viúvo(a)' },
    { value: 'separado', label: 'Separado(a)' },
    { value: 'uniao_estavel', label: 'União Estável' }
  ],

  // Opções de relacionamentos familiares
  familyRelationships: [
    { value: 'conjuge', label: 'Cônjuge' },
    { value: 'filho', label: 'Filho(a)' },
    { value: 'pai', label: 'Pai' },
    { value: 'mae', label: 'Mãe' },
    { value: 'irmao', label: 'Irmão(ã)' },
    { value: 'avos', label: 'Avós' },
    { value: 'tio', label: 'Tio(a)' },
    { value: 'primo', label: 'Primo(a)' },
    { value: 'outro', label: 'Outro' }
  ],

  // Opções de relacionamentos legais
  legalRelationships: [
    { value: 'titular', label: 'Titular' },
    { value: 'dependente', label: 'Dependente' },
    { value: 'representante_legal', label: 'Representante Legal' },
    { value: 'procurador', label: 'Procurador(a)' }
  ],

  // Regras de validação
  validation: {
    cpf: {
      pattern: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
      message: 'CPF inválido'
    },
    cep: {
      pattern: /^\d{5}-\d{3}$/,
      message: 'CEP inválido'
    },
    phone: {
      pattern: /^\(\d{2}\) \d{5}-\d{4}$/,
      message: 'Telefone inválido'
    },
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'E-mail inválido'
    }
  },

  // Configurações de cache
  cache: {
    expiration: 24 * 60 * 60 * 1000, // 24 horas em milissegundos
    maxSize: 1000 // Número máximo de itens no cache
  },

  // Configurações de API
  api: {
    cep: {
      url: 'https://viacep.com.br/ws/',
      timeout: 5000
    },
    cid: {
      url: '/api/cids',
      timeout: 5000
    }
  },

  // Configurações de UI
  ui: {
    theme: {
      primary: '#2563eb',
      secondary: '#64748b',
      success: '#22c55e',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6'
    },
    animation: {
      duration: 300,
      easing: 'ease-in-out'
    }
  },

  // Configurações de produção
  production: {
    // Se true, força o uso do modo de produção para evitar avisos do CDN Tailwind
    useProdMode: true
  }
};

// Função auxiliar para logging condicional e evitar duplicatas
window.logSystem = function(module, message, data) {
  if (!CONFIG.debug.enabled) return;

  // Verificar se devemos registrar este módulo
  const moduleType = module.toLowerCase();
  if (!CONFIG.debug.levels[moduleType]) return;

  // Evitar logs duplicados se a configuração estiver ativada
  if (CONFIG.debug.preventDuplicates) {
    const logKey = `${moduleType}:${message}`;
    const now = Date.now();

    // Se o mesmo log foi registrado nos últimos 500ms, ignore
    if (CONFIG.debug.lastLogs[logKey] && (now - CONFIG.debug.lastLogs[logKey] < 500)) {
      return;
    }

    // Registrar este log
    CONFIG.debug.lastLogs[logKey] = now;
  }

  // Formatar a mensagem
  const formattedMessage = `[${module}] ${message}`;

  // Registrar no console
  if (data) {
    console.log(formattedMessage, data);
  } else {
    console.log(formattedMessage);
  }
};

// Exportar configurações para uso global
window.CONFIG = CONFIG;
