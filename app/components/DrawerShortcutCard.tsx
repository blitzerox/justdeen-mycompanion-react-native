/**
 * Drawer Shortcut Card Component
 * Card button for drawer shortcuts in a 2-column grid
 */
import React from "react"
import { TouchableOpacity, Text, ViewStyle, TextStyle } from "react-native"
import { FontAwesome6 } from "@expo/vector-icons"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface DrawerShortcutCardProps {
  icon: string
  label: string
  iconColor?: string
  onPress: () => void
}

export const DrawerShortcutCard: React.FC<DrawerShortcutCardProps> = ({
  icon,
  label,
  iconColor,
  onPress,
}) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  return (
    <TouchableOpacity
      style={themed($card(colors))}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <FontAwesome6
        name={icon as any}
        size={20}
        color={iconColor || colors.tint}
        solid
      />
      <Text style={themed($label(colors))} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  )
}

// Styles
const $card: ThemedStyle<ViewStyle> = (colors) => ({
  flex: 1,
  aspectRatio: 1.5,
  backgroundColor: colors.palette.neutral100,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.border,
  padding: 12,
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
})

const $label: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 13,
  fontWeight: "500",
  color: colors.text,
  textAlign: "center",
})
