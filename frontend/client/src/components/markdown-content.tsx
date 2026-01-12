interface MarkdownContentProps {
  content: string;
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div 
      className="prose prose-slate dark:prose-invert max-w-none
        prose-headings:font-semibold prose-headings:tracking-tight
        prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-b prose-h2:pb-2
        prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
        prose-h4:text-lg prose-h4:mt-6 prose-h4:mb-2
        prose-p:leading-7 prose-p:text-muted-foreground
        prose-a:text-primary prose-a:no-underline hover:prose-a:underline
        prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
        prose-pre:bg-muted prose-pre:border prose-pre:rounded-lg prose-pre:p-4
        prose-pre:overflow-x-auto
        prose-ul:list-disc prose-ul:pl-6
        prose-ol:list-decimal prose-ol:pl-6
        prose-li:text-muted-foreground prose-li:my-1
        prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground
        prose-table:w-full prose-table:text-sm
        prose-th:bg-muted prose-th:p-3 prose-th:text-left prose-th:font-semibold
        prose-td:p-3 prose-td:border-b
        prose-img:rounded-lg prose-img:shadow-md
        prose-strong:font-semibold prose-strong:text-foreground
      "
      data-testid="markdown-content"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
