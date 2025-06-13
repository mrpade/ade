# ADE – Application de Diagnostic de Maladies

**ADE** (Analyse de Diagnostic Évolutif) est une application full-stack (Backend Node.js + Frontend React) qui permet à un utilisateur adulte de saisir des symptômes et de recevoir un classement des maladies correspondantes, ainsi que d’accéder à son espace personnel.

## 🚀 Prérequis

- **Node.js** ≥ 18.x  
- **npm** ≥ 10.x  
- **MySQL** (ou MariaDB) installé & accessible en local  
- Un **compte GitHub** pour le versioning  
- (Optionnel) une **clé API Google** si vous activez la recherche de pharmacies/établissements

## 📁 Structure du dépôt

ade/
├─ ade-backend/ # Backend Express + Sequelize
│ ├─ src/
│ ├─ .env # variables d’environnement (non versionné)
│ └─ package.json
├─ ade-frontend/ # Frontend React + Vite
│ ├─ src/
│ ├─ .env # variables d’environnement (non versionné)
│ └─ package.json
├─ .gitignore
└─ README.md # ce fichier

---

## ⚙️ Installation & Démarrage

### 1. Cloner le dépôt

```bash
git clone git@github.com:mrpade/ade.git
cd ade

2. Backend
cd ade-backend
npm install
# Copier et compléter .env avec vos informations MySQL et JWT_SECRET
cp .env.example .env
# Lance le serveur (port 4000 par défaut)
npm run dev

L’API tourne sur http://localhost:4000.

3. Frontend
cd ../ade-frontend
npm install
# Copier et compléter .env avec VITE_API_URL et éventuellement VITE_GOOGLE_MAPS_API_KEY
cp .env.example .env
npm run dev

Le frontend est servi sur http://localhost:5173/.



Variables d’environnement
Voir le fichier .env.example pour la liste complète et les clés attendues.

📚 Documentation
Backend

Modèles Sequelize : User, DiseasesList, Search, etc.

Routes principales :

/api/maladies?symptomes=...

/api/symptomes?q=...

/api/pharmacies?lat=...&lng=...&filter=...

/api/auth & /api/moncompte

Frontend

Pages : Home, Maladies, Pharmacies, Register, Login, MonCompte

Composants : Navbar, SearchBar, CardMaladie, etc.


🤝 Contributions
Les contributions sont les bienvenues !

Fork ce dépôt

Crée une branche (git checkout -b feat/ma-fonctionnalite)

Commit tes changements (git commit -m 'feat: ajout de …')

Push (git push origin feat/ma-fonctionnalite)

Ouvre une Pull Request

© 2025 ADE – Tous droits réservés
