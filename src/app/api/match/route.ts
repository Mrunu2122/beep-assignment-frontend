import { NextRequest, NextResponse } from 'next/server';
import {
  parseResumeDocument,
  extractStructuredResume,
  calculateMatchCompatibility,
  extractRequirementsFromJobDescription,
  DEFAULT_SCORING_WEIGHTS
} from '@/lib/match-service';
import { getJobByIdOrSlugAsync } from '@/lib/jobs-data';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const jobId = formData.get('jobId') as string | null;
    const resumeTextOverride = formData.get('resumeText') as string | null;

    if (!jobId) {
      return NextResponse.json({ error: 'Target jobId is required for match analysis.' }, { status: 400 });
    }

    const job = await getJobByIdOrSlugAsync(jobId);
    if (!job) {
      return NextResponse.json({ error: 'Selected job opportunity not found.' }, { status: 404 });
    }

    let rawResumeText = '';

    if (file && file.size > 0) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const parseResult = await parseResumeDocument(buffer, file.name, file.type);
      rawResumeText = parseResult.text;
    } else if (resumeTextOverride && resumeTextOverride.trim().length > 50) {
      rawResumeText = resumeTextOverride.trim();
    } else {
      return NextResponse.json({
        error: 'Please upload a valid PDF or DOCX file (or paste your resume text).'
      }, { status: 400 });
    }

    const structuredResume = extractStructuredResume(rawResumeText);

    const jobRequirements = extractRequirementsFromJobDescription({
      id: job.id,
      title: job.title,
      company: job.company,
      description: job.description,
      requiredSkills: job.requiredSkills
    });

    const analysis = calculateMatchCompatibility(
      jobRequirements,
      structuredResume,
      rawResumeText,
      DEFAULT_SCORING_WEIGHTS
    );

    return NextResponse.json({
      success: true,
      analysis,
      extractedOverview: {
        skillsCount: structuredResume.skills.length,
        projectsCount: structuredResume.projects.length,
        educationDegrees: structuredResume.education.map(e => e.degree)
      }
    });
  } catch (err: any) {
    return NextResponse.json({
      error: err.message || 'Failed to process resume match analysis.'
    }, { status: 500 });
  }
}
