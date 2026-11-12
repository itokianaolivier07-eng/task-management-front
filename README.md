# TaskFlow — Front React

Interface web de la **Task Management API** (Spring Boot + JWT).
Stack : React 18 · Vite · React Router 6 (aucune autre dépendance).

## Démarrage

```bash
# 1. Lancer le back (dans le dossier de l'API)
docker compose up -d
./mvnw spring-boot:run          # http://localhost:8080

# 2. Lancer le front (dans ce dossier)
npm install
npm run dev                     # http://localhost:5173
```

En développement, `vite.config.js` relaie `/api/*` vers `localhost:8080` : **aucune config CORS** n'est nécessaire.

### Optionnel : afficher ton nom dans la barre du haut
Copie `backend-patch/UserController.java` dans `controller/` du back. Sans lui, c'est l'e-mail qui s'affiche.

## Production (Docker)

Le `Dockerfile` compile le front et le sert avec nginx, qui relaie aussi `/api` vers le service `api`.
Ajoute ceci à `docker-compose.yml` du back (en adaptant le chemin `build`) :

```yaml
  front:
    profiles: ["full"]
    build: ../task-management-front
    ports: ["3000:80"]
    depends_on: [api]
```
puis `docker compose --profile full up --build` → http://localhost:3000

## Architecture

```
src/
├── main.jsx · App.jsx          point d'entrée et table des routes
├── api/                        UN fichier par ressource du back (aucun fetch ailleurs)
│   ├── client.js               fetch + token + gestion d'erreurs + 401 => déconnexion
│   └── auth · workspaces · projects · tasks · comments · users · query
├── auth/                       tout ce qui concerne la session
│   ├── tokenStorage.js         stockage / lecture / expiration du JWT
│   ├── AuthContext.jsx         login, register, logout, déconnexion auto à l'expiration
│   └── RouteGuards.jsx         ProtectedRoute (connectés) / GuestRoute (visiteurs)
├── constants/enums.js          statuts, priorités, rôles (= enums Java) + libellés
├── utils/
│   ├── permissions.js          qui peut faire quoi (miroir du tableau de permissions du back)
│   └── format.js               dates, retard, "" -> null
├── hooks/useAsync.js           chargement de données (data / loading / error / reload)
├── components/
│   ├── ui/                     Modal, Badge, Feedback (Loader, ErrorBanner, Empty)
│   ├── layout/AppLayout.jsx    barre de navigation + <Outlet />
│   ├── workspace/              ProjectsTab · MembersTab · SettingsTab
│   └── tasks/                  TaskCard · TaskFormModal · TaskDetailModal · CommentSection
└── pages/                      une page = une route
    Login · Register · Workspaces · Workspace · Project · MyTasks · NotFound
```

**Règle d'or :** les pages et composants n'appellent jamais `fetch` ; ils passent par `src/api/`.
Pour ajouter un endpoint : une fonction dans le bon fichier de `api/`, puis on l'utilise avec `useAsync`.

## Routes

| URL | Page | Accès |
|---|---|---|
| `/login`, `/register` | Connexion / inscription | visiteurs |
| `/` | Mes workspaces | connectés |
| `/workspaces/:id` | Projets · Membres · Paramètres | membres |
| `/projects/:id` | Tableau des tâches (filtres, détail, commentaires) | membres |
| `/my-tasks` | Mes tâches assignées | connectés |

## Authentification — comment ça marche

1. `login` / `register` renvoient `{ token }` ; il est gardé dans le `localStorage` (`taskflow_token`).
2. `client.js` ajoute `Authorization: Bearer <token>` à chaque requête protégée.
3. Un **401** sur une route protégée (token expiré/invalide) déconnecte et renvoie vers `/login`.
4. Au démarrage, un token expiré est ignoré ; une minuterie déconnecte à l'heure d'expiration exacte.
5. Déconnexion dans un onglet => déconnexion dans les autres.
6. Après connexion, retour à la page demandée initialement.

**Sécurité à connaître :**
- Un token dans le `localStorage` est lisible par un script injecté (XSS). React échappe le contenu par défaut
  et ce projet n'utilise jamais `dangerouslySetInnerHTML` : garde cette règle.
- Les boutons masqués selon le rôle sont du confort : **le back reste l'autorité** (il renvoie 403).
- Pour aller plus loin en production : cookie `httpOnly` + refresh token (nécessite des changements côté back).

## Permissions (reflet du back)

Voir `src/utils/permissions.js`. OWNER/ADMIN gèrent projets et membres ; MEMBER ne modifie une tâche que s'il en est
créateur ou assigné, et ne supprime que ses propres tâches/commentaires.
