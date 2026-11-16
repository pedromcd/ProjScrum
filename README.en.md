**English** | [Português](README.md)

# 📋 ProjScrum

**A web platform for managing projects with Scrum: projects, sprints, daily stand-ups on a kanban board, sprint reviews, and a team calendar.**

A team project for the **Applied Software Engineering** course (Computer Science, UNISAGRADO). React frontend and Node.js/Express backend, with JWT authentication and a libSQL (Turso) database.

---

## 🎯 Goal

Teams that are new to Scrum often track sprints and dailies in spreadsheets or loose boards, with no history and no defined roles. ProjScrum brings that whole cycle into one place:

1. create a project and define the team;
2. plan sprints;
3. track dailies on a **Pending → In progress → Done** board;
4. close the sprint with a team **review**;
5. browse the **history** and the **calendar** of goals and meetings.

The academic goal was to apply the software engineering process end to end: requirements, database modeling, client-server architecture, authentication, and role-based access.

---

## ✨ Features

- **Accounts and authentication:** sign-up, login, and logout. Passwords are stored with **bcrypt**, and the session uses a **JWT in an `httpOnly` cookie**, valid for 24 hours.
- **User roles:** `Usuário` (user), `Gerente` (manager), and `Admin`, with the interface adapted to the logged-in user's role.
- **Projects:** creation with a description, due date, and members; a list of each user's projects; deletion.
- **Sprints:** creation inside a project and lists of active and closed sprints.
- **Kanban dailies:** each daily has a status (`Pendente`, `Em progresso`, `Concluido`, meaning pending, in progress, done) and can be **dragged between columns**, with the status saved on the backend.
- **Sprint closing with a review:** team scores are recorded in a **database transaction**, so a sprint is never left half-closed.
- **History** of projects, sprints, and dailies.
- **Calendar** (FullCalendar) with event creation, editing, and deletion, and date changes by drag and drop.
- **Account settings:** update profile data and photo, and delete the account.

The interface is in Portuguese.

---

## 🏗️ Architecture

```text
┌──────────────────────────┐        HTTP + JWT cookie        ┌───────────────────────────┐
│  Frontend (React + Vite) │  ─────────────────────────────► │  Backend (Node + Express) │
│  React Router, MUI,      │                                 │  /api routes, auth        │
│  FullCalendar, Axios     │ ◄─────────────────────────────  │  middleware, bcrypt       │
└──────────────────────────┘             JSON                └─────────────┬─────────────┘
                                                                           │ @libsql/client
                                                                           ▼
                                                              ┌───────────────────────────┐
                                                              │  Turso (libSQL / SQLite)  │
                                                              └───────────────────────────┘
```

- **Modeling:** the database was modeled in **MySQL Workbench** (`database/MySQL/`) and implemented in **libSQL**, the SQLite fork used by Turso, hosted in the cloud (`database/SQLite/` holds a local copy).
- **Authentication:** `authMiddleware` validates the cookie's JWT on every protected route and exposes the user's `id` and `cargo` (role) to the route handlers.
- **CORS** is allowed only for the frontend's local origins, with `credentials: true` so the cookie is sent.

---

## 🛠️ Tech stack

**Frontend:** React 18, Vite, React Router, Material UI, Bootstrap, FullCalendar, Axios, Font Awesome

**Backend:** Node.js, Express, JSON Web Token, bcrypt, cookie-parser, express-fileupload, dotenv

**Database:** Turso (libSQL/SQLite), modeled in MySQL Workbench

---

## ▶️ Running it

### Prerequisites

- Node.js 18 or later
- A [Turso](https://turso.tech/) database (URL and auth token)

### 1. Clone

```bash
git clone https://github.com/pedromcd/ProjScrum.git
cd ProjScrum
```

### 2. Configure the backend

```bash
cd server
cp credentials.example.env credentials.env
npm install
```

Fill in `credentials.env`:

```env
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your_token
JWT_SECRET=a_long_random_secret
PORT=3000
```

Create the tables in Turso from the model in `database/`.

### 3. Run the backend

```bash
npm start          # inside server/ — API at http://localhost:3000/api
```

### 4. Run the frontend

In another terminal, from the repository **root**:

```bash
npm install
npm run dev        # http://localhost:5173
```

---

## 🧩 Structure

```text
ProjScrum/
├── client/src/
│   ├── pages/            # Login, sign-up, home, project details, history, calendar, settings
│   ├── components/       # Daily kanban, calendar, modals, forms, navigation
│   └── services/api.js   # HTTP client (Axios)
├── server/
│   ├── app.js            # Express, CORS, cookies, routes
│   ├── config/           # Turso connection
│   ├── controllers/      # Users, roles, projects, events
│   ├── middlewares/      # JWT verification
│   ├── routes/           # API routes (projects, sprints, dailies, events)
│   └── utils/            # Token generation
├── database/
│   ├── MySQL/            # Model (.mwb) and SQL script
│   └── SQLite/           # Local copy of the database
├── index.html, vite.config.js, package.json   # Frontend configuration
└── LICENSE
```

---

## 💡 Takeaways

- Splitting frontend and backend and connecting them securely: `httpOnly` cookies, CORS with credentials, and expiring JWTs.
- Modeling a domain with several relationships (users ↔ projects ↔ sprints ↔ dailies ↔ reviews) and using **transactions** when one operation changes several tables.
- Working as a team with Git, splitting screens and routes among members.

## 🚧 Next steps

- Check the user's role on the backend for every sensitive route, not only in the interface.
- Add versioned migrations to create the database automatically.
- Write tests for the API.
- Publish an online demo.

---

## 👥 Authors

Team project:

- Pedro Marques Correa Domingues
- Pedro Lucas Franco
- Victor Hugo de Deus Machado
- Pedro Antônio de Souza Rezende
- Lucas Pomini Galli
- Raphael Camurri Michelassi

## 📄 License

Distributed under the MIT License. See the [LICENSE](./LICENSE) file.
