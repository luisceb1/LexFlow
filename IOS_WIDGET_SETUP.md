# Configuración del Widget para iOS

Para que el widget funcione en iOS, necesitas seguir estos pasos en Xcode:

## 1. Crear Widget Extension

1. Abre el proyecto en Xcode: `ios/LexFlow.xcworkspace`
2. File → New → Target
3. Selecciona "Widget Extension"
4. Nombre: `TimerWidget`
5. Language: Swift
6. Include Configuration Intent: ✅ (marcado)
7. Finish

## 2. Configurar App Group

1. Selecciona el target principal "LexFlow"
2. Ve a "Signing & Capabilities"
3. Click en "+ Capability"
4. Agrega "App Groups"
5. Crea un nuevo grupo: `group.com.cebr.lexflow`
6. Repite el mismo proceso para el target "TimerWidget"

## 3. Reemplazar archivos del Widget Extension

1. En el target "TimerWidget", elimina los archivos generados automáticamente
2. Agrega los archivos creados en `ios/LexFlow/TimerWidget/`:
   - `TimerWidgetEntry.swift`
   - `TimerWidget.swift`
   - `TimerWidgetProvider.swift`
   - `TimerWidgetBundle.swift`
   - `PauseTimerIntent.swift`

## 4. Configurar Info.plist del Widget

En el Info.plist del widget extension, asegúrate de tener:
- `NSExtension` → `NSExtensionPointIdentifier`: `com.apple.widgetkit-extension`

## 5. Agregar módulo React Native

1. Agrega `TimerWidgetModule.swift` y `TimerWidgetModule.m` al target principal "LexFlow"
2. Asegúrate de que estén incluidos en "Compile Sources"

## 6. Configurar Entitlements

Asegúrate de que ambos targets (LexFlow y TimerWidget) tengan el mismo App Group configurado en sus archivos `.entitlements`:
- `com.apple.security.application-groups`: `group.com.cebr.lexflow`

## 7. Compilar y Probar

1. Compila el proyecto: `npx expo run:ios`
2. En el simulador o dispositivo, mantén presionado en la pantalla de inicio
3. Click en el "+" para agregar widgets
4. Busca "LexFlow Timer" y agrégalo

## Notas

- El widget se actualiza automáticamente cada minuto cuando está corriendo
- Los botones de pausar/reanudar requieren iOS 16+ (App Intents)
- Para iOS 14-15, los botones no estarán disponibles pero el widget mostrará la información

