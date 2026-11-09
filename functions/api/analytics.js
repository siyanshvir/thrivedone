const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// ── JWT signing via Web Crypto API ────────────────────────────────────────────

async function b64url(data) {
  const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  const b64 = btoa(String.fromCharCode(...new Uint8Array(bytes)));
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function signJwt(payload, privateKeyPem) {
  const header = { alg: 'RS256', typ: 'JWT' };
  const signingInput = `${await b64url(JSON.stringify(header))}.${await b64url(JSON.stringify(payload))}`;
  const pem = privateKeyPem.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, '');
  const der = Uint8Array.from(atob(pem), c => c.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    'pkcs8', der.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false, ['sign']
  );
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(signingInput));
  return `${signingInput}.${await b64url(sig)}`;
}

async function getAccessToken(clientEmail, privateKey) {
  const now = Math.floor(Date.now() / 1000);
  const jwt = await signJwt({
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  }, privateKey);

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
  });
  if (!res.ok) throw new Error(`OAuth token error: ${await res.text()}`);
  return (await res.json()).access_token;
}

// ── GA4 API helpers ────────────────────────────────────────────────────────────

async function runReport(propertyId, token, body) {
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
  );
  if (!res.ok) throw new Error(`GA4 runReport error: ${await res.text()}`);
  return res.json();
}

