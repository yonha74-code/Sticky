
export type NoteColor = 'yellow' | 'blue' | 'green' | 'pink' | 'purple' | 'orange';
export type NoteType = 'text' | 'sketch';

export interface Note {
  id: string;
  type: NoteType;
  content?: string;
  sketchData?: string;
  color: NoteColor;
  textColor?: string;
  opacity?: number; // 0.2 ~ 1.0
  createdAt: number;
  expiresAt: number | null; // null이면 만료되지 않음
  position?: { x: number; y: number };
}

export const COLOR_MAP: Record<NoteColor, { bg: string; accent: string; text: string; light: string }> = {
  yellow: { bg: 'bg-yellow-50', accent: 'bg-yellow-400', text: 'text-yellow-900', light: 'bg-yellow-100' },
  blue: { bg: 'bg-blue-50', accent: 'bg-blue-400', text: 'text-blue-900', light: 'bg-blue-100' },
  green: { bg: 'bg-emerald-50', accent: 'bg-emerald-400', text: 'text-emerald-900', light: 'bg-emerald-100' },
  pink: { bg: 'bg-pink-50', accent: 'bg-pink-400', text: 'text-pink-900', light: 'bg-pink-100' },
  purple: { bg: 'bg-purple-50', accent: 'bg-purple-400', text: 'text-purple-900', light: 'bg-purple-100' },
  orange: { bg: 'bg-orange-50', accent: 'bg-orange-400', text: 'text-orange-900', light: 'bg-orange-100' },
};

export const SKETCH_COLORS = ['#1e293b', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#a855f7'];
export const TEXT_COLORS = ['#1e293b', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#a855f7', '#db2777'];
