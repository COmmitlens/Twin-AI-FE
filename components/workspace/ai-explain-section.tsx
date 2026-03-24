"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, Send, Loader2, User } from "lucide-react"
import { ExplainResponse } from "@/lib/types/workspace"
import { AIResponseDisplay } from "./ai-response-display"

interface ChatMessage {
  question: string
  response: ExplainResponse
}

interface AIExplainSectionProps {
  question: string
  onQuestionChange: (question: string) => void
  chatMessages: ChatMessage[]
  loading: boolean
  onSubmit: () => void
  disabled?: boolean
}

export function AIExplainSection({
  question,
  onQuestionChange,
  chatMessages,
  loading,
  onSubmit,
  disabled = false,
}: AIExplainSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [chatMessages, loading])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey && !loading && !disabled) {
      onSubmit()
    }
  }

  return (
    <Card className="border border-border/50 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg">Ask AI</CardTitle>
        </div>
        <CardDescription className="text-sm">
          Ask questions about this commit and get AI-powered explanations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Scrollable chat history */}
        {chatMessages.length > 0 && (
          <div
            ref={scrollRef}
            className="flex flex-col gap-6 max-h-[500px] overflow-y-auto pr-1"
          >
            {chatMessages.map((msg, index) => (
              <div key={index} className="space-y-3">
                {/* User question bubble */}
                <div className="flex items-start gap-2 justify-end">
                  <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[85%] text-sm">
                    {msg.question}
                  </div>
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-muted flex items-center justify-center mt-0.5">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>

                {/* AI response */}
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 bg-muted/30 border border-border/30 rounded-2xl rounded-tl-sm px-4 py-3">
                    <AIResponseDisplay response={msg.response} />
                  </div>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-muted/30 border border-border/30 rounded-2xl rounded-tl-sm px-4 py-3">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Input area */}
        <div className="space-y-3">
          <Textarea
            value={question}
            onChange={(e) => onQuestionChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about this commit... (Ctrl+Enter to submit)"
            className="min-h-[80px] resize-none"
            disabled={loading || disabled}
          />
          <Button
            onClick={onSubmit}
            disabled={loading || disabled || !question.trim()}
            className="w-full gap-2"
            size="sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                {chatMessages.length > 0 ? "Send Follow-up" : "Ask AI"}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
