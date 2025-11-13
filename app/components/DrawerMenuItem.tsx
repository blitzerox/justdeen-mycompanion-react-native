/**
 * Drawer Menu Item Component
 * Reusable component for drawer navigation items
 */
import React from "react"
import { TouchableOpacity, View, Text, ViewStyle, TextStyle } from "react-native"
import { FontAwesome6 } from "@expo/vector-icons"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export interface DrawerMenuItemProps {
  icon: string
  label: string
  onPress: () => void
  iconColor?: string
  isActive?: boolean
}

export const DrawerMenuItem: React.FC<DrawerMenuItemProps> = ({
  icon,
  label,
  onPress,
  iconColor,
  isActive = false,
}) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  const finalIconColor = iconColor || (isActive ? colors.tint : colors.text)

  return (
    <TouchableOpacity
      style={themed($menuItem(isActive, colors))}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={themed($iconContainer)}>
        <FontAwesome6 name={icon as any} size={20} color={finalIconColor} solid={isActive} />
      </View>
      <Text style={themed($menuItemText(isActive, colors))}>{label}</Text>
    </TouchableOpacity>
  )
}

// Styles
const $menuItem: ThemedStyle<ViewStyle> = (isActive: boolean, colors) => ({
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: 14,
  paddingHorizontal: 20,
  backgroundColor: isActive ? colors.palette.neutral200 : "transparent",
  borderRadius: 8,
  marginHorizontal: 12,
  marginVertical: 2,
})

const $iconContainer: ThemedStyle<ViewStyle> = {
  width: 28,
  marginRight: 16,
  alignItems: "center",
}

const $menuItemText: ThemedStyle<TextStyle> = (isActive: boolean, colors) => ({
  fontSize: 16,
  fontWeight: isActive ? "600" : "400",
  color: isActive ? colors.text : colors.textDim,
  flex: 1,
})
