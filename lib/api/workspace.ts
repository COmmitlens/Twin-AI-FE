import api from "@/lib/axios";
import {
  OrgDetailsResponse,
  CommitsResponse,
  CommitDetailsResponse,
  RelatedCommit,
  ExplainResponse,
  WorkspaceDetailsResponse,
  AcceptInviteResponse,
} from "@/lib/types/workspace";

const BASE_URL = "http://localhost:8000/v1";

export const workspaceAPI = {
  async getOrgDetails(workspaceId: string) {
    const response = await api.get<OrgDetailsResponse>(
      `${BASE_URL}/workspace/get_org_details?workspace_id=${workspaceId}`
    );
    return response.data;
  },

  async getRepoCommits(repoId: number, pageSize: number = 5, page: number = 1) {
    const response = await api.get<CommitsResponse>(
      `${BASE_URL}/workspace/get_repo_commits/${repoId}?limit=${pageSize}&page=${page}`
    );
    return response.data;
  },

  async getCommitDetails(commitId: number) {
    const response = await api.get<CommitDetailsResponse>(
      `${BASE_URL}/workspace/get_commit_details/${commitId}`
    );
    return response.data;
  },

  async getRelatedCommits(commitFileId: number) {
    const response = await api.get<RelatedCommit[]>(
      `${BASE_URL}/github-repository/commit-files/${commitFileId}/related`
    );
    return response.data;
  },

  async explainCommit(commitId: number, question: string) {
    const response = await api.post<ExplainResponse>(
      `${BASE_URL}/github-repository/commit-files/${commitId}/explain`,
      { question: question.trim() }
    );
    return response.data;
  },

  async connectToOrg(workspaceId: string) {
    const response = await api.get(
      `${BASE_URL}/connect-org/get?workspace_id=${workspaceId}`
    );
    return response.data;
  },

  async getWorkspaceMembers(workspaceId: string) {
    const response = await api.post(`${BASE_URL}/workspace/get_members`, {
      workspace_id: parseInt(workspaceId),
    });
    return response.data;
  },

  async removeMemberFromWorkspace(workspaceId: number, userId: number) {
    const response = await api.post(`${BASE_URL}/workspace/remove_member`, {
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
    const response = await api.post(`${BASE_URL}/workspace/add_user`, {
      workspace_id: workspaceId,
      user_email: userEmail,
      role: role,
    });
    return response.data;
  },

  async getWorkspaceDetails(workspaceId: number) {
    const response = await api.post<WorkspaceDetailsResponse>(
      `${BASE_URL}/workspace/details`,
      { workspace_id: workspaceId }
    );
    return response.data;
  },

  async acceptInvite(jwt: string, workspaceId: number) {
    const response = await api.post<AcceptInviteResponse>(
      `${BASE_URL}/workspace/accept-invite`,
      { workspace_id: workspaceId },
      { headers: { Authorization: `Bearer ${jwt}` } }
    );
    return response.data;
  },
};
