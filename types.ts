
export type NoteColor = 'yellow' | 'blue' | 'green' | 'pink' | 'purple' | 'orange' | 'sunset' | 'ocean' | 'forest' | 'berry' | 'magic';
export type NoteType = 'text' | 'sketch';

export interface Note {
  id: string;
  type: NoteType;
  content?: string;
  sketchData?: string;
  sketchColor?: string;
  color: NoteColor;
  emoji?: string;
  createdAt: number;
  expiresAt: number;
  zIndex: number;
  position: { x: number; y: number };
}

export const COLOR_MAP: Record<NoteColor, { bg: string; border: string; accent: string; isGradient?: boolean }> = {
  yellow: { bg: 'bg-yellow-100', border: 'border-yellow-200', accent: 'bg-yellow-400' },
  blue: { bg: 'bg-blue-100', border: 'border-blue-200', accent: 'bg-blue-400' },
  green: { bg: 'bg-emerald-100', border: 'border-emerald-200', accent: 'bg-emerald-400' },
  pink: { bg: 'bg-pink-100', border: 'border-pink-200', accent: 'bg-pink-400' },
  purple: { bg: 'bg-purple-100', border: 'border-purple-200', accent: 'bg-purple-400' },
  orange: { bg: 'bg-orange-100', border: 'border-orange-200', accent: 'bg-orange-400' },
  sunset: { bg: 'bg-gradient-to-br from-orange-200 to-rose-200', border: 'border-orange-300', accent: 'bg-rose-400', isGradient: true },
  ocean: { bg: 'bg-gradient-to-br from-blue-200 to-cyan-200', border: 'border-blue-300', accent: 'bg-cyan-500', isGradient: true },
  forest: { bg: 'bg-gradient-to-br from-emerald-200 to-teal-200', border: 'border-emerald-300', accent: 'bg-teal-500', isGradient: true },
  berry: { bg: 'bg-gradient-to-br from-purple-200 to-pink-200', border: 'border-purple-300', accent: 'bg-pink-400', isGradient: true },
  magic: { bg: 'bg-gradient-to-br from-indigo-200 to-purple-200', border: 'border-indigo-300', accent: 'bg-purple-500', isGradient: true },
};

export const EMOJIS = ['📌', '💡', '🔥', '✅', '❤️', '⭐', '📅', '📝', '🎨', '🚀', '🌈', '🍕'];

export const SKETCH_COLORS = [
  { name: 'Slate', value: '#1e293b' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Purple', value: '#a855f7' },
];
