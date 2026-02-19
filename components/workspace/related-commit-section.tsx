import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RelatedCommit } from "@/lib/types/workspace"
import { Link2, Loader2 } from "lucide-react"

interface RelatedCommitsSectionProps {
  relatedCommits: RelatedCommit[]
  loading: boolean
}

export function RelatedCommitsSection({ relatedCommits, loading }: RelatedCommitsSectionProps) {
  if (loading) {
    return (
      <Card className="border border-border/50 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Related Commits</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-border/50 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Related Commits</CardTitle>
        <CardDescription className="text-sm">
          {relatedCommits.length} similar {relatedCommits.length === 1 ? "commit" : "commits"} found
        </CardDescription>
      </CardHeader>
      <CardContent>
        {relatedCommits.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-muted-foreground">No related commits found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {relatedCommits.map((related) => (
              <div
                key={related.commit_file_id}
                className="p-3 border border-border/50 rounded-lg hover:bg-accent/30 transition"
              >
                <div className="flex items-start gap-3">
                  <Link2 className="w-4 h-4 text-muted-foreground/60 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm text-foreground truncate">
                      {related.filename}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <span>{related.author}</span>
                      <span>•</span>
                      <span>{new Date(related.committed_at).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="text-primary font-medium">
                        {(related.similarity * 100).toFixed(0)}% match
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
