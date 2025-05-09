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
const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

/**
 * Namespace para integração com Firebase
 */
FIAP.firebase = {
  // Referências aos serviços
  db,
  auth,
  storage,

  /**
   * Salva dados de um formulário no Firestore
   * @param {string} formType - Tipo de formulário (ex: 'personal', 'social')
   * @param {Object} data - Dados a serem salvos
   * @returns {Promise} - Promise com o resultado da operação
   */
  saveFormData: async function(formType, data) {
    try {
      // ID do documento (CPF, se disponível, ou timestamp)
      const docId = data.cpf || `form_${Date.now()}`;

      // Salvar no Firestore
      await db.collection('forms').doc(docId).set({
        formType,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        ...data
      }, { merge: true });

      console.log(`Dados de ${formType} salvos com sucesso no Firestore`);
      return { success: true };
    } catch (error) {
      console.error('Erro ao salvar dados no Firestore:', error);
      return { success: false, error };
    }
  },

  /**
   * Carrega dados de um formulário do Firestore
   * @param {string} cpf - CPF do assistido
   * @returns {Promise<Object>} - Promise com os dados carregados
   */
  loadFormData: async function(cpf) {
    try {
      const doc = await db.collection('forms').doc(cpf).get();

      if (doc.exists) {
        console.log('Dados carregados do Firestore:', doc.data());
        return { success: true, data: doc.data() };
      } else {
        console.log('Nenhum dado encontrado para este CPF');
        return { success: false, message: 'Nenhum dado encontrado' };
      }
    } catch (error) {
      console.error('Erro ao carregar dados do Firestore:', error);
      return { success: false, error };
    }
  },

  /**
   * Sincroniza localStorage com Firestore para facilitar a transição
   * @param {string} cpf - CPF do assistido
   */
  syncWithLocalStorage: async function(cpf) {
    try {
      // Obter dados do Firestore
      const result = await this.loadFormData(cpf);

      if (result.success && result.data) {
        // Atualizar localStorage com os dados mais recentes
        Object.entries(result.data).forEach(([key, value]) => {
          if (typeof value === 'string' || typeof value === 'number') {
            localStorage.setItem(key, value);
          }
        });
        console.log('Dados sincronizados com localStorage');
      }
    } catch (error) {
      console.error('Erro na sincronização com localStorage:', error);
    }
  }
};

// Extender o módulo de dados existente
if (FIAP.data) {
  // Modificar saveFormData para usar o Firebase
  const originalSaveFormData = FIAP.data.saveFormData;
  FIAP.data.saveFormData = function(formType, fields, options = {}) {
    // Usar o método original para o localStorage
    const localResult = originalSaveFormData(formType, fields, options);

    // Coletar os dados para Firebase
    const data = {};
    fields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field && field.value) {
        data[fieldId] = field.value;
      }
    });

    // Salvar no Firebase também (de forma assíncrona)
    FIAP.firebase.saveFormData(formType, data)
      .then(result => {
        if (!result.success) {
          console.warn('Falha ao salvar no Firebase, mas dados foram salvos localmente');
        }
      })
      .catch(err => console.error('Erro ao salvar no Firebase:', err));

    return localResult;
  };
}

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

  // Sincronizar dados que possam ter sido salvos offline
  syncOfflineData();
}

// Gerenciar status offline
function handleOfflineStatus() {
  isOnline = false;
  console.log('Aplicativo está offline');
  showError('Você está offline. Os dados serão salvos localmente e sincronizados quando a conexão for restabelecida.', null, { duration: 5000 });
}

// Sincronizar dados offline com o Firebase
async function syncOfflineData() {
  // Verificar se o Firebase está disponível
  if (!FIAP.firebase || !FIAP.firebase.db) return;

  try {
    // Verificar se há dados para sincronizar
    const offlineDataKey = 'fiap_offline_data';
    const offlineData = localStorage.getItem(offlineDataKey);

    if (offlineData) {
      const dataToSync = JSON.parse(offlineData);

      if (Array.isArray(dataToSync) && dataToSync.length > 0) {
        showLoading('Sincronizando dados offline...');

        // Processar cada item
        const batch = FIAP.firebase.db.batch();

        dataToSync.forEach(item => {
          if (item.collection && item.docId && item.data) {
            const docRef = FIAP.firebase.db.collection(item.collection).doc(item.docId);
            batch.set(docRef, item.data, { merge: true });
          }
        });

        await batch.commit();

        // Limpar dados offline após sincronização bem-sucedida
        localStorage.removeItem(offlineDataKey);
        hideLoading();
        showSuccess('Dados offline sincronizados com sucesso!', null, { duration: 3000 });
      }
    }
  } catch (error) {
    console.error('Erro ao sincronizar dados offline:', error);
    hideLoading();
    showError('Erro ao sincronizar dados offline. Tente novamente mais tarde.', null, { duration: 3000 });
  }
}

// Salvar dados offline para sincronização posterior
function saveDataForOfflineSync(collection, docId, data) {
  try {
    const offlineDataKey = 'fiap_offline_data';
    let offlineData = localStorage.getItem(offlineDataKey);

    let dataArray = [];
    if (offlineData) {
      dataArray = JSON.parse(offlineData);
      if (!Array.isArray(dataArray)) dataArray = [];
    }

    // Adicionar novo item
    dataArray.push({
      collection,
      docId,
      data,
      timestamp: Date.now()
    });

    // Salvar de volta no localStorage
    localStorage.setItem(offlineDataKey, JSON.stringify(dataArray));

    console.log('Dados salvos para sincronização offline');
  } catch (error) {
    console.error('Erro ao salvar dados para sincronização offline:', error);
  }
}

// Inicializar o Firebase ao carregar a aplicação
document.addEventListener('DOMContentLoaded', function() {
  console.log('Inicializando Firebase...');

  // Verificar estado da conexão
  if (navigator.onLine) {
    console.log('Aplicação online. Firebase pronto para uso.');
    // Sincronizar dados offline pendentes
    if (typeof syncOfflineData === 'function') {
      syncOfflineData();
    }
  } else {
    console.log('Aplicação offline. Dados serão salvos localmente.');
    if (typeof handleOfflineStatus === 'function') {
      handleOfflineStatus();
    }
  }
});
