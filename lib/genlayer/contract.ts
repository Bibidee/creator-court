"use client";
import { readContract, writeContract } from "./client";
import type { CopyCase, CaseResponse, CreatorProfile, OriginalWork, Verdict } from "../types";
import { safeJSON } from "../format";

function parse<T>(raw: unknown, fallback: T | null = null): T | null {
  if (!raw || typeof raw !== "string") return fallback;
  return safeJSON<T | null>(raw, fallback);
}

export async function registerOriginalWork(args: {
  work_id: string;
  title: string;
  content_type: string;
  original_url: string;
  description: string;
  evidence_cid: string;
  content_hash: string;
  creator_handle: string;
  tags_json: string;
}): Promise<string> {
  return writeContract("register_original_work", [
    args.work_id,
    args.title,
    args.content_type,
    args.original_url,
    args.description,
    args.evidence_cid,
    args.content_hash,
    args.creator_handle,
    args.tags_json,
  ]);
}

export async function openCopyCase(args: {
  case_id: string;
  original_work_id: string;
  suspected_url: string;
  accused_address: string;
  accused_handle: string;
  claim_type: string;
  claim_explanation: string;
  evidence_cid: string;
  comparison_notes: string;
}): Promise<string> {
  return writeContract("open_copy_case", [
    args.case_id,
    args.original_work_id,
    args.suspected_url,
    args.accused_address,
    args.accused_handle,
    args.claim_type,
    args.claim_explanation,
    args.evidence_cid,
    args.comparison_notes,
  ]);
}

export async function submitResponse(args: {
  case_id: string;
  defence_statement: string;
  evidence_cid: string;
  response_links_json: string;
}): Promise<string> {
  return writeContract("submit_response", [
    args.case_id,
    args.defence_statement,
    args.evidence_cid,
    args.response_links_json,
  ]);
}

export async function requestVerdict(case_id: string): Promise<string> {
  return writeContract("request_verdict", [case_id]);
}

export async function getWork(work_id: string): Promise<OriginalWork | null> {
  const raw = await readContract<string>("get_work", [work_id]);
  return parse<OriginalWork>(raw);
}

export async function getCase(case_id: string): Promise<CopyCase | null> {
  const raw = await readContract<string>("get_case", [case_id]);
  return parse<CopyCase>(raw);
}

export async function getResponse(case_id: string): Promise<CaseResponse | null> {
  const raw = await readContract<string>("get_response", [case_id]);
  return parse<CaseResponse>(raw);
}

export async function getVerdict(case_id: string): Promise<Verdict | null> {
  const raw = await readContract<string>("get_verdict", [case_id]);
  return parse<Verdict>(raw);
}

export async function getCreatorProfile(address: string): Promise<CreatorProfile | null> {
  const raw = await readContract<string>("get_creator_profile", [address]);
  return parse<CreatorProfile>(raw);
}

export async function getCreatorWorks(address: string): Promise<string[]> {
  const raw = await readContract<string>("get_creator_works", [address]);
  return safeJSON<string[]>(raw as string, []);
}

export async function getCreatorCases(address: string): Promise<string[]> {
  const raw = await readContract<string>("get_creator_cases", [address]);
  return safeJSON<string[]>(raw as string, []);
}
