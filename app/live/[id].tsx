import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Broadcast, Eye, CalendarBlank, Link } from 'phosphor-react-native';
import * as Linking from 'expo-linking';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Colors, Spacing, Typography } from '../../src/constants/theme';
import Badge from '../../src/components/ui/Badge';
import Avatar from '../../src/components/ui/Avatar';
import Button from '../../src/components/ui/Button';
import { MOCK_STREAMS } from '../../src/utils/mockData';

export default function LiveScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const stream = MOCK_STREAMS.find((s) => s.id === id) ?? MOCK_STREAMS[0];

  const handleWatch = () => {
    Linking.openURL(stream.streamUrl);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <ArrowLeft size={24} color={Colors.text.primary} weight="regular" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        {stream.thumbnail ? (
          <Image source={{ uri: stream.thumbnail }} style={styles.thumbnail} />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <Broadcast size={48} color={Colors.primary} weight="regular" />
          </View>
        )}

        <View style={styles.body}>
          <View style={styles.topRow}>
            <Badge status={stream.status} />
            {stream.viewersCount != null && (
              <View style={styles.viewers}>
                <Eye size={14} color={Colors.text.secondary} weight="regular" />
                <Text style={styles.viewersText}>{stream.viewersCount} зрителей</Text>
              </View>
            )}
          </View>

          <Text style={styles.title}>{stream.title}</Text>
          {stream.description && (
            <Text style={styles.description}>{stream.description}</Text>
          )}

          <View style={styles.hostRow}>
            <Avatar uri={stream.host.avatar} name={stream.host.name} size={40} />
            <View>
              <Text style={styles.hostLabel}>Ведущий</Text>
              <Text style={styles.hostName}>{stream.host.name}</Text>
            </View>
          </View>

          {stream.scheduledAt && stream.status === 'scheduled' && (
            <View style={styles.scheduleRow}>
              <CalendarBlank size={16} color={Colors.primary} weight="regular" />
              <Text style={styles.scheduleText}>
                {format(new Date(stream.scheduledAt), 'd MMMM yyyy, HH:mm', { locale: ru })}
              </Text>
            </View>
          )}

          <View style={styles.platformRow}>
            <Link size={16} color={Colors.text.secondary} weight="regular" />
            <Text style={styles.platformText}>Платформа: {stream.platform}</Text>
          </View>

          {stream.status !== 'ended' && (
            <Button title="Смотреть эфир" onPress={handleWatch} />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  backBtn: {
    position: 'absolute',
    top: 52,
    left: Spacing.md,
    zIndex: 10,
    backgroundColor: Colors.surface,
    borderRadius: 99,
    padding: 6,
  },
  thumbnail: {
    width: '100%',
    height: 220,
    backgroundColor: Colors.background,
  },
  thumbnailPlaceholder: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${Colors.primary}15`,
  },
  body: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewersText: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  title: {
    ...Typography.h2,
    color: Colors.text.primary,
  },
  description: {
    ...Typography.body,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  hostLabel: {
    fontSize: 12,
    color: Colors.text.disabled,
  },
  hostName: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: `${Colors.primary}10`,
    padding: Spacing.md,
    borderRadius: 10,
  },
  scheduleText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '500',
  },
  platformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  platformText: {
    ...Typography.body,
    color: Colors.text.secondary,
    textTransform: 'capitalize',
  },
});
