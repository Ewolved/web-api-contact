# Gestion de contacts

API REST JSON (Spring Boot 3.5, Java 25, base H2 in-memory) de gestion de contacts et d'entreprises, documentée par Swagger UI, avec un front React minimal (Vite) servi par nginx.

## Prérequis

- Docker Desktop (seul prérequis pour le mode principal).
- Sans Docker : JDK 25 et Node 22.

## Lancement avec Docker

```bash
docker compose up --build   # construit les images et démarre la stack
docker compose down         # arrête et nettoie la stack
```

| Service | URL |
|---|---|
| Front | http://localhost:3000 |
| API | http://localhost:8080/api |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| Console H2 | http://localhost:8080/h2-console (JDBC URL `jdbc:h2:mem:contacts`, user `sa`, mot de passe vide) |

Les données sont en mémoire : elles sont réinitialisées (jeu de démo) à chaque démarrage.

## Lancement sans Docker

```bash
cd backend && ./mvnw spring-boot:run          # API sur http://localhost:8080
cd frontend && npm install && npm run dev     # front sur http://localhost:5173
```

En développement, Vite redirige `/api` vers `localhost:8080`.

## Endpoints

| Méthode | URL | Description | Codes |
|---|---|---|---|
| GET | `/api/contacts` | Lister les contacts | 200 |
| POST | `/api/contacts` | Créer un contact | 201, 400 |
| PUT | `/api/contacts/{id}` | Mettre à jour un contact (rattachements conservés) | 200, 400, 404 |
| DELETE | `/api/contacts/{id}` | Supprimer un contact | 204, 404 |
| GET | `/api/companies` | Lister les entreprises | 200 |
| POST | `/api/companies` | Créer une entreprise | 201, 400, 409 |
| PUT | `/api/companies/{id}` | Mettre à jour une entreprise | 200, 400, 404, 409 |
| GET | `/api/companies/search?vatNumber=...` | Rechercher une entreprise par TVA (égalité exacte) | 200, 404 |
| PUT | `/api/companies/{companyId}/contacts/{contactId}` | Ajouter un contact à une entreprise (idempotent) | 200, 404 |

Les erreurs ont un format unique : `{ "status": 400, "message": "Validation failed", "errors": { "champ": "message" } }`.

## Règles métier

- Un contact a une adresse, un nom et un prénom (obligatoires).
- Un contact travaille dans une ou plusieurs entreprises (relation many-to-many, rattachement via l'endpoint dédié).
- Une entreprise a une adresse et un numéro de TVA obligatoires ; le numéro de TVA est unique (409 sinon).
- Un contact est `EMPLOYEE` ou `FREELANCE`.
- Un freelance doit avoir un numéro de TVA (erreur 400 sur `vatNumber` : « Un freelance doit avoir un numéro de TVA »).

## Choix assumés

- L'adresse est une chaîne libre (pas de structure rue/CP/ville).
- Le numéro de TVA est une chaîne non vide, sans validation de format par pays.
- `Company.name` est ajouté (optionnel) pour la lisibilité.
- Un `vatNumber` fourni pour un `EMPLOYEE` est accepté et conservé tel quel.
- Le front v1 liste et crée contacts et entreprises ; le reste (modification, suppression, recherche TVA, rattachement) est disponible via Swagger.

## Structure

```
backend/             Spring Boot (Maven wrapper), Dockerfile
frontend/            Vite + React, Dockerfile, nginx.conf (reverse proxy)
docker-compose.yml
```
