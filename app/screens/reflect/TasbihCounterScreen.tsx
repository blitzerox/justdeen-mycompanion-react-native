/**
 * Tasbih Counter Screen
 *
 * Week 17: Digital tasbih counter
 * - Increment on tap
 * - Haptic feedback on count
 * - Reset button
 * - Set target count (33, 99, custom)
 * - Multiple dhikr types
 */
import React, { useState } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  Vibration,
  Alert,
} from "react-native"
import { Screen, Icon } from "@/components"
import { useAppTheme } from "@/theme/context"
import type { ReflectStackScreenProps } from "@/navigators"
import type { ThemedStyle } from "@/theme/types"

interface DhikrType {
  id: string
  arabic: string
  transliteration: string
  meaning: string
}

const DHIKR_TYPES: DhikrType[] = [
  {
    id: "subhanallah",
    arabic: "سُبْحَانَ اللّٰهِ",
    transliteration: "SubhanAllah",
    meaning: "Glory be to Allah",
  },
  {
    id: "alhamdulillah",
    arabic: "ٱلْحَمْدُ لِلّٰهِ",
    transliteration: "Alhamdulillah",
    meaning: "All praise is due to Allah",
  },
  {
    id: "allahuakbar",
    arabic: "اللّٰهُ أَكْبَرُ",
    transliteration: "Allahu Akbar",
    meaning: "Allah is the Greatest",
  },
  {
    id: "lailahaillallah",
    arabic: "لَا إِلٰهَ إِلَّا اللّٰهُ",
    transliteration: "La ilaha illallah",
    meaning: "There is no god but Allah",
  },
]

const TARGET_COUNTS = [33, 99, 100, 500, 1000]

