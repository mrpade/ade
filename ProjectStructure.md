# ADE Project Structure

This document summarizes how the ADE application is organised. The repository contains a Node.js backend using Express and Sequelize as well as a React frontend powered by Vite.

## Root layout

```
ade/
├─ ade-backend/   # Express + Sequelize API
├─ ade-frontend/  # React user interface
├─ README.md      # Project overview
└─ other files    # Database design docs, licence, images
```

The backend and frontend have their own `package.json` files and can be started independently as explained in `README.md`.

## Backend (`ade-backend`)

The backend exposes REST endpoints and interacts with a MySQL database. Key folders are:

- **config/** – database configuration loaded by Sequelize. `config.js` reads environment variables.
- **migrations/** – Sequelize migration files to evolve the schema.
- **scripts/** – utility scripts such as `migrateSymptoms.js` for seeding data.
- **src/** – main application sources:
  - `index.js` – Express entry point: sets up middleware, routes and database synchronisation.
  - **models/** – Sequelize model definitions (User, Doctor, Pharmacy, ...). `index.js` builds the database connection and exports all models.
  - **routes/** – Express routers grouped by domain (`maladies.js`, `auth.js`, `pharmacy.js`, etc.). Each file defines the HTTP endpoints used by the frontend.
  - **middleware/** – custom middleware like JWT authentication.
  - **services/** – background helpers. `cleanup.js` schedules token cleanup; `icdService.js` queries the WHO ICD‑11 API.

Backend dependencies are installed with `npm install` and the server is started via `npm run dev` on port 4000 by default.

## Frontend (`ade-frontend`)

The frontend is a single-page React application bootstrapped with Vite. Important folders include:

- **public/** – static assets copied as‑is to the final build.
- **src/** – application source code:
  - `main.jsx` – entry point mounting the React app and the authentication context.
  - `App.jsx` – defines all routes and renders the `Navbar` plus pages.
  - **api/** – wrappers around the Axios instance for each backend resource (`doctors.js`, `checks.js`, ...).
  - **assets/** – images and icons used by components.
  - **components/** – reusable UI components such as `Navbar` or `MapPicker`.
  - **context/** – React context providers, e.g. `AuthContext` for authentication state.
  - **pages/** – page components mapped to routes (Home, Login, DoctorDashboard, etc.).
  - **services/** – shared utilities. `api.js` configures Axios with the backend URL and token interceptor, while `icdApi.js` calls the WHO service.
- `index.html` – HTML shell used by Vite during development and production.
- `vite.config.js` – Vite configuration enabling the React plugin and dev server proxy.

The frontend runs with `npm run dev` on port 5173 and proxies API requests to the backend during development.

---

Both parts interact through REST endpoints under `/api`. The folder structure aims to separate concerns clearly: database and API logic reside in `ade-backend`, while the user interface and client-side logic are in `ade-frontend`.
