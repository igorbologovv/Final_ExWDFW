// [AI-GEN] small API client
const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export type CreateSessionPayload = {
  title: string; description: string; date: string; time: string;
  maxParticipants: number; type: "public" | "private"; location?: string;
};

export async function listSessions(params?: { filter?: string; scope?: "all" | "upcoming" | "past" }) {
  const q = new URLSearchParams(params as any).toString();
  const res = await fetch(`${BASE}/sessions?${q}`);
  return res.json();
}
export async function getSession(id: string) {
  const res = await fetch(`${BASE}/sessions/${id}`); if (!res.ok) throw new Error("Not found"); return res.json();
}
export async function createSession(payload: CreateSessionPayload) {
  const res = await fetch(`${BASE}/sessions`, { method: "POST", headers: { "Content-Type":"application/json" }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error("Create failed"); return res.json() as Promise<{ id:string; managementCode:string }>;
}
export async function updateSession(id: string, code: string, patch: Partial<CreateSessionPayload>) {
  const res = await fetch(`${BASE}/sessions/${id}?code=${encodeURIComponent(code)}`, { method:"PATCH", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(patch) });
  if (!res.ok) throw new Error("Update failed"); return res.json();
}
export async function deleteSession(id: string, code: string) {
  const res = await fetch(`${BASE}/sessions/${id}?code=${encodeURIComponent(code)}`, { method:"DELETE" });
  if (!res.ok) throw new Error("Delete failed"); return res.json();
}
export async function attend(id: string, name?: string) {
  const res = await fetch(`${BASE}/sessions/${id}/attend`, { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ name }) });
  if (!res.ok) throw new Error("Attend failed"); return res.json() as Promise<{ attendanceCode:string; attendeeId:string }>;
}
export async function unattend(id: string, attendanceCode: string) {
  const res = await fetch(`${BASE}/sessions/${id}/attend?code=${encodeURIComponent(attendanceCode)}`, { method:"DELETE" });
  if (!res.ok) throw new Error("Unattend failed"); return res.json();
}
export async function kickAttendee(id: string, managementCode: string, attendeeId: string) {
  const res = await fetch(`${BASE}/sessions/${id}/attend/${attendeeId}?code=${encodeURIComponent(managementCode)}`, { method:"DELETE" });
  if (!res.ok) throw new Error("Kick failed"); return res.json();
}
