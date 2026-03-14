# Cash App Clone - Full Setup Guide

**Advanced Payment Application with iOS Face ID & Real TikTok Integration**

---

## 📋 Project Overview

This is a fully-featured **Cash App clone** built with:
- ✅ Modern responsive UI (works on mobile/desktop)
- ✅ iOS Face ID payment authentication  
- ✅ Real TikTok profile integration (@username searches)
- ✅ Contact management system
- ✅ Payment history & savings tracking
- ✅ Dark mode support
- ✅ Real-time balance updates

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v14+ (download from https://nodejs.org)
- **npm** or **yarn** package manager
- **Git** (optional, for version control)

### Installation & Running

#### 1️⃣ Install Dependencies
```bash
cd C:\Users\amini\Desktop\bibas
npm install
```

This installs:
- Express (web server)
- Axios (HTTP requests)
- Cheerio (HTML parsing)
- CORS (cross-origin requests)

#### 2️⃣ Start Backend Server
```bash
npm start
```

Server output:
```
╔════════════════════════════════════════╗
║     TikTok Profile Scraper Server      ║
║           🎵 Cash App Backend           ║
╚════════════════════════════════════════╝

Server running on: http://localhost:3001
```

#### 3️⃣ Open in Browser
```
http://localhost:3001
```

You'll see the Cash App home page with full functionality!

---

## 📱 Features Explained

### 1. Contact Management
- **Search contacts** by name or Cashtag
- **Edit contact** name, avatar, and color
- **Add photos** from device
- **TikTok integration** - type @username to fetch real TikTok profiles

### 2. Payment System
- **Select recipient** from contacts or search
- **Choose payment method** (Cash balance or Debit card)
- **iOS Face ID authentication** (automatically enabled on iOS devices)
- **Real-time balance** updates
- **Payment history** tracking

### 3. iOS Face ID
When making a payment:
1. Click "Pay" button
2. Face ID scanning modal appears (2.5 seconds)
3. Loading spinner shows payment processing (3 seconds)
4. Success screen confirms payment
5. Balance automatically deducts

### 4. TikTok Integration
When searching for recipient:
1. Type `@usamin77` in "To" field
2. Backend fetches real TikTok profile from https://www.tiktok.com/@usamin77
3. Profile image is extracted and displayed
4. Follower count and bio are shown
5. User can send payment to TikTok creator

### 5. Dark Mode
- Toggle dark/light theme
- Settings persist in localStorage
- Smooth transitions between modes

### 6. Savings Tracking
- Set savings goals
- Track progress with visual indicators
- Separate savings from cash balance

---

## 📁 Project Structure

```
bibas/
├── index.html              # Login/home page
├── pay.html                # Payment selector
├── contact-pay.html        # *NEW* Contact payment with Face ID
├── home.html               # Dashboard
├── card.html               # Card management
├── profile.html            # User profile
├── savings.html            # Savings tracker
├── activity.html           # Transaction history
│
├── cash-auth.js            # Authentication logic
├── dark-mode.js            # Theme switching
├── footer.display.js       # Balance footer
├── saving.js               # Savings calculations
├── loading-spinner.js      # Loading animations
│
├── saving.css              # Savings styles
├── loading-spinner.css     # Spinner animations
│
├── icons/                  # Logo and icon assets
│   ├── Cash_App-Logo.wine.png
│   ├── mastercard-2-logo.png
│   ├── green_spinner_thick.png
│   └── ... (other icons)
│
├── site.webmanifest        # PWA manifest
└── index.html              # SPA entry

Root Files:
├── server.js               # *NEW* Node.js backend
├── package.json            # *NEW* NPM dependencies
├── .env.example            # *NEW* Environment config
│
├── SECURITY_AUDIT_REPORT.md    # 18 security issues found
├── QUICK_SECURITY_FIXES.md     # Step-by-step fixes
├── SECURITY_SUMMARY.md         # Executive summary
├── FACEID_FEATURE.md           # Face ID documentation
└── TIKTOK_INTEGRATION.md       # TikTok setup guide
```

---

## 🔐 Security Notes

⚠️ **Important:** This app has critical security vulnerabilities documented in:
- `SECURITY_AUDIT_REPORT.md` - Detailed 18 findings
- `QUICK_SECURITY_FIXES.md` - Step-by-step remediation

**DO NOT deploy to production** without implementing the security fixes.

Key issues to address:
1. ❌ Authentication guard is disabled
2. ❌ CSP allows unsafe inline scripts  
3. ❌ Financial data stored in plaintext localStorage
4. ❌ No CSRF protection
5. ❌ No input validation

See security files for fixes!

---

## 🎨 Customization

### Change Server Port
```bash
PORT=8000 npm start
```

### Add Custom Domain
Edit `server.js`:
```javascript
const ALLOWED_ORIGINS = ['https://yourdomain.com'];
app.use(cors({ origin: ALLOWED_ORIGINS }));
```

### Modify Face ID Timing
In `contact-pay.html`:
```javascript
// Change 2500 to desired milliseconds (default 2500ms = 2.5 seconds)
setTimeout(() => {
  hideFaceIdModal();
}, 2500);
```

### Add More Payment Methods
Edit payment options in `contact-pay.html`:
```javascript
const paymentMethods = [
  { id: 'cash', label: 'Cash Balance', icon: '💵' },
  { id: 'card', label: 'Debit Card', icon: '💳' },
  // Add more here
];
```

---

## 🧪 Testing

### Test TikTok API
```bash
# Fetch a real TikTok profile
curl http://localhost:3001/api/tiktok/profile/usamin77

# With @ prefix
curl http://localhost:3001/api/tiktok/profile/@usamin77
```

### Test Face ID (Browser Console)
```javascript
// Enable Face ID
localStorage.setItem('cashAppFaceIdEnabled', 'true');
localStorage.setItem('cashAppFaceIdType', 'iphone17');
location.reload();

// Disable Face ID
localStorage.setItem('cashAppFaceIdEnabled', 'false');
location.reload();
```

### Test Payment Flow
1. Go to `/pay.html`
2. Click on a contact
3. Enter amount and note
4. Click "Pay"
5. Face ID modal should appear (if enabled)
6. Loader spins for 3 seconds
7. Success screen displays

---

## 🔧 Development

### Enable Development Mode
```bash
npm run dev
```

This uses **nodemon** for auto-restart on file changes.

### View Server Logs
```bash
# All requests logged to console
npm start
```

### Browser DevTools
1. Open browser DevTools (F12)
2. Go to "Network" tab
3. Filter by "tiktok" to see TikTok API calls
4. Check "Console" for debug messages

---

## 📦 Deployment

### Heroku Deployment
```bash
# Install Heroku CLI
# Login
heroku login

# Create app
heroku create your-app-name

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### Self-Hosted (Linux/Mac)

```bash
# Install PM2 (process manager)
npm install -g pm2

# Start app
pm2 start server.js

# Restart on reboot
pm2 startup
pm2 save
```

### Docker Deployment

```bash
# Build image
docker build -t cashapp .

# Run container
docker run -p 3001:3001 cashapp
```

---

## 🐛 Troubleshooting

### Server won't start
```bash
# Check if port 3001 is in use
lsof -i :3001  # macOS/Linux
netstat -ano | findstr :3001  # Windows

# Use different port
PORT=8000 npm start
```

### TikTok profiles not loading
```javascript
// Check in browser console
fetch('/api/tiktok/profile/usamin77')
  .then(r => r.json())
  .then(console.log)
```

### CORS errors
Make sure server is running and CORS is enabled in `server.js`:
```javascript
app.use(cors());
```

### Face ID not appearing
1. Check if device is iOS (Face ID only works on iOS)
2. Verify `cashAppFaceIdEnabled` is `'true'` in localStorage
3. Check browser console for errors

### Payment balance not updating
Check localStorage:
```javascript
localStorage.getItem('cashAppBalance')
localStorage.getItem('cashAppSavings')
```

---

## 📚 Documentation

- **Face ID Feature**: See `FACEID_FEATURE.md`
- **TikTok Integration**: See `TIKTOK_INTEGRATION.md`  
- **Security Issues**: See `SECURITY_AUDIT_REPORT.md`
- **API Reference**: See `TIKTOK_INTEGRATION.md` - API Endpoint section

---

## 📞 Support

For issues or questions:
1. Check the documentation files
2. Review browser console for errors
3. Check server logs: `npm start` output
4. Verify all dependencies installed: `npm install`

---

## 📄 License

MIT License - Feel free to modify and use!

---

## 🎯 Next Steps

### For Development
1. ✅ Install dependencies (`npm install`)
2. ✅ Start server (`npm start`)  
3. ✅ Test in browser (`http://localhost:3001`)
4. ✅ Implement remaining security fixes

### For Production
1. ⚠️ Implement all security fixes from `SECURITY_AUDIT_REPORT.md`
2. 🔒 Add proper authentication system
3. 🔐 Use HTTPS/TLS only
4. 📊 Set up monitoring and logging
5. 🧪 Conduct penetration testing
6. 📋 Review TikTok API terms of service

---

## 🎉 Features Summary

| Feature | Status | Notes |
|---------|--------|-------|
| Contact Management | ✅ Complete | Edit, search, add photos |
| Payment System | ✅ Complete | Cash + Card methods |
| iOS Face ID | ✅ Complete | Auto-enabled on iOS |
| TikTok Integration | ✅ Complete | Real profile fetching |
| Balance Tracking | ✅ Complete | Real-time updates |
| Savings Tracker | ✅ Complete | Goal tracking |
| Dark Mode | ✅ Complete | Theme toggle |
| Payment History | ✅ Complete | Transaction logging |
| Security Updates | ⚠️ Pending | See SECURITY_AUDIT_REPORT.md |

---

**Last Updated:** March 14, 2026  
**Version:** 1.0.0  
**Maintainer:** Amin Nepali  
**GitHub:** https://github.com/amin-nepali/cashapp
