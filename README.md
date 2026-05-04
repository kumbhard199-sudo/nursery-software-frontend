# Nursery Management Frontend (React + Vite)

Production-ready SaaS dashboard UI for the existing Nursery Management backend.

## Tech

- React (JavaScript)
- Vite
- TailwindCSS
- Axios
- React Router
- React Hook Form
- TanStack React Query

## Setup

1) Create an env file:

- Copy `.env.example` to `.env`
- Set your backend URL:

```
VITE_API_BASE_URL=http://localhost:5000
```

2) Install and run:

```bash
npm install
npm run dev
```

Open the app and login:

- First time: visit `/setup` to create the initial admin (calls `POST /api/auth/setup`)
- Then login at `/login` (calls `POST /api/auth/login`)

## Backend APIs consumed

This frontend consumes **every** backend endpoint:

- Auth: `POST /api/auth/login`, `POST /api/auth/setup`, `GET /api/auth/me`, `PUT /api/auth/change-password`
- Batches: full CRUD + `stock` + `sales-summary`
- Customers: CRUD + `GET /api/customers/search`
- Sales: CRUD + `GET /api/sales/report` + `POST /api/sales/:id/invoice`
- Workers: CRUD + attendance record/update + salary calculation
- Expenses: raw-material CRUD + monthly + summary
- Reports: dashboard + monthly + profit summary
- System: `GET /health` and `GET /`

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
# nursery-software-frontend
