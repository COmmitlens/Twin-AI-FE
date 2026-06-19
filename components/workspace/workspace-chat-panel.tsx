"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Sparkles,
  Send,
  Loader2,
  User,
  X,
  MessageSquare,
  GitCommit,
  FileCode,
  AlertTriangle,
  ListChecks,
  ChevronDown,
  ChevronUp,
  Calendar,
  AtSign,
} from "lucide-react"
import ReactMarkdown from "react-markdown"
import { WorkspaceChatMessage, QueryResponse, WorkspaceMember } from "@/lib/types/workspace"

interface WorkspaceChatPanelProps {
  workspaceId: string
  members?: WorkspaceMember[]
  onQuery: (
    question: string,
    author?: string,
    dateRange?: { start_date: string; end_date: string }
  ) => Promise<QueryResponse>
}

// ── Date Range Board ──────────────────────────────────────────────
function DateRangeBoard({
  startDate,
  endDate,
  onStartDate,
  onEndDate,
  onClear,
}: {
  startDate: string
  endDate: string
  onStartDate: (v: string) => void
  onEndDate: (v: string) => void
  onClear: () => void
}) {
  const hasRange = startDate || endDate
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border/50 bg-muted/20 text-xs">
      <Calendar className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
      <div className="flex items-center gap-2 flex-1 flex-wrap">
        <div className="flex items-center gap-1">
          <label className="text-muted-foreground">From</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDate(e.target.value)}
            className="bg-transparent border border-border/40 rounded-md px-1.5 py-0.5 text-xs text-foreground focus:outline-none focus:border-primary/50 cursor-pointer"
          />
        </div>
        <div className="flex items-center gap-1">
          <label className="text-muted-foreground">To</label>
          <input
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => onEndDate(e.target.value)}
            className="bg-transparent border border-border/40 rounded-md px-1.5 py-0.5 text-xs text-foreground focus:outline-none focus:border-primary/50 cursor-pointer"
          />
        </div>
      </div>
      {hasRange && (
        <button
          onClick={onClear}
          className="text-muted-foreground hover:text-foreground transition-colors"
          title="Clear date range"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  )
}

