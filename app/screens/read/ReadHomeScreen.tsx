/**
 * Read Home Screen
 *
 * Main landing screen for the Read tab
 * - Library: Al-Qur'an, Tafsir, Hadith
 * - Now Reading: Continue reading progress
 * - Community: Reading groups and social features
 */
import React from "react"
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ImageBackground,
  Image,
} from "react-native"
import type { ViewStyle } from "react-native"
import { Screen, Icon } from "@/components"
import { FontAwesome6 } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { DrawerNavigationProp } from "@react-navigation/drawer"
import type { ReadStackScreenProps } from "@/navigators"
import type { DrawerParamList } from "@/navigators/navigationTypes"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { spacing } from "@/theme/spacing"

const { width } = Dimensions.get("window")
const CARD_WIDTH = (width - 48) / 2.5

// Book cover images
const quranCover = require("../../../assets/images/books/quran_cover.jpg")
const tafsirCover = require("../../../assets/images/books/tafsir_cover.jpg")
const hadithCover = require("../../../assets/images/books/hadith_cover.jpg")
const duaCover = require("../../../assets/images/books/dua_cover.jpg")

interface LibraryCard {
  id: string
  title: string
  subtitle: string
  arabicName: string
  quote: string
  icon: string
  backgroundColor: string
  image: any
  route: keyof import("@/navigators").ReadStackParamList
}

