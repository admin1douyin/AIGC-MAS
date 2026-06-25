export enum AgentRole {
  PROJECT_MANAGER = 'project_manager',
  CREATIVE_DIRECTOR = 'creative_director',
  SCRIPT_WRITER = 'script_writer',
  STORYBOARD_ARTIST = 'storyboard_artist',
  VOICE_ACTOR = 'voice_actor',
  VIDEO_EDITOR = 'video_editor',
  MARKETING_STRATEGIST = 'marketing_strategist',
  BRAND_ANALYST = 'brand_analyst',
  CULTURE_RESEARCHER = 'culture_researcher',
  MUSIC_COMPOSER = 'music_composer',
  QUALITY_INSPECTOR = 'quality_inspector',
  DATA_ANALYST = 'data_analyst',
}

export enum AgentStatus {
  IDLE = 'idle',
  WORKING = 'working',
  PAUSED = 'paused',
  ERROR = 'error',
}

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  status: AgentStatus;
  description: string;
  capabilities: string[];
  personality?: string[];
  avatarUrl?: string;
  currentTaskId?: string;
  projectId?: string;
  completedTasks: number;
  createdAt: Date;
  updatedAt: Date;
}

export type MessageType =
  | 'task_assignment'
  | 'status_update'
  | 'question'
  | 'feedback'
  | 'deliverable'
  | 'notification'
  | 'result'
  | 'phase_start'
  | 'phase_complete'
  | 'review_pass'
  | 'review_fail'
  | 'error'
  | 'system';

export interface AgentMessage {
  id: string;
  fromAgentId?: string;
  toAgentId?: string;
  projectId: string;
  taskId?: string;
  content: string;
  messageType: MessageType;
  metadata?: Record<string, any>;
  read: boolean;
  createdAt: Date;
}

export interface AgentTask {
  id: string;
  projectId: string;
  agentId?: string;
  agentRole: AgentRole;
  title: string;
  description?: string;
  phase?: string;
  phaseIndex?: number;
  status: TaskStatus;
  priority: TaskPriority;
  iteration: number;
  maxIterations: number;
  requiresReview: boolean;
  isParallel: boolean;
  feedback?: string;
  reviewFeedback?: string[];
  reviewScore?: number;
  orderIndex?: number;
  inputData?: Record<string, any>;
  outputData?: Record<string, any>;
  dependsOn: string[];
  startedAt?: Date;
  completedAt?: Date;
  dueDate?: Date;
  qualityScore?: number;
  reviewNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  IN_REVIEW = 'in_review',
  NEEDS_REVISION = 'needs_revision',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface PipelinePhase {
  name: string;
  roles: string[];
  parallel?: boolean;
  requiresReview?: boolean;
  maxIterations?: number;
}

export interface QualityReviewResult {
  passed: boolean;
  score: number;
  feedback: string[];
  suggestions: string[];
}
