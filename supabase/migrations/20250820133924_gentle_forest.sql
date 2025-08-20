/*
  # Création utilisateur admin (OPTIONNEL)

  IMPORTANT: Modifiez l'UUID ci-dessous avec votre vrai UUID utilisateur !
  
  Pour obtenir votre UUID :
  1. Créez un compte dans Authentication > Users
  2. Copiez l'UUID de votre utilisateur
  3. Remplacez 'VOTRE-UUID-ICI' par votre vrai UUID
*/

-- REMPLACEZ 'VOTRE-UUID-ICI' par votre UUID utilisateur réel !
INSERT INTO profiles (id, email, role) VALUES
('VOTRE-UUID-ICI', 'admin@happystay.com', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- Exemple avec un UUID fictif (à remplacer) :
-- INSERT INTO profiles (id, email, role) VALUES
-- ('12345678-1234-1234-1234-123456789012', 'admin@happystay.com', 'admin')
-- ON CONFLICT (id) DO UPDATE SET role = 'admin';