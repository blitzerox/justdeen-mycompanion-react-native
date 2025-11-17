/**
 * Custom Drawer Content Component
 * Main drawer navigation menu with user profile, shortcuts grid, and menu items
 */
import React, { useState } from "react"
import { View, ScrollView, SafeAreaView, ViewStyle, TextStyle, Share, Linking, Alert, Text, TouchableOpacity } from "react-native"
import { DrawerContentComponentProps } from "@react-navigation/drawer"
import { useAppTheme } from "@/theme/context"
import { useAuth } from "@/context/AuthContext"
import { FontAwesome6 } from "@expo/vector-icons"
import type { ThemedStyle } from "@/theme/types"
import { DrawerHeader } from "./DrawerHeader"
import { DrawerShortcutCard } from "./DrawerShortcutCard"
import { DrawerMenuItem } from "./DrawerMenuItem"

interface Shortcut {
  id: string
  icon: string
  label: string
  iconColor: string
  onPress: () => void
}

export const CustomDrawerContent: React.FC<DrawerContentComponentProps> = (props) => {
  const { navigation, state } = props
  const {
    themed,
    theme: { colors },
  } = useAppTheme()
  const { logout } = useAuth()
  const [showAllShortcuts, setShowAllShortcuts] = useState(false)

  // Get the active route name
  const activeRouteName = state.routes[state.index]?.name

  const handleShareApp = async () => {
    try {
      await Share.share({
        message: "Check out JustDeen - Your Islamic Companion App! 🕌",
        title: "JustDeen App",
      })
    } catch (error) {
      console.error("Share error:", error)
    }
  }

  const handleRateApp = () => {
    const appStoreUrl = "https://apps.apple.com/app/justdeen"
    const playStoreUrl = "https://play.google.com/store/apps/details?id=com.justdeen"

    Alert.alert(
      "Rate JustDeen",
      "Thank you for using JustDeen! Please rate us on the App Store.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Rate Now",
          onPress: () => Linking.openURL(appStoreUrl).catch(() => {
            Linking.openURL(playStoreUrl)
          })
        },
      ]
    )
  }

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await logout()
            navigation.closeDrawer()
          }
        },
      ]
    )
  }

  // Define shortcuts - Now navigating to specific screens
  const allShortcuts: Shortcut[] = [
    {
      id: "prayer-times",
      icon: "clock",
      label: "Prayer Times",
      iconColor: colors.pray,
      onPress: () => {
        navigation.navigate("MainTabs", {
          screen: "PrayTab",
          params: { screen: "PrayerTimesHome" }
        })
        navigation.closeDrawer()
      },
    },
    {
      id: "quran-reader",
      icon: "book-quran",
      label: "Quran Reader",
      iconColor: colors.read,
      onPress: () => {
        navigation.navigate("MainTabs", {
          screen: "ReadTab",
          params: { screen: "QuranHome" }
        })
        navigation.closeDrawer()
      },
    },
    {
      id: "tasbih-counter",
      icon: "hand",
      label: "Tasbih Counter",
      iconColor: "#9C27B0",
      onPress: () => {
        navigation.navigate("MainTabs", {
          screen: "ReflectTab",
          params: { screen: "TasbihCounter" }
        })
        navigation.closeDrawer()
      },
    },
    {
      id: "qibla-finder",
      icon: "compass",
      label: "Qibla Finder",
      iconColor: colors.pray,
      onPress: () => {
        navigation.navigate("MainTabs", {
          screen: "PrayTab",
          params: { screen: "QiblaCompass" }
        })
        navigation.closeDrawer()
      },
    },
    {
      id: "dua-collection",
      icon: "hands-praying",
      label: "Dua Collection",
      iconColor: colors.reflect,
      onPress: () => {
        navigation.navigate("MainTabs", {
          screen: "ReflectTab",
          params: { screen: "DuasCategories" }
        })
        navigation.closeDrawer()
      },
    },
  ]

  // Show only 8 shortcuts (4 rows x 2 columns) initially
  const visibleShortcuts = showAllShortcuts ? allShortcuts : allShortcuts.slice(0, 8)
  const hasMoreShortcuts = allShortcuts.length > 8

  return (
    <SafeAreaView style={themed($container)} edges={["top", "bottom"]}>
      <ScrollView
        style={themed($scrollView)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={themed($scrollContent)}
      >
        {/* User Profile Header */}
        <DrawerHeader navigation={navigation} />

        {/* Your Shortcuts Section */}
        <View style={themed($section)}>
          <Text style={themed($sectionTitle(colors))}>Your Shortcuts</Text>

          {/* 2-Column Grid */}
          <View style={themed($shortcutsGrid)}>
            {visibleShortcuts.map((shortcut, index) => {
              // Add margin to every odd index item (right column)
              const isRightColumn = index % 2 !== 0
              return (
                <View
                  key={shortcut.id}
                  style={[
                    themed($gridItem),
                    isRightColumn && themed($gridItemRight)
                  ]}
                >
                  <DrawerShortcutCard
                    icon={shortcut.icon}
                    label={shortcut.label}
                    iconColor={shortcut.iconColor}
                    onPress={shortcut.onPress}
                  />
                </View>
              )
            })}
          </View>

          {/* Show More/Less Button */}
          {hasMoreShortcuts && (
            <TouchableOpacity
              style={themed($showMoreButton(colors))}
              onPress={() => setShowAllShortcuts(!showAllShortcuts)}
              activeOpacity={0.7}
            >
              <Text style={themed($showMoreText(colors))}>
                {showAllShortcuts ? "Show Less" : "Show More"}
              </Text>
              <FontAwesome6
                name={showAllShortcuts ? "chevron-up" : "chevron-down"}
                size={12}
                color={colors.tint}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Divider */}
        <View style={themed($divider(colors))} />

        {/* Options Section */}
        <View style={themed($section)}>
          <TouchableOpacity
            style={themed($optionRow)}
            onPress={() => {
              navigation.navigate("MainTabs", {
                screen: "ReflectTab",
                params: { screen: "Achievements" }
              })
              navigation.closeDrawer()
            }}
            activeOpacity={0.7}
          >
            <FontAwesome6 name="trophy" size={18} color={colors.tint} solid />
            <Text style={themed($optionText(colors))}>Achievements</Text>
          </TouchableOpacity>
          <View style={themed($divider(colors))} />

          <TouchableOpacity
            style={themed($optionRow)}
            onPress={() => {
              navigation.navigate("MainTabs", {
                screen: "ReflectTab",
                params: { screen: "SettingsHome" }
              })
              navigation.closeDrawer()
            }}
            activeOpacity={0.7}
          >
            <FontAwesome6 name="gear" size={18} color={colors.tint} solid />
            <Text style={themed($optionText(colors))}>Settings</Text>
          </TouchableOpacity>
          <View style={themed($divider(colors))} />

          <TouchableOpacity
            style={themed($optionRow)}
            onPress={() => {
              navigation.navigate("MainTabs", {
                screen: "MoreTab",
                params: { screen: "About" }
              })
              navigation.closeDrawer()
            }}
            activeOpacity={0.7}
          >
            <FontAwesome6 name="circle-info" size={18} color={colors.tint} solid />
            <Text style={themed($optionText(colors))}>About</Text>
          </TouchableOpacity>
          <View style={themed($divider(colors))} />

          <TouchableOpacity
            style={themed($optionRow)}
            onPress={handleShareApp}
            activeOpacity={0.7}
          >
            <FontAwesome6 name="share-nodes" size={18} color={colors.tint} solid />
            <Text style={themed($optionText(colors))}>Share App</Text>
          </TouchableOpacity>
          <View style={themed($divider(colors))} />

          <TouchableOpacity
            style={themed($optionRow)}
            onPress={handleRateApp}
            activeOpacity={0.7}
          >
            <FontAwesome6 name="star" size={18} color={colors.tint} solid />
            <Text style={themed($optionText(colors))}>Rate Us</Text>
          </TouchableOpacity>
          <View style={themed($divider(colors))} />

          <TouchableOpacity
            style={themed($optionRow)}
            onPress={() => {
              Alert.alert("Help & Support", "Support feature coming soon!")
            }}
            activeOpacity={0.7}
          >
            <FontAwesome6 name="circle-question" size={18} color={colors.tint} solid />
            <Text style={themed($optionText(colors))}>Help & Support</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Card */}
        <View style={themed($section)}>
          <TouchableOpacity
            style={themed($logoutCard(colors))}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Text style={themed($logoutText(colors))}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

// Styles
const $container: ThemedStyle<ViewStyle> = (theme) => ({
  flex: 1,
  backgroundColor: theme.colors.background,
})

const $scrollView: ThemedStyle<ViewStyle> = {
  flex: 1,
}

const $scrollContent: ThemedStyle<ViewStyle> = {
  paddingBottom: 24,
}

const $section: ThemedStyle<ViewStyle> = {
  paddingHorizontal: 16,
  paddingVertical: 12,
}

const $sectionTitle: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 14,
  fontWeight: "600",
  color: colors.textDim,
  marginBottom: 12,
  textTransform: "uppercase",
  letterSpacing: 0.5,
})

