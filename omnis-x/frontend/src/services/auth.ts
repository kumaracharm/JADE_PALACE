/**
 * OMNIS-X Institutional Authentication & RBAC Service.
 * Synchronizes cryptographic JWT sessions across Command Centre (:3000),
 * Digital Twin (:3001), and Incident Response (:3002) via LocalStorage & Cookies.
 */

export type DemoRole =
  | "SUPER_ADMIN"
  | "FACILITY_MANAGER"
  | "HOD_ACADEMIC"
  | "TECHNICIAN"
  | "STUDENT";

export interface AuthUser {
  user_id: string;
  username: string;
  full_name: string;
  role: DemoRole;
  department: string;
  permissions: string[];
}

export interface AuthSession {
  token: string;
  user: AuthUser;
  expiresAt: number;
}

export interface DemoAccountMeta {
  role: DemoRole;
  roleTitle: string;
  username: string;
  passwordDocumentation: string;
  fullName: string;
  title: string;
  department: string;
  description: string;
  capabilities: string[];
}

export const DEMO_ACCOUNTS: DemoAccountMeta[] = [
  {
    role: "SUPER_ADMIN",
    roleTitle: "Super Admin",
    username: "superadmin",
    passwordDocumentation: "AdminPassword!123",
    fullName: "Dr. Arthur Vance",
    title: "Director of Institutional Operations",
    department: "Executive Directorate",
    description: "Full institutional sovereignty across all three workspaces and physical/academic domains.",
    capabilities: [
      "Full access to Command Centre, Digital Twin & Response",
      "Start, monitor, and restore all 5 incident scenarios",
      "Direct authorization of OR-Tools Pareto recovery plans",
      "Manage institutional users and audit logs",
    ],
  },
  {
    role: "FACILITY_MANAGER",
    roleTitle: "Facility Manager",
    username: "facility_mgr",
    passwordDocumentation: "FacilityPass!123",
    fullName: "Marcus Bennett",
    title: "Chief Infrastructure Engineer",
    department: "Facilities & Physical Plant",
    description: "Authoritative lead over campus mechanical, electrical, and plumbing engineering assets.",
    capabilities: [
      "Access to Digital Twin 3D asset inspection and conduits",
      "Monitor electrical, water and HVAC environmental incidents",
      "Dispatch work orders and assign field technicians",
      "Approve facilities & physical plant recovery actions",
    ],
  },
  {
    role: "HOD_ACADEMIC",
    roleTitle: "HOD / Academic Admin",
    username: "hod_academic",
    passwordDocumentation: "AcademicPass!123",
    fullName: "Dr. Kavita Sharma",
    title: "Head of Electrical & Computer Engineering",
    department: "Academic Affairs",
    description: "Academic leadership responsible for student safety, timetable continuity, and room re-allocation.",
    capabilities: [
      "View academic timetable disruptions and student impact",
      "Review smart classroom projector/equipment failures",
      "Approve academic course relocations (e.g. CR-201 to CR-202)",
      "Restricted: Cannot approve high-voltage grid actions",
    ],
  },
  {
    role: "TECHNICIAN",
    roleTitle: "Technician",
    username: "technician",
    passwordDocumentation: "TechPass!123",
    fullName: "Rajesh Patel",
    title: "Lead Electrical & Systems Specialist",
    department: "Field Engineering Response",
    description: "On-call field specialist executing technical repairs, breaker resets, and sensor replacements.",
    capabilities: [
      "View assigned technical repair work orders",
      "Log step-by-step progress and resolution notes",
      "Restricted: Cannot trigger scenarios or approve own plans",
    ],
  },
  {
    role: "STUDENT",
    roleTitle: "Student",
    username: "student",
    passwordDocumentation: "StudentPass!123",
    fullName: "Priya Verma",
    title: "B.Tech Computer Science (L3)",
    department: "Student Body",
    description: "Student user interacting with campus via the Oogway Mobile PWA.",
    capabilities: [
      "Access Student Grievance Mobile PWA interface",
      "Submit classroom & facility hazard reports",
      "Track status of own submitted tickets",
      "Restricted: Blocked from Command Centre administrative APIs",
    ],
  },
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";
const STORAGE_KEY = "omnis_auth_session";
const COOKIE_KEY = "omnis_auth_token";

let authBroadcast: BroadcastChannel | null = null;
if (typeof window !== "undefined" && "BroadcastChannel" in window) {
  try {
    authBroadcast = new BroadcastChannel("omnis_auth_sync");
  } catch (e) {
    console.warn("BroadcastChannel not supported:", e);
  }
}

export class AuthService {
  /**
   * Retrieves active session from localStorage or cross-port cookie.
   */
  static getSession(): AuthSession | null {
    if (typeof window === "undefined") return null;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const session: AuthSession = JSON.parse(raw);
        if (session.expiresAt && Date.now() < session.expiresAt) {
          return session;
        } else {
          this.logout();
          return null;
        }
      }

      // Check cookie for cross-port login sync
      const cookies = document.cookie.split(";").reduce((acc, c) => {
        const [k, v] = c.trim().split("=");
        if (k && v) acc[k] = decodeURIComponent(v);
        return acc;
      }, {} as Record<string, string>);

      if (cookies[COOKIE_KEY] && cookies["omnis_auth_user"]) {
        const user: AuthUser = JSON.parse(cookies["omnis_auth_user"]);
        const session: AuthSession = {
          token: cookies[COOKIE_KEY],
          user,
          expiresAt: Date.now() + 3600 * 1000,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
        return session;
      }
    } catch (e) {
      console.warn("Session retrieval error:", e);
    }
    return null;
  }

  /**
   * Saves authenticated session in both LocalStorage and cross-port cookies.
   */
  static saveSession(session: AuthSession): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));

      // Cookie with path=/ to share across localhost ports 3000, 3001, 3002
      const maxAge = 86400; // 24 hours
      document.cookie = `${COOKIE_KEY}=${encodeURIComponent(session.token)}; path=/; max-age=${maxAge}; SameSite=Lax`;
      document.cookie = `omnis_auth_user=${encodeURIComponent(JSON.stringify(session.user))}; path=/; max-age=${maxAge}; SameSite=Lax`;

      if (authBroadcast) {
        authBroadcast.postMessage({ type: "AUTH_LOGIN", session });
      }
    } catch (e) {
      console.warn("Session save error:", e);
    }
  }

  /**
   * Logs in with username & password against backend /auth/token.
   */
  static async login(username: string, password: string): Promise<AuthSession> {
    const res = await fetch(`${API_BASE}/auth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || "Invalid institutional credentials.");
    }

    const data = await res.json();
    const demoMeta = DEMO_ACCOUNTS.find((d) => d.role === data.role) || DEMO_ACCOUNTS[0];

    const session: AuthSession = {
      token: data.access_token,
      user: {
        user_id: data.user_id,
        username: data.username,
        full_name: data.full_name || demoMeta.fullName,
        role: data.role as DemoRole,
        department: data.department || demoMeta.department,
        permissions: data.permissions || demoMeta.capabilities,
      },
      expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
    };

    this.saveSession(session);
    return session;
  }

  /**
   * Instant demo role login without manual password typing.
   * Obtains a signed cryptographic JWT token from the FastAPI backend.
   */
  static async demoLogin(role: DemoRole): Promise<AuthSession> {
    try {
      const res = await fetch(`${API_BASE}/auth/demo-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      if (res.ok) {
        const data = await res.json();
        const demoMeta = DEMO_ACCOUNTS.find((d) => d.role === role) || DEMO_ACCOUNTS[0];

        const session: AuthSession = {
          token: data.access_token,
          user: {
            user_id: data.user_id,
            username: data.username,
            full_name: data.full_name || demoMeta.fullName,
            role: data.role as DemoRole,
            department: data.department || demoMeta.department,
            permissions: data.permissions || demoMeta.capabilities,
          },
          expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
        };

        this.saveSession(session);
        return session;
      }
    } catch (e) {
      console.warn("Backend demo login fallback:", e);
    }

    // Offline client fallback
    const demoMeta = DEMO_ACCOUNTS.find((d) => d.role === role) || DEMO_ACCOUNTS[0];
    const session: AuthSession = {
      token: `demo_jwt_${role}_${Date.now()}`,
      user: {
        user_id: demoMeta.username.toUpperCase(),
        username: demoMeta.username,
        full_name: demoMeta.fullName,
        role,
        department: demoMeta.department,
        permissions: demoMeta.capabilities,
      },
      expiresAt: Date.now() + 3600 * 1000,
    };
    this.saveSession(session);
    return session;
  }

  /**
   * Clears session across LocalStorage, cookies, and broadcasts logout.
   */
  static logout(): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem(STORAGE_KEY);
      document.cookie = `${COOKIE_KEY}=; path=/; max-age=0; SameSite=Lax`;
      document.cookie = `omnis_auth_user=; path=/; max-age=0; SameSite=Lax`;

      if (authBroadcast) {
        authBroadcast.postMessage({ type: "AUTH_LOGOUT" });
      }
    } catch (e) {
      console.warn("Logout error:", e);
    }
  }

  /**
   * Registers a callback for real-time auth changes across tabs/windows.
   */
  static onAuthChange(callback: (session: AuthSession | null) => void): () => void {
    if (typeof window === "undefined") return () => {};

    const handleMessage = (evt: MessageEvent) => {
      if (evt.data?.type === "AUTH_LOGIN") {
        callback(evt.data.session);
      } else if (evt.data?.type === "AUTH_LOGOUT") {
        callback(null);
      }
    };

    const handleStorage = (evt: StorageEvent) => {
      if (evt.key === STORAGE_KEY) {
        callback(AuthService.getSession());
      }
    };

    if (authBroadcast) {
      authBroadcast.addEventListener("message", handleMessage);
    }
    window.addEventListener("storage", handleStorage);

    return () => {
      if (authBroadcast) {
        authBroadcast.removeEventListener("message", handleMessage);
      }
      window.removeEventListener("storage", handleStorage);
    };
  }
}
