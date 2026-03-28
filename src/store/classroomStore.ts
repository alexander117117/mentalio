import { create } from 'zustand';
import { Classroom, Course, Lesson } from '../types';

interface ClassroomStore {
  classrooms: Classroom[];
  currentClassroom: Classroom | null;
  currentCourse: Course | null;
  currentLesson: Lesson | null;
  setClassrooms: (classrooms: Classroom[]) => void;
  setCurrentClassroom: (classroom: Classroom) => void;
  setCurrentCourse: (course: Course) => void;
  setCurrentLesson: (lesson: Lesson) => void;
  markLessonCompleted: (lessonId: string) => void;
}

export const useClassroomStore = create<ClassroomStore>((set) => ({
  classrooms: [],
  currentClassroom: null,
  currentCourse: null,
  currentLesson: null,
  setClassrooms: (classrooms) => set({ classrooms }),
  setCurrentClassroom: (classroom) => set({ currentClassroom: classroom }),
  setCurrentCourse: (course) => set({ currentCourse: course }),
  setCurrentLesson: (lesson) => set({ currentLesson: lesson }),
  markLessonCompleted: (lessonId) =>
    set((state) => ({
      currentLesson:
        state.currentLesson?.id === lessonId
          ? { ...state.currentLesson, isCompleted: true }
          : state.currentLesson,
    })),
}));
