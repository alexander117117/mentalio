import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius } from '../../constants/theme';

type Status = 'live' | 'scheduled' | 'ended';

const CONFIG: Record<Status, { label: string; bg: string; color: string; dot?: boolean }> = {
  live:      { label: 'В эфире',       bg: Colors.liveSurface,    color: Colors.live,            dot: true },
  scheduled: { label: 'Запланировано', bg: Colors.warningSurface, color: Colors.warning },
  ended:     { label: 'Завершено',     bg: Colors.surfaceSecondary, color: Colors.text.disabled },
};

interface Props {
  status: Status;
}

export default function Badge({ status }: Props) {
  const { label, bg, color, dot } = CONFIG[status];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      {dot && <View style={[styles.dot, { backgroundColor: color }]} />}
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.full,
    gap: 5,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  text: {
    fontSize: 11,
    fontWeight: '500',
  },
});
