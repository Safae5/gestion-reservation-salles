# Gestion de réservation de salles

Application web de gestion des salles, employés et réservations avec détection automatique des conflits de créneaux. Développée avec une approche DevOps (React 18, Laravel 11, MySQL, Docker).

## Structure du projet

```
gestion-reservation-salles/
├── backend/                # API Laravel (prête à l'emploi)
├── frontend/               # Application React
├── db/migrations/          # Scripts SQL versionnés (Flyway)
├── infra/                  # Fichiers Terraform
├── monitoring/             # Config Prometheus/Grafana
├── diagrammes/             # Diagrammes PlantUML
├── docker-compose.yml
└── README.md
```

## Règles de gestion implémentées

- Chaque salle a un numéro unique, une capacité et un type (salle de conférence, bureau, salle de formation)
- Chaque employé a un numéro unique, nom, prénom, département
- Une réservation lie un employé à une salle, avec date, heure de début et durée
- **Une salle ne peut pas être réservée si le créneau chevauche une réservation existante** — appliqué par `DisponibiliteService.php`, avec réponse HTTP `409 Conflict` explicite
- Un employé peut avoir plusieurs réservations, mais pas deux qui se chevauchent sur la même salle (même règle de chevauchement)

## Diagrammes (dossier `diagrammes/`)

- `diagramme_classe.puml` — Employe, Salle, Reservation, Admin, règles d'association
- `diagramme_sequence.puml` — flux complet d'une réservation, avec le cas de conflit détecté

Pour les visualiser : colle le contenu sur plantuml.com/plantuml ou installe l'extension **PlantUML** dans VS Code.

## Quick start

### 1. Launch with Docker

From the project root:

```bash
docker compose up -d
docker compose ps
```

**Services:**

| Service | URL |
|---|---|
| Frontend | http://localhost:5174 |
| Backend API | http://localhost:8100/api |
| Grafana | http://localhost:3100 (admin/admin) |
| Prometheus | http://localhost:9191 |
| MySQL | localhost:3311 (user: reservation, pass: reservation) |

### 2. Test the application

1. Open http://localhost:5174
2. Sign up (role "admin")
3. Go to Rooms → add a room (e.g., number `101`, capacity `10`)
4. Go to Employees → add an employee (e.g., number `E001`, name "El Omari")
5. Go to Reservations → book room 101, 2026-07-25 10:00, duration 2h
6. Test conflict detection → try booking the same room 11:00-12:00 → should get `409` error

## Rules

- Each room has a unique number, capacity, and type
- Each employee has a unique number, name, department
- A reservation links employee to room with date, start time, duration
- **No overlapping reservations on the same room** — enforced by `DisponibiliteService.php` with HTTP `409 Conflict`

## Project diagrams

PlantUML files in `diagrammes/`:
- `diagramme_classe.puml` — class diagram
- `diagramme_sequence.puml` — reservation flow with conflict case

View on https://plantuml.com/plantuml or install PlantUML extension in VS Code.

## Local development (without Docker)

```bash
# Terminal 1 — Backend
cd backend
php artisan migrate
php artisan serve

# Terminal 2 — Frontend
cd frontend
npm run dev
```

## Notes

- All services run in Docker with unique ports (no conflicts with other projects)
- Database: MySQL 8.0 on port 3311, credentials `reservation:reservation`
- Migrations handled by Flyway, executed on container startup
- Prometheus + Grafana for monitoring
