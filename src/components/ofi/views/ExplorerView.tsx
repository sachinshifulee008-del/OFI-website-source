"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ExternalLink, FileText, Link2, Search, X } from "lucide-react";
import { fetchInvestigation, fetchInvestigations, recordExploration } from "@/lib/ofi/api";
import type { InvestigationDTO } from "@/lib/ofi/types";
import { CardSkeleton, EmptyState, ErrorState, ScoreBar, ScoreRing, StatusBadge, ViewHeader } from "../shared";
import { cn } from "@/lib/utils";

const CATEGORIES = ["All", "Droplet Combustion", "Spacecraft Fire Safety", "Solid Fuel", "Gaseous Flames", "Soot & Smoke"];
const STATUSES = ["All", "Completed", "Active", "Preliminary Results"];
const SORTS = [
  { value: "relevance", label: "Relevance score" },
  { value: "name", label: "Name (A–Z)" },
  { value: "year", label: "Launch year (newest)" },
  { value: "sources", label: "Source count" },
];

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-[11px] transition-all focus-visible:ring-2 focus-visible:ring-[#42D9FF] focus-visible:outline-none",
        active
          ? "border-[#42D9FF]/60 bg-[rgba(66,217,255,0.12)] text-[#42D9FF]"
          : "border-[rgba(140,190,230,0.16)] text-[#91A4BD] hover:border-[#42D9FF]/35 hover:text-[#F4F8FF]",
      )}
    >
      {children}
    </button>
  );
}

