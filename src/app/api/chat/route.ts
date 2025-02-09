// app/api/chat/route.ts
import type { NextRequest } from 'next/server';

export async function POST(request: Request) {
    try {
        // Parse the incoming JSON which should include the user's prompt.
        const { prompt } = await request.json();

        // Forward the request to your Ollama server.
        // Replace the URL and payload as required by your Ollama API.
        const ollamaResponse = await fetch('http://localhost:11434/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt,
                stream: true, // Enable streaming responses.
                // ... add any other required parameters here.
            }),
        });

        if (!ollamaResponse.ok || !ollamaResponse.body) {
            return new Response('Error connecting to Ollama API', { status: 500 });
        }

        // Create a new ReadableStream to proxy the streaming response.
        const stream = new ReadableStream({
            async start(controller) {
                const reader = ollamaResponse.body.getReader();
                const decoder = new TextDecoder();

                // Read and enqueue each chunk as it comes in.
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    controller.enqueue(value);
                }
                controller.close();
            },
        });

        return new Response(stream, {
            headers: { 'Content-Type': 'text/plain' },
        });
    } catch (error) {
        console.error('API Route Error:', error);
        return new Response('Internal server error', { status: 500 });
    }
}