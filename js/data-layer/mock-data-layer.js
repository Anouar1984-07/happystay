// Happy Stay - Mock DataLayer
// Implémentation mock utilisant localStorage

export class MockDataLayer {
    constructor() {
        this.storageKey = 'happystay_mock_data';
        this.initializeStorage();
        console.log('🎭 MockDataLayer initialisé');
    }

    initializeStorage() {
        if (!localStorage.getItem(this.storageKey)) {
            const initialData = {
                reservations: [],
                slots: {}, // Format: "2025-08-21": { "10:30": "FREE|BOOKED|BLOCKED", ... }
                nextReservationId: 1
            };
            localStorage.setItem(this.storageKey, JSON.stringify(initialData));
        }
    }

    getData() {
        return JSON.parse(localStorage.getItem(this.storageKey) || '{}');
    }

    saveData(data) {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    }

    // =================================
    // GESTION DES CRÉNEAUX
    // =================================

    async getSlotsByDate(date) {
        const data = this.getData();
        const timeSlots = window.HS_CONFIG.getTimeSlots();
        const slotsForDate = data.slots[date] || {};
        
        return timeSlots.map(time => ({
            time,
            status: slotsForDate[time] || 'FREE' // FREE | BOOKED | BLOCKED
        }));
    }

    async markSlotBooked(date, time, reservationId = null) {
        const data = this.getData();
        
        if (!data.slots[date]) {
            data.slots[date] = {};
        }
        
        data.slots[date][time] = 'BOOKED';
        this.saveData(data);
        
        return { success: true };
    }

    async markSlotBlocked(date, time) {
        const data = this.getData();
        
        if (!data.slots[date]) {
            data.slots[date] = {};
        }
        
        data.slots[date][time] = 'BLOCKED';
        this.saveData(data);
        
        return { success: true };
    }

    async markSlotFree(date, time) {
        const data = this.getData();
        
        if (data.slots[date]) {
            delete data.slots[date][time];
            
            // Nettoyer si plus de créneaux pour cette date
            if (Object.keys(data.slots[date]).length === 0) {
                delete data.slots[date];
            }
        }
        
        this.saveData(data);
        return { success: true };
    }

    // =================================
    // UPLOAD PHOTOS (MOCK)
    // =================================

    async uploadPhotos(files) {
        // Simulation d'upload avec URLs mock
        const mockUrls = [];
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const mockUrl = `blob:mock/${Date.now()}_${i}_${file.name}`;
            mockUrls.push({
                url: mockUrl,
                name: file.name,
                size: file.size
            });
        }
        
        // Simuler un délai d'upload
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('📸 Photos uploadées (mock):', mockUrls);
        return { success: true, photos: mockUrls };
    }

    // =================================
    // GESTION DES RÉSERVATIONS
    // =================================

    async createReservation(payload) {
        const data = this.getData();
        
        // Vérifier que le créneau est libre
        const slots = await this.getSlotsByDate(payload.date);
        const targetSlot = slots.find(slot => slot.time === payload.time);
        
        if (!targetSlot || targetSlot.status !== 'FREE') {
            return { 
                success: false, 
                error: 'Créneau non disponible' 
            };
        }
        
        // Créer la réservation
        const reservationId = `res_${data.nextReservationId}`;
        const reservation = {
            id: reservationId,
            ...payload,
            status: 'PENDING', // PENDING | CONFIRMED | CANCELLED
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        data.reservations.push(reservation);
        data.nextReservationId++;
        
        // Marquer le créneau comme réservé
        await this.markSlotBooked(payload.date, payload.time, reservationId);
        
        this.saveData(data);
        
        console.log('✅ Réservation créée (mock):', reservationId);
        return { 
            success: true, 
            reservationId,
            reservation 
        };
    }

    async getReservationsOfDate(date) {
        const data = this.getData();
        return data.reservations
            .filter(res => res.date === date)
            .sort((a, b) => a.time.localeCompare(b.time));
    }

    async getReservationById(id) {
        const data = this.getData();
        return data.reservations.find(res => res.id === id) || null;
    }

    async updateReservationStatus(id, status) {
        const data = this.getData();
        const reservation = data.reservations.find(res => res.id === id);
        
        if (!reservation) {
            return { success: false, error: 'Réservation non trouvée' };
        }
        
        const oldStatus = reservation.status;
        reservation.status = status;
        reservation.updatedAt = new Date().toISOString();
        
        // Gérer les changements de créneaux
        if (status === 'CANCELLED' && oldStatus !== 'CANCELLED') {
            // Libérer le créneau
            await this.markSlotFree(reservation.date, reservation.time);
        } else if (status === 'CONFIRMED' && oldStatus === 'PENDING') {
            // S'assurer que le créneau est bien réservé
            await this.markSlotBooked(reservation.date, reservation.time, id);
        }
        
        this.saveData(data);
        
        console.log(`📝 Réservation ${id} mise à jour: ${oldStatus} → ${status}`);
        return { success: true, reservation };
    }

    // =================================
    // UTILITAIRES
    // =================================

    async getAllReservations() {
        const data = this.getData();
        return data.reservations;
    }

    async resetData() {
        localStorage.removeItem(this.storageKey);
        this.initializeStorage();
        console.log('🗑️ Données mock réinitialisées');
        return { success: true };
    }

    async getStats() {
        const data = this.getData();
        const today = new Date().toISOString().split('T')[0];
        const todayReservations = data.reservations.filter(res => res.date === today);
        
        return {
            totalReservations: data.reservations.length,
            todayReservations: todayReservations.length,
            pendingReservations: todayReservations.filter(res => res.status === 'PENDING').length,
            confirmedReservations: todayReservations.filter(res => res.status === 'CONFIRMED').length
        };
    }
}