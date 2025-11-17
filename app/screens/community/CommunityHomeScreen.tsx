/**
 * Community Home Screen
 *
 * Main "Community" tab screen for social features
 * - Social feed for sharing achievements
 * - Community engagement features
 * - Connection with local mosques
 * - Global Muslim community posts
 */
import React, { useState } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ViewStyle,
  TextStyle,
} from "react-native"
import { Screen } from "@/components"
import { useAppTheme } from "@/theme/context"
import { useAuth } from "@/context/AuthContext"
import { FontAwesome6 } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { DrawerNavigationProp } from "@react-navigation/drawer"
import type { MoreStackScreenProps } from "@/navigators"
import type { ThemedStyle } from "@/theme/types"
import type { DrawerParamList } from "@/navigators/navigationTypes"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { spacing } from "@/theme/spacing"

type FeedFilter = "myMosque" | "city" | "global"

interface CommunityPost {
  id: string
  userName: string
  userAvatar: string
  timeAgo: string
  achievement: string
  description: string
  likes: number
  comments: number
  category: "prayer" | "quran" | "tasbih" | "general"
}

// Mock data for community posts
const mockPosts: CommunityPost[] = [
  {
    id: "1",
    userName: "Ahmed Hassan",
    userAvatar: "user",
    timeAgo: "2h ago",
    achievement: "Completed 30 Days Streak",
    description: "Alhamdulillah! Completed 30 consecutive days of 5 daily prayers.",
    likes: 124,
    comments: 18,
    category: "prayer",
  },
  {
    id: "2",
    userName: "Fatima Khan",
    userAvatar: "user",
    timeAgo: "5h ago",
    achievement: "Finished Juz 1",
    description: "Just completed the first Juz of the Quran! May Allah make it easy for all of us.",
    likes: 89,
    comments: 12,
    category: "quran",
  },
  {
    id: "3",
    userName: "Abdullah Ibrahim",
    userAvatar: "user",
    timeAgo: "1d ago",
    achievement: "10,000 Tasbih Count",
    description: "Reached 10,000 total tasbih count! SubhanAllah wa bihamdihi.",
    likes: 156,
    comments: 24,
    category: "tasbih",
  },
]

