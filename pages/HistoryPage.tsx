import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getHistory, type HistorySession } from "../api/client";

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  const today = new Date();

  // Compare calendar dates, not timestamps
  const isoDate = d.toDateString();
  const todayDate = today.toDateString();

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (isoDate === todayDate) return "Today";
  if (isoDate === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long" });
};

const groupByDate = (
  sessions: HistorySession[]
): Record<string, HistorySession[]> => {
  const groups: Record<string, HistorySession[]> = {};
  for (const s of sessions) {
    const key = formatDate(s.created_at);
    if (!groups[key]) groups[key] = [];
    groups[key].push(s);
  }
  return groups;
};

const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<HistorySession[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("user_id") ?? "demo-user";

  useEffect(() => {
    getHistory(userId)
      .then(({ data }) => setSessions(data))
      .catch(() => {
        // Fallback demo data when backend is not running
        setSessions([
          {
            id: "s1",
            created_at: new Date().toISOString(),
            messages: [
              {
                id: "m1",
                role: "user",
                content: "My chilli leaves are turning yellow and curling",
                created_at: new Date().toISOString(),
              },
              {
                id: "m2",
                role: "assistant",
                content:
                  "Leaf curl in chilli is most commonly caused by broad mites (Polyphagotarsonemus latus). Apply abamectin 1.8% EC at 0.5 ml/L. Cover leaf undersides. Consult your nearest KVK if symptoms persist.",
                source_citation: "ANGRAU 2024",
                model_version: "agrosense-v1.2",
                created_at: new Date().toISOString(),
              },
            ],
          },
          {
            id: "s2",
            created_at: new Date(Date.now() - 86_400_000).toISOString(),
            messages: [
              {
                id: "m3",
                role: "user",
                content: "Paddy blast disease management",
                created_at: new Date(Date.now() - 86_400_000).toISOString(),
              },
              {
                id: "m4",
                role: "assistant",
                content:
                  "Blast disease in paddy is caused by Magnaporthe oryzae. Spray tricyclazole 75WP at 0.6 g/L at tillering stage. Repeat after 10 days if needed. Avoid excess nitrogen. Consult your nearest KVK if symptoms persist.",
                source_citation: "ICAR-DRR 2024",
                model_version: "agrosense-v1.2",
                created_at: new Date(Date.now() - 86_400_000).toISOString(),
              },
            ],
          },
        ]);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const grouped = groupByDate(sessions);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-gray-800">
            Conversation History
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Your past advisory sessions
          </p>
        </div>
        <button
          onClick={() => navigate("/")}
          className="text-sm text-green-700 hover:text-green-900"
        >
          + New chat
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-5 py-4">
        {loading ? (
          <div className="text-center text-gray-400 py-12">
            Loading history…
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="text-center text-gray-400 py-12">No history yet</div>
        ) : (
          Object.entries(grouped).map(([date, dateSessions]) => (
            <div key={date}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest py-2 mt-4 first:mt-0">
                {date}
              </p>
              {dateSessions.map((session) => {
                const firstUserMsg = session.messages.find(
                  (m) => m.role === "user"
                );
                const firstAiMsg = session.messages.find(
                  (m) => m.role === "assistant"
                );
                const isOpen = expanded === session.id;

                return (
                  <div
                    key={session.id}
                    className="border border-gray-100 rounded-xl mb-2 overflow-hidden hover:border-gray-200 transition-colors"
                  >
                    <button
                      onClick={() =>
                        setExpanded(isOpen ? null : session.id)
                      }
                      className="w-full px-4 py-3 text-left"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-800 truncate pr-4">
                          {firstUserMsg?.content ?? "Untitled"}
                        </p>
                        <span className="text-gray-300 flex-shrink-0">
                          {isOpen ? "↑" : "↓"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 truncate">
                        {(firstAiMsg?.content ?? "").slice(0, 80)}…
                      </p>
                    </button>

                    {isOpen && (
                      <div className="border-t border-gray-100 px-4 py-3 flex flex-col gap-3 bg-gray-50">
                        {session.messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${
                              msg.role === "user"
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[85%] text-xs px-3 py-2 rounded-xl leading-relaxed ${
                                msg.role === "user"
                                  ? "bg-green-700 text-white"
                                  : "bg-white border border-gray-200 text-gray-700"
                              }`}
                            >
                              {msg.content}
                              {msg.source_citation && (
                                <div className="mt-1 text-[10px] text-amber-600 font-medium">
                                  📖 {msg.source_citation}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))
        )}
      </main>
    </div>
  );
};

export default HistoryPage;
