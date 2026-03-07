import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Plus, Minus, Loader2 } from "lucide-react"
import { Commit, CommitDetail } from "@/lib/types/workspace"

interface CommitDetailsViewProps {
  selectedCommit: Commit | null
  commitDetails: CommitDetail | null
  loading: boolean
}

function getStatusColor(status: string): string {
  const statusLower = status.toLowerCase()
  
  switch (statusLower) {
    case "added":
    case "success":
      return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
    case "modified":
    case "changed":
      return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"
    case "removed":
    case "deleted":
    case "failure":
      return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
    case "pending":
      return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20"
    default:
      return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20"
  }
}

function getPatchLineColor(line: string): string {
  if (line.startsWith("+") && !line.startsWith("+++")) {
    return "text-green-700 dark:text-green-400"
  }

  if (line.startsWith("-") && !line.startsWith("---")) {
    return "text-red-700 dark:text-red-400"
  }

  if (line.startsWith("@@")) {
    return "text-blue-700 dark:text-blue-400"
  }

  if (
    line.startsWith("diff ") ||
    line.startsWith("index ") ||
    line.startsWith("+++") ||
    line.startsWith("---")
  ) {
    return "text-muted-foreground/80"
  }

  return "text-muted-foreground"
}

export function CommitDetailsView({
  selectedCommit,
  commitDetails,
  loading,
}: CommitDetailsViewProps) {
  if (!selectedCommit) return null

  return (
    <Card className="border border-border/50 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-4 border-b border-border/30">
        <div className="space-y-3">
          <div>
            <CardTitle className="text-xl truncate">{selectedCommit.message.split('\n')[0]}</CardTitle>
            <CardDescription className="text-sm mt-2 font-mono">
              SHA: {selectedCommit.sha}
            </CardDescription>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Author</p>
              <p className="text-sm font-medium text-foreground">{selectedCommit.github_author_name || "Unknown"}</p>
              <p className="text-xs text-muted-foreground">{selectedCommit.author_email}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Committed</p>
              <p className="text-sm font-medium text-foreground">{new Date(selectedCommit.committed_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </CardHeader>

      {loading ? (
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      ) : commitDetails ? (
        <CardContent className="pt-6 space-y-6">
          {/* File Changes Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg border border-border/50 bg-green-500/5">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                Additions
              </div>
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-green-600 dark:text-green-500" />
                <p className="text-lg font-bold text-green-600 dark:text-green-500">
                  {commitDetails.Additions}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-border/50 bg-red-500/5">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                Deletions
              </div>
              <div className="flex items-center gap-2">
                <Minus className="w-4 h-4 text-red-600 dark:text-red-500" />
                <p className="text-lg font-bold text-red-600 dark:text-red-500">
                  {commitDetails.Deletions}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-border/50 bg-blue-500/5">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                Status
              </div>
              <Badge className={`${getStatusColor(commitDetails.Status)} capitalize`}>
                {commitDetails.Status}
              </Badge>
            </div>
          </div>

          {/* File Info */}
          <div className="space-y-2 p-4 rounded-lg border border-border/50 bg-muted/20">
            <div className="flex items-start gap-3">
              <FileText className="w-4 h-4 text-muted-foreground/60 mt-1 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  File
                </p>
                <p className="font-mono text-sm text-foreground break-all">
                  {commitDetails.Filename}
                </p>
              </div>
            </div>
          </div>

          {/* Patch Preview */}
          {commitDetails.Patch && (
            <div className="space-y-2">
              <p className="text-sm font-semibold">Patch Preview</p>
              <div className="p-3 rounded-lg border border-border/50 bg-muted/20 overflow-x-auto">
                <pre className="font-mono text-xs whitespace-pre-wrap break-words max-h-64 overflow-y-auto">
                  {commitDetails.Patch.substring(0, 500)
                    .split("\n")
                    .map((line, index) => (
                      <span key={`${index}-${line}`} className={`block ${getPatchLineColor(line)}`}>
                        {line || " "}
                      </span>
                    ))}
                  {commitDetails.Patch.length > 500 && (
                    <span className="block text-muted-foreground">...</span>
                  )}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      ) : null}
    </Card>
  )
}
