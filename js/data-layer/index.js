// Happy Stay - DataLayer Factory
// Abstraction pour basculer entre Mock et API

import { MockDataLayer } from './mock-data-layer.js';
import { SupabaseDataLayer } from './supabase-data-layer.js';

/**
 * Factory pour créer la bonne instance de DataLayer
 * selon la configuration
 */
export function DataLayerFactory() {
    if (window.HS_MOCK) {
        console.log('🎭 DataLayer: Mode MOCK activé');
        return new MockDataLayer();
    } else if (window.HS_USE_SUPABASE) {
        console.log('🌐 DataLayer: Mode SUPABASE activé');
        return new SupabaseDataLayer();
    } else {
        throw new Error("Aucun DataLayer actif ! Vérifiez la configuration.");
    }
}

/**
 * Instance globale du DataLayer
 * À utiliser partout dans l'application
 */
export const dataLayer = DataLayerFactory();

// Export pour debug
window.HS_DATA_LAYER = dataLayer;