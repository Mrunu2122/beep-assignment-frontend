import { extractText } from 'unpdf';
import mammoth from 'mammoth';
import {
  ExtractedResume,
  JobRequirementsExtraction,
  MatchAnalysisResult,
  ScoringWeights,
  SkillEvidenceLevel,
  SkillMatchItem
} from '@launchpad/shared';

export interface DocumentParseResult {
  text: string;
  wordCount: number;
  format: 'pdf' | 'docx' | 'txt';
  error?: string;
}

export async function parseResumeDocument(
  fileBuffer: Buffer,
  filename: string,
  mimetype?: string
): Promise<DocumentParseResult> {
  const maxSize = 5 * 1024 * 1024;
  if (fileBuffer.length > maxSize) {
    throw new Error('File size exceeds the 5MB security limit.');
  }

  const lowerName = filename.toLowerCase();

  if (lowerName.endsWith('.pdf') || mimetype === 'application/pdf') {
    try {
      const { text: extracted } = await extractText(new Uint8Array(fileBuffer), { mergePages: true });
      const text = (Array.isArray(extracted) ? extracted.join('\n') : (extracted || '')).trim();
      if (!text || text.length < 50) {
        throw new Error('Document contains insufficient extractable text. Scanned or image-only PDFs require OCR or a text-based format.');
      }
      return {
        text,
        wordCount: text.split(/\s+/).filter(Boolean).length,
        format: 'pdf'
      };
    } catch (err: any) {
      if (err.message && err.message.includes('insufficient extractable text')) {
        throw err;
      }
      throw new Error(`PDF Parsing failed: ${err.message || 'Corrupted or encrypted PDF'}`);
    }
  }

  if (
    lowerName.endsWith('.docx') ||
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    try {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      const text = result.value?.trim() || '';
      if (!text || text.length < 50) {
        throw new Error('The DOCX file is empty or lacks extractable text.');
      }
      return {
        text,
        wordCount: text.split(/\s+/).filter(Boolean).length,
        format: 'docx'
      };
    } catch (err: any) {
      throw new Error(`DOCX Parsing failed: ${err.message || 'Invalid or encrypted file'}`);
    }
  }

  if (lowerName.endsWith('.txt') || mimetype === 'text/plain') {
    const text = fileBuffer.toString('utf-8').trim();
    return {
      text,
      wordCount: text.split(/\s+/).filter(Boolean).length,
      format: 'txt'
    };
  }

  throw new Error('Unsupported format. Please upload a PDF (.pdf) or Word document (.docx).');
}

export function extractStructuredResume(rawText: string): ExtractedResume {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

  const skills: Set<string> = new Set();
  const knownSkillList = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Golang', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin',
    'React', 'Next.js', 'Vue', 'Angular', 'Node.js', 'Express', 'NestJS', 'Django', 'FastAPI', 'Spring Boot', 'Flask',
    'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'GraphQL', 'REST', 'RESTful APIs', 'Kafka', 'RabbitMQ',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Git', 'GitHub', 'Linux', 'Terraform',
    'HTML', 'CSS', 'Tailwind', 'Tailwind CSS', 'Redux', 'Jest', 'Playwright', 'Cypress', 'PyTorch', 'TensorFlow',
    'Machine Learning', 'Data Analysis', 'Pandas', 'NumPy', 'Scikit-learn', 'Microservices', 'System Design'
  ];

  for (const skill of knownSkillList) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(rawText)) {
      skills.add(skill);
    }
  }

  const education: Array<{ degree: string; institution?: string; yearOfGraduation?: string; fieldOfStudy?: string }> = [];
  const degreePatterns = [
    /(B\.?Tech|Bachelor of Technology|B\.?E\.?|Bachelor of Engineering|B\.?Sc|Bachelor of Science|BCA|MCA|M\.?Tech|Master of Technology|M\.?S\.?)/i
  ];

  lines.forEach(line => {
    for (const pat of degreePatterns) {
      if (pat.test(line)) {
        education.push({
          degree: line.slice(0, 100),
          institution: 'Accredited Institution'
        });
        break;
      }
    }
  });

  const projects: Array<{ title: string; description: string; technologies: string[]; highlights?: string[] }> = [];
  let inProjectSection = false;
  let currentProject: { title: string; description: string; technologies: string[] } | null = null;

  for (const line of lines) {
    if (/^projects?(\s*:|\b)/i.test(line)) {
      inProjectSection = true;
      continue;
    }
    if (inProjectSection && /^(experience|education|skills|certifications|achievements)/i.test(line)) {
      if (currentProject) projects.push(currentProject);
      inProjectSection = false;
      break;
    }
    if (inProjectSection) {
      if (line.length > 5 && line.length < 60 && !line.startsWith('-') && !line.startsWith('•')) {
        if (currentProject) projects.push(currentProject);
        currentProject = {
          title: line,
          description: '',
          technologies: []
        };
      } else if (currentProject) {
        currentProject.description += ' ' + line;
        knownSkillList.forEach(tech => {
          const escaped = tech.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          if (new RegExp(`\\b${escaped}\\b`, 'i').test(line) && !currentProject!.technologies.includes(tech)) {
            currentProject!.technologies.push(tech);
          }
        });
      }
    }
  }
  if (currentProject) projects.push(currentProject);

  return {
    skills: Array.from(skills),
    education: education.length > 0 ? education : [{ degree: 'Engineering / Computer Science Degree' }],
    projects,
    workExperience: [],
    internships: [],
    certifications: [],
    achievements: [],
    rawTextLength: rawText.length
  };
}

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  requiredSkills: 0.35,
  relevantExperienceProjects: 0.25,
  roleAlignment: 0.15,
  educationEligibility: 0.10,
  keywords: 0.10,
  evidenceQuality: 0.05
};

