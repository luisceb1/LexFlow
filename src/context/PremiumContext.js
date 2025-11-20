import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Platform, Alert } from 'react-native';

// Importación segura de react-native-purchases (no disponible en Expo Go)
let Purchases = null;
let LOG_LEVEL = null;

try {
  const PurchasesModule = require('react-native-purchases');
  Purchases = PurchasesModule.default || PurchasesModule;
  LOG_LEVEL = PurchasesModule.LOG_LEVEL;
} catch (error) {
  // Módulo no disponible (probablemente en Expo Go)
  console.warn('react-native-purchases no está disponible:', error.message);
  Purchases = null;
  LOG_LEVEL = null;
}

// Entitlement identifier - debe coincidir con el configurado en RevenueCat Dashboard
const ENTITLEMENT_IDENTIFIER = 'LexFlow Pro';

// API Keys de RevenueCat
// IMPORTANTE: Para testing en sandbox, usa la test key
// Para producción, usa las API keys de producción
const REVENUECAT_API_KEY = Platform.select({
  ios: 'appl_nZkwoLdHITxMNpqbLxGdcTwjCmT', // iOS API key (funciona en sandbox y producción)
  android: 'test_NfOKFCOnSvtwdIBTfbKXrdWhQgL', // Android API key
    });

const PremiumContext = createContext();

export const usePremium = () => {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error('usePremium must be used within PremiumProvider');
  }
  return context;
};

