"use client"

import { useState } from "react"
import { Loader2, Users, UserPlus, Mail, Shield, Eye, X, UserMinus, MessageSquare } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { WorkspaceMember } from "@/lib/types/workspace"

interface WorkspaceMembersProps {
  members: WorkspaceMember[]
  loading: boolean
  currentUserEmail?: string
  onInviteClick: () => void
  onRemoveMember: (userId: number) => Promise<void>
  onMessageClick?: (member: WorkspaceMember) => void
}

const getRoleBadgeVariant = (role: string) => {
  switch (role.toLowerCase()) {
    case "admin":
      return "default"
    case "member":
      return "secondary"
    case "viewer":
      return "outline"
    default:
      return "secondary"
  }
}

const getRoleIcon = (role: string) => {
  switch (role.toLowerCase()) {
    case "admin":
      return <Shield className="h-3 w-3" />
    case "member":
      return <Users className="h-3 w-3" />
    case "viewer":
      return <Eye className="h-3 w-3" />
    default:
      return null
  }
}

const getInitials = (name: string) => {
  const parts = name.trim().split(" ")
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

export function WorkspaceMembers({
  members,
  loading,
  currentUserEmail,
  onInviteClick,
  onRemoveMember,
  onMessageClick,
}: WorkspaceMembersProps) {
  const [memberToRemove, setMemberToRemove] = useState<WorkspaceMember | null>(null)
  const [removeLoading, setRemoveLoading] = useState(false)

  const handleRemoveClick = (member: WorkspaceMember) => {
    setMemberToRemove(member)
  }

  const handleConfirmRemove = async () => {
    if (!memberToRemove) return

    setRemoveLoading(true)
    try {
      await onRemoveMember(memberToRemove.user_id)
      setMemberToRemove(null)
    } catch (error) {
      console.error("Failed to remove member:", error)
    } finally {
      setRemoveLoading(false)
    }
  }

  return (
    <>
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-primary" />
              Members
              {!loading && (
                <Badge variant="secondary" className="ml-1 font-normal">
                  {members.length}
                </Badge>
              )}
            </CardTitle>
            <Button onClick={onInviteClick} size="sm" className="h-8">
              <UserPlus className="h-4 w-4 mr-1.5" />
              Invite
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No members yet</p>
              <p className="text-xs mt-1">Invite users to collaborate</p>
            </div>
          ) : (
            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member.user_id}
                  className="group flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-all duration-200"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="h-9 w-9 ring-2 ring-background">
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold text-sm">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">
                          {member.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{member.email}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={getRoleBadgeVariant(member.role)}
                      className="flex items-center gap-1 text-xs"
                    >
                      {getRoleIcon(member.role)}
                      {member.role}
                    </Badge>
                    {onMessageClick && member.email?.toLowerCase() !== currentUserEmail?.toLowerCase() && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        onClick={() => onMessageClick(member)}
                        title="Send DM"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemoveClick(member)}
                      title="Remove member"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Remove Member Confirmation Dialog */}
      <AlertDialog open={!!memberToRemove} onOpenChange={(open) => !open && setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <UserMinus className="h-5 w-5 text-destructive" />
              Remove Member
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Are you sure you want to remove{" "}
                <span className="font-semibold text-foreground">{memberToRemove?.name}</span>{" "}
                from this workspace?
              </p>
              <p className="text-sm text-muted-foreground">
                They will lose access to all workspace resources immediately.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removeLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRemove}
              disabled={removeLoading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {removeLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