function DetailPanel({ code, onClose }: { code: string; onClose: () => void }) {
  const [inv, setInv] = useState<InvestigationDTO | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetchInvestigation(code)
      .then((d) => {
        setInv(d);
        recordExploration(d.code, d.name);
      })
      .catch((e) => setErr(e.message));
  }, [code]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-stretch justify-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-label={`Investigation detail: ${code}`}
    >
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={onClose} />
      <motion.aside
        className="ofi-scroll ofi-panel relative flex h-full w-full max-w-2xl flex-col overflow-y-auto border-l border-[rgba(140,190,230,0.16)]"
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 60, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[rgba(140,190,230,0.12)] bg-[rgba(7,15,30,0.5)] px-6 py-4 backdrop-blur-xl">
          <p className="ofi-mono text-[10px] tracking-[0.2em] text-[#91A4BD] uppercase">Investigation detail</p>
          <button
            onClick={onClose}
            aria-label="Close detail panel"
            className="rounded-lg border border-[rgba(140,190,230,0.16)] p-2 text-[#91A4BD] hover:text-[#F4F8FF] focus-visible:ring-2 focus-visible:ring-[#42D9FF] focus-visible:outline-none"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-7 p-6">
          {err && <ErrorState message={err} />}
          {!inv && !err && (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          )}
          {inv && (
            <>
              <header className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="ofi-mono rounded-md border border-[rgba(66,217,255,0.3)] bg-[rgba(66,217,255,0.08)] px-2.5 py-1 text-[11px] text-[#42D9FF]">
                    {inv.code}
                  </span>
                  <StatusBadge status={inv.status} />
                </div>
                <h2 className="ofi-display text-2xl text-[#F4F8FF]">{inv.name}</h2>
                <p className="text-sm leading-relaxed text-[#91A4BD]">{inv.objective}</p>
              </header>

              {/* metadata grid */}
              <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
                {[
                  ["Platform", inv.platform],
                  ["Facility", inv.facility],
                  ["Gravity", inv.gravityCondition],
                  ["Launch year", inv.launchYear !== null ? String(inv.launchYear) : "Not dated in source"],
                  ["Delivery", inv.delivery ?? "—"],
                  ["Category", inv.category],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-lg border border-[rgba(140,190,230,0.12)] bg-[rgba(9,20,38,0.32)] p-3">
                    <p className="ofi-mono text-[9px] tracking-wider text-[#5B708C] uppercase">{k}</p>
                    <p className="mt-1.5 leading-snug text-[#F4F8FF]">{v}</p>
                  </div>
                ))}
              </div>

              <section>
                <p className="ofi-mono text-[10px] tracking-[0.2em] text-[#91A4BD] uppercase">Summary</p>
                <p className="mt-2 text-sm leading-relaxed text-[#91A4BD]">{inv.summary}</p>
              </section>

              <section className="grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="ofi-mono text-[10px] tracking-[0.2em] text-[#91A4BD] uppercase">Research areas</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {inv.researchAreas.map((a) => (
                      <span key={a} className="rounded-md border border-[rgba(140,190,230,0.16)] px-2 py-1 text-[11px] text-[#91A4BD]">{a}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="ofi-mono text-[10px] tracking-[0.2em] text-[#91A4BD] uppercase">Fuels &amp; materials</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {inv.fuelsMaterials.map((a) => (
                      <span key={a} className="rounded-md border border-[#FF7438]/25 bg-[rgba(255,116,56,0.06)] px-2 py-1 text-[11px] text-[#FFB088]">{a}</span>
                    ))}
                  </div>
                </div>
              </section>

              <section>
                <p className="ofi-mono text-[10px] tracking-[0.2em] text-[#91A4BD] uppercase">Key findings (as stated in sources)</p>
                <ul className="mt-2.5 space-y-2.5">
                  {inv.keyFindings.map((f) => (
                    <li key={f} className="flex gap-2.5 text-sm leading-relaxed text-[#91A4BD]">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#42D9FF]" />
                      {f}
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <p className="ofi-mono text-[10px] tracking-[0.2em] text-[#91A4BD] uppercase">Measured variables</p>
                <div className="mt-2.5 overflow-hidden rounded-xl border border-[rgba(140,190,230,0.12)]">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[rgba(16,34,56,0.45)] text-[#5B708C]">
                        <th className="px-4 py-2.5 font-medium">Variable</th>
                        <th className="px-4 py-2.5 font-medium">Unit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(140,190,230,0.08)]">
                      {inv.variables.map((v) => (
                        <tr key={v.name} className="text-[#91A4BD]">
                          <td className="px-4 py-2.5 text-[#F4F8FF]">{v.name}</td>
                          <td className="ofi-mono px-4 py-2.5">{v.unit ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* score */}
              <section>
                <p className="ofi-mono text-[10px] tracking-[0.2em] text-[#91A4BD] uppercase">OFI relevance score</p>
                <div className="mt-3 flex items-center gap-6 rounded-xl border border-[rgba(140,190,230,0.12)] bg-[rgba(9,20,38,0.32)] p-5">
                  <ScoreRing value={inv.score.overall} size={64} />
                  <div className="flex-1 space-y-2.5">
                    <ScoreBar label="Data quality" value={inv.score.dataQuality} />
                    <ScoreBar label="Scientific relevance" value={inv.score.scientificRelevance} />
                    <ScoreBar label="Completeness" value={inv.score.completeness} />
                    <ScoreBar label="Metadata quality" value={inv.score.metadataQuality} />
                  </div>
                </div>
                <p className="mt-2 text-[10px] leading-relaxed text-[#5B708C]">
                  OFI-defined metadata heuristic — not a NASA-approved ranking and not a fire-risk prediction.
                </p>
              </section>

              {/* sources */}
              <section>
                <p className="ofi-mono text-[10px] tracking-[0.2em] text-[#91A4BD] uppercase">Verified sources</p>
                <ul className="mt-3 space-y-3">
                  {inv.sources.map((s) => (
                    <li key={s.id} className="rounded-xl border border-[rgba(140,190,230,0.12)] bg-[rgba(9,20,38,0.32)] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm leading-snug font-medium text-[#F4F8FF]">{s.title}</p>
                          <p className="mt-1 text-[11px] text-[#91A4BD]">
                            {s.authors}{s.year ? ` · ${s.year}` : ""} · {s.venue}
                          </p>
                          {s.doi && <p className="ofi-mono mt-1 text-[10px] text-[#42D9FF]">DOI: {s.doi}</p>}
                        </div>
                        {s.url && (
                          <a
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Open source: ${s.title}`}
                            className="shrink-0 rounded-lg border border-[rgba(140,190,230,0.2)] p-2 text-[#42D9FF] hover:border-[#42D9FF]/50 focus-visible:outline-none"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex flex-wrap gap-2">
                  {inv.sourceUrl && (
                    <a href={inv.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-[rgba(140,190,230,0.2)] px-3.5 py-2 text-[11px] text-[#F4F8FF] hover:border-[#42D9FF]/50 focus-visible:outline-none">
                      <Link2 className="h-3.5 w-3.5 text-[#42D9FF]" /> NASA mission page
                    </a>
                  )}
                  {inv.ntrsUrl && (
                    <a href={inv.ntrsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-[rgba(140,190,230,0.2)] px-3.5 py-2 text-[11px] text-[#F4F8FF] hover:border-[#42D9FF]/50 focus-visible:outline-none">
                      <FileText className="h-3.5 w-3.5 text-[#42D9FF]" /> NASA NTRS report
                    </a>
                  )}
                  {inv.doi && (
                    <a href={`https://doi.org/${inv.doi}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-[rgba(140,190,230,0.2)] px-3.5 py-2 text-[11px] text-[#F4F8FF] hover:border-[#42D9FF]/50 focus-visible:outline-none">
                      DOI {inv.doi}
                    </a>
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </motion.aside>
    </motion.div>
  );
}

export default function ExplorerView({ initialQuery, initialCode }: { initialQuery?: string; initialCode?: string }) {
  const [query, setQuery] = useState(initialQuery ?? "");
  const [category, setCategory] = useState("All");
  const [hardware, setHardware] = useState("All");
  const [status, setStatus] = useState("All");
  const [sort, setSort] = useState("relevance");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ items: InvestigationDTO[]; total: number; page: number; totalPages: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<string | null>(initialCode ?? null);

  useEffect(() => {
    if (initialQuery) setQuery(initialQuery);
  }, [initialQuery]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchInvestigations({ q: query, category, hardware, status, sort, page });
      setData(res);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [query, category, hardware, status, sort, page]);

  useEffect(() => {
    const t = setTimeout(load, query ? 350 : 0);
    return () => clearTimeout(t);
  }, [load, query]);

  return (
    <div className="mx-auto max-w-7xl">
      <ViewHeader
        eyebrow="Workspace · NASA Research Explorer"
        title="Research Explorer"
        description="An advanced catalogue of verified NASA microgravity combustion investigations. Search, filter, sort and open rich metadata views — every record links to its public NASA or peer-reviewed sources."
      />

      {/* Controls */}
      <div className="ofi-card mb-6 space-y-4 p-5">
        <div className="flex items-center gap-3 rounded-lg border border-[rgba(140,190,230,0.16)] bg-[rgba(9,20,38,0.38)] px-4">
          <Search className="h-4 w-4 shrink-0 text-[#91A4BD]" aria-hidden />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            type="search"
            aria-label="Search investigations"
            placeholder="Search by name, objective, facility, fuel…"
            className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-[#F4F8FF] placeholder:text-[#5B708C] focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((c) => (
            <Chip key={c} active={category === c} onClick={() => { setCategory(c); setPage(1); }}>{c}</Chip>
          ))}
          <span className="mx-1 hidden h-5 w-px bg-[rgba(140,190,230,0.16)] sm:block" />
          {STATUSES.map((s) => (
            <Chip key={s} active={status === s} onClick={() => { setStatus(s); setPage(1); }}>{s === "All" ? "All statuses" : s}</Chip>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-[rgba(140,190,230,0.08)] pt-3">
          <p className="ofi-mono text-[10px] tracking-wider text-[#91A4BD] uppercase">
            {loading ? "Loading…" : `${data?.total ?? 0} records · page ${data?.page ?? 1} of ${data?.totalPages ?? 1}`}
          </p>
          <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-[11px] text-[#91A4BD]">
            Hardware
            <select
              value={hardware}
              onChange={(e) => { setHardware(e.target.value); setPage(1); }}
              aria-label="Filter by experimental hardware"
              className="ofi-input-glass rounded-lg border border-[rgba(140,190,230,0.2)] px-2.5 py-1.5 text-[11px] text-[#F4F8FF] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#42D9FF]"
            >
              <option value="All">All hardware</option>
              <option value="Combustion Integrated Rack">Combustion Integrated Rack (CIR)</option>
              <option value="Microgravity Science Glovebox">Microgravity Science Glovebox (MSG)</option>
              <option value="SAFFIRE flow duct">SAFFIRE flow duct (Cygnus)</option>
              <option value="Shuttle-era combustion module">Shuttle-era combustion module</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-[11px] text-[#91A4BD]">
            Sort by
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              aria-label="Sort investigations"
              className="ofi-input-glass rounded-lg border border-[rgba(140,190,230,0.2)] px-2.5 py-1.5 text-[11px] text-[#F4F8FF] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#42D9FF]"
            >
              {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </label>
          </div>
        </div>
      </div>

      {error && <ErrorState message={error} />}

      {loading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      )}

      {!loading && data && data.items.length === 0 && (
        <EmptyState
          title="No matching investigations"
          description="No verified records match the current search and filters. Try broadening the search terms or clearing filters — OFI only surfaces records that actually exist in the corpus."
          icon={<Search className="h-5 w-5" />}
        />
      )}

      {!loading && data && data.items.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.items.map((inv, i) => (
              <motion.button
                key={inv.code}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.04 }}
                onClick={() => setDetail(inv.code)}
                className="ofi-card group flex flex-col gap-4 p-5 text-left focus-visible:ring-2 focus-visible:ring-[#42D9FF] focus-visible:outline-none"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="ofi-mono rounded-md border border-[rgba(66,217,255,0.3)] bg-[rgba(66,217,255,0.08)] px-2 py-0.5 text-[10px] text-[#42D9FF]">
                    {inv.code}
                  </span>
                  <ScoreRing value={inv.score.overall} size={44} />
                </div>
                <div>
                  <h3 className="leading-snug font-semibold text-[#F4F8FF] transition-colors group-hover:text-[#42D9FF]">
                    {inv.name}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[#91A4BD]">{inv.objective}</p>
                </div>
                <div className="mt-auto flex flex-wrap items-center gap-2 text-[10px] text-[#5B708C]">
                  <span className="ofi-mono">{inv.category}</span>
                  <span>·</span>
                  <StatusBadge status={inv.status} />
                </div>
                <div className="flex items-center justify-between border-t border-[rgba(140,190,230,0.08)] pt-3 text-[10px] text-[#91A4BD]">
                  <span className="ofi-mono">{inv.sources.length} source{inv.sources.length !== 1 ? "s" : ""} · {inv.launchYear ?? "undated"}</span>
                  <span className="text-[#42D9FF] opacity-0 transition-opacity group-hover:opacity-100">Open detail →</span>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={data.page <= 1}
                aria-label="Previous page"
                className="rounded-lg border border-[rgba(140,190,230,0.16)] p-2 text-[#91A4BD] transition-colors hover:text-[#F4F8FF] disabled:opacity-30 focus-visible:outline-none"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: data.totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  aria-label={`Page ${i + 1}`}
                  aria-current={data.page === i + 1 ? "page" : undefined}
                  className={cn(
                    "ofi-mono h-8 w-8 rounded-lg border text-xs transition-colors focus-visible:outline-none",
                    data.page === i + 1
                      ? "border-[#42D9FF]/60 bg-[rgba(66,217,255,0.12)] text-[#42D9FF]"
                      : "border-[rgba(140,190,230,0.16)] text-[#91A4BD] hover:text-[#F4F8FF]",
                  )}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={data.page >= data.totalPages}
                aria-label="Next page"
                className="rounded-lg border border-[rgba(140,190,230,0.16)] p-2 text-[#91A4BD] transition-colors hover:text-[#F4F8FF] disabled:opacity-30 focus-visible:outline-none"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}

      <AnimatePresence>
        {detail && <DetailPanel key={detail} code={detail} onClose={() => setDetail(null)} />}
      </AnimatePresence>
    </div>
  );
}
