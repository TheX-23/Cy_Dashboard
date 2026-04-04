export type IncidentSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type IncidentStatus = 'OPEN' | 'INVESTIGATING' | 'CONTAINED' | 'RESOLVED' | 'CLOSED';
export type IncidentImpact = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  impact: IncidentImpact;
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string;
  assignedToName?: string;
  affectedAssets: Array<{
    id: string;
    name: string;
    type: 'server' | 'user' | 'application' | 'network' | 'database';
    ip?: string;
    location?: string;
  }>;
  linkedAlerts: string[];
  tags: string[];
  notes: IncidentNote[];
  timeline: IncidentTimelineEvent[];
  riskScore: number;
  estimatedResolutionTime: number;
  actualResolutionTime?: number;
  priority: number;
  sourceAlertId?: string;
  correlationId?: string;
  evidence: IncidentEvidence[];
}

export interface IncidentNote {
  id: string;
  author: string;
  authorName?: string;
  content: string;
  timestamp: Date;
  type: 'note' | 'status_change' | 'action' | 'evidence';
  attachments?: string[];
}

export interface IncidentTimelineEvent {
  id: string;
  timestamp: Date;
  type: 'alert_triggered' | 'status_change' | 'action_taken' | 'note_added' | 'evidence_added';
  title: string;
  description: string;
  author?: string;
  metadata?: Record<string, any>;
}

export interface IncidentEvidence {
  id: string;
  type: 'screenshot' | 'log_file' | 'network_capture' | 'file' | 'url';
  name: string;
  description: string;
  url?: string;
  uploadedAt: Date;
  uploadedBy: string;
  size?: number;
  mimeType?: string;
}

export interface IncidentFilter {
  search: string;
  severity: IncidentSeverity[];
  status: IncidentStatus[];
  impact: IncidentImpact[];
  assignedTo: string;
  dateRange: '24h' | '7d' | '30d' | 'custom';
  customStart?: Date;
  customEnd?: Date;
  tags: string[];
}

export interface IncidentAnalytics {
  totalIncidents: number;
  openIncidents: number;
  criticalIncidents: number;
  meanTimeToResolve: number;
  medianTimeToResolve: number;
  incidentsOverTime: Array<{ time: string; count: number; critical: number }>;
  incidentsBySeverity: Array<{ severity: IncidentSeverity; count: number }>;
  incidentsByStatus: Array<{ status: IncidentStatus; count: number }>;
  topIncidentTypes: Array<{ type: string; count: number }>;
  resolutionRate: number;
  escalationRate: number;
  averageAlertsPerIncident: number;
}

export interface SavedIncidentFilter {
  id: string;
  name: string;
  filter: IncidentFilter;
  createdAt: Date;
  isDefault: boolean;
}

export interface IncidentAction {
  id: string;
  type: 'create' | 'assign' | 'update_status' | 'add_note' | 'add_evidence' | 'link_alert' | 'unlink_alert' | 'escalate' | 'resolve' | 'close' | 'export';
  title: string;
  description: string;
  icon?: string;
  automated?: boolean;
  risk: 'low' | 'medium' | 'high';
}
