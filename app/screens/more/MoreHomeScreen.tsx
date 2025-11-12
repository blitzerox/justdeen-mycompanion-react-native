/**
 * More Home Screen
 *
 * Main "More" tab screen with additional features and settings access
 * - Quick access to Settings
 * - Additional features and tools
 * - About and support links
 */
import React from "react"
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native"
import { Screen } from "@/components"
import { useAppTheme } from "@/theme/context"
import { useAuth } from "@/context/AuthContext"
import { FontAwesome6 } from "@expo/vector-icons"
import type { MoreStackScreenProps } from "@/navigators"
import type { ThemedStyle } from "@/theme/types"

interface FeatureItem {
  id: string
  title: string
  subtitle: string
  icon: string
  iconColor: string
  iconBg: string
  onPress: () => void
}

export const MoreHomeScreen: React.FC<MoreStackScreenProps<"MoreHome">> = ({ navigation }) => {
  const { themed, theme: { colors } } = useAppTheme()
  const { user, isAuthenticated } = useAuth()

  // Feature items
  const features: FeatureItem[] = [
    {
      id: "settings",
      title: "Settings",
      subtitle: "App preferences and configuration",
      icon: "gear",
      iconColor: "#FFFFFF",
      iconBg: colors.more,
      onPress: () => navigation.navigate("SettingsHome"),
    },
    {
      id: "about",
      title: "About",
      subtitle: "App information and version",
      icon: "circle-info",
      iconColor: "#FFFFFF",
      iconBg: "#007AFF",
      onPress: () => navigation.navigate("About"),
    },
    {
      id: "subscription",
      title: "Premium",
      subtitle: "Unlock premium features",
      icon: "crown",
      iconColor: "#FFFFFF",
      iconBg: "#FFD60A",
      onPress: () => navigation.navigate("Subscription"),
    },
  ]

  return (
    <Screen preset="fixed" safeAreaEdges={["top", "bottom"]} contentContainerStyle={themed($container(colors))}>
      {/* Custom Header */}
      <View style={themed($header)}>
        <View style={themed($headerLeft)}>
          <View style={themed($avatar(colors))}>
            <FontAwesome6 name="ellipsis" size={20} color={colors.more} solid />
          </View>
          <Text style={themed($greeting(colors))}>More</Text>
        </View>
        <View style={themed($headerRight)}>
          <TouchableOpacity
            style={themed($iconButton(colors))}
            onPress={() => navigation.navigate("SettingsHome")}
            activeOpacity={0.7}
          >
            <FontAwesome6 name="gear" size={20} color={colors.more} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={themed($scrollView)}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Section */}
        {isAuthenticated && user && (
          <View style={themed($profileCard(colors))}>
            <View style={themed($profileAvatar(colors))}>
              <FontAwesome6 name="user" size={32} color={colors.more} />
            </View>
            <View style={themed($profileInfo)}>
              <Text style={themed($profileName(colors))}>
                {user.displayName || "User"}
              </Text>
              <Text style={themed($profileEmail(colors))}>
                {user.email || ""}
              </Text>
            </View>
            <TouchableOpacity
              style={themed($profileEditButton(colors))}
              onPress={() => navigation.navigate("ProfileSettings")}
              activeOpacity={0.7}
            >
              <FontAwesome6 name="pen" size={16} color={colors.more} />
            </TouchableOpacity>
          </View>
        )}

        {/* Features Grid */}
        <View style={themed($section)}>
          <Text style={themed($sectionTitle(colors))}>Features</Text>
          {features.map((feature) => (
            <TouchableOpacity
              key={feature.id}
              style={themed($featureCard(colors))}
              onPress={feature.onPress}
              activeOpacity={0.7}
            >
              <View style={themed($featureLeft)}>
                <View style={themed($featureIconContainer(feature.iconBg))}>
                  <FontAwesome6 name={feature.icon as any} size={24} color={feature.iconColor} solid />
                </View>
                <View style={themed($featureInfo)}>
                  <Text style={themed($featureTitle(colors))}>{feature.title}</Text>
                  <Text style={themed($featureSubtitle(colors))}>{feature.subtitle}</Text>
                </View>
              </View>
              <FontAwesome6 name="chevron-right" size={16} color={colors.textDim} />
            </TouchableOpacity>
          ))}
        </View>

        {/* App Info */}
        <View style={themed($footer)}>
          <Text style={themed($footerText(colors))}>JustDeen MyCompanion</Text>
          <Text style={themed($footerVersion(colors))}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </Screen>
  )
}

