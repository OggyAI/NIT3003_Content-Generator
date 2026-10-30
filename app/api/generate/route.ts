// Owner: Oggy — POST /api/generate (FR-08 to FR-11, Algorithm 1).
// Not implemented yet; returns 501 so the frontend can be wired up early.
import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ error: 'not_implemented' }, { status: 501 });
}
