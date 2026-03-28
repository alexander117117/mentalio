export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
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

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  videoUrl: string;
  duration: number;
  materials: Material[];
  order: number;
  isCompleted?: boolean;
}

export interface Material {
  id: string;
  title: string;
  type: 'pdf' | 'link' | 'file';
  url: string;
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
  'classroom/create': undefined;
  'live/[id]': { id: string };
  'live/create': undefined;
};
