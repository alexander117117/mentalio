import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Colors, Spacing, Typography, BorderRadius } from '../../../src/constants/theme';
import Input from '../../../src/components/ui/Input';
import Button from '../../../src/components/ui/Button';

type PostType = 'feed' | 'forum';

export default function CreatePostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [type, setType] = useState<PostType>('feed');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    if (!content.trim()) return;
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Новый пост</Text>
        <Button title="Опубликовать" onPress={handleSubmit} style={styles.publishBtn} />
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.content}>
        <View style={styles.typeRow}>
          {(['feed', 'forum'] as PostType[]).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.typeBtn, type === t && styles.typeBtnActive]}
              onPress={() => setType(t)}
            >
              <Text style={[styles.typeBtnText, type === t && styles.typeBtnTextActive]}>
                {t === 'feed' ? 'Лента' : 'Форум'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {type === 'forum' && (
          <Input
            label="Заголовок темы"
            placeholder="Введите заголовок..."
            value={title}
            onChangeText={setTitle}
          />
        )}

        <Input
          label="Содержание"
          placeholder="Что у вас на уме?"
          value={content}
          onChangeText={setContent}
          multiline
          numberOfLines={8}
          style={{ minHeight: 160, textAlignVertical: 'top' }}
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
  publishBtn: {
    minHeight: 36,
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
  },
  body: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  typeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  typeBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeBtnText: {
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  typeBtnTextActive: {
    color: Colors.surface,
  },
});
