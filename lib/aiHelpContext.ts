import { appFeatures } from "./appFeatureRegistry";

export function buildAiHelpSystemContext(): string {
  // Build a concise context summary from app feature registry
  const featureSummaries = appFeatures
    .slice(0, 40)
    .map((f) => `- ${f.name}: ${f.shortDescription}`)
    .join("\n");

  const ctx = `ShipRoute AI is a local-first, offline-friendly delivery routing app. Data is stored in the browser's localStorage. There is no backend, database, or auth by default. The Feature Registry lists app features and serves as the canonical help source.\n\nFeatures:\n${featureSummaries}\n\nNotes:\n- Feature Registry: lib/appFeatureRegistry.ts\n- Docs: docs/FEATURE_DEVELOPMENT_WORKFLOW.md and related templates\n- Google Maps API key (for maps) is configured via NEXT_PUBLIC_GOOGLE_MAPS_API_KEY (frontend).\n- AI provider key (server-side) should be set in OPENAI_API_KEY (server env).\n- If server-side AI is not configured or offline, the widget must fallback to local rule-based replies.\n`;

  return ctx;
}
