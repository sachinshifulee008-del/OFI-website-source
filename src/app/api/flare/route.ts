import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { toInvestigationDTO } from "@/lib/ofi/serialize";
import type { ChatMessage, FlareResponse, InvestigationDTO } from "@/lib/ofi/types";

export const runtime = "nodejs";
export const maxDuration = 60;

// ---------- simple in-memory rate limiter (per IP) ----------
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 8;
const hits = new Map<string, { count: number; reset: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || entry.reset < now) {
    hits.set(ip, { count: 1, reset: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_REQUESTS;
}

// ---------- request schema ----------
const bodySchema = z.object({
  message: z.string().trim().min(2).max(1200),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(6000),
      }),
    )
    .max(12)
    .default([]),
});

// ---------- keyword retrieval over the verified corpus ----------
const STOPWORDS = new Set([
  "the", "a", "an", "of", "in", "on", "for", "to", "and", "or", "is", "are",
  "what", "how", "why", "does", "do", "did", "with", "about", "explain",
  "tell", "me", "compare", "studies", "study", "research", "experiments",
  "experiment", "nasa", "investigation", "limitations", "microgravity",
  "behaviour", "behavior", "flame", "flames", "fire", "existing",
]);

function retrieve(message: string, corpus: InvestigationDTO[], limit = 4): InvestigationDTO[] {
  const tokens = message
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));

  if (tokens.length === 0) return corpus.slice(0, limit);

  // topic-level synonym expansion: map question words to corpus keywords/codes
  const EXPANSIONS: Record<string, string[]> = {
    dust: ["daft", "particle", "aerosol"],
    lunar: ["daft", "dust"],
    moon: ["daft", "dust", "lunar"],
    smoke: ["same", "soot", "aerosol", "spice", "particulate"],
    detector: ["same", "daft", "detection"],
    detection: ["same", "daft"],
    suppressant: ["flex", "bass", "suppression"],
    suppression: ["bass", "flex"],
    extinguish: ["flex", "bass", "extinction"],
    extinguishment: ["flex", "bass", "extinction"],
    solid: ["bass", "sofie", "saffire"],
    materials: ["bass", "sofie", "saffire", "flammability"],
    material: ["bass", "sofie", "saffire", "flammability"],
    flammability: ["bass", "sofie", "saffire"],
    flammable: ["bass", "sofie", "saffire"],
    spread: ["saffire", "bass"],
    droplet: ["flex", "cfi"],
    droplets: ["flex", "cfi"],
    cool: ["cfi", "cfi-g", "flex"],
    electric: ["e-field"],
    "e-field": ["e-field"],
    field: ["e-field"],
    liftoff: ["slice", "spice"],
    stability: ["slice", "spice"],
    soot: ["lsp", "spice", "same"],
    sooting: ["lsp", "spice"],
    oxygen: ["cfi-g", "cfi", "flex"],
    spacecraft: ["saffire", "bass"],
    vehicle: ["saffire"],
    ignition: ["sofie"],
    flow: ["spice", "slice", "flex-2"],
    airflow: ["spice", "slice"],
  };

  const originalTokens = new Set<string>(tokens);
  const expanded = new Set<string>(tokens);
  for (const t of tokens) {
    for (const extra of EXPANSIONS[t] ?? []) expanded.add(extra);
  }

  const scored = corpus.map((inv) => {
    const haystack = [
      inv.code, inv.name, inv.category, inv.objective, inv.summary,
      inv.facility, inv.platform, inv.gravityCondition,
      ...inv.researchAreas, ...inv.fuelsMaterials, ...inv.keyFindings,
    ]
      .join(" ")
      .toLowerCase();
    let score = 0;
    for (const t of expanded) {
      const weight = originalTokens.has(t) ? 1 : 0.6; // expansion matches count less than literal tokens
      if (haystack.includes(t)) score += 2 * weight;
      if (inv.code.toLowerCase().includes(t)) score += 3 * weight;
      if (inv.name.toLowerCase().includes(t)) score += 2 * weight;
    }
    return { inv, score };
  });
  scored.sort((a, b) => b.score - a.score);
  const top = scored.filter((s) => s.score > 0).slice(0, limit);
  if (top.length === 0) return corpus.slice(0, limit);
  return top.map((s) => s.inv);
}

