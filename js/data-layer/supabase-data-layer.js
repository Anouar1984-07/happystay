// Happy Stay - Supabase DataLayer (clean build)

import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js@2';

export class SupabaseDataLayer {
  constructor() {
    this.supabase = createClient(window.HS_SUPABASE_URL, window.HS_SUPABASE_ANON_KEY);
    console.log('🌐 SupabaseDataLayer initialisé');
    this.testConnection();
  }

  // ---------- Helpers date/heure ----------
  toYMDLocal(d) {
    if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
    const dt = d instanceof Date ? d : new Date(d);
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  hhmmFromHMS(hms) { return hms ? hms.slice(0, 5) : null; }
  frFromYMD(ymd) { return new Date(ymd).toLocaleDateString('fr-FR', { day:'2-digit', month:'2-digit', year:'numeric' }); }

  // =================================
  // AUTHENTIFICATION ADMIN
  // =================================
  async signIn(email, password) {
    try {
      console.log('🔐 Tentative de connexion admin:', email);
      const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
      if (error) return { success:false, error:error.message };
      return { success:true, user:data.user, session:data.session };
    } catch (err) { return { success:false, error:err.message }; }
  }
  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) return { success:false, error:error.message };
      return { success:true };
    } catch (err) { return { success:false, error:err.message }; }
  }
  async getCurrentUser() {
    try {
      const { data:{ user } } = await this.supabase.auth.getUser(); return user;
    } catch { return null; }
  }
  async isAuthenticated() { return (await this.getCurrentUser()) !== null; }
  async testConnection() {
    try {
      const { count, error } = await this.supabase.from('slots').select('*', { count:'exact', head:true });
      if (error) console.error('❌ Erreur connexion Supabase:', error);
      else console.log('✅ Connexion Supabase OK (slots count ≈)', count ?? 'n/a');
    } catch (err) { console.error('❌ Erreur test connexion:', err); }
  }

  // =================================
  // GESTION DES CRÉNEAUX
  // =================================
  async getSlotsByDate(date) {
    try {
      const ymd = this.toYMDLocal(date);
      const weekday = new Date(ymd).getDay(); // 0=dimanche
      if (weekday === 0) return [];

      const { data: availableSlots, error } = await this.supabase.rpc('get_available_slots', {
        p_date: ymd, p_times: ['10:30','13:30','15:30'], p_capacity: 2
      });
      if (error) {
        console.error('Erreur récupération créneaux (RPC):', error);
        const timeSlots = window.HS_CONFIG?.getTimeSlots() || ['10:30', '13:30', '15:30'];
        return timeSlots.map((t)=>({ time:t, status:'FREE', available:2, blocked:false }));
      }

      return (availableSlots || []).map((slot)=>({
        time: slot.slot_time,
        status: slot.blocked ? 'BLOCKED' : (slot.available > 0 ? 'FREE' : 'BOOKED'),
        available: slot.available,
        blocked: slot.blocked,
      }));
    } catch (err) {
      console.error('Erreur getSlotsByDate:', err);
      const timeSlots = window.HS_CONFIG?.getTimeSlots() || ['10:30','13:30','15:30'];
      return timeSlots.map((t)=>({ time:t, status:'FREE', available:2, blocked:false }));
    }
  }

  async markSlotBooked(date, time, reservationId = null) {
    try { console.log('🔄 markSlotBooked (noop, géré par RPC):', { date, time, reservationId }); return { success:true }; }
    catch (err) { return { success:false, error:err.message }; }
  }
  async markSlotBlocked(date, time) {
    try {
      const ymd = this.toYMDLocal(date);
      const { error } = await this.supabase.from('slots').upsert(
        { date:ymd, time, blocked:true, updated_at:new Date().toISOString() },
        { onConflict:'date,time' }
      );
      if (error) throw error;
      console.log('✅ Créneau bloqué:', { date:ymd, time });
      return { success:true };
    } catch (err) { console.error('❌ Erreur markSlotBlocked:', err.message); return { success:false, error:err.message }; }
  }
  async markSlotFree(date, time) {
    try {
      const ymd = this.toYMDLocal(date);
      const { error } = await this.supabase.from('slots').upsert(
        { date:ymd, time, blocked:false, updated_at:new Date().toISOString() },
        { onConflict:'date,time' }
      );
      if (error) throw error;
      console.log('✅ Créneau débloqué:', { date:ymd, time });
      return { success:true };
    } catch (err) { console.error('❌ Erreur markSlotFree:', err.message); return { success:false, error:err.message }; }
  }

  // =================================
  // UPLOAD PHOTOS (STUB)
  // =================================
  async uploadPhotos(files) {
    console.log('📸 uploadPhotos (stub):', files.length, 'fichiers');
    await new Promise((r)=>setTimeout(r, 500));
    return { success:true, photos:[] };
  }

  // =================================
  // GESTION DES RÉSERVATIONS
  // =================================
  async createReservation(payload) {
    try {
      const ymd = this.toYMDLocal(payload.date);
      const rpcParams = {
        p_date: ymd,
        p_time: payload.time,
        p_firstname: payload.firstName ?? null,
        p_lastname:  payload.lastName ?? null,
        p_phone:     payload.phone ?? null,
        p_district:  payload.district ?? null,
        p_address:   null,
        p_comments:  payload.comments ?? null,
        p_items:     (payload.items && Array.isArray(payload.items)) ? payload.items : []
      };

      const { data: rpcData, error: rpcError } =
        await this.supabase.rpc('create_reservation_and_reserve_slot', rpcParams);
      if (rpcError) { console.error('RPC error', rpcError); return { success:false, error:rpcError.message || 'RPC error' }; }

      const reservationId = rpcData?.reservation_id ?? rpcData?.id ?? rpcData?.reservationId;

      if (reservationId && payload.items?.length) {
        const itemsToInsert = payload.items.map((item)=>({
          reservation_id: reservationId,
          service_type: item.service,
          label: item.label,
          quantity: item.quantity || 1,
          details: JSON.stringify(item),
        }));
        const { error: itemsError } = await this.supabase.from('reservation_items').insert(itemsToInsert);
        if (itemsError) console.error('Erreur création items:', itemsError);
      }

      const photosWithUrl = (payload.photos || []).filter((p)=>!!p.url);
      if (reservationId && photosWithUrl.length) {
        const photosToInsert = photosWithUrl.map((photo, i)=>({
          reservation_id: reservationId, url: photo.url,
          filename: photo.name || `photo_${i+1}`, size: photo.size || 0,
        }));
        const { error: photosError } = await this.supabase.from('reservation_photos').insert(photosToInsert);
        if (photosError) console.error('Erreur création photos:', photosError);
      }

      return { success:true, reservationId, reservation:{ id:reservationId, ...payload, status:'PENDING' }, data:rpcData };
    } catch (err) { return { success:false, error:err.message }; }
  }

  async insertReservationPhotos(reservationId, urls = []) {
    try {
      if (!reservationId || !urls.length) return { success:true };
      const rows = urls.map((u, idx)=>({ reservation_id:reservationId, url:u, filename:`photo_${idx+1}`, size:0 }));
      const { error } = await this.supabase.from('reservation_photos').insert(rows);
      if (error) throw error;
      return { success:true };
    } catch (err) { console.error('insertReservationPhotos error', err); return { success:false, error:err.message }; }
  }

  // --------- Devis par réservation ---------
  async getQuotesByReservationId(reservationId) {
    try {
      const { data, error } = await this.supabase
        .from('quotes')
        .select('*, quote_items(*)')
        .eq('booking_id', reservationId)
        .order('created_at', { ascending:false });
      if (error) throw error;
      return (data || []).map(q => ({
        id: q.id,
        booking_id: q.booking_id,
        status: (q.status || '').toLowerCase(),
        total: q.total ?? (q.quote_items || []).reduce((s, li)=>s + Number(li.line_total || 0), 0),
        notes: q.notes,
        createdAt: q.created_at,
        items: (q.quote_items || []).map(li=>({
          id: li.id, label: li.label, quantity: li.quantity, unit_price: li.unit_price, line_total: li.line_total
        }))
      }));
    } catch (e) { console.error('getQuotesByReservationId error', e); return []; }
  }
  pickDisplayQuote(quotes) {
    if (!quotes?.length) return null;
    const sent = quotes.find(q=>q.status === 'sent'); return sent || quotes[0];
  }

  async getReservationsOfDate(date) {
    try {
      const ymd = this.toYMDLocal(date);
      const { data: reservations, error } = await this.supabase
        .from('bookings')
        .select(`*, reservation_items(*), reservation_photos(*)`)
        .eq('date', ymd)
        .order('time', { ascending:true });
      if (error) return [];

      const list = reservations || [];
      const ids = list.map(r=>r.id);
      let quotesByBooking = {};
      if (ids.length) {
        const { data: quotes, error: qErr } = await this.supabase
          .from('quotes')
          .select('*, quote_items(*)')
          .in('booking_id', ids)
          .order('created_at', { ascending:false });
        if (!qErr && quotes) {
          for (const q of quotes) (quotesByBooking[q.booking_id] ||= []).push(q);
        }
      }

      return list.map((r) => {
        const qlist = (quotesByBooking[r.id] || []).map(q=>({
          id:q.id, booking_id:q.booking_id, status:(q.status||'').toLowerCase(),
          total: q.total ?? (q.quote_items||[]).reduce((s,li)=>s + Number(li.line_total||0), 0),
          notes:q.notes, createdAt:q.created_at
        }));
        const displayQuote = this.pickDisplayQuote(qlist);

        return {
          id:r.id, date:r.date, date_fr:this.frFromYMD(r.date),
          time:r.time, time_hm:this.hhmmFromHMS(r.time),
          status:(r.status||'').toUpperCase(),
          service:this.generateServiceSummary(r.reservation_items||[]),
          serviceDetails:this.transformItems(r.reservation_items||[]),
          customerName:r.customer_name, customerPhone:r.customer_phone,
          customerEmail:r.customer_email, district:r.district, address:r.address,
          notes:r.notes, photos:(r.reservation_photos||[]).map(p=>p.url),
          quote: displayQuote ? { id:displayQuote.id, status:displayQuote.status, total:displayQuote.total, createdAt:displayQuote.createdAt } : null,
          createdAt:r.created_at,
        };
      });
    } catch (e) { console.error('getReservationsOfDate error', e); return []; }
  }

  async getReservationById(id) {
    try {
      const { data:r, error } = await this.supabase
        .from('bookings')
        .select(`*, reservation_items(*), reservation_photos(*)`)
        .eq('id', id).single();
      if (error) return null;

      const quotes = await this.getQuotesByReservationId(id);
      const displayQuote = this.pickDisplayQuote(quotes);

      return {
        id:r.id, date:r.date, date_fr:this.frFromYMD(r.date),
        time:r.time, time_hm:this.hhmmFromHMS(r.time),
        status:(r.status||'').toUpperCase(),
        service:this.generateServiceSummary(r.reservation_items||[]),
        serviceDetails:this.transformItems(r.reservation_items||[]),
        customerName:r.customer_name, customerPhone:r.customer_phone,
        customerEmail:r.customer_email, district:r.district, address:r.address,
        notes:r.notes, photos:(r.reservation_photos||[]).map((p)=>p.url),
        quote: displayQuote ? { id:displayQuote.id, status:displayQuote.status, total:displayQuote.total, createdAt:displayQuote.createdAt } : null,
        createdAt:r.created_at,
      };
    } catch (e) { console.error('getReservationById error', e); return null; }
  }

  async updateReservationStatus(id, status) {
    try {
      const s = (status || '').toLowerCase();
      const dbStatus = s === 'canceled' ? 'cancelled' : s;
      const { data:r, error } = await this.supabase
        .from('bookings')
        .update({ status:dbStatus, updated_at:new Date().toISOString() })
        .eq('id', id).select().single();
      if (error) return { success:false, error:error.message };
      return { success:true, reservation:{ id:r.id, status:(r.status||'').toUpperCase() } };
    } catch (err) { return { success:false, error:err.message }; }
  }

  // =================================
  // DEVIS
  // =================================
  async saveQuote(reservationId, items, notes, status = 'sent') {
    try {
      // total calculé côté front (la DB peut aussi assurer un total via trigger si tu veux)
      const total = (items || []).reduce((s, it)=> s + (Number(it.quantity||0) * Number(it.price||0)), 0);

      // 1) Créer le devis
      const { data: quoteRow, error: qErr } = await this.supabase
        .from('quotes')
        .insert({ booking_id:reservationId, status, notes:notes || null, total })
        .select()
        .single();
      if (qErr) throw qErr;
      const quoteId = quoteRow.id;

      // 2) Créer les lignes — ⚠️ NE PAS ENVOYER line_total (colonne générée)
      if (items?.length) {
        const rows = items.map(it => ({
          quote_id: quoteId,
          label: String(it.label || '').trim(),
          quantity: Number(it.quantity || 0),
          unit_price: Number(it.price || 0)
          // line_total: calculé par la DB (generated column)
        }));
        const { error: liErr } = await this.supabase.from('quote_items').insert(rows);
        if (liErr) throw liErr;
      }

      return { success:true, quoteId, total };
    } catch (err) {
      console.error('❌ saveQuote error:', err);
      return { success:false, error:err.message };
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
        const details = typeof item.details === 'string' ? JSON.parse(item.details) : (item.details || {});
        return { type:item.service_type, data:{ quantity:item.quantity, ...details } };
      } catch { return { type:item.service_type, data:{ quantity:item.quantity } }; }
    });
  }

  async getAllReservations() {
    try {
      const { data: reservations, error } = await this.supabase
        .from('bookings')
        .select(`*, reservation_items(*), reservation_photos(*)`)
        .order('created_at', { ascending:false });
      if (error) return [];
      return (reservations || []).map((r)=>({
        id:r.id, date:r.date, date_fr:this.frFromYMD(r.date),
        time:r.time, time_hm:this.hhmmFromHMS(r.time),
        status:(r.status||'').toUpperCase(),
        customerName:r.customer_name,
        service:this.generateServiceSummary(r.reservation_items||[]),
        createdAt:r.created_at,
      }));
    } catch { return []; }
  }

  async getStats() {
    try {
      const today = this.toYMDLocal(new Date());
      const { count: totalReservations } = await this.supabase.from('bookings').select('*', { count:'exact', head:true });
      const { count: todayReservations } = await this.supabase.from('bookings').select('*', { count:'exact', head:true }).eq('date', today);
      const { count: pendingReservations } = await this.supabase.from('bookings').select('*', { count:'exact', head:true }).eq('date', today).eq('status','pending');
      const { count: confirmedReservations } = await this.supabase.from('bookings').select('*', { count:'exact', head:true }).eq('date', today).eq('status','confirmed');

      return {
        totalReservations: totalReservations || 0,
        todayReservations: todayReservations || 0,
        pendingReservations: pendingReservations || 0,
        confirmedReservations: confirmedReservations || 0,
      };
    } catch {
      return { totalReservations:0, todayReservations:0, pendingReservations:0, confirmedReservations:0 };
    }
  }

  // --- DISPONIBILITÉ DES CRÉNEAUX (site public) ---
  async getSlotsForDate(ymd) {
    try {
      const { data, error } = await this.supabase.rpc('get_available_slots', {
        p_date: ymd, p_times: ['10:30','13:30','15:30'], p_capacity: 1,
      });
      if (error) throw error;
      return (data || []).map(s=>({ time:s.slot_time, available:s.available, blocked:s.blocked }));
    } catch (e) { console.error('getSlotsForDate error', e); return []; }
  }
}
