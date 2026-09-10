# IT Service Desk & Ticket Management System

A professional, responsive IT Service Desk & Ticket Management System built with **React + TypeScript**, using **JSON Server** as a mock backend. Implements complete CRUD operations, Role-Based Access Control (RBAC), ticket lifecycle management, assignment, comments, resolution tracking, search/filter/sort, and role-specific dashboards.

---

## 1. Project Overview

This app supports three roles, each with a tailored dashboard and permission set:

| Role | Capabilities |
|---|---|
| **Admin** | Full access: manage users, categories, all tickets, assignment, lifecycle |
| **Support Agent** | View/manage assigned tickets, update status/priority, resolve tickets |
| **Employee** | Create tickets, view/manage own tickets, comment, cancel/reopen |

Ticket lifecycle: `Open → Assigned → In Progress → Pending → Resolved → Closed`, with `Open → Cancelled` and `Resolved → Reopened (Open)` branches — enforced per-role.

The UI ships with a **light and dark theme**, toggled from the switch next to the profile avatar in the top navbar. The choice is saved to `localStorage` and is also picked up from the OS-level preference on first visit, with no flash of the wrong theme on reload.

---

## 2. Technologies Used

- React 19 + TypeScript
- Vite
- Tailwind CSS (class-based dark mode)
- React Router v7
- Axios
- JSON Server (mock REST API, v0.17.4 — respects custom string IDs like `TKT-1001`)

---

## 3. Project Structure

```
src/
├── components/        # Navbar, Sidebar, Dashboard, common (Modal, Badge, Loader, etc.)
├── pages/              # Login, Dashboard, Tickets, Users, Categories, Profile
├── services/           # api.ts + ticketService, userService, categoryService, commentService
├── context/            # AuthContext (RBAC session), ToastContext (notifications)
├── types/              # TypeScript interfaces: user, ticket, category, comment
├── hooks/              # useTickets, useUsers, useCategories
├── utils/              # permissions.ts (RBAC + lifecycle rules), helpers.ts
└── routes/             # ProtectedRoute (role-gated routing)
db.json                 # JSON Server mock database (users, tickets, categories, comments)
```

---

## 4. Installation — Step by Step (From Scratch)

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or later installed (includes `npm`)
- A code editor (VS Code recommended)

### Step 1 — Unzip the project
Extract the zip file anywhere on your machine, then open a terminal in that folder:

```bash
cd itsm-app
```

### Step 2 — Install dependencies
```bash
npm install
```

This installs React, TypeScript, Tailwind, React Router, Axios, and JSON Server (all already listed in `package.json`).

### Step 3 — Start JSON Server (the mock backend)
Open a terminal and run:

```bash
npm run server
```

This starts JSON Server on **http://localhost:4000**, serving `/users`, `/tickets`, `/categories`, `/comments` from `db.json`. Keep this terminal running.

### Step 4 — Start the React app
Open a **second terminal** (same folder) and run:

```bash
npm run dev
```

This starts the Vite dev server, typically at **http://localhost:5173**. Open that URL in your browser.

> ⚠️ Both servers (`npm run server` and `npm run dev`) must be running at the same time — one is the backend API, one is the frontend.

### Step 5 — Log in
Use any of the demo accounts below, or click a demo account button on the login screen to auto-fill it.

---

## 5. Login Credentials (Demo Accounts)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@itsm.com` | `admin123` |
| Support Agent | `agent1@itsm.com` | `agent123` |
| Support Agent | `agent2@itsm.com` | `agent123` |
| Employee | `employee1@itsm.com` | `employee123` |
| Employee | `employee2@itsm.com` | `employee123` |
| Employee (deactivated, for testing) | `mike.torres@itsm.com` | `employee123` |

You can add, edit, deactivate, or delete users from the **Admin → Users** page once logged in as Admin.

---

## 6. API Endpoints (JSON Server on port 4000)

### Users
```
GET    /users
GET    /users/:id
GET    /users?email=someone@itsm.com   (used for login lookup)
POST   /users
PUT    /users/:id
PATCH  /users/:id
DELETE /users/:id
```

### Tickets
```
GET    /tickets
GET    /tickets/:id
POST   /tickets
PUT    /tickets/:id
PATCH  /tickets/:id
DELETE /tickets/:id
```

