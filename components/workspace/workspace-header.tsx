import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"

interface ActionButton {
  label: string
  onClick: () => void
  loading?: boolean
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
}

interface WorkspaceHeaderProps {
  title: string
  subtitle?: string
  showBackButton?: boolean
  onBackClick?: () => void
  actionButton?: ActionButton
  actionButtons?: ActionButton[]
}

export function WorkspaceHeader({
  title,
  subtitle,
  showBackButton = false,
  onBackClick,
  actionButton,
  actionButtons,
}: WorkspaceHeaderProps) {
  const buttons: ActionButton[] = [
    ...(actionButtons ?? []),
    ...(actionButton ? [actionButton] : []),
  ]

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

      {buttons.length > 0 && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {buttons.map((btn, i) => (
            <Button
              key={i}
              variant={btn.variant ?? "default"}
              onClick={btn.onClick}
              disabled={btn.loading}
            >
              {btn.loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {btn.label}
                </>
              ) : (
                btn.label
              )}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
