import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import 'highlight.js/styles/github-dark.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  return (
    <div className={`prose prose-invert prose-cyan max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          // Custom styling for markdown elements
          h1: ({ children }) => (
            <h1 className="text-4xl font-bold text-white mb-6 border-b border-cyan-500/30 pb-4">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-3xl font-bold text-white mb-4 mt-8">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-2xl font-semibold text-white mb-3 mt-6">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-xl font-semibold text-cyan-300 mb-2 mt-4">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="text-neutral-300 leading-relaxed mb-4">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="text-neutral-300 space-y-2 mb-4 ml-6">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="text-neutral-300 space-y-2 mb-4 ml-6">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="relative">
              <span className="absolute -left-6 text-cyan-400">•</span>
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-cyan-500 pl-6 py-4 my-6 bg-neutral-800/30 rounded-r-lg italic text-neutral-300">
              {children}
            </blockquote>
          ),
          code: ({ children, className, ...props }: any) => {
            const isInline = !className || !className.includes('language-');
            if (isInline) {
              return (
                <code className="bg-neutral-800 text-cyan-300 px-2 py-1 rounded text-sm font-mono">
                  {children}
                </code>
              );
            }
            return (
              <code className="block bg-neutral-900 text-cyan-300 p-4 rounded-xl overflow-x-auto text-sm font-mono" {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-neutral-900 border border-neutral-700 rounded-xl p-4 overflow-x-auto mb-6">
              {children}
            </pre>
          ),
          a: ({ href, children }) => (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors"
            >
              {children}
            </a>
          ),
          strong: ({ children }) => (
            <strong className="text-white font-semibold">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="text-cyan-300 italic">
              {children}
            </em>
          ),
          hr: () => (
            <hr className="border-neutral-700 my-8" />
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse border border-neutral-700 rounded-lg">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-neutral-800">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-neutral-700">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-neutral-800/50 transition-colors">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 text-left text-white font-semibold border-b border-neutral-700">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 text-neutral-300">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
