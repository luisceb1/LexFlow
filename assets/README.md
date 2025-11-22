# Assets

Esta carpeta debe contener los siguientes archivos de imagen:

## Requeridos

- `icon.png` - Icono de la app (1024x1024px) - **REQUERIDO**
- `splash.png` - Imagen de splash screen (1242x2436px recomendado) - **REQUERIDO**
- `adaptive-icon.png` - Icono adaptativo para Android (1024x1024px) - **REQUERIDO**

## Opcionales

- `favicon.png` - Favicon para web (48x48px)
- `notification-icon.png` - Icono para notificaciones (96x96px)

## Generación de Assets

### Opción 1: Herramienta Online (Más Fácil)

1. Ve a [AppIcon.co](https://www.appicon.co/)
2. Sube tu imagen base del icono de calendario
3. Selecciona "iOS + Android"
4. Descarga el paquete
5. Extrae los archivos a esta carpeta (`assets/`)

### Opción 2: Script Automático

Si tienes ImageMagick instalado:

```bash
# Coloca tu imagen base en la raíz del proyecto como "icono-calendario.png"
node scripts/generate-assets.js icono-calendario.png
```

### Opción 3: Manual

Crea los archivos manualmente con las dimensiones especificadas usando herramientas como:
- Figma
- Sketch
- Adobe Illustrator
- Photoshop

## Especificaciones del Nuevo Icono

El nuevo icono es un **calendario minimalista con círculo**:
- **Estilo**: Outline, azul oscuro sobre fondo blanco
- **Elementos**: Calendario con anillos superiores + círculo en esquina inferior derecha
- **Color principal**: Azul oscuro (#1E3A8A o similar)
- **Fondo**: Blanco (#FFFFFF)

## Notas Importantes

- Todos los iconos deben tener fondo transparente o sólido según el diseño
- El icono principal debe ser reconocible a tamaños pequeños
- El splash screen debe coincidir con el tema de la app
- El adaptive icon de Android debe tener el icono en la "zona segura" (centro con padding del 20%)

## Verificar los Cambios

Después de actualizar los assets:

```bash
# Limpiar y regenerar builds nativos
npx expo prebuild --clean

# Ejecutar en iOS
npx expo run:ios

# Ejecutar en Android
npx expo run:android
```

## Colores del Icono

El icono usa azul oscuro. Si quieres que la app coincida:

- **Primary Color**: `#1E3A8A` (Azul oscuro)
- **Background**: `#FFFFFF` (Blanco)
- **Text**: `#1F2937` (Gris oscuro)

