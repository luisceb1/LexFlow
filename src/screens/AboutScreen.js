import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
// Ionicons temporalmente deshabilitado por problemas de compatibilidad
import { useTheme } from '../context/ThemeContext';

export default function AboutScreen({ navigation }) {
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
    version: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 20,
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
        <Text style={styles.headerTitle}>Sobre LexFlow</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>

        <View style={styles.section}>
          <Text style={styles.text}>
            LexFlow es una aplicación de temporizador Pomodoro diseñada específicamente 
            para abogados, juristas y profesionales del derecho.
          </Text>
          <Text style={styles.text}>
            Nuestra misión es ayudarte a mantener la concentración y productividad 
            durante tus sesiones de trabajo, utilizando la técnica Pomodoro adaptada 
            a las necesidades del sector legal.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Características</Text>
          <Text style={styles.text}>
            • Temporizador minimalista y fácil de usar{'\n'}
            • Sesiones personalizadas para diferentes tipos de trabajo legal{'\n'}
            • Estadísticas de productividad{'\n'}
            • Modo oscuro y claro{'\n'}
            • Funciones premium para usuarios avanzados
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Versión</Text>
          <Text style={styles.text}>1.0.0</Text>
        </View>

        <Text style={styles.version}>Desarrollado por cebr.xyz</Text>
      </ScrollView>
    </View>
  );
}

