"use client";

import { BrainCircuit, Database, FileSearch, Scale, ShieldCheck } from "lucide-react";
import { ViewHeader } from "../shared";

function MethodSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="ofi-card p-7">
      <div className="flex items-center gap-3">
        <span className="rounded-lg border border-[rgba(66,217,255,0.25)] bg-[rgba(66,217,255,0.08)] p-2.5 text-[#42D9FF]">
          {icon}
        </span>
        <h2 className="text-base font-semibold text-[#F4F8FF]">{title}</h2>
      </div>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-[#91A4BD]">{children}</div>
    </section>
  );
}

export default function MethodologyView() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <ViewHeader
        eyebrow="Workspace · Methodology"
        title="Methodology & Honest Limitations"
        description="How OFI curates data, computes scores, grounds FLARE AI answers — and the limits you should know about before drawing scientific conclusions from this platform."
      />

      <MethodSection icon={<Database className="h-4 w-4" />} title="Data curation & provenance">
        <p>
          Every investigation record in the OFI corpus was curated from public, verifiable sources: NASA&apos;s
          Physical Science Informatics database (<a href="https://psi.nasa.gov/" target="_blank" rel="noreferrer" className="text-[#42D9FF] hover:underline">psi.nasa.gov</a>),
          NASA mission pages, NASA Technical Reports Server (NTRS) documents, ISS National Laboratory pages,
          peer-reviewed journal articles and contemporaneous NASA news releases. Each record carries its source list, and every displayed launch year or
          DOI was verified against a specific source.
        </p>
        <p>
          Where a fact could not be verified (for example, a launch year that no fetched source states), the field is
          displayed as <span className="ofi-mono text-[#42D9FF]">Not dated in source</span> rather than filled with a
          guess. This is deliberate: OFI treats missing evidence as information, not as a gap to paper over.
        </p>
        <p>
          <span className="font-medium text-[#F4F8FF]">Limitation:</span> the corpus is a curated selection, not a
          comprehensive catalogue of all NASA microgravity combustion research. Absence from the corpus means absence from
          OFI, not from NASA&apos;s research history.
        </p>
      </MethodSection>

      <MethodSection icon={<Scale className="h-4 w-4" />} title="OFI Research Relevance Score">
        <p>
          The score is an <span className="text-[#F4F8FF]">OFI-defined metadata heuristic</span> with four components,
          each computed deterministically from fields actually present in a record:
        </p>
        <ul className="ml-2 space-y-2">
          <li className="flex gap-2"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#42D9FF]" />
            <span><span className="text-[#F4F8FF]">Data quality (30%)</span> — number of verified sources (up to 40 pts), presence of a verified DOI (+20), NASA mission page (+10), NTRS report (+10), dataset and measurement annotations (+10 each).</span></li>
          <li className="flex gap-2"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#42D9FF]" />
            <span><span className="text-[#F4F8FF]">Scientific relevance (30%)</span> — topical alignment with spacecraft fire-safety themes (flame spread, suppression, flammability limits, smoke, fire detection), with small bonuses for cool-flame and soot/smoke research.</span></li>
          <li className="flex gap-2"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#42D9FF]" />
            <span><span className="text-[#F4F8FF]">Completeness (20%)</span> — the fraction of ten core metadata fields actually populated. Missing fields reduce the score honestly.</span></li>
          <li className="flex gap-2"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#42D9FF]" />
            <span><span className="text-[#F4F8FF]">Metadata quality (20%)</span> — identifiers and provenance: launch year, delivery vehicle, DOI, canonical links, and unit-annotated variables.</span></li>
        </ul>
        <p>
          <span className="font-medium text-[#FF7438]">What it is not:</span> a NASA-approved ranking, a spacecraft
          fire-risk prediction, or a judgment of scientific merit. Two records with equal physics can score differently
          purely because one is better documented publicly.
        </p>
      </MethodSection>

      <MethodSection icon={<BrainCircuit className="h-4 w-4" />} title="FLARE AI grounding">
        <p>
          FLARE AI is retrieval-grounded. Before answering a research question, the server retrieves the most relevant
          verified corpus records (keyword relevance over objectives, summaries, research areas, fuels and findings) and
          injects them as the only admissible context. The model is instructed to:
        </p>
        <ul className="ml-2 space-y-1.5">
          {[
            "cite records inline using their catalogue codes, e.g. [FLEX]",
            "label interpretations explicitly as interpretation",
            "disclose uncertainty and incomplete evidence",
            "state openly when the corpus cannot support an answer",
            "never invent measurements, citations or DOIs",
          ].map((t) => (
            <li key={t} className="flex gap-2"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#FF7438]" />{t}</li>
          ))}
        </ul>
        <p>
          The LLM runs entirely server-side; no API keys are exposed to the browser. If the language-model backend is
          unavailable, FLARE AI degrades to a deterministic retrieval mode that composes answers directly from retrieved
          records — labelled as such in the interface. AI requests are rate-limited per client.
        </p>
        <p>
          <span className="font-medium text-[#F4F8FF]">Limitation:</span> a language model can still phrase interpretations
          imperfectly. Treat unlabelled statements as corpus facts only when a citation card supports them.
        </p>
      </MethodSection>

      <MethodSection icon={<FileSearch className="h-4 w-4" />} title="Visualization & comparison rules">
        <p>
          The Visualization Lab charts are computed live from corpus metadata (categories, platforms, facilities, years,
          scores) — never from invented measurements. OFI stores no fabricated NASA measurement series; therefore
          measurement time-series are honestly presented as unavailable until verified datasets are imported.
        </p>
        <p>
          Experiment Comparison applies a compatibility check before rendering any comparison: investigations must share
          a research category (combustion modality) and measured-variable definitions with consistent units. When the
          check fails, the interface explains exactly why the comparison would be scientifically invalid instead of
          showing misleading side-by-side numbers.
        </p>
      </MethodSection>

      <MethodSection icon={<ShieldCheck className="h-4 w-4" />} title="Security & deployment posture">
        <p>
          All external credentials (AI provider keys, database URLs) live in server-side environment variables and are
          never shipped to the client. Incoming API parameters are validated with schema validation, AI endpoints are
          rate-limited, and error responses avoid leaking internals. The application is a Next.js App Router project
          deployable to Vercel; configuration requires only the environment variables documented in
          <span className="ofi-mono text-[#42D9FF]"> .env.example</span>.
        </p>
        <p>
          <span className="font-medium text-[#F4F8FF]">Known limitations:</span> the local corpus ships as a seeded
          database; production deployments should re-run the seed on first start. Session context (recently explored,
          activity) is stored per-device in localStorage, not on a server. FLARE AI answers cover only the curated
          corpus, not the full body of NASA combustion literature.
        </p>
      </MethodSection>
    </div>
  );
}
