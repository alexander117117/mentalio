import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Classroom, Course, Lesson, Material, Quiz } from '../types';

interface ClassroomStore {
  classrooms: Classroom[];
  courses: Course[];
  lessons: Lesson[];
  isLoading: boolean;

  fetchClassrooms: () => Promise<void>;
  fetchCourses: (classroomId: string) => Promise<void>;
  fetchLessons: (courseId: string) => Promise<void>;

  addClassroom: (data: { name: string; description: string; thumbnail?: string; isPublic: boolean }) => Promise<string>;
  addCourse: (data: { classroomId: string; title: string; description: string }) => Promise<string>;
  addLesson: (data: {
    courseId: string;
    title: string;
    videoUrl?: string;
    duration: number;
    materials: Material[];
    quiz?: Quiz;
    isDraft?: boolean;
  }) => Promise<string>;
  updateLesson: (lessonId: string, data: Partial<Lesson>) => Promise<void>;
  markLessonCompleted: (lessonId: string) => Promise<void>;
  enrollClassroom: (classroomId: string) => Promise<void>;
}

function mapClassroom(row: any, userId?: string): Classroom {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    thumbnail: row.thumbnail_url,
    instructor: {
      id: row.profiles?.id ?? row.instructor_id,
      name: row.profiles?.name ?? '',
      email: '',
      avatar: row.profiles?.avatar_url,
      createdAt: row.profiles?.created_at ?? '',
    },
    coursesCount: row.courses_count ?? 0,
    studentsCount: row.students_count ?? 0,
    isPublic: row.is_public,
    isEnrolled: row.classroom_enrollments?.some((e: any) => e.user_id === userId) ?? false,
    createdAt: row.created_at,
  };
}

function mapCourse(row: any): Course {
  return {
    id: row.id,
    classroomId: row.classroom_id,
    title: row.title,
    description: row.description ?? '',
    thumbnail: row.thumbnail_url,
    lessonsCount: row.lessons_count ?? 0,
    duration: row.duration ?? 0,
    createdAt: row.created_at,
  };
}

function mapLesson(row: any): Lesson {
  return {
    id: row.id,
    courseId: row.course_id,
    title: row.title,
    videoUrl: row.video_url,
    duration: row.duration ?? 0,
    materials: (row.materials ?? []).map((m: any) => ({
      id: m.id, title: m.title, type: m.type, url: m.url,
    })),
    quiz: row.quiz_questions?.length > 0 ? {
      id: row.id,
      lessonId: row.id,
      questions: row.quiz_questions.map((q: any) => ({
        id: q.id,
        text: q.question_text,
        type: q.question_type,
        options: (q.quiz_options ?? []).map((o: any) => ({
          id: o.id, text: o.option_text, isCorrect: o.is_correct,
        })),
      })),
    } : undefined,
    order: row.lesson_order ?? 0,
    isCompleted: row.lesson_completions?.length > 0,
    isDraft: row.is_draft ?? false,
  };
}

export const useClassroomStore = create<ClassroomStore>((set, get) => ({
  classrooms: [],
  courses: [],
  lessons: [],
  isLoading: false,

  fetchClassrooms: async () => {
    set({ isLoading: true });
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('classrooms')
      .select(`*, profiles(*), classroom_enrollments(user_id)`)
      .order('created_at', { ascending: false });
    if (!error && data) {
      set({ classrooms: data.map((r) => mapClassroom(r, user?.id)) });
    }
    set({ isLoading: false });
  },

  fetchCourses: async (classroomId) => {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('classroom_id', classroomId)
      .order('created_at');
    if (!error && data) {
      const existing = get().courses.filter((c) => c.classroomId !== classroomId);
      set({ courses: [...existing, ...data.map(mapCourse)] });
    }
  },

  fetchLessons: async (courseId) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('lessons')
      .select(`*, materials(*), quiz_questions(*, quiz_options(*)), lesson_completions(user_id)`)
      .eq('course_id', courseId)
      .order('lesson_order');
    if (!error && data) {
      const filtered = data.filter((l) =>
        !l.is_draft || l.lesson_completions?.some((c: any) => c.user_id === user?.id)
      );
      const existing = get().lessons.filter((l) => l.courseId !== courseId);
      set({ lessons: [...existing, ...filtered.map(mapLesson)] });
    }
  },

  addClassroom: async (data) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('unauthenticated');
    const { data: row, error } = await supabase
      .from('classrooms')
      .insert({
        name: data.name,
        description: data.description,
        thumbnail_url: data.thumbnail,
        is_public: data.isPublic,
        instructor_id: user.id,
      })
      .select(`*, profiles(*)`)
      .single();
    if (error) throw new Error(error.message);
    const classroom = mapClassroom(row, user.id);
    set({ classrooms: [{ ...classroom, isEnrolled: true }, ...get().classrooms] });
    return row.id;
  },

  addCourse: async (data) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('unauthenticated');
    const { data: row, error } = await supabase
      .from('courses')
      .insert({ classroom_id: data.classroomId, title: data.title, description: data.description })
      .select()
      .single();
    if (error) throw new Error(error.message);
    set({
      courses: [...get().courses, mapCourse(row)],
      classrooms: get().classrooms.map((c) =>
        c.id === data.classroomId ? { ...c, coursesCount: c.coursesCount + 1 } : c
      ),
    });
    return row.id;
  },

  addLesson: async (data) => {
    const courseId = data.courseId;
    const order = get().lessons.filter((l) => l.courseId === courseId).length + 1;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('unauthenticated');

    const { data: lessonRow, error } = await supabase
      .from('lessons')
      .insert({
        course_id: courseId,
        title: data.title,
        video_url: data.videoUrl,
        duration: data.duration,
        lesson_order: order,
        is_draft: data.isDraft ?? false,
      })
      .select()
      .single();
    if (error || !lessonRow) throw new Error(error?.message ?? 'Failed to create lesson');

    if (data.materials.length > 0) {
      await supabase.from('materials').insert(
        data.materials.map((m) => ({ lesson_id: lessonRow.id, title: m.title, type: m.type, url: m.url }))
      );
    }

    if (data.quiz) {
      for (const q of data.quiz.questions) {
        const { data: qRow } = await supabase
          .from('quiz_questions')
          .insert({ lesson_id: lessonRow.id, question_text: q.text, question_type: q.type, question_order: 0 })
          .select()
          .single();
        if (qRow) {
          await supabase.from('quiz_options').insert(
            q.options.map((o) => ({ question_id: qRow.id, option_text: o.text, is_correct: o.isCorrect }))
          );
        }
      }
    }

    await get().fetchLessons(courseId);
    await supabase.from('courses').update({ lessons_count: order }).eq('id', courseId);
    return lessonRow.id;
  },

  updateLesson: async (lessonId, data) => {
    await supabase.from('lessons').update({
      title: data.title,
      video_url: data.videoUrl,
      is_draft: data.isDraft,
    }).eq('id', lessonId);
    set({
      lessons: get().lessons.map((l) => (l.id === lessonId ? { ...l, ...data } : l)),
    });
  },

  markLessonCompleted: async (lessonId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('lesson_completions').upsert({ lesson_id: lessonId, user_id: user.id });
    set({
      lessons: get().lessons.map((l) => (l.id === lessonId ? { ...l, isCompleted: true } : l)),
    });
  },

  enrollClassroom: async (classroomId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('classroom_enrollments').insert({ classroom_id: classroomId, user_id: user.id });
    set({
      classrooms: get().classrooms.map((c) =>
        c.id === classroomId ? { ...c, isEnrolled: true, studentsCount: c.studentsCount + 1 } : c
      ),
    });
  },
}));
