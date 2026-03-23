"use client"

import ReactMarkdown from "react-markdown"
import { Brain, CheckCircle, Sparkles, TrendingUp } from "lucide-react"
import { ExplainResponse } from "@/lib/types/workspace"

interface AIResponseDisplayProps {
  response: ExplainResponse
}

function ConfidenceBar({ score }: { score: number }) {
  const pct = Math.round(score * 100)
  const color =
    score >= 0.8
      ? "bg-emerald-500"
      : score >= 0.6
      ? "bg-amber-500"
      : "bg-rose-500"
  const label =
    score >= 0.8 ? "High confidence" : score >= 0.6 ? "Moderate" : "Low confidence"

  return (
    <div className="flex items-center gap-2.5">
      <TrendingUp className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
      <div className="flex items-center gap-2 flex-1">
        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${color}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap font-medium">
          {pct}% · {label}
        </span>
      </div>
    </div>
  )
}

const markdownComponents = {
  p: ({ children }: any) => (
    <p className="text-sm text-foreground/90 mb-2.5 last:mb-0 leading-relaxed">{children}</p>
  ),
  strong: ({ children }: any) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  em: ({ children }: any) => (
    <em className="italic text-muted-foreground">{children}</em>
  ),
  code: ({ children }: any) => (
    <code className="inline bg-primary/10 text-primary border border-primary/20 rounded px-1.5 py-0.5 text-xs font-mono">
      {children}
    </code>
  ),
  pre: ({ children }: any) => (
    <pre className="bg-muted/60 border border-border/50 p-3.5 rounded-lg overflow-x-auto my-3 text-xs font-mono">
      {children}
    </pre>
  ),
  ul: ({ children }: any) => (
    <ul className="space-y-1.5 mb-2.5 pl-1">{children}</ul>
  ),
  ol: ({ children }: any) => (
    <ol className="space-y-1.5 mb-2.5 pl-1 list-decimal list-inside">{children}</ol>
  ),
  li: ({ children }: any) => (
    <li className="flex items-start gap-2 text-sm text-foreground/90">
      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/60 flex-shrink-0" />
      <span>{children}</span>
    </li>
  ),
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-4 border-primary/40 bg-primary/5 pl-4 pr-3 py-2.5 my-3 rounded-r-lg italic text-muted-foreground text-sm">
      {children}
    </blockquote>
  ),
  h1: ({ children }: any) => (
    <div className="flex items-center gap-2 mt-4 mb-2.5">
      <div className="flex-1 h-px bg-gradient-to-r from-primary/40 to-transparent" />
      <h1 className="text-sm font-bold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 tracking-wide uppercase whitespace-nowrap">
        {children}
      </h1>
      <div className="flex-1 h-px bg-gradient-to-l from-primary/40 to-transparent" />
    </div>
  ),
  h2: ({ children }: any) => (
    <div className="mt-3 mb-2">
      <h2 className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-lg">
        <span className="w-1 h-3.5 rounded-full bg-primary flex-shrink-0" />
        {children}
      </h2>
    </div>
  ),
  h3: ({ children }: any) => (
    <h3 className="text-sm font-semibold text-foreground mt-2.5 mb-1.5 border-b border-border/40 pb-1">
      {children}
    </h3>
  ),
}

export function AIResponseDisplay({ response }: AIResponseDisplayProps) {
  return (
    <div className="space-y-4">
      {/* Confidence bar */}
      <ConfidenceBar score={response.confidence_score} />

      {/* Summary */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
            Summary
          </span>
        </div>
        <div className="bg-gradient-to-br from-muted/40 to-muted/20 border border-border/40 rounded-xl p-4">
          <ReactMarkdown components={markdownComponents}>
            {response.summary}
          </ReactMarkdown>
        </div>
      </div>

      {/* Reasoning */}
      {response.reasoning && response.reasoning.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Brain className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              Reasoning
            </span>
          </div>
          <div className="space-y-2">
            {response.reasoning.map((reason, index) => (
              <div
                key={index}
                className="flex gap-3 p-3.5 rounded-xl bg-gradient-to-r from-primary/5 to-transparent border border-primary/10 hover:border-primary/25 hover:from-primary/8 transition-colors"
              >
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-5 h-5 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-primary" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <ReactMarkdown components={markdownComponents}>
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
