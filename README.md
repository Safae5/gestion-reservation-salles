# Gestion de réservation de salles

Application web de gestion des salles, employés et réservations, avec détection automatique des conflits de créneaux. Approche DevOps (React 18, Laravel 13, MySQL 8, Docker).

## Prérequis

| Outil | Version minimale | Vérifier avec |
|---|---|---|
| Docker Engine | 20.10 | `docker --version` |
| Docker Compose | v2 | `docker compose version` |
| Git | 2.x | `git --version` |
| OpenSSL | toute version récente | `openssl version` |

Rien d'autre à installer. PHP, Composer, Node et MySQL tournent tous dans les conteneurs. Inutile de les avoir sur la machine.

Attention à la commande Compose. Ce projet utilise `docker compose` (v2, avec un espace) et non `docker-compose` (v1, avec un tiret). La v1 ne comprend pas les profils Docker utilisés ici.

## Structure du projet

```
gestion-reservation-salles/
├── backend/          # API Laravel (Sanctum, tokens Bearer)
├── frontend/         # Application React + Vite
├── db/migrations/    # Scripts SQL versionnés (Flyway, pipeline CI/CD)
├── infra/            # Fichiers Terraform
├── monitoring/       # Config Prometheus/Grafana
├── diagrammes/       # Diagrammes PlantUML
├── docker-compose.yml
└── README.md
```

---

# Installation pas à pas

## Étape 1, vérifier que Docker fonctionne

```bash
docker compose version
docker run --rm hello-world
```

La deuxième commande doit afficher un message de bienvenue. Si elle échoue avec une erreur de permission, ajouter l'utilisateur au groupe docker puis ouvrir une nouvelle session :

```bash
sudo usermod -aG docker $USER
```

## Étape 2, cloner le dépôt

```bash
git clone git@github.com:Safae5/gestion-reservation-salles.git
cd gestion-reservation-salles
```

## Étape 3, créer les fichiers d'environnement

Les fichiers `.env` ne sont pas versionnés (ils sont dans `.gitignore`), il faut donc les créer au premier clone. Sans eux, le backend ne démarre pas.

Le fichier `backend/.env.example` est le fichier par défaut de Laravel, il pointe vers SQLite. Le bloc ci-dessous écrit directement une configuration prête pour Docker, il suffit de le copier-coller en entier :

```bash
cat > backend/.env <<'EOF'
APP_NAME="Gestion Reservation Salles"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8100

APP_LOCALE=fr
APP_FALLBACK_LOCALE=en

LOG_CHANNEL=stack
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=mysql-db
DB_PORT=3306
DB_DATABASE=reservation_salles
DB_USERNAME=reservation
DB_PASSWORD=reservation

SESSION_DRIVER=file
CACHE_STORE=file
QUEUE_CONNECTION=sync

MAIL_MAILER=log
EOF
```

Puis le fichier du frontend :

```bash
echo "VITE_API_URL=http://localhost:8100/api" > frontend/.env
```

Noter que `DB_HOST` vaut `mysql-db` et non `localhost`. C'est le nom du service dans `docker-compose.yml`. À l'intérieur du réseau Docker, les conteneurs s'appellent par ce nom, un peu comme des postes qui se joignent par leur nom de machine sur un réseau local.

## Étape 4, générer la clé applicative

Laravel chiffre les sessions et les tokens avec `APP_KEY`. Sans elle, l'API renvoie une erreur au premier appel.

```bash
KEY="base64:$(openssl rand -base64 32)"
sed -i "s|^APP_KEY=.*|APP_KEY=$KEY|" backend/.env
grep APP_KEY backend/.env
```

La dernière commande doit afficher une ligne du type `APP_KEY=base64:xxxxx...`. Si elle est vide, l'étape a échoué.

## Étape 5, construire les images et démarrer

```bash
docker compose up -d --build
```

Le premier lancement télécharge les images de base et installe les dépendances (Composer et npm). Compter 10 à 30 minutes selon le débit, environ 500 Mo au total. Les lancements suivants prennent quelques secondes grâce au cache Docker.

Trois conteneurs démarrent : `mysql-db`, `backend` et `frontend`. Les services de supervision et de CI/CD ne démarrent pas par défaut, voir la section sur les profils.

