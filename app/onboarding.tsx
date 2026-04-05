import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  TextInput, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'phosphor-react-native';
import { Colors, Spacing, Typography, BorderRadius } from '../src/constants/theme';
import { useAuthStore } from '../src/store/authStore';
import { notifySuccess, tapLight } from '../src/utils/haptics';

export default function OnboardingScreen() {
  const { name: paramName } = useLocalSearchParams<{ name: string }>();
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);

  const displayName = user?.name ?? paramName ?? '';

  const [avatar, setAvatar] = useState<string | null>(user?.avatar ?? null);
  const [bio, setBio] = useState(user?.bio ?? '');
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    tapLight();
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
      notifySuccess();
    }
  };

  const handleSave = async () => {
    tapLight();
    setLoading(true);
    try {
      // Save bio immediately — fast, no upload needed
      await updateProfile({ bio: bio.trim() });

      // Upload avatar separately — skip if it fails
      if (avatar) {
        const ext = avatar.split('.').pop()?.toLowerCase().split('?')[0] ?? 'jpg';
        const mime = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
        const formData = new FormData();
        formData.append('file', { uri: avatar, name: `avatar.${ext}`, type: mime } as any);

        const { supabase } = await import('../src/lib/supabase');
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const path = `${session.user.id}.${ext}`;
          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(path, formData, { contentType: mime, upsert: true });
          if (!uploadError) {
            const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
            await updateProfile({ avatar: urlData.publicUrl });
          }
        }
      }
    } catch {
      // proceed regardless
    } finally {
      setLoading(false);
      notifySuccess();
      router.replace('/(tabs)' as any);
    }
  };

  const handleSkip = () => {
    router.replace('/(tabs)' as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepText}>Последний шаг</Text>
            </View>
            <TouchableOpacity onPress={handleSkip}>
              <Text style={styles.skipHeader}>Пропустить</Text>
            </TouchableOpacity>
          </View>

          {/* Title */}
          <Text style={styles.title}>Расскажите о себе</Text>
          <Text style={styles.subtitle}>
            Участники сообщества охотнее общаются с теми, кого видят.
            Лицо и пара строк о вас — это всё, что нужно, чтобы
            люди почувствовали, что рядом настоящий человек.
          </Text>

          {/* Avatar */}
          <View style={styles.avatarSection}>
            <TouchableOpacity style={styles.avatarWrap} onPress={pickImage} activeOpacity={0.8}>
              {avatar ? (
                <>
                  <Image source={{ uri: avatar }} style={styles.avatar} />
                  <View style={styles.avatarOverlay}>
                    <Camera size={22} color="#fff" weight="fill" />
                  </View>
                </>
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>
                    {displayName.charAt(0).toUpperCase() || '?'}
                  </Text>
                  <View style={styles.cameraBtn}>
                    <Camera size={14} color="#fff" weight="fill" />
                  </View>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.avatarInfo}>
              <Text style={styles.avatarName}>{displayName}</Text>
              <TouchableOpacity onPress={pickImage} activeOpacity={0.7}>
                <Text style={styles.avatarChangeLink}>
                  {avatar ? 'Изменить фото' : 'Добавить фото'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Bio */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>О себе</Text>
            <TextInput
              style={styles.bioInput}
              placeholder="Чем вы занимаетесь? Что изучаете или преподаёте?"
              placeholderTextColor={Colors.text.disabled}
              value={bio}
              onChangeText={setBio}
              multiline
              maxLength={200}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{bio.length}/200</Text>
          </View>

          {/* CTA */}
          <TouchableOpacity
            style={[styles.saveBtn, loading && { opacity: 0.7 }]}
            onPress={handleSave}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.saveBtnText}>Готово</Text>
            }
          </TouchableOpacity>

          <View style={{ height: Spacing.xl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const AVATAR_SIZE = 88;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  stepBadge: {
    backgroundColor: Colors.successSurface,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  stepText: { fontSize: 12, fontWeight: '600', color: Colors.success },
  skipHeader: { fontSize: 14, color: Colors.text.disabled },

  title: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.text.primary,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.text.secondary,
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },

  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
    padding: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatarWrap: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    flexShrink: 0,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  avatarOverlay: {
    position: 'absolute',
    inset: 0,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholder: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { fontSize: 32, fontWeight: '700', color: Colors.text.disabled },
  cameraBtn: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.surface,
  },

  avatarInfo: { flex: 1, gap: 4 },
  avatarName: { fontSize: 17, fontWeight: '600', color: Colors.text.primary },
  avatarChangeLink: { fontSize: 14, color: Colors.primary, fontWeight: '500' },

  field: { gap: 7, marginBottom: Spacing.lg },
  fieldLabel: { fontSize: 13, fontWeight: '500', color: Colors.text.primary },
  bioInput: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    padding: Spacing.md,
    ...Typography.body,
    color: Colors.text.primary,
    minHeight: 110,
    lineHeight: 22,
  },
  charCount: { fontSize: 11, color: Colors.text.disabled, textAlign: 'right' },

  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  saveBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});
