import { Role } from '../types/user';
import { Ticket, Status } from '../types/ticket';

export const can = {
  viewAllTickets: (role: Role) => role === 'Admin',
  createTicket: (_role: Role) => true,
  deleteTicket: (role: Role) => role === 'Admin',
  assignTicket: (role: Role) => role === 'Admin',
  manageUsers: (role: Role) => role === 'Admin',
  manageCategories: (role: Role) => role === 'Admin',
  addResolution: (role: Role) => role === 'Admin' || role === 'Support Agent',
  updatePriority: (role: Role, ticket: Ticket, userId: string) =>
    role === 'Admin' || (role === 'Support Agent' && ticket.assignedAgent === userId),

  editTicket: (role: Role, ticket: Ticket, userId: string) => {
    if (role === 'Admin') return true;
    if (role === 'Support Agent') return ticket.assignedAgent === userId;
    if (role === 'Employee') return ticket.createdBy === userId && ticket.status === 'Open';
    return false;
  },

  viewTicket: (role: Role, ticket: Ticket, userId: string) => {
    if (role === 'Admin') return true;
    if (role === 'Support Agent') return ticket.assignedAgent === userId;
    if (role === 'Employee') return ticket.createdBy === userId;
    return false;
  },
};

// Returns the list of next-status actions available to a given role for a ticket
export function getAvailableActions(role: Role, ticket: Ticket, userId: string): Status[] {
  const { status, assignedAgent, createdBy } = ticket;
  const actions: Status[] = [];

  if (role === 'Admin') {
    switch (status) {
      case 'Open':
        actions.push('Assigned', 'Cancelled');
        break;
      case 'Assigned':
        actions.push('In Progress');
        break;
      case 'In Progress':
        actions.push('Pending', 'Resolved');
        break;
      case 'Pending':
        actions.push('In Progress', 'Resolved');
        break;
      case 'Resolved':
        actions.push('Closed', 'Open'); // Open = Reopened
        break;
      default:
        break;
    }
    return actions;
  }

  if (role === 'Support Agent' && assignedAgent === userId) {
    switch (status) {
      case 'Assigned':
        actions.push('In Progress');
        break;
      case 'In Progress':
        actions.push('Pending', 'Resolved');
        break;
      case 'Pending':
        actions.push('In Progress', 'Resolved');
        break;
      case 'Resolved':
        actions.push('Closed');
        break;
      default:
        break;
    }
    return actions;
  }

  if (role === 'Employee' && createdBy === userId) {
    if (status === 'Open') actions.push('Cancelled');
    if (status === 'Resolved') actions.push('Open'); // Reopen
    return actions;
  }

  return actions;
}

export const statusColors: Record<Status, string> = {
  Open: 'bg-ink-100 dark:bg-ink-700 text-ink-600 dark:text-ink-300 border-ink-200 dark:border-ink-700',
  Assigned: 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-800',
  'In Progress': 'bg-signal-100 dark:bg-signal-500/20 text-signal-600 dark:text-signal-400 border-signal-400/40',
  Pending: 'bg-[#FBEFE0] dark:bg-amber-500/10 text-[#8A5522] dark:text-amber-300 border-[#E9CBA0] dark:border-amber-800/40',
  Resolved: 'bg-primary-50 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 border-primary-300 dark:border-primary-700',
  Closed: 'bg-ink-800 text-ink-100 border-ink-700',
  Cancelled: 'bg-[#FBE7E5] dark:bg-red-500/10 text-[#9B3A32] dark:text-red-300 border-[#EFC0BB] dark:border-red-800/50',
};

export const priorityColors: Record<string, string> = {
  Low: 'bg-ink-50 dark:bg-ink-700/40 text-ink-500 dark:text-ink-400 border-ink-200 dark:border-ink-700',
  Medium: 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-800',
  High: 'bg-signal-50 dark:bg-signal-500/10 text-signal-600 dark:text-signal-400 border-signal-400/40',
  Critical: 'bg-[#9B3A32] text-white border-[#9B3A32] font-semibold',
};

export const roleColors: Record<Role, string> = {
  Admin: 'bg-ink-800 text-white border-ink-700',
  'Support Agent': 'bg-primary-100 dark:bg-primary-900/40 text-primary-800 dark:text-primary-200 border-primary-300 dark:border-primary-700',
  Employee: 'bg-ink-50 dark:bg-ink-700/40 text-ink-500 dark:text-ink-400 border-ink-200 dark:border-ink-700',
};
