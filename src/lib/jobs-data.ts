// Project Launchpad - Job Data Service
// Primary Source of Truth: Supabase public_jobs view
// Controlled Local Fallback: offline / mock development mode

import { getClient } from './supabase';
import jobsStore from './jobs-store.json';

export interface JobSummary {
  id: string;
  slug: string;
  title: string;
  company: string;
  standardRole: string;
  normalizedCity: string;
  workMode: string;
  employmentType: string;
  requiredSkills: string[];
  applyUrl: string;
  applicationUrl?: string;
  sourceName: string;
  listingStatus?: string;
  linkStatus?: string;
  fresherEligibilityStatus?: string;
  isFresherEligible: boolean;
  aiConfidence: number;
  discoveredAt: string;
  descriptionSnippet?: string;
}

export interface JobDetailRecord extends JobSummary {
  description: string;
  responsibilities?: string[];
  qualifications?: string[];
  minExperienceYears?: number | null;
  maxExperienceYears?: number | null;
  targetGraduationYears?: number[];
  sources?: Array<{
    id: string;
    sourceName: string;
    applyUrl: string;
    applicationUrlStatus: string;
    isLiveOnSource: boolean;
  }>;
}

function mapSupabaseToSummary(row: any): JobSummary {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    company: row.company,
    standardRole: row.standard_role || 'Engineering',
    normalizedCity: row.normalized_city || 'Remote (India)',
    workMode: row.work_mode || 'unspecified',
    employmentType: row.employment_type || 'full_time',
    requiredSkills: Array.isArray(row.required_skills) ? row.required_skills : [],
    applyUrl: row.primary_apply_url || '',
    applicationUrl: row.primary_apply_url || '',
    sourceName: 'Company Direct ATS',
    listingStatus: row.listing_status || 'ACTIVE',
    linkStatus: 'VERIFIED',
    fresherEligibilityStatus: row.fresher_eligibility_status || (row.is_fresher_eligible ? 'Explicit fresher eligible' : 'Experience not specified'),
    isFresherEligible: !!row.is_fresher_eligible,
    aiConfidence: 0.95,
    discoveredAt: row.discovered_at || row.posted_at || new Date().toISOString(),
    descriptionSnippet: row.description_snippet || (row.description ? row.description.replace(/<[^>]*>/g, '').slice(0, 160) : '')
  };
}

function mapSupabaseToDetail(row: any): JobDetailRecord {
  const summary = mapSupabaseToSummary(row);
  const sources = (row.public_job_sources || []).map((s: any) => ({
    id: s.id,
    sourceName: s.source_name,
    applyUrl: s.apply_url,
    applicationUrlStatus: s.application_url_status,
    isLiveOnSource: s.is_live_on_source
  }));

  return {
    ...summary,
    description: row.description || '',
    responsibilities: Array.isArray(row.responsibilities) ? row.responsibilities : [],
    qualifications: Array.isArray(row.qualifications) ? row.qualifications : [],
    minExperienceYears: row.min_experience_years,
    maxExperienceYears: row.max_experience_years,
    targetGraduationYears: Array.isArray(row.target_graduation_years) ? row.target_graduation_years : [],
    sources
  };
}

/**
 * Fetch all active jobs from Supabase public_jobs view.
 * If Supabase is unreachable and in development/offline mode, falls back to local jobsStore.
 */
export async function getAllJobSummariesAsync(): Promise<JobSummary[]> {
  const supabase = getClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('public_jobs')
        .select('*')
        .order('posted_at', { ascending: false, nullsFirst: false });

      if (!error && data && data.length > 0) {
        return data.map(mapSupabaseToSummary);
      }
      if (error) {
        console.warn('[jobs-data] Supabase query error, checking local store:', error.message);
      }
    } catch (err: any) {
      console.warn('[jobs-data] Failed to reach Supabase:', err?.message);
    }
  }

  // Fallback to local store
  return getAllJobSummaries();
}

/**
 * Synchronous local retrieval for backwards-compatibility or static page components
 */
export function getAllJobSummaries(): JobSummary[] {
  const seen = new Set<string>();
  const list: JobSummary[] = [];

  for (const key in jobsStore) {
    const job = (jobsStore as Record<string, any>)[key];
    if (job && !seen.has(job.id)) {
      seen.add(job.id);
      list.push({
        id: job.id,
        slug: job.slug,
        title: job.title,
        company: job.company,
        standardRole: job.standardRole,
        normalizedCity: job.normalizedCity,
        workMode: job.workMode,
        employmentType: job.employmentType,
        requiredSkills: job.requiredSkills || [],
        applyUrl: job.applyUrl,
        sourceName: job.sourceName,
        listingStatus: job.listingStatus,
        linkStatus: job.linkStatus || 'VERIFIED',
        fresherEligibilityStatus: job.fresherEligibilityStatus,
        isFresherEligible: job.isFresherEligible,
        aiConfidence: job.aiConfidence,
        discoveredAt: job.discoveredAt,
        descriptionSnippet: job.descriptionSnippet || (job.description ? job.description.replace(/<[^>]*>/g, '').slice(0, 150) : '')
      });
    }
  }

  return list;
}

/**
 * Lookup a job record by UUID ID or slug asynchronously from Supabase.
 * Includes related public_job_sources.
 */
export async function getJobByIdOrSlugAsync(idOrSlug: string): Promise<JobDetailRecord | undefined> {
  if (!idOrSlug) return undefined;

  const supabase = getClient();
  if (supabase) {
    try {
      // Check if it's a UUID
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
      
      let query = supabase
        .from('public_jobs')
        .select('*, public_job_sources(*)');

      if (isUuid) {
        query = query.or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`);
      } else {
        query = query.eq('slug', idOrSlug);
      }

      const { data, error } = await query.maybeSingle();

      if (!error && data) {
        return mapSupabaseToDetail(data);
      }
      if (error) {
        console.warn(`[jobs-data] Supabase lookup error for "${idOrSlug}":`, error.message);
      }
    } catch (err: any) {
      console.warn(`[jobs-data] Supabase request failed for "${idOrSlug}":`, err?.message);
    }
  }

  // Fallback to local store
  return getJobByIdOrSlug(idOrSlug);
}

/**
 * Synchronous lookup from local store
 */
export function getJobByIdOrSlug(idOrSlug: string): any | undefined {
  if (!idOrSlug) return undefined;
  return (jobsStore as Record<string, any>)[idOrSlug];
}
