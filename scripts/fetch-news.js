'use strict';

/**
 * fetch-news.js
 *
 * Fetches recent headlines from Hacker News (Algolia API) and several RSS
 * feeds, then uses the GitHub Models API (gpt-4o-mini) to curate and
 * summarize them into the newsletter's Category[] schema, and finally
 * appends the new date entry to tech-newsletter/src/data/news.ts.
 *
 * Required env var:
 *   MODELS_API_KEY  — GitHub token with models:read scope (COPILOT_API_KEY secret)
 */

const fs = require('node:fs');
const path = require('node:path');

const MODELS_API_KEY = process.env.MODELS_API_KEY;
const GITHUB_MODELS_ENDPOINT = 'https://models.inference.ai.azure.com/chat/completions';
const MODEL = 'gpt-4o-mini';

const NEWS_FILE = path.resolve(
  __dirname,
  '..',
  'tech-newsletter',
  'src',
  'data',
  'news.ts',
);

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

/** Returns a date string like "May 12, 2026" */
function formatDate(d) {
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/** "May 12, 2026" → "MAY_12_2026" */
function dateToConstName(dateStr) {
  const m = dateStr.match(/^(\w+)\s+(\d+),\s+(\d+)$/);
  if (!m) throw new Error(`Cannot parse date string: "${dateStr}"`);
  return `${m[1].toUpperCase()}_${m[2]}_${m[3]}`;
}

// ---------------------------------------------------------------------------
// Text helpers
// ---------------------------------------------------------------------------

function cleanText(text) {
  // NOTE: The output of this function is used solely as plain text in an
  // LLM prompt and in JSON-serialised data written to a TypeScript file.
  // React renders all article fields as textContent (no dangerouslySetInnerHTML),
  // so there is no HTML injection sink. The lgtm suppressions below acknowledge
  // that CodeQL's entity-decoding rules fire even though no HTML sink exists.
  return (
    text
      .trim()
      // Unwrap CDATA sections first
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, function(_, inner) {
        return inner;
      })
      // Decode HTML entities.
      // &lt; and &gt; are intentionally removed (not converted to angle
      // brackets) so that encoded tag patterns like &lt;script&gt; cannot
      // produce angle brackets at any stage of the pipeline.
      .replace(/&amp;/g, '&') // lgtm[js/double-escaping]
      .replace(/&lt;/g, '') // lgtm[js/incomplete-multi-character-sanitization]
      .replace(/&gt;/g, '')
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      // Strip any remaining literal HTML tags and stray angle brackets
      .replace(/<[^>]*>/g, '') // lgtm[js/incomplete-multi-character-sanitization]
      .replace(/[<>]/g, '')
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      .trim()
  );
}

// ---------------------------------------------------------------------------
// Headline fetchers
// ---------------------------------------------------------------------------

/**
 * Fetch recent stories from Hacker News via the Algolia search API.
 * Results are scoped to the last 7 days so the content is always fresh.
 */
async function fetchHNStories(query, count = 10) {
  const since = Math.floor(Date.now() / 1000) - 7 * 24 * 3600;
  const url =
    `https://hn.algolia.com/api/v1/search` +
    `?query=${encodeURIComponent(query)}` +
    `&tags=story` +
    `&hitsPerPage=${count}` +
    `&numericFilters=created_at_i>${since}`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.hits || [])
      .filter(h => h.title)
      .map(h => ({
        title: h.title,
        url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
        source: h.url
          ? new URL(h.url).hostname.replace(/^www\./, '')
          : 'Hacker News',
      }));
  } catch (e) {
    console.warn(`  ⚠  HN fetch failed for "${query}": ${e.message}`);
    return [];
  }
}

/**
 * Fetch and lightly parse an RSS 2.0 or Atom feed.
 * No external XML library — relies on predictable feed structure.
 */
