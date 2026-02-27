"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, Send, Loader2 } from "lucide-react"
import { ExplainResponse } from "@/lib/types/workspace"
import { AIResponseDisplay } from "./ai-response-display"

interface AIExplainSectionProps {
  question: string
  onQuestionChange: (question: string) => void
  aiResponse: ExplainResponse | null
  loading: boolean
  onSubmit: () => void
  disabled?: boolean
}

export function AIExplainSection({
  question,
  onQuestionChange,
  aiResponse,
  loading,
  onSubmit,
  disabled = false,
}: AIExplainSectionProps) {
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
        <div className="space-y-3">
          <Textarea
            value={question}
            onChange={(e) => onQuestionChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about this commit... (Ctrl+Enter to submit)"
            className="min-h-[100px] resize-none"
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
                Ask AI
              </>
            )}
          </Button>
        </div>

        {aiResponse && <AIResponseDisplay response={aiResponse} />}
      </CardContent>
    </Card>
  )
}
