"use client"

import { Button } from "@/components/ui/button"
import { useParams } from "next/navigation"
import api from "@/lib/axios"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, GitBranch, Lock, Unlock, Loader2, ArrowLeft, ChevronLeft, ChevronRight, FileText, Plus, Minus, Sparkles, Send, Link2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"

interface Repository {
  id: number
  name: string
  full_name: string
  private: boolean
}

interface OrgDetails {
  id: number
  installation_id: number
  account_login: string
  account_type: string
  workspace_id: number
  repositories: Repository[]
}

interface OrgDetailsResponse {
  message: string
  data?: OrgDetails
}

interface Commit {
  id: number
  sha: string
  message: string
  github_author_name: string
  author_email: string
  committed_at: string
}

interface CommitsResponse {
  message: string
  data?: {
    commits: Commit[]
    meta: {
      page_number: number
      page_size: number
      total_pages: number
      total_records: number
    }
  }
}

interface CommitDetail {
  ID: number
  GithubCommitID: number
  Filename: string
  Status: string
  Additions: number
  Deletions: number
  Patch: string
  GithubRepoID: number
  CreatedAt: string
}

interface CommitDetailsResponse {
  message: string
  data?: CommitDetail
}

interface RelatedCommit {
  commit_file_id: number
  commit_sha: string
  filename: string
  author: string
  committed_at: string
  similarity: number
}

interface ExplainResponse {
  summary: string
  reasoning: string[]
  confidence_score: number
}

