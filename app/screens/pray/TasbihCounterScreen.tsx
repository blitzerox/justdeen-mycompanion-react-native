/**
 * Tasbih Counter Screen
 * Full-screen digital tasbih counter with predefined and custom tasbihs
 */

import React, { useState } from "react"
import {
  View,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  Vibration,
} from "react-native"
import { Text, Screen } from "@/components"
import { FontAwesome6 } from "@expo/vector-icons"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import type { PrayStackScreenProps } from "@/navigators"
import { useTasbihCounter } from "@/hooks/useTasbihCounter"
import {
  PREDEFINED_TASBIHS,
  getTasbihsByCategory,
  type PredefinedTasbih,
} from "@/constants/predefinedTasbihs"

interface TasbihCounterScreenProps extends PrayStackScreenProps<"TasbihCounter"> {}

export const TasbihCounterScreen: React.FC<TasbihCounterScreenProps> = ({ navigation }) => {
  const { themed, theme: { colors } } = useAppTheme()
  const {
    currentCount,
    targetCount,
    isComplete,
    activeTasbih,
    increment,
    reset,
    setTarget,
    startTasbih,
    completeTasbih,
    tasbihStats,
  } = useTasbihCounter()

  const [showTasbihPicker, setShowTasbihPicker] = useState(false)

  /**
   * Handle counter increment
   */
  const handleIncrement = () => {
    increment()
    // Vibrate on tap
    Vibration.vibrate(10)
  }

  /**
   * Handle tasbih selection
   */
  const handleSelectTasbih = (tasbih: PredefinedTasbih) => {
    startTasbih(tasbih, undefined, tasbih.defaultCount)
    setShowTasbihPicker(false)
  }

  /**
   * Handle completion
   */
  const handleComplete = async () => {
    try {
      await completeTasbih()
    } catch (err) {
      Alert.alert("Error", "Failed to complete tasbih session")
    }
  }

  /**
   * Handle reset confirmation
   */
  const handleReset = () => {
    Alert.alert("Reset Counter", "Are you sure you want to reset the counter?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        style: "destructive",
        onPress: reset,
      },
    ])
  }

  const progress = targetCount > 0 ? (currentCount / targetCount) * 100 : 0

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]} contentContainerStyle={themed($screenContainer)}>
      <View style={themed($container)}>
        {/* Header */}
        <View style={themed($header)}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={themed($backButton)}>
            <FontAwesome6 name="chevron-left" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={themed($headerTitle(colors))}>Tasbih Counter</Text>
          <TouchableOpacity onPress={handleReset} style={themed($resetButton)}>
            <FontAwesome6 name="rotate-right" size={20} color={colors.textDim} />
          </TouchableOpacity>
        </View>

        {/* Selected Tasbih Info */}
        {activeTasbih && (
          <TouchableOpacity
            style={themed($tasbihInfo(colors))}
            onPress={() => setShowTasbihPicker(true)}
          >
            <View style={themed($tasbihTextContainer)}>
              <Text style={themed($arabicText(colors))}>{activeTasbih.arabicText}</Text>
              <Text style={themed($transliterationText(colors))}>{activeTasbih.transliteration}</Text>
              <Text style={themed($translationText(colors))}>{activeTasbih.translation}</Text>
            </View>
            <FontAwesome6 name="chevron-down" size={16} color={colors.textDim} />
          </TouchableOpacity>
        )}

        {!activeTasbih && (
          <TouchableOpacity
            style={themed($selectTasbihButton(colors))}
            onPress={() => setShowTasbihPicker(true)}
          >
            <FontAwesome6 name="list" size={20} color={colors.pray} />
            <Text style={themed($selectTasbihText(colors))}>Select a Tasbih</Text>
          </TouchableOpacity>
        )}

        {/* Main Counter Display */}
        <View style={themed($counterContainer)}>
          {/* Progress Ring */}
          <View style={themed($progressRing(colors, progress))}>
            <Text style={themed($countText(colors))}>{currentCount}</Text>
            <Text style={themed($targetText(colors))}>of {targetCount}</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={themed($progressBarContainer)}>
          <View style={themed($progressBarBackground(colors))}>
            <View style={themed($progressBarFill(colors, progress))} />
          </View>
          <Text style={themed($progressText(colors))}>{Math.round(progress)}%</Text>
        </View>

        {/* Counter Button */}
        <TouchableOpacity
          style={themed($counterButton(colors, isComplete))}
          onPress={handleIncrement}
          activeOpacity={0.8}
        >
          <FontAwesome6 name="hand" size={32} color="#FFFFFF" solid />
          <Text style={themed($counterButtonText)}>Tap to Count</Text>
        </TouchableOpacity>

        {/* Complete Button (shown when target reached) */}
        {isComplete && (
          <TouchableOpacity
            style={themed($completeButton(colors))}
            onPress={handleComplete}
            activeOpacity={0.8}
          >
            <FontAwesome6 name="check-circle" size={24} color="#FFFFFF" solid />
            <Text style={themed($completeButtonText)}>Complete & Save</Text>
          </TouchableOpacity>
        )}

        {/* Stats Footer */}
        <View style={themed($statsFooter)}>
          <View style={themed($statItem)}>
            <Text style={themed($statValue(colors))}>{tasbihStats.totalCount}</Text>
            <Text style={themed($statLabel(colors))}>Total Count</Text>
          </View>
          <View style={themed($statItem)}>
            <Text style={themed($statValue(colors))}>{tasbihStats.sessionsCompleted}</Text>
            <Text style={themed($statLabel(colors))}>Sessions</Text>
          </View>
        </View>
      </View>

      {/* Tasbih Picker Modal */}
      <Modal
        visible={showTasbihPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowTasbihPicker(false)}
      >
        <View style={themed($modalContainer(colors))}>
          <View style={themed($modalHeader)}>
            <Text style={themed($modalTitle(colors))}>Select Tasbih</Text>
            <TouchableOpacity onPress={() => setShowTasbihPicker(false)}>
              <FontAwesome6 name="xmark" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={themed($tasbihList)} showsVerticalScrollIndicator={false}>
            {/* After Prayer Tasbihs */}
            <Text style={themed($categoryTitle(colors))}>After Prayer</Text>
            {getTasbihsByCategory("after_prayer").map((tasbih) => (
              <TouchableOpacity
                key={tasbih.id}
                style={themed($tasbihItem(colors))}
                onPress={() => handleSelectTasbih(tasbih)}
              >
                <View style={themed($tasbihItemContent)}>
                  <Text style={themed($tasbihItemArabic(colors))}>{tasbih.arabicText}</Text>
                  <Text style={themed($tasbihItemTransliteration(colors))}>
                    {tasbih.transliteration}
                  </Text>
                  <Text style={themed($tasbihItemTranslation(colors))}>{tasbih.translation}</Text>
                </View>
                <View style={themed($tasbihItemCount(colors))}>
                  <Text style={themed($tasbihItemCountText(colors))}>{tasbih.defaultCount}x</Text>
                </View>
              </TouchableOpacity>
            ))}

            {/* General Dhikr */}
            <Text style={themed($categoryTitle(colors))}>General Dhikr</Text>
            {getTasbihsByCategory("general").map((tasbih) => (
              <TouchableOpacity
                key={tasbih.id}
                style={themed($tasbihItem(colors))}
                onPress={() => handleSelectTasbih(tasbih)}
              >
                <View style={themed($tasbihItemContent)}>
                  <Text style={themed($tasbihItemArabic(colors))}>{tasbih.arabicText}</Text>
                  <Text style={themed($tasbihItemTransliteration(colors))}>
                    {tasbih.transliteration}
                  </Text>
                  <Text style={themed($tasbihItemTranslation(colors))}>{tasbih.translation}</Text>
                </View>
                <View style={themed($tasbihItemCount(colors))}>
                  <Text style={themed($tasbihItemCountText(colors))}>{tasbih.defaultCount}x</Text>
                </View>
              </TouchableOpacity>
            ))}

            {/* Morning/Evening */}
            <Text style={themed($categoryTitle(colors))}>Morning & Evening</Text>
            {getTasbihsByCategory("morning_evening").map((tasbih) => (
              <TouchableOpacity
                key={tasbih.id}
                style={themed($tasbihItem(colors))}
                onPress={() => handleSelectTasbih(tasbih)}
              >
                <View style={themed($tasbihItemContent)}>
                  <Text style={themed($tasbihItemArabic(colors))}>{tasbih.arabicText}</Text>
                  <Text style={themed($tasbihItemTransliteration(colors))}>
                    {tasbih.transliteration}
                  </Text>
                  <Text style={themed($tasbihItemTranslation(colors))}>{tasbih.translation}</Text>
                </View>
                <View style={themed($tasbihItemCount(colors))}>
                  <Text style={themed($tasbihItemCountText(colors))}>{tasbih.defaultCount}x</Text>
                </View>
              </TouchableOpacity>
            ))}

            {/* Special */}
            <Text style={themed($categoryTitle(colors))}>Special</Text>
            {getTasbihsByCategory("special").map((tasbih) => (
              <TouchableOpacity
                key={tasbih.id}
                style={themed($tasbihItem(colors))}
                onPress={() => handleSelectTasbih(tasbih)}
              >
                <View style={themed($tasbihItemContent)}>
                  <Text style={themed($tasbihItemArabic(colors))}>{tasbih.arabicText}</Text>
                  <Text style={themed($tasbihItemTransliteration(colors))}>
                    {tasbih.transliteration}
                  </Text>
                  <Text style={themed($tasbihItemTranslation(colors))}>{tasbih.translation}</Text>
                </View>
                <View style={themed($tasbihItemCount(colors))}>
                  <Text style={themed($tasbihItemCountText(colors))}>{tasbih.defaultCount}x</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </Screen>
  )
}

// Styles
const $screenContainer: ThemedStyle<ViewStyle> = {
  flex: 1,
}

const $container: ThemedStyle<ViewStyle> = {
  flex: 1,
  padding: 20,
}

const $header: ThemedStyle<ViewStyle> = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 20,
}

