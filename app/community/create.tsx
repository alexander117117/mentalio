import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { X, Camera } from 'phosphor-react-native';
import { useState } from 'react';
import { Colors, Spacing, Typography } from '../../src/constants/theme';
import Input from '../../src/components/ui/Input';
import Button from '../../src/components/ui/Button';

export default function CreateCommunityScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || !description.trim()) return;
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
        <Text style={styles.headerTitle}>Новое сообщество</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.avatarPicker}>
          <Camera size={28} color={Colors.primary} weight="regular" />
          <Text style={styles.avatarText}>Добавить аватар</Text>
        </TouchableOpacity>

        <Input
          label="Название"
          placeholder="Название сообщества"
          value={name}
          onChangeText={setName}
        />
        <Input
          label="Описание"
          placeholder="О чём это сообщество?"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          style={{ minHeight: 100, textAlignVertical: 'top' }}
        />

        <View style={styles.switchRow}>
          <View>
            <Text style={styles.switchLabel}>Закрытое сообщество</Text>
            <Text style={styles.switchDesc}>Вступление только по приглашению</Text>
          </View>
          <Switch
            value={isPrivate}
            onValueChange={setIsPrivate}
            trackColor={{ true: Colors.primary }}
          />
        </View>

        <Button
          title="Создать сообщество"
          onPress={handleCreate}
          loading={loading}
          disabled={!name.trim() || !description.trim()}
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
  avatarPicker: {
    alignSelf: 'center',
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    gap: 4,
  },
  avatarText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '500',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  switchLabel: {
    ...Typography.body,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  switchDesc: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
});
