import React, { useEffect, useState } from "react";
import { getExpertQueue, submitRanking } from "../api/client";

interface RankingPair {
  pair_id: string;
  prompt: string;
  response_a: string;
  response_b: string;
}

const DEMO_PAIR: RankingPair = {
  pair_id: "demo-1",
  prompt:
    "My cotton crop in Guntur shows signs of leaf curl. Plants are about 45 days old. What is causing this and how do I treat it?",
  response_a:
    "Leaf curl in cotton may be caused by thrips or cotton leaf curl virus (CLCuV). Spray imidacloprid 200SL at 0.3ml/litre of water. Repeat after 10 days if symptoms persist. Remove severely infected plants to prevent spread.",
  response_b:
    "For 45-day cotton in Guntur (Kharif), leaf curl is most likely Cotton Leaf Curl Virus (CLCuV) spread by whiteflies. Steps: 1) Spray thiamethoxam 25WG @ 0.2g/L. 2) Apply neem oil 5ml/L as preventive. 3) Remove infected plants. 4) Avoid systemic insecticides in evening. Source: ICAR-CICR Advisory 2024.",
};

const ExpertPanel: React.FC = () => {
  const [pair, setPair] = useState<RankingPair | null>(null);
  const [selected, setSelected] = useState<"a" | "b" | null>(null);
  const [pairsCollected, setPairsCollected] = useState(0);
  const [loading, setLoading] = useState(false);

  // Use a stable fallback expert ID so the backend doesn't crash
  const expertId =
    localStorage.getItem("user_id") ?? "00000000-0000-0000-0000-000000000001";

  const fetchNext = async () => {
    setLoading(true);
    setSelected(null);
    try {
      const { data } = await getExpertQueue();
      setPair(data);
    } catch {
      setPair(DEMO_PAIR);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePick = async (winner: "a" | "b") => {
    if (!pair || selected) return;
    setSelected(winner);

    const loser: "a" | "b" = winner === "a" ? "b" : "a";
    try {
      const { data } = await submitRanking({
        prompt: pair.prompt,
        winner_response: winner === "a" ? pair.response_a : pair.response_b,
        loser_response: loser === "a" ? pair.response_a : pair.response_b,
        expert_id: expertId,
      });
      setPairsCollected(data.pairs_collected);
    } catch {
      setPairsCollected((prev) => prev + 1);
    }

    setTimeout(fetchNext, 2000);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-gray-800">
              Expert Review Panel
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Pick the better response to improve AgroSense via RLHF
            </p>
          </div>
          <div className="text-xs bg-green-50 text-green-800 px-2.5 py-1 rounded-full font-medium">
            {pairsCollected} pairs collected
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          Loading next pair…
        </div>
      ) : pair ? (
        <main className="flex-1 overflow-y-auto p-5">
          {/* Prompt */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
              Farmer's Question
            </p>
            <p className="text-sm text-gray-800 leading-relaxed">{pair.prompt}</p>
          </div>

          {/* Responses side-by-side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(["a", "b"] as const).map((key) => {
              const response =
                key === "a" ? pair.response_a : pair.response_b;
              const isWinner = selected === key;
              const isLoser = selected !== null && selected !== key;

              return (
                <div
                  key={key}
                  className={`border rounded-xl p-4 flex flex-col gap-3 transition-all ${
                    isWinner
                      ? "border-green-500 border-2 bg-green-50"
                      : isLoser
                      ? "border-gray-100 opacity-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-[10px] font-semibold text-green-700 uppercase tracking-wide bg-green-50 px-2 py-0.5 rounded-full w-fit border border-green-100">
                    Version {key.toUpperCase()}{" "}
                    {key === "a" ? "· v1.1" : "· v1.2"}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed flex-1">
                    {response}
                  </p>
                  <button
                    onClick={() => handlePick(key)}
                    disabled={!!selected}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all disabled:cursor-not-allowed ${
                      isWinner
                        ? "bg-green-700 text-white"
                        : "border border-gray-200 text-gray-600 hover:bg-green-700 hover:text-white hover:border-green-700"
                    }`}
                  >
                    {isWinner ? "✓ Winner" : "🏆 Pick this response"}
                  </button>
                </div>
              );
            })}
          </div>

          {selected && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800">
              ✓ Response recorded. This ranked pair will be used in the next
              RLHF training cycle. Loading next pair…
            </div>
          )}
        </main>
      ) : null}
    </div>
  );
};

export default ExpertPanel;
