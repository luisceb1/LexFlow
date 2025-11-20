import * as Calendar from 'expo-calendar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert } from 'react-native';
import { SESSIONS } from './constants';

const CALENDAR_SYNC_KEY = 'calendarSync';
const CALENDAR_ID_KEY = 'lexflow_calendar_id';

/**
 * Solicita permisos de calendario
 */
export const requestCalendarPermissions = async () => {
  try {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status !== 'granted') {
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error solicitando permisos de calendario:', error);
    return false;
  }
};

/**
 * Obtiene o crea el calendario de LexFlow
 */
export const getOrCreateLexFlowCalendar = async () => {
  try {
    // Verificar si ya tenemos un ID guardado
    const savedCalendarId = await AsyncStorage.getItem(CALENDAR_ID_KEY);
    if (savedCalendarId) {
      // Verificar que el calendario aún existe
      try {
        const calendar = await Calendar.getCalendarAsync(savedCalendarId);
        if (calendar) {
          return calendar.id;
        }
      } catch (e) {
        // El calendario no existe, crear uno nuevo
      }
    }

    // Obtener calendarios disponibles
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    
    // Buscar si ya existe un calendario de LexFlow
    const existingCalendar = calendars.find(cal => cal.title === 'LexFlow');
    if (existingCalendar) {
      await AsyncStorage.setItem(CALENDAR_ID_KEY, existingCalendar.id);
      return existingCalendar.id;
    }

    // Crear nuevo calendario
    const defaultCalendarSource = Platform.select({
      ios: calendars.find(cal => cal.source.name === 'Default')?.source,
      android: calendars.find(cal => cal.source.name === 'Local Calendars')?.source || calendars[0]?.source,
    });

    if (!defaultCalendarSource) {
      throw new Error('No se encontró una fuente de calendario válida');
    }

    const newCalendarId = await Calendar.createCalendarAsync({
      title: 'LexFlow',
      color: '#007AFF',
      entityType: Calendar.EntityTypes.EVENT,
      sourceId: defaultCalendarSource.id,
      source: defaultCalendarSource,
      name: 'LexFlow',
      ownerAccount: 'personal',
      timeZone: 'GMT',
      allowsModifications: true,
      allowedAvailabilities: [Calendar.Availability.BUSY],
    });

    await AsyncStorage.setItem(CALENDAR_ID_KEY, newCalendarId);
    return newCalendarId;
  } catch (error) {
    console.error('Error obteniendo/creando calendario:', error);
    throw error;
  }
};

/**
 * Sincroniza una sesión completada al calendario
 */
export const syncSessionToCalendar = async (sessionData) => {
  try {
    // Verificar si la sincronización está habilitada
    const calendarSyncEnabled = await AsyncStorage.getItem(CALENDAR_SYNC_KEY);
    if (calendarSyncEnabled !== 'true') {
      return { success: false, reason: 'sync_disabled' };
    }

    // Solicitar permisos
    const hasPermission = await requestCalendarPermissions();
    if (!hasPermission) {
      return { success: false, reason: 'no_permission' };
    }

    // Obtener o crear calendario
    const calendarId = await getOrCreateLexFlowCalendar();

    // Obtener información de la sesión
    const session = SESSIONS.find(s => s.id === sessionData.sessionType);
    const sessionName = session ? session.name : 'Sesión de trabajo';

    // Determinar el título del evento según la fase
    let eventTitle = '';
    let eventNotes = '';
    
    if (sessionData.phase === 'trabajo') {
      eventTitle = `🍅 ${sessionName}`;
      eventNotes = `Sesión de trabajo completada (${Math.floor(sessionData.duration / 60)} min)`;
    } else if (sessionData.phase === 'descanso') {
      eventTitle = `☕ Descanso corto`;
      eventNotes = `Descanso de ${Math.floor(sessionData.duration / 60)} minutos`;
    } else if (sessionData.phase === 'descanso-largo') {
      eventTitle = `🌴 Descanso largo`;
      eventNotes = `Descanso largo de ${Math.floor(sessionData.duration / 60)} minutos`;
    }

    // Calcular fechas
    const startDate = new Date(sessionData.timestamp - sessionData.duration * 1000);
    const endDate = new Date(sessionData.timestamp);

    // Crear evento en el calendario
    const eventId = await Calendar.createEventAsync(calendarId, {
      title: eventTitle,
      startDate: startDate,
      endDate: endDate,
      notes: eventNotes,
      timeZone: 'GMT',
      allDay: false,
      availability: Calendar.Availability.BUSY,
    });

    return { success: true, eventId };
  } catch (error) {
    console.error('Error sincronizando sesión al calendario:', error);
    return { success: false, reason: 'error', error: error.message };
  }
};

/**
 * Verifica si la sincronización está habilitada
 */
export const isCalendarSyncEnabled = async () => {
  try {
    const enabled = await AsyncStorage.getItem(CALENDAR_SYNC_KEY);
    return enabled === 'true';
  } catch (error) {
    return false;
  }
};

