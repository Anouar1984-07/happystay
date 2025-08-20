// Happy Stay - Supabase DataLayer
// Implémentation réelle avec Supabase

import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js@2';

export class SupabaseDataLayer {
    constructor() {
        this.supabase = createClient(
            window.HS_SUPABASE_URL,
            window.HS_SUPABASE_ANON_KEY
        );
        
        console.log('🌐 SupabaseDataLayer initialisé');
        this.testConnection();
    }

    // =================================
    // AUTHENTIFICATION ADMIN
    // =================================

    async signIn(email, password) {
        try {
            console.log('🔐 Tentative de connexion admin:', email);
            
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                console.error('❌ Erreur connexion:', error);
                return { success: false, error: error.message };
            }

            console.log('✅ Connexion réussie:', data.user?.email);
            return { success: true, user: data.user, session: data.session };

        } catch (error) {
            console.error('❌ Erreur signIn:', error);
            return { success: false, error: error.message };
        }
    }

    async signOut() {
        try {
            console.log('🔐 Déconnexion admin');
            
            const { error } = await this.supabase.auth.signOut();
            
            if (error) {
                console.error('❌ Erreur déconnexion:', error);
                return { success: false, error: error.message };
            }

            console.log('✅ Déconnexion réussie');
            return { success: true };

        } catch (error) {
            console.error('❌ Erreur signOut:', error);
            return { success: false, error: error.message };
        }
    }

    async getCurrentUser() {
        try {
            const { data: { user } } = await this.supabase.auth.getUser();
            return user;
        } catch (error) {
            console.error('❌ Erreur getCurrentUser:', error);
            return null;
        }
    }

    async isAuthenticated() {
        const user = await this.getCurrentUser();
        return user !== null;
    }
    async testConnection() {
        try {
            const { data, error } = await this.supabase
                .from('slots')
                .select('count')
                .limit(1);
            
            if (error) {
                console.error('❌ Erreur connexion Supabase:', error);
            } else {
                console.log('✅ Connexion Supabase OK');
            }
        } catch (err) {
            console.error('❌ Erreur test connexion:', err);
        }
    }

    // =================================
    // GESTION DES CRÉNEAUX
    // =================================

    async getSlotsByDate(date) {
        try {
            console.log('🔍 Recherche créneaux pour la date:', date);
            
            // Calculer le jour de la semaine (1=lundi, 6=samedi)
            const dateObj = new Date(date);
            let weekday = dateObj.getDay();
            
            // Convertir dimanche (0) en 7, puis ajuster pour notre schéma (1-6)
            if (weekday === 0) weekday = 7;
            
            // Bloquer dimanche
            if (weekday === 7) {
                console.log('🚫 Dimanche bloqué');
                return [];
            }

            // Récupérer les créneaux disponibles via la fonction RPC
            const { data: availableSlots, error } = await this.supabase
                .rpc('get_available_slots', { p_date: date });

            if (error) {
                console.error('Erreur récupération créneaux:', error);
                // Fallback: retourner les créneaux par défaut si erreur
                const timeSlots = window.HS_CONFIG?.getTimeSlots() || ['10:00', '13:30', '15:00'];
                return timeSlots.map(time => ({
                    slot_time: time,
                    time: time,
                    available: 2,
                    blocked: false,
                    status: 'FREE'
                }));
            }

            console.log('📊 Créneaux trouvés:', availableSlots);
            
            // Transformer les données pour le format attendu
            const transformedSlots = (availableSlots || []).map(slot => ({
                time: slot.slot_time,
                status: slot.blocked ? 'BLOCKED' : (slot.available > 0 ? 'FREE' : 'BOOKED'),
                available: slot.available,
                blocked: slot.blocked
            }));
            
            console.log('📊 Créneaux transformés:', transformedSlots);
            return transformedSlots;

        } catch (error) {
            console.error('Erreur getSlotsByDate:', error);
            // Fallback en cas d'erreur
            const timeSlots = window.HS_CONFIG?.getTimeSlots() || ['10:00', '13:30', '15:00'];
            return timeSlots.map(time => ({
                time: time,
                status: 'FREE',
                available: 2,
                blocked: false
            }));
        }
    }

    async markSlotBooked(date, time, reservationId = null) {
        try {
            // Pour l'instant, on ne gère pas explicitement les slots bloqués
            // La logique est dans les réservations
            console.log('🔄 markSlotBooked:', { date, time, reservationId });
            return { success: true };
        } catch (error) {
            console.error('Erreur markSlotBooked:', error);
            return { success: false, error: error.message };
        }
    }

    async markSlotBlocked(date, time) {
        try {
            // TODO: Implémenter le blocage manuel de créneaux si nécessaire
            console.log('🔄 markSlotBlocked:', { date, time });
            return { success: true };
        } catch (error) {
            console.error('Erreur markSlotBlocked:', error);
            return { success: false, error: error.message };
        }
    }

    async markSlotFree(date, time) {
        try {
            // TODO: Implémenter la libération manuelle de créneaux si nécessaire
            console.log('🔄 markSlotFree:', { date, time });
            return { success: true };
        } catch (error) {
            console.error('Erreur markSlotFree:', error);
            return { success: false, error: error.message };
        }
    }

    // =================================
    // UPLOAD PHOTOS (STUB)
    // =================================

    async uploadPhotos(files) {
        // Pour l'instant, retourner un tableau vide comme demandé
        // Plus tard : intégration n8n → Google Drive
        console.log('📸 uploadPhotos (stub):', files.length, 'fichiers');
        
        // Simuler un délai
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return { success: true, photos: [] };
    }

    // =================================
    // GESTION DES RÉSERVATIONS
    // =================================

    async createReservation(payload) {
        try {
            console.log('🔄 createReservation payload:', payload);

            // Trouver le service_id (pour l'instant, utiliser le premier service disponible)
            const { data: services, error: servicesError } = await this.supabase
                .from('services')
                .select('id')
                .eq('active', true)
                .limit(1);

            if (servicesError || !services || services.length === 0) {
                throw new Error('Aucun service disponible');
            }

            const serviceId = services[0].id;

            // Utiliser la fonction RPC pour créer la réservation de manière sécurisée
            const { data: reservationId, error } = await this.supabase
                .rpc('api_create_booking', {
                    p_service_id: serviceId,
                    p_date: payload.date,
                    p_time: payload.time,
                    p_customer_name: `${payload.firstName} ${payload.lastName}`,
                    p_customer_phone: payload.phone,
                    p_customer_email: null,
                    p_district: payload.district,
                    p_address: null,
                    p_notes: payload.comments || null,
                    p_photos: JSON.stringify(payload.photos || [])
                });

            if (error) {
                console.error('Erreur création réservation:', error);
                return { 
                    success: false, 
                    error: error.message 
                };
            }

            // Créer les items de réservation
            if (payload.items && payload.items.length > 0) {
                const itemsToInsert = payload.items.map(item => ({
                    reservation_id: reservationId,
                    service_type: item.service,
                    label: item.label,
                    quantity: item.quantity || 1,
                    details: JSON.stringify(item)
                }));

                const { error: itemsError } = await this.supabase
                    .from('reservation_items')
                    .insert(itemsToInsert);

                if (itemsError) {
                    console.error('Erreur création items:', itemsError);
                }
            }

            // Créer les photos de réservation
            if (payload.photos && payload.photos.length > 0) {
                const photosToInsert = payload.photos.map((photo, index) => ({
                    reservation_id: reservationId,
                    url: photo.url,
                    filename: photo.name || `photo_${index + 1}`,
                    size: photo.size || 0
                }));

                const { error: photosError } = await this.supabase
                    .from('reservation_photos')
                    .insert(photosToInsert);

                if (photosError) {
                    console.error('Erreur création photos:', photosError);
                }
            }

            console.log('✅ Réservation créée:', reservationId);
            return { 
                success: true, 
                reservationId,
                reservation: { id: reservationId, ...payload, status: 'PENDING' }
            };

        } catch (error) {
            console.error('Erreur createReservation:', error);
            return { 
                success: false, 
                error: error.message 
            };
        }
    }

    async getReservationsOfDate(date) {
        try {
            console.log('🔍 Recherche réservations pour la date:', date);
            
            // Récupérer les réservations avec leurs items et photos
            const { data: reservations, error } = await this.supabase
                .from('bookings')
                .select(`
                    *,
                    reservation_items(*),
                    reservation_photos(*)
                `)
                .eq('date', date)
                .order('time', { ascending: true });

            if (error) {
                console.error('Erreur récupération réservations:', error);
                return [];
            }

            console.log('📊 Réservations trouvées:', reservations?.length || 0, reservations);

            // Transformer les données pour le format attendu par le front
            const transformedReservations = (reservations || []).map(reservation => ({
                id: reservation.id,
                date: reservation.date,
                time: reservation.time,
                status: reservation.status.toUpperCase(),
                service: this.generateServiceSummary(reservation.reservation_items || []),
                serviceDetails: this.transformItems(reservation.reservation_items || []),
                customerName: reservation.customer_name,
                customerPhone: reservation.customer_phone,
                customerEmail: reservation.customer_email,
                district: reservation.district,
                address: reservation.address,
                notes: reservation.notes,
                photos: (reservation.reservation_photos || []).map(photo => photo.url),
                quote: null, // TODO: Implémenter les devis plus tard
                createdAt: reservation.created_at
            }));
            
            console.log('✅ Réservations transformées:', transformedReservations);
            return transformedReservations;

        } catch (error) {
            console.error('Erreur getReservationsOfDate:', error);
            return [];
        }
    }

    async getReservationById(id) {
        try {
            const { data: reservation, error } = await this.supabase
                .from('bookings')
                .select(`
                    *,
                    reservation_items(*),
                    reservation_photos(*)
                `)
                .eq('id', id)
                .single();

            if (error) {
                console.error('Erreur récupération réservation:', error);
                return null;
            }

            return {
                id: reservation.id,
                date: reservation.date,
                time: reservation.time,
                status: reservation.status.toUpperCase(),
                service: this.generateServiceSummary(reservation.reservation_items || []),
                serviceDetails: this.transformItems(reservation.reservation_items || []),
                customerName: reservation.customer_name,
                customerPhone: reservation.customer_phone,
                customerEmail: reservation.customer_email,
                district: reservation.district,
                address: reservation.address,
                notes: reservation.notes,
                photos: (reservation.reservation_photos || []).map(photo => photo.url),
                quote: null,
                createdAt: reservation.created_at
            };

        } catch (error) {
            console.error('Erreur getReservationById:', error);
            return null;
        }
    }

    async updateReservationStatus(id, status) {
        try {
            const supabaseStatus = status.toLowerCase();
            
            const { data: reservation, error } = await this.supabase
                .from('bookings')
                .update({ 
                    status: supabaseStatus,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('Erreur mise à jour statut:', error);
                return { success: false, error: error.message };
            }

            console.log(`📝 Réservation ${id} mise à jour: ${status}`);
            return { 
                success: true, 
                reservation: {
                    id: reservation.id,
                    status: reservation.status.toUpperCase()
                }
            };

        } catch (error) {
            console.error('Erreur updateReservationStatus:', error);
            return { success: false, error: error.message };
        }
    }

    // =================================
    // UTILITAIRES
    // =================================

    generateServiceSummary(items) {
        if (!items || items.length === 0) return 'Service non spécifié';
        
        if (items.length === 1) {
            return items[0].service_type;
        } else {
            return 'Services multiples';
        }
    }

    transformItems(items) {
        return items.map(item => {
            try {
                const details = typeof item.details === 'string' 
                    ? JSON.parse(item.details) 
                    : item.details || {};
                
                return {
                    type: item.service_type,
                    data: {
                        quantity: item.quantity,
                        ...details
                    }
                };
            } catch (error) {
                console.error('Erreur parsing item details:', error);
                return {
                    type: item.service_type,
                    data: { quantity: item.quantity }
                };
            }
        });
    }

    async getAllReservations() {
        try {
            const { data: reservations, error } = await this.supabase
                .from('bookings')
                .select(`
                    *,
                    reservation_items(*),
                    reservation_photos(*)
                `)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Erreur récupération toutes réservations:', error);
                return [];
            }

            return reservations.map(reservation => ({
                id: reservation.id,
                date: reservation.date,
                time: reservation.time,
                status: reservation.status.toUpperCase(),
                customerName: reservation.customer_name,
                service: this.generateServiceSummary(reservation.reservation_items || []),
                createdAt: reservation.created_at
            }));

        } catch (error) {
            console.error('Erreur getAllReservations:', error);
            return [];
        }
    }

    async getStats() {
        try {
            const today = new Date().toISOString().split('T')[0];
            
            // Statistiques générales
            const { count: totalReservations } = await this.supabase
                .from('bookings')
                .select('*', { count: 'exact', head: true });

            // Réservations du jour
            const { count: todayReservations } = await this.supabase
                .from('bookings')
                .select('*', { count: 'exact', head: true })
                .eq('date', today);

            // Réservations en attente aujourd'hui
            const { count: pendingReservations } = await this.supabase
                .from('bookings')
                .select('*', { count: 'exact', head: true })
                .eq('date', today)
                .eq('status', 'pending');

            // Réservations confirmées aujourd'hui
            const { count: confirmedReservations } = await this.supabase
                .from('bookings')
                .select('*', { count: 'exact', head: true })
                .eq('date', today)
                .eq('status', 'confirmed');

            return {
                totalReservations: totalReservations || 0,
                todayReservations: todayReservations || 0,
                pendingReservations: pendingReservations || 0,
                confirmedReservations: confirmedReservations || 0
            };

        } catch (error) {
            console.error('Erreur getStats:', error);
            return {
                totalReservations: 0,
                todayReservations: 0,
                pendingReservations: 0,
                confirmedReservations: 0
            };
        }
    }
}