import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
  Platform,
  Modal,
  TextInput,
} from 'react-native';
// Ionicons temporalmente deshabilitado por problemas de compatibilidad
import { useTheme } from '../context/ThemeContext';
import { usePremium } from '../context/PremiumContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { SESSIONS, TIMER_DURATIONS } from '../utils/constants';
import { requestCalendarPermissions } from '../utils/calendarSync';
import { updateAppBlocker } from '../utils/appBlocker';

export default function SettingsScreen({ navigation }) {
  const { colors, theme, updateTheme, isDark } = useTheme();
  const { isPremium, offerings, purchasePackage, restorePurchases, isLoading, presentCustomerCenter } = usePremium();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoStart, setAutoStart] = useState(false);
  const [calendarSync, setCalendarSync] = useState(false);
  const [committedMode, setCommittedMode] = useState(false);
  const [appBlocker, setAppBlocker] = useState(false);
  const [selectedSession, setSelectedSession] = useState('revision-expediente');
  const [customDuration, setCustomDuration] = useState(25); // en minutos
  const [showCustomDurationModal, setShowCustomDurationModal] = useState(false);
  const [tempCustomDuration, setTempCustomDuration] = useState('25');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const notif = await AsyncStorage.getItem('notificationsEnabled');
      const auto = await AsyncStorage.getItem('autoStart');
      const calendar = await AsyncStorage.getItem('calendarSync');
      const committed = await AsyncStorage.getItem('committedMode');
      const blocker = await AsyncStorage.getItem('appBlocker');
      const session = await AsyncStorage.getItem('selectedSession');
      const customDur = await AsyncStorage.getItem('customDuration');

      if (notif !== null) setNotificationsEnabled(notif === 'true');
      if (auto !== null) setAutoStart(auto === 'true');
      if (calendar !== null) setCalendarSync(calendar === 'true');
      if (committed !== null) setCommittedMode(committed === 'true');
      if (blocker !== null) setAppBlocker(blocker === 'true');
      if (session) setSelectedSession(session);
      if (customDur !== null) {
        const minutes = parseInt(customDur, 10);
        if (!isNaN(minutes) && minutes > 0) {
          setCustomDuration(minutes);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSetting = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, value.toString());
    } catch (error) {
      console.error('Error saving setting:', error);
    }
  };

  const handleNotificationToggle = async (value) => {
    if (value) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos', 'Se necesitan permisos de notificación');
        return;
      }
    }
    setNotificationsEnabled(value);
    saveSetting('notificationsEnabled', value);
  };

  const handleAutoStartToggle = (value) => {
    if (!isPremium && value) {
      Alert.alert('Función Premium', 'Esta función requiere suscripción premium');
      return;
    }
    setAutoStart(value);
    saveSetting('autoStart', value);
  };

  const handleCalendarSyncToggle = async (value) => {
    if (!isPremium && value) {
      Alert.alert('Función Premium', 'Esta función requiere suscripción premium');
      return;
    }
    
    if (value) {
      // Solicitar permisos de calendario
      const hasPermission = await requestCalendarPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Permisos necesarios',
          'Se necesitan permisos de calendario para sincronizar sesiones. Por favor, habilítalos en Configuración.'
        );
        return;
      }
    }
    
    setCalendarSync(value);
    saveSetting('calendarSync', value);
  };

  const handleCommittedModeToggle = (value) => {
    if (!isPremium && value) {
      Alert.alert('Función Premium', 'Esta función requiere suscripción premium');
      return;
    }
    setCommittedMode(value);
    saveSetting('committedMode', value);
  };

  const handleAppBlockerToggle = async (value) => {
    if (!isPremium && value) {
      Alert.alert('Función Premium', 'Esta función requiere suscripción premium');
      return;
    }
    setAppBlocker(value);
    saveSetting('appBlocker', value);
    // Actualizar el bloqueador de apps
    await updateAppBlocker(value);
  };

  const handlePurchase = async (packageToPurchase) => {
    if (!packageToPurchase) {
      Alert.alert('Error', 'Paquete no encontrado');
      return;
    }

    const result = await purchasePackage(packageToPurchase);
    if (result.success) {
      Alert.alert('¡Éxito!', 'Suscripción activada correctamente');
    } else if (!result.cancelled) {
      Alert.alert('Error', result.error || 'Error al procesar la compra');
    }
  };

  const handleRestore = async () => {
    const result = await restorePurchases();
    if (result.success) {
      if (result.restored) {
        Alert.alert('Éxito', 'Compras restauradas correctamente');
      } else {
        Alert.alert('Sin compras', 'No se encontraron compras para restaurar en esta cuenta');
      }
    } else {
      Alert.alert('Error', result.error || 'No se encontraron compras para restaurar');
    }
  };

  const handleOpenPaywall = () => {
    navigation.navigate('Paywall');
  };

  const handleManageSubscription = async () => {
    const result = await presentCustomerCenter();
    if (!result.success) {
      Alert.alert('Información', result.error || 'No se pudo abrir la gestión de suscripciones');
    }
  };

  const handleRateApp = () => {
    const url = Platform.select({
      ios: 'https://apps.apple.com/app/idYOUR_APP_ID?action=write-review',
      android: 'market://details?id=com.cebr.lexflow',
    });
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'No se pudo abrir la tienda de aplicaciones');
    });
  };

  const handleShare = () => {
    Alert.alert('Recomendar', 'Función de compartir próximamente disponible');
  };

  const handleContact = () => {
    Linking.openURL('mailto:support@cebr.xyz?subject=LexFlow - Comentarios').catch(() => {
      Alert.alert('Error', 'No se pudo abrir el cliente de correo');
    });
  };

  const handleOpenTerms = () => {
    Linking.openURL('https://cebr.xyz/terminos').catch(() => {
      Alert.alert('Error', 'No se pudo abrir los términos de uso');
    });
  };

  const handleOpenPrivacy = () => {
    Linking.openURL('https://cebr.xyz/aviso-legal').catch(() => {
      Alert.alert('Error', 'No se pudo abrir la política de privacidad');
    });
  };

  // Usar SESSIONS de constants
  const sessions = SESSIONS;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: 20,
      paddingTop: 60,
    },
    section: {
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 16,
    },
    settingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      minHeight: 44,
    },
    settingRowLeft: {
      flex: 1,
      marginRight: 16,
      minWidth: 0,
      maxWidth: '80%',
    },
    settingLabel: {
      fontSize: 16,
      color: colors.text,
      marginBottom: 4,
      flexShrink: 1,
      flexWrap: 'wrap',
    },
    settingDescription: {
      fontSize: 12,
      color: colors.textSecondary,
      flexShrink: 1,
      flexWrap: 'wrap',
    },
    premiumBadge: {
      backgroundColor: colors.premium,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      marginLeft: 8,
    },
    premiumBadgeText: {
      color: '#000',
      fontSize: 10,
      fontWeight: 'bold',
    },
    premiumStatus: {
      backgroundColor: isPremium ? colors.primary : colors.surface,
      padding: 16,
      borderRadius: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: isPremium ? colors.primary : colors.border,
    },
    premiumStatusText: {
      fontSize: 16,
      fontWeight: '600',
      color: isPremium ? '#fff' : colors.text,
      textAlign: 'center',
    },
    subscriptionButton: {
      backgroundColor: colors.primary,
      padding: 16,
      borderRadius: 12,
      marginBottom: 8,
      alignItems: 'center',
    },
    subscriptionButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    subscriptionPrice: {
      color: '#fff',
      fontSize: 12,
      marginTop: 4,
    },
    sessionButton: {
      backgroundColor: colors.surface,
      padding: 12,
      borderRadius: 8,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: selectedSession === sessions.find(s => s.id === 'personalizada')?.id 
        ? colors.primary 
        : colors.border,
    },
    sessionButtonText: {
      fontSize: 14,
      color: colors.text,
      flexShrink: 1,
    },
    sessionTimeText: {
      fontSize: 12,
      color: colors.textSecondary,
      marginLeft: 8,
      flexShrink: 1,
    },
    footer: {
      padding: 20,
      paddingBottom: 40,
      alignItems: 'center',
    },
    footerText: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    linkButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      minHeight: 44,
    },
    linkButtonText: {
      fontSize: 16,
      color: colors.text,
      flex: 1,
      marginRight: 8,
    },
    premiumBanner: {
      backgroundColor: '#059669',
      borderRadius: 16,
      padding: 20,
      marginBottom: 8,
      position: 'relative',
    },
    premiumBannerClose: {
      position: 'absolute',
      top: 12,
      right: 12,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
    },
    premiumBannerCloseText: {
      color: '#fff',
      fontSize: 20,
      fontWeight: '300',
      lineHeight: 20,
    },
    premiumBannerContent: {
      alignItems: 'center',
    },
    premiumBannerHeader: {
      width: '100%',
      alignItems: 'center',
      marginBottom: 8,
    },
    premiumBannerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#fff',
      textAlign: 'center',
      marginBottom: 8,
    },
    premiumBannerSubtitle: {
      fontSize: 14,
      color: '#fff',
      textAlign: 'center',
      marginBottom: 16,
      opacity: 0.9,
    },
    premiumBannerButton: {
      backgroundColor: '#fff',
      paddingHorizontal: 32,
      paddingVertical: 12,
      borderRadius: 24,
      marginBottom: 8,
    },
    premiumBannerButtonText: {
      color: '#059669',
      fontSize: 16,
      fontWeight: '600',
    },
    premiumBannerPrice: {
      fontSize: 12,
      color: '#fff',
      textAlign: 'center',
      opacity: 0.8,
    },
    timeInfoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    timeInfoLabel: {
      fontSize: 16,
      color: colors.text,
    },
    timePill: {
      backgroundColor: colors.surface,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    timePillText: {
      fontSize: 14,
      color: colors.text,
      fontWeight: '500',
    },
    premiumLock: {
      paddingHorizontal: 8,
    },
    premiumLockText: {
      fontSize: 18,
      color: colors.textSecondary,
      opacity: 0.6,
    },
    chevronIcon: {
      fontSize: 20,
      color: colors.textSecondary,
      fontWeight: '300',
    },
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContent: {
      width: '100%',
      maxWidth: 400,
      borderRadius: 16,
      padding: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 5,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    modalDescription: {
      fontSize: 14,
      marginBottom: 20,
    },
    modalInput: {
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      marginBottom: 20,
      textAlign: 'center',
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    modalButton: {
      flex: 1,
      padding: 14,
      borderRadius: 8,
      alignItems: 'center',
    },
    modalButtonCancel: {
      borderWidth: 1,
    },
    modalButtonSave: {
      // backgroundColor se aplica dinámicamente
    },
    modalButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
  });

  // Función para obtener el tiempo de cada sesión
  const getSessionTime = (sessionId) => {
    if (sessionId === 'personalizada') {
      const shortBreakMinutes = Math.floor(TIMER_DURATIONS.SHORT_BREAK / 60);
      return `${customDuration} min trabajo, ${shortBreakMinutes} min descanso`;
    }
    const session = SESSIONS.find(s => s.id === sessionId);
    if (session) {
      const workMinutes = Math.floor(session.duration / 60);
      const shortBreakMinutes = Math.floor(TIMER_DURATIONS.SHORT_BREAK / 60);
      return `${workMinutes} min trabajo, ${shortBreakMinutes} min descanso`;
    }
    return '25 min trabajo, 5 min descanso';
  };

  // Función para obtener el tiempo de descanso largo
  const getLongBreakTime = () => {
    return `${Math.floor(TIMER_DURATIONS.LONG_BREAK / 60)} min`;
  };
  
  // Obtener el tiempo de trabajo de la sesión seleccionada
  const getSelectedWorkTime = () => {
    if (selectedSession === 'personalizada') {
      return `${customDuration} min`;
    }
    const session = SESSIONS.find(s => s.id === selectedSession);
    if (session) {
      return `${Math.floor(session.duration / 60)} min`;
    }
    return '25 min';
  };

  // Guardar duración personalizada
  const handleSaveCustomDuration = () => {
    const minutes = parseInt(tempCustomDuration, 10);
    if (isNaN(minutes) || minutes <= 0) {
      Alert.alert('Error', 'Por favor, ingresa un número válido de minutos (mayor a 0)');
      return;
    }
    if (minutes > 999) {
      Alert.alert('Error', 'La duración máxima es 999 minutos');
      return;
    }
    setCustomDuration(minutes);
    saveSetting('customDuration', minutes);
    setSelectedSession('personalizada');
    saveSetting('selectedSession', 'personalizada');
    setShowCustomDurationModal(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Banner Premium estilo Flow */}
        {!isPremium && (
          <View style={styles.section}>
            <View style={styles.premiumBanner}>
              <TouchableOpacity
                style={styles.premiumBannerClose}
                onPress={() => {
                  // Ocultar banner (podrías guardar esto en AsyncStorage)
                  Alert.alert('Info', 'Puedes acceder a Premium desde cualquier momento en esta sección');
                }}
              >
                <Text style={styles.premiumBannerCloseText}>◉</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.premiumBannerContent}
                onPress={handleOpenPaywall}
                activeOpacity={0.8}
              >
                <View style={styles.premiumBannerHeader}>
                  <Text style={styles.premiumBannerTitle}>Mejora tu enfoque con LexFlow Pro</Text>
                </View>
                <Text style={styles.premiumBannerSubtitle}>
                  Prueba LexFlow Pro gratis durante 14 días. Cancela cuando quieras.
                </Text>
                <TouchableOpacity
                  style={styles.premiumBannerButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleOpenPaywall();
                  }}
                >
                  <Text style={styles.premiumBannerButtonText}>Prueba gratis</Text>
                </TouchableOpacity>
                <Text style={styles.premiumBannerPrice}>
                  Luego desde 1,99 €/mes o 9,99 €/año.
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Estado Premium */}
        {isPremium && (
          <View style={styles.section}>
            <View style={styles.premiumStatus}>
              <Text style={styles.premiumStatusText}>
                ✓ Premium Activado
              </Text>
            </View>
          </View>
        )}

        {/* Sesiones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sesiones</Text>
          
          {/* Mostrar tiempos de trabajo y descanso */}
          <View style={styles.timeInfoRow}>
            <Text style={styles.timeInfoLabel}>Duración de trabajo:</Text>
            <View style={styles.timePill}>
              <Text style={styles.timePillText}>{getSelectedWorkTime()}</Text>
            </View>
            <Text style={[styles.timeInfoLabel, { fontSize: 12, marginLeft: 8, opacity: 0.7 }]}>
              (según ciclo seleccionado)
            </Text>
          </View>
          
          <View style={styles.timeInfoRow}>
            <Text style={styles.timeInfoLabel}>Duración de pausa:</Text>
            <View style={styles.timePill}>
              <Text style={styles.timePillText}>
                {Math.floor(TIMER_DURATIONS.SHORT_BREAK / 60)}, {Math.floor(TIMER_DURATIONS.LONG_BREAK / 60)} min
              </Text>
            </View>
          </View>
          
          <View style={styles.timeInfoRow}>
            <Text style={styles.timeInfoLabel}>Ciclo:</Text>
            {!isPremium && (
              <View style={styles.premiumLock}>
                <Text style={styles.premiumLockText}>◐</Text>
              </View>
            )}
            {isPremium && (
              <View style={styles.timePill}>
                <Text style={styles.timePillText}>4 flows → descanso largo</Text>
              </View>
            )}
          </View>

          {sessions.map((session) => (
            <TouchableOpacity
              key={session.id}
              style={[
                styles.sessionButton,
                selectedSession === session.id && { borderColor: colors.primary },
              ]}
              onPress={() => {
                if (session.premium && !isPremium) {
                  Alert.alert('Función Premium', 'Esta sesión requiere suscripción premium');
                } else if (session.id === 'personalizada') {
                  // Si es sesión personalizada, abrir modal para configurar duración
                  setTempCustomDuration(customDuration.toString());
                  setShowCustomDurationModal(true);
                } else {
                  setSelectedSession(session.id);
                  saveSetting('selectedSession', session.id);
                }
              }}
              onLongPress={() => {
                // Permitir editar sesión personalizada con long press también
                if (session.id === 'personalizada' && isPremium) {
                  setTempCustomDuration(customDuration.toString());
                  setShowCustomDurationModal(true);
                }
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, flexShrink: 1, marginRight: 8 }}>
                  <Text style={styles.sessionButtonText} numberOfLines={1} ellipsizeMode="tail">{session.name}</Text>
                  {session.premium && (
                    <View style={styles.premiumBadge}>
                      <Text style={styles.premiumBadgeText}>PREMIUM</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.sessionTimeText} numberOfLines={1} ellipsizeMode="tail">{getSessionTime(session.id)}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Ciclos (Premium) */}
        {isPremium && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ciclos</Text>
            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingRowLeft}>
                <Text style={styles.settingLabel}>Configurar Ciclos</Text>
                <Text style={styles.settingDescription}>
                  Personaliza la duración de trabajo y descanso
                </Text>
              </View>
              <Text style={styles.chevronIcon}>›</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Auto-inicio */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Timer</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingRowLeft}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 }}>
                <Text style={[styles.settingLabel, { flexShrink: 1 }]}>Iniciar automáticamente</Text>
                {!isPremium && (
                  <View style={styles.premiumBadge}>
                    <Text style={styles.premiumBadgeText}>PREMIUM</Text>
                  </View>
                )}
              </View>
              <Text style={styles.settingDescription} numberOfLines={2}>
                Inicia pausas y periodos automáticamente
              </Text>
            </View>
            <Switch
              value={autoStart}
              onValueChange={handleAutoStartToggle}
              disabled={!isPremium}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
        </View>

        {/* Notificaciones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notificaciones</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingRowLeft}>
              <Text style={styles.settingLabel} numberOfLines={2}>Activar Notificaciones</Text>
              <Text style={styles.settingDescription} numberOfLines={2}>
                Recibe alertas al completar sesiones
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
        </View>

        {/* Aspecto */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aspecto</Text>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => {
              const nextTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
              updateTheme(nextTheme);
            }}
          >
            <View style={styles.settingRowLeft}>
              <Text style={styles.settingLabel} numberOfLines={1}>Tema</Text>
              <Text style={styles.settingDescription} numberOfLines={1}>
                {theme === 'light' ? 'Claro' : theme === 'dark' ? 'Oscuro' : 'Sistema'}
              </Text>
            </View>
            <Text style={styles.chevronIcon}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Sincronizar con Calendario (Premium) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sincronización</Text>
          <TouchableOpacity 
            style={styles.settingRow}
            onPress={() => {
              if (!isPremium) {
                Alert.alert('Función Premium', 'Esta función requiere suscripción premium');
              }
            }}
            disabled={isPremium}
          >
            <View style={styles.settingRowLeft}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 }}>
                <Text style={[styles.settingLabel, { flexShrink: 1 }]} numberOfLines={2}>Sincronizar con Calendario</Text>
                {!isPremium && (
                  <View style={styles.premiumBadge}>
                    <Text style={styles.premiumBadgeText}>PREMIUM</Text>
                  </View>
                )}
              </View>
              <Text style={styles.settingDescription} numberOfLines={2}>
                Registra sesiones en tu calendario
              </Text>
            </View>
            {isPremium && (
              <Switch
                value={calendarSync}
                onValueChange={handleCalendarSyncToggle}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Modo Comprometido (Premium) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Productividad</Text>
          <TouchableOpacity 
            style={styles.settingRow}
            onPress={() => {
              if (!isPremium) {
                Alert.alert('Función Premium', 'Esta función requiere suscripción premium');
              }
            }}
            disabled={isPremium}
          >
            <View style={styles.settingRowLeft}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 }}>
                <Text style={[styles.settingLabel, { flexShrink: 1 }]} numberOfLines={2}>Modo Comprometido</Text>
                {!isPremium && (
                  <View style={styles.premiumBadge}>
                    <Text style={styles.premiumBadgeText}>PREMIUM</Text>
                  </View>
                )}
              </View>
              <Text style={styles.settingDescription} numberOfLines={2}>
                Bloquea la cancelación de sesiones activas
              </Text>
            </View>
            {isPremium && (
              <Switch
                value={committedMode}
                onValueChange={handleCommittedModeToggle}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            )}
          </TouchableOpacity>

          {/* Bloqueador de Apps (Premium) */}
          <TouchableOpacity 
            style={styles.settingRow}
            onPress={() => {
              if (!isPremium) {
                Alert.alert('Función Premium', 'Esta función requiere suscripción premium');
              }
            }}
            disabled={isPremium}
          >
            <View style={styles.settingRowLeft}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 }}>
                <Text style={[styles.settingLabel, { flexShrink: 1 }]} numberOfLines={2}>Bloqueador de Apps</Text>
                {!isPremium && (
                  <View style={styles.premiumBadge}>
                    <Text style={styles.premiumBadgeText}>PREMIUM</Text>
                  </View>
                )}
              </View>
              <Text style={styles.settingDescription} numberOfLines={2}>
                Limita el acceso a otras apps durante sesiones
              </Text>
            </View>
            {isPremium && (
              <Switch
                value={appBlocker}
                onValueChange={handleAppBlockerToggle}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Modal para configurar duración personalizada */}
        <Modal
          visible={showCustomDurationModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowCustomDurationModal(false)}
        >
          <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
            <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Configurar Sesión Personalizada
              </Text>
              <Text style={[styles.modalDescription, { color: colors.textSecondary }]}>
                Ingresa la duración en minutos para tu sesión personalizada
              </Text>
              <TextInput
                style={[styles.modalInput, { 
                  backgroundColor: colors.surface, 
                  color: colors.text,
                  borderColor: colors.border 
                }]}
                value={tempCustomDuration}
                onChangeText={setTempCustomDuration}
                keyboardType="number-pad"
                placeholder="Ej: 30"
                placeholderTextColor={colors.textSecondary}
                maxLength={3}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel, { borderColor: colors.border }]}
                  onPress={() => setShowCustomDurationModal(false)}
                >
                  <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonSave, { backgroundColor: colors.primary }]}
                  onPress={handleSaveCustomDuration}
                >
                  <Text style={[styles.modalButtonText, { color: '#fff' }]}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Enlaces */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información</Text>
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate('About')}
          >
            <Text style={styles.linkButtonText} numberOfLines={2}>Sobre la App</Text>
            <Text style={styles.chevronIcon}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate('HowItWorks')}
          >
            <Text style={styles.linkButtonText} numberOfLines={2}>Cómo Funciona</Text>
            <Text style={styles.chevronIcon}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkButton} onPress={handleShare}>
            <Text style={styles.linkButtonText} numberOfLines={2}>Recomendar</Text>
            <Text style={styles.chevronIcon}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkButton} onPress={handleManageSubscription}>
            <Text style={styles.linkButtonText} numberOfLines={2}>Gestionar Suscripción</Text>
            <Text style={styles.chevronIcon}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkButton} onPress={handleRestore}>
            <Text style={styles.linkButtonText} numberOfLines={2}>Restaurar Compras</Text>
            <Text style={styles.chevronIcon}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkButton} onPress={handleRateApp}>
            <Text style={styles.linkButtonText} numberOfLines={2}>Califica la App</Text>
            <Text style={styles.chevronIcon}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkButton} onPress={handleContact}>
            <Text style={styles.linkButtonText} numberOfLines={2}>Comentarios al Desarrollador</Text>
            <Text style={styles.chevronIcon}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkButton} onPress={handleOpenTerms}>
            <Text style={styles.linkButtonText} numberOfLines={2}>Términos de Uso</Text>
            <Text style={styles.chevronIcon}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkButton} onPress={handleOpenPrivacy}>
            <Text style={styles.linkButtonText} numberOfLines={2}>Política de Privacidad</Text>
            <Text style={styles.chevronIcon}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Desarrollado por cebr.xyz</Text>
        </View>
      </ScrollView>
    </View>
  );
}

