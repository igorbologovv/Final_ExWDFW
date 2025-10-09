// [AI-GEN] small attendee list
export default function AttendanceList({ attendees, onKick }:{ attendees:any[]; onKick?:(id:string)=>void }) {
  if (!attendees?.length) return <p>No attendees yet.</p>;
  return (
    <ul className="list">
      {attendees.map(a => (
        <li key={a.id}>
          {a.name || "Anonymous"}
          {onKick && <button className="danger small" onClick={()=>onKick(a.id)}>Remove</button>}
        </li>
      ))}
    </ul>
  );
}