// Styles
const $container: ThemedStyle<any> = (colors) => ({
  flex: 1,
  backgroundColor: colors.background,
})

const $scrollView: ThemedStyle<any> = {
  flex: 1,
}

// Profile Card Styles
const $profileCard: ThemedStyle<any> = (colors) => ({
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: colors.surface,
  marginHorizontal: 16,
  marginTop: 16,
  marginBottom: 24,
  padding: 16,
  borderRadius: 16,
})

const $profileAvatar: ThemedStyle<any> = (colors) => ({
  width: 64,
  height: 64,
  borderRadius: 32,
  backgroundColor: colors.more + "20",
  alignItems: "center",
  justifyContent: "center",
  marginRight: 12,
})

const $profileInfo: ThemedStyle<any> = {
  flex: 1,
}

const $profileName: ThemedStyle<any> = (colors) => ({
  fontSize: 18,
  fontWeight: "700",
  color: colors.text,
  marginBottom: 4,
})

const $profileEmail: ThemedStyle<any> = (colors) => ({
  fontSize: 14,
  color: colors.textDim,
})

const $profileEditButton: ThemedStyle<any> = (colors) => ({
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: colors.more + "20",
  alignItems: "center",
  justifyContent: "center",
})

// Section Styles
const $section: ThemedStyle<any> = {
  paddingHorizontal: 16,
  marginBottom: 24,
}

const $sectionTitle: ThemedStyle<any> = (colors) => ({
  fontSize: 13,
  fontWeight: "700",
  color: colors.textDim,
  textTransform: "uppercase",
  letterSpacing: 0.5,
  marginBottom: 12,
})

// Feature Card Styles
const $featureCard: ThemedStyle<any> = (colors) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  backgroundColor: colors.surface,
  padding: 16,
  borderRadius: 12,
  marginBottom: 8,
})

const $featureLeft: ThemedStyle<any> = {
  flexDirection: "row",
  alignItems: "center",
  flex: 1,
}

const $featureIconContainer: ThemedStyle<any> = (bgColor: string) => ({
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: bgColor,
  alignItems: "center",
  justifyContent: "center",
  marginRight: 12,
})

const $featureInfo: ThemedStyle<any> = {
  flex: 1,
}

const $featureTitle: ThemedStyle<any> = (colors) => ({
  fontSize: 16,
  fontWeight: "600",
  color: colors.text,
  marginBottom: 2,
})

const $featureSubtitle: ThemedStyle<any> = (colors) => ({
  fontSize: 13,
  color: colors.textDim,
})

// Header Styles
const $header: ThemedStyle<any> = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingHorizontal: 16,
  paddingTop: 8,
  paddingBottom: 16,
}

const $headerLeft: ThemedStyle<any> = {
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
}

const $avatar: ThemedStyle<any> = (colors) => ({
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: colors.more + "20",
  alignItems: "center",
  justifyContent: "center",
})

const $greeting: ThemedStyle<any> = (colors) => ({
  fontSize: 24,
  fontWeight: "700",
  color: colors.text,
  lineHeight: 24,
})

const $headerRight: ThemedStyle<any> = {
  flexDirection: "row",
  gap: 12,
}

const $iconButton: ThemedStyle<any> = (colors) => ({
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: colors.palette.surface,
  alignItems: "center",
  justifyContent: "center",
})

// Footer Styles
const $footer: ThemedStyle<any> = {
  alignItems: "center",
  paddingVertical: 24,
}

const $footerText: ThemedStyle<any> = (colors) => ({
  fontSize: 14,
  fontWeight: "600",
  color: colors.textDim,
  marginBottom: 4,
})

const $footerVersion: ThemedStyle<any> = (colors) => ({
  fontSize: 12,
  color: colors.textDim,
})
