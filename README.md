# LexFlow - Pomodoro Timer para Profesionales del Derecho

Una aplicación minimalista de temporizador Pomodoro diseñada específicamente para abogados, juristas y profesionales del derecho.

## Características

### Versión Gratuita
- ✅ Temporizador Pomodoro minimalista (estilo Flow)
- ✅ Sesiones predefinidas con temática jurídica
- ✅ Estadísticas básicas
- ✅ Modo claro y oscuro
- ✅ Notificaciones

### Versión Premium
- 🎯 Sesiones personalizadas
- 🎯 Configuración de ciclos personalizados
- 🎯 Inicio automático de pausas y periodos
- 🎯 Sincronización de timer entre dispositivos
- 🎯 Sincronización con calendario
- 🎯 Modo comprometido (bloquea cancelación)
- 🎯 Bloqueador de apps durante sesiones

## Instalación

### Prerrequisitos
- Node.js (v16 o superior)
- npm o yarn
- Expo CLI (`npm install -g expo-cli`)
- Cuenta de Expo (opcional, para desarrollo)

### Pasos

1. Instala las dependencias:
```bash
npm install
```

2. Configura RevenueCat:
   - Crea una cuenta en [RevenueCat](https://www.revenuecat.com)
   - Obtén tus API keys para iOS y Android
   - Edita `src/context/PremiumContext.js` y reemplaza:
     - `YOUR_IOS_API_KEY` con tu API key de iOS
     - `YOUR_ANDROID_API_KEY` con tu API key de Android
   - Configura los productos en RevenueCat Dashboard:
     - Mensual: 0.50€
     - Anual: 4.00€
     - De por Vida: 20.00€

3. Inicia el servidor de desarrollo:
```bash
npm start
```

4. Ejecuta en tu dispositivo:
   - iOS: Presiona `i` en la terminal o escanea el QR con la app Expo Go
   - Android: Presiona `a` en la terminal o escanea el QR con la app Expo Go

## Estructura del Proyecto

```
LexFlow/
├── App.js                 # Componente principal y navegación
├── src/
│   ├── context/
│   │   ├── ThemeContext.js      # Contexto para tema claro/oscuro
│   │   └── PremiumContext.js    # Contexto para suscripciones premium
│   └── screens/
│       ├── TimerScreen.js        # Pantalla principal del timer
│       ├── StatisticsScreen.js   # Pantalla de estadísticas
│       ├── SettingsScreen.js     # Pantalla de ajustes
│       ├── AboutScreen.js        # Sobre la app
│       └── HowItWorksScreen.js   # Cómo funciona
├── assets/                # Imágenes y recursos
└── package.json
```

## Configuración de RevenueCat

### Productos Requeridos

En el dashboard de RevenueCat, configura los siguientes productos:

1. **Mensual** (0.50€)
   - Identifier: `monthly`
   - Precio: 0.50€

2. **Anual** (4.00€)
   - Identifier: `annual`
   - Precio: 4.00€

3. **De por Vida** (20.00€)
   - Identifier: `lifetime`
   - Precio: 20.00€

### Entitlement

Crea un entitlement llamado `premium` que incluya todos los productos anteriores.

## Sesiones Disponibles

- Revisión de Expediente
- Redacción de Demanda
- Preparación de Audiencia
- Investigación Jurídica
- Reunión con Cliente
- Sesión Personalizada (Premium)

## Desarrollo

### Comandos Disponibles

- `npm start` - Inicia el servidor de desarrollo
- `npm run android` - Ejecuta en Android
- `npm run ios` - Ejecuta en iOS
- `npm run web` - Ejecuta en web (limitado)

### Build para Producción

Para crear builds de producción:

```bash
# iOS
expo build:ios

# Android
expo build:android
```

O usa EAS Build (recomendado):

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform ios
eas build --platform android
```

## Notas Importantes

- Las funcionalidades premium requieren una suscripción activa
- RevenueCat maneja todas las compras in-app
- Las notificaciones requieren permisos del usuario
- La sincronización con calendario requiere permisos de acceso al calendario

## Licencia

Desarrollado por cebr.xyz

## Soporte

Para comentarios o soporte, contacta: support@cebr.xyz