// ── Mention Dropdown ──────────────────────────────────────────────
function MentionDropdown({
  members,
  filter,
  onSelect,
}: {
  members: WorkspaceMember[]
  filter: string
  onSelect: (member: WorkspaceMember) => void
}) {
  const filtered = members.filter((m) =>
    m.name.toLowerCase().includes(filter.toLowerCase())
  )
  if (filtered.length === 0) return null
  return (
    <div className="rounded-xl border border-border/60 bg-background shadow-lg overflow-hidden max-h-48 overflow-y-auto">
      <div className="px-3 py-1.5 border-b border-border/40 bg-muted/30">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <AtSign className="w-3 h-3" />
          <span>Select a member</span>
        </div>
      </div>
      {filtered.map((member) => (
        <button
          key={member.user_id}
          onMouseDown={(e) => {
            e.preventDefault()
            onSelect(member)
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-primary/8 transition-colors"
        >
          <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
            <User className="w-3 h-3 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-foreground truncate">@{member.name}</div>
            <div className="text-xs text-muted-foreground truncate">{member.email}</div>
          </div>
          <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground capitalize flex-shrink-0">
            {member.role}
          </span>
        </button>
      ))}
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────
function extractAuthorEmail(query: string, members: WorkspaceMember[]): string | undefined {
  const mentions = query.match(/@([\w.]+)/g)
  if (!mentions) return undefined
  for (const mention of mentions) {
    const username = mention.slice(1).toLowerCase()
    const found = members.find((m) => m.name.toLowerCase() === username)
    if (found) return found.email
  }
  return undefined
}

function toISODateRange(start: string, end: string) {
  if (!start && !end) return undefined
  return {
    start_date: start ? `${start}T00:00:00Z` : "",
    end_date: end ? `${end}T23:59:59Z` : "",
  }
}

// ── Source Badge ──────────────────────────────────────────────────
function SourceBadge({ fileName, commitSHA, repoName }: { fileName: string; commitSHA: string; repoName: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-border/40 bg-muted/30 px-3 py-2 text-xs hover:border-primary/30 hover:bg-primary/5 transition-colors">
      <FileCode className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
      <div className="min-w-0">
        <div className="font-medium text-foreground truncate">{fileName}</div>
        <div className="flex items-center gap-1.5 mt-0.5 text-muted-foreground">
          <span className="text-primary/70">{repoName}</span>
          <span>·</span>
          <GitCommit className="w-3 h-3 flex-shrink-0" />
          <span className="font-mono truncate">{commitSHA.slice(0, 7)}</span>
        </div>
      </div>
    </div>
  )
}

function QueryResponseDisplay({ response }: { response: QueryResponse }) {
  const [showSources, setShowSources] = useState(false)

  const markdownComponents = {
    p: ({ children }: any) => (
      <p className="text-sm text-foreground/90 leading-relaxed mb-2 last:mb-0">{children}</p>
    ),
    code: ({ children }: any) => (
      <code className="inline bg-primary/10 text-primary border border-primary/20 rounded px-1.5 py-0.5 text-xs font-mono">
        {children}
      </code>
    ),
    pre: ({ children }: any) => (
      <pre className="bg-muted/60 border border-border/50 p-3 rounded-lg overflow-x-auto my-2 text-xs font-mono leading-relaxed">
        {children}
      </pre>
    ),
    strong: ({ children }: any) => (
      <strong className="font-semibold text-foreground">{children}</strong>
    ),
    ul: ({ children }: any) => <ul className="space-y-1 mb-2 pl-1">{children}</ul>,
    li: ({ children }: any) => (
      <li className="flex items-start gap-2 text-sm text-foreground/90">
        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/60 flex-shrink-0" />
        <span>{children}</span>
      </li>
    ),
  }

  return (
    <div className="space-y-3">
      {/* Answer */}
      <div className="text-sm text-foreground/90 leading-relaxed">
        <ReactMarkdown components={markdownComponents}>{response.answer}</ReactMarkdown>
      </div>

      {/* Impact */}
      {response.impact && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/8 px-3 py-2.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider block mb-0.5">
              Impact
            </span>
            <p className="text-xs text-foreground/80 leading-relaxed">{response.impact}</p>
          </div>
        </div>
      )}

      {/* Action Items */}
      {response.action_items && response.action_items.length > 0 && (
        <div className="rounded-lg border border-primary/15 bg-primary/5 px-3 py-2.5 space-y-2">
          <div className="flex items-center gap-1.5">
            <ListChecks className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              Action Items
            </span>
          </div>
          <ul className="space-y-1.5">
            {response.action_items.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-foreground/80 leading-relaxed">
                <span className="flex-shrink-0 mt-0.5 w-4 h-4 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center text-[10px] font-bold text-primary">
                  {i + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Code Patch */}
      {response.code_patch && (
        <div className="rounded-lg border border-border/50 overflow-hidden">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 border-b border-border/40">
            <FileCode className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Suggested Patch</span>
          </div>
          <pre className="p-3 text-xs font-mono overflow-x-auto bg-muted/20 leading-relaxed whitespace-pre-wrap">
            {response.code_patch}
          </pre>
        </div>
      )}

      {/* Sources toggle */}
      {response.sources && response.sources.length > 0 && (
        <div>
          <button
            onClick={() => setShowSources((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <GitCommit className="w-3.5 h-3.5" />
            <span>{response.sources.length} source{response.sources.length !== 1 ? "s" : ""}</span>
            {showSources ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          {showSources && (
            <div className="mt-2 space-y-1.5">
              {response.sources.map((src, i) => (
                <SourceBadge key={i} {...src} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const MIN_WIDTH = 320
const MAX_WIDTH_RATIO = 0.6

export function WorkspaceChatPanel({ workspaceId, members = [], onQuery }: WorkspaceChatPanelProps) {
  const [open, setOpen] = useState(false)
  const [question, setQuestion] = useState("")
  const [messages, setMessages] = useState<WorkspaceChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [panelWidth, setPanelWidth] = useState(420)
  const [isDragging, setIsDragging] = useState(false)

  // Date range
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  // @mention state
  const [mentionFilter, setMentionFilter] = useState<string | null>(null)
  const [mentionStart, setMentionStart] = useState(-1)

  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const dragStartX = useRef(0)
  const dragStartWidth = useRef(0)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  useEffect(() => {
    if (open) {
      setTimeout(() => textareaRef.current?.focus(), 150)
    }
  }, [open])

  useEffect(() => {
    if (!isDragging) return

    const onMouseMove = (e: MouseEvent) => {
      const maxWidth = window.innerWidth * MAX_WIDTH_RATIO
      const delta = dragStartX.current - e.clientX
      const newWidth = Math.min(maxWidth, Math.max(MIN_WIDTH, dragStartWidth.current + delta))
      setPanelWidth(newWidth)
    }

    const onMouseUp = () => setIsDragging(false)

    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)
    return () => {
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
    }
  }, [isDragging])

  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault()
    dragStartX.current = e.clientX
    dragStartWidth.current = panelWidth
    setIsDragging(true)
  }

  // Detect @mention as user types
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    const cursor = e.target.selectionStart ?? value.length
    setQuestion(value)

    if (members.length > 0) {
      const textBeforeCursor = value.slice(0, cursor)
      const atIdx = textBeforeCursor.lastIndexOf("@")
      if (atIdx !== -1) {
        const afterAt = textBeforeCursor.slice(atIdx + 1)
        if (!afterAt.includes(" ")) {
          setMentionFilter(afterAt)
          setMentionStart(atIdx)
          return
        }
      }
    }
    setMentionFilter(null)
    setMentionStart(-1)
  }

  const handleMentionSelect = (member: WorkspaceMember) => {
    const before = question.slice(0, mentionStart)
    const after = question.slice(mentionStart + 1 + (mentionFilter?.length ?? 0))
    const inserted = `@${member.name} `
    const newValue = before + inserted + after
    setQuestion(newValue)
    setMentionFilter(null)
    setMentionStart(-1)
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
        const pos = before.length + inserted.length
        textareaRef.current.setSelectionRange(pos, pos)
      }
    }, 0)
  }

  const handleSubmit = async () => {
    if (!question.trim() || loading) return
    const q = question.trim()
    setQuestion("")
    setMentionFilter(null)
    setLoading(true)

    const author = extractAuthorEmail(q, members)
    const dateRange = toISODateRange(startDate, endDate)

    try {
      const response = await onQuery(q, author, dateRange)
      setMessages((prev) => [...prev, { question: q, response }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && mentionFilter !== null) {
      e.preventDefault()
      setMentionFilter(null)
      return
    }
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && !loading) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const resolvedAuthorEmail = question ? extractAuthorEmail(question, members) : undefined
  const resolvedAuthorName = resolvedAuthorEmail
    ? members.find((m) => m.email === resolvedAuthorEmail)?.name
    : undefined

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(true)}
        className={`fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full px-4 py-3 shadow-lg text-sm font-medium transition-all duration-200 ${
          open ? "opacity-0 pointer-events-none scale-90" : "opacity-100 scale-100"
        } bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-primary/25 hover:shadow-xl`}
      >
        <Sparkles className="w-4 h-4" />
        Ask AI
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-in panel */}
      <div
        style={{ width: panelWidth }}
        className={`fixed right-0 top-0 bottom-0 z-50 flex flex-col bg-background border-l border-border/60 shadow-2xl transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        } ${isDragging ? "transition-none select-none" : ""}`}
      >
        {/* Drag handle */}
        <div
          onMouseDown={handleDragStart}
          className={`absolute left-0 top-0 bottom-0 w-1 group cursor-col-resize z-10 hover:bg-primary/40 transition-colors ${
            isDragging ? "bg-primary/60" : "bg-transparent"
          }`}
        >
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <span className="w-0.5 h-4 rounded-full bg-primary/60" />
            <span className="w-0.5 h-4 rounded-full bg-primary/60" />
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Workspace AI</h2>
              <p className="text-xs text-muted-foreground">Ask anything about your codebase</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-4 space-y-5 scroll-smooth"
        >
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <MessageSquare className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Ask about your workspace</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Ask questions about commits, code changes, bugs, or anything in your repositories.
                  {members.length > 0 && " Type @ to mention a team member."}
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full mt-2">
                {[
                  "Why is the auth endpoint failing?",
                  "What changed in the last deployment?",
                  "Explain the middleware setup",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setQuestion(suggestion)}
                    className="text-left text-xs text-muted-foreground border border-border/50 rounded-xl px-3 py-2 hover:border-primary/30 hover:bg-primary/5 hover:text-foreground transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className="space-y-3">
              {/* User bubble */}
              <div className="flex items-start gap-2 justify-end">
                <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[85%] text-sm leading-relaxed">
                  {msg.question}
                </div>
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-muted flex items-center justify-center mt-0.5">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
              </div>

              {/* AI response */}
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0 bg-muted/25 border border-border/30 rounded-2xl rounded-tl-sm px-4 py-3">
                  <QueryResponseDisplay response={msg.response} />
                </div>
              </div>
            </div>
          ))}

          {/* Loading bubble */}
          {loading && (
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="bg-muted/25 border border-border/30 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="flex-shrink-0 border-t border-border/50 px-4 py-3 bg-background/80 backdrop-blur-sm space-y-2">
          {/* Date range board */}
          <DateRangeBoard
            startDate={startDate}
            endDate={endDate}
            onStartDate={setStartDate}
            onEndDate={setEndDate}
            onClear={() => { setStartDate(""); setEndDate("") }}
          />

          {/* Resolved author preview */}
          {resolvedAuthorName && (
            <div className="flex items-center gap-1.5 text-xs text-primary/80 px-1">
              <AtSign className="w-3 h-3" />
              <span>Filtering by <span className="font-semibold">@{resolvedAuthorName}</span></span>
            </div>
          )}

          {/* Textarea + send + mention dropdown */}
          <div className="relative flex gap-2 items-end">
            {/* Mention dropdown — renders above the textarea */}
            {mentionFilter !== null && members.length > 0 && (
              <div className="absolute bottom-full mb-1 left-0 right-10 z-50">
                <MentionDropdown
                  members={members}
                  filter={mentionFilter}
                  onSelect={handleMentionSelect}
                />
              </div>
            )}

            <textarea
              ref={textareaRef}
              value={question}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={
                members.length > 0
                  ? "Ask about your codebase… type @ to mention (⌘↵ send)"
                  : "Ask about your codebase… (⌘↵ to send)"
              }
              rows={2}
              disabled={loading}
              className="flex-1 min-h-[60px] max-h-[140px] resize-none text-sm rounded-md border border-input bg-background px-3 py-2 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
            <Button
              onClick={handleSubmit}
              disabled={loading || !question.trim()}
              size="icon"
              className="h-10 w-10 flex-shrink-0 rounded-xl"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground text-center">
            Searching across all repositories in this workspace
          </p>
        </div>
      </div>
    </>
  )
}
