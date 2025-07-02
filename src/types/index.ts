export interface User {
  displayName: string;
  mail: string;
  userPrincipalName: string;
  id: string;
}

export interface WorkflowStep {
  step: string;
  status: "pending" | "processing" | "completed" | "error";
  description: string;
  result?: string;
  filesCreated?: string[];
  timeElapsed?: number;
}

export interface WorkflowResult {
  id: string;
  prompt: string;
  status: "processing" | "completed" | "error";
  steps: WorkflowStep[];
  totalTimeElapsed: number;
  timeSaved: number;
  summary: string;
  timestamp: Date;
}

export interface OfficeDocument {
  id: string;
  name: string;
<<<<<<< HEAD
  type: "excel" | "word" | "powerpoint" | "onenote" | "other";
  lastModified: Date;
  webUrl?: string;
  size?: number;
}
=======
  type: string;
  webUrl?: string;
  lastModified?: string;
  size?: number;
  summary?: string;
}
>>>>>>> d7fea82 (🚀 Major Enhancement: Real Excel Data Processing, Folder Search & Statistical Analysis)
