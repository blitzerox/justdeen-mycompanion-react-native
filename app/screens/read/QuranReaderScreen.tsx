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
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio'
import { Screen, Text, Icon } from "@/components"
import { useAppTheme } from "@/theme/context"
import type { ReadStackScreenProps } from "@/navigators"
import type { ThemedStyle } from "@/theme/types"
import { quranApi, Verse, Surah } from "@/services/quran/quranApi"
import { getRecitations, type Recitation } from "@/services/quran/recitations-api"
import { getAllTranslations, type TranslationResource } from "@/services/quran/translations-api"
import { getAudioUri, preloadAudioForVerses } from "@/services/quran/audio-cache"
import { FontAwesome6, AntDesign } from "@expo/vector-icons"
import {
  markVerseAsRead,
  toggleBookmark,
  getVersesProgress,
  type UserProgress,
} from "@/services/quran/user-progress"
import { refreshChapterVerses, clearChapterCache } from "@/services/quran/verses-api"
import { getChapterById, type Chapter } from "@/services/quran/chapters-api"
import { getVerseTafsir, type Tafsir } from "@/services/quran/tafsir-api"
import RenderHtml from "react-native-render-html"
import { useWindowDimensions } from "react-native"

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
    text: string
    language_name: string
  }
}

interface VerseWithWords extends Verse {
  words?: Word[]
}

interface ReadingSettings {
  showTranslation: boolean
  showTransliteration: boolean
  arabicTextType: 'uthmani' | 'indopak'
  reciterId: number
  translationId: number
}

// Helper function to strip HTML tags like <sup foot_note=...>...</sup> from translation text
const stripHtmlTags = (text: string): string => {
  return text
    .replace(/<sup[^>]*>.*?<\/sup>/gi, '') // Remove <sup>...</sup> tags
    .replace(/<[^>]*>/g, '') // Remove any other HTML tags
    .trim()
}

const QURAN_SETTINGS_KEY = '@quran_reading_settings'

