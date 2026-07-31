import { Link } from "@tanstack/react-router";
import { Facebook, Youtube, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react";
import { toBn } from "@/lib/news";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t-[3px] border-border bg-ink text-paper">
      <div className="mx-auto grid max-w-[1400px] gap-8 px-4 py-10 md:grid-cols-4">
        <div>
          <h3 className="text-2xl">বাংলার ভয়েস</h3>
          <p className="mt-2 text-sm opacity-80">
            সম্পূর্ণ এআই অটোমেশনে পরিচালিত ২৪/৭ আন্তর্জাতিক গণমাধ্যম। প্রতিটি প্রতিবেদন একাধিক স্বাধীন
            সূত্রে যাচাই করা হয়।
          </p>
          <div className="mt-4 flex gap-2">
            {[Facebook, Youtube, Twitter, Instagram].map((Icon, i) => (
              <span
                key={i}
                className="grid h-9 w-9 place-items-center border-[3px] border-paper bg-transparent"
              >
                <Icon className="h-4 w-4" />
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 className="kicker">যোগাযোগ</h4>
          <ul className="mt-3 space-y-2 text-sm opacity-85">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> ১২/এ মিডিয়া হাউস, কারওয়ান বাজার, ঢাকা
              {" "}
              {toBn(1215)}
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0" /> +৮৮০ ২ ৫৫০ ১১২ ৩৪
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0" /> newsroom@banglarvoice.ai
            </li>
          </ul>
        </div>

        <div>
          <h4 className="kicker">সেকশন</h4>
          <ul className="mt-3 space-y-2 text-sm opacity-85">
            <li>
              <Link to="/category/$slug" params={{ slug: "jatiyo" }}>
                জাতীয়
              </Link>
            </li>
            <li>
              <Link to="/category/$slug" params={{ slug: "antorjatik" }}>
                আন্তর্জাতিক
              </Link>
            </li>
            <li>
              <Link to="/learning">লার্নিং হাব</Link>
            </li>
            <li>
              <Link to="/newsroom">নিউজরুম মনিটর</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="kicker">নীতিমালা</h4>
          <ul className="mt-3 space-y-2 text-sm opacity-85">
            <li>
              <Link to="/privacy">গোপনীয়তার নীতি</Link>
            </li>
            <li>
              <Link to="/ethics">এআই সম্পাদকীয় নীতি</Link>
            </li>
            <li>
              <Link to="/contact">বিজ্ঞাপন ও যোগাযোগ</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t-[3px] border-paper/30 px-4 py-4 text-center text-xs opacity-70">
        © {toBn(new Date().getFullYear())} বাংলার ভয়েস · সর্বস্বত্ব সংরক্ষিত · এআই অটোমেটেড নিউজরুম
      </div>
    </footer>
  );
}