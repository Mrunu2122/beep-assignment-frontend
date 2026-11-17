'use client';

import React, { useMemo } from 'react';
import { sanitizeJobDescription } from '@/lib/sanitize-description';

interface JobDescriptionProps {
  content?: string | null;
  className?: string;
}

export function JobDescription({ content, className = '' }: JobDescriptionProps) {
  const sanitizedHtml = useMemo(() => {
    if (!content) return '';
    return sanitizeJobDescription(content);
  }, [content]);

  if (!sanitizedHtml || sanitizedHtml.trim().length === 0) {
    return (
      <div className="p-6 rounded-xl border border-dashed border-[#232b30] bg-[#0a0d0e]/40 text-center text-xs text-gray-500 font-mono">
        No additional description provided by the employer for this posting. Please review the official direct application portal.
      </div>
    );
  }

  // Determine if it looks like rich markup or plain text
  const hasHtmlTags = /<[a-z][\s\S]*>/i.test(sanitizedHtml);

  if (!hasHtmlTags) {
    // Pure plain text fallback: format with safe line breaks
    return (
      <div className={`text-xs text-gray-300 leading-relaxed font-sans whitespace-pre-line ${className}`}>
        {sanitizedHtml}
      </div>
    );
  }

  return (
    <div
      className={`job-description-content text-xs text-gray-300 leading-relaxed space-y-3 font-sans ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}
