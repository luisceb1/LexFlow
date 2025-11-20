import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { presentRevenueCatPaywall, isRevenueCatPaywallAvailable } from '../utils/revenueCatPaywall';

export default function PaywallScreen({ navigation }) {
  const { colors } = useTheme();

  useEffect(() => {
    const openPaywall = async () => {
      if (!isRevenueCatPaywallAvailable()) {
        Alert.alert(
          'Módulo no disponible',
          'El módulo nativo de RevenueCat no está disponible.\n\nAsegúrate de ejecutar la app con:\n• npx expo run:ios\n• npx expo run:android\n\nNo funciona en Expo Go.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
        return;
      }

      try {
        await presentRevenueCatPaywall('default');
        // Si el paywall se presenta correctamente, no hacer nada
        // El usuario puede cerrarlo desde el paywall mismo
      } catch (error) {
        const errorMessage = error?.message || 'No se pudo abrir el paywall de RevenueCat.';
        
        // Detectar errores específicos
        let title = 'Error al abrir el paywall';
        let message = errorMessage;
        
        if (errorMessage.includes('OFFERINGS_ERROR') || errorMessage.includes('Error Code 23')) {
          title = 'Error de configuración (Code 23)';
          message = 'Los productos no se pueden obtener de App Store Connect.\n\n' +
                   'Verifica en RevenueCat Dashboard:\n' +
                   '1. Product IDs: mensual, anual, lifetime1\n' +
                   '2. Bundle ID: com.cebr.lexflow\n' +
                   '3. Offering ID: default\n' +
                   '4. Productos aprobados en App Store Connect\n' +
                   '5. Productos en el mismo Subscription Group\n\n' +
                   'Más información: https://rev.cat/why-are-offerings-empty';
        } else if (errorMessage.includes('NO_OFFERING')) {
          title = 'Offering no encontrado';
          message = 'No se encontró el offering configurado.\n\n' +
                   'Verifica en RevenueCat Dashboard que el offering "default" exista y esté marcado como "Current Offering".';
        } else if (errorMessage.includes('NO_PACKAGES')) {
          title = 'Sin paquetes disponibles';
          message = 'El offering no tiene paquetes disponibles.\n\n' +
                   'Verifica en RevenueCat Dashboard que los productos estén asociados al offering.';
        }
        
        Alert.alert(title, message, [{ text: 'OK', onPress: () => navigation.goBack() }]);
      }
    };

    openPaywall();
  }, [navigation]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[styles.text, { color: colors.text }]}>Abriendo paywall...</Text>
      <Text style={[styles.helper, { color: colors.textSecondary }]}>
        Si no aparece nada, asegúrate de ejecutar la app con{' '}
        <Text style={styles.mono}>npx expo run:ios</Text> o <Text style={styles.mono}>run:android</Text>.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    },
  text: {
    marginTop: 16,
      fontSize: 16,
      fontWeight: '600',
    },
  helper: {
    marginTop: 8,
      fontSize: 14,
      textAlign: 'center',
    },
  mono: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
  });

