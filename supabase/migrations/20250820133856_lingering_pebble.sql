/*
  # Données de test Happy Stay

  1. Réservations factices
    - 2 réservations pour aujourd'hui
    - 2 réservations pour demain
    - Avec items et photos associés

  2. Créneaux bloqués
    - Quelques créneaux bloqués pour tester
*/

-- Variables pour les dates
DO $$
DECLARE
    today_date date := CURRENT_DATE;
    tomorrow_date date := CURRENT_DATE + INTERVAL '1 day';
    service_canape_id uuid;
    service_chaises_id uuid;
    service_matelas_id uuid;
    booking1_id uuid;
    booking2_id uuid;
    booking3_id uuid;
    booking4_id uuid;
BEGIN
    -- Récupérer les IDs des services
    SELECT id INTO service_canape_id FROM services WHERE name = 'Canapé/Fauteuil' LIMIT 1;
    SELECT id INTO service_chaises_id FROM services WHERE name = 'Chaises' LIMIT 1;
    SELECT id INTO service_matelas_id FROM services WHERE name = 'Matelas' LIMIT 1;

    -- Réservation 1 - Aujourd'hui 10:00
    INSERT INTO bookings (
        id, service_id, date, time, status,
        customer_name, customer_phone, customer_email,
        district, address, notes
    ) VALUES (
        uuid_generate_v4(), service_canape_id, today_date, '10:00', 'confirmed',
        'Fatima Alaoui', '+212639887031', 'fatima@email.com',
        'Talborjt', 'Rue Hassan II, Immeuble 5, Apt 12',
        'Canapé en tissu beige avec quelques taches de café. Accès par ascenseur au 3ème étage.'
    ) RETURNING id INTO booking1_id;

    -- Items pour réservation 1
    INSERT INTO reservation_items (reservation_id, service_type, label, quantity, details) VALUES
    (booking1_id, 'Canapé/Fauteuil', 'Canapé 3 places tissu', 1, '{"size": "3 places", "material": "tissu", "stains": "légères", "options": ["anti-acariens"]}'),
    (booking1_id, 'Chaises', 'Chaises tissu', 4, '{"material": "tissu", "removableCushion": true}');

    -- Photos pour réservation 1
    INSERT INTO reservation_photos (reservation_id, url, filename, size) VALUES
    (booking1_id, 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=400', 'vue-ensemble.jpg', 1024000),
    (booking1_id, 'https://images.pexels.com/photos/2062426/pexels-photo-2062426.jpeg?auto=compress&cs=tinysrgb&w=400', 'detail-taches.jpg', 856000);

    -- Réservation 2 - Aujourd'hui 13:30
    INSERT INTO bookings (
        id, service_id, date, time, status,
        customer_name, customer_phone,
        district, address, notes
    ) VALUES (
        uuid_generate_v4(), service_matelas_id, today_date, '13:30', 'pending',
        'Ahmed Benali', '+212661234567',
        'Founty', 'Avenue Mohammed V, Villa 25',
        'Matelas king size, allergie aux acariens - traitement spécial requis'
    ) RETURNING id INTO booking2_id;

    -- Items pour réservation 2
    INSERT INTO reservation_items (reservation_id, service_type, label, quantity, details) VALUES
    (booking2_id, 'Matelas', 'Matelas King Size', 1, '{"format": "King", "faces": 2, "note": "Allergie aux acariens - traitement spécial requis"}');

    -- Photos pour réservation 2
    INSERT INTO reservation_photos (reservation_id, url, filename, size) VALUES
    (booking2_id, 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=400', 'matelas-vue1.jpg', 945000),
    (booking2_id, 'https://images.pexels.com/photos/271897/pexels-photo-271897.jpeg?auto=compress&cs=tinysrgb&w=400', 'matelas-vue2.jpg', 782000);

    -- Réservation 3 - Demain 10:00
    INSERT INTO bookings (
        id, service_id, date, time, status,
        customer_name, customer_phone, customer_email,
        district, address, notes
    ) VALUES (
        uuid_generate_v4(), service_canape_id, tomorrow_date, '10:00', 'pending',
        'Khadija Moussaoui', '+212677888999', 'khadija@email.com',
        'Sonaba', 'Quartier résidentiel, Maison 15',
        '2 fauteuils en cuir marron, légères éraflures à traiter'
    ) RETURNING id INTO booking3_id;

    -- Items pour réservation 3
    INSERT INTO reservation_items (reservation_id, service_type, label, quantity, details) VALUES
    (booking3_id, 'Canapé/Fauteuil', 'Fauteuils cuir 1 place', 2, '{"size": "1 place", "material": "cuir", "stains": "importantes", "options": ["protection-anti-taches"]}'),
    (booking3_id, 'Matelas', 'Matelas 160cm', 1, '{"format": "160", "faces": 1, "note": "Matelas récent, nettoyage préventif"}');

    -- Photos pour réservation 3
    INSERT INTO reservation_photos (reservation_id, url, filename, size) VALUES
    (booking3_id, 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400', 'fauteuils-cuir.jpg', 1156000),
    (booking3_id, 'https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg?auto=compress&cs=tinysrgb&w=400', 'detail-eraflures.jpg', 923000);

    -- Réservation 4 - Demain 15:00
    INSERT INTO bookings (
        id, service_id, date, time, status,
        customer_name, customer_phone,
        district, notes
    ) VALUES (
        uuid_generate_v4(), service_chaises_id, tomorrow_date, '15:00', 'confirmed',
        'Youssef Kadiri', '+212698765432',
        'Hay Mohammadi',
        '6 chaises de salle à manger, tissu gris clair'
    ) RETURNING id INTO booking4_id;

    -- Items pour réservation 4
    INSERT INTO reservation_items (reservation_id, service_type, label, quantity, details) VALUES
    (booking4_id, 'Chaises', 'Chaises salle à manger', 6, '{"material": "tissu", "removableCushion": false}');

    -- Photos pour réservation 4
    INSERT INTO reservation_photos (reservation_id, url, filename, size) VALUES
    (booking4_id, 'https://images.pexels.com/photos/6197119/pexels-photo-6197119.jpeg?auto=compress&cs=tinysrgb&w=400', 'chaises-salle-manger.jpg', 1087000);

    -- Créer quelques créneaux bloqués pour tester
    INSERT INTO slots (date, time, capacity, booked, blocked) VALUES
    (today_date, '15:00', 2, 0, true),
    (tomorrow_date, '13:30', 2, 0, true)
    ON CONFLICT (date, time) DO NOTHING;

END $$;