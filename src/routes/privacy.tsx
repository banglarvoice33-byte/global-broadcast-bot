import { absoluteUrl } from "@/lib/site";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "গোপনীয়তার নীতি — বাংলার ভয়েস" },
      { name: "description", content: "কোন তথ্য সংগ্রহ করা হয়, কীভাবে ব্যবহার ও সুরক্ষিত রাখা হয়।" },
      { property: "og:title", content: "গোপনীয়তার নীতি — বাংলার ভয়েস" },
      { property: "og:description", content: "পাঠকের তথ্য সুরক্ষার নীতিমালা।" },
      { property: "og:url", content: absoluteUrl("/privacy") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/privacy") }],
  }),
  component: () => (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="slab inline-block bg-highlight px-4 py-2 text-3xl">গোপনীয়তার নীতি</h1>
      <div className="slab mt-6 space-y-4 bg-card p-5 font-serif leading-relaxed">
        <p>
          আমরা পাঠকের ব্যক্তিগত তথ্য সর্বনিম্ন পরিমাণে সংগ্রহ করি। সাইট ব্যবহারের সময় শুধু বেনামী
          পরিসংখ্যান (পৃষ্ঠা ভিউ, রেফারার) সংরক্ষিত হয়।
        </p>
        <p>
          কুকি ব্যবহার হয় কেবল থিম (ডার্ক/আই-প্রোটেকশন) পছন্দ মনে রাখতে। কোনো তৃতীয় পক্ষের কাছে ব্যক্তিগত
          তথ্য বিক্রি করা হয় না।
        </p>
        <p>
          এআই অটোমেশনে তৈরি প্রতিবেদন সম্পাদকীয় দায়ের আওতাভুক্ত; কোনো তথ্যে ভুল পেলে
          newsroom@banglarvoice.ai-এ জানালে ২৪ ঘণ্টার মধ্যে সংশোধনী প্রকাশ করা হয়।
        </p>
      </div>
    </div>
  ),
});