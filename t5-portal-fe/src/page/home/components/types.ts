export interface Project {
  id: number;
  name: string;
  color: string;
}

export interface Task {
  id: number;
  name: string;
  project?: Project;
  project_id?: number;
  time_entries?: TimeEntry[];
}

export interface TimeEntry {
  id: number;
  description: string;
  task_id: number;
  task?: Task;
  tags?: string[];
  start_time: string; // ISO timestamp from database
  end_time: string | null; // ISO timestamp from database, nullable for running timers
}

// UI-specific interface for displaying tasks with aggregated duration
export interface TaskWithDuration {
  id: number;
  name: string;
  project?: Project;
  tags: string[];
  totalDuration: string; // Formatted duration like "2:30"
  timeEntries: TimeEntry[];
  startTime: string; // Formatted time for display
  endTime: string; // Formatted time for display
}

// Group of tasks by date
export interface TaskGroup {
  dateLabel: string; // "Today", "Yesterday", etc.
  totalDuration: string; // Formatted total duration for the day
  tasks: TaskWithDuration[];
}
