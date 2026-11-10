/**
 * Build comprehensive knowledge base from all website content
 * JavaScript version - no Python needed!
 * Automatically includes documents from training-docs folder
 * Automatically parses products.csv for latest product data
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── CSV Parser ────────────────────────────────────────────────────────────────

function parseCSVLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}

function parseCSV(content) {
  const lines = content.split(/\r?\n/);
  const headers = parseCSVLine(lines[0]).map(h => h.trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseCSVLine(line);
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = (values[idx] || '').trim();
    });
    rows.push(row);
  }
  return rows;
}

// ─── Load Products from CSV ─────────────────────────────────────────────────

function loadProductsFromCSV() {
  const csvPath = path.join(__dirname, '../public/products.csv');
  if (!fs.existsSync(csvPath)) {
    console.log('⚠️  products.csv not found, skipping product CSV ingestion');
    return [];
  }

  const content = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(content);

  // Map CSV column names
  const products = rows.map(r => ({
    category: r['Category'] || '',
    name: r['Product name'] || '',
    status: r['Product Status'] || '',
    sku: r['SKU#'] || '',
    unitPrice: r['Unit price'] || '',
    finalPrice: r['Final Price'] || '',
    buyLink: r['Buy Button Links'] || '',
    description: r['Product Descriptions'] || '',
    websiteImplemented: (r['Website Implementation'] || '').toUpperCase() === 'TRUE',
  }));

  console.log(`   Parsed ${products.length} products from CSV`);
  return products;
}

// Build product knowledge entries from CSV data
function buildProductKnowledge(products) {
  const knowledge = [];

  // Only include active / available products
  const active = products.filter(p =>
    p.status === 'In Store' || p.status === 'In Store'
  );
  const removalPending = products.filter(p =>
    p.status === 'Removal Pending' || p.status === 'Phased Out'
  );

  // ── Water Bottles ──────────────────────────────────────────────────────────
  const glacierProducts = active.filter(p =>
    p.category === 'Water Bottle' && p.name.toLowerCase().includes('glacier')
  );
  const icebergProducts = active.filter(p =>
    p.category === 'Water Bottle' && p.name.toLowerCase().includes('iceberg')
  );

  if (glacierProducts.length > 0) {
    const colorList = glacierProducts.map(p => {
      const colorMatch = p.name.match(/\(([^)]+)\)/);
      const color = colorMatch ? colorMatch[1] : p.name;
      const link = p.buyLink ? `\n  Buy: ${p.buyLink}` : '';
      return `- ${color} — SKU: ${p.sku} — Price: ${p.finalPrice}${link}`;
    }).join('\n');

    knowledge.push({
      title: "Water Bottles - The Glacier (64oz)",
      content: `
THRIVE WELLNESS — THE GLACIER (64oz Water Bottle)

Our largest premium insulated water bottle. Holds 64oz — perfect for all-day hydration.

AVAILABLE COLORS & PRICING:
${colorList}

FEATURES:
- 64oz capacity — perfect for all-day hydration and long workouts
- Double-wall vacuum insulation
- Keeps drinks cold for 24+ hours, hot for 12+ hours
- BPA-free stainless steel construction
- Leak-proof Ice Cap lid included
- Wide mouth for easy filling and cleaning
- Fits most standard cup holders
- Durable powder-coated finish

CARE INSTRUCTIONS:
- Dishwasher safe (top rack recommended)
- Hand wash with warm soapy water for best results

Perfect for: Gym enthusiasts, office workers, outdoor adventures, anyone wanting maximum hydration capacity.
`
    });
  }

  if (icebergProducts.length > 0) {
    const colorList = icebergProducts.map(p => {
      const colorMatch = p.name.match(/\(([^)]+)\)/);
      const color = colorMatch ? colorMatch[1] : p.name;
      const link = p.buyLink ? `\n  Buy: ${p.buyLink}` : '';
      return `- ${color} — SKU: ${p.sku} — Price: ${p.finalPrice}${link}`;
    }).join('\n');

    knowledge.push({
      title: "Water Bottles - The Iceberg (40oz)",
      content: `
THRIVE WELLNESS — THE ICEBERG (40oz Water Bottle)

Our most popular water bottle — perfect balance of size and portability.

AVAILABLE COLORS & PRICING:
${colorList}

FEATURES:
- 40oz capacity — ideal for workouts and daily use
- Double-wall vacuum insulation
- Keeps drinks cold for 24+ hours, hot for 12+ hours
- BPA-free stainless steel construction
- Leak-proof Ice Cap lid included
- Wide mouth for easy filling
- Fits most cup holders
- Durable powder-coated finish

CARE INSTRUCTIONS:
- Dishwasher safe (top rack recommended)
- Hand wash with warm soapy water for best results

Perfect for: Workouts, daily hydration, students, commuters.
`
    });
  }

  // ── Electrolytes ───────────────────────────────────────────────────────────
  const electrolyteProducts = active.filter(p => p.category === 'Electrolytes');
  if (electrolyteProducts.length > 0) {
    const flavorList = electrolyteProducts.map(p => {
      const flavorMatch = p.name.match(/\(([^)]+)\)/);
      const flavor = flavorMatch ? flavorMatch[1] : p.name;
      const link = p.buyLink ? `\n  Buy: ${p.buyLink}` : '';
      return `- ${flavor} — SKU: ${p.sku} — Price: ${p.finalPrice}${link}`;
    }).join('\n');

    knowledge.push({
      title: "Supplements - Surge IV Electrolytes",
      content: `
SURGE IV ELECTROLYTES

Premium electrolyte supplement for rapid hydration and peak performance.

AVAILABLE FLAVORS & PRICING:
${flavorList}

PRODUCT DETAILS:
- Servings: 30 per container
- Formula: Zero sugar
- Contains: Essential minerals (sodium, potassium, magnesium, calcium)
- Flavoring: Natural flavors, no artificial colors

BENEFITS:
- Rapid electrolyte replenishment
- Enhances hydration during workouts
- Supports endurance and stamina
- Helps prevent muscle cramps
- Speeds up recovery time
- Boosts energy levels naturally

USAGE: Mix one scoop with 16-20oz of water. Consume during or after exercise for optimal hydration.

DIETARY INFO: Vegan-friendly, zero sugar, no artificial colors.
`
    });
  }

  // ── Supplements (Protein) ──────────────────────────────────────────────────
  const proteinProducts = active.filter(p => p.category === 'Supplements');
  const seasonalProtein = active.filter(p =>
    p.category === 'Seasonal' && p.name.toLowerCase().includes('peak')
  );
  const allProtein = [...proteinProducts, ...seasonalProtein];

  if (allProtein.length > 0) {
    const flavorList = allProtein.map(p => {
      const flavorMatch = p.name.match(/\(([^)]+)\)/);
      const flavor = flavorMatch ? flavorMatch[1] : p.name;
      const seasonal = p.category === 'Seasonal' ? ' (Seasonal)' : '';
      const link = p.buyLink ? `\n  Buy: ${p.buyLink}` : '';
      return `- ${flavor}${seasonal} — SKU: ${p.sku} — Price: ${p.finalPrice}${link}`;
    }).join('\n');

    knowledge.push({
      title: "Supplements - Peak Powder (Protein)",
      content: `
PEAK POWDER

Premium whey protein powder for maximum muscle recovery and growth.

AVAILABLE FLAVORS & PRICING:
${flavorList}

NUTRITION FACTS (per serving):
- Protein: 25g pure whey isolate
- Calories: 120
- Carbohydrates: 2g
- Fat: 1g
- Servings per container: 30

PRODUCT FEATURES:
- Fast-absorbing whey isolate protein
- Mixes easily with no clumps
- Delicious taste that's not too sweet
- Low carb, low fat formula
- No artificial sweeteners
- Gluten-free

BENEFITS:
- Supports muscle growth and repair
- Aids in post-workout recovery
- Helps maintain lean muscle mass
- Satisfies hunger between meals
- Boosts daily protein intake

USAGE: Mix one scoop with 8-12oz of water or milk. Best consumed within 30 minutes after workout or as a meal replacement.

DIETARY INFO: Contains milk ingredients (whey protein). Vegetarian but not vegan. Gluten-free.
`
    });
  }

  // ── Accessories ────────────────────────────────────────────────────────────
  const accessoryProducts = active.filter(p => p.category === 'Accessories');
  if (accessoryProducts.length > 0) {
    const accList = accessoryProducts.map(p => {
      const link = p.buyLink ? `\n  Buy: ${p.buyLink}` : '';
      return `- ${p.name} — SKU: ${p.sku} — Price: ${p.finalPrice}${link}`;
    }).join('\n\n');

    knowledge.push({
      title: "Accessories",
      content: `
THRIVE WELLNESS ACCESSORIES

${accessoryProducts.map(p => {
  const link = p.buyLink ? `\nBuy here: ${p.buyLink}` : '';
  if (p.name.toLowerCase().includes('shaker')) {
    return `SHAKER BALL
SKU: ${p.sku} | Price: ${p.finalPrice}
${link}

Essential accessory for mixing protein shakes smoothly.
Features:
- Stainless steel wire whisk design
- Fits all standard shaker bottles
- Creates smooth, lump-free shakes every time
- Durable, dishwasher safe, reusable

Usage: Drop into bottle with powder and liquid, shake 10-15 seconds.`;
  } else if (p.name.toLowerCase().includes('anchor')) {
    return `THE ANCHOR (Snack Compartment)
SKU: ${p.sku} | Price: ${p.finalPrice}
${link}

Convenient snack storage that attaches to your water bottle.
Features:
- Secure screw-on attachment to wide-mouth bottles
- Airtight seal keeps contents fresh
- BPA-free food-grade plastic
- Easy to clean
- Capacity: ~2 cups of snacks or supplements

Perfect for: gym sessions, hiking, travel — carry snacks and hydration together.`;
  } else {
    return `${p.name}
SKU: ${p.sku} | Price: ${p.finalPrice}
${link}
${p.description || ''}`;
  }
}).join('\n\n---\n\n')}
`
    });
  }

  // ── Bundles ────────────────────────────────────────────────────────────────
  const bundleProducts = active.filter(p => p.category === 'Bundle');
  if (bundleProducts.length > 0) {
    const bundleContent = bundleProducts.map(p => {
      const link = p.buyLink ? `\nBuy here: ${p.buyLink}` : '';
      if (p.name.toLowerCase().includes('alo')) {
        return `ALO X THRIVE BUNDLE
SKU: ${p.sku} | Price: ${p.finalPrice}
${link}

Premium wellness bundle combining Alo yoga products with Thrive supplements.
INCLUDES:
- Alo Yoga Mat (premium quality)
- Alo Yoga Blocks (set of 2)
- Alo Resistance Bands (set of 3)
- Peak Powder (choice of flavor)
- Surge IV Electrolytes (choice of 2 flavors)
- Thrive Water Bottle (40oz Iceberg)
- Exclusive Alo x Thrive gym bag
Perfect for: Yoga enthusiasts, home workouts, gift giving.`;
      } else if (p.name.toLowerCase().includes('peloton') || p.name.toLowerCase().includes('peleton')) {
        return `PELOTON X THRIVE BUNDLE
SKU: ${p.sku} | Price: ${p.finalPrice}
${link}

Our most comprehensive fitness package.
INCLUDES:
- Peloton Bike (or Bike+)
- Peloton All-Access Membership (3 months)
- Peloton Cycling Shoes & Weights Set
- Peak Powder (3 tubs, all flavors)
- Surge IV Electrolytes (full flavor collection)
- Thrive Water Bottle (64oz Glacier)
- Thrive Shaker Ball
- Exclusive Peloton x Thrive accessories
Perfect for: Serious fitness enthusiasts, home gym setups, cycling lovers.`;
      } else if (p.name.toLowerCase().includes('fall')) {
        return `FALL BUNDLE
SKU: ${p.sku} | Price: ${p.finalPrice}
${link}

Limited-edition seasonal collection featuring autumn-inspired products.
INCLUDES:
- Peak Powder Pumpkin Spice (2 tubs)
- Surge IV Apple Cider (2 containers)
- Thrive Water Bottle (choice of size)
- Seasonal recipe guide
- Exclusive fall-themed accessories
Limited availability — seasonal item!`;
      } else {
        return `${p.name}
SKU: ${p.sku} | Price: ${p.finalPrice}
${link}
${p.description || ''}`;
      }
    }).join('\n\n---\n\n');

    knowledge.push({
      title: "Bundles - Premium Value Packages",
      content: `
THRIVE WELLNESS BUNDLES

${bundleContent}
`
    });
  }

  // ── Subscriptions ──────────────────────────────────────────────────────────
  const subscriptionProducts = active.filter(p => p.category === 'Subscriptions');
  if (subscriptionProducts.length > 0) {
    const subList = subscriptionProducts.map(p => {
      const link = p.buyLink ? `\n  Buy: ${p.buyLink}` : '';
      return `- ${p.name} — SKU: ${p.sku} — Price: ${p.finalPrice}${link}`;
    }).join('\n');

    knowledge.push({
      title: "Subscriptions - Annual Electrolyte Supply",
      content: `
THRIVE WELLNESS SUBSCRIPTIONS

Never run out of your favorite electrolytes! Our subscription plans provide a full one-year supply at a great value.

AVAILABLE SUBSCRIPTION PLANS:
${subList}

DETAILS:
- Duration: One full year supply (12 months)
- Product: Surge IV Electrolytes
- Single Flavor: Get your favorite flavor delivered every month
- Assorted Flavor: Variety pack with multiple flavors
- Savings: Significant discount vs. buying individual containers monthly

Perfect for: Dedicated athletes, daily electrolyte users, anyone who wants hassle-free hydration year-round.
`
    });
  }

  // ── Full Product Catalog Summary ───────────────────────────────────────────
  const allActiveByCategory = {};
  active.forEach(p => {
    const cat = p.category;
    if (!allActiveByCategory[cat]) allActiveByCategory[cat] = [];
    allActiveByCategory[cat].push(p);
  });

  let catalogContent = `THRIVE WELLNESS — COMPLETE PRODUCT CATALOG\n\n`;
  catalogContent += `All active products with buy links:\n\n`;

  for (const [cat, prods] of Object.entries(allActiveByCategory)) {
    catalogContent += `${cat.toUpperCase()}:\n`;
    prods.forEach(p => {
      catalogContent += `  • ${p.name} | SKU: ${p.sku} | ${p.finalPrice}`;
      if (p.buyLink) catalogContent += ` | Buy: ${p.buyLink}`;
      catalogContent += '\n';
    });
    catalogContent += '\n';
  }

  knowledge.push({
    title: "Complete Product Catalog with Buy Links",
    content: catalogContent
  });

  // ── Products Being Phased Out ──────────────────────────────────────────────
  if (removalPending.length > 0) {
    const discontinuedList = removalPending.map(p =>
      `- ${p.name} (SKU: ${p.sku}) — Status: ${p.status}`
    ).join('\n');

    knowledge.push({
      title: "Discontinued / Phased Out Products",
      content: `
THRIVE WELLNESS — DISCONTINUED PRODUCTS

The following products are being phased out and may no longer be available:

${discontinuedList}

Please check the website or contact us for current availability.
`
    });
  }

  return knowledge;
}

// ─── Training Docs ──────────────────────────────────────────────────────────

function loadTrainingDocs() {
  const trainingDocsPath = path.join(__dirname, '../training-docs');
  const docs = [];

  if (!fs.existsSync(trainingDocsPath)) {
    console.log('⚠️  No training-docs folder found, skipping...');
    return docs;
  }

  const files = fs.readdirSync(trainingDocsPath);
  const supportedExtensions = ['.txt', '.md', '.json'];

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!supportedExtensions.includes(ext)) continue;

    const filePath = path.join(trainingDocsPath, file);
    const stats = fs.statSync(filePath);

    if (!stats.isFile()) continue;

    try {
      let content = fs.readFileSync(filePath, 'utf-8');

      if (ext === '.json') {
        const jsonData = JSON.parse(content);
        content = JSON.stringify(jsonData, null, 2);
      }

      docs.push({
        title: `Training Document: ${file}`,
        content: content
      });

      console.log(`   ✓ Loaded: ${file} (${(stats.size / 1024).toFixed(1)}KB)`);
    } catch (err) {
      console.log(`   ✗ Failed to load ${file}: ${err.message}`);
    }
  }

  return docs;
}

// ─── PDF Newsletters ────────────────────────────────────────────────────────

async function loadPdfNewsletters() {
  const results = [];
  const newslettersDir = path.join(__dirname, '../public/newsletters');
  const pdfPaths = [
    path.join(newslettersDir, 'October Newsletter.pdf'),
    path.join(newslettersDir, 'November Newsletter.pdf'),
    path.join(newslettersDir, 'January Newsletter.pdf'),
  ];

  let pdfParse = null;
  let pdfModule = null;
  try {
    const require = createRequire(import.meta.url);
    let modCjs = null;
    try { modCjs = require('pdf-parse'); } catch {}
    if (!modCjs) {
      try { modCjs = require('pdf-parse/lib/pdf-parse.js'); } catch {}
    }
    pdfModule = modCjs;
    if (typeof modCjs === 'function') {
      pdfParse = modCjs;
    } else if (typeof modCjs?.default === 'function') {
      pdfParse = modCjs.default;
    } else if (typeof modCjs?.pdf === 'function') {
      pdfParse = modCjs.pdf;
    } else if (typeof modCjs?.pdfParse === 'function') {
      pdfParse = modCjs.pdfParse;
    } else if (typeof modCjs?.PDFParse === 'function') {
      pdfParse = async (dataBuffer) => {
        const parser = new modCjs.PDFParse(dataBuffer);
        if (typeof parser.load === 'function') await parser.load();
        if (typeof parser.getText === 'function') return await parser.getText();
        throw new Error('pdf-parse PDFParse instance has no getText() method');
      };
    }
    if (!pdfParse) {
      const mod = await import('pdf-parse');
      pdfModule = mod;
      if (typeof mod === 'function') pdfParse = mod;
      else if (typeof mod?.default === 'function') pdfParse = mod.default;
      else if (typeof mod?.pdf === 'function') pdfParse = mod.pdf;
      else if (typeof mod?.pdfParse === 'function') pdfParse = mod.pdfParse;
    }
  } catch (e) {
    console.log('ℹ️  pdf-parse is not installed. Skipping PDF ingestion. To enable, run: npm i pdf-parse');
    return results;
  }

  if (typeof pdfParse !== 'function') {
    const keys = pdfModule ? Object.keys(pdfModule || {}) : [];
    console.log('⚠️  Unable to resolve pdf-parse parser export. Found keys:', keys);
    return results;
  }

  for (const absPath of pdfPaths) {
    try {
      if (!fs.existsSync(absPath)) {
        console.log(`   ⚠️  PDF not found, skipping: ${absPath}`);
        continue;
      }

      const dataBuffer = fs.readFileSync(absPath);
      const data = new Uint8Array(dataBuffer);
      const parsed = await pdfParse(data);
      const rawText = typeof parsed === 'string' ? parsed.trim() : String(parsed?.text || '').trim();
      if (!rawText) {
        console.log(`   ⚠️  No extractable text in: ${absPath}`);
        continue;
      }

      const fileName = path.basename(absPath);
      const title = `Newsletter: ${fileName.replace(/\.pdf$/i, '')}`;
      const content = rawText.length > 50000 ? rawText.slice(0, 50000) + '\n... [truncated]' : rawText;

      results.push({ title, content });
      console.log(`   ✓ Ingested PDF: ${fileName} (${content.length.toLocaleString()} chars)`);
    } catch (err) {
      console.log(`   ✗ Failed to parse PDF ${absPath}: ${err.message}`);
    }
  }

  return results;
}

// ─── Main Build ─────────────────────────────────────────────────────────────

async function buildKnowledgeBase() {
  console.log('Building comprehensive knowledge base...\n');

  const knowledge = [];

  // 1. Training documents
  console.log('Loading training documents...');
  const trainingDocs = loadTrainingDocs();
  if (trainingDocs.length > 0) {
    knowledge.push(...trainingDocs);
    console.log(`   Added ${trainingDocs.length} training documents\n`);
  } else {
    console.log('   No training documents found\n');
  }

  // 2. PDF newsletters
  console.log('Ingesting company newsletters (PDF)...');
  const pdfDocs = await loadPdfNewsletters();
  if (pdfDocs.length > 0) {
    const consolidated = pdfDocs
      .map(d => `## ${d.title}\n\n${d.content}`)
      .join('\n\n---\n\n');
    knowledge.push({
      title: "Company Newsletters (Consolidated)",
      content: consolidated
    });
    console.log(`   Added 1 consolidated newsletters entry (from ${pdfDocs.length} PDFs)\n`);
  } else {
    console.log('   No newsletters ingested (missing pdf-parse or files).\n');
  }

  // 3. Products from CSV (auto-sync with latest data)
  console.log('Loading products from products.csv...');
  const csvProducts = loadProductsFromCSV();
  if (csvProducts.length > 0) {
    const productKnowledge = buildProductKnowledge(csvProducts);
    knowledge.push(...productKnowledge);
    console.log(`   Added ${productKnowledge.length} product knowledge entries from CSV\n`);
  } else {
    console.log('   No CSV products found, using fallback product info\n');
    // Fallback static product info if CSV is missing
    knowledge.push(...buildFallbackProductKnowledge());
  }

  // 4. Company information
  console.log('Adding company information...');

  knowledge.push({
    title: "Company Overview - Thrive Wellness",
    content: `
Thrive Wellness is a Virtual Enterprises International (VEI) educational project for the 2025-2026 academic year.

COMPANY NAME: Thrive Wellness
TYPE: Virtual Enterprises International Educational Project
LOCATION: Aurora, Illinois, USA
ADDRESS: 2590 Ogden Ave, Aurora, IL 60504
PHONE: +1 (630) 375-3300
EMAIL: thrivewellness.il@veinternational.org
WEBSITE: thrive-ve.com

MISSION: At Thrive, we believe that wellness should be simple, accessible, and sustainable. Our mission is to create innovative products that empower you to live your best life while caring for the planet we all share.

VISION: Revolutionizing wellness through premium, science-backed products.

COMPANY VALUES:
- Health First: Every product is designed with your health and wellness at the forefront
- Sustainability: Committed to reducing environmental impact through sustainable materials and practices
- Quality: Maintaining the highest standards from sourcing to manufacturing
- Community: Building a community of wellness-minded individuals who support and inspire each other
- Pure & Natural: Made with the finest natural ingredients
- Lab Tested: Rigorously tested for quality and safety
- Customer First: Your satisfaction is our priority
- Real Results: Proven effectiveness you can feel

ACHIEVEMENTS:
- Products Available: 15+ active products
- Products Sold: 1500+
- Customers Served: 500+
- Years Strong: 1

This is an educational simulation - products shown are for educational purposes within the VEI ecosystem.
`
  });

  // 5. Contact information
  console.log('Adding contact information...');

  knowledge.push({
    title: "Contact Information",
    content: `
THRIVE WELLNESS CONTACT INFORMATION

PHONE: +1 (630) 375-3300
EMAIL: thrivewellness.il@veinternational.org
This is our primary contact email for all inquiries.

LOCATION:
Thrive Wellness Headquarters
2590 Ogden Ave, Aurora, IL 60504
United States

BUSINESS HOURS:
Monday - Friday: 9:00 AM - 5:00 PM CST
Saturday - Sunday: Closed

RESPONSE TIME:
We typically respond to all inquiries within 24-48 business hours.

DEPARTMENTS:
- Sales Team (CSO removedforprivacyreasons): Product inquiries and orders
- Marketing Team (CMO removedforprivacyreasons): Partnerships and collaborations
- Customer Service: General questions and support
- Accounting (CFO removedforprivacyreasons): Billing and financial inquiries
- Creative (CDO removedforprivacyreasons): Design and branding questions
- HR (removedforprivacyreasons, removedforprivacyreasons, removedforprivacyreasons): Career inquiries

For urgent matters, please email us directly at thrivewellness.il@veinternational.org
`
  });

  // 6. Leadership & team
  console.log('Adding team information...');

  knowledge.push({
    title: "Leadership Team",
    content: `
THRIVE WELLNESS LEADERSHIP TEAM

EXECUTIVE LEADERSHIP:

removedforprivacyreasons - Chief Executive Officer (CEO)
Leading Thrive's vision with passion for wellness. removedforprivacyreasons oversees all company operations and strategic direction.

removedforprivacyreasons - Chief Financial Officer (CFO)
Overseeing financial strategy and growth. removedforprivacyreasons leads the Accounting department and manages all financial operations.

removedforprivacyreasons - Chief Design Officer (CDO)
Shaping visual identity and UX. removedforprivacyreasons leads the Creative department and is responsible for all design and branding.

removedforprivacyreasons - Chief Administrative Officer (CAO)
Ensuring operational excellence. removedforprivacyreasons manages day-to-day operations and administrative functions.

removedforprivacyreasons - Chief Marketing Officer (CMO)
Driving brand awareness. removedforprivacyreasons leads the Marketing department and oversees all promotional activities.

removedforprivacyreasons - Chief Sales Officer (CSO)
Leading sales initiatives. removedforprivacyreasons heads the Sales department and manages customer relationships.
`
  });

  knowledge.push({
    title: "Department Teams",
    content: `
THRIVE WELLNESS DEPARTMENTS

ACCOUNTING DEPARTMENT (Led by CFO removedforprivacyreasons):
- removedforprivacyreasons - Financial Analyst: Crunching numbers and forecasting growth with precision
- Siyansh Virmani - Accountant: Keeping the books balanced and the finances flowing
- removedforprivacyreasons - Financial Associate: Supporting financial operations with attention to detail

CREATIVE DEPARTMENT (Led by CDO removedforprivacyreasons):
- removedforprivacyreasons - Graphic Designer: Bringing bold ideas to life through stunning visuals
- removedforprivacyreasons - UX/UI Designer: Crafting seamless experiences that users love
- removedforprivacyreasons - Creative Director: Leading creative vision with innovation and style

SALES DEPARTMENT (Led by CSO removedforprivacyreasons):
- removedforprivacyreasons - Sales Representative: Building relationships and closing deals with confidence
- removedforprivacyreasons - Sales Person: Driving revenue and connecting with customers

MARKETING DEPARTMENT (Led by CMO removedforprivacyreasons):
- removedforprivacyreasons - Marketing Specialist: Creating campaigns that resonate and convert
- removedforprivacyreasons - Digital Marketer: Mastering social media and digital engagement
- removedforprivacyreasons - Content Strategist: Telling stories that captivate and inspire action

HUMAN RESOURCES DEPARTMENT:
- removedforprivacyreasons - HR Specialist: Nurturing talent and fostering a positive culture
- removedforprivacyreasons - Talent Acquisition: Finding the best people to join our mission
- removedforprivacyreasons - HR Coordinator: Keeping the team organized and supported

Total Team Members: 20 dedicated professionals
`
  });

  // 7. Shipping information
  console.log('Adding shipping information...');

  knowledge.push({
    title: "Shipping Information",
    content: `
THRIVE WELLNESS SHIPPING

SHIPPING OPTIONS:

STANDARD SHIPPING
- Cost: FREE on all orders
- Delivery Time: 5-7 business days
- Description: Our reliable standard shipping option from our Aurora, IL facility. Orders are processed within 1-2 business days.

EXPRESS SHIPPING
- Cost: $9.99
- Delivery Time: 2-3 business days
- Description: Need it faster? Express shipping gets your order to you in no time from our Illinois warehouse.

INTERNATIONAL SHIPPING
- Cost: FREE on all orders
- Delivery Time: 10-14 business days
- Description: We now ship globally from our Aurora headquarters! International rates apply based on destination.

SHIPPING HEADQUARTERS:
2590 Ogden Ave, Aurora, IL 60504

PROCESSING HOURS:
Monday - Friday: 9AM - 5PM CST

ORDER PROCESSING:
All orders are processed at our Illinois headquarters within 1-2 business days before shipping.

SHIPPING COVERAGE:
We ship to all 50 US states and internationally to select countries from our Aurora, IL facility.

DELIVERY ISSUES:
If your package is lost, damaged, or hasn't arrived within the expected timeframe, please contact us at thrivewellness.il@veinternational.org

HOLIDAY SHIPPING:
During peak holiday seasons, shipping times may be slightly longer. We recommend ordering early to ensure timely delivery.

Note: This is an educational VEI project - actual shipping is simulated within the VEI ecosystem.
`
  });

  // 8. FAQ
  console.log('Adding FAQ...');

  knowledge.push({
    title: "Frequently Asked Questions (FAQ)",
    content: `
THRIVE WELLNESS - FREQUENTLY ASKED QUESTIONS

Q: How long does shipping take?
A: Standard shipping takes 5-7 business days within the US. Express shipping (2-3 business days) is available at checkout for $9.99.

Q: What is your return policy?
A: Since our products are tangible wellness items, we do not accept returns. However, if you receive a damaged or defective product, please contact us immediately at thrivewellness.il@veinternational.org for a replacement.

Q: Are your products BPA-free?
A: Yes! All Thrive products are made with BPA-free, food-grade materials that are safe for everyday use.

Q: How do I clean my water bottle?
A: Our bottles are dishwasher safe (top rack). For best results, we recommend hand washing with warm soapy water and letting it air dry.

Q: Do you ship internationally?
A: Yes! We ship to all 50 US states and internationally to select countries. International shipping takes 10-14 business days.

Q: What payment methods do you accept?
A: We accept Visa, MasterCard, American Express, Discover, and other major credit and debit cards. We also support bank transfers and digital payment methods. All transactions are processed through the VEI portal.

Q: Are the supplements vegan?
A: Our Surge IV electrolytes are vegan-friendly. Peak Powder contains whey protein, which is vegetarian but not vegan. Check individual product pages for detailed ingredient information.

Q: What is Thrive Wellness?
A: Thrive Wellness is a Virtual Enterprises International (VEI) educational project. We create premium wellness products including water bottles, supplements, and accessories as part of our business education curriculum.

Q: How can I contact you?
A: Email us at thrivewellness.il@veinternational.org. We typically respond within 24-48 business hours.

Q: Where are you located?
A: Our headquarters is at 2590 Ogden Ave, Aurora, IL 60504.

Q: What are your business hours?
A: Monday - Friday, 9AM - 5PM CST.

Q: Who is the CEO?
A: removedforprivacyreasons is our Chief Executive Officer.

Q: What's your most popular product?
A: Peak Powder Chocolate and The Iceberg water bottle are customer favorites!

Q: Do you offer subscriptions?
A: Yes! We offer annual electrolyte subscriptions — single flavor or assorted — for a convenient one-year supply at a great price.

Q: Do you offer discounts or bundles?
A: Yes! Our bundles offer significant savings. The Alo x Thrive Bundle, Peloton x Thrive Bundle, and Fall Bundle are all great value packages.

Q: What water bottle sizes do you offer?
A: We offer The Glacier (64oz) for all-day hydration and The Iceberg (40oz) for everyday use, both in multiple colors.

Q: What electrolyte flavors are available?
A: We carry Blue Razzberry, Fruit Punch, Lemonade, Pina Colada, Strawberry, Tropical Vibes, Cucumber Lime, Apple Cider, Cranberry, and an Assorted pack.

Q: What protein flavors are available?
A: We carry Chocolate, Vanilla, Pumpkin Spice, Gingerbread, and Marshmallow (seasonal flavors vary by availability).
`
  });

  // Save knowledge base
  const outputPath = path.join(__dirname, '../public/knowledge_base.json');

  console.log(`\nSaving knowledge base with ${knowledge.length} entries...`);

  fs.writeFileSync(outputPath, JSON.stringify(knowledge, null, 2), 'utf-8');

  console.log(`\n✅ Knowledge base built successfully!`);
  console.log(`   Total entries: ${knowledge.length}`);
  console.log(`   Output: ${outputPath}`);
  console.log(`\nNext step: Run 'npm run build:rag' to create RAG index`);
}

// ─── Fallback static products (if CSV not found) ─────────────────────────────

function buildFallbackProductKnowledge() {
  return [
    {
      title: "Water Bottles - The Glacier (64oz)",
      content: `
THRIVE WELLNESS — THE GLACIER (64oz Water Bottle)
Price: $75.00

Available colors: Black (BO-41), Brown (BO-42), Frost Blue (BO-43), Maroon (BO-44), Orange (BO-45), White (BO-46), Santa Sleigh (BO-47), Rudolph Red (BO-48), Iced Cookie (BO-49), Christmas Tree (BO-50)

Features: 64oz capacity, double-wall vacuum insulation, keeps cold 24+ hrs, hot 12+ hrs, BPA-free stainless steel, leak-proof Ice Cap lid, wide mouth, fits most cup holders, powder-coated finish.
`
    },
    {
      title: "Water Bottles - The Iceberg (40oz)",
      content: `
THRIVE WELLNESS — THE ICEBERG (40oz Water Bottle)
Price: $60.00

Available colors: Black (BO-31), Brown (BO-32), Frost Blue (BO-33), Maroon (BO-34), Orange (BO-35), White (BO-36), Christmas Tree (BO-37), Iced Cookie (BO-38), Rudolph Red (BO-39), Santa's Sleigh (BO-40)

Features: 40oz capacity, double-wall vacuum insulation, keeps cold 24+ hrs, hot 12+ hrs, BPA-free stainless steel, leak-proof Ice Cap lid, wide mouth, fits cup holders, powder-coated finish.
`
    }
  ];
}

// Run
await buildKnowledgeBase();
