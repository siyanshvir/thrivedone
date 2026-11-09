interface Env {
  ASSETS: any;
  CF_ACCOUNT_ID: string;
  CF_API_TOKEN: string;
  PUBLIC_SITE_URL?: string;
  Database?: any; // D1 database binding
}

type ApiErrorCode =
  | "BAD_REQUEST"
  | "METHOD_NOT_ALLOWED"
  | "UPSTREAM_AI_ERROR"
  | "UPSTREAM_AI_RATE_LIMIT"
  | "UPSTREAM_AI_UNAVAILABLE"
  | "UPSTREAM_AI_AUTH"
  | "MISSING_AI_CREDENTIALS"
  | "INTERNAL_ERROR";

type RagChunk = {
  title: string;
  url: string;
  content: string;
  embedding: number[];
};

type RagIndex = {
  chunks: RagChunk[];
};

type ChatRequest = {
  message: string;
  conversation_history?: Array<{ role: "user" | "assistant"; content: string }>;
  page_context?: {
    path?: string;
    url?: string;
    title?: string;
    excerpt?: string;
  };
};

// Minimal fallback - only used when AI service is completely unavailable
// The AI should handle all responses naturally through the system prompt
function buildFallbackResponse(
  q: string,
  top: RagChunk[],
  products: any[],
  pageContext?: { path?: string; title?: string; excerpt?: string }
): string {
  return "I'm currently experiencing technical difficulties with my AI service. Please try again in a moment, or feel free to browse our website directly for the information you need.";
}

function normalizeQuery(q: string) {
  return (q || "").trim().replace(/\s+/g, " ");
}

// Enhanced scoring algorithm with semantic understanding and metadata
const scoreCache = new Map<string, number>();

function enhancedKeywordScore(query: string, chunk: any): number {
  const cacheKey = `${query}:${chunk.id || chunk.title}`;
  if (scoreCache.has(cacheKey)) {
    return scoreCache.get(cacheKey)!;
  }

  const qLower = query.toLowerCase();
  const title = chunk.title || '';
  const content = chunk.content || '';
  const tLower = title.toLowerCase();
  const cLower = content.toLowerCase();
  const queryWords = qLower.split(/\W+/).filter(w => w.length > 2);

  let score = 0;

  // Base importance from metadata
  if (chunk.metadata?.importance) {
    score += chunk.metadata.importance * 2;
  }

  // Category matching (high priority)
  if (chunk.metadata?.categories) {
    const categories = chunk.metadata.categories;
    if (qLower.includes('product') && categories.includes('water-bottles')) score += 10;
    if (qLower.includes('supplement') && categories.includes('supplements')) score += 10;
    if (qLower.includes('team') && categories.includes('team')) score += 10;
    if (qLower.includes('contact') && categories.includes('contact')) score += 10;
    if (qLower.includes('ship') && categories.includes('shipping')) score += 10;
    if (qLower.includes('price') && categories.includes('pricing')) score += 8;
  }

  // Keyword matching from metadata
  if (chunk.metadata?.keywords) {
    for (const keyword of chunk.metadata.keywords) {
      if (qLower.includes(keyword)) {
        score += 4;
      }
    }
  }

  // Exact phrase matching (highest priority)
  const phrases = query.split(/\s+/).filter(p => p.length > 3);
  for (const phrase of phrases) {
    const phraseLower = phrase.toLowerCase();
    if (cLower.includes(phraseLower)) {
      score += 5;
    }
    if (tLower.includes(phraseLower)) {
      score += 8;
    }
  }

  // Word matching with frequency weighting
  for (const word of queryWords) {
    const wordRegex = new RegExp(`\\b${word}\\b`, 'gi');
    const titleMatches = (tLower.match(wordRegex) || []).length;
    const contentMatches = (cLower.match(wordRegex) || []).length;

    score += titleMatches * 3;
    score += contentMatches * 1;
  }

  // Bonus for specific query types
  if (/price|cost|how much|\$/.test(qLower) && chunk.metadata?.hasPrice) {
    score += 6;
  }
  if (/sku|product code|item number/.test(qLower) && chunk.metadata?.hasSKU) {
    score += 6;
  }
  if (/contact|email|phone|reach/.test(qLower) && chunk.metadata?.hasContact) {
    score += 6;
  }

  // Bonus for important keywords
  const importantKeywords = ['price', 'cost', 'sku', 'product', 'bottle', 'supplement', 'protein', 'electrolyte', 'shipping', 'team', 'ceo', 'contact', 'email', 'phone'];
  for (const keyword of importantKeywords) {
    if (qLower.includes(keyword) && (tLower.includes(keyword) || cLower.includes(keyword))) {
      score += 2;
    }
  }

  // Penalty for very short content
  if (content.length < 50) {
    score *= 0.5;
  }

  // Boost for longer, detailed content
  if (content.length > 500) {
    score *= 1.1;
  }

  // Cache the result
  if (scoreCache.size > 1000) {
    scoreCache.clear();
  }
  scoreCache.set(cacheKey, score);

  return score;
}