async function runRealtimeReport(propertyId, token, body) {
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`,
    { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
  );
  if (!res.ok) throw new Error(`GA4 realtimeReport error: ${await res.text()}`);
  return res.json();
}

function rangeToStartDate(range) {
  return { '7d': '7daysAgo', '30d': '30daysAgo', '90d': '90daysAgo', '180d': '180daysAgo', '365d': '365daysAgo' }[range] ?? '30daysAgo';
}

function jsonRes(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
}

// ── Handler ────────────────────────────────────────────────────────────────────

export async function onRequest({ request, env }) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS_HEADERS });

  try {
    const url = new URL(request.url);
    const type = url.searchParams.get('type') ?? 'historical';
    const range = url.searchParams.get('range') ?? '30d';

    const clientEmail = env.GA_CLIENT_EMAIL;
    const privateKey = env.GA_PRIVATE_KEY;
    const propertyId = env.GA_PROPERTY_ID ?? '526943248';

    if (!clientEmail) {
      console.error('Analytics: GA_CLIENT_EMAIL is missing');
      return jsonRes({ error: 'Missing GA_CLIENT_EMAIL environment variable. Please check your Cloudflare Dashboard.' }, 500);
    }
    if (!privateKey) {
      console.error('Analytics: GA_PRIVATE_KEY is missing');
      return jsonRes({ error: 'Missing GA_PRIVATE_KEY environment variable. Please check your Cloudflare Dashboard.' }, 500);
    }

    // Clean private key: 
    // 1. Remove literal quotes if they exist (common copy-paste error)
    // 2. Handle escaped newlines (\n)
    // 3. Trim whitespace
    const cleanPrivateKey = privateKey
      .replace(/^["']|["']$/g, '')
      .replace(/\\n/g, '\n')
      .trim();

    const token = await getAccessToken(clientEmail, cleanPrivateKey);

    // ── Realtime ──────────────────────────────────────────────────────────────
    if (type === 'realtime') {
      try {
        const [geoReport, techReport] = await Promise.all([
          runRealtimeReport(propertyId, token, {
            dimensions: [
              { name: 'country' },
              { name: 'city' },
              { name: 'minutesAgo' }
            ],
            metrics: [{ name: 'activeUsers' }],
          }),
          runRealtimeReport(propertyId, token, {
            dimensions: [
              { name: 'unifiedScreenName' },
              { name: 'deviceCategory' }
            ],
            metrics: [{ name: 'activeUsers' }],
          })
        ]);

        const geoRows = geoReport.rows ?? [];
        const techRows = techReport.rows ?? [];

        // Calculate 5m vs 30m windows
        let users5m = 0;
        let users30m = 0;
        const cityData = {};
        const countryData = {};

        geoRows.forEach(r => {
          const country = r.dimensionValues[0].value;
          const city = r.dimensionValues[1].value;
          const mins = parseInt(r.dimensionValues[2].value, 10);
          const val = parseInt(r.metricValues[0].value, 10);

          users30m += val;
          if (mins <= 5) users5m += val;

          countryData[country] = (countryData[country] || 0) + val;
          const cityKey = `${city}, ${country}`;
          cityData[cityKey] = (cityData[cityKey] || 0) + val;
        });

        const pageData = {};
        const techData = {};

        techRows.forEach(r => {
          const page = r.dimensionValues[0].value;
          const device = r.dimensionValues[1].value;
          const val = parseInt(r.metricValues[0].value, 10);

          pageData[page] = (pageData[page] || 0) + val;
          techData[device] = (techData[device] || 0) + val;
        });

        return jsonRes({
          activeUsers: users30m,
          activeUsers5m: users5m,
          byCountry: Object.entries(countryData).map(([country, activeUsers]) => ({ country, activeUsers })).sort((a, b) => b.activeUsers - a.activeUsers),
          byCity: Object.entries(cityData).map(([city, activeUsers]) => ({ city, activeUsers })).sort((a, b) => b.activeUsers - a.activeUsers),
          byPage: Object.entries(pageData).map(([page, activeUsers]) => ({ page, activeUsers })).sort((a, b) => b.activeUsers - a.activeUsers),
          byDevice: Object.entries(techData).map(([device, activeUsers]) => ({ device, activeUsers })).sort((a, b) => b.activeUsers - a.activeUsers),
        });
      } catch (rtErr) {
        return jsonRes({ error: `GA4 Realtime API error: ${rtErr.message}` }, 500);
      }
    }

    // ── Historical ────────────────────────────────────────────────────────────
    const startDate = rangeToStartDate(range);
    const BASE = { dateRanges: [{ startDate, endDate: 'today' }] };

    try {
      const [mainReport, geoReport, techReport, pageReport, sourceReport] = await Promise.all([
        // 1. Core Traffic & Daily Trends
        runReport(propertyId, token, {
          ...BASE,
          dimensions: [{ name: 'date' }],
          metrics: [
            { name: 'activeUsers' },
            { name: 'newUsers' },
            { name: 'totalUsers' },
            { name: 'sessions' },
            { name: 'screenPageViews' },
            { name: 'averageSessionDuration' },
            { name: 'engagedSessions' }
          ],
        }),
        // 2. Geography (Country & City)
        runReport(propertyId, token, {
          ...BASE,
          dimensions: [{ name: 'country' }, { name: 'city' }],
          metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],
          limit: 100,
          orderBys: [{ desc: true, metric: { metricName: 'activeUsers' } }],
        }),
        // 3. Technology
        runReport(propertyId, token, {
          ...BASE,
          dimensions: [{ name: 'deviceCategory' }, { name: 'browser' }, { name: 'operatingSystem' }],
          metrics: [{ name: 'activeUsers' }],
          limit: 50,
        }),
        // 4. Pages
        runReport(propertyId, token, {
          ...BASE,
          dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
          metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }],
          limit: 50,
          orderBys: [{ desc: true, metric: { metricName: 'screenPageViews' } }],
        }),
        // 5. Traffic Sources
        runReport(propertyId, token, {
          ...BASE,
          dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }],
          metrics: [{ name: 'sessions' }, { name: 'activeUsers' }],
          limit: 50,
        })
      ]);

      // Process Daily Trends
      const byDate = (mainReport.rows ?? []).map(r => ({
        date: r.dimensionValues[0].value,
        activeUsers: parseInt(r.metricValues[0].value, 10),
        newUsers: parseInt(r.metricValues[1].value, 10),
        totalUsers: parseInt(r.metricValues[2].value, 10),
        sessions: parseInt(r.metricValues[3].value, 10),
        pageViews: parseInt(r.metricValues[4].value, 10),
        avgSessionDuration: parseFloat(r.metricValues[5].value),
        engagedSessions: parseInt(r.metricValues[6].value, 10),
      })).sort((a, b) => a.date.localeCompare(b.date)); // Ensure chronological order

      // Process Geo
      const byGeo = (geoReport.rows ?? []).map(r => ({
        country: r.dimensionValues[0].value,
        city: r.dimensionValues[1].value,
        users: parseInt(r.metricValues[0].value, 10),
        sessions: parseInt(r.metricValues[1].value, 10),
      }));

      // Process Tech
      const byTech = (techReport.rows ?? []).map(r => ({
        device: r.dimensionValues[0].value,
        browser: r.dimensionValues[1].value,
        os: r.dimensionValues[2].value,
        users: parseInt(r.metricValues[0].value, 10),
      }));

      // Process Pages
      const byPage = (pageReport.rows ?? []).map(r => ({
        path: r.dimensionValues[0].value,
        title: r.dimensionValues[1].value,
        views: parseInt(r.metricValues[0].value, 10),
        users: parseInt(r.metricValues[1].value, 10),
      }));

      // Process Sources
      const bySource = (sourceReport.rows ?? []).map(r => ({
        source: r.dimensionValues[0].value,
        medium: r.dimensionValues[1].value,
        sessions: parseInt(r.metricValues[0].value, 10),
        users: parseInt(r.metricValues[1].value, 10),
      }));

      const totals = mainReport.totals?.[0]?.metricValues;
      const summary = totals ? {
        activeUsers: parseInt(totals[0].value, 10),
        newUsers: parseInt(totals[1].value, 10),
        totalUsers: parseInt(totals[2].value, 10),
        sessions: parseInt(totals[3].value, 10),
        pageViews: parseInt(totals[4].value, 10),
        avgSessionDuration: parseFloat(totals[5].value),
        engagedSessions: parseInt(totals[6].value, 10),
      } : null;

      return jsonRes({ byDate, byGeo, byTech, byPage, bySource, summary });
    } catch (histErr) {
      console.error('GA4 Historical Error:', histErr);
      return jsonRes({ error: `GA4 Historical API error: ${histErr.message}` }, 500);
    }

  } catch (err) {
    console.error('Analytics Error:', err);
    return jsonRes({
      error: err.message,
      stack: err.stack,
      debug: {
        hasClientEmail: !!env.GA_CLIENT_EMAIL,
        hasPrivateKey: !!env.GA_PRIVATE_KEY,
        propertyId: env.GA_PROPERTY_ID ?? 'default'
      }
    }, 500);
  }
}
