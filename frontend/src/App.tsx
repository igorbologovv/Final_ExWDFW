// [AI-GEN] Frontend Router shell
import { Routes, Route, Link } from "react-router-dom";
import SessionsList from "./pages/SessionsList";
import CreateSession from "./pages/CreateSession";
import SessionDetails from "./pages/SessionDetails";

export default function App() {
  return (
    <main className="container">
      <header className="topbar">
        <h1>Hobby Session Planner</h1>
        <nav>
          <Link to="/">All Sessions</Link>
          <Link to="/create">Create Session</Link>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<SessionsList />} />
        <Route path="/create" element={<CreateSession />} />
        <Route path="/session/:id" element={<SessionDetails />} />
      </Routes>
    </main>
  );
}
