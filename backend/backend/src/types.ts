export type SessionType = "public" | "private";

export interface Attendee {
  id: string;
  name?: string;
  attendanceCode: string;
  createdAt: string;
}

export interface Session {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  maxParticipants: number;
  type: SessionType;
  location?: string;
  managementCode: string;
  attendees: Attendee[];
  createdAt: string;
  updatedAt: string;
}