export const ReadHomeScreen: React.FC<ReadStackScreenProps<"ReadHome">> = ({ navigation }) => {
  const { themed, theme } = useAppTheme()
  const colors = theme.colors
  const drawerNavigation = useNavigation<DrawerNavigationProp<DrawerParamList>>()
  const [isNowReadingGridView, setIsNowReadingGridView] = React.useState(false)
  const insets = useSafeAreaInsets()

  const libraryCards: LibraryCard[] = [
    {
      id: "quran",
      title: "Al-Qur'an",
      subtitle: "114 Surahs",
      arabicName: "ٱلْقُرْآن",
      quote: '"Recite the Quran, as it will come as an intercessor for its reciters" - Sahih Muslim',
      icon: "book",
      backgroundColor: colors.read,
      image: quranCover,
      route: "QuranHome",
    },
    {
      id: "tafsir",
      title: "Tafsir",
      subtitle: "Quranic Commentary",
      arabicName: "تفسير",
      quote: '"The best of you are those who learn the Quran and teach it" - Sahih Al-Bukhari',
      icon: "ladybug",
      backgroundColor: "#F4A261",
      image: tafsirCover,
      route: "QuranHome", // TODO: Update when Tafsir screen is ready
    },
    {
      id: "hadith",
      title: "Hadith",
      subtitle: "Sunnah",
      arabicName: "حديث",
      quote: '"I have left you with two things which, if you hold fast to them, you shall never be misguided"',
      icon: "community",
      backgroundColor: "#2A9D8F",
      image: hadithCover,
      route: "QuranHome", // TODO: Update when Hadith screen is ready
    },
    {
      id: "dua",
      title: "Daily Dua",
      subtitle: "Supplications",
      arabicName: "دعاء",
      quote: '"Dua is the weapon of the believer" - Al-Hakim',
      icon: "heart",
      backgroundColor: colors.reflect,
      image: duaCover,
      route: "QuranHome", // TODO: Update when Dua screen is ready
    },
  ]

  return (
  <Screen preset="fixed" safeAreaEdges={[]} contentContainerStyle={themed($container)}>
      {/* Custom Header */}
      <View style={[themed($header), { paddingTop: insets.top + spacing.sm }]}>
        <View style={themed($headerLeft)}>
          <TouchableOpacity
            style={themed($hamburger)}
            onPress={() => drawerNavigation.openDrawer()}
            activeOpacity={0.7}
          >
            <FontAwesome6 name="bars" size={24} color={colors.read} />
          </TouchableOpacity>
          <Text style={themed($greeting)}>Read</Text>
        </View>
        <View style={themed($headerRight)}>
          <TouchableOpacity
            style={themed($iconButton)}
            onPress={() => navigation.navigate("BookmarksList")}
            activeOpacity={0.7}
          >
            <FontAwesome6 name="bookmark" size={20} color={colors.read} solid />
          </TouchableOpacity>
          <TouchableOpacity
            style={themed($iconButton)}
            onPress={() => navigation.navigate("ReadingHistory")}
            activeOpacity={0.7}
          >
            <FontAwesome6 name="clock-rotate-left" size={20} color={colors.read} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={themed($scrollView)}
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        {/* Library Section */}
  <View style={themed($section)}>
          <Text style={themed($sectionTitle)}>Library</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={themed($libraryScrollContent)}
          >
            {libraryCards.map((card) => (
              <TouchableOpacity
                key={card.id}
                onPress={() => navigation.navigate(card.route as any)}
                activeOpacity={0.8}
                style={themed($libraryCardContainer)}
              >
                {/* Image Card */}
                <ImageBackground
                  source={card.image}
                  style={themed($libraryCard)}
                  imageStyle={themed($libraryCardImage)}
                  resizeMode="cover"
                >
                  {/* Decorative corner ornaments */}
                  <View style={$cardOrnament("top-left")} />
                  <View style={$cardOrnament("top-right")} />
                  <View style={$cardOrnament("bottom-left")} />
                  <View style={$cardOrnament("bottom-right")} />
                </ImageBackground>

                {/* Title below image */}
                <View style={themed($cardTitleContainer)}>
                  <Text style={themed($cardTitle)}>{card.title}</Text>
                  <Text style={themed($cardSubtitle)}>{card.subtitle}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Now Reading Section */}
        <View style={themed($section)}>
          <View style={themed($sectionHeader)}>
            <Text style={themed($sectionTitle)}>Now Reading</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setIsNowReadingGridView(!isNowReadingGridView)}
            >
              <View style={themed($listButton)}>
                <Icon icon={isNowReadingGridView ? "view" : "menu"} size={16} color={colors.read} />
                <Text style={themed($listButtonText)}>
                  {isNowReadingGridView ? "List" : "Grid"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {isNowReadingGridView ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={themed($nowReadingGridContent)}
            >
              {/* Quran Card */}
              <TouchableOpacity
                style={themed($nowReadingGridCard)}
                onPress={() => navigation.navigate("QuranHome")}
                activeOpacity={0.7}
              >
                <View style={$nowReadingIconContainer(colors.read)}>
                  <Icon icon="view" size={32} color="#FFFFFF" />
                </View>
                <View style={themed($nowReadingGridInfo)}>
                  <Text style={themed($nowReadingTitle)}>Quran</Text>
                  <Text style={themed($nowReadingSubtitle)}>Start reading</Text>
                </View>
              </TouchableOpacity>

              {/* Tafsir Card */}
              <TouchableOpacity
                style={themed($nowReadingGridCard)}
                activeOpacity={0.7}
              >
                <View style={$nowReadingIconContainer("#F4A261") }>
                  <Icon icon="ladybug" size={32} color="#FFFFFF" />
                </View>
                <View style={themed($nowReadingGridInfo)}>
                  <Text style={themed($nowReadingTitle)}>Tafsir</Text>
                  <Text style={themed($nowReadingSubtitle)}>Coming soon</Text>
                </View>
              </TouchableOpacity>

              {/* Hadith Card */}
              <TouchableOpacity
                style={themed($nowReadingGridCard)}
                activeOpacity={0.7}
              >
                <View style={$nowReadingIconContainer("#2A9D8F") }>
                  <Icon icon="community" size={32} color="#FFFFFF" />
                </View>
                <View style={themed($nowReadingGridInfo)}>
                  <Text style={themed($nowReadingTitle)}>Hadith</Text>
                  <Text style={themed($nowReadingSubtitle)}>Coming soon</Text>
                </View>
              </TouchableOpacity>

              {/* Daily Dua Card */}
              <TouchableOpacity
                style={themed($nowReadingGridCard)}
                activeOpacity={0.7}
              >
                <View style={$nowReadingIconContainer(colors.reflect)}>
                  <Icon icon="heart" size={32} color="#FFFFFF" />
                </View>
                <View style={themed($nowReadingGridInfo)}>
                  <Text style={themed($nowReadingTitle)}>Daily Dua</Text>
                  <Text style={themed($nowReadingSubtitle)}>Coming soon</Text>
                </View>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            <View style={themed($nowReadingCards)}>
            {/* Quran Progress Card */}
            <TouchableOpacity
              style={themed($nowReadingCard)}
              onPress={() => navigation.navigate("QuranHome")}
              activeOpacity={0.7}
            >
              <View style={$nowReadingIconContainer(colors.read)}>
                <Icon icon="view" size={32} color="#FFFFFF" />
              </View>
              <View style={themed($nowReadingInfo)}>
                <Text style={themed($nowReadingTitle)}>Quran</Text>
                <Text style={themed($nowReadingSubtitle)}>Start reading</Text>
              </View>
              <Icon icon="caretRight" size={20} color={colors.textDim} />
            </TouchableOpacity>

            {/* Tafsir Progress Card */}
            <TouchableOpacity
              style={themed($nowReadingCard)}
              activeOpacity={0.7}
            >
              <View style={$nowReadingIconContainer("#F4A261") }>
                <Icon icon="ladybug" size={32} color="#FFFFFF" />
              </View>
              <View style={themed($nowReadingInfo)}>
                <Text style={themed($nowReadingTitle)}>Tafsir</Text>
                <Text style={themed($nowReadingSubtitle)}>Coming soon</Text>
              </View>
              <Icon icon="caretRight" size={20} color={colors.textDim} />
            </TouchableOpacity>

            {/* Hadith Progress Card */}
            <TouchableOpacity
              style={themed($nowReadingCard)}
              activeOpacity={0.7}
            >
              <View style={$nowReadingIconContainer("#2A9D8F") }>
                <Icon icon="community" size={32} color="#FFFFFF" />
              </View>
              <View style={themed($nowReadingInfo)}>
                <Text style={themed($nowReadingTitle)}>Hadith</Text>
                <Text style={themed($nowReadingSubtitle)}>Coming soon</Text>
              </View>
              <Icon icon="caretRight" size={20} color={colors.textDim} />
            </TouchableOpacity>

            {/* Daily Dua Progress Card */}
            <TouchableOpacity
              style={themed($nowReadingCard)}
              activeOpacity={0.7}
            >
              <View style={$nowReadingIconContainer(colors.reflect)}>
                <Icon icon="heart" size={32} color="#FFFFFF" />
              </View>
              <View style={themed($nowReadingInfo)}>
                <Text style={themed($nowReadingTitle)}>Daily Dua</Text>
                <Text style={themed($nowReadingSubtitle)}>Coming soon</Text>
              </View>
              <Icon icon="caretRight" size={20} color={colors.textDim} />
            </TouchableOpacity>
          </View>
          )}
        </View>

        {/* Community Section */}
        <View style={themed($section)}>
          <Text style={themed($sectionTitle)}>Community</Text>

          <View style={themed($communityCards)}>
            {/* Create/Join Group Card */}
            <TouchableOpacity
              style={themed($communityCard)}
              onPress={() => navigation.navigate("ReadingGroups")}
              activeOpacity={0.7}
            >
              <View style={$communityIconContainer(colors.read)}>
                <Icon icon="more" size={28} color={colors.read} />
              </View>
              <Text style={themed($communityCardText)}>Create or Join Group</Text>
            </TouchableOpacity>

            {/* Reading Groups Card */}
            <TouchableOpacity
              style={themed($communityCard)}
              onPress={() => navigation.navigate("ReadingGroups")}
              activeOpacity={0.7}
            >
              <View style={$communityIconContainer("#6C5CE7")}>
                <Icon icon="community" size={28} color="#6C5CE7" />
              </View>
              <Text style={themed($communityCardText)}>My Reading Groups</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer Spacer */}
        <View style={themed($footer)} />
      </ScrollView>
    </Screen>
  )
}

