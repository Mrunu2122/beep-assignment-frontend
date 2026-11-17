import { z } from 'zod';

export const SkillEvidenceLevelSchema = z.enum([
  'DEMONSTRATED', // Applied in a project or work experience with quantifiable impact
  'MENTIONED',    // Listed in skills list or summary without deep context
  'PARTIAL',      // Related tool/framework or conceptual mention
  'NOT_FOUND',    // No evidence found in resume text
  'NOT_ASSESSABLE'// Ambiguous or cannot be evaluated
]);
export type SkillEvidenceLevel = z.infer<typeof SkillEvidenceLevelSchema>;

export const SkillMatchItemSchema = z.object({
  skillName: z.string(),
  isMandatory: z.boolean(),
  evidenceLevel: SkillEvidenceLevelSchema,
  scoreContribution: z.number().min(0).max(1), // 0 to 1
  evidenceSnippet: z.string().optional(),
  reasoning: z.string()
});
export type SkillMatchItem = z.infer<typeof SkillMatchItemSchema>;

export const ExtractedResumeSchema = z.object({
  candidateName: z.string().optional(),
  email: z.string().optional(), // Redacted / omitted in logs
  phone: z.string().optional(),
  skills: z.array(z.string()),
  education: z.array(z.object({
    degree: z.string(),
    institution: z.string().optional(),
    yearOfGraduation: z.string().optional(),
    fieldOfStudy: z.string().optional()
  })),
  projects: z.array(z.object({
    title: z.string(),
    description: z.string(),
    technologies: z.array(z.string()),
    highlights: z.array(z.string()).optional()
  })),
  workExperience: z.array(z.object({
    role: z.string(),
    company: z.string(),
    duration: z.string().optional(),
    responsibilities: z.array(z.string())
  })),
  internships: z.array(z.object({
    role: z.string(),
    company: z.string(),
    duration: z.string().optional(),
    responsibilities: z.array(z.string())
  })),
  certifications: z.array(z.string()),
  achievements: z.array(z.string()),
  rawTextLength: z.number()
});
export type ExtractedResume = z.infer<typeof ExtractedResumeSchema>;

export const JobRequirementsExtractionSchema = z.object({
  jobId: z.string(),
  jobTitle: z.string(),
  company: z.string(),
  requiredSkills: z.array(z.string()),
  preferredSkills: z.array(z.string()),
  experienceRequirements: z.string(),
  educationRequirements: z.string(),
  coreResponsibilities: z.array(z.string()),
  isDescriptionComplete: z.boolean(),
  warningMessage: z.string().optional()
});
export type JobRequirementsExtraction = z.infer<typeof JobRequirementsExtractionSchema>;

export const ScoringWeightsSchema = z.object({
  requiredSkills: z.number().default(0.35),
  relevantExperienceProjects: z.number().default(0.25),
  roleAlignment: z.number().default(0.15),
  educationEligibility: z.number().default(0.10),
  keywords: z.number().default(0.10),
  evidenceQuality: z.number().default(0.05)
});
export type ScoringWeights = z.infer<typeof ScoringWeightsSchema>;

export const MatchAnalysisResultSchema = z.object({
  matchId: z.string(),
  jobId: z.string(),
  jobTitle: z.string(),
  company: z.string(),
  overallScore: z.number().min(0).max(100),
  scoreCategory: z.enum(['HIGH', 'MODERATE', 'GROWTH_OPPORTUNITY']),
  scoringBreakdown: z.object({
    requiredSkillsScore: z.number(),      // 0 - 35
    experienceProjectsScore: z.number(),  // 0 - 25
    roleAlignmentScore: z.number(),       // 0 - 15
    educationScore: z.number(),           // 0 - 10
    keywordDensityScore: z.number(),      // 0 - 10
    evidenceQualityScore: z.number()      // 0 - 5
  }),
  weightsUsed: ScoringWeightsSchema,
  skillAnalysis: z.array(SkillMatchItemSchema),
  requiredSkillsMatchedCount: z.number(),
  requiredSkillsTotalCount: z.number(),
  preferredSkillsMatchedCount: z.number(),
  preferredSkillsTotalCount: z.number(),
  missingMandatoryRequirements: z.array(z.string()),
  strongestProjectEvidence: z.array(z.object({
    projectTitle: z.string(),
    alignmentReason: z.string(),
    relevantTechnologies: z.array(z.string())
  })),
  experienceAlignmentAssessment: z.string(),
  educationAlignmentAssessment: z.string(),
  actionableRecommendations: z.array(z.object({
    priority: z.enum(['HIGH', 'MEDIUM', 'LOW']),
    category: z.string(),
    advice: z.string(),
    concreteExample: z.string()
  })),
  disclaimer: z.string(),
  analyzedAt: z.string()
});
export type MatchAnalysisResult = z.infer<typeof MatchAnalysisResultSchema>;
