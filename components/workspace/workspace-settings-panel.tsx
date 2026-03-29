"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Settings,
  ArrowLeftRight,
  User,
  SlidersHorizontal,
  X,
  ChevronRight,
  Check,
  Loader2,
} from "lucide-react"
import { Workspace } from "@/lib/types/workspace"
import { workspaceAPI } from "@/lib/api/workspace"

interface WorkspaceSettingsPanelProps {
  currentWorkspaceId: string
}

type SubView = "menu" | "switch"

export function WorkspaceSettingsPanel({ currentWorkspaceId }: WorkspaceSettingsPanelProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [subView, setSubView] = useState<SubView>("menu")
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handle = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        handleClose()
      }
    }
    document.addEventListener("mousedown", handle)
    return () => document.removeEventListener("mousedown", handle)
  }, [open])

  const handleClose = () => {
    setOpen(false)
    setSubView("menu")
  }

  const handleSwitchWorkspace = async () => {
    setSubView("switch")
    if (workspaces.length === 0) {
      setLoadingWorkspaces(true)
      try {
        const res = await workspaceAPI.getAllWorkspaces()
        if (res.message === "Success" && res.data) {
          setWorkspaces(Array.isArray(res.data) ? res.data : [res.data])
        }
      } catch {
        // silently fail
      } finally {
        setLoadingWorkspaces(false)
      }
    }
  }

  const handleSelectWorkspace = (ws: Workspace) => {
    handleClose()
    router.push(`/workspaces/${ws.id}`)
  }

  return (
    <div ref={panelRef} className="fixed bottom-6 left-6 z-40 flex flex-col items-start gap-2">
      {/* Floating panel */}
      {open && (
        <div className="mb-2 w-56 rounded-2xl border border-border/60 bg-background shadow-2xl overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-150">
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-muted/30">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
              {subView === "switch" ? "Switch Workspace" : "Settings"}
            </span>
            <button
              onClick={subView === "switch" ? () => setSubView("menu") : handleClose}
              className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              {subView === "switch" ? (
                <ChevronRight className="w-3.5 h-3.5 rotate-180" />
              ) : (
                <X className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {subView === "menu" && (
            <div className="py-1.5">
              <MenuItem
                icon={<ArrowLeftRight className="w-4 h-4" />}
                label="Switch Workspace"
                onClick={handleSwitchWorkspace}
                showArrow
              />
              <MenuItem
                icon={<User className="w-4 h-4" />}
                label="Profile"
                onClick={() => {
                  handleClose()
                  router.push("/profile")
                }}
              />
              <MenuItem
                icon={<SlidersHorizontal className="w-4 h-4" />}
                label="Advanced"
                onClick={() => {
                  handleClose()
                  router.push("/settings/advanced")
                }}
              />
            </div>
          )}

          {subView === "switch" && (
            <div className="py-1.5 max-h-60 overflow-y-auto">
              {loadingWorkspaces ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              ) : workspaces.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6 px-4">
                  No workspaces found.
                </p>
              ) : (
                workspaces.map((ws) => {
                  const isCurrent = String(ws.id) === currentWorkspaceId
                  return (
                    <button
                      key={ws.id}
                      onClick={() => !isCurrent && handleSelectWorkspace(ws)}
                      disabled={isCurrent}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                        isCurrent
                          ? "opacity-60 cursor-default"
                          : "hover:bg-muted/50 cursor-pointer"
                      }`}
                    >
                      <div className="w-6 h-6 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-bold text-primary uppercase">
                          {ws.name.charAt(0)}
                        </span>
                      </div>
                      <span className="text-sm text-foreground flex-1 truncate">{ws.name}</span>
                      {isCurrent && <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                    </button>
                  )
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* Floating trigger button */}
      <button
        onClick={() => (open ? handleClose() : setOpen(true))}
        className={`flex items-center gap-2 rounded-full px-4 py-3 shadow-lg text-sm font-medium transition-all duration-200 border ${
          open
            ? "bg-muted border-border text-foreground"
            : "bg-background border-border/60 text-muted-foreground hover:text-foreground hover:border-border hover:shadow-lg"
        }`}
      >
        <Settings className={`w-4 h-4 transition-transform duration-300 ${open ? "rotate-45" : ""}`} />
        Settings
      </button>
    </div>
  )
}

function MenuItem({
  icon,
  label,
  onClick,
  showArrow,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  showArrow?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-muted/50 transition-colors group"
    >
      <span className="text-muted-foreground group-hover:text-foreground transition-colors">
        {icon}
      </span>
      <span className="text-sm text-foreground flex-1">{label}</span>
      {showArrow && (
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
      )}
    </button>
  )
}
