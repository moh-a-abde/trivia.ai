import { writeFile, readFile, appendFile } from 'fs/promises';
import { NextResponse } from 'next/server';
import path from 'path';
import { existsSync } from 'fs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, score, sport = 'basketball' } = body; // Extract username, score, and sport
    const data = `${username},${score}\n`; // Format the data
    
    // Use different files for different sports
    const fileName = sport === 'basketball' ? 'basketball_scores.txt' : 'soccer_scores.txt';
    const filePath = path.join(process.cwd(), fileName);
    
    // Check if file exists first
    try {
      // If file exists, append to it
      await appendFile(filePath, data);
    } catch (error) {
      // If file doesn't exist, create it with the data
      await writeFile(filePath, data);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Route error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save score' },
      { status: 500 }
    );
  }
}
