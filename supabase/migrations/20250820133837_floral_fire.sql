/*
  # Tables de détails des réservations

  1. Nouvelles tables
    - `reservation_items` - Items détaillés de chaque réservation
    - `reservation_photos` - Photos associées aux réservations

  2. Relations
    - reservation_items.reservation_id → bookings.id
    - reservation_photos.reservation_id → bookings.id

  3. Sécurité
    - RLS activé avec policies pour insertion publique
*/

-- Table des items de réservation (détails des services)
CREATE TABLE IF NOT EXISTS reservation_items (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    reservation_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    service_type text NOT NULL,
    label text NOT NULL,
    quantity integer DEFAULT 1,
    details jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE reservation_items ENABLE ROW LEVEL SECURITY;

-- Table des photos de réservation
CREATE TABLE IF NOT EXISTS reservation_photos (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    reservation_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    url text NOT NULL,
    filename text,
    size integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE reservation_photos ENABLE ROW LEVEL SECURITY;

-- Policies pour reservation_items
CREATE POLICY "Anyone can create reservation items"
    ON reservation_items FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Admins can view all reservation items"
    ON reservation_items FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Policies pour reservation_photos
CREATE POLICY "Anyone can create reservation photos"
    ON reservation_photos FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Admins can view all reservation photos"
    ON reservation_photos FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_reservation_items_reservation_id 
    ON reservation_items(reservation_id);

CREATE INDEX IF NOT EXISTS idx_reservation_photos_reservation_id 
    ON reservation_photos(reservation_id);

CREATE INDEX IF NOT EXISTS idx_bookings_date_time 
    ON bookings(date, time);

CREATE INDEX IF NOT EXISTS idx_bookings_status 
    ON bookings(status);