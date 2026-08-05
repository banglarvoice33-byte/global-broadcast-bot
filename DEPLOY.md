# DEPLOY.md — শূন্য থেকে লাইভ (বাংলার ভয়েস)

এই গাইডে তিনটি অংশ: (ক) GitHub-এ কোড পুশ, (খ) Lovable-এ পাবলিশ, (গ) নিজের সার্ভার/হোস্টে ডেপ্লয় ও ২৪/৭ অটোমেশন চালু।

---

## ক. GitHub-এ পুশ করা (সহজ ধাপ)

### বিকল্প ১ — Lovable থেকে এক ক্লিকে (সবচেয়ে সহজ, সুপারিশকৃত)

1. Lovable এডিটরে চ্যাট ইনপুটের বাঁ দিকের **+** মেনু খুলুন।
2. **GitHub → Connect project** চাপুন এবং GitHub-এ Lovable অ্যাপ Authorize করুন।
3. যে অ্যাকাউন্ট/অর্গানাইজেশনে রিপো বানাতে চান সেটি বাছুন।
4. **Create Repository** চাপুন। কোড GitHub-এ চলে যাবে এবং এরপর দুই দিকেই স্বয়ংক্রিয় সিঙ্ক হবে (Lovable-এ বদল → GitHub-এ পুশ, GitHub-এ পুশ → Lovable-এ সিঙ্ক)।

### বিকল্প ২ — জিপ থেকে ম্যানুয়াল পুশ

```bash
# 1) জিপ খুলুন এবং ফোল্ডারে ঢুকুন
unzip banglar-voice-full-stack.zip -d banglar-voice && cd banglar-voice

# 2) গিট চালু করুন
git init
git branch -M main
git add .
git commit -m "Initial commit: Banglar Voice 24/7 AI newsroom"

# 3) GitHub-এ একটি খালি রিপো বানান (github.com/new), তারপর:
git remote add origin https://github.com/<your-username>/banglar-voice.git
git push -u origin main
```

> `.env` কখনো কমিট করবেন না। `.gitignore`-এ এটি আগে থেকেই আছে — যাচাই করুন: `git check-ignore -v .env`

পরবর্তী প্রতিটি পরিবর্তনে:

```bash
git add -A && git commit -m "যা বদলেছেন তার বর্ণনা" && git push
```

---

## খ. Lovable-এ পাবলিশ (হোস্টিং লাগবে না)

1. এডিটরের ডান-উপরে **Publish** চাপুন → **Publish**।
2. এক মিনিটের মধ্যে `https://<your-slug>.lovable.app` লাইভ হবে।
3. কাস্টম ডোমেইন: **Project Settings → Domains → Connect domain**, তারপর দেখানো DNS রেকর্ড আপনার রেজিস্ট্রারে বসান।
4. ব্যাকএন্ড (ডেটাবেজ, সার্ভার রুট, অটোমেশন) সাথে সাথেই ডেপ্লয় হয়; ফ্রন্টএন্ড আপডেটের জন্য প্রতিবার Publish → Update চাপতে হয়।

---

## গ. নিজের Linux সার্ভারে ডেপ্লয় (VPS / Docker)

### গ১. সার্ভার প্রস্তুতি (Ubuntu 22.04+)

```bash
sudo apt update && sudo apt -y upgrade
sudo apt -y install git curl ufw nginx
curl -fsSL https://bun.sh/install | bash && source ~/.bashrc
sudo ufw allow OpenSSH && sudo ufw allow 'Nginx Full' && sudo ufw --force enable
```

### গ২. কোড ও ডিপেন্ডেন্সি

```bash
git clone https://github.com/<your-username>/banglar-voice.git /srv/banglar-voice
cd /srv/banglar-voice
bun install
```

### গ৩. এনভায়রনমেন্ট ভেরিয়েবল

`/srv/banglar-voice/.env` ফাইল বানান (মান আপনার প্রজেক্ট থেকে নেবেন):

