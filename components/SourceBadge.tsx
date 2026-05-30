import React from "react";

interface SourceBadgeProps {
  source: string;
}

const SourceBadge: React.FC<SourceBadgeProps> = ({ source }) => (
  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/50 font-medium">
    📖 {source}
  </span>
);

export default SourceBadge;
