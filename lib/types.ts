export type ContentType =
  | "x_thread"
  | "article"
  | "design"
  | "meme"
  | "video_script"
  | "landing_page"
  | "code_repo"
  | "pitch_deck"
  | "hackathon_project"
  | "other";

export type ClaimType =
  | "direct_copy"
  | "heavy_paraphrase"
  | "design_imitation"
  | "brand_identity_copy"
  | "idea_or_pitch_theft"
  | "code_plagiarism"
  | "thread_structure_copy"
  | "meme_template_theft"
  | "hackathon_cloning"
  | "other";

export type VerdictCode =
  | "CONFIRMED_ORIGINAL"
  | "LIKELY_COPIED"
  | "HEAVILY_INSPIRED"
  | "PROPERLY_CREDITED_REMIX"
  | "COMMON_IDEA"
  | "INSUFFICIENT_EVIDENCE"
  | "FALSE_CLAIM";

export type Confidence = "LOW" | "MEDIUM" | "HIGH";

export type CaseStatus =
  | "OPEN"
  | "RESPONSE_SUBMITTED"
  | "VERDICT_REQUESTED"
  | "RESOLVED"
  | "CANCELLED";

export interface OriginalWork {
  work_id: string;
  creator: string;
  creator_handle: string;
  title: string;
  content_type: ContentType | string;
  original_url: string;
  description: string;
  evidence_cid: string;
  content_hash: string;
  tags: string;
  status: string;
  created_at: number;
}

export interface CopyCase {
  case_id: string;
  claimant: string;
  original_work_id: string;
  suspected_url: string;
  accused_address: string;
  accused_handle: string;
  claim_type: string;
  claim_explanation: string;
  evidence_cid: string;
  comparison_notes: string;
  status: CaseStatus | string;
  responder?: string;
  verdict?: string;
  created_at: number;
}

export interface CaseResponse {
  case_id: string;
  responder: string;
  defence_statement: string;
  evidence_cid: string;
  response_links: string;
  submitted_at: number;
}

export interface Verdict {
  case_id: string;
  verdict: VerdictCode;
  confidence: Confidence;
  summary: string;
  reasons: string[];
  limitations: string[];
  reputation_impact: { claimant_delta: number; accused_delta: number };
  decided_at: number;
}

export interface CreatorProfile {
  address: string;
  handle: string;
  total_works: number;
  total_cases_opened: number;
  cases_won: number;
  cases_lost: number;
  false_claims: number;
  times_accused: number;
  confirmed_originals: number;
  reputation_score: number;
}

export interface EvidencePack {
  version: "1.0";
  original: { url: string; timestamp: string; screenshots: string[]; text_excerpt_hash: string };
  suspected_copy?: { url: string; timestamp: string; screenshots: string[]; text_excerpt_hash: string };
  claimant_statement?: string;
  defence_statement?: string;
  comparison_notes?: string[];
  supporting_files?: string[];
  content_type?: string;
  created_by: string;
  created_at: string;
}
