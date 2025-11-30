/**
 * Complete Step
 *
 * Final step - ready to start using the app
 */
import React from "react"
import { View, ViewStyle, TextStyle, ScrollView } from "react-native"
import { Text } from "@/components/Text"
import { Button } from "@/components/Button"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { FontAwesome6, MaterialCommunityIcons } from "@expo/vector-icons"
import Animated, { FadeIn, ZoomIn } from "react-native-reanimated"

interface CompleteStepProps {
  payload: {
    title: string
    description: string
  }
  onNext: () => void
  onBack: () => void
  onSkip: () => void
  onComplete: () => void
  isFirst: boolean
  isLast: boolean
}

export const CompleteStep: React.FC<CompleteStepProps> = ({
  payload,
  onBack,
  onComplete,
}) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  return (
    <View style={themed($container)}>
      {/* Main Content */}
      <ScrollView
        style={themed($scrollView)}
        contentContainerStyle={themed($content)}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Icon */}
        <Animated.View
          entering={ZoomIn.duration(500).delay(100)}
          style={themed($iconContainer(colors))}
        >
          <MaterialCommunityIcons name="check-circle" size={100} color={colors.home} />
        </Animated.View>

        {/* Title */}
        <Animated.View entering={FadeIn.duration(400).delay(300)}>
          <Text style={themed($title(colors))}>{payload.title}</Text>
        </Animated.View>

        {/* Description */}
        <Animated.View entering={FadeIn.duration(400).delay(400)}>
          <Text style={themed($description(colors))}>{payload.description}</Text>
        </Animated.View>

        {/* Summary */}
        <Animated.View
          entering={FadeIn.duration(400).delay(500)}
          style={themed($summaryContainer(colors))}
        >
          <Text style={themed($summaryTitle(colors))}>What's Next?</Text>

          <View style={themed($summaryItem)}>
            <View style={themed($summaryIconContainer(colors.pray))}>
              <FontAwesome6 name="clock" size={18} color={colors.pray} />
            </View>
            <Text style={themed($summaryText(colors))}>Check your prayer times</Text>
          </View>

          <View style={themed($summaryItem)}>
            <View style={themed($summaryIconContainer(colors.read))}>
              <FontAwesome6 name="book-quran" size={18} color={colors.read} />
            </View>
            <Text style={themed($summaryText(colors))}>Start reading the Quran</Text>
          </View>

          <View style={themed($summaryItem)}>
            <View style={themed($summaryIconContainer(colors.ai))}>
              <FontAwesome6 name="robot" size={18} color={colors.ai} />
            </View>
            <Text style={themed($summaryText(colors))}>Ask the AI assistant anything</Text>
          </View>
        </Animated.View>

        {/* Dua */}
        <Animated.View
          entering={FadeIn.duration(400).delay(600)}
          style={themed($duaContainer(colors))}
        >
          <Text style={themed($duaArabic(colors))}>
            رَبَّنَا تَقَبَّلْ مِنَّا ۖ إِنَّكَ أَنتَ السَّمِيعُ الْعَلِيمُ
          </Text>
          <Text style={themed($duaTranslation(colors))}>
            "Our Lord, accept from us. Indeed, You are the All-Hearing, the All-Knowing."
          </Text>
        </Animated.View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={themed($bottomContainer)}>
        <Button
          text="Start Using JustDeen"
          style={themed($primaryButton(colors))}
          textStyle={themed($primaryButtonText)}
          onPress={onComplete}
          LeftAccessory={() => (
            <FontAwesome6
              name="mosque"
              size={18}
              color="#FFFFFF"
              style={{ marginRight: 10 }}
            />
          )}
        />
        <Button
          text="Back"
          style={themed($secondaryButton)}
          textStyle={themed($secondaryButtonText(colors))}
          onPress={onBack}
        />
      </View>
    </View>
  )
}

// Styles
const $container: ThemedStyle<ViewStyle> = {
  flex: 1,
  justifyContent: "space-between",
}

const $scrollView: ThemedStyle<ViewStyle> = {
  flex: 1,
}

const $content: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexGrow: 1,
  alignItems: "center",
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.lg,
  paddingBottom: spacing.md,
})

const $iconContainer: ThemedStyle<ViewStyle> = (colors) => ({
  marginBottom: 20,
})

const $title: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 36,
  fontWeight: "700",
  color: colors.text,
  textAlign: "center",
  marginBottom: 8,
})

const $description: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 17,
  color: colors.textSecondary,
  textAlign: "center",
  marginBottom: 28,
})

const $summaryContainer: ThemedStyle<ViewStyle> = (colors) => ({
  width: "100%",
  backgroundColor: colors.surface,
  borderRadius: 16,
  padding: 20,
  gap: 14,
})

const $summaryTitle: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 18,
  fontWeight: "600",
  color: colors.text,
  marginBottom: 4,
})

const $summaryItem: ThemedStyle<ViewStyle> = {
  flexDirection: "row",
  alignItems: "center",
  gap: 14,
}

const $summaryIconContainer: ThemedStyle<ViewStyle> = (color: string) => ({
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: color + "15",
  alignItems: "center",
  justifyContent: "center",
})

const $summaryText: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 15,
  color: colors.text,
  flex: 1,
})

const $duaContainer: ThemedStyle<ViewStyle> = (colors) => ({
  marginTop: 24,
  paddingVertical: 16,
  paddingHorizontal: 20,
  backgroundColor: colors.pray + "10",
  borderRadius: 16,
  alignItems: "center",
})

const $duaArabic: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 20,
  color: colors.pray,
  textAlign: "center",
  marginBottom: 8,
  fontFamily: "System",
})

const $duaTranslation: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 13,
  color: colors.textSecondary,
  textAlign: "center",
  fontStyle: "italic",
  lineHeight: 18,
})

const $bottomContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.xl,
  gap: 12,
})

const $primaryButton: ThemedStyle<ViewStyle> = (colors) => ({
  backgroundColor: colors.home,
  borderRadius: 14,
  paddingVertical: 16,
  borderWidth: 0,
})

const $primaryButtonText: ThemedStyle<TextStyle> = {
  color: "#FFFFFF",
  fontSize: 17,
  fontWeight: "600",
}

const $secondaryButton: ThemedStyle<ViewStyle> = {
  backgroundColor: "transparent",
  borderRadius: 14,
  paddingVertical: 12,
  borderWidth: 0,
}

const $secondaryButtonText: ThemedStyle<TextStyle> = (colors) => ({
  color: colors.textSecondary,
  fontSize: 15,
  fontWeight: "500",
})
