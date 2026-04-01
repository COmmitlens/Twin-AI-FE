export interface Repository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
}

export interface Workspace {
  id: number;
  name: string;
  redirect_url?: string;
  created_at: string;
  updated_at?: string;
  owner_id?: number;
  type?: string | boolean;
}

export interface OrgDetails {
  id: number;
  installation_id: number;
  account_login: string;
  account_type: string;
  workspace_id: number;
  repositories: Repository[];
}

export interface OrgDetailsResponse {
  message: string;
  data?: OrgDetails;
}

export interface Commit {
  id: number;
  sha: string;
  message: string;
  github_author_name: string;
  author_email: string;
  committed_at: string;
}

export interface CommitsResponse {
  message: string;
  data?: {
    commits: Commit[];
    meta: {
      page_number: number;
      page_size: number;
      total_pages: number;
      total_records: number;
    };
  };
}

export interface CommitDetail {
  ID: number;
  GithubCommitID: number;
  Filename: string;
  Status: string;
  Additions: number;
  Deletions: number;
  Patch: string;
  GithubRepoID: number;
  CreatedAt: string;
}

export interface CommitDetailsResponse {
  message: string;
  data?: CommitDetail[];
}

export interface RelatedCommit {
  commit_file_id: number;
  commit_sha: string;
  filename: string;
  author: string;
  committed_at: string;
  similarity: number;
}

export interface ExplainResponse {
  summary: string;
  reasoning: string[];
  confidence_score: number;
}

export interface WorkspaceMember {
  user_id: number;
  name: string;
  email: string;
  role: string;
}

export interface WorkspaceMembersResponse {
  message: string;
  data?: WorkspaceMember[];
}

export interface RemoveMemberRequest {
  workspace_id: number;
  user_id: number;
}

export interface RemoveMemberResponse {
  message: string;
  data?: any;
}

export interface InviteUserRequest {
  workspace_id: number;
  user_email: string;
  role: string;
}

export interface InviteUserResponse {
  message: string;
  data?: any;
}

export interface WorkspaceDetails {
  workspace_id: number;
  workspace: string;
  user_id: number;
  owner_email: string;
  owner_name: string;
}

export interface WorkspaceDetailsResponse {
  message: string;
  data?: WorkspaceDetails;
}

export interface AcceptInviteResponse {
  message: string;
  data?: any;
}

export interface QuerySource {
  fileName: string;
  commitSHA: string;
  repoName: string;
}

export interface QueryResponse {
  answer: string;
  action_items: string[];
  code_patch: string;
  impact: string;
  sources: QuerySource[];
}

export interface WorkspaceChatMessage {
  question: string;
  response: QueryResponse;
}

export interface UserData {
  id: number;
  email: string;
  name: string;
  language: string;
  username: string;
}

export interface UserDataResponse {
  message: string;
  data?: UserData;
}

export interface UpdateUserParam {
  user_id: number;
  name: string;
  role: string;
  language: string;
  username: string;
}
