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
import { Screen, Icon } from "@/components"
import { useAppTheme } from "@/theme/context"
import { FontAwesome6 } from "@expo/vector-icons"
import type { ReadStackScreenProps } from "@/navigators"
import type { ThemedStyle } from "@/theme/types"

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
  const { themed, theme: { colors } } = useAppTheme()
  const [isNowReadingGridView, setIsNowReadingGridView] = React.useState(false)

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
    <Screen preset="fixed" safeAreaEdges={["top", "bottom"]} contentContainerStyle={themed($container(colors))}>
      {/* Custom Header */}
      <View style={themed($header)}>
        <View style={themed($headerLeft)}>
          <View style={themed($avatar(colors))}>
            <FontAwesome6 name="book-quran" size={20} color={colors.read} solid />
          </View>
          <Text style={themed($greeting(colors))}>Read</Text>
        </View>
        <View style={themed($headerRight)}>
          <TouchableOpacity
            style={themed($iconButton(colors))}
            onPress={() => navigation.navigate("BookmarksList")}
            activeOpacity={0.7}
          >
            <FontAwesome6 name="bookmark" size={20} color={colors.read} solid />
          </TouchableOpacity>
          <TouchableOpacity
            style={themed($iconButton(colors))}
            onPress={() => navigation.navigate("ReadingHistory")}
            activeOpacity={0.7}
          >
            <FontAwesome6 name="clock-rotate-left" size={20} color={colors.read} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={themed($scrollView)}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        {/* Library Section */}
        <View style={themed($section)}>
          <Text style={themed($sectionTitle(colors))}>Library</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={themed($libraryScrollContent)}
          >
            {libraryCards.map((card) => (
              <TouchableOpacity
                key={card.id}
                onPress={() => navigation.navigate(card.route)}
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
                  <View style={themed($cardOrnament("top-left"))} />
                  <View style={themed($cardOrnament("top-right"))} />
                  <View style={themed($cardOrnament("bottom-left"))} />
                  <View style={themed($cardOrnament("bottom-right"))} />
                </ImageBackground>

                {/* Title below image */}
                <View style={themed($cardTitleContainer)}>
                  <Text style={themed($cardTitle(colors))}>{card.title}</Text>
                  <Text style={themed($cardSubtitle(colors))}>{card.subtitle}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Now Reading Section */}
        <View style={themed($section)}>
          <View style={themed($sectionHeader)}>
            <Text style={themed($sectionTitle(colors))}>Now Reading</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setIsNowReadingGridView(!isNowReadingGridView)}
            >
              <View style={themed($listButton(colors))}>
                <Icon icon={isNowReadingGridView ? "view" : "menu"} size={16} color={colors.read} />
                <Text style={themed($listButtonText(colors))}>
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
                style={themed($nowReadingGridCard(colors))}
                onPress={() => navigation.navigate("QuranHome")}
                activeOpacity={0.7}
              >
                <View style={themed($nowReadingIconContainer(colors.read))}>
                  <Icon icon="book" size={32} color="#FFFFFF" />
                </View>
                <View style={themed($nowReadingGridInfo)}>
                  <Text style={themed($nowReadingTitle(colors))}>Quran</Text>
                  <Text style={themed($nowReadingSubtitle(colors))}>Start reading</Text>
                </View>
              </TouchableOpacity>

              {/* Tafsir Card */}
              <TouchableOpacity
                style={themed($nowReadingGridCard(colors))}
                activeOpacity={0.7}
              >
                <View style={themed($nowReadingIconContainer("#F4A261"))}>
                  <Icon icon="ladybug" size={32} color="#FFFFFF" />
                </View>
                <View style={themed($nowReadingGridInfo)}>
                  <Text style={themed($nowReadingTitle(colors))}>Tafsir</Text>
                  <Text style={themed($nowReadingSubtitle(colors))}>Coming soon</Text>
                </View>
              </TouchableOpacity>

              {/* Hadith Card */}
              <TouchableOpacity
                style={themed($nowReadingGridCard(colors))}
                activeOpacity={0.7}
              >
                <View style={themed($nowReadingIconContainer("#2A9D8F"))}>
                  <Icon icon="community" size={32} color="#FFFFFF" />
                </View>
                <View style={themed($nowReadingGridInfo)}>
                  <Text style={themed($nowReadingTitle(colors))}>Hadith</Text>
                  <Text style={themed($nowReadingSubtitle(colors))}>Coming soon</Text>
                </View>
              </TouchableOpacity>

              {/* Daily Dua Card */}
              <TouchableOpacity
                style={themed($nowReadingGridCard(colors))}
                activeOpacity={0.7}
              >
                <View style={themed($nowReadingIconContainer(colors.reflect))}>
                  <Icon icon="heart" size={32} color="#FFFFFF" />
                </View>
                <View style={themed($nowReadingGridInfo)}>
                  <Text style={themed($nowReadingTitle(colors))}>Daily Dua</Text>
                  <Text style={themed($nowReadingSubtitle(colors))}>Coming soon</Text>
                </View>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            <View style={themed($nowReadingCards)}>
            {/* Quran Progress Card */}
            <TouchableOpacity
              style={themed($nowReadingCard(colors))}
              onPress={() => navigation.navigate("QuranHome")}
              activeOpacity={0.7}
            >
              <View style={themed($nowReadingIconContainer(colors.read))}>
                <Icon icon="book" size={32} color="#FFFFFF" />
              </View>
              <View style={themed($nowReadingInfo)}>
                <Text style={themed($nowReadingTitle(colors))}>Quran</Text>
                <Text style={themed($nowReadingSubtitle(colors))}>Start reading</Text>
              </View>
              <Icon icon="caretRight" size={20} color={colors.textDim} />
            </TouchableOpacity>

            {/* Tafsir Progress Card */}
            <TouchableOpacity
              style={themed($nowReadingCard(colors))}
              activeOpacity={0.7}
            >
              <View style={themed($nowReadingIconContainer("#F4A261"))}>
                <Icon icon="ladybug" size={32} color="#FFFFFF" />
              </View>
              <View style={themed($nowReadingInfo)}>
                <Text style={themed($nowReadingTitle(colors))}>Tafsir</Text>
                <Text style={themed($nowReadingSubtitle(colors))}>Coming soon</Text>
              </View>
              <Icon icon="caretRight" size={20} color={colors.textDim} />
            </TouchableOpacity>

            {/* Hadith Progress Card */}
            <TouchableOpacity
              style={themed($nowReadingCard(colors))}
              activeOpacity={0.7}
            >
              <View style={themed($nowReadingIconContainer("#2A9D8F"))}>
                <Icon icon="community" size={32} color="#FFFFFF" />
              </View>
              <View style={themed($nowReadingInfo)}>
                <Text style={themed($nowReadingTitle(colors))}>Hadith</Text>
                <Text style={themed($nowReadingSubtitle(colors))}>Coming soon</Text>
              </View>
              <Icon icon="caretRight" size={20} color={colors.textDim} />
            </TouchableOpacity>

            {/* Daily Dua Progress Card */}
            <TouchableOpacity
              style={themed($nowReadingCard(colors))}
              activeOpacity={0.7}
            >
              <View style={themed($nowReadingIconContainer(colors.reflect))}>
                <Icon icon="heart" size={32} color="#FFFFFF" />
              </View>
              <View style={themed($nowReadingInfo)}>
                <Text style={themed($nowReadingTitle(colors))}>Daily Dua</Text>
                <Text style={themed($nowReadingSubtitle(colors))}>Coming soon</Text>
              </View>
              <Icon icon="caretRight" size={20} color={colors.textDim} />
            </TouchableOpacity>
          </View>
          )}
        </View>

        {/* Community Section */}
        <View style={themed($section)}>
          <Text style={themed($sectionTitle(colors))}>Community</Text>

          <View style={themed($communityCards)}>
            {/* Create/Join Group Card */}
            <TouchableOpacity
              style={themed($communityCard(colors))}
              onPress={() => navigation.navigate("ReadingGroups")}
              activeOpacity={0.7}
            >
              <View style={themed($communityIconContainer(colors.read))}>
                <Icon icon="add" size={28} color={colors.read} />
              </View>
              <Text style={themed($communityCardText(colors))}>Create or Join Group</Text>
            </TouchableOpacity>

            {/* Reading Groups Card */}
            <TouchableOpacity
              style={themed($communityCard(colors))}
              onPress={() => navigation.navigate("ReadingGroups")}
              activeOpacity={0.7}
            >
              <View style={themed($communityIconContainer("#6C5CE7"))}>
                <Icon icon="community" size={28} color="#6C5CE7" />
              </View>
              <Text style={themed($communityCardText(colors))}>My Reading Groups</Text>
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
const $container: ThemedStyle<any> = (colors) => ({
  flex: 1,
  backgroundColor: colors.background,
})

