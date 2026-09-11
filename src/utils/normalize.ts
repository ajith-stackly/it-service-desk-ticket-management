import { Role, UserStatus } from '../types/user';
import { Status, Priority } from '../types/ticket';

/**
 * Some deployed backends (e.g. a hand-edited db.json on Render) store role/status
 * values in a different case or shorthand than what the UI expects
 * ("admin" instead of "Admin", "agent" instead of "Support Agent", etc).
 * These helpers map any reasonable variant back to the canonical values the
 * rest of the app relies on, so RBAC and lifecycle logic never silently breaks
 * because of a casing mismatch between environments.
 */

const ROLE_ALIASES: Record<string, Role> = {
  admin: 'Admin',
  administrator: 'Admin',
  agent: 'Support Agent',
  supportagent: 'Support Agent',
  'support-agent': 'Support Agent',
  'support_agent': 'Support Agent',
  'support agent': 'Support Agent',
  employee: 'Employee',
  user: 'Employee',
};

const STATUS_ALIASES: Record<string, UserStatus> = {
  active: 'Active',
  enabled: 'Active',
  inactive: 'Inactive',
  disabled: 'Inactive',
};

const TICKET_STATUS_ALIASES: Record<string, Status> = {
  open: 'Open',
  assigned: 'Assigned',
  'in progress': 'In Progress',
  'in-progress': 'In Progress',
  inprogress: 'In Progress',
  pending: 'Pending',
  resolved: 'Resolved',
  closed: 'Closed',
  cancelled: 'Cancelled',
  canceled: 'Cancelled',
};

const PRIORITY_ALIASES: Record<string, Priority> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

const clean = (value: unknown): string => (typeof value === 'string' ? value.trim().toLowerCase() : '');

export function normalizeRole(value: Role | string): Role {
  return ROLE_ALIASES[clean(value)] ?? (value as Role);
}

export function normalizeUserStatus(value: UserStatus | string): UserStatus {
  return STATUS_ALIASES[clean(value)] ?? (value as UserStatus);
}

export function normalizeTicketStatus(value: Status | string): Status {
  return TICKET_STATUS_ALIASES[clean(value)] ?? (value as Status);
}

export function normalizePriority(value: Priority | string): Priority {
  return PRIORITY_ALIASES[clean(value)] ?? (value as Priority);
}
