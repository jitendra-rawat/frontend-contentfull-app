import { NextRequest, NextResponse } from 'next/server';
import { createClient } from 'contentful-management';

export async function POST(req: NextRequest) {
  try {
    const { entryId, data } = await req.json();

    if (!entryId || !data) {
      return NextResponse.json({ error: 'Missing entryId or data' }, { status: 400 });
    }

    const client = createClient({
      accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN!,
    });

    const space = await client.getSpace(process.env.CONTENTFUL_SPACE_ID!);
    const environment = await space.getEnvironment(process.env.CONTENTFUL_ENVIRONMENT_ID || 'master');
    const entry = await environment.getEntry(entryId);

    // Update the layoutConfig field (adjust locale as needed)
    entry.fields.layoutConfig = { 'en-US': data };
    const updatedEntry = await entry.update();
    await updatedEntry.publish();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}