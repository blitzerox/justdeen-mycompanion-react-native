/**
 * Generate Placeholder Screens
 *
 * This script generates placeholder screen components for all tabs
 */
const fs = require('fs');
const path = require('path');

const screens = {
  pray: [
    { name: 'PrayerTimingSettingsScreen', title: 'Prayer Timing Settings', desc: 'Week 8-10: Configure prayer calculation method and madhab' },
    { name: 'NotificationSettingsScreen', title: 'Notification Settings', desc: 'Week 8-10: Adhan and notification preferences' },
    { name: 'IslamicCalendarScreen', title: 'Islamic Calendar', desc: 'Week 8-10: Hijri calendar with Islamic events' },
  ],
  read: [
    { name: 'QuranHomeScreen', title: 'Quran', desc: 'Week 12-15: Surah list and Quran reading interface' },
    { name: 'QuranReaderScreen', title: 'Quran Reader', desc: 'Week 12-15: Verse-by-verse reading with translations' },
    { name: 'SurahDetailsScreen', title: 'Surah Details', desc: 'Week 12-15: Surah overview and metadata' },
    { name: 'JuzListScreen', title: 'Juz List', desc: 'Week 12-15: List of 30 Juz' },
    { name: 'JuzReaderScreen', title: 'Juz Reader', desc: 'Week 12-15: Read by Juz' },
    { name: 'BookmarksListScreen', title: 'Bookmarks', desc: 'Week 12-15: Saved bookmarks' },
    { name: 'ReadingHistoryScreen', title: 'Reading History', desc: 'Week 12-15: Recently read verses' },
    { name: 'TranslationSettingsScreen', title: 'Translation Settings', desc: 'Week 12-15: Manage translations' },
    { name: 'ReadingGroupsScreen', title: 'Reading Groups', desc: 'Week 18-19: Community reading groups' },
    { name: 'GroupDetailsScreen', title: 'Group Details', desc: 'Week 18-19: Group info and members' },
    { name: 'CreateGroupScreen', title: 'Create Group', desc: 'Week 18-19: Create new reading group' },
  ],
  reflect: [
    { name: 'ReflectHomeScreen', title: 'Reflect', desc: 'Week 17: Main screen with Duas, Hadith, Names' },
    { name: 'DuasCategoriesScreen', title: 'Duas Categories', desc: 'Week 17: Categories of duas' },
    { name: 'DuasListScreen', title: 'Duas List', desc: 'Week 17: List of duas in category' },
    { name: 'DuaDetailsScreen', title: 'Dua Details', desc: 'Week 17: Full dua with translation' },
    { name: 'HadithCollectionsScreen', title: 'Hadith Collections', desc: 'Week 16: Sahih Bukhari, Muslim, etc.' },
    { name: 'HadithBooksScreen', title: 'Hadith Books', desc: 'Week 16: Books within a collection' },
    { name: 'HadithListScreen', title: 'Hadith List', desc: 'Week 16: List of hadith' },
    { name: 'HadithDetailsScreen', title: 'Hadith Details', desc: 'Week 16: Full hadith with commentary' },
    { name: 'NamesOfAllahScreen', title: '99 Names of Allah', desc: 'Week 17: 99 Names with meanings' },
    { name: 'NamesOfProphetScreen', title: 'Names of Prophet', desc: 'Week 17: Names of Prophet Muhammad' },
    { name: 'TasbihCounterScreen', title: 'Tasbih Counter', desc: 'Week 17: Digital tasbih counter' },
  ],
  ai: [
    { name: 'AIChatHomeScreen', title: 'AI Assistant', desc: 'Week 20-21: AI chatbot for Islamic Q&A' },
    { name: 'ChatHistoryScreen', title: 'Chat History', desc: 'Week 20-21: Previous conversations' },
    { name: 'AISettingsScreen', title: 'AI Settings', desc: 'Week 20-21: AI preferences and model settings' },
  ],
  settings: [
    { name: 'SettingsHomeScreen', title: 'Settings', desc: 'Week 5: Main settings screen' },
    { name: 'ProfileSettingsScreen', title: 'Profile Settings', desc: 'Week 6-7: User profile and account' },
    { name: 'ThemeSettingsScreen', title: 'Theme Settings', desc: 'Week 5: Dark mode, OLED mode' },
    { name: 'LanguageSettingsScreen', title: 'Language Settings', desc: 'Week 12-15: App language preferences' },
    { name: 'AudioSettingsScreen', title: 'Audio Settings', desc: 'Week 12-15: Audio player, reciter selection' },
    { name: 'StorageSettingsScreen', title: 'Storage Settings', desc: 'Week 12-15: Offline data, cache management' },
    { name: 'PrivacySettingsScreen', title: 'Privacy Settings', desc: 'Week 6-7: Data privacy, analytics opt-out' },
    { name: 'AboutScreen', title: 'About', desc: 'Week 5: App info, version, credits' },
    { name: 'SubscriptionScreen', title: 'Premium', desc: 'Week 20-21: Premium features, IAP' },
  ],
};

const colorMap = {
  pray: 'pray',
  read: 'read',
  reflect: 'reflect',
  ai: 'ai',
  settings: 'settings',
};

const stackMap = {
  pray: 'PrayStackScreenProps',
  read: 'ReadStackScreenProps',
  reflect: 'ReflectStackScreenProps',
  ai: 'AIStackScreenProps',
  settings: 'SettingsStackScreenProps',
};

function generateScreen(tab, screen) {
  const screenName = screen.name.replace('Screen', '');
  const stackProps = stackMap[tab];
  const color = colorMap[tab];

  return `/**
 * ${screen.title} Screen
 *
 * ${screen.desc}
 */
import React from "react"
import { View, Text, StyleSheet } from "react-native"
import { Screen } from "@/components"
import { useAppTheme } from "@/theme/context"
import type { ${stackProps} } from "@/navigators"

export const ${screen.name}: React.FC<${stackProps}<"${screenName}">> = () => {
  const {
    theme: { colors },
  } = useAppTheme()

  return (
    <Screen preset="scroll" contentContainerStyle={styles.container}>
      <View style={[styles.content, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.${color} }]}>${screen.title}</Text>
        <Text style={[styles.description, { color: colors.textDim }]}>
          ${screen.desc}
        </Text>
        <Text style={[styles.placeholder, { color: colors.textDim }]}>
          🚧 This screen will be implemented in future phases.
        </Text>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 20 },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 12 },
  description: { fontSize: 15, lineHeight: 22, marginBottom: 16 },
  placeholder: { fontSize: 13, fontStyle: "italic" },
})
`;
}

// Generate all screens
Object.keys(screens).forEach(tab => {
  const tabDir = path.join(__dirname, 'app', 'screens', tab);

  // Create directory if it doesn't exist
  if (!fs.existsSync(tabDir)) {
    fs.mkdirSync(tabDir, { recursive: true });
  }

  screens[tab].forEach(screen => {
    const filePath = path.join(tabDir, `${screen.name}.tsx`);

    // Skip if already exists
    if (fs.existsSync(filePath)) {
      console.log(`Skipping ${filePath} (already exists)`);
      return;
    }

    const content = generateScreen(tab, screen);
    fs.writeFileSync(filePath, content);
    console.log(`Created ${filePath}`);
  });
});

console.log('✅ Screen generation complete!');
