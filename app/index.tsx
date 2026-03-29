import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import { Colors } from '../src/constants/theme';

export default function Index() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    if (!isLoading) {
      router.replace(isAuthenticated ? '/(tabs)' : '/login' as any);
    }
  }, [isLoading, isAuthenticated]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace('/login' as any);
    }, 5000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surface }}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}
