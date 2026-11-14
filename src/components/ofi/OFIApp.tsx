"use client";

import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AppShell, { NAV_ITEMS, type ViewId } from "./shell/AppShell";
import LandingPage from "./landing/LandingPage";
import OverviewView from "./views/OverviewView";
import FireSafetyView from "./views/FireSafetyView";
import ExplorerView from "./views/ExplorerView";
import IntelligenceView from "./views/IntelligenceView";
import VisualizationView from "./views/VisualizationView";
import ComparisonView from "./views/ComparisonView";
import FlareAIView from "./views/FlareAIView";
import RankingsView from "./views/RankingsView";
import ReportsView from "./views/ReportsView";
import LibraryView from "./views/LibraryView";
import MethodologyView from "./views/MethodologyView";
import { useHashRoute } from "./shared";

const VALID = new Set(NAV_ITEMS.map((n) => n.id as string));

/** Parse a hash route like "explorer?q=FLEX&code=SAFFIRE-I" into view + params. */
function parseHash(raw: string): { view: ViewId; params: URLSearchParams } {
  const [pathPart, queryPart] = raw.split("?");
  const view = (VALID.has(pathPart) ? pathPart : "overview") as ViewId;
  return { view, params: new URLSearchParams(queryPart ?? "") };
}

export default function OFIApp() {
  const route = useHashRoute();
  const isWorkspace = route !== "" && route !== "home" && !route.startsWith("home?");
  const { view, params } = useMemo(() => parseHash(route), [route]);
  const explorerQuery = params.get("q") ?? "";
  const explorerCode = params.get("code") ?? "";

  if (!isWorkspace) {
    return <LandingPage />;
  }

  return (
    <AppShell active={view}>
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {view === "overview" && <OverviewView />}
          {view === "fire-safety" && <FireSafetyView />}
          {view === "explorer" && <ExplorerView initialQuery={explorerQuery} initialCode={explorerCode} />}
          {view === "intelligence" && <IntelligenceView />}
          {view === "visualization" && <VisualizationView />}
          {view === "comparison" && <ComparisonView />}
          {view === "flare-ai" && <FlareAIView />}
          {view === "rankings" && <RankingsView />}
          {view === "reports" && <ReportsView />}
          {view === "library" && <LibraryView />}
          {view === "methodology" && <MethodologyView />}
        </motion.div>
      </AnimatePresence>
    </AppShell>
  );
}
