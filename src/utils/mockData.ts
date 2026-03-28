import { Community, Post, Classroom, Course, Lesson, LiveStream, User } from '../types';

export const MOCK_USERS: User[] = [
  { id: '1', email: 'anna@example.com', name: 'Анна Иванова', avatar: 'https://i.pravatar.cc/150?img=1', createdAt: '2024-01-01' },
  { id: '2', email: 'peter@example.com', name: 'Пётр Смирнов', avatar: 'https://i.pravatar.cc/150?img=2', createdAt: '2024-01-02' },
  { id: '3', email: 'maria@example.com', name: 'Мария Козлова', avatar: 'https://i.pravatar.cc/150?img=5', createdAt: '2024-02-01' },
];

export const MOCK_COMMUNITIES: Community[] = [
  {
    id: '1',
    name: 'Frontend Разработка',
    description: 'Сообщество для фронтенд разработчиков. Обсуждаем React, Vue, Angular и всё связанное.',
    avatar: 'https://i.pravatar.cc/150?img=10',
    membersCount: 4200,
    isPrivate: false,
    createdBy: '1',
    isMember: true,
    createdAt: '2024-01-10',
  },
  {
    id: '2',
    name: 'UX/UI Дизайн',
    description: 'Делимся работами, обсуждаем тренды и учимся проектировать интерфейсы.',
    membersCount: 2800,
    isPrivate: false,
    createdBy: '2',
    createdAt: '2024-02-05',
  },
  {
    id: '3',
    name: 'Data Science Club',
    description: 'Машинное обучение, анализ данных и всё связанное с data science.',
    membersCount: 1500,
    isPrivate: true,
    createdBy: '3',
    createdAt: '2024-03-01',
  },
];

export const MOCK_POSTS: Post[] = [
  {
    id: '1',
    communityId: '1',
    author: MOCK_USERS[0],
    title: 'Как выбрать между React и Vue в 2025?',
    content: 'Хочу начать новый проект и не могу определиться с фреймворком. Какие ваши аргументы за и против каждого?',
    type: 'forum',
    likesCount: 24,
    commentsCount: 12,
    isLiked: false,
    createdAt: '2024-12-01T10:00:00Z',
  },
  {
    id: '2',
    communityId: '1',
    author: MOCK_USERS[1],
    content: 'Только что завершил свой первый fullstack проект на Next.js + Prisma + PostgreSQL. Это было увлекательно! Делюсь опытом ниже...',
    type: 'feed',
    images: ['https://picsum.photos/400/200?random=1'],
    likesCount: 48,
    commentsCount: 7,
    isLiked: true,
    createdAt: '2024-12-02T14:30:00Z',
  },
  {
    id: '3',
    communityId: '1',
    author: MOCK_USERS[2],
    title: 'Туториал: React Query v5 — всё что нужно знать',
    content: 'В этом посте разберём ключевые изменения в React Query v5 и как мигрировать с v4.',
    type: 'forum',
    likesCount: 67,
    commentsCount: 18,
    isLiked: false,
    createdAt: '2024-12-03T09:15:00Z',
  },
];

export const MOCK_CLASSROOMS: Classroom[] = [
  {
    id: '1',
    name: 'React Native с нуля до Pro',
    description: 'Полный курс по разработке мобильных приложений на React Native. От основ до публикации в App Store.',
    thumbnail: 'https://picsum.photos/400/200?random=10',
    instructor: MOCK_USERS[0],
    coursesCount: 5,
    studentsCount: 1240,
    isPublic: true,
    isEnrolled: true,
    createdAt: '2024-10-01',
  },
  {
    id: '2',
    name: 'UI/UX Дизайн в Figma',
    description: 'Научитесь проектировать красивые и удобные интерфейсы с нуля.',
    instructor: MOCK_USERS[1],
    coursesCount: 3,
    studentsCount: 860,
    isPublic: true,
    createdAt: '2024-11-01',
  },
  {
    id: '3',
    name: 'Python для Data Science',
    description: 'Pandas, NumPy, Scikit-learn — всё для старта в аналитике данных.',
    thumbnail: 'https://picsum.photos/400/200?random=12',
    instructor: MOCK_USERS[2],
    coursesCount: 7,
    studentsCount: 3200,
    isPublic: false,
    createdAt: '2024-09-15',
  },
];

export const MOCK_COURSES: Course[] = [
  {
    id: '1',
    classroomId: '1',
    title: 'Основы React Native',
    description: 'Знакомство с React Native, Expo, базовые компоненты.',
    lessonsCount: 8,
    duration: 240,
    createdAt: '2024-10-01',
  },
  {
    id: '2',
    classroomId: '1',
    title: 'Навигация и маршрутизация',
    description: 'React Navigation, Expo Router, вложенные навигаторы.',
    lessonsCount: 5,
    duration: 150,
    createdAt: '2024-10-15',
  },
];

export const MOCK_LESSONS: Lesson[] = [
  {
    id: '1',
    courseId: '1',
    title: 'Введение в React Native',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    duration: 1800,
    order: 1,
    isCompleted: true,
    materials: [
      { id: '1', title: 'Презентация урока', type: 'pdf', url: 'https://example.com/slides.pdf' },
    ],
  },
  {
    id: '2',
    courseId: '1',
    title: 'Настройка рабочего окружения',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    duration: 1200,
    order: 2,
    isCompleted: false,
    materials: [
      { id: '2', title: 'Ссылки на инструменты', type: 'link', url: 'https://expo.dev' },
      { id: '3', title: 'Конфиг файл', type: 'file', url: 'https://example.com/config.json' },
    ],
  },
  {
    id: '3',
    courseId: '1',
    title: 'Первый компонент',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    duration: 2400,
    order: 3,
    isCompleted: false,
    materials: [],
  },
];

export const MOCK_STREAMS: LiveStream[] = [
  {
    id: '1',
    title: 'Live: Code Review — разбираем ваш код',
    description: 'Смотрим реальный код участников и улучшаем вместе.',
    host: MOCK_USERS[0],
    streamUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://picsum.photos/400/200?random=20',
    status: 'live',
    viewersCount: 234,
    platform: 'youtube',
    createdAt: '2024-12-04T12:00:00Z',
  },
  {
    id: '2',
    title: 'Введение в TypeScript 5.0 — новые возможности',
    host: MOCK_USERS[1],
    streamUrl: 'https://zoom.us/j/example',
    thumbnail: 'https://picsum.photos/400/200?random=21',
    scheduledAt: '2024-12-10T18:00:00Z',
    status: 'scheduled',
    platform: 'zoom',
    createdAt: '2024-12-03T10:00:00Z',
  },
  {
    id: '3',
    title: 'Запись: Figma Auto Layout — мастер-класс',
    host: MOCK_USERS[2],
    streamUrl: 'https://www.youtube.com/watch?v=example',
    thumbnail: 'https://picsum.photos/400/200?random=22',
    status: 'ended',
    platform: 'youtube',
    createdAt: '2024-11-20T15:00:00Z',
  },
];
