import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { X, YoutubeLogo, VideoCamera, Link } from 'phosphor-react-native';
import { useState } from 'react';
import { Colors, Spacing, Typography, BorderRadius } from '../../src/constants/theme';
import Input from '../../src/components/ui/Input';
import Button from '../../src/components/ui/Button';

type Platform = 'youtube' | 'zoom' | 'other';

const PLATFORMS: { key: Platform; label: string }[] = [
  { key: 'youtube', label: 'YouTube' },
  { key: 'zoom', label: 'Zoom' },
  { key: 'other', label: 'Другое' },
];

export default function CreateLiveScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [streamUrl, setStreamUrl] = useState('');
  const [platform, setPlatform] = useState<Platform>('youtube');
  const [loading, setLoading] = useState(false);

  const handleCreate = () => {
    if (!title.trim() || !streamUrl.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.back();
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <X size={24} color={Colors.text.primary} weight="regular" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Новый эфир</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Input
          label="Название эфира"
          placeholder="О чём будет эфир?"
          value={title}
          onChangeText={setTitle}
        />
        <Input
          label="Описание"
          placeholder="Расскажите подробнее..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          style={{ minHeight: 80, textAlignVertical: 'top' }}
        />

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Платформа</Text>
          <View style={styles.platformRow}>
            {PLATFORMS.map((p) => (
              <TouchableOpacity
                key={p.key}
                style={[styles.platformBtn, platform === p.key && styles.platformBtnActive]}
                onPress={() => setPlatform(p.key)}
              >
                {p.key === 'youtube'
                  ? <YoutubeLogo size={18} color={platform === p.key ? Colors.surface : Colors.text.secondary} weight="fill" />
                  : p.key === 'zoom'
                    ? <VideoCamera size={18} color={platform === p.key ? Colors.surface : Colors.text.secondary} weight="regular" />
                    : <Link size={18} color={platform === p.key ? Colors.surface : Colors.text.secondary} weight="regular" />
                }
                <Text style={[styles.platformText, platform === p.key && styles.platformTextActive]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Input
          label="Ссылка на эфир"
          placeholder="https://..."
          value={streamUrl}
          onChangeText={setStreamUrl}
          keyboardType="url"
          autoCapitalize="none"
        />

        <Button
          title="Создать эфир"
          onPress={handleCreate}
          loading={loading}
          disabled={!title.trim() || !streamUrl.trim()}
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
  fieldGroup: {
    gap: Spacing.xs,
  },
  fieldLabel: {
    ...Typography.body,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  platformRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  platformBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  platformBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  platformText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  platformTextActive: {
    color: Colors.surface,
  },
});
