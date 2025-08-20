/*
  # Fonctions API pour Happy Stay

  1. Fonctions principales
    - `api_create_booking()` - Créer une réservation de manière sécurisée
    - Triggers pour mise à jour automatique des timestamps

  2. Sécurité
    - Vérification de disponibilité des créneaux
    - Gestion atomique des transactions
*/

-- Fonction pour créer une réservation complète
CREATE OR REPLACE FUNCTION api_create_booking(
    p_service_id uuid,
    p_date date,
    p_time time,
    p_customer_name text,
    p_customer_phone text,
    p_customer_email text DEFAULT NULL,
    p_district text,
    p_address text DEFAULT NULL,
    p_notes text DEFAULT NULL,
    p_photos jsonb DEFAULT '[]'::jsonb
) RETURNS uuid AS $$
DECLARE
    v_booking_id uuid;
    v_available integer;
BEGIN
    -- Vérifier la disponibilité du créneau
    SELECT available INTO v_available
    FROM get_available_slots(p_date)
    WHERE slot_time = p_time;
    
    IF v_available IS NULL OR v_available <= 0 THEN
        RAISE EXCEPTION 'Créneau non disponible pour le % à %', p_date, p_time;
    END IF;
    
    -- Créer la réservation
    INSERT INTO bookings (
        service_id,
        date,
        time,
        customer_name,
        customer_phone,
        customer_email,
        district,
        address,
        notes,
        photos,
        status
    ) VALUES (
        p_service_id,
        p_date,
        p_time,
        p_customer_name,
        p_customer_phone,
        p_customer_email,
        p_district,
        p_address,
        p_notes,
        p_photos,
        'pending'
    ) RETURNING id INTO v_booking_id;
    
    RETURN v_booking_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour mise à jour automatique des timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger sur les tables principales
DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at
    BEFORE UPDATE ON services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_slots_updated_at ON slots;
CREATE TRIGGER update_slots_updated_at
    BEFORE UPDATE ON slots
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Fonction utilitaire pour obtenir les statistiques
CREATE OR REPLACE FUNCTION get_booking_stats()
RETURNS TABLE(
    total_bookings bigint,
    today_bookings bigint,
    pending_bookings bigint,
    confirmed_bookings bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM bookings) as total_bookings,
        (SELECT COUNT(*) FROM bookings WHERE date = CURRENT_DATE) as today_bookings,
        (SELECT COUNT(*) FROM bookings WHERE date = CURRENT_DATE AND status = 'pending') as pending_bookings,
        (SELECT COUNT(*) FROM bookings WHERE date = CURRENT_DATE AND status = 'confirmed') as confirmed_bookings;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;