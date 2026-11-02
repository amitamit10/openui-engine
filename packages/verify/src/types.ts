export type Severity = "error" | "warning" | "info";

export interface Issue {
  severity: Severity;
  category: "overflow" | "a11y" | "console" | "network" | "assets" | "interaction" | "motion" | "tokens" | "seo" | "responsive" | "content" | "typography" | "layout";
  message: string;
  selector?: string;
  openuiId?: string;
  fix?: string;
}

export interface Viewport { name: string; width: number; height: number; mobile?: boolean }
export const VIEWPORTS: Viewport[] = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 820, height: 1180 },
  { name: "mobile", width: 390, height: 844, mobile: true },
];

export interface Compliance { checked: number; compliant: number; ratio: number; offenders: Array<{ value: string; count: number; sample?: string }> }

export interface PageMetrics {
  title: string; h1Count: number; fontSizes: number[]; bodyLineHeight: number; h1Size: number; bodySize: number;
  sectionPaddings: number[]; contentLefts: number[]; visualAreaFold: number; primaryCtasInFold: number; docHeight: number;
  maxLineChars: number; interactiveCount: number;
}

export interface ViewportReport {
  viewport: Viewport;
  issues: Issue[];
  compliance?: { color: Compliance; font: Compliance; fontSize: Compliance; spacing: Compliance; radius: Compliance };
  metrics: PageMetrics;
  interactions: Array<{ name: string; passed: boolean; detail?: string }>;
  screenshots: { full?: string; fold?: string };
  animations: { runningNormal: number; infiniteReduced: number };
}

export interface AuditReport {
  url: string;
  generatedAt: string;
  viewports: ViewportReport[];
  totals: { errors: number; warnings: number; infos: number };
  passed: boolean;
}