async function fetchRSS(feedUrl, maxItems = 6) {
  try {
    const res = await fetch(feedUrl, {
      headers: { 'User-Agent': 'TechNewsletterBot/1.0 (github-actions)' },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return [];

    const text = await res.text();
    const hostname = new URL(feedUrl).hostname.replace(/^www\./, '');
    const items = [];

    // Matches both <item> (RSS 2.0) and <entry> (Atom) elements
    const itemPattern = /<(?:item|entry)[^>]*>([\s\S]*?)<\/(?:item|entry)>/g;
    let match;

    while ((match = itemPattern.exec(text)) !== null && items.length < maxItems) {
      const block = match[1];

      const titleMatch = block.match(/<title[^>]*>([\s\S]*?)<\/title>/);
      // Atom uses <link href="…"/> while RSS uses <link>url</link>
      const linkMatch =
        block.match(/<link[^>]*href="([^"]+)"/) ||
        block.match(/<link[^>]*>([^<]+)<\/link>/);

      if (titleMatch) {
        const title = cleanText(titleMatch[1]);
        if (title) {
          items.push({
            title,
            url: linkMatch ? linkMatch[1].trim() : feedUrl,
            source: hostname,
          });
        }
      }
    }

    return items;
  } catch (e) {
    console.warn(`  ⚠  RSS fetch failed for ${feedUrl}: ${e.message}`);
    return [];
  }
}

// ---------------------------------------------------------------------------
// GitHub Models API
// ---------------------------------------------------------------------------

/** The category/subcategory skeleton that the LLM must populate. */
const CATEGORIES_SCHEMA = [
  {
    id: 'technology',
    name: 'Technology',
    icon: '💻',
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
    description:
      'Latest in software, hardware, AI, cybersecurity, cloud, and web development.',
    subCategories: [
      { id: 'ai-generative', name: 'Generative AI', icon: '🤖', articles: [] },
      { id: 'ai-vision', name: 'Visual Processing AI', icon: '👁️', articles: [] },
      { id: 'ai-nlp', name: 'NLP', icon: '💬', articles: [] },
      { id: 'cybersecurity', name: 'Cybersecurity', icon: '🔐', articles: [] },
      { id: 'cloud', name: 'Cloud Computing', icon: '☁️', articles: [] },
      { id: 'webdev', name: 'Web Development', icon: '🌐', articles: [] },
    ],
  },
  {
    id: 'science',
    name: 'Science',
    icon: '🔬',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #06b6d4)',
    description:
      'Breakthroughs in physics, biology, space exploration, and environmental science.',
    subCategories: [
      { id: 'physics', name: 'Physics', icon: '⚛️', articles: [] },
      { id: 'biology', name: 'Biology & Biotech', icon: '🧬', articles: [] },
      { id: 'space', name: 'Space & Astronomy', icon: '🚀', articles: [] },
      { id: 'climate', name: 'Climate & Environment', icon: '🌍', articles: [] },
      { id: 'materials', name: 'Materials Science', icon: '🧪', articles: [] },
    ],
  },
  {
    id: 'quantum',
    name: 'Quantum Computing',
    icon: '⚡',
    color: '#a855f7',
    gradient: 'linear-gradient(135deg, #a855f7, #ec4899)',
    description:
      'The frontier of computation — algorithms, hardware, cryptography, and networking.',
    subCategories: [
      { id: 'quantum-hardware', name: 'Quantum Hardware', icon: '🖥️', articles: [] },
      { id: 'quantum-algorithms', name: 'Quantum Algorithms', icon: '📐', articles: [] },
      {
        id: 'quantum-cryptography',
        name: 'Quantum Cryptography',
        icon: '🔑',
        articles: [],
      },
      {
        id: 'quantum-networking',
        name: 'Quantum Networking',
        icon: '🌐',
        articles: [],
      },
      {
        id: 'quantum-education',
        name: 'Quantum Education & Careers',
        icon: '🎓',
        articles: [],
      },
    ],
  },
];

/**
 * Ask the LLM to curate the provided headlines into the newsletter schema.
 * Returns a Category[] array.
 */
async function callGitHubModels(headlines, newsletterDate) {
  const headlineList = headlines
    .map((h, i) => `[${i + 1}] "${h.title}" — ${h.source} — ${h.url}`)
    .join('\n');

  const prompt = [
    `You are the editor of a daily technology newsletter dated ${newsletterDate}.`,
    '',
    'Below are recent headlines collected from Hacker News and RSS feeds.',
    'Your job is to:',
    '1. Select the most relevant headlines for each newsletter subcategory.',
    '2. Write a concise 2–3 sentence editorial summary for each selected article in an engaging, informative voice.',
    '3. Assign a short tag (e.g. "Model Release", "Breach", "Research", "Milestone", "Startup", "Policy", "Open Source", "Hardware", "Algorithm", "Market", "Discovery", "Enterprise").',
    '4. Use unique article IDs based on the subcategory prefix and a counter (e.g. "gen-ai-1", "cyber-2", "qhw-1").',
    '5. Copy the exact URL and source from the headline list — never invent or modify them.',
    '6. Aim for 2–5 articles per subcategory; omit subcategories where no headline is relevant.',
    `7. Set "date" to "${newsletterDate}" on every article.`,
    '',
    `HEADLINES:\n${headlineList}`,
    '',
    'Return ONLY a raw JSON array (no markdown, no code fences, no explanation) that matches this exact structure:',
    JSON.stringify(CATEGORIES_SCHEMA, null, 2),
    '',
    'Rules:',
    '- Only use articles from the headline list above — never hallucinate sources or URLs.',
    '- Return raw JSON only.',
  ].join('\n');

  const resp = await fetch(GITHUB_MODELS_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${MODELS_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 8192,
    }),
    signal: AbortSignal.timeout(120000),
  });

  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`GitHub Models API error ${resp.status}: ${body}`);
  }

  const data = await resp.json();
  const raw = (data.choices?.[0]?.message?.content ?? '').trim();

  // Strip optional markdown code fences
  const stripped = raw
    .replace(/^```(?:json)?\s*/m, '')
    .replace(/\s*```\s*$/m, '')
    .trim();

  // Accept either a bare array or an object wrapping a "categories" key
  let parsed;
  try {
    parsed = JSON.parse(stripped);
  } catch {
    // Try to extract the outermost JSON structure
    const arrStart = stripped.indexOf('[');
    const arrEnd = stripped.lastIndexOf(']');
    const objStart = stripped.indexOf('{');
    const objEnd = stripped.lastIndexOf('}');
    if (arrStart !== -1 && (objStart === -1 || arrStart < objStart)) {
      parsed = JSON.parse(stripped.slice(arrStart, arrEnd + 1));
    } else if (objStart !== -1) {
      parsed = JSON.parse(stripped.slice(objStart, objEnd + 1));
    } else {
      throw new Error(`No JSON found in LLM response: ${stripped.slice(0, 300)}`);
    }
  }

  // Normalize: unwrap a { categories: [...] } wrapper if present
  if (!Array.isArray(parsed) && Array.isArray(parsed.categories)) {
    return parsed.categories;
  }
  if (Array.isArray(parsed)) return parsed;
  throw new Error('LLM response is neither a JSON array nor has a categories key');
}

