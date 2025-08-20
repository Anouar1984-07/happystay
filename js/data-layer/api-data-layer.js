// Happy Stay - API DataLayer
// Implémentation réelle avec Supabase + n8n (STUBS pour l'instant)

export class ApiDataLayer {
    constructor() {
        this.supabaseUrl = window.HS_SUPABASE_URL;
        this.supabaseKey = window.HS_SUPABASE_ANON_KEY;
        this.n8nUploadWebhook = window.HS_N8N_UPLOAD_WEBHOOK;
        
        console.log('🌐 ApiDataLayer initialisé (STUBS)');
    }

    // =================================
    // GESTION DES CRÉNEAUX
    // =================================

    async getSlotsByDate(date) {
        // TODO: Supabase - Requête pour récupérer les créneaux
        // SELECT * FROM slots WHERE date = ? AND active = true
        
        console.log('🔄 TODO: getSlotsByDate via Supabase', date);
        
        // Stub - retourner données fictives
        const timeSlots = window.HS_CONFIG.getTimeSlots();
        return timeSlots.map(time => ({
            time,
            status: 'FREE' // FREE | BOOKED | BLOCKED
        }));
    }

    async markSlotBooked(date, time, reservationId = null) {
        // TODO: Supabase - Marquer créneau comme réservé
        // UPDATE slots SET status = 'BOOKED', reservation_id = ? WHERE date = ? AND time = ?
        
        console.log('🔄 TODO: markSlotBooked via Supabase', { date, time, reservationId });
        return { success: true };
    }

    async markSlotBlocked(date, time) {
        // TODO: Supabase - Bloquer créneau manuellement
        // UPDATE slots SET status = 'BLOCKED' WHERE date = ? AND time = ?
        
        console.log('🔄 TODO: markSlotBlocked via Supabase', { date, time });
        return { success: true };
    }

    async markSlotFree(date, time) {
        // TODO: Supabase - Libérer créneau
        // UPDATE slots SET status = 'FREE', reservation_id = NULL WHERE date = ? AND time = ?
        
        console.log('🔄 TODO: markSlotFree via Supabase', { date, time });
        return { success: true };
    }

    // =================================
    // UPLOAD PHOTOS (N8N)
    // =================================

    async uploadPhotos(files) {
        // TODO: n8n - Upload vers Google Drive
        // POST vers webhook n8n qui upload et retourne URLs Google Drive
        
        console.log('🔄 TODO: uploadPhotos via n8n webhook', files.length, 'fichiers');
        
        // Stub - retourner URLs fictives
        const mockUrls = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            mockUrls.push({
                url: `https://drive.google.com/mock/${Date.now()}_${i}`,
                name: file.name,
                size: file.size
            });
        }
        
        return { success: true, photos: mockUrls };
    }

    // =================================
    // GESTION DES RÉSERVATIONS
    // =================================

    async createReservation(payload) {
        // TODO: Supabase - Créer réservation
        // INSERT INTO reservations (...) VALUES (...)
        // + Vérifier disponibilité créneau
        
        console.log('🔄 TODO: createReservation via Supabase', payload);
        
        // Stub
        const reservationId = `api_res_${Date.now()}`;
        return { 
            success: true, 
            reservationId,
            reservation: { id: reservationId, ...payload, status: 'PENDING' }
        };
    }

    async getReservationsOfDate(date) {
        // TODO: Supabase - Récupérer réservations du jour
        // SELECT * FROM reservations WHERE date = ? ORDER BY time ASC
        
        console.log('🔄 TODO: getReservationsOfDate via Supabase', date);
        
        // Stub - retourner liste vide
        return [];
    }

    async getReservationById(id) {
        // TODO: Supabase - Récupérer réservation par ID
        // SELECT * FROM reservations WHERE id = ?
        
        console.log('🔄 TODO: getReservationById via Supabase', id);
        return null;
    }

    async updateReservationStatus(id, status) {
        // TODO: Supabase - Mettre à jour statut réservation
        // UPDATE reservations SET status = ?, updated_at = NOW() WHERE id = ?
        
        console.log('🔄 TODO: updateReservationStatus via Supabase', { id, status });
        return { success: true, reservation: { id, status } };
    }

    // =================================
    // UTILITAIRES
    // =================================

    async getAllReservations() {
        // TODO: Supabase - Toutes les réservations
        console.log('🔄 TODO: getAllReservations via Supabase');
        return [];
    }

    async getStats() {
        // TODO: Supabase - Statistiques
        console.log('🔄 TODO: getStats via Supabase');
        return {
            totalReservations: 0,
            todayReservations: 0,
            pendingReservations: 0,
            confirmedReservations: 0
        };
    }
}