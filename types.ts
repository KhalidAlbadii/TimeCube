
export interface CubeFace {
  id: number;
  label: string;
  color: string;
  icon: string;
}

export interface Session {
  id: string;
  faceId: number;
  startTime: number;
  endTime: number | null;
  duration: number; // in seconds
}

export enum AppTab {
  DASHBOARD = 'dashboard',
  ANALYTICS = 'analytics',
  SETUP = 'setup'
}

export const DEFAULT_FACES: CubeFace[] = [
  { id: 1, label: 'Stop', color: '#64748b', icon: 'fa-stop-circle' },
  { id: 2, label: 'Deep Work', color: '#3b82f6', icon: 'fa-brain' },
  { id: 3, label: 'Meetings', color: '#10b981', icon: 'fa-users' },
  { id: 4, label: 'Learning', color: '#f59e0b', icon: 'fa-book' },
  { id: 5, label: 'Strategy', color: '#ef4444', icon: 'fa-calendar-check' },
  { id: 6, label: 'Email', color: '#8b5cf6', icon: 'fa-envelope' }
];

export const STORAGE_KEYS = {
  FACES: 'tc_faces',
  SESSIONS: 'tc_sessions'
};
