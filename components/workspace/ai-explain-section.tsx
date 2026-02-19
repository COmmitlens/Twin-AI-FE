"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Send, Loader2 } from "lucide-react"
import { useState } from "react"
import { ExplainResponse } from "@/lib/types/workspace"

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

        {aiResponse && (
          <div className="space-y-4 pt-4 border-t border-border/30">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm">Summary</h4>
                <Badge variant="secondary" className="text-xs">
                  {(aiResponse.confidence_score * 100).toFixed(0)}% confident
                </Badge>
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                {aiResponse.summary}
              </p>
            </div>

            {aiResponse.reasoning && aiResponse.reasoning.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Reasoning</h4>
                <ul className="space-y-1">
                  {aiResponse.reasoning.map((reason, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex gap-2">
                      <span className="text-primary font-medium flex-shrink-0">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