function page() {
    const params = useParams()
    const [loading, setLoading] = useState(false)
    const [connectLoading, setConnectLoading] = useState(false)
    const [orgDetails, setOrgDetails] = useState<OrgDetails | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [notFound, setNotFound] = useState(false)
    
    // View state management
    const [currentView, setCurrentView] = useState<"repos" | "commits" | "commitDetails">("repos")
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
    const [commitDetails, setCommitDetails] = useState<CommitDetail | null>(null)
    const [commitDetailsLoading, setCommitDetailsLoading] = useState(false)
    
    // Related commits state
    const [relatedCommits, setRelatedCommits] = useState<RelatedCommit[]>([])
    const [relatedLoading, setRelatedLoading] = useState(false)
    
    // AI Explain state
    const [question, setQuestion] = useState("")
    const [aiResponse, setAiResponse] = useState<ExplainResponse | null>(null)
    const [aiLoading, setAiLoading] = useState(false)
    
    const fetchOrgDetails = async () => {
        const id = params.id as string
        setLoading(true)
        setError(null)
        setNotFound(false)
        
        try {
            const response = await api.get<OrgDetailsResponse>(
                `http://localhost:8000/v1/workspace/get_org_details?workspace_id=${id}`
            )
            
            if (response.data.message === "Success" && response.data.data) {
                setOrgDetails(response.data.data)
            } else if (response.data.message === "record not found") {
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
    }, [params.id])
    
    const handleConnectToOrg = async () => {
        const id = params.id as string
        setConnectLoading(true)
        
        try {
            const response = await api.get(`http://localhost:8000/v1/connect-org/get?workspace_id=${id}`)
            
            if (response.data?.url) {
                window.location.href = response.data.url
            }
        } catch (error) {
            console.error("Failed to connect to org:", error)
            setError("Failed to connect to organization")
        } finally {
            setConnectLoading(false)
        }
    }
    
    const fetchCommits = async (repoId: number, page: number = 1) => {
        setCommitsLoading(true)
        setError(null)
        
        try {
            const response = await api.get<CommitsResponse>(
                `http://localhost:8000/v1/workspace/get_repo_commits/${repoId}?limit=${pageSize}&page=${page}`
            )
            
            if (response.data.message === "Success" && response.data.data) {
                setCommits(response.data.data.commits)
                setCurrentPage(response.data.data.meta.page_number)
                setTotalPages(response.data.data.meta.total_pages)
                setTotalRecords(response.data.data.meta.total_records)
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to fetch commits")
        } finally {
            setCommitsLoading(false)
        }
    }
    
    const fetchCommitDetails = async (commitId: number) => {
        setCommitDetailsLoading(true)
        setError(null)
        
        try {
            const response = await api.get<CommitDetailsResponse>(
                `http://localhost:8000/v1/workspace/get_commit_details/${commitId}`
            )
            
            if (response.data.message === "Success" && response.data.data) {
                setCommitDetails(response.data.data)
                // Fetch related commits when commit details are loaded
                fetchRelatedCommits(commitId)
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to fetch commit details")
        } finally {
            setCommitDetailsLoading(false)
        }
    }
    
    const fetchRelatedCommits = async (commitFileId: number) => {
        setRelatedLoading(true)
        
        try {
            const response = await api.get<RelatedCommit[]>(
                `http://localhost:8000/v1/github-repository/commit-files/${commitFileId}/related`
            )
            
            if (Array.isArray(response.data)) {
                setRelatedCommits(response.data)
            }
        } catch (err: any) {
            console.error("Failed to fetch related commits:", err)
            // Don't show error to user, just fail silently for related commits
        } finally {
            setRelatedLoading(false)
        }
    }
    
    const handleAskAI = async () => {
        if (!question.trim() || !selectedCommit) return
        
        setAiLoading(true)
        setError(null)
        
        try {
            const response = await api.post<ExplainResponse>(
                `http://localhost:8000/v1/github-repository/commit-files/${selectedCommit.id}/explain`,
                { question: question.trim() }
            )
            
            setAiResponse(response.data)
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to get AI explanation")
        } finally {
            setAiLoading(false)
        }
    }
    
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
        setCommitDetails(null)
        setRelatedCommits([])
        setAiResponse(null)
        setQuestion("")
        setError(null)
    }
    
    const handlePageChange = (newPage: number) => {
        if (selectedRepo && newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage)
            fetchCommits(selectedRepo.id, newPage)
        }
    }
    
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }
    
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }
    
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'modified': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
            case 'added': return 'bg-green-500/10 text-green-500 border-green-500/20'
            case 'removed': return 'bg-red-500/10 text-red-500 border-red-500/20'
            default: return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
        }
    }
    
    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header with Navigation */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {currentView !== "repos" && (
                            <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={currentView === "commits" ? handleBackToRepos : handleBackToCommits}
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>
                        )}
                        <div>
                            <h1 className="text-3xl font-bold">
                                {currentView === "repos" && "Workspace Organization"}
                                {currentView === "commits" && selectedRepo?.name}
                                {currentView === "commitDetails" && "Commit Details"}
                            </h1>
                            {currentView === "commits" && selectedRepo && (
                                <p className="text-sm text-muted-foreground mt-1">
                                    {selectedRepo.full_name}
                                </p>
                            )}
                        </div>
                    </div>
                    {notFound && currentView === "repos" && (
                        <Button onClick={() => handleConnectToOrg()} disabled={connectLoading}>
                            {connectLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Connecting...
                                </>
                            ) : (
                                "Connect to org"
                            )}
                        </Button>
                    )}
                </div>

                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {notFound && !error && currentView === "repos" && (
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            No organization connected to this workspace. Click "Connect to org" to get started.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Repositories View */}
                {currentView === "repos" && orgDetails && (
                    <>
                        <Card>
                            <CardHeader>
                                <CardTitle>Organization Details</CardTitle>
                                <CardDescription>
                                    Installation ID: {orgDetails.installation_id}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Account Login</p>
                                        <p className="font-medium">{orgDetails.account_login || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Account Type</p>
                                        <p className="font-medium">{orgDetails.account_type || "N/A"}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Repositories ({orgDetails.repositories.length})</CardTitle>
                                <CardDescription>
                                    Click on a repository to view its commits
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {orgDetails.repositories.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-4">
                                        No repositories found
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {orgDetails.repositories.map((repo) => (
                                            <div
                                                key={repo.id}
                                                onClick={() => handleRepoClick(repo)}
                                                className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/50 transition cursor-pointer"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <GitBranch className="w-4 h-4 text-muted-foreground" />
                                                    <div>
                                                        <p className="font-medium">{repo.name}</p>
                                                        <p className="text-sm text-muted-foreground">{repo.full_name}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {repo.private ? (
                                                        <Lock className="w-4 h-4 text-yellow-500" />
                                                    ) : (
                                                        <Unlock className="w-4 h-4 text-green-500" />
                                                    )}
                                                    <span className="text-xs text-muted-foreground">
                                                        {repo.private ? "Private" : "Public"}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </>
                )}

                {/* Commits View */}
                {currentView === "commits" && (
                    <>
                        {commitsLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : (
                            <>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Commits ({totalRecords})</CardTitle>
                                        <CardDescription>
                                            Click on a commit to view detailed changes
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {commits.length === 0 ? (
                                            <p className="text-muted-foreground text-center py-4">
                                                No commits found
                                            </p>
                                        ) : (
                                            <div className="space-y-3">
                                                {commits.map((commit) => (
                                                    <div
                                                        key={commit.id}
                                                        onClick={() => handleCommitClick(commit)}
                                                        className="p-4 border border-border rounded-lg hover:bg-accent/50 transition cursor-pointer"
                                                    >
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-medium mb-1 break-words">
                                                                    {commit.message.split('\n')[0]}
                                                                </p>
                                                                {commit.message.split('\n').length > 1 && (
                                                                    <p className="text-sm text-muted-foreground mb-2">
                                                                        {commit.message.split('\n').slice(1).join(' ').substring(0, 100)}...
                                                                    </p>
                                                                )}
                                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                                    <span className="font-mono">{commit.sha.substring(0, 7)}</span>
                                                                    <span>{commit.author_email}</span>
                                                                    <span>{formatDate(commit.committed_at)}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-muted-foreground">
                                            Page {currentPage} of {totalPages}
                                        </p>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                            >
                                                <ChevronLeft className="w-4 h-4 mr-1" />
                                                Previous
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                            >
                                                Next
                                                <ChevronRight className="w-4 h-4 ml-1" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}

                {/* Commit Details View */}
                {currentView === "commitDetails" && selectedCommit && (
                    <>
                        {commitDetailsLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : commitDetails ? (
                            <>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="break-words">
                                            {selectedCommit.message.split('\n')[0]}
                                        </CardTitle>
                                        <CardDescription>
                                            <div className="space-y-1 mt-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                                                        {selectedCommit.sha.substring(0, 7)}
                                                    </span>
                                                    <span>{selectedCommit.author_email}</span>
                                                </div>
                                                <div className="text-xs">
                                                    {formatDate(selectedCommit.committed_at)}
                                                </div>
                                            </div>
                                        </CardDescription>
                                    </CardHeader>
                                    {selectedCommit.message.split('\n').length > 1 && (
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                {selectedCommit.message.split('\n').slice(1).join('\n').trim()}
                                            </p>
                                        </CardContent>
                                    )}
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FileText className="w-5 h-5" />
                                            File Changes
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="bg-muted/30 p-4 rounded-lg">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="w-4 h-4 text-muted-foreground" />
                                                    <span className="font-mono text-sm">{commitDetails.Filename}</span>
                                                </div>
                                                <Badge variant="outline" className={getStatusColor(commitDetails.Status)}>
                                                    {commitDetails.Status}
                                                </Badge>
                                            </div>
                                            
                                            <div className="flex items-center gap-4 text-sm mb-3">
                                                <div className="flex items-center gap-1 text-green-500">
                                                    <Plus className="w-3 h-3" />
                                                    <span>{commitDetails.Additions} additions</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-red-500">
                                                    <Minus className="w-3 h-3" />
                                                    <span>{commitDetails.Deletions} deletions</span>
                                                </div>
                                            </div>

                                            {commitDetails.Patch && (
                                                <div className="mt-4">
                                                    <p className="text-xs text-muted-foreground mb-2 font-semibold">Diff:</p>
                                                    <pre className="bg-background border border-border rounded p-3 text-xs overflow-x-auto font-mono">
                                                        {commitDetails.Patch.split('\n').map((line, idx) => (
                                                            <div 
                                                                key={idx}
                                                                className={
                                                                    line.startsWith('+') && !line.startsWith('+++') ? 'text-green-500' :
                                                                    line.startsWith('-') && !line.startsWith('---') ? 'text-red-500' :
                                                                    line.startsWith('@@') ? 'text-blue-500' :
                                                                    'text-muted-foreground'
                                                                }
                                                            >
                                                                {line}
                                                            </div>
                                                        ))}
                                                    </pre>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                                
                                {/* Related Commits Section */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Link2 className="w-5 h-5" />
                                            Related Commits
                                        </CardTitle>
                                        <CardDescription>
                                            Similar changes to this file based on content analysis
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {relatedLoading ? (
                                            <div className="flex items-center justify-center py-6">
                                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                            </div>
                                        ) : relatedCommits.length === 0 ? (
                                            <p className="text-muted-foreground text-center py-4 text-sm">
                                                No related commits found
                                            </p>
                                        ) : (
                                            <div className="space-y-3">
                                                {relatedCommits.map((related) => (
                                                    <div
                                                        key={related.commit_file_id}
                                                        className="p-3 border border-border rounded-lg hover:bg-accent/30 transition"
                                                    >
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                                                                        {related.commit_sha.substring(0, 7)}
                                                                    </span>
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {(related.similarity * 100).toFixed(1)}% similar
                                                                    </Badge>
                                                                </div>
                                                                <p className="text-sm font-medium mb-1">{related.filename}</p>
                                                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                                    <span>{related.author}</span>
                                                                    <span>{formatDate(related.committed_at)}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* AI Q&A Section */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Sparkles className="w-5 h-5" />
                                            Ask AI about this Commit
                                        </CardTitle>
                                        <CardDescription>
                                            Get AI-powered insights and explanations about this change
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex gap-2">
                                            <Textarea
                                                placeholder="Ask a question about this commit (e.g., 'Explain what changed and why')"
                                                value={question}
                                                onChange={(e) => setQuestion(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault()
                                                        handleAskAI()
                                                    }
                                                }}
                                                className="flex-1 min-h-[80px]"
                                                disabled={aiLoading}
                                            />
                                        </div>
                                        <Button 
                                            onClick={handleAskAI} 
                                            disabled={aiLoading || !question.trim()}
                                            className="w-full"
                                        >
                                            {aiLoading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Analyzing...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-4 h-4 mr-2" />
                                                    Ask AI
                                                </>
                                            )}
                                        </Button>

                                        {aiResponse && (
                                            <div className="mt-4 space-y-4 p-4 bg-muted/30 rounded-lg">
                                                <div>
                                                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                                        <Sparkles className="w-4 h-4 text-primary" />
                                                        AI Analysis
                                                    </h4>
                                                    <div className="prose prose-sm max-w-none dark:prose-invert">
                                                        <div className="text-sm whitespace-pre-wrap">{aiResponse.summary}</div>
                                                    </div>
                                                </div>
                                                
                                                {aiResponse.reasoning && aiResponse.reasoning.length > 0 && (
                                                    <div>
                                                        <h4 className="font-semibold text-sm mb-2">Reasoning:</h4>
                                                        <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                                                            {aiResponse.reasoning.map((reason, idx) => (
                                                                <li key={idx}>{reason}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </>
                        ) : null}
                    </>
                )}
            </div>
        </div>
    )
}

export default page
