"use client"

import ReactMarkdown from "react-markdown"
import { Badge } from "@/components/ui/badge"
import { Brain, CheckCircle, Sparkles } from "lucide-react"
import { ExplainResponse } from "@/lib/types/workspace"

interface AIResponseDisplayProps {
  response: ExplainResponse
}

export function AIResponseDisplay({ response }: AIResponseDisplayProps) {
  const confidencePercentage = Math.round(response.confidence_score * 100)
  const getConfidenceBadgeVariant = (score: number) => {
    if (score >= 0.8) return "default"
    if (score >= 0.6) return "secondary"
    return "outline"
  }

  return (
    <div className="space-y-6 pt-6 border-t border-border/30">
      {/* Summary Section */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <h3 className="font-semibold text-base text-foreground">Summary</h3>
          </div>
          <Badge
            variant={getConfidenceBadgeVariant(response.confidence_score)}
            className="whitespace-nowrap"
          >
            {confidencePercentage}% confident
          </Badge>
        </div>
        <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed">
          <ReactMarkdown
            components={{
              p: ({ children }) => (
                <p className="text-sm text-foreground mb-3 leading-relaxed">{children}</p>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-foreground">{children}</strong>
              ),
              em: ({ children }) => (
                <em className="italic text-muted-foreground">{children}</em>
              ),
              code: ({ children }) => {
                return (
                  <code
                    className="block bg-muted/50 border border-border/50 p-4 rounded-lg text-xs font-mono text-foreground overflow-x-auto my-3"
                  >
                    {children}
                  </code>
                )
              },
              pre: ({ children }) => (
                <pre className="bg-muted/50 border border-border/50 p-4 rounded-lg overflow-x-auto my-3">{children}</pre>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside space-y-2 mb-3 text-sm text-foreground">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside space-y-2 mb-3 text-sm text-foreground">{children}</ol>
              ),
              li: ({ children }) => (
                <li className="ml-2">{children}</li>
              ),
              blockquote: ({ children }) => (
                <blockquote
                  className="border-l-4 border-primary/30 pl-4 py-2 my-3 italic text-muted-foreground"
                >
                  {children}
                </blockquote>
              ),
              h1: ({ children }) => (
                <h1 className="text-lg font-bold text-foreground mt-4 mb-2">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-base font-bold text-foreground mt-3 mb-2">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-sm font-semibold text-foreground mt-2 mb-1">{children}</h3>
              ),
            }}
          >
            {response.summary}
          </ReactMarkdown>
        </div>
      </div>

      {/* Reasoning Section */}
      {response.reasoning && response.reasoning.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary flex-shrink-0" />
            <h3 className="font-semibold text-base text-foreground">Reasoning</h3>
          </div>
          <div className="space-y-2.5">
            {response.reasoning.map((reason, index) => (
              <div key={index} className="flex gap-3 p-3 rounded-lg bg-muted/30 border border-border/30">
                <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <div className="prose prose-sm dark:prose-invert max-w-none flex-1">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => (
                        <p className="text-sm text-foreground m-0 leading-relaxed">{children}</p>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-foreground">{children}</strong>
                      ),
                      em: ({ children }) => (
                        <em className="italic text-muted-foreground">{children}</em>
                      ),
                      code: ({ children }) => {
                        return <code className="text-xs font-mono">{children}</code>
                      },
                    }}
                  >
                    {reason}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
