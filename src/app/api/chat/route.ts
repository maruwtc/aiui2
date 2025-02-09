import type { NextRequest } from 'next/server';

export async function POST(request: Request) {
    try {
        const { prompt } = await request.json();

        const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'phi4',
                prompt,
                stream: true,
            }),
        });

        if (!ollamaResponse.ok || !ollamaResponse.body) {
            return new Response('Error connecting to Ollama API', { status: 500 });
        }

        const stream = new ReadableStream({
            async start(controller) {
                if (!ollamaResponse.body) {
                    throw new Error('Response body is null');
                }
                const reader = ollamaResponse.body.getReader();
                const decoder = new TextDecoder();

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