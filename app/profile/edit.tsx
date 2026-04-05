import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, Image,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Camera, WarningCircle } from 'phosphor-react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Spacing, Typography, BorderRadius } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/authStore';
import { tapLight, notifySuccess } from '../../src/utils/haptics';

export default function EditProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);

  const [name, setName] = useState(user?.name ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [avatar, setAvatar] = useState<string | null>(user?.avatar ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasChanges =
    name.trim() !== (user?.name ?? '') ||
    bio.trim() !== (user?.bio ?? '') ||
    avatar !== (user?.avatar ?? null);

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
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    tapLight();
    setLoading(true);
    setError(null);
    const { error: err } = await updateProfile({
      name: name.trim(),
      bio: bio.trim(),
      avatar: avatar ?? undefined,
    });
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      notifySuccess();
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={Colors.text.primary} weight="regular" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Редактировать профиль</Text>
        <TouchableOpacity
          style={[styles.saveBtn, (!hasChanges || loading) && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={!hasChanges || loading}
        >
          {loading
            ? <ActivityIndicator size="small" color={Colors.text.inverse} />
            : <Text style={styles.saveBtnText}>Сохранить</Text>
          }
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Avatar */}
          <View style={styles.avatarSection}>
            <TouchableOpacity style={styles.avatarWrap} onPress={pickImage} activeOpacity={0.8}>
              {avatar ? (
                <>
                  <Image source={{ uri: avatar }} style={styles.avatarImg} />
                  <View style={styles.avatarOverlay}>
                    <Camera size={20} color="#fff" weight="fill" />
                  </View>
                </>
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>
                    {name.charAt(0).toUpperCase() || '?'}
                  </Text>
                  <View style={styles.cameraBtn}>
                    <Camera size={13} color="#fff" weight="fill" />
                  </View>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={pickImage} style={styles.changePhotoBtn}>
              <Text style={styles.changePhotoText}>
                {avatar ? 'Изменить фото' : 'Добавить фото'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Fields */}
          <View style={styles.fields}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Имя</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Введите имя"
                placeholderTextColor={Colors.text.disabled}
                autoCorrect={false}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>О себе</Text>
              <TextInput
                style={[styles.input, styles.bioInput]}
                value={bio}
                onChangeText={setBio}
                placeholder="Чем вы занимаетесь? Что изучаете или преподаёте?"
                placeholderTextColor={Colors.text.disabled}
                multiline
                maxLength={200}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{bio.length}/200</Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Email</Text>
              <View style={styles.inputDisabled}>
                <Text style={styles.inputDisabledText}>{user?.email}</Text>
              </View>
              <Text style={styles.fieldHint}>Email нельзя изменить</Text>
            </View>
          </View>

          {error && (
            <View style={styles.errorBox}>
              <WarningCircle size={16} color={Colors.error} weight="regular" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={{ height: Spacing.xl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const AVATAR_SIZE = 88;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  backBtn: { padding: 4 },
  headerTitle: { ...Typography.h3, color: Colors.text.primary, flex: 1 },
  saveBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    minWidth: 90,
    alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { fontSize: 14, fontWeight: '600', color: Colors.text.inverse },

  avatarSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  avatarWrap: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  avatarImg: {
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
  changePhotoBtn: { paddingVertical: 4 },
  changePhotoText: { fontSize: 14, color: Colors.primary, fontWeight: '500' },

  fields: { padding: Spacing.md, gap: Spacing.md },
  field: { gap: 6 },
  fieldLabel: { fontSize: 13, fontWeight: '500', color: Colors.text.secondary },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    ...Typography.body,
    color: Colors.text.primary,
  },
  bioInput: {
    minHeight: 100,
    lineHeight: 22,
  },
  charCount: { fontSize: 11, color: Colors.text.disabled, textAlign: 'right' },
  inputDisabled: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
  },
  inputDisabledText: { ...Typography.body, color: Colors.text.disabled },
  fieldHint: { fontSize: 11, color: Colors.text.disabled },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.md,
    padding: Spacing.md,
    backgroundColor: '#FEF2F2',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: { fontSize: 13, color: Colors.error, flex: 1 },
});
