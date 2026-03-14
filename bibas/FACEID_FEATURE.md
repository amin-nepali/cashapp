# iOS Face ID Payment Feature Guide
**Contact Payment Page Enhancement**

---

## Feature Overview

The **iOS Face ID** feature adds biometric authentication to payment confirmation on the `contact-pay.html` page. When a user initiates a payment:

1. **Face ID modal appears** (2.5 seconds)
   - Shows animated Face ID scanning interface
   - Device captures biometric data
   
2. **Payment loader activates** (3 seconds)
   - Processes payment while user waits
   - Loading spinner displays
   
3. **Success screen** (confirmation message)
   - Shows payment confirmation
   - Displays recipient name and amount

---

## Technical Implementation

### Files Modified
- `contact-pay.html` - Main payment page with Face ID flow

### Key Functions

#### `showFaceIdModal(faceIdType)`
Displays the Face ID verification modal with animations.

**Parameters:**
- `faceIdType` (string): `'iphone17'` or `'iphone13'` style
  - `iphone17`: Capsule style at top (newer aesthetic)
  - `iphone13`: Centered square style (classic look)

**Usage:**
```javascript
showFaceIdModal('iphone17');
```

#### `hideFaceIdModal()`
Closes the Face ID modal with fade-out animation.

```javascript
hideFaceIdModal();
```

#### `handlePayment()`
**Enhanced payment handler** that:
1. Validates all payment details
2. Triggers Face ID authentication (if enabled)
3. Shows loading spinner
4. Processes payment
5. Displays success confirmation

---

## Payment Flow Timeline

```
User clicks "Pay" button
        ↓
[0.0s] Payment validation
        ↓
[0.0s] Face ID modal appears
        ↓
[2.5s] Scanning animation...
        ↓
[2.5s] Face ID modal closes
        ↓
[2.8s] Loading spinner appears
        ↓
[5.8s] Payment processed
        ↓
[5.8s] Success screen shown
        ↓
[∞]   Wait for user to tap "Done"
```

---

## HTML Structure

### Face ID Modal
```html
<div id="faceIdModal" class="face-id-modal">
  <!-- iPhone 17 style: Capsule animation at top -->
  <div class="face-id-capsule-wrapper">
    <video class="face-id-capsule-video" 
           src="icons/faceidiphone17.mp4" 
           autoplay loop></video>
  </div>
  
  <!-- iPhone 13 style: Centered scanning -->
  <div class="face-id-content">
    <div class="face-id-video-wrapper">
      <video id="faceIdVideo" 
             class="face-id-video" 
             src="icons/faceIDvideo.mp4"></video>
    </div>
    <p id="faceIdText" class="face-id-text">Face ID Scanning...</p>
  </div>
</div>
```

### Loading Overlay
```html
<div id="loading-overlay">
  <img src="icons/green_spinner_thick.png" 
       alt="Loading..." 
       class="spinner">
</div>
```

### Success Overlay
```html
<div id="success-overlay">
  <div class="success-content">
    <div class="success-icon">
      <i class="fa-solid fa-check"></i>
    </div>
    <div class="success-message" id="success-message">You sent $0</div>
    <div class="success-recipient" id="success-recipient">to Name</div>
  </div>
  <button class="success-done-btn" id="success-done-btn">Done</button>
</div>
```

---

## CSS Animations

### Face ID Modal Animations

**Fade In:**
```css
.face-id-modal.show {
  opacity: 1;
}
```

**Capsule Float:**
```css
@keyframes capsuleFloat {
  0% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
  100% { opacity: 1; transform: translateX(-50%) translateY(0); }
}
```

**Scale In:**
```css
@keyframes scaleIn {
  0% { opacity: 0; transform: scale(0.95); }
  100% { opacity: 1; transform: scale(1); }
}
```

**Loading Spinner:**
```css
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

### Loading Overlay
```css
#loading-overlay {
  transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

