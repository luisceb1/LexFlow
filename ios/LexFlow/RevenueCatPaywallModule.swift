import Foundation
import ObjectiveC
import React
import RevenueCat
import RevenueCatUI

@objc(RevenueCatPaywallModule)
class RevenueCatPaywallModule: NSObject, RCTBridgeModule {
  
  var bridge: RCTBridge!
  
  static func moduleName() -> String {
    return "RevenueCatPaywallModule"
  }
  
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  @objc
  func presentPaywall(_ offeringIdentifier: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      // Intentar múltiples formas de obtener el root view controller
      var rootViewController: UIViewController?
      
      // Método 1: A través de windowScene (iOS 13+)
      if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
         let window = windowScene.windows.first(where: { $0.isKeyWindow }) ?? windowScene.windows.first {
        rootViewController = window.rootViewController
      }
      
      // Método 2: A través del AppDelegate (fallback)
      if rootViewController == nil,
         let appDelegate = UIApplication.shared.delegate as? UIResponder,
         let window = appDelegate.value(forKey: "window") as? UIWindow {
        rootViewController = window.rootViewController
      }
      
      // Método 3: A través de keyWindow (iOS 12 y anteriores)
      if rootViewController == nil,
         let window = UIApplication.shared.keyWindow {
        rootViewController = window.rootViewController
      }
      
      guard let finalRootViewController = rootViewController else {
        rejecter("NO_ROOT_VIEW_CONTROLLER", "No se pudo encontrar el root view controller. Asegúrate de que la app esté completamente cargada.", nil)
        return
      }
      
      // Invalidar la caché de customer info para forzar una actualización completa
      Purchases.shared.invalidateCustomerInfoCache()
      
      // Delay para asegurar que la invalidación se procese
      DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
        Purchases.shared.getOfferings { (offerings, error) in
          if let error = error {
            var errorMessage = "Error obteniendo offerings: \(error.localizedDescription)"
            if let rcError = error as? RevenueCat.ErrorCode {
              errorMessage += "\n\nCódigo de error: \(rcError.rawValue)"
            }
            rejecter("OFFERINGS_ERROR", errorMessage, error)
            return
          }
          
          guard let offerings = offerings else {
            rejecter("NO_OFFERINGS", "No se encontraron offerings. Verifica la configuración en RevenueCat Dashboard.", nil)
            return
          }
          
          // Buscar el offering por ID, con fallback a "default" o "current"
          var offering: Offering?
          
          if !offeringIdentifier.isEmpty && offeringIdentifier != "default" {
            offering = offerings.offering(identifier: offeringIdentifier)
          }
          
          if offering == nil {
            offering = offerings.offering(identifier: "default")
          }
          
          if offering == nil {
            offering = offerings.current
          }
          
          guard let targetOffering = offering else {
            let availableOfferings = Array(offerings.all.keys).joined(separator: ", ")
            let currentId = offerings.current?.identifier ?? "ninguno"
            rejecter("NO_OFFERING", "No se encontró ningún offering disponible.\n\nID solicitado: \(offeringIdentifier)\nOfferings disponibles: \(availableOfferings.isEmpty ? "ninguno" : availableOfferings)\nCurrent offering: \(currentId)", nil)
            return
          }
          
          if targetOffering.availablePackages.isEmpty {
            rejecter("NO_PACKAGES", "El offering '\(targetOffering.identifier)' no tiene paquetes disponibles.\n\nVerifica en RevenueCat Dashboard que los productos estén correctamente asociados al offering.", nil)
            return
          }
          
          self.presentPaywallViewController(targetOffering: targetOffering, rootViewController: finalRootViewController, resolver: resolver, rejecter: rejecter)
        }
      }
    }
  }
  
  private func presentPaywallViewController(targetOffering: Offering, rootViewController: UIViewController, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    guard #available(iOS 15.0, *) else {
      rejecter("IOS_VERSION_ERROR", "PaywallViewController requiere iOS 15.0 o superior. Tu dispositivo está ejecutando una versión anterior.", nil)
      return
    }
    
    // Encontrar el view controller más superior (el que está visible actualmente)
    var topViewController = rootViewController
    while let presented = topViewController.presentedViewController {
      topViewController = presented
    }
    
    // Crear el PaywallViewController
    let paywallViewController = PaywallViewController(offering: targetOffering)
    
    // Configurar el estilo de presentación del modal
    paywallViewController.modalPresentationStyle = .pageSheet
    if #available(iOS 15.0, *) {
      if let sheet = paywallViewController.sheetPresentationController {
        sheet.detents = [.large()]
        sheet.prefersGrabberVisible = true
      }
    }
    
    // Mantener una referencia fuerte al delegate para evitar que se desasigne
    let paywallDelegate = PaywallDelegate(resolver: resolver, rejecter: rejecter)
    paywallViewController.delegate = paywallDelegate
    objc_setAssociatedObject(paywallViewController, "paywallDelegate", paywallDelegate, .OBJC_ASSOCIATION_RETAIN_NONATOMIC)
    
    // Presentar en el hilo principal
    DispatchQueue.main.async {
      topViewController.present(paywallViewController, animated: true) {
        resolver(["success": true, "offeringIdentifier": targetOffering.identifier])
      }
    }
  }
}

@available(iOS 15.0, *)
class PaywallDelegate: NSObject, PaywallViewControllerDelegate {
  let resolver: RCTPromiseResolveBlock
  let rejecter: RCTPromiseRejectBlock
  
  init(resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    self.resolver = resolver
    self.rejecter = rejecter
  }
  
  func paywallViewController(_ controller: PaywallViewController, didFinishPurchasingWith customerInfo: CustomerInfo) {
    controller.dismiss(animated: true) {
      self.resolver(["success": true])
    }
  }
  
  func paywallViewController(_ controller: PaywallViewController, didFinishRestoringWith customerInfo: CustomerInfo) {
    controller.dismiss(animated: true) {
      self.resolver(["success": true, "restored": true])
    }
  }
  
  func paywallViewControllerWasDismissed(_ controller: PaywallViewController) {
    // El usuario cerró el paywall sin comprar
    self.rejecter("CANCELLED", "El usuario canceló el paywall", nil)
  }
}

