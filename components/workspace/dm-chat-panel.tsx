"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  MessageSquare,
  X,
  ArrowLeft,
  Send,
  Loader2,
  Users,
  Circle,
  UserPlus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DMConversation, DMMessage, WorkspaceMember } from "@/lib/types/workspace"
import { dmAPI } from "@/lib/api/dm"
import { useDMWebSocket } from "@/hooks/use-dm-websocket"

interface DMChatPanelProps {
  workspaceId: number
  currentUserId: number
  currentUserEmail?: string
  members?: WorkspaceMember[]
  /** Passed from WorkspaceMembers when the user clicks the message icon on a member row */
  initialRecipient?: { userId: number; name: string } | null
  /** Called after the initialRecipient has been consumed so the parent can reset it */
  onInitialRecipientConsumed?: () => void
}

type PanelView = "inbox" | "chat"

function getInitials(name: string) {
  const parts = name.trim().split(" ")
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function formatTime(iso: string) {
  if (!iso || iso.startsWith("0001")) return ""
  const d = new Date(iso)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  if (diffDays === 1) return "Yesterday"
  return d.toLocaleDateString([], { month: "short", day: "numeric" })
}

export function DMChatPanel({
  workspaceId,
  currentUserId,
  currentUserEmail,
  members = [],
  initialRecipient,
  onInitialRecipientConsumed,
}: DMChatPanelProps) {
  const [newDMOpen, setNewDMOpen] = useState(false)
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<PanelView>("inbox")
  const [conversations, setConversations] = useState<DMConversation[]>([])
  const [conversationsLoading, setConversationsLoading] = useState(false)
  const [activeConversation, setActiveConversation] = useState<DMConversation | null>(null)
  const [messages, setMessages] = useState<DMMessage[]>([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [sendLoading, setSendLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // ── WebSocket ─────────────────────────────────────────────────────────────
  const { status: wsStatus, sendMessage: wsSend } = useDMWebSocket({
    conversationId: activeConversation?.id ?? null,
    onNewMessage: (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev
        return [...prev, msg]
      })
      scrollToBottom()
      setConversations((prev) =>
        prev.map((c) =>
          c.id === msg.conversation_id
            ? { ...c, last_message: msg.content, last_message_at: msg.created_at }
            : c
        )
      )
    },
    onMarkRead: (ev) => {
      const convId = ev.message.conversation_id
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, unread_count: 0 } : c))
      )
    },
  })

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (scrollRef.current)
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    })
  }, [])

  // ── Fetch conversations ───────────────────────────────────────────────────
  const fetchConversations = useCallback(async () => {
    setConversationsLoading(true)
    try {
      const res = await dmAPI.listConversations(workspaceId)
      setConversations(res.data ?? [])
    } catch {
      // silently ignore
    } finally {
      setConversationsLoading(false)
    }
  }, [workspaceId])

  useEffect(() => {
    if (open) fetchConversations()
  }, [open, fetchConversations])

  // ── Handle initialRecipient ───────────────────────────────────────────────
  useEffect(() => {
    if (!initialRecipient) return
    setOpen(true)
    ;(async () => {
      try {
        const res = await dmAPI.startConversation({
          workspace_id: workspaceId,
          recipient_id: initialRecipient.userId,
        })
        if (res.data) {
          await openConversationAsync(res.data)
        }
      } catch {
        // ignore
      } finally {
        onInitialRecipientConsumed?.()
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialRecipient])

  // ── Open / load a conversation ────────────────────────────────────────────
  const openConversationAsync = useCallback(
    async (conv: DMConversation) => {
      setActiveConversation(conv)
      setView("chat")
      setMessagesLoading(true)
      try {
        const res = await dmAPI.listMessages(conv.id)
        setMessages(res.data ?? [])
        scrollToBottom()
      } finally {
        setMessagesLoading(false)
      }
      try {
        await dmAPI.markRead({ conversation_id: conv.id })
        setConversations((prev) =>
          prev.map((c) => (c.id === conv.id ? { ...c, unread_count: 0 } : c))
        )
      } catch {
        // ignore
      }
    },
    [scrollToBottom]
  )

  // ── Start a DM with a member (from new-DM picker) ─────────────────────────
  const startDMWithMember = useCallback(
    async (member: WorkspaceMember) => {
      setNewDMOpen(false)
      try {
        const res = await dmAPI.startConversation({
          workspace_id: workspaceId,
          recipient_id: member.user_id,
        })
        if (res.data) {
          await openConversationAsync(res.data)
          fetchConversations()
        }
      } catch {
        // ignore
      }
    },
    [workspaceId, openConversationAsync, fetchConversations]
  )

  // ── Send a message ────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    if (!activeConversation || !inputValue.trim()) return
    const content = inputValue.trim()
    setInputValue("")

    if (wsStatus === "connected") {
      wsSend(content)
    } else {
      setSendLoading(true)
      try {
        const res = await dmAPI.sendMessage({
          conversation_id: activeConversation.id,
          content,
        })
        if (res.data) {
          setMessages((prev) => [...prev, res.data!])
          scrollToBottom()
        }
      } finally {
        setSendLoading(false)
      }
    }
  }, [activeConversation, inputValue, wsStatus, wsSend, scrollToBottom])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleBackToInbox = () => {
    setView("inbox")
    setActiveConversation(null)
    setMessages([])
    fetchConversations()
  }

  // Filter out the current user from the member picker — compare by email
  // (more reliable than user_id which may have type mismatches depending on backend)
  const otherMembers = members.filter(
    (m) => currentUserEmail
      ? m.email.toLowerCase() !== currentUserEmail.toLowerCase()
      : m.user_id !== currentUserId
  )
  const totalUnread = conversations.reduce((sum, c) => sum + c.unread_count, 0)

  return (
    <>
      {/* ── Floating trigger button ──────────────────────────────────────── */}
      <button
        onClick={() => setOpen(true)}
        className={`fixed bottom-6 right-40 z-40 flex items-center gap-2 rounded-full px-4 py-3 shadow-lg text-sm font-medium transition-all duration-200 bg-background border border-border hover:bg-muted text-foreground hover:shadow-lg ${
          open ? "opacity-0 pointer-events-none scale-90" : "opacity-100 scale-100"
        }`}
      >
        <MessageSquare className="w-4 h-4" />
        DMs
        {totalUnread > 0 && (
          <span className="ml-0.5 flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
            {totalUnread > 9 ? "9+" : totalUnread}
          </span>
        )}
      </button>

      {/* ── Backdrop ─────────────────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Slide-in panel ───────────────────────────────────────────────── */}
      <div
        className={`fixed right-0 top-0 bottom-0 z-50 w-80 flex flex-col bg-background border-l border-border/60 shadow-2xl transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* ── Inbox view ─────────────────────────────────────────────────── */}
        {view === "inbox" && (
          <>
            <div className="flex items-center justify-between px-4 py-4 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Direct Messages</h2>
                  <p className="text-xs text-muted-foreground">
                    {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {otherMembers.length > 0 && (
                  <button
                    onClick={() => setNewDMOpen((v) => !v)}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                    title="New conversation"
                  >
                    <UserPlus className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* New DM member picker */}
            {newDMOpen && (
              <div className="border-b border-border/50 bg-muted/20">
                <p className="px-4 pt-3 pb-1 text-xs font-medium text-muted-foreground">Start a new conversation</p>
                <div className="max-h-48 overflow-y-auto divide-y divide-border/30">
                  {otherMembers.map((m) => (
                      <button
                        key={m.user_id}
                        onClick={() => startDMWithMember(m)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors text-left"
                      >
                        <Avatar className="h-7 w-7 flex-shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {getInitials(m.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{m.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{m.email}</p>
                        </div>
                        <MessageSquare className="w-3.5 h-3.5 text-muted-foreground ml-auto flex-shrink-0" />
                      </button>
                    ))}
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto">
              {conversationsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 px-4 text-center py-12">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">No conversations yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Pick a member below to start chatting
                    </p>
                  </div>
                  {otherMembers.length > 0 && (
                    <div className="w-full mt-2 rounded-xl border border-border/50 overflow-hidden">
                      {otherMembers.map((m) => (
                          <button
                            key={m.user_id}
                            onClick={() => startDMWithMember(m)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 transition-colors text-left border-b last:border-b-0 border-border/30"
                          >
                            <Avatar className="h-7 w-7 flex-shrink-0">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                {getInitials(m.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-foreground truncate">{m.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{m.email}</p>
                            </div>
                            <MessageSquare className="w-3.5 h-3.5 text-primary/60 flex-shrink-0" />
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => openConversationAsync(conv)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors text-left"
                    >
                      <div className="relative flex-shrink-0">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold text-sm">
                            {getInitials(conv.other_user_name)}
                          </AvatarFallback>
                        </Avatar>
                        {conv.unread_count > 0 && (
                          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`text-sm truncate ${
                              conv.unread_count > 0
                                ? "font-semibold text-foreground"
                                : "font-medium text-foreground/80"
                            }`}
                          >
                            {conv.other_user_name}
                          </span>
                          <span className="text-[10px] text-muted-foreground flex-shrink-0">
                            {formatTime(conv.last_message_at)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2 mt-0.5">
                          <p className="text-xs text-muted-foreground truncate">
                            {conv.last_message || "No messages yet"}
                          </p>
                          {conv.unread_count > 0 && (
                            <Badge className="h-4 min-w-[16px] px-1 text-[10px] flex-shrink-0">
                              {conv.unread_count}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Chat view ──────────────────────────────────────────────────── */}
        {view === "chat" && activeConversation && (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-2 px-3 py-3 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent flex-shrink-0">
              <button
                onClick={handleBackToInbox}
                className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold text-xs">
                  {getInitials(activeConversation.other_user_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {activeConversation.other_user_name}
                </p>
                <div className="flex items-center gap-1">
                  <Circle
                    className={`w-2 h-2 ${
                      wsStatus === "connected"
                        ? "fill-green-500 text-green-500"
                        : "fill-muted-foreground text-muted-foreground"
                    }`}
                  />
                  <span className="text-[10px] text-muted-foreground capitalize">{wsStatus}</span>
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
              className="flex-1 overflow-y-auto px-3 py-3 space-y-2 scroll-smooth"
            >
              {messagesLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-center py-8">
                  <p className="text-sm text-muted-foreground">No messages yet</p>
                  <p className="text-xs text-muted-foreground">
                    Say hi to {activeConversation.other_user_name}!
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.sender_id === currentUserId
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-2 ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      {!isMine && (
                        <Avatar className="h-6 w-6 flex-shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                            {getInitials(msg.sender_name)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`max-w-[72%] flex flex-col gap-0.5 ${isMine ? "items-end" : "items-start"}`}>
                        <div
                          className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                            isMine
                              ? "bg-primary text-primary-foreground rounded-br-sm"
                              : "bg-muted text-foreground rounded-bl-sm"
                          }`}
                        >
                          {msg.content}
                        </div>
                        <span className="text-[10px] text-muted-foreground px-1">
                          {formatTime(msg.created_at)}
                          {isMine && msg.is_read && (
                            <span className="ml-1 text-primary/60">· Read</span>
                          )}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Input */}
            <div className="flex-shrink-0 border-t border-border/50 px-3 py-3 bg-background/80 backdrop-blur-sm">
              <div className="flex gap-2 items-end">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message ${activeConversation.other_user_name}… (⌘↵)`}
                  rows={2}
                  disabled={sendLoading}
                  className="flex-1 min-h-[52px] max-h-[120px] resize-none text-sm rounded-xl border border-input bg-background px-3 py-2 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
                />
                <Button
                  onClick={handleSend}
                  disabled={sendLoading || !inputValue.trim()}
                  size="icon"
                  className="h-10 w-10 flex-shrink-0 rounded-xl"
                >
                  {sendLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground text-center mt-1.5">
                ⌘↵ to send
              </p>
            </div>
          </>
        )}
      </div>
    </>
  )
}
