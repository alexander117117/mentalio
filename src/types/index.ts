export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

// ─── Community ──────────────────────────────────────────────────────────────

export interface Community {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  banner?: string;
  membersCount: number;
  isPrivate: boolean;
  createdBy: string;
  isMember?: boolean;
  createdAt: string;
}

export interface Post {
  id: string;
  communityId: string;
  author: User;
  title?: string;
  content: string;
  type: 'forum' | 'feed';
  images?: string[];
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  author: User;
  content: string;
  likesCount: number;
  createdAt: string;
}

// ─── Classroom ───────────────────────────────────────────────────────────────

export interface Classroom {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  instructor: User;
  coursesCount: number;
  studentsCount: number;
  isPublic: boolean;
  isEnrolled?: boolean;
  createdAt: string;
}

export interface Course {
  id: string;
  classroomId: string;
  title: string;
  description: string;
  thumbnail?: string;
  lessonsCount: number;
  duration: number;
  createdAt: string;
}

export interface Material {
  id: string;
  title: string;
  type: 'pdf' | 'link' | 'file';
  url: string;
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  text: string;
  type: 'single' | 'multiple'; // single — radio, multiple — checkbox
  options: QuizOption[];
}

export interface Quiz {
  id: string;
  lessonId: string;
  questions: QuizQuestion[];
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  videoUrl?: string;       // YouTube/Vimeo ссылка или прямая ссылка
  videoLocalUri?: string;  // локальный файл с телефона
  duration: number;
  materials: Material[];
  quiz?: Quiz;
  order: number;
  isCompleted?: boolean;
  isDraft?: boolean;
}

// ─── Chat ────────────────────────────────────────────────────────────────────

export interface Chat {
  id: string;
  name: string;
  classroomId?: string;
  classroomThumbnail?: string;
  createdBy: string;
  createdAt: string;
  lastMessage?: {
    content: string;
    createdAt: string;
    userName: string;
  };
}

export interface ChatMessage {
  id: string;
  chatId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}

// ─── Live Stream ─────────────────────────────────────────────────────────────

export interface LiveStream {
  id: string;
  title: string;
  description?: string;
  host: User;
  streamUrl: string;
  thumbnail?: string;
  scheduledAt?: string;
  startedAt?: string;
  status: 'scheduled' | 'live' | 'ended';
  viewersCount?: number;
  platform: 'youtube' | 'zoom' | 'other';
  communityId?: string;
  createdAt: string;
}

// ─── Navigation ──────────────────────────────────────────────────────────────

export type RootStackParamList = {
  '(tabs)': undefined;
  'onboarding': undefined;
  'auth/login': undefined;
  'auth/register': undefined;
  'community/[id]': { id: string };
  'community/create': undefined;
  'classroom/[id]': { id: string };
  'classroom/[id]/manage': { id: string };
  'classroom/[id]/course/[courseId]/manage': { id: string; courseId: string };
  'classroom/[id]/lesson/create': { id: string; courseId: string };
  'classroom/create': undefined;
  'live/[id]': { id: string };
  'live/create': undefined;
};
