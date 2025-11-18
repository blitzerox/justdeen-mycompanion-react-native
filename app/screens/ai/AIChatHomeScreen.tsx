/**
 * AI Assistant Screen
 *
 * Week 21: AI chatbot for Islamic Q&A
 * - Chat interface with message list
 * - Cloudflare RAG API with Llama 3.3 70B
 * - Cite Quran/Hadith references from vector search
 * - Streaming responses with SSE
 * - Maintain conversation context
 */
import React, { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Clipboard,
  Modal,
} from "react-native"
import { Screen } from "@/components"
import { useAppTheme } from "@/theme/context"
import { useAuth } from "@/context/AuthContext"
import type { AIStackScreenProps } from "@/navigators"
import type { ThemedStyle } from "@/theme/types"
import { FontAwesome6 } from "@expo/vector-icons"
import {
  sendChatMessage,
  createChatSession,
  submitFeedback,
  type Message as ApiMessage,
  type Citation,
} from "@/services/ai/cloudflareRagApi"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  citations?: Citation[]
  isStreaming?: boolean
  isThinking?: boolean
  messageId?: string // Backend message ID for feedback
  feedback?: "thumbs_up" | "thumbs_down" | null
}

// Thinking messages that cycle while AI generates response
const THINKING_MESSAGES = [
  'JustDeen is thinking...',
  'Searching the Quran...',
  'Looking into Sahih al-Bukhari...',
  'Checking Sahih Muslim...',
  'Reviewing Sunan Abu Dawood...',
  'Consulting Jami at-Tirmidhi...',
  'Examining authentic Hadith...',
  'Gathering Islamic references...',
  'Analyzing Quranic verses...',
  'Preparing your answer...',
]

