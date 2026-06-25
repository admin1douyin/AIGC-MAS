export interface VideoScript {
  id: string;
  projectId: string;
  title: string;
  scenes: VideoScene[];
  totalDuration: number;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface VideoScene {
  id: string;
  sceneNumber: number;
  title?: string;
  description: string;
  duration: number;
  dialogue?: string;
  voiceover?: string;
  visualDescription?: string;
  audioDescription?: string;
  cameraAngle?: string;
  location?: string;
  characters?: string[];
  bgm?: string;
  transitions?: string;
}

export interface Storyboard {
  id: string;
  projectId: string;
  scriptId: string;
  frames: StoryboardFrame[];
  createdAt: Date;
}

export interface StoryboardFrame {
  id: string;
  sceneId: string;
  frameNumber: number;
  description: string;
  imageUrl?: string;
  duration: number;
  notes?: string;
}

export interface VideoAsset {
  id: string;
  projectId: string;
  type: 'clip' | 'image' | 'audio' | 'music' | 'voiceover' | 'subtitle';
  name: string;
  url: string;
  duration?: number;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface FinalVideo {
  id: string;
  projectId: string;
  title: string;
  url: string;
  thumbnailUrl?: string;
  duration: number;
  resolution: string;
  format: string;
  size: number;
  version: number;
  createdAt: Date;
}
