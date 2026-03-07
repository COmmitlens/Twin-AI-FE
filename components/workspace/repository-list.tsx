import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Repository } from "@/lib/types/workspace"
import { GitBranch, Lock, Unlock } from "lucide-react"

interface RepositoryListProps {
  repositories?: Repository[]
  onRepoClick: (repo: Repository) => void
}

export function RepositoryList({ repositories, onRepoClick }: RepositoryListProps) {
  const repositoryList = repositories ?? []

  return (
    <Card className="border border-border/50 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">Repositories</CardTitle>
        <CardDescription className="text-sm">
          {repositoryList.length} {repositoryList.length === 1 ? "repository" : "repositories"} • Click to view commits
        </CardDescription>
      </CardHeader>
      <CardContent>
        {repositoryList.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">No repositories found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {repositoryList.map((repo) => (
              <button
                key={repo.id}
                onClick={() => onRepoClick(repo)}
                className="w-full flex items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-accent/50 hover:border-border transition cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <GitBranch className="w-4 h-4 text-muted-foreground/60 flex-shrink-0 group-hover:text-primary transition" />
                  <div className="text-left min-w-0">
                    <p className="font-medium text-foreground truncate group-hover:text-primary transition">{repo.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{repo.full_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  {repo.private ? (
                    <>
                      <Lock className="w-4 h-4 text-yellow-600 dark:text-yellow-500" />
                      <span className="text-xs text-muted-foreground font-medium">Private</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-4 h-4 text-green-600 dark:text-green-500" />
                      <span className="text-xs text-muted-foreground font-medium">Public</span>
                    </>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
