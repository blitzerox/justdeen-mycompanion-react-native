# Component Mapping: Flutter → React Native

**Project:** JustDeen MyCompanion Migration
**Last Updated:** 2025-11-10
**Purpose:** Map Flutter widgets to React Native components for consistent UI

---

## Mapping Strategy

### General Principles:
1. **Match UI exactly** - Colors, spacing, fonts must be identical
2. **Platform-aware** - Use platform-specific components where appropriate
3. **Reusable** - Create shared components for common patterns
4. **Performant** - Optimize for large lists and scrolling

---

## 1. Layout Components

| Flutter Widget | React Native Component | Notes |
|---------------|----------------------|-------|
| `Container` | `View` | Basic container |
| `Padding` | `View` with padding style | Use theme spacing |
| `Center` | `View` with `alignItems/justifyContent: center` | |
| `Row` | `View` with `flexDirection: row` | |
| `Column` | `View` with `flexDirection: column` | Default |
| `Expanded` | `View` with `flex: 1` | |
| `Flexible` | `View` with `flex: n` | |
| `Stack` | `View` with `position: absolute` children | |
| `Positioned` | `View` with absolute positioning | |
| `SafeArea` | `SafeAreaView` from react-native-safe-area-context | |
| `SizedBox` | `View` with specific width/height | |
| `Spacer` | `View` with `flex: 1` | |

---

## 2. Text Components

| Flutter Widget | React Native Component | Implementation |
|---------------|----------------------|----------------|
| `Text` | `Text` | Use theme typography |
| `RichText` | `Text` with nested Text components | |
| `SelectableText` | `Text` with `selectable={true}` | |
| Arabic text (RTL) | **Custom `ArabicText` component** | See below |

### ArabicText Component

```typescript
// app/components/Shared/ArabicText.tsx
interface ArabicTextProps {
  children: string;
  style?: TextStyle;
  type?: 'quran' | 'heading' | 'body';
}

export const ArabicText: FC<ArabicTextProps> = ({
  children,
  style,
  type = 'body'
}) => {
  const fontFamily = type === 'quran' ? 'Uthman' : 'Jameel';
  const fontSize = type === 'quran' ? 24 : type === 'heading' ? 20 : 16;

  return (
    <Text
      style={[
        {
          fontFamily,
          fontSize: scaledSize(fontSize),
          textAlign: 'right',
          writingDirection: 'rtl'
        },
        style
      ]}
    >
      {children}
    </Text>
  );
};
```

---

## 3. Input Components

| Flutter Widget | React Native Component | Notes |
|---------------|----------------------|-------|
| `TextField` | `TextInput` | Style to match Flutter |
| `TextFormField` | **Custom `FormInput` component** | With validation |
| `DropdownButton` | **Custom `Picker` component** | Platform-specific |
| `Checkbox` | `Checkbox` from @react-native-community/checkbox | |
| `Switch` | `Switch` | iOS/Android styling |
| `Slider` | `Slider` from @react-native-community/slider | |
| `Radio` | **Custom `RadioButton` component** | |

---

## 4. Button Components

| Flutter Widget | React Native Component | Implementation |
|---------------|----------------------|----------------|
| `ElevatedButton` | **Custom `Button` component** | Primary style |
| `TextButton` | **Custom `Button` component** | Text variant |
| `OutlinedButton` | **Custom `Button` component** | Outlined variant |
| `IconButton` | `TouchableOpacity` + Icon | |
| `FloatingActionButton` | **Custom `FAB` component** | Positioned absolutely |

### Button Component

```typescript
// app/components/Shared/Button.tsx
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'text';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
}

export const Button: FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon
}) => {
  const { colors, spacing } = useTheme();

  const buttonStyles = {
    primary: {
      backgroundColor: colors.primary,
      ...shadows.small,
    },
    secondary: {
      backgroundColor: colors.systemFillSecondary,
    },
    text: {
      backgroundColor: 'transparent',
    },
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        buttonStyles[variant],
        disabled && styles.disabled
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#FFF' : colors.primary} />
      ) : (
        <>
          {icon && <Icon name={icon} size={20} color={...} />}
          <Text style={[styles.text, textStyles[variant]]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};
```

---

## 5. List Components