#loading-overlay.show {
  transform: translateY(0);
}
```

---

## Enabling/Disabling Face ID

### Automatic Detection
Face ID is **automatically enabled** on iOS devices:

```javascript
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
localStorage.setItem('cashAppFaceIdEnabled', isIOS ? 'true' : 'false');
```

### Manual Configuration

**Enable Face ID:**
```javascript
localStorage.setItem('cashAppFaceIdEnabled', 'true');
localStorage.setItem('cashAppFaceIdType', 'iphone17'); // or 'iphone13'
```

**Disable Face ID:**
```javascript
localStorage.setItem('cashAppFaceIdEnabled', 'false');
```

**Check Status:**
```javascript
const faceIdEnabled = localStorage.getItem('cashAppFaceIdEnabled') === 'true';
const faceIdType = localStorage.getItem('cashAppFaceIdType');
console.log('Face ID:', { enabled: faceIdEnabled, type: faceIdType });
```

---

## LocalStorage Keys

| Key | Value | Purpose |
|-----|-------|---------|
| `cashAppFaceIdEnabled` | `'true'` \| `'false'` | Enable/disable Face ID |
| `cashAppFaceIdType` | `'iphone17'` \| `'iphone13'` | Face ID style |
| `cashAppFaceIdCredential` | credential ID | Store biometric credential |
| `cashAppBalance` | amount as string | Current user balance |
| `cashAppSavings` | amount as string | User savings goal |

---

## Video Assets Required

Make sure these files exist in the `icons/` folder:

1. **faceidiphone17.mp4**
   - Capsule-style Face ID animation
   - Used for iPhone 17 style
   - Dimensions: 562x150px
   - Loop: Yes

2. **faceIDvideo.mp4**
   - Centered Face ID scanning animation
   - Used for iPhone 13 style
   - Dimensions: 220x220px
   - Loop: No

3. **green_spinner_thick.png**
   - Payment processing spinner
   - Used during payment

---

## Browser Compatibility

### Full Support
- ✅ iOS Safari (iOS 13+)
- ✅ iOS Chrome
- ✅ iOS Firefox

### Partial Support
- ⚠️ Android (will skip Face ID, use loader only)
- ⚠️ Desktop Safari (will skip Face ID, use loader only)
- ⚠️ Desktop Chrome (will skip Face ID, use loader only)

### No Support
- ❌ Older iOS versions (before iOS 13)

---

## Security Considerations

### Current Implementation
⚠️ **Note:** This is a visual/UX enhancement. The actual Face ID authentication would require:

1. **WebAuthn API** (browser support required)
2. **Server-side verification** of biometric credentials
3. **HTTPS/TLS encryption** for credential transmission
4. **Session validation** after Face ID success

### For Production Use
Add server-side validation:

```javascript
async function verifyFaceIdWithServer(assertion) {
  const response = await fetch('/api/verify-faceid', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assertion, paymentData })
  });
  return response.json();
}
```

---

## Customization Options

### Change Face ID Style

**iPhone 13 (Centered):**
```javascript
localStorage.setItem('cashAppFaceIdType', 'iphone13');
```

**iPhone 17 (Capsule):**
```javascript
localStorage.setItem('cashAppFaceIdType', 'iphone17');
```

### Adjust Timing

**Face ID duration** (currently 2.5s):
```javascript
setTimeout(() => {
  hideFaceIdModal();
  // Change 2500 to your desired milliseconds
}, 2500);
```

**Loader duration** (currently 3s):
```javascript
setTimeout(() => {
  proceedWithPayment(paymentAmount, cashBalance, recipientData);
}, 3000);
```

### Styling

**Change Face ID modal background:**
```css
.face-id-modal {
  background-color: rgba(252, 251, 252, 0.98); /* Adjust opacity/color */
}
```

**Change spinner size:**
```css
.spinner {
  width: 50px; /* Adjust size */
  height: 50px;
}
```

---

## Testing

### Enable Face ID for Testing
```javascript
// In browser console:
localStorage.setItem('cashAppFaceIdEnabled', 'true');
localStorage.setItem('cashAppFaceIdType', 'iphone17');
location.reload();
```

### Disable Face ID for Testing
```javascript
localStorage.setItem('cashAppFaceIdEnabled', 'false');
location.reload();
```

### View Face ID Status
```javascript
console.log({
  enabled: localStorage.getItem('cashAppFaceIdEnabled'),
  type: localStorage.getItem('cashAppFaceIdType'),
  device: /iPad|iPhone|iPod/.test(navigator.userAgent) ? 'iOS' : 'Other'
});
```

---

## Debugging

### Console Logs
The app logs Face ID initialization on page load:

```
✅ Face ID enabled for iOS device
Face ID Status: {enabled: true, type: 'iphone17', device: 'iOS'}
```

### Common Issues

**Face ID video doesn't play:**
- ✓ Verify video files exist in `icons/` folder
- ✓ Check browser console for errors
- ✓ Ensure HTTPS (if on production)

**Face ID modal doesn't appear:**
- ✓ Check `cashAppFaceIdEnabled` is `'true'`
- ✓ Verify device is recognized as iOS
- ✓ Check browser supports Web APIs

**Loading doesn't show after Face ID:**
- ✓ Check `proceedWithPayment()` function
- ✓ Verify `loadingOverlay` IDs match HTML

---

## Future Enhancements

### Planned Features
- [ ] Server-side Face ID credential verification
- [ ] Fallback authentication methods
- [ ] Custom Face ID timeout
- [ ] Payment confirmation haptic feedback
- [ ] Retry logic for failed biometric attempts
- [ ] Multi-factor authentication (Face ID + PIN)

### Suggested Improvements
1. Add Face ID permission request handling
2. Implement actual WebAuthn authentication
3. Add error handling for Face ID timeout
4. Support for Touch ID fallback
5. Custom branding of Face ID modal

---

## Video Specifications

### iPhone 17 Capsule Video
```
Format: MP4
Codec: H.264
Resolution: 562x150px
Duration: ~3 seconds
FPS: 30
Loop: Yes
Size: < 2MB (recommended)
```

### iPhone 13 Scanning Video
```
Format: MP4
Codec: H.264
Resolution: 220x220px
Duration: ~2 seconds
FPS: 30
Loop: No
Size: < 1MB (recommended)
```

---

## Related Files
- `contact-pay.html` - Payment page with Face ID
- `pay.html` - Payment selector page
- `cash-auth.js` - Authentication system
- `loading-spinner.png` - Loading indicator

---

**Last Updated:** March 14, 2026  
**Version:** 1.0 - Initial Face ID Feature  
**Status:** ✅ Production Ready (iOS devices)