## Étape 6, suivre le démarrage du backend

```bash
docker compose logs -f backend
```

Le backend attend que MySQL soit prêt, joue les migrations, puis démarre le serveur. Les lignes attendues :

```
[entrypoint] Attente de MySQL sur mysql-db:3306...
[entrypoint] MySQL est pret.
INFO  Running migrations.
[entrypoint] Demarrage du serveur sur le port 8000
```

Quitter le suivi des logs avec `Ctrl+C`, cela n'arrête pas les conteneurs.

## Étape 7, vérifier que tout répond

```bash
docker compose ps
curl -i http://localhost:8100/up
curl -s -o /dev/null -w "frontend: %{http_code}\n" http://localhost:5174
```

Les trois conteneurs doivent être `Up`, et `mysql-db` doit afficher `(healthy)`. Les deux appels HTTP doivent renvoyer `200`.

Vérifier que les tables ont bien été créées :

```bash
docker compose exec mysql-db mysql -ureservation -preservation -e "SHOW TABLES;" reservation_salles
```

La liste doit contenir `salles`, `employes`, `reservations`, `users` et `personal_access_tokens`.

---

## Services et ports

| Service | URL | Identifiants |
|---|---|---|
| Frontend | http://localhost:5174 | |
| API backend | http://localhost:8100/api | |
| MySQL | localhost:3311 | reservation / reservation |
| Grafana (profil `monitoring`) | http://localhost:3100 | admin / admin |
| Prometheus (profil `monitoring`) | http://localhost:9191 | |
| Registre d'images (profil `ci`) | http://localhost:5101 | |

Les ports sont volontairement décalés pour pouvoir faire tourner ce projet en parallèle de truckfleet-manager sans conflit.

## Commandes utiles au quotidien

```bash
# Etat des conteneurs
docker compose ps

# Logs d'un service, en continu
docker compose logs -f backend
docker compose logs -f frontend

# Arreter sans perdre les donnees
docker compose stop

# Redemarrer
docker compose start

# Arreter et supprimer les conteneurs (les donnees MySQL sont conservees)
docker compose down

# Tout supprimer, y compris la base de donnees
docker compose down -v

# Reconstruire apres un changement de dependances (composer.json, package.json)
docker compose up -d --build

# Ouvrir un shell dans le backend
docker compose exec backend bash

# Commandes Laravel
docker compose exec backend php artisan migrate
docker compose exec backend php artisan migrate:fresh
docker compose exec backend php artisan route:list

# Ouvrir un client MySQL
docker compose exec mysql-db mysql -ureservation -preservation reservation_salles
```

## Services optionnels (profils Docker)

La supervision et les outils du pipeline restent éteints par défaut pour garder le démarrage local léger, environ 800 Mo d'images en moins à télécharger.

```bash
# Prometheus + Grafana
docker compose --profile monitoring up -d

# Registre d'images prive
docker compose --profile ci up -d registry

# Migrations Flyway (lire la note dans "Notes techniques" avant)
docker compose --profile ci run --rm flyway
```

---

## Vérifier les règles métier

1. Ouvrir http://localhost:5174
2. S'inscrire avec le rôle `admin`
3. Aller dans Salles, ajouter une salle (numéro `101`, capacité `10`, type "Salle de conférence")
4. Aller dans Employés, ajouter un employé (numéro `E001`, nom "El Omari", prénom "Saad", département "Informatique")
5. Aller dans Réservations, réserver la salle 101 le 25/11/2026 à 10:00 pour 2 heures
6. Retenter la même salle sur un créneau qui chevauche (11:00, 1 heure). L'API doit répondre `409 Conflict` avec le message "Cette salle est déjà réservée sur ce créneau horaire."

Si ces 6 étapes passent, l'application est validée de bout en bout.

## Dépannage

**Le backend redémarre en boucle.** Regarder `docker compose logs backend`. La cause la plus fréquente est un `APP_KEY` vide ou un `backend/.env` absent. Reprendre les étapes 3 et 4.

**Erreur `Connection refused` vers la base.** Vérifier que `DB_HOST=mysql-db` dans `backend/.env`, et pas `localhost` ou `127.0.0.1`. Depuis un conteneur, `localhost` désigne le conteneur lui-même, pas la machine hôte.

