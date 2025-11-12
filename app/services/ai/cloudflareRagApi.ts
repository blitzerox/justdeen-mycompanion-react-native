/**
 * Cloudflare RAG API Service
 *
 * Integrates with JustDeen's Cloudflare Workers AI chatbot
 * - Llama 3.3 70B with RAG (Quran, Hadith, Duas knowledge base)
 * - Server-Sent Events (SSE) for streaming responses
 * - JWT authentication with Auth0
 */

export interface Message {
  role: "user" | "assistant" | "system"
  content: string
}

export interface Citation {
  type: "quran" | "hadith" | "dua"
  reference: string
  text: string
  score?: number
}

export interface ChatResponse {
  response: string
  sources?: Citation[]
  done?: boolean
  error?: boolean
  message?: string
}

export interface StreamCallbacks {
  onToken: (token: string) => void
  onSources: (sources: Citation[]) => void
  onComplete: () => void
  onError: (error: string) => void
}

/**
 * Send chat message to Cloudflare RAG API with streaming
 */
export async function sendChatMessage(
  message: string,
  conversationHistory: Message[],
  authToken: string,
  userId: string,
  chatId: string | undefined,
  callbacks: StreamCallbacks
): Promise<void> {
  const API_URL = "https://justdeen-rag-chatbot.husainshah101-682.workers.dev/api/chat"

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        message,
        conversationHistory,
        user_id: userId,
        chat_id: chatId,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`
      )
    }

    // Check if response is JSON error (security block, rate limit, etc.)
    const contentType = response.headers.get("content-type")
    if (contentType?.includes("application/json")) {
      const errorData = await response.json()
      if (errorData.error || errorData.blocked) {
        throw new Error(errorData.message || errorData.error || "Request blocked")
      }
    }

    // Process Server-Sent Events stream
    if (!response.body) {
      throw new Error("No response body received")
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ""

    while (true) {
      const { done, value } = await reader.read()

      if (done) {
        callbacks.onComplete()
        break
      }

      // Decode chunk and add to buffer
      buffer += decoder.decode(value, { stream: true })

      // Process complete lines in buffer
      const lines = buffer.split("\n")
      buffer = lines.pop() || "" // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6).trim()

          // Check for stream end
          if (data === "[DONE]") {
            callbacks.onComplete()
            return
          }

          try {
            const parsed: ChatResponse = JSON.parse(data)

            // Handle errors in stream
            if (parsed.error) {
              callbacks.onError(parsed.message || "Unknown error from server")
              return
            }

            // Handle response tokens
            if (parsed.response) {
              callbacks.onToken(parsed.response)
            }

            // Handle sources/citations
            if (parsed.sources && parsed.sources.length > 0) {
              callbacks.onSources(parsed.sources)
            }

            // Check for completion
            if (parsed.done) {
              callbacks.onComplete()
              return
            }
          } catch (parseError) {
            console.warn("Failed to parse SSE data:", data, parseError)
            // Continue processing other lines
          }
        }
      }
    }
  } catch (error: any) {
    console.error("Chat API Error:", error)
    callbacks.onError(error.message || "Failed to connect to AI service")
  }
}

/**
 * Create a new chat session
 */
export async function createChatSession(
  authToken: string,
  userId: string,
  title?: string
): Promise<{ chatId: string } | null> {
  const API_URL = "https://justdeen-rag-chatbot.husainshah101-682.workers.dev/api/chats/new"

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        user_id: userId,
        title,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to create chat session: ${response.statusText}`)
    }

    const data = await response.json()
    return { chatId: data.id }
  } catch (error) {
    console.error("Create chat error:", error)
    return null
  }
}

/**
 * Get chat history for a user
 */
export async function getChatHistory(
  authToken: string,
  userId: string
): Promise<any[] | null> {
  const API_URL = `https://justdeen-rag-chatbot.husainshah101-682.workers.dev/api/chats?user_id=${userId}`

  try {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to get chat history: ${response.statusText}`)
    }

    const data = await response.json()
    return data.chats || []
  } catch (error) {
    console.error("Get chat history error:", error)
    return null
  }
}

/**
 * Generate a title for a chat based on its content
 */
export async function generateChatTitle(
  authToken: string,
  chatId: string
): Promise<string | null> {
  const API_URL = `https://justdeen-rag-chatbot.husainshah101-682.workers.dev/api/chats/${chatId}/generate-title`

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to generate chat title: ${response.statusText}`)
    }

    const data = await response.json()
    return data.title || null
  } catch (error) {
    console.error("Generate chat title error:", error)
    return null
  }
}
