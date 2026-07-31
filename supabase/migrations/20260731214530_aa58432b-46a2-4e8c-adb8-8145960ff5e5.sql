CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  accent text NOT NULL DEFAULT 'ink',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  dek text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  category_slug text NOT NULL REFERENCES public.categories(slug) ON UPDATE CASCADE,
  media_type text NOT NULL DEFAULT 'photo',
  image_url text,
  video_url text,
  is_lead boolean NOT NULL DEFAULT false,
  is_breaking boolean NOT NULL DEFAULT false,
  views int NOT NULL DEFAULT 0,
  source_count int NOT NULL DEFAULT 2,
  risk_score numeric NOT NULL DEFAULT 0.1,
  status text NOT NULL DEFAULT 'published',
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX articles_published_idx ON public.articles (published_at DESC);
CREATE INDEX articles_category_idx ON public.articles (category_slug);

CREATE TABLE public.learning_hub (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  summary text NOT NULL DEFAULT '',
  level text NOT NULL DEFAULT 'beginner',
  duration text NOT NULL DEFAULT '',
  thumbnail_url text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.automation_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  fetched int NOT NULL DEFAULT 0,
  published int NOT NULL DEFAULT 0,
  skipped int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'running',
  note text NOT NULL DEFAULT ''
);
CREATE INDEX automation_runs_started_idx ON public.automation_runs (started_at DESC);

GRANT SELECT ON public.categories TO anon, authenticated;
GRANT SELECT ON public.articles TO anon, authenticated;
GRANT SELECT ON public.learning_hub TO anon, authenticated;
GRANT SELECT ON public.automation_runs TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;
GRANT ALL ON public.articles TO service_role;
GRANT ALL ON public.learning_hub TO service_role;
GRANT ALL ON public.automation_runs TO service_role;

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_hub ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories are public" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "published articles are public" ON public.articles FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "learning hub is public" ON public.learning_hub FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "automation runs are public" ON public.automation_runs FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.categories (slug, name, accent, sort_order) VALUES
  ('jatiyo', 'জাতীয়', 'red', 1),
  ('antorjatik', 'আন্তর্জাতিক', 'blue', 2),
  ('rajniti', 'রাজনীতি', 'amber', 3),
  ('ortho', 'অর্থনীতি', 'green', 4),
  ('khela', 'খেলাধুলা', 'lime', 5),
  ('binodon', 'বিনোদন', 'pink', 6),
  ('projukti', 'প্রযুক্তি', 'violet', 7),
  ('motamot', 'মতামত', 'ink', 8);

