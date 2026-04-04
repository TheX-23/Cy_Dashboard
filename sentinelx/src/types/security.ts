export type Role = "admin" | "analyst" | "viewer";
export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type AlertStatus = "open" | "investigating" | "resolved";
export type IncidentStatus = "new" | "active" | "contained" | "resolved";

export interface SecurityLog {
  id: string;
  ip: string;
  timestamp: string;
  type: string;
  severity: Severity;
  rawData: Record<string, unknown>;
  parsedData: Record<string, unknown>;
}

export interface Threat {
  id: string;
  severity: Severity;
  score: number;
  sourceIp: string;
  location: string;
  vector: string;
  detectedAt: string;
}

export interface Alert {
  id: string;
  threatId: string;
  status: AlertStatus;
  assignedTo: string | null;
  severity?: Severity;
  createdAt: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  status: IncidentStatus;
  timeline: Array<{ at: string; note: string; actor: string }>;
}

export interface ThreatTrendPoint {
  time: string;
  threats: number;
  mitigated: number;
}

export type RealtimeEvent =
  | { type: "system"; message: string; at: string }
  | { type: "log"; data: SecurityLog; at: string }
  | { type: "threat"; data: Threat; at: string }
  | { type: "alert"; data: Alert; at: string }
  | { type: "incident"; data: { id: string; title: string; status: string; created_at: string }; at: string }
  | {
      type: "soar_action";
      data: { id: string; action: string; target: string; status: string; reason: string; executedAt: string };
      at: string;
    };
