# **Quiz Generation - Troubleshooting Guide** 🔧

## **✅ Fixed Issues**

I've updated the `generateQuiz()` function in `actions/interview.js` with:
- ✅ Better error messages (tells you exactly what's wrong)
- ✅ API key validation (checks if GEMINI_API_KEY is set)
- ✅ User profile validation (checks if industry is set)
- ✅ Better JSON parsing with error logging
- ✅ Response structure validation
- ✅ Detailed console logs for debugging

---

## **🔍 How to Debug - Step by Step**

### **Step 1: Check Environment Variables**

Make sure you have a `.env.local` file in your project root with:

```
GEMINI_API_KEY=your_actual_api_key_here
DATABASE_URL=your_database_url
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
```

**To get your GEMINI_API_KEY:**
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key
4. Add it to `.env.local`

### **Step 2: Check User Profile**

Before generating a quiz, make sure you:
1. ✅ Signed in to the app
2. ✅ Went to **Settings/Profile**
3. ✅ Set your **Industry** (e.g., "Software Development", "Data Science")
4. ✅ Added your **Skills** (optional but recommended)

**If you skipped setup:**
- Go to dashboard
- Click Profile/Settings
- Fill in Industry field
- Save
- Then try generating quiz again

### **Step 3: Check Browser Console for Errors**

1. Open browser DevTools (F12 or Ctrl+Shift+I)
2. Go to **Console** tab
3. Try to generate quiz again
4. Look for error messages

**Common errors you might see:**

| Error | Solution |
|-------|----------|
| "Please complete your profile with an industry" | Set your industry in Profile settings |
| "GEMINI_API_KEY environment variable is not configured" | Add GEMINI_API_KEY to `.env.local` and restart dev server |
| "Unauthorized - Please log in" | Log out and log in again |
| "Invalid response format from AI" | API key works but Gemini returned unexpected format - try again |

### **Step 4: Check Server Console**

1. Look at terminal where `npm run dev` is running
2. You should see logs like:
   ```
   Generating quiz for industry: Software Development
   Raw Gemini response: {"questions": [{...
   Quiz generated successfully with 5 questions
   ```

3. If you see errors, note them down

---

## **💻 How to Run & Test**

### **Option 1: Start Fresh (Recommended)**

```bash
# 1. Stop the dev server (Ctrl+C in terminal)

# 2. Clear any cache
npm run build

# 3. Restart dev server
npm run dev

# 4. In browser: Go to http://localhost:3000
# 5. Sign in
# 6. Set your profile (Industry is required)
# 7. Go to Interview section
# 8. Click "Start Quiz"
```

### **Option 2: Check Configuration**

Run this command to verify everything is set up:

```bash
# Check if Prisma is initialized
npx prisma generate

# Check if database connection works
npx prisma db push

# Check Clerk setup
npm run dev
```

---

## **📋 Pre-Quiz Checklist**

Before trying to generate a quiz, confirm:

- [ ] `.env.local` file exists with `GEMINI_API_KEY`
- [ ] You're logged in (user icon visible in header)
- [ ] Your profile has an **Industry** set
- [ ] Dev server is running (`npm run dev`)
- [ ] No errors in browser console
- [ ] Database connection is working

---

## **🚀 Quick Test Script**

If you want to test the API directly, create a test file `test-quiz.js`:

```javascript
// test-quiz.js
import { generateQuiz } from "./actions/interview.js";

async function testQuizGeneration() {
  try {
    console.log("Testing quiz generation...");
    const quiz = await generateQuiz();
    console.log("✅ Success! Generated quiz:", quiz);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testQuizGeneration();
```

Run with: `node test-quiz.js` (requires Node.js setup)

---

## **🔧 Manual API Testing**

Use this to test the Gemini API directly:

```javascript
// In browser console or test file
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "models/gemini-flash-latest" });

const result = await model.generateContent("Generate 5 quiz questions about JavaScript");
console.log(result.response.text());
```

---

## **📊 Expected Flow**

```
1. User clicks "Start Quiz"
   ↓
2. React component calls generateQuiz() function
   ↓
3. Backend checks: User authenticated? ✅
   ↓
4. Backend checks: User has industry set? ✅
   ↓
5. Backend calls Google Gemini API with prompt
   ↓
6. Gemini returns JSON with 5 questions
   ↓
7. Backend validates response structure ✅
   ↓
8. Questions displayed in UI ✅
```

---

## **📞 Still Having Issues?**

### **Check These Files:**
- [.env.local](.env.local) - Check API keys
- [prisma/schema.prisma](prisma/schema.prisma) - Check database schema
- [actions/interview.js](actions/interview.js) - Check function logic
- [app/(main)/interview/_components/quiz.jsx](app/(main)/interview/_components/quiz.jsx) - Check UI

### **Common Root Causes:**
1. **Missing API Key** - Most common
2. **Missing Industry in Profile** - Second most common
3. **Database not synced** - Run `npx prisma db push`
4. **Wrong environment** - Using `.env` instead of `.env.local`
5. **Node version issue** - Use Node 18+

### **Nuclear Option (Reset Everything):**
```bash
# 1. Delete node_modules
rm -r node_modules

# 2. Reinstall
npm install

# 3. Generate Prisma client
npx prisma generate

# 4. Restart dev server
npm run dev
```

---

## **✅ You should see this:**

```
✅ Browser Console: No errors
✅ Server Console: "Quiz generated successfully with 5 questions"
✅ UI: Quiz questions appear with options
✅ Database: Assessment records are created
```

---

**Try the fixes above and let me know which error message you see!**
