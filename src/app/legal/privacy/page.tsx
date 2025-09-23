import fs from 'fs';
import path from 'path';
import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import LegalMarkdown from '@/components/shared/LegalMarkdown';

function getPrivacyMarkdown() {
  try {
    const filePath = path.join(process.cwd(), 'src', 'content', 'legal', 'privacy-policy.md');
    return fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    return null;
  }
}

export const metadata = {
  title: 'Privacy Policy | CampusOlx',
  description: 'Read the Privacy Policy for CampusOlx – how we collect and use information.'
};

export default function PrivacyPage() {
  const md = getPrivacyMarkdown();
  if (!md) return notFound();
  const match = md.match(/\*\*Last Updated:\*\*\s*(.+)/i);
  const lastUpdated = match ? match[1].trim() : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="container mx-auto max-w-3xl flex-1 px-4 py-10">
        <Link href="/" className="inline-flex items-center text-sm text-blue-600 hover:underline mb-6">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Link>
        <article className="bg-white rounded-lg border shadow-sm p-6">
          <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Privacy Policy</h1>
            {lastUpdated && <p className="text-sm text-gray-500">Last Updated: {lastUpdated}</p>}
          </header>
          <div className="prose prose-sm sm:prose-base max-w-none">
            <LegalMarkdown content={md} />
          </div>
        </article>
      </main>
    </div>
  );
}
