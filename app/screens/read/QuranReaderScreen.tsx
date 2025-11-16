/**
 * Quran Reader Screen
 *
 * Verse-by-verse Quran reading with Arabic text and translations
 * Features: Scroll to verse, bookmarking, translation toggle
 */
import React, { useEffect, useState, useRef } from "react"
import {
  View,
  ViewStyle,
  TextStyle,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Switch,
  ScrollView,
} from "react-native"
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio'
import { Screen, Text, Icon } from "@/components"
import { useAppTheme } from "@/theme/context"
import type { ReadStackScreenProps } from "@/navigators"
import type { ThemedStyle } from "@/theme/types"
import { quranApi, Verse, Surah } from "@/services/quran/quranApi"
import { getRecitations, type Recitation } from "@/services/quran/recitations-api"
import { getAudioUri, preloadAudioForVerses } from "@/services/quran/audio-cache"
import {
  markVerseAsRead,
  toggleBookmark,
  getVersesProgress,
  type UserProgress,
} from "@/services/quran/user-progress"

interface Word {
  id: number
  position: number
  text?: string
  text_uthmani?: string
  char_type_name: string
  translation?: {
    text: string
    language_name: string
  }
  transliteration?: {
    text: string | null
    language_name: string
  }
}

interface VerseWithWords extends Verse {
  words?: Word[]
}

interface ReadingSettings {
  showTranslation: boolean
  showTransliteration: boolean
  arabicTextType: 'uthmani' | 'imlaei'
  reciterId: number
}

