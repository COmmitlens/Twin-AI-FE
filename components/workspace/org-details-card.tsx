import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OrgDetails } from "@/lib/types/workspace"

interface OrgDetailsCardProps {
  orgDetails: OrgDetails
}

export function OrgDetailsCard({ orgDetails }: OrgDetailsCardProps) {
  return (
    <Card className="border border-border/50 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">Organization Details</CardTitle>
        <CardDescription className="text-sm">
          Installation ID: {orgDetails.installation_id}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Account Login</p>
            <p className="font-semibold text-foreground">{orgDetails.account_login || "N/A"}</p>
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Account Type</p>
            <p className="font-semibold text-foreground">{orgDetails.account_type || "N/A"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
