"use client";
// Lightweight client-side cache of recent work and case IDs the user has interacted with.
// This is NOT the source of truth - the GenLayer contract is. The cache exists so the
// /explore page can show recent activity without an off-chain indexer.

const WORKS_KEY = "creator_court.recent_works";
const CASES_KEY = "creator_court.recent_cases";
const MAX = 50;

function read(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.slice(0, MAX) : [];
  } catch {
    return [];
  }
}

function write(key: string, ids: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(ids.slice(0, MAX)));
}

export function rememberWork(id: string) {
  const ids = read(WORKS_KEY).filter((x) => x !== id);
  ids.unshift(id);
  write(WORKS_KEY, ids);
}

export function rememberCase(id: string) {
  const ids = read(CASES_KEY).filter((x) => x !== id);
  ids.unshift(id);
  write(CASES_KEY, ids);
}

export function recentWorks(): string[] {
  return read(WORKS_KEY);
}

export function recentCases(): string[] {
  return read(CASES_KEY);
}
