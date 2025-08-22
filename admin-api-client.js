// Admin API Client - Connecté à Supabase via DataLayer
// Refactorisé pour utiliser le DataLayer global au lieu des données mock

class AdminApiClient {
    constructor() {
        // Les 3 créneaux affichés par l'UI
        this.fixedTimeSlots = ['10:30', '13:30', '15:30'];
        this.dataLayer = null;
        this.initializeDataLayer();
    }

    async initializeDataLayer() {
        try {
            // Importer dynamiquement le DataLayer
            const { dataLayer } = await import('./js/data-layer/index.js');
            this.dataLayer = dataLayer;
            console.log('🔗 AdminApiClient connecté au DataLayer:', this.dataLayer.constructor.name);
        } catch (error) {
            console.error('❌ Erreur initialisation DataLayer:', error);
        }
    }

    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    // Simulate API delay
    async delay(ms = 300) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Authentication (garde la logique mock pour la démo)
    async authenticate(token) {
        await this.delay();
        
        if (!this.dataLayer) {
            console.error('❌ DataLayer non initialisé pour l\'authentification');
            return { success: false, message: 'Système non initialisé' };
        }

        try {
            console.log('🔐 Tentative d\'authentification admin avec token');
            
            // Utiliser l'email admin défini dans les migrations
            const adminEmail = 'admin@happystay.com';
            
            // Le token saisi devient le mot de passe
            const result = await this.dataLayer.signIn(adminEmail, token);
            
            if (result.success) {
                localStorage.setItem('admin_token', token);
                localStorage.setItem('admin_session', JSON.stringify(result.session));
                console.log('✅ Authentification admin réussie');
                return { success: true, message: 'Authentification réussie' };
            } else {
                console.error('❌ Échec authentification:', result.error);
                return { success: false, message: result.error || 'Identifiants invalides' };
            }
            
        } catch (error) {
            console.error('❌ Erreur authentification:', error);
            return { success: false, message: 'Erreur de connexion' };
        }
    }

    async isAuthenticated() {
        if (!this.dataLayer) {
            return false;
        }
        
        try {
            const isAuth = await this.dataLayer.isAuthenticated();
            const hasLocalToken = localStorage.getItem('admin_token') !== null;
            return isAuth && hasLocalToken;
        } catch (error) {
            console.error('❌ Erreur vérification authentification:', error);
            return false;
        }
    }

    async logout() {
        if (this.dataLayer) {
            try {
                await this.dataLayer.signOut();
            } catch (error) {
                console.error('❌ Erreur déconnexion Supabase:', error);
            }
        }
        
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_session');
        console.log('🔐 Déconnexion locale effectuée');
    }

    // Get slots for a specific date - CONNECTÉ À SUPABASE
    async getSlots(date) {
        if (!this.dataLayer) {
            console.error('❌ DataLayer non initialisé');
            return [];
        }
        
        try {
            console.log('🔄 Récupération créneaux Supabase pour:', date);
            
            const supabaseSlots = await this.dataLayer.getSlotsByDate(date);
            console.log('📊 Créneaux Supabase reçus:', supabaseSlots);

            // --- Normalisation & mapping des statuts pour l'UI ---
            const normTime = (t) => (t || '').slice(0, 5); // "HH:MM"
            const toUiStatus = (s) => {
                const up = (s || '').toUpperCase();
                if (up === 'BOOKED') return 'reserved';
                if (up === 'BLOCKED') return 'blocked';
                return 'available'; // FREE ou défaut
            };

            // Indexer le statut par heure "HH:MM"
            const byTime = {};
            (supabaseSlots || []).forEach(s => {
                const t = normTime(s.time || s.slot_time);
                if (t) byTime[t] = toUiStatus(s.status);
            });

            // Construire toujours 3 cartes "fixes"
            const baseSlots = this.fixedTimeSlots.map(time => ({
                id: `${date}-${time}`,
                date,
                time,
                status: byTime[time] || 'available',
                reservationId: null,
                updatedAt: new Date().toISOString()
            }));

            // Enrichir avec les réservations
            const reservations = await this.dataLayer.getReservationsOfDate(date);
            console.log('📊 Réservations pour enrichissement:', reservations);

            // Indexer les réservations par heure "HH:MM"
            const resByTime = {};
            (reservations || []).forEach(r => {
                const hm = r.time_hm || (r.time ? r.time.slice(0, 5) : null);
                if (hm) resByTime[hm] = r;
            });

            return baseSlots.map(slot => {
                if (slot.status === 'reserved') {
                    const r = resByTime[slot.time];
                    if (r) {
                        return {
                            ...slot,
                            reservationId: r.id,
                            reservation: {
                                customerName: r.customerName,
                                service: r.service
                            }
                        };
                    }
                }
                return slot;
            });
            
        } catch (error) {
            console.error('❌ Erreur récupération créneaux:', error);
            return [];
        }
    }

