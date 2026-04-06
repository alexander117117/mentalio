import { View, Text, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../../src/constants/theme';

export default function NotificationsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Уведомления</Text>
      </View>
      <View style={styles.empty}>
        <Image
          source={require('../../assets/images/notifications_image.png')}
          style={styles.emptyIllustration}
          resizeMode="contain"
        />
        <Text style={styles.emptyTitle}>Нет уведомлений</Text>
        <Text style={styles.emptySubtitle}>Здесь будут появляться уведомления об активности</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: { ...Typography.h2, color: Colors.text.primary },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.xl },
  emptyIllustration: { width: 220, height: 220, marginBottom: 4 },
  emptyTitle: { ...Typography.h3, color: Colors.text.primary },
  emptySubtitle: { ...Typography.body, color: Colors.text.secondary, textAlign: 'center' },
});
