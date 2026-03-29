import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
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
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const segments = useSegments();
  const didRedirect = useRef(false);

  useEffect(() => {
    initialize();

    // Safety timeout: if initialize() hangs, unblock after 3s
    const timeout = setTimeout(() => {
      useAuthStore.setState({ isLoading: false });
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (didRedirect.current) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';
    if (!isAuthenticated && !inAuthGroup && !inOnboarding) {
      didRedirect.current = true;
      router.replace('/login' as any);
    } else if (isAuthenticated && inAuthGroup) {
      didRedirect.current = true;
      router.replace('/(tabs)' as any);
      fetchClassrooms();
    } else if (isAuthenticated) {
      fetchClassrooms();
    }
  }, [isAuthenticated, isLoading]);

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
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="profile/edit" />
          </Stack>
          <StatusBar style="auto" />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
