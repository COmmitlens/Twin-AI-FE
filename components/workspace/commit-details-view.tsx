import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Plus, Minus, Loader2, ChevronRight } from "lucide-react"
import { Commit, CommitDetail } from "@/lib/types/workspace"
import { cn } from "@/lib/utils"

interface CommitDetailsViewProps {
  selectedCommit: Commit | null
  commitFiles: CommitDetail[]
  selectedFile: CommitDetail | null
  loading: boolean
  onFileSelect: (file: CommitDetail) => void
}

function getStatusColor(status: string | undefined): string {
  const s = (status ?? "").toLowerCase()
  switch (s) {
    case "added":
      return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
    case "modified":
    case "changed":
      return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"
    case "removed":
    case "deleted":
      return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
    default:
      return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20"
  }
}

function getPatchLineColor(line: string): string {
  if (line.startsWith("+") && !line.startsWith("+++")) return "text-green-700 dark:text-green-400"
  if (line.startsWith("-") && !line.startsWith("---")) return "text-red-700 dark:text-red-400"
  if (line.startsWith("@@")) return "text-blue-700 dark:text-blue-400"
  if (line.startsWith("diff ") || line.startsWith("index ") || line.startsWith("+++") || line.startsWith("---"))
    return "text-muted-foreground/60"
  return "text-muted-foreground"
}

export function CommitDetailsView({
  selectedCommit,
  commitFiles,
  selectedFile,
  loading,
  onFileSelect,
}: CommitDetailsViewProps) {
  if (!selectedCommit) return null

  return (
    <Card className="border border-border/50 shadow-sm">
      <CardHeader className="pb-4 border-b border-border/30">
        <div className="space-y-3">
          <div>
            <CardTitle className="text-xl truncate">{selectedCommit.message.split("\n")[0]}</CardTitle>
            <p className="text-xs font-mono text-muted-foreground mt-1.5">SHA: {selectedCommit.sha}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Author</p>
              <p className="text-sm font-medium">{selectedCommit.github_author_name || "Unknown"}</p>
              <p className="text-xs text-muted-foreground">{selectedCommit.author_email}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Committed</p>
              <p className="text-sm font-medium">{new Date(selectedCommit.committed_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </CardHeader>

      {loading ? (
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      ) : commitFiles.length > 0 ? (
        <CardContent className="pt-5 space-y-5">
          {/* File list */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Changed Files ({commitFiles.length})
            </p>
            {commitFiles.map((file) => (
              <button
                key={file.ID}
                onClick={() => onFileSelect(file)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-colors",
                  selectedFile?.ID === file.ID
                    ? "border-primary/40 bg-primary/5"
                    : "border-border/40 bg-muted/20 hover:bg-muted/40 hover:border-border/60"
                )}
              >
                <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="flex-1 font-mono text-xs truncate text-foreground">{file.Filename}</span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {file.Additions > 0 && (
                    <span className="flex items-center gap-0.5 text-xs text-green-600 dark:text-green-400 font-medium">
                      <Plus className="w-3 h-3" />{file.Additions}
                    </span>
                  )}
                  {file.Deletions > 0 && (
                    <span className="flex items-center gap-0.5 text-xs text-red-600 dark:text-red-400 font-medium">
                      <Minus className="w-3 h-3" />{file.Deletions}
                    </span>
                  )}
                  <Badge className={cn("text-[10px] px-1.5 py-0 capitalize", getStatusColor(file.Status))}>
                    {file.Status}
                  </Badge>
                  <ChevronRight className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform", selectedFile?.ID === file.ID && "text-primary rotate-90")} />
                </div>
              </button>
            ))}
          </div>

          {/* Selected file diff */}
          {selectedFile && selectedFile.Patch && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Diff</p>
              <div className="rounded-lg border border-border/50 bg-muted/10 overflow-hidden">
                <div className="px-3 py-2 bg-muted/30 border-b border-border/30 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="font-mono text-xs text-muted-foreground truncate">{selectedFile.Filename}</span>
                </div>
                <div className="overflow-x-auto max-h-72 overflow-y-auto">
                  <pre className="font-mono text-xs p-3 whitespace-pre">
                    {selectedFile.Patch.split("\n").map((line, i) => (
                      <span key={i} className={cn("block", getPatchLineColor(line))}>
                        {line || " "}
                      </span>
                    ))}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {!selectedFile && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Select a file above to view its diff, related commits, and ask AI questions
            </p>
          )}
        </CardContent>
      ) : null}
    </Card>
  )
}