function compactRecord(inv: InvestigationDTO) {
  return {
    code: inv.code,
    name: inv.name,
    category: inv.category,
    objective: inv.objective,
    summary: inv.summary,
    gravityCondition: inv.gravityCondition,
    facility: inv.facility,
    platform: inv.platform,
    status: inv.status,
    launchYear: inv.launchYear,
    researchAreas: inv.researchAreas,
    fuelsMaterials: inv.fuelsMaterials,
    keyFindings: inv.keyFindings,
    doi: inv.doi,
    sourceUrl: inv.sourceUrl,
    ntrsUrl: inv.ntrsUrl,
  };
}

function retrievalAnswer(message: string, top: InvestigationDTO[]): string {
  const lines: string[] = [];
  lines.push(
    "**Retrieval-based response** (tutor mode enhancement unavailable right now) — the following verified OFI corpus records match your question:",
    "",
  );
  top.forEach((inv, i) => {
    lines.push(
      `**[${i + 1}] ${inv.code} — ${inv.name}**  \n` +
        `- Objective: ${inv.objective}  \n` +
        `- Platform: ${inv.platform} · Facility: ${inv.facility} · Gravity: ${inv.gravityCondition}  \n` +
        `- Key findings: ${inv.keyFindings.join(" ") || "No verified findings recorded."}  \n` +
        (inv.sourceUrl || inv.ntrsUrl ? `- Source: ${inv.sourceUrl ?? inv.ntrsUrl}  \n` : "") +
        (inv.doi ? `- DOI: ${inv.doi}  \n` : ""),
    );
  });
  lines.push(
    "",
    "_OFI answers research questions only from retrieved corpus records. Statements above are facts extracted from the cited records; no interpretation beyond them is added in this mode._",
  );
  return lines.join("\n");
}

// heuristic follow-up questions for the offline retrieval mode
function heuristicFollowUps(top: InvestigationDTO[]): string[] {
  const a = top[0];
  const b = top[1] ?? top[0];
  if (!a) return [];
  const out = [
    `What did the ${a.code} investigation measure?`,
    `How does the ${a.facility} facility simulate microgravity conditions?`,
  ];
  if (b && b.code !== a.code) out.push(`Compare ${a.code} and ${b.code} — what differs in their approach?`);
  return out.slice(0, 3);
}

