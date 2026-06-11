import type { NextRequest } from 'next/server';
import { getLocations, createLocation } from './service';
import { LocationInputSchema } from '@/schemas/zodSchema';

export async function GET(_req: NextRequest) {
  try {
    const locations = await getLocations();
    return Response.json(locations);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = LocationInputSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const location = await createLocation(parsed.data);
    return Response.json(location, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