    // Get reservations for a specific date - CONNECTÉ À SUPABASE
    async getReservations(date) {
        if (!this.dataLayer) {
            console.error('❌ DataLayer non initialisé');
            return [];
        }
        
        try {
            console.log('🔄 Récupération réservations Supabase pour:', date);
            
            const supabaseReservations = await this.dataLayer.getReservationsOfDate(date);
            console.log('📊 Réservations Supabase reçues:', supabaseReservations);
            
            // Les données sont déjà dans le bon format depuis SupabaseDataLayer
            return supabaseReservations;
            
        } catch (error) {
            console.error('❌ Erreur récupération réservations:', error);
            return [];
        }
    }

    // Update slot status - CONNECTÉ À SUPABASE
    async updateSlotStatus(slotId, newStatus) {
        if (!this.dataLayer) {
            console.error('❌ DataLayer non initialisé');
            return { success: false, error: 'DataLayer non initialisé' };
        }
        
        try {
            console.log('🔄 Mise à jour statut créneau:', slotId, newStatus);

            // slotId = `${date}-${time}` → attention aux tirets dans la date
            const lastDash = slotId.lastIndexOf('-');
            const date = slotId.slice(0, lastDash);
            const time = slotId.slice(lastDash + 1);
            
            let result;
            switch (newStatus) {
                case 'blocked':
                    result = await this.dataLayer.markSlotBlocked(date, time);
                    break;
                case 'available':
                    result = await this.dataLayer.markSlotFree(date, time);
                    break;
                default:
                    return { success: false, message: 'Statut non supporté' };
            }
            
            if (result.success) {
                console.log('✅ Créneau mis à jour avec succès');
                return { success: true };
            } else {
                return { success: false, message: result.error || 'Erreur inconnue' };
            }
            
        } catch (error) {
            console.error('❌ Erreur mise à jour créneau:', error);
            return { success: false, message: error.message };
        }
    }

    // Block all slots for a day - CONNECTÉ À SUPABASE
    async blockAllSlots(date) {
        if (!this.dataLayer) {
            console.error('❌ DataLayer non initialisé');
            return { success: false, error: 'DataLayer non initialisé' };
        }
        
        try {
            console.log('🔄 Blocage de tous les créneaux pour:', date);
            
            let blockedCount = 0;
            let skippedCount = 0;
            
            for (const time of this.fixedTimeSlots) {
                try {
                    const result = await this.dataLayer.markSlotBlocked(date, time);
                    if (result.success) {
                        blockedCount++;
                    } else {
                        skippedCount++;
                    }
                } catch (error) {
                    console.warn(`Impossible de bloquer ${time}:`, error);
                    skippedCount++;
                }
            }
            
            let message = `${blockedCount} créneau(x) bloqué(s)`;
            if (skippedCount > 0) {
                message += `, ${skippedCount} créneau(x) ignoré(s)`;
            }
            
            return { success: true, message };
            
        } catch (error) {
            console.error('❌ Erreur blocage créneaux:', error);
            return { success: false, message: error.message };
        }
    }

