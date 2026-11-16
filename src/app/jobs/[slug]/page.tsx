import { SAMPLE_200_JOBS } from '@/lib/sample-jobs';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const job = SAMPLE_200_JOBS.find(j => j.slug === slug);

  if (!job) {
    return {
      title: 'Job Not Found | Launchpad',
      description: 'The requested fresher job listing was not found.',
    };
  }

  const title = `${job.title} at ${job.company} (${job.normalizedCity}) | Launchpad`;
  const description = `Verified 0-1 exp fresher opening at ${job.company} for ${job.title}. Location: ${job.normalizedCity}. Direct application link verified.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://launchpad.careers/jobs/${job.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `https://launchpad.careers/jobs/${job.slug}`,
    },
  };
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const job = SAMPLE_200_JOBS.find(j => j.slug === slug);

  if (!job) {
    notFound();
  }

  const relatedJobs = SAMPLE_200_JOBS.filter(
    j => j.id !== job.id && (j.standardRole === job.standardRole || j.normalizedCity === job.normalizedCity)
  ).slice(0, 3);

  // Schema.org JobPosting JSON-LD for eligible verified jobs
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    identifier: {
      '@type': 'PropertyValue',
      name: job.company,
      value: job.id,
    },
    datePosted: job.discoveredAt,
    employmentType: job.employmentType === 'internship' ? 'INTERN' : 'FULL_TIME',
    hiringOrganization: {
      '@type': 'Organization',
      name: job.company,
      sameAs: `https://careers.${job.companySlug}.com`,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.normalizedCity,
        addressCountry: 'IN',
      },
    },
    directApply: true,
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Structured Schema.org JobPosting for search engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link href="/jobs" className="text-xs font-mono text-emerald-400 hover:underline mb-6 inline-flex items-center gap-1">
        ← Back to All Verified Opportunities
      </Link>

      {/* Main Job Card */}
      <div className="p-8 rounded-2xl border border-[#232b30] bg-[#111518]">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#232b30]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                0-Exp Verified Fresher
              </span>
              <span className="text-xs font-mono text-gray-400 border border-[#232b30] px-2 py-0.5 rounded-full bg-[#0a0d0e]">
                Source: {job.sourceName}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mt-3">{job.title}</h1>
            <p className="text-base text-emerald-400 font-semibold mt-1">{job.company}</p>
          </div>

          <a
            href={job.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm transition-all shadow-[0_0_20px_-3px_rgba(34,197,94,0.4)]"
          >
            Apply Directly at Source ↗
          </a>
        </div>

        {/* Multi-facet Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-[#232b30]">
          <div>
            <div className="text-xs font-mono text-gray-500 uppercase">Role Category</div>
            <div className="text-sm font-semibold text-gray-200 mt-1">{job.standardRole}</div>
          </div>
          <div>
            <div className="text-xs font-mono text-gray-500 uppercase">Location</div>
            <div className="text-sm font-semibold text-gray-200 mt-1">{job.normalizedCity}</div>
          </div>
          <div>
            <div className="text-xs font-mono text-gray-500 uppercase">Work Mode</div>
            <div className="text-sm font-semibold text-gray-200 mt-1 capitalize">{job.workMode}</div>
          </div>
          <div>
            <div className="text-xs font-mono text-gray-500 uppercase">AI Confidence</div>
            <div className="text-sm font-semibold text-emerald-400 font-mono mt-1">
              {(job.aiConfidence * 100).toFixed(1)}% (Gemini Flash)
            </div>
          </div>
        </div>

        {/* Required Skills */}
        <div className="py-6 border-b border-[#232b30]">
          <h2 className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-3">Key Technical Competencies</h2>
          <div className="flex flex-wrap gap-2">
            {job.requiredSkills.map((skill, sIdx) => (
              <span key={sIdx} className="text-xs font-mono bg-[#161c20] text-emerald-300 border border-emerald-500/20 px-3 py-1 rounded-md">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Description & Transparency */}
        <div className="mt-6 space-y-4 text-sm text-gray-300 leading-relaxed">
          <h2 className="text-base font-semibold text-white">Original Role Description</h2>
          <p className="whitespace-pre-line text-gray-300 bg-[#0a0d0e]/60 p-4 rounded-xl border border-[#232b30]">
            {job.description}
          </p>

          <div className="p-4 rounded-xl border border-[#232b30] bg-[#0a0d0e] mt-6">
            <div className="text-xs font-mono text-gray-400 uppercase tracking-wider">Provenance & Anti-Hallucination Audit Trail</div>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              Ingested from {job.sourceName}. Deduplication Hash: <code className="text-emerald-400 font-mono">{job.canonicalHash.substring(0, 16)}...</code>.
              Discovered: {new Date(job.discoveredAt).toLocaleDateString()}. Direct apply link verified without affiliate redirection.
            </p>
          </div>
        </div>
      </div>

      {/* Related Opportunities */}
      {relatedJobs.length > 0 && (
        <div className="mt-12">
          <h2 className="text-lg font-bold text-white mb-4">Related Opportunities in {job.normalizedCity} or {job.standardRole}</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {relatedJobs.map(rel => (
              <Link
                key={rel.id}
                href={`/jobs/${rel.slug}`}
                className="p-4 rounded-xl border border-[#232b30] bg-[#111518] hover:border-emerald-500/40 transition-colors block"
              >
                <div className="text-xs font-semibold text-emerald-400">{rel.company}</div>
                <div className="text-sm font-bold text-white mt-1 line-clamp-1">{rel.title}</div>
                <div className="text-xs text-gray-400 mt-2">📍 {rel.normalizedCity}</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