export const CommunityHomeScreen: React.FC<MoreStackScreenProps<"MoreHome">> = ({ navigation }) => {
  const { themed, theme: { colors } } = useAppTheme()
  const { user, isAuthenticated } = useAuth()
  const drawerNavigation = useNavigation<DrawerNavigationProp<DrawerParamList>>()
  const [selectedFilter, setSelectedFilter] = useState<FeedFilter>("city")
  const insets = useSafeAreaInsets()

  const getCategoryIcon = (category: CommunityPost["category"]) => {
    switch (category) {
      case "prayer":
        return "person-praying"
      case "quran":
        return "book-quran"
      case "tasbih":
        return "hand-holding-heart"
      default:
        return "trophy"
    }
  }

  const getCategoryColor = (category: CommunityPost["category"]) => {
    switch (category) {
      case "prayer":
        return colors.pray
      case "quran":
        return colors.read
      case "tasbih":
        return colors.reflect
      default:
        return colors.tint
    }
  }

  return (
    <Screen preset="fixed" safeAreaEdges={[]} contentContainerStyle={themed($container(colors))}>
      {/* Custom Header */}
      <View style={[themed($header), { paddingTop: insets.top + spacing.sm }]}>
        <View style={themed($headerLeft)}>
          <TouchableOpacity
            style={themed($hamburger(colors))}
            onPress={() => drawerNavigation.openDrawer()}
            activeOpacity={0.7}
          >
            <FontAwesome6 name="bars" size={24} color={colors.more} />
          </TouchableOpacity>
          <Text style={themed($greeting(colors))}>Community</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={themed($filterContainer)}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={themed($filterScroll)}>
          <TouchableOpacity
            style={themed($filterTab(selectedFilter === "myMosque", colors))}
            onPress={() => setSelectedFilter("myMosque")}
            activeOpacity={0.7}
          >
            <FontAwesome6
              name="mosque"
              size={16}
              color={selectedFilter === "myMosque" ? colors.more : colors.textDim}
            />
            <Text style={themed($filterTabText(selectedFilter === "myMosque", colors))}>
              My Mosque
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={themed($filterTab(selectedFilter === "city", colors))}
            onPress={() => setSelectedFilter("city")}
            activeOpacity={0.7}
          >
            <FontAwesome6
              name="building"
              size={16}
              color={selectedFilter === "city" ? colors.more : colors.textDim}
            />
            <Text style={themed($filterTabText(selectedFilter === "city", colors))}>
              My City
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={themed($filterTab(selectedFilter === "global", colors))}
            onPress={() => setSelectedFilter("global")}
            activeOpacity={0.7}
          >
            <FontAwesome6
              name="earth-americas"
              size={16}
              color={selectedFilter === "global" ? colors.more : colors.textDim}
            />
            <Text style={themed($filterTabText(selectedFilter === "global", colors))}>
              Global
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Community Feed */}
      <ScrollView
        style={themed($scrollView)}
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        {/* Coming Soon Message */}
        <View style={themed($comingSoonCard(colors))}>
          <FontAwesome6 name="rocket" size={32} color={colors.more} />
          <Text style={themed($comingSoonTitle(colors))}>Community Feed Coming Soon!</Text>
          <Text style={themed($comingSoonText(colors))}>
            We're building an amazing space for you to connect with fellow Muslims, share your
            achievements, and inspire each other on this blessed journey.
          </Text>
        </View>

        {/* Mock Posts Preview */}
        <View style={themed($section)}>
          <Text style={themed($sectionTitle(colors))}>Preview: What's Coming</Text>
          {mockPosts.map((post) => (
            <View key={post.id} style={themed($postCard(colors))}>
              {/* Post Header */}
              <View style={themed($postHeader)}>
                <View style={themed($postUserAvatar(colors))}>
                  <FontAwesome6 name={post.userAvatar as any} size={20} color={colors.textDim} />
                </View>
                <View style={themed($postUserInfo)}>
                  <Text style={themed($postUserName(colors))}>{post.userName}</Text>
                  <Text style={themed($postTimeAgo(colors))}>{post.timeAgo}</Text>
                </View>
                <View style={themed($postCategoryBadge(getCategoryColor(post.category)))}>
                  <FontAwesome6
                    name={getCategoryIcon(post.category) as any}
                    size={12}
                    color="#FFFFFF"
                  />
                </View>
              </View>

              {/* Post Content */}
              <View style={themed($postContent)}>
                <Text style={themed($postAchievement(colors))}>{post.achievement}</Text>
                <Text style={themed($postDescription(colors))}>{post.description}</Text>
              </View>

              {/* Post Actions */}
              <View style={themed($postActions)}>
                <View style={themed($postAction)}>
                  <FontAwesome6 name="heart" size={16} color={colors.textDim} />
                  <Text style={themed($postActionText(colors))}>{post.likes}</Text>
                </View>
                <View style={themed($postAction)}>
                  <FontAwesome6 name="comment" size={16} color={colors.textDim} />
                  <Text style={themed($postActionText(colors))}>{post.comments}</Text>
                </View>
                <View style={themed($postAction)}>
                  <FontAwesome6 name="share-nodes" size={16} color={colors.textDim} />
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Quick Access Features */}
        <View style={themed($section)}>
          <Text style={themed($sectionTitle(colors))}>Quick Access</Text>
          <TouchableOpacity
            style={themed($featureCard(colors))}
            onPress={() => navigation.navigate("Achievements")}
            activeOpacity={0.7}
          >
            <View style={themed($featureLeft)}>
              <View style={themed($featureIconContainer(colors.more))}>
                <FontAwesome6 name="trophy" size={24} color="#FFFFFF" solid />
              </View>
              <View style={themed($featureInfo)}>
                <Text style={themed($featureTitle(colors))}>My Achievements</Text>
                <Text style={themed($featureSubtitle(colors))}>View your progress and badges</Text>
              </View>
            </View>
            <FontAwesome6 name="chevron-right" size={16} color={colors.textDim} />
          </TouchableOpacity>

          <TouchableOpacity
            style={themed($featureCard(colors))}
            onPress={() => navigation.navigate("SettingsHome")}
            activeOpacity={0.7}
          >
            <View style={themed($featureLeft)}>
              <View style={themed($featureIconContainer("#2D5016"))}>
                <FontAwesome6 name="gear" size={24} color="#FFFFFF" solid />
              </View>
              <View style={themed($featureInfo)}>
                <Text style={themed($featureTitle(colors))}>Settings</Text>
                <Text style={themed($featureSubtitle(colors))}>App preferences and configuration</Text>
              </View>
            </View>
            <FontAwesome6 name="chevron-right" size={16} color={colors.textDim} />
          </TouchableOpacity>

          <TouchableOpacity
            style={themed($featureCard(colors))}
            onPress={() => navigation.navigate("About")}
            activeOpacity={0.7}
          >
            <View style={themed($featureLeft)}>
              <View style={themed($featureIconContainer("#007AFF"))}>
                <FontAwesome6 name="circle-info" size={24} color="#FFFFFF" solid />
              </View>
              <View style={themed($featureInfo)}>
                <Text style={themed($featureTitle(colors))}>About</Text>
                <Text style={themed($featureSubtitle(colors))}>App information and version</Text>
              </View>
            </View>
            <FontAwesome6 name="chevron-right" size={16} color={colors.textDim} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Floating Action Button - Create Post (Coming Soon) */}
      <TouchableOpacity
        style={themed($fab(colors))}
        activeOpacity={0.8}
        disabled
      >
        <FontAwesome6 name="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </Screen>
  )
}

