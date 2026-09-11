export interface Comment {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  comment: string;
  createdDate: string; // ISO date
  createdTime: string; // display time, e.g. "10:30 AM"
}
