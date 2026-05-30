import React, { useEffect, useRef } from "react";

interface StreamingTextProps {
  text: string;
  isStreaming: boolean;
}

const StreamingText: React.FC<StreamingTextProps> = ({ text, isStreaming }) => {
  const cursorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!isStreaming && cursorRef.current) {
      cursorRef.current.style.display = "none";
    }
  }, [isStreaming]);

  return (
    <span className="whitespace-pre-wrap leading-relaxed">
      {text}
      {isStreaming && (
        <span
          ref={cursorRef}
          className="inline-block w-0.5 h-4 bg-green-600 ml-0.5 animate-pulse align-middle"
          aria-hidden="true"
        />
      )}
    </span>
  );
};

export default StreamingText;
