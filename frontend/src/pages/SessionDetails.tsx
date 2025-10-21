import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { getSession, attend, deleteSession, removeAttendee } from "../api";

type Attendee = { id: string; name?: string; createdAt: string };
type Session = {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  maxParticipants: number;
  type: "public" | "private";
  location?: string;
  attendees: Attendee[];
};

// постоянный clientId в браузере
function useClientId() {
  const [cid] = useState(() => {
    const k = "clientId";
    const saved = localStorage.getItem(k);
    if (saved) return saved;
    const gen = (crypto as any)?.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(k, gen);
    return gen;
  });
  return cid;
}

function useMgmtCode(id?: string) {
  const [sp] = useSearchParams();
  const [mgmt, setMgmt] = useState<string>("");
  useEffect(() => {
    const q = sp.get("code");
    if (q) {
      setMgmt(q);
      if (id) localStorage.setItem(`mgmt:${id}`, q);
      return;
    }
    if (id) {
      const saved = localStorage.getItem(`mgmt:${id}`) ?? "";
      setMgmt(saved);
    }
  }, [id, sp]);
  return mgmt;
}

export default function SessionDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const mgmt = useMgmtCode(id);
  const clientId = useClientId();

  const [sess, setSess] = useState<Session | null>(null);
  const [err, setErr] = useState("");
  const [joining, setJoining] = useState(false);
  const [name, setName] = useState("");

  const joinedKey = id ? `joined:${id}` : "";
  const alreadyJoined = Boolean(joinedKey && localStorage.getItem(joinedKey));
  const isManageMode = useMemo(() => Boolean(mgmt), [mgmt]);

  async function load() {
    if (!id) return;
    setErr("");
    try {
      const s = await getSession(id);
      setSess(s);
    } catch (e: any) {
      setErr(e.message ?? String(e));
    }
  }
  useEffect(() => { load(); }, [id]);

  async function onAttend() {
    if (!id) return;
    const trimmed = name.trim();
    if (trimmed.length < 1) return alert("Please enter your name.");
    setErr("");
    try {
      setJoining(true);
      await attend(id, trimmed, clientId);
      await load();
      setName("");
      if (joinedKey) localStorage.setItem(joinedKey, "1"); // блокируем кнопку в этом браузере
    } catch (e: any) {
      setErr(e.message ?? String(e));
    } finally {
      setJoining(false);
    }
  }

  async function onDelete() {
    if (!id || !mgmt) return alert("No management code found for this session.");
    if (!confirm("Delete this session?")) return;
    try {
      await deleteSession(id, mgmt);
      localStorage.removeItem(`mgmt:${id}`);
      localStorage.removeItem(`joined:${id}`);
      navigate("/");
    } catch (e: any) {
      alert(e.message ?? String(e));
    }
  }

  async function onKick(attendeeId: string) {
    if (!id || !mgmt) return alert("No management code found.");
    if (!confirm("Remove this attendee?")) return;
    try {
      await removeAttendee(id, attendeeId, mgmt);
      await load();
    } catch (e: any) {
      alert(e.message ?? String(e));
    }
  }

  if (!sess) return <div className="panel"><p>Loading…</p>{err && <p className="error">{err}</p>}</div>;

  const going = sess.attendees?.length ?? 0;
  const isFull = going >= sess.maxParticipants;

  return (
    <div className="panel">
      <h2>{sess.title}</h2>
      <p className="muted">
        {sess.date} {sess.time} · {sess.type.toUpperCase()}
        {sess.location ? ` · ${sess.location}` : ""}
      </p>
      <p>{sess.description}</p>
      <p className="muted">{going}/{sess.maxParticipants} going</p>

      {isManageMode ? (
        <div className="notice">
          <b>Manage mode</b> — you can edit or delete this session and remove attendees.
          <div className="row" style={{ gap: 8, marginTop: 8 }}>
            <button className="danger" onClick={onDelete}>Delete session</button>
          </div>
        </div>
      ) : (
        <div className="row" style={{ gap: 8 }}>
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border rounded px-2 py-1"
          />
          <button
            onClick={onAttend}
            disabled={joining || isFull || alreadyJoined}
            className="border rounded px-3 py-1 disabled:opacity-50"
            title={alreadyJoined ? "You are already registered from this browser" : undefined}
          >
            {isFull ? "Session is full" : (joining ? "Joining…" : "I'm going")}
          </button>
        </div>
      )}

      <h3 style={{ marginTop: 24 }}>Attendees</h3>
      {going === 0 && <p className="muted">No attendees yet.</p>}
      {going > 0 && (
        <ul className="list">
          {sess.attendees.map(a => (
            <li key={a.id} className="row" style={{ justifyContent: "space-between" }}>
              <span>
                {a.name?.trim() ? a.name : "(no name)"} ·{" "}
                <span className="muted">{new Date(a.createdAt).toLocaleString()}</span>
              </span>
              {isManageMode && (
                <button className="ghost" onClick={() => onKick(a.id)}>Remove</button>
              )}
            </li>
          ))}
        </ul>
      )}
      {err && <p className="error" style={{ marginTop: 8 }}>{err}</p>}
    </div>
  );
}
