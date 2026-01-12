const LAB_API_BASE = process.env.LAB_API_BASE || "https://lab-backend.example.com";
const LAB_GUEST_URL = process.env.LAB_GUEST_URL || `${LAB_API_BASE}/guest`;
const LAB_ADMIN_URL = process.env.LAB_ADMIN_URL || `${LAB_API_BASE}/admin`;
const LAB_DIAG_URL = process.env.LAB_DIAG_URL || `${LAB_API_BASE}/diagnostics`;

export type Protocol = "modbus" | "opcua" | "cip" | "dnp3" | "iec104" | "mqtt" | "s7" | "bacnet";

export interface LabStatus {
  protocol: Protocol;
  active: boolean;
  containerId?: string;
  hmiUrl?: string;
  serverPort?: number;
  startedAt?: string;
  health: "healthy" | "degraded" | "unhealthy" | "unknown";
}

export interface LabSwitchResponse {
  success: boolean;
  protocol: Protocol;
  hmiUrl?: string;
  message?: string;
}

export interface DiagnosticsResponse {
  containers: {
    name: string;
    status: string;
    health: string;
    uptime?: string;
  }[];
  timestamp: string;
}

const GUEST_ALLOWED_PROTOCOLS: Protocol[] = ["modbus"];

export function isGuestAllowedProtocol(protocol: Protocol): boolean {
  return GUEST_ALLOWED_PROTOCOLS.includes(protocol);
}

export function getAllowedProtocols(isAuthenticated: boolean): Protocol[] {
  if (isAuthenticated) {
    return ["modbus", "opcua", "cip", "dnp3", "iec104", "mqtt", "s7", "bacnet"];
  }
  return GUEST_ALLOWED_PROTOCOLS;
}

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 10000): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

export async function switchProtocol(protocol: Protocol, isAuthenticated: boolean): Promise<LabSwitchResponse> {
  const validProtocols: Protocol[] = ["modbus", "opcua", "cip", "dnp3", "iec104", "mqtt", "s7", "bacnet"];
  if (!validProtocols.includes(protocol)) {
    return {
      success: false,
      protocol,
      message: "Invalid protocol specified.",
    };
  }

  if (!isAuthenticated && !isGuestAllowedProtocol(protocol)) {
    return {
      success: false,
      protocol,
      message: "Authentication required to access this protocol. Please sign in.",
    };
  }

  const allowedProtocols = getAllowedProtocols(isAuthenticated);
  if (!allowedProtocols.includes(protocol)) {
    return {
      success: false,
      protocol,
      message: "You do not have permission to access this protocol.",
    };
  }

  const endpoint = isAuthenticated ? LAB_ADMIN_URL : LAB_GUEST_URL;
  
  try {
    const response = await fetchWithTimeout(`${endpoint}/switch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ protocol }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        protocol,
        message: `Lab backend error: ${response.status} ${errorText}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      protocol,
      hmiUrl: data.hmiUrl,
      message: data.message,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      protocol,
      message: `Failed to connect to lab backend: ${message}`,
    };
  }
}

export async function getLabStatus(protocol?: Protocol): Promise<LabStatus | LabStatus[]> {
  try {
    const url = protocol ? `${LAB_DIAG_URL}/status/${protocol}` : `${LAB_DIAG_URL}/status`;
    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      if (protocol) {
        return {
          protocol,
          active: false,
          health: "unknown",
        };
      }
      return [];
    }

    return await response.json();
  } catch (error) {
    if (protocol) {
      return {
        protocol,
        active: false,
        health: "unknown",
      };
    }
    return [];
  }
}

export async function getDiagnostics(): Promise<DiagnosticsResponse> {
  try {
    const response = await fetchWithTimeout(`${LAB_DIAG_URL}/containers`);

    if (!response.ok) {
      return {
        containers: [],
        timestamp: new Date().toISOString(),
      };
    }

    return await response.json();
  } catch (error) {
    return {
      containers: [],
      timestamp: new Date().toISOString(),
    };
  }
}

export async function getHmiUrl(protocol: Protocol, isAuthenticated: boolean): Promise<string | null> {
  if (!isAuthenticated && !isGuestAllowedProtocol(protocol)) {
    return null;
  }

  try {
    const endpoint = isAuthenticated ? LAB_ADMIN_URL : LAB_GUEST_URL;
    const response = await fetchWithTimeout(`${endpoint}/hmi/${protocol}`);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.url || null;
  } catch (error) {
    return null;
  }
}