export const QuranReaderScreen: React.FC<ReadStackScreenProps<"QuranReader">> = ({
  route,
  navigation,
}) => {
  const { themed, theme: { colors } } = useAppTheme()
  const { surahNumber, ayahNumber } = route.params

  const [surah, setSurah] = useState<Surah | null>(null)
  const [verses, setVerses] = useState<VerseWithWords[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [settingsVisible, setSettingsVisible] = useState(false)
  const [playingVerseId, setPlayingVerseId] = useState<number | null>(null)
  const [recitations, setRecitations] = useState<Recitation[]>([])
  const [loadingRecitations, setLoadingRecitations] = useState(false)
  const [versesProgress, setVersesProgress] = useState<Map<string, UserProgress>>(new Map())
  const [settings, setSettings] = useState<ReadingSettings>({
    showTranslation: true,
    showTransliteration: false,
    arabicTextType: 'uthmani',
    reciterId: 7, // Default: Mishary Rashid Alafasy
  })

  const flatListRef = useRef<FlatList<VerseWithWords>>(null)
  const player = useAudioPlayer()

  useEffect(() => {
    loadSurah()
  }, [surahNumber])

  useEffect(() => {
    // Configure audio mode for playback
    const setupAudio = async () => {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
        })
      } catch (error) {
        console.error('Failed to set audio mode:', error)
      }
    }

    setupAudio()

    // Listen for when audio finishes playing
    const subscription = player.addListener('playbackStatusUpdate', (status) => {
      if (status.playing === false && status.currentTime === status.duration) {
        setPlayingVerseId(null)
      }
    })

    // Cleanup audio when component unmounts
    return () => {
      subscription.remove()
      try {
        if (player.playing) {
          player.pause()
        }
      } catch (error) {
        // Player already disposed, ignore
        console.log('Audio player already cleaned up')
      }
    }
  }, [player])

  useEffect(() => {
    // Load recitations when settings modal opens
    if (settingsVisible && recitations.length === 0) {
      loadRecitations()
    }
  }, [settingsVisible])

  const loadRecitations = async () => {
    setLoadingRecitations(true)
    try {
      const reciters = await getRecitations('en')
      setRecitations(reciters)
    } catch (err) {
      console.error('Failed to load recitations:', err)
    } finally {
      setLoadingRecitations(false)
    }
  }

  useEffect(() => {
    navigation.setOptions({
      title: surah ? surah.transliteration : "Loading...",
      headerShown: true,
      headerRight: () => (
        <TouchableOpacity
          onPress={() => setSettingsVisible(true)}
          style={{ paddingHorizontal: 16 }}
        >
          <Icon icon="settings" size={24} color={colors.text} />
        </TouchableOpacity>
      ),
    })
  }, [surah, navigation])

  const loadSurah = async () => {
    setLoading(true)
    setError(null)

    try {
      const surahData = await quranApi.getSurah(surahNumber)
      if (!surahData) {
        throw new Error("Surah not found")
      }
      setSurah(surahData)

      const versesData = await quranApi.getVerses(surahNumber, 131) // Clear Quran translation

      // Debug: Log first verse to see what data we're getting
      if (versesData.length > 0) {
        console.log('📖 First verse data:', JSON.stringify(versesData[0], null, 2))
        console.log('📖 Translations available:', versesData[0].translations?.length || 0)
        console.log('📖 Words available:', versesData[0].words?.length || 0)
      }

      setVerses(versesData)

      // Load user progress for all verses
      const verseKeys = versesData.map(v => v.verseKey)
      const progress = await getVersesProgress(verseKeys)
      setVersesProgress(progress)

      // Scroll to specific ayah if provided
      if (ayahNumber && versesData.length > 0) {
        setTimeout(() => {
          const index = versesData.findIndex((v) => v.verseNumber === ayahNumber)
          if (index >= 0 && flatListRef.current) {
            flatListRef.current.scrollToIndex({ index, animated: true })
          }
        }, 500)
      }

      // Preload audio for all verses in background
      preloadAudioForVerses(verseKeys, settings.reciterId).catch(err => {
        console.warn('⚠️ Background audio preloading failed:', err)
      })
    } catch (err) {
      console.error("Error loading Surah:", err)
      setError(err instanceof Error ? err.message : "Failed to load Surah")
    } finally {
      setLoading(false)
    }
  }

  const playAudio = async (verseKey: string, verseId: number) => {
    try {
      // If clicking the same verse that's playing, just stop
      if (playingVerseId === verseId && player.playing) {
        player.pause()
        setPlayingVerseId(null)
        return
      }

      // Get audio URI (will use cached file if available, otherwise remote URL)
      const audioUri = await getAudioUri(verseKey, settings.reciterId)

      console.log('🔊 Playing audio for', verseKey, 'Reciter:', recitations.find(r => r.id === settings.reciterId)?.reciter_name || 'Mishary Rashid Alafasy')

      // Replace the current source and play
      player.replace({ uri: audioUri })
      player.play()
      setPlayingVerseId(verseId)
    } catch (error) {
      console.error('❌ Error playing audio:', error)
      setPlayingVerseId(null)
    }
  }

  const handleBookmark = async (verse: VerseWithWords) => {
    try {
      const isBookmarked = await toggleBookmark(
        verse.verseKey,
        verse.chapterId,
        verse.verseNumber,
        verse.pageNumber
      )

      // Update local state
      setVersesProgress(prev => {
        const updated = new Map(prev)
        const current = updated.get(verse.verseKey)
        updated.set(verse.verseKey, {
          verseKey: verse.verseKey,
          chapterId: verse.chapterId,
          verseNumber: verse.verseNumber,
          pageNumber: verse.pageNumber,
          isRead: current?.isRead || false,
          isBookmarked,
          readAt: current?.readAt,
          bookmarkedAt: isBookmarked ? new Date().toISOString() : undefined,
        })
        return updated
      })
    } catch (error) {
      console.error('❌ Error toggling bookmark:', error)
    }
  }

  const handleMarkAsRead = async (verse: VerseWithWords, currentIndex: number) => {
    try {
      await markVerseAsRead(
        verse.verseKey,
        verse.chapterId,
        verse.verseNumber,
        verse.pageNumber
      )

      // Update local state
      setVersesProgress(prev => {
        const updated = new Map(prev)
        const current = updated.get(verse.verseKey)
        updated.set(verse.verseKey, {
          verseKey: verse.verseKey,
          chapterId: verse.chapterId,
          verseNumber: verse.verseNumber,
          pageNumber: verse.pageNumber,
          isRead: true,
          isBookmarked: current?.isBookmarked || false,
          readAt: new Date().toISOString(),
          bookmarkedAt: current?.bookmarkedAt,
        })
        return updated
      })

      // Auto-scroll to next verse
      if (currentIndex < verses.length - 1 && flatListRef.current) {
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({
            index: currentIndex + 1,
            animated: true,
          })
        }, 300)
      }
    } catch (error) {
      console.error('❌ Error marking verse as read:', error)
    }
  }

  const renderVerse = ({ item, index }: { item: VerseWithWords; index: number }) => {
    const arabicText = settings.arabicTextType === 'uthmani' ? item.textUthmani : (item.textImlaei || item.textUthmani)
    const isPlaying = playingVerseId === item.id
    const progress = versesProgress.get(item.verseKey)
    const isBookmarked = progress?.isBookmarked || false
    const isRead = progress?.isRead || false

    // Debug: Log verse data for first verse only
    if (index === 0) {
      console.log('🔍 Rendering first verse:', {
        verseKey: item.verseKey,
        hasTranslations: !!item.translations,
        translationsCount: item.translations?.length || 0,
        firstTranslation: item.translations?.[0]?.text?.substring(0, 50) || 'N/A',
        hasWords: !!item.words,
        wordsCount: item.words?.length || 0,
      })
    }

    return (
      <View style={themed(isRead ? $verseContainerRead : $verseContainer)}>
        {/* Verse Number Badge */}
        <View style={themed($verseHeader)}>
          <View style={themed($verseBadge)}>
            <Text style={themed($verseBadgeText)}>{item.verseKey}</Text>
          </View>
        </View>

        {/* Arabic Text */}
        <View style={themed($arabicContainer)}>
          <Text style={themed($arabicText)}>{arabicText}</Text>
        </View>

        {/* Transliteration */}
        {settings.showTransliteration && (
          <View style={themed($transliterationContainer)}>
            <Text style={themed($transliterationText)}>Transliteration coming soon...</Text>
          </View>
        )}

        {/* Translation */}
        {settings.showTranslation && item.translations && item.translations.length > 0 && (
          <View style={themed($translationContainer)}>
            <Text style={themed($translationText)}>{item.translations[0].text}</Text>
            <Text style={themed($translatorName)}>
              — {item.translations[0].translatorName}
            </Text>
          </View>
        )}

        {/* Action Buttons - Bottom Right */}
        <View style={themed($verseActionsBottomRight)}>
          {/* Mark as Read Button */}
          <TouchableOpacity
            style={themed($actionButton)}
            onPress={() => handleMarkAsRead(item, index)}
          >
            <Icon
              icon="check"
              size={20}
              color={isRead ? colors.read : colors.textDim}
            />
          </TouchableOpacity>

          {/* Bookmark Button */}
          <TouchableOpacity
            style={themed($actionButton)}
            onPress={() => handleBookmark(item)}
          >
            <Icon
              icon={isBookmarked ? 'heart' : 'heart'}
              size={20}
              color={isBookmarked ? colors.read : colors.textDim}
            />
          </TouchableOpacity>

          {/* Play/Pause Audio Button */}
          <TouchableOpacity
            style={themed($actionButton)}
            onPress={() => playAudio(item.verseKey, item.id)}
          >
            <Icon
              icon={isPlaying ? 'stop' : 'caretRight'}
              size={20}
              color={isPlaying ? colors.read : colors.textDim}
            />
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  if (loading) {
    return (
      <Screen preset="fixed" contentContainerStyle={themed($container)}>
        <View style={themed($loadingContainer)}>
          <ActivityIndicator size="large" color={colors.read} />
          <Text style={themed($loadingText)}>Loading Surah...</Text>
        </View>
      </Screen>
    )
  }

  if (error) {
    return (
      <Screen preset="fixed" contentContainerStyle={themed($container)}>
        <View style={themed($errorContainer)}>
          <Text style={themed($errorText)}>{error}</Text>
          <TouchableOpacity style={themed($retryButton)} onPress={loadSurah}>
            <Text style={themed($retryButtonText)}>Retry</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    )
  }

  return (
    <Screen preset="fixed" contentContainerStyle={themed($container)}>
      {/* Settings Modal */}
      <Modal
        visible={settingsVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setSettingsVisible(false)}
      >
        <View style={themed($modalOverlay)}>
          <View style={themed($modalContent)}>
            <View style={themed($modalHeader)}>
              <Text style={themed($modalTitle)}>Reading Settings</Text>
              <TouchableOpacity onPress={() => setSettingsVisible(false)}>
                <Icon icon="x" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>

            {/* Translation Toggle */}
            <View style={themed($settingRow)}>
              <View style={themed($settingInfo)}>
                <Text style={themed($settingLabel)}>Show Translation</Text>
                <Text style={themed($settingDescription)}>Display English translation</Text>
              </View>
              <Switch
                value={settings.showTranslation}
                onValueChange={(value) => setSettings({ ...settings, showTranslation: value })}
                trackColor={{ false: colors.border, true: colors.read }}
                thumbColor={colors.palette.white}
              />
            </View>

            {/* Transliteration Toggle */}
            <View style={themed($settingRow)}>
              <View style={themed($settingInfo)}>
                <Text style={themed($settingLabel)}>Show Transliteration</Text>
                <Text style={themed($settingDescription)}>Display pronunciation guide</Text>
              </View>
              <Switch
                value={settings.showTransliteration}
                onValueChange={(value) =>
                  setSettings({ ...settings, showTransliteration: value })
                }
                trackColor={{ false: colors.border, true: colors.read }}
                thumbColor={colors.palette.white}
              />
            </View>

            {/* Arabic Script Type */}
            <View style={themed($settingRow)}>
              <View style={themed($settingInfo)}>
                <Text style={themed($settingLabel)}>Arabic Script</Text>
                <Text style={themed($settingDescription)}>Choose text style</Text>
              </View>
              <View style={themed($scriptSelector)}>
                <TouchableOpacity
                  style={themed(
                    settings.arabicTextType === 'uthmani' ? $scriptButtonActive : $scriptButton
                  )}
                  onPress={() => setSettings({ ...settings, arabicTextType: 'uthmani' })}
                >
                  <Text
                    style={themed(
                      settings.arabicTextType === 'uthmani'
                        ? $scriptButtonTextActive
                        : $scriptButtonText
                    )}
                  >
                    Uthmani
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={themed(
                    settings.arabicTextType === 'imlaei' ? $scriptButtonActive : $scriptButton
                  )}
                  onPress={() => setSettings({ ...settings, arabicTextType: 'imlaei' })}
                >
                  <Text
                    style={themed(
                      settings.arabicTextType === 'imlaei'
                        ? $scriptButtonTextActive
                        : $scriptButtonText
                    )}
                  >
                    Imlaei
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Reciter Selection */}
            <View style={themed($settingRow)}>
              <View style={themed($settingInfo)}>
                <Text style={themed($settingLabel)}>Audio Reciter</Text>
                <Text style={themed($settingDescription)}>
                  {loadingRecitations
                    ? 'Loading reciters...'
                    : recitations.find(r => r.id === settings.reciterId)?.reciter_name || 'Mishary Rashid Alafasy'}
                </Text>
              </View>
            </View>

            {/* Reciter List */}
            {recitations.length > 0 && (
              <ScrollView style={themed($reciterList)} showsVerticalScrollIndicator={false}>
                {recitations.slice(0, 10).map((reciter) => (
                  <TouchableOpacity
                    key={reciter.id}
                    style={themed(
                      settings.reciterId === reciter.id
                        ? $reciterItemActive
                        : $reciterItem
                    )}
                    onPress={() => setSettings({ ...settings, reciterId: reciter.id })}
                  >
                    <View style={themed($reciterInfo)}>
                      <Text
                        style={themed(
                          settings.reciterId === reciter.id
                            ? $reciterNameActive
                            : $reciterName
                        )}
                      >
                        {reciter.reciter_name}
                      </Text>
                      {reciter.style && (
                        <Text style={themed($reciterStyle)}>{reciter.style}</Text>
                      )}
                    </View>
                    {settings.reciterId === reciter.id && (
                      <Icon icon="check" size={20} color={colors.read} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            </ScrollView>

            <TouchableOpacity
              style={themed($doneButton)}
              onPress={() => setSettingsVisible(false)}
            >
              <Text style={themed($doneButtonText)}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Bismillah (except for Surah 1 and 9) */}
      {surah && surah.id !== 1 && surah.id !== 9 && (
        <View style={themed($bismillahContainer)}>
          <Text style={themed($bismillahText)}>بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</Text>
        </View>
      )}

      {/* Verses List */}
      <FlatList
        ref={flatListRef}
        data={verses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderVerse}
        contentContainerStyle={themed($listContent)}
        showsVerticalScrollIndicator={false}
        onScrollToIndexFailed={(info) => {
          console.warn("Scroll to index failed:", info)
        }}
      />
    </Screen>
  )
}

// Styles
const $container: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $loadingContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: spacing.xxl,
})

const $loadingText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  marginTop: spacing.md,
})

const $errorContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: spacing.lg,
})