// Styles
const $container: ThemedStyle<ViewStyle> = (colors) => ({
  flex: 1,
  backgroundColor: colors.background,
})

const $scrollView: ThemedStyle<ViewStyle> = {
  flex: 1,
}

// Header Styles
const $header: ThemedStyle<ViewStyle> = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingHorizontal: 16,
  paddingTop: 8,
  paddingBottom: 16,
}

const $headerLeft: ThemedStyle<ViewStyle> = {
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
}

const $hamburger: ThemedStyle<ViewStyle> = (colors) => ({
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: colors.more + "20",
  alignItems: "center",
  justifyContent: "center",
})

const $greeting: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 24,
  fontWeight: "700",
  color: colors.text,
  lineHeight: 24,
})

const $headerRight: ThemedStyle<ViewStyle> = {
  flexDirection: "row",
  gap: 12,
}

const $iconButton: ThemedStyle<ViewStyle> = (colors) => ({
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: colors.palette.surface,
  alignItems: "center",
  justifyContent: "center",
})

// Filter Tabs Styles
const $filterContainer: ThemedStyle<ViewStyle> = {
  paddingVertical: 12,
  borderBottomWidth: 1,
  borderBottomColor: "#E5E7EB",
}

const $filterScroll: ThemedStyle<ViewStyle> = {
  paddingHorizontal: 16,
  gap: 8,
}

const $filterTab: ThemedStyle<ViewStyle> = (isActive: boolean, colors) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: 6,
  paddingVertical: 8,
  paddingHorizontal: 16,
  borderRadius: 20,
  backgroundColor: isActive ? colors.more + "20" : colors.palette.neutral200,
})

const $filterTabText: ThemedStyle<TextStyle> = (isActive: boolean, colors) => ({
  fontSize: 14,
  fontWeight: isActive ? "600" : "400",
  color: isActive ? colors.more : colors.textDim,
})

