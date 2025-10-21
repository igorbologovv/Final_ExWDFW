// SessionDetails.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { getSession, attend, deleteSession, removeAttendee } from "../api";

type Attendee = { id: string; name?: string; attendanceCode: string; createdAt: string };
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

function useMgmtCode(id?: string) {
  const [sp] = useSearchParams();
  const [mgmt, setMgmt] = useState<string>("");

  useEffect(() => {
    const q = sp.get("code");
    if (q) {
      setMgmt(q);
      if (id) localStorage.setItem(`mgmt:${id}`, q); // синхронизируем, если пришли с ссылкой
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

  const [sess, setSess] = useState<Session | null>(null);
  const [err, setErr] = useState<string>("");

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

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function onAttend(name?: string) {
    if (!id) return;
    setErr("");
    try {
      await attend(id, name);
      await load();
    } catch (e: any) {
      setErr(e.message ?? String(e));
    }
  }

  async function onDelete() {
    if (!id || !mgmt) {
      alert("No management code found for this session.");
      return;
    }
    if (!confirm("Delete this session? This action cannot be undone.")) return;
    try {
      await deleteSession(id, mgmt);
      localStorage.removeItem(`mgmt:${id}`);
      navigate("/");
    } catch (e: any) {
      alert(e.message ?? String(e));
    }
  }

  async function onKick(attendeeId: string) {
    if (!id || !mgmt) {
      alert("No management code found.");
      return;
    }
    if (!confirm("Remove this attendee?")) return;
    try {
      await removeAttendee(id, attendeeId, mgmt);
      await load();
    } catch (e: any) {
      alert(e.message ?? String(e));
    }
  }

  if (!sess) return <div className="panel"><p>Loading...</p>{err && <p className="error">{err}</p>}</div>;

  const going = sess.attendees?.length ?? 0;

  return (
    <div className="panel">
      <h2>{sess.title}</h2>
      <p className="muted">
        {sess.date} {sess.time} · {sess.type.toUpperCase()}
        {sess.location ? ` · ${sess.location}` : ""}
      </p>
      <p>{sess.description}</p>
      <p className="muted">{going}/{sess.maxParticipants} going</p>

      {/* NEW: управленческий баннер */}
      {isManageMode ? (
        <div className="notice">
          <b>Manage mode</b> — you can edit or delete this session and remove attendees.
          <div className="row" style={{ gap: 8, marginTop: 8 }}>
            {/* тут можно повесить Edit позже */}
            <button className="danger" onClick={onDelete}>Delete session</button>
          </div>
        </div>
      ) : (
        <div className="row" style={{ gap: 8 }}>
          <button onClick={() => onAttend()}>I'm going</button>
        </div>
      )}

      <h3 style={{ marginTop: 24 }}>Attendees</h3>
      {going === 0 && <p className="muted">No attendees yet.</p>}
      {going > 0 && (
        <ul className="list">
          {sess.attendees.map(a => (
            <li key={a.id} className="row" style={{ justifyContent: "space-between" }}>
              <span>{a.name || "(no name)"} · <span className="muted">{new Date(a.createdAt).toLocaleString()}</span></span>
              {isManageMode && (
                <button className="ghost" onClick={() => onKick(a.id)}>Remove</button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
