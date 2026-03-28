import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Spacing, Typography, BorderRadius } from '../../src/constants/theme';
import Input from '../../src/components/ui/Input';
import Button from '../../src/components/ui/Button';
import { useClassroomStore } from '../../src/store/classroomStore';
import { useAuthStore } from '../../src/store/authStore';
import { tapMedium, notifySuccess } from '../../src/utils/haptics';

export default function CreateClassroomScreen() {
  const addClassroom = useClassroomStore((s) => s.addClassroom);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState<string | undefined>();
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Нет доступа', 'Разрешите доступ к галерее в настройках.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled) {
      setThumbnail(result.assets[0].uri);
    }
  };

  const handleCreate = async () => {
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
    if (!name.trim()) return;
    tapMedium();
    setLoading(true);
    try {
      const newId = await addClassroom({ name: name.trim(), description: description.trim(), thumbnail, isPublic });
      notifySuccess();
      router.replace(`/classroom/${newId}/manage` as any);
    } catch {
      Alert.alert('Ошибка', 'Не удалось создать курс. Проверьте подключение.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Новая классная комната</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Thumbnail picker */}
        <TouchableOpacity style={styles.thumbnailPicker} onPress={pickImage} activeOpacity={0.7}>
          {thumbnail ? (
            <>
              <Image source={{ uri: thumbnail }} style={styles.thumbnailImage} />
              <View style={styles.thumbnailOverlay}>
                <Ionicons name="camera" size={22} color="#fff" />
                <Text style={styles.thumbnailOverlayText}>Изменить</Text>
              </View>
            </>
          ) : (
            <>
              <Ionicons name="image-outline" size={36} color={Colors.text.disabled} />
              <Text style={styles.thumbnailText}>Добавить обложку</Text>
              <Text style={styles.thumbnailHint}>16:9, рекомендуется 1280×720</Text>
            </>
          )}
        </TouchableOpacity>

        <Input
          label="Название"
          placeholder="Название классной комнаты"
          value={name}
          onChangeText={setName}
        />
        <Input
          label="Описание"
          placeholder="Что изучают в этой классной комнате?"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          style={{ minHeight: 100, textAlignVertical: 'top' }}
        />

        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchLabel}>Открытый доступ</Text>
            <Text style={styles.switchDesc}>Любой может найти и записаться</Text>
          </View>
          <Switch
            value={isPublic}
            onValueChange={setIsPublic}
            trackColor={{ true: Colors.primary, false: Colors.border }}
            thumbColor={Colors.surface}
          />
        </View>

        <Button
          title="Создать классную комнату"
          onPress={handleCreate}
          loading={loading}
          disabled={!name.trim()}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
  },
  content: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  thumbnailPicker: {
    width: '100%',
    height: 160,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.background,
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  thumbnailOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  thumbnailOverlayText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  thumbnailText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  thumbnailHint: {
    fontSize: 12,
    color: Colors.text.disabled,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  switchLabel: {
    ...Typography.body,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  switchDesc: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
});
