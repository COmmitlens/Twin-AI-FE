import api from "@/lib/axios";
import {
  OrgDetailsResponse,
  CommitsResponse,
  CommitDetailsResponse,
  RelatedCommit,
  ExplainResponse,
  WorkspaceDetailsResponse,
  AcceptInviteResponse,
  QueryResponse,
} from "@/lib/types/workspace";

export const workspaceAPI = {
  async getOrgDetails(workspaceId: string) {
    const response = await api.get<OrgDetailsResponse>(
      `/workspace/get_org_details?workspace_id=${workspaceId}`
    );
    return response.data;
  },

  async getRepoCommits(repoId: number, pageSize: number = 5, page: number = 1) {
    const response = await api.get<CommitsResponse>(
      `/workspace/get_repo_commits/${repoId}?limit=${pageSize}&page=${page}`
    );
    return response.data;
  },

  async getCommitDetails(commitId: number) {
    const response = await api.get<CommitDetailsResponse>(
      `/workspace/get_commit_details/${commitId}`
    );
    return response.data;
  },

  async getRelatedCommitsForFile(commitFileId: number) {
    const response = await api.get<RelatedCommit[]>(
      `/github-repository/commit-files/${commitFileId}/related`
    );
    return response.data;
  },

  async explainCommit(commitFileId: number, question: string) {
    const response = await api.post<ExplainResponse>(
      `/github-repository/commit-files/${commitFileId}/explain`,
      { question: question.trim() }
    );
    return response.data;
  },

  async connectToOrg(workspaceId: string) {
    const response = await api.get(
      `/connect-org/get?workspace_id=${workspaceId}`
    );
    return response.data;
  },

  async getWorkspaceMembers(workspaceId: string) {
    const response = await api.post(`/workspace/get_members`, {
      workspace_id: parseInt(workspaceId),
    });
    return response.data;
  },

  async removeMemberFromWorkspace(workspaceId: number, userId: number) {
    const response = await api.post(`/workspace/remove_member`, {
      workspace_id: workspaceId,
      user_id: userId,
    });
    return response.data;
  },

  async inviteUserToWorkspace(
    workspaceId: number,
    userEmail: string,
    role: string
  ) {
    const response = await api.post(`/workspace/add_user`, {
      workspace_id: workspaceId,
      user_email: userEmail,
      role: role,
    });
    return response.data;
  },

  async getWorkspaceDetails(workspaceId: number) {
    const response = await api.post<WorkspaceDetailsResponse>(
      `/workspace/details`,
      { workspace_id: workspaceId }
    );
    return response.data;
  },

  async acceptInvite(jwt: string, workspaceId: number) {
    const response = await api.post<AcceptInviteResponse>(
      `/workspace/accept-invite`,
      { workspace_id: workspaceId },
      { headers: { Authorization: `Bearer ${jwt}` } }
    );
    return response.data;
  },

  async queryWorkspace(
    workspaceId: string,
    question: string,
    author?: string,
    dateRange?: { start_date: string; end_date: string }
  ) {
    const body: Record<string, unknown> = { query: question.trim() };
    if (author) body.author = author;
    if (dateRange) body.date_range = dateRange;
    const response = await api.post<QueryResponse>(
      `/workspace/${workspaceId}/query`,
      body
    );
    return response.data;
  },

  async getAllWorkspaces() {
    const response = await api.post("/workspace/getall_workspace");
    return response.data;
  },

  async getSlackStatus(workspaceId: string) {
    const response = await api.get(`/slack/status?workspace_id=${workspaceId}`);
    return response.data as { connected: boolean; slack_team_name?: string };
  },
};
