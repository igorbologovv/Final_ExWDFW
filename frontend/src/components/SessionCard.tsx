import { Link } from "react-router-dom";
export default function SessionCard({ session }: { session: any }) {
  return (
    <div className="card">
      <h3><Link to={`/session/${session.id}`}>{session.title}</Link></h3>
      <p className="muted">{session.date} {session.time} · {session.type.toUpperCase()}</p>
      <p>{session.description}</p>
      <p className="muted">{session.attendees?.length ?? 0}/{session.maxParticipants} going</p>
    </div>
  );
}
