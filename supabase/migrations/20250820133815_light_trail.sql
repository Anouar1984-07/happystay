/*
  # Schema initial Happy Stay

  1. Tables principales
    - `services` - Services disponibles (Canapé, Chaises, Matelas)
    - `bookings` - Réservations principales
    - `slots` - Créneaux horaires disponibles
    - `profiles` - Profils utilisateurs avec rôles

  2. Sécurité
    - Enable RLS sur toutes les tables
    - Policies pour insertion publique et lecture admin

  3. Fonctions
    - `get_available_slots()` - Récupère les créneaux disponibles
*/

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des services
CREATE TABLE IF NOT EXISTS services (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    description text,
    base_price decimal(10,2) DEFAULT 0,
    active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Table des profils utilisateurs
CREATE TABLE IF NOT EXISTS profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text UNIQUE NOT NULL,
    role text DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Table des réservations principales
CREATE TABLE IF NOT EXISTS bookings (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id uuid REFERENCES services(id),
    date date NOT NULL,
    time time NOT NULL,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    customer_name text NOT NULL,
    customer_phone text NOT NULL,
    customer_email text,
    district text NOT NULL,
    address text,
    notes text,
    photos jsonb DEFAULT '[]'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(date, time)
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Table des créneaux (pour gestion manuelle)
CREATE TABLE IF NOT EXISTS slots (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    date date NOT NULL,
    time time NOT NULL,
    capacity integer DEFAULT 2,
    booked integer DEFAULT 0,
    blocked boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(date, time)
);

ALTER TABLE slots ENABLE ROW LEVEL SECURITY;

-- Policies pour services (lecture publique)
CREATE POLICY "Services are viewable by everyone"
    ON services FOR SELECT
    TO anon, authenticated
    USING (active = true);

-- Policies pour bookings (insertion publique, lecture admin)
CREATE POLICY "Anyone can create bookings"
    ON bookings FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Admins can view all bookings"
    ON bookings FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can update bookings"
    ON bookings FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Policies pour slots (lecture publique, modification admin)
CREATE POLICY "Slots are viewable by everyone"
    ON slots FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Admins can manage slots"
    ON slots FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Policies pour profiles (utilisateurs voient leur profil)
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- Fonction pour récupérer les créneaux disponibles
CREATE OR REPLACE FUNCTION get_available_slots(p_date date)
RETURNS TABLE(slot_time time, available integer) AS $$
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
            WHEN ss.blocked = true THEN 0
            ELSE COALESCE(ss.capacity, 2) - COALESCE(bc.booked, 0)
        END as available
    FROM time_slots ts
    LEFT JOIN booked_counts bc ON ts.slot_time = bc.time
    LEFT JOIN slot_status ss ON ts.slot_time = ss.time
    ORDER BY ts.slot_time;
END;
$$ LANGUAGE plpgsql;

-- Insérer les services de base
INSERT INTO services (name, description, base_price, active) VALUES
('Canapé/Fauteuil', 'Nettoyage de canapés et fauteuils', 150.00, true),
('Chaises', 'Nettoyage de chaises', 25.00, true),
('Matelas', 'Nettoyage et désinfection de matelas', 120.00, true),
('Ménage Standard', 'Ménage standard', 200.00, true),
('Grand Ménage', 'Grand ménage complet', 350.00, true)
ON CONFLICT DO NOTHING;