/**
 * AI Home Screen - Landing Page
 *
 * Week 21: AI Assistant landing page with:
 * - Islamic AI Assistant hero card with "Start New Conversation"
 * - Quick Actions section (4 action buttons)
 * - Suggested Topics section
 * - Recent Conversations section (integrates with Cloudflare RAG)
 */
import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native"
import { Screen, Icon } from "@/components"
import { useAppTheme } from "@/theme/context"
import { useAuth } from "@/context/AuthContext"
import { FontAwesome6 } from "@expo/vector-icons"
import type { AIStackScreenProps } from "@/navigators"
import type { ThemedStyle } from "@/theme/types"
import { getChatHistory } from "@/services/ai/cloudflareRagApi"

interface QuickAction {
  id: string
  title: string
  description: string
  icon: string
  prompt: string
}

interface SuggestedTopic {
  id: string
  question: string
  category: string
}

interface ChatHistoryItem {
  id: string
  title: string
  lastMessage: string
  timestamp: number
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "verse-explanation",
    title: "Verse Explanation",
    description: "Understand Quranic verses with context",
    icon: "book-quran",
    prompt: "Can you explain this verse from the Quran?",
  },
  {
    id: "prayer-guidance",
    title: "Prayer Guidance",
    description: "Learn about prayer times and practices",
    icon: "person-praying",
    prompt: "Can you help me with prayer guidance?",
  },
  {
    id: "islamic-qa",
    title: "Islamic Q&A",
    description: "Get answers to Islamic questions",
    icon: "comments",
    prompt: "I have a question about Islam",
  },
  {
    id: "spiritual-advice",
    title: "Spiritual Advice",
    description: "Guidance for spiritual growth",
    icon: "heart",
    prompt: "Can you provide spiritual advice?",
  },
]

const SUGGESTED_TOPICS: SuggestedTopic[] = [
  {
    id: "ramadan-prep",
    question: "How can I best prepare for Ramadan?",
    category: "Worship",
  },
  {
    id: "hajj-essentials",
    question: "What are the essential steps of Hajj?",
    category: "Pilgrimage",
  },
  {
    id: "zakat-calculation",
    question: "How do I calculate my Zakat?",
    category: "Charity",
  },
  {
    id: "quran-memorization",
    question: "What are tips for memorizing the Quran?",
    category: "Learning",
  },
  {
    id: "daily-duas",
    question: "What are essential daily duas?",
    category: "Duas",
  },
]

