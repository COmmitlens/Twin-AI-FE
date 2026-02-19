import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { Commit } from "@/lib/types/workspace"

interface CommitsListProps {
  commits: Commit[]
  loading: boolean
  currentPage: number
  totalPages: number
  totalRecords: number
  onCommitClick: (commit: Commit) => void
  onPageChange: (page: number) => void
}

export function CommitsList({
  commits,
  loading,
  currentPage,
  totalPages,
  totalRecords,
  onCommitClick,
  onPageChange,
}: CommitsListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <Card className="border border-border/50 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">Commits</CardTitle>
        <CardDescription className="text-sm">
          {totalRecords} total commits • Click to view detailed changes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {commits.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">No commits found</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {commits.map((commit) => {
                const firstLine = commit.message.split("\n")[0]
                const restOfText = commit.message.split("\n").slice(1).join("\n")
                
                return (
                  <button
                    key={commit.id}
                    onClick={() => onCommitClick(commit)}
                    className="w-full text-left p-4 border border-border/50 rounded-lg hover:bg-accent/50 hover:border-border hover:shadow-sm transition cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground mb-1 group-hover:text-primary transition break-words">
                          {firstLine}
                        </p>
                        {restOfText && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {restOfText.length > 100 ? `${restOfText.substring(0, 100)}...` : restOfText}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="font-mono">{commit.sha.substring(0, 7)}</span>
                          <span>by {commit.github_author_name || "Unknown"}</span>
                          <span>{new Date(commit.committed_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4 border-t border-border/30">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => onPageChange(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="gap-1"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
