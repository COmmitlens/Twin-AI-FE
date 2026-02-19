import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"

interface WorkspaceHeaderProps {
  title: string
  subtitle?: string
  showBackButton?: boolean
  onBackClick?: () => void
  actionButton?: {
    label: string
    onClick: () => void
    loading?: boolean
  }
}

export function WorkspaceHeader({
  title,
  subtitle,
  showBackButton = false,
  onBackClick,
  actionButton,
}: WorkspaceHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 min-w-0">
        {showBackButton && (
          <Button
            variant="outline"
            size="sm"
            onClick={onBackClick}
            className="flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        )}
        <div className="min-w-0">
          <h1 className="text-3xl font-bold text-foreground truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1 truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {actionButton && (
        <Button
          onClick={actionButton.onClick}
          disabled={actionButton.loading}
          className="flex-shrink-0"
        >
          {actionButton.loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {actionButton.label}
            </>
          ) : (
            actionButton.label
          )}
        </Button>
      )}
    </div>
  )
}
