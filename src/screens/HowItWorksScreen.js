import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
// Ionicons temporalmente deshabilitado por problemas de compatibilidad
import { useTheme } from '../context/ThemeContext';

export default function HowItWorksScreen({ navigation }) {
  const { colors } = useTheme();

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
      paddingTop: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 20,
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
    text: {
      fontSize: 16,
      color: colors.textSecondary,
      lineHeight: 24,
      marginBottom: 12,
    },
    step: {
      marginBottom: 16,
      paddingLeft: 20,
    },
    stepNumber: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: 4,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      padding: 8,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={{ fontSize: 24, color: colors.text }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cómo Funciona</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Técnica Pomodoro</Text>
          <Text style={styles.text}>
            La técnica Pomodoro es un método de gestión del tiempo que divide el trabajo 
            en intervalos de 25 minutos, separados por breves descansos.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pasos para Usar LexFlow</Text>

          <View style={styles.step}>
            <Text style={styles.stepNumber}>1. Selecciona una Sesión</Text>
            <Text style={styles.text}>
              Elige el tipo de trabajo que vas a realizar (revisión de expediente, 
              redacción de demanda, etc.)
            </Text>
          </View>

          <View style={styles.step}>
            <Text style={styles.stepNumber}>2. Inicia el Timer</Text>
            <Text style={styles.text}>
              Toca el círculo del temporizador para comenzar una sesión de trabajo de 25 minutos.
            </Text>
          </View>

          <View style={styles.step}>
            <Text style={styles.stepNumber}>3. Trabaja con Concentración</Text>
            <Text style={styles.text}>
              Dedica los 25 minutos completamente a la tarea seleccionada, sin distracciones.
            </Text>
          </View>

          <View style={styles.step}>
            <Text style={styles.stepNumber}>4. Tómate un Descanso</Text>
            <Text style={styles.text}>
              Cuando termine el timer, tómate un descanso de 5 minutos. Cada 4 ciclos, 
              disfruta de un descanso largo de 15 minutos.
            </Text>
          </View>

          <View style={styles.step}>
            <Text style={styles.stepNumber}>5. Repite el Ciclo</Text>
            <Text style={styles.text}>
              Continúa con el siguiente ciclo de trabajo y descanso para mantener 
              tu productividad durante todo el día.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Consejos</Text>
          <Text style={styles.text}>
            • Elimina distracciones durante las sesiones de trabajo{'\n'}
            • Respeta los tiempos de descanso{'\n'}
            • Ajusta la duración de las sesiones según tus necesidades (función premium){'\n'}
            • Revisa tus estadísticas para mejorar tu productividad
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