// ---------------------------------------------------------------------------
// news.ts updater
// ---------------------------------------------------------------------------

/**
 * Serialize the categories array to a TypeScript constant declaration.
 * JSON.stringify output is valid TypeScript syntax because TypeScript accepts
 * JSON-style object literals (double-quoted keys, no trailing commas, etc.).
 */
function buildTSConstant(constName, categories) {
  return `const ${constName}_CATEGORIES: Category[] = ${JSON.stringify(categories, null, 2)};\n`;
}

/**
 * Inserts the new date's data into news.ts and registers it in allNewsData.
 * Returns true when the file was modified, false when it was already up-to-date.
 */
function updateNewsTs(todayStr, categories) {
  const source = fs.readFileSync(NEWS_FILE, 'utf8');

  if (source.includes(`'${todayStr}'`)) {
    console.log(`⏭  "${todayStr}" already exists in news.ts — nothing to do.`);
    return false;
  }

  const constName = dateToConstName(todayStr);
  const newConst = buildTSConstant(constName, categories);

  // Insert the new constant just before the allNewsData comment block
  const marker = '\n// All available newsletter data keyed by date string';
  const insertAt = source.indexOf(marker);
  if (insertAt === -1) {
    throw new Error('Could not locate the insertion marker in news.ts');
  }

  let updated = source.slice(0, insertAt) + '\n' + newConst + source.slice(insertAt);

  // Prepend the new date as the first entry in allNewsData
  updated = updated.replace(
    /export const allNewsData: Record<string, Category\[\]> = \{/,
    `export const allNewsData: Record<string, Category[]> = {\n  '${todayStr}': ${constName}_CATEGORIES,`,
  );

  fs.writeFileSync(NEWS_FILE, updated, 'utf8');
  console.log(`✅ news.ts updated with ${todayStr} data`);
  return true;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  if (!MODELS_API_KEY) {
    console.error('❌ MODELS_API_KEY environment variable is not set');
    process.exit(1);
  }

  const today = formatDate(new Date());
  console.log(`📰 Fetching news for ${today} …`);

  // Kick off all fetches in parallel
  const settled = await Promise.allSettled([
    fetchHNStories('artificial intelligence LLM GPT model release', 12),
    fetchHNStories('machine learning deep learning neural', 8),
    fetchHNStories('cybersecurity breach vulnerability exploit', 10),
    fetchHNStories('cloud computing AWS Azure serverless containers', 8),
    fetchHNStories('quantum computing qubit error correction', 8),
    fetchHNStories('web development JavaScript TypeScript React', 8),
    fetchRSS('https://www.sciencedaily.com/rss/top.xml', 8),
    fetchRSS('https://techcrunch.com/feed/', 8),
    fetchRSS('https://www.theverge.com/rss/index.xml', 8),
    fetchRSS('https://feeds.arstechnica.com/arstechnica/index', 8),
  ]);

  // Deduplicate by URL across all sources
  const seen = new Set();
  const allHeadlines = [];
  for (const r of settled) {
    if (r.status !== 'fulfilled') continue;
    for (const h of r.value) {
      if (h.title && !seen.has(h.url)) {
        seen.add(h.url);
        allHeadlines.push(h);
      }
    }
  }

  console.log(`📋 Collected ${allHeadlines.length} unique headlines`);

  if (allHeadlines.length < 5) {
    console.error('❌ Fewer than 5 headlines collected — aborting to avoid empty newsletter');
    process.exit(1);
  }

  console.log(`🤖 Calling GitHub Models API (${MODEL}) …`);
  const categories = await callGitHubModels(allHeadlines, today);

  if (!Array.isArray(categories) || categories.length === 0) {
    throw new Error('LLM returned an empty or invalid categories list');
  }

  updateNewsTs(today, categories);
}

main().catch(err => {
  console.error('💥 Fatal error:', err.message);
  process.exit(1);
});
