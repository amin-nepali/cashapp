/**
 * TikTok Profile Scraper Backend
 * Fetches real TikTok profile data and extracts profile images
 */

const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from bibas folder
app.use(express.static(path.join(__dirname, 'bibas')));

// TikTok User Agent (required to get proper HTML response)
const TIKTOK_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

/**
 * Fetch TikTok profile data
 * GET /api/tiktok/profile/:username
 */
app.get('/api/tiktok/profile/:username', async (req, res) => {
  const username = req.params.username.replace(/^@/, '').toLowerCase();

  if (!username || username.length < 3) {
    return res.status(400).json({
      success: false,
      error: 'Invalid username'
    });
  }

  try {
    // Construct TikTok profile URL
    const tiktokUrl = `https://www.tiktok.com/@${username}`;
    
    console.log(`[TikTok API] Fetching profile: @${username}`);

    // Fetch the TikTok profile page with headers
    const response = await axios.get(tiktokUrl, {
      headers: {
        'User-Agent': TIKTOK_USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cookie': 'tiktok_utm_source=copy; tt_webid=7123456789; tt_webid_v2=7123456789',
        'Referer': 'https://www.tiktok.com/',
        'DNT': '1'
      },
      timeout: 10000
    });

    // Parse HTML with Cheerio
    const $ = cheerio.load(response.data);

    // Extract profile image from avatar img element
    // Usually found in: <img class="css-g3le1f-5e6d46e3--ImgAvatar" src="...">
    let avatarUrl = '';
    let profileName = '';
    let followerCount = 0;
    let followingCount = 0;
    let videoCount = 0;
    let bioText = '';

    // Try multiple selectors for avatar image
    const avatarSelectors = [
      'img.css-g3le1f-5e6d46e3--ImgAvatar',
      'img[alt="avatar"]',
      'img[alt*="avatar"]',
      'div[data-testid="user-avatar"] img',
      '.tiktok-avatar img',
      'img[src*="tiktokcdn.com"]'
    ];

    for (const selector of avatarSelectors) {
      const img = $(selector).first();
      if (img.length > 0) {
        avatarUrl = img.attr('src');
        if (avatarUrl) break;
      }
    }

    // Extract profile name / nickname
    const nameSelectors = [
      'h1.tiktok-x6y88p-H1',
      'h1[data-testid="user-title"]',
      'h1',
      'span[data-testid="user-name"]'
    ];

    for (const selector of nameSelectors) {
      const element = $(selector).first();
      if (element.length > 0) {
        profileName = element.text().trim();
        if (profileName) break;
      }
    }

    // Extract follower count
    const followersMatch = response.data.match(/"followerCount":(\d+)/);
    if (followersMatch) {
      followerCount = parseInt(followersMatch[1]);
    }

    // Extract following count
    const followingMatch = response.data.match(/"followingCount":(\d+)/);
    if (followingMatch) {
      followingCount = parseInt(followingMatch[1]);
    }

    // Extract video count
    const videoMatch = response.data.match(/"videoCount":(\d+)/);
    if (videoMatch) {
      videoCount = parseInt(videoMatch[1]);
    }

    // Extract bio/description
    const bioSelectors = [
      'h2.tiktok-x6y88p-H2',
      'span[data-testid="user-bio"]',
      'div[data-testid="user-bio"]',
      'h2'
    ];

    for (const selector of bioSelectors) {
      const element = $(selector).first();
      if (element.length > 0) {
        bioText = element.text().trim();
        if (bioText && bioText !== profileName) break;
      }
    }

    // Validate avatar URL
    if (!avatarUrl) {
      console.warn(`[TikTok API] No avatar found for @${username}`);
      return res.status(404).json({
        success: false,
        error: 'Profile not found or no avatar available'
      });
    }

    console.log(`[TikTok API] ✅ Successfully fetched @${username}`);

    // Return profile data
    res.json({
      success: true,
      data: {
        username: username,
        nickname: profileName || username,
        avatar: avatarUrl,
        avatarUrl: avatarUrl, // alternative naming
        followers: followerCount,
        following: followingCount,
        videos: videoCount,
        bio: bioText,
        profileUrl: tiktokUrl,
        platform: 'tiktok'
      }
    });

  } catch (error) {
    console.error(`[TikTok API] Error fetching @${username}:`, error.message);

    // Distinguish between different error types
    let errorMessage = 'Failed to fetch TikTok profile';
    
    if (error.response?.status === 404) {
      errorMessage = 'TikTok user not found';
    } else if (error.response?.status === 403) {
      errorMessage = 'Access denied by TikTok (rate limited or blocked)';
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Network connection error';
    }

    res.status(error.response?.status || 500).json({
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'TikTok Profile Scraper'
  });
});

/**
 * Serve index.html for all routes
 */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'bibas', 'index.html'));
});

app.get('/pay', (req, res) => {
  res.sendFile(path.join(__dirname, 'bibas', 'pay.html'));
});

app.get('/contact-pay', (req, res) => {
  res.sendFile(path.join(__dirname, 'bibas', 'contact-pay.html'));
});

app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'bibas', 'home.html'));
});

app.get('/card', (req, res) => {
  res.sendFile(path.join(__dirname, 'bibas', 'card.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'bibas', 'profile.html'));
});

app.get('/savings', (req, res) => {
  res.sendFile(path.join(__dirname, 'bibas', 'savings.html'));
});

app.get('/activity', (req, res) => {
  res.sendFile(path.join(__dirname, 'bibas', 'activty.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║     TikTok Profile Scraper Server      ║
║           🎵 Cash App Backend           ║
╚════════════════════════════════════════╝

Server running on: http://localhost:${PORT}
Health check: http://localhost:${PORT}/api/health
TikTok API: http://localhost:${PORT}/api/tiktok/profile/:username

Ready to fetch TikTok profiles! 🚀
  `);
});

module.exports = app;