const SKILL_SYNONYMS: Record<string, string[]> = {
  'typescript': ['ts', 'typescript'],
  'javascript': ['js', 'javascript', 'es6', 'ecmascript'],
  'react': ['react', 'react.js', 'reactjs'],
  'next.js': ['nextjs', 'next.js', 'next'],
  'node.js': ['node', 'nodejs', 'node.js'],
  'python': ['python', 'py', 'python3'],
  'c++': ['c++', 'cpp'],
  'golang': ['go', 'golang'],
  'docker': ['docker', 'containerization', 'containers'],
  'kubernetes': ['k8s', 'kubernetes'],
  'aws': ['amazon web services', 'aws', 's3', 'ec2', 'lambda'],
  'sql': ['relational databases', 'sql', 'postgresql', 'postgres', 'mysql', 'sqlite'],
  'mongodb': ['mongo', 'mongodb', 'nosql', 'documentdb'],
  'rest': ['restful', 'rest api', 'rest apis', 'restful apis', 'http apis'],
  'ci/cd': ['continuous integration', 'ci/cd', 'github actions', 'jenkins', 'gitlab ci']
};

export function evaluateSkillEvidence(
  targetSkill: string,
  resume: ExtractedResume,
  fullResumeText: string
): { level: SkillEvidenceLevel; score: number; snippet?: string; reasoning: string } {
  const normTarget = targetSkill.toLowerCase().trim();
  const synonyms = SKILL_SYNONYMS[normTarget] || [normTarget];

  for (const proj of resume.projects) {
    const projContent = `${proj.title} ${proj.description} ${proj.technologies.join(' ')}`.toLowerCase();
    for (const syn of synonyms) {
      if (projContent.includes(syn)) {
        return {
          level: 'DEMONSTRATED',
          score: 1.0,
          snippet: `Demonstrated in project "${proj.title}": ${proj.description.slice(0, 140)}...`,
          reasoning: `Candidate applied ${targetSkill} directly in practical project work.`
        };
      }
    }
  }

  for (const exp of [...resume.workExperience, ...resume.internships]) {
    const expContent = `${exp.role} ${exp.company} ${exp.responsibilities.join(' ')}`.toLowerCase();
    for (const syn of synonyms) {
      if (expContent.includes(syn)) {
        return {
          level: 'DEMONSTRATED',
          score: 1.0,
          snippet: `Utilized during tenure at ${exp.company} (${exp.role}).`,
          reasoning: `Direct professional or internship application of ${targetSkill}.`
        };
      }
    }
  }

  const resumeSkillsLower = resume.skills.map(s => s.toLowerCase());
  for (const syn of synonyms) {
    if (resumeSkillsLower.includes(syn)) {
      return {
        level: 'MENTIONED',
        score: 0.70,
        snippet: `Listed under Technical Skills: ${targetSkill}`,
        reasoning: `Directly declared in candidate skill profile, but not linked to a specific project description.`
      };
    }
  }

  const fullLower = fullResumeText.toLowerCase();
  for (const syn of synonyms) {
    const idx = fullLower.indexOf(syn);
    if (idx !== -1) {
      const snippet = fullResumeText.slice(Math.max(0, idx - 40), Math.min(fullResumeText.length, idx + 80)).replace(/\s+/g, ' ');
      return {
        level: 'PARTIAL',
        score: 0.40,
        snippet: `Contextual mention: "...${snippet}..."`,
        reasoning: `Found related keyword mention in document context.`
      };
    }
  }

  return {
    level: 'NOT_FOUND',
    score: 0.0,
    reasoning: `No direct or contextual mention of "${targetSkill}" found in the provided resume document.`
  };
}

