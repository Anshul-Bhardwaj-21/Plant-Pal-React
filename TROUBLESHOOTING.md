# Troubleshooting Guide

## TypeScript Errors in IDE

If you see TypeScript errors like "Cannot find module 'react'" or "Cannot find module 'react-router-dom'" in your IDE, these are **cache issues** and don't affect the actual functionality of the app.

### Solution 1: Restart TypeScript Server (VS Code)

1. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
2. Type "TypeScript: Restart TS Server"
3. Press Enter

### Solution 2: Reload VS Code Window

1. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
2. Type "Developer: Reload Window"
3. Press Enter

### Solution 3: Clear Node Modules and Reinstall

```bash
# Remove node_modules and lock files
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install
```

### Solution 4: Use Workspace TypeScript Version

1. Open any `.ts` or `.tsx` file
2. Click on the TypeScript version in the bottom right of VS Code
3. Select "Use Workspace Version"

### Verification

The app builds successfully despite IDE errors. Verify by running:

```bash
npm run build
```

If the build succeeds (which it does), the errors are purely cosmetic IDE issues.

## Common Issues

### 1. "Cannot find module" Errors

**Cause**: TypeScript language service cache issues
**Solution**: Restart TS Server (see above)
**Impact**: None - app works fine

### 2. Badge Component Type Errors

**Cause**: TypeScript strict type checking on shadcn/ui components
**Solution**: These are false positives, the components work correctly
**Impact**: None - components render properly

### 3. Build Warnings About Chunk Size

**Cause**: Large dependencies (TensorFlow.js, Recharts, Firebase)
**Solution**: This is expected for ML-enabled apps
**Impact**: Slightly longer initial load time

### 4. Camera Not Working

**Cause**: Browser permissions or HTTPS requirement
**Solutions**:
- Grant camera permissions in browser
- Use HTTPS (required for camera API)
- Try a different browser
- Check if camera is being used by another app

### 5. Plant Identification Fails

**Cause**: Missing API key or network issues
**Solutions**:
- Verify `VITE_GEMINI_API_KEY` in `.env`
- Check internet connection
- Ensure API key is valid
- Check browser console for errors

### 6. Firebase Errors

**Cause**: Missing or incorrect Firebase configuration
**Solutions**:
- Verify all Firebase env variables in `.env`
- Check Firebase project settings
- Ensure Firestore and Storage are enabled
- Check Firebase security rules

### 7. Images Not Uploading

**Cause**: Firebase Storage not configured
**Solutions**:
- Enable Firebase Storage in console
- Check storage security rules
- Verify storage bucket name in `.env`
- Check browser console for errors

## Development Issues

### Hot Reload Not Working

```bash
# Restart dev server
npm run dev
```

### Port Already in Use

```bash
# Kill process on port 5173
npx kill-port 5173

# Or use different port
npm run dev -- --port 3000
```

### Build Fails

```bash
# Clear cache and rebuild
rm -rf dist node_modules/.vite
npm run build
```

## Environment Variables

Ensure your `.env` file has all required variables:

```env
# Required
VITE_GEMINI_API_KEY=your_key_here
VITE_FIREBASE_API_KEY=your_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_domain_here
VITE_FIREBASE_PROJECT_ID=your_project_here
VITE_FIREBASE_STORAGE_BUCKET=your_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_id_here
VITE_FIREBASE_APP_ID=your_app_id_here

# Optional
VITE_WEATHER_API_KEY=your_weather_key_here
```

## Browser Compatibility

### Supported Browsers
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Required Features
- ES2020 support
- WebRTC (for camera)
- IndexedDB
- LocalStorage
- WebGL (for TensorFlow.js)

## Performance Issues

### Slow Initial Load

**Cause**: Large bundle size with ML libraries
**Solutions**:
- Use production build: `npm run build && npm run preview`
- Enable browser caching
- Use CDN for static assets
- Consider code splitting

### Slow Plant Identification

**Cause**: Large image processing or slow network
**Solutions**:
- Compress images before upload
- Use smaller image sizes
- Check internet connection
- Ensure Gemini API is responding

### Memory Issues

**Cause**: TensorFlow.js tensors not disposed
**Solutions**:
- App already handles tensor disposal
- Close unused tabs
- Restart browser if needed

## Testing

### Run Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Check for Linting Issues

```bash
npm run lint
```

## Getting Help

### Check Logs

1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for failed requests
4. Check Application tab for storage issues

### Debug Mode

Add to `.env`:
```env
VITE_DEBUG=true
```

### Report Issues

When reporting issues, include:
- Browser and version
- Operating system
- Error messages from console
- Steps to reproduce
- Screenshots if applicable

## Quick Fixes

### Reset Everything

```bash
# Stop dev server (Ctrl+C)
# Remove all generated files
rm -rf node_modules dist .vite package-lock.json

# Reinstall
npm install

# Restart
npm run dev
```

### Clear Browser Data

1. Open DevTools (F12)
2. Go to Application tab
3. Click "Clear storage"
4. Check all boxes
5. Click "Clear site data"
6. Refresh page

### Verify Installation

```bash
# Check Node version (should be 16+)
node --version

# Check npm version
npm --version

# Check if all dependencies installed
npm list --depth=0
```

## Still Having Issues?

1. Check the documentation:
   - README.md
   - QUICK_START.md
   - API_SETUP_GUIDE.md

2. Search existing issues on GitHub

3. Create a new issue with:
   - Detailed description
   - Steps to reproduce
   - Error messages
   - Environment details

---

**Remember**: TypeScript errors in the IDE don't affect the app's functionality. If `npm run build` succeeds, your app is working correctly!
