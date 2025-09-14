import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSettings } from '@/hooks/settings-context';
import { createTheme } from '@/constants/theme';

export default function CharactersScreen() {
  const { settings } = useSettings();
  const theme = createTheme(settings.theme);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Characters</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        Character management screen - accessible via drawer navigation.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
});