const $errorText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.error,
  fontSize: 16,
  textAlign: "center",
  marginBottom: spacing.md,
})

const $retryButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.read,
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.sm,
  borderRadius: 8,
})

const $retryButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.white,
  fontWeight: "600",
})

const $surahHeader: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  padding: spacing.md,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
})

const $surahHeaderInfo: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $surahHeaderName: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 18,
  fontWeight: "600",
  color: colors.text,
})

const $surahHeaderMeta: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 13,
  color: colors.textDim,
  marginTop: 2,
})

const $translationToggle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xs,
})

const $translationToggleText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  color: colors.read,
  fontWeight: "500",
})

const $bismillahContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  padding: spacing.lg,
  alignItems: "center",
  marginHorizontal: spacing.md,
  marginTop: spacing.md,
  borderRadius: 12,
})

const $bismillahText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 22,
  color: colors.text,
  textAlign: "center",
})

const $listContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.md,
  paddingBottom: spacing.xl,
})

const $verseContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  padding: spacing.md,
  borderRadius: 12,
  marginTop: spacing.md,
})

const $verseContainerRead: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  padding: spacing.md,
  borderRadius: 12,
  marginTop: spacing.md,
  opacity: 0.7,
  borderLeftWidth: 3,
  borderLeftColor: colors.read,
})

