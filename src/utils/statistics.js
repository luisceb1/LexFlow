import AsyncStorage from '@react-native-async-storage/async-storage';

const STATISTICS_KEY = 'statistics_data';

// Estructura de datos:
// {
//   sessions: [
//     {
//       id: string,
//       type: 'trabajo' | 'descanso' | 'descanso-largo',
//       startTime: timestamp,
//       endTime: timestamp | null,
//       duration: number (segundos),
//       completed: boolean,
//       interrupted: boolean,
//       date: string (YYYY-MM-DD)
//     }
//   ]
// }

export const saveSessionEvent = async (event) => {
  try {
    const data = await getStatisticsData();
    
    if (event.type === 'start') {
      // Iniciar nueva sesión
      const newSession = {
        id: Date.now().toString(),
        type: event.phase,
        sessionType: event.sessionType || 'default',
        startTime: event.timestamp,
        endTime: null,
        duration: 0,
        completed: false,
        interrupted: false,
        date: new Date(event.timestamp).toISOString().split('T')[0],
      };
      data.sessions.push(newSession);
    } else if (event.type === 'end') {
      // Finalizar sesión
      const activeSession = data.sessions.find(
        s => s.type === event.phase && s.endTime === null
      );
      if (activeSession) {
        activeSession.endTime = event.timestamp;
        activeSession.duration = event.duration || 0;
        activeSession.completed = true;
        if (event.sessionType) {
          activeSession.sessionType = event.sessionType;
        }
      }
    } else if (event.type === 'pause') {
      // Marcar como interrumpida
      const activeSession = data.sessions.find(
        s => s.type === event.phase && s.endTime === null
      );
      if (activeSession) {
        activeSession.interrupted = true;
        activeSession.endTime = event.timestamp;
        activeSession.duration = event.duration || 0;
        if (event.sessionType) {
          activeSession.sessionType = event.sessionType;
        }
      }
    } else if (event.type === 'reset') {
      // Marcar como interrumpida y finalizar
      const activeSession = data.sessions.find(
        s => s.type === event.phase && s.endTime === null
      );
      if (activeSession) {
        activeSession.interrupted = true;
        activeSession.endTime = event.timestamp;
        activeSession.duration = event.duration || 0;
        if (event.sessionType) {
          activeSession.sessionType = event.sessionType;
        }
      }
    }
    
    await AsyncStorage.setItem(STATISTICS_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving session event:', error);
    return false;
  }
};

export const getStatisticsData = async () => {
  try {
    const data = await AsyncStorage.getItem(STATISTICS_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return { sessions: [] };
  } catch (error) {
    console.error('Error getting statistics data:', error);
    return { sessions: [] };
  }
};

const calculatePeriodStats = (sessions) => {
  const trabajoSessions = sessions.filter(s => s.type === 'trabajo');
  const descansoSessions = sessions.filter(s => s.type === 'descanso' || s.type === 'descanso-largo');
  
  return {
    totalSessions: sessions.length,
    trabajo: {
      started: trabajoSessions.length,
      completed: trabajoSessions.filter(s => s.completed && !s.interrupted).length,
      interrupted: trabajoSessions.filter(s => s.interrupted).length,
      totalMinutes: Math.floor(trabajoSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60),
    },
    descanso: {
      started: descansoSessions.length,
      completed: descansoSessions.filter(s => s.completed && !s.interrupted).length,
      interrupted: descansoSessions.filter(s => s.interrupted).length,
      totalMinutes: Math.floor(descansoSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60),
    },
    totalInterruptions: sessions.filter(s => s.interrupted).length,
    totalMinutes: Math.floor(sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60),
  };
};

export const getStatisticsByPeriod = async (period = 'day') => {
  try {
    const data = await getStatisticsData();
    const now = new Date();
    
    // Para día, devolver estadísticas de hoy
    if (period === 'day') {
      const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      
      const filteredSessions = data.sessions.filter(session => {
        const sessionDate = new Date(session.startTime);
        return sessionDate >= startDate && sessionDate <= endDate;
      });
      
      const stats = calculatePeriodStats(filteredSessions);
      
      // Agrupar por tipo de sesión (solo para sesiones de trabajo)
      const trabajoSessions = filteredSessions.filter(s => s.type === 'trabajo' && s.sessionType);
      const sessionTypeStats = {};
      trabajoSessions.forEach(session => {
        const type = session.sessionType || 'default';
        if (!sessionTypeStats[type]) {
          sessionTypeStats[type] = {
            sessionType: type,
            totalSessions: 0,
            completed: 0,
            interrupted: 0,
            totalMinutes: 0,
          };
        }
        sessionTypeStats[type].totalSessions++;
        if (session.completed && !session.interrupted) {
          sessionTypeStats[type].completed++;
        }
        if (session.interrupted) {
          sessionTypeStats[type].interrupted++;
        }
        sessionTypeStats[type].totalMinutes += Math.floor(session.duration / 60);
      });
      
      return {
        period,
        isGrouped: false,
        ...stats,
        allSessions: filteredSessions,
        sessionTypeStats: Object.values(sessionTypeStats),
      };
    }
    
    // Para semana, mes y año, devolver períodos agrupados
    let periods = [];
    
    if (period === 'week') {
      // Últimas 8 semanas completas
      const currentDayOfWeek = now.getDay();
      const daysToMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
      const thisWeekMonday = new Date(now);
      thisWeekMonday.setDate(now.getDate() - daysToMonday);
      thisWeekMonday.setHours(0, 0, 0, 0);
      
      for (let i = 7; i >= 0; i--) {
        const weekStart = new Date(thisWeekMonday);
        weekStart.setDate(thisWeekMonday.getDate() - (i * 7));
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        
        const weekSessions = data.sessions.filter(session => {
          const sessionDate = new Date(session.startTime);
          return sessionDate >= weekStart && sessionDate <= weekEnd;
        });
        
        const weekStats = calculatePeriodStats(weekSessions);
        const startDay = weekStart.getDate();
        const startMonth = weekStart.getMonth() + 1;
        const endDay = weekEnd.getDate();
        const endMonth = weekEnd.getMonth() + 1;
        periods.push({
          label: `Semana ${startDay}/${startMonth} - ${endDay}/${endMonth}`,
          startDate: weekStart,
          endDate: weekEnd,
          ...weekStats,
          allSessions: weekSessions,
        });
      }
    } else if (period === 'month') {
      // Últimos 12 meses
      for (let i = 11; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
        
        const monthSessions = data.sessions.filter(session => {
          const sessionDate = new Date(session.startTime);
          return sessionDate >= monthStart && sessionDate <= monthEnd;
        });
        
        const monthStats = calculatePeriodStats(monthSessions);
        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                           'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        periods.push({
          label: `${monthNames[monthStart.getMonth()]} ${monthStart.getFullYear()}`,
          startDate: monthStart,
          endDate: monthEnd,
          ...monthStats,
          allSessions: monthSessions,
        });
      }
    } else if (period === 'year') {
      // Últimos 5 años
      const currentYear = now.getFullYear();
      for (let i = 4; i >= 0; i--) {
        const yearStart = new Date(currentYear - i, 0, 1);
        const yearEnd = new Date(currentYear - i, 11, 31, 23, 59, 59);
        
        const yearSessions = data.sessions.filter(session => {
          const sessionDate = new Date(session.startTime);
          return sessionDate >= yearStart && sessionDate <= yearEnd;
        });
        
        const yearStats = calculatePeriodStats(yearSessions);
        periods.push({
          label: `${currentYear - i}`,
          startDate: yearStart,
          endDate: yearEnd,
          ...yearStats,
          allSessions: yearSessions,
        });
      }
    }
    
    // Calcular totales
    const allSessions = periods.reduce((acc, p) => [...acc, ...p.allSessions], []);
    const totals = calculatePeriodStats(allSessions);
    
    // Agrupar por tipo de sesión (solo para sesiones de trabajo)
    const trabajoSessions = allSessions.filter(s => s.type === 'trabajo' && s.sessionType);
    const sessionTypeStats = {};
    trabajoSessions.forEach(session => {
      const type = session.sessionType || 'default';
      if (!sessionTypeStats[type]) {
        sessionTypeStats[type] = {
          sessionType: type,
          totalSessions: 0,
          completed: 0,
          interrupted: 0,
          totalMinutes: 0,
        };
      }
      sessionTypeStats[type].totalSessions++;
      if (session.completed && !session.interrupted) {
        sessionTypeStats[type].completed++;
      }
      if (session.interrupted) {
        sessionTypeStats[type].interrupted++;
      }
      sessionTypeStats[type].totalMinutes += Math.floor(session.duration / 60);
    });
    
    return {
      period,
      isGrouped: true,
      periods,
      ...totals,
      allSessions,
      sessionTypeStats: Object.values(sessionTypeStats),
    };
  } catch (error) {
    console.error('Error getting statistics by period:', error);
    return {
      period,
      isGrouped: period !== 'day',
      totalSessions: 0,
      trabajo: { started: 0, completed: 0, interrupted: 0, totalMinutes: 0 },
      descanso: { started: 0, completed: 0, interrupted: 0, totalMinutes: 0 },
      totalInterruptions: 0,
      totalMinutes: 0,
      allSessions: [],
      periods: [],
      sessionTypeStats: [],
    };
  }
};

export const clearStatistics = async () => {
  try {
    await AsyncStorage.removeItem(STATISTICS_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing statistics:', error);
    return false;
  }
};