    // Unblock all slots for a day - CONNECTÉ À SUPABASE
    async unblockAllSlots(date) {
        if (!this.dataLayer) {
            console.error('❌ DataLayer non initialisé');
            return { success: false, error: 'DataLayer non initialisé' };
        }
        
        try {
            console.log('🔄 Déblocage de tous les créneaux pour:', date);
            
            let unblockedCount = 0;
            let skippedCount = 0;
            
            for (const time of this.fixedTimeSlots) {
                try {
                    const result = await this.dataLayer.markSlotFree(date, time);
                    if (result.success) {
                        unblockedCount++;
                    } else {
                        skippedCount++;
                    }
                } catch (error) {
                    console.warn(`Impossible de débloquer ${time}:`, error);
                    skippedCount++;
                }
            }
            
            let message = `${unblockedCount} créneau(x) débloqué(s)`;
            if (skippedCount > 0) {
                message += `, ${skippedCount} créneau(x) ignoré(s)`;
            }
            
            return { success: true, message };
            
        } catch (error) {
            console.error('❌ Erreur déblocage créneaux:', error);
            return { success: false, message: error.message };
        }
    }

    // Update reservation status - CONNECTÉ À SUPABASE
    async updateReservationStatus(reservationId, newStatus) {
        if (!this.dataLayer) {
            console.error('❌ DataLayer non initialisé');
            return { success: false, error: 'DataLayer non initialisé' };
        }
        
        try {
            console.log('🔄 Mise à jour statut réservation:', reservationId, newStatus);
            
            const result = await this.dataLayer.updateReservationStatus(reservationId, newStatus.toUpperCase());
            
            if (result.success) {
                console.log('✅ Statut réservation mis à jour');
                return { success: true, reservation: result.reservation };
            } else {
                return { success: false, message: result.error || 'Erreur inconnue' };
            }
            
        } catch (error) {
            console.error('❌ Erreur mise à jour statut réservation:', error);
            return { success: false, message: error.message };
        }
    }

    // Create quote - STUB (à implémenter plus tard)
    async createQuote(reservationId, items, notes) {
        await this.delay();
        
        console.log('🔄 TODO: Créer devis dans Supabase', { reservationId, items, notes });
        
        // Pour l'instant, simuler la création d'un devis
        const total = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        
        const quote = {
            id: `quote_${Date.now()}`,
            status: 'draft',
            total: total,
            items: items,
            notes: notes,
            createdAt: new Date().toISOString()
        };
        
        // TODO: Sauvegarder dans Supabase
        console.log('📝 Devis créé (stub):', quote);
        
        return { success: true, quote };
    }

    // Send quote via WhatsApp - STUB (à implémenter plus tard)
    async sendQuote(reservationId, items, notes) {
        await this.delay();
        
        console.log('🔄 TODO: Envoyer devis via n8n webhook', { reservationId, items, notes });
        
        const total = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        
        const quote = {
            id: `quote_${Date.now()}`,
            status: 'sent',
            total: total,
            items: items,
            notes: notes,
            sentAt: new Date().toISOString()
        };
        
        // TODO: Appeler webhook n8n pour envoyer sur WhatsApp
        console.log('📤 Devis envoyé (stub):', quote);
        
        return { success: true, quote };
    }

    // Get dashboard stats - CONNECTÉ À SUPABASE
    async getDashboardStats() {
        if (!this.dataLayer) {
            console.error('❌ DataLayer non initialisé');
            return {
                todayReservations: 0,
                pendingReservations: 0,
                confirmedReservations: 0,
                totalSlots: 0
            };
        }
        
        try {
            console.log('🔄 Récupération statistiques Supabase');
            
            const stats = await this.dataLayer.getStats();
            console.log('📊 Statistiques reçues:', stats);
            
            return {
                todayReservations: stats.todayReservations,
                pendingReservations: stats.pendingReservations,
                confirmedReservations: stats.confirmedReservations,
                totalSlots: this.fixedTimeSlots.length
            };
            
        } catch (error) {
            console.error('❌ Erreur récupération statistiques:', error);
            return {
                todayReservations: 0,
                pendingReservations: 0,
                confirmedReservations: 0,
                totalSlots: 0
            };
        }
    }
}

// Export for use in admin-script.js
window.AdminApiClient = AdminApiClient;
