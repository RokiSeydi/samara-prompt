export interface User {
  displayName: string;
  mail: string;
  userPrincipalName: string;
  id: string;
}

export interface WorkflowStep {
  step: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  description: string;
  result?: string;
  filesCreated?: string[];
  timeElapsed?: number;
}

export interface WorkflowResult {
  id: string;
  prompt: string;
  status: 'processing' | 'completed' | 'error';
  steps: WorkflowStep[];
  totalTimeElapsed: number;
  timeSaved: number;
  summary: string;
  timestamp: Date;
}