// api.ts
const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export type CreatePayload = {
  title: string;
  description: string;
  date: string;  // YYYY-MM-DD
  time: string;  // HH:MM
  maxParticipants: number;
  type: "public" | "private";
  location?: string;
};

export async function listSessions() {
  const r = await fetch(`${BASE}/sessions`);
  if (!r.ok) throw new Error(`listSessions failed: ${r.status}`);
  return r.json();
}

export async function getSession(id: string) {
  const r = await fetch(`${BASE}/sessions/${id}`);
  if (!r.ok) throw new Error(`getSession failed: ${r.status}`);
  return r.json();
}

export async function createSession(payload: CreatePayload): Promise<{id:string; managementCode:string}> {
  const r = await fetch(`${BASE}/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) {
    const e = await r.json().catch(() => ({}));
    throw new Error(e.error ?? `createSession failed: ${r.status}`);
  }
  return r.json();
}

export async function attend(id: string, name?: string) {
  const r = await fetch(`${BASE}/sessions/${id}/attend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!r.ok) {
    const e = await r.json().catch(() => ({}));
    throw new Error(e.error ?? `attend failed: ${r.status}`);
  }
  return r.json(); // { attendee: {...} }
}

// NEW: delete session (admin action)
export async function deleteSession(id: string, managementCode: string): Promise<void> {
  const r = await fetch(`${BASE}/sessions/${id}?code=${encodeURIComponent(managementCode)}`, {
    method: "DELETE",
  });
  if (!r.ok) {
    const e = await r.json().catch(() => ({}));
    throw new Error(e.error ?? `deleteSession failed: ${r.status}`);
  }
}

// NEW: remove attendee (admin action)
export async function removeAttendee(sessionId: string, attendeeId: string, managementCode: string): Promise<void> {
  const r = await fetch(
    `${BASE}/sessions/${sessionId}/attend/${attendeeId}?code=${encodeURIComponent(managementCode)}`,
    { method: "DELETE" }
  );
  if (!r.ok) {
    const e = await r.json().catch(() => ({}));
    throw new Error(e.error ?? `removeAttendee failed: ${r.status}`);
  }
}
