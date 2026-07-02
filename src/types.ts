export type ProcessStatus = 'active' | 'draft' | 'pending' | 'expired';

export type NodeType =
  | 'start'
  | 'end'
  | 'task'
  | 'approval'
  | 'decision'
  | 'sub_process'
  | 'api_call'
  | 'notification'
  | 'email'
  | 'sms'
  | 'zns'
  | 'chatbot'
  | 'document'
  | 'form';

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'dropdown' | 'file' | 'checkbox';
  required: boolean;
  options?: string[]; // for dropdown
}

export interface DynamicForm {
  id: string;
  name: string;
  fields: FormField[];
}

export interface SOP {
  purpose: string;
  scope: string;
  definitions: string;
  responsibility: string;
  steps: string[];
  forms: string[];
  kpi: string;
  sla: string;
  risks: string;
  controls: string;
  version: string;
}

export interface WorkflowNode {
  id: string;
  type: NodeType;
  label: string;
  code: string;
  assigneeRole: string;
  assigneeDept: string;
  assigneePerson: string;
  sla: number; // in hours
  description: string;
  objective: string;
  startCondition: string;
  endCondition: string;
  checklist: string[];
  sop: SOP;
  formId: string | null;
  linkedNodeIds?: string[];
  x: number;
  y: number;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface ChangelogItem {
  version: string;
  date: string;
  author: string;
  description: string;
}

export interface Process {
  id: string;
  name: string;
  code: string;
  department: string;
  level: 1 | 2 | 3; // 1: Chiến lược, 2: Khối phòng ban, 3: Chi tiết
  status: ProcessStatus;
  description: string;
  completionRate: number;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  version: string;
  publishDate: string;
  creator: string;
  reviewer: string;
  approver: string;
  changelog: ChangelogItem[];
  
  // New fields for Document Info
  decisionNumber?: string;
  decisionDate?: string;
  definitions?: string;
  definitionsList?: string[];
  purpose?: string;
  purposeList?: string[];
  scope?: string;
  scopeAppliesTo?: string;
  scopeContent?: string;
  targetAudience?: string;
  targetAudienceList?: { object: string; responsibility: string }[];
  references?: string;
  referencesList?: { name: string; code: string }[];
  terms?: string;
  termList?: { term: string; explanation: string }[];
  abbreviations?: string;
  abbreviationList?: { abbreviation: string; meaning: string }[];
  generalPrinciples?: string;
  responsibilities?: string;
}

export type RoleType =
  | 'Super Admin'
  | 'Process Manager'
  | 'Department Manager'
  | 'Editor'
  | 'Reviewer'
  | 'Approver'
  | 'Viewer';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}
