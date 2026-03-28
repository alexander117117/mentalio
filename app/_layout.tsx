import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAuthStore } from '../src/store/authStore';
import { useClassroomStore } from '../src/store/classroomStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
    },
  },
});

function AppInitializer() {
  const initialize = useAuthStore((s) => s.initialize);
  const fetchClassrooms = useClassroomStore((s) => s.fetchClassrooms);

  useEffect(() => {
    initialize();
    fetchClassrooms();
  }, []);

  return null;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <AppInitializer />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="index" />
            <Stack.Screen name="community/[id]" />
            <Stack.Screen name="community/create" />
            <Stack.Screen name="classroom/[id]" />
            <Stack.Screen name="classroom/[id]/manage" />
            <Stack.Screen name="classroom/[id]/course/[courseId]/manage" />
            <Stack.Screen name="classroom/[id]/lesson/create" />
            <Stack.Screen name="classroom/create" />
            <Stack.Screen name="live/[id]" />
            <Stack.Screen name="live/create" />
            <Stack.Screen name="auth/login" />
            <Stack.Screen name="auth/register" />
          </Stack>
          <StatusBar style="auto" />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