// Styles
const $container: ThemedStyle<any> = (theme) => ({
  flex: 1,
  backgroundColor: theme.colors.background,
})

const $scrollView: ThemedStyle<any> = () => ({
  flex: 1,
})

const $section: ThemedStyle<any> = () => ({
  paddingTop: 24,
  paddingBottom: 8,
})

const $sectionHeader: ThemedStyle<any> = () => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingHorizontal: 16,
  marginBottom: 16,
})

const $sectionTitle: ThemedStyle<any> = (theme) => ({
  fontSize: 22,
  fontWeight: "700",
  color: theme.colors.text,
  paddingHorizontal: 16,
  marginBottom: 16,
})

const $listButton: ThemedStyle<any> = (theme) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: 4,
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: theme.colors.read,
})

const $listButtonText: ThemedStyle<any> = (theme) => ({
  fontSize: 14,
  fontWeight: "600",
  color: theme.colors.read,
})

// Library Cards
const $libraryScrollContent: ThemedStyle<any> = () => ({
  paddingHorizontal: 16,
  gap: 16,
})

const $libraryCardContainer: ThemedStyle<any> = () => ({
  width: CARD_WIDTH * 1.4,
})

const $libraryCard: ThemedStyle<any> = () => ({
  width: CARD_WIDTH * 1.4,
  height: CARD_WIDTH * 2,
  borderRadius: 20,
  overflow: "hidden",
})

const $libraryCardImage: ThemedStyle<any> = () => ({
  borderRadius: 20,
})

const $cardTitleContainer: ThemedStyle<any> = () => ({
  marginTop: 12,
  alignItems: "flex-start",
})

