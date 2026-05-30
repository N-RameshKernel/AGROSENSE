import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ChatBubble from "../components/ChatBubble";
import StreamingText from "../components/StreamingText";
import { useChat } from "../hooks/useChat";

interface LocationState {
  region?: string;
  crop?: string;
  problem?: string;
}

const inferSeason = (): string => {
  const month = new Date().getMonth(); // 0-indexed
  if (month >= 5 && month <= 9) return "kharif";
  if (month >= 10 || month <= 1) return "rabi";
  return "zaid";
};

const ChatPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state as LocationState) || {};
  const { region = "Guntur, Andhra Pradesh", crop = "Chilli", problem = "" } = state;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState(problem);
  const hasSentInitial = useRef(false);

  const userId = localStorage.getItem("user_id") ?? "demo-user";
  const season = inferSeason();
  const currentYear = new Date().getFullYear();

  const {
    messages,
    isLoading,
    isStreaming,
    streamedText,
    error,
    sendMessage,
    sendFeedback,
  } = useChat({ region, crop, season, userId });

  // Auto-scroll on new content
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamedText]);

  // Send initial problem once (if provided from landing page)
  useEffect(() => {
    if (problem && !hasSentInitial.current) {
      hasSentInitial.current = true;
      sendMessage(problem);
      setInput("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    sendMessage(trimmed);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <header className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="text-gray-400 hover:text-gray-600 text-sm"
            aria-label="Go back"
          >
            ←
          </button>
          <div>
            <div className="text-sm font-medium text-gray-800">
              {crop} · {region}
            </div>
            <div className="text-xs text-gray-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              {season.charAt(0).toUpperCase() + season.slice(1)} {currentYear}
            </div>
          </div>
        </div>
        <span className="text-xs bg-green-50 text-green-800 px-2.5 py-1 rounded-full font-medium">
          agrosense-v1.2
        </span>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-4">
        {messages.length === 0 && !isLoading && (
          <div className="text-center text-gray-400 text-sm mt-20">
            <div className="text-4xl mb-3">🌾</div>
            Ask me anything about your {crop.toLowerCase()}
          </div>
        )}

        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            role={msg.role}
            content={msg.content}
            source_citation={msg.source_citation}
            message_id={msg.id}
            model_version={msg.model_version}
            feedback={msg.feedback}
            onFeedback={sendFeedback}
          />
        ))}

        {/* Streaming assistant bubble */}
        {isStreaming && streamedText && (
          <div className="flex flex-col items-start max-w-[80%] self-start">
            <div className="px-4 py-3 rounded-2xl rounded-bl-sm text-sm bg-gray-50 border border-gray-200 text-gray-800">
              <StreamingText text={streamedText} isStreaming={isStreaming} />
            </div>
          </div>
        )}

        {/* Typing indicator */}
        {isLoading && !streamedText && (
          <div className="flex items-center gap-1.5 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl rounded-bl-sm w-fit">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        )}

        {error && (
          <div className="text-red-500 text-sm text-center py-2">{error}</div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-100 flex gap-2 items-end flex-shrink-0">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your crop..."
          rows={1}
          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent max-h-32"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className="w-10 h-10 bg-green-700 text-white rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40 hover:bg-green-800 transition-colors"
          aria-label="Send"
        >
          ↑
        </button>
      </div>
    </div>
  );
};

export default ChatPage;
