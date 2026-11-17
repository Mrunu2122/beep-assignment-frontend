export * from './constants/roles-and-cities.js';
export * from './schemas/job.schema.js';
export * from './schemas/match.schema.js';

export interface SourceDefinition {
  sourceName: string;
  sourceId: string;
  fetchingMethod: 'api' | 'ats_endpoint' | 'feed' | 'webhook';
  termsDocumentationUrl: string;
  rateLimitPerMinute: number;
  paginationSupported: boolean;
}

export interface IngestionRunSummary {
  runId: string;
  startedAt: string;
  completedAt?: string;
  status: 'running' | 'completed' | 'partial_failure' | 'failed';
  sourceLevelResults: Record<string, {
    recordsFetched: number;
    recordsRejected: number;
    duplicatesFound: number;
    canonicalInserted: number;
    error?: string;
  }>;
  totalRecordsFetched: number;
  totalRecordsRejected: number;
  totalDuplicatesIdentified: number;
  totalCanonicalInsertedOrUpdated: number;
  aiClassificationSuccesses: number;
  aiClassificationFailures: number;
  llmTokensInput: number;
  llmTokensOutput: number;
  estimatedCostUsd: number;
  durationMs?: number;
  errorSummary?: string;
}

export interface LifecycleRevalidationReport {
  revalidationDate: string;
  totalStoredJobs: number;
  confirmedActiveCount: number;
  possiblyExpiredCount: number;
  confirmedExpiredCount: number;
  confirmedRemovedCount: number;
  unverifiedCount: number;
  sourceUnavailableCount: number;
  revalidationBreakdownBySource: Record<string, {
    total: number;
    active: number;
    expired: number;
    removed: number;
    unverified: number;
  }>;
}
