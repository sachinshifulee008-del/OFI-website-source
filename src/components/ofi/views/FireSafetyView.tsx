"use client";

import {
  AlertTriangle, ArrowDownUp, Boxes, Car, Database, ExternalLink, Globe2, Moon, Orbit,
  PersonStanding, Rocket, Satellite, ShieldAlert, Wind,
} from "lucide-react";
import { navigate, ViewHeader } from "../shared";

function Section({
  icon,
  title,
  eyebrow,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="ofi-card p-7">
      <div className="flex items-center gap-3">
        <span className="rounded-lg border border-[rgba(66,217,255,0.25)] bg-[rgba(66,217,255,0.08)] p-2.5 text-[#42D9FF]">
          {icon}
        </span>
        <div>
          <h2 className="text-base font-semibold text-[#F4F8FF]">{title}</h2>
          {eyebrow && <p className="ofi-mono mt-0.5 text-[10px] tracking-[0.2em] text-[#5B708C] uppercase">{eyebrow}</p>}
        </div>
      </div>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-[#91A4BD]">{children}</div>
    </section>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2">
      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#42D9FF]" />
      <span>{children}</span>
    </li>
  );
}

const ENVIRONMENTS = [
  { icon: <Satellite className="h-4 w-4" />, name: "International Space Station", note: "Operating today — the only crewed laboratory where long-duration microgravity combustion data is collected." },
  { icon: <Rocket className="h-4 w-4" />, name: "Future spacecraft", note: "Crew vehicles beyond low-Earth orbit, where a fire must be detected and controlled without an emergency return option." },
  { icon: <Moon className="h-4 w-4" />, name: "Lunar habitats & Moon bases", note: "Surface installations at reduced pressure and enriched oxygen, with 1/6 g combustion physics still unmeasured." },
  { icon: <Orbit className="h-4 w-4" />, name: "Mars habitats", note: "Long-duration surface living where suppression agents and material choices must survive a two-year resupply cycle." },
  { icon: <Car className="h-4 w-4" />, name: "Pressurized exploration rovers", note: "Small sealed volumes with crew present — the tightest fire-safety margin of any environment." },
  { icon: <PersonStanding className="h-4 w-4" />, name: "Spacesuit environments", note: "Pure oxygen at low pressure worn directly against the astronaut — flammability requirements are strictest here." },
];

const OXYGEN_ROWS = [
  { env: "Earth sea-level atmosphere", o2: 21, psi: 14.7, note: "The reference environment all terrestrial intuition is built on.", width: 21 },
  { env: "Lunar habitat (anticipated)", o2: 30, psi: 10.2, note: "≥30% oxygen at ≤10.2 psi — reduced pressure trades against enriched oxygen.", width: 30 },
  { env: "Spacesuit", o2: 100, psi: 4.3, note: "100% oxygen at 4.3 psi — maximum flexibility for movement, maximum flammability.", width: 100 },
  { env: "CFI-G experimental peak (reported)", o2: 85, psi: null, note: "Highest oxygen concentration reached in microgravity combustion tests.", width: 85 },
];

const HARDWARE_FAMILIES = [
  {
    family: "ACME — Advanced Combustion via Microgravity Experiments",
    hardware: "Modular ACME hardware set · Combustion Integrated Rack (CIR)",
    members: "CFI, CFI-G, E-FIELD Flames, BRE and the other ACME gaseous-flame experiments",
    note: "Six experiments shared one modular chamber in the CIR, isolating each study's independent variable.",
  },
  {
    family: "Droplet combustion",
    hardware: "Multi-user Droplet Combustion Apparatus (MDCA) · inside the CIR",
    members: "FLEX, FLEX-2, and CFI's liquid-droplet research records",
    note: "Liquid-fuel droplets burned in a controlled chamber — the physics behind how fuel droplets ignite, burn and extinguish without buoyant convection.",
  },
  {
    family: "Flow-duct studies",
    hardware: "Fan-driven flow duct built for SPICE · Microgravity Science Glovebox (MSG)",
    members: "SPICE, SLICE, BASS and BASS-II — solid and gaseous fuels",
    note: "The shared duct makes airflow speed a comparable variable across solid- and gas-fuel studies.",
  },
  {
    family: "Smoke & dust instrumentation lineage",
    hardware: "SAME / SAME-R smoke-measurement instrumentation",
    members: "Reused to detect dust in DAFT and DAFT-2",
    note: "One instrument family serves both fire detection (smoke aerosols) and environmental monitoring (lunar dust).",
  },
];

const EARTH_APPLICATIONS = [
  { name: "Fine-water-mist fire extinguishers", status: "documented transfer", note: "Developed for the ISS; on Earth the mist cools flames and displaces oxygen with far less water damage than sprinklers." },
  { name: "Advanced smoke detection", status: "documented transfer", note: "NASA combustion research has informed improvements in terrestrial smoke-detector technology." },
  { name: "Firefighter protective clothing", status: "potential application", note: "Material-flammability findings from microgravity studies can inform future fabric and gear improvements." },
  { name: "Breathing apparatus & air tanks", status: "potential application", note: "Enriched-oxygen environment research is directly relevant to the design margins of breathing-air cylinders." },
  { name: "Fire-safety engineering practice", status: "potential application", note: "Microgravity isolates combustion physics that gravity-era codes and standards can exploit." },
];

export default function FireSafetyView() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <ViewHeader
        eyebrow="Workspace · Fire Safety Intelligence"
        title="Spacecraft Fire Safety Intelligence"
        description="Why microgravity combustion research matters for every crewed environment — from the ISS to lunar bases, Mars habitats and rovers — with the oxygen and pressure context, hardware relationships, partial-gravity data status and Earth-facing applications."
      />

      {/* §5 intro — environments */}
      <Section icon={<ShieldAlert className="h-4 w-4" />} title="Crew environments this research protects" eyebrow="Spacecraft fire safety intelligence">
        <p>
          On Earth, buoyancy drives hot gases away from a flame and fresh air into it. In microgravity that convection
          disappears: flames become spherical, cooler and quieter, extinction limits shift, and materials can keep
          smoldering in conditions a terrestrial engineer would consider safe. Every crewed vehicle, habitat and suit is
          a sealed volume whose fire behaviour cannot be extrapolated from Earth intuition alone — which is why the PSI
          microgravity corpus exists, and why understanding it is a fire-safety requirement, not an academic exercise.
        </p>
        <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
          {ENVIRONMENTS.map((e) => (
            <div key={e.name} className="rounded-xl border border-[rgba(140,190,230,0.12)] bg-[rgba(9,20,38,0.32)] p-4">
              <div className="flex items-center gap-2">
                <span className="text-[#42D9FF]">{e.icon}</span>
                <p className="text-[13px] font-medium text-[#F4F8FF]">{e.name}</p>
              </div>
              <p className="mt-1.5 text-[12px] leading-relaxed text-[#7C93AE]">{e.note}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* §5 oxygen & pressure analysis */}
      <Section icon={<Wind className="h-4 w-4" />} title="Oxygen & pressure analysis" eyebrow="The single most important flammability variable">
        <p>
          Oxygen concentration and pressure must always be evaluated <span className="text-[#F4F8FF]">together</span>,
          alongside fuel properties and airflow: a lower absolute pressure slows some combustion chemistry, but a higher
          oxygen fraction raises material flammability. The environments NASA plans sit at very different points on that
          trade-off — all of them more flammable than Earth.
        </p>
        <div className="space-y-3 pt-1">
          {OXYGEN_ROWS.map((r) => (
            <div key={r.env} className="rounded-xl border border-[rgba(140,190,230,0.12)] bg-[rgba(9,20,38,0.32)] p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-[13px] font-medium text-[#F4F8FF]">{r.env}</p>
                <p className="ofi-mono text-[11px] text-[#42D9FF]">
                  {r.o2}% O<sub>2</sub>{r.psi !== null ? ` · ${r.psi} psi` : " · peak in test configuration"}
                </p>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[rgba(16,34,56,0.6)]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#42D9FF] via-[#397BFF] to-[#FF7438]"
                  style={{ width: `${r.width}%` }}
                />
              </div>
              <p className="mt-2 text-[12px] leading-relaxed text-[#7C93AE]">{r.note}</p>
            </div>
          ))}
        </div>
        <p>
          <span className="font-medium text-[#F4F8FF]">CFI-G — the high-oxygen case:</span> in ACME&apos;s Cool Flames
          Investigation with Gases, the chamber held nitrogen plus a flammable gas (e.g. propane) while an oxygen–nitrogen
          mixture of up to <span className="text-[#F4F8FF]">85% oxygen</span> flowed from the spherical burner, creating
          an inside-out flame. It remains the reference dataset for how flames behave in the most oxygen-rich conditions
          flown in microgravity.
        </p>
      </Section>

      {/* §6 partial gravity */}
      <Section icon={<ArrowDownUp className="h-4 w-4" />} title="Partial-gravity research status" eyebrow="Gravity environments as a research category">
        <ul className="ml-2 space-y-2">
          <Bullet><span className="text-[#F4F8FF]">Microgravity</span> — the majority of the PSI combustion corpus (ISS, Cygnus, Shuttle-era freefall).</Bullet>
          <Bullet><span className="text-[#F4F8FF]">Normal-gravity reference experiments</span> — 1-g comparisons flown or run on the ground, bounding the microgravity results.</Bullet>
          <Bullet><span className="text-[#F4F8FF]">Electric-field gravity mimicry</span> — ACME&apos;s E-FIELD Flames pulled on the ions that naturally occur in flames, using the electric field to imitate some effects of partial gravity.</Bullet>
        </ul>
        <p>
          <span className="font-medium text-[#F4F8FF]">Honest status:</span> the PSI dataset contains{" "}
          <span className="text-[#F4F8FF]">no direct partial-gravity combustion experiments</span>.{" "}
          <span className="text-[#F4F8FF]">LUCI</span> (Lunar-g Combustion Investigation) and{" "}
          <span className="text-[#F4F8FF]">FM2</span> (Flammability of Materials on the Moon) are{" "}
          <span className="text-[#F4F8FF]">anticipated future research sources, not completed or currently available
          datasets</span> — this page will be updated only if and when NASA publishes verified data. Until then,
          microgravity and normal-gravity results bound what can happen at intermediate gravity levels such as the
          Moon&apos;s 1/6&nbsp;g.
        </p>
      </Section>

      {/* §3 hardware relationships */}
      <Section icon={<Boxes className="h-4 w-4" />} title="Hardware relationship explorer" eyebrow="Who shared what — and why it makes them comparable">
        <p>
          Investigations that shared apparatus test the same physics while varying different independent variables — the
          cleanest comparisons OFI can offer. Every record in the Explorer carries its facility and platform.
        </p>
        <div className="space-y-3 pt-1">
          {HARDWARE_FAMILIES.map((f) => (
            <div key={f.family} className="rounded-xl border border-[rgba(140,190,230,0.12)] bg-[rgba(9,20,38,0.32)] p-4">
              <p className="font-medium text-[#F4F8FF]">{f.family}</p>
              <p className="ofi-mono mt-1 text-[11px] tracking-wide text-[#42D9FF]">{f.hardware}</p>
              <p className="mt-2">{f.members}.</p>
              <p className="mt-1.5 text-[13px] text-[#7C93AE]">{f.note}</p>
            </div>
          ))}
        </div>
        <button
          onClick={() => navigate("explorer")}
          className="inline-flex items-center gap-2 rounded-lg border border-[rgba(66,217,255,0.35)] bg-[rgba(66,217,255,0.08)] px-4 py-2 text-xs font-medium text-[#42D9FF] transition-colors hover:bg-[rgba(66,217,255,0.14)] focus-visible:ring-2 focus-visible:ring-[#42D9FF] focus-visible:outline-none"
        >
          Filter investigations by hardware in the Research Explorer
          <ExternalLink className="h-3.5 w-3.5" />
        </button>
      </Section>

      {/* §10 Earth applications */}
      <Section icon={<Globe2 className="h-4 w-4" />} title="Real-world applications on Earth" eyebrow="Documented transfers vs potential applications">
        <p>
          Space combustion research has already changed fire safety on Earth — and other benefits are plausible but not
          yet documented transfers. The distinction matters, so each item below is labelled.
        </p>
        <div className="space-y-3 pt-1">
          {EARTH_APPLICATIONS.map((a) => (
            <div key={a.name} className="rounded-xl border border-[rgba(140,190,230,0.12)] bg-[rgba(9,20,38,0.32)] p-4">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[13px] font-medium text-[#F4F8FF]">{a.name}</p>
                <span
                  className={cnBadge(a.status)}
                >
                  {a.status}
                </span>
              </div>
              <p className="mt-1.5 text-[12px] leading-relaxed text-[#7C93AE]">{a.note}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* §11 data integrity */}
      <Section icon={<Database className="h-4 w-4" />} title="Data integrity & sources" eyebrow="How OFI stays traceable to NASA">
        <ul className="ml-2 space-y-2">
          <Bullet><span className="text-[#F4F8FF]">Primary source:</span> NASA Physical Sciences Informatics —{" "}
            <a href="https://psi.nasa.gov/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#42D9FF] hover:underline">
              psi.nasa.gov<ExternalLink className="h-3 w-3" />
            </a>{" "}
            — supplemented by NASA Technical Reports Server (NTRS) records and peer-reviewed publications, all linked per record.</Bullet>
          <Bullet><span className="text-[#F4F8FF]">No invented values:</span> where a parameter (e.g. sample dimensions, chamber pressure) was not reported in the source, OFI displays <span className="ofi-mono text-[#42D9FF]">Not reported</span> or <span className="ofi-mono text-[#42D9FF]">Data unavailable</span> rather than guessing.</Bullet>
          <Bullet><span className="text-[#F4F8FF]">Real vs demonstration data:</span> every investigation record is curated from verified public sources; nothing in the corpus is synthetic. AI answers distinguish record facts from general scientific background.</Bullet>
          <Bullet><span className="text-[#F4F8FF]">Future updates:</span> the schema supports new investigations, parameters and datasets (including future partial-gravity data) without structural changes; coverage and missing-field indicators are shown per record.</Bullet>
        </ul>
      </Section>

      <Section icon={<AlertTriangle className="h-4 w-4" />} title="Scope boundary" eyebrow="What this corpus does not cover">
        <p>
          Fire safety involving rockets and propellants is generally beyond the scope of PSI research: the high velocities
          inside rocket engines render the combustion effectively independent of gravity. A rocket&apos;s launch is
          strongly gravity-dependent — but that is vehicle dynamics, not the combustion science this corpus measures.
        </p>
      </Section>
    </div>
  );
}

function cnBadge(status: string) {
  return status === "documented transfer"
    ? "ofi-mono rounded-md border border-[rgba(52,211,153,0.35)] bg-[rgba(52,211,153,0.08)] px-2 py-0.5 text-[10px] text-[#34D399]"
    : "ofi-mono rounded-md border border-[rgba(232,178,90,0.35)] bg-[rgba(232,178,90,0.08)] px-2 py-0.5 text-[10px] text-[#E8B25A]";
}
