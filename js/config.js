// Happy Stay - Configuration globale
// Flags pour basculer entre mock et API réelle

// =================================
// FLAGS PRINCIPAUX
// =================================

// Mode Supabase (MAINTENANT = true)
window.HS_MOCK = false;
window.HS_USE_SUPABASE = true;

// Configuration Supabase
window.HS_SUPABASE_URL = "https://lbvfsqwbhtxyrpzbbyil.supabase.co";
window.HS_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxidmZzcXdiaHR4eXJwemJieWlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2ODczMjgsImV4cCI6MjA3MTI2MzMyOH0.iXy3PvMii7qN43D6I_fN_IsaDXUE57leU1U5BliPKuI";

// n8n Upload (plus tard)
window.HS_USE_N8N_UPLOAD = false;
window.HS_N8N_UPLOAD_WEBHOOK = "";

// =================================
// CONFIGURATION MÉTIER
// =================================

// Créneaux horaires fixes
window.HS_TIME_SLOTS = ['10:00', '13:30', '15:00'];

// Limites photos
window.HS_MIN_PHOTOS = 2;
window.HS_MAX_PHOTOS = 4;

// Services autorisés
window.HS_ALLOWED_SERVICES = [
    'Canapé/Fauteuil',
    'Chaises', 
    'Matelas'
];

// Capacité par créneau
window.HS_SLOT_CAPACITY = 2;

// =================================
// UTILITAIRES
// =================================

window.HS_CONFIG = {
    isMockMode: () => window.HS_MOCK,
    isSupabaseEnabled: () => window.HS_USE_SUPABASE && !window.HS_MOCK,
    isN8nUploadEnabled: () => window.HS_USE_N8N_UPLOAD && !window.HS_MOCK,
    
    getTimeSlots: () => window.HS_TIME_SLOTS,
    getPhotoLimits: () => ({ min: window.HS_MIN_PHOTOS, max: window.HS_MAX_PHOTOS }),
    getAllowedServices: () => window.HS_ALLOWED_SERVICES,
    getSlotCapacity: () => window.HS_SLOT_CAPACITY
};

console.log('🔧 Happy Stay Config loaded:', {
    mockMode: window.HS_CONFIG.isMockMode(),
    supabase: window.HS_CONFIG.isSupabaseEnabled(),
    n8nUpload: window.HS_CONFIG.isN8nUploadEnabled()
});