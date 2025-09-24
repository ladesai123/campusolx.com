"use client";
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
// "use client";
// export const metadata = {
//   title: "Why CampusOlx?",
//   description: "The story behind CampusOlx by Lade Sai Teja, Founder."
// };

export default function WhyCampusOlxPage() {
  const router = useRouter();
  return (
    <div className="max-w-lg mx-auto px-4 py-10 text-center">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 mb-6 text-blue-600 hover:text-blue-800 font-semibold text-sm bg-blue-50 rounded-full px-4 py-2 shadow-sm transition"
        aria-label="Go back"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>
      <div className="flex flex-col items-center gap-4 mb-6">
        <Image
          src="/assets/profile.png"
          alt="Lade Sai Teja, Founder CampusOlx"
          width={96}
          height={96}
          className="rounded-full border-4 border-blue-200 shadow-md"
          priority
        />
        <h1 className="text-2xl font-bold text-blue-700">Why CampusOlx?</h1>
      </div>
      <div className="bg-white rounded-xl shadow p-6 text-left text-gray-700">
        <p className="mb-4">
          Every year, when seniors packed up and left, I’d walk through the hostels and see piles of useful things—books, lamps, cycles—just left behind or tossed away. Honestly, it hurt to watch so much go to waste, knowing that someone right here on campus could have used it. I kept thinking, “Why does this keep happening? Why isn’t there a simple way for us to help each other out?”
        </p>
        <p className="mb-4">
          That’s when I decided to do something about it. CampusOlx was born from that feeling—a hope that even if I could help just one thing find a new home instead of a dustbin, it would make a difference.
        </p>
        <p className="mb-4">
          For me, every item reused or passed on here is a small success. This isn’t just a website or an app—it’s a piece of our campus story, I kept hoping someone would create this, until I realized I could be the one to do it.
        </p>
        <p className="mb-4">
          Thank you for being a part of this, for caring, and for making CampusOlx what it is. Together, we’re making campus life kinder and less wasteful, one small act at a time.
        </p>
        <div className="mt-6 text-right text-blue-700 font-semibold">
          — Lade Sai Teja, Founder, CampusOlx
        </div>
      </div>
    </div>
  );
}
