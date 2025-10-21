// SessionCard.tsx
import { Link } from "react-router-dom";

type SessionCardProps = {
  session: {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    type: "public" | "private";
    maxParticipants: number;
    attendees?: { id: string }[];
  };
};

export default function SessionCard({ session }: SessionCardProps) {
  const going = session.attendees?.length ?? 0;
  const code = typeof window !== "undefined"
    ? localStorage.getItem(`mgmt:${session.id}`)
    : null;

  return (
    <div className="card">
      <h3><Link to={`/session/${session.id}`}>{session.title}</Link></h3>
      <p className="muted">{session.date} {session.time} · {session.type.toUpperCase()}</p>
      <p>{session.description}</p>
      <p className="muted">{going}/{session.maxParticipants} going</p>

      {/* NEW: ссылка на управление, если этот пользователь — владелец */}
      {code && (
        <p><Link to={`/session/${session.id}?code=${code}`}>Manage</Link></p>
      )}
    </div>
  );
}
