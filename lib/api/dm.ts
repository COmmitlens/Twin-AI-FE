import api from "@/lib/axios";
import {
  StartConversationRequest,
  StartConversationResponse,
  ListConversationsResponse,
  SendMessageRequest,
  SendMessageResponse,
  ListMessagesResponse,
  MarkReadRequest,
  MarkReadResponse,
} from "@/lib/types/workspace";

export const dmAPI = {
  /**
   * Open or fetch an existing DM thread between the caller and a recipient
   * within a workspace.
   */
  async startConversation(
    payload: StartConversationRequest
  ): Promise<StartConversationResponse> {
    const response = await api.post<StartConversationResponse>(
      "/dm/start",
      payload
    );
    return response.data;
  },

  /**
   * List all DM conversations the caller is part of within a workspace.
   */
  async listConversations(
    workspaceId: number
  ): Promise<ListConversationsResponse> {
    const response = await api.get<ListConversationsResponse>(
      `/dm/conversations?workspace_id=${workspaceId}`
    );
    return response.data;
  },

  /**
   * REST fallback for sending a message (prefer WebSocket for real-time).
   */
  async sendMessage(payload: SendMessageRequest): Promise<SendMessageResponse> {
    const response = await api.post<SendMessageResponse>("/dm/send", payload);
    return response.data;
  },

  /**
   * Fetch paginated message history for a conversation.
   */
  async listMessages(
    conversationId: number,
    limit: number = 50,
    offset: number = 0
  ): Promise<ListMessagesResponse> {
    const response = await api.get<ListMessagesResponse>(
      `/dm/messages?conversation_id=${conversationId}&limit=${limit}&offset=${offset}`
    );
    return response.data;
  },

  /**
   * Mark all messages in a conversation as read.
   */
  async markRead(payload: MarkReadRequest): Promise<MarkReadResponse> {
    const response = await api.post<MarkReadResponse>("/dm/read", payload);
    return response.data;
  },
};