export const TasbihCounterScreen: React.FC<ReflectStackScreenProps<"TasbihCounter">> = () => {
  const { themed, theme: { colors } } = useAppTheme()

  const [count, setCount] = useState(0)
  const [target, setTarget] = useState(33)
  const [selectedDhikr, setSelectedDhikr] = useState<DhikrType>(DHIKR_TYPES[0])
  const [showDhikrPicker, setShowDhikrPicker] = useState(false)
  const [showTargetPicker, setShowTargetPicker] = useState(false)

  const handleIncrement = () => {
    const newCount = count + 1
    setCount(newCount)

    // Haptic feedback
    Vibration.vibrate(10)

    // Show alert when target is reached
    if (newCount === target) {
      Alert.alert(
        "Target Reached!",
        `You have completed ${target} counts of ${selectedDhikr.transliteration}.\n\nMay Allah accept your dhikr.`,
        [
          { text: "Continue", onPress: () => {} },
          { text: "Reset", onPress: handleReset },
        ]
      )
    }
  }

  const handleReset = () => {
    Alert.alert(
      "Reset Counter",
      "Are you sure you want to reset the counter to 0?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => setCount(0),
        },
      ]
    )
  }

  const handleDhikrSelect = (dhikr: DhikrType) => {
    setSelectedDhikr(dhikr)
    setShowDhikrPicker(false)
  }

  const handleTargetSelect = (targetCount: number) => {
    setTarget(targetCount)
    setShowTargetPicker(false)
  }

  const progress = target > 0 ? (count / target) * 100 : 0
  const remaining = target - count

  return (
    <Screen preset="fixed" contentContainerStyle={themed($container(colors))}>
      {/* Main Counter Display */}
      <View style={themed($counterContainer)}>
        {/* Selected Dhikr */}
        <TouchableOpacity
          style={themed($dhikrSelector(colors))}
          onPress={() => setShowDhikrPicker(!showDhikrPicker)}
          activeOpacity={0.7}
        >
          <Text style={themed($dhikrArabic)}>{selectedDhikr.arabic}</Text>
          <Text style={themed($dhikrTransliteration(colors))}>
            {selectedDhikr.transliteration}
          </Text>
          <Text style={themed($dhikrMeaning(colors))}>{selectedDhikr.meaning}</Text>
          <Icon icon="caretDown" size={12} color={colors.textDim} />
        </TouchableOpacity>

        {/* Dhikr Picker */}
        {showDhikrPicker && (
          <View style={themed($pickerContainer(colors))}>
            {DHIKR_TYPES.map((dhikr) => (
              <TouchableOpacity
                key={dhikr.id}
                style={themed($pickerItem(colors, selectedDhikr.id === dhikr.id))}
                onPress={() => handleDhikrSelect(dhikr)}
                activeOpacity={0.7}
              >
                <Text style={themed($pickerArabic)}>{dhikr.arabic}</Text>
                <Text style={themed($pickerTransliteration(colors))}>
                  {dhikr.transliteration}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Count Display */}
        <TouchableOpacity
          style={themed($countCircle(colors, progress))}
          onPress={handleIncrement}
          activeOpacity={0.9}
        >
          <Text style={themed($countText(colors))}>{count}</Text>
          <Text style={themed($countLabel(colors))}>Count</Text>
        </TouchableOpacity>

        {/* Progress */}
        <View style={themed($progressContainer)}>
          <View style={themed($progressBar(colors))}>
            <View style={themed($progressFill(colors, progress))} />
          </View>
          <Text style={themed($progressText(colors))}>
            {remaining > 0 ? `${remaining} remaining` : "Target reached!"}
          </Text>
        </View>

        {/* Target Selector */}
        <TouchableOpacity
          style={themed($targetSelector(colors))}
          onPress={() => setShowTargetPicker(!showTargetPicker)}
          activeOpacity={0.7}
        >
          <Text style={themed($targetLabel(colors))}>Target</Text>
          <View style={themed($targetValue)}>
            <Text style={themed($targetText(colors))}>{target}</Text>
            <Icon icon="caretDown" size={12} color={colors.textDim} />
          </View>
        </TouchableOpacity>

        {/* Target Picker */}
        {showTargetPicker && (
          <View style={themed($pickerContainer(colors))}>
            {TARGET_COUNTS.map((targetCount) => (
              <TouchableOpacity
                key={targetCount}
                style={themed($pickerItem(colors, target === targetCount))}
                onPress={() => handleTargetSelect(targetCount)}
                activeOpacity={0.7}
              >
                <Text style={themed($pickerTransliteration(colors))}>
                  {targetCount} times
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Bottom Actions */}
      <View style={themed($actionsContainer)}>
        <TouchableOpacity
          style={themed($resetButton(colors))}
          onPress={handleReset}
          activeOpacity={0.7}
        >
          <Icon icon="refresh" size={20} color={colors.error} />
          <Text style={themed($resetButtonText(colors))}>Reset</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  )
}

// Styles
const $container: ThemedStyle<any> = (colors) => ({
  flex: 1,
  backgroundColor: colors.background,
})

const $counterContainer: ThemedStyle<any> = {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: 24,
  paddingVertical: 32,
}

const $dhikrSelector: ThemedStyle<any> = (colors) => ({
  alignItems: "center",
  paddingVertical: 20,
  paddingHorizontal: 24,
  backgroundColor: colors.palette.surface,
  borderRadius: 16,
  marginBottom: 40,
  minWidth: 280,
})

const $dhikrArabic: ThemedStyle<any> = {
  fontSize: 32,
  fontFamily: "uthman",
  marginBottom: 8,
}

const $dhikrTransliteration: ThemedStyle<any> = (colors) => ({
  fontSize: 18,
  fontWeight: "600",
  color: colors.reflect,
  marginBottom: 4,
})

const $dhikrMeaning: ThemedStyle<any> = (colors) => ({
  fontSize: 14,
  color: colors.textDim,
  marginBottom: 8,
})

const $pickerContainer: ThemedStyle<any> = (colors) => ({
  backgroundColor: colors.palette.surface,
  borderRadius: 12,
  marginBottom: 24,
  width: "100%",
  maxWidth: 320,
})

const $pickerItem: ThemedStyle<any> = (colors, isSelected: boolean) => ({
  paddingVertical: 16,
  paddingHorizontal: 20,
  backgroundColor: isSelected ? colors.reflect + "20" : "transparent",
  borderRadius: 8,
  alignItems: "center",
})

const $pickerArabic: ThemedStyle<any> = {
  fontSize: 24,
  fontFamily: "uthman",
  marginBottom: 4,
}

const $pickerTransliteration: ThemedStyle<any> = (colors) => ({
  fontSize: 15,
  fontWeight: "500",
  color: colors.text,
})

const $countCircle: ThemedStyle<any> = (colors, progress: number) => ({
  width: 240,
  height: 240,
  borderRadius: 120,
  backgroundColor: colors.palette.surface,
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 32,
  borderWidth: 8,
  borderColor: progress >= 100 ? colors.reflect : colors.palette.neutral200,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 4,
})

const $countText: ThemedStyle<any> = (colors) => ({
  fontSize: 72,
  fontWeight: "700",
  color: colors.reflect,
  marginBottom: 4,
})

const $countLabel: ThemedStyle<any> = (colors) => ({
  fontSize: 16,
  fontWeight: "500",
  color: colors.textDim,
  textTransform: "uppercase",
  letterSpacing: 1,
})

const $progressContainer: ThemedStyle<any> = {
  width: "100%",
  maxWidth: 280,
  marginBottom: 32,
}

const $progressBar: ThemedStyle<any> = (colors) => ({
  height: 8,
  backgroundColor: colors.palette.neutral200,
  borderRadius: 4,
  overflow: "hidden",
  marginBottom: 8,
})

const $progressFill: ThemedStyle<any> = (colors, progress: number) => ({
  height: "100%",
  width: `${Math.min(progress, 100)}%`,
  backgroundColor: colors.reflect,
  borderRadius: 4,
})

const $progressText: ThemedStyle<any> = (colors) => ({
  fontSize: 14,
  color: colors.textDim,
  textAlign: "center",
})

const $targetSelector: ThemedStyle<any> = (colors) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingVertical: 16,
  paddingHorizontal: 20,
  backgroundColor: colors.palette.surface,
  borderRadius: 12,
  width: "100%",
  maxWidth: 280,
})

const $targetLabel: ThemedStyle<any> = (colors) => ({
  fontSize: 16,
  fontWeight: "500",
  color: colors.textDim,
})

const $targetValue: ThemedStyle<any> = {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
}

const $targetText: ThemedStyle<any> = (colors) => ({
  fontSize: 18,
  fontWeight: "600",
  color: colors.reflect,
})

const $actionsContainer: ThemedStyle<any> = {
  paddingHorizontal: 24,
  paddingBottom: 32,
}

const $resetButton: ThemedStyle<any> = (colors) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: 16,
  paddingHorizontal: 24,
  backgroundColor: colors.palette.surface,
  borderRadius: 12,
  gap: 8,
})

const $resetButtonText: ThemedStyle<any> = (colors) => ({
  fontSize: 16,
  fontWeight: "600",
  color: colors.error,
})
