import React from "react";
import { CheckCircle } from "lucide-react";

export default function VerifiedBadge({ text = "Verified" }) {
  return (
    <span className="flex items-center gap-1 text-xs font-bold text-blue-400 bg-blue-900/20 px-2 py-0.5 rounded-full select-none">
      <CheckCircle className="w-4 h-4 text-blue-400" />
      {text}
    </span>
  );
}
