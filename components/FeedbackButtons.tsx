import React from "react";

interface FeedbackButtonsProps {
  message_id: string;
  currentFeedback?: "thumbs_up" | "thumbs_down";
  onFeedback: (messageId: string, signal: "thumbs_up" | "thumbs_down") => void;
}

const FeedbackButtons: React.FC<FeedbackButtonsProps> = ({
  message_id,
  currentFeedback,
  onFeedback,
}) => (
  <div className="flex gap-1">
    {(["thumbs_up", "thumbs_down"] as const).map((signal) => (
      <button
        key={signal}
        onClick={() => onFeedback(message_id, signal)}
        className={`text-xs px-2 py-0.5 rounded-full border transition-all ${
          currentFeedback === signal
            ? "bg-green-50 border-green-300 text-green-700"
            : "border-gray-200 text-gray-400 hover:border-green-400 hover:text-green-600"
        }`}
        aria-label={signal === "thumbs_up" ? "Mark helpful" : "Mark not helpful"}
      >
        {signal === "thumbs_up" ? "👍" : "👎"}
      </button>
    ))}
  </div>
);

export default FeedbackButtons;