function normalizeExcerpt(text: string) {
  return String(text || "").replace(/\s+/g, " ").trim();
}

function isActiveProductStatus(status: string | null | undefined) {
  return status !== "Phased Out" && status !== "Removal Requested" && status !== "Removal Pending";
}

let productsCache: any[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 48 * 60 * 60 * 1000; // 48 hours (matches your website caching)

async function fetchD1Products(env: Env): Promise<any[]> {
  const now = Date.now();
  if (productsCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
    return productsCache;
  }

  const accountId = env.CF_ACCOUNT_ID;
  const apiToken = env.CF_API_TOKEN;
  const databaseId = '7aacb7e5-67f2-4466-b4bc-ca2841e618af';

  if (!accountId || !apiToken) return [];

  try {
    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sql: 'SELECT * FROM products ORDER BY created_at DESC'
      })
    });

    if (!resp.ok) return productsCache || [];

    const result = await resp.json();
    const products = result?.result?.[0]?.results || [];

    productsCache = products;
    cacheTimestamp = now;

    return products;
  } catch (e) {
    console.error('Error fetching D1 products:', e);
    return productsCache || [];
  }
}

async function loadIndex(env: Env): Promise<RagIndex> {
  try {
    const res = await env.ASSETS.fetch("http://internal/rag_index.json");
    if (!res.ok) {
      throw new Error(`Failed to load rag_index.json (${res.status})`);
    }
    return (await res.json()) as RagIndex;
  } catch (e) {
    console.error("Failed to load RAG index:", e);
    return { chunks: [] };
  }
}

