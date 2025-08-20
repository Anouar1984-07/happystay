// Happy Stay - Schéma JSON des réservations
// Structure standardisée pour Mock et API

/**
 * Schéma complet d'une réservation Happy Stay
 */
export const RESERVATION_SCHEMA = {
    // Informations client (obligatoires)
    firstName: "string", // Prénom
    lastName: "string",  // Nom
    phone: "string",     // Format: +212XXXXXXXXX
    district: "string",  // Quartier à Agadir
    
    // Planification (obligatoires)
    date: "string",      // Format: YYYY-MM-DD
    time: "string",      // Format: HH:MM (10:30, 13:30, 15:30)
    
    // Services demandés (min 1)
    items: [
        {
            service: "string",    // "Canapé/Fauteuil" | "Chaises" | "Matelas"
            label: "string",      // Description lisible
            quantity: "number",   // Quantité
            
            // Spécifique Canapé/Fauteuil
            material: "string",   // "tissu" | "cuir" | "velours" | etc.
            size: "string",       // "1 place" | "2 places" | "3 places" | "angle"
            stains: "string",     // "aucune" | "légères" | "importantes"
            options: ["string"],  // ["anti-acariens", "protection-anti-taches"]
            
            // Spécifique Matelas
            faces: "number"       // 1 ou 2
        }
    ],
    
    // Photos (2-4 obligatoires)
    photos: [
        {
            url: "string",        // URL de la photo (mock ou Google Drive)
            name: "string",       // Nom du fichier
            size: "number"        // Taille en bytes
        }
    ],
    
    // Informations optionnelles
    comments: "string",           // Commentaires client
    
    // Métadonnées système (ajoutées automatiquement)
    id: "string",                 // ID unique de la réservation
    status: "string",             // "PENDING" | "CONFIRMED" | "CANCELLED"
    createdAt: "string",          // ISO timestamp
    updatedAt: "string"           // ISO timestamp
};

/**
 * Services autorisés avec leurs champs spécifiques
 */
export const SERVICE_CONFIGS = {
    "Canapé/Fauteuil": {
        requiredFields: ["quantity", "size"],
        optionalFields: ["material", "stains", "options"],
        quantityRange: [1, 10]
    },
    
    "Chaises": {
        requiredFields: ["quantity", "material"],
        optionalFields: ["removableCushion"],
        quantityRange: [1, 20]
    },
    
    "Matelas": {
        requiredFields: ["format", "faces"],
        optionalFields: ["note"],
        quantityRange: [1, 1] // Toujours 1 matelas
    }
};

/**
 * Validation d'une réservation selon le schéma
 */
export function validateReservation(reservation) {
    const errors = [];
    
    // Champs obligatoires
    const requiredFields = ['firstName', 'lastName', 'phone', 'district', 'date', 'time', 'items', 'photos'];
    
    for (const field of requiredFields) {
        if (!reservation[field]) {
            errors.push(`Champ obligatoire manquant: ${field}`);
        }
    }
    
    // Validation téléphone
    if (reservation.phone && !reservation.phone.match(/^\+\d{8,15}$/)) {
        errors.push('Format téléphone invalide (doit commencer par + et contenir 8-15 chiffres)');
    }
    
    // Validation date
    if (reservation.date) {
        const date = new Date(reservation.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (date < today) {
            errors.push('La date ne peut pas être dans le passé');
        }
        
        if (date.getDay() === 0) {
            errors.push('Les réservations ne sont pas autorisées le dimanche');
        }
    }
    
    // Validation créneau
    const allowedTimes = window.HS_CONFIG?.getTimeSlots() || ['10:30', '13:30', '15:30'];
    if (reservation.time && !allowedTimes.includes(reservation.time)) {
        errors.push(`Créneau invalide. Créneaux autorisés: ${allowedTimes.join(', ')}`);
    }
    
    // Validation services
    if (reservation.items) {
        if (!Array.isArray(reservation.items) || reservation.items.length === 0) {
            errors.push('Au moins un service est requis');
        } else {
            const allowedServices = window.HS_CONFIG?.getAllowedServices() || ['Canapé/Fauteuil', 'Chaises', 'Matelas'];
            
            reservation.items.forEach((item, index) => {
                if (!allowedServices.includes(item.service)) {
                    errors.push(`Service non autorisé à l'index ${index}: ${item.service}`);
                }
                
                if (!item.label || !item.quantity || item.quantity <= 0) {
                    errors.push(`Service à l'index ${index}: label et quantity > 0 requis`);
                }
            });
        }
    }
    
    // Validation photos
    if (reservation.photos) {
        const { min, max } = window.HS_CONFIG?.getPhotoLimits() || { min: 2, max: 4 };
        
        if (!Array.isArray(reservation.photos)) {
            errors.push('Photos doit être un tableau');
        } else if (reservation.photos.length < min) {
            errors.push(`Minimum ${min} photos requises`);
        } else if (reservation.photos.length > max) {
            errors.push(`Maximum ${max} photos autorisées`);
        } else {
            reservation.photos.forEach((photo, index) => {
                if (!photo.url || !photo.name) {
                    errors.push(`Photo à l'index ${index}: url et name requis`);
                }
            });
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Exemple de réservation valide
 */
export const EXAMPLE_RESERVATION = {
    firstName: "Fatima",
    lastName: "Alaoui", 
    phone: "+212639887031",
    district: "Talborjt",
    date: "2025-08-21",
    time: "10:30",
    items: [
        {
            service: "Canapé/Fauteuil",
            label: "Canapé 3 places tissu",
            quantity: 1,
            size: "3 places",
            material: "tissu",
            stains: "légères",
            options: ["anti-acariens"]
        },
        {
            service: "Chaises", 
            label: "Chaises tissu",
            quantity: 4,
            material: "tissu",
            removableCushion: true
        },
        {
            service: "Matelas",
            label: "Matelas 160cm",
            quantity: 1,
            format: "160",
            faces: 2
        }
    ],
    photos: [
        { url: "blob:mock/1", name: "vue-ensemble.jpg", size: 1024000 },
        { url: "blob:mock/2", name: "detail-taches.jpg", size: 856000 }
    ],
    comments: "Canapé en tissu beige avec quelques taches de café. Accès par ascenseur au 3ème étage."
};