export const AIHomeScreen: React.FC<AIStackScreenProps<"AIHome">> = ({ navigation }) => {
  const { themed, theme: { colors } } = useAppTheme()
  const { user, isAuthenticated } = useAuth()

  const [recentChats, setRecentChats] = useState<ChatHistoryItem[]>([])
  const [isLoadingChats, setIsLoadingChats] = useState(false)

  // Load recent conversations
  useEffect(() => {
    const loadRecentChats = async () => {
      if (!isAuthenticated || !user) return

      setIsLoadingChats(true)
      try {
        const chats = await getChatHistory(user.idToken, user.id)
        if (chats) {
          // Map to ChatHistoryItem format
          const mappedChats = chats.slice(0, 5).map((chat: any) => ({
            id: chat.id,
            title: chat.title || "Untitled Conversation",
            lastMessage: chat.last_message || "",
            timestamp: chat.updated_at || chat.created_at,
          }))
          setRecentChats(mappedChats)
        }
      } catch (error) {
        console.error("Failed to load chat history:", error)
      } finally {
        setIsLoadingChats(false)
      }
    }

    loadRecentChats()
  }, [isAuthenticated, user])

  // Handle sign-in requirement
  const handleSignInRequired = () => {
    Alert.alert(
      "Sign In Required",
      "Please sign in to use the AI assistant and access your conversation history.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Go to Settings",
          onPress: () => {
            // Navigate to Settings tab
            // @ts-ignore - navigating to different tab
            navigation.navigate("SettingsTab", { screen: "SettingsHome" })
          },
        },
      ]
    )
  }

  // Start new conversation
  const handleStartConversation = () => {
    if (!isAuthenticated) {
      handleSignInRequired()
      return
    }
    navigation.navigate("AIChatHome")
  }

  // Handle quick action press
  const handleQuickAction = (action: QuickAction) => {
    if (!isAuthenticated) {
      handleSignInRequired()
      return
    }
    // Navigate to chat with pre-filled prompt
    navigation.navigate("AIChatHome", { initialPrompt: action.prompt })
  }

  // Handle suggested topic press
  const handleSuggestedTopic = (topic: SuggestedTopic) => {
    if (!isAuthenticated) {
      handleSignInRequired()
      return
    }
    navigation.navigate("AIChatHome", { initialPrompt: topic.question })
  }

  // Handle recent chat press
  const handleRecentChat = (chat: ChatHistoryItem) => {
    if (!isAuthenticated) {
      handleSignInRequired()
      return
    }
    navigation.navigate("AIChatHome", { chatId: chat.id })
  }

  // Format timestamp for recent chats
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp * 1000)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <Screen preset="fixed" safeAreaEdges={["top", "bottom"]} contentContainerStyle={themed($container(colors))}>
      {/* Custom Header */}
      <View style={themed($header)}>
        <View style={themed($headerLeft)}>
          <View style={themed($avatar(colors))}>
            <FontAwesome6 name="robot" size={20} color={colors.ai} solid />
          </View>
          <Text style={themed($greeting(colors))}>AI</Text>
        </View>
        <View style={themed($headerRight)}>
          <TouchableOpacity
            style={themed($iconButton(colors))}
            onPress={() => navigation.navigate("ChatHistory")}
            activeOpacity={0.7}
          >
            <FontAwesome6 name="clock-rotate-left" size={20} color={colors.ai} />
          </TouchableOpacity>
          <TouchableOpacity
            style={themed($iconButton(colors))}
            onPress={() => navigation.navigate("AISettings")}
            activeOpacity={0.7}
          >
            <FontAwesome6 name="gear" size={20} color={colors.ai} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={themed($scrollView)}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Card - Islamic AI Assistant */}
        <View style={themed($heroCard(colors))}>
          <View style={themed($heroIconContainer(colors))}>
            <FontAwesome6 name="robot" size={48} color={colors.ai} solid />
          </View>
          <Text style={themed($heroTitle(colors))}>Islamic AI Assistant</Text>
          <Text style={themed($heroDescription(colors))}>
            Get answers to your Islamic questions powered by authentic Quran and Hadith sources.
            Ask me anything about Islam, worship, or spiritual guidance.
          </Text>
          <TouchableOpacity
            style={themed($startButton(colors))}
            onPress={handleStartConversation}
            activeOpacity={0.8}
          >
            <Text style={themed($startButtonText)}>Start New Conversation</Text>
            <FontAwesome6 name="arrow-right" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Quick Actions Section */}
        <View style={themed($section)}>
          <Text style={themed($sectionTitle(colors))}>Quick Actions</Text>
          <View style={themed($quickActionsGrid)}>
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={themed($quickActionCard(colors))}
                onPress={() => handleQuickAction(action)}
                activeOpacity={0.7}
              >
                <View style={themed($quickActionIcon(colors))}>
                  <FontAwesome6 name={action.icon as any} size={24} color={colors.ai} solid />
                </View>
                <Text style={themed($quickActionTitle(colors))}>{action.title}</Text>
                <Text style={themed($quickActionDescription(colors))} numberOfLines={2}>
                  {action.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Suggested Topics Section */}
        <View style={themed($section)}>
          <Text style={themed($sectionTitle(colors))}>Suggested Topics</Text>
          <View style={themed($topicsList)}>
            {SUGGESTED_TOPICS.map((topic) => (
              <TouchableOpacity
                key={topic.id}
                style={themed($topicCard(colors))}
                onPress={() => handleSuggestedTopic(topic)}
                activeOpacity={0.7}
              >
                <View style={themed($topicContent)}>
                  <Text style={themed($topicQuestion(colors))}>{topic.question}</Text>
                  <View style={themed($topicCategory(colors))}>
                    <Text style={themed($topicCategoryText(colors))}>{topic.category}</Text>
                  </View>
                </View>
                <FontAwesome6 name="chevron-right" size={16} color={colors.textDim} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Conversations Section */}
        {isAuthenticated && (
          <View style={themed($section)}>
            <View style={themed($sectionHeader)}>
              <Text style={themed($sectionTitle(colors))}>Recent Conversations</Text>
              {recentChats.length > 0 && (
                <TouchableOpacity
                  onPress={() => navigation.navigate("ChatHistory")}
                  activeOpacity={0.7}
                >
                  <Text style={themed($seeAllText(colors))}>See All</Text>
                </TouchableOpacity>
              )}
            </View>

            {isLoadingChats ? (
              <View style={themed($loadingContainer)}>
                <ActivityIndicator size="small" color={colors.ai} />
                <Text style={themed($loadingText(colors))}>Loading conversations...</Text>
              </View>
            ) : recentChats.length === 0 ? (
              <View style={themed($emptyState(colors))}>
                <FontAwesome6 name="comments" size={40} color={colors.textDim} />
                <Text style={themed($emptyStateText(colors))}>No conversations yet</Text>
                <Text style={themed($emptyStateSubtext(colors))}>
                  Start a new conversation to get answers to your Islamic questions
                </Text>
              </View>
            ) : (
              <View style={themed($chatsList)}>
                {recentChats.map((chat) => (
                  <TouchableOpacity
                    key={chat.id}
                    style={themed($chatCard(colors))}
                    onPress={() => handleRecentChat(chat)}
                    activeOpacity={0.7}
                  >
                    <View style={themed($chatIconContainer(colors))}>
                      <FontAwesome6 name="message" size={16} color={colors.ai} solid />
                    </View>
                    <View style={themed($chatContent)}>
                      <Text style={themed($chatTitle(colors))} numberOfLines={1}>
                        {chat.title}
                      </Text>
                      {chat.lastMessage && (
                        <Text style={themed($chatLastMessage(colors))} numberOfLines={1}>
                          {chat.lastMessage}
                        </Text>
                      )}
                      <Text style={themed($chatTimestamp(colors))}>
                        {formatTimestamp(chat.timestamp)}
                      </Text>
                    </View>
                    <FontAwesome6 name="chevron-right" size={16} color={colors.textDim} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Sign in prompt for unauthenticated users */}
        {!isAuthenticated && (
          <View style={themed($signInPrompt(colors))}>
            <FontAwesome6 name="circle-info" size={20} color={colors.ai} />
            <Text style={themed($signInPromptText(colors))}>
              Sign in to save your conversations and access them across devices
            </Text>
            <TouchableOpacity
              style={themed($signInButton(colors))}
              onPress={handleSignInRequired}
              activeOpacity={0.8}
            >
              <Text style={themed($signInButtonText(colors))}>Sign In</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom spacing */}
        <View style={themed($bottomSpacer)} />
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

// Hero Card Styles
const $heroCard: ThemedStyle<any> = (colors) => ({
  margin: 16,
  marginTop: 8,
  padding: 24,
  backgroundColor: colors.palette.surface,
  borderRadius: 16,
  alignItems: "center",
})

const $heroIconContainer: ThemedStyle<any> = (colors) => ({
  width: 96,
  height: 96,
  borderRadius: 48,
  backgroundColor: colors.ai + "15",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 16,
})

const $heroTitle: ThemedStyle<any> = (colors) => ({
  fontSize: 24,
  fontWeight: "700",
  color: colors.text,
  marginBottom: 12,
  textAlign: "center",
})

const $heroDescription: ThemedStyle<any> = (colors) => ({
  fontSize: 15,
  lineHeight: 22,
  color: colors.textSecondary,
  textAlign: "center",
  marginBottom: 20,
})

const $startButton: ThemedStyle<any> = (colors) => ({
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: colors.ai,
  paddingHorizontal: 24,
  paddingVertical: 14,
  borderRadius: 12,
  gap: 8,
})

const $startButtonText: ThemedStyle<any> = {
  fontSize: 16,
  fontWeight: "600",
  color: "#FFFFFF",
}

// Section Styles
const $section: ThemedStyle<any> = {
  marginTop: 24,
  paddingHorizontal: 16,
}

const $sectionHeader: ThemedStyle<any> = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 12,
}

const $sectionTitle: ThemedStyle<any> = (colors) => ({
  fontSize: 20,
  fontWeight: "700",
  color: colors.text,
  marginBottom: 12,
})

const $seeAllText: ThemedStyle<any> = (colors) => ({
  fontSize: 15,
  fontWeight: "600",
  color: colors.ai,
})

// Quick Actions Styles
const $quickActionsGrid: ThemedStyle<any> = {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 12,
}

const $quickActionCard: ThemedStyle<any> = (colors) => ({
  width: "48%",
  backgroundColor: colors.palette.surface,
  borderRadius: 12,
  padding: 16,
  minHeight: 140,
})

const $quickActionIcon: ThemedStyle<any> = (colors) => ({
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: colors.ai + "15",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 12,
})

const $quickActionTitle: ThemedStyle<any> = (colors) => ({
  fontSize: 15,
  fontWeight: "600",
  color: colors.text,
  marginBottom: 4,
})

const $quickActionDescription: ThemedStyle<any> = (colors) => ({
  fontSize: 13,
  lineHeight: 18,
  color: colors.textDim,
})

// Suggested Topics Styles
const $topicsList: ThemedStyle<any> = {
  gap: 8,
}

const $topicCard: ThemedStyle<any> = (colors) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  backgroundColor: colors.palette.surface,
  borderRadius: 12,
  padding: 16,
})

const $topicContent: ThemedStyle<any> = {
  flex: 1,
  marginRight: 12,
}

const $topicQuestion: ThemedStyle<any> = (colors) => ({
  fontSize: 15,
  fontWeight: "500",
  color: colors.text,
  marginBottom: 6,
})

const $topicCategory: ThemedStyle<any> = (colors) => ({
  alignSelf: "flex-start",
  backgroundColor: colors.ai + "15",
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 6,
})

const $topicCategoryText: ThemedStyle<any> = (colors) => ({
  fontSize: 12,
  fontWeight: "600",
  color: colors.ai,
})

// Recent Conversations Styles
const $chatsList: ThemedStyle<any> = {
  gap: 8,
}

const $chatCard: ThemedStyle<any> = (colors) => ({
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: colors.palette.surface,
  borderRadius: 12,
  padding: 16,
})

const $chatIconContainer: ThemedStyle<any> = (colors) => ({
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: colors.ai + "15",
  alignItems: "center",
  justifyContent: "center",
  marginRight: 12,
})

const $chatContent: ThemedStyle<any> = {
  flex: 1,
  marginRight: 12,
}

const $chatTitle: ThemedStyle<any> = (colors) => ({
  fontSize: 15,
  fontWeight: "600",
  color: colors.text,
  marginBottom: 4,
})

const $chatLastMessage: ThemedStyle<any> = (colors) => ({
  fontSize: 14,
  color: colors.textDim,
  marginBottom: 4,
})

const $chatTimestamp: ThemedStyle<any> = (colors) => ({
  fontSize: 12,
  color: colors.textDim,
})

// Loading & Empty States
const $loadingContainer: ThemedStyle<any> = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
  gap: 12,
}

const $loadingText: ThemedStyle<any> = (colors) => ({
  fontSize: 14,
  color: colors.textDim,
})

const $emptyState: ThemedStyle<any> = (colors) => ({
  alignItems: "center",
  padding: 32,
  backgroundColor: colors.palette.surface,
  borderRadius: 12,
})

const $emptyStateText: ThemedStyle<any> = (colors) => ({
  fontSize: 16,
  fontWeight: "600",
  color: colors.text,
  marginTop: 16,
  marginBottom: 8,
})

const $emptyStateSubtext: ThemedStyle<any> = (colors) => ({
  fontSize: 14,
  color: colors.textDim,
  textAlign: "center",
})

// Sign In Prompt Styles
const $signInPrompt: ThemedStyle<any> = (colors) => ({
  margin: 16,
  marginTop: 24,
  padding: 20,
  backgroundColor: colors.palette.surface,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.ai + "30",
  alignItems: "center",
  gap: 12,
})

const $signInPromptText: ThemedStyle<any> = (colors) => ({
  fontSize: 14,
  lineHeight: 20,
  color: colors.textSecondary,
  textAlign: "center",
})

const $signInButton: ThemedStyle<any> = (colors) => ({
  backgroundColor: colors.ai,
  paddingHorizontal: 24,
  paddingVertical: 10,
  borderRadius: 8,
  marginTop: 4,
})

const $signInButtonText: ThemedStyle<any> = {
  fontSize: 15,
  fontWeight: "600",
  color: "#FFFFFF",
}

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
  backgroundColor: colors.ai + "20",
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

const $bottomSpacer: ThemedStyle<any> = {
  height: 32,
}
