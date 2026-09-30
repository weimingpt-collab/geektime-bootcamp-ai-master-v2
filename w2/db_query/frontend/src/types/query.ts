/** Query execution types. */

export interface QueryColumn {
  name: string;
  dataType: string;
}

export interface QueryResult {
  columns: QueryColumn[];
  rows: Record<string, any>[];
  rowCount: number;
  executionTimeMs: number;
  sql: string;
}

export interface QueryInput {
  sql: string;
}

export interface QueryHistoryEntry {
  id: number;
  databaseName: string;
  sqlText: string;
  executedAt: string;
  executionTimeMs?: number | null;
  rowCount?: number | null;
  success: boolean;
  errorMessage?: string | null;
  querySource: "manual" | "natural_language";
}

/** Supported export formats for query result download. */
export type ExportFormat = "csv" | "json";

/**
 * Row-count threshold (inclusive) below which the frontend exports
 * directly via a Blob. At or above this value, the frontend delegates
 * to the backend streaming export endpoint to avoid OOM and UI lag.
 * Matches the backend's small-vs-large decision boundary.
 */
export const EXPORT_THRESHOLD = 10000;

/** Hard cap enforced by the backend `/query/export` endpoint. */
export const EXPORT_MAX_ROWS = 100000;

