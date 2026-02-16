export enum Role {
  Owner = 'owner',
  Admin = 'admin',
  Viewer = 'viewer',
}

export enum TaskCategory {
  Work = 'work',
  Personal = 'personal',
  Other = 'other',
}

export enum TaskStatus {
  Todo = 'todo',
  InProgress = 'in_progress',
  Blocked = 'blocked',
  Done = 'done',
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  organizationId: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  category: TaskCategory;
  orderIndex: number;
  createdById: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string | null;
  details: string | null;
  timestamp: Date;
}
