'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { SAMPLE_200_JOBS } from '@/lib/sample-jobs';

interface SkillAnalysisItem {
  skillName: string;
  isMandatory: boolean;
  evidenceLevel: 'DEMONSTRATED' | 'MENTIONED' | 'PARTIAL' | 'NOT_FOUND' | 'NOT_ASSESSABLE';
  scoreContribution: number;
  evidenceSnippet?: string;
  reasoning: string;
}

interface MatchResult {
  matchId: string;
  jobId: string;
  jobTitle: string;
  company: string;
  overallScore: number;
  scoreCategory: 'HIGH' | 'MODERATE' | 'GROWTH_OPPORTUNITY';
  scoringBreakdown: {
    requiredSkillsScore: number;
    experienceProjectsScore: number;
    roleAlignmentScore: number;
    educationScore: number;
    keywordDensityScore: number;
    evidenceQualityScore: number;
  };
  skillAnalysis: SkillAnalysisItem[];
  requiredSkillsMatchedCount: number;
  requiredSkillsTotalCount: number;
  preferredSkillsMatchedCount: number;
  preferredSkillsTotalCount: number;
  missingMandatoryRequirements: string[];
  strongestProjectEvidence: Array<{
    projectTitle: string;
    alignmentReason: string;
    relevantTechnologies: string[];
  }>;
  experienceAlignmentAssessment: string;
  educationAlignmentAssessment: string;
  actionableRecommendations: Array<{
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    category: string;
    advice: string;
    concreteExample: string;
  }>;
  disclaimer: string;
  analyzedAt: string;
}

