"use client"

import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { getApiUrl } from "@/lib/env"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  OrgDetailsCard,
  RepositoryList,
  CommitsList,
  CommitDetailsView,
  RelatedCommitsSection,
  AIExplainSection,
  WorkspaceHeader,
  WorkspaceMembers,
  InviteUserModal,
  WorkspaceChatPanel,
  WorkspaceSettingsPanel,
  DMChatPanel,
} from "@/components/workspace"
import {
  Repository,
  OrgDetails,
  Commit,
  CommitDetail,
  RelatedCommit,
  ExplainResponse,
  WorkspaceMember,
} from "@/lib/types/workspace"
import { workspaceAPI } from "@/lib/api/workspace"

type ViewType = "repos" | "commits" | "commitDetails"

export default function WorkspacePage() {
  const params = useParams()
  const { user } = useAuth()

  // Loading states
  const [loading, setLoading] = useState(false)
  const [connectLoading, setConnectLoading] = useState(false)

  // Org data
  const [orgDetails, setOrgDetails] = useState<OrgDetails | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  // View navigation
  const [currentView, setCurrentView] = useState<ViewType>("repos")
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null)
  const [selectedCommit, setSelectedCommit] = useState<Commit | null>(null)

  // Commits state
  const [commits, setCommits] = useState<Commit[]>([])
  const [commitsLoading, setCommitsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const pageSize = 5

  // Commit details state
  const [commitFiles, setCommitFiles] = useState<CommitDetail[]>([])
  const [selectedFile, setSelectedFile] = useState<CommitDetail | null>(null)
  const [commitDetailsLoading, setCommitDetailsLoading] = useState(false)

  // Related commits state
  const [relatedCommits, setRelatedCommits] = useState<RelatedCommit[]>([])
  const [relatedLoading, setRelatedLoading] = useState(false)

  // AI Explain state
  const [question, setQuestion] = useState("")
  const [chatMessages, setChatMessages] = useState<{ question: string; response: ExplainResponse }[]>([])
  const [aiLoading, setAiLoading] = useState(false)

  // Workspace members state
  const [members, setMembers] = useState<WorkspaceMember[]>([])
  const [membersLoading, setMembersLoading] = useState(false)
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [inviteLoading, setInviteLoading] = useState(false)

  // Slack state
  const [slackConnected, setSlackConnected] = useState(false)
  const [slackTeamName, setSlackTeamName] = useState<string | undefined>(undefined)

  // DM state
  const [dmRecipient, setDmRecipient] = useState<{ userId: number; name: string } | null>(null)

  // Fetch organization details
  const fetchOrgDetails = async () => {
    const id = params.id as string
    setLoading(true)
    setError(null)
    setNotFound(false)

    try {
      const response = await workspaceAPI.getOrgDetails(id)
      if (response.message === "Success" && response.data) {
        setOrgDetails(response.data)
      } else if (response.message === "record not found") {
        setNotFound(true)
      }
    } catch (err: any) {
      if (err.response?.data?.message === "record not found") {
        setNotFound(true)
      } else {
        setError(err.response?.data?.message || "Failed to fetch organization details")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrgDetails()
    fetchWorkspaceMembers()
    fetchSlackStatus()
  }, [params.id])

  // Fetch Slack connection status
  const fetchSlackStatus = async () => {
    const id = params.id as string
    try {
      const response = await workspaceAPI.getSlackStatus(id)
      setSlackConnected(response.connected)
      setSlackTeamName(response.slack_team_name)
    } catch {
      // Slack not connected — ignore error
    }
  }

  // Handle connect to Slack — navigate directly (backend returns a redirect, XHR cannot follow cross-origin redirects)
  const handleConnectToSlack = () => {
    const id = params.id as string
    window.location.href = `${getApiUrl()}/slack/install?workspace_id=${id}`
  }

  // Handle connect to org
  const handleConnectToOrg = async () => {
    const id = params.id as string
    setConnectLoading(true)

    try {
      const response = await workspaceAPI.connectToOrg(id)
      if (response?.url) {
        window.location.href = response.url
      }
    } catch (error) {
      console.error("Failed to connect to org:", error)
      setError("Failed to connect to organization")
    } finally {
      setConnectLoading(false)
    }
  }

  // Fetch commits for selected repo
  const fetchCommits = async (repoId: number, page: number = 1) => {
    setCommitsLoading(true)
    setError(null)

    try {
      const response = await workspaceAPI.getRepoCommits(repoId, pageSize, page)
      if (response.message === "Success" && response.data) {
        setCommits(response.data.commits)
        setCurrentPage(response.data.meta.page_number)
        setTotalPages(response.data.meta.total_pages)
        setTotalRecords(response.data.meta.total_records)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch commits")
    } finally {
      setCommitsLoading(false)
    }
  }

  // Fetch commit details (array of files changed)
  const fetchCommitDetails = async (commitId: number) => {
    setCommitDetailsLoading(true)
    setError(null)
    setCommitFiles([])
    setSelectedFile(null)
    setRelatedCommits([])
    setChatMessages([])

    try {
      const response = await workspaceAPI.getCommitDetails(commitId)
      if (response.message === "Success" && response.data) {
        setCommitFiles(response.data)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch commit details")
    } finally {
      setCommitDetailsLoading(false)
    }
  }

  // Handle file selection — fetch related commits for that specific file
  const handleFileSelect = async (file: CommitDetail) => {
    setSelectedFile(file)
    setRelatedCommits([])
    setChatMessages([])
    setQuestion("")
    setRelatedLoading(true)

    try {
      const response = await workspaceAPI.getRelatedCommitsForFile(file.ID)
      if (Array.isArray(response)) {
        setRelatedCommits(response)
      }
    } catch (err: any) {
      console.error("Failed to fetch related commits:", err)
    } finally {
      setRelatedLoading(false)
    }
  }

  // Handle AI explain
  const handleAskAI = async () => {
    if (!question.trim() || !selectedFile) return

    setAiLoading(true)
    setError(null)

    try {
      const response = await workspaceAPI.explainCommit(selectedFile.ID, question)
      setChatMessages((prev) => [...prev, { question, response }])
      setQuestion("")
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to get AI explanation")
    } finally {
      setAiLoading(false)
    }
  }

  // Fetch workspace members
  const fetchWorkspaceMembers = async () => {
    const id = params.id as string
    setMembersLoading(true)

    try {
      const response = await workspaceAPI.getWorkspaceMembers(id)
      if (response.message === "Success" && response.data) {
        setMembers(response.data)
      } else if (Array.isArray(response)) {
        setMembers(response)
      }
    } catch (err: any) {
      console.error("Failed to fetch workspace members:", err)
    } finally {
      setMembersLoading(false)
    }
  }

  // Handle invite user
  const handleInviteUser = async (email: string, role: string) => {
    const workspaceId = parseInt(params.id as string)
    setInviteLoading(true)

    try {
      await workspaceAPI.inviteUserToWorkspace(workspaceId, email, role)
      await fetchWorkspaceMembers()
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Failed to invite user")
    } finally {
      setInviteLoading(false)
    }
  }

  // Handle remove member
  const handleRemoveMember = async (userId: number) => {
    const workspaceId = parseInt(params.id as string)

    try {
      await workspaceAPI.removeMemberFromWorkspace(workspaceId, userId)
      await fetchWorkspaceMembers()
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to remove member")
      throw new Error(err.response?.data?.message || "Failed to remove member")
    }
  }

  // Navigation handlers
  const handleRepoClick = (repo: Repository) => {
    setSelectedRepo(repo)
    setCurrentView("commits")
    setCurrentPage(1)
    fetchCommits(repo.id, 1)
  }

  const handleCommitClick = (commit: Commit) => {
    setSelectedCommit(commit)
    setCurrentView("commitDetails")
    fetchCommitDetails(commit.id)
  }

  const handleBackToRepos = () => {
    setCurrentView("repos")
    setSelectedRepo(null)
    setCommits([])
    setError(null)
  }

  const handleBackToCommits = () => {
    setCurrentView("commits")
    setSelectedCommit(null)
    setCommitFiles([])
    setSelectedFile(null)
    setRelatedCommits([])
    setChatMessages([])
    setQuestion("")
    setError(null)
  }

  const handlePageChange = (newPage: number) => {
    if (selectedRepo && newPage >= 1 && newPage <= totalPages) {
      fetchCommits(selectedRepo.id, newPage)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="flex gap-6 max-w-7xl mx-auto">
        {/* Left Sidebar - Members Section */}
        <div className="w-80 flex-shrink-0 space-y-6">
          <WorkspaceMembers
            members={members}
            loading={membersLoading}
            currentUserEmail={user?.email}
            onInviteClick={() => setInviteModalOpen(true)}
            onRemoveMember={handleRemoveMember}
            onMessageClick={(member) =>
              setDmRecipient({ userId: member.user_id, name: member.name })
            }
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Header */}
          <WorkspaceHeader
            title={
              currentView === "repos"
                ? "Workspace Organization"
                : currentView === "commits"
                ? selectedRepo?.name || "Commits"
                : "Commit Details"
            }
            subtitle={
              currentView === "commits" && selectedRepo
                ? selectedRepo.full_name
                : undefined
            }
            showBackButton={currentView !== "repos"}
            onBackClick={currentView === "commits" ? handleBackToRepos : handleBackToCommits}
            actionButton={
              notFound && currentView === "repos"
                ? {
                    label: "Connect to org",
                    onClick: handleConnectToOrg,
                    loading: connectLoading,
                  }
                : undefined
            }
            actionButtons={
              currentView === "repos" && !slackConnected
                ? [
                    {
                      label: "Connect Slack",
                      onClick: handleConnectToSlack,

                      variant: "outline" as const,
                    },
                  ]
                : currentView === "repos" && slackConnected && slackTeamName
                ? [
                    {
                      label: `Slack: ${slackTeamName}`,
                      onClick: () => {},
                      variant: "outline" as const,
                    },
                  ]
                : undefined
            }
          />

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Not Found Alert */}
        {notFound && !error && currentView === "repos" && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No organization connected to this workspace. Click &quot;Connect to org&quot; to get started.
            </AlertDescription>
          </Alert>
        )}

        {/* Repositories View */}
        {currentView === "repos" && orgDetails && (
          <div className="space-y-6">
            <OrgDetailsCard orgDetails={orgDetails} />
            <RepositoryList
              repositories={orgDetails.repositories}
              onRepoClick={handleRepoClick}
            />
          </div>
        )}

        {/* Commits View */}
        {currentView === "commits" && (
          <CommitsList
            commits={commits}
            loading={commitsLoading}
            currentPage={currentPage}
            totalPages={totalPages}
            totalRecords={totalRecords}
            onCommitClick={handleCommitClick}
            onPageChange={handlePageChange}
          />
        )}

        {/* Commit Details View */}
        {/* kk */}
        {currentView === "commitDetails" && (
          <div className="space-y-6">
            <CommitDetailsView
              selectedCommit={selectedCommit}
              commitFiles={commitFiles}
              selectedFile={selectedFile}
              loading={commitDetailsLoading}
              onFileSelect={handleFileSelect}
            />

            {selectedFile && (
              <>
                <RelatedCommitsSection
                  relatedCommits={relatedCommits}
                  loading={relatedLoading}
                />

                <AIExplainSection
                  question={question}
                  onQuestionChange={setQuestion}
                  chatMessages={chatMessages}
                  loading={aiLoading}
                  onSubmit={handleAskAI}
                  disabled={false}
                />
              </>
            )}
          </div>
        )}
        </div>
      </div>

      {/* Workspace Settings */}
      <WorkspaceSettingsPanel currentWorkspaceId={params.id as string} />

      {/* DM Panel */}
      <DMChatPanel
        workspaceId={parseInt(params.id as string)}
        currentUserId={parseInt(user?.id ?? "0")}
        currentUserEmail={user?.email}
        members={members}
        initialRecipient={dmRecipient}
        onInitialRecipientConsumed={() => setDmRecipient(null)}
      />

      {/* Workspace AI Chat */}
      <WorkspaceChatPanel
        workspaceId={params.id as string}
        members={members}
        onQuery={(question, author, dateRange) =>
          workspaceAPI.queryWorkspace(params.id as string, question, author, dateRange)
        }
      />

      {/* Invite User Modal */}
      <InviteUserModal
        open={inviteModalOpen}
        onOpenChange={setInviteModalOpen}
        workspaceId={parseInt(params.id as string)}
        onInviteSuccess={() => {
          fetchWorkspaceMembers()
        }}
        onInvite={handleInviteUser}
        loading={inviteLoading}
      />
    </div>
  )
}
