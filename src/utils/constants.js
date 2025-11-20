// Constantes de la aplicación

export const TIMER_DURATIONS = {
  WORK: 25 * 60, // 25 minutos en segundos
  SHORT_BREAK: 5 * 60, // 5 minutos
  LONG_BREAK: 15 * 60, // 15 minutos
};

export const SESSIONS = [
  { id: 'revision-expediente', name: 'Revisión de Expediente', duration: 25 * 60, premium: false },
  { id: 'redaccion-demanda', name: 'Redacción de Demanda', duration: 45 * 60, premium: false },
  { id: 'preparacion-audiencia', name: 'Preparación de Audiencia', duration: 30 * 60, premium: false },
  { id: 'investigacion-juridica', name: 'Investigación Jurídica', duration: 40 * 60, premium: false },
  { id: 'reunion-cliente', name: 'Reunión con Cliente', duration: 60 * 60, premium: false },
  { id: 'personalizada', name: 'Sesión Personalizada', duration: 25 * 60, premium: true },
];

// Duración por defecto si no hay sesión seleccionada
export const DEFAULT_SESSION_DURATION = 25 * 60;

export const SUBSCRIPTION_PRICES = {
  MONTHLY: { label: 'Mensual', price: '0,50 €/mes', identifier: 'monthly' },
  ANNUAL: { label: 'Anual', price: '4,00 €/año', identifier: 'annual' },
  LIFETIME: { label: 'De por Vida', price: '22,99 €', identifier: 'lifetime1' },
};

export const STORAGE_KEYS = {
  THEME: 'theme',
  NOTIFICATIONS_ENABLED: 'notificationsEnabled',
  AUTO_START: 'autoStart',
  CALENDAR_SYNC: 'calendarSync',
  COMMITTED_MODE: 'committedMode',
  APP_BLOCKER: 'appBlocker',
  SELECTED_SESSION: 'selectedSession',
  CUSTOM_DURATION: 'customDuration',
  CYCLES_COMPLETED: 'cyclesCompleted',
  TOTAL_TIME: 'totalTime',
};

