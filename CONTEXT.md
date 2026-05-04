# Koto Frontend — Contexte

## Projet
Koto est un SaaS de gestion de tontine pour l'Afrique de l'Ouest.
Stack : React + Vite, Tailwind CSS, Zustand, Axios, React Router.

## Structure
- src/pages — Login, Register, Dashboard, Groupe, Rejoindre
- src/services — auth, groupe, cycle, paiement (appels API)
- src/store — authStore (Zustand), groupeStore
- src/hooks — useAuth
- src/utils/api.js — instance Axios avec intercepteur JWT

## Backend
URL locale : http://localhost:8080
Le token JWT est stocké dans localStorage sous la clé "token"
L'utilisateur connecté est stocké dans localStorage sous la clé "user"
Format user : { id, nom, prenom, email, role, token }

## Pages existantes
- /login — connexion
- /register — inscription
- /dashboard — liste des groupes + créer un groupe
- /groupes/:id — détail groupe, cycle actif, impayés, payés, invitation
- /rejoindre/:token — rejoindre un groupe via lien

## Design
Couleurs : amber (principal), white (cards), gray (textes)
Identité visuelle sobre et chaleureuse

## Ce qui reste à faire
- Vue membre dans Groupe.jsx (pas de boutons admin)
- Variables d'environnement (.env) pour l'URL du backend
- Déploiement Vercel
- Flux invitation amélioré