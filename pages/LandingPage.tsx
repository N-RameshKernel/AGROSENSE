import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import RegionSelector from "../components/RegionSelector";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [problem, setProblem] = useState("");

  const handleSelect = (state: string, district: string, crop: string) => {
    const region = `${district}, ${state}`;
    navigate("/chat", { state: { region, crop, problem } });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌿</span>
          <span className="font-semibold text-green-800 text-lg">AgroSense</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/expert")}
            className="text-sm text-gray-500 hover:text-green-700 transition-colors"
          >
            Expert panel
          </button>
          <button
            onClick={() => navigate("/history")}
            className="text-sm text-gray-500 hover:text-green-700 transition-colors"
          >
            My history →
          </button>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <p className="text-xs font-semibold tracking-widest text-green-700 uppercase text-center mb-3">
            AI-Powered Crop Advisory
          </p>
          <h1 className="text-4xl font-serif font-bold text-center text-gray-900 leading-tight mb-3">
            Ask anything about{" "}
            <span className="text-green-700 italic">your crop</span>
          </h1>
          <p className="text-gray-500 text-center mb-8 text-sm leading-relaxed">
            Region-aware, season-specific advice backed by ICAR data. Trusted
            by farmers across India.
          </p>

          {/* Form card */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
            <RegionSelector onSelect={handleSelect} />

            <div className="mt-3">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Describe your problem (optional)
              </label>
              <textarea
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                placeholder="e.g. My chilli leaves are turning yellow and curling at the edges…"
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 mt-8">
            {[
              { num: "146M+", label: "Farmers" },
              { num: "500+", label: "Q&A Benchmarks" },
              { num: "91%", label: "Accuracy" },
            ].map(({ num, label }) => (
              <div key={label} className="text-center">
                <div className="text-xl font-bold text-green-800">{num}</div>
                <div className="text-xs text-gray-400 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