export const AIChatHomeScreen: React.FC<AIStackScreenProps<"AIChatHome">> = ({ route }) => {
  const { themed, theme: { colors } } = useAppTheme()
  const { user, isAuthenticated, refreshToken } = useAuth()

  // Get initial prompt or chatId from navigation params
  const initialPrompt = route?.params?.initialPrompt
  const initialChatId = route?.params?.chatId

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Assalamu Alaikum! I'm your Islamic AI assistant powered by authentic Quran and Hadith sources. I can help answer questions about Islam, Islamic practices, and provide guidance. How may I assist you today?",
      timestamp: new Date(),
    },
  ])
  const [inputText, setInputText] = useState(initialPrompt || "")
  const [isLoading, setIsLoading] = useState(false)
  const [chatId, setChatId] = useState<string | undefined>(initialChatId)
  const [thinkingMessageIndex, setThinkingMessageIndex] = useState(0)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedbackMessageId, setFeedbackMessageId] = useState<string | null>(null)
  const [feedbackReasons, setFeedbackReasons] = useState<string[]>([])
  const [feedbackComment, setFeedbackComment] = useState("")
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)
  const flatListRef = useRef<FlatList>(null)
  const thinkingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true })
      }, 100)
    }
  }, [messages])

  // Update thinking message content as index changes
  useEffect(() => {
    if (thinkingIntervalRef.current) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.isThinking
            ? { ...msg, content: THINKING_MESSAGES[thinkingMessageIndex] }
            : msg
        )
      )
    }
  }, [thinkingMessageIndex])

  // Cleanup thinking interval on unmount
  useEffect(() => {
    return () => {
      if (thinkingIntervalRef.current) {
        clearInterval(thinkingIntervalRef.current)
        thinkingIntervalRef.current = null
      }
    }
  }, [])

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      Alert.alert(
        "Sign In Required",
        "Please sign in to use the AI assistant.",
        [{ text: "OK" }]
      )
    }
  }, [isAuthenticated])

  // Auto-send initial prompt if provided
  useEffect(() => {
    if (initialPrompt && isAuthenticated && user && messages.length === 1) {
      // Small delay to ensure UI is ready
      setTimeout(() => {
        handleSend()
      }, 500)
    }
  }, [initialPrompt, isAuthenticated, user])

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return

    // Check authentication
    if (!isAuthenticated || !user) {
      Alert.alert("Not Authenticated", "Please sign in to use the AI assistant.")
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputText.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputText("")
    setIsLoading(true)

    // Create assistant message placeholder with thinking indicator
    const assistantMessageId = (Date.now() + 1).toString()
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: THINKING_MESSAGES[0],
      timestamp: new Date(),
      isStreaming: true,
      isThinking: true,
    }
    setMessages((prev) => [...prev, assistantMessage])

    // Start cycling through thinking messages
    setThinkingMessageIndex(0)
    thinkingIntervalRef.current = setInterval(() => {
      setThinkingMessageIndex((prev) => (prev + 1) % THINKING_MESSAGES.length)
    }, 1800) // Change message every 1.8 seconds (same as web app)

    try {
      // Create chat session if this is the first user message
      if (!chatId && messages.length === 1) {
        const session = await createChatSession(
          user.accessToken, // Changed from idToken to accessToken
          user.id,
          userMessage.content.substring(0, 50) // Use first message as title
        )
        if (session) {
          setChatId(session.chatId)
        }
      }

      // Build conversation history for context
      const conversationHistory: ApiMessage[] = messages
        .filter((msg) => msg.role !== "assistant" || msg.id !== "welcome")
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }))

      // Send message with streaming
      // Use accessToken instead of idToken for API authentication
      await sendChatMessage(
        userMessage.content,
        conversationHistory,
        user.accessToken, // Changed from idToken to accessToken
        user.id,
        chatId,
        {
          onToken: (token: string) => {
            // Stop thinking animation on first token
            if (thinkingIntervalRef.current) {
              clearInterval(thinkingIntervalRef.current)
              thinkingIntervalRef.current = null
            }

            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? {
                      ...msg,
                      content: msg.isThinking ? token : msg.content + token,
                      isThinking: false
                    }
                  : msg
              )
            )
          },
          onSources: (sources: Citation[]) => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? { ...msg, citations: sources }
                  : msg
              )
            )
          },
          onComplete: () => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? { ...msg, isStreaming: false }
                  : msg
              )
            )
            setIsLoading(false)
          },
          onError: async (error: string) => {
            console.error("💥 Chat error received:", error)

            // Stop thinking animation on error
            if (thinkingIntervalRef.current) {
              clearInterval(thinkingIntervalRef.current)
              thinkingIntervalRef.current = null
            }

            // Check if it's a token expiry error
            if (error.includes("Token has expired") || error.includes("expired") || error.includes("Unauthorized")) {
              console.log("🔄 Token expired or unauthorized, attempting refresh...")

              // Try to refresh the token
              const refreshResult = await refreshToken()

              if (refreshResult.success && refreshResult.user) {
                console.log("✅ Token refreshed successfully, automatically retrying message...")
                console.log("🔍 Fresh user token (first 20 chars):", refreshResult.user.accessToken?.substring(0, 20))

                // Remove the thinking message
                setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessageId))

                // Automatically retry the message with the new token
                try {
                  // Create new assistant message for retry with thinking indicator
                  const retryAssistantId = (Date.now() + 3).toString()
                  const retryAssistantMessage: Message = {
                    id: retryAssistantId,
                    role: "assistant",
                    content: THINKING_MESSAGES[0],
                    timestamp: new Date(),
                    isStreaming: true,
                    isThinking: true,
                  }
                  setMessages((prev) => [...prev, retryAssistantMessage])

                  // Restart thinking animation for retry
                  setThinkingMessageIndex(0)
                  thinkingIntervalRef.current = setInterval(() => {
                    setThinkingMessageIndex((prev) => (prev + 1) % THINKING_MESSAGES.length)
                  }, 1800)

                  // Retry with the FRESH token from refreshResult
                  await sendChatMessage(
                    userMessage.content,
                    conversationHistory,
                    refreshResult.user.accessToken, // Use the freshly refreshed access token
                    refreshResult.user.id,
                    chatId,
                    {
                      onToken: (token: string) => {
                        // Stop thinking animation on first token
                        if (thinkingIntervalRef.current) {
                          clearInterval(thinkingIntervalRef.current)
                          thinkingIntervalRef.current = null
                        }

                        setMessages((prev) =>
                          prev.map((msg) =>
                            msg.id === retryAssistantId
                              ? {
                                  ...msg,
                                  content: msg.isThinking ? token : msg.content + token,
                                  isThinking: false
                                }
                              : msg
                          )
                        )
                      },
                      onSources: (sources: Citation[]) => {
                        setMessages((prev) =>
                          prev.map((msg) =>
                            msg.id === retryAssistantId
                              ? { ...msg, citations: sources }
                              : msg
                          )
                        )
                      },
                      onComplete: () => {
                        setMessages((prev) =>
                          prev.map((msg) =>
                            msg.id === retryAssistantId
                              ? { ...msg, isStreaming: false }
                              : msg
                          )
                        )
                        setIsLoading(false)
                      },
                      onError: (retryError: string) => {
                        console.error("Retry failed:", retryError)
                        setMessages((prev) => prev.filter((msg) => msg.id !== retryAssistantId))
                        const errorMessage: Message = {
                          id: (Date.now() + 4).toString(),
                          role: "assistant",
                          content: `I apologize, but I encountered an error: ${retryError}\n\nPlease try again in a moment.`,
                          timestamp: new Date(),
                        }
                        setMessages((prev) => [...prev, errorMessage])
                        setIsLoading(false)
                      },
                    }
                  )
                  return
                } catch (retryError: any) {
                  console.error("Failed to retry message:", retryError)
                  const errorMessage: Message = {
                    id: (Date.now() + 4).toString(),
                    role: "assistant",
                    content: `Session refreshed but retry failed. Please try sending your message again.`,
                    timestamp: new Date(),
                  }
                  setMessages((prev) => [...prev, errorMessage])
                  setIsLoading(false)
                  return
                }
              } else {
                // Refresh failed - show login prompt
                Alert.alert(
                  "Session Expired",
                  "Your session has expired. Please log in again to continue.",
                  [{ text: "OK" }]
                )
              }
            }

            // Remove the empty streaming message
            setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessageId))

            // Show error message
            const errorMessage: Message = {
              id: (Date.now() + 2).toString(),
              role: "assistant",
              content: `I apologize, but I encountered an error: ${error}\n\nPlease try again in a moment.`,
              timestamp: new Date(),
            }
            setMessages((prev) => [...prev, errorMessage])
            setIsLoading(false)
          },
        }
      )
    } catch (error: any) {
      console.error("AI error:", error)

      // Remove the empty streaming message
      setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessageId))

      Alert.alert("Error", "Failed to get AI response. Please try again.")
      setIsLoading(false)
    }
  }

  // Feedback options for thumbs down
  const FEEDBACK_OPTIONS = [
    { id: "incorrect", label: "Incorrect or inaccurate information" },
    { id: "unhelpful", label: "Not helpful or relevant" },
    { id: "incomplete", label: "Incomplete or missing context" },
    { id: "harmful", label: "Potentially harmful content" },
    { id: "formatting", label: "Poor formatting or hard to understand" },
    { id: "other", label: "Other (please specify in comments)" },
  ]

  // Handle copy to clipboard
  const handleCopy = async (message: Message) => {
    try {
      Clipboard.setString(message.content)
      setCopiedMessageId(message.id)
      setTimeout(() => setCopiedMessageId(null), 2000)
    } catch (error) {
      Alert.alert("Error", "Failed to copy message")
    }
  }

  // Handle thumbs up feedback
  const handleThumbsUp = async (message: Message) => {
    if (!message.messageId || !chatId || !user) return
    if (message.feedback === "thumbs_up") return // Already thumbs up

    try {
      const result = await submitFeedback(
        user.accessToken,
        message.messageId,
        chatId,
        "thumbs_up"
      )

      if (result.success) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === message.id ? { ...msg, feedback: "thumbs_up" } : msg
          )
        )
      } else {
        Alert.alert("Error", result.error || "Failed to submit feedback")
      }
    } catch (error) {
      Alert.alert("Error", "Failed to submit feedback")
    }
  }

  // Handle thumbs down feedback - show modal
  const handleThumbsDown = (message: Message) => {
    if (!message.messageId || !chatId) return
    if (message.feedback === "thumbs_down") return // Already thumbs down

    setFeedbackMessageId(message.id)
    setShowFeedbackModal(true)
  }

  // Toggle feedback reason
  const toggleFeedbackReason = (reasonId: string) => {
    setFeedbackReasons((prev) =>
      prev.includes(reasonId)
        ? prev.filter((r) => r !== reasonId)
        : [...prev, reasonId]
    )
  }

  // Submit detailed feedback
  const handleSubmitDetailedFeedback = async () => {
    if (!feedbackMessageId || !chatId || !user) return

    const message = messages.find((m) => m.id === feedbackMessageId)
    if (!message || !message.messageId) return

    setIsSubmittingFeedback(true)
    try {
      const result = await submitFeedback(
        user.accessToken,
        message.messageId,
        chatId,
        "thumbs_down",
        feedbackReasons,
        feedbackComment
      )

      if (result.success) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === feedbackMessageId ? { ...msg, feedback: "thumbs_down" } : msg
          )
        )
        setShowFeedbackModal(false)
        setFeedbackMessageId(null)
        setFeedbackReasons([])
        setFeedbackComment("")
      } else {
        Alert.alert("Error", result.error || "Failed to submit feedback")
      }
    } catch (error) {
      Alert.alert("Error", "Failed to submit feedback")
    } finally {
      setIsSubmittingFeedback(false)
    }
  }

  // Cancel feedback form
  const handleCancelFeedback = () => {
    setShowFeedbackModal(false)
    setFeedbackMessageId(null)
    setFeedbackReasons([])
    setFeedbackComment("")
  }

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === "user"
    const bubbleStyle = isUser ? $userBubble : $assistantBubble

    return (
      <View style={themed(isUser ? $userMessageContainer : $assistantMessageContainer)}>
        <View style={themed([bubbleStyle(colors), $messageBubble])}>
          {/* Show thinking indicator with cycling messages */}
          {item.isThinking ? (
            <View style={themed($thinkingContainer)}>
              <ActivityIndicator size="small" color={colors.textDim} />
              <Text style={themed($thinkingText(colors))}>{item.content}</Text>
            </View>
          ) : (
            <Text style={themed($messageText(colors, isUser))}>{item.content}</Text>
          )}

          {/* Citations */}
          {item.citations && item.citations.length > 0 && (
            <View style={themed($citationsContainer(colors))}>
              <Text style={themed($citationsTitle(colors))}>Sources:</Text>
              {item.citations.map((citation, index) => (
                <View key={index} style={themed($citation)}>
                  <Text style={themed($citationReference(colors))}>
                    {citation.reference}
                  </Text>
                  <Text style={themed($citationText(colors))} numberOfLines={2}>
                    {citation.text}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Action Buttons - Only for assistant messages that are not streaming/thinking */}
        {!isUser && !item.isStreaming && !item.isThinking && (
          <View style={themed($actionButtons)}>
            {/* Copy Button */}
            <TouchableOpacity
              style={themed($actionButton(colors))}
              onPress={() => handleCopy(item)}
              activeOpacity={0.7}
            >
              <FontAwesome6
                name={copiedMessageId === item.id ? "check" : "copy"}
                size={14}
                color={copiedMessageId === item.id ? colors.ai : colors.textDim}
                solid={copiedMessageId === item.id}
              />
            </TouchableOpacity>

            {/* Thumbs Up Button - Only show if message has ID */}
            {item.messageId && chatId && (
              <>
                <TouchableOpacity
                  style={themed($actionButton(colors, item.feedback === "thumbs_up"))}
                  onPress={() => handleThumbsUp(item)}
                  activeOpacity={0.7}
                >
                  <FontAwesome6
                    name="thumbs-up"
                    size={14}
                    color={item.feedback === "thumbs_up" ? colors.ai : colors.textDim}
                    solid={item.feedback === "thumbs_up"}
                  />
                </TouchableOpacity>

                {/* Thumbs Down Button */}
                <TouchableOpacity
                  style={themed($actionButton(colors, item.feedback === "thumbs_down"))}
                  onPress={() => handleThumbsDown(item)}
                  activeOpacity={0.7}
                >
                  <FontAwesome6
                    name="thumbs-down"
                    size={14}
                    color={item.feedback === "thumbs_down" ? colors.ai : colors.textDim}
                    solid={item.feedback === "thumbs_down"}
                  />
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        <Text style={themed($timestamp(colors))}>
          {item.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Text>
      </View>
    )
  }

  return (
    <Screen preset="fixed" safeAreaEdges={["top", "bottom"]} contentContainerStyle={themed($container(colors))}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={themed($keyboardView)}
        keyboardVerticalOffset={100}
      >
        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={themed($messagesList)}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Input Area */}
        <View style={themed($inputContainer(colors))}>
          <TextInput
            style={themed($input(colors))}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask about Islam, Quran, Hadith..."
            placeholderTextColor={colors.textDim}
            multiline
            maxLength={500}
            editable={!isLoading && isAuthenticated}
          />
          <TouchableOpacity
            style={themed($sendButton(colors, !inputText.trim() || isLoading))}
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.background} />
            ) : (
              <Text style={themed($sendButtonText)}>Send</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Feedback Modal */}
      <Modal
        visible={showFeedbackModal}
        transparent
        animationType="slide"
        onRequestClose={handleCancelFeedback}
      >
        <View style={themed($modalOverlay)}>
          <View style={themed($modalContent(colors))}>
            {/* Header */}
            <View style={themed($modalHeader)}>
              <Text style={themed($modalTitle(colors))}>Provide additional feedback</Text>
              <TouchableOpacity onPress={handleCancelFeedback} activeOpacity={0.7}>
                <FontAwesome6 name="xmark" size={20} color={colors.textDim} />
              </TouchableOpacity>
            </View>

            {/* Body */}
            <View style={themed($modalBody)}>
              <Text style={themed($feedbackDescription(colors))}>
                What was the issue with this response? (Select all that apply)
              </Text>

              {/* Feedback Options */}
              <View style={themed($feedbackOptions)}>
                {FEEDBACK_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={themed($feedbackOption(colors, feedbackReasons.includes(option.id)))}
                    onPress={() => toggleFeedbackReason(option.id)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={themed($checkbox(colors, feedbackReasons.includes(option.id)))}
                    >
                      {feedbackReasons.includes(option.id) && (
                        <FontAwesome6 name="check" size={12} color={colors.background} />
                      )}
                    </View>
                    <Text style={themed($feedbackOptionLabel(colors))}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Comment Section */}
              <View style={themed($feedbackCommentSection)}>
                <Text style={themed($feedbackCommentLabel(colors))}>
                  Additional comments (optional)
                </Text>
                <TextInput
                  style={themed($feedbackCommentInput(colors))}
                  placeholder="Please provide any additional details..."
                  placeholderTextColor={colors.textDim}
                  value={feedbackComment}
                  onChangeText={setFeedbackComment}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              {/* Actions */}
              <View style={themed($feedbackActions)}>
                <TouchableOpacity
                  style={themed($feedbackButton(colors, false))}
                  onPress={handleCancelFeedback}
                  disabled={isSubmittingFeedback}
                  activeOpacity={0.7}
                >
                  <Text style={themed($feedbackButtonText(colors, false))}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={themed($feedbackButton(colors, true))}
                  onPress={handleSubmitDetailedFeedback}
                  disabled={isSubmittingFeedback || feedbackReasons.length === 0}
                  activeOpacity={0.7}
                >
                  {isSubmittingFeedback ? (
                    <ActivityIndicator size="small" color={colors.background} />
                  ) : (
                    <Text style={themed($feedbackButtonText(colors, true))}>
                      Submit Feedback
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  )
}

// Styles
const $container: ThemedStyle<any> = (colors) => ({
  flex: 1,
  backgroundColor: colors.background,
})

const $keyboardView: ThemedStyle<any> = {
  flex: 1,
}

const $messagesList: ThemedStyle<any> = {
  padding: 16,
  paddingBottom: 8,
}

const $userMessageContainer: ThemedStyle<any> = {
  alignItems: "flex-end",
  marginBottom: 16,
}

const $assistantMessageContainer: ThemedStyle<any> = {
  alignItems: "flex-start",
  marginBottom: 16,
}

const $messageBubble: ThemedStyle<any> = {
  maxWidth: "85%",
  borderRadius: 16,
  padding: 12,
}

const $userBubble: ThemedStyle<any> = (colors) => ({
  backgroundColor: colors.ai,
})

const $assistantBubble: ThemedStyle<any> = (colors) => ({
  backgroundColor: colors.palette.surface,
})

const $messageText: ThemedStyle<any> = (colors, isUser: boolean) => ({
  fontSize: 16,
  lineHeight: 22,
  color: isUser ? "#FFFFFF" : colors.text,
})

const $streamingIndicator: ThemedStyle<any> = {
  flexDirection: "row",
  alignItems: "center",
  marginTop: 8,
}

const $streamingText: ThemedStyle<any> = (colors) => ({
  fontSize: 14,
  color: colors.textDim,
  marginLeft: 8,
  fontStyle: "italic",
})

const $timestamp: ThemedStyle<any> = (colors) => ({
  fontSize: 11,
  color: colors.textDim,
  marginTop: 4,
})

const $citationsContainer: ThemedStyle<any> = (colors) => ({
  marginTop: 12,
  paddingTop: 12,
  borderTopWidth: 1,
  borderTopColor: colors.border,
})

const $citationsTitle: ThemedStyle<any> = (colors) => ({
  fontSize: 12,
  fontWeight: "600",
  color: colors.textDim,
  marginBottom: 8,
  textTransform: "uppercase",
})

const $thinkingContainer: ThemedStyle<any> = {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
}

const $thinkingText: ThemedStyle<any> = (colors) => ({
  fontSize: 15,
  color: colors.textDim,
  fontStyle: "italic",
  opacity: 0.8,
})

const $citation: ThemedStyle<any> = {
  marginBottom: 8,
}

const $citationReference: ThemedStyle<any> = (colors) => ({
  fontSize: 13,
  fontWeight: "600",
  color: colors.text,
  marginBottom: 2,
})

const $citationText: ThemedStyle<any> = (colors) => ({
  fontSize: 12,
  color: colors.textDim,
  fontStyle: "italic",
})

const $inputContainer: ThemedStyle<any> = (colors) => ({
  flexDirection: "row",
  alignItems: "center",
  padding: 12,
  borderTopWidth: 1,
  borderTopColor: colors.border,
  backgroundColor: colors.background,
})

const $input: ThemedStyle<any> = (colors) => ({
  flex: 1,
  minHeight: 40,
  maxHeight: 100,
  backgroundColor: colors.palette.surface,
  borderRadius: 20,
  paddingHorizontal: 16,
  paddingVertical: 10,
  fontSize: 16,
  color: colors.text,
  marginRight: 8,
})

const $sendButton: ThemedStyle<any> = (colors, disabled: boolean) => ({
  backgroundColor: disabled ? colors.textDim : colors.ai,
  borderRadius: 20,
  paddingHorizontal: 20,
  paddingVertical: 10,
  minWidth: 70,
  alignItems: "center",
  justifyContent: "center",
})

const $sendButtonText: ThemedStyle<any> = {
  color: "#FFFFFF",
  fontSize: 16,
  fontWeight: "600",
}

// Action Buttons Styles
const $actionButtons: ThemedStyle<any> = {
  flexDirection: "row",
  gap: 8,
  marginTop: 8,
  marginLeft: 4,
}

const $actionButton: ThemedStyle<any> = (colors, isActive = false) => ({
  width: 32,
  height: 32,
  borderRadius: 16,
  backgroundColor: isActive ? colors.ai + "20" : colors.palette.surface,
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
  borderColor: isActive ? colors.ai + "40" : colors.border,
})

// Modal Styles
const $modalOverlay: ThemedStyle<any> = {
  flex: 1,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  justifyContent: "flex-end",
}

const $modalContent: ThemedStyle<any> = (colors) => ({
  backgroundColor: colors.background,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  paddingBottom: 40,
  maxHeight: "80%",
})

const $modalHeader: ThemedStyle<any> = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  padding: 20,
  paddingBottom: 16,
}

const $modalTitle: ThemedStyle<any> = (colors) => ({
  fontSize: 18,
  fontWeight: "700",
  color: colors.text,
})

const $modalBody: ThemedStyle<any> = {
  paddingHorizontal: 20,
}

const $feedbackDescription: ThemedStyle<any> = (colors) => ({
  fontSize: 14,
  color: colors.textSecondary,
  marginBottom: 16,
})

const $feedbackOptions: ThemedStyle<any> = {
  gap: 12,
  marginBottom: 20,
}

const $feedbackOption: ThemedStyle<any> = (colors, isSelected: boolean) => ({
  flexDirection: "row",
  alignItems: "center",
  padding: 12,
  backgroundColor: isSelected ? colors.ai + "10" : colors.palette.surface,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: isSelected ? colors.ai : colors.border,
})

const $checkbox: ThemedStyle<any> = (colors, isChecked: boolean) => ({
  width: 20,
  height: 20,
  borderRadius: 4,
  borderWidth: 2,
  borderColor: isChecked ? colors.ai : colors.border,
  backgroundColor: isChecked ? colors.ai : "transparent",
  alignItems: "center",
  justifyContent: "center",
  marginRight: 12,
})

const $feedbackOptionLabel: ThemedStyle<any> = (colors) => ({
  fontSize: 14,
  color: colors.text,
  flex: 1,
})

const $feedbackCommentSection: ThemedStyle<any> = {
  marginBottom: 20,
}

const $feedbackCommentLabel: ThemedStyle<any> = (colors) => ({
  fontSize: 14,
  fontWeight: "600",
  color: colors.text,
  marginBottom: 8,
})

const $feedbackCommentInput: ThemedStyle<any> = (colors) => ({
  backgroundColor: colors.palette.surface,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: colors.border,
  padding: 12,
  fontSize: 14,
  color: colors.text,
  minHeight: 100,
})

const $feedbackActions: ThemedStyle<any> = {
  flexDirection: "row",
  gap: 12,
}

const $feedbackButton: ThemedStyle<any> = (colors, isPrimary: boolean) => ({
  flex: 1,
  backgroundColor: isPrimary ? colors.ai : "transparent",
  borderWidth: isPrimary ? 0 : 1,
  borderColor: colors.border,
  borderRadius: 8,
  paddingVertical: 14,
  alignItems: "center",
  justifyContent: "center",
})

const $feedbackButtonText: ThemedStyle<any> = (colors, isPrimary: boolean) => ({
  fontSize: 15,
  fontWeight: "600",
  color: isPrimary ? "#FFFFFF" : colors.text,
})
