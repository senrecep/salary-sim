import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'static')));

// --- Exchange Rate Cache ---
let exchangeRateCache = {
  rate: null,
  lastFetched: 0
};

// Exchange rate API endpoint
app.get('/api/exchange-rate', async (req, res) => {
  const now = Date.now();
  const cacheDuration = 5 * 60 * 1000; // 5 minutes
  if (exchangeRateCache.rate !== null && (now - exchangeRateCache.lastFetched) < cacheDuration) {
    console.log(`💱 [Exchange Rate] Cache HIT: 1 USD = ${exchangeRateCache.rate} TRY (fetched at ${new Date(exchangeRateCache.lastFetched).toISOString()})`);
    return res.json({
      success: true,
      usd_try: exchangeRateCache.rate,
      timestamp: new Date(exchangeRateCache.lastFetched).toISOString(),
      source: 'cache'
    });
  }
  console.log('💱 [Exchange Rate] Cache MISS: Fetching from APIs...');
  try {
    // Try multiple free APIs for reliability (HTTPS priority, no auth required)
    const apis = [
      // Primary HTTPS APIs
      'https://api.exchangerate-api.com/v4/latest/USD',
      'https://open.er-api.com/v6/latest/USD', 
      'https://api.fxratesapi.com/latest?base=USD&symbols=TRY',
      // Backup HTTP APIs
      'http://api.exchangerate-api.com/v4/latest/USD',
      'http://api.fxratesapi.com/latest?base=USD&symbols=TRY'
    ];

    let data = null;
    let lastError = null;

    for (const apiUrl of apis) {
      try {
        // Create timeout promise
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), 5000);
        });

        const fetchPromise = fetch(apiUrl, {
          headers: {
            'User-Agent': 'SalarySimulator/1.0',
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });

        const response = await Promise.race([fetchPromise, timeoutPromise]);

        if (response.ok) {
          data = await response.json();
          console.log(`✅ Successfully fetched from: ${apiUrl}`);
          break;
        } else {
          console.warn(`⚠️ API failed: ${apiUrl} - Status: ${response.status}`);
        }
      } catch (error) {
        console.warn(`⚠️ API error: ${apiUrl} - ${error.message}`);
        lastError = error;
      }
    }

    if (!data) {
      throw lastError || new Error('All exchange rate APIs failed');
    }

    // Handle different API response formats
    let tryRate = null;
    // Standard format: { rates: { TRY: value } }
    if (data.rates?.TRY) {
      tryRate = data.rates.TRY;
    }
    // Alternative format: { TRY: value }
    else if (data.TRY) {
      tryRate = data.TRY;
    }
    // Result format: { result: { TRY: value } }
    else if (data.result?.TRY) {
      tryRate = data.result.TRY;
    }
    // Conversion rates format: { conversion_rates: { TRY: value } }
    else if (data.conversion_rates?.TRY) {
      tryRate = data.conversion_rates.TRY;
    }
    // JSDelivr CDN format: direct value
    else if (typeof data === 'number') {
      tryRate = data;
    }
    // Alternative object formats
    else if (data.try) {
      tryRate = data.try;
    }

    if (!tryRate || isNaN(tryRate) || tryRate <= 0) {
      console.error('❌ API Response:', JSON.stringify(data, null, 2));
      throw new Error(`Invalid TRY rate: ${tryRate}`);
    }

    // Validate rate is in reasonable range
    if (tryRate < 10 || tryRate > 100) {
      console.warn(`⚠️ Unusual rate: ${tryRate}, using fallback`);
      throw new Error(`Rate out of range: ${tryRate}`);
    }

    const roundedRate = Math.round(tryRate * 10000) / 10000;
    exchangeRateCache.rate = roundedRate;
    exchangeRateCache.lastFetched = now;
    console.log(`💱 [Exchange Rate] Cache UPDATED: 1 USD = ${roundedRate} TRY (fetched at ${new Date(now).toISOString()})`);
    res.json({
      success: true,
      usd_try: roundedRate,
      timestamp: new Date(now).toISOString(),
      source: 'live'
    });
  } catch (error) {
    console.error('❌ Exchange rate API error:', error.message);
    // Hata durumunda, cache'de eski bir değer varsa onu döndür
    if (exchangeRateCache.rate !== null) {
      console.warn(`💱 [Exchange Rate] API ERROR, returning cached value: 1 USD = ${exchangeRateCache.rate} TRY (fetched at ${new Date(exchangeRateCache.lastFetched).toISOString()})`);
      return res.json({
        success: true,
        usd_try: exchangeRateCache.rate,
        timestamp: new Date(exchangeRateCache.lastFetched).toISOString(),
        source: 'cache',
        error: error.message
      });
    }
    // Hiç cache yoksa fallback olarak 42 döndür
    const fallbackRate = 42;
    res.json({
      success: true,
      usd_try: fallbackRate,
      timestamp: new Date().toISOString(),
      source: 'fallback',
      error: error.message
    });
    console.log(`🔄 Using fallback rate: 1 USD = ${fallbackRate} TRY`);
  }
});


// --- GitHub Stars Cache ---
let githubStarsCache = {
  count: null,
  lastFetched: 0
};

// GitHub Stars API endpoint (cache for 1 minute)
app.get('/api/github-stars', async (req, res) => {
  const now = Date.now();
  const cacheDuration = 60 * 1000; // 1 minute (GitHub unauthenticated rate limit: 60/hour)
  if (githubStarsCache.count !== null && (now - githubStarsCache.lastFetched) < cacheDuration) {
    console.log(`⭐ [GitHub Stars] Cache HIT: ${githubStarsCache.count} stars (fetched at ${new Date(githubStarsCache.lastFetched).toISOString()})`);
    return res.json({
      success: true,
      stars: githubStarsCache.count,
      cached: true,
      timestamp: new Date(githubStarsCache.lastFetched).toISOString()
    });
  }
  console.log('⭐ [GitHub Stars] Cache MISS: Fetching from GitHub API...');
  try {
    const response = await fetch('https://api.github.com/repos/senrecep/salary-sim', {
      headers: {
        'User-Agent': 'SalarySimulator/1.0',
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    if (!response.ok) throw new Error('GitHub API error: ' + response.status);
    const data = await response.json();
    const stars = data.stargazers_count;
    if (typeof stars === 'number' && stars >= 0) {
      githubStarsCache.count = stars;
      githubStarsCache.lastFetched = now;
      console.log(`⭐ [GitHub Stars] Cache UPDATED: ${stars} stars (fetched at ${new Date(now).toISOString()})`);
      return res.json({
        success: true,
        stars,
        cached: false,
        timestamp: new Date(now).toISOString()
      });
    } else {
      throw new Error('Invalid stars count');
    }
  } catch (error) {
    // Hata durumunda, cache'de eski bir değer varsa onu döndür
    if (githubStarsCache.count !== null) {
      console.warn(`⭐ [GitHub Stars] API ERROR, returning cached value: ${githubStarsCache.count} stars (fetched at ${new Date(githubStarsCache.lastFetched).toISOString()})`);
      return res.json({
        success: true,
        stars: githubStarsCache.count,
        cached: true,
        error: error.message,
        timestamp: new Date(githubStarsCache.lastFetched).toISOString()
      });
    } else {
      // Hiç cache yoksa 0 döndür
      return res.json({
        success: true,
        stars: 0,
        cached: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Serve main HTML for all other routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'static', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Salary Simulator Backend v1.0.0`);
  console.log(`📁 Serving static files from: ${path.join(__dirname, 'static')}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('📴 Received SIGINT, shutting down gracefully');
  process.exit(0);
});
