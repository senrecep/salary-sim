const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'static')));

// Exchange rate API endpoint
app.get('/api/exchange-rate', async (req, res) => {
  try {
    console.log('Fetching exchange rate...');
    
    // Try multiple free APIs for reliability (HTTPS priority, no auth required)
    const apis = [
      // Primary HTTPS APIs
      'https://api.exchangerate-api.com/v4/latest/USD',
      'https://open.er-api.com/v6/latest/USD', 
      'https://api.fxratesapi.com/latest?base=USD&symbols=TRY',
      'https://api.exchangerate.host/latest?base=USD&symbols=TRY',
      'https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/usd/try.json',
      
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

    res.json({
      success: true,
      usd_try: roundedRate,
      timestamp: new Date().toISOString(),
      source: 'live'
    });

    console.log(`💱 Exchange rate: 1 USD = ${roundedRate} TRY`);

  } catch (error) {
    console.error('❌ Exchange rate API error:', error.message);
    
    // Fallback to default rate
    const fallbackRate = 34.20;
    
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