async function callWorkersAI(env: Env, systemPrompt: string, userMessage: string, history: any[] = []): Promise<string> {
  const accountId = env.CF_ACCOUNT_ID;
  const apiToken = env.CF_API_TOKEN;
  // Cloudflare Workers AI model: Llama 3.3 70B Instruct (fast, FP8 quantized)
  // Significantly smarter than 8B — better reasoning, detail, and product recommendations
  const model = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";

  // Detailed logging
  const logInfo = {
    model,
    hasAccountId: !!accountId,
    hasApiToken: !!apiToken,
    accountIdLength: accountId?.length || 0,
    apiTokenLength: apiToken?.length || 0,
    accountIdPrefix: accountId ? `${accountId.substring(0, 8)}...` : 'missing',
    apiTokenPrefix: apiToken ? `${apiToken.substring(0, 8)}...` : 'missing'
  };

  console.log(`[AI] Using model: ${model}`, logInfo);
  console.log(`[AI] Account ID: ${accountId ? 'present' : 'missing'}`, { length: accountId?.length || 0 });
  console.log(`[AI] API Token: ${apiToken ? 'present' : 'missing'}`, { length: apiToken?.length || 0 });

  if (!accountId || !apiToken) {
    const errorMsg = `Missing Cloudflare AI credentials - cannot use AI model. Account ID: ${accountId ? 'present' : 'MISSING'}, API Token: ${apiToken ? 'present' : 'MISSING'}`;
    console.error(`[AI] ERROR: ${errorMsg}`, logInfo);
    const error = new Error(errorMsg);
    (error as any).details = logInfo;
    throw error;
  }

  const messages = [
    { role: "system", content: systemPrompt },
    ...history.slice(-10), // Increased context window for better conversation flow
    { role: "user", content: userMessage }
  ];

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;

  console.log(`[AI] Calling Cloudflare Workers AI`, {
    model,
    url: url.replace(apiToken, '[REDACTED]'),
    messageLength: userMessage.length,
    historyLength: history.length,
    systemPromptLength: systemPrompt.length,
    accountId: accountId.substring(0, 8) + '...'
  });

  let resp: Response;
  let responseText = "";

  try {
    resp = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages,
        max_tokens: 2048, // Large enough for detailed, structured responses
        temperature: 0.3 // Balanced for natural but factual responses
      }),
    });

    responseText = await resp.text();

    if (!resp.ok) {
      const errorMsg = `Workers AI error ${resp.status}: ${responseText}`;
      console.error(`[AI] ERROR: ${errorMsg}`, {
        model,
        status: resp.status,
        statusText: resp.statusText,
        responseText: responseText.slice(0, 500),
        url: url.replace(apiToken, '[REDACTED]'),
        hasAccountId: !!accountId,
        hasApiToken: !!apiToken
      });
      const error = new Error(errorMsg);
      (error as any).status = resp.status;
      (error as any).responseText = responseText;
      (error as any).model = model;
      throw error;
    }

    let data: any;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      const errorMsg = `Failed to parse AI response: ${responseText.slice(0, 200)}`;
      console.error(`[AI] PARSE ERROR: ${errorMsg}`, {
        model,
        responseText: responseText.slice(0, 500),
        parseError
      });
      throw new Error(errorMsg);
    }

    const response = data?.result?.response ?? data?.response ?? "";

    if (!response || response.trim().length === 0) {
      const errorMsg = `Empty response from AI model. Response data: ${JSON.stringify(data).slice(0, 200)}`;
      console.error(`[AI] EMPTY RESPONSE ERROR: ${errorMsg}`, {
        model,
        dataKeys: Object.keys(data || {}),
        hasResult: !!data?.result,
        hasResponse: !!data?.response
      });
      throw new Error(errorMsg);
    }

    console.log(`[AI] Successfully received response from ${model}`, {
      model,
      responseLength: response.length,
      hasResponse: !!response,
      status: resp.status
    });

    return response;
  } catch (e: any) {
    // Re-throw with additional context
    if (e.status) {
      // Already has status, just add more context
      (e as any).model = model;
      (e as any).url = url.replace(apiToken, '[REDACTED]');
      throw e;
    }

    // Network or other errors
    const error = new Error(`AI request failed: ${e?.message || String(e)}`);
    (error as any).originalError = e;
    (error as any).model = model;
    (error as any).url = url.replace(apiToken, '[REDACTED]');
    (error as any).hasAccountId = !!accountId;
    (error as any).hasApiToken = !!apiToken;
    throw error;
  }
}

function getRequestId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `req_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }
}

function parseWorkersAiStatus(message: string): number | null {
  const m = /workers ai error\s+(\d{3})\s*:/i.exec(message);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

function mapAiUpstreamToApiError(message: string): { status: number; code: ApiErrorCode; userMessage: string; details?: string } {
  const msg = String(message || "");
  const lower = msg.toLowerCase();

  if (lower.includes("missing cloudflare ai credentials")) {
    return {
      status: 503,
      code: "MISSING_AI_CREDENTIALS",
      userMessage: "Thrive AI is temporarily unavailable. Please try again in a moment.",
      details: "Cloudflare AI credentials (CF_ACCOUNT_ID or CF_API_TOKEN) are missing from environment variables."
    };
  }

  const upstreamStatus = parseWorkersAiStatus(msg);
  if (upstreamStatus === 401 || upstreamStatus === 403) {
    // Check if it's specifically an authentication error
    const isAuthError = lower.includes("authentication") || lower.includes("auth") || upstreamStatus === 401;
    return {
      status: 503,
      code: "UPSTREAM_AI_AUTH",
      userMessage: "Thrive AI authentication failed. Please check Cloudflare Workers AI credentials.",
      details: isAuthError
        ? "The Cloudflare API token or Account ID is invalid, expired, or doesn't have Workers AI permissions. Check your CF_API_TOKEN and CF_ACCOUNT_ID environment variables in Cloudflare Pages settings."
        : "The Cloudflare API credentials don't have permission to access Workers AI."
    };
  }

  if (upstreamStatus === 429) {
    return {
      status: 429,
      code: "UPSTREAM_AI_RATE_LIMIT",
      userMessage: "Thrive AI is getting a lot of traffic right now. Please try again shortly.",
      details: "Cloudflare Workers AI rate limit exceeded. Wait a moment before retrying."
    };
  }

  if (upstreamStatus && upstreamStatus >= 500) {
    return {
      status: 502,
      code: "UPSTREAM_AI_UNAVAILABLE",
      userMessage: "Thrive AI is temporarily unavailable (upstream issue). Please try again in a moment.",
      details: `Cloudflare Workers AI returned status ${upstreamStatus}. This is a server-side issue with Cloudflare's AI service.`
    };
  }

  if (lower.includes("workers ai error")) {
    return {
      status: 502,
      code: "UPSTREAM_AI_ERROR",
      userMessage: "Thrive AI is temporarily unavailable. Please try again in a moment.",
      details: "An error occurred while calling Cloudflare Workers AI. Check the error message for details."
    };
  }

  return {
    status: 500,
    code: "INTERNAL_ERROR",
    userMessage: "Thrive AI hit an unexpected error. Please try again in a moment.",
    details: "An unexpected error occurred. Check the error message and logs for more information."
  };
}

