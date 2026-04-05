import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Switch, Image, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { X, Camera, Image as ImageIcon, CheckCircle, Globe, Lock, ChatsCircle } from 'phosphor-react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Spacing, BorderRadius, Shadows } from '../../src/constants/theme';
import { COURSE_TAGS } from '../../src/constants/tags';
import Input from '../../src/components/ui/Input';
import Button from '../../src/components/ui/Button';
import { useClassroomStore } from '../../src/store/classroomStore';
import { useAuthStore } from '../../src/store/authStore';
import { useChatStore } from '../../src/store/chatStore';
import { tapMedium, tapLight, notifySuccess } from '../../src/utils/haptics';

export default function CreateClassroomScreen() {
  const addClassroom = useClassroomStore((s) => s.addClassroom);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const createChat = useChatStore((s) => s.createChat);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState<string | undefined>();
  const [isPublic, setIsPublic] = useState(true);
  const [withChat, setWithChat] = useState(true);
  const [chatName, setChatName] = useState('');
  const [chatDesc, setChatDesc] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleTag = (id: string) => {
    tapLight();
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Нет доступа', 'Разрешите доступ к галерее в настройках.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled) setThumbnail(result.assets[0].uri);
  };

  const handleCreate = async () => {
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
    if (!name.trim()) return;
    tapMedium();
    setLoading(true);
    try {
      const newId = await addClassroom({
        name: name.trim(),
        description: description.trim(),
        thumbnail,
        isPublic,
        tags: selectedTags,
      });
      if (withChat) {
        await createChat(chatName.trim() || name.trim(), chatDesc.trim() || undefined, newId);
      }
      notifySuccess();
      router.replace(`/classroom/${newId}/manage` as any);
    } catch (e: any) {
      Alert.alert('Ошибка', e?.message ?? 'Не удалось создать курс. Проверьте подключение.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* ── Top zone ── */}
        <View style={styles.topZone}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <X size={22} color={Colors.text.primary} weight="regular" />
          </TouchableOpacity>
          <View style={styles.topText}>
            <Text style={styles.topTitle}>Новый курс</Text>
            <Text style={styles.topSubtitle}>Заполните информацию о курсе</Text>
          </View>
        </View>

        {/* ── White card sheet ── */}
        <ScrollView
          style={styles.sheet}
          contentContainerStyle={styles.sheetContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Thumbnail picker */}
          <TouchableOpacity style={styles.thumbPicker} onPress={pickImage} activeOpacity={0.75}>
            {thumbnail ? (
              <>
                <Image source={{ uri: thumbnail }} style={styles.thumbImage} />
                <View style={styles.thumbOverlay}>
                  <View style={styles.thumbOverlayBtn}>
                    <Camera size={16} color="#fff" weight="fill" />
                    <Text style={styles.thumbOverlayText}>Изменить</Text>
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.thumbEmpty}>
                <View style={styles.thumbIconWrap}>
                  <ImageIcon size={28} color={Colors.text.disabled} weight="regular" />
                </View>
                <Text style={styles.thumbEmptyTitle}>Добавить обложку</Text>
                <Text style={styles.thumbEmptyHint}>16:9 · рекомендуется 1280×720</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Fields */}
          <Input
            label="Название"
            placeholder="Название курса"
            value={name}
            onChangeText={setName}
          />
          <Input
            label="Описание"
            placeholder="О чём этот курс?"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            style={{ minHeight: 100, textAlignVertical: 'top' }}
          />

          {/* Tags */}
          <View style={styles.tagsSection}>
            <View style={styles.tagsSectionHeader}>
              <Text style={styles.tagsSectionTitle}>Категория курса</Text>
              {selectedTags.length > 0 && (
                <Text style={styles.tagsCount}>{selectedTags.length} выбрано</Text>
              )}
            </View>
            <Text style={styles.tagsSectionHint}>Выберите одну или несколько категорий</Text>
            <View style={styles.tagsGrid}>
              {COURSE_TAGS.map((tag) => {
                const selected = selectedTags.includes(tag.id);
                return (
                  <TouchableOpacity
                    key={tag.id}
                    style={[
                      styles.tagChip,
                      { borderColor: selected ? tag.color : Colors.border },
                      selected && { backgroundColor: tag.background },
                    ]}
                    onPress={() => toggleTag(tag.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.tagEmoji}>{tag.emoji}</Text>
                    <Text style={[styles.tagLabel, selected && { color: tag.color, fontWeight: '700' }]}>
                      {tag.label}
                    </Text>
                    {selected && (
                      <CheckCircle size={14} color={tag.color} weight="fill" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Access toggle */}
          <View style={styles.switchRow}>
            <View style={styles.switchLeft}>
              <View style={styles.switchIconWrap}>
                {isPublic
                  ? <Globe size={18} color={Colors.primary} weight="regular" />
                  : <Lock size={18} color={Colors.primary} weight="regular" />
                }
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchLabel}>Открытый доступ</Text>
                <Text style={styles.switchDesc}>Любой может найти и записаться</Text>
              </View>
            </View>
            <Switch
              value={isPublic}
              onValueChange={setIsPublic}
              trackColor={{ true: Colors.primary, false: Colors.border }}
              thumbColor={Colors.surface}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchLeft}>
              <View style={styles.switchIconWrap}>
                <ChatsCircle size={18} color={Colors.primary} weight="regular" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchLabel}>Создать чат</Text>
                <Text style={styles.switchDesc}>Чат для общения со студентами</Text>
              </View>
            </View>
            <Switch
              value={withChat}
              onValueChange={setWithChat}
              trackColor={{ true: Colors.primary, false: Colors.border }}
              thumbColor={Colors.surface}
            />
          </View>

          {withChat && (
            <View style={styles.chatFields}>
              <Input
                label="Название чата"
                placeholder={name.trim() || 'Название чата'}
                value={chatName}
                onChangeText={setChatName}
              />
              <Input
                label="Описание чата (необязательно)"
                placeholder="О чём этот чат?"
                value={chatDesc}
                onChangeText={setChatDesc}
                multiline
                numberOfLines={3}
                style={{ minHeight: 80, textAlignVertical: 'top' }}
              />
            </View>
          )}

          <Button
            title="Создать курс"
            onPress={handleCreate}
            loading={loading}
            disabled={!name.trim()}
          />

          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  topZone: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: 20,
    gap: 12,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topText: { gap: 4 },
  topTitle: { fontSize: 26, fontWeight: '800', color: Colors.text.primary },
  topSubtitle: { fontSize: 14, color: Colors.text.secondary },

  sheet: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    ...Shadows.sm,
  },
  sheetContent: { padding: Spacing.md, gap: Spacing.md },

  // Thumbnail
  thumbPicker: {
    width: '100%',
    height: 168,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    backgroundColor: Colors.background,
  },
  thumbImage: { width: '100%', height: '100%', position: 'absolute' },
  thumbOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbOverlayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  thumbOverlayText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  thumbEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  thumbIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbEmptyTitle: { fontSize: 14, fontWeight: '600', color: Colors.text.secondary },
  thumbEmptyHint: { fontSize: 12, color: Colors.text.disabled },

  // Tags
  tagsSection: {
    gap: 10,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
  },
  tagsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagsSectionTitle: { fontSize: 14, fontWeight: '700', color: Colors.text.primary },
  tagsCount: { fontSize: 12, fontWeight: '600', color: Colors.primary },
  tagsSectionHint: { fontSize: 12, color: Colors.text.secondary, marginTop: -4 },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  tagEmoji: { fontSize: 14 },
  tagLabel: { fontSize: 13, fontWeight: '500', color: Colors.text.secondary },

  // Switch row
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
  },
  switchLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  switchIconWrap: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchLabel: { fontSize: 14, fontWeight: '600', color: Colors.text.primary },
  switchDesc: { fontSize: 12, color: Colors.text.secondary, marginTop: 2 },

  chatFields: { gap: Spacing.sm },
});
