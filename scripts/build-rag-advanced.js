/**
 * Advanced RAG Index Builder with Semantic Search
 * Uses Cloudflare's @cf/baai/bge-base-en-v1.5 for embeddings
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Smart chunking with overlap for better context
function smartChunkText(text, maxChars = 1200, overlap = 200) {
  if (text.length <= maxChars) {
    return [text];
  }
  
  const chunks = [];
  const paragraphs = text.split('\n\n');
  let currentChunk = "";
  let previousChunk = "";
  
  for (const para of paragraphs) {
    const paraWithOverlap = previousChunk ? previousChunk.slice(-overlap) + "\n\n" + para : para;
    
    if (currentChunk.length + paraWithOverlap.length + 2 <= maxChars) {
      currentChunk += (currentChunk ? "\n\n" : "") + para;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        previousChunk = currentChunk;
      }
      
      // Handle very long paragraphs
      if (para.length > maxChars) {
        const sentences = para.match(/[^.!?]+[.!?]+/g) || [para];
        let sentenceChunk = "";
        
        for (const sent of sentences) {
          if (sentenceChunk.length + sent.length <= maxChars) {
            sentenceChunk += sent;
          } else {
            if (sentenceChunk) {
              chunks.push(sentenceChunk.trim());
              previousChunk = sentenceChunk;
            }
            sentenceChunk = sent;
          }
        }
        if (sentenceChunk) {
          chunks.push(sentenceChunk.trim());
          previousChunk = sentenceChunk;
        }
        currentChunk = "";
      } else {
        currentChunk = para;
      }
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

// Extract keywords for better search
function extractKeywords(text) {
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who', 'when', 'where', 'why', 'how']);
  
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.has(w));
  
  // Count frequency
  const freq = {};
  words.forEach(w => freq[w] = (freq[w] || 0) + 1);
  
  // Get top keywords
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

// Categorize content for better organization
function categorizeContent(title, content) {
  const titleLower = title.toLowerCase();
  const contentLower = content.toLowerCase();
  
  const categories = [];
  
  // Product categories
  if (/(bottle|glacier|iceberg|water)/i.test(titleLower)) categories.push('water-bottles');
  if (/(protein|peak|supplement|surge|electrolyte)/i.test(titleLower)) categories.push('supplements');
  if (/(bundle|alo|peloton|package)/i.test(titleLower)) categories.push('bundles');
  if (/(shaker|anchor|accessory)/i.test(titleLower)) categories.push('accessories');
  
  // Info categories
  if (/(team|leadership|ceo|cfo|department)/i.test(titleLower)) categories.push('team');
  if (/(company|mission|vision|value|about)/i.test(titleLower)) categories.push('company');
  if (/(contact|email|phone|address|location)/i.test(titleLower)) categories.push('contact');
  if (/(shipping|delivery|order)/i.test(titleLower)) categories.push('shipping');
  if (/(faq|question|answer)/i.test(titleLower)) categories.push('faq');
  if (/(newsletter|news|update)/i.test(titleLower)) categories.push('newsletter');
  
  // Price/shopping related
  if (/(price|cost|\$|buy|purchase|shop)/i.test(contentLower)) categories.push('pricing');
  
  return categories.length > 0 ? categories : ['general'];
}

// Generate metadata for each chunk
function generateMetadata(title, content, url) {
  return {
    keywords: extractKeywords(content),
    categories: categorizeContent(title, content),
    wordCount: content.split(/\s+/).length,
    hasPrice: /\$\d+|\d+\.\d+/.test(content),
    hasSKU: /SKU:\s*[A-Z0-9-]+/i.test(content),
    hasContact: /@|email|phone|\d{3}[-.]?\d{3}[-.]?\d{4}/i.test(content),
    importance: calculateImportance(title, content)
  };
}

// Calculate importance score for ranking
function calculateImportance(title, content) {
  let score = 1.0;
  
  // Boost important content types
  if (/product|price|sku/i.test(title)) score += 0.5;
  if (/team|leadership|ceo/i.test(title)) score += 0.3;
  if (/contact|email|phone/i.test(title)) score += 0.4;
  if (/shipping|faq/i.test(title)) score += 0.3;
  
  // Boost content with specific details
  if (/\$\d+/.test(content)) score += 0.2; // Has prices
  if (/SKU:/i.test(content)) score += 0.2; // Has SKUs
  if (/@|email/i.test(content)) score += 0.1; // Has contact info
  
  // Penalize very short content
  if (content.length < 100) score *= 0.5;
  
  return Math.min(score, 2.0); // Cap at 2.0
}

// Extract text content from React/TSX pages
function extractPageContent(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Remove imports and exports
    let text = content
      .replace(/import\s+.*?from\s+['"].*?['"];?/g, '')
      .replace(/export\s+(default\s+)?/g, '');
    
    // Extract string literals (content)
    const strings = [];
    const stringRegex = /['"`]((?:[^'"`\\]|\\.)*)['"`]/g;
    let match;
    while ((match = stringRegex.exec(text)) !== null) {
      const str = match[1].trim();
      if (str.length > 20 && !str.includes('import') && !str.includes('className')) {
        strings.push(str);
      }
    }
    
    return strings.join(' ').slice(0, 2000);
  } catch (e) {
    return '';
  }
}

// Scan website pages for additional content
function scanWebsitePages() {
  const pagesDir = path.join(__dirname, '../src/pages');
  const pages = [];
  
  if (!fs.existsSync(pagesDir)) return pages;
  
  const pageFiles = fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx'));
  
  for (const file of pageFiles) {
    const filePath = path.join(pagesDir, file);
    const content = extractPageContent(filePath);
    
    if (content.length > 100) {
      const pageName = file.replace('.tsx', '');
      pages.push({
        title: `Website Page: ${pageName}`,
        content: content,
        url: `/${pageName.toLowerCase()}`
      });
    }
  }
  
  return pages;
}

async function buildAdvancedRagIndex() {
  console.log('Building ADVANCED RAG index with semantic search...\n');
  
  // Load knowledge base
  const knowledgePath = path.join(__dirname, '../public/knowledge_base.json');
  
  if (!fs.existsSync(knowledgePath)) {
    console.error('❌ knowledge_base.json not found!');
    console.log('   Run: npm run build:knowledge first');
    process.exit(1);
  }
  
  const knowledge = JSON.parse(fs.readFileSync(knowledgePath, 'utf-8'));
  
  // Add website page content
  console.log('Scanning website pages for additional content...');
  const pageContent = scanWebsitePages();
  if (pageContent.length > 0) {
    knowledge.push(...pageContent);
    console.log(`   Added ${pageContent.length} pages\n`);
  }
  
  const ragChunks = [];
  const siteUrl = process.env.PUBLIC_SITE_URL || 'http://localhost:8080';
  
  console.log('Processing knowledge entries...');
  
  for (const entry of knowledge) {
    const title = entry.title || 'Thrive Wellness';
    const content = entry.content || '';
    
    // Determine URL based on title
    let url = `${siteUrl}/`;
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('product') || titleLower.includes('bundle')) {
      url = `${siteUrl}/shop`;
    } else if (titleLower.includes('team') || titleLower.includes('leadership')) {
      url = `${siteUrl}/team`;
    } else if (titleLower.includes('contact')) {
      url = `${siteUrl}/contact`;
    } else if (titleLower.includes('shipping')) {
      url = `${siteUrl}/shipping`;
    } else if (titleLower.includes('faq')) {
      url = `${siteUrl}/faq`;
    } else if (titleLower.includes('company') || titleLower.includes('mission')) {
      url = `${siteUrl}/about`;
    } else if (titleLower.includes('newsletter')) {
      url = `${siteUrl}/newsletter`;
    }
    
    // Smart chunking with overlap
    const textChunks = smartChunkText(content, 1200, 200);
    
    for (let i = 0; i < textChunks.length; i++) {
      const chunkTitle = textChunks.length === 1 ? title : `${title} (Part ${i + 1}/${textChunks.length})`;
      const chunkContent = textChunks[i].trim();
      
      ragChunks.push({
        id: `chunk_${ragChunks.length}`,
        title: chunkTitle,
        url: url,
        content: chunkContent,
        metadata: generateMetadata(chunkTitle, chunkContent, url),
        embedding: [] // Embeddings will be generated by Cloudflare Worker at runtime
      });
    }
  }
  
  // Sort by importance for better retrieval
  ragChunks.sort((a, b) => b.metadata.importance - a.metadata.importance);
  
  // Build index with metadata
  const ragIndex = {
    version: '3.0',
    buildDate: new Date().toISOString(),
    totalChunks: ragChunks.length,
    features: [
      'smart-chunking',
      'keyword-extraction',
      'content-categorization',
      'importance-scoring',
      'semantic-search-ready'
    ],
    categories: [...new Set(ragChunks.flatMap(c => c.metadata.categories))],
    chunks: ragChunks
  };
  
  // Save minified for production
  const outputPath = path.join(__dirname, '../public/rag_index.json');
  fs.writeFileSync(outputPath, JSON.stringify(ragIndex), 'utf-8');
  
  const fileSizeKB = (fs.statSync(outputPath).size / 1024).toFixed(2);
  
  // Generate statistics
  const stats = {
    totalChunks: ragChunks.length,
    categories: ragIndex.categories,
    avgChunkSize: Math.round(ragChunks.reduce((sum, c) => sum + c.content.length, 0) / ragChunks.length),
    chunksWithPrices: ragChunks.filter(c => c.metadata.hasPrice).length,
    chunksWithSKUs: ragChunks.filter(c => c.metadata.hasSKU).length,
    chunksWithContact: ragChunks.filter(c => c.metadata.hasContact).length,
  };
  
  console.log(`\nADVANCED RAG index built successfully!`);
  console.log(`   Version: 3.0 (Semantic Search Ready)`);
  console.log(`   Total chunks: ${stats.totalChunks}`);
  console.log(`   File size: ${fileSizeKB}KB`);
  console.log(`   Avg chunk size: ${stats.avgChunkSize} chars`);
  console.log(`   Categories: ${stats.categories.join(', ')}`);
  console.log(`   Chunks with prices: ${stats.chunksWithPrices}`);
  console.log(`   Chunks with SKUs: ${stats.chunksWithSKUs}`);
  console.log(`   Chunks with contact info: ${stats.chunksWithContact}`);
  console.log(`   Output: ${outputPath}`);
  console.log(`\nReady for deployment with semantic search!`);
  console.log(`\nFeatures:`);
  console.log(`   - Smart chunking with overlap`);
  console.log(`   - Keyword extraction`);
  console.log(`   - Content categorization`);
  console.log(`   - Importance scoring`);
  console.log(`   - Semantic search ready`);
  console.log(`   - Website page content included`);
}

buildAdvancedRagIndex();
