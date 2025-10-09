import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { attend, getSession, kickAttendee, unattend, updateSession, deleteSession } from "../api";
import AttendanceList from "../components/AttendanceList";

export default function SessionDetails() {
  const { id } = useParams<{ id: string }>();
  const [sp] = useSearchParams();
  const mgmt = sp.get("code") ?? "";
  const [s, setS] = useState<any>(null);
  const [name, setName] = useState("");
  const [attendanceCode, setAttendanceCode] = useState("");
  const [edit, setEdit] = useState(false);
  const [patch, setPatch] = useState<any>({});

  async function load() {
    if (!id) return;
    const data = await getSession(id);
    setS(data);
    setPatch({
      title: data.title, description: data.description, date: data.date, time: data.time,
      maxParticipants: data.maxParticipants, type: data.type, location: data.location ?? ""
    });
  }
  useEffect(() => { load(); }, [id]);

  async function join() {
    if (!id) return;
    const r = await attend(id, name || undefined);
    setAttendanceCode(r.attendanceCode);
    await load();
  }

  async function leave() {
    if (!id) return;
    await unattend(id, attendanceCode);
    setAttendanceCode("");
    await load();
  }

  async function kick(attendeeId: string) {
    if (!id || !mgmt) return;
    await kickAttendee(id, mgmt, attendeeId);
    await load();
  }

  async function save() {
    if (!id || !mgmt) return;
    await updateSession(id, mgmt, {
      ...patch,
      maxParticipants: Number(patch.maxParticipants),
      type: patch.type
    });
    setEdit(false);
    await load();
  }

  async function remove() {
    if (!id || !mgmt) return;
    await deleteSession(id, mgmt);
    window.location.href = "/";
  }

  if (!s) return <div className="panel"><p>Loading…</p></div>;

  const seatsLeft = s.maxParticipants - s.attendees.length;

  return (
    <div className="panel">
      <h2>{s.title}</h2>
      <p className="muted">{s.date} {s.time} · {s.type.toUpperCase()} {s.location ? `· ${s.location}` : ""}</p>
      <p>{s.description}</p>

      <div className="box">
        <h3>Attendance ({s.attendees.length}/{s.maxParticipants})</h3>
        <div className="row">
          <input placeholder="Your name (optional)" value={name} onChange={e=>setName(e.target.value)} />
          <button disabled={seatsLeft<=0} onClick={join}>I’m going</button>
        </div>
        {attendanceCode && (
          <div className="notice">
            <p>Your attendance code (save it to leave later):</p>
            <code>{attendanceCode}</code>
            <div className="row">
              <button onClick={leave}>Not going</button>
            </div>
          </div>
        )}
        <AttendanceList attendees={s.attendees} onKick={mgmt ? kick : undefined} />
      </div>

      {mgmt && (
        <div className="box">
          <h3>Manage (organizer)</h3>
          {!edit ? (
            <div className="row">
              <button onClick={()=>setEdit(true)}>Edit</button>
              <button className="danger" onClick={remove}>Delete session</button>
            </div>
          ) : (
            <div className="form">
              <input value={patch.title} onChange={e=>setPatch({...patch, title:e.target.value})}/>
              <textarea value={patch.description} onChange={e=>setPatch({...patch, description:e.target.value})}/>
              <div className="row">
                <input type="date" value={patch.date} onChange={e=>setPatch({...patch, date:e.target.value})}/>
                <input type="time" value={patch.time} onChange={e=>setPatch({...patch, time:e.target.value})}/>
              </div>
              <div className="row">
                <input type="number" min={1} value={patch.maxParticipants} onChange={e=>setPatch({...patch, maxParticipants:e.target.value})}/>
                <select value={patch.type} onChange={e=>setPatch({...patch, type:e.target.value})}>
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
              <input placeholder="Location" value={patch.location} onChange={e=>setPatch({...patch, location:e.target.value})}/>
              <div className="row">
                <button onClick={save}>Save</button>
                <button className="ghost" onClick={()=>setEdit(false)}>Cancel</button>
              </div>
              {/* [AI-GEN] Editing protected by management code in query string */}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
