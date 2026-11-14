"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BrainCircuit, Copy, ExternalLink, Flame, RotateCcw, Send, ThumbsDown, ThumbsUp } from "lucide-react";
import { askFlare } from "@/lib/ofi/api";
import type { ChatMessage, FlareResponse } from "@/lib/ofi/types";
import { ErrorState, ViewHeader } from "../shared";
import { cn } from "@/lib/utils";

const SUGGESTED = [
  "Why do flames turn spherical in microgravity?",
  "What did the SAFFIRE experiments test about fire spread in spacecraft?",
  "Explain the SoFIE facility and the experiments it supports.",
  "What are cool flames, and why are they hard to detect?",
  "How does droplet combustion differ between Earth and orbit?",
  "Walk me through how NASA studies fire safety for space missions.",
];

function Markdownish({ text }: { text: string }) {
  // lightweight markdown: bold, italics, [CITATIONS], bullets
  const html = text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong class='text-[#F4F8FF]'>$1</strong>")
    .replace(/_(.+?)_/g, "<em>$1</em>")
    .replace(/\[(FLEX-2|FLEX|SAFFIRE-[IV]+|BASS-II|BASS|BRE|CFI-G|E-FIELD|SoFIE|SAME|LSP)\]/g,
      "<span class='ofi-mono rounded border border-[rgba(66,217,255,0.35)] bg-[rgba(66,217,255,0.08)] px-1.5 py-0.5 text-[10px] text-[#42D9FF]'>$1</span>")
    .replace(/\n- (.+)/g, "<br/>• $1")
    .replace(/\n/g, "<br/>");
  return <div className="leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function FlareAIView() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sources, setSources] = useState<FlareResponse["sources"]>([]);
  const [followUps, setFollowUps] = useState<string[]>([]);
  const [mode, setMode] = useState<FlareResponse["mode"] | null>(null);
  const [disclaimer, setDisclaimer] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  const send = async (text: string) => {
    const message = text.trim();
    if (!message || pending) return;
    const history = messages;
    setMessages((m) => [...m, { role: "user", content: message }]);
    setInput("");
    setPending(true);
    setError(null);
    try {
      const res = await askFlare(message, history);
      setMessages((m) => [...m, { role: "assistant", content: res.answer }]);
      setSources(res.sources);
      setFollowUps(res.followUps ?? []);
      setMode(res.mode);
      setDisclaimer(res.disclaimer);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPending(false);
    }
  };

  const copyLast = async () => {
    const last = [...messages].reverse().find((m) => m.role === "assistant");
    if (!last) return;
    await navigator.clipboard.writeText(last.content.replace(/\*\*/g, "").replace(/\[(.+?)\]/g, "[$1]"));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const reset = () => {
    setMessages([]);
    setSources([]);
    setFollowUps([]);
    setMode(null);
    setDisclaimer("");
    setError(null);
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col">
      <ViewHeader
        eyebrow="Workspace · FLARE AI"
        title="FLARE AI — Fire & Laboratory Analysis Research Engine"
        description="Your personal tutor for NASA microgravity combustion. FLARE explains each experiment like a lesson — what it studied, why it flew in microgravity, what it found and why it matters — retrieving verified NASA records before answering, citing every source, and separating record facts from scientific background."
      />

      <div className="ofi-glass flex min-h-[560px] flex-col overflow-hidden rounded-2xl">
        {/* header strip */}
        <div className="flex items-center justify-between border-b border-[rgba(140,190,230,0.12)] px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <span className="rounded-lg border border-[#FF7438]/30 bg-[#FF7438]/10 p-2">
              <BrainCircuit className="h-4 w-4 text-[#FF7438]" />
            </span>
            <div>
              <p className="text-sm font-medium text-[#F4F8FF]">Dr. FLARE — your combustion experiment tutor</p>
              <p className="ofi-mono text-[9px] tracking-wider text-[#91A4BD] uppercase">
                {mode === "retrieval" ? "retrieval mode · offline-safe" : "retrieval-grounded · tutor mode"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={copyLast}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[rgba(140,190,230,0.18)] px-3 py-1.5 text-[11px] text-[#91A4BD] transition-colors hover:text-[#F4F8FF] focus-visible:outline-none"
              >
                <Copy className="h-3 w-3" />{copied ? "Copied" : "Copy response"}
              </button>
            )}
            <button
              onClick={reset}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[rgba(140,190,230,0.18)] px-3 py-1.5 text-[11px] text-[#91A4BD] transition-colors hover:text-[#F4F8FF] focus-visible:outline-none"
            >
              <RotateCcw className="h-3 w-3" /> New conversation
            </button>
          </div>
        </div>

        {/* conversation area */}
        <div ref={scrollRef} className="ofi-scroll min-h-[380px] flex-1 space-y-5 overflow-y-auto px-5 py-6">
          {messages.length === 0 && !pending && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <span className="absolute inset-0 -z-10 ofi-glow-flame rounded-full" />
                <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-[#FF7438]/30 bg-[rgba(255,116,56,0.08)]">
                  <Flame className="h-7 w-7 text-[#FF7438]" />
                </span>
              </motion.div>
              <h3 className="ofi-display mt-6 text-xl text-[#F4F8FF]">Learn an experiment with your AI tutor.</h3>
              <p className="mt-2 max-w-md text-xs leading-relaxed text-[#91A4BD]">
                Dr. FLARE explains NASA's microgravity experiments, papers and programs — retrieving matching verified
                records first, citing every source inline, and clearly labelling general scientific background. If the
                corpus cannot support an answer, it will say so.
              </p>
              <div className="mt-8 grid w-full max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2">
                {SUGGESTED.map((s, i) => (
                  <motion.button
                    key={s}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.06 }}
                    onClick={() => send(s)}
                    className="rounded-xl border border-[rgba(140,190,230,0.14)] bg-[rgba(9,20,38,0.38)] px-4 py-3 text-left text-xs text-[#91A4BD] transition-colors hover:border-[#42D9FF]/45 hover:text-[#F4F8FF] focus-visible:ring-2 focus-visible:ring-[#42D9FF] focus-visible:outline-none"
                  >
                    {s}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
              >
                {m.role === "user" ? (
                  <div className="max-w-[85%] rounded-xl rounded-br-sm border border-[rgba(140,190,230,0.14)] bg-[rgba(57,123,255,0.12)] px-4 py-3 text-sm text-[#F4F8FF]">
                    {m.content}
                  </div>
                ) : (
                  <div className="max-w-[92%] space-y-3">
                    <div className="rounded-xl rounded-bl-sm border border-[rgba(140,190,230,0.14)] bg-[rgba(9,20,38,0.5)] px-4 py-3.5 text-sm text-[#91A4BD] backdrop-blur-md">
                      <Markdownish text={m.content} />
                    </div>
                    <div className="flex items-center gap-1.5 opacity-60">
                      <button aria-label="Helpful" className="rounded p-1.5 text-[#5B708C] hover:text-[#42D9FF] focus-visible:outline-none"><ThumbsUp className="h-3 w-3" /></button>
                      <button aria-label="Not helpful" className="rounded p-1.5 text-[#5B708C] hover:text-[#FF7438] focus-visible:outline-none"><ThumbsDown className="h-3 w-3" /></button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {pending && (
            <div className="flex items-center gap-3 text-xs text-[#91A4BD]">
              <span className="relative flex h-4 w-4">
                <span className="absolute h-full w-full animate-ping rounded-full bg-[#FF7438]/40" />
                <span className="h-4 w-4 rounded-full border-2 border-[#FF7438] border-t-transparent [animation:spin_0.8s_linear_infinite]" />
              </span>
              Retrieving verified corpus records and composing a grounded answer…
            </div>
          )}

          {error && <ErrorState message={error} />}

          {/* follow-up questions suggested by the tutor */}
          {followUps.length > 0 && !pending && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap gap-2 pt-1"
            >
              <span className="ofi-mono w-full text-[9px] tracking-[0.2em] text-[#5B708C] uppercase">
                Continue the discussion
              </span>
              {followUps.map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setFollowUps([]);
                    send(q);
                  }}
                  className="rounded-full border border-[rgba(232,178,90,0.3)] bg-[rgba(232,178,90,0.06)] px-3.5 py-1.5 text-[11px] text-[#E2B25F] transition-colors hover:border-[#E2B25F]/60 hover:text-[#F4F8FF] focus-visible:ring-2 focus-visible:ring-[#E2B25F] focus-visible:outline-none"
                >
                  {q}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* citation cards */}
        {sources.length > 0 && (
          <div className="border-t border-[rgba(140,190,230,0.12)] px-5 py-4">
            <p className="ofi-mono mb-2.5 text-[10px] tracking-[0.2em] text-[#91A4BD] uppercase">Evidence retrieved for this answer</p>
            <div className="flex flex-wrap gap-2">
              {sources.map((s) => {
                const url = s.sourceUrl ?? s.ntrsUrl ?? (s.doi ? `https://doi.org/${s.doi}` : null);
                return (
                  <a
                    key={s.code}
                    href={url ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "group flex items-center gap-2 rounded-lg border border-[rgba(66,217,255,0.25)] bg-[rgba(66,217,255,0.06)] px-3 py-2 transition-colors hover:border-[#42D9FF]/60",
                      !url && "pointer-events-none opacity-70",
                    )}
                  >
                    <span className="ofi-mono text-[10px] text-[#42D9FF]">[{s.code}]</span>
                    <span className="max-w-[180px] truncate text-[11px] text-[#91A4BD] group-hover:text-[#F4F8FF]">{s.name}</span>
                    {url && <ExternalLink className="h-3 w-3 text-[#5B708C]" />}
                  </a>
                );
              })}
            </div>
            {disclaimer && <p className="mt-3 text-[10px] leading-relaxed text-[#5B708C] italic">{disclaimer}</p>}
          </div>
        )}

        {/* composer */}
        <form
          onSubmit={(e) => { e.preventDefault(); send(input); }}
          className="flex items-center gap-3 border-t border-[rgba(140,190,230,0.12)] bg-[rgba(9,20,38,0.42)] p-4"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a research question about the NASA corpus…"
            aria-label="Ask FLARE AI"
            className="min-w-0 flex-1 rounded-lg border border-[rgba(140,190,230,0.18)] bg-[rgba(5,9,20,0.45)] px-4 py-2.5 text-sm text-[#F4F8FF] placeholder:text-[#5B708C] focus:border-[#42D9FF]/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#42D9FF]"
          />
          <button
            type="submit"
            disabled={pending || input.trim().length < 2}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-gradient-to-r from-[#FF7438] to-[#FF9A38] px-5 py-2.5 text-xs font-semibold text-[#050914] transition-all hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100 focus-visible:ring-2 focus-visible:ring-[#FF7438] focus-visible:outline-none"
          >
            <Send className="h-3.5 w-3.5" />
            {pending ? "Thinking…" : "Ask FLARE"}
          </button>
        </form>
      </div>
    </div>
  );
}
