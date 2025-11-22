import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Platform, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useSubscription } from '../context/SubscriptionProvider';
import { usePremium } from '../context/PremiumContext';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import Purchases from 'react-native-purchases';
import { SubscriptionService } from '../utils/subscriptionService';

export default function PaywallScreen({ navigation }) {
  const { colors } = useTheme();
  const { sincronizarConRevenueCat } = useSubscription();
  const { refreshCustomerInfo } = usePremium();
  const [cargando, setCargando] = useState(false);
  const [paquetes, setPaquetes] = useState([]);

  const actualizarDesdeRevenueCat = async (customerInfo) => {
    // Actualizar SubscriptionProvider
    await sincronizarConRevenueCat();
    // Actualizar PremiumContext para desbloquear funciones premium
    await refreshCustomerInfo();
  };

  const mostrarPaywallRevenueCat = async () => {
    try {
      setCargando(true);
      // Mostrar el paywall visual de RevenueCat
      const resultado = await RevenueCatUI.presentPaywall();
      
      switch (resultado) {
        case PAYWALL_RESULT.PURCHASED:
          // El usuario compró, actualizar estado
          const customerInfo = await SubscriptionService.obtenerInfoCliente();
          
          // Actualizar ambos contextos para desbloquear funciones premium
          await actualizarDesdeRevenueCat(customerInfo);
          
          // Verificar que el entitlement esté activo
          const hasEntitlement = customerInfo?.entitlements?.active?.['LexFlow Pro'] !== undefined;
          
          if (hasEntitlement) {
            Alert.alert('¡Éxito!', 'Tu suscripción se ha activado correctamente. Las funciones premium ya están disponibles.');
          } else {
            Alert.alert('Compra completada', 'Tu compra se ha procesado. Las funciones premium se activarán en breve.');
          }
          
          navigation.goBack();
          break;
        case PAYWALL_RESULT.CANCELLED:
          // Usuario canceló, volver atrás
          navigation.goBack();
          break;
        case PAYWALL_RESULT.NOT_AVAILABLE:
          // Paywall no disponible, mostrar paquetes manualmente
          await cargarPaquetesRevenueCat();
          break;
        case PAYWALL_RESULT.ERROR:
          // Error, mostrar paquetes manualmente como fallback
          console.error('Error mostrando paywall de RevenueCat');
          await cargarPaquetesRevenueCat();
          break;
        default:
          await cargarPaquetesRevenueCat();
          break;
      }
    } catch (error) {
      console.error('Error mostrando paywall de RevenueCat:', error);
      // Fallback: mostrar paquetes manualmente
      await cargarPaquetesRevenueCat();
    } finally {
      setCargando(false);
    }
  };

  const cargarPaquetesRevenueCat = async () => {
    try {
      setCargando(true);
      // Obtener paquetes directamente de RevenueCat
      const offerings = await Purchases.getOfferings();
      
      if (offerings.current !== null && offerings.current.availablePackages.length > 0) {
        // Mostrar los paquetes de RevenueCat
        setPaquetes(offerings.current.availablePackages);
      } else {
        // Si no hay paquetes disponibles, mostrar mensaje
        setPaquetes([]);
        Alert.alert(
          'Productos no disponibles',
          'Los productos de suscripción no están disponibles en este momento. Por favor, inténtalo más tarde.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error('Error cargando paquetes de RevenueCat:', error);
      Alert.alert(
        'Error',
        'No se pudieron cargar los productos. Por favor, verifica tu conexión e inténtalo de nuevo.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } finally {
      setCargando(false);
    }
  };

  const comprarPaquete = async (paquete) => {
    try {
      setCargando(true);
      const { customerInfo } = await Purchases.purchasePackage(paquete);
      
      // Actualizar ambos contextos para desbloquear funciones premium
      await actualizarDesdeRevenueCat(customerInfo);
      
      // Verificar que el entitlement esté activo
      const hasEntitlement = customerInfo?.entitlements?.active?.['LexFlow Pro'] !== undefined;
      
      if (hasEntitlement) {
        Alert.alert('¡Éxito!', 'Tu suscripción se ha activado correctamente. Las funciones premium ya están disponibles.');
      } else {
        Alert.alert('Compra completada', 'Tu compra se ha procesado. Las funciones premium se activarán en breve.');
      }
      
      navigation.goBack();
    } catch (error) {
      if (error.userCancelled) {
        // Usuario canceló, no hacer nada
        return;
        }
      Alert.alert('Error', error.message || 'No se pudo completar la compra');
    } finally {
      setCargando(false);
      }
    };

  useEffect(() => {
    mostrarPaywallRevenueCat();
  }, []);

  if (cargando && paquetes.length === 0) {
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.text, { color: colors.text }]}>Cargando...</Text>
    </View>
  );
  }

  if (paquetes.length > 0) {
    return (
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>Elige tu plan</Text>
          {paquetes.map((paquete, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.packageCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => comprarPaquete(paquete)}
              disabled={cargando}
            >
              <Text style={[styles.packageTitle, { color: colors.text }]}>
                {paquete.packageType}
              </Text>
              <Text style={[styles.packagePrice, { color: colors.primary }]}>
                {paquete.product.priceString}
              </Text>
              {paquete.product.description && (
                <Text style={[styles.packageDescription, { color: colors.textSecondary }]}>
                  {paquete.product.description}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
  },
  content: {
    padding: 20,
    },
  text: {
    marginTop: 16,
      fontSize: 16,
      fontWeight: '600',
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
      textAlign: 'center',
    },
  packageCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  packageTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  packagePrice: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  packageDescription: {
    fontSize: 14,
    marginTop: 4,
    },
  });

