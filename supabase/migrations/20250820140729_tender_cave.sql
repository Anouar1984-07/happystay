/*
  # Correction finale fonction get_available_slots
  
  1. Suppression complète de toutes les versions de la fonction
  2. Recréation avec types corrects (bigint pour available)
  3. Gestion propre des créneaux bloqués
*/

-- Supprimer complètement toutes les versions de la fonction
DROP FUNCTION IF EXISTS get_available_slots(date);
DROP FUNCTION IF EXISTS get_available_slots(p_date date);

-- Recréer la fonction avec les bons types
CREATE OR REPLACE FUNCTION get_available_slots(p_date date)
RETURNS TABLE(slot_time time, available bigint, blocked boolean) AS $$
BEGIN
    RETURN QUERY
    WITH time_slots AS (
        SELECT '10:00'::time as slot_time
        UNION SELECT '13:30'::time
        UNION SELECT '15:00'::time
    ),
    booked_counts AS (
        SELECT 
            b.time,
            COUNT(*) as booked
        FROM bookings b
        WHERE b.date = p_date 
        AND b.status IN ('pending', 'confirmed')
        GROUP BY b.time
    ),
    slot_status AS (
        SELECT 
            s.blocked,
            s.capacity,
            s.time
        FROM slots s
        WHERE s.date = p_date
    )
    SELECT 
        ts.slot_time,
        CASE 
            WHEN COALESCE(ss.blocked, false) = true THEN 0::bigint
            ELSE GREATEST(0::bigint, COALESCE(ss.capacity::bigint, 2::bigint) - COALESCE(bc.booked, 0::bigint))
        END as available,
        COALESCE(ss.blocked, false) as blocked
    FROM time_slots ts
    LEFT JOIN booked_counts bc ON ts.slot_time = bc.time
    LEFT JOIN slot_status ss ON ts.slot_time = ss.time
    ORDER BY ts.slot_time;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test de la fonction
SELECT 'Test fonction get_available_slots:' as message;
SELECT * FROM get_available_slots(CURRENT_DATE);