const $scrollView: ThemedStyle<any> = {
  flex: 1,
}

const $section: ThemedStyle<any> = {
  paddingTop: 24,
  paddingBottom: 8,
}

const $sectionHeader: ThemedStyle<any> = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingHorizontal: 16,
  marginBottom: 16,
}

const $sectionTitle: ThemedStyle<any> = (colors) => ({
  fontSize: 22,
  fontWeight: "700",
  color: colors.text,
  paddingHorizontal: 16,
  marginBottom: 16,
})

const $listButton: ThemedStyle<any> = (colors) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: 4,
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: colors.read,
})

const $listButtonText: ThemedStyle<any> = (colors) => ({
  fontSize: 14,
  fontWeight: "600",
  color: colors.read,
})

// Library Cards
const $libraryScrollContent: ThemedStyle<any> = {
  paddingHorizontal: 16,
  gap: 16,
}

const $libraryCardContainer: ThemedStyle<any> = {
  width: CARD_WIDTH * 1.4,
}

const $libraryCard: ThemedStyle<any> = {
  width: CARD_WIDTH * 1.4,
  height: CARD_WIDTH * 2,
  borderRadius: 20,
  overflow: "hidden",
}

const $libraryCardImage: ThemedStyle<any> = {
  borderRadius: 20,
}

