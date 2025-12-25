export interface Project {
  name: string;
  color: string;
}

export interface TimeEntry {
  id: string;
  description: string;
  project?: Project;
  tags?: string[];
  billable: boolean;
  startTime: string;
  endTime: string;
  duration: string;
  date: string; // YYYY-MM-DD
}

export interface TimeEntryGroup {
  dateLabel: string; // "Today", "Yesterday", "Mon, Dec 23"
  totalDuration: string;
  entries: TimeEntry[];
}
