"use client";

import type { ActivityType } from "@/lib/activities";

export default function ActivityTypeBadge({ type }: { type: ActivityType }) {
  const cls =
    type === "CALL"
      ? "text-bg-primary"
      : type === "WHATSAPP"
      ? "text-bg-success"
      : type === "EMAIL"
      ? "text-bg-info"
      : type === "MEETING"
      ? "text-bg-warning"
      : "text-bg-secondary";

  return <span className={`badge ${cls}`}>{type}</span>;
}