const $cardTitleContainer: ThemedStyle<any> = {
  marginTop: 12,
  alignItems: "flex-start",
}

const $cardOrnament: ThemedStyle<any> = (position: string) => {
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

const $cardTitle: ThemedStyle<any> = (colors) => ({
  fontSize: 17,
  fontWeight: "600",
  color: colors.text,
  marginBottom: 2,
})

const $cardSubtitle: ThemedStyle<any> = (colors) => ({
  fontSize: 13,
  color: colors.textDim,
})

// Now Reading Cards - List View
const $nowReadingCards: ThemedStyle<any> = {
  paddingHorizontal: 16,
  gap: 12,
}

const $nowReadingCard: ThemedStyle<any> = (colors) => ({
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: colors.palette.surface,
  padding: 16,
  borderRadius: 16,
  gap: 12,
})

const $nowReadingIconContainer: ThemedStyle<any> = (color: string) => ({
  width: 64,
  height: 64,
  borderRadius: 32,
  backgroundColor: color,
  alignItems: "center",
  justifyContent: "center",
})

const $nowReadingInfo: ThemedStyle<any> = {
  flex: 1,
}

const $nowReadingTitle: ThemedStyle<any> = (colors) => ({
  fontSize: 17,
  fontWeight: "600",
  color: colors.text,
  marginBottom: 4,
})

const $nowReadingSubtitle: ThemedStyle<any> = (colors) => ({
  fontSize: 14,
  color: colors.textDim,
})

// Now Reading Cards - Grid View (Horizontal)
const $nowReadingGridContent: ThemedStyle<any> = {
  paddingHorizontal: 16,
  gap: 12,
}

const $nowReadingGridCard: ThemedStyle<any> = (colors) => ({
  width: 180,
  backgroundColor: colors.palette.surface,
  padding: 16,
  borderRadius: 16,
  gap: 12,
  alignItems: "center",
})

const $nowReadingGridInfo: ThemedStyle<any> = {
  alignItems: "center",
}

// Community Cards
const $communityCards: ThemedStyle<any> = {
  flexDirection: "row",
  paddingHorizontal: 16,
  gap: 12,
}

const $communityCard: ThemedStyle<any> = (colors) => ({
  flex: 1,
  backgroundColor: colors.palette.surface,
  padding: 20,
  borderRadius: 16,
  alignItems: "center",
  justifyContent: "center",
  minHeight: 140,
})

const $communityIconContainer: ThemedStyle<any> = (color: string) => ({
  width: 56,
  height: 56,
  borderRadius: 28,
  backgroundColor: color + "20",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 12,
})

const $communityCardText: ThemedStyle<any> = (colors) => ({
  fontSize: 14,
  fontWeight: "600",
  color: colors.text,
  textAlign: "center",
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
  backgroundColor: colors.read + "20",
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

const $footer: ThemedStyle<any> = {
  height: 32,
}