INSERT INTO public.articles (slug, title, dek, body, category_slug, media_type, image_url, video_url, is_lead, is_breaking, views, source_count, risk_score, published_at) VALUES
 ('rajdhanite-metro-bistar', 'রাজধানীতে মেট্রোরেলের নতুন রুট চালু, দৈনিক ৪ লাখ যাত্রীর সুবিধা', 'উত্তরা-কমলাপুর করিডোরে যুক্ত হলো তিনটি নতুন স্টেশন; কর্তৃপক্ষ বলছে যাত্রীচাপ ৩৭ শতাংশ কমবে।', 'রাজধানীর গণপরিবহন ব্যবস্থায় বড় পরিবর্তন আসছে। নতুন করিডোর চালুর ফলে দৈনিক প্রায় চার লাখ যাত্রী সরাসরি উপকৃত হবেন বলে জানিয়েছে পরিবহন কর্তৃপক্ষ।

তিনটি স্বতন্ত্র সূত্রে যাচাই করা তথ্য অনুযায়ী, নতুন স্টেশনগুলোতে স্বয়ংক্রিয় ভাড়া ব্যবস্থা এবং সমন্বিত বাস সংযোগ থাকবে। বিশেষজ্ঞরা বলছেন, সংযুক্ত ফিডার সার্ভিস ছাড়া পূর্ণ সুফল আসবে না।

অর্থনীতিবিদদের হিসাবে, যাতায়াত সময় কমলে বছরে প্রায় ৯ হাজার কোটি টাকার কর্মঘণ্টা সাশ্রয় হতে পারে।', 'jatiyo', 'photo', 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=1600&q=80', NULL, true, true, 18422, 3, 0.08, now() - interval '20 minutes'),
 ('bishwa-jolabayu-sommelon', 'বিশ্ব জলবায়ু সম্মেলনে নতুন তহবিল ঘোষণা, দক্ষিণ এশিয়া পাচ্ছে অগ্রাধিকার', 'ক্ষতিপূরণ তহবিলে যুক্ত হলো ২৭ বিলিয়ন ডলার; বাংলাদেশসহ ঝুঁকিপূর্ণ দেশগুলো প্রথম ধাপে বিবেচিত।', 'জলবায়ু আলোচনায় দীর্ঘ দর-কষাকষির পর নতুন তহবিল ঘোষণা এসেছে। ঝুঁকিপূর্ণ উপকূলীয় দেশগুলো প্রথম ধাপে অর্থ পাবে।

স্বাধীন পর্যবেক্ষকরা বলছেন, অর্থছাড়ের শর্ত এখনো স্পষ্ট নয়। বাস্তবায়ন নজরদারির জন্য একটি যৌথ কমিটি গঠনের প্রস্তাব উঠেছে।', 'antorjatik', 'video', 'https://images.unsplash.com/photo-1569163139394-de4e4f43e4e3?w=1600&q=80', 'https://www.youtube.com/embed/dQw4w9WgXcQ', false, true, 12980, 4, 0.11, now() - interval '48 minutes'),
 ('sangsade-bajet-bitorko', 'সংসদে বাজেট বিতর্ক: রাজস্ব লক্ষ্যমাত্রা নিয়ে প্রশ্ন বিরোধী দলের', 'সরকার বলছে প্রবৃদ্ধি অটুট থাকবে, বিরোধী দল বলছে হিসাব বাস্তবসম্মত নয়।', 'বাজেট অধিবেশনে রাজস্ব আদায়ের লক্ষ্যমাত্রা নিয়ে তীব্র বিতর্ক হয়েছে। অর্থমন্ত্রী দাবি করেছেন কর প্রশাসনের ডিজিটাইজেশন আদায় বাড়াবে।', 'rajniti', 'photo', 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1600&q=80', NULL, false, false, 8120, 3, 0.14, now() - interval '2 hours'),
 ('taka-dollar-binimoy', 'ডলারের বিনিময় হার স্থির, রেমিট্যান্সে রেকর্ড প্রবাহ', 'গত মাসে প্রবাসী আয় বেড়ে দাঁড়িয়েছে ২৬০ কোটি ডলারে।', 'কেন্দ্রীয় ব্যাংকের তথ্য অনুযায়ী রেমিট্যান্স প্রবাহ টানা তৃতীয় মাসে বেড়েছে, যা বিনিময় হারে স্থিরতা এনেছে।', 'ortho', 'photo', 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1600&q=80', NULL, false, false, 7340, 2, 0.09, now() - interval '3 hours'),
 ('cricket-siriz-joy', 'শেষ ওভারের নাটকীয়তায় সিরিজ জয়', 'তিন উইকেটের জয়ে ২-১ ব্যবধানে সিরিজ নিশ্চিত।', 'শেষ ওভারে প্রয়োজন ছিল ১১ রান। ব্যাটিং অর্ডারের নিচের দিকের দুই ব্যাটারের দৃঢ়তায় জয় আসে।', 'khela', 'video', 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1600&q=80', 'https://www.youtube.com/embed/dQw4w9WgXcQ', false, false, 15230, 2, 0.07, now() - interval '4 hours'),
 ('cholochchitro-uৎsob', 'আন্তর্জাতিক চলচ্চিত্র উৎসবে বাংলা ছবির জয়জয়কার', 'দুই বিভাগে পুরস্কার জিতেছে দেশীয় নির্মাতাদের কাজ।', 'উৎসবের সমাপনী দিনে সেরা চিত্রনাট্য ও সেরা অভিনেত্রী বিভাগে পুরস্কার এসেছে।', 'binodon', 'photo', 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600&q=80', NULL, false, false, 6110, 2, 0.12, now() - interval '5 hours'),
 ('ai-nitimala-khosra', 'দেশে এআই নীতিমালার খসড়া প্রকাশ, গণমাধ্যমে স্বচ্ছতার শর্ত', 'স্বয়ংক্রিয়ভাবে তৈরি কনটেন্টে লেবেল বাধ্যতামূলক করার সুপারিশ।', 'খসড়া নীতিমালায় বলা হয়েছে, এআই দিয়ে তৈরি সংবাদ বা ছবিতে স্পষ্ট লেবেল থাকতে হবে এবং সম্পাদকীয় দায় সংবাদমাধ্যমের।', 'projukti', 'photo', 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1600&q=80', NULL, false, false, 9450, 3, 0.1, now() - interval '6 hours'),
 ('sompadokiya-tothyer-daaye', 'সম্পাদকীয়: অটোমেশনের যুগে তথ্যের দায়', 'গতি নয়, নির্ভরযোগ্যতাই সাংবাদিকতার মূল পুঁজি।', 'যন্ত্র দ্রুত লিখতে পারে, কিন্তু দায় নিতে পারে না। তাই প্রতিটি স্বয়ংক্রিয় প্রতিবেদনের পেছনে যাচাইয়ের কাঠামো থাকা আবশ্যক।', 'motamot', 'photo', 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1600&q=80', NULL, false, false, 4300, 2, 0.05, now() - interval '8 hours'),
 ('nodi-bhangone-korniya', 'নদীভাঙনে ক্ষতিগ্রস্ত পরিবারগুলোর পুনর্বাসন শুরু', 'প্রথম ধাপে ১২০০ পরিবার পাচ্ছে ঘর ও নগদ সহায়তা।', 'স্থানীয় প্রশাসন জানিয়েছে, তালিকা যাচাই শেষে দ্বিতীয় ধাপের কাজ আগামী মাসে শুরু হবে।', 'jatiyo', 'photo', 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=1600&q=80', NULL, false, false, 5220, 2, 0.13, now() - interval '9 hours'),
 ('bishwa-bazare-tel', 'বিশ্ববাজারে তেলের দাম কমল ৪ শতাংশ', 'সরবরাহ বৃদ্ধির ঘোষণায় বাজারে স্বস্তি।', 'উৎপাদক দেশগুলোর সরবরাহ বাড়ানোর ঘোষণার পর দাম কমেছে; আমদানিনির্ভর অর্থনীতির জন্য এটি সুখবর।', 'antorjatik', 'photo', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&q=80', NULL, false, false, 3980, 3, 0.09, now() - interval '11 hours');

INSERT INTO public.learning_hub (title, summary, level, duration, thumbnail_url, sort_order) VALUES
 ('ফ্যাক্ট-চেকিং ১০১', 'ভাইরাল তথ্য যাচাইয়ের ধাপে ধাপে হাতেকলমে কোর্স।', 'beginner', '৪৫ মিনিট', 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80', 1),
 ('মোবাইল সাংবাদিকতা', 'ফোন দিয়ে পেশাদার ভিডিও রিপোর্ট তৈরির কৌশল।', 'intermediate', '১ ঘণ্টা ১০ মিনিট', 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80', 2),
 ('ডেটা জার্নালিজম', 'সরকারি ডেটাসেট থেকে সংবাদ বের করার পদ্ধতি।', 'advanced', '২ ঘণ্টা', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80', 3),
 ('এআই ও সম্পাদকীয় নীতি', 'অটোমেশন ব্যবহারে স্বচ্ছতা ও দায়বদ্ধতার নিয়ম।', 'intermediate', '৫০ মিনিট', 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80', 4);

INSERT INTO public.automation_runs (started_at, finished_at, fetched, published, skipped, status, note) VALUES
 (now() - interval '5 minutes', now() - interval '4 minutes', 143, 4, 12, 'success', 'ওয়্যার ফিড ২৬টি, ডুপ্লিকেট বাদ ১২টি'),
 (now() - interval '35 minutes', now() - interval '34 minutes', 138, 3, 15, 'success', 'ঝুঁকি স্কোর গেট পাস'),
 (now() - interval '65 minutes', now() - interval '64 minutes', 151, 5, 9, 'success', 'ভিডিও সংবাদ ২টি যুক্ত');