"use client";

import type { CorpusDataset, FlareResponse, InvestigationDTO, StatsResponse, ChatMessage } from "./types";

export async function fetchInvestigations(params: {
  q?: string;
  category?: string;
  hardware?: string;
  platform?: string;
  area?: string;
  status?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ items: InvestigationDTO[]; total: number; page: number; totalPages: number }> {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "" && v !== "All") sp.set(k, String(v));
  });
  const res = await fetch(`/api/investigations?${sp.toString()}`);
  if (!res.ok) throw new Error(`Failed to load investigations (${res.status})`);
  return res.json();
}

export async function fetchInvestigation(code: string): Promise<InvestigationDTO> {
  const res = await fetch(`/api/investigations/${encodeURIComponent(code)}`);
  if (!res.ok) throw new Error(`Failed to load investigation (${res.status})`);
  return res.json();
}

export async function fetchStats(): Promise<StatsResponse> {
  const res = await fetch("/api/stats");
  if (!res.ok) throw new Error(`Failed to load stats (${res.status})`);
  return res.json();
}

export async function fetchDatasets(): Promise<{ datasets: CorpusDataset[]; measurementNote: string }> {
  const res = await fetch("/api/datasets");
  if (!res.ok) throw new Error(`Failed to load datasets (${res.status})`);
  return res.json();
}

export async function askFlare(message: string, history: ChatMessage[]): Promise<FlareResponse> {
  const res = await fetch("/api/flare", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? `FLARE AI request failed (${res.status})`);
  return data as FlareResponse;
}

// ---------- local session context (explicitly client-side, honest about scope) ----------

const RECENT_KEY = "ofi.recent-investigations";
const ACTIVITY_KEY = "ofi.activity";

export function recordExploration(code: string, name: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    const list: { code: string; name: string; at: number }[] = raw ? JSON.parse(raw) : [];
    const next = [{ code, name, at: Date.now() }, ...list.filter((i) => i.code !== code)].slice(0, 6);
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));

    const aRaw = window.localStorage.getItem(ACTIVITY_KEY);
    const acts: string[] = aRaw ? JSON.parse(aRaw) : [];
    acts.unshift(`Viewed investigation ${code} — ${new Date().toLocaleTimeString()}`);
    window.localStorage.setItem(ACTIVITY_KEY, JSON.stringify(acts.slice(0, 10)));
  } catch {
    /* storage unavailable — ignore */
  }
}

export function getRecent(): { code: string; name: string; at: number }[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function getActivity(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(ACTIVITY_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function downloadCsv(filename: string, rows: (string | number | null)[][]) {
  const csv = rows
    .map((r) =>
      r
        .map((cell) => {
          const s = cell === null || cell === undefined ? "" : String(cell);
          return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(","),
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  triggerDownload(blob, filename);
}

export function downloadMarkdown(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  triggerDownload(blob, filename);
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
