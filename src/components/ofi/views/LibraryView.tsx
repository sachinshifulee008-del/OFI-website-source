"use client";

import { useEffect, useState } from "react";
import { BookMarked, ExternalLink } from "lucide-react";
import { fetchInvestigations } from "@/lib/ofi/api";
import type { InvestigationDTO } from "@/lib/ofi/types";
import { CardSkeleton, ErrorState, ViewHeader } from "../shared";

const GLOSSARY = [
  ["Microgravity", "Conditions in which objects appear weightless, as in orbiting spacecraft. Buoyant convection is essentially absent, which fundamentally changes flame shape and combustion dynamics."],
  ["Cool flame", "A low-temperature, faint combustion regime that can sustain burning without a visible hot flame. Discovered in droplet form aboard the ISS during the FLEX investigation."],
  ["Diffusion flame", "A flame in which fuel and oxidizer meet and react in a thin zone, each arriving by diffusion rather than being premixed. Most microgravity combustion studies concern diffusion flames."],
  ["Flammability limit", "The boundary of ambient conditions (e.g. oxygen concentration, flow velocity) outside which a flame cannot propagate — central to spacecraft material screening."],
  ["Maximum Oxygen Concentration (MOC)", "The highest oxygen concentration at which a material does not sustain flame propagation; used in NASA flammability assessments (SAFFIRE-II)."],
  ["Soot", "Carbonaceous particles formed in fuel-rich flame zones. Soot formation and oxidation are studied in microgravity (LSP) because buoyancy otherwise distorts the flame."],
  ["Smoke aerosol", "The airborne particle population produced by pyrolysis and combustion. SAME characterized its size distribution in microgravity to inform smoke detector design."],
  ["Combustion Integrated Rack (CIR)", "The ISS combustion science facility located in the Destiny laboratory module, hosting FLEX, ACME and SoFIE experiments."],
  ["d²-law", "The classical model of droplet combustion in which the droplet surface area decreases linearly with time; FLEX measurements quantified departures from it."],
];

export default function LibraryView() {
  const [items, setItems] = useState<InvestigationDTO[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInvestigations({ pageSize: 50 })
      .then((r) => setItems(r.items))
      .catch((e) => setError(e.message));
  }, []);

  const allSources = (items ?? []).flatMap((inv) =>
    inv.sources.map((s) => ({ ...s, invCode: inv.code, invName: inv.name })),
  );
  const verifiedDois = (items ?? []).filter((i) => i.doi);

  return (
    <div className="mx-auto max-w-7xl">
      <ViewHeader
        eyebrow="Workspace · Science Library"
        title="Science Library"
        description="The combined bibliography of the OFI corpus, a glossary of combustion-science terms, and links to the public NASA programmes behind the research. Only sources actually held in the corpus are listed."
      />

      {error && <ErrorState message={error} />}
      {!items && !error && <div className="grid gap-4 md:grid-cols-2">{[0, 1, 2, 3].map((i) => <CardSkeleton key={i} />)}</div>}

      {items && (
        <div className="space-y-8">
          {/* Bibliography */}
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[#F4F8FF]">
              <BookMarked className="h-4 w-4 text-[#42D9FF]" /> Corpus bibliography ({allSources.length} sources)
            </h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {allSources.map((s) => (
                <div key={s.id} className="ofi-card p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm leading-snug font-medium text-[#F4F8FF]">{s.title}</p>
                      <p className="mt-1 text-[11px] text-[#91A4BD]">
                        {s.authors}{s.year ? ` · ${s.year}` : ""} · {s.venue}
                      </p>
                      <p className="ofi-mono mt-1.5 text-[10px] text-[#5B708C]">
                        <span className="text-[#42D9FF]">[{s.invCode}]</span> · {s.kind}
                      </p>
                    </div>
                    {s.url && (
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open: ${s.title}`}
                        className="shrink-0 rounded-lg border border-[rgba(140,190,230,0.2)] p-2 text-[#42D9FF] hover:border-[#42D9FF]/50 focus-visible:outline-none"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Verified DOIs */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-[#F4F8FF]">Verified DOIs ({verifiedDois.length})</h2>
            <p className="mb-4 max-w-3xl text-xs leading-relaxed text-[#91A4BD]">
              OFI displays a DOI only when it was verified against the publisher page during curation. Records without a
              verified DOI link to NASA report or mission pages instead — that is an honesty feature, not an omission.
            </p>
            {verifiedDois.length === 0 ? (
              <div className="ofi-card border-dashed p-6 text-sm text-[#91A4BD]">No verified DOIs recorded.</div>
            ) : (
              <div className="space-y-2">
                {verifiedDois.map((inv) => (
                  <a
                    key={inv.code}
                    href={`https://doi.org/${inv.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ofi-card flex items-center justify-between px-5 py-3.5"
                  >
                    <span className="text-sm text-[#F4F8FF]">
                      <span className="ofi-mono mr-3 text-[11px] text-[#42D9FF]">{inv.code}</span>
                      {inv.name}
                    </span>
                    <span className="ofi-mono text-[11px] text-[#91A4BD]">{inv.doi}</span>
                  </a>
                ))}
              </div>
            )}
          </section>

          {/* Glossary */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-[#F4F8FF]">Glossary</h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {GLOSSARY.map(([term, def]) => (
                <div key={term} className="ofi-card p-5">
                  <p className="ofi-mono text-[11px] tracking-wider text-[#42D9FF] uppercase">{term}</p>
                  <p className="mt-2 text-xs leading-relaxed text-[#91A4BD]">{def}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
