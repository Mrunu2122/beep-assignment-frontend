import { z } from 'zod';
import {
  FIXED_ROLE_CATEGORIES,
  EMPLOYMENT_TYPES,
  EXPERIENCE_LEVELS,
  APPLICATION_LINK_STATUSES,
  FRESHER_ELIGIBILITY_STATUSES,
  LISTING_STATUSES,
} from '../constants/roles-and-cities.js';

export const RawJobInputSchema = z.object({
  sourceId: z.string().min(1, 'Source ID is required'),
  externalId: z.string().min(1, 'External ID is required'),
  originalUrl: z.string().url('Original URL must be valid'),
  applicationUrl: z.string().url('Application URL must be valid'),
  title: z.string().min(2, 'Job title is required'),
  company: z.string().min(1, 'Company name is required'),
  descriptionRaw: z.string().min(10, 'Job description must have minimum content'),
  rawLocation: z.string().optional().default(''),
  postedAtRaw: z.string().optional(),
  salaryRaw: z.string().optional(),
  responsibilitiesRaw: z.array(z.string()).optional(),
  qualificationsRaw: z.array(z.string()).optional(),
  sourcePostingId: z.string().optional(),
  sourceBoardToken: z.string().optional(),
});

export type RawJobInput = z.infer<typeof RawJobInputSchema>;

export const AIClassificationResultSchema = z.object({
  roleCategory: z.enum(FIXED_ROLE_CATEGORIES),
  roleSubcategory: z.string(),
  normalizedCity: z.string(),
  normalizedState: z.string(),
  country: z.string().default('India'),
  employmentType: z.enum(EMPLOYMENT_TYPES),
  experienceLevel: z.enum(EXPERIENCE_LEVELS),
  fresherEligibilityStatus: z.enum(FRESHER_ELIGIBILITY_STATUSES),
  isGenuinelyFresher: z.boolean(),
  skills: z.array(z.string()).default([]),
  confidenceScore: z.number().min(0).max(1),
  reasoningBrief: z.string().max(300),
  aiSummary: z.string().max(400).optional(),
});

export type AIClassificationResult = z.infer<typeof AIClassificationResultSchema>;

export const CanonicalJobSchema = z.object({
  id: z.string().uuid(),
  sourceId: z.string(),
  sourceName: z.string(),
  externalId: z.string(),
  originalUrl: z.string().url(),
  applicationUrl: z.string().url(),
  finalDestinationUrl: z.string().url().optional(),
  
  // Job Lifecycle & Source-of-Truth tracking
  listingStatus: z.enum(LISTING_STATUSES).default('ACTIVE'),
  sourceLastVerifiedAt: z.string().optional(),
  lastSuccessfulSourceCheck: z.string().optional(),
  consecutiveMissingChecks: z.number().int().default(0),
  firstMissingAt: z.string().nullable().optional(),
  expiredAt: z.string().nullable().optional(),
  statusReason: z.string().nullable().optional(),
  sourcePostingId: z.string().nullable().optional(),
  sourceBoardToken: z.string().nullable().optional(),
  applicationUrlStatus: z.enum(APPLICATION_LINK_STATUSES).default('VERIFIED'),

  title: z.string(),
  company: z.string(),
  companySlug: z.string(),
  
  description: z.string(),
  descriptionSnippet: z.string(),
  responsibilities: z.array(z.string()).default([]),
  qualifications: z.array(z.string()).default([]),
  aiSummary: z.string().optional(),
  
  rawLocation: z.string(),
  normalizedCity: z.string(),
  normalizedState: z.string(),
  country: z.string().default('India'),
  workMode: z.enum(['remote', 'onsite', 'hybrid']).default('onsite'),

  employmentType: z.enum(EMPLOYMENT_TYPES),
  experienceLevel: z.enum(EXPERIENCE_LEVELS),
  fresherEligibilityStatus: z.enum(FRESHER_ELIGIBILITY_STATUSES).default('Fresher eligible'),
  isGenuinelyFresher: z.boolean().default(true),

  roleCategory: z.enum(FIXED_ROLE_CATEGORIES),
  roleSubcategory: z.string(),
  skills: z.array(z.string()).default([]),

  salaryInformation: z.object({
    min: z.number().nullable().optional(),
    max: z.number().nullable().optional(),
    currency: z.string().default('INR'),
    period: z.enum(['month', 'year', 'lpa']).nullable().optional(),
    raw: z.string().nullable().optional(),
  }),

  postedAt: z.string().nullable().optional(),
  discoveredAt: z.string(),
  lastSeenAt: z.string(),
  status: z.enum(['active', 'archived', 'filled']).default('active'),

  classificationConfidence: z.number().min(0).max(1),
  classificationModel: z.string(),
  classificationPromptVersion: z.string(),

  canonicalHash: z.string(),
  isDuplicate: z.boolean().default(false),
  canonicalJobId: z.string().uuid().nullable().optional(),
  duplicateClusterId: z.string().nullable().optional(),
  duplicateReason: z.string().nullable().optional(),
  slug: z.string(),
});

export type CanonicalJob = z.infer<typeof CanonicalJobSchema>;

export const JobListQuerySchema = z.object({
  q: z.string().optional(),
  roleCategory: z.string().optional(),
  city: z.string().optional(),
  employmentType: z.string().optional(),
  workMode: z.string().optional(),
  status: z.enum(LISTING_STATUSES).optional(),
  fresherOnly: z.enum(['true', 'false']).optional().transform(v => v === 'true'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['newest', 'confidence', 'company']).default('newest'),
});

export type JobListQuery = z.infer<typeof JobListQuerySchema>;
