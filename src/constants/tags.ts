export interface CourseTag {
  id: string;
  label: string;
  emoji: string;
  color: string;      // text + icon
  background: string; // pill background
}

export const COURSE_TAGS: CourseTag[] = [
  { id: 'medicine',    label: 'Медицина',     emoji: '🩺', color: '#EF4444', background: '#FEF2F2' },
  { id: 'sport',       label: 'Спорт',        emoji: '🏋️', color: '#F97316', background: '#FFF7ED' },
  { id: 'it',          label: 'IT',           emoji: '💻', color: '#3B82F6', background: '#EFF6FF' },
  { id: 'business',    label: 'Бизнес',       emoji: '💼', color: '#8B5CF6', background: '#F5F3FF' },
  { id: 'design',      label: 'Дизайн',       emoji: '🎨', color: '#EC4899', background: '#FDF2F8' },
  { id: 'languages',   label: 'Языки',        emoji: '🌍', color: '#06B6D4', background: '#ECFEFF' },
  { id: 'science',     label: 'Наука',        emoji: '🔬', color: '#10B981', background: '#F0FDF4' },
  { id: 'math',        label: 'Математика',   emoji: '📐', color: '#6366F1', background: '#EEF2FF' },
  { id: 'music',       label: 'Музыка',       emoji: '🎵', color: '#F59E0B', background: '#FFFBEB' },
  { id: 'cooking',     label: 'Кулинария',    emoji: '🍳', color: '#EF4444', background: '#FEF2F2' },
  { id: 'psychology',  label: 'Психология',   emoji: '🧠', color: '#8B5CF6', background: '#F5F3FF' },
  { id: 'finance',     label: 'Финансы',      emoji: '💰', color: '#16A34A', background: '#F0FDF4' },
  { id: 'marketing',   label: 'Маркетинг',    emoji: '📊', color: '#0EA5E9', background: '#F0F9FF' },
  { id: 'art',         label: 'Искусство',    emoji: '🖼️', color: '#EC4899', background: '#FDF2F8' },
  { id: 'law',         label: 'Право',        emoji: '⚖️', color: '#64748B', background: '#F8FAFC' },
  { id: 'other',       label: 'Другое',       emoji: '✨', color: '#6B7280', background: '#F9FAFB' },
];

export function getTag(id: string): CourseTag | undefined {
  return COURSE_TAGS.find((t) => t.id === id);
}