```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
VITE_SUPABASE_PROJECT_ID=<project-ref>
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_PUBLISHABLE_KEY=<publishable-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
LOVABLE_API_KEY=<lovable-ai-key>
NEWSCYCLE_CRON_SECRET=<48-অক্ষরের র‍্যান্ডম স্ট্রিং>
```

র‍্যান্ডম সিক্রেট বানানোর কমান্ড: `openssl rand -hex 24`
`chmod 600 .env` দিয়ে ফাইল সুরক্ষিত করুন।

### গ৪. বিল্ড ও রান

```bash
bun run build
PORT=3000 bun run start        # অথবা: node .output/server/index.mjs
```

systemd সার্ভিস (`/etc/systemd/system/banglar-voice.service`):

```ini
[Unit]
Description=Banglar Voice newsroom
After=network.target

[Service]
WorkingDirectory=/srv/banglar-voice
EnvironmentFile=/srv/banglar-voice/.env
Environment=PORT=3000
ExecStart=/root/.bun/bin/bun run start
Restart=always
RestartSec=5
User=www-data

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now banglar-voice
sudo systemctl status banglar-voice
```

### গ৫. Nginx রিভার্স প্রক্সি + HTTPS

`/etc/nginx/sites-available/banglar-voice`:

```nginx
server {
  listen 80;
  server_name example.com www.example.com;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/banglar-voice /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo apt -y install certbot python3-certbot-nginx
sudo certbot --nginx -d example.com -d www.example.com
```

অ্যাপ নিজেই CSP/HSTS/X-Frame-Options হেডার পাঠায়, তাই Nginx-এ আলাদা করে দেওয়ার দরকার নেই।

### গ৬. Docker দিয়ে (বিকল্প)

`Dockerfile`:

```dockerfile
FROM oven/bun:1 AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

FROM oven/bun:1-slim
WORKDIR /app
COPY --from=build /app/.output ./.output
ENV PORT=3000
EXPOSE 3000
CMD ["bun", ".output/server/index.mjs"]
```

```bash
docker build -t banglar-voice .
docker run -d --name banglar-voice --env-file .env -p 3000:3000 --restart unless-stopped banglar-voice
```

---

## ঘ. ২৪/৭ এআই অটোমেশন চালু রাখা

নিউজ সাইকেল এন্ডপয়েন্ট: `POST /api/public/hooks/newscycle`
হেডার: `x-cron-secret: <NEWSCYCLE_CRON_SECRET>`

### বিকল্প ১ — ডেটাবেজ শিডিউলার (Lovable Cloud, ইতিমধ্যেই চালু)

প্রতি ৫ মিনিটে ডেটাবেজ থেকেই এন্ডপয়েন্ট কল হয়। সিক্রেট বদলালে শিডিউল আবার সেট করতে হবে।

### বিকল্প ২ — সার্ভারের নিজের cron

```bash
sudo crontab -e
```

```cron
*/5 * * * * curl -fsS -X POST https://example.com/api/public/hooks/newscycle -H "x-cron-secret: <SECRET>" >> /var/log/newscycle.log 2>&1
```

লগ দেখা: `tail -f /var/log/newscycle.log`; ইউআই মনিটর: `https://example.com/newsroom`

---

## ঙ. ডেপ্লয়ের পরে যাচাই

`docs/SMOKE_TEST.md` ধাপে ধাপে চালান। সংক্ষেপে:

```bash
curl -s https://example.com/api/health | jq
curl -sI https://example.com | grep -i content-security-policy
curl -s https://example.com/sitemap.xml | grep -c "<url>"
```

## চ. রক্ষণাবেক্ষণ

- **আপডেট:** `git pull && bun install && bun run build && sudo systemctl restart banglar-voice`
- **ব্যাকআপ:** ডেটাবেজ এক্সপোর্ট (Cloud → Advanced settings → Export data) সাপ্তাহিক।
- **মনিটরিং:** `/api/health` প্রতি ৫ মিনিটে UptimeRobot/Healthchecks.io দিয়ে পোল করুন।
- **সিক্রেট রোটেশন:** নতুন `NEWSCYCLE_CRON_SECRET` বসিয়ে cron/শিডিউলার আপডেট করুন।
