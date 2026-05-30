import { useCallback, useState } from "react";
import { askQuestion, submitFeedback, type AskResponse } from "../api/client";
import { useStream } from "./useStream";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  source_citation?: string;
  model_version?: string;
  feedback?: "thumbs_up" | "thumbs_down";
}

interface UseChatOptions {
  region: string;
  crop: string;
  season: string;
  userId: string;
}

export const useChat = ({ region, crop, season, userId }: UseChatOptions) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { streamedText, isStreaming, startStream, clearStream } =
    useStream(sessionId);

  const sendMessage = useCallback(
    async (question: string) => {
      if (!question.trim() || isLoading) return;
      setError(null);

      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: question,
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      try {
        const { data }: { data: AskResponse } = await askQuestion({
          question,
          region,
          crop,
          season,
          user_id: userId,
          session_id: sessionId ?? undefined,
        });

        const newSessionId = sessionId ?? data.session_id;
        if (!sessionId) setSessionId(newSessionId);

        // Kick off the streaming preview (best-effort — backend may not stream)
        startStream({ question, region, crop, season });

        const assistantMsg: Message = {
          id: data.message_id,
          role: "assistant",
          content: data.response,
          source_citation: data.source_citation,
          model_version: data.model_version,
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err) {
        setError("Failed to get a response. Please try again.");
        console.error(err);
      } finally {
        setIsLoading(false);
        clearStream();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [region, crop, season, userId, sessionId, isLoading]
  );

  const sendFeedback = useCallback(
    async (messageId: string, signal: "thumbs_up" | "thumbs_down") => {
      // Optimistic update
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, feedback: signal } : m))
      );
      try {
        await submitFeedback(messageId, signal);
      } catch (err) {
        console.error("Failed to submit feedback:", err);
      }
    },
    []
  );

  return {
    messages,
    sessionId,
    isLoading,
    isStreaming,
    streamedText,
    error,
    sendMessage,
    sendFeedback,
  };
};
