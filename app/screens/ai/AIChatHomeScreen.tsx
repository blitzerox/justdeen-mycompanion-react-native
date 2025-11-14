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
} from "react-native"
import { Screen } from "@/components"
import { useAppTheme } from "@/theme/context"
import { useAuth } from "@/context/AuthContext"
import type { AIStackScreenProps } from "@/navigators"
import type { ThemedStyle } from "@/theme/types"
import {
  sendChatMessage,
  createChatSession,
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
}

export const AIChatHomeScreen: React.FC<AIStackScreenProps<"AIChatHome">> = ({ route }) => {
  const { themed, theme: { colors } } = useAppTheme()
  const { user, isAuthenticated } = useAuth()

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
  const flatListRef = useRef<FlatList>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true })
      }, 100)
    }
  }, [messages])

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

    // Create assistant message placeholder for streaming
    const assistantMessageId = (Date.now() + 1).toString()
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    }
    setMessages((prev) => [...prev, assistantMessage])

    try {
      // Create chat session if this is the first user message
      if (!chatId && messages.length === 1) {
        const session = await createChatSession(
          user.idToken,
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
      await sendChatMessage(
        userMessage.content,
        conversationHistory,
        user.idToken,
        user.id,
        chatId,
        {
          onToken: (token: string) => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? { ...msg, content: msg.content + token }
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
          onError: (error: string) => {
            console.error("Chat error:", error)

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

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === "user"
    const bubbleStyle = isUser ? $userBubble : $assistantBubble

    return (
      <View style={themed(isUser ? $userMessageContainer : $assistantMessageContainer)}>
        <View style={themed([bubbleStyle(colors), $messageBubble])}>
          <Text style={themed($messageText(colors, isUser))}>{item.content}</Text>

          {/* Show loading indicator for streaming messages */}
          {item.isStreaming && item.content.length === 0 && (
            <View style={themed($streamingIndicator)}>
              <ActivityIndicator size="small" color={colors.textDim} />
              <Text style={themed($streamingText(colors))}>Thinking...</Text>
            </View>
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
