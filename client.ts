import axios from "axios";

// In production (Docker) this is set via VITE_API_URL build arg.
// In dev, Vite proxies /api → localhost:8000, so we use relative paths.
const BASE_URL = import.meta.env.VITE_API_URL || "";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AskPayload {
  question: string;
  region: string;
  crop: string;
  season: string;
  user_id: string;
  session_id?: string;
}

export interface AskResponse {
  message_id: string;
  response: string;
  source_citation: string;
  model_version: string;
  session_id: string;
}

export interface FeedbackPayload {
  message_id: string;
  signal: "thumbs_up" | "thumbs_down";
}

export interface RankingPayload {
  prompt: string;
  winner_response: string;
  loser_response: string;
  expert_id: string;
}

export interface HistorySession {
  id: string;
  created_at: string;
  messages: Array<{
    id: string;
    role: "user" | "assistant";
    content: string;
    source_citation?: string;
    model_version?: string;
    created_at: string;
  }>;
}

// ─── API calls ────────────────────────────────────────────────────────────────

export const askQuestion = (payload: AskPayload) =>
  api.post<AskResponse>("/api/ask", payload);

export const submitFeedback = (
  message_id: string,
  signal: "thumbs_up" | "thumbs_down"
) =>
  api.post<{ success: boolean }>("/api/feedback", { message_id, signal });

export const submitRanking = (payload: RankingPayload) =>
  api.post<{ success: boolean; pairs_collected: number }>(
    "/api/expert/rank",
    payload
  );

// Fix: backend route is /api/user/history (not /api/auth/user/history)
export const getHistory = (user_id: string) =>
  api.get<HistorySession[]>("/api/user/history", { params: { user_id } });

export const getExpertQueue = () =>
  api.get<{
    pair_id: string;
    prompt: string;
    response_a: string;
    response_b: string;
  }>("/api/expert/queue");

export const register = (payload: {
  name: string;
  phone: string;
  region: string;
  preferred_crops: string[];
  role: "farmer" | "expert";
}) =>
  api.post<{ token: string; user_id: string }>("/api/auth/register", payload);

export const login = (phone: string) =>
  api.post<{ token: string; user_id: string }>("/api/auth/login", { phone });
