export interface Project {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  name: string;
  project?: Project;
  projectId?: string;
}

export interface TimeEntry {
  id: string;
  description: string;
  taskId: string;
  task?: Task;
  tags?: string[];
  startTime: string;
  endTime: string;
  duration: string;
}
