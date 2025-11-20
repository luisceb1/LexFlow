import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
// Ionicons temporalmente deshabilitado por problemas de compatibilidad
import { useTheme } from '../context/ThemeContext';
import { usePremium } from '../context/PremiumContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { saveSessionEvent } from '../utils/statistics';
import { SESSIONS, DEFAULT_SESSION_DURATION } from '../utils/constants';
import {
  updateTimerNotification,
  cancelTimerNotification,
  requestNotificationPermissions,
  setupNotificationActions,
} from '../utils/timerNotification';
import { updateTimerWidget, clearTimerWidget } from '../utils/timerWidget';
import { syncSessionToCalendar } from '../utils/calendarSync';
import { startSessionBlock, endSessionBlock, initializeAppBlocker } from '../utils/appBlocker';

const { width } = Dimensions.get('window');

const SHORT_BREAK = 5 * 60; // 5 minutos
const LONG_BREAK = 15 * 60; // 15 minutos

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function TimerScreen() {
  const { colors } = useTheme();
  const { isPremium } = usePremium();
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [currentSessionDuration, setCurrentSessionDuration] = useState(DEFAULT_SESSION_DURATION);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_SESSION_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('trabajo');
  const [cycles, setCycles] = useState(0);
  const [autoStart, setAutoStart] = useState(false);
  const [committedMode, setCommittedMode] = useState(false);
  const intervalRef = useRef(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const sessionStartTime = useRef(null);
  const sessionStartTimeLeft = useRef(null);
  const previousPhase = useRef(currentPhase);
  const notificationIntervalRef = useRef(null);
  const timeLeftRef = useRef(timeLeft);
  const lastMinuteRef = useRef(Math.floor(timeLeft / 60));

  useEffect(() => {
    loadSettings();
    
    // Configurar permisos y acciones de notificación
    const setupNotifications = async () => {
      await requestNotificationPermissions();
      await setupNotificationActions();
    };
    setupNotifications();
    
    // Inicializar bloqueador de apps
    initializeAppBlocker();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      // Cancelar notificación al desmontar si el timer no está corriendo
      if (!isRunning) {
        cancelTimerNotification();
      }
      // Finalizar bloqueo de sesión
      endSessionBlock();
    };
  }, []);
  
  // Listener para cambios en la sesión seleccionada
  useEffect(() => {
    const checkSessionChange = async () => {
      try {
        const selectedSession = await AsyncStorage.getItem('selectedSession');
        if (selectedSession) {
          if (selectedSession === 'personalizada') {
            // Cargar duración personalizada
            const customDur = await AsyncStorage.getItem('customDuration');
            const minutes = customDur ? parseInt(customDur, 10) : 25;
            const duration = (isNaN(minutes) || minutes <= 0 ? 25 : minutes) * 60;
            if (selectedSessionId !== 'personalizada' || currentSessionDuration !== duration) {
              setSelectedSessionId('personalizada');
              setCurrentSessionDuration(duration);
              if (currentPhase === 'trabajo' && !isRunning) {
                setTimeLeft(duration);
              }
            }
          } else {
            const session = SESSIONS.find(s => s.id === selectedSession);
            if (session && session.id !== selectedSessionId) {
              setSelectedSessionId(session.id);
              setCurrentSessionDuration(session.duration);
              if (currentPhase === 'trabajo' && !isRunning) {
                setTimeLeft(session.duration);
              }
            }
          }
        } else if (selectedSessionId) {
          // Si no hay sesión seleccionada pero había una, resetear
          setSelectedSessionId(null);
          setCurrentSessionDuration(DEFAULT_SESSION_DURATION);
          if (currentPhase === 'trabajo' && !isRunning) {
            setTimeLeft(DEFAULT_SESSION_DURATION);
          }
        }
      } catch (error) {
        console.error('Error checking session change:', error);
      }
    };
    
    const interval = setInterval(checkSessionChange, 2000);
    return () => clearInterval(interval);
  }, [selectedSessionId, currentPhase, isRunning, currentSessionDuration]);

  // Listener para acciones de notificación (pausar/reanudar)
  useEffect(() => {
    const checkNotificationActions = async () => {
      try {
        const action = await AsyncStorage.getItem('timerAction');
        if (action) {
          // Limpiar la acción
          await AsyncStorage.removeItem('timerAction');
          
          // Ejecutar la acción
          if (action === 'pause' && isRunning) {
            setIsRunning(false);
          } else if (action === 'resume' && !isRunning && timeLeft > 0) {
            setIsRunning(true);
          }
        }
      } catch (error) {
        console.error('Error checking notification actions:', error);
      }
    };
    
    const interval = setInterval(checkNotificationActions, 500);
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  // Mantener timeLeftRef actualizado
  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  useEffect(() => {
    if (isRunning) {
      // Iniciar sesión si no hay una activa
      if (sessionStartTime.current === null) {
        sessionStartTime.current = Date.now();
        sessionStartTimeLeft.current = timeLeft;
        saveSessionEvent({
          type: 'start',
          phase: currentPhase,
          sessionType: selectedSessionId || 'default',
          timestamp: sessionStartTime.current,
        });
        // Activar bloqueador de apps si está habilitado
        startSessionBlock();
      }
      
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      // Solo detener el timer, no guardar todavía (puede reanudarse)
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, currentPhase]);

  // Actualizar notificación y widget cuando cambia el estado del timer
  useEffect(() => {
    const session = selectedSessionId 
      ? SESSIONS.find(s => s.id === selectedSessionId)
      : null;
    const sessionName = session ? session.name : null;
    
    if (isRunning || (timeLeft < getTotalDuration() && timeLeft > 0)) {
      // Mostrar notificación si el timer está activo o pausado
      updateTimerNotification({
        timeLeft,
        phase: currentPhase,
        isRunning,
        sessionName,
      });
      // Actualizar widget
      updateTimerWidget(timeLeft, isRunning, currentPhase, sessionName);
    } else if (timeLeft === 0 && !isRunning) {
      // Cancelar notificación si el timer está en 0 y no está corriendo
      cancelTimerNotification();
      clearTimerWidget();
    }
  }, [isRunning, currentPhase, selectedSessionId]);

  // Actualizar widget cuando cambia el minuto o el estado
  useEffect(() => {
    const session = selectedSessionId 
      ? SESSIONS.find(s => s.id === selectedSessionId)
      : null;
    const sessionName = session ? session.name : null;
    
    const currentMinute = Math.floor(timeLeft / 60);
    
    // Actualizar widget cuando cambia el minuto o el estado
    if (currentMinute !== lastMinuteRef.current || !isRunning) {
      if (isRunning || (timeLeft > 0 && timeLeft < getTotalDuration())) {
        updateTimerWidget(timeLeft, isRunning, currentPhase, sessionName);
        lastMinuteRef.current = currentMinute;
      }
    }
  }, [Math.floor(timeLeft / 60), isRunning, currentPhase, selectedSessionId]);

  const loadSettings = async () => {
    try {
      const autoStartValue = await AsyncStorage.getItem('autoStart');
      if (autoStartValue !== null) {
        setAutoStart(autoStartValue === 'true');
      }
      
      const committed = await AsyncStorage.getItem('committedMode');
      if (committed !== null) {
        setCommittedMode(committed === 'true');
      }
      
      const selectedSession = await AsyncStorage.getItem('selectedSession');
      if (selectedSession) {
        if (selectedSession === 'personalizada') {
          // Cargar duración personalizada
          const customDur = await AsyncStorage.getItem('customDuration');
          const minutes = customDur ? parseInt(customDur, 10) : 25;
          const duration = (isNaN(minutes) || minutes <= 0 ? 25 : minutes) * 60;
          setSelectedSessionId('personalizada');
          setCurrentSessionDuration(duration);
          setTimeLeft(duration);
        } else {
          const session = SESSIONS.find(s => s.id === selectedSession);
          if (session) {
            setSelectedSessionId(session.id);
            setCurrentSessionDuration(session.duration);
            setTimeLeft(session.duration);
          }
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleTimerComplete = async () => {
    setIsRunning(false);
    
    // Guardar sesión completada
    if (sessionStartTime.current !== null) {
      const duration = sessionStartTimeLeft.current;
      const timestamp = Date.now();
      
      await saveSessionEvent({
        type: 'end',
        phase: currentPhase,
        sessionType: selectedSessionId || 'default',
        timestamp: timestamp,
        duration: duration,
      });
      
      // Sincronizar con calendario si está habilitado (premium)
      if (isPremium) {
        try {
          await syncSessionToCalendar({
            phase: currentPhase,
            sessionType: selectedSessionId || 'default',
            timestamp: timestamp,
            duration: duration,
          });
        } catch (error) {
          console.error('Error sincronizando con calendario:', error);
        }
      }
      
      sessionStartTime.current = null;
      sessionStartTimeLeft.current = null;
    }
    
    // Enviar notificación
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Sesión de ${currentPhase} completada`,
        body: currentPhase === 'trabajo' 
          ? '¡Tómate un descanso!' 
          : '¡Vuelve al trabajo!',
        sound: true,
      },
      trigger: null,
    });

    // Animación
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-iniciar siguiente fase si está habilitado (premium)
    if (autoStart && isPremium) {
      setTimeout(() => {
        if (currentPhase === 'trabajo') {
          const newCycles = cycles + 1;
          setCycles(newCycles);
          const nextPhase = newCycles % 4 === 0 ? 'descanso-largo' : 'descanso';
          setCurrentPhase(nextPhase);
          setTimeLeft(nextPhase === 'descanso-largo' ? LONG_BREAK : SHORT_BREAK);
        } else {
          setCurrentPhase('trabajo');
          setTimeLeft(currentSessionDuration);
        }
        setIsRunning(true);
      }, 2000);
    } else {
      // Cambiar fase manualmente
      if (currentPhase === 'trabajo') {
        const newCycles = cycles + 1;
        setCycles(newCycles);
        const nextPhase = newCycles % 4 === 0 ? 'descanso-largo' : 'descanso';
        setCurrentPhase(nextPhase);
        setTimeLeft(nextPhase === 'descanso-largo' ? LONG_BREAK : SHORT_BREAK);
      } else {
        setCurrentPhase('trabajo');
        setTimeLeft(currentSessionDuration);
      }
    }
  };

  // Finalizar sesión cuando cambia la fase (interrupción)
  useEffect(() => {
    // Solo procesar si realmente cambió la fase y hay una sesión activa
    if (previousPhase.current !== currentPhase && sessionStartTime.current !== null) {
      // Usar el timeLeft guardado al inicio menos el tiempo restante actual
      const duration = sessionStartTimeLeft.current - timeLeft;
      saveSessionEvent({
        type: 'reset',
        phase: previousPhase.current, // Usar la fase anterior, no la nueva
        sessionType: selectedSessionId || 'default',
        timestamp: Date.now(),
        duration: duration,
      });
      sessionStartTime.current = null;
      sessionStartTimeLeft.current = null;
      // Desactivar bloqueador de apps
      endSessionBlock();
    }
    previousPhase.current = currentPhase;
  }, [currentPhase, timeLeft]);

  const toggleTimer = () => {
    console.log('Timer toggled, current state:', { isRunning, timeLeft });
    
    // Modo Comprometido: no permitir pausar si hay una sesión activa
    if (committedMode && isRunning && sessionStartTime.current !== null) {
      Alert.alert(
        'Modo Comprometido',
        'No puedes pausar una sesión activa en Modo Comprometido. Debes completarla.'
      );
      return;
    }
    
    if (timeLeft === 0) {
      // Reiniciar si el timer está en 0
      if (currentPhase === 'trabajo') {
        setTimeLeft(currentSessionDuration);
      } else if (currentPhase === 'descanso') {
        setTimeLeft(SHORT_BREAK);
      } else {
        setTimeLeft(LONG_BREAK);
      }
      setIsRunning(true);
    } else {
      setIsRunning(!isRunning);
    }
  };

  const resetPeriod = async () => {
    // Modo Comprometido: no permitir reset si hay una sesión activa
    if (committedMode && isRunning && sessionStartTime.current !== null) {
      Alert.alert(
        'Modo Comprometido',
        'No puedes cancelar una sesión activa en Modo Comprometido. Debes completarla.'
      );
      return;
    }
    
    // Guardar interrupción si hay sesión activa
    if (sessionStartTime.current !== null) {
      const duration = sessionStartTimeLeft.current - timeLeft;
      await saveSessionEvent({
        type: 'reset',
        phase: currentPhase,
        sessionType: selectedSessionId || 'default',
        timestamp: Date.now(),
        duration: duration,
      });
      sessionStartTime.current = null;
      sessionStartTimeLeft.current = null;
      // Desactivar bloqueador de apps
      endSessionBlock();
    }
    
    setIsRunning(false);
    if (currentPhase === 'trabajo') {
      setTimeLeft(currentSessionDuration);
    } else if (currentPhase === 'descanso') {
      setTimeLeft(SHORT_BREAK);
    } else {
      setTimeLeft(LONG_BREAK);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseTitle = () => {
    if (currentPhase === 'trabajo') {
      if (selectedSessionId) {
        const session = SESSIONS.find(s => s.id === selectedSessionId);
        return session ? session.name : 'Trabajo';
      }
      return 'Trabajo';
    } else if (currentPhase === 'descanso') {
      return 'Descanso';
    } else if (currentPhase === 'descanso-largo') {
      return 'Descanso Largo';
    }
    return 'Trabajo';
  };

  // Calcular la duración total según la fase actual
  const getTotalDuration = () => {
    switch (currentPhase) {
      case 'trabajo':
        return currentSessionDuration;
      case 'descanso':
        return SHORT_BREAK;
      case 'descanso-largo':
        return LONG_BREAK;
      default:
        return currentSessionDuration;
    }
  };

  // Calcular el porcentaje de tiempo restante
  const getProgress = () => {
    const total = getTotalDuration();
    if (total === 0) return 1;
    return Math.max(0, Math.min(1, timeLeft / total));
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    },
    header: {
      position: 'absolute',
      top: 60,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
      flex: 1,
    },
    resetButton: {
      padding: 10,
    },
    timerContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    timerCircle: {
      width: width * 0.7,
      height: width * 0.7,
      borderRadius: (width * 0.7) / 2,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    progressCircle: {
      position: 'absolute',
    },
    timerText: {
      fontSize: 72,
      fontWeight: '200',
      color: colors.text,
      letterSpacing: -2,
    },
    cyclesText: {
      marginTop: 24,
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '400',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{getPhaseTitle()}</Text>
        <TouchableOpacity 
          onPress={resetPeriod} 
          style={[styles.resetButton, { position: 'absolute', right: 20 }]}
        >
          <Text style={{ fontSize: 20, color: colors.text, fontWeight: '300' }}>↻</Text>
        </TouchableOpacity>
      </View>

      <Animated.View style={[styles.timerContainer, { transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.timerCircle}>
          {/* Círculo de progreso SVG */}
          {(() => {
            const circleSize = width * 0.7;
            const radius = (circleSize - 6) / 2;
            const circumference = 2 * Math.PI * radius;
            const progress = getProgress();
            const centerX = circleSize / 2;
            const centerY = circleSize / 2;
            
            // Para que se agote en sentido horario desde arriba:
            // - Rotamos el círculo -90 grados para empezar desde arriba
            // - strokeDashoffset negativo hace que se oculte en sentido horario
            // - Cuando progress = 1, offset = 0 (círculo completo)
            // - Cuando progress = 0, offset = -circumference (círculo vacío)
            // - Usamos offset negativo para sentido horario
            const strokeDashoffset = -circumference * (1 - progress);
            
            return (
              <Svg width={circleSize} height={circleSize} style={styles.progressCircle}>
                {/* Círculo de fondo completo */}
                <Circle
                  cx={centerX}
                  cy={centerY}
                  r={radius}
                  stroke={colors.border}
                  strokeWidth={3}
                  fill="none"
                  opacity={0.2}
                />
                {/* Círculo de progreso - se agota en sentido horario desde arriba */}
                <Circle
                  cx={centerX}
                  cy={centerY}
                  r={radius}
                  stroke={colors.primary}
                  strokeWidth={3}
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${centerX} ${centerY})`}
                />
              </Svg>
            );
          })()}
          {/* Contenido del timer */}
          <TouchableOpacity
            onPress={toggleTimer}
            activeOpacity={0.6}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.cyclesText}>
          {cycles} {cycles === 1 ? 'ciclo' : 'ciclos'} completados
        </Text>
      </Animated.View>
    </View>
  );
}