| Flutter Widget | React Native Component | Notes |
|---------------|----------------------|-------|
| `ListView` | `FlatList` or `FlashList` | Use FlashList for performance |
| `ListView.builder` | `FlatList` with data + renderItem | |
| `ListView.separated` | `FlatList` with ItemSeparatorComponent | |
| `GridView` | `FlatList` with `numColumns` | |
| `RefreshIndicator` | `FlatList` with `refreshControl` | |
| `ListTile` | **Custom `ListItem` component** | |

### ListItem Component

```typescript
// app/components/Shared/ListItem.tsx
interface ListItemProps {
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  onPress?: () => void;
}

export const ListItem: FC<ListItemProps> = ({
  title,
  subtitle,
  leading,
  trailing,
  onPress
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      disabled={!onPress}
    >
      {leading && <View style={styles.leading}>{leading}</View>}

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      {trailing && <View style={styles.trailing}>{trailing}</View>}
    </TouchableOpacity>
  );
};
```

---

## 6. Card Components

| Flutter Widget | React Native Component | Implementation |
|---------------|----------------------|----------------|
| `Card` | **Custom `Card` component** | With shadow |
| Material Card | **Multiple card variants** | See below |

### Card Component

```typescript
// app/components/Shared/Card.tsx
interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  elevated?: boolean;
}

export const Card: FC<CardProps> = ({
  children,
  style,
  onPress,
  elevated = true
}) => {
  const { colors, borderRadius, shadows } = useTheme();

  const CardWrapper = onPress ? TouchableOpacity : View;

  return (
    <CardWrapper
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: borderRadius.card,
          padding: spacing.cardPadding,
        },
        elevated && shadows.medium,
        style
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {children}
    </CardWrapper>
  );
};
```

---

## 7. Prayer-Specific Components

### 7.1 Prayer Time Card (Flutter → React Native)

**Flutter:** `lib/src/features/home/widgets/prayer_card.dart`

**React Native:** `app/components/Prayer/PrayerCard.tsx`

```typescript
interface PrayerCardProps {
  prayerName: string;
  prayerTime: string;
  countdown?: string;
  status: 'active' | 'upcoming' | 'passed';
  isHighlighted?: boolean;
}

export const PrayerCard: FC<PrayerCardProps> = ({
  prayerName,
  prayerTime,
  countdown,
  status,
  isHighlighted = false
}) => {
  const { colors, typography, spacing } = useTheme();

  const statusColors = {
    active: colors.prayerActive,
    upcoming: colors.prayerUpcoming,
    passed: colors.prayerPassed,
  };

  return (
    <Card
      style={[
        styles.card,
        isHighlighted && styles.highlighted
      ]}
    >
      <View style={styles.row}>
        <View style={styles.leftSection}>
          <View style={styles.statusDot}>
            <View style={[
              styles.dot,
              { backgroundColor: statusColors[status] }
            ]} />
          </View>

          <View>
            <Text style={typography.title.large}>{prayerName}</Text>
            {countdown && (
              <Text style={[typography.body.small, styles.countdown]}>
                {countdown}
              </Text>
            )}
          </View>
        </View>

        <Text style={[
          typography.display.medium,
          { color: isHighlighted ? colors.primary : colors.text }
        ]}>
          {prayerTime}
        </Text>
      </View>
    </Card>
  );
};
```

### 7.2 Daily Ayah Card

**Flutter:** `lib/src/features/home/widgets/ayat_card.dart`

**React Native:** `app/components/Quran/DailyAyahCard.tsx`

```typescript
interface DailyAyahCardProps {
  arabicText: string;
  translation: string;
  surahName: string;
  verseNumber: number;
  onPress?: () => void;
}

export const DailyAyahCard: FC<DailyAyahCardProps> = ({
  arabicText,
  translation,
  surahName,
  verseNumber,
  onPress
}) => {
  return (
    <Card onPress={onPress} style={styles.card}>
      <Text style={styles.header}>Daily Ayah</Text>

      <ArabicText type="quran" style={styles.arabic}>
        {arabicText}
      </ArabicText>

      <View style={styles.divider} />

      <Text style={styles.translation}>{translation}</Text>

      <Text style={styles.reference}>
        {surahName} {verseNumber}
      </Text>
    </Card>
  );
};
```

---

## 8. Navigation Components

