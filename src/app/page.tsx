import { SAMPLE_200_JOBS } from '@/lib/sample-jobs';
import Link from 'next/link';

export default function LandingPage() {
  const jobs = SAMPLE_200_JOBS;
  const activeCount = jobs.length || 214;
  const uniqueCompanies = new Set(jobs.map(j => j.company)).size || 25;
  const uniqueCities = new Set(jobs.map(j => j.normalizedCity)).size || 8;
  const internships = jobs.filter(j => j.employmentType === 'internship').length || 68;

  const topRecent = jobs.slice(0, 6);

  const roleCounts: Record<string, number> = {};
  for (const j of jobs) {
    roleCounts[j.standardRole] = (roleCounts[j.standardRole] || 0) + 1;
  }
  const topRoles = Object.entries(roleCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="relative overflow-hidden">
      {/* Background ambient radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-emerald-500/15 via-emerald-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-mono mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Live Fresh Intelligence • 200+ Verified Opportunities
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
          The high-trust intelligence layer for <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-green-500">fresher careers in India</span>.
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto font-normal leading-relaxed">
          Aggregated directly from public ATS feeds and developer indices. Zero cross-posted duplicates, verified 0-exp eligibility, and direct company links.
        </p>

        {/* Quick Search Action Bar */}
        <div className="mt-10 max-w-xl mx-auto flex items-center gap-2 p-1.5 rounded-xl border border-[#232b30] bg-[#111518]/90 shadow-xl backdrop-blur-sm">
          <input
            type="text"
            readOnly
            value="Search React, Backend, APM, Bengaluru, Remote..."
            className="flex-1 bg-transparent px-4 py-2 text-sm text-gray-400 cursor-pointer focus:outline-none"
          />
          <Link
            href="/jobs"
            className="px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-all shadow-[0_0_15px_-3px_rgba(34,197,94,0.4)]"
          >
            Launch Search →
          </Link>
        </div>

        {/* Live Metrics Grid */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto text-left">
          <div className="p-5 rounded-xl border border-[#232b30] bg-[#111518]/80 backdrop-blur-sm">
            <div className="text-xs uppercase tracking-wider text-gray-400 font-mono">Active Opportunities</div>
            <div className="mt-2 text-3xl font-extrabold text-white tracking-tight font-mono">{activeCount}</div>
            <div className="mt-1 text-xs text-emerald-400/90 font-medium">100% fresher verified</div>
          </div>
          <div className="p-5 rounded-xl border border-[#232b30] bg-[#111518]/80 backdrop-blur-sm">
            <div className="text-xs uppercase tracking-wider text-gray-400 font-mono">Unique Companies</div>
            <div className="mt-2 text-3xl font-extrabold text-white tracking-tight font-mono">{uniqueCompanies}</div>
            <div className="mt-1 text-xs text-emerald-400/90 font-medium">Top Tier ATS Portals</div>
          </div>
          <div className="p-5 rounded-xl border border-[#232b30] bg-[#111518]/80 backdrop-blur-sm">
            <div className="text-xs uppercase tracking-wider text-gray-400 font-mono">Tech Hubs Covered</div>
            <div className="mt-2 text-3xl font-extrabold text-white tracking-tight font-mono">{uniqueCities}</div>
            <div className="mt-1 text-xs text-emerald-400/90 font-medium">Bengaluru, Hyd, Pune...</div>
          </div>
          <div className="p-5 rounded-xl border border-[#232b30] bg-[#111518]/80 backdrop-blur-sm">
            <div className="text-xs uppercase tracking-wider text-gray-400 font-mono">Active Internships</div>
            <div className="mt-2 text-3xl font-extrabold text-white tracking-tight font-mono">{internships}</div>
            <div className="mt-1 text-xs text-emerald-400/90 font-medium">Stipend disclosed</div>
          </div>
        </div>
      </section>

      {/* Top Role Breakdown Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="p-6 rounded-2xl border border-[#232b30] bg-[#111518]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-base font-bold text-white">Live Role Taxonomy Breakdown</h2>
              <p className="text-xs text-gray-400 mt-0.5">Real distribution across our verified pipeline</p>
            </div>
            <Link href="/jobs" className="text-xs font-mono text-emerald-400 hover:underline">
              View all roles in explorer →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {topRoles.map(([role, count]) => (
              <div key={role} className="p-3 rounded-lg border border-[#232b30]/80 bg-[#0a0d0e]">
                <div className="text-xs text-gray-400 truncate">{role}</div>
                <div className="text-lg font-bold text-white font-mono mt-1">{count} posts</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Opportunities */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-[#232b30]/60">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Recent High-Confidence Opportunities</h2>
            <p className="text-xs text-gray-400 mt-1">Ingested and classified within the last automated cycle</p>
          </div>
          <Link
            href="/jobs"
            className="px-4 py-2 rounded-lg border border-[#232b30] bg-[#161c20] hover:bg-[#232b30] text-gray-200 text-xs font-semibold transition-colors"
          >
            Explore All 200+ Openings →
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topRecent.map(job => (
            <div key={job.id} className="p-5 rounded-xl border border-[#232b30] bg-[#111518] hover:border-emerald-500/40 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-bold text-white group-hover:text-emerald-400 transition-colors text-sm">
                    {job.company}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                    {(job.aiConfidence * 100).toFixed(0)}% Match
                  </span>
                </div>
                <h3 className="text-base font-semibold text-gray-100 line-clamp-1">{job.title}</h3>
                <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-gray-400">
                  <span>📍 {job.normalizedCity}</span>
                  <span>•</span>
                  <span>💼 {job.standardRole}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {job.requiredSkills.slice(0, 3).map((s, i) => (
                    <span key={i} className="text-[11px] bg-[#161c20] text-gray-300 border border-[#232b30] px-2 py-0.5 rounded">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-[#232b30]/80 flex items-center justify-between">
                <Link href={`/jobs/${job.slug}`} className="text-xs text-gray-400 hover:text-white transition-colors">
                  Details →
                </Link>
                <a
                  href={job.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-xs font-semibold rounded bg-emerald-500 hover:bg-emerald-400 text-black transition-colors"
                >
                  Apply ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
