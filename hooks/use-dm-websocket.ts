"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { DMWSEvent, DMMessage } from "@/lib/types/workspace";

const WS_BASE_URL = (() => {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
  // Convert http(s) → ws(s) for the WebSocket connection
  return apiUrl.replace(/^http/, "ws");
})();

type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

interface UseDMWebSocketOptions {
  conversationId: number | null;
  onNewMessage?: (message: DMMessage) => void;
  onMarkRead?: (event: DMWSEvent) => void;
}

interface UseDMWebSocketReturn {
  status: ConnectionStatus;
  sendMessage: (content: string) => void;
  disconnect: () => void;
}

/**
 * Manages a WebSocket connection for real-time DM messaging.
 *
 * The browser automatically sends cookies (including the HTTP-only Bearer
 * cookie) during the WebSocket upgrade handshake, so no explicit token
 * passing is required when the backend reads auth from cookies.
 *
 * If the backend requires ?token=<jwt>, retrieve the token from wherever
 * your auth context exposes it and append it to the URL.
 */
export function useDMWebSocket({
  conversationId,
  onNewMessage,
  onMarkRead,
}: UseDMWebSocketOptions): UseDMWebSocketReturn {
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setStatus("disconnected");
  }, []);

  useEffect(() => {
    if (!conversationId) {
      disconnect();
      return;
    }

    // Clean up any existing connection before opening a new one
    disconnect();

    const url = `${WS_BASE_URL}/dm/ws?conversation_id=${conversationId}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;
    setStatus("connecting");

    ws.onopen = () => {
      setStatus("connected");
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        const data: DMWSEvent = JSON.parse(event.data as string);
        if (data.event === "new_message") {
          onNewMessage?.(data.message);
        } else if (data.event === "mark_read") {
          onMarkRead?.(data);
        }
      } catch {
        console.error("[DM WS] Failed to parse message:", event.data);
      }
    };

    ws.onerror = () => {
      setStatus("error");
    };

    ws.onclose = () => {
      setStatus("disconnected");
      wsRef.current = null;
    };

    return () => {
      ws.close();
    };
    // Intentionally not including `disconnect` in deps — it's stable via useCallback
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  const sendMessage = useCallback(
    (content: string) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        console.warn("[DM WS] Cannot send — socket not open");
        return;
      }
      const payload = {
        conversation_id: conversationId,
        content,
      };
      wsRef.current.send(JSON.stringify(payload));
    },
    [conversationId]
  );

  return { status, sendMessage, disconnect };
}
