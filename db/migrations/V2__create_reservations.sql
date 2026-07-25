-- Migration Flyway V2 : reservations + regle de non-chevauchement (index de recherche)

CREATE TABLE IF NOT EXISTS reservations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employe_id INT NOT NULL,
  salle_id INT NOT NULL,
  date DATE NOT NULL,
  heure_debut TIME NOT NULL,
  duree_minutes INT UNSIGNED NOT NULL,
  heure_fin TIME NOT NULL,
  statut VARCHAR(20) NOT NULL DEFAULT 'confirmee',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_reservation_employe FOREIGN KEY (employe_id) REFERENCES employes(id) ON DELETE CASCADE,
  CONSTRAINT fk_reservation_salle FOREIGN KEY (salle_id) REFERENCES salles(id) ON DELETE CASCADE,
  INDEX idx_salle_date (salle_id, date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
