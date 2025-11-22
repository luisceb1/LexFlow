# Guía: Configurar Paywall de RevenueCat

## Problema Actual
El paywall no se muestra porque no está configurado correctamente en el RevenueCat Dashboard.

## Pasos para Configurar el Paywall

### 1. Acceder al RevenueCat Dashboard
1. Ve a [RevenueCat Dashboard](https://app.revenuecat.com)
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto **LexFlow**

### 2. Verificar que el Offering Exista
1. Ve a **Offerings** en el menú lateral
2. Verifica que exista un offering llamado **"default"**
3. Si no existe, créalo:
   - Haz clic en **"Create Offering"**
   - Nombre: `default`
   - Marca como **"Current Offering"** (esto es importante)

### 3. Verificar que el Offering Tenga Paquetes
1. En el offering "default", verifica que tenga al menos un paquete:
   - **Monthly** (Product ID: `monthly`)
   - **Annual** (Product ID: `annual`)
2. Si no tiene paquetes, agrégalos:
   - Haz clic en **"Add Package"**
   - Selecciona los productos que creaste

### 4. Crear y Configurar el Paywall (IMPORTANTE)
1. Ve a **Paywalls** en el menú lateral
2. Haz clic en **"Create Paywall"**
3. Configura el paywall:
   - **Nombre**: `LexFlow Paywall` (o el que prefieras)
   - **Template**: Selecciona un template (puedes personalizarlo después)
   - **Estado**: Debe estar en **"Published"** (no "Draft")
4. **Asociar el Paywall al Offering**:
   - Ve de vuelta a **Offerings**
   - Selecciona el offering "default"
   - En la sección **"Paywall"**, selecciona el paywall que acabas de crear
   - **GUARDA LOS CAMBIOS**

### 5. Verificar Productos en App Store Connect
1. Ve a [App Store Connect](https://appstoreconnect.apple.com)
2. Verifica que los productos estén:
   - **Creados**: `monthly` y `annual`
   - **Aprobados**: Deben estar en estado "Ready to Submit" o "Approved"
   - **En el mismo Subscription Group**: Ambos productos deben estar en el mismo grupo

### 6. Verificar la Configuración en el Código
El código ya está configurado correctamente:
- ✅ API Key configurada en `src/context/PremiumContext.js`
- ✅ Módulo nativo configurado en iOS y Android
- ✅ PaywallViewController usando el SDK oficial de RevenueCat

## Verificación
Después de configurar todo:

1. **Reinicia la app** (cierra completamente y vuelve a abrir)
2. **Abre el paywall** desde la app
3. **Revisa los logs** en la consola:
   - Deberías ver: `✅ Paywall ID del offering: [ID del paywall]`
   - Si ves: `⚠️ El offering no tiene paywall configurado`, el paywall no está asociado al offering

## Errores Comunes

### Error: "NO_OFFERING"
- **Causa**: El offering "default" no existe o no está marcado como "Current Offering"
- **Solución**: Crea el offering y márcalo como "Current Offering"

### Error: "NO_PACKAGES"
- **Causa**: El offering no tiene paquetes asociados
- **Solución**: Agrega los paquetes (monthly, annual) al offering

### Error: "El offering no tiene paywall configurado"
- **Causa**: El paywall no está asociado al offering en el dashboard
- **Solución**: Ve a Offerings → "default" → Asocia el paywall creado

### Paywall se muestra pero está vacío
- **Causa**: Los productos no están aprobados en App Store Connect
- **Solución**: Asegúrate de que los productos estén en estado "Ready to Submit" o "Approved"

## Notas Importantes
- ⚠️ El paywall debe estar en estado **"Published"** para que se muestre
- ⚠️ El offering debe estar marcado como **"Current Offering"**
- ⚠️ Los productos deben estar **aprobados** en App Store Connect
- ⚠️ En el simulador, los errores de StoreKit (Code 509) son normales - necesitas un dispositivo real o un sandbox tester para probar compras

## Recursos
- [Documentación de RevenueCat Paywalls](https://www.revenuecat.com/docs/tools/paywalls)
- [Crear Paywalls](https://www.revenuecat.com/docs/tools/paywalls/creating-paywalls)
- [Mostrar Paywalls](https://www.revenuecat.com/docs/tools/paywalls/displaying-paywalls)