const $shortcutsGrid: ThemedStyle<ViewStyle> = {
  flexDirection: "row",
  flexWrap: "wrap",
  marginHorizontal: -4,
}

const $gridItem: ThemedStyle<ViewStyle> = {
  width: "50%",
  paddingHorizontal: 4,
  marginBottom: 8,
}

const $gridItemRight: ThemedStyle<ViewStyle> = {
  // No additional styles needed, just for clarity
}

const $showMoreButton: ThemedStyle<ViewStyle> = (colors) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  paddingVertical: 12,
  marginTop: 4,
  borderRadius: 8,
  backgroundColor: colors.palette.neutral100,
  borderWidth: 1,
  borderColor: colors.border,
})

const $showMoreText: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 14,
  fontWeight: "500",
  color: colors.tint,
})

const $divider: ThemedStyle<ViewStyle> = (colors) => ({
  height: 1,
  backgroundColor: colors.border,
  marginVertical: 8,
  marginHorizontal: 16,
})

const $optionsGrid: ThemedStyle<ViewStyle> = {
  flexDirection: "row",
  flexWrap: "wrap",
  marginHorizontal: -4,
}

const $optionRow: ThemedStyle<ViewStyle> = {
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: 16,
  gap: 12,
}

const $optionText: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 15,
  fontWeight: "500",
  color: colors.text,
})

const $logoutCard: ThemedStyle<ViewStyle> = (colors) => ({
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.palette.neutral100,
  borderRadius: 12,
  paddingVertical: 14,
  paddingHorizontal: 16,
  borderWidth: 1,
  borderColor: colors.border,
})

const $logoutText: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 16,
  fontWeight: "600",
  color: colors.text,
})
