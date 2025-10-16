import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { cn } from "@/lib/utils";
import { Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "./button";
import { useTheme } from "next-themes";

interface MarkdownMessageProps {
  content: string;
  className?: string;
  language?: 'ar' | 'en';
}

export function MarkdownMessage({ content, className, language = 'en' }: MarkdownMessageProps) {
  const { theme } = useTheme();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Set<number>>(new Set());

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const toggleSection = (index: number) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <div 
      className={cn(
        "prose prose-sm dark:prose-invert max-w-none",
        "prose-headings:font-semibold prose-headings:text-foreground",
        "prose-p:text-foreground prose-p:leading-relaxed",
        "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
        "prose-strong:text-foreground prose-strong:font-semibold",
        "prose-code:text-primary prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none",
        "prose-pre:bg-transparent prose-pre:p-0 prose-pre:m-0",
        "prose-blockquote:border-l-primary prose-blockquote:bg-muted/50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r",
        "prose-ul:text-foreground prose-ol:text-foreground",
        "prose-li:text-foreground prose-li:marker:text-primary",
        "prose-table:border-collapse prose-table:w-full",
        "prose-thead:bg-muted prose-th:border prose-th:border-border prose-th:px-4 prose-th:py-2 prose-th:text-left",
        "prose-td:border prose-td:border-border prose-td:px-4 prose-td:py-2",
        "prose-img:rounded-lg prose-img:shadow-md",
        className
      )}
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          // Enhanced code blocks with syntax highlighting and copy button
          code({ className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const codeString = String(children).replace(/\n$/, '');
            const codeId = `code-${Math.random().toString(36).substr(2, 9)}`;
            const inline = !className || !match;
            
            if (!inline && match) {
              return (
                <div className="relative group my-4">
                  <div className="flex items-center justify-between bg-muted border border-border rounded-t-lg px-4 py-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">
                      {match[1]}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyCode(codeString, codeId)}
                      className="h-6 px-2 text-xs"
                    >
                      {copiedCode === codeId ? (
                        <>
                          <Check className="w-3 h-3 mr-1" />
                          {language === 'ar' ? 'تم النسخ' : 'Copied'}
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 mr-1" />
                          {language === 'ar' ? 'نسخ' : 'Copy'}
                        </>
                      )}
                    </Button>
                  </div>
                  <SyntaxHighlighter
                    style={theme === 'dark' ? vscDarkPlus as any : vs as any}
                    language={match[1]}
                    PreTag="div"
                    className="!mt-0 !rounded-t-none !rounded-b-lg !border !border-t-0 !border-border"
                  >
                    {codeString}
                  </SyntaxHighlighter>
                </div>
              );
            }
            
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          
          // Enhanced tables with better styling
          table({ children, ...props }: any) {
            return (
              <div className="overflow-x-auto my-4 rounded-lg border border-border shadow-sm">
                <table className="min-w-full divide-y divide-border" {...props}>
                  {children}
                </table>
              </div>
            );
          },
          
          // Enhanced headers with collapsible sections (h2 and below)
          h2({ children, ...props }: any) {
            const [sectionIndex] = useState(() => Math.random());
            const isCollapsed = collapsedSections.has(sectionIndex);
            
            return (
              <div className="my-4">
                <h2 
                  className="flex items-center gap-2 cursor-pointer group hover:text-primary transition-colors"
                  onClick={() => toggleSection(sectionIndex)}
                  {...props}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                  >
                    {isCollapsed ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronUp className="w-4 h-4" />
                    )}
                  </Button>
                  {children}
                </h2>
                {!isCollapsed && <div className="ml-8">{/* Content will be here */}</div>}
              </div>
            );
          },
          
          // Enhanced blockquotes
          blockquote({ children, ...props }: any) {
            return (
              <blockquote 
                className="border-l-4 border-primary bg-primary/5 rounded-r-lg my-4"
                {...props}
              >
                {children}
              </blockquote>
            );
          },
          
          // Enhanced links with external indicator
          a({ href, children, ...props }: any) {
            const isExternal = href?.startsWith('http');
            return (
              <a
                href={href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className="text-primary hover:underline"
                {...props}
              >
                {children}
                {isExternal && (
                  <span className="inline-block ml-1 text-xs">↗</span>
                )}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