const $verseHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: spacing.sm,
})

const $verseBadge: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.read,
  width: 32,
  height: 32,
  borderRadius: 16,
  alignItems: "center",
  justifyContent: "center",
})

const $verseBadgeText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.white,
  fontSize: 14,
  fontWeight: "700",
})

const $audioButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  width: 36,
  height: 36,
  borderRadius: 18,
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 1,
  borderColor: colors.border,
})

const $arabicContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
})

const $arabicText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 26,
  lineHeight: 48,
  color: colors.text,
  textAlign: "right",
  fontWeight: "400",
})

const $translationContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  borderTopWidth: 1,
  borderTopColor: colors.border,
  paddingTop: spacing.sm,
  marginTop: spacing.sm,
})

const $translationText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 16,
  lineHeight: 26,
  color: colors.text,
  marginBottom: spacing.xs,
})

const $translatorName: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 13,
  color: colors.textDim,
  fontStyle: "italic",
})

const $verseActions: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.md,
  marginTop: spacing.sm,
})

const $verseActionsBottomRight: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.xs,
  marginTop: spacing.sm,
  justifyContent: "flex-end",
  alignItems: "center",
})

const $actionButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  width: 36,
  height: 36,
  borderRadius: 18,
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 1,
  borderColor: colors.border,
})

