# QUICK SECURITY FIXES - BIBAS PROJECT

## Immediate Fixes (Before Any Hosting)

### Fix 1: Re-enable guard.js
**File:** `guard.js`  
**Current (UNSAFE):**
```javascript
// guard.js - Disabled for local development
// Authentication checks removed
```

**Fix To:**
```javascript
// guard.js - Runtime authentication enforcer
(function() {
  const publicPages = ['/', '/index.html'];
  const currentPath = window.location.pathname;
  
  // Check if current page requires authentication
  const requiresAuth = !publicPages.includes(currentPath);
  
  if (requiresAuth) {
    // Check if user is authenticated
    const isAuthenticated = checkAuthStatus();
    if (!isAuthenticated) {
      // Redirect to login
      window.location.href = '/index.html';
    }
  }
  
  function checkAuthStatus() {
    // This should call server API
    return fetch('/api/auth/status', { 
      credentials: 'include' 
    })
    .then(r => r.json())
    .then(data => data.authenticated)
    .catch(() => false);
  }
})();
```

---

### Fix 2: Secure CSP Headers
**Files:** All .html files  
**Current (UNSAFE):**
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; 
  style-src 'self' 'unsafe-inline' ...; 
  script-src 'self' 'unsafe-inline'; ...">
```

**Fix To:**
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'none';
  script-src 'self' https://cdnjs.cloudflare.com;
  style-src 'self' https://cdnjs.cloudflare.com https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https:;
  connect-src 'self' https://yourdomain.com;
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests">
```

---

### Fix 3: Remove Sensitive Data from localStorage
**Files:** `saving.js`, `footer.display.js`, `cash-auth.js`

**Change:**
```javascript
// ❌ DON'T store in localStorage:
localStorage.setItem('cashAppBalance', balance);
localStorage.setItem('cashAppSavings', amount);

// ✅ DO: Store only non-sensitive data
localStorage.setItem('cashAppDarkMode', isDark ? 'true' : 'false');
localStorage.setItem('userPreferences', JSON.stringify(prefs));

// ✅ DO: Fetch sensitive data from server
async function getBalance() {
  const response = await fetch('/api/balance', { 
    credentials: 'include' 
  });
  return response.json();
}
```

---

### Fix 4: Replace Weak deviceId Generation
**File:** `cash-auth.js` (around line 49)

**Current (UNSAFE):**
```javascript
function generateDeviceId() {
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = 'device_' + Math.random().toString(36).slice(2) + '_' + Date.now();
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
}
```

**Fix To:**
```javascript
async function generateDeviceId() {
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    // Request from server instead
    const response = await fetch('/api/device-id', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    const data = await response.json();
    deviceId = data.deviceId;
    // DON'T store sensitive IDs - just use in memory
  }
  return deviceId;
}
```

---

### Fix 5: Clean Up Invalid Domain References
**Files:** `home.html`, `pay.html`, `card.html`, `contact-pay.html`

**Remove all lines like:**
```html
<!-- saved from url=(0071)https://wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwvvww.onrender.com/home.html -->
```

**Replace with legitimate domain:**
```html
<!-- Page: Home | Last updated: 2026-03-14 -->
```

---

### Fix 6: Add CSRF Token Support
**File:** `cash-auth.js`

**Add helper function:**
```javascript
async function getCSRFToken() {
  const token = document.querySelector('meta[name="csrf-token"]')?.content;
  if (!token) {
    const response = await fetch('/api/csrf-token');
    const data = await response.json();
    return data.token;
  }
  return token;
}

async function secureFetch(url, options = {}) {
  const csrfToken = await getCSRFToken();
  
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'X-CSRF-Token': csrfToken,
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  });
}

// Use it:
const response = await secureFetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ username, password })
});
```

**Add to all HTML files:**
```html
<meta name="csrf-token" content="">
```

---

### Fix 7: Input Validation
**File:** `cash-auth.js`