### Categories
```
GET    /categories
GET    /categories/:id
POST   /categories
PUT    /categories/:id
DELETE /categories/:id
```

---

## 7. Role Permission Matrix

| Feature | Admin | Support Agent | Employee |
|---|---|---|---|
| Dashboard | Full | Own assigned | Own tickets |
| Create Ticket | Yes | Yes | Yes |
| View All Tickets | Yes | No | No |
| View Assigned Tickets | Yes | Yes | No |
| View Own Tickets | Yes | Yes | Yes |
| Edit Ticket | Yes | Assigned only | Own + Open only |
| Delete Ticket | Yes | No | No |
| Assign / Reassign | Yes | No | No |
| Update Status | Yes | Assigned only | Limited (cancel/reopen) |
| Update Priority | Yes | Assigned only | No |
| Add Resolution | Yes | Assigned only | No |
| Manage Users | Yes | No | No |
| Manage Categories | Yes | No | No |

This logic is centralized in `src/utils/permissions.ts` (`can.*` helpers + `getAvailableActions()` for lifecycle transitions), and is also enforced at the route level via `ProtectedRoute`.

---

## 8. Feature Checklist (from project spec)

- [x] Login + Role-Based Access Control, protected routes
- [x] Role-based dashboards (Admin / Support Agent / Employee) with live stat cards
- [x] Full Ticket CRUD (create, view, edit, delete)
- [x] Ticket lifecycle engine with role-gated transitions + reopen/cancel branches
- [x] Ticket assignment / reassignment / unassignment (Admin only)
- [x] Resolution management (resolution, notes, resolved date)
- [x] Chronological Activity Timeline per ticket
- [x] User Management (CRUD, activate/deactivate, role assignment) — Admin only
- [x] Category Management (CRUD, activate/deactivate) — Admin only
- [x] Search (ID, subject, employee, agent), Filters (status/priority/category/agent), Sorting (newest/oldest/priority/updated), Pagination
- [x] Form validation (required fields, email/phone format, min length) with inline messages
- [x] Loading / Empty / Error states throughout
- [x] Toast notifications for create/update/delete/assign/status-change
- [x] Fully responsive (mobile sidebar drawer, responsive tables/cards)
- [x] Reusable components (Modal, ConfirmDialog, Badge, Pagination, StatCard) and centralized services/hooks

---

## 9. Building for Production

```bash
npm run build
```

Output is generated in `dist/`. Preview it locally with:

```bash
npm run preview
```

---

## 10. Deployment (Netlify / Vercel)

Because this app uses a **mock backend** (JSON Server) that normally runs on `localhost:4000`, you have two options when deploying the frontend publicly:

**Option A — Frontend-only demo (simplest):**
Deploy just the frontend. It will attempt to call `http://localhost:4000`, which only works if a reviewer also runs `npm run server` on their own machine. Fine for local grading/demo purposes.

**Option B — Deploy the mock API too (for a fully public live demo):**
1. Host `db.json` + JSON Server on a small Node host (Render, Railway, Cyclic, or a VM) — run `json-server --port 4000 db.json` there.
2. Update `src/services/api.ts` → change `baseURL` from `http://localhost:4000` to your hosted API's URL.
3. Rebuild (`npm run build`) and deploy the `dist/` folder to Netlify or Vercel:
   - **Netlify:** drag-and-drop the `dist/` folder in the Netlify dashboard, or connect the GitHub repo and set build command `npm run build`, publish directory `dist`.
   - **Vercel:** import the GitHub repo, framework preset "Vite", build command `npm run build`, output directory `dist`.

---

## 11. GitHub Setup

```bash
git init
git add .
git commit -m "Initial commit: IT Service Desk & Ticket Management System"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

Make sure `db.json`, `package.json`, and this `README.md` are committed — they're required for anyone else to run the project.

---

## 12. Notes

- `db.json` is your local mock database. Any create/update/delete you do in the running app is written straight to that file — feel free to reset it back to the committed version if you want to restart demo data from scratch.
- JSON Server is pinned to `0.17.4` intentionally — the newer `1.x` beta releases auto-generate their own IDs and ignore custom string IDs (which this project relies on for human-readable ticket IDs like `TKT-1001`).
