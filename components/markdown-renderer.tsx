import React from "react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Lightweight, safe, and reactive Markdown parser & renderer
 * Preserves paragraph whitespace, line breaks, blank lines, and rich formatting.
 */
export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  if (!content) return null;

  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let listItems: React.ReactNode[] = [];
  let isNumberedList = false;

  const flushList = () => {
    if (listItems.length > 0) {
      if (isNumberedList) {
        elements.push(
          <ol key={`ol-${elements.length}`} className="list-decimal pl-5 my-2 space-y-1 text-muted-foreground">
            {listItems}
          </ol>
        );
      } else {
        elements.push(
          <ul key={`ul-${elements.length}`} className="list-disc pl-5 my-2 space-y-1 text-muted-foreground">
            {listItems}
          </ul>
        );
      }
      listItems = [];
    }
  };

  const parseInline = (text: string): React.ReactNode => {
    // Process links [text](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(parseFormattedText(text.substring(lastIndex, match.index)));
      }
      const linkText = match[1];
      const linkUrl = match[2];
      parts.push(
        <a
          key={`link-${match.index}-${lastIndex}`}
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-violet-400 hover:text-violet-300 underline font-medium"
        >
          {linkText}
        </a>
      );
      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(parseFormattedText(text.substring(lastIndex)));
    }

    return parts.length === 1 ? parts[0] : <React.Fragment key={text}>{parts}</React.Fragment>;
  };

  const parseFormattedText = (text: string): React.ReactNode => {
    // Bold **text** or __text__
    // Italic *text* or _text_
    // Inline code `text`
    const regex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
    const parts = text.split(regex);

    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code key={i} className="px-1.5 py-0.5 rounded bg-white/10 text-violet-300 text-xs font-mono">
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return <em key={i} className="italic text-neutral-300">{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block toggle
    if (line.trim().startsWith("```")) {
      flushList();
      if (inCodeBlock) {
        elements.push(
          <pre key={`code-${i}`} className="p-4 rounded-xl bg-slate-950/80 border border-white/10 overflow-x-auto my-3 text-xs font-mono text-neutral-200">
            <code>{codeBlockContent.join("\n")}</code>
          </pre>
        );
        codeBlockContent = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    // Headings
    if (line.startsWith("### ")) {
      flushList();
      elements.push(
        <h3 key={`h3-${i}`} className="text-base font-bold text-foreground mt-4 mb-1">
          {parseInline(line.substring(4))}
        </h3>
      );
      continue;
    }
    if (line.startsWith("## ")) {
      flushList();
      elements.push(
        <h2 key={`h2-${i}`} className="text-lg font-bold text-foreground mt-5 mb-2">
          {parseInline(line.substring(3))}
        </h2>
      );
      continue;
    }
    if (line.startsWith("# ")) {
      flushList();
      elements.push(
        <h1 key={`h1-${i}`} className="text-xl font-extrabold text-foreground mt-6 mb-2">
          {parseInline(line.substring(2))}
        </h1>
      );
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      flushList();
      elements.push(
        <blockquote key={`quote-${i}`} className="border-l-2 border-violet-500 pl-4 py-1 italic text-muted-foreground my-2 bg-violet-500/5 rounded-r">
          {parseInline(line.substring(2))}
        </blockquote>
      );
      continue;
    }

    // Unordered List
    if (line.match(/^[-*]\s+/)) {
      isNumberedList = false;
      listItems.push(
        <li key={`li-${i}`}>{parseInline(line.replace(/^[-*]\s+/, ""))}</li>
      );
      continue;
    }

    // Numbered List
    if (line.match(/^\d+\.\s+/)) {
      isNumberedList = true;
      listItems.push(
        <li key={`li-num-${i}`}>{parseInline(line.replace(/^\d+\.\s+/, ""))}</li>
      );
      continue;
    }

    // Empty line / Blank line -> preserve visual vertical spacing
    if (line.trim() === "") {
      flushList();
      elements.push(
        <div key={`blank-${i}`} className="h-3.5" aria-hidden="true" />
      );
      continue;
    }

    // Standard paragraph with whitespace-pre-wrap so custom spacing & line breaks are preserved
    flushList();
    elements.push(
      <p key={`p-${i}`} className="text-sm sm:text-base text-muted-foreground leading-relaxed my-1 whitespace-pre-wrap break-words">
        {parseInline(line)}
      </p>
    );
  }

  flushList();

  return <div className={`space-y-1 leading-relaxed ${className}`}>{elements}</div>;
}
