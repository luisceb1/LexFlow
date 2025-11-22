import React, { createContext, useContext, useEffect, useState } from 'react';
import { SubscriptionService } from '../utils/subscriptionService';
import Purchases from 'react-native-purchases';

const SubscriptionContext = createContext(null);

export const useSubscription = () => {
    const context = useContext(SubscriptionContext);
    if (!context) {
        throw new Error('useSubscription must be used within SubscriptionProvider');
    }
    return context;
};

export const SubscriptionProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [customerInfo, setCustomerInfo] = useState(null);

    const sincronizarConRevenueCat = async () => {
        try {
            const info = await SubscriptionService.obtenerInfoCliente();
            setCustomerInfo(info);
        } catch (error) {
            console.error('Error sincronizando con RevenueCat:', error);
        }
    };

    const inicializar = async () => {
        try {
            // Inicializar RevenueCat (no esperar si hay error)
            await SubscriptionService.inicializar();
            // Sincronizar con RevenueCat en segundo plano
            await sincronizarConRevenueCat();
        } catch (error) {
            console.error('Error inicializando RevenueCat:', error);
            // Continuar sin RevenueCat si hay error
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        inicializar();
    }, []);

    return (
        <SubscriptionContext.Provider
            value={{
                isLoading,
                customerInfo,
                sincronizarConRevenueCat,
            }}
        >
            {children}
        </SubscriptionContext.Provider>
    );
};

