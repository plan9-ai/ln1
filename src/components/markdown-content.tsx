import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownContentProps {
  content: string;
}

// Explicit utilities on top of `prose` to guarantee paragraphs, lists and
// code blocks render as visually separated blocks even if the typography
// plugin defaults shift between Tailwind releases.
const MARKDOWN_CLASSES = [
  "prose prose-sm dark:prose-invert max-w-none",
  "[&>p]:my-2",
  "[&>ul]:my-2 [&>ul]:list-disc [&>ul]:pl-5",
  "[&>ol]:my-2 [&>ol]:list-decimal [&>ol]:pl-5",
  "[&_li]:my-1",
  "[&_pre]:my-3 [&_pre]:rounded [&_pre]:bg-muted [&_pre]:p-3 [&_pre]:text-xs",
  "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs",
  "[&_pre_code]:bg-transparent [&_pre_code]:p-0",
  "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2",
  "[&_h1]:mt-4 [&_h2]:mt-4 [&_h3]:mt-3 [&_h4]:mt-3",
].join(" ");

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div className={MARKDOWN_CLASSES}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
