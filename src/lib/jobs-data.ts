import fs from 'fs';
import path from 'path';

export interface StaticJob {
  id: string;
  slug: string;
  title: string;
  company: string;
  companySlug: string;
  description: string;
  descriptionSnippet: string;
  applyUrl: string;
  sourceName: string;
  sourceType: string;
  standardRole: string;
  normalizedCity: string;
  workMode: 'remote' | 'onsite' | 'hybrid';
  employmentType: 'full_time' | 'internship';
  isFresherEligible: boolean;
  minExperienceYears: number;
  maxExperienceYears: number;
  targetGraduationYears: number[];
  requiredSkills: string[];
  aiConfidence: number;
  aiReasoning: string;
  promptVersion: string;
  isDuplicate: boolean;
  discoveredAt: string;
  isActive: boolean;
}

let cachedJobs: StaticJob[] | null = null;

export function getLocalJobs(): StaticJob[] {
  if (cachedJobs) return cachedJobs;

  try {
    const directPath = path.resolve(process.cwd(), '../data/seed-jobs.json');
    const localPath = path.resolve(process.cwd(), 'data/seed-jobs.json');
    const target = fs.existsSync(directPath) ? directPath : fs.existsSync(localPath) ? localPath : null;

    if (target) {
      const content = fs.readFileSync(target, 'utf-8');
      cachedJobs = JSON.parse(content);
      return cachedJobs || [];
    }
  } catch {
    // Return empty array on failure
  }
  return [];
}

export function getJobBySlug(slug: string): StaticJob | undefined {
  const jobs = getLocalJobs();
  return jobs.find(j => j.slug === slug);
}
