import { NativeModules, Platform } from 'react-native';

const { RevenueCatPaywallModule } = NativeModules;

// Debug: Listar todos los módulos nativos disponibles
if (__DEV__) {
  console.log('📦 Módulos nativos disponibles:', Object.keys(NativeModules));
  console.log('🎯 RevenueCatPaywallModule disponible:', !!RevenueCatPaywallModule);
  if (RevenueCatPaywallModule) {
    console.log('✅ Métodos del módulo:', Object.keys(RevenueCatPaywallModule));
  }
}

/**
 * Presenta el paywall visual de RevenueCat
 * @param {string} offeringIdentifier - ID del offering (por defecto "default")
 * @returns {Promise<{success: boolean, offeringIdentifier?: string, restored?: boolean}>}
 */
export const presentRevenueCatPaywall = async (offeringIdentifier = 'default') => {
  console.log('🚀 Intentando presentar paywall con offering:', offeringIdentifier);
  console.log('🔍 RevenueCatPaywallModule disponible:', !!RevenueCatPaywallModule);
  
  if (!RevenueCatPaywallModule) {
    const availableModules = Object.keys(NativeModules).filter(name => 
      name.toLowerCase().includes('revenue') || name.toLowerCase().includes('paywall')
    );
    console.error('❌ RevenueCatPaywallModule no encontrado. Módulos relacionados:', availableModules);
    throw new Error('RevenueCat Paywall Module no está disponible. Asegúrate de estar usando un development build.');
  }

  if (!RevenueCatPaywallModule.presentPaywall) {
    console.error('❌ El método presentPaywall no está disponible en el módulo');
    throw new Error('El método presentPaywall no está disponible en RevenueCatPaywallModule.');
  }

  try {
    console.log('✅ Llamando a presentPaywall...');
    const result = await RevenueCatPaywallModule.presentPaywall(offeringIdentifier);
    console.log('✅ Paywall presentado exitosamente:', result);
    return result;
  } catch (error) {
    console.error('❌ Error presentando paywall de RevenueCat:', error);
    console.error('❌ Error completo:', JSON.stringify(error, null, 2));
    throw error;
  }
};

/**
 * Verifica si el módulo de paywall está disponible
 * @returns {boolean}
 */
export const isRevenueCatPaywallAvailable = () => {
  const isAvailable = !!RevenueCatPaywallModule && !!RevenueCatPaywallModule.presentPaywall;
  if (__DEV__) {
    console.log('🔍 Verificando disponibilidad del paywall:', {
      moduleExists: !!RevenueCatPaywallModule,
      methodExists: !!RevenueCatPaywallModule?.presentPaywall,
      isAvailable,
    });
  }
  return isAvailable;
};

