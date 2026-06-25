export enum AgentRole {
  PROJECT_MANAGER = 'project_manager',
  SCRIPT_WRITER = 'script_writer',
  STORYBOARD_ARTIST = 'storyboard_artist',
  VOICE_ACTOR = 'voice_actor',
  VIDEO_EDITOR = 'video_editor',
  MARKETING_STRATEGIST = 'marketing_strategist',
  BRAND_ANALYST = 'brand_analyst',
  CULTURE_RESEARCHER = 'culture_researcher',
  MUSIC_COMPOSER = 'music_composer',
  QUALITY_INSPECTOR = 'quality_inspector',
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
  currentTaskId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentMessage {
  id: string;
  fromAgentId: string;
  toAgentId?: string;
  projectId: string;
  taskId?: string;
  content: string;
  messageType: 'task' | 'result' | 'query' | 'feedback' | 'notification';
  timestamp: Date;
  read: boolean;
}

export interface AgentTask {
  id: string;
  projectId: string;
  agentId: string;
  agentRole: AgentRole;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  inputData?: Record<string, any>;
  outputData?: Record<string, any>;
  dependsOn: string[];
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}
