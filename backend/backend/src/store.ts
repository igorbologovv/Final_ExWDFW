// [AI-GEN] simple JSON file store
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Session } from "./types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, "..", "data.json");

type DB = { sessions: Session[] };

function ensureDb(): DB {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ sessions: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
}
function saveDb(db: DB) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

export const db = {
  getAll(): Session[] {
    return ensureDb().sessions;
  },
  get(id: string): Session | undefined {
    return ensureDb().sessions.find(s => s.id === id);
  },
  add(session: Session): Session {
    const cur = ensureDb();
    cur.sessions.push(session);
    saveDb(cur);
    return session;
  },
  update(id: string, patch: Partial<Session>): Session | undefined {
    const cur = ensureDb();
    const idx = cur.sessions.findIndex(s => s.id === id);
    if (idx === -1) return;
    cur.sessions[idx] = { ...cur.sessions[idx], ...patch, updatedAt: new Date().toISOString() };
    saveDb(cur);
    return cur.sessions[idx];
  },
  remove(id: string): boolean {
    const cur = ensureDb();
    const before = cur.sessions.length;
    cur.sessions = cur.sessions.filter(s => s.id !== id);
    saveDb(cur);
    return cur.sessions.length < before;
  }
};
