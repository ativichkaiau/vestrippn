import { NextResponse } from 'next/server';

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

const headers = {
  'Authorization': `Bearer ${NOTION_API_KEY}`,
  'Content-Type': 'application/json',
  'Notion-Version': '2022-06-28',
};

export async function GET() {
  try {
    const res = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        sorts: [{ property: 'Created time', direction: 'descending' }],
        page_size: 10,
      }),
      next: { revalidate: 60 } // Sync every minute
    });

    const data = await res.json();
    
    // Notion data is deep; we flatten it for the UI
    const tasks = data.results.map((page: any) => ({
      id: page.id,
      // Assuming your column is named "Name" or "Task"
      text: page.properties.Name?.title[0]?.plain_text || "Untitled Task",
      // Assuming your checkbox is named "Done"
      done: page.properties.Done?.checkbox || false,
    }));

    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json({ error: 'Notion Sync Failed' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { text } = await req.json();
  try {
    const res = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        parent: { database_id: DATABASE_ID },
        properties: {
          Name: { title: [{ text: { content: text } }] },
          Done: { checkbox: false }
        },
      }),
    });
    return NextResponse.json(await res.json());
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const { id, done } = await req.json();
  try {
    const res = await fetch(`https://api.notion.com/v1/pages/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        properties: {
          Done: { checkbox: done }
        },
      }),
    });
    return NextResponse.json(await res.json());
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}