export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;
  const requestId = getRequestId();

  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "X-Request-Id": requestId,
      },
    });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "X-Request-Id": requestId },
    });
  }

  try {
    const body = (await request.json()) as ChatRequest;
    const q = normalizeQuery(body.message);
    const pageContext = body.page_context;

    if (!q) {
      return new Response(JSON.stringify({ error: "Message is required", error_code: "BAD_REQUEST", request_id: requestId }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "X-Request-Id": requestId },
      });
    }

    const index = await loadIndex(env);
    const siteUrl = String(env.PUBLIC_SITE_URL || "https://thrive-ve.com");

    // Only fetch Supabase products if the query relates to products/shopping
    const qLower = q.toLowerCase();
    const needsProducts =
      /\b(product|item|buy|shop|price|cost|listing|inventory|stock|available|color|catalog|water|bottle|supplement|wellness|bundle|recommend|best|popular)\b/.test(qLower) ||
      /\b(product|shop|bundle|bottle|supplement)\b/.test(String(pageContext?.path || "").toLowerCase());

    let supaActive: any[] = [];
    if (needsProducts) {
      console.log(`[API] 📦 Fetching products from D1 for query: "${q}"`);
      const d1All = await fetchD1Products(env);
      supaActive = d1All.filter((p) => isActiveProductStatus(p?.status));
    }

    const dynamicChunks: RagChunk[] = [];

    // Page context chunk (helps make responses page-aware even if RAG index is generic)
    const pageExcerpt = normalizeExcerpt(String(pageContext?.excerpt || ""));
    if (pageExcerpt) {
      dynamicChunks.push({
        title: pageContext?.title ? `Current Page: ${pageContext.title}` : `Current Page: ${String(pageContext?.path || "")}`,
        url: String(pageContext?.url || siteUrl),
        content: pageExcerpt.slice(0, 1200),
        embedding: [],
      });
    }

    // Add pricing highlight
    if (supaActive.length > 0) {
      const sortedByPrice = [...supaActive]
        .filter((p) => typeof p.price === "number")
        .sort((a, b) => Number(b.price) - Number(a.price));

      const mostExpensive = sortedByPrice[0];
      if (mostExpensive) {
        dynamicChunks.push({
          title: "Pricing Summary - Luxury Highlights",
          url: `${siteUrl}/shop`,
          content: `Our most premium product is the "${mostExpensive.name}" priced at $${Number(mostExpensive.price).toFixed(2)}.`,
          embedding: [],
        });
      }

      // Convert active products to searchable context bits
      for (const p of supaActive) {
        const group = p.group_name || p.name;
        const slug = String(group || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
        const content = [
          `Product: ${p.name}`,
          p.group_name ? `Part of: ${p.group_name}` : "",
          `Category: ${p.category}`,
          `Price: $${Number(p.price).toFixed(2)}`,
          p.description ? `Details: ${p.description}` : "",
          p.sku ? `SKU: ${p.sku}` : ""
        ].filter(Boolean).join(" | ");

        dynamicChunks.push({
          title: `${group} - ${p.name}`,
          url: `${siteUrl}/product/${slug}?sku=${encodeURIComponent(p.sku || "")}`,
          content,
          embedding: [],
        });
      }
    }

    // Enhanced RAG retrieval with metadata-aware scoring
    const allChunks = [...dynamicChunks, ...index.chunks];
    const scored = allChunks
      .map((c) => ({
        c,
        score: enhancedKeywordScore(q, c),
      }))
      .sort((a, b) => b.score - a.score);

    // Get top chunks with better filtering
    const topChunks = scored
      .filter(x => x.score > 0)
      .slice(0, 15) // Increased from 10 to 15 for more comprehensive context
      .map((x) => x.c);

    // Organize context by category for better structure
    const productChunks = topChunks.filter(c =>
      c.title.toLowerCase().includes('product') ||
      c.title.toLowerCase().includes('bottle') ||
      c.title.toLowerCase().includes('supplement') ||
      c.title.toLowerCase().includes('bundle')
    );

    const companyChunks = topChunks.filter(c =>
      c.title.toLowerCase().includes('company') ||
      c.title.toLowerCase().includes('team') ||
      c.title.toLowerCase().includes('leadership') ||
      c.title.toLowerCase().includes('contact')
    );

    const infoChunks = topChunks.filter(c =>
      c.title.toLowerCase().includes('shipping') ||
      c.title.toLowerCase().includes('faq') ||
      (!productChunks.includes(c) && !companyChunks.includes(c))
    );

    // Build structured context string
    let contextSections: string[] = [];

    if (productChunks.length > 0) {
      contextSections.push("=== PRODUCT INFORMATION ===");
      productChunks.forEach(c => {
        contextSections.push(`[${c.title}]\n${c.content}\n`);
      });
    }

    if (companyChunks.length > 0) {
      contextSections.push("\n=== COMPANY INFORMATION ===");
      companyChunks.forEach(c => {
        contextSections.push(`[${c.title}]\n${c.content}\n`);
      });
    }

    if (infoChunks.length > 0) {
      contextSections.push("\n=== GENERAL INFORMATION ===");
      infoChunks.slice(0, 5).forEach(c => {
        contextSections.push(`[${c.title}]\n${c.content}\n`);
      });
    }

    const contextStr = contextSections.length > 0
      ? contextSections.join("\n")
      : "No specific information found. Refer to general company knowledge.";

    const pageTitle = String(pageContext?.title || "");
    const pagePath = String(pageContext?.path || "");
    const pageContextStr = pageExcerpt
      ? `CURRENT_PAGE:\nTitle: ${pageTitle || "(unknown)"}\nPath: ${pagePath || "(unknown)"}\nContent: ${pageExcerpt.slice(0, 500)}`
      : `CURRENT_PAGE:\nTitle: ${pageTitle || "(unknown)"}\nPath: ${pagePath || "(unknown)"}\nContent: (not provided)`;

    // Comprehensive system prompt for structured, detailed responses
    const systemPrompt = `You are Flo AI, the expert assistant for Thrive Wellness — a premium wellness brand offering water bottles, supplements, accessories, bundles, and subscriptions.

RESPONSE GUIDELINES:
1. Be helpful and direct: Lead with the answer, then offer a relevant follow-up if useful.
2. Structure: Use markdown — bullet points with *, **bold** for emphasis, ## for section headings when needed.
3. Grounding: Base answers ONLY on the provided context below. If information isn't available, say so honestly and suggest alternatives.
4. Products: When discussing products, always include the Name, SKU, and Price when available. If a buy link is in context, include it as a clickable link so users can purchase directly.
5. Recommendations: When asked for a recommendation, compare by use-case, size, flavor, and price. Be opinionated and helpful.
6. Buy Links: If the context includes a "Buy:" URL for a product, share it so the user can purchase directly.
7. Safety: For supplement/nutrition questions, provide general wellness guidance and recommend consulting a healthcare professional for medical advice.
8. Tone: Friendly, knowledgeable, and concise. You're an expert on Thrive products.

${pageContextStr}

${contextStr}

Remember: Be specific with product details, include prices and SKUs, and share buy links when available.`;

    let responseText = "";
    const model = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
    let errorDetails: any = null;
    let hasError = false;

    try {
      console.log(`[Chat API] Processing request with model: ${model}`, {
        requestId,
        query: q.slice(0, 100),
        hasContext: topChunks.length > 0,
        contextChunks: topChunks.length,
        hasAccountId: !!env.CF_ACCOUNT_ID,
        hasApiToken: !!env.CF_API_TOKEN
      });

      responseText = await callWorkersAI(env, systemPrompt, q, body.conversation_history);

      console.log(`[Chat API] Successfully generated response using ${model}`, {
        requestId,
        responseLength: responseText.length
      });
    } catch (e: any) {
      hasError = true;
      const msg = String(e?.message || e);
      const mapped = mapAiUpstreamToApiError(msg);
      const upstreamStatus = parseWorkersAiStatus(msg);

      // Build detailed error information
      errorDetails = {
        requestId,
        model,
        modelName: model,
        usingModel: true,
        errorMessage: msg,
        errorStack: e?.stack || null,
        errorType: e?.name || typeof e,
        errorString: e?.toString() || String(e),
        mappedError: {
          status: mapped.status,
          code: mapped.code,
          userMessage: mapped.userMessage,
          details: mapped.details || undefined
        },
        upstreamStatus,
        hasAccountId: !!env.CF_ACCOUNT_ID,
        hasApiToken: !!env.CF_API_TOKEN,
        accountIdLength: env.CF_ACCOUNT_ID?.length || 0,
        apiTokenLength: env.CF_API_TOKEN?.length || 0,
        accountIdPrefix: env.CF_ACCOUNT_ID ? `${env.CF_ACCOUNT_ID.substring(0, 8)}...` : 'missing',
        apiTokenPrefix: env.CF_API_TOKEN ? `${env.CF_API_TOKEN.substring(0, 8)}...` : 'missing',
        timestamp: new Date().toISOString(),
        query: q.slice(0, 200),
        contextChunksCount: topChunks.length,
        hasContext: topChunks.length > 0,
        troubleshooting: mapped.code === "UPSTREAM_AI_AUTH"
          ? "Check Cloudflare Pages environment variables: CF_ACCOUNT_ID and CF_API_TOKEN must be valid and have Workers AI permissions."
          : mapped.code === "MISSING_AI_CREDENTIALS"
            ? "Add CF_ACCOUNT_ID and CF_API_TOKEN to Cloudflare Pages environment variables."
            : undefined
      };

      console.error("[Chat API] Workers AI unavailable; returning fallback response", errorDetails);

      responseText = buildFallbackResponse(q, topChunks, supaActive, {
        path: pagePath,
        title: pageTitle,
        excerpt: pageExcerpt,
      });
    }

    // Get unique sources from top chunks
    const sourceMap = new Map<string, { title: string; url: string }>();
    topChunks.forEach(c => {
      if (!sourceMap.has(c.url)) {
        sourceMap.set(c.url, { title: c.title, url: c.url });
      }
    });
    const sources = Array.from(sourceMap.values()).slice(0, 5);

    // Include error details in response for debugging (visible in browser dev tools)
    const responseBody: any = {
      response: responseText,
      sources
    };

    if (hasError && errorDetails) {
      // Add error details to response for debugging
      responseBody.debug = {
        error: true,
        model: errorDetails.model,
        errorCode: errorDetails.mappedError.code,
        errorMessage: errorDetails.errorMessage,
        hasCredentials: errorDetails.hasAccountId && errorDetails.hasApiToken,
        requestId: errorDetails.requestId
      };
    }

    const responseHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "X-Request-Id": requestId,
      "X-AI-Model": model,
      "X-AI-Status": hasError ? "error" : "success"
    };

    if (hasError && errorDetails) {
      responseHeaders["X-AI-Error-Code"] = errorDetails.mappedError.code;
      responseHeaders["X-AI-Error-Message"] = errorDetails.errorMessage.slice(0, 100);
    }

    return new Response(JSON.stringify(responseBody), {
      headers: responseHeaders,
    });
  } catch (error: any) {
    const message = String(error?.message || "");
    const mapped = mapAiUpstreamToApiError(message);
    const upstreamStatus = parseWorkersAiStatus(message);
    const model = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";

    console.error("[Chat API] Chat error:", {
      requestId,
      model,
      usingModel: true,
      modelName: model,
      mapped,
      upstreamStatus,
      message,
      error: error?.stack || error?.toString(),
    });

    return new Response(
      JSON.stringify({
        error: mapped.userMessage,
        error_code: mapped.code,
        request_id: requestId,
        status: mapped.status,
        upstream_status: upstreamStatus,
      }),
      {
        status: mapped.status,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "X-Request-Id": requestId },
      }
    );
  }
}
