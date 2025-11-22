# Guía: Actualizar Iconos y Splash Screen

## Imagen Base Requerida

Necesitas tener el archivo de imagen del icono de calendario en formato PNG o SVG.

## Pasos para Actualizar los Iconos

### Opción 1: Usando Herramientas Online (Recomendado)

1. **Prepara tu imagen base:**
   - Formato: PNG con fondo transparente o SVG
   - Tamaño mínimo: 1024x1024px
   - El icono debe estar centrado

2. **Genera todos los tamaños necesarios:**
   
   **Herramienta recomendada:** [AppIcon.co](https://www.appicon.co/)
   
   - Sube tu imagen base
   - Selecciona "iOS + Android"
   - Descarga el paquete generado
   - Extrae los archivos a la carpeta `assets/`

3. **Archivos necesarios:**
   - `icon.png` (1024x1024px) - Icono principal
   - `splash.png` (1242x2436px o 2048x2732px) - Splash screen
   - `adaptive-icon.png` (1024x1024px) - Para Android adaptive icon

### Opción 2: Manual con Herramientas de Diseño

Si prefieres crear los assets manualmente:

#### 1. Icono Principal (`icon.png`)
- Tamaño: 1024x1024px
- Formato: PNG
- Fondo: Transparente o blanco según tu diseño
- El icono debe estar centrado con padding adecuado

#### 2. Splash Screen (`splash.png`)
- Tamaño recomendado: 1242x2436px (iPhone) o 2048x2732px (iPad)
- Formato: PNG
- Fondo: Blanco (#ffffff) o el color de tu app
- El icono debe estar centrado, más grande que en el icono de la app

#### 3. Adaptive Icon Android (`adaptive-icon.png`)
- Tamaño: 1024x1024px
- Formato: PNG
- Fondo: Transparente
- El icono debe estar en la zona segura (centro, con padding del 20%)

### Opción 3: Usando Expo CLI (Si tienes la imagen base)

```bash
# Instala expo-cli si no lo tienes
npm install -g expo-cli

# Genera los assets automáticamente
npx expo-asset-generator --input tu-icono-base.png --output assets/
```

## Estructura de Archivos Final

Después de generar los assets, tu carpeta `assets/` debe tener:

```
assets/
├── icon.png              (1024x1024px)
├── splash.png            (1242x2436px o mayor)
├── adaptive-icon.png     (1024x1024px)
├── favicon.png           (48x48px - opcional)
└── notification-icon.png (96x96px - opcional)
```

## Colores del Nuevo Icono

Según la descripción del icono:
- **Color principal**: Azul oscuro (dark blue)
- **Fondo**: Blanco (#ffffff)
- **Estilo**: Minimalista, outline

### Sugerencia de Colores para la App:

```javascript
// Colores que podrías usar en tu app para coincidir con el icono
const colors = {
  primary: '#1E3A8A',      // Azul oscuro (similar al icono)
  background: '#FFFFFF',   // Blanco
  text: '#1F2937',         // Gris oscuro para texto
  // ... otros colores
}
```

## Actualización Automática

Una vez que coloques los archivos en la carpeta `assets/`, la configuración en `app.json` ya está lista para usarlos.

## Verificar los Cambios

Después de actualizar los archivos:

1. **Para iOS:**
   ```bash
   npx expo prebuild --clean
   npx expo run:ios
   ```

2. **Para Android:**
   ```bash
   npx expo prebuild --clean
   npx expo run:android
   ```

3. **Para ver el splash screen:**
   - Cierra completamente la app
   - Ábrela de nuevo
   - Deberías ver el nuevo splash screen

## Notas Importantes

1. **Fondo del Splash Screen**: Actualmente está configurado como blanco (#ffffff). Si quieres cambiarlo, edita `app.json`:
   ```json
   "splash": {
     "backgroundColor": "#TU_COLOR_AQUI"
   }
   ```

2. **Adaptive Icon Android**: El fondo del adaptive icon está configurado como blanco. Si quieres cambiarlo:
   ```json
   "adaptiveIcon": {
     "backgroundColor": "#TU_COLOR_AQUI"
   }
   ```

3. **Tamaños Mínimos**: Asegúrate de que las imágenes tengan al menos los tamaños especificados para evitar pixelación.

## Si Necesitas Ayuda

Si tienes problemas generando los assets, puedes:
1. Usar herramientas online como AppIcon.co
2. Contratar un diseñador para crear los assets
3. Usar herramientas de diseño como Figma, Sketch, o Adobe Illustrator