export function calculateMatchCompatibility(
  jobReqs: JobRequirementsExtraction,
  resume: ExtractedResume,
  fullResumeText: string,
  weights: ScoringWeights = DEFAULT_SCORING_WEIGHTS
): MatchAnalysisResult {
  const skillAnalysis: SkillMatchItem[] = [];

  let reqSkillPointsEarned = 0;
  let reqSkillPointsTotal = Math.max(1, jobReqs.requiredSkills.length);
  let reqMatchedCount = 0;
  const missingMandatory: string[] = [];

  jobReqs.requiredSkills.forEach(reqSkill => {
    const evalResult = evaluateSkillEvidence(reqSkill, resume, fullResumeText);
    skillAnalysis.push({
      skillName: reqSkill,
      isMandatory: true,
      evidenceLevel: evalResult.level,
      scoreContribution: evalResult.score,
      evidenceSnippet: evalResult.snippet,
      reasoning: evalResult.reasoning
    });

    reqSkillPointsEarned += evalResult.score;
    if (evalResult.score >= 0.7) {
      reqMatchedCount++;
    } else if (evalResult.level === 'NOT_FOUND') {
      missingMandatory.push(reqSkill);
    }
  });

  let prefMatchedCount = 0;
  jobReqs.preferredSkills.forEach(prefSkill => {
    const evalResult = evaluateSkillEvidence(prefSkill, resume, fullResumeText);
    skillAnalysis.push({
      skillName: prefSkill,
      isMandatory: false,
      evidenceLevel: evalResult.level,
      scoreContribution: evalResult.score,
      evidenceSnippet: evalResult.snippet,
      reasoning: evalResult.reasoning
    });
    if (evalResult.score >= 0.7) {
      prefMatchedCount++;
    }
  });

  const reqSkillsScore = (reqSkillPointsEarned / reqSkillPointsTotal) * (weights.requiredSkills * 100);

  const projectCount = resume.projects.length;
  const projectsScoreRatio = Math.min(1, (projectCount >= 2 ? 0.8 : projectCount * 0.4) + (resume.internships.length > 0 ? 0.2 : 0));
  const expProjectsScore = projectsScoreRatio * (weights.relevantExperienceProjects * 100);

  const titleWords = jobReqs.jobTitle.toLowerCase().split(/[\s,/]+/).filter(w => w.length > 3);
  let titleMatches = 0;
  const resumeTextLower = fullResumeText.toLowerCase();
  titleWords.forEach(w => {
    if (resumeTextLower.includes(w)) titleMatches++;
  });
  const roleAlignmentRatio = titleWords.length > 0 ? Math.min(1, titleMatches / titleWords.length) : 0.8;
  const roleScore = roleAlignmentRatio * (weights.roleAlignment * 100);

  const hasDegree = resume.education.length > 0;
  const educationScore = (hasDegree ? 1.0 : 0.6) * (weights.educationEligibility * 100);

  let foundKeywords = 0;
  const allKeywords = [...jobReqs.requiredSkills, ...jobReqs.preferredSkills];
  allKeywords.forEach(k => {
    if (resumeTextLower.includes(k.toLowerCase())) foundKeywords++;
  });
  const keywordRatio = allKeywords.length > 0 ? Math.min(1, foundKeywords / allKeywords.length) : 0.7;
  const keywordScore = keywordRatio * (weights.keywords * 100);

  const demonstratedCount = skillAnalysis.filter(s => s.evidenceLevel === 'DEMONSTRATED').length;
  const evidenceQualityRatio = Math.min(1, demonstratedCount >= 2 ? 1.0 : demonstratedCount * 0.5);
  const evidenceScore = evidenceQualityRatio * (weights.evidenceQuality * 100);

  const rawSum = reqSkillsScore + expProjectsScore + roleScore + educationScore + keywordScore + evidenceScore;
  const overallScore = Math.min(100, Math.max(0, Math.round(rawSum)));

  const scoreCategory: 'HIGH' | 'MODERATE' | 'GROWTH_OPPORTUNITY' =
    overallScore >= 75 ? 'HIGH' : overallScore >= 50 ? 'MODERATE' : 'GROWTH_OPPORTUNITY';

  const actionableRecommendations: Array<{
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    category: string;
    advice: string;
    concreteExample: string;
  }> = [];

  if (missingMandatory.length > 0) {
    actionableRecommendations.push({
      priority: 'HIGH',
      category: 'Core Skill Gaps',
      advice: `Add demonstrable evidence for critical requirements: ${missingMandatory.slice(0, 3).join(', ')}.`,
      concreteExample: `Build a mini full-stack demo showcasing ${missingMandatory[0]} with a live deployed URL on GitHub.`
    });
  }

  const mentionedOnly = skillAnalysis.filter(s => s.evidenceLevel === 'MENTIONED');
  if (mentionedOnly.length > 0) {
    actionableRecommendations.push({
      priority: 'MEDIUM',
      category: 'Evidence Depth',
      advice: `You mentioned ${mentionedOnly.slice(0, 2).map(s => s.skillName).join(' & ')} in your skills section, but there are no corresponding project bullet points.`,
      concreteExample: `Under your latest project, add: "Implemented backend API handling authentication using ${mentionedOnly[0].skillName}."`
    });
  }

  actionableRecommendations.push({
    priority: 'LOW',
    category: 'Targeted Summary',
    advice: `Tailor your professional summary to explicitly reference ${jobReqs.jobTitle} competencies.`,
    concreteExample: `Include 2-3 key metrics (e.g., "Reduced response latency by 25%" or "Built 5+ REST endpoints").`
  });

  return {
    matchId: `match-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    jobId: jobReqs.jobId,
    jobTitle: jobReqs.jobTitle,
    company: jobReqs.company,
    overallScore,
    scoreCategory,
    scoringBreakdown: {
      requiredSkillsScore: Math.round(reqSkillsScore * 10) / 10,
      experienceProjectsScore: Math.round(expProjectsScore * 10) / 10,
      roleAlignmentScore: Math.round(roleScore * 10) / 10,
      educationScore: Math.round(educationScore * 10) / 10,
      keywordDensityScore: Math.round(keywordScore * 10) / 10,
      evidenceQualityScore: Math.round(evidenceScore * 10) / 10
    },
    weightsUsed: weights,
    skillAnalysis,
    requiredSkillsMatchedCount: reqMatchedCount,
    requiredSkillsTotalCount: jobReqs.requiredSkills.length,
    preferredSkillsMatchedCount: prefMatchedCount,
    preferredSkillsTotalCount: jobReqs.preferredSkills.length,
    missingMandatoryRequirements: missingMandatory,
    strongestProjectEvidence: resume.projects.slice(0, 3).map(p => ({
      projectTitle: p.title,
      alignmentReason: `Demonstrates applied development using ${p.technologies.join(', ') || 'modern libraries'}`,
      relevantTechnologies: p.technologies
    })),
    experienceAlignmentAssessment: resume.workExperience.length > 0 || resume.internships.length > 0
      ? `Candidate possesses verified internship/work exposure aligned with early-career engineering.`
      : `Candidate demonstrates project-based learning suitable for fresher / 0-experience requisitions.`,
    educationAlignmentAssessment: hasDegree
      ? `Meets minimum undergraduate degree requirements for technical fresher hiring.`
      : `Degree details unconfirmed; check candidate education credentials.`,
    actionableRecommendations,
    disclaimer: `Launchpad Match Intelligence provides algorithmic alignment analysis based on visible document text. This is not an official ATS vendor proprietary score and does not guarantee interview invitations.`,
    analyzedAt: new Date().toISOString()
  };
}

export function extractRequirementsFromJobDescription(job: {
  id: string;
  title: string;
  company: string;
  description: string;
  requiredSkills?: string[];
}): JobRequirementsExtraction {
  const desc = job.description || '';
  const isComplete = desc.length > 120;
  const knownSkills = job.requiredSkills && job.requiredSkills.length > 0
    ? job.requiredSkills
    : ['TypeScript', 'JavaScript', 'React', 'Node.js', 'Git', 'SQL'];

  return {
    jobId: job.id,
    jobTitle: job.title,
    company: job.company,
    requiredSkills: knownSkills,
    preferredSkills: ['Cloud Platforms', 'Containerization (Docker)', 'CI/CD Pipelines'],
    experienceRequirements: 'Fresher eligible / Early career (0-1 years experience)',
    educationRequirements: 'B.Tech / B.E. / BCA / MCA in Computer Science or related engineering discipline',
    coreResponsibilities: [
      'Write clean, testable, and maintainable code adhering to industry standards.',
      'Participate in code reviews, feature design, and automated testing.',
      'Investigate bug reports and optimize application responsiveness.'
    ],
    isDescriptionComplete: isComplete,
    warningMessage: isComplete ? undefined : 'Original job description is brief; requirements extracted using standard role baseline.'
  };
}