| Flutter Widget | React Native Component | Notes |
|---------------|----------------------|-------|
| `BottomNavigationBar` | **Custom `BottomTabs`** | Apple-style tabs |
| `AppBar` | `Header` from React Navigation | Customized |
| `Drawer` | `Drawer` from React Navigation | iOS: side menu |
| `TabBar` | `createMaterialTopTabNavigator` | For Quran tabs |

### Bottom Tabs (Apple Style)

**Flutter:** `lib/src/features/bottom_tab/widgets/apple_bottom_tab.dart`

**React Native:** `app/navigators/BottomTabNavigator.tsx` (custom tab bar)

```typescript
const BottomTabs = createBottomTabNavigator();

export const BottomTabNavigator = () => {
  return (
    <BottomTabs.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <BottomTabs.Screen
        name="Pray"
        component={PrayStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <Icon name="pray" color={focused ? colors.pray : colors.inactive} />
          ),
        }}
      />
      {/* Other tabs... */}
    </BottomTabs.Navigator>
  );
};

// Custom tab bar matching Flutter's Apple style
const CustomTabBar: FC<BottomTabBarProps> = ({ state, navigation }) => {
  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tab}
            onPress={() => navigation.navigate(route.name)}
          >
            {isFocused && <View style={styles.activeIndicator} />}

            <Icon
              name={getTabIcon(route.name)}
              color={isFocused ? getTabColor(route.name) : colors.inactive}
            />

            <Text style={[
              styles.label,
              { color: isFocused ? getTabColor(route.name) : colors.inactive }
            ]}>
              {route.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
```

---

## 9. Modal & Sheet Components

| Flutter Widget | React Native Component | Library |
|---------------|----------------------|---------|
| `ModalBottomSheet` | `BottomSheet` | @gorhom/bottom-sheet |
| `AlertDialog` | `Alert.alert()` | Native |
| `Dialog` | **Custom `Modal` component** | |
| `Snackbar` | `Toast` | react-native-toast-message |

---

## 10. Animation Components

| Flutter Widget | React Native Component | Notes |
|---------------|----------------------|-------|
| `AnimatedContainer` | `Animated.View` | Reanimated 2 preferred |
| `FadeTransition` | `Animated.FadeIn/Out` | |
| `SlideTransition` | `Animated.SlideIn/Out` | |
| `ScaleTransition` | `Animated.Scale` | |
| `Lottie` | `LottieView` | from lottie-react-native |

---

## 11. Image & Icon Components

| Flutter Widget | React Native Component | Notes |
|---------------|----------------------|-------|
| `Image` | `Image` or `FastImage` | Use FastImage for caching |
| `Image.network` | `<FastImage source={{ uri: ... }} />` | |
| `Image.asset` | `<Image source={require('...')} />` | |
| `Icon` | `Icon` from react-native-vector-icons | |
| `SvgPicture` | `SvgUri` or `SvgXml` | react-native-svg |
| `CircleAvatar` | **Custom `Avatar` component** | |

---

## 12. Quran-Specific Components

### 12.1 Verse Card

**Flutter:** `lib/src/features/quran/widgets/verse_card.dart`

**React Native:** `app/components/Quran/VerseCard.tsx`

```typescript
interface VerseCardProps {
  verseNumber: number;
  arabicText: string;
  translation?: string;
  showTranslation: boolean;
  onLongPress?: () => void;
}

export const VerseCard: FC<VerseCardProps> = ({
  verseNumber,
  arabicText,
  translation,
  showTranslation,
  onLongPress
}) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onLongPress={onLongPress}
      delayLongPress={500}
    >
      <ArabicText type="quran" style={styles.arabic}>
        {arabicText}
      </ArabicText>

      {showTranslation && translation && (
        <>
          <View style={styles.divider} />
          <Text style={styles.translation}>{translation}</Text>
        </>
      )}

      <View style={styles.footer}>
        <Text style={styles.verseNumber}>{verseNumber}</Text>
      </View>
    </TouchableOpacity>
  );
};
```

### 12.2 Audio Player

**Flutter:** `lib/src/features/quran/widgets/audio_player.dart`

**React Native:** `app/components/Quran/AudioPlayer.tsx`

