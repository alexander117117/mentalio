import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { Material } from '../../types';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';

const ICONS: Record<string, { icon: string; color: string }> = {
  pdf: { icon: 'document-text-outline', color: '#EF4444' },
  link: { icon: 'link-outline', color: Colors.primary },
  file: { icon: 'attach-outline', color: Colors.warning },
};

interface Props {
  material: Material;
}

export default function MaterialItem({ material }: Props) {
  const { icon, color } = ICONS[material.type];

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => Linking.openURL(material.url)}
      activeOpacity={0.7}
    >
      <View style={[styles.icon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon as any} size={18} color={color} />
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{material.title}</Text>
        <Text style={styles.type}>{material.type.toUpperCase()}</Text>
      </View>
      <Ionicons name="download-outline" size={16} color={Colors.text.disabled} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  title: {
    ...Typography.body,
    color: Colors.text.primary,
  },
  type: {
    fontSize: 11,
    color: Colors.text.disabled,
    fontWeight: '600',
  },
});
