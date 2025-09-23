"use client";
import React from 'react';
import dynamic from 'next/dynamic';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: false });

interface LegalMarkdownProps {
  content: string;
}

// Utility to slugify heading text for anchor links
function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

// Replace raw brand usage with styled HTML snippet (only inside markdown render)
function decorateBrand(content: string) {
  // Avoid double-wrapping by first removing any existing custom span if accidentally present.
  // Then replace CampusOlx or CampusOLX variants.
  return content.replace(/CampusO(LX|lx)/g, () =>
    'Campus<span class="font-bold text-brand" style="color: var(--brand-color)">Olx</span>'
  );
}

export default function LegalMarkdown({ content }: LegalMarkdownProps) {
  const processed = React.useMemo(() => decorateBrand(content), [content]);
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        h1: ({node, ...props}) => {
          const id = slugify(String(props.children));
          return (
            <h1 id={id} className="group scroll-mt-24 text-3xl font-bold tracking-tight">
              <a href={`#${id}`} className="no-underline text-inherit">
                {props.children}
              </a>
              <a
                href={`#${id}`}
                className="opacity-0 group-hover:opacity-100 ml-2 text-blue-500 text-sm"
                aria-label="Anchor link"
              >#</a>
            </h1>
          );
        },
        h2: ({node, ...props}) => {
          const id = slugify(String(props.children));
          return (
            <h2 id={id} className="group scroll-mt-24 mt-10 text-2xl font-semibold">
              <a href={`#${id}`}>{props.children}</a>
              <a href={`#${id}`} className="opacity-0 group-hover:opacity-100 ml-2 text-blue-500 text-xs">#</a>
            </h2>
          );
        },
        h3: ({node, ...props}) => {
          const id = slugify(String(props.children));
            return (
              <h3 id={id} className="group scroll-mt-24 mt-8 text-xl font-semibold">
                <a href={`#${id}`}>{props.children}</a>
                <a href={`#${id}`} className="opacity-0 group-hover:opacity-100 ml-2 text-blue-500 text-xs">#</a>
              </h3>
            );
        },
        p: ({node, ...props}) => <p className="leading-relaxed text-gray-700" {...props} />,
        ul: ({node, ...props}) => <ul className="list-disc pl-6 space-y-2" {...props} />,
        ol: ({node, ...props}) => <ol className="list-decimal pl-6 space-y-2" {...props} />,
        li: ({node, ...props}) => <li className="text-gray-700" {...props} />,
        strong: ({node, ...props}) => <strong className="font-semibold text-gray-900" {...props} />,
        a: ({node, ...props}) => <a className="text-blue-600 underline" {...props} />,
        hr: () => <hr className="my-8 border-gray-200" />,
        blockquote: ({node, ...props}) => (
          <blockquote className="border-l-4 border-blue-300 bg-blue-50/60 p-3 italic text-sm text-gray-700" {...props} />
        ),
        code: ({inline, children, ...props}: any) =>
          inline ? (
            <code className="rounded bg-gray-100 px-1 py-0.5 text-sm" {...props}>{children}</code>
          ) : (
            <pre className="my-4 overflow-x-auto rounded bg-gray-900 p-4 text-sm text-gray-100" {...props}>
              <code>{children}</code>
            </pre>
          ),
      }}
    >
      {/* We intentionally inject processed HTML so that the <span> styling works. */}
      {processed as any}
    </ReactMarkdown>
  );
}
