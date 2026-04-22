# הגדרת Supabase

## שלב 1 — צור פרויקט Supabase
1. כנס ל-[supabase.com](https://supabase.com) וצור חשבון חינם
2. לחץ **New Project**
3. בחר שם ואזור

## שלב 2 — הרץ את ה-SQL Schema
1. ב-Supabase לחץ **SQL Editor**
2. העתק את כל התוכן מקובץ `lib/supabase-schema.sql`
3. לחץ **Run**

## שלב 3 — הפעל Google Login
1. לחץ **Authentication → Providers**
2. הפעל **Google**
3. כנס ל-[console.cloud.google.com](https://console.cloud.google.com)
4. צור OAuth 2.0 credentials
5. הוסף Redirect URL: `https://YOUR-PROJECT.supabase.co/auth/v1/callback`
6. הכנס Client ID ו-Secret ב-Supabase

## שלב 4 — הפעל Apple Login (אופציונלי - דורש Apple Developer $99/שנה)
1. לחץ **Authentication → Providers → Apple**
2. עקוב אחר ההוראות של Supabase

## שלב 5 — קח את המפתחות
1. לחץ **Settings → API**
2. העתק:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

## שלב 6 — הוסף ל-Vercel
1. כנס ל-Vercel → Settings → Environment Variables
2. הוסף את כל המשתנים
3. הוסף גם: `ANTHROPIC_API_KEY`
4. לחץ **Redeploy**