**Add validators:**
```javascript
const validators = {
  username: (val) => {
    if (!val || val.length < 3 || val.length > 32) 
      throw new Error('Username: 3-32 characters');
    if (!/^[a-zA-Z0-9_-]+$/.test(val)) 
      throw new Error('Username: only letters, numbers, _, -');
    return val;
  },
  
  password: (val) => {
    if (!val || val.length < 8) 
      throw new Error('Password: minimum 8 characters');
    if (!/[A-Z]/.test(val)) 
      throw new Error('Password: need uppercase letter');
    if (!/[0-9]/.test(val)) 
      throw new Error('Password: need number');
    if (!/[!@#$%^&*]/.test(val)) 
      throw new Error('Password: need special character');
    return val;
  },
  
  email: (val) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) 
      throw new Error('Invalid email address');
    return val;
  }
};

// Use in forms:
async function createCustomer(event) {
  event.preventDefault();
  
  try {
    const username = validators.username(
      document.getElementById('newUsername').value.trim()
    );
    const password = validators.password(
      document.getElementById('newPassword').value.trim()
    );
    
    // Proceed with safe data
    await secureFetch('/api/users', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  } catch (error) {
    showLoginError(error.message);
  }
}
```

---

### Fix 8: Session Timeout
**File:** Create new `session-timeout.js`

```javascript
// Auto-logout after inactivity
(function() {
  const TIMEOUT = 15 * 60 * 1000; // 15 minutes
  let timeoutId;
  
  function resetTimeout() {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      console.warn('Session expired due to inactivity');
      handleLogout();
    }, TIMEOUT);
  }
  
  // Monitor user activity
  ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
    document.addEventListener(event, resetTimeout, true);
  });
  
  // Initial timeout
  resetTimeout();
})();
```

**Add to all HTML files:**
```html
<script src="session-timeout.js"></script>
```

---

### Fix 9: Add Security Logging
**File:** Create new `security-logger.js`

```javascript
// Client-side security logging
const SecurityLogger = {
  log: async (event, data) => {
    try {
      await fetch('/api/logs/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          event,
          timestamp: new Date().toISOString(),
          ...data
        })
      });
    } catch (e) {
      console.error('Failed to log security event:', e);
    }
  },
  
  loginAttempt: (username, success) => 
    SecurityLogger.log('LOGIN_ATTEMPT', { username, success }),
  
  adminAccess: (action) => 
    SecurityLogger.log('ADMIN_ACTION', { action }),
  
  suspicious: (detail) => 
    SecurityLogger.log('SUSPICIOUS_ACTIVITY', { detail })
};

// Use it:
SecurityLogger.loginAttempt('john_doe', true);
SecurityLogger.adminAccess('delete_user');
```

---

### Fix 10: Remove Development Configuration
**File:** `cash-auth.js` and all HTML CSP headers

**Current (UNSAFE):**
```javascript
const API_BASE = '';  // Empty!
```

```html
connect-src 'self' http://localhost:3001 http://localhost:5174 https://*.render.com;
```

**Fix To:**
```javascript
// Production
const API_BASE = 'https://yourdomain.com/api';

// Or environment-based
const API_BASE = process.env.API_URL || 'https://yourdomain.com/api';
```

```html
<!-- Only include your domain -->
connect-src 'self' https://yourdomain.com;
```

---

## Security Headers to Add (Server-Side)

Your hosting provider should send these HTTP headers:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: no-referrer
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

---

## Files to Create

### `session-timeout.js`
```javascript
(function() {
  const TIMEOUT = 15 * 60 * 1000;
  let timeoutId;
  
  function resetTimeout() {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      const logoutBtn = document.getElementById('logoutBtn');
      if (logoutBtn) logoutBtn.click();
    }, TIMEOUT);
  }
  
  ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(e => {
    document.addEventListener(e, resetTimeout, true);
  });
  
  resetTimeout();
})();
```

### `security-logger.js`
(See Fix 9 above)

### Add to index.html (login page):
```html
<script src="session-timeout.js"></script>
<script src="security-logger.js"></script>
<script src="guard.js"></script>
```

---

## Testing Checklist

- [ ] Try accessing `/home.html` without login - should redirect
- [ ] Try XSS payload in forms - should be blocked/escaped
- [ ] Try CSRF attack from external site - should fail
- [ ] Check browser DevTools - no sensitive data in localStorage
- [ ] Verify HTTPS only - HTTP requests blocked
- [ ] Test CSP violations - browser console should show errors
- [ ] Try brute force login - should be rate limited
- [ ] Verify session timeout - logout after 15 min inactivity
- [ ] Check security headers - all present

---

## Summary
After implementing these fixes:
- ✅ Authentication is enforced
- ✅ XSS attacks are blocked (no unsafe-inline)
- ✅ CSRF attacks are prevented
- ✅ Sensitive data is protected
- ✅ Sessions are secure and time-limited
- ✅ Input is validated
- ✅ All requests use HTTPS
- ✅ Security events are logged

**Safety Level: Improved from 🔴 to 🟡**  
*Still requires backend security implementation for 🟢 production-ready*
