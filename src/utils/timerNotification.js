import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// ID de la notificación persistente
const TIMER_NOTIFICATION_ID = 'timer-active';

// Configurar categoría de notificación con acciones
const NOTIFICATION_CATEGORY = 'TIMER_CONTROLS';

// Configurar las acciones de notificación
export const setupNotificationActions = async () => {
  try {
    await Notifications.setNotificationCategoryAsync(NOTIFICATION_CATEGORY, [
      {
        identifier: 'PAUSE_TIMER',
        buttonTitle: '⏸ Pausar',
        options: {
          opensAppToForeground: false,
        },
      },
      {
        identifier: 'RESUME_TIMER',
        buttonTitle: '▶ Reanudar',
        options: {
          opensAppToForeground: false,
        },
      },
    ]);
  } catch (error) {
    console.error('Error setting up notification actions:', error);
  }
};

// Formatear tiempo para la notificación
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Obtener título de la fase
const getPhaseTitle = (phase, sessionName = null) => {
  if (phase === 'trabajo') {
    return sessionName || 'Trabajo';
  } else if (phase === 'descanso') {
    return 'Descanso';
  } else if (phase === 'descanso-largo') {
    return 'Descanso Largo';
  }
  return 'Trabajo';
};

// Mostrar o actualizar la notificación persistente
export const updateTimerNotification = async ({
  timeLeft,
  phase,
  isRunning,
  sessionName = null,
}) => {
  try {
    const phaseTitle = getPhaseTitle(phase, sessionName);
    const timeFormatted = formatTime(timeLeft);
    const status = isRunning ? '▶ En curso' : '⏸ Pausado';
    
    const actionButton = isRunning ? 'PAUSE_TIMER' : 'RESUME_TIMER';
    
    const notificationContent = {
      title: `${phaseTitle} - ${timeFormatted}`,
      body: status,
      categoryIdentifier: NOTIFICATION_CATEGORY,
      sound: false,
      data: {
        timeLeft,
        phase,
        isRunning,
        sessionName,
      },
    };

    // Configuraciones específicas de Android
    if (Platform.OS === 'android') {
      notificationContent.android = {
        channelId: 'timer-channel',
        priority: Notifications.AndroidNotificationPriority.HIGH,
        sticky: true, // Mantener la notificación visible
        autoCancel: false,
        ongoing: true, // Notificación persistente
      };
    }

    await Notifications.scheduleNotificationAsync({
      identifier: TIMER_NOTIFICATION_ID,
      content: notificationContent,
      trigger: null, // Mostrar inmediatamente
    });
  } catch (error) {
    console.error('Error updating timer notification:', error);
  }
};

// Cancelar la notificación persistente
export const cancelTimerNotification = async () => {
  try {
    await Notifications.cancelScheduledNotificationAsync(TIMER_NOTIFICATION_ID);
    await Notifications.dismissNotificationAsync(TIMER_NOTIFICATION_ID);
  } catch (error) {
    console.error('Error canceling timer notification:', error);
  }
};

// Solicitar permisos de notificación
export const requestNotificationPermissions = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowDisplayInCarPlay: true,
          allowCriticalAlerts: false,
          provideAppNotificationSettings: false,
          allowProvisional: false,
          allowAnnouncements: false,
        },
      });
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.warn('Notification permissions not granted');
      return false;
    }
    
    // Configurar el canal de notificación para Android (requerido para notificaciones persistentes)
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('timer-channel', {
        name: 'Temporizador',
        description: 'Notificaciones del temporizador Pomodoro',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6366f1',
        sound: false,
        enableVibrate: false,
        showBadge: false,
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

