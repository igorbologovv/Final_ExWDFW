конечно 😎 вот тебе готовый контент для файла `README.md` — просто **скопируй всё это как есть** и вставь в новый файл (без форматирования, просто текст):

---

#  Hobby Session Planner — Final Project (Web Development Frameworks 2025)

This is the **final project** for *Web Development Frameworks 2025* — a full-stack web application for planning and attending hobby sessions.
It includes both a **React + TypeScript frontend** and a **Node.js + Express + TypeScript backend**, communicating via REST API.

##  Project Structure

hobby-planner/
├── backend/        # Express + TypeScript API server
│   ├── src/
│   │   ├── server.ts        # Main routes and endpoints
│   │   ├── store.ts         # File-based JSON database
│   │   └── types.ts         # Type definitions
│   ├── data.json            # Persistent session data
│   └── package.json
│
├── frontend/       # React + Vite + TypeScript client
│   ├── src/
│   │   ├── pages/           # React pages (List, Create, Details)
│   │   ├── components/      # Reusable components
│   │   ├── api.ts           # API helper functions
│   │   ├── App.tsx          # Routing and layout
│   │   ├── main.tsx         # Entry point
│   │   └── index.css        # Styling
│   └── package.json
│
└── README.md

## ⚙️ Setup Instructions

### 1. Clone the repository

git clone <your-repo-url>
cd hobby-planner

### 2. Backend setup (Express + TypeScript)

cd backend
npm install
npm run dev

You should see:
Hobby backend on [http://localhost:3001](http://localhost:3001)

This starts the API server which stores sessions inside backend/data.json.

### 3. Frontend setup (React + Vite)

Open a new terminal window:

cd frontend
npm install
npm run dev

Vite will show:
Local: [http://localhost:5173/](http://localhost:5173/)

Open this URL in your browser.
If your backend runs on a different port, set it manually in .env:

VITE_API_URL=[http://localhost:3001](http://localhost:3001)

##  Application Overview

### Main Features

* Create new hobby sessions (public or private)
* List all public sessions on the homepage
* Join or leave sessions using personal attendance codes
* Manage sessions using a management code
* Edit or delete sessions (organizer only)
* Kick attendees (organizer only)
* Filter sessions by keyword or by All / Upcoming / Past

##  Codes & Permissions

* Management code — shown to the creator after making a session.
  Use it to edit, delete, or manage attendees:
  /session/<id>?code=<managementCode>

* Attendance code — given to each participant after clicking “I’m going”.
  Allows them to cancel later via “Not going”.

##  How to Test / Demonstrate

1. Create a new public session and copy the management code.
2. Go back to the homepage — the session appears in the list.
3. Click “I’m going” — you’ll receive a personal attendance code.
4. Visit /session/<id>?code=<managementCode> — organizer mode opens.
5. Edit, delete, or remove attendees from the session.
6. Use the search bar or the “Upcoming / Past” filter to test extended functionality.

##  Tech Stack

Frontend: React 18, TypeScript, Vite, React Router
Backend: Node.js 20+, Express, TypeScript
Data Storage: Local JSON file (backend/data.json)
Development: tsx (hot reload), npm scripts
Optional Extensions: Leaflet map, nodemailer email notifications

##  Development Commands

### Backend

npm run dev        → run backend in development mode
npm run build      → compile TypeScript to dist/
npm start          → run compiled backend

### Frontend

npm run dev        → start Vite development server
npm run build      → build production version
npm run preview    → preview the production build


##  Author

Igor Bologov
Aalto University — Web Development Frameworks 2025
Final Project: Hobby Session Planner

##  License

Free to use for educational and demonstration purposes.