// Word by Word styles
const $wordByWordContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: spacing.xs,
  marginBottom: spacing.md,
})

const $wordCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  padding: spacing.sm,
  borderRadius: 8,
  alignItems: 'center',
  minWidth: 60,
})

const $wordArabic: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 20,
  color: colors.text,
  marginBottom: 4,
})

const $wordTransliteration: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 11,
  color: colors.textDim,
  fontStyle: 'italic',
  marginBottom: 2,
})

const $wordTranslation: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 10,
  color: colors.textDim,
  textAlign: 'center',
})

const $transliterationContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.sm,
})

const $transliterationText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  color: colors.textDim,
  fontStyle: 'italic',
  lineHeight: 22,
})

// Modal styles
const $modalOverlay: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'flex-end',
})

const $modalContent: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  padding: spacing.lg,
  paddingBottom: spacing.xl,
})

const $modalHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: spacing.lg,
})

const $modalTitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 20,
  fontWeight: '700',
  color: colors.text,
})

const $settingRow: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: spacing.md,
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
})

const $settingInfo: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  marginRight: 16,
})

const $settingLabel: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 16,
  fontWeight: '600',
  color: colors.text,
  marginBottom: 4,
})

const $settingDescription: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 13,
  color: colors.textDim,
})

const $scriptSelector: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: 'row',
  gap: spacing.xs,
})

const $scriptButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.xs,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: colors.border,
  backgroundColor: colors.background,
})

const $scriptButtonActive: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.xs,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: colors.read,
  backgroundColor: colors.read,
})

const $scriptButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 13,
  color: colors.text,
  fontWeight: '500',
})

const $scriptButtonTextActive: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 13,
  color: colors.palette.white,
  fontWeight: '600',
})

const $doneButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.read,
  padding: spacing.md,
  borderRadius: 12,
  alignItems: 'center',
  marginTop: spacing.lg,
})

const $doneButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.white,
  fontSize: 16,
  fontWeight: '600',
})

// Reciter selection styles
const $reciterList: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  maxHeight: 200,
  marginTop: spacing.sm,
  marginBottom: spacing.md,
})

const $reciterItem: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.md,
  borderRadius: 8,
  marginBottom: spacing.xs,
  backgroundColor: colors.palette.neutral100,
})

const $reciterItemActive: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.md,
  borderRadius: 8,
  marginBottom: spacing.xs,
  backgroundColor: colors.read + '20',
  borderWidth: 1,
  borderColor: colors.read,
})

const $reciterInfo: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $reciterName: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 15,
  fontWeight: '500',
  color: colors.text,
  marginBottom: 2,
})

const $reciterNameActive: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 15,
  fontWeight: '600',
  color: colors.read,
  marginBottom: 2,
})

const $reciterStyle: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 12,
  color: colors.textDim,
  fontStyle: 'italic',
})