// Coming Soon Card
const $comingSoonCard: ThemedStyle<ViewStyle> = (colors) => ({
  backgroundColor: colors.surface,
  marginHorizontal: 16,
  marginTop: 16,
  marginBottom: 24,
  padding: 24,
  borderRadius: 16,
  alignItems: "center",
})

const $comingSoonTitle: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 18,
  fontWeight: "700",
  color: colors.text,
  marginTop: 12,
  marginBottom: 8,
  textAlign: "center",
})

const $comingSoonText: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 14,
  color: colors.textDim,
  textAlign: "center",
  lineHeight: 20,
})

// Section Styles
const $section: ThemedStyle<ViewStyle> = {
  paddingHorizontal: 16,
  marginBottom: 24,
}

const $sectionTitle: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 13,
  fontWeight: "700",
  color: colors.textDim,
  textTransform: "uppercase",
  letterSpacing: 0.5,
  marginBottom: 12,
})

// Post Card Styles
const $postCard: ThemedStyle<ViewStyle> = (colors) => ({
  backgroundColor: colors.surface,
  padding: 16,
  borderRadius: 12,
  marginBottom: 12,
  opacity: 0.6,
})

const $postHeader: ThemedStyle<ViewStyle> = {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 12,
}

const $postUserAvatar: ThemedStyle<ViewStyle> = (colors) => ({
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: colors.palette.neutral200,
  alignItems: "center",
  justifyContent: "center",
  marginRight: 12,
})

const $postUserInfo: ThemedStyle<ViewStyle> = {
  flex: 1,
}

const $postUserName: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 15,
  fontWeight: "600",
  color: colors.text,
  marginBottom: 2,
})

const $postTimeAgo: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 12,
  color: colors.textDim,
})

const $postCategoryBadge: ThemedStyle<ViewStyle> = (bgColor: string) => ({
  width: 28,
  height: 28,
  borderRadius: 14,
  backgroundColor: bgColor,
  alignItems: "center",
  justifyContent: "center",
})

const $postContent: ThemedStyle<ViewStyle> = {
  marginBottom: 12,
}

const $postAchievement: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 16,
  fontWeight: "600",
  color: colors.text,
  marginBottom: 6,
})

const $postDescription: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 14,
  color: colors.textDim,
  lineHeight: 20,
})

const $postActions: ThemedStyle<ViewStyle> = {
  flexDirection: "row",
  alignItems: "center",
  gap: 20,
  paddingTop: 12,
  borderTopWidth: 1,
  borderTopColor: "#E5E7EB",
}

const $postAction: ThemedStyle<ViewStyle> = {
  flexDirection: "row",
  alignItems: "center",
  gap: 6,
}

const $postActionText: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 14,
  color: colors.textDim,
})

// Feature Card Styles
const $featureCard: ThemedStyle<ViewStyle> = (colors) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  backgroundColor: colors.surface,
  padding: 16,
  borderRadius: 12,
  marginBottom: 8,
})

const $featureLeft: ThemedStyle<ViewStyle> = {
  flexDirection: "row",
  alignItems: "center",
  flex: 1,
}

const $featureIconContainer: ThemedStyle<ViewStyle> = (bgColor: string) => ({
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: bgColor,
  alignItems: "center",
  justifyContent: "center",
  marginRight: 12,
})

const $featureInfo: ThemedStyle<ViewStyle> = {
  flex: 1,
}

const $featureTitle: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 16,
  fontWeight: "600",
  color: colors.text,
  marginBottom: 2,
})

const $featureSubtitle: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 13,
  color: colors.textDim,
})

// Floating Action Button
const $fab: ThemedStyle<ViewStyle> = (colors) => ({
  position: "absolute",
  bottom: 24,
  right: 24,
  width: 56,
  height: 56,
  borderRadius: 28,
  backgroundColor: colors.more,
  alignItems: "center",
  justifyContent: "center",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 8,
})
