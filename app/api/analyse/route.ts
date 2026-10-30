// Owner: Oggy — POST /api/analyse (FR-15, FR-16, Algorithm 3).
// Not implemented yet; returns 501.
import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ error: 'not_implemented' }, { status: 501 });
}
