export type VariableInfo = { name: string; unit: string | null };

export type SourceInfo = {
  id: string;
  title: string;
  authors: string;
  year: number | null;
  venue: string;
  kind: "report" | "journal" | "web" | "news";
  doi: string | null;
  url: string | null;
};

export type InvestigationDTO = {
  id: string;
  code: string;
  name: string;
  category: string;
  objective: string;
  summary: string;
  gravityCondition: string;
  facility: string;
  platform: string;
  status: string;
  launchYear: number | null;
  delivery: string | null;
  researchAreas: string[];
  fuelsMaterials: string[];
  keyFindings: string[];
  variables: VariableInfo[];
  doi: string | null;
  sourceUrl: string | null;
  ntrsUrl: string | null;
  datasetAvailable: boolean;
  measurementData: boolean;
  sources: SourceInfo[];
  score: OfiScore;
};

export type OfiScore = {
  dataQuality: number;
  scientificRelevance: number;
  completeness: number;
  metadataQuality: number;
  overall: number;
};

export type StatsResponse = {
  totalInvestigations: number;
  verifiedSources: number;
  withDataset: number;
  withMeasurementData: number;
  categories: { name: string; count: number }[];
  platforms: { name: string; count: number }[];
  statusBreakdown: { name: string; count: number }[];
  latestRecords: {
    code: string;
    name: string;
    category: string;
    status: string;
    launchYear: number | null;
  }[];
  aiConfigured: boolean;
};

export type CorpusDataset = {
  id: string;
  title: string;
  description: string;
  unit: string;
  sourceNote: string;
  kind: "bar" | "line" | "pie" | "scatter" | "radar";
  data: Record<string, string | number>[];
  xKey: string;
  seriesKeys: { key: string; label: string; color: string }[];
};

export type ChatMessage = { role: "user" | "assistant"; content: string };

export type FlareResponse = {
  answer: string;
  followUps?: string[];
  sources: {
    code: string;
    name: string;
    category: string;
    sourceUrl: string | null;
    ntrsUrl: string | null;
    doi: string | null;
  }[];
  mode: "llm" | "retrieval";
  disclaimer: string;
};
