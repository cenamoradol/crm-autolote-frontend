"use client";

import type { LeadStatus } from "@/lib/leads";

export default function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const cls =
    status === "NEW"
      ? "text-bg-secondary"
      : status === "IN_PROGRESS"
      ? "text-bg-primary"
      : status === "WON"
      ? "text-bg-success"
      : "text-bg-danger";

  return <span className={`badge ${cls}`}>{status}</span>;
}
