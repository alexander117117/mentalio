import { useQuery } from '@tanstack/react-query';
import { classroomService } from '../services/classroomService';

export function useClassrooms() {
  return useQuery({
    queryKey: ['classrooms'],
    queryFn: classroomService.getAll,
  });
}

export function useClassroom(id: string) {
  return useQuery({
    queryKey: ['classroom', id],
    queryFn: () => classroomService.getById(id),
    enabled: !!id,
  });
}

export function useCourses(classroomId: string) {
  return useQuery({
    queryKey: ['courses', classroomId],
    queryFn: () => classroomService.getCourses(classroomId),
    enabled: !!classroomId,
  });
}

export function useLessons(courseId: string) {
  return useQuery({
    queryKey: ['lessons', courseId],
    queryFn: () => classroomService.getLessons(courseId),
    enabled: !!courseId,
  });
}

export function useLesson(lessonId: string) {
  return useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: () => classroomService.getLessonById(lessonId),
    enabled: !!lessonId,
  });
}
