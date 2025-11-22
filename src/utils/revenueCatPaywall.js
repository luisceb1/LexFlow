import { NativeModules, Platform } from 'react-native';

// Módulo nativo que usa el SDK oficial de RevenueCat
// Este módulo expone PaywallViewController (iOS) y PaywallDialog (Android) del SDK de RevenueCat
const RevenueCatPaywallModule = NativeModules.RevenueCatPaywallModule;

/**
 * Presenta el paywall visual de RevenueCat usando el SDK oficial
 * Este módulo nativo usa PaywallViewController (iOS) y PaywallDialog (Android) del SDK de RevenueCat
 * @param {string} offeringIdentifier - ID del offering (por defecto "default")
 * @returns {Promise<{success: boolean, offeringIdentifier?: string, restored?: boolean}>}
 */
export const presentRevenueCatPaywall = async (offeringIdentifier = 'default') => {
  console.log('🚀 Intentando presentar paywall de RevenueCat con offering:', offeringIdentifier);
  
  if (!RevenueCatPaywallModule) {
    const availableModules = Object.keys(NativeModules).filter(name => 
      name.toLowerCase().includes('revenue') || name.toLowerCase().includes('paywall')
    );
    console.error('❌ RevenueCatPaywallModule no encontrado. Módulos relacionados:', availableModules);
    throw new Error(
      'El módulo nativo de RevenueCat no está disponible.\n\n' +
      'Asegúrate de estar usando un development build:\n' +
      '• npx expo run:ios\n' +
      '• npx expo run:android\n\n' +
      'No funciona en Expo Go.'
    );
  }

  if (!RevenueCatPaywallModule.presentPaywall) {
    console.error('❌ El método presentPaywall no está disponible en el módulo');
    throw new Error(
      'El método presentPaywall no está disponible.\n\n' +
      'Asegúrate de que RevenueCatUI esté correctamente instalado en las dependencias nativas.'
    );
  }

  try {
    console.log('✅ Llamando a presentPaywall del SDK de RevenueCat...');
    console.log('📋 Offering identifier:', offeringIdentifier);
    
    // Este método usa PaywallViewController (iOS) o PaywallDialog (Android) del SDK oficial de RevenueCat
    const result = await RevenueCatPaywallModule.presentPaywall(offeringIdentifier);
    console.log('✅ Paywall presentado exitosamente:', result);
    return result;
  } catch (error) {
    console.error('❌ Error presentando paywall de RevenueCat:', error);
    console.error('❌ Error code:', error?.code);
    console.error('❌ Error message:', error?.message);
    console.error('❌ Error completo:', JSON.stringify(error, null, 2));
    
    // Proporcionar mensajes de error más útiles
    if (error?.code === 'NO_OFFERING' || error?.message?.includes('NO_OFFERING')) {
      throw new Error(
        'No se encontró el offering configurado.\n\n' +
        'Verifica en RevenueCat Dashboard:\n' +
        '1. Que exista un offering con ID: "' + offeringIdentifier + '"\n' +
        '2. Que el offering esté marcado como "Current Offering"\n' +
        '3. Que el offering tenga al menos un paquete asociado'
      );
    }
    
    if (error?.code === 'NO_PACKAGES' || error?.message?.includes('NO_PACKAGES')) {
      throw new Error(
        'El offering no tiene paquetes disponibles.\n\n' +
        'Verifica en RevenueCat Dashboard:\n' +
        '1. Que los productos estén creados y aprobados\n' +
        '2. Que los productos estén asociados al offering\n' +
        '3. Que los productos estén en el mismo Subscription Group (iOS)'
      );
    }
    
    throw error;
  }
};

/**
 * Verifica si el módulo de paywall de RevenueCat está disponible
 * Este módulo usa el SDK oficial de RevenueCat (PaywallViewController/PaywallDialog)
 * @returns {boolean}
 */
export const isRevenueCatPaywallAvailable = () => {
  const isAvailable = !!RevenueCatPaywallModule && typeof RevenueCatPaywallModule.presentPaywall === 'function';
  
  if (__DEV__) {
    console.log('🔍 Verificando disponibilidad del paywall de RevenueCat:', {
      moduleExists: !!RevenueCatPaywallModule,
      methodExists: typeof RevenueCatPaywallModule?.presentPaywall === 'function',
      isAvailable,
    });
  }
  
  return isAvailable;
};

