'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Loader2, FolderOpen, ChevronRight } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'
import type { Workspace } from '@/lib/types/workspace'

interface WorkspacesListProps {
  workspaces: Workspace[] | null
  loading: boolean
  error: string | null
  onRefresh?: () => void
}

const getTypeColor = (type?: string | boolean) => {
  if (!type) return 'bg-blue-950/50 text-blue-300 border-blue-500/30'
  if (typeof type === 'boolean') {
    return type
      ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/30'
      : 'bg-slate-900/50 text-slate-300 border-slate-500/30'
  }
  const lowerType = type.toLowerCase()
  switch (lowerType) {
    case 'personal':
      return 'bg-purple-950/50 text-purple-300 border-purple-500/30'
    case 'team':
      return 'bg-cyan-950/50 text-cyan-300 border-cyan-500/30'
    case 'enterprise':
      return 'bg-emerald-950/50 text-emerald-300 border-emerald-500/30'
    default:
      return 'bg-blue-950/50 text-blue-300 border-blue-500/30'
  }
}

const getTypeLabel = (type?: string | boolean) => {
  if (!type) return 'Standard'
  if (typeof type === 'boolean') return type ? 'Public' : 'Private'
  return type.charAt(0).toUpperCase() + type.slice(1)
}

export function WorkspacesList({ workspaces, loading, error, onRefresh }: WorkspacesListProps) {
  if (loading && !workspaces) {
    return (
      <Card className="border-border/50 backdrop-blur">
        <CardHeader>
          <CardTitle>Your Workspaces</CardTitle>
          <CardDescription>Manage and access your workspaces</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-border/50 backdrop-blur">
        <CardHeader>
          <CardTitle>Your Workspaces</CardTitle>
          <CardDescription>Manage and access your workspaces</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="border-destructive/50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          {onRefresh && (
            <Button onClick={onRefresh} variant="outline" className="mt-4 border-border/50">
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  if (!workspaces || workspaces.length === 0) {
    return (
      <Card className="border-border/50 backdrop-blur">
        <CardHeader>
          <CardTitle>Your Workspaces</CardTitle>
          <CardDescription>Manage and access your workspaces</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FolderOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-foreground font-medium">No workspaces yet</p>
            <p className="text-muted-foreground text-sm mt-1">
              Create your first workspace to get started
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50 backdrop-blur">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Your Workspaces</CardTitle>
            <CardDescription>Manage and access your workspaces</CardDescription>
          </div>
          {onRefresh && (
            <Button
              onClick={onRefresh}
              variant="outline"
              size="sm"
              className="border-border/50"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((workspace) => (
            <Link
              key={workspace.id}
              href={`/workspaces/${workspace.id}`}
              className="group transition-all duration-200"
            >
              <div className="h-full p-4 rounded-lg border border-border/50 bg-card/50 hover:bg-card/80 hover:border-accent/50 transition-all duration-200 cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">
                      {workspace.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      ID: {workspace.id}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <Badge
                    variant="outline"
                    className={`text-xs font-medium border ${getTypeColor(workspace.type)}`}
                  >
                    {getTypeLabel(workspace.type)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(workspace.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
