/**
 * Configuração e inicialização do Firebase
 */

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDQHlyksk3UIUMAeSgTP3sML1w3GO1alBE",
  authDomain: "fiap-30b70.firebaseapp.com",
  projectId: "fiap-30b70",
  storageBucket: "fiap-30b70.firebasestorage.app",
  messagingSenderId: "1066954560673",
  appId: "1:1066954560673:web:280108c13b1f2cb48a0ce0",
  measurementId: "G-6P236JX2MZ"
};

// Inicializar o Firebase
firebase.initializeApp(firebaseConfig);

// Inicializar o Analytics
const analytics = firebase.analytics();

// Referências aos serviços do Firebase
// const db = firebase.firestore(); // REMOVIDO - Firestore não é mais usado para persistência de formulário
const auth = firebase.auth();
const storage = firebase.storage();

/**
 * Namespace para integração com Firebase
 */
FIAP.firebase = {
  // Referências aos serviços
  db: null, // Definido como null já que firestore não está sendo usado para formulários
  auth,
  storage,

  /**
   * Salva dados de um formulário no Firestore
   * @param {string} formType - Tipo de formulário (ex: 'personal', 'social')
   * @param {Object} data - Dados a serem salvos
   * @returns {Promise} - Promise com o resultado da operação
   */
  saveFormData: async function(formType, data) {
    console.log(`Simulando salvamento de ${formType}. Persistência no Firestore desativada.`);
    return Promise.resolve({ success: true, message: "Simulado: Persistência no Firestore desativada." });
  },

  /**
   * Carrega dados de um formulário do Firestore
   * @param {string} cpf - CPF do assistido
   * @returns {Promise<Object>} - Promise com os dados carregados
   */
  loadFormData: async function(cpf) {
    console.log(`Simulando carregamento para CPF ${cpf}. Persistência no Firestore desativada.`);
    return Promise.resolve({ success: false, message: "Simulado: Nenhum dado encontrado (persistência no Firestore desativada)." });
  },
};

/**
 * Funções para lidar com o estado online/offline
 */

// Verificar se o aplicativo está online
let isOnline = navigator.onLine;

// Monitorar mudanças no estado de conexão
window.addEventListener('online', handleOnlineStatus);
window.addEventListener('offline', handleOfflineStatus);

// Gerenciar status online
function handleOnlineStatus() {
  isOnline = true;
  console.log('Aplicativo está online');
  showSuccess('Conexão restabelecida! Sincronizando dados...', null, { duration: 3000 });
}

// Gerenciar status offline
function handleOfflineStatus() {
  isOnline = false;
  console.log('Aplicativo está offline');
  showError('Você está offline. Algumas funcionalidades podem não estar disponíveis.', null, { duration: 5000 });
}

// Sincronizar dados offline com o Firebase
async function syncOfflineData() {
  console.log('syncOfflineData chamada, mas a funcionalidade de sincronização offline foi removida.');
}

// Inicializar o Firebase ao carregar a aplicação
document.addEventListener('DOMContentLoaded', function() {
  console.log('Inicializando Firebase...');

  // Verificar estado da conexão
  if (navigator.onLine) {
    console.log('Aplicação online. Firebase pronto para uso.');
  } else {
    console.log('Aplicação offline. Dados serão salvos localmente.');
    if (typeof handleOfflineStatus === 'function') {
      handleOfflineStatus();
    }
  }
});
