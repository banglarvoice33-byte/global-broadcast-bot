import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone, MapPin } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "যোগাযোগ ও বিজ্ঞাপন — বাংলার ভয়েস" },
      { name: "description", content: "নিউজরুম, বিজ্ঞাপন ও সংশোধনী সংক্রান্ত যোগাযোগের ঠিকানা।" },
      { property: "og:title", content: "যোগাযোগ ও বিজ্ঞাপন — বাংলার ভয়েস" },
      { property: "og:description", content: "নিউজরুমে সরাসরি যোগাযোগ করুন।" },
    ],
  }),
  component: () => (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="slab inline-block bg-card px-4 py-2 text-3xl">যোগাযোগ</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="slab bg-card p-4">
          <MapPin className="h-5 w-5" />
          <p className="mt-2 text-sm">১২/এ মিডিয়া হাউস, কারওয়ান বাজার, ঢাকা ১২১৫</p>
        </div>
        <div className="slab bg-card p-4">
          <Phone className="h-5 w-5" />
          <p className="mt-2 text-sm">+৮৮০ ২ ৫৫০ ১১২ ৩৪</p>
        </div>
        <div className="slab bg-card p-4">
          <Mail className="h-5 w-5" />
          <p className="mt-2 text-sm">newsroom@banglarvoice.ai</p>
        </div>
      </div>
    </div>
  ),
});