const $backButton: ThemedStyle<ViewStyle> = {
  width: 40,
  height: 40,
  alignItems: "center",
  justifyContent: "center",
}

const $resetButton: ThemedStyle<ViewStyle> = {
  width: 40,
  height: 40,
  alignItems: "center",
  justifyContent: "center",
}

const $headerTitle: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 20,
  fontWeight: "700",
  color: colors.text,
})

const $tasbihInfo: ThemedStyle<ViewStyle> = (colors) => ({
  backgroundColor: colors.palette.surface,
  borderRadius: 16,
  padding: 16,
  marginBottom: 20,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
})

const $tasbihTextContainer: ThemedStyle<ViewStyle> = {
  flex: 1,
}

const $arabicText: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 24,
  fontWeight: "700",
  color: colors.text,
  marginBottom: 8,
  textAlign: "center",
})

const $transliterationText: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 16,
  fontWeight: "600",
  color: colors.pray,
  marginBottom: 4,
  textAlign: "center",
})

const $translationText: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 14,
  color: colors.textDim,
  textAlign: "center",
})

const $selectTasbihButton: ThemedStyle<ViewStyle> = (colors) => ({
  backgroundColor: colors.palette.surface,
  borderRadius: 16,
  padding: 20,
  marginBottom: 20,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
})