**Erreur `port is already allocated`.** Un autre projet occupe déjà le port. Trouver le coupable avec `docker ps` ou `sudo lsof -i :8100`, puis arrêter le conteneur concerné ou changer le port publié dans `docker-compose.yml`.

**Toutes les routes `/api/*` renvoient 404.** Vérifier que `bootstrap/app.php` contient bien la ligne `api: __DIR__.'/../routes/api.php'` dans `withRouting`. Sans elle, Laravel 11 et plus n'enregistre aucune route API.

**Erreur `419 CSRF token mismatch`.** Le middleware `EnsureFrontendRequestsAreStateful` a été ajouté par erreur. Ce projet utilise des tokens Bearer, pas des cookies de session, il faut retirer ce middleware.

**Erreur `table already exists` pendant les migrations.** Flyway et Laravel ont tourné tous les deux sur la même base. Voir les notes techniques. Repartir propre avec `docker compose down -v` puis `docker compose up -d`.

**Le téléchargement des images est très lent.** Mesurer le débit réel avec `curl -o /dev/null -w "%{speed_download} B/s\n" https://speed.cloudflare.com/__down?bytes=10000000`. Les images pèsent environ 500 Mo, laisser tourner en tâche de fond. Éviter de lancer plusieurs `docker compose up` en parallèle, ils se partagent la bande passante et se gênent.

**Erreurs de permission sur `storage/`.** Rejouer `docker compose exec backend chmod -R 777 storage bootstrap/cache`.

## Développement sans Docker

Le backend exige PHP 8.3, contrainte de Laravel 13. Une version 8.1 ou 8.2 ne suffit pas. Le frontend demande Node 18 ou plus.

```bash
# Terminal 1, backend (mettre DB_HOST=127.0.0.1 et DB_PORT=3311 dans backend/.env)
cd backend
composer install
php artisan migrate
php artisan serve --port=8000

# Terminal 2, frontend
cd frontend
npm install
npm run dev
```

Dans ce mode, le frontend écoute sur le port 5173 et non 5174, qui est le port publié par Docker. La base de données peut rester dans Docker, il suffit de la démarrer seule avec `docker compose up -d mysql-db`.

## Règles de gestion

- Chaque salle a un numéro unique, une capacité et un type (salle de conférence, bureau, salle de formation)
- Chaque employé a un numéro unique, nom, prénom et département
- Une réservation lie un employé à une salle, avec date, heure de début et durée
- Une salle ne peut pas être réservée si le créneau chevauche une réservation existante. La règle est appliquée par `backend/app/Services/DisponibiliteService.php`, qui renvoie un `409 Conflict` explicite
- Un employé peut avoir plusieurs réservations, mais pas deux qui se chevauchent sur la même salle

## Diagrammes

Fichiers PlantUML dans `diagrammes/` :

- `diagramme_classe.puml`, entités Employe, Salle, Reservation, Admin et leurs associations
- `diagramme_sequence.puml`, flux complet d'une réservation avec le cas de conflit

Pour les visualiser, coller le contenu sur https://plantuml.com/plantuml ou installer l'extension PlantUML dans VS Code.

## Notes techniques

Le schéma de base existe en deux versions, les migrations Laravel dans `backend/database/migrations/` et les scripts Flyway dans `db/migrations/`. Les deux produisent des tables identiques, mais seul Laravel crée `users` et `personal_access_tokens`, nécessaires à l'authentification Sanctum. En local, c'est donc Laravel qui gère le schéma, via l'entrypoint du conteneur backend. Flyway reste derrière le profil `ci` pour la démonstration du pipeline. Lancer les deux sur la même base provoque une erreur `table already exists`, car `Schema::create` de Laravel échoue si la table est déjà là.

L'authentification utilise des tokens Bearer et non des cookies de session. Le middleware `EnsureFrontendRequestsAreStateful` ne doit pas être ajouté.

Le conteneur backend n'installe que les extensions PHP réellement utilisées, `pdo_mysql` et `mbstring`. Ajouter des extensions inutiles (gd, zip, bcmath) rallonge le build de plusieurs minutes sans bénéfice.
