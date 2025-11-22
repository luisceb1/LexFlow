import { Platform } from 'react-native';
import Purchases from 'react-native-purchases';

export class SubscriptionService {
  static initialized = false;

  static PRODUCT_IDS = {
    PRO_MENSUAL: 'calculaboralmensual',
    PRO_ANUAL: 'calculaboralanual',
    PRO_LIFETIME: 'pro_lifetime', // Si tienes este producto, actualiza el ID aquí
  };

  static async inicializar(apiKey) {
    if (this.initialized) return;

    // API key de RevenueCat para iOS
    // Puedes obtenerla en https://app.revenuecat.com
    const revenueCatApiKey = apiKey || Platform.select({
      ios: 'appl_nZkwoLdHITxMNpqbLxGdcTwjCmT', // API key de iOS
      android: 'test_NfOKFCOnSvtwdIBTfbKXrdWhQgL', // API key de Android
    });

    if (!revenueCatApiKey || revenueCatApiKey.includes('tu_api_key')) {
      console.warn('⚠️ RevenueCat API key no configurada. Usando modo de prueba.');
      // En desarrollo, puedes continuar sin API key
      this.initialized = true;
      return;
    }

    await Purchases.configure({ apiKey: revenueCatApiKey });
    this.initialized = true;
  }

  static async obtenerInfoCliente() {
    return await Purchases.getCustomerInfo();
  }
}

