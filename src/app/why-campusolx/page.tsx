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
          <div className="mt-2 flex justify-end gap-4">
            <a
              href="https://www.linkedin.com/in/ladesaiteja"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="hover:text-blue-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.5 11.268h-3v-5.604c0-1.337-.026-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.967v5.7h-3v-10h2.881v1.367h.041c.401-.761 1.379-1.563 2.838-1.563 3.036 0 3.6 2.001 3.6 4.601v5.595z"/></svg>
            </a>
            <a
              href="https://github.com/ladesai123"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="hover:text-gray-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.089-.745.083-.729.083-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.305.762-1.605-2.665-.305-5.466-1.332-5.466-5.93 0-1.31.469-2.381 1.236-3.221-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.553 3.297-1.23 3.297-1.23.653 1.653.242 2.873.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.61-2.804 5.624-5.475 5.921.43.371.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.218.694.825.576 4.765-1.585 8.199-6.082 8.199-11.385 0-6.627-5.373-12-12-12z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
