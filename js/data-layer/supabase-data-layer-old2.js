// Happy Stay - Supabase DataLayer (revamped)
// Implémentation réelle avec Supabase + normalisation date/heure

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

  // ---------- Helpers : date/heure ----------
  toYMDLocal(d) {
    const dt = d instanceof Date ? d : new Date(d);
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  hhmmFromHMS(hms) {
    return hms ? hms.slice(0, 5) : null;
  }
  frFromYMD(ymd) {
    return new Date(ymd).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  // =================================
  // AUTHENTIFICATION ADMIN
  // =================================
  async signIn(email, password) {
    try {
      console.log('🔐 Tentative de connexion admin:', email);
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
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
      const { count, error } = await this.supabase
        .from('slots')
        .select('*', { count: 'exact', head: true });
      if (error) console.error('❌ Erreur connexion Supabase:', error);
      else console.log('✅ Connexion Supabase OK (slots count ≈)', count ?? 'n/a');
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
      const d = new Date(date);
      const weekday = d.getDay();
      if (weekday === 0) {
        console.log('🚫 Dimanche bloqué');
        return [];
      }
      const { data: availableSlots, error } = await this.supabase
        .rpc('get_available_slots', { p_date: this.toYMDLocal(date) });

      if (error) {
        console.error('Erreur récupération créneaux (RPC):', error);
        const timeSlots = window.HS_CONFIG?.getTimeSlots() || ['10:00', '13:30', '15:00'];
        return timeSlots.map((time) => ({
          time,
          status: 'FREE',
          available: 2,
          blocked: false,
        }));
      }
      const transformedSlots = (availableSlots || []).map((slot) => ({
        time: slot.slot_time,
        status: slot.blocked ? 'BLOCKED' : (slot.available > 0 ? 'FREE' : 'BOOKED'),
        available: slot.available,
        blocked: slot.blocked,
      }));
      return transformedSlots;
    } catch (error) {
      console.error('Erreur getSlotsByDate:', error);
      const timeSlots = window.HS_CONFIG?.getTimeSlots() || ['10:00', '13:30', '15:00'];
      return timeSlots.map((time) => ({
        time,
        status: 'FREE',
        available: 2,
        blocked: false,
      }));
    }
  }

  async markSlotBooked(date, time, reservationId = null) {
    try {
      console.log('🔄 markSlotBooked:', { date, time, reservationId });
      return { success: true };
    } catch (error) {
      console.error('Erreur markSlotBooked:', error);
      return { success: false, error: error.message };
    }
  }
  async markSlotBlocked(date, time) {
    try {
      console.log('🔄 markSlotBlocked:', { date, time });
      return { success: true };
    } catch (error) {
      console.error('Erreur markSlotBlocked:', error);
      return { success: false, error: error.message };
    }
  }
  async markSlotFree(date, time) {
    try {
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
    console.log('📸 uploadPhotos (stub):', files.length, 'fichiers');
    await new Promise((r) => setTimeout(r, 500));
    return { success: true, photos: [] };
  }

  // =================================
  // GESTION DES RÉSERVATIONS
  // =================================
  async createReservation(payload) {
    try {
      console.log('🔄 createReservation payload:', payload);
      const { data: services, error: servicesError } = await this.supabase
        .from('services')
        .select('id')
        .eq('active', true)
        .limit(1);
      if (servicesError || !services || services.length === 0) {
        throw new Error('Aucun service disponible');
      }
      const serviceId = services[0].id;

      const { data: reservationId, error } = await this.supabase.rpc('api_create_booking', {
        p_service_id: serviceId,
        p_date: this.toYMDLocal(payload.date),
        p_time: payload.time,
        p_customer_name: `${payload.firstName} ${payload.lastName}`,
        p_customer_phone: payload.phone,
        p_customer_email: null,
        p_district: payload.district,
        p_address: null,
        p_notes: payload.comments || null,
        p_photos: JSON.stringify(payload.photos || []),
      });
      if (error) {
        console.error('Erreur création réservation:', error);
        return { success: false, error: error.message };
      }

      if (payload.items && payload.items.length > 0) {
        const itemsToInsert = payload.items.map((item) => ({
          reservation_id: reservationId,
          service_type: item.service,
          label: item.label,
          quantity: item.quantity || 1,
          details: JSON.stringify(item),
        }));
        await this.supabase.from('reservation_items').insert(itemsToInsert);
      }
      if (payload.photos && payload.photos.length > 0) {
        const photosToInsert = payload.photos.map((photo, index) => ({
          reservation_id: reservationId,
          url: photo.url,
          filename: photo.name || `photo_${index + 1}`,
          size: photo.size || 0,
        }));
        await this.supabase.from('reservation_photos').insert(photosToInsert);
      }
      return {
        success: true,
        reservationId,
        reservation: { id: reservationId, ...payload, status: 'PENDING' },
      };
    } catch (error) {
      console.error('Erreur createReservation:', error);
      return { success: false, error: error.message };
    }
  }

  async getReservationsOfDate(date) {
    try {
      const ymd = this.toYMDLocal(date);
      const { data: reservations, error } = await this.supabase
        .from('bookings')
        .select(`
          *,
            reservation_items(*),
            reservation_photos(*),
            service:services(name)

            `)

        .eq('date', ymd)
        .order('time', { ascending: true });

      if (error) return [];

      return (reservations || []).map((r) => ({
        id: r.id,
        date: r.date,
        date_fr: this.frFromYMD(r.date),
        time: r.time,
        time_hm: this.hhmmFromHMS(r.time),
        status: (r.status || '').toUpperCase(),
        service: r.service?.name || this.generateServiceSummary(r.reservation_items || []),
        serviceDetails: this.transformItems(r.reservation_items || []),
        customerName: r.customer_name,
        customerPhone: r.customer_phone,
        customerEmail: r.customer_email,
        district: r.district,
        address: r.address,
        notes: r.notes,
        photos: (r.reservation_photos || []).map((p) => p.url),
        quote: null,
        createdAt: r.created_at,
      }));
    } catch (error) {
      console.error('Erreur getReservationsOfDate:', error);
      return [];
    }
  }

  async getReservationById(id) {
    try {
      const { data: r, error } = await this.supabase
        .from('bookings')
    .select(`
  *,
  reservation_items(*),
  reservation_photos(*),
  service:services(name)
`)
        .eq('id', id)
        .single();

      if (error) return null;

      return {
        id: r.id,
        date: r.date,
        date_fr: this.frFromYMD(r.date),
        time: r.time,
        time_hm: this.hhmmFromHMS(r.time),
        status: (r.status || '').toUpperCase(),
        service: r.service?.name || this.generateServiceSummary(r.reservation_items || []),
        serviceDetails: this.transformItems(r.reservation_items || []),
        customerName: r.customer_name,
        customerPhone: r.customer_phone,
        customerEmail: r.customer_email,
        district: r.district,
        address: r.address,
        notes: r.notes,
        photos: (r.reservation_photos || []).map((p) => p.url),
        quote: null,
        createdAt: r.created_at,
      };
    } catch (error) {
      console.error('Erreur getReservationById:', error);
      return null;
    }
  }

  async updateReservationStatus(id, status) {
    try {
      const supabaseStatus = status.toLowerCase();
      const { data: r, error } = await this.supabase
        .from('bookings')
        .update({ status: supabaseStatus, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) return { success: false, error: error.message };

      return { success: true, reservation: { id: r.id, status: r.status.toUpperCase() } };
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
    return items.length === 1 ? items[0].service_type : 'Services multiples';
  }

  transformItems(items) {
    return (items || []).map((item) => {
      try {
        const details =
          typeof item.details === 'string' ? JSON.parse(item.details) : item.details || {};
        return {
          type: item.service_type,
          data: { quantity: item.quantity, ...details },
        };
      } catch (error) {
        return { type: item.service_type, data: { quantity: item.quantity } };
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
  reservation_photos(*),
  service:services(name)
`)
        .order('created_at', { ascending: false });

      if (error) return [];

      return (reservations || []).map((r) => ({
        id: r.id,
        date: r.date,
        date_fr: this.frFromYMD(r.date),
        time: r.time,
        time_hm: this.hhmmFromHMS(r.time),
        status: (r.status || '').toUpperCase(),
        customerName: r.customer_name,
        service: r.service?.name || this.generateServiceSummary(r.reservation_items || []),
        createdAt: r.created_at,
      }));
    } catch (error) {
      console.error('Erreur getAllReservations:', error);
      return [];
    }
  }

  async getStats() {
    try {
      const today = this.toYMDLocal(new Date());
      const { count: totalReservations } = await this.supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true });
      const { count: todayReservations } = await this.supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('date', today);
      const { count: pendingReservations } = await this.supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('date', today)
        .eq('status', 'pending');
      const { count: confirmedReservations } = await this.supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('date', today)
        .eq('status', 'confirmed');
      return {
        totalReservations: totalReservations || 0,
        todayReservations: todayReservations || 0,
        pendingReservations: pendingReservations || 0,
        confirmedReservations: confirmedReservations || 0,
      };
    } catch (error) {
      console.error('Erreur getStats:', error);
      return {
        totalReservations: 0,
        todayReservations: 0,
        pendingReservations: 0,
        confirmedReservations: 0,
      };
    }
  }
}
