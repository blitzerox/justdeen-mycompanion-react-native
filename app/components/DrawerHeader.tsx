/**
 * Drawer Header Component
 * Displays user profile information at the top of the drawer
 */
import React from "react"
import { View, Text, TouchableOpacity, Image, ViewStyle, TextStyle } from "react-native"
import { FontAwesome6 } from "@expo/vector-icons"
import { useAppTheme } from "@/theme/context"
import { useAuth } from "@/context/AuthContext"
import type { ThemedStyle } from "@/theme/types"

interface DrawerHeaderProps {
  navigation: any
}

const DEFAULT_AVATAR = "https://ui-avatars.com/api/?name=User&background=random"

export const DrawerHeader: React.FC<DrawerHeaderProps> = ({ navigation }) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()
  const { user, isAuthenticated } = useAuth()

  const handleProfilePress = () => {
    navigation.navigate("MoreTab", { screen: "ProfileSettings" })
    navigation.closeDrawer()
  }

  if (!isAuthenticated || !user) {
    return (
      <View style={themed($container)}>
        <TouchableOpacity
          style={themed($card(colors))}
          onPress={handleProfilePress}
          activeOpacity={0.7}
        >
          <View style={themed($avatar(colors))}>
            <FontAwesome6 name="user" size={20} color={colors.textDim} />
          </View>
          <View style={themed($userInfo)}>
            <Text style={themed($userName(colors))}>Guest User</Text>
            <Text style={themed($userSubtext(colors))}>Tap to login</Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }

  const displayName = user.displayName || "Believer"
  const email = user.email || ""
  const avatarUri = user.photoUrl || `${DEFAULT_AVATAR}&name=${encodeURIComponent(displayName)}`

  return (
    <View style={themed($container)}>
      <TouchableOpacity
        style={themed($card(colors))}
        onPress={handleProfilePress}
        activeOpacity={0.7}
      >
        <Image source={{ uri: avatarUri }} style={themed($avatarImage(colors))} />
        <View style={themed($userInfo)}>
          <Text style={themed($userName(colors))} numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={themed($userSubtext(colors))} numberOfLines={1}>
            {email}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  )
}

// Styles
const $container: ThemedStyle<ViewStyle> = {
  padding: 16,
  paddingTop: 16,
}

const $card: ThemedStyle<ViewStyle> = (colors) => ({
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: colors.palette.neutral100,
  borderRadius: 12,
  padding: 12,
  borderWidth: 1,
  borderColor: colors.border,
})

const $avatar: ThemedStyle<ViewStyle> = (colors) => ({
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: colors.palette.neutral200,
  alignItems: "center",
  justifyContent: "center",
  marginRight: 12,
})

const $avatarImage: ThemedStyle<ViewStyle> = (colors) => ({
  width: 48,
  height: 48,
  borderRadius: 24,
  marginRight: 12,
  borderWidth: 1,
  borderColor: colors.border,
})

const $userInfo: ThemedStyle<ViewStyle> = {
  flex: 1,
}

const $userName: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 16,
  fontWeight: "600",
  color: colors.text,
  marginBottom: 2,
})

const $userSubtext: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 13,
  color: colors.textDim,
})
