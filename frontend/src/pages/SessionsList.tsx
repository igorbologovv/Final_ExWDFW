import { useEffect, useState } from "react";
import { listSessions } from "../api";
import SessionCard from "../components/SessionCard";

export default function SessionsList() {
  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState("");
  const [scope, setScope] = useState<"all" | "upcoming" | "past">("all");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    listSessions({ filter, scope }).then(setItems).finally(() => setLoading(false));
  }, [filter, scope]);

  return (
    <div className="panel">
      <h2>All Sessions</h2>
      <div className="toolbar">
        <input placeholder="Search..." value={filter} onChange={e => setFilter(e.target.value)} />
        <select value={scope} onChange={e => setScope(e.target.value as any)}>
          <option value="all">All</option>
          <option value="upcoming">Upcoming</option>
          <option value="past">Past</option>
        </select>
      </div>

      {loading && <p>Loading…</p>}
      {!loading && items.length === 0 && <p>No sessions found.</p>}

      <div className="grid">
        {items.map(s => <SessionCard key={s.id} session={s} />)}
      </div>
    </div>
  );
}