```typescript
interface AudioPlayerProps {
  currentVerse: number;
  totalVerses: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  progress: number; // 0-1
}

export const AudioPlayer: FC<AudioPlayerProps> = ({
  currentVerse,
  totalVerses,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  progress
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.progressBar}>
        <View style={[styles.progress, { width: `${progress * 100}%` }]} />
      </View>

      <View style={styles.controls}>
        <TouchableOpacity onPress={onPrevious}>
          <Icon name="skip-previous" size={32} />
        </TouchableOpacity>

        <TouchableOpacity onPress={onPlayPause}>
          <Icon name={isPlaying ? 'pause' : 'play'} size={48} />
        </TouchableOpacity>

        <TouchableOpacity onPress={onNext}>
          <Icon name="skip-next" size={32} />
        </TouchableOpacity>
      </View>

      <Text style={styles.verseInfo}>
        Verse {currentVerse} of {totalVerses}
      </Text>
    </View>
  );
};
```

---

## 13. Compass Component (Qibla)

**Flutter:** `lib/src/features/qibla/widgets/compass.dart`

**React Native:** `app/components/Qibla/CompassRose.tsx`

```typescript
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  withSpring
} from 'react-native-reanimated';

interface CompassRoseProps {
  rotation: number; // Device rotation
  qiblaDirection: number; // Qibla angle
}

export const CompassRose: FC<CompassRoseProps> = ({
  rotation,
  qiblaDirection
}) => {
  const animatedRotation = useSharedValue(rotation);

  useEffect(() => {
    animatedRotation.value = withSpring(rotation);
  }, [rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${animatedRotation.value}deg` }]
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Svg width={300} height={300}>
        {/* Compass rose graphics */}
        <Circle cx="150" cy="150" r="140" stroke="#ccc" strokeWidth="2" />

        {/* Cardinal directions */}
        <SvgText x="150" y="30" textAnchor="middle" fontSize="24">N</SvgText>
        <SvgText x="270" y="155" textAnchor="middle" fontSize="24">E</SvgText>
        <SvgText x="150" y="280" textAnchor="middle" fontSize="24">S</SvgText>
        <SvgText x="30" y="155" textAnchor="middle" fontSize="24">W</SvgText>

        {/* Kaaba indicator */}
        <Line
          x1="150"
          y1="150"
          x2={150 + Math.sin(qiblaDirection * Math.PI / 180) * 100}
          y2={150 - Math.cos(qiblaDirection * Math.PI / 180) * 100}
          stroke={colors.islamicGold}
          strokeWidth="4"
        />
      </Svg>
    </Animated.View>
  );
};
```

---

## 14. Component Library Summary

### Create These Shared Components:

**Essential (`app/components/Shared/`):**
- [ ] `ArabicText.tsx` - RTL Arabic text with Islamic fonts
- [ ] `Button.tsx` - Primary, secondary, text variants
- [ ] `Card.tsx` - Container with shadow
- [ ] `ListItem.tsx` - Reusable list item
- [ ] `Avatar.tsx` - Circular avatar
- [ ] `Icon.tsx` - Wrapper for vector icons
- [ ] `Divider.tsx` - Horizontal/vertical separator
- [ ] `LoadingSpinner.tsx` - Loading indicator
- [ ] `EmptyState.tsx` - Empty state UI

**Prayer (`app/components/Prayer/`):**
- [ ] `PrayerCard.tsx` - Prayer time card
- [ ] `PrayerListItem.tsx` - Prayer list item
- [ ] `PrayerCountdown.tsx` - Countdown timer
- [ ] `IslamicDateHeader.tsx` - Hijri + Gregorian date

**Quran (`app/components/Quran/`):**
- [ ] `VerseCard.tsx` - Verse display
- [ ] `SurahListItem.tsx` - Surah in list
- [ ] `AudioPlayer.tsx` - Audio controls
- [ ] `DailyAyahCard.tsx` - Daily verse card
- [ ] `BookmarkButton.tsx` - Bookmark toggle

**Qibla (`app/components/Qibla/`):**
- [ ] `CompassRose.tsx` - Rotating compass
- [ ] `KaabaIcon.tsx` - Kaaba indicator
- [ ] `CalibrationOverlay.tsx` - Calibration UI

**Community (`app/components/Community/`):**
- [ ] `GroupCard.tsx` - Reading group card
- [ ] `MemberListItem.tsx` - Group member
- [ ] `PostCard.tsx` - Feed post
- [ ] `ReactionButton.tsx` - Reaction UI

---

**Last Updated:** 2025-11-10
**Status:** Ready for implementation
**Next Steps:** Begin creating shared components in Ignite project
