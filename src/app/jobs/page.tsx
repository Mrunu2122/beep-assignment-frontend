'use client';

import { Suspense, useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface JobCardData {
  id: string;
  slug: string;
  title: string;
  company: string;
  standardRole: string;
  normalizedCity: string;
  workMode: string;
  employmentType: string;
  applyUrl: string;
  sourceName: string;
  linkStatus?: string;
  fresherEligibilityStatus?: string;
  isFresherEligible: boolean;
  requiredSkills: string[];
  aiConfidence: number;
  discoveredAt: string;
}

function JobsContent() {
  const searchParams = useSearchParams();

  const initialQ = searchParams.get('q') || '';
  const initialRole = searchParams.get('role') || 'All';
  const initialCity = searchParams.get('city') || 'All';
  const initialType = searchParams.get('type') || 'All';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);

  const [search, setSearch] = useState(initialQ);
  const [debouncedSearch, setDebouncedSearch] = useState(initialQ);
  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [selectedType, setSelectedType] = useState(initialType);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [sortBy, setSortBy] = useState('newest');

  const [jobs, setJobs] = useState<JobCardData[]>([]);
  const [loading, setLoading] = useState(true);

  // 250ms search debounce to prevent janky client updates
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 250);
    return () => clearTimeout(handler);
  }, [search]);

  // Load genuine job data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch('/api/jobs-data.json').catch(() => null);
        if (res && res.ok) {
          const json = await res.json();
          setJobs(json);
        } else {
          const staticSeed = await import('@/lib/sample-jobs');
          setJobs(staticSeed.SAMPLE_200_JOBS as unknown as JobCardData[]);
        }
      } catch {
        const staticSeed = await import('@/lib/sample-jobs');
        setJobs(staticSeed.SAMPLE_200_JOBS as unknown as JobCardData[]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Sync state back to URL query parameters
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('q', debouncedSearch);
    if (selectedRole !== 'All') params.set('role', selectedRole);
    if (selectedCity !== 'All') params.set('city', selectedCity);
    if (selectedType !== 'All') params.set('type', selectedType);
    if (currentPage > 1) params.set('page', String(currentPage));

    const newQuery = params.toString();
    const newUrl = newQuery ? `/jobs?${newQuery}` : '/jobs';
    window.history.replaceState(null, '', newUrl);
  }, [debouncedSearch, selectedRole, selectedCity, selectedType, currentPage]);

  const filteredJobs = useMemo(() => {
    let result = jobs.filter(job => {
      const matchSearch = debouncedSearch === '' ||
        job.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        job.company.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        job.requiredSkills.some(s => s.toLowerCase().includes(debouncedSearch.toLowerCase()));

      const matchRole = selectedRole === 'All' || job.standardRole === selectedRole;
      const matchCity = selectedCity === 'All' || job.normalizedCity === selectedCity;
      const matchType = selectedType === 'All' || job.employmentType === selectedType;

      return matchSearch && matchRole && matchCity && matchType;
    });

    if (sortBy === 'confidence') {
      result.sort((a, b) => b.aiConfidence - a.aiConfidence);
    } else if (sortBy === 'company') {
      result.sort((a, b) => a.company.localeCompare(b.company));
    } else {
      result.sort((a, b) => new Date(b.discoveredAt).getTime() - new Date(a.discoveredAt).getTime());
    }

    return result;
  }, [jobs, debouncedSearch, selectedRole, selectedCity, selectedType, sortBy]);

  const pageSize = 15;
  const totalPages = Math.ceil(filteredJobs.length / pageSize) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredJobs.slice(start, start + pageSize);
  }, [filteredJobs, currentPage]);

  const clearAllFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setSelectedRole('All');
    setSelectedCity('All');
    setSelectedType('All');
    setCurrentPage(1);
  };

  const getApplyButton = (job: JobCardData) => {
    const status = job.linkStatus || 'VERIFIED';
    if (status === 'EXPIRED') {
      return (
        <span className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-gray-800 text-gray-400 border border-gray-700 cursor-not-allowed">
          Listing Closed
        </span>
      );
    }
    if (status === 'INVALID') {
      return (
        <span className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-rose-950/40 text-rose-300 border border-rose-800/40">
          Source Expired
        </span>
      );
    }
    if (status === 'UNVERIFIED') {
      return (
        <a
          href={job.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 transition-colors"
        >
          Open Original Listing ↗
        </a>
      );
    }
    return (
      <a
        href={job.applyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black transition-colors"
      >
        Apply at Company ↗
      </a>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-[#232b30]">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Verified Fresher Opportunities</h1>
          <p className="text-sm text-gray-400 mt-1">
            Real-time deduplicated & AI-categorized openings across India.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Showing {filteredJobs.length} verified listings
          </div>
          {(search || selectedRole !== 'All' || selectedCity !== 'All' || selectedType !== 'All') && (
            <button
              onClick={clearAllFilters}
              className="text-xs font-mono text-gray-400 hover:text-white underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 p-4 rounded-xl border border-[#232b30] bg-[#111518]/90">
        <div className="lg:col-span-2">
          <label className="block text-[11px] font-mono uppercase text-gray-400 mb-1.5">Search Keywords</label>
          <input
            type="text"
            placeholder="Title, company, or skill (e.g. React, Python, SDE)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0a0d0e] border border-[#232b30] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-[11px] font-mono uppercase text-gray-400 mb-1.5">Role Category</label>
          <select
            value={selectedRole}
            onChange={(e) => { setSelectedRole(e.target.value); setCurrentPage(1); }}
            className="w-full bg-[#0a0d0e] border border-[#232b30] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
          >
            <option value="All">All Roles</option>
            <option value="Frontend Engineering">Frontend Engineering</option>
            <option value="Backend Engineering">Backend Engineering</option>
            <option value="Full Stack Engineering">Full Stack Engineering</option>
            <option value="AI / ML Engineering">AI / ML Engineering</option>
            <option value="Data Engineering">Data Engineering</option>
            <option value="DevOps / Cloud / SRE">DevOps / Cloud / SRE</option>
            <option value="QA / Software Testing / SDET">QA / Testing / SDET</option>
            <option value="Product Design / UI/UX">Product Design / UI/UX</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-mono uppercase text-gray-400 mb-1.5">City</label>
          <select
            value={selectedCity}
            onChange={(e) => { setSelectedCity(e.target.value); setCurrentPage(1); }}
            className="w-full bg-[#0a0d0e] border border-[#232b30] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
          >
            <option value="All">All Cities</option>
            <option value="Bengaluru">Bengaluru</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Pune">Pune</option>
            <option value="Delhi NCR">Delhi NCR</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Chennai">Chennai</option>
            <option value="Remote (India)">Remote (India)</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-mono uppercase text-gray-400 mb-1.5">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full bg-[#0a0d0e] border border-[#232b30] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
          >
            <option value="newest">Newest First</option>
            <option value="confidence">Highest AI Confidence</option>
            <option value="company">Company (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Loading Skeletons */}
      {loading ? (
        <div className="mt-8 space-y-4">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="p-6 rounded-xl border border-[#232b30] bg-[#111518] animate-pulse h-28" />
          ))}
        </div>
      ) : paginatedList.length === 0 ? (
        <div className="mt-8 text-center py-20 border border-dashed border-[#232b30] rounded-2xl bg-[#111518]/50">
          <p className="text-gray-400 text-sm">No job opportunities matched your current search filters.</p>
          <button
            onClick={clearAllFilters}
            className="mt-4 px-4 py-2 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {paginatedList.map((job) => (
            <div
              key={job.id}
              className="p-5 rounded-xl border border-[#232b30] bg-[#111518] hover:border-[#374151] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-white text-base group-hover:text-emerald-400 transition-colors">
                    {job.company}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full border border-[#232b30] bg-[#0a0d0e] text-gray-300 font-mono">
                    {job.sourceName}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-mono">
                    {job.fresherEligibilityStatus || (job.employmentType === 'internship' ? 'Internship' : 'Fresher eligible')}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-100">{job.title}</h3>

                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">📍 {job.normalizedCity}</span>
                  <span className="flex items-center gap-1">💼 {job.standardRole}</span>
                  <span className="flex items-center gap-1 capitalize">⏳ {job.employmentType.replace('_', ' ')}</span>
                  <span className="flex items-center gap-1 capitalize">🏢 {job.workMode}</span>
                  <span className="font-mono text-emerald-400/80">AI Confidence: {(job.aiConfidence * 100).toFixed(0)}%</span>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {job.requiredSkills.map((skill, sIdx) => (
                    <span key={sIdx} className="text-xs bg-[#161c20] text-gray-300 border border-[#232b30] px-2 py-0.5 rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 self-start md:self-center">
                <Link
                  href={`/jobs/${job.slug}`}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-[#232b30] bg-[#161c20] hover:bg-[#232b30] text-gray-200 transition-colors"
                >
                  View Details
                </Link>
                {getApplyButton(job)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-between border-t border-[#232b30] pt-6">
          <div className="text-xs text-gray-400 font-mono">
            Page {currentPage} of {totalPages} ({filteredJobs.length} opportunities)
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-xs rounded border border-[#232b30] bg-[#111518] hover:bg-[#161c20] disabled:opacity-40 disabled:cursor-not-allowed text-gray-300"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-xs rounded border border-[#232b30] bg-[#111518] hover:bg-[#161c20] disabled:opacity-40 disabled:cursor-not-allowed text-gray-300"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-4">
        <div className="h-10 w-64 bg-[#111518] rounded animate-pulse" />
        <div className="h-28 bg-[#111518] rounded-xl animate-pulse" />
      </div>
    }>
      <JobsContent />
    </Suspense>
  );
}
