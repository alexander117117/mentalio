import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { File, Link, Paperclip, DownloadSimple } from 'phosphor-react-native';
import * as Linking from 'expo-linking';
import { Material } from '../../types';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';

const COLORS: Record<string, string> = {
  pdf: '#EF4444',
  link: Colors.primary,
  file: Colors.warning,
};

interface Props {
  material: Material;
}

export default function MaterialItem({ material }: Props) {
  const color = COLORS[material.type] ?? Colors.text.secondary;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => Linking.openURL(material.url)}
      activeOpacity={0.7}
    >
      <View style={[styles.icon, { backgroundColor: `${color}15` }]}>
        {material.type === 'pdf'
          ? <File size={18} color={color} weight="regular" />
          : material.type === 'link'
            ? <Link size={18} color={color} weight="regular" />
            : <Paperclip size={18} color={color} weight="regular" />
        }
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{material.title}</Text>
        <Text style={styles.type}>{material.type.toUpperCase()}</Text>
      </View>
      <DownloadSimple size={16} color={Colors.text.disabled} weight="regular" />
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
