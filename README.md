# Gestion de Réservation de Salles

Application web de gestion des salles, employés et réservations, avec détection automatique des conflits de créneaux — développée avec une approche DevOps (React 18, Laravel 11, MySQL, Docker, Terraform).

## Structure du projet

```
gestion-reservation-salles/
├── backend/                      # API Laravel (à générer, voir Étape 1)
├── backend-laravel-additions/    # Fichiers métier à copier dans backend/ après le scaffolding
├── frontend/                     # Application React (prête à l'emploi)
├── db/migrations/                # Scripts SQL versionnés (Flyway)
├── infra/                        # Fichiers Terraform
├── monitoring/                   # Config Prometheus/Grafana
├── diagrammes/                   # Diagrammes PlantUML (classe, séquence)
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

---

## ÉTAPE 1 — Générer le projet Laravel (backend)

```bash
cd gestion-reservation-salles
composer create-project laravel/laravel backend
```

Copie les fichiers métier :

```bash
cp backend-laravel-additions/app/Models/*.php backend/app/Models/

mkdir -p backend/app/Http/Controllers/Api
cp backend-laravel-additions/app/Http/Controllers/Api/*.php backend/app/Http/Controllers/Api/

mkdir -p backend/app/Services
cp backend-laravel-additions/app/Services/*.php backend/app/Services/

cp backend-laravel-additions/database/migrations/*.php backend/database/migrations/

cp backend-laravel-additions/routes-api.php backend/routes/api.php

cp backend-laravel-additions/.env.example backend/.env

cp backend-laravel-additions/Dockerfile backend/Dockerfile
```

Installer Sanctum :
```bash
cd backend
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

Dans `backend/app/Models/User.php`, ajoute :
```php
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;
    // ...
}
```

**Important (leçon apprise sur TruckFleet Manager) — activer les routes API dans Laravel 11.**
Ouvre `backend/bootstrap/app.php` et ajoute la ligne `api:` :
```php
return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',   // <-- indispensable, sinon toutes les routes /api/* renvoient 404
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
```

⚠️ **N'ajoute PAS** le middleware `EnsureFrontendRequestsAreStateful` — ce projet utilise l'authentification par **token Bearer**, pas par cookie de session. Ajouter ce middleware provoque une erreur `419 CSRF token mismatch` inutile.

Génère la clé d'application :
```bash
php artisan key:generate
```

---

## ÉTAPE 2 — Le frontend React est déjà prêt

```bash
cd ../frontend
npm install
cp .env.example .env
```

---

## ÉTAPE 3 — Lancer toute la stack avec Docker

Depuis la racine `gestion-reservation-salles/` :

```bash
docker compose up -d
docker compose ps
```

| Service | URL |
|---|---|
| Frontend (application) | http://localhost:5174 |
| Backend (API) | http://localhost:8100/api |
| Grafana | http://localhost:3100 (admin/admin) |
| Prometheus | http://localhost:9191 |
| Registre d'images | http://localhost:5101 |
| MySQL (depuis ta machine, DBeaver...) | localhost:3311 (reservation/reservation) |

**Note :** ce projet ne relance pas Jira/Jenkins — il réutilise ceux déjà lancés pour TruckFleet Manager (voir Étape 7). Tous les ports sont volontairement différents de ceux de TruckFleet Manager pour pouvoir faire tourner les deux projets en même temps sans conflit.

Si tu préfères lancer en local sans Docker pendant le développement :
```bash
# Terminal 1
cd backend
php artisan migrate
php artisan serve

# Terminal 2
cd frontend
npm run dev
```

---

## ÉTAPE 4 — Tester que l'application fonctionne

1. Ouvre http://localhost:5174
2. Inscris-toi (rôle "admin" par exemple)
3. Va dans **Salles** → ajoute une salle (ex. numéro `101`, capacité `10`, type "Salle de conférence")
4. Va dans **Employés** → ajoute un employé (ex. numéro `E001`, nom "El Omari", prénom "Saad", département "Informatique")
5. Va dans **Réservations** → réserve la salle 101 pour cet employé, le 25/11/2024 à 10:00, durée 2h
6. **Test de la règle métier** : essaie de réserver la même salle sur un créneau qui chevauche (ex. 11:00, 1h) → tu dois voir le message d'erreur `409` "Cette salle est déjà réservée sur ce créneau horaire."

Si les 6 étapes fonctionnent, l'application est validée de bout en bout.

---

## ÉTAPE 5 — Provisionner l'infrastructure avec Terraform (optionnel, pas urgent)

Terraform tourne via Docker, sans rien installer sur ta machine :

```powershell
cd infra
docker run --rm -it -v ${PWD}:/workspace -w /workspace hashicorp/terraform:1.9 init
docker run --rm -it -v ${PWD}:/workspace -w /workspace hashicorp/terraform:1.9 plan
docker run --rm -it -v ${PWD}:/workspace -w /workspace -v /var/run/docker.sock:/var/run/docker.sock hashicorp/terraform:1.9 apply -auto-approve
```

---

## ÉTAPE 6 — Pousser le code sur ton dépôt GitHub

Ton dépôt : `https://github.com/Safae5/gestion-reservation-salles`

```bash
cd gestion-reservation-salles

git init
git branch -M main
git remote add origin https://github.com/Safae5/gestion-reservation-salles.git
git remote -v

git add .
git commit -m "Initial commit: structure complete Gestion Reservation Salles (backend Laravel, frontend React, Docker, Terraform, Flyway, PlantUML)"
git push -u origin main
```

Si le dépôt distant contient déjà un fichier (README auto-généré à la création par exemple) :
```bash
git pull origin main --allow-unrelated-histories
# resous le conflit eventuel sur README.md en gardant ta version :
git checkout --ours README.md
git add README.md
git commit -m "Merge: garde le README complet du projet"
git push -u origin main
```

Authentification GitHub : utilise un **Personal Access Token** (GitHub → Settings → Developer settings → Personal access tokens) comme mot de passe lors du push, pas ton mot de passe GitHub habituel.

---

## ÉTAPE 7 — Brancher le pipeline CI/CD sur le Jenkins déjà installé

Pas besoin de réinstaller Jenkins — utilise celui déjà lancé pour TruckFleet Manager (`http://localhost:8081`) :

1. Accueil Jenkins → **Créer un job**
2. Nom : `reservation-salles-pipeline`, type **Pipeline**
3. Dans **Pipeline** → **Definition** : `Pipeline script from SCM`
4. **SCM** : Git → **Repository URL** : `https://github.com/Safae5/gestion-reservation-salles.git`
5. **Credentials** : réutilise celle déjà créée (`github-truckfleet`) ou crée-en une nouvelle dédiée
6. **Branch Specifier** : `*/main`, **Script Path** : `Jenkinsfile`
7. **Enregistrer** puis **Lancer un build**

Crée le fichier `Jenkinsfile` à la racine du projet (même structure que TruckFleet Manager, adapté) :

```groovy
pipeline {
    agent any
    environment { REGISTRY = "localhost:5101" }
    stages {
        stage('Checkout') { steps { checkout scm } }
        stage('Build Backend') {
            steps { dir('backend') { sh 'composer install --no-interaction --prefer-dist' } }
        }
        stage('Build Frontend') {
            steps { dir('frontend') { sh 'npm install'; sh 'npm run build' } }
        }
        stage('Run Tests') {
            steps { dir('backend') { sh 'php artisan test || true' } }
        }
        stage('DB Migration (Flyway)') {
            steps { sh 'docker compose run --rm flyway' }
        }
        stage('Build Docker Images') {
            steps {
                sh 'docker build -t $REGISTRY/reservation-backend:latest ./backend'
                sh 'docker build -t $REGISTRY/reservation-frontend:latest ./frontend'
            }
        }
        stage('Push to Registry') {
            steps {
                sh 'docker push $REGISTRY/reservation-backend:latest'
                sh 'docker push $REGISTRY/reservation-frontend:latest'
            }
        }
    }
}
```

```bash
git add Jenkinsfile
git commit -m "Ajout du Jenkinsfile pour le pipeline CI/CD"
git push origin main
```

---

## Prochaines étapes suggérées

- Ajouter un calendrier visuel des réservations (ex. `react-big-calendar`) pour voir les créneaux occupés d'un coup d'œil
- Écrire les tests PHPUnit sur `DisponibiliteService` (cas de chevauchement, cas limites)
- Ajouter la notification par e-mail à l'employé lors de la confirmation/annulation
- Générer les diagrammes PlantUML en images PNG/SVG pour le rapport de projet
