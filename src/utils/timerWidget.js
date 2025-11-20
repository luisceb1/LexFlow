import { NativeModules, Platform } from 'react-native';

const { TimerWidget } = NativeModules;

// Actualizar el widget con el estado actual del temporizador
export const updateTimerWidget = async (timeLeft, isRunning, phase, sessionName = null) => {
  if (TimerWidget) {
    try {
      if (Platform.OS === 'android') {
        TimerWidget.updateWidget(timeLeft, isRunning, phase, sessionName || '');
      } else if (Platform.OS === 'ios') {
        await TimerWidget.updateWidget(timeLeft, isRunning, phase, sessionName || '');
      }
    } catch (error) {
      console.error('Error updating timer widget:', error);
    }
  }
};

// Limpiar el widget cuando el temporizador se detiene
export const clearTimerWidget = async () => {
  if (TimerWidget) {
    try {
      if (Platform.OS === 'android') {
        TimerWidget.clearWidget();
      } else if (Platform.OS === 'ios') {
        await TimerWidget.clearWidget();
      }
    } catch (error) {
      console.error('Error clearing timer widget:', error);
    }
  }
};

