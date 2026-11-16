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
  const description = `Early career opportunity at ${job.company} for ${job.title}. Location: ${job.normalizedCity}. Direct application link verified.`;

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

  const isClosed = (job as any).listingStatus === 'EXPIRED' || (job as any).listingStatus === 'REMOVED';

  const relatedJobs = SAMPLE_200_JOBS.filter(
    j => j.id !== job.id && (j as any).listingStatus === 'ACTIVE' &&
         (j.standardRole === job.standardRole || j.normalizedCity === job.normalizedCity)
  ).slice(0, 3);

  // Schema.org JobPosting structured data ONLY if listing is currently open
  const jsonLd = !isClosed ? {
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
      sameAs: job.applicationUrl,
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
  } : null;

  const getApplyButton = () => {
    if (isClosed) {
      return (
        <span className="px-6 py-3 rounded-lg bg-gray-800 text-gray-400 border border-gray-700 font-semibold text-sm cursor-not-allowed">
          Listing Closed by Company
        </span>
      );
    }
    if ((job as any).listingStatus === 'UNVERIFIED' || (job as any).listingStatus === 'POSSIBLY_EXPIRED') {
      return (
        <a
          href={job.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 font-semibold text-sm transition-all"
        >
          Check Original Listing ↗
        </a>
      );
    }
    return (
      <a
        href={job.applyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="px-6 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm transition-all shadow-[0_0_20px_-3px_rgba(34,197,94,0.4)]"
      >
        Apply at Company ↗
      </a>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      <Link href="/jobs" className="text-xs font-mono text-emerald-400 hover:underline mb-6 inline-flex items-center gap-1">
        ← Back to All Verified Opportunities
      </Link>

      {/* Closed Banner Notification if Expired/Removed */}
      {isClosed && (
        <div className="mb-6 p-4 rounded-xl border border-rose-900/40 bg-rose-950/20 text-xs font-mono text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span>This opportunity is no longer accepting applications ({ (job as any).statusReason || 'Posting closed by employer' }).</span>
          </div>
          <span className="text-gray-400">Archived Record</span>
        </div>
      )}

      <div className={`p-8 rounded-2xl border bg-[#111518] ${isClosed ? 'border-gray-800' : 'border-[#232b30]'}`}>
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#232b30]">
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs uppercase tracking-wider font-mono px-2.5 py-0.5 rounded-full border ${
                isClosed
                  ? 'border-rose-900/40 bg-rose-950/20 text-rose-400'
                  : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
              }`}>
                {isClosed ? 'Listing Closed' : ((job as any).fresherEligibilityStatus || 'Fresher eligible')}
              </span>
              <span className="text-xs font-mono text-gray-400 border border-[#232b30] px-2 py-0.5 rounded-full bg-[#0a0d0e]">
                Source: {job.sourceName}
              </span>
              {(job as any).listingStatus && (
                <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full border ${
                  (job as any).listingStatus === 'ACTIVE'
                    ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400'
                    : 'border-rose-500/20 bg-rose-500/5 text-rose-400'
                }`}>
                  Status: {(job as any).listingStatus}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mt-3">{job.title}</h1>
            <p className="text-base text-emerald-400 font-semibold mt-1">{job.company}</p>
          </div>

          <div>
            {getApplyButton()}
          </div>
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
            <div className="text-xs font-mono text-gray-500 uppercase">Last Verified</div>
            <div className="text-sm font-semibold text-emerald-400 font-mono mt-1">
              {(job as any).sourceLastVerifiedAt ? new Date((job as any).sourceLastVerifiedAt).toLocaleDateString() : 'Today'}
            </div>
          </div>
        </div>

        {/* AI-Generated Summary */}
        {(job as any).aiSummary && (
          <div className="py-5 border-b border-[#232b30] bg-[#161c20]/50 -mx-8 px-8">
            <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span>✦</span> AI-Generated Summary (Derived exclusively from original source)
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              {(job as any).aiSummary}
            </p>
          </div>
        )}

        {/* Responsibilities & Qualifications if available */}
        {(job as any).responsibilities && (job as any).responsibilities.length > 0 && (
          <div className="py-6 border-b border-[#232b30]">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Key Responsibilities</h2>
            <ul className="list-disc list-inside text-xs text-gray-300 space-y-1.5 leading-relaxed">
              {(job as any).responsibilities.map((r: string, idx: number) => (
                <li key={idx}>{r}</li>
              ))}
            </ul>
          </div>
        )}

        {(job as any).qualifications && (job as any).qualifications.length > 0 && (
          <div className="py-6 border-b border-[#232b30]">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Candidate Qualifications</h2>
            <ul className="list-disc list-inside text-xs text-gray-300 space-y-1.5 leading-relaxed">
              {(job as any).qualifications.map((q: string, idx: number) => (
                <li key={idx}>{q}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Required Skills */}
        <div className="py-6 border-b border-[#232b30]">
          <h2 className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-3">Technical Competencies</h2>
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
          <h2 className="text-base font-semibold text-white">Full Sourced Job Details</h2>
          <p className="whitespace-pre-line text-xs text-gray-300 bg-[#0a0d0e]/60 p-4 rounded-xl border border-[#232b30] leading-relaxed">
            {job.description}
          </p>

          <div className="p-4 rounded-xl border border-[#232b30] bg-[#0a0d0e] mt-6">
            <div className="text-xs font-mono text-gray-400 uppercase tracking-wider">Provenance & Source-of-Truth Audit Trail</div>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              Source: {job.sourceName}. Destination: <code className="text-emerald-400 font-mono break-all">{job.applyUrl}</code>.
              {(job as any).statusReason && <span> Verification note: {(job as any).statusReason}.</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Related Opportunities */}
      {relatedJobs.length > 0 && (
        <div className="mt-12">
          <h2 className="text-lg font-bold text-white mb-4">Related Active Opportunities in {job.normalizedCity} or {job.standardRole}</h2>
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
