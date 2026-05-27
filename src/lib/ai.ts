import Anthropic from '@anthropic-ai/sdk';

// Server-side only — uses env var, never exposed to client
let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!_client) {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) throw new Error('ANTHROPIC_API_KEY is not set in .env.local');
    _client = new Anthropic({ apiKey: key });
  }
  return _client;
}

export async function generateContent(
  prompt: string,
  systemPrompt?: string,
  maxTokens = 1000
): Promise<string> {
  const client = getClient();
  const msg = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: maxTokens,
    system: systemPrompt ?? 'You are a fantasy football sports media personality. Treat fantasy football with extreme sports-media seriousness. Be entertaining, specific, and data-driven.',
    messages: [{ role: 'user', content: prompt }],
  });
  return msg.content
    .filter(b => b.type === 'text')
    .map(b => (b as { type: 'text'; text: string }).text)
    .join('');
}

export async function generateBatch(
  items: Array<{ prompt: string; system?: string; key: string; maxTokens?: number }>
): Promise<Record<string, string>> {
  const results = await Promise.allSettled(
    items.map(item => generateContent(item.prompt, item.system, item.maxTokens ?? 1000))
  );
  const output: Record<string, string> = {};
  items.forEach((item, i) => {
    const result = results[i];
    output[item.key] = result.status === 'fulfilled'
      ? result.value
      : `[Generation failed: ${result.reason?.message ?? 'unknown error'}]`;
  });
  return output;
}
