import { absoluteUrl } from "@/lib/site";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/ethics")({
  head: () => ({
    meta: [
      { title: "এআই সম্পাদকীয় নীতি — বাংলার ভয়েস" },
      {
        name: "description",
        content: "স্বয়ংক্রিয় সংবাদ উৎপাদনে স্বচ্ছতা, করোবরেশন ও সংশোধনীর নিয়ম।",
      },
      { property: "og:title", content: "এআই সম্পাদকীয় নীতি — বাংলার ভয়েস" },
      { property: "og:description", content: "অটোমেশনে দায়বদ্ধতার কাঠামো।" },
      { property: "og:url", content: absoluteUrl("/ethics") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/ethics") }],
  }),
  component: () => (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="slab inline-block bg-live px-4 py-2 text-3xl text-accent-foreground">
        এআই সম্পাদকীয় নীতি
      </h1>
      <ol className="slab mt-6 space-y-3 bg-card p-5 font-serif leading-relaxed">
        <li>১. প্রতিটি সংবাদ প্রকাশের আগে অন্তত দুইটি স্বাধীন সূত্রে করোবরেশন বাধ্যতামূলক।</li>
        <li>২. ঝুঁকি স্কোর নির্দিষ্ট সীমার বেশি হলে প্রতিবেদন স্বয়ংক্রিয়ভাবে আটকে যায়।</li>
        <li>৩. এআই-সহায়তায় তৈরি প্রতিবেদনে স্পষ্ট লেবেল থাকে।</li>
        <li>৪. ভুল তথ্য শনাক্ত হলে দৃশ্যমান সংশোধনী নোট যুক্ত করা হয়।</li>
        <li>৫. ব্যক্তিগত গোপনীয়তা ও শিশু-সুরক্ষা সংক্রান্ত কনটেন্ট স্বয়ংক্রিয়ভাবে ফিল্টার হয়।</li>
      </ol>
    </div>
  ),
});