// Detection service (root paths like /rules); not the same as NEXT_PUBLIC_API_URL /api/v1 proxy.
const API_BASE_URL =
  process.env.NEXT_PUBLIC_DETECTION_API_URL || "http://127.0.0.1:8080";
const WS_BASE_URL = (
  process.env.NEXT_PUBLIC_WS_URL || "ws://127.0.0.1:8080/ws"
).replace(/\/ws\/?$/, "") || "ws://127.0.0.1:8080";

export interface DetectionAPI {
  // WebSocket connections
  connectToThreats: () => WebSocket;
  connectToAlerts: () => WebSocket;
  
  // REST API calls
  getRules: () => Promise<any[]>;
  createRule: (rule: any) => Promise<any>;
  updateRule: (id: string, rule: any) => Promise<any>;
  deleteRule: (id: string) => Promise<void>;
  
  getDetections: () => Promise<any[]>;
  getAnalytics: () => Promise<any>;
  
  // Log ingestion
  ingestLog: (log: any) => Promise<any>;
  
  // SOAR operations
  executeSOAR: (payload: any) => Promise<any>;
  
  // Health check
  healthCheck: () => Promise<any>;
}

export const detectionAPI: DetectionAPI = {
  // WebSocket connections
  connectToThreats: () => {
    const ws = new WebSocket(`${WS_BASE_URL}/ws/threats`);
    return ws;
  },

  connectToAlerts: () => {
    const ws = new WebSocket(`${WS_BASE_URL}/ws/alerts`);
    return ws;
  },

  // REST API calls
  getRules: async () => {
    const response = await fetch(`${API_BASE_URL}/rules`, {
      method: 'GET',
      headers: {
        'x-api-key': process.env.NEXT_PUBLIC_API_KEY || 'dev-key'
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch rules: ${response.statusText}`);
    }
    return response.json();
  },

  createRule: async (rule: any) => {
    const response = await fetch(`${API_BASE_URL}/rules`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.NEXT_PUBLIC_API_KEY || 'dev-key'
      },
      body: JSON.stringify(rule)
    });
    if (!response.ok) {
      throw new Error(`Failed to create rule: ${response.statusText}`);
    }
    return response.json();
  },

  updateRule: async (id: string, rule: any) => {
    const response = await fetch(`${API_BASE_URL}/rules/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.NEXT_PUBLIC_API_KEY || 'dev-key'
      },
      body: JSON.stringify(rule)
    });
    if (!response.ok) {
      throw new Error(`Failed to update rule: ${response.statusText}`);
    }
    return response.json();
  },

  deleteRule: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/rules/${id}`, {
      method: 'DELETE',
      headers: {
        'x-api-key': process.env.NEXT_PUBLIC_API_KEY || 'dev-key'
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to delete rule: ${response.statusText}`);
    }
  },

  getDetections: async () => {
    const response = await fetch(`${API_BASE_URL}/detections`, {
      method: 'GET',
      headers: {
        'x-api-key': process.env.NEXT_PUBLIC_API_KEY || 'dev-key'
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch detections: ${response.statusText}`);
    }
    return response.json();
  },

  getAnalytics: async () => {
    const response = await fetch(`${API_BASE_URL}/analytics`, {
      method: 'GET',
      headers: {
        'x-api-key': process.env.NEXT_PUBLIC_API_KEY || 'dev-key'
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch analytics: ${response.statusText}`);
    }
    return response.json();
  },

  ingestLog: async (log: any) => {
    const response = await fetch(`${API_BASE_URL}/ingest-log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.NEXT_PUBLIC_API_KEY || 'dev-key'
      },
      body: JSON.stringify(log)
    });
    if (!response.ok) {
      throw new Error(`Failed to ingest log: ${response.statusText}`);
    }
    return response.json();
  },

  executeSOAR: async (payload: any) => {
    const response = await fetch(`${API_BASE_URL}/soar/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.NEXT_PUBLIC_API_KEY || 'dev-key'
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      throw new Error(`Failed to execute SOAR: ${response.statusText}`);
    }
    return response.json();
  },

  healthCheck: async () => {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'x-api-key': process.env.NEXT_PUBLIC_API_KEY || 'dev-key'
      }
    });
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }
    return response.json();
  }
};
