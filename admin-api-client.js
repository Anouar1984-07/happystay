// Admin API Client - Connecté à Supabase via DataLayer 
// Refactorisé pour utiliser le DataLayer global au lieu des données mock

class AdminApiClient {
    constructor() {
        // Les 3 créneaux affichés par l'UI
        this.fixedTimeSlots = ['10:30', '13:30', '15:30'];
        this.dataLayer = null;

        // ✅ Cache pour compatibilité avec admin-script.js (getServiceQuoteItems)
        // admin-script lit this.apiClient.mockData.reservations
        this.mockData = { reservations: [] };

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

    // Petite attente simulée
    async delay(ms = 300) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // =========================
    // Authentification (admin)
    // =========================
    async authenticate(token) {
        await this.delay();
        if (!this.dataLayer) {
            console.error('❌ DataLayer non initialisé pour l’authentification');
            return { success: false, message: 'Système non initialisé' };
        }
        try {
            console.log('🔐 Tentative d’authentification admin avec token');
            const adminEmail = 'admin@happystay.com'; // email défini côté DB
            const result = await this.dataLayer.signIn(adminEmail, token); // token = mot de passe
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
        if (!this.dataLayer) return false;
        try {
            const isAuth = await this.dataLayer.isAuthenticated();
            const hasLocalToken = !!localStorage.getItem('admin_token');
            return isAuth && hasLocalToken;
        } catch (error) {
            console.error('❌ Erreur vérification authentification:', error);
            return false;
        }
    }

    async logout() {
        try { await this.dataLayer?.signOut(); } catch (e) { console.error(e); }
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_session');
        console.log('🔐 Déconnexion locale effectuée');
    }

    // =========================
    // Créneaux (planning)
    // =========================
    // Retourne un tableau [{ time:'HH:MM', status:'available|blocked|reserved', reservationId?, reservation? }, ...]
    async getSlots(date) {
        if (!this.dataLayer) {
            console.error('❌ DataLayer non initialisé');
            return [];
        }
        try {
            const ymd = typeof date === 'string' ? date : this.formatDate(date);
            console.log('🗓️ Récupération créneaux Supabase pour:', ymd);

            // 1) Disponibilités brutes (bloqué/disponible + capacité)
            const dlSlots = await this.dataLayer.getSlotsForDate(ymd);

            // Normalise sur les 3 créneaux fixes
            const baseSlots = this.fixedTimeSlots.map(t => {
                const s = dlSlots.find(x => x.time === t);
                if (!s) {
                    return { id: `${ymd}-${t}`, date: ymd, time: t, status: 'available' };
                }
                let status = 'available';
                if (s.blocked) status = 'blocked';
                else if ((s.available ?? 0) <= 0) status = 'reserved';
                return { id: `${ymd}-${t}`, date: ymd, time: t, status };
            });

            // 2) Réservations du jour pour enrichir les créneaux marqués "reserved"
            const reservations = await this.getReservations(ymd);
            const byTime = {};
            (reservations || []).forEach(r => {
                const hm = r.time_hm || (r.time ? r.time.slice(0, 5) : null);
                if (hm) byTime[hm] = r;
            });

            // 3) Enrichissement (client + service) sur les créneaux réservés
            return baseSlots.map(slot => {
                if (slot.status === 'reserved') {
                    const r = byTime[slot.time];
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

    // Réservations du jour (déjà normalisées par le DataLayer)
    async getReservations(date) {
        if (!this.dataLayer) {
            console.error('❌ DataLayer non initialisé');
            return [];
        }
        try {
            const ymd = typeof date === 'string' ? date : this.formatDate(date);
            console.log('🔄 Récupération réservations Supabase pour:', ymd);
            const res = await this.dataLayer.getReservationsOfDate(ymd) || [];

            // ✅ Alimente le cache pour admin-script.js (préremplissage devis)
            this.mockData.reservations = res;

            return res;
        } catch (error) {
            console.error('❌ Erreur récupération réservations:', error);
            return [];
        }
    }

    // Changer l’état d’un créneau
    async updateSlotStatus(slotId, newStatus) {
        if (!this.dataLayer) {
            console.error('❌ DataLayer non initialisé');
            return { success: false, error: 'DataLayer non initialisé' };
        }
        try {
            // slotId = `${YYYY-MM-DD}-${HH:MM}` (la date contient des tirets)
            const lastDash = slotId.lastIndexOf('-');
            const date = slotId.slice(0, lastDash);
            const time = slotId.slice(lastDash + 1);

            let result;
            if (newStatus === 'blocked') {
                result = await this.dataLayer.markSlotBlocked(date, time);
            } else if (newStatus === 'available') {
                result = await this.dataLayer.markSlotFree(date, time);
            } else {
                return { success: false, message: 'Statut non supporté' };
            }

            return result.success ? { success: true } : { success: false, message: result.error || 'Erreur inconnue' };
        } catch (error) {
            console.error('❌ Erreur mise à jour créneau:', error);
            return { success: false, message: error.message };
        }
    }

    // Bloquer tous les créneaux d’une journée
    async blockAllSlots(date) {
        if (!this.dataLayer) return { success: false, error: 'DataLayer non initialisé' };
        try {
            const ymd = typeof date === 'string' ? date : this.formatDate(date);
            let ok = 0, ko = 0;
            for (const t of this.fixedTimeSlots) {
                try {
                    const r = await this.dataLayer.markSlotBlocked(ymd, t);
                    r.success ? ok++ : ko++;
                } catch { ko++; }
            }
            let message = `${ok} créneau(x) bloqué(s)`;
            if (ko) message += `, ${ko} ignoré(s)`;
            return { success: true, message };
        } catch (e) {
            console.error('❌ Erreur blocage créneaux:', e);
            return { success: false, message: e.message };
        }
    }

    // Débloquer tous les créneaux d’une journée
    async unblockAllSlots(date) {
        if (!this.dataLayer) return { success: false, error: 'DataLayer non initialisé' };
        try {
            const ymd = typeof date === 'string' ? date : this.formatDate(date);
            let ok = 0, ko = 0;
            for (const t of this.fixedTimeSlots) {
                try {
                    const r = await this.dataLayer.markSlotFree(ymd, t);
                    r.success ? ok++ : ko++;
                } catch { ko++; }
            }
            let message = `${ok} créneau(x) débloqué(s)`;
            if (ko) message += `, ${ko} ignoré(s)`;
            return { success: true, message };
        } catch (e) {
            console.error('❌ Erreur déblocage créneaux:', e);
            return { success: false, message: e.message };
        }
    }

    // =========================
    // Réservations
    // =========================
    async updateReservationStatus(reservationId, newStatus) {
        if (!this.dataLayer) return { success: false, error: 'DataLayer non initialisé' };
        try {
            // Le DataLayer normalise en interne (minuscule + 'cancelled')
            const result = await this.dataLayer.updateReservationStatus(reservationId, newStatus);
            return result.success
                ? { success: true, reservation: result.reservation }
                : { success: false, message: result.error || 'Erreur inconnue' };
        } catch (error) {
            console.error('❌ Erreur mise à jour statut réservation:', error);
            return { success: false, message: error.message };
        }
    }

    // =========================
    // Devis (stubs)
    // =========================
    async createQuote(reservationId, items, notes) {
        await this.delay();
        // TODO: implémentation Supabase (table quotes + quote_items)
        const total = items.reduce((s, it) => s + (it.quantity * it.price), 0);
        return {
            success: true,
            quote: {
                id: `quote_${Date.now()}`,
                status: 'draft',
                total,
                items,
                notes,
                createdAt: new Date().toISOString()
            }
        };
    }

    async sendQuote(reservationId, items, notes) {
        await this.delay();
        // TODO: webhook n8n + mise à jour statut du devis
        const total = items.reduce((s, it) => s + (it.quantity * it.price), 0);
        return {
            success: true,
            quote: {
                id: `quote_${Date.now()}`,
                status: 'sent',
                total,
                items,
                notes,
                sentAt: new Date().toISOString()
            }
        };
    }
    
    // =========================
    // Devis : sauvegarder en DB + envoyer au webhook n8n
    // =========================
    async saveAndSendQuote(reservationId, items, notes) {
        if (!reservationId) return { success: false, message: 'Reservation manquante' };

        // 0) Calcule total
        const total = (items || []).reduce((s, it) => s + (Number(it.quantity || 0) * Number(it.price || 0)), 0);

        // 1) Sauvegarde le devis en DB et récupère quoteId
        let saved = false;
        let quoteId = null;
        try {
            if (this.dataLayer?.saveQuote) {
                const r = await this.dataLayer.saveQuote(reservationId, items, notes, 'sent');
                saved = !!r?.success;
                quoteId = r?.quoteId || null;
            } else if (this.dataLayer?.createQuote) {
                const r = await this.dataLayer.createQuote(reservationId, items, notes, 'sent');
                saved = !!r?.success;
                quoteId = r?.quoteId || null;
            } else {
                console.warn('ℹ️ DataLayer ne propose pas saveQuote/createQuote — on continue quand même vers le webhook.');
            }
        } catch (e) {
            console.error('Erreur sauvegarde devis:', e);
        }

        // 2) Récupère la réservation (pour infos client)
        let res = null;
        try {
            // d'abord le cache (rapide)…
            res = (this.mockData?.reservations || []).find(r => r.id === reservationId) || null;
            // …sinon on interroge la DB
            if (!res && this.dataLayer?.getReservationById) {
                res = await this.dataLayer.getReservationById(reservationId);
            }
        } catch (e) {
            console.warn('Impossible de charger la réservation pour le webhook:', e);
        }

        const name     = res?.customerName || 'Client';
        const phone    = res?.customerPhone || '';
        const service  = res?.service || 'Service';
        const date     = res?.date || null;
        const time     = res?.time_hm || (res?.time ? String(res.time).slice(0,5) : null);
        const district = res?.district || null;
        const address  = res?.address || null;

        // 3) Appel du webhook n8n
        let notified = false;
        try {
            const url = window.HS_N8N_QUOTE_WEBHOOK; // défini dans config.js
            if (url) {
                const payload = {
                    action: 'QUOTE_SENT',
                    source: 'admin',
                    reservationId,
                    quoteId,
                    name,
                    phone,
                    service,
                    total,
                    notes,
                    items,
                    date,
                    time,
                    district,
                    address
                };
                const resp = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                notified = resp.ok;
                if (!resp.ok) console.warn('Webhook non OK:', resp.status, await resp.text());
            } else {
                console.warn('HS_N8N_QUOTE_WEBHOOK non défini — envoi WhatsApp ignoré.');
            }
        } catch (e) {
            console.error('Erreur webhook n8n:', e);
        }

        return { success: (saved || notified), saved, notified, quoteId };
    }

}

window.AdminApiClient = AdminApiClient;
