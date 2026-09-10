export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';

export type Status =
  | 'Open'
  | 'Assigned'
  | 'In Progress'
  | 'Pending'
  | 'Resolved'
  | 'Closed'
  | 'Cancelled';

export type ContactMethod = 'Email' | 'Phone' | 'Chat';

export interface ActivityEntry {
  timestamp: string;
  message: string;
}

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  createdBy: string; // user id
  createdByName: string;
  assignedAgent: string | null; // user id
  assignedAgentName: string | null;
  category: string;
  priority: Priority;
  status: Status;
  contactMethod: ContactMethod;
  createdDate: string;
  updatedDate: string;
  dueDate: string | null;
  resolution: string | null;
  resolutionNotes: string | null;
  resolutionDate: string | null;
  activity: ActivityEntry[];
}
