import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getStatisticsByPeriod } from '../utils/statistics';
import { SESSIONS } from '../utils/constants';

export default function StatisticsScreen({ navigation }) {
  const { colors } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState('day');
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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 20,
      marginTop: 60,
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
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    cardValue: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: 4,
    },
    cardSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 8,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    statRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    statRowLast: {
      borderBottomWidth: 0,
    },
    statLabel: {
      fontSize: 15,
      color: colors.textSecondary,
      flex: 1,
    },
    statValue: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    emptyState: {
      padding: 40,
      alignItems: 'center',
    },
    emptyStateText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });

  if (!statistics) {
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Estadísticas</Text>
        <Text style={styles.emptyStateText}>Cargando...</Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Estadísticas</Text>
      
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

      {/* Resumen general */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Resumen - {getPeriodLabel(selectedPeriod)}</Text>
        <Text style={styles.cardValue}>{statistics.totalSessions}</Text>
        <Text style={styles.cardSubtitle}>Total de sesiones</Text>
        <View style={{ marginTop: 16 }}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Tiempo total</Text>
            <Text style={styles.statValue}>{formatMinutes(statistics.totalMinutes)}</Text>
          </View>
          <View style={[styles.statRow, styles.statRowLast]}>
            <Text style={styles.statLabel}>Interrupciones</Text>
            <Text style={styles.statValue}>{statistics.totalInterruptions}</Text>
          </View>
        </View>
      </View>

      {/* Períodos agrupados (semanas, meses, años) */}
      {statistics.isGrouped && statistics.periods && statistics.periods.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {selectedPeriod === 'week' ? 'Semanas' : selectedPeriod === 'month' ? 'Meses' : 'Años'}
          </Text>
          {statistics.periods.map((periodData, index) => (
            <View key={index} style={styles.card}>
              <Text style={[styles.cardTitle, { marginBottom: 12 }]}>{periodData.label}</Text>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Sesiones</Text>
                <Text style={styles.statValue}>{periodData.totalSessions}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Tiempo total</Text>
                <Text style={styles.statValue}>{formatMinutes(periodData.totalMinutes)}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Trabajo completado</Text>
                <Text style={styles.statValue}>{periodData.trabajo.completed}</Text>
              </View>
              <View style={[styles.statRow, styles.statRowLast]}>
                <Text style={styles.statLabel}>Interrupciones</Text>
                <Text style={styles.statValue}>{periodData.totalInterruptions}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Sesiones de Trabajo */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sesiones de Trabajo</Text>
        <View style={styles.card}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Sesiones empezadas</Text>
            <Text style={styles.statValue}>{statistics.trabajo.started}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Sesiones terminadas</Text>
            <Text style={styles.statValue}>{statistics.trabajo.completed}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Sesiones interrumpidas</Text>
            <Text style={styles.statValue}>{statistics.trabajo.interrupted}</Text>
          </View>
          <View style={[styles.statRow, styles.statRowLast]}>
            <Text style={styles.statLabel}>Minutos totales</Text>
            <Text style={styles.statValue}>{formatMinutes(statistics.trabajo.totalMinutes)}</Text>
          </View>
        </View>
      </View>

      {/* Pausas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pausas</Text>
        <View style={styles.card}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Pausas empezadas</Text>
            <Text style={styles.statValue}>{statistics.descanso.started}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Pausas terminadas</Text>
            <Text style={styles.statValue}>{statistics.descanso.completed}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Pausas interrumpidas</Text>
            <Text style={styles.statValue}>{statistics.descanso.interrupted}</Text>
          </View>
          <View style={[styles.statRow, styles.statRowLast]}>
            <Text style={styles.statLabel}>Minutos totales</Text>
            <Text style={styles.statValue}>{formatMinutes(statistics.descanso.totalMinutes)}</Text>
          </View>
        </View>
      </View>

      {/* Estadísticas por tipo de ciclo */}
      {statistics.sessionTypeStats && statistics.sessionTypeStats.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipos de Ciclos</Text>
          {statistics.sessionTypeStats.map((typeStat, index) => {
            const session = SESSIONS.find(s => s.id === typeStat.sessionType);
            const sessionName = session ? session.name : typeStat.sessionType;
            const sessionDuration = session ? session.duration / 60 : 25;
            
            return (
              <View key={index} style={styles.card}>
                <Text style={[styles.cardTitle, { marginBottom: 12 }]}>{sessionName}</Text>
                <Text style={styles.cardSubtitle}>Duración: {sessionDuration} minutos</Text>
                <View style={{ marginTop: 12 }}>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Sesiones totales</Text>
                    <Text style={styles.statValue}>{typeStat.totalSessions}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Completadas</Text>
                    <Text style={styles.statValue}>{typeStat.completed}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Interrumpidas</Text>
                    <Text style={styles.statValue}>{typeStat.interrupted}</Text>
                  </View>
                  <View style={[styles.statRow, styles.statRowLast]}>
                    <Text style={styles.statLabel}>Tiempo total</Text>
                    <Text style={styles.statValue}>{formatMinutes(typeStat.totalMinutes)}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Botón para ver todas las sesiones */}
      <TouchableOpacity
        style={[styles.card, { marginTop: 8 }]}
        onPress={() => navigation?.navigate('AllSessions', { period: selectedPeriod })}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={styles.cardTitle}>Ver Todas las Sesiones</Text>
            <Text style={styles.cardSubtitle}>
              {statistics.allSessions.length} {statistics.allSessions.length === 1 ? 'sesión' : 'sesiones'} en {getPeriodLabel(selectedPeriod).toLowerCase()}
            </Text>
          </View>
          <Text style={{ fontSize: 24, color: colors.primary }}>›</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}
