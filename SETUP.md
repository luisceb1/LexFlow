# Guía de Configuración - LexFlow

## Configuración Inicial

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar RevenueCat

#### Paso 1: Crear cuenta en RevenueCat
1. Ve a [RevenueCat](https://www.revenuecat.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Añade tu app iOS y Android

#### Paso 2: Obtener API Keys
1. En el dashboard de RevenueCat, ve a tu proyecto
2. Copia las API keys para iOS y Android
3. Edita `src/context/PremiumContext.js` y reemplaza:
   - `YOUR_IOS_API_KEY` con tu API key de iOS
   - `YOUR_ANDROID_API_KEY` con tu API key de Android

#### Paso 3: Configurar Productos en RevenueCat

En el dashboard de RevenueCat, configura los siguientes productos:

**iOS (App Store Connect):**
1. Ve a App Store Connect
2. Crea 3 suscripciones:
   - Mensual: 0.50€
   - Anual: 4.00€
   - De por Vida: 20.00€ (compra única)
3. Anota los Product IDs

**Android (Google Play Console):**
1. Ve a Google Play Console
2. Crea 3 productos:
   - Mensual: 0.50€
   - Anual: 4.00€
   - De por Vida: 20.00€ (compra única)
3. Anota los Product IDs

**En RevenueCat Dashboard:**
1. Ve a "Products"
2. Añade los productos con los Product IDs de iOS y Android
3. Crea un Entitlement llamado `premium`
4. Asocia todos los productos al entitlement `premium`

#### Paso 4: Configurar Offerings

1. En RevenueCat, ve a "Offerings"
2. Crea un Offering llamado "default"
3. Añade los 3 paquetes (mensual, anual, lifetime)
4. Asegúrate de que los identificadores coincidan con los esperados en el código

### 3. Configurar Assets

Crea los siguientes archivos en la carpeta `assets/`:
- `icon.png` (1024x1024px)
- `splash.png` (1242x2436px)
- `adaptive-icon.png` (1024x1024px)
- `favicon.png` (48x48px)
- `notification-icon.png` (96x96px)

Ver `assets/README.md` para más detalles.

### 4. Configurar Permisos

#### iOS (app.json)
Los permisos se configuran automáticamente con los plugins de Expo.

#### Android (app.json)
Los permisos se configuran automáticamente con los plugins de Expo.

### 5. Probar la App

```bash
# Iniciar servidor de desarrollo
npm start

# Ejecutar en iOS
npm run ios

# Ejecutar en Android
npm run android
```

## Configuración de Notificaciones

Las notificaciones funcionan automáticamente con Expo. Asegúrate de:
1. Solicitar permisos al usuario (se hace automáticamente)
2. Probar en dispositivo físico (las notificaciones no funcionan en simulador)

## Configuración de Calendario (Premium)

Para la sincronización con calendario:
1. Los permisos se solicitan automáticamente
2. Requiere dispositivo físico
3. Funciona con el calendario nativo del dispositivo

## Build para Producción

### Usando EAS Build (Recomendado)

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login
eas login

# Configurar
eas build:configure

# Build para iOS
eas build --platform ios

# Build para Android
eas build --platform android
```

### Usando Expo Build (Legacy)

```bash
# iOS
expo build:ios

# Android
expo build:android
```

## Troubleshooting

### RevenueCat no funciona
- Verifica que las API keys estén correctas
- Asegúrate de que los productos estén configurados en RevenueCat
- Verifica que el entitlement `premium` esté creado y asociado

### Notificaciones no funcionan
- Prueba en dispositivo físico (no simulador)
- Verifica permisos en configuración del dispositivo
- Revisa la configuración de notificaciones en app.json

### Errores de compilación
- Limpia el caché: `expo start -c`
- Reinstala dependencias: `rm -rf node_modules && npm install`
- Verifica la versión de Node.js (v16 o superior)

## Soporte

Para problemas o preguntas:
- Email: support@cebr.xyz
- Revisa la documentación de [Expo](https://docs.expo.dev)
- Revisa la documentación de [RevenueCat](https://docs.revenuecat.com)

