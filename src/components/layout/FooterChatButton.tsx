"use client";
import { openFirstAid } from "@/lib/firstAid";

export default function FooterChatButton({ className = "" }: { className?: string }) {
  return (
    <button type="button" onClick={() => openFirstAid()} className={className}>
      AI Chat Satwarta
    </button>
  );
}