const $cardOrnament = (position: string): ViewStyle => {
  const base = {
    position: "absolute" as const,
    width: 40,
    height: 40,
    borderColor: "rgba(255, 255, 255, 0.3)",
  }

  switch (position) {
    case "top-left":
      return {
        ...base,
        top: 8,
        left: 8,
        borderTopWidth: 2,
        borderLeftWidth: 2,
        borderTopLeftRadius: 16,
      }
    case "top-right":
      return {
        ...base,
        top: 8,
        right: 8,
        borderTopWidth: 2,
        borderRightWidth: 2,
        borderTopRightRadius: 16,
      }
    case "bottom-left":
      return {
        ...base,
        bottom: 8,
        left: 8,
        borderBottomWidth: 2,
        borderLeftWidth: 2,
        borderBottomLeftRadius: 16,
      }
    case "bottom-right":
      return {
        ...base,
        bottom: 8,
        right: 8,
        borderBottomWidth: 2,
        borderRightWidth: 2,
        borderBottomRightRadius: 16,
      }
    default:
      return base
  }
}

const $cardTitle: ThemedStyle<any> = (theme) => ({
  fontSize: 17,
  fontWeight: "600",
  color: theme.colors.text,
  marginBottom: 2,
})

const $cardSubtitle: ThemedStyle<any> = (theme) => ({
  fontSize: 13,
  color: theme.colors.textDim,
})

// Now Reading Cards - List View
const $nowReadingCards: ThemedStyle<any> = () => ({
  paddingHorizontal: 16,
  gap: 12,
})

const $nowReadingCard: ThemedStyle<any> = (theme) => ({
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: theme.colors.palette.surface,
  padding: 16,
  borderRadius: 16,
  gap: 12,
})

const $nowReadingIconContainer = (color: string): ViewStyle => ({
  width: 64,
  height: 64,
  borderRadius: 32,
  backgroundColor: color,
  alignItems: "center",
  justifyContent: "center",
})

const $nowReadingInfo: ThemedStyle<any> = () => ({
  flex: 1,
})

const $nowReadingTitle: ThemedStyle<any> = (theme) => ({
  fontSize: 17,
  fontWeight: "600",
  color: theme.colors.text,
  marginBottom: 4,
})

const $nowReadingSubtitle: ThemedStyle<any> = (theme) => ({
  fontSize: 14,
  color: theme.colors.textDim,
})

// Now Reading Cards - Grid View (Horizontal)
const $nowReadingGridContent: ThemedStyle<any> = () => ({
  paddingHorizontal: 16,
  gap: 12,
})

const $nowReadingGridCard: ThemedStyle<any> = (theme) => ({
  width: 180,
  backgroundColor: theme.colors.palette.surface,
  padding: 16,
  borderRadius: 16,
  gap: 12,
  alignItems: "center",
})

const $nowReadingGridInfo: ThemedStyle<any> = () => ({
  alignItems: "center",
})

// Community Cards
const $communityCards: ThemedStyle<any> = () => ({
  flexDirection: "row",
  paddingHorizontal: 16,
  gap: 12,
})

const $communityCard: ThemedStyle<any> = (theme) => ({
  flex: 1,
  backgroundColor: theme.colors.palette.surface,
  padding: 20,
  borderRadius: 16,
  alignItems: "center",
  justifyContent: "center",
  minHeight: 140,
})

const $communityIconContainer = (color: string): ViewStyle => ({
  width: 56,
  height: 56,
  borderRadius: 28,
  backgroundColor: color + "20",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 12,
})

const $communityCardText: ThemedStyle<any> = (theme) => ({
  fontSize: 14,
  fontWeight: "600",
  color: theme.colors.text,
  textAlign: "center",
})

// Header Styles
const $header: ThemedStyle<any> = () => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingHorizontal: 16,
  paddingTop: 8,
  paddingBottom: 16,
})

const $headerLeft: ThemedStyle<any> = () => ({
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
})

const $hamburger: ThemedStyle<any> = (theme) => ({
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: theme.colors.read + "20",
  alignItems: "center",
  justifyContent: "center",
})

const $greeting: ThemedStyle<any> = (theme) => ({
  fontSize: 24,
  fontWeight: "700",
  color: theme.colors.text,
  lineHeight: 24,
})

const $headerRight: ThemedStyle<any> = () => ({
  flexDirection: "row",
  gap: 12,
})

const $iconButton: ThemedStyle<any> = (theme) => ({
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: theme.colors.palette.surface,
  alignItems: "center",
  justifyContent: "center",
})

const $footer: ThemedStyle<any> = () => ({
  height: 32,
})
