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
    // Debug: Decode JWT to see audience claim
    try {
      const tokenParts = authToken.split('.')
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1].replace(/-/g, '+').replace(/_/g, '/')))
        console.log('🔍 Token Debug - Audience:', payload.aud)
        console.log('🔍 Token Debug - Expiry:', new Date(payload.exp * 1000).toISOString())
        console.log('🔍 Token Debug - Issued At:', new Date(payload.iat * 1000).toISOString())
      }
    } catch (e) {
      console.warn('Could not decode token for debugging:', e)
    }

    // Use XMLHttpRequest for streaming support in React Native
    // React Native's fetch doesn't support ReadableStream/response.body
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      xhr.open("POST", API_URL, true)
      xhr.setRequestHeader("Content-Type", "application/json")
      xhr.setRequestHeader("Authorization", `Bearer ${authToken}`)

      let buffer = ""

      // Handle streaming response
      xhr.onprogress = () => {
        // Get the latest response text
        const responseText = xhr.responseText

        // Process only the new data since last onprogress
        const newData = responseText.substring(buffer.length)
        buffer = responseText

        // Split into lines and process
        const lines = newData.split("\n")

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim()

            // Check for stream end
            if (data === "[DONE]") {
              callbacks.onComplete()
              resolve()
              return
            }

            if (!data) continue // Skip empty data

            try {
              const parsed: ChatResponse = JSON.parse(data)

              // Handle errors in stream
              if (parsed.error) {
                callbacks.onError(parsed.message || "Unknown error from server")
                reject(new Error(parsed.message || "Unknown error from server"))
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
                resolve()
                return
              }
            } catch (parseError) {
              console.warn("Failed to parse SSE data:", data, parseError)
              // Continue processing other lines
            }
          }
        }
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          callbacks.onComplete()
          resolve()
        } else {
          let errorMessage = `HTTP ${xhr.status}: ${xhr.statusText}`
          try {
            const errorData = JSON.parse(xhr.responseText)
            errorMessage = errorData.message || errorData.error || errorMessage
          } catch (e) {
            // Ignore parse error, use default message
          }
          callbacks.onError(errorMessage)
          reject(new Error(errorMessage))
        }
      }

      xhr.onerror = () => {
        const errorMessage = "Network error occurred"
        callbacks.onError(errorMessage)
        reject(new Error(errorMessage))
      }

      xhr.ontimeout = () => {
        const errorMessage = "Request timed out"
        callbacks.onError(errorMessage)
        reject(new Error(errorMessage))
      }

      // Send the request
      xhr.send(JSON.stringify({
        message,
        conversationHistory,
        user_id: userId,
        chat_id: chatId,
      }))
    })
  } catch (error: any) {
    console.error("Chat API Error:", error)
    callbacks.onError(error.message || "Failed to connect to AI service")
    throw error
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

/**
 * Register or update user in the Cloudflare database
 * This must be called after successful authentication to ensure the user exists
 * in the backend database before they can send chat messages
 */
export async function registerUser(
  authToken: string,
  userId: string,
  email?: string | null,
  name?: string | null
): Promise<{ success: boolean; error?: string }> {
  const API_URL = "https://justdeen-rag-chatbot.husainshah101-682.workers.dev/api/users/me"

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        id: userId,
        email: email || undefined,
        name: name || undefined,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`
      )
    }

    const data = await response.json()
    console.log("✅ User registered successfully:", data)
    return { success: true }
  } catch (error: any) {
    console.error("User registration error:", error)
    return {
      success: false,
      error: error.message || "Failed to register user",
    }
  }
}

/**
 * Submit feedback for a message
 */
export async function submitFeedback(
  authToken: string,
  messageId: string,
  chatId: string,
  feedbackType: "thumbs_up" | "thumbs_down",
  reasons?: string[],
  comment?: string
): Promise<{ success: boolean; error?: string }> {
  const API_URL = "https://justdeen-rag-chatbot.husainshah101-682.workers.dev/api/feedback"

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        message_id: messageId,
        chat_id: chatId,
        feedback_type: feedbackType,
        reasons: reasons || [],
        comment: comment || "",
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`
      )
    }

    return { success: true }
  } catch (error: any) {
    console.error("Submit feedback error:", error)
    return {
      success: false,
      error: error.message || "Failed to submit feedback",
    }
  }
}
