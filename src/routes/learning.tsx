import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { learningQuery } from "@/lib/news";
import { LearningHub } from "@/components/news/LearningHub";

export const Route = createFileRoute("/learning")({
  head: () => ({
    meta: [
      { title: "বাংলার ভয়েস লার্নিং হাব — সাংবাদিকতা কোর্স" },
      {
        name: "description",
        content: "ফ্যাক্ট-চেকিং, মোবাইল সাংবাদিকতা, ডেটা জার্নালিজম ও এআই নীতিমালার ফ্রি কোর্স।",
      },
      { property: "og:title", content: "বাংলার ভয়েস লার্নিং হাব" },
      { property: "og:description", content: "সাংবাদিকতার হাতেকলমে ফ্রি কোর্স।" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(learningQuery),
  component: LearningPage,
});

function LearningPage() {
  const { data: items } = useSuspenseQuery(learningQuery);
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6">
      <LearningHub items={items} />
    </div>
  );
}