const $selectTasbihText: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 16,
  fontWeight: "600",
  color: colors.pray,
})

const $counterContainer: ThemedStyle<ViewStyle> = {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  marginVertical: 20,
}

const $progressRing: ThemedStyle<ViewStyle> = (colors, progress: number) => ({
  width: 240,
  height: 240,
  borderRadius: 120,
  borderWidth: 12,
  borderColor: colors.border,
  backgroundColor: colors.palette.surface,
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  // Simple progress indicator (for full ring, would need SVG)
  borderTopColor: progress >= 25 ? colors.pray : colors.border,
  borderRightColor: progress >= 50 ? colors.pray : colors.border,
  borderBottomColor: progress >= 75 ? colors.pray : colors.border,
  borderLeftColor: progress >= 100 ? colors.pray : colors.border,
})

const $countText: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 72,
  fontWeight: "700",
  color: colors.text,
})

const $targetText: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 18,
  color: colors.textDim,
  marginTop: 8,
})

const $progressBarContainer: ThemedStyle<ViewStyle> = {
  marginBottom: 20,
}

const $progressBarBackground: ThemedStyle<ViewStyle> = (colors) => ({
  height: 8,
  backgroundColor: colors.border,
  borderRadius: 4,
  overflow: "hidden",
  marginBottom: 8,
})

