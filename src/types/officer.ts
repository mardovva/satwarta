export type OfficerRole = "officer" | "national" | "admin";

export interface OfficerListItem {
  id: string;
  email: string | null;
  fullName: string;
  agency: string;
  role: OfficerRole;
  regions: string[];
  active: boolean;
  createdAt: string;
  lastSignInAt: string | null;
}

export type AuditAction = "create" | "update" | "reset_password" | "deactivate" | "reactivate" | "delete";

export interface AuditItem {
  id: number;
  at: string;
  actorName: string;
  action: AuditAction;
  targetLabel: string;
  details: Record<string, unknown>;
}

export const roleLabel: Record<OfficerRole, string> = { officer: "Regional", national: "Nasional", admin: "Admin" };
