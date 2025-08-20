/*
  # Mise à jour fonction get_available_slots pour gérer les créneaux bloqués

  1. Modifications
    - Prendre en compte les créneaux bloqués dans la table slots
    - Retourner plus d'informations sur le statut des créneaux

  2. Nouvelle logique
    - Si blocked = true dans slots, disponibilité = 0
    - Sinon, calculer normalement la disponibilité
*/

-- Fonction mise à jour pour récupérer les créneaux disponibles avec gestion des blocages
CREATE OR REPLACE FUNCTION get_available_slots(p_date date)
RETURNS TABLE(slot_time time, available integer, blocked boolean) AS $$
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
            WHEN COALESCE(ss.blocked, false) = true THEN 0
            ELSE GREATEST(0, COALESCE(ss.capacity, 2) - COALESCE(bc.booked, 0))
        END as available,
        COALESCE(ss.blocked, false) as blocked
    FROM time_slots ts
    LEFT JOIN booked_counts bc ON ts.slot_time = bc.time
    LEFT JOIN slot_status ss ON ts.slot_time = ss.time
    ORDER BY ts.slot_time;
END;
$$ LANGUAGE plpgsql;