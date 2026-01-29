# 🚀 QUICK START & TESTING GUIDE

## Start the Application

### Terminal 1 - Backend Server
```bash
cd server
npm run server
```

**Expected Output**:
```
Server is running on port 5000
🔑 Gemini API Key Status: Loaded ✅
Connected to MongoDB
```

### Terminal 2 - Frontend Client
```bash
cd client
npm run dev
```

**Expected Output**:
```
VITE ready in XXXms
Local: http://localhost:5173
```

---

## Test All 5 AI Features

### 1. ✅ Voice-to-Text Messaging (NEW FEATURE)

**Steps**:
1. Open chat with any user
2. Look for **microphone button (🎤)** next to send button
3. Click microphone button
4. **Allow microphone access** when browser asks
5. See recording indicator with timer: "⏺ 00:05"
6. Speak: "Hello, this is a test message"
7. Click **"Stop"** button
8. See "Transcribing..." loader
9. **Verify**: Text appears in message input field
10. **Edit if needed**
11. Click **Send** button

**Expected**:
- ✅ Transcribed text in input: "Hello this is a test message"
- ✅ Text is editable
- ✅ Message only sends when you click Send

**Common Issues**:
- ❌ "Microphone permission denied" → Go to browser settings, allow microphone
- ❌ "Transcription failed" → Check server console for API errors
- ❌ Empty transcription → Try speaking louder or in quieter environment

---

### 2. ✅ Chat Summarization

**Steps**:
1. Send at least 10 messages back and forth
2. Hover over any message
3. Click **✨ Summarize** button
4. Wait 3-5 seconds

**Expected**:
- ✅ Modal appears with:
  - Bullet points
  - Key decisions
  - Action items
  - Message count
- ✅ Click summarize again → faster (cached)

---

### 3. ✅ Smart Reply Suggestions

**Steps**:
1. Receive a message from another user
2. Click **"💡 Smart Replies"** button above input
3. Wait 2-3 seconds

**Expected**:
- ✅ 3 suggestion pills appear
- ✅ Click any suggestion → input field populated
- ✅ Edit or send as-is

---

### 4. ✅ Auto Translation

**Steps**:
1. Send or receive a text message
2. Hover over the message
3. Click **🌐 Translate** button
4. Select a language (e.g., "Tamil 🇮🇳")

**Expected**:
- ✅ Translation appears below original message
- ✅ Shows language code
- ✅ Click translate again to same language → instant (cached)
- ✅ Can close translation with X button

---

### 5. ✅ Toxic Content Detection

**Steps**:
1. Try to send: "You're an idiot"
2. Click Send

**Expected**:
- ❌ Message blocked
- ✅ Error toast: "Message blocked: Contains inappropriate content"
- ✅ Violation count warning if ≥3 violations
- ✅ After 5 violations: Account banned

**To Test Ban**:
- Send 5 toxic messages
- Try to send 6th message
- Expected: "Account has been banned" error

---

## Error Testing

### Test Rate Limiting
1. Click summarize 10 times rapidly
2. Expected: Eventually see circuit breaker message
3. Wait 65 seconds
4. Try again → should work

### Test Network Error
1. Stop the server
2. Try voice recording
3. Expected: Error toast appears
4. UI returns to normal state

### Test Invalid Input
1. Try translating an image message
2. Expected: "Cannot translate image messages"

---

## Performance Checks

### Voice-to-Text
- ⚠️ First time may take 5-10 seconds
- ⚠️ Subsequent uses should be similar (no caching)
- ✅ UI should remain responsive

### Summarization
- First request: 3-5 seconds
- Cached request: <500ms
- ✅ Should see "Loaded from cache" indicator

### Translation
- First request: 2-4 seconds
- Same text/language again: <100ms (DB cache)
- ✅ No re-translation for existing combinations

---

## Monitoring

### Check Browser Console
```javascript
// Should see logs like:
"🎤 Transcribing audio (High Priority)..."
"🌐 Translating to Tamil (High Priority)..."
"🤖 Generating summary (High Priority)..."
```

### Check Server Console
```
📝 Summarize Request received
🎤 Voice transcription request received
🌐 Translate Request received
Moderation check for user XXX: { flagged: false, severity: 'low' }
```

### Check API Usage
```bash
# Make GET request to stats endpoint
curl http://localhost:5000/api/ai/stats \
  -H "token: YOUR_JWT_TOKEN"
```

---

## Troubleshooting

### Voice Recording Issues

**Problem**: Microphone button doesn't appear
- **Fix**: Check if VoiceRecorder component imported in chatcontainer.jsx

**Problem**: "MediaRecorder not supported"
- **Fix**: Use modern browser (Chrome, Edge, Firefox)

**Problem**: Permission denied
- **Fix**: Go to browser settings → Site settings → Allow microphone

**Problem**: Empty transcription
- **Fix**: 
  - Speak louder
  - Check microphone working in system settings
  - Try shorter audio (5-10 seconds)

### API Issues

**Problem**: "Gemini API Key Status: Missing ❌"
- **Fix**: Check server/.env file has GEMINI_API_KEY=...

**Problem**: "429 Too Many Requests"
- **Fix**: Wait 60 seconds, circuit breaker will recover

**Problem**: "Quota 0"
- **Fix**: Create new project in Google AI Studio, get new API key

### General Issues

**Problem**: Features don't work
- **Fix**: 
  1. Check both terminals are running
  2. Check browser console for errors
  3. Check server console for errors
  4. Verify API key is valid

---

## Success Checklist

- [ ] Server starts without errors
- [ ] Client connects successfully
- [ ] Can log in and access chat
- [ ] **Voice recording works and transcribes correctly**
- [ ] Summarization generates and displays modal
- [ ] Smart replies show 3 suggestions
- [ ] Translation works for multiple languages
- [ ] Toxic message gets blocked
- [ ] All features work together without conflicts
- [ ] No console errors
- [ ] UI remains responsive

---

## Quick Commands

```bash
# Validate implementation
node validate-ai-implementation.js

# Start backend
cd server && npm run server

# Start frontend (new terminal)
cd client && npm run dev

# Check server is running
curl http://localhost:5000/api/status

# View environment config
cat server/.env | grep GEMINI
```

---

## Next Steps After Testing

1. ✅ Verify all features work
2. ✅ Test voice-to-text thoroughly
3. ✅ Monitor API usage
4. ✅ Document any issues found
5. ✅ Deploy to production when ready

---

**Current Status**: ✅ All 5 AI features implemented and ready for testing

**Priority**: Test voice-to-text feature first (newly added)

**Documentation**: See COMPLETE_AI_IMPLEMENTATION.md for full details