export const QuranReaderScreen: React.FC<ReadStackScreenProps<"QuranReader">> = ({
  route,
  navigation,
}) => {
  const { themed, theme: { colors } } = useAppTheme()
  const { surahNumber, ayahNumber } = route.params
  const { width } = useWindowDimensions()

  const [surah, setSurah] = useState<Surah | null>(null)
  const [verses, setVerses] = useState<VerseWithWords[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [settingsVisible, setSettingsVisible] = useState(false)
  const [playingVerseId, setPlayingVerseId] = useState<number | null>(null)
  const [recitations, setRecitations] = useState<Recitation[]>([])
  const [loadingRecitations, setLoadingRecitations] = useState(false)
  const [versesProgress, setVersesProgress] = useState<Map<string, UserProgress>>(new Map())
  const [prevChapter, setPrevChapter] = useState<Chapter | null>(null)
  const [nextChapter, setNextChapter] = useState<Chapter | null>(null)
  const [scriptExpanded, setScriptExpanded] = useState(false)
  const [reciterExpanded, setReciterExpanded] = useState(false)
  const [translationExpanded, setTranslationExpanded] = useState(false)
  const [translations, setTranslations] = useState<TranslationResource[]>([])
  const [loadingTranslations, setLoadingTranslations] = useState(false)
  const [expandedLanguages, setExpandedLanguages] = useState<Set<string>>(new Set())
  const [settings, setSettings] = useState<ReadingSettings>({
    showTranslation: true,
    showTransliteration: false,
    arabicTextType: 'uthmani',
    reciterId: 7, // Default: Mishary Rashid Alafasy
    translationId: 85, // Default: Abdel Haleem
  })

  // Tafsir bottom sheet state
  const [tafsirVisible, setTafsirVisible] = useState(false)
  const [tafsirData, setTafsirData] = useState<Tafsir | null>(null)
  const [tafsirLoading, setTafsirLoading] = useState(false)
  const [selectedVerseKey, setSelectedVerseKey] = useState<string>("")

  const flatListRef = useRef<FlatList<VerseWithWords>>(null)
  const player = useAudioPlayer()

  const [settingsLoaded, setSettingsLoaded] = useState(false)

  // Load saved settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem(QURAN_SETTINGS_KEY)
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings)
          setSettings(prev => ({ ...prev, ...parsed }))
        }
      } catch (err) {
        console.error('Failed to load Quran settings:', err)
      } finally {
        setSettingsLoaded(true)
      }
    }
    loadSettings()
  }, [])

  // Save settings whenever they change (but not on initial load)
  useEffect(() => {
    if (!settingsLoaded) return
    const saveSettings = async () => {
      try {
        await AsyncStorage.setItem(QURAN_SETTINGS_KEY, JSON.stringify(settings))
      } catch (err) {
        console.error('Failed to save Quran settings:', err)
      }
    }
    saveSettings()
  }, [settings, settingsLoaded])

  // Load surah only after settings are loaded
  useEffect(() => {
    if (settingsLoaded) {
      loadSurah()
    }
  }, [surahNumber, settingsLoaded])

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
    // Load recitations and translations when settings modal opens
    if (settingsVisible && recitations.length === 0) {
      loadRecitations()
    }
    if (settingsVisible && translations.length === 0) {
      loadTranslations()
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

  const loadTranslations = async () => {
    setLoadingTranslations(true)
    try {
      const allTranslations = await getAllTranslations()
      setTranslations(allTranslations)
    } catch (err) {
      console.error('Failed to load translations:', err)
    } finally {
      setLoadingTranslations(false)
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

  const loadSurah = async (translationIdOverride?: number) => {
    setLoading(true)
    setError(null)

    const translationId = translationIdOverride ?? settings.translationId

    try {
      const surahData = await quranApi.getSurah(surahNumber)
      if (!surahData) {
        throw new Error("Surah not found")
      }
      setSurah(surahData)

      const versesData = await quranApi.getVerses(surahNumber, translationId)

      // Debug: Log first verse to see what data we're getting
      if (versesData.length > 0) {
        console.log('📖 First verse data:', JSON.stringify(versesData[0], null, 2))
        console.log('📖 Translations available:', versesData[0].translations?.length || 0)
        console.log('📖 First translation:', versesData[0].translations?.[0])
        console.log('📖 Words available:', versesData[0].words?.length || 0)
        console.log('📖 Translation ID requested:', settings.translationId)
      }

      setVerses(versesData)

      // Load user progress for all verses
      const verseKeys = versesData.map(v => v.verseKey)
      const progress = await getVersesProgress(verseKeys)
      setVersesProgress(progress)

      // Load previous and next chapter info for navigation
      if (surahNumber > 1) {
        const prev = await getChapterById(surahNumber - 1)
        setPrevChapter(prev)
      } else {
        setPrevChapter(null)
      }

      if (surahNumber < 114) {
        const next = await getChapterById(surahNumber + 1)
        setNextChapter(next)
      } else {
        setNextChapter(null)
      }

      // Scroll to specific ayah if provided
      if (ayahNumber && versesData.length > 0) {
        const index = versesData.findIndex((v) => v.verseNumber === ayahNumber)
        if (index >= 0) {
          // For items that may not be rendered yet, we need to wait a bit
          // and use scrollToIndex which will trigger onScrollToIndexFailed if needed
          setTimeout(() => {
            if (flatListRef.current) {
              flatListRef.current.scrollToIndex({ index, animated: true, viewPosition: 0 })
            }
          }, 100)
        }
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
      // Derive chapter_id from verse_key (e.g., "1:5" -> chapter 1) or use surahNumber
      const chapterId = parseInt(verse.verseKey.split(':')[0]) || surahNumber

      const isBookmarked = await toggleBookmark(
        verse.verseKey,
        chapterId,
        verse.verseNumber,
        verse.pageNumber || 0
      )

      // Update local state
      setVersesProgress(prev => {
        const updated = new Map(prev)
        const current = updated.get(verse.verseKey)
        updated.set(verse.verseKey, {
          verseKey: verse.verseKey,
          chapterId: chapterId,
          verseNumber: verse.verseNumber,
          pageNumber: verse.pageNumber || 0,
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
      // Derive chapter_id from verse_key (e.g., "1:5" -> chapter 1) or use surahNumber
      const chapterId = parseInt(verse.verseKey.split(':')[0]) || surahNumber

      await markVerseAsRead(
        verse.verseKey,
        chapterId,
        verse.verseNumber,
        verse.pageNumber || 0
      )

      // Update local state
      setVersesProgress(prev => {
        const updated = new Map(prev)
        const current = updated.get(verse.verseKey)
        updated.set(verse.verseKey, {
          verseKey: verse.verseKey,
          chapterId: chapterId,
          verseNumber: verse.verseNumber,
          pageNumber: verse.pageNumber || 0,
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

  const handleShowTafsir = async (verseKey: string) => {
    setSelectedVerseKey(verseKey)
    setTafsirVisible(true)
    setTafsirLoading(true)
    setTafsirData(null)

    try {
      const tafsir = await getVerseTafsir(verseKey)
      setTafsirData(tafsir)
    } catch (error) {
      console.error('❌ Error loading tafsir:', error)
    } finally {
      setTafsirLoading(false)
    }
  }

  const renderVerse = ({ item, index }: { item: VerseWithWords; index: number }) => {
    const arabicText =
      settings.arabicTextType === 'indopak' ? (item.textIndopak || item.textUthmani) : item.textUthmani

    // Select appropriate font based on script type
    const arabicFont =
      settings.arabicTextType === 'indopak' ? 'IndoPak' : 'Uthman-Regular'

    const isPlaying = playingVerseId === item.id
    const progress = versesProgress.get(item.verseKey)
    const isBookmarked = progress?.isBookmarked || false
    const isRead = progress?.isRead || false

    // Debug: Log verse data for first verse only
    if (index === 0) {
      console.log('🔍 Rendering first verse:', {
        verseKey: item.verseKey,
        arabicTextType: settings.arabicTextType,
        selectedFont: arabicFont,
        textUthmani: item.textUthmani?.substring(0, 30),
        textIndopak: item.textIndopak?.substring(0, 30) || 'N/A',
        selectedText: arabicText.substring(0, 30),
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
          <Text style={[themed($arabicText), { fontFamily: arabicFont }]}>{arabicText}</Text>
        </View>

        {/* Transliteration */}
        {settings.showTransliteration && item.words && item.words.length > 0 && (
          <View style={themed($transliterationContainer)}>
            <Text style={themed($transliterationText)}>
              {item.words
                .filter(w => w.char_type_name === 'word' && w.transliteration?.text)
                .map(w => w.transliteration?.text)
                .join(' ')}
            </Text>
          </View>
        )}

        {/* Translation */}
        {settings.showTranslation && (
          <View style={themed($translationContainer)}>
            {item.translations && item.translations.length > 0 ? (
              <>
                <Text style={themed($translationText)}>{stripHtmlTags(item.translations[0].text)}</Text>
                <Text style={themed($translatorName)}>
                  — {item.translations[0].translatorName}
                </Text>
              </>
            ) : (
              <Text style={themed($translationText)}>
                [No translation - translations: {JSON.stringify(item.translations)}]
              </Text>
            )}
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
            <FontAwesome6
              name="bookmark"
              size={20}
              color={isBookmarked ? colors.read : colors.textDim}
              solid={isBookmarked}
            />
          </TouchableOpacity>

          {/* Play/Pause Audio Button */}
          <TouchableOpacity
            style={themed($actionButton)}
            onPress={() => playAudio(item.verseKey, item.id)}
          >
            <AntDesign
              name={isPlaying ? 'pause-circle' : 'play-circle'}
              size={20}
              color={isPlaying ? colors.read : colors.textDim}
            />
          </TouchableOpacity>

          {/* Tafsir Button */}
          <TouchableOpacity
            style={themed($actionButton)}
            onPress={() => handleShowTafsir(item.verseKey)}
          >
            <FontAwesome6
              name="book-open"
              size={18}
              color={colors.textDim}
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
                <Text style={themed($settingDescription)}>Display translation</Text>
              </View>
              <Switch
                value={settings.showTranslation}
                onValueChange={(value) => setSettings({ ...settings, showTranslation: value })}
                trackColor={{ false: colors.border, true: colors.read }}
                thumbColor={colors.palette.white}
              />
            </View>

            {/* Translation Selector - Only shown when translation is enabled */}
            {settings.showTranslation && (
              <>
                <TouchableOpacity
                  style={themed($settingRow)}
                  onPress={() => setTranslationExpanded(!translationExpanded)}
                >
                  <View style={themed($settingInfo)}>
                    <Text style={themed($settingLabel)}>Translation</Text>
                    <Text style={themed($settingDescription)}>
                      {loadingTranslations
                        ? 'Loading translations...'
                        : translations.find(t => t.id === settings.translationId)?.name || 'Abdel Haleem'}
                    </Text>
                  </View>
                  <Icon
                    icon={translationExpanded ? "caretLeft" : "caretRight"}
                    size={20}
                    color={colors.textDim}
                  />
                </TouchableOpacity>

                {/* Translation List - Expanded with Language Tree */}
                {translationExpanded && translations.length > 0 && (
                  <ScrollView style={themed($translationList)} showsVerticalScrollIndicator={false} nestedScrollEnabled>
                    {/* Group translations by language */}
                    {(() => {
                      const languageGroups = translations.reduce((acc, t) => {
                        const lang = t.language_name || 'Other'
                        if (!acc[lang]) acc[lang] = []
                        acc[lang].push(t)
                        return acc
                      }, {} as Record<string, TranslationResource[]>)

                      // Sort languages alphabetically, but put English first
                      const sortedLanguages = Object.keys(languageGroups).sort((a, b) => {
                        if (a.toLowerCase() === 'english') return -1
                        if (b.toLowerCase() === 'english') return 1
                        return a.localeCompare(b)
                      })

                      return sortedLanguages.map((language) => {
                        const isLanguageExpanded = expandedLanguages.has(language)
                        const languageTranslations = languageGroups[language]
                        const hasSelectedTranslation = languageTranslations.some(t => t.id === settings.translationId)

                        return (
                          <View key={language}>
                            {/* Language Header */}
                            <TouchableOpacity
                              style={themed($languageHeader)}
                              onPress={() => {
                                const newExpanded = new Set(expandedLanguages)
                                if (isLanguageExpanded) {
                                  newExpanded.delete(language)
                                } else {
                                  newExpanded.add(language)
                                }
                                setExpandedLanguages(newExpanded)
                              }}
                            >
                              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                <Icon
                                  icon={isLanguageExpanded ? "caretDown" : "caretRight"}
                                  size={16}
                                  color={hasSelectedTranslation ? colors.read : colors.textDim}
                                />
                                <Text style={[
                                  themed($languageHeaderText),
                                  hasSelectedTranslation && { color: colors.read }
                                ]}>
                                  {language.charAt(0).toUpperCase() + language.slice(1)}
                                </Text>
                                <Text style={themed($languageCount)}>
                                  ({languageTranslations.length})
                                </Text>
                              </View>
                            </TouchableOpacity>

                            {/* Translations within language */}
                            {isLanguageExpanded && languageTranslations.map((translation) => (
                              <TouchableOpacity
                                key={translation.id}
                                style={themed(
                                  settings.translationId === translation.id
                                    ? $dropdownItemActiveIndented
                                    : $dropdownItemIndented
                                )}
                                onPress={async () => {
                                  setSettings({ ...settings, translationId: translation.id })
                                  setTranslationExpanded(false)
                                  setExpandedLanguages(new Set())
                                  setSettingsVisible(false)
                                  // Clear cache and reload verses with new translation
                                  await clearChapterCache(surahNumber)
                                  loadSurah(translation.id)
                                }}
                              >
                                <View style={{ flex: 1 }}>
                                  <Text
                                    style={themed(
                                      settings.translationId === translation.id
                                        ? $dropdownItemTextActive
                                        : $dropdownItemText
                                    )}
                                  >
                                    {translation.name}
                                  </Text>
                                  <Text style={themed($translationAuthor)}>
                                    by {translation.author_name}
                                  </Text>
                                </View>
                                {settings.translationId === translation.id && (
                                  <Icon icon="check" size={20} color={colors.read} />
                                )}
                              </TouchableOpacity>
                            ))}
                          </View>
                        )
                      })
                    })()}
                  </ScrollView>
                )}
              </>
            )}

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

            {/* Arabic Script Type - Collapsible Dropdown */}
            <TouchableOpacity
              style={themed($settingRow)}
              onPress={() => setScriptExpanded(!scriptExpanded)}
            >
              <View style={themed($settingInfo)}>
                <Text style={themed($settingLabel)}>Arabic Script</Text>
                <Text style={themed($settingDescription)}>
                  {settings.arabicTextType === 'uthmani' ? 'Uthmani' : 'Indo-Pak'}
                </Text>
              </View>
              <Icon
                icon={scriptExpanded ? "caretLeft" : "caretRight"}
                size={20}
                color={colors.textDim}
              />
            </TouchableOpacity>

            {/* Script Options - Expanded */}
            {scriptExpanded && (
              <View style={themed($dropdownOptions)}>
                <TouchableOpacity
                  style={themed(
                    settings.arabicTextType === 'uthmani' ? $dropdownItemActive : $dropdownItem
                  )}
                  onPress={() => {
                    setSettings({ ...settings, arabicTextType: 'uthmani' })
                    setScriptExpanded(false)
                  }}
                >
                  <Text
                    style={themed(
                      settings.arabicTextType === 'uthmani'
                        ? $dropdownItemTextActive
                        : $dropdownItemText
                    )}
                  >
                    Uthmani
                  </Text>
                  {settings.arabicTextType === 'uthmani' && (
                    <Icon icon="check" size={20} color={colors.read} />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={themed(
                    settings.arabicTextType === 'indopak' ? $dropdownItemActive : $dropdownItem
                  )}
                  onPress={() => {
                    setSettings({ ...settings, arabicTextType: 'indopak' })
                    setScriptExpanded(false)
                  }}
                >
                  <Text
                    style={themed(
                      settings.arabicTextType === 'indopak'
                        ? $dropdownItemTextActive
                        : $dropdownItemText
                    )}
                  >
                    Indo-Pak
                  </Text>
                  {settings.arabicTextType === 'indopak' && (
                    <Icon icon="check" size={20} color={colors.read} />
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* Info Message */}
            <View style={themed($infoMessage)}>
              <Icon icon="bell" size={16} color={colors.read} />
              <Text style={themed($infoMessageText)}>
                If Indo-Pak text or translations don't appear, tap "Reload Verses" below to fetch the latest data.
              </Text>
            </View>

            {/* Refresh Verses Button */}
            <TouchableOpacity
              style={themed($refreshButton)}
              onPress={async () => {
                setSettingsVisible(false)
                setLoading(true)
                try {
                  await refreshChapterVerses(surahNumber)
                  // Reload the surah
                  await loadSurah()
                  alert('✅ Verses reloaded successfully! All script types and translations are now available.')
                } catch (err) {
                  console.error('Failed to refresh verses:', err)
                  alert('❌ Failed to reload verses. Please check your internet connection.')
                }
                setLoading(false)
              }}
            >
              <Text style={themed($refreshButtonText)}>🔄 Reload Verses</Text>
            </TouchableOpacity>

            {/* Reciter Selection - Collapsible Dropdown */}
            <TouchableOpacity
              style={themed($settingRow)}
              onPress={() => setReciterExpanded(!reciterExpanded)}
            >
              <View style={themed($settingInfo)}>
                <Text style={themed($settingLabel)}>Audio Reciter</Text>
                <Text style={themed($settingDescription)}>
                  {loadingRecitations
                    ? 'Loading reciters...'
                    : recitations.find(r => r.id === settings.reciterId)?.reciter_name || 'Mishary Rashid Alafasy'}
                </Text>
              </View>
              <Icon
                icon={reciterExpanded ? "caretLeft" : "caretRight"}
                size={20}
                color={colors.textDim}
              />
            </TouchableOpacity>

            {/* Reciter List - Expanded */}
            {reciterExpanded && recitations.length > 0 && (
              <ScrollView style={themed($reciterList)} showsVerticalScrollIndicator={false}>
                {recitations.slice(0, 10).map((reciter) => (
                  <TouchableOpacity
                    key={reciter.id}
                    style={themed(
                      settings.reciterId === reciter.id
                        ? $reciterItemActive
                        : $reciterItem
                    )}
                    onPress={() => {
                      setSettings({ ...settings, reciterId: reciter.id })
                      setReciterExpanded(false)
                    }}
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

      {/* Tafsir Bottom Sheet Modal */}
      <Modal
        visible={tafsirVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setTafsirVisible(false)}
      >
        <View style={themed($modalOverlay)}>
          <View style={themed($tafsirModalContent)}>
            <View style={themed($modalHeader)}>
              <View>
                <Text style={themed($modalTitle)}>Tafsir</Text>
                <Text style={themed($tafsirVerseKey)}>{selectedVerseKey}</Text>
              </View>
              <TouchableOpacity onPress={() => setTafsirVisible(false)}>
                <Icon icon="x" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={themed($tafsirScrollView)}
            >
              {tafsirLoading ? (
                <View style={themed($tafsirLoadingContainer)}>
                  <ActivityIndicator size="large" color={colors.read} />
                  <Text style={themed($tafsirLoadingText)}>Loading Tafsir...</Text>
                </View>
              ) : tafsirData ? (
                <View style={themed($tafsirContent)}>
                  <View style={themed($tafsirHeaderInfo)}>
                    <FontAwesome6 name="book-open" size={14} color={colors.read} />
                    <Text style={themed($tafsirName)}>{tafsirData.tafsir_name}</Text>
                  </View>
                  <RenderHtml
                    contentWidth={width - 64}
                    source={{ html: tafsirData.text }}
                    baseStyle={{
                      color: colors.text,
                      fontSize: 15,
                      lineHeight: 24,
                    }}
                    tagsStyles={{
                      p: { marginBottom: 12 },
                      h3: {
                        fontSize: 17,
                        fontWeight: "600",
                        marginBottom: 8,
                        color: colors.text,
                      },
                      h4: {
                        fontSize: 16,
                        fontWeight: "600",
                        marginBottom: 6,
                        color: colors.text,
                      },
                      em: { fontStyle: "italic" },
                      strong: { fontWeight: "600" },
                    }}
                  />
                </View>
              ) : (
                <View style={themed($tafsirEmptyContainer)}>
                  <FontAwesome6 name="book-open" size={32} color={colors.textDim} />
                  <Text style={themed($tafsirEmptyText)}>No tafsir available for this verse</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Verses List */}
      <FlatList
        ref={flatListRef}
        data={verses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderVerse}
        contentContainerStyle={themed($listContent)}
        showsVerticalScrollIndicator={false}
        onScrollToIndexFailed={(info) => {
          // Wait for layout and retry scrolling
          const wait = new Promise(resolve => setTimeout(resolve, 100))
          wait.then(() => {
            if (flatListRef.current && info.index < verses.length) {
              flatListRef.current.scrollToIndex({
                index: info.index,
                animated: true,
                viewPosition: 0
              })
            }
          })
        }}
        ListHeaderComponent={
          <>
            {/* Bismillah (except for Surah 1 and 9) */}
            {surah && surah.id !== 1 && surah.id !== 9 && (
              <View style={themed($bismillahContainer)}>
                <Text style={[themed($bismillahText), {
                  fontFamily: settings.arabicTextType === 'indopak' ? 'IndoPak' : 'Uthman-Regular'
                }]}>
                  بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                </Text>
              </View>
            )}
          </>
        }
        ListFooterComponent={
          <View style={themed($navigationFooter)}>
            {/* Previous Surah Button */}
            <TouchableOpacity
              style={themed($navButton)}
              onPress={() => prevChapter && navigation.replace('QuranReader', { surahNumber: prevChapter.id, ayahNumber: 1 })}
              disabled={!prevChapter}
            >
              <Icon
                icon="caretLeft"
                size={20}
                color={!prevChapter ? colors.textDim : colors.read}
              />
              <Text style={themed(!prevChapter ? $navButtonTextDisabled : $navButtonText)}>
                {prevChapter ? prevChapter.name_simple : 'No Previous'}
              </Text>
            </TouchableOpacity>

            {/* Next Surah Button */}
            <TouchableOpacity
              style={themed($navButton)}
              onPress={() => nextChapter && navigation.replace('QuranReader', { surahNumber: nextChapter.id, ayahNumber: 1 })}
              disabled={!nextChapter}
            >
              <Text style={themed(!nextChapter ? $navButtonTextDisabled : $navButtonText)}>
                {nextChapter ? nextChapter.name_simple : 'No Next'}
              </Text>
              <Icon
                icon="caretRight"
                size={20}
                color={!nextChapter ? colors.textDim : colors.read}
              />
            </TouchableOpacity>
          </View>
        }
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
  padding: spacing.md,
  alignItems: "center",
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

// Dropdown styles
const $dropdownOptions: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.xs,
  marginBottom: spacing.md,
})

const $dropdownItem: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.md,
  borderRadius: 8,
  marginBottom: spacing.xs,
  backgroundColor: colors.palette.neutral100,
})

const $dropdownItemActive: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
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

const $dropdownItemText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 15,
  fontWeight: '500',
  color: colors.text,
})

const $dropdownItemTextActive: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 15,
  fontWeight: '600',
  color: colors.read,
})

const $infoMessage: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.read + '10',
  padding: spacing.md,
  borderRadius: 8,
  flexDirection: 'row',
  alignItems: 'flex-start',
  gap: spacing.xs,
  marginTop: spacing.md,
  marginBottom: spacing.xs,
  borderWidth: 1,
  borderColor: colors.read + '30',
})

const $infoMessageText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  flex: 1,
  fontSize: 13,
  color: colors.text,
  lineHeight: 18,
})

const $refreshButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.read,
  padding: spacing.md,
  borderRadius: 12,
  alignItems: 'center',
  marginVertical: spacing.sm,
})

const $refreshButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.white,
  fontSize: 15,
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

const $translationList: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  maxHeight: 300,
  marginTop: spacing.sm,
  marginBottom: spacing.md,
})

const $translationAuthor: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 12,
  color: colors.textDim,
  marginTop: 2,
})

const $languageHeader: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.sm,
  backgroundColor: colors.palette.neutral200,
  borderRadius: 8,
  marginBottom: spacing.xs,
})

const $languageHeaderText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 15,
  fontWeight: '600',
  color: colors.text,
  marginLeft: spacing.xs,
})

const $languageCount: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 13,
  color: colors.textDim,
  marginLeft: spacing.xs,
})

const $dropdownItemIndented: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.md,
  paddingLeft: spacing.lg + spacing.sm,
  borderRadius: 8,
  marginBottom: spacing.xs,
  backgroundColor: colors.palette.neutral100,
})

const $dropdownItemActiveIndented: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.md,
  paddingLeft: spacing.lg + spacing.sm,
  borderRadius: 8,
  marginBottom: spacing.xs,
  backgroundColor: colors.read + '20',
  borderWidth: 1,
  borderColor: colors.read,
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

const $navigationFooter: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.xl,
  marginTop: spacing.lg,
  borderTopWidth: 1,
  borderTopColor: colors.border,
})

const $navButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: spacing.xs,
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.md,
})

const $navButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 16,
  fontWeight: '600',
  color: colors.read,
})

const $navButtonTextDisabled: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 16,
  fontWeight: '600',
  color: colors.textDim,
})

// Tafsir bottom sheet styles
const $tafsirModalContent: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  padding: spacing.lg,
  paddingBottom: spacing.xl,
  maxHeight: '80%',
})

const $tafsirVerseKey: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 13,
  color: colors.textDim,
  marginTop: 2,
})

const $tafsirScrollView: ThemedStyle<ViewStyle> = () => ({
  flexGrow: 1,
})

const $tafsirLoadingContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: spacing.xxl,
  gap: spacing.md,
})

const $tafsirLoadingText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  color: colors.textDim,
})

const $tafsirContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingBottom: spacing.lg,
})

const $tafsirHeaderInfo: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: spacing.xs,
  marginBottom: spacing.md,
})

const $tafsirName: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  fontWeight: '600',
  color: colors.read,
})

const $tafsirEmptyContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: spacing.xxl,
  gap: spacing.md,
})

const $tafsirEmptyText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  color: colors.textDim,
  textAlign: 'center',
})
