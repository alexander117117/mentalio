import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Spacing, Typography, BorderRadius } from '../../src/constants/theme';
import { useClassroomStore } from '../../src/store/classroomStore';
import { useAuthStore } from '../../src/store/authStore';
import { Classroom } from '../../src/types';
import { tapLight } from '../../src/utils/haptics';

function ClassroomCard({ classroom }: { classroom: Classroom }) {
  const courses = useClassroomStore((s) => s.courses.filter((c) => c.classroomId === classroom.id));

  return (
    <View style={styles.card}>
      <View style={styles.cardThumb}>
        {classroom.thumbnail
          ? <Image source={{ uri: classroom.thumbnail }} style={styles.cardThumbImg} />
          : <View style={styles.cardThumbPlaceholder}>
              <Ionicons name="school-outline" size={28} color={Colors.text.disabled} />
            </View>
        }
        <View style={[styles.visibilityBadge, classroom.isPublic ? styles.badgePublic : styles.badgePrivate]}>
          <Text style={styles.visibilityText}>{classroom.isPublic ? 'Публичный' : 'Приватный'}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.cardName} numberOfLines={2}>{classroom.name}</Text>
        <View style={styles.cardStats}>
          <View style={styles.stat}>
            <Ionicons name="people-outline" size={12} color={Colors.text.secondary} />
            <Text style={styles.statText}>{classroom.studentsCount}</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="book-outline" size={12} color={Colors.text.secondary} />
            <Text style={styles.statText}>{courses.length} курсов</Text>
          </View>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.manageBtn}
            activeOpacity={0.7}
            onPress={() => { tapLight(); router.push(`/classroom/${classroom.id}/manage` as any); }}
          >
            <Ionicons name="settings-outline" size={14} color={Colors.text.primary} />
            <Text style={styles.manageBtnText}>Управлять</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.previewBtn}
            activeOpacity={0.7}
            onPress={() => { tapLight(); router.push(`/classroom/${classroom.id}` as any); }}
          >
            <Ionicons name="eye-outline" size={14} color={Colors.text.secondary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function StudioScreen() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const classrooms = useClassroomStore((s) => s.classrooms);
  const myClassrooms = classrooms.filter((c) => c.instructor?.id === user?.id);

  const handleCreate = () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Требуется аккаунт',
        'Зарегистрируйтесь или войдите в аккаунт',
        [
          { text: 'Войти', onPress: () => router.push('/auth/login' as any) },
          { text: 'Отмена', style: 'cancel' },
        ]
      );
      return;
    }
    tapLight();
    router.push('/classroom/create' as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>Создание контента</Text>
          <Text style={styles.headerTitle}>Мои курсы</Text>
        </View>
        <TouchableOpacity
          style={styles.createBtn}
          activeOpacity={0.8}
          onPress={handleCreate}
        >
          <Ionicons name="add" size={20} color={Colors.text.inverse} />
          <Text style={styles.createBtnText}>Создать</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {myClassrooms.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="school-outline" size={40} color={Colors.text.disabled} />
            </View>
            <Text style={styles.emptyTitle}>Нет курсов</Text>
            <Text style={styles.emptySubtitle}>Создайте первый курс и начните обучать студентов</Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              activeOpacity={0.8}
              onPress={handleCreate}
            >
              <Ionicons name="add" size={16} color={Colors.text.inverse} />
              <Text style={styles.emptyBtnText}>Создать курс</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statCardValue}>{myClassrooms.length}</Text>
                <Text style={styles.statCardLabel}>Курсов</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statCardValue}>
                  {myClassrooms.reduce((sum, c) => sum + c.studentsCount, 0)}
                </Text>
                <Text style={styles.statCardLabel}>Студентов</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statCardValue}>
                  {myClassrooms.reduce((sum, c) => sum + c.coursesCount, 0)}
                </Text>
                <Text style={styles.statCardLabel}>Разделов</Text>
              </View>
            </View>

            {myClassrooms.map((c) => (
              <ClassroomCard key={c.id} classroom={c} />
            ))}
          </>
        )}
        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerSub: { fontSize: 11, color: Colors.text.disabled, textTransform: 'uppercase', letterSpacing: 0.5 },
  headerTitle: { ...Typography.h2, color: Colors.text.primary, marginTop: 2 },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 9,
    borderRadius: BorderRadius.md,
  },
  createBtnText: { fontSize: 14, fontWeight: '600', color: Colors.text.inverse },

  content: { padding: Spacing.md, gap: Spacing.md },

  // Stats row
  statsRow: { flexDirection: 'row', gap: Spacing.sm },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 2,
  },
  statCardValue: { ...Typography.h2, color: Colors.text.primary },
  statCardLabel: { fontSize: 11, color: Colors.text.secondary },

  // Classroom card
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  cardThumb: { height: 140, backgroundColor: Colors.surfaceSecondary, position: 'relative' },
  cardThumbImg: { width: '100%', height: '100%' },
  cardThumbPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  visibilityBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  badgePublic: { backgroundColor: 'rgba(0,0,0,0.55)' },
  badgePrivate: { backgroundColor: 'rgba(0,0,0,0.55)' },
  visibilityText: { fontSize: 11, color: '#fff', fontWeight: '500' },

  cardBody: { padding: Spacing.md, gap: Spacing.sm },
  cardName: { ...Typography.body, fontWeight: '600', color: Colors.text.primary, lineHeight: 20 },
  cardStats: { flexDirection: 'row', gap: Spacing.md },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: 12, color: Colors.text.secondary },

  cardActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: 4 },
  manageBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  manageBtnText: { fontSize: 13, fontWeight: '500', color: Colors.text.primary },
  previewBtn: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Empty state
  empty: { alignItems: 'center', paddingTop: 60, gap: Spacing.md },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { ...Typography.h3, color: Colors.text.primary },
  emptySubtitle: { ...Typography.body, color: Colors.text.secondary, textAlign: 'center', maxWidth: 260 },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  emptyBtnText: { fontSize: 14, fontWeight: '600', color: Colors.text.inverse },
});
