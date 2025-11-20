# Instrucciones para Arrancar LexFlow

## Paso 1: Asegúrate de tener todo instalado

```bash
# Verifica que tienes Node.js instalado
node --version

# Si no tienes Node.js, instálalo desde https://nodejs.org/

# Instala las dependencias (solo la primera vez)
npm install
```

## Paso 2: Inicia el servidor de desarrollo

```bash
# Desde la carpeta del proyecto
cd /Users/luiscebrianfraile/Desktop/ProyectosCoding/LexFlow

# Inicia Expo
npx expo start --clear
```

## Paso 3: Conecta tu dispositivo

### Opción A: Usando Expo Go (Recomendado para desarrollo)

1. **Instala Expo Go en tu teléfono:**
   - iOS: Descarga "Expo Go" desde el App Store
   - Android: Descarga "Expo Go" desde Google Play Store

2. **Conecta tu teléfono:**
   - **Misma red WiFi:** Asegúrate de que tu teléfono y tu computadora están en la misma red WiFi
   - **Escanea el QR:** Cuando ejecutes `npx expo start`, verás un código QR en la terminal
   - **iOS:** Abre la app Cámara y escanea el QR
   - **Android:** Abre Expo Go y presiona "Scan QR code"

### Opción B: Usando el simulador/emulador

**Para iOS (solo en Mac):**
```bash
# Presiona 'i' en la terminal después de iniciar expo start
# O ejecuta:
npx expo start --ios
```

**Para Android:**
```bash
# Presiona 'a' en la terminal después de iniciar expo start
# O ejecuta:
npx expo start --android
```

## Paso 4: Recarga la app

Si haces cambios en el código:
- **En Expo Go:** Sacude el dispositivo y presiona "Reload"
- **En simulador:** Presiona `Cmd + R` (iOS) o `R` dos veces (Android)
- **Desde terminal:** Presiona `r` en la terminal de Expo

## Solución de Problemas

### Si la app está en blanco:

1. **Verifica la conexión:**
   - Asegúrate de que tu teléfono y computadora están en la misma WiFi
   - Verifica que no hay firewall bloqueando la conexión

2. **Limpia el caché:**
   ```bash
   npx expo start --clear
   ```

3. **Reinstala dependencias:**
   ```bash
   rm -rf node_modules
   npm install
   ```

4. **Verifica los logs:**
   - En Expo Go: Sacude el dispositivo y presiona "Show Dev Menu" → "Show Logs"
   - En la terminal: Revisa los errores que aparecen

### Si el puerto está ocupado:

```bash
# Mata procesos en el puerto 8081
lsof -ti:8081 | xargs kill -9

# O usa otro puerto
npx expo start --port 8083
```

### Si no puedes conectar:

1. **Verifica la IP:**
   - En la terminal de Expo, verás algo como: `exp://192.168.1.100:8081`
   - Asegúrate de que esa IP es accesible desde tu teléfono

2. **Usa Tunnel (más lento pero más confiable):**
   ```bash
   npx expo start --tunnel
   ```

## Comandos Útiles

```bash
# Iniciar con caché limpio
npx expo start --clear

# Iniciar en modo desarrollo
npx expo start --dev-client

# Ver información del proyecto
npx expo config

# Verificar problemas
npx expo doctor
```