function MatchContent() {
  const searchParams = useSearchParams();
  const initialJobId = searchParams.get('jobId') || '';

  const [availableJobs, setAvailableJobs] = useState<any[]>(SAMPLE_200_JOBS);
  const [selectedJobId, setSelectedJobId] = useState<string>(initialJobId || SAMPLE_200_JOBS[0]?.id || '');
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [useTextInput, setUseTextInput] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchJobQuery, setSearchJobQuery] = useState('');

  // Fetch live jobs from Supabase API
  useEffect(() => {
    async function loadRealJobs() {
      try {
        const res = await fetch('/api/jobs');
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json) && json.length > 0) {
            setAvailableJobs(json);
            if (!initialJobId) {
              setSelectedJobId(json[0].id);
            }
          }
        }
      } catch {
        // Fallback already defaults to SAMPLE_200_JOBS
      }
    }
    loadRealJobs();
  }, [initialJobId]);

  useEffect(() => {
    const qJobId = searchParams.get('jobId');
    if (qJobId) {
      setSelectedJobId(qJobId);
    }
  }, [searchParams]);

  const filteredJobs = useMemo(() => {
    if (!searchJobQuery) return availableJobs.slice(0, 50);
    const q = searchJobQuery.toLowerCase();
    return availableJobs.filter(
      j => j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q)
    ).slice(0, 50);
  }, [searchJobQuery, availableJobs]);

  const activeJob = useMemo(() => {
    return availableJobs.find(j => j.id === selectedJobId || j.slug === selectedJobId) || availableJobs[0] || SAMPLE_200_JOBS[0];
  }, [selectedJobId, availableJobs]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.size > 5 * 1024 * 1024) {
        setError('File size must be under 5MB.');
        return;
      }
      setFile(selected);
      setError(null);
    }
  };

  const handleRunMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsAnalyzing(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('jobId', selectedJobId);

      if (useTextInput) {
        if (!pastedText.trim() || pastedText.trim().length < 50) {
          throw new Error('Please enter at least 50 characters of resume content.');
        }
        formData.append('resumeText', pastedText);
      } else {
        if (!file) {
          throw new Error('Please select a PDF or DOCX resume document to evaluate.');
        }
        formData.append('file', file);
      }

      const res = await fetch('/api/match', {
        method: 'POST',
        body: formData,
      });

      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('Server returned invalid response format. Please verify file content.');
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to complete resume compatibility analysis.');
      }

      setResult(data.analysis);
    } catch (err: any) {
      setError(err.message || 'An error occurred during evaluation.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-10 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-mono mb-4">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Transparent Requirement Evidence • In-Memory Privacy Preserved
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Launchpad <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500">Match Intelligence</span>
        </h1>
        <p className="mt-3 text-sm sm:text-base text-gray-300 leading-relaxed">
          Test candidate alignment against real verified opportunity requirements. 
          Evidence-backed scoring across mandatory requirements, applied projects, and role fitness.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Column: Job Selection & Resume Upload */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl border border-[#232b30] bg-[#111518]/90">
            <h2 className="text-sm font-mono uppercase tracking-wider text-emerald-400 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2"><span>1.</span> Target Opportunity</span>
              <Link href="/jobs" className="text-[11px] text-gray-400 hover:text-emerald-400 lowercase font-sans">
                browse all →
              </Link>
            </h2>

            <div className="mb-3">
              <input
                type="text"
                placeholder="Filter target jobs..."
                value={searchJobQuery}
                onChange={e => setSearchJobQuery(e.target.value)}
                className="w-full bg-[#0a0d0e] border border-[#232b30] rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {filteredJobs.map(job => (
                <div
                  key={job.id}
                  onClick={() => setSelectedJobId(job.id)}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                    selectedJobId === job.id
                      ? 'border-emerald-500/70 bg-emerald-950/20'
                      : 'border-[#232b30] bg-[#0a0d0e] hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">{job.company}</span>
                    <span className="text-[10px] font-mono text-emerald-400">📍 {job.normalizedCity}</span>
                  </div>
                  <div className="text-xs text-gray-300 mt-1 line-clamp-1">{job.title}</div>
                </div>
              ))}
            </div>

            {activeJob && (
              <div className="mt-4 p-3.5 rounded-lg bg-[#0a0d0e] border border-[#232b30] text-xs">
                <div className="text-emerald-400 font-mono text-[10px] uppercase font-semibold">Active Selection:</div>
                <div className="text-white font-bold text-sm mt-0.5">{activeJob.title}</div>
                <div className="text-gray-300 font-medium text-xs">{activeJob.company} • 📍 {activeJob.normalizedCity}</div>
                <div className="text-gray-400 text-[11px] mt-1.5 flex flex-wrap gap-1">
                  {activeJob.requiredSkills?.slice(0, 4).map((s: string, i: number) => (
                    <span key={i} className="px-1.5 py-0.5 rounded bg-[#161c20] text-gray-300 text-[10px] border border-[#232b30]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Upload Box */}
          <div className="p-6 rounded-2xl border border-[#232b30] bg-[#111518]/90">
            <h2 className="text-sm font-mono uppercase tracking-wider text-emerald-400 mb-4 flex items-center gap-2">
              <span>2.</span> Upload Resume Document
            </h2>

            <div className="flex items-center gap-3 mb-4 text-xs font-mono">
              <button
                type="button"
                onClick={() => setUseTextInput(false)}
                className={`px-3 py-1.5 rounded-lg border transition-colors ${
                  !useTextInput
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-semibold'
                    : 'border-[#232b30] text-gray-400 hover:text-white'
                }`}
              >
                Upload PDF / DOCX
              </button>
              <button
                type="button"
                onClick={() => setUseTextInput(true)}
                className={`px-3 py-1.5 rounded-lg border transition-colors ${
                  useTextInput
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-semibold'
                    : 'border-[#232b30] text-gray-400 hover:text-white'
                }`}
              >
                Paste Text
              </button>
            </div>

            {!useTextInput ? (
              <div className="border-2 border-dashed border-[#232b30] rounded-xl p-6 text-center hover:border-emerald-500/40 transition-colors">
                <input
                  type="file"
                  id="resume-file-input"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="resume-file-input" className="cursor-pointer block">
                  <div className="text-3xl mb-2">📄</div>
                  <div className="text-xs font-semibold text-gray-200">
                    {file ? file.name : 'Click to select PDF or DOCX file'}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-1 font-mono">
                    Max size: 5MB • Never stored permanently
                  </div>
                </label>
              </div>
            ) : (
              <div>
                <textarea
                  rows={6}
                  placeholder="Paste resume text directly (Skills, Education, Projects, Experience)..."
                  value={pastedText}
                  onChange={e => setPastedText(e.target.value)}
                  className="w-full bg-[#0a0d0e] border border-[#232b30] rounded-lg p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 rounded-lg bg-rose-950/30 border border-rose-900/50 text-rose-300 text-xs font-mono">
                ⚠️ {error}
              </div>
            )}

            <button
              onClick={handleRunMatch}
              disabled={isAnalyzing}
              className="w-full mt-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm transition-all shadow-[0_0_20px_-3px_rgba(34,197,94,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Evaluating Compatibility...
                </>
              ) : (
                'Run Compatibility Evaluation →'
              )}
            </button>

            <div className="mt-4 text-[11px] text-gray-500 leading-relaxed border-t border-[#232b30] pt-3">
              🔒 <strong className="text-gray-400">Privacy Guarantee:</strong> Documents are evaluated in-memory only. No resume text is logged or stored in the database.
            </div>
          </div>
        </div>

        {/* Right Column: Compatibility Results */}
        <div className="lg:col-span-7">
          {!result && !isAnalyzing && (
            <div className="p-12 rounded-2xl border border-dashed border-[#232b30] bg-[#111518]/50 text-center h-full flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-3xl mb-4">
                ⚡
              </div>
              <h3 className="text-base font-bold text-white">No Evaluation Executed Yet</h3>
              <p className="text-xs text-gray-400 max-w-sm mt-2 leading-relaxed">
                Select your target job posting, upload or paste your resume, and generate transparent evidence-backed compatibility insights.
              </p>
            </div>
          )}

          {isAnalyzing && (
            <div className="p-12 rounded-2xl border border-[#232b30] bg-[#111518] text-center space-y-4 animate-pulse">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="text-sm font-semibold text-white">Evaluating Resume vs. Sourced Requirements...</div>
              <p className="text-xs text-gray-400">
                Calculating mandatory skills (35%), project evidence (25%), and role alignment (15%) mathematically.
              </p>
            </div>
          )}

          {result && (
            <div className="space-y-6">
              {/* Overall Score Card */}
              <div className="p-6 rounded-2xl border border-[#232b30] bg-[#111518]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#232b30]">
                  <div>
                    <div className="text-xs font-mono uppercase text-gray-400">Compatibility Score</div>
                    <div className="flex items-baseline gap-3 mt-1">
                      <span className="text-5xl font-extrabold text-white font-mono">{result.overallScore}%</span>
                      <span className={`text-xs font-mono px-2.5 py-1 rounded border uppercase font-bold ${
                        result.scoreCategory === 'HIGH'
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                          : result.scoreCategory === 'MODERATE'
                          ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
                          : 'border-blue-500/40 bg-blue-500/10 text-blue-400'
                      }`}>
                        {result.scoreCategory.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="text-right sm:text-right text-xs text-gray-400 font-mono">
                    <div>Target: <span className="text-white font-semibold">{result.jobTitle}</span></div>
                    <div className="text-emerald-400 mt-0.5">{result.company}</div>
                  </div>
                </div>

                {/* Mathematical Weight Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-6">
                  <div className="p-3 rounded-lg bg-[#0a0d0e] border border-[#232b30]">
                    <div className="text-[10px] font-mono text-gray-500 uppercase">Req Skills (35%)</div>
                    <div className="text-sm font-bold text-white font-mono mt-1">
                      {result.scoringBreakdown.requiredSkillsScore} / 35
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0a0d0e] border border-[#232b30]">
                    <div className="text-[10px] font-mono text-gray-500 uppercase">Projects & Exp (25%)</div>
                    <div className="text-sm font-bold text-white font-mono mt-1">
                      {result.scoringBreakdown.experienceProjectsScore} / 25
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0a0d0e] border border-[#232b30]">
                    <div className="text-[10px] font-mono text-gray-500 uppercase">Role Fit (15%)</div>
                    <div className="text-sm font-bold text-white font-mono mt-1">
                      {result.scoringBreakdown.roleAlignmentScore} / 15
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0a0d0e] border border-[#232b30]">
                    <div className="text-[10px] font-mono text-gray-500 uppercase">Education (10%)</div>
                    <div className="text-sm font-bold text-white font-mono mt-1">
                      {result.scoringBreakdown.educationScore} / 10
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0a0d0e] border border-[#232b30]">
                    <div className="text-[10px] font-mono text-gray-500 uppercase">Keywords (10%)</div>
                    <div className="text-sm font-bold text-white font-mono mt-1">
                      {result.scoringBreakdown.keywordDensityScore} / 10
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0a0d0e] border border-[#232b30]">
                    <div className="text-[10px] font-mono text-gray-500 uppercase">Evidence (5%)</div>
                    <div className="text-sm font-bold text-white font-mono mt-1">
                      {result.scoringBreakdown.evidenceQualityScore} / 5
                    </div>
                  </div>
                </div>
              </div>

              {/* Verified Skills Evidence Matrix */}
              <div className="p-6 rounded-2xl border border-[#232b30] bg-[#111518]">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center justify-between">
                  <span>Requirement Evidence Matrix</span>
                  <span className="text-xs font-mono text-emerald-400 lowercase">
                    {result.requiredSkillsMatchedCount}/{result.requiredSkillsTotalCount} mandatory matched
                  </span>
                </h3>

                <div className="space-y-3">
                  {result.skillAnalysis.map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-[#232b30] bg-[#0a0d0e] text-xs">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{item.skillName}</span>
                          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                            item.isMandatory
                              ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                              : 'border-gray-700 text-gray-400'
                          }`}>
                            {item.isMandatory ? 'Required' : 'Preferred'}
                          </span>
                        </div>
                        <span className={`font-mono text-[10px] px-2 py-0.5 rounded font-semibold ${
                          item.evidenceLevel === 'DEMONSTRATED'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : item.evidenceLevel === 'MENTIONED'
                            ? 'bg-blue-500/20 text-blue-300'
                            : item.evidenceLevel === 'PARTIAL'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {item.evidenceLevel}
                        </span>
                      </div>
                      <p className="text-gray-400 text-[11px] leading-relaxed">{item.reasoning}</p>
                      {item.evidenceSnippet && (
                        <div className="mt-2 p-2 rounded bg-[#161c20] text-emerald-300 font-mono text-[10px] break-words">
                          Evidence: {item.evidenceSnippet}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actionable Recommendations */}
              <div className="p-6 rounded-2xl border border-[#232b30] bg-[#111518]">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                  Targeted Resume Improvements
                </h3>
                <div className="space-y-3">
                  {result.actionableRecommendations.map((rec, i) => (
                    <div key={i} className="p-4 rounded-xl border border-[#232b30] bg-[#0a0d0e]">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-emerald-400">{rec.category}</span>
                        <span className="text-[10px] font-mono text-gray-500 uppercase">{rec.priority} Priority</span>
                      </div>
                      <p className="text-xs text-gray-300 mt-1">{rec.advice}</p>
                      <div className="mt-2 p-2 rounded bg-[#161c20] text-gray-400 text-[11px] font-mono">
                        💡 Example: {rec.concreteExample}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Disclaimer */}
              <div className="p-4 rounded-xl border border-[#232b30] bg-[#0a0d0e] text-[11px] text-gray-500 leading-relaxed font-mono">
                ⚠️ {result.disclaimer}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MatchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <MatchContent />
    </Suspense>
  );
}
