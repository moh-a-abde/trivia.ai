import { readFile } from 'fs/promises';
import { NextResponse } from 'next/server';
import path from 'path';

export async function GET(request: Request) {
  try {
    // Get the sport from the query string
    const url = new URL(request.url);
    const sport = url.searchParams.get('sport') || 'basketball';
    
    // Use different files for different sports
    const fileName = sport === 'basketball' ? 'basketball_scores.txt' : 'soccer_scores.txt';
    const filePath = path.join(process.cwd(), fileName);
    
    let fileContent;
    try {
      fileContent = await readFile(filePath, 'utf8');
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, return an empty array
        return NextResponse.json([]);
      } else {
        throw error; // Re-throw the error if it's not ENOENT
      }
    }
    const lines = fileContent.trim().split('\n');
    const scores: { username: string; score: number }[] = [];

    for (const line of lines) {
      const [username, scoreStr] = line.split(',');
      const score = parseInt(scoreStr, 10);
      scores.push({ username, score });
    }

    // Sort scores by score in descending order
    const sortedScores = scores.sort((a, b) => b.score - a.score);

    return NextResponse.json(sortedScores);
  } catch (error) {
    console.error('Route error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scores' },
      { status: 500 }
    );
  }
}