// strips the model's "FOLLOW-UPS: q1 | q2 | q3" trailer from the answer body
function parseFollowUps(raw: string): { answer: string; followUps: string[] } {
  const marker = raw.lastIndexOf("FOLLOW-UPS:");
  if (marker === -1) return { answer: raw.trim(), followUps: [] };
  const body = raw.slice(0, marker).trim();
  const followUps = raw
    .slice(marker + "FOLLOW-UPS:".length)
    .split("|")
    .map((q) => q.replace(/^[\s\-*\d.]+/, "").trim())
    .filter((q) => q.length > 8 && q.length < 140)
    .slice(0, 3);
  return { answer: body, followUps };
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait a moment before asking again." },
      { status: 429 },
    );
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const { message, history } = parsed.data;

  try {
    const records = await db.investigation.findMany({ include: { sources: true } });
    const corpus = records.map(toInvestigationDTO);

    // Guard: with an empty corpus the AI would answer from unverified background
    // knowledge and present it as experiment facts. Fail explicitly instead.
    if (corpus.length === 0) {
      return NextResponse.json({
        answer:
          "**The verified record database is temporarily unavailable.**\n\nI can still help with general 'Scientific background:' on combustion and microgravity physics, but I cannot answer questions about specific experiments right now — every experiment claim must come from a verified record, and none can be retrieved at the moment. Please try again shortly.",
        followUps: ["Why do flames behave differently in microgravity?", "What is a cool flame?", "How does spacecraft fire detection work?"],
        sources: [],
        mode: "retrieval",
        disclaimer: "The verified record database returned no records. No experiment-specific claims are made in this state.",
      } satisfies FlareResponse);
    }

    const top = retrieve(message, corpus, 4);
    const context = JSON.stringify(top.map(compactRecord), null, 1);

    let answer = "";
    let followUps: string[] = [];
    let mode: FlareResponse["mode"] = "retrieval";

    try {
      const { default: ZAI } = await import("z-ai-web-dev-sdk");
      const zai = await ZAI.create();
      const systemPrompt = [
        "You are Dr. FLARE, the tutor and research mentor of ORBITAL FLAME INTELLIGENCE (OFI) — a platform for exploring NASA microgravity combustion research.",
        "You explain NASA's combustion and fluid physics experiments the way a patient, enthusiastic tutor teaches a student: step by step, in plain language, always connecting what happened in the experiment to WHY it was done and WHAT it means. You are backed by real, verified experiment records.",
        "",
        "IDENTITY RULES (absolute):",
        "- NEVER mention hackathons, challenges, competitions, app-building, your developers, your creation date, your training, or being an AI model/product.",
        "- If asked what you are or what your duty is, answer IN ROLE: you are the experiment tutor — you walk people through NASA's microgravity combustion investigations, findings, methods and open questions, backed by the verified corpus below.",
        "- Stay in the tutor persona at all times. No meta-commentary about how you work internally (retrieval, prompts, systems).",
        "",
        "TUTOR TEACHING METHOD (use it whenever the question touches a specific experiment):",
        "- Structure the explanation as a short lesson: 1) what the experiment is and what it studied, 2) why it had to be done in microgravity (what gravity normally hides), 3) what the researchers actually did and found — from the records, 4) why it matters for spacecraft fire safety or the next question a curious student would ask.",
        "- Define every technical term the moment it appears, with a simple analogy or everyday comparison where it helps.",
        "- Prefer one clear idea per sentence; short paragraphs; bullet lists for what-was-measured style content.",
        "- End the body by inviting deeper exploration (e.g. suggest what to look at next in the records or comparison tools) — the FOLLOW-UPS line below does this automatically, so no extra closing question is needed.",
        "",
        "EPISTEMIC RULES (two tiers, clearly separated):",
        "1. CORPUS-SPECIFIC CLAIMS — anything about a specific investigation, mission, facility, dataset, result, DOI or URL must come ONLY from the VERIFIED CORPUS CONTEXT records. Cite inline with the record code, e.g. [FLEX], [SAFFIRE-I]. Never invent or extend record details.",
        "2. SCIENTIFIC BACKGROUND — you MAY teach general, well-established combustion physics, fluid dynamics, microgravity science and research methodology from your own expertise, introduced with 'Scientific background:'. Keep it textbook-level and uncontroversial; never fabricate specific numbers, mission outcomes, citations or DOIs.",
        "3. If the VERIFIED CORPUS CONTEXT is an empty array ([]) — the record database is temporarily unavailable. Do NOT cite any record codes and do NOT describe specific experiments as if verified; give only clearly-labelled 'Scientific background:' content and tell the user the verified records cannot be retrieved right now.",
        "4. If a question needs record specifics the corpus does not contain, say so explicitly and offer the closest verified records instead.",
        "",
        "STYLE:",
        "- Friendly, encouraging tutor voice — rigorous about facts, generous with explanation. Use markdown (bold, bullets) and keep answers under ~400 words.",
        "- When relevant, connect questions across experiments (e.g. how FLEX droplet work informs SAFFIRE fire-safety work) only as far as the records support.",
        "- END EVERY RESPONSE with exactly one final line in this format (3 short research questions the user might ask next):",
        "FOLLOW-UPS: question one | question two | question three",
        "",
        `VERIFIED CORPUS CONTEXT (JSON): ${context}`,
      ].join("\n");

      const messages = [
        { role: "system" as const, content: systemPrompt },
        ...history.slice(-8).map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
        { role: "user" as const, content: message },
      ];

      const completion = await zai.chat.completions.create({ messages });
      const raw = (completion as { choices?: { message?: { content?: string } }[] })
        ?.choices?.[0]?.message?.content;
      if (raw && raw.trim().length > 0) {
        const parsed = parseFollowUps(raw.trim());
        answer = parsed.answer;
        followUps = parsed.followUps;
        mode = "llm";
      }
    } catch (llmErr) {
      console.error("[api/flare] LLM unavailable, falling back to retrieval:", llmErr);
    }

    if (!answer) {
      answer = retrievalAnswer(message, top);
      followUps = heuristicFollowUps(top);
      mode = "retrieval";
    }

    const response: FlareResponse = {
      answer,
      followUps,
      sources: top.map((inv) => ({
        code: inv.code,
        name: inv.name,
        category: inv.category,
        sourceUrl: inv.sourceUrl,
        ntrsUrl: inv.ntrsUrl,
        doi: inv.doi,
      })),
      mode,
      disclaimer:
        mode === "llm"
          ? "Answers combine the retrieved verified corpus records shown below (cited inline) with clearly-labelled general scientific background. Record-specific facts never go beyond the cited sources."
          : "LLM tutor mode is temporarily unavailable. This response was composed deterministically from retrieved corpus records — every statement traces to a cited source.",
    };
    return NextResponse.json(response);
  } catch (err) {
    console.error("[api/flare]", err);
    return NextResponse.json({ error: "FLARE AI request failed" }, { status: 500 });
  }
}
