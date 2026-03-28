import api from './api';
import { Classroom, Course, Lesson } from '../types';

export const classroomService = {
  getAll: async (): Promise<Classroom[]> => {
    const res = await api.get('/classrooms');
    return res.data.data;
  },

  getById: async (id: string): Promise<Classroom> => {
    const res = await api.get(`/classrooms/${id}`);
    return res.data.data;
  },

  create: async (data: Partial<Classroom>): Promise<Classroom> => {
    const res = await api.post('/classrooms', data);
    return res.data.data;
  },

  enroll: async (id: string): Promise<void> => {
    await api.post(`/classrooms/${id}/enroll`);
  },

  getCourses: async (classroomId: string): Promise<Course[]> => {
    const res = await api.get(`/classrooms/${classroomId}/courses`);
    return res.data.data;
  },

  getCourseById: async (courseId: string): Promise<Course> => {
    const res = await api.get(`/courses/${courseId}`);
    return res.data.data;
  },

  getLessons: async (courseId: string): Promise<Lesson[]> => {
    const res = await api.get(`/courses/${courseId}/lessons`);
    return res.data.data;
  },

  getLessonById: async (lessonId: string): Promise<Lesson> => {
    const res = await api.get(`/lessons/${lessonId}`);
    return res.data.data;
  },

  completeLesson: async (lessonId: string): Promise<void> => {
    await api.post(`/lessons/${lessonId}/complete`);
  },
};
