export default function MethodologyPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="pb-8 border-b border-[#232b30]">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-mono mb-3">
          Architecture & Engineering Whitepaper
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Engineering Methodology & AI Quality</h1>
        <p className="mt-2 text-base text-gray-400">
          How Launchpad enforces deterministic provenance, zero hallucinations, sub-cent processing economics, and 96%+ classification accuracy.
        </p>
      </div>

      <div className="mt-10 space-y-12">
        {/* Section 1 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-mono font-bold text-sm">
              01
            </span>
            <h2 className="text-xl font-bold text-white">Hybrid Deterministic vs. Probabilistic Principle</h2>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            The fatal flaw of modern &quot;AI wrapper&quot; job boards is using LLMs for tasks that ordinary deterministic code handles far better. We enforce a strict separation of concerns:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl border border-[#232b30] bg-[#111518]">
              <div className="text-xs font-mono text-emerald-400 font-bold mb-2">DETERMINISTIC LAYER (Ordinary Code)</div>
              <ul className="text-xs text-gray-400 space-y-2 list-disc list-inside leading-relaxed">
                <li><strong className="text-gray-200">URL Sanitization:</strong> Strips UTM marketing tags and referrer IDs.</li>
                <li><strong className="text-gray-200">Exact Hashing:</strong> SHA-256 canonical hash on company slug + title + host URI.</li>
                <li><strong className="text-gray-200">Database Constraints:</strong> Unique indices preventing duplicate storage.</li>
                <li><strong className="text-gray-200">Compensation Regex:</strong> Parses LPA and monthly stipends without token spend.</li>
              </ul>
            </div>
            <div className="p-5 rounded-xl border border-[#232b30] bg-[#111518]">
              <div className="text-xs font-mono text-emerald-400 font-bold mb-2">PROBABILISTIC LAYER (Gemini 1.5 Flash)</div>
              <ul className="text-xs text-gray-400 space-y-2 list-disc list-inside leading-relaxed">
                <li><strong className="text-gray-200">Semantic Role Taxonomy:</strong> Maps unstructured titles into fixed categories.</li>
                <li><strong className="text-gray-200">City Disambiguation:</strong> Disambiguates tech hubs (e.g. DLF Cyber City $\to$ Delhi NCR).</li>
                <li><strong className="text-gray-200">Conservative Normalization:</strong> Preserves Remote status or marks Unknown.</li>
                <li><strong className="text-gray-200">Fresher SLA Verification:</strong> Evaluates genuine 0-exp suitability.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 2 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-mono font-bold text-sm">
              02
            </span>
            <h2 className="text-xl font-bold text-white">Two-Tier Deduplication Cascade</h2>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            Fresher postings in India are cross-posted across GitHub repositories, Telegram channels, and company ATS portals. Our cascade eliminates duplicates without expensive $O(N^2)$ cross-comparisons:
          </p>
          <div className="p-5 rounded-xl border border-[#232b30] bg-[#111518] space-y-4">
            <div>
              <span className="text-xs font-mono text-emerald-400 font-semibold uppercase">Tier 1: Canonical Hash ($O(1)$)</span>
              <p className="text-xs text-gray-400 mt-1">
                Generates a SHA-256 fingerprint from cleaned URLs and normalized titles. Catches over 70% of redundant listings instantly.
              </p>
            </div>
            <div className="border-t border-[#232b30] pt-4">
              <span className="text-xs font-mono text-emerald-400 font-semibold uppercase">Tier 2: Block-Partitioned Fuzzy Jaccard</span>
              <p className="text-xs text-gray-400 mt-1">
                Partitions opportunities strictly by company entity. A weighted composite token similarity on title (60%) and description (40%) identifies reworded job postings with a calibrated threshold of 0.65.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-mono font-bold text-sm">
              03
            </span>
            <h2 className="text-xl font-bold text-white">Automated Daily Refresh & Serverless Bounds</h2>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            Scheduled at 00:00 UTC via Vercel Cron calling <code className="text-emerald-400 font-mono text-xs">/api/cron/ingest</code>, protected by <code className="text-emerald-400 font-mono text-xs">CRON_SECRET</code>. 
            Batch boundaries prevent serverless timeouts, and idempotent upserts ensure running the pipeline repeatedly never duplicates records.
          </p>
        </section>
      </div>
    </div>
  );
}
