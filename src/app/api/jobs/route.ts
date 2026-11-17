import { NextResponse } from 'next/server';
import { getAllJobSummariesAsync } from '@/lib/jobs-data';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // 60 seconds stale-while-revalidate

export async function GET() {
  try {
    const jobs = await getAllJobSummariesAsync();
    return NextResponse.json(jobs, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch jobs' }, { status: 500 });
  }
}