export const PremiumProvider = ({ children }) => {
  console.log('🎬 PremiumProvider montado');
  const [isPremium, setIsPremium] = useState(false);
  const [offerings, setOfferings] = useState(null);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Actualizar información del cliente y estado premium
  const updateCustomerInfo = useCallback((info) => {
    setCustomerInfo(info);
    
    // Verificar si el usuario tiene el entitlement activo
    const hasEntitlement = info?.entitlements?.active?.[ENTITLEMENT_IDENTIFIER] !== undefined;
    setIsPremium(hasEntitlement);

    if (__DEV__) {
      console.log('Customer Info actualizado:', {
        isPremium: hasEntitlement,
        activeSubscriptions: Object.keys(info?.entitlements?.active || {}),
        allPurchasedProductIdentifiers: info?.allPurchasedProductIdentifiers || [],
      });
    }
  }, []);

  // Inicializar RevenueCat
  const initializeRevenueCat = useCallback(async () => {
    console.log('🚀 Iniciando RevenueCat...');
    try {
      setIsLoading(true);
      setError(null);

      // Verificar si Purchases está disponible (no funciona en Expo Go)
      if (!Purchases || typeof Purchases.configure !== 'function') {
        console.error('❌ RevenueCat no disponible - Purchases es null o no tiene configure');
        throw new Error('RevenueCat no disponible en Expo Go');
      }

      // Habilitar logs de debug en desarrollo
      if (__DEV__ && LOG_LEVEL) {
        await Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      }

      // Configurar RevenueCat con la API key
      await Purchases.configure({
        apiKey: REVENUECAT_API_KEY,
      });

      // Obtener información del cliente
      const customerInfoResult = await Purchases.getCustomerInfo();
      updateCustomerInfo(customerInfoResult);

      // Obtener offerings disponibles
      let offeringsResult;
      try {
        offeringsResult = await Purchases.getOfferings();
      } catch (offeringsError) {
        console.error('❌ Error obteniendo offerings:', offeringsError);
        throw offeringsError;
      }

      // Verificar si hay un offering "default" específico y usarlo si existe
      if (offeringsResult?.all) {
        const defaultOffering = offeringsResult.all['default'];
        if (defaultOffering) {
          // Si el current no es "default", usar "default" explícitamente
          if (offeringsResult.current?.identifier !== 'default') {
            offeringsResult = {
              ...offeringsResult,
              current: defaultOffering,
            };
          }
        }
      }

      setOfferings(offeringsResult);

      // Configurar listener para actualizaciones de customer info
      // Se activa cuando hay cambios en suscripciones (renovaciones, cancelaciones, etc.)
      Purchases.addCustomerInfoUpdateListener((info) => {
        updateCustomerInfo(info);
      });
    } catch (error) {
      console.error('❌ Error inicializando RevenueCat:', error);
      console.error('❌ Error completo:', JSON.stringify(error, null, 2));
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error underlyingError:', error.underlyingError);

      setError(error.message || 'Error al inicializar RevenueCat');

      // Mostrar alert con detalles del error para debugging
      if (__DEV__) {
        Alert.alert(
          '❌ Error RevenueCat',
          `Error: ${error.message || 'Desconocido'}\n\n` +
          `Code: ${error.code || 'N/A'}\n\n` +
          `Este error generalmente significa:\n` +
          `1. Los productos no están aprobados en App Store Connect\n` +
          `2. Los productos no están en el mismo Subscription Group\n` +
          `3. El Bundle ID no coincide\n` +
          `4. Los productos no están disponibles en sandbox\n\n` +
          `Verifica en RevenueCat Dashboard que los productos estén correctamente configurados.`,
          [{ text: 'OK' }]
        );
      }
      
      // En caso de error, intentar funcionar sin RevenueCat
      // Esto puede pasar si no hay conexión o si el módulo nativo no está disponible
      if (error.code === 'MODULE_NOT_FOUND' || error.message?.includes('expo') || error.message?.includes('Expo Go')) {
        console.warn('RevenueCat no disponible - probablemente estás en Expo Go. Crea un development build.');
        // Establecer offerings como null para que el código pueda manejar este caso
        setOfferings(null);
      } else if (error.message?.includes('configuration') || error.message?.includes('could not be fetched')) {
        console.warn('⚠️ Error de configuración de RevenueCat');
        console.warn('⚠️ Verifica que:');
        console.warn('   1. Los productos estén "Ready to Submit" o "Approved" en App Store Connect');
        console.warn('   2. Los productos estén en el mismo Subscription Group (para suscripciones)');
        console.warn('   3. El Bundle ID en RevenueCat coincida con el de la app (com.cebr.lexflow)');
        console.warn('   4. Los productos estén correctamente importados en RevenueCat Dashboard');
        setOfferings(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [updateCustomerInfo]);

  // Inicializar al montar el componente
  useEffect(() => {
    initializeRevenueCat();
  }, [initializeRevenueCat]);

  // Comprar un paquete
  const purchasePackage = useCallback(async (packageToPurchase) => {
    if (!packageToPurchase) {
      return {
        success: false,
        error: 'Paquete no válido',
      };
    }

    // Verificar si RevenueCat está disponible
    if (!Purchases || typeof Purchases.purchasePackage !== 'function') {
      return {
        success: false,
        error: 'RevenueCat no disponible. Necesitas crear un development build con: npx expo prebuild',
      };
    }

    try {
      setIsLoading(true);
      setError(null);

      const { customerInfo: newCustomerInfo } = await Purchases.purchasePackage(packageToPurchase);
      updateCustomerInfo(newCustomerInfo);

      return { success: true };
    } catch (error) {
      // El usuario canceló la compra
      if (error.userCancelled) {
        return {
          success: false,
          cancelled: true,
          error: 'Compra cancelada',
        };
      }

      // Error de pago
      if (error.code === 'PURCHASE_NOT_ALLOWED') {
        return {
          success: false,
          error: 'Las compras no están permitidas en este dispositivo',
        };
      }

      // Error de red
      if (error.code === 'NETWORK_ERROR') {
        return {
          success: false,
          error: 'Error de conexión. Verifica tu conexión a internet',
        };
      }

      // Otro error
      console.error('Error en la compra:', error);
      return {
        success: false,
        error: error.message || 'Error al procesar la compra',
      };
    } finally {
      setIsLoading(false);
    }
  }, [updateCustomerInfo]);

  // Restaurar compras
  const restorePurchases = useCallback(async () => {
    // Verificar si RevenueCat está disponible
    if (!Purchases || typeof Purchases.restorePurchases !== 'function') {
      return {
        success: false,
        error: 'RevenueCat no disponible. Necesitas crear un development build con: npx expo prebuild',
      };
    }

    try {
      setIsLoading(true);
      setError(null);

      const customerInfoResult = await Purchases.restorePurchases();
      updateCustomerInfo(customerInfoResult);

      // Verificar si se restauraron compras
      const hasActiveEntitlement = customerInfoResult?.entitlements?.active?.[ENTITLEMENT_IDENTIFIER] !== undefined;
      
      return {
        success: true,
        restored: hasActiveEntitlement,
      };
    } catch (error) {
      console.error('Error restaurando compras:', error);
      
      return {
        success: false,
        error: error.message || 'Error al restaurar las compras',
      };
    } finally {
      setIsLoading(false);
    }
  }, [updateCustomerInfo]);

  // Abrir Customer Center (gestión de suscripciones)
  const presentCustomerCenter = useCallback(async () => {
    // Verificar si RevenueCat está disponible
    if (!Purchases || typeof Purchases.showManageSubscriptions !== 'function') {
      return {
        success: false,
        error: 'RevenueCat no disponible. Necesitas crear un development build con: npx expo prebuild',
      };
    }

    try {
      await Purchases.showManageSubscriptions();
      return { success: true };
    } catch (error) {
      console.error('Error abriendo Customer Center:', error);
      
      // En iOS, si no hay suscripciones activas, puede fallar
      // En Android, siempre debería funcionar
      return {
        success: false,
        error: error.message || 'No se pudo abrir la gestión de suscripciones',
      };
    }
  }, []);

  // Obtener información del producto desde el package
  const getPackageInfo = useCallback((pkg) => {
    return {
      identifier: pkg.identifier,
      product: pkg.product,
      offeringIdentifier: pkg.offeringIdentifier,
    };
  }, []);

  // Verificar si un producto específico está activo
  const isProductActive = useCallback((productIdentifier) => {
    if (!customerInfo) return false;
    
    return customerInfo.allPurchasedProductIdentifiers.includes(productIdentifier);
  }, [customerInfo]);

  // Obtener el offering actual (default)
  const getCurrentOffering = useCallback(() => {
    return offerings?.current || null;
  }, [offerings]);

  // Obtener paquetes disponibles del offering actual
  const getAvailablePackages = useCallback(() => {
    try {
      const currentOffering = getCurrentOffering();
      if (!currentOffering) {
        if (__DEV__) {
          console.warn('No hay offering actual disponible');
        }
        return [];
      }
      const packages = currentOffering.availablePackages || [];
      console.log('📦 getAvailablePackages - Paquetes:', packages.length);
      packages.forEach((pkg, index) => {
        console.log(`  ${index + 1}. ${pkg.identifier} - ${pkg.product?.identifier} - ${pkg.product?.priceString}`);
      });
      return packages;
    } catch (error) {
      console.error('Error obteniendo paquetes disponibles:', error);
      return [];
    }
  }, [getCurrentOffering]);

  return (
    <PremiumContext.Provider
      value={{
        isPremium,
        offerings,
        customerInfo,
        isLoading,
        error,
        purchasePackage,
        restorePurchases,
        presentCustomerCenter,
        getPackageInfo,
        isProductActive,
        getCurrentOffering,
        getAvailablePackages,
        refreshCustomerInfo: async () => {
          try {
            if (!Purchases || typeof Purchases.getCustomerInfo !== 'function') {
              console.warn('RevenueCat no disponible para refrescar customer info');
              return;
            }
            const info = await Purchases.getCustomerInfo();
            updateCustomerInfo(info);
          } catch (error) {
            console.error('Error refrescando customer info:', error);
          }
        },
      }}
    >
      {children}
    </PremiumContext.Provider>
  );
};
