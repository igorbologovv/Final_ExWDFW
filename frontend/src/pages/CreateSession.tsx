// CreateSession.tsx
import { useState } from "react";
import { createSession } from "../api";
import { Link, useNavigate } from "react-router-dom";

export default function CreateSession() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    title: "", description: "", date: "", time: "",
    maxParticipants: 10, type: "public", location: ""
  });
  const [result, setResult] = useState<{id:string; managementCode:string} | null>(null);
  const [err, setErr] = useState<string>("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    try {
      const r = await createSession({
        title: form.title,
        description: form.description,
        date: form.date,
        time: form.time,
        maxParticipants: Number(form.maxParticipants),
        type: form.type as "public" | "private",
        location: form.location || undefined
      });

      // NEW: запоминаем админ-код локально, чтобы потом был доступ "Manage"
      localStorage.setItem(`mgmt:${r.id}`, r.managementCode);

      setResult(r);
    } catch (e: any) {
      setErr(e.message ?? String(e));
    }
  }

  return (
    <div className="panel">
      <h2>Create Session</h2>
      <form onSubmit={submit} className="form">
        <input required placeholder="Title" value={form.title} onChange={e=>setForm({...form, title:e.target.value})}/>
        <textarea required placeholder="Description" value={form.description} onChange={e=>setForm({...form, description:e.target.value})}/>
        <div className="row">
          <input required type="date" value={form.date} onChange={e=>setForm({...form, date:e.target.value})}/>
          <input required type="time" value={form.time} onChange={e=>setForm({...form, time:e.target.value})}/>
        </div>
        <div className="row">
          <input required type="number" min={1} placeholder="Max participants"
            value={form.maxParticipants}
            onChange={e=>setForm({...form, maxParticipants: Number(e.target.value)})}/>
          <select value={form.type} onChange={e=>setForm({...form, type:e.target.value})}>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>
        <input placeholder="Location (optional)" value={form.location} onChange={e=>setForm({...form, location:e.target.value})}/>
        <button type="submit">Create</button>
      </form>

      {err && <p className="error">{err}</p>}

      {result && (
        <div className="notice">
          <p>Session created!</p>
          <p><b>ID:</b> {result.id}</p>
          <p><b>Management code:</b> {result.managementCode}</p>
          <p>
            Open: <Link to={`/session/${result.id}`}>Session Details</Link>
            {" · "}
            {/* NEW: мгновенная ссылка в режим управления */}
            <Link to={`/session/${result.id}?code=${result.managementCode}`}>Manage</Link>
          </p>
          {/* [AI-GEN] Keep the management code secret */}
        </div>
      )}

      {!result && <button className="ghost" onClick={()=>nav("/")}>Back</button>}
    </div>
  );
}
