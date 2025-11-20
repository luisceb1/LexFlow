import { AppState, Platform, BackHandler, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const APP_BLOCKER_KEY = 'appBlocker';
let appBlockerEnabled = false;
let isSessionActive = false;
let appStateSubscription = null;
let backHandler = null;

/**
 * Verifica si el bloqueador de apps está habilitado
 */
export const isAppBlockerEnabled = async () => {
  try {
    const enabled = await AsyncStorage.getItem(APP_BLOCKER_KEY);
    return enabled === 'true';
  } catch (error) {
    return false;
  }
};

/**
 * Inicializa el bloqueador de apps
 */
export const initializeAppBlocker = async () => {
  appBlockerEnabled = await isAppBlockerEnabled();
  
  if (appBlockerEnabled) {
    setupAppBlocker();
  }
};

/**
 * Configura los listeners del bloqueador
 */
const setupAppBlocker = () => {
  // Listener para cambios de estado de la app (iOS y Android)
  appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
  
  // Listener para botón atrás en Android
  if (Platform.OS === 'android') {
    backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
  }
};

/**
 * Maneja cambios de estado de la app
 */
const handleAppStateChange = (nextAppState) => {
  if (appBlockerEnabled && isSessionActive && nextAppState === 'background') {
    // Mostrar alerta cuando la app va a background durante una sesión
    Alert.alert(
      'Sesión activa',
      'Tienes una sesión de trabajo activa. Por favor, vuelve a la app para continuar.',
      [{ text: 'OK' }]
    );
  }
};

/**
 * Maneja el botón atrás en Android
 */
const handleBackPress = () => {
  if (appBlockerEnabled && isSessionActive) {
    Alert.alert(
      'Sesión activa',
      'Tienes una sesión de trabajo activa. No puedes salir de la app en este momento.',
      [{ text: 'OK' }]
    );
    return true; // Prevenir el comportamiento por defecto
  }
  return false;
};

/**
 * Activa el bloqueador para una sesión
 */
export const startSessionBlock = () => {
  isSessionActive = true;
};

/**
 * Desactiva el bloqueador al finalizar una sesión
 */
export const endSessionBlock = () => {
  isSessionActive = false;
};

/**
 * Actualiza el estado del bloqueador
 */
export const updateAppBlocker = async (enabled) => {
  appBlockerEnabled = enabled;
  await AsyncStorage.setItem(APP_BLOCKER_KEY, enabled.toString());
  
  if (enabled) {
    setupAppBlocker();
  } else {
    cleanupAppBlocker();
  }
};

/**
 * Limpia los listeners del bloqueador
 */
const cleanupAppBlocker = () => {
  if (appStateSubscription) {
    appStateSubscription.remove();
    appStateSubscription = null;
  }
  
  if (backHandler) {
    backHandler.remove();
    backHandler = null;
  }
  
  isSessionActive = false;
};

/**
 * Limpia recursos al desmontar
 */
export const cleanup = () => {
  cleanupAppBlocker();
};

