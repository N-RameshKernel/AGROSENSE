import { useCallback, useEffect, useRef, useState } from "react";

// Derive WebSocket URL from the current page origin (works in dev + Docker)
const wsBase = (): string => {
  const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
  if (apiUrl) {
    return apiUrl.replace(/^http/, "ws");
  }
  // Relative — use current host
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  return `${protocol}://${window.location.host}`;
};

export const useStream = (sessionId: string | null) => {
  const [streamedText, setStreamedText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Disconnect old socket when sessionId changes
  useEffect(() => {
    return () => {
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [sessionId]);

  /**
   * Open a WebSocket to /api/stream/{sessionId} and stream tokens.
   * The backend expects a JSON message: { question, region, crop, season }
   */
  const startStream = useCallback(
    (payload: {
      question: string;
      region: string;
      crop: string;
      season: string;
    }) => {
      if (!sessionId) return;

      setStreamedText("");
      setIsStreaming(true);

      const url = `${wsBase()}/api/stream/${sessionId}`;
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(JSON.stringify(payload));
      };

      ws.onmessage = (evt) => {
        try {
          const data = JSON.parse(evt.data as string) as {
            token?: string;
            done?: boolean;
            error?: string;
          };
          if (data.done) {
            setIsStreaming(false);
            ws.close();
          } else if (data.token) {
            setStreamedText((prev) => prev + data.token);
          }
        } catch {
          // ignore malformed frames
        }
      };

      ws.onerror = () => {
        setIsStreaming(false);
      };

      ws.onclose = () => {
        setIsStreaming(false);
      };
    },
    [sessionId]
  );

  const clearStream = useCallback(() => {
    wsRef.current?.close();
    wsRef.current = null;
    setStreamedText("");
    setIsStreaming(false);
  }, []);

  return { streamedText, isStreaming, startStream, clearStream };
};
