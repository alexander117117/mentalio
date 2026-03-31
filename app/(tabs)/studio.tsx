import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../src/constants/theme';
import { useClassroomStore } from '../../src/store/classroomStore';
import { useAuthStore } from '../../src/store/authStore';
import { Classroom } from '../../src/types';
import { tapLight } from '../../src/utils/haptics';

function ClassroomCard({ classroom }: { classroom: Classroom }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardThumb}>
        {classroom.thumbnail
          ? <Image source={{ uri: classroom.thumbnail }} style={styles.cardThumbImg} />
          : <View style={styles.cardThumbPlaceholder}>
              <Ionicons name="school-outline" size={28} color={Colors.text.disabled} />
            </View>
        }
        <View style={styles.visibilityBadge}>
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
            <Text style={styles.statText}>{classroom.coursesCount} курсов</Text>
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
          { text: 'Войти', onPress: () => router.push('/login' as any) },
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

      {/* ── Top zone: plain background ── */}
      <View style={styles.topZone}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.topSub}>Создание контента</Text>
            <Text style={styles.topTitle}>Мои курсы</Text>
          </View>
          <TouchableOpacity style={styles.createBtn} activeOpacity={0.8} onPress={handleCreate}>
            <Ionicons name="add" size={18} color={Colors.text.inverse} />
            <Text style={styles.createBtnText}>Создать</Text>
          </TouchableOpacity>
        </View>

        {/* Stats strip — только когда есть курсы */}
        {myClassrooms.length > 0 && (
          <View style={styles.statsRow}>
            <View style={styles.statChip}>
              <Text style={styles.statChipValue}>{myClassrooms.length}</Text>
              <Text style={styles.statChipLabel}>Курсов</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statChip}>
              <Text style={styles.statChipValue}>
                {myClassrooms.reduce((s, c) => s + c.studentsCount, 0)}
              </Text>
              <Text style={styles.statChipLabel}>Студентов</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statChip}>
              <Text style={styles.statChipValue}>
                {myClassrooms.reduce((s, c) => s + c.coursesCount, 0)}
              </Text>
              <Text style={styles.statChipLabel}>Разделов</Text>
            </View>
          </View>
        )}
      </View>

      {/* ── White card sheet ── */}
      <View style={styles.sheet}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>
          {myClassrooms.length === 0 ? (
            <View style={styles.empty}>
              <Image
                source={require('../../assets/images/empty-courses.png')}
                style={styles.emptyIllustration}
                resizeMode="contain"
              />
              <Text style={styles.emptyTitle}>Нет курсов</Text>
              <Text style={styles.emptySubtitle}>
                Создайте первый курс и начните обучать студентов
              </Text>
              <TouchableOpacity style={styles.emptyBtn} activeOpacity={0.8} onPress={handleCreate}>
                <Ionicons name="add" size={16} color={Colors.text.inverse} />
                <Text style={styles.emptyBtnText}>Создать курс</Text>
              </TouchableOpacity>
            </View>
          ) : (
            myClassrooms.map((c) => <ClassroomCard key={c.id} classroom={c} />)
          )}
          <View style={{ height: 32 }} />
        </ScrollView>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // Top zone
  topZone: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: 20,
    gap: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topSub: {
    fontSize: 11,
    color: Colors.text.disabled,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  topTitle: { fontSize: 26, fontWeight: '800', color: Colors.text.primary, marginTop: 2 },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
  },
  createBtnText: { fontSize: 14, fontWeight: '600', color: Colors.text.inverse },

  // Stats strip
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },
  statChip: { flex: 1, alignItems: 'center', gap: 2 },
  statChipValue: { fontSize: 20, fontWeight: '700', color: Colors.text.primary },
  statChipLabel: { fontSize: 11, color: Colors.text.secondary },
  statDivider: { width: 1, height: 32, backgroundColor: Colors.border },

  // White card sheet
  sheet: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    ...Shadows.sm,
  },
  sheetContent: {
    padding: Spacing.md,
    gap: Spacing.md,
  },

  // Classroom card
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  cardThumb: { height: 140, backgroundColor: Colors.surfaceSecondary, position: 'relative' },
  cardThumbImg: { width: '100%', height: '100%' },
  cardThumbPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  visibilityBadge: {
    position: 'absolute',
    top: 10, right: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
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
  empty: {
    alignItems: 'center',
    paddingTop: 32,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  emptyIllustration: { width: 220, height: 220, marginBottom: 4 },
  emptyTitle: { ...Typography.h3, color: Colors.text.primary },
  emptySubtitle: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 260,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 13,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  emptyBtnText: { fontSize: 15, fontWeight: '700', color: Colors.text.inverse },
});
