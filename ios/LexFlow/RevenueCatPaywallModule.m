#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(RevenueCatPaywallModule, NSObject)

RCT_EXTERN_METHOD(presentPaywall:(NSString *)offeringIdentifier
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

@end