const $progressBarFill: ThemedStyle<ViewStyle> = (colors, progress: number) => ({
  height: "100%",
  width: `${progress}%`,
  backgroundColor: colors.pray,
  borderRadius: 4,
})

const $progressText: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 14,
  color: colors.textDim,
  textAlign: "center",
})

const $counterButton: ThemedStyle<ViewStyle> = (colors, isComplete: boolean) => ({
  backgroundColor: isComplete ? colors.border : colors.pray,
  borderRadius: 20,
  padding: 24,
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  marginBottom: 12,
})

const $counterButtonText: ThemedStyle<TextStyle> = {
  fontSize: 18,
  fontWeight: "700",
  color: "#FFFFFF",
}

const $completeButton: ThemedStyle<ViewStyle> = (colors) => ({
  backgroundColor: "#4CAF50",
  borderRadius: 20,
  padding: 20,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  marginBottom: 12,
})

const $completeButtonText: ThemedStyle<TextStyle> = {
  fontSize: 18,
  fontWeight: "700",
  color: "#FFFFFF",
}

const $statsFooter: ThemedStyle<ViewStyle> = {
  flexDirection: "row",
  justifyContent: "space-around",
  marginTop: 12,
}

const $statItem: ThemedStyle<ViewStyle> = {
  alignItems: "center",
}

const $statValue: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 24,
  fontWeight: "700",
  color: colors.text,
})

const $statLabel: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 12,
  color: colors.textDim,
  marginTop: 4,
})

// Modal Styles
const $modalContainer: ThemedStyle<ViewStyle> = (colors) => ({
  flex: 1,
  backgroundColor: colors.background,
})

const $modalHeader: ThemedStyle<ViewStyle> = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  padding: 20,
  borderBottomWidth: 1,
  borderBottomColor: "#E0E0E0",
}

const $modalTitle: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 24,
  fontWeight: "700",
  color: colors.text,
})

const $tasbihList: ThemedStyle<ViewStyle> = {
  flex: 1,
  padding: 20,
}

const $categoryTitle: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 14,
  fontWeight: "700",
  color: colors.textDim,
  textTransform: "uppercase",
  marginTop: 20,
  marginBottom: 12,
  letterSpacing: 0.5,
})

const $tasbihItem: ThemedStyle<ViewStyle> = (colors) => ({
  backgroundColor: colors.palette.surface,
  borderRadius: 12,
  padding: 16,
  marginBottom: 12,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
})

const $tasbihItemContent: ThemedStyle<ViewStyle> = {
  flex: 1,
}

const $tasbihItemArabic: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 18,
  fontWeight: "700",
  color: colors.text,
  marginBottom: 6,
})

const $tasbihItemTransliteration: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 14,
  fontWeight: "600",
  color: colors.pray,
  marginBottom: 4,
})

const $tasbihItemTranslation: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 12,
  color: colors.textDim,
})

const $tasbihItemCount: ThemedStyle<ViewStyle> = (colors) => ({
  backgroundColor: colors.pray + "20",
  borderRadius: 8,
  padding: 8,
  minWidth: 48,
  alignItems: "center",
})

const $tasbihItemCountText: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 14,
  fontWeight: "700",
  color: colors.pray,
})
