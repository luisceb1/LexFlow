import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getStatisticsByPeriod } from '../utils/statistics';
import { SESSIONS } from '../utils/constants';

export default function AllSessionsScreen({ route, navigation }) {
  const { colors } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState(route?.params?.period || 'day');
  const [statistics, setStatistics] = useState(null);

  useEffect(() => {
    loadStatistics();
  }, [selectedPeriod]);

  const loadStatistics = async () => {
    const stats = await getStatisticsByPeriod(selectedPeriod);
    setStatistics(stats);
  };

  const formatMinutes = (minutes) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPeriodLabel = (period) => {
    const labels = {
      day: 'Hoy',
      week: 'Semanas',
      month: 'Meses',
      year: 'Años',
    };
    return labels[period] || period;
  };

  const getPhaseLabel = (type) => {
    switch (type) {
      case 'trabajo':
        return 'Trabajo';
      case 'descanso-largo':
        return 'Descanso Largo';
      case 'descanso':
        return 'Descanso';
      default:
        return type;
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 20,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 60,
      marginBottom: 20,
    },
    backButton: {
      marginRight: 16,
      padding: 8,
    },
    backButtonText: {
      fontSize: 24,
      color: colors.primary,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
      flex: 1,
    },
    periodSelector: {
      flexDirection: 'row',
      marginBottom: 20,
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    periodButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 44,
    },
    periodButtonActive: {
      backgroundColor: colors.primary,
    },
    periodButtonText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
      textAlign: 'center',
    },
    periodButtonTextActive: {
      color: '#FFFFFF',
    },
    sessionsList: {
      marginTop: 12,
    },
    sessionItem: {
      paddingVertical: 16,
      paddingHorizontal: 16,
      backgroundColor: colors.surface,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sessionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    sessionType: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    sessionStatus: {
      fontSize: 12,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 6,
      overflow: 'hidden',
      fontWeight: '600',
    },
    sessionStatusCompleted: {
      backgroundColor: colors.primary + '20',
      color: colors.primary,
    },
    sessionStatusInterrupted: {
      backgroundColor: '#FF6B6B20',
      color: '#FF6B6B',
    },
    sessionDetails: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 4,
    },
    sessionDuration: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginTop: 8,
    },
    emptyState: {
      padding: 60,
      alignItems: 'center',
    },
    emptyStateText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    summaryCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    summaryTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    summaryRowLast: {
      borderBottomWidth: 0,
    },
    summaryLabel: {
      fontSize: 15,
      color: colors.textSecondary,
    },
    summaryValue: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
  });

  if (!statistics) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Todas las Sesiones</Text>
        </View>
        <Text style={styles.emptyStateText}>Cargando...</Text>
      </ScrollView>
    );
  }

  const sortedSessions = [...statistics.allSessions].sort(
    (a, b) => new Date(b.startTime) - new Date(a.startTime)
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Todas las Sesiones</Text>
      </View>

      {/* Selector de período */}
      <View style={styles.periodSelector}>
        {['day', 'week', 'month', 'year'].map((period, index) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.periodButton,
              selectedPeriod === period && styles.periodButtonActive,
              index > 0 && { marginLeft: 4 },
            ]}
            onPress={() => setSelectedPeriod(period)}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === period && styles.periodButtonTextActive,
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {getPeriodLabel(period)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Resumen */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Resumen - {getPeriodLabel(selectedPeriod)}</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total de sesiones</Text>
          <Text style={styles.summaryValue}>{statistics.totalSessions}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tiempo total</Text>
          <Text style={styles.summaryValue}>{formatMinutes(statistics.totalMinutes)}</Text>
        </View>
        <View style={[styles.summaryRow, styles.summaryRowLast]}>
          <Text style={styles.summaryLabel}>Interrupciones</Text>
          <Text style={styles.summaryValue}>{statistics.totalInterruptions}</Text>
        </View>
      </View>

      {/* Lista de sesiones agrupadas por período */}
      {statistics.isGrouped && statistics.periods && statistics.periods.length > 0 ? (
        <View style={styles.sessionsList}>
          {statistics.periods.map((periodData, periodIndex) => {
            if (periodData.allSessions.length === 0) return null;
            const periodSessions = [...periodData.allSessions].sort(
              (a, b) => new Date(b.startTime) - new Date(a.startTime)
            );
            return (
              <View key={periodIndex}>
                <Text style={[styles.summaryTitle, { marginTop: 20, marginBottom: 12 }]}>
                  {periodData.label}
                </Text>
                {periodSessions.map((session) => (
                  <View key={session.id} style={styles.sessionItem}>
                    <View style={styles.sessionHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.sessionType}>
                          {getPhaseLabel(session.type)}
                        </Text>
                        {session.type === 'trabajo' && session.sessionType && (
                          <Text style={[styles.sessionDetails, { marginTop: 4, fontSize: 12 }]}>
                            {(() => {
                              const sessionInfo = SESSIONS.find(s => s.id === session.sessionType);
                              return sessionInfo ? sessionInfo.name : session.sessionType;
                            })()}
                          </Text>
                        )}
                      </View>
                      <View
                        style={[
                          styles.sessionStatus,
                          session.completed && !session.interrupted
                            ? styles.sessionStatusCompleted
                            : styles.sessionStatusInterrupted,
                        ]}
                      >
                        <Text
                          style={[
                            styles.sessionStatus,
                            session.completed && !session.interrupted
                              ? styles.sessionStatusCompleted
                              : styles.sessionStatusInterrupted,
                          ]}
                        >
                          {session.completed && !session.interrupted
                            ? 'Completada'
                            : 'Interrumpida'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.sessionDetails}>
                      {formatDate(session.startTime)}
                    </Text>
                    {session.endTime && (
                      <Text style={styles.sessionDetails}>
                        Finalizada: {formatDate(session.endTime)}
                      </Text>
                    )}
                    <Text style={styles.sessionDuration}>
                      Duración: {formatMinutes(Math.floor(session.duration / 60))}
                    </Text>
                  </View>
                ))}
              </View>
            );
          })}
        </View>
      ) : sortedSessions.length > 0 ? (
        <View style={styles.sessionsList}>
          {sortedSessions.map((session) => (
            <View key={session.id} style={styles.sessionItem}>
              <View style={styles.sessionHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sessionType}>
                    {getPhaseLabel(session.type)}
                  </Text>
                  {session.type === 'trabajo' && session.sessionType && (
                    <Text style={[styles.sessionDetails, { marginTop: 4, fontSize: 12 }]}>
                      {(() => {
                        const sessionInfo = SESSIONS.find(s => s.id === session.sessionType);
                        return sessionInfo ? sessionInfo.name : session.sessionType;
                      })()}
                    </Text>
                  )}
                </View>
                <View
                  style={[
                    styles.sessionStatus,
                    session.completed && !session.interrupted
                      ? styles.sessionStatusCompleted
                      : styles.sessionStatusInterrupted,
                  ]}
                >
                  <Text
                    style={[
                      styles.sessionStatus,
                      session.completed && !session.interrupted
                        ? styles.sessionStatusCompleted
                        : styles.sessionStatusInterrupted,
                    ]}
                  >
                    {session.completed && !session.interrupted
                      ? 'Completada'
                      : 'Interrumpida'}
                  </Text>
                </View>
              </View>
              <Text style={styles.sessionDetails}>
                {formatDate(session.startTime)}
              </Text>
              {session.endTime && (
                <Text style={styles.sessionDetails}>
                  Finalizada: {formatDate(session.endTime)}
                </Text>
              )}
              <Text style={styles.sessionDuration}>
                Duración: {formatMinutes(Math.floor(session.duration / 60))}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            No hay sesiones registradas para {getPeriodLabel(selectedPeriod).toLowerCase()}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

