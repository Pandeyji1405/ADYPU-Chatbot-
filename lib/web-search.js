import { tavily } from '@tavily/core';

const ADYPU_DOMAIN = 'adypu.edu.in';

export async function webSearch(query) {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return null;

  try {
    const client = tavily({ apiKey });
    const result = await client.search(`${query} ADYPU Ajeenkya DY Patil University`, {
      searchDepth: 'basic',
      maxResults: 5,
      includeDomains: [ADYPU_DOMAIN],
      includeAnswer: true
    });

    if (result.answer) return { answer: result.answer, sources: result.results };

    if (result.results?.length > 0) {
      const text = result.results
        .slice(0, 3)
        .map((r) => r.content)
        .join(' ')
        .slice(0, 1200);
      return { answer: text, sources: result.results };
    }

    return null;
  } catch {
    return null;
  }
}

export async function openWebSearch(query) {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return null;

  try {
    const client = tavily({ apiKey });
    const result = await client.search(query, {
      searchDepth: 'basic',
      maxResults: 3,
      includeAnswer: true
    });

    if (result.answer) return { answer: result.answer, sources: result.results };

    if (result.results?.length > 0) {
      const text = result.results
        .slice(0, 2)
        .map((r) => r.content)
        .join(' ')
        .slice(0, 800);
      return { answer: text, sources: result.results };
    }

    return null;
  } catch {
    return null;
  }
}
