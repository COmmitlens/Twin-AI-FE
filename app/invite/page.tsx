"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Loader2, AlertCircle, Building2, User, CheckCircle, Mail } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { workspaceAPI } from "@/lib/api/workspace"
import { WorkspaceDetails } from "@/lib/types/workspace"

export default function AcceptInvitePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const jwt = searchParams.get("jwt")
  const workspaceId = searchParams.get("workspaceId")

  const [workspaceDetails, setWorkspaceDetails] = useState<WorkspaceDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [acceptLoading, setAcceptLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [accepted, setAccepted] = useState(false)

  useEffect(() => {
    if (!jwt || !workspaceId) {
      setError("Invalid invitation link. Missing required parameters.")
      setLoading(false)
      return
    }

    fetchWorkspaceDetails()
  }, [jwt, workspaceId])

  const fetchWorkspaceDetails = async () => {
    if (!workspaceId) return

    setLoading(true)
    setError(null)

    try {
      const response = await workspaceAPI.getWorkspaceDetails(parseInt(workspaceId))
      if (response.message === "Success" && response.data) {
        setWorkspaceDetails(response.data)
      } else {
        setError("Failed to fetch workspace details")
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch workspace details")
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptInvite = async () => {
    if (!jwt || !workspaceId) return

    setAcceptLoading(true)
    setError(null)

    try {
      const response = await workspaceAPI.acceptInvite(jwt, parseInt(workspaceId))
      if (response.message === "Success" || response.message.includes("success")) {
        setAccepted(true)
        // Redirect to workspace after 2 seconds
        setTimeout(() => {
          router.push(`/workspaces/${workspaceId}`)
        }, 2000)
      } else {
        setError(response.message || "Failed to accept invitation")
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to accept invitation")
    } finally {
      setAcceptLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading invitation details...</p>
        </div>
      </div>
    )
  }

  if (error && !workspaceDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-6 w-6" />
              <CardTitle>Invalid Invitation</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => router.push("/dashboard")}
            >
              Go to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (accepted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl">Invitation Accepted!</CardTitle>
            <CardDescription>
              You have successfully joined the workspace
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              Redirecting to workspace...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Workspace Invitation</CardTitle>
          <CardDescription>
            You've been invited to join a workspace
          </CardDescription>
        </CardHeader>

        {workspaceDetails && (
          <CardContent className="space-y-6">
            {/* Workspace Information */}
            <div className="bg-muted/50 rounded-lg p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-semibold text-lg">Workspace</h3>
                  </div>
                  <p className="text-2xl font-bold text-primary">
                    {workspaceDetails.workspace}
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  ID: {workspaceDetails.workspace_id}
                </Badge>
              </div>

              <div className="h-px bg-border" />

              {/* Owner Information */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span className="font-medium">Workspace Owner</span>
                </div>
                <div className="flex items-start gap-3 pl-6">
                  <div className="flex-1 space-y-1">
                    <p className="font-medium">{workspaceDetails.owner_name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      <span>{workspaceDetails.owner_email}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Information Box */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                By accepting this invitation, you will become a member of the{" "}
                <span className="font-semibold">{workspaceDetails.workspace}</span> workspace
                and gain access to all associated repositories and resources.
              </AlertDescription>
            </Alert>

            {/* Error Message */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        )}

        <CardFooter className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.push("/dashboard")}
            disabled={acceptLoading}
          >
            Decline
          </Button>
          <Button
            className="flex-1"
            onClick={handleAcceptInvite}
            disabled={acceptLoading || !workspaceDetails}
          >
            {acceptLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Accepting...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Accept Invitation
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
