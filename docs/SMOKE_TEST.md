# SMOKE_TEST.md — বাংলার ভয়েস (Banglar Voice)

প্রতিবার ডেপ্লয়ের পরে নিচের ধাপগুলো ঠিক এই ক্রমে চালান। যেকোনো ধাপ FAIL হলে ডেপ্লয় রোলব্যাক করুন।

`BASE` সেট করুন:

```bash
export BASE="https://global-broadcast-bot.lovable.app"   # অথবা আপনার কাস্টম ডোমেইন
```

## 1. Health gate

```bash
curl -s "$BASE/api/health" | jq
```
প্রত্যাশা: HTTP 200, `status: "ok"`, `checks.database.ok = true`,
`checks.ai_key.ok = true`, `checks.cron_secret.ok = true`,
`checks.content_freshness.ok = true` (সর্বশেষ খবর ১২ ঘণ্টার মধ্যে)।

## 2. পাবলিক পেজ (প্রতিটি HTTP 200)

```bash
for p in / /learning /newsroom /contact /ethics /privacy "/search?q=বাংলাদেশ"; do
  printf "%-28s %s\n" "$p" "$(curl -s -o /dev/null -w '%{http_code}' "$BASE$p")"
done
```

## 3. আর্টিকেল ও ক্যাটাগরি রুট

```bash
SLUG=$(curl -s "$BASE/feed.json" | jq -r '.items[0].url' | sed 's#.*/article/##')
curl -s -o /dev/null -w 'article %{http_code}\n' "$BASE/article/$SLUG"
curl -s -o /dev/null -w 'category %{http_code}\n' "$BASE/category/antorjatik"
```

## 4. ফিড ও সাইটম্যাপ

```bash
curl -s "$BASE/rss.xml" | head -c 200          # <rss version="2.0" ...
curl -s "$BASE/rss/khela" | head -c 200        # ক্যাটাগরি ফিড
curl -s "$BASE/feed.json" | jq '.items | length'
curl -s "$BASE/sitemap.xml" | grep -c "<url>"  # > 5 হওয়া উচিত
curl -s "$BASE/robots.txt" | grep Sitemap
```

## 5. SEO ট্যাগ যাচাই

```bash
curl -s "$BASE/" | grep -o '<title>[^<]*</title>'
curl -s "$BASE/" | grep -o 'rel="canonical" href="[^"]*"'
curl -s "$BASE/article/$SLUG" | grep -o '"@type":"NewsArticle"'
```

## 6. সিকিউরিটি হেডার

```bash
curl -sI "$BASE/" | grep -Ei 'content-security-policy|strict-transport|x-frame-options|x-content-type|referrer-policy'
```
পাঁচটি হেডারই উপস্থিত থাকতে হবে।

## 7. PWA

```bash
curl -s -o /dev/null -w 'manifest %{http_code}\n' "$BASE/manifest.webmanifest"
curl -s -o /dev/null -w 'sw %{http_code}\n' "$BASE/sw.js"
curl -s -o /dev/null -w 'offline %{http_code}\n' "$BASE/offline.html"
```
ব্রাউজারে DevTools → Application → Manifest/Service Workers-এ "installable" দেখা যাবে।

## 8. অটোমেশন এন্ডপয়েন্ট নিরাপত্তা

```bash
curl -s -o /dev/null -w 'no secret -> %{http_code}\n' -X POST "$BASE/api/public/hooks/newscycle"        # 401 হওয়া বাধ্যতামূলক
curl -s -X POST "$BASE/api/public/hooks/newscycle" -H "x-cron-secret: $NEWSCYCLE_CRON_SECRET" | jq      # {"ok":true,...}
```

## 9. নিউজরুম মনিটর

`$BASE/newsroom` খুলে দেখুন সর্বশেষ রান, fetched/published/skipped সংখ্যা ও লগ আসছে
(লগ শুধু লগইন করা ব্যবহারকারীর জন্য দৃশ্যমান — অ্যানোনিমাসের জন্য খালি থাকা প্রত্যাশিত)।

## PASS শর্ত

সব ধাপ 200/প্রত্যাশিত মান দিলে ডেপ্লয় গ্রহণযোগ্য। ধাপ ১, ৬ বা ৮ ব্যর্থ হলে অবশ্যই রোলব্যাক।
