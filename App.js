import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';

import TimerScreen from './src/screens/TimerScreen';
import StatisticsScreen from './src/screens/StatisticsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AboutScreen from './src/screens/AboutScreen';
import HowItWorksScreen from './src/screens/HowItWorksScreen';
import AllSessionsScreen from './src/screens/AllSessionsScreen';
import PaywallScreen from './src/screens/PaywallScreen';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { PremiumProvider } from './src/context/PremiumContext';
import { SubscriptionProvider } from './src/context/SubscriptionProvider.js';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainTabs() {
  const { colors } = useTheme();

  // Iconos usando símbolos Unicode elegantes y minimalistas
  const getIcon = (routeName, focused) => {
    const iconMap = {
      'Estadísticas': '▣',
      'Timer': '◉',
      'Ajustes': '◐',
    };
    return iconMap[routeName] || '•';
  };

  return (
    <Tab.Navigator
      initialRouteName="Timer"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          const icon = getIcon(route.name, focused);
          return (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{
                fontSize: 22,
                color: focused ? colors.primary : colors.textSecondary,
                fontWeight: focused ? '500' : '300',
                opacity: focused ? 1 : 0.6,
              }}>
                {icon}
              </Text>
            </View>
          );
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Estadísticas" component={StatisticsScreen} />
      <Tab.Screen name="Timer" component={TimerScreen} />
      <Tab.Screen name="Ajustes" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="About" component={AboutScreen} />
        <Stack.Screen name="HowItWorks" component={HowItWorksScreen} />
        <Stack.Screen name="AllSessions" component={AllSessionsScreen} />
        <Stack.Screen name="Paywall" component={PaywallScreen} />
      </Stack.Navigator>
    </View>
  );
}

// Mantener el splash screen visible mientras cargamos
SplashScreen.preventAutoHideAsync();

// Configurar el handler de notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const colorScheme = useColorScheme();
  const [theme, setTheme] = useState('system');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    loadTheme();

    // Configurar listeners para acciones de notificación
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      async (response) => {
        const actionIdentifier = response.actionIdentifier;

        if (actionIdentifier === 'PAUSE_TIMER') {
          // Guardar comando de pausar
          await AsyncStorage.setItem('timerAction', 'pause');
        } else if (actionIdentifier === 'RESUME_TIMER') {
          // Guardar comando de reanudar
          await AsyncStorage.setItem('timerAction', 'resume');
        }
      }
    );

    return () => {
      responseSubscription.remove();
    };
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme) {
        setTheme(savedTheme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setIsReady(true);
      await SplashScreen.hideAsync();
    }
  };

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  console.log('🎬 App renderizado, montando PremiumProvider...');

  const isDark = theme === 'dark' || (theme === 'system' && colorScheme === 'dark');
  const backgroundColor = isDark ? '#0f172a' : '#ffffff';

  return (
    <ThemeProvider theme={theme === 'system' ? colorScheme : theme}>
      <SubscriptionProvider>
        <PremiumProvider>
          <View style={{ flex: 1, backgroundColor }}>
            <NavigationContainer theme={{ colors: { background: backgroundColor } }}>
              <AppNavigator />
              <StatusBar style={isDark ? 'light' : 'dark'} />
            </NavigationContainer>
          </View>
        </PremiumProvider>
      </SubscriptionProvider>
    </ThemeProvider>
  );
}
