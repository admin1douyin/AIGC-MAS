export enum ProjectType {
  SHORT_DRAMA = 'short_drama',
  CORPORATE_VIDEO = 'corporate_video',
  TOURISM_PROMO = 'tourism_promo',
}

export enum ProjectStatus {
  DRAFT = 'draft',
  PLANNING = 'planning',
  IN_PRODUCTION = 'in_production',
  REVIEW = 'review',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface Project {
  id: string;
  name: string;
  type: ProjectType;
  status: ProjectStatus;
  description: string;
  brief: ProjectBrief;
  progress: number;
  ownerId: string;
  teamMembers: string[];
  tags: string[];
  estimatedDuration?: number;
  actualDuration?: number;
  budget?: number;
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export interface ProjectBrief {
  title?: string;
  targetAudience?: string;
  duration?: number;
  style?: string;
  objectives?: string[];
  keyMessages?: string[];
  requirements?: string;
  references?: string[];
}

export interface ProjectStats {
  totalProjects: number;
  inProgress: number;
  completed: number;
  byType: Record<ProjectType, number>;
}
