import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  console.log("=== API HIT: Starting Notion Fetch ===");

  if (!process.env.NOTION_TOKEN || !process.env.NOTION_DATABASE_ID) {
    console.log("❌ Error: Missing API keys in .env.local");
    return NextResponse.json({ error: "Missing keys" }, { status: 400 });
  }

  console.log("✅ Keys found. Connecting to Notion...");
  const notion = new Client({ auth: process.env.NOTION_TOKEN });
  
  try {
    console.log(`📡 Querying database ID: ${process.env.NOTION_DATABASE_ID}`);
    
    // We are using the official databases.query method
    const response = await notion.dataSources.query({
      data_source_id: process.env.NOTION_DATABASE_ID,
      page_size: 5,
    });

    console.log(`✅ Notion responded! Found ${response.results.length} tasks.`);
    
    const tasks = response.results.map((page: any) => {
      // Safe fallbacks so it doesn't crash if your Notion columns are named differently
      const text = page.properties.Name?.title?.[0]?.plain_text || "Untitled Task";
      const done = page.properties.Done?.checkbox || false;
      
      return { id: page.id, text, done };
    });

    console.log("✅ Data parsed successfully. Sending to browser...");
    return NextResponse.json(tasks);
    
  } catch (error: any) {
    console.log("❌ FATAL NOTION ERROR:");
    console.log(error.message || error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}

// Keeping POST and PATCH minimal for now while we fix GET
export async function POST() { return NextResponse.json({ success: true }); }
export async function PATCH() { return NextResponse.json({ success: true }); }