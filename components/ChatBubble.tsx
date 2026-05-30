import React from "react";
import FeedbackButtons from "./FeedbackButtons";
import SourceBadge from "./SourceBadge";

interface ChatBubbleProps {
  role: "user" | "assistant";
  content: string;
  source_citation?: string;
  message_id?: string;
  model_version?: string;
  feedback?: "thumbs_up" | "thumbs_down";
  onFeedback?: (messageId: string, signal: "thumbs_up" | "thumbs_down") => void;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
  role,
  content,
  source_citation,
  message_id,
  model_version,
  feedback,
  onFeedback,
}) => {
  const isUser = role === "user";

  return (
    <div
      className={`flex flex-col ${isUser ? "items-end self-end" : "items-start self-start"} max-w-[80%]`}
    >
      <div
        className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-green-700 text-white rounded-br-sm"
            : "bg-gray-50 border border-gray-200 text-gray-800 rounded-bl-sm"
        }`}
      >
        {content}
      </div>

      {!isUser && (
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {source_citation && <SourceBadge source={source_citation} />}
          {model_version && (
            <span className="text-[10px] text-gray-400">{model_version}</span>
          )}
          {message_id && onFeedback && (
            <FeedbackButtons
              message_id={message_id}
              currentFeedback={feedback}
              onFeedback={onFeedback}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ChatBubble;
