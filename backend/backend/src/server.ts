import express from "express";
import cors from "cors";
import crypto from "crypto";
import { db } from "./store";
import { Attendee, Session } from "./types";

const app = express();
app.use(cors());
app.use(express.json());

/** ===== Helpers ===== */
function id() { return crypto.randomBytes(4).toString("hex"); }
function code() { return crypto.randomBytes(5).toString("base64url"); }
function isFuture(date: string, time: string) {
  const dt = new Date(`${date}T${time}:00`);
  return dt.getTime() >= Date.now();
}

// простой in-memory lock по ключу (session.id) — от гонок
const lockQueue = new Map<string, Promise<unknown>>();
async function withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const tail = lockQueue.get(key) ?? Promise.resolve();
  let result!: T;
  const next = tail
    .catch(() => {})
    .then(fn)
    .then((r) => { result = r; });
  lockQueue.set(key, next.finally(() => {
    if (lockQueue.get(key) === next) lockQueue.delete(key);
  }));
  await next;
  return result;
}

// санитайзим секреты
function sanitizeAttendee(a: Attendee): Omit<Attendee, "attendanceCode" | "clientId"> {
  const { attendanceCode, clientId, ...rest } = a;
  return rest;
}
function sanitizeSession(s: Session) {
  const { managementCode, attendees, ...rest } = s;
  return { ...rest, attendees: attendees.map(sanitizeAttendee) };
}

/** ===== Routes ===== */

/** GET /sessions?filter=&scope=all|upcoming|past */
app.get("/sessions", (req, res) => {
  const { filter = "", scope = "all" } = req.query as Record<string, string>;
  let items = db.getAll().filter(s => s.type === "public");
  if (scope === "upcoming") items = items.filter(s => isFuture(s.date, s.time));
  if (scope === "past")     items = items.filter(s => !isFuture(s.date, s.time));
  if (filter) {
    const q = filter.toLowerCase();
    items = items.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      (s.location ?? "").toLowerCase().includes(q)
    );
  }
  res.json(items.map(sanitizeSession));
});

/** GET /sessions/:id */
app.get("/sessions/:id", (req, res) => {
  const s = db.get(req.params.id);
  if (!s) return res.status(404).json({ error: "Not found" });
  res.json(sanitizeSession(s));
});

/** POST /sessions */
app.post("/sessions", (req, res) => {
  const { title, description, date, time, maxParticipants, type, location } = req.body;
  if (!title || !description || !date || !time || !maxParticipants || !type) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const session: Session = {
    id: id(),
    title, description, date, time, maxParticipants, type, location,
    managementCode: code(),
    attendees: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.add(session);
  res.status(201).json({ id: session.id, managementCode: session.managementCode });
});

/** PATCH /sessions/:id?code=MANAGEMENT_CODE  */
app.patch("/sessions/:id", (req, res) => {
  const { code: mgmt } = req.query as Record<string, string>;
  const s = db.get(req.params.id);
  if (!s) return res.status(404).json({ error: "Not found" });
  if (mgmt !== s.managementCode) return res.status(403).json({ error: "Invalid management code" });

  const { title, description, date, time, maxParticipants, type, location } = req.body;
  const updated = db.update(s.id, { title, description, date, time, maxParticipants, type, location });
  res.json(updated ? sanitizeSession(updated) : { error: "Update failed" });
});

/** DELETE /sessions/:id?code=MANAGEMENT_CODE */
app.delete("/sessions/:id", (req, res) => {
  const { code: mgmt } = req.query as Record<string, string>;
  const s = db.get(req.params.id);
  if (!s) return res.status(404).json({ error: "Not found" });
  if (mgmt !== s.managementCode) return res.status(403).json({ error: "Invalid management code" });
  db.remove(s.id);
  res.json({ ok: true });
});

/** POST /sessions/:id/attend  { name, clientId } -> {attendanceCode, attendeeId} */
app.post("/sessions/:id/attend", async (req, res) => {
  const s0 = db.get(req.params.id);
  if (!s0) return res.status(404).json({ error: "Not found" });

  try {
    const result = await withLock(s0.id, async () => {
      const s = db.get(s0.id);
      if (!s) return res.status(404).json({ error: "Not found" });

      if (s.attendees.length >= s.maxParticipants) {
        return res.status(409).json({ error: "Session is full" });
      }

      // анти-дубль: один clientId — один участник
      const rawClientId =
        (req.body?.clientId ?? "") ||
        (req.header("x-client-id") ?? "");
      const clientId = String(rawClientId).trim();
      if (clientId) {
        const exists = s.attendees.some(a => a.clientId === clientId);
        if (exists) {
          return res.status(409).json({ error: "Already registered from this device" });
        }
      }

      const rawName = (req.body?.name ?? "").toString();
      const attendee: Attendee = {
        id: id(),
        name: rawName || undefined,
        attendanceCode: code(),
        createdAt: new Date().toISOString(),
        clientId: clientId || undefined,
      };

      db.update(s.id, { attendees: [...s.attendees, attendee] });

      return res.status(201).json({
        attendanceCode: attendee.attendanceCode,
        attendeeId: attendee.id
      });
    });
    return result;
  } catch (e) {
    console.error("Attend error:", e);
    return res.status(500).json({ error: "Internal error" });
  }
});

/** DELETE /sessions/:id/attend?code=ATTENDANCE_CODE */
app.delete("/sessions/:id/attend", (req, res) => {
  const s = db.get(req.params.id);
  if (!s) return res.status(404).json({ error: "Not found" });
  const { code: attCode } = req.query as Record<string, string>;
  if (!attCode) return res.status(400).json({ error: "Missing attendance code" });

  const before = s.attendees.length;
  s.attendees = s.attendees.filter(a => a.attendanceCode !== attCode);
  if (s.attendees.length === before) return res.status(403).json({ error: "Invalid attendance code" });

  db.update(s.id, { attendees: s.attendees });
  res.json({ ok: true });
});

/** DELETE /sessions/:id/attend/:attendeeId?code=MANAGEMENT_CODE */
app.delete("/sessions/:id/attend/:attendeeId", (req, res) => {
  const s = db.get(req.params.id);
  if (!s) return res.status(404).json({ error: "Not found" });
  const { code: mgmt } = req.query as Record<string, string>;
  if (mgmt !== s.managementCode) return res.status(403).json({ error: "Invalid management code" });

  s.attendees = s.attendees.filter(a => a.id !== req.params.attendeeId);
  db.update(s.id, { attendees: s.attendees });
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Hobby backend on http://localhost:${PORT}`);
});
