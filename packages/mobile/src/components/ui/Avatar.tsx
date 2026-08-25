import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface AvatarProps {
  name: string;
  image?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = { sm: 32, md: 40, lg: 56 };

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export function Avatar({ name, image, size = 'md' }: AvatarProps) {
  const s = sizes[size];
  return (
    <View style={[styles.container, { width: s, height: s, borderRadius: s / 2 }]}>
      {image ? (
        <Image source={{ uri: image }} style={[styles.image, { width: s, height: s, borderRadius: s / 2 }]} />
      ) : (
        <Text style={[styles.initials, { fontSize: s * 0.4 }]}>{getInitials(name)}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#ea580c', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  image: {},
  initials: { color: '#fff', fontWeight: '700' },
});
