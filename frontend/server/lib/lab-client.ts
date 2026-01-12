const LAB_SWITCHER_URL = process.env.LAB_SWITCHER_URL || process.env.LAB_API_BASE || "";
const LAB_API_TOKEN = process.env.LAB_API_TOKEN || "";
const LAB_GUEST_URL = process.env.LAB_GUEST_URL || "";
const LAB_ADMIN_URL = process.env.LAB_ADMIN_URL || "";
const LAB_DIAG_URL = process.env.LAB_DIAG_URL || "";

export type Protocol = "modbus" | "opcua" | "cip" | "dnp3" | "iec104" | "mqtt" | "s7" | "bacnet";

export interface LabStatus {
  active: Protocol | null;
  timestamp: string;
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

function buildHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { ...extra };
  if (LAB_API_TOKEN) {
    headers["X-Auth-Token"] = LAB_API_TOKEN;
  }
  return headers;
}

function requireSwitcherUrl(): string {
  if (!LAB_SWITCHER_URL) {
    throw new Error("LAB_SWITCHER_URL is not configured");
  }
  return LAB_SWITCHER_URL.replace(/\/$/, "");
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

  let switcherBase: string;
  try {
    switcherBase = requireSwitcherUrl();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Missing lab switcher URL";
    return { success: false, protocol, message };
  }
  
  try {
    const response = await fetchWithTimeout(`${switcherBase}/api/switch?protocol=${protocol}`, {
      method: "POST",
      headers: buildHeaders({ "Content-Type": "application/json" }),
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
    const hmiUrl = isAuthenticated ? LAB_ADMIN_URL : LAB_GUEST_URL;
    return {
      success: true,
      protocol,
      hmiUrl: data.hmiUrl || hmiUrl || undefined,
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

export async function getLabStatus(): Promise<LabStatus> {
  const timestamp = new Date().toISOString();
  let switcherBase = "";
  try {
    switcherBase = requireSwitcherUrl();
  } catch {
    return { active: null, timestamp };
  }

  try {
    const response = await fetchWithTimeout(`${switcherBase}/api/status`, {
      headers: buildHeaders(),
    });

    if (!response.ok) {
      return { active: null, timestamp };
    }

    const data = await response.json();
    return {
      active: data.active ?? null,
      timestamp: data.timestamp || timestamp,
    };
  } catch {
    return { active: null, timestamp };
  }
}

export async function getDiagnostics(): Promise<DiagnosticsResponse> {
  try {
    if (!LAB_DIAG_URL) {
      return {
        containers: [],
        timestamp: new Date().toISOString(),
      };
    }
    const response = await fetchWithTimeout(`${LAB_DIAG_URL}/containers`, {
      headers: buildHeaders(),
    });

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
    if (!endpoint) {
      return null;
    }
    const response = await fetchWithTimeout(`${endpoint}/hmi/${protocol}`, {
      headers: buildHeaders(),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.url || null;
  } catch (error) {
    return null;
  }
}
