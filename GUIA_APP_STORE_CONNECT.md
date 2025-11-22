# Guía: Configurar Productos de Compra In-App en App Store Connect

## Problema
Apple requiere que todos los productos de compra in-app (IAP) estén enviados para revisión antes de poder revisar la app.

## Productos Requeridos

Según tu código, necesitas crear estos 3 productos en App Store Connect:

1. **Mensual** - Product ID: `monthly` - Precio: 0,50 €/mes
2. **Anual** - Product ID: `annual` - Precio: 4,00 €/año  
3. **De por Vida** - Product ID: `lifetime1` - Precio: 22,99 € (compra única)

## Pasos Detallados

### Paso 1: Acceder a App Store Connect

1. Ve a [App Store Connect](https://appstoreconnect.apple.com)
2. Inicia sesión con tu cuenta de desarrollador
3. Selecciona tu app **LexFlow**

### Paso 2: Crear Subscription Group (Solo para suscripciones)

1. En la sección de tu app, ve a **Features** → **In-App Purchases**
2. Si es la primera vez, crea un **Subscription Group**:
   - Haz clic en **"+"** o **"Create Subscription Group"**
   - Nombre del grupo: `LexFlow Pro` (o el nombre que prefieras)
   - **IMPORTANTE**: Todas las suscripciones (mensual y anual) DEBEN estar en el mismo grupo

### Paso 3: Crear Producto 1 - Suscripción Mensual

1. En el Subscription Group creado, haz clic en **"+"** para agregar una suscripción
2. Completa la información:

   **Información Básica:**
   - **Reference Name**: `LexFlow Pro Mensual` (solo para referencia interna)
   - **Product ID**: `monthly` (DEBE coincidir exactamente con el código)
   - **Subscription Duration**: `1 Month`

   **Precios:**
   - Selecciona el precio: **0,50 €** (o el equivalente en tu región)
   - Asegúrate de que el precio esté activo

   **Metadata Requerido:**
   - **Display Name**: `LexFlow Pro Mensual` (o `Mensual`)
   - **Description**: Describe qué incluye la suscripción mensual
     Ejemplo: "Acceso completo a todas las funciones premium de LexFlow durante un mes"

   **App Review Information:**
   - **Screenshot**: **REQUERIDO** - Sube una captura de pantalla del paywall mostrando este producto
   - **Review Notes**: Opcional, pero recomendado

3. Haz clic en **"Save"**

### Paso 4: Crear Producto 2 - Suscripción Anual

1. En el **mismo Subscription Group**, haz clic en **"+"** para agregar otra suscripción
2. Completa la información:

   **Información Básica:**
   - **Reference Name**: `LexFlow Pro Anual`
   - **Product ID**: `annual` (DEBE coincidir exactamente)
   - **Subscription Duration**: `1 Year`

   **Precios:**
   - Selecciona el precio: **4,00 €** (o el equivalente)
   - Asegúrate de que el precio esté activo

   **Metadata Requerido:**
   - **Display Name**: `LexFlow Pro Anual` (o `Anual`)
   - **Description**: Describe qué incluye la suscripción anual
     Ejemplo: "Acceso completo a todas las funciones premium de LexFlow durante un año"

   **App Review Information:**
   - **Screenshot**: **REQUERIDO** - Sube una captura de pantalla del paywall mostrando este producto
   - **Review Notes**: Opcional

3. Haz clic en **"Save"**

### Paso 5: Crear Producto 3 - Compra de por Vida

1. En la sección **In-App Purchases**, haz clic en **"+"** y selecciona **"Non-Consumable"** (No consumible)
2. Completa la información:

   **Información Básica:**
   - **Reference Name**: `LexFlow Pro Lifetime`
   - **Product ID**: `lifetime1` (DEBE coincidir exactamente)

   **Precios:**
   - Selecciona el precio: **22,99 €** (o el equivalente)
   - Asegúrate de que el precio esté activo

   **Metadata Requerido:**
   - **Display Name**: `LexFlow Pro de por Vida` (o `De por Vida`)
   - **Description**: Describe qué incluye la compra de por vida
     Ejemplo: "Acceso completo y permanente a todas las funciones premium de LexFlow"

   **App Review Information:**
   - **Screenshot**: **REQUERIDO** - Sube una captura de pantalla del paywall mostrando este producto
   - **Review Notes**: Opcional

3. Haz clic en **"Save"**

### Paso 6: Configurar Localización (Opcional pero Recomendado)

Para cada producto, puedes agregar localizaciones en diferentes idiomas:
1. Haz clic en el producto
2. Ve a la sección **Localizations**
3. Agrega traducciones para los nombres y descripciones

### Paso 7: Obtener Capturas de Pantalla del Paywall

**CRÍTICO**: Apple requiere capturas de pantalla del paywall mostrando cada producto.

**Cómo obtenerlas:**

1. **Opción A - Desde un dispositivo físico:**
   - Ejecuta la app en un dispositivo iOS real
   - Navega hasta la pantalla del paywall
   - Toma capturas de pantalla mostrando cada producto

2. **Opción B - Desde el simulador:**
   - Ejecuta la app en el simulador de iOS
   - Navega hasta el paywall
   - Toma capturas de pantalla (⌘ + S)

**Requisitos de las capturas:**
- Deben mostrar claramente el producto y su precio
- Deben ser de alta calidad
- Formato recomendado: PNG o JPG
- Tamaño mínimo: 640x1136 pixels (iPhone 5/SE)
- Tamaño ideal: 1242x2208 pixels (iPhone 6.5")

### Paso 8: Subir Capturas de Pantalla a Cada Producto

1. Para cada producto (mensual, anual, lifetime1):
   - Haz clic en el producto
   - Ve a la sección **App Review Information**
   - Haz clic en **"Choose File"** o **"Upload"**
   - Sube la captura de pantalla correspondiente
   - Guarda los cambios

### Paso 9: Enviar Productos para Revisión

1. Para cada producto:
   - Verifica que toda la información esté completa
   - Verifica que la captura de pantalla esté subida
   - Haz clic en **"Submit for Review"** o **"Ready to Submit"**
   - El estado cambiará a **"Waiting for Review"**

### Paso 10: Verificar Estado de los Productos

1. En la lista de productos, verifica que todos muestren:
   - Estado: **"Ready to Submit"** o **"Waiting for Review"**
   - Todos los campos requeridos completos (marcados con ✓)

### Paso 11: Subir Nuevo Binary de la App

Una vez que los productos estén enviados para revisión:

1. Ve a **App Store Connect** → Tu app → **App Store**
2. Ve a la sección **1.0 Prepare for Submission**
3. Sube un nuevo binary (nueva versión de la app)
4. En la sección **In-App Purchases**, verifica que aparezcan tus 3 productos
5. Envía la app para revisión

## Checklist Final

Antes de enviar, verifica:

- [ ] Los 3 productos están creados con los Product IDs correctos:
  - [ ] `monthly`
  - [ ] `annual`
  - [ ] `lifetime1`
- [ ] Las suscripciones (mensual y anual) están en el mismo Subscription Group
- [ ] Cada producto tiene:
  - [ ] Display Name configurado
  - [ ] Description configurada
  - [ ] Precio configurado y activo
  - [ ] **Captura de pantalla del paywall subida** ⚠️ CRÍTICO
- [ ] Todos los productos están en estado **"Ready to Submit"** o **"Waiting for Review"**
- [ ] Has subido un nuevo binary de la app
- [ ] La app está lista para enviar a revisión

## Notas Importantes

1. **Product IDs deben coincidir exactamente** con los del código:
   - `monthly` (no `mensual` ni `monthly_subscription`)
   - `annual` (no `anual` ni `annual_subscription`)
   - `lifetime1` (no `lifetime` ni `lifetime_purchase`)

2. **Las capturas de pantalla son OBLIGATORIAS** - Sin ellas, Apple rechazará los productos

3. **Tiempo de revisión**: Los productos pueden tardar 24-48 horas en ser revisados

4. **RevenueCat**: Una vez que los productos estén aprobados en App Store Connect, asegúrate de que estén correctamente configurados en tu dashboard de RevenueCat

## Solución de Problemas

### Error: "Product ID already exists"
- Verifica si ya creaste el producto anteriormente
- Si existe, edítalo en lugar de crear uno nuevo

### Error: "Screenshot required"
- Asegúrate de subir una captura de pantalla para cada producto
- La captura debe mostrar el producto en el paywall de la app

### Los productos no aparecen en RevenueCat
- Verifica que los Product IDs coincidan exactamente
- Espera unos minutos después de crear los productos en App Store Connect
- Verifica que los productos estén en estado "Ready to Submit" o "Approved"

## Recursos Adicionales

- [Documentación de Apple sobre In-App Purchases](https://developer.apple.com/in-app-purchase/)
- [Guía de RevenueCat para App Store Connect](https://docs.revenuecat.com/docs/ios-products)

## Contacto

Si tienes problemas, verifica:
1. Que los Product IDs coincidan exactamente con el código
2. Que las capturas de pantalla estén subidas
3. Que los productos estén en el mismo Subscription Group (para suscripciones)

