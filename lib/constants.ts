import type { ClaimType, ContentType, VerdictCode } from "./types";

export const CONTENT_TYPES: { value: ContentType; label: string }[] = [
  { value: "x_thread", label: "X thread" },
  { value: "article", label: "Article" },
  { value: "design", label: "Design" },
  { value: "meme", label: "Meme" },
  { value: "video_script", label: "Video script" },
  { value: "landing_page", label: "Landing page" },
  { value: "code_repo", label: "Code repository" },
  { value: "pitch_deck", label: "Pitch deck" },
  { value: "hackathon_project", label: "Hackathon project" },
  { value: "other", label: "Other" },
];

export const CLAIM_TYPES: { value: ClaimType; label: string }[] = [
  { value: "direct_copy", label: "Direct copy" },
  { value: "heavy_paraphrase", label: "Heavy paraphrase" },
  { value: "design_imitation", label: "Design imitation" },
  { value: "brand_identity_copy", label: "Brand or identity copying" },
  { value: "idea_or_pitch_theft", label: "Idea or pitch theft" },
  { value: "code_plagiarism", label: "Code plagiarism" },
  { value: "thread_structure_copy", label: "Thread or content structure copy" },
  { value: "meme_template_theft", label: "Meme or template theft" },
  { value: "hackathon_cloning", label: "Hackathon or project cloning" },
  { value: "other", label: "Other" },
];

export const VERDICT_LABELS: Record<VerdictCode, string> = {
  CONFIRMED_ORIGINAL: "Confirmed original",
  LIKELY_COPIED: "Likely copied",
  HEAVILY_INSPIRED: "Heavily inspired",
  PROPERLY_CREDITED_REMIX: "Properly credited remix",
  COMMON_IDEA: "Common idea",
  INSUFFICIENT_EVIDENCE: "Insufficient evidence",
  FALSE_CLAIM: "False or weak claim",
};

export const VERDICT_TONE: Record<VerdictCode, "danger" | "warning" | "muted" | "success" | "cyan"> = {
  CONFIRMED_ORIGINAL: "success",
  LIKELY_COPIED: "danger",
  HEAVILY_INSPIRED: "warning",
  PROPERLY_CREDITED_REMIX: "cyan",
  COMMON_IDEA: "muted",
  INSUFFICIENT_EVIDENCE: "muted",
  FALSE_CLAIM: "danger",
};

export const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Active",
  OPEN: "Open",
  RESPONSE_SUBMITTED: "Response submitted",
  VERDICT_REQUESTED: "Verdict requested",
  RESOLVED: "Resolved",
  CANCELLED: "Cancelled",
};
