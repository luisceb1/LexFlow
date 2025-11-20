package com.cebr.lexflow

import android.app.Activity
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.revenuecat.purchases.Purchases
import com.revenuecat.purchases.getOfferingsWith
import com.revenuecat.purchases.ui.revenuecatui.PaywallDialog
import com.revenuecat.purchases.ui.revenuecatui.PaywallDialogOptions

class RevenueCatPaywallModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "RevenueCatPaywallModule"
    }

    @ReactMethod
    fun presentPaywall(offeringIdentifier: String, promise: Promise) {
        val activity = currentActivity
        if (activity == null) {
            promise.reject("NO_ACTIVITY", "No se pudo encontrar la actividad actual")
            return
        }

        // Obtener el offering
        Purchases.sharedInstance.getOfferingsWith(
            onSuccess = { offerings ->
                // Buscar el offering por ID o usar el current
                val offering = if (offeringIdentifier.isEmpty() || offeringIdentifier == "default") {
                    offerings.current
                } else {
                    offerings.getOffering(offeringIdentifier)
                }

                if (offering == null) {
                    promise.reject("NO_OFFERING", "No se encontró el offering con ID: $offeringIdentifier")
                    return@getOfferingsWith
                }

                // Crear y mostrar el PaywallDialog
                val options = PaywallDialogOptions.Builder()
                    .setOffering(offering)
                    .build()

                PaywallDialog.show(activity, options) { result ->
                    when (result) {
                        is PaywallDialog.Result.PurchaseCompleted -> {
                            promise.resolve(mapOf(
                                "success" to true,
                                "offeringIdentifier" to offering.identifier
                            ))
                        }
                        is PaywallDialog.Result.RestoreCompleted -> {
                            promise.resolve(mapOf(
                                "success" to true,
                                "restored" to true,
                                "offeringIdentifier" to offering.identifier
                            ))
                        }
                        is PaywallDialog.Result.Cancelled -> {
                            promise.reject("CANCELLED", "El usuario canceló el paywall")
                        }
                        is PaywallDialog.Result.Error -> {
                            promise.reject("PAYWALL_ERROR", result.error.message ?: "Error desconocido", result.error)
                        }
                    }
                }
            },
            onError = { error ->
                promise.reject("OFFERINGS_ERROR", error.message ?: "Error al obtener offerings", error)
            }
        )
    }
}

