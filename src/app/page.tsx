"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { ArrowUp, Square, Copy, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
      setShowScrollButton(!isNearBottom)
    }

    container.addEventListener("scroll", handleScroll)
    return () => container.removeEventListener("scroll", handleScroll)
  }, [])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success("تم نسخ النص إلى الحافظة")
    } catch (err) {
      console.error("Failed to copy text: ", err)
      toast.error("فشل في نسخ النص")
    }
  }

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController()

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.message) {
        const assistantMessage: Message = {
          id: data.message.id,
          role: "assistant",
          content: data.message.content,
        }
        setMessages((prev) => [...prev, assistantMessage])
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.log("Request was aborted")
        return
      }

      console.error("Error sending message:", error)
      toast.error("حدث خطأ في إرسال الرسالة")
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setIsLoading(false)
      toast.info("تم إيقاف التوليد")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const suggestions = [
    "حلمتُ أنني أطير فوق الصحراء",
    "رأيتُ ثعباناً يقترب مني؛ ما التفسير؟",
    "وجدتُ نفسي تائهاً في متاهة؛ فسّر لي الحلم",
  ]

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion)
  }

  return (
    <div dir="rtl" className="max-w-md mx-auto py-10 h-screen flex flex-col">
      <h1 className="text-2xl font-bold text-center mb-6">مفسر الأحلام</h1>

      <div className="flex-1 flex flex-col relative">
        {/* Messages Container */}
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto space-y-4 pb-4">
          {messages.length === 0 && (
            <div className="space-y-3">
              <p className="text-center text-muted-foreground text-sm mb-4">اختر أحد الأمثلة أو اكتب حلمك بنفسك</p>
              {suggestions.map((suggestion, index) => (
                <Card
                  key={index}
                  className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <p className="text-sm">{suggestion}</p>
                </Card>
              ))}
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`group relative max-w-[80%] rounded-lg p-3 ${
                  message.role === "user" ? "bg-primary/10" : "bg-muted"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                  onClick={() => copyToClipboard(message.content)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                <div className="flex space-x-1 justify-center">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Scroll to bottom button */}
        {showScrollButton && (
          <Button
            variant="outline"
            size="sm"
            className="absolute bottom-20 left-1/2 transform -translate-x-1/2 rounded-full h-8 w-8 p-0"
            onClick={scrollToBottom}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        )}

        {/* Chat Form */}
        <form onSubmit={handleSubmit} className="flex gap-2 pt-4 border-t">
          <Textarea
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="اكتب حلمك هنا..."
            className="flex-1 min-h-[40px] max-h-[120px] resize-none"
            disabled={isLoading}
          />
          {isLoading ? (
            <Button type="button" variant="outline" size="sm" className="h-10 w-10 p-0" onClick={stopGeneration}>
              <Square className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" size="sm" className="h-10 w-10 p-0" disabled={!input.trim()}>
              <ArrowUp className="h-4 w-4" />
            </Button>
          )}
        </form>
      </div>
    </div>
  )
}
