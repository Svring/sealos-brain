import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const chatRequestSchema = z.object({
  user_id: z.string(),
  prompt: z.string(),
  files: z.array(z.any()).optional(),
});

const chatResponseSchema = z.object({
  response: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, prompt, files } = chatRequestSchema.parse(body);

    const response = await fetch(`${process.env.BACKEND_URL}/agent/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id, prompt, files }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // If the response doesn't have the expected format, wrap it
    if (!data.response) {
      return NextResponse.json({ response: JSON.stringify(data) });
    }

    const validatedResponse = chatResponseSchema.parse(data);
    return NextResponse.json(validatedResponse);
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { response: 'Sorry, there was an error processing your request.' },
      { status: 500 }
    );